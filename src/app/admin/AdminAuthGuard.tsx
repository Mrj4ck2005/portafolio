"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && !isLoginPage) {
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      if (session && isLoginPage) {
        router.replace("/admin/dashboard");
        router.refresh();
        return;
      }

      setChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) {
        router.replace("/admin/login");
        router.refresh();
      }

      if (session && isLoginPage) {
        router.replace("/admin/dashboard");
        router.refresh();
      }
    });

    const handlePageShow = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && !isLoginPage) {
        router.replace("/admin/login");
        router.refresh();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, isLoginPage, router]);

  if (checking && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Verificando sesión...
      </div>
    );
  }

  return <>{children}</>;
}
