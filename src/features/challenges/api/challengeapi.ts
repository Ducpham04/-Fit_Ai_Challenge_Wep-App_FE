import client from '../../../api/client';

export const ChallengeAPI = {
  getChallenges() {
    return client.get("/admin/challenges");
  },

  getChallengeById(id: number) {
    return client.get(`/admin/challenges/${id}`);
  },
};


