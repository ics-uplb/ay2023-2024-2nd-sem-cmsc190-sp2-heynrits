"use client";
import Link from "next/link";
import Script from "next/script";
import GoogleButton from "@/components/GoogleButton";

// export const metadata = {
//   title: "Log in to OrgTracks",
// };

export default function Login() {
  return (
    <main className="h-screen flex items-center justify-center bg-primary">
      <div className="card bg-base-100 p-8 md:shadow-lg border-2 border-violet-100 w-full max-w-lg prose text-center rounded-xl">
        <h1 className="mt-16 mb-0 text-primary">OrgTracks</h1>
        <p className="mt-0 mb-16">Log in to your account</p>

        <GoogleButton context="signin" />

        <p className="py-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent">Register here</Link>.
        </p>
      </div>
    </main>
  );
}
