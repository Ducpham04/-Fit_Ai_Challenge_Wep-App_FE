import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ChallengeAPI } from "../features/challenges/api/challengeapi";

interface Challenge {
  id: number;
  title: string;
  description: string;
  image: string;
  video: string ;
  difficulty: string;
  status: string;
}

interface ChallengeContextType {
  challenges: Challenge[];
  loading: boolean;
  error: string | null;
  loadChallengeDetail: (id: number) => Promise<any>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await ChallengeAPI.getChallenges();
        const mapped = res.data.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          image: c.goal?.imageLink || "",
          video: c.linkVideos || "",
          difficulty: c.difficult,
          status: c.status,
        }));
        setChallenges(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to fetch challenges");
      } finally {
        console.log("Challenges fetched:", challenges);
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const loadChallengeDetail = async (id: number) => {
    try {
      const res = await ChallengeAPI.getChallengeById(id);
      return res.data.data; // Trả đúng data
    } catch (err: any) {
      setError(err.message || "Failed to fetch challenge detail");
      return null;
    }
  };

  return (
    <ChallengeContext.Provider value={{ challenges, loading, error, loadChallengeDetail }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenges = () => {
  const context = useContext(ChallengeContext);
  if (!context) throw new Error("useChallenges must be used within a ChallengeProvider");
  return context;
};
