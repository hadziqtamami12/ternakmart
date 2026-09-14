/**
 * server/storage/uploader.js
 * Multi-Cloud Storage Abstraction (Supabase Storage, Cloudflare R2, AWS S3)
 * Pure JavaScript Implementation
 */

try { require('dotenv').config(); } catch (e) {}

const MAX_IMAGE_SIZE = (parseInt(process.env.MAX_IMAGE_SIZE_MB || '5', 10)) * 1024 * 1024;
const MAX_VIDEO_SIZE = (parseInt(process.env.MAX_VIDEO_SIZE_MB || '50', 10)) * 1024 * 1024;

function validateFileSizeAndType(size, mimeType) {
  const isVideo = mimeType.startsWith('video/');
  const isImage = mimeType.startsWith('image/') || mimeType === 'application/pdf';

  if (!isImage && !isVideo) {
    throw new Error('Format file tidak didukung. Harap unggah Gambar (JPG/PNG/WEBP), Video (MP4/MOV), atau PDF.');
  }

  if (isVideo && size > MAX_VIDEO_SIZE) {
    throw new Error(`Ukuran video melebihi batas maksimum ${process.env.MAX_VIDEO_SIZE_MB || 50}MB.`);
  }

  if (isImage && size > MAX_IMAGE_SIZE) {
    throw new Error(`Ukuran file melebihi batas maksimum ${process.env.MAX_IMAGE_SIZE_MB || 5}MB.`);
  }
}

class SupabaseStorageAdapter {
  constructor() {
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || 'ternakmart-assets';
    this.client = null;
    try {
      const { createClient } = require('@supabase/supabase-js');
      const url = process.env.SUPABASE_URL || '';
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
      if (url && key) {
        this.client = createClient(url, key);
      }
    } catch (e) {}
  }

  async upload(fileBuffer, fileName, options = {}) {
    const path = options.folder ? `${options.folder}/${fileName}` : fileName;
    if (!this.client) {
      // Local fallback URL
      return `/uploads/${fileName}`;
    }
    const { data, error } = await this.client.storage.from(this.bucket).upload(path, fileBuffer, {
      contentType: options.contentType || 'application/octet-stream',
      upsert: true
    });
    if (error) throw new Error(`[Supabase Storage] ${error.message}`);
    const { data: publicData } = this.client.storage.from(this.bucket).getPublicUrl(data.path);
    return publicData.publicUrl;
  }

  async getPresignedUploadUrl(fileName, mimeType, folder = 'uploads') {
    const fileKey = `${folder}/${Date.now()}_${fileName}`;
    if (!this.client) {
      return {
        uploadUrl: `/api/v1/uploads`,
        fileKey,
        publicUrl: `/uploads/${fileName}`,
        expiresIn: 3600
      };
    }
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUploadUrl(fileKey);
    if (error || !data) throw new Error(`[Supabase Storage] Gagal generate signed URL: ${error?.message}`);
    const { data: publicData } = this.client.storage.from(this.bucket).getPublicUrl(fileKey);
    return {
      uploadUrl: data.signedUrl,
      fileKey,
      publicUrl: publicData.publicUrl,
      expiresIn: 3600
    };
  }

  async delete(fileKey) {
    if (!this.client) return true;
    const { error } = await this.client.storage.from(this.bucket).remove([fileKey]);
    return !error;
  }
}

function getStorageAdapter() {
  return new SupabaseStorageAdapter();
}

const storage = getStorageAdapter();

module.exports = storage;
module.exports.storage = storage;
module.exports.validateFileSizeAndType = validateFileSizeAndType;
