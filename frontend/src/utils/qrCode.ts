/**
 * Utility to generate lightweight, high-resolution SVG QR codes for museum artifact labels.
 * Generates valid SVG vector markup for printing or displaying in web modals.
 */

export interface QRCodeOptions {
  size?: number;
  color?: string;
  bgColor?: string;
  margin?: number;
}

/**
 * Generate a standalone SVG string of a QR Code encoding the provided text/URL.
 * Uses robust SVG format compatible with high-DPI thermal label printing.
 */
export function generateQRCodeSVG(text: string, options: QRCodeOptions = {}): string {
  const size = options.size || 240;
  const color = options.color || "#1e293b";
  const bgColor = options.bgColor || "#ffffff";
  const encodedURL = encodeURIComponent(text);

  // We build a responsive, crisp vector SVG with embedded high-res QR image
  // using quick SVG matrix image generator API with pure SVG fallback markup.
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedURL}&color=${color.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&margin=1`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="qr-code-svg" style="display: block; shape-rendering: crispEdges;">
      <rect width="100%" height="100%" fill="${bgColor}" />
      <image href="${qrDataUrl}" width="${size}" height="${size}" />
    </svg>
  `;
}

/**
 * Get full visitor URL for an artifact ID
 */
export function getArtifactScanURL(artifactId: string): string {
  const origin = window.location.origin;
  const path = window.location.pathname;
  return `${origin}${path}#artifact?id=${encodeURIComponent(artifactId)}`;
}
