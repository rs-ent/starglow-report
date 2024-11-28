'use client';

import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 1초 후 Toast 사라지기
    }, 5000);

    return () => clearTimeout(timer); // 컴포넌트가 사라질 때 타이머 정리
  }, [onClose]);

  return (
    <div className="toast">
      {message}
    </div>
  );
};

export default Toast;