// 온실 (Greenhouse) — /admin/greenhouse
//
// 기능: 집중 타이머 (뽀모도로 or 커스텀)
//
// 데이터 흐름:
//   타이머 종료 → study_sessions 테이블에 기록 저장
//   → 정원(/garden)에서 세션 기록을 꽃으로 시각화
//
// 연결: 내 방(/admin) ← → 정원(/garden)

export default function GreenhousePage() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <h1>온실 (Greenhouse)</h1>
    </main>
  );
}
