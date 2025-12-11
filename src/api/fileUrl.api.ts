import client from "./client";

/**
 * API để lấy Pre-Signed URLs từ backend
 * Backend sẽ generate presigned URL từ S3 private bucket
 */

export interface PresignedUrlResponse {
  url: string;
  key: string;
  type?: string;
}

export const FileUrlAPI = {
  /**
   * GET /api/files/presigned-url?key=uploads/videos/filename.mp4&type=video
   * Lấy Pre-Signed URL cho file
   * 
   * @param key S3 key (ví dụ: "uploads/videos/filename.mp4")
   * @param type Loại file: "video" (30 phút) hoặc "image" (5 phút), mặc định 10 phút
   * @returns Pre-Signed URL
   */
  getPresignedUrl(key: string, type: "video" | "image" | "default" = "default"): Promise<string> {
    return client
      .get<PresignedUrlResponse>("/files/presigned-url", {
        params: { key, type },
      })
      .then((res) => res.data.url);
  },

  /**
   * GET /api/files/video?key=uploads/videos/filename.mp4
   * Lấy Pre-Signed URL cho video (30 phút)
   */
  getVideoUrl(key: string): Promise<string> {
    return client
      .get<PresignedUrlResponse>("/files/video", {
        params: { key },
      })
      .then((res) => res.data.url);
  },

  /**
   * GET /api/files/image?key=uploads/images/filename.jpg
   * Lấy Pre-Signed URL cho image (5 phút)
   */
  getImageUrl(key: string): Promise<string> {
    return client
      .get<PresignedUrlResponse>("/files/image", {
        params: { key },
      })
      .then((res) => res.data.url);
  },
};

