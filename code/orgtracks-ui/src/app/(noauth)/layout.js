"use client";
import { AuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import "../globals.css";
import { Inter } from "next/font/google";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onRegister, onLogin } from "@/utils/api/gis-callbacks";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const router = useRouter();
  const authContextValues = useAuth();
  const { user, loading, setUser } = authContextValues;

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [loading, user])

  useEffect(() => {
    window.onRegister = onRegister;
    window.onLogin = onLogin;

    return () => {
      window.onRegister = null;
      window.onLogin = null;
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext.Provider value={authContextValues}>
          {children}
        </AuthContext.Provider>
      </body>
    </html>
  );
}
