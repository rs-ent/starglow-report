import React, { useRef, useState, useEffect } from 'react';

// 요소가 viewport에 들어왔는지 감지하는 커스텀 훅
const useOnScreen = (ref, rootMargin = "0px") => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, rootMargin]);

  return isIntersecting;
};

// AnimatedBlock 컴포넌트: 요소가 화면에 나타날 때 fade in & slide up 애니메이션 효과 적용
const AnimatedBlock = ({ children }) => {
  const ref = useRef(null);
  // rootMargin을 "-50px" 정도로 설정하면 약간 일찍 애니메이션이 시작됩니다.
  const isVisible = useOnScreen(ref, "-50px");

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 blur-sm translate-y-5"
      }`}
    >
      {children}
    </div>
  );
};

export { AnimatedBlock };