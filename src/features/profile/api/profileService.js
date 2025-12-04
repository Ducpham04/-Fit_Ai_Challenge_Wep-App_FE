// src/api/profileService.js
import axios from "axios";

import client from "@/api/client";


export async function getUserFullProfile(userId) {
  try {                 
    const response = await client.get(`/v1/users/${userId}/profile/full`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("API error → fallback to mock", error);
    return null;
  }
}
