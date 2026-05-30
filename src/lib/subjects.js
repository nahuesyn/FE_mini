// 공통 과목 목록 — 온실, 기록, 도서관, 정원에서 공유
// 과목 추가/수정 시 이 파일만 변경하면 전체 반영

export const SUBJECTS = [
  { id: "math",    name: "수학", color: "#4ade80", bg: "rgba(74,222,128,0.15)",  border: "rgba(74,222,128,0.4)",  bookPalette: ["#4ade80","#22c55e","#86efac","#16a34a","#bbf7d0"] },
  { id: "coding",  name: "코딩", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)",  bookPalette: ["#f59e0b","#d97706","#fcd34d","#b45309","#fde68a"] },
  { id: "english", name: "영어", color: "#60a5fa", bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.4)",  bookPalette: ["#60a5fa","#3b82f6","#93c5fd","#2563eb","#bfdbfe"] },
  { id: "science", name: "과학", color: "#f472b6", bg: "rgba(244,114,182,0.15)",border: "rgba(244,114,182,0.4)", bookPalette: ["#f472b6","#ec4899","#f9a8d4","#db2777"] },
  { id: "history", name: "역사", color: "#a78bfa", bg: "rgba(167,139,250,0.15)",border: "rgba(167,139,250,0.4)", bookPalette: ["#a78bfa","#8b5cf6","#c4b5fd","#7c3aed"] },
  { id: "etc",     name: "기타", color: "#94a3b8", bg: "rgba(148,163,184,0.15)",border: "rgba(148,163,184,0.4)", bookPalette: ["#94a3b8","#64748b","#cbd5e1"] },
];

// name으로 빠르게 찾기
export const subjectByName = (name) =>
  SUBJECTS.find((s) => s.name === name) ?? SUBJECTS[SUBJECTS.length - 1];

// id로 빠르게 찾기
export const subjectById = (id) =>
  SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[SUBJECTS.length - 1];
