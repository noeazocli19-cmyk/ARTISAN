"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    async function redirectByRole() {
      try {
        const res = await fetch("/api/auth/get-session");
        const data = await res.json();
        if (!data?.user?.id) { router.push("/login"); return; }
        const role = data.user.role || "client";
        if (role === "artisan") { router.push("/dashboard/artisan"); }
        else { router.push("/dashboard/client"); }
      } catch { router.push("/login"); }
    }
    redirectByRole();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirection vers votre espace...</p>
      </div>
    </div>
  );
}
