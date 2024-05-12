"use client";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import { AuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { SocketContext } from "@/context/SocketContext";
import { useSocket } from "@/hooks/useSocket";
import { SystemFeedbackContext } from "@/context/SystemFeedbackContext";
import { useSystemFeedback } from "@/hooks/useSystemFeedback";
import { UserContext } from "@/context/UserContext";
import { useUser } from "@/hooks/useUser";
import "../globals.css";
import { Inter } from "next/font/google";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Toast from "@/components/Toast";

// https://day.js.org/docs/en/customization/relative-time
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1s",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy",
  },
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const router = useRouter();

  const authContextValues = useAuth();
  const { user, loading } = authContextValues;

  const userId = !loading && user && user._id;
  const socketContextValues = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL,
    userId
  );

  const feedbackCtxValues = useSystemFeedback();
  const { message } = feedbackCtxValues;

  const userCtxValues = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SystemFeedbackContext.Provider value={feedbackCtxValues}>
          <AuthContext.Provider value={authContextValues}>
            <UserContext.Provider value={userCtxValues}>
              <SocketContext.Provider value={socketContextValues}>
                <NavBar />
                {children}
                {message.message && <Toast {...message} />}
              </SocketContext.Provider>
            </UserContext.Provider>
          </AuthContext.Provider>
        </SystemFeedbackContext.Provider>
      </body>
    </html>
  );
}
