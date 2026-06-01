"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router  = useRouter();
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  /* 이미 로그인된 상태면 /admin으로 */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/admin");
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password: pw,
    });
    setLoading(false);
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않아요.");
    } else {
      router.push("/admin");
    }
  };

  const INPUT = {
    background:   "rgba(255,255,255,0.05)",
    border:       "1px solid rgba(96,165,250,0.2)",
    borderRadius: 8,
    padding:      "10px 14px",
    color:        "#e2e8f0",
    fontSize:     13,
    outline:      "none",
    width:        "100%",
  };

  return (
    <main style={{
      minHeight:      "100vh",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      background:     "radial-gradient(ellipse at 60% 40%, #0A1520 0%, #060E18 100%)",
    }}>
      <form onSubmit={handleLogin} style={{
        display:        "flex",
        flexDirection:  "column",
        gap:            14,
        background:     "rgba(8,16,40,0.75)",
        backdropFilter: "blur(16px)",
        border:         "1px solid rgba(96,165,250,0.2)",
        borderRadius:   18,
        padding:        "36px 40px",
        minWidth:       300,
        boxShadow:      "0 8px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 28, marginBottom: 6 }}>🏠</p>
          <h1 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700 }}>내 방</h1>
          <p style={{ color: "rgba(96,165,250,0.45)", fontSize: 11, marginTop: 4 }}>비공개 공간입니다</p>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
          autoComplete="email"
          style={INPUT}
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          required
          autoComplete="current-password"
          style={INPUT}
        />

        {error && (
          <p style={{ color: "#f87171", fontSize: 12, textAlign: "center", margin: 0 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={{
          background:   "rgba(96,165,250,0.18)",
          border:       "1px solid rgba(96,165,250,0.35)",
          borderRadius: 8,
          padding:      "10px",
          color:        "#60a5fa",
          fontWeight:   600,
          fontSize:     13,
          cursor:       loading ? "not-allowed" : "pointer",
          opacity:      loading ? 0.6 : 1,
          transition:   "opacity 0.15s",
          marginTop:    4,
        }}>
          {loading ? "확인 중..." : "입장"}
        </button>
      </form>
    </main>
  );
}
