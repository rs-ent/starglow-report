'use client';

import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-black z-50">
      <Image 
        src="/sgt_logo.png" 
        alt="Loading Logo" 
        width={256} 
        height={256} 
      />
    </div>
  );
}