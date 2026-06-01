"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * admin 페이지에서 공통 사용.
 * 세션 없으면 /admin/login으로 리다이렉트.
 * true를 반환할 때만 페이지 콘텐츠를 렌더링한다.
 */
export function useAdminAuth() {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
      } else {
        setReady(true);
      }
    });

    /* 세션 변경(로그아웃 등) 실시간 감지 */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, []);

  return ready;
}
