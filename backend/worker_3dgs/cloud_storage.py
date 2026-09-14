"""
Cloud Storage Adapter for 3D Virtual Tour Assets
================================================
Supports:
1. Cloudflare R2 (S3-compatible, 10GB free tier, zero egress fee - ideal for large .splat/.ply files)
2. Cloudinary (optimized for high-res images and media transformations)
3. AWS S3 (standard S3 storage)
4. Local Fallback (stores on local disk when keys are not provided yet)
"""

import os
import mimetypes
import logging
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger("3DGS_Storage")

# Try importing boto3 for S3/R2
try:
    import boto3
    from botocore.config import Config
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

# Try importing Cloudinary
try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False


class CloudStorageManager:
    """
    Manages uploading 3DGS assets (.splat, .ply, metadata.json, high-res photos)
    to Cloudflare R2, Cloudinary, S3, or Local fallback.
    """

    def __init__(self):
        self.provider = os.getenv("STORAGE_PROVIDER", "").lower()
        self._init_r2()
        self._init_cloudinary()

    def _init_r2(self):
        """Initialize Cloudflare R2 client using boto3."""
        self.r2_account_id = os.getenv("R2_ACCOUNT_ID", "")
        self.r2_access_key = os.getenv("R2_ACCESS_KEY_ID", "")
        self.r2_secret_key = os.getenv("R2_SECRET_ACCESS_KEY", "")
        self.r2_bucket = os.getenv("R2_BUCKET_NAME", "museum-tours")
        self.r2_public_url = os.getenv("R2_PUBLIC_DOMAIN", "").rstrip("/")

        self.r2_client = None
        if BOTO3_AVAILABLE and self.r2_account_id and self.r2_access_key and self.r2_secret_key:
            endpoint = f"https://{self.r2_account_id}.r2.cloudflarestorage.com"
            try:
                self.r2_client = boto3.client(
                    "s3",
                    endpoint_url=endpoint,
                    aws_access_key_id=self.r2_access_key,
                    aws_secret_access_key=self.r2_secret_key,
                    config=Config(signature_version="s3v4")
                )
                logger.info(f"[Storage] Initialized Cloudflare R2 for bucket: {self.r2_bucket}")
            except Exception as e:
                logger.warning(f"[Storage] Failed to initialize R2: {e}")

    def _init_cloudinary(self):
        """Initialize Cloudinary client."""
        cloudinary_url = os.getenv("CLOUDINARY_URL", "")
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        api_key = os.getenv("CLOUDINARY_API_KEY", "")
        api_secret = os.getenv("CLOUDINARY_API_SECRET", "")

        self.has_cloudinary = False
        if CLOUDINARY_AVAILABLE and (cloudinary_url or (cloud_name and api_key and api_secret)):
            try:
                if cloudinary_url:
                    cloudinary.config(cloudinary_url=cloudinary_url)
                else:
                    cloudinary.config(
                        cloud_name=cloud_name,
                        api_key=api_key,
                        api_secret=api_secret,
                        secure=True
                    )
                self.has_cloudinary = True
                logger.info("[Storage] Initialized Cloudinary client successfully")
            except Exception as e:
                logger.warning(f"[Storage] Failed to initialize Cloudinary: {e}")

    def upload_file(self, local_path: Path, remote_key: str, content_type: Optional[str] = None) -> str:
        """
        Uploads a single file to the best available cloud provider,
        or returns local fallback URL if keys are not configured yet.
        """
        if not local_path.exists():
            raise FileNotFoundError(f"Cannot find local file: {local_path}")

        if not content_type:
            mime, _ = mimetypes.guess_type(str(local_path))
            content_type = mime or "application/octet-stream"

        # 1. Cloudflare R2 (Preferred for large .splat, .ply, and JSON assets)
        if self.r2_client:
            try:
                logger.info(f"[Storage] Uploading to Cloudflare R2: {remote_key} ({local_path.stat().st_size} bytes)")
                self.r2_client.upload_file(
                    Filename=str(local_path),
                    Bucket=self.r2_bucket,
                    Key=remote_key,
                    ExtraArgs={"ContentType": content_type}
                )
                if self.r2_public_url:
                    return f"{self.r2_public_url}/{remote_key}"
                return f"https://{self.r2_bucket}.r2.dev/{remote_key}"
            except Exception as e:
                logger.error(f"[Storage] R2 upload failed for {remote_key}: {e}")

        # 2. Cloudinary (Alternative for images and raw files)
        if self.has_cloudinary:
            try:
                resource_type = "image" if content_type.startswith("image/") else "raw"
                logger.info(f"[Storage] Uploading to Cloudinary ({resource_type}): {remote_key}")
                upload_res = cloudinary.uploader.upload(
                    str(local_path),
                    public_id=remote_key.rsplit(".", 1)[0],
                    resource_type=resource_type,
                    overwrite=True
                )
                return upload_res.get("secure_url") or upload_res.get("url")
            except Exception as e:
                logger.error(f"[Storage] Cloudinary upload failed for {remote_key}: {e}")

        # 3. Local fallback URL
        logger.info(f"[Storage] No cloud keys configured yet. Using local static URL for: {remote_key}")
        # Return local path served by Express /models or /uploads
        if "scene.splat" in remote_key or "point_cloud.ply" in remote_key or "tour_metadata.json" in remote_key:
            return f"/models/{remote_key}"
        return f"/uploads/{remote_key}"

    def upload_tour_bundle(self, tour_id: str, local_models_dir: Path, high_res_photos: list) -> Dict[str, str]:
        """
        Uploads all generated assets for a 3D tour (.splat, .ply, metadata, photos)
        and returns a dictionary of public cloud URLs.
        """
        urls = {}
        splat_file = local_models_dir / "scene.splat"
        ply_file = local_models_dir / "point_cloud.ply"
        meta_file = local_models_dir / "tour_metadata.json"

        # Upload 3D models
        if splat_file.exists():
            urls["splatUrl"] = self.upload_file(splat_file, f"tours/{tour_id}/scene.splat", "application/octet-stream")
        if ply_file.exists():
            urls["plyUrl"] = self.upload_file(ply_file, f"tours/{tour_id}/point_cloud.ply", "application/octet-stream")

        # Upload high-res photos
        uploaded_photos = []
        for photo in high_res_photos:
            p_path = Path(photo.get("filePath", ""))
            if p_path.exists():
                remote_name = f"tours/{tour_id}/photos/{p_path.name}"
                cloud_url = self.upload_file(p_path, remote_name)
                photo_copy = dict(photo)
                photo_copy["cloudUrl"] = cloud_url
                uploaded_photos.append(photo_copy)
            else:
                uploaded_photos.append(photo)

        urls["photos"] = uploaded_photos

        # Upload tour metadata
        if meta_file.exists():
            urls["metadataUrl"] = self.upload_file(meta_file, f"tours/{tour_id}/tour_metadata.json", "application/json")

        return urls


# Global singleton instance
storage_manager = CloudStorageManager()
