"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
export default function ManageOrgPage() {
  const router = useRouter();
  const pathname = usePathname();
  const defaultRedirect = "/general";

  useEffect(() => {
    router.replace(pathname + defaultRedirect);
  }, []);

  return <span className="loading loading-spinner loading-md"></span>;
}
