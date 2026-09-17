import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function main() {
  try {
    const res = await cloudinary.api.ping();
    console.log('CLOUDINARY_SUCCESS:', JSON.stringify(res));
  } catch (err: any) {
    console.error('CLOUDINARY_ERROR:', err.message);
  }
}

main();
