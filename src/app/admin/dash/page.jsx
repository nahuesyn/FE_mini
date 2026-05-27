// 대시보드 (Dash) — /admin/dash
//
// 기능:
//   - 캘린더: 일정 관리
//   - 투두: 할 일 목록 (todos 테이블)
//   - 프로젝트 기록: 작업 중인 프로젝트 관리 (projects 테이블)
//
// 데이터 흐름:
//   프로젝트 등록/수정 → projects 테이블
//   → 미술관(/museum)에서 프로젝트 전시
//
// 연결: 내 방(/admin) ← → 미술관(/museum)

export default function DashPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <h1>대시보드 (Dash)</h1>
    </main>
  );
}
