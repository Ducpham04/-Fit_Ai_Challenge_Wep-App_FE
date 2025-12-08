import client from "./client";

/**
 * NOTE: Community endpoints are not implemented in BE yet.
 * This file is kept for future implementation.
 */
export const CommunityAPI = {
  /**
   * Get community posts/feed
   * TODO: Implement in BE
   */
  getPosts(params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    // TODO: Implement when BE endpoint is available
    return Promise.reject(new Error("Community API not implemented in BE yet"));
  },

  /**
   * Create a community post
   * TODO: Implement in BE
   */
  createPost(data: any): Promise<any> {
    // TODO: Implement when BE endpoint is available
    return Promise.reject(new Error("Community API not implemented in BE yet"));
  }
};





