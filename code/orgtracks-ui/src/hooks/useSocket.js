import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (url, userId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (userId) {
      const s = io(url, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      s.on("connect", () => {
        console.log("socket connected");
        setSocket(s);
      });

      s.on("disconnect", () => {
        console.log("socket disconnected");
        setSocket(null);
      });

      s.on("connect_error", (err) => {
        console.log("socket connect error", err);
      });
    }
  }, [userId]);

  return {
    socket,
  };
};
