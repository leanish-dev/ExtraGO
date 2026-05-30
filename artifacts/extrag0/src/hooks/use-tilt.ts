import { useRef, useCallback } from "react";

export function useTilt(maxTilt = 7) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || window.innerWidth < 1024) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -maxTilt;
      const rotY = ((x - cx) / cx) * maxTilt;
      ref.current.style.transform = `perspective(700px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02,1.02,1.02)`;
      ref.current.style.transition = "transform 0.08s ease";
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform =
      "perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    ref.current.style.transition = "transform 0.35s cubic-bezier(0.19,1,0.22,1)";
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
