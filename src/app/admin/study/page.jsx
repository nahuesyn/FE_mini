// 기록 (Study/Record) — /admin/study
//
// 기능:
//   1. 공부 세션 기록: 날짜별 공부 시간, 태그, 메모 (study_sessions 테이블)
//      → 정원(/garden)에서 활동 기록 시각화
//   2. 공부 게시글: 게시글 형태로 공부 내용 작성 (posts 테이블)
//      → 도서관(/library)에서 게시글 열람
//
// 연결: 내 방(/admin) ← → 정원(/garden), 도서관(/library)

export default function StudyPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <h1>기록 (Study)</h1>
    </main>
  );
}
