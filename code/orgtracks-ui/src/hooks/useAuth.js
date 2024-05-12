import { useState, useEffect } from "react";
import axios from "@/utils/axios";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const logOut = () => {
      setLoading(true)
      localStorage.removeItem("token");
      setUser(null);
    }
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
          setLoading(false);
          return;
      }
  
      axios
        .get("/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(({ data }) => {
          setUser(data);
        })
        .catch(res => {
          if (res.response.status === 401) {
            localStorage.removeItem("token");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, []);
  
    return { user, setUser, loading, logOut };
  };
  