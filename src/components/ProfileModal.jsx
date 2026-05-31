"use client";

import { FaHtml5, FaCss3Alt, FaReact, FaJava, FaGitAlt } from "react-icons/fa";
import { SiJavascript, SiSupabase, SiTistory } from "react-icons/si";

const TECH_ICONS = [
  { name: "HTML",       icon: FaHtml5,       color: "#e34f26" },
  { name: "CSS",        icon: FaCss3Alt,      color: "#1572b6" },
  { name: "JavaScript", icon: SiJavascript,   color: "#f7df1e" },
  { name: "React",      icon: FaReact,        color: "#61dafb" },
  { name: "Java",       icon: FaJava,         color: "#f89820" },
  { name: "Supabase",   icon: SiSupabase,     color: "#3ecf8e" },
  { name: "Git",        icon: FaGitAlt,       color: "#f05032" },
];

/**
 * 프로필 모달 — 광장 특정 영역 클릭 시 표시
 * 광장 배경과 어울리는 따뜻한 골드/앰버 톤
 */
export default function ProfileModal({ onClose }) {
  return (
    /* 배경 오버레이 */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,6,2,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* 모달 카드 */}
      <div
        className="relative flex flex-col gap-5 w-full max-w-sm mx-4 rounded-2xl p-7"
        style={{
          background:     "rgba(28,18,8,0.92)",
          border:         "1px solid rgba(201,168,76,0.35)",
          backdropFilter: "blur(20px)",
          boxShadow:      "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1) inset",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition hover:opacity-80"
          style={{ background: "rgba(201,168,76,0.1)", color: "rgba(245,230,200,0.5)", fontSize: 16, border: "1px solid rgba(201,168,76,0.2)" }}
        >
          ×
        </button>

        {/* 아바타 + 이름 */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl shrink-0 overflow-hidden"
            style={{ border: "1px solid rgba(201,168,76,0.3)" }}
          >
            <img
              src="/images/babogaeguri.png"
              alt="프로필"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#F5E6C8" }}>
              안혜선
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(201,168,76,0.6)" }}>Frontend Developer</p>
            <p className="text-xs mt-1" style={{ color: "rgba(245,230,200,0.4)" }}>수원대학교 정보보호학과 재학 중</p>
          </div>
        </div>

        {/* 한 줄 소개 */}
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,230,200,0.7)", borderLeft: "2px solid rgba(201,168,76,0.5)", paddingLeft: 12 }}>
          멋쟁이사자처럼 프론트엔드 트랙 수료 중입니다.<br />사용자 경험을 중시합니다.
        </p>

        {/* 기술 스택 */}
        <div>
          <p className="text-xs mb-3" style={{ color: "rgba(201,168,76,0.45)" }}>Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {TECH_ICONS.map(({ name, icon: Icon, color }) => (
              <div
                key={name}
                className="flex flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border:     "1px solid rgba(201,168,76,0.15)",
                }}
              >
                <Icon size={14} color={color} />
                <span style={{ color: "rgba(245,230,200,0.6)", fontSize: 11 }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }} />

        {/* 링크 버튼 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: "mailto:anhs_0218@naver.com",          label: "이메일",  icon: <span>✉</span> },
            { href: "https://github.com/nahuesyn",         label: "GitHub",  icon: <FaGitAlt size={13} /> },
            { href: "https://eong11.tistory.com/?page=1",  label: "Tistory", icon: <SiTistory size={13} /> },
          ].map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition hover:opacity-80"
              style={{
                background: "rgba(201,168,76,0.1)",
                color:      "#C9A84C",
                border:     "1px solid rgba(201,168,76,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {icon}
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
