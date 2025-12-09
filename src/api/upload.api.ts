import client from "./client";

export const UploadAPI = {
  /**
   * POST /api/files/upload-image
   * Uploads an image file and returns its URL.
   */
  uploadImage(file: File): Promise<{ filePath: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return client.post("/files/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(res => {
      // Handle different backend response structures
      if (res.data?.filePath) {
        return { filePath: res.data.filePath };
      } else if (res.data?.data?.filePath) {
        return { filePath: res.data.data.filePath };
      } else if (typeof res.data === 'string') {
        return { filePath: res.data }; // Assuming the backend directly returns the file path string
      } else if (res.data?.message) {
        // Sometimes backend returns { success: true, message: "filePath" }
        return { filePath: res.data.message };
      } else {
        throw new Error("Invalid upload response format");
      }
    });
  },
};

