"use client";
import Link from "next/link";
import Script from "next/script";
import GoogleButton from "@/components/GoogleButton";

// export const metadata = {
//   title: "Register to OrgTracks",
// };

export default function Register() {
  return (
    <main className="h-screen flex items-center justify-center bg-primary">
      <div className="card bg-base-100 p-8 md:shadow-lg border-2 border-violet-100 w-full max-w-lg prose text-center rounded-xl">
        <h1 className="mt-16 mb-0 text-primary">OrgTracks</h1>
        <p className="mt-0 mb-16">Register for an account</p>

        <GoogleButton context="signup" />

        <p className="py-8">
          Already have an account? <Link href="/login" className="text-accent">Log in</Link>.
        </p>
      </div>
    </main>
  );
}
