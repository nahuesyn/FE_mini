
import { memo } from "react";

/**
 * 페이지 배경 컴포넌트
 * React.memo로 감싸 부모 state 변경 시 리렌더링/repaint 차단
 * will-change: transform으로 GPU 레이어 분리
 */
const PageBackground = memo(function PageBackground({ src, overlay }) {
  return (
    <>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage:    `url('${src}')`,
          backgroundSize:     "cover",
          backgroundPosition: "center",
          willChange:         "transform",
        }}
      />
      <div
        className="fixed inset-0 -z-10"
        style={{ background: overlay, willChange: "transform" }}
      />
    </>
  );
});

export default PageBackground;
