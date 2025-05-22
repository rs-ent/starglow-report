"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const IntroductionGallery = ({ galleryImages = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(galleryImages.length, 5),
    slidesToScroll: 1,
    draggable: true,
    swipe: true,
    swipeToSlide: true,
    pauseOnHover: true,
    autoplay: true,
    autoplaySpeed: 2500,
  };

  const handleMouseDown = (e) => {
    setIsDragging(false);
    dragStartX.current = e.clientX;
  };

  const handleTouchStart = (e) => {
    setIsDragging(false);
    dragStartX.current = e.touches[0].clientX;
  };

  const handleMouseMove = (e) => {
    if (Math.abs(e.clientX - dragStartX.current) > 5) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (Math.abs(e.touches[0].clientX - dragStartX.current) > 5) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = (e, index) => {
    if (!isDragging) {
      setSelectedImage(index);
    }
    setIsDragging(false);
  };

  const handleTouchEnd = (e, index) => {
    if (!isDragging) {
      setSelectedImage(index);
    }
    setIsDragging(false);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative w-full h-[300px]">
      <Slider {...settings}>
        {galleryImages.map((image, index) => (
          <motion.div
            key={image.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.5,
              delay: index * 0.2,
              ease: "easeOut",
            }}
            className="px-[1px]"
          >
            <div className="relative w-full h-[300px]">
              <Image
                src={image.url}
                alt={`Gallery image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover cursor-pointer select-none"
                style={{
                  WebkitUserSelect: "none",
                  WebkitUserDrag: "none",
                  WebkitTapHighlightColor: "transparent",
                  outline: "none",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseUp={(e) => handleMouseUp(e, index)}
                onTouchEnd={(e) => handleTouchEnd(e, index)}
                onMouseLeave={() => setIsDragging(false)}
              />
            </div>
          </motion.div>
        ))}
      </Slider>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 z-[99] flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-1 right-1 text-white text-2xl hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            {/* 이전 이미지 버튼 */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10"
              onClick={handlePrevImage}
            >
              ‹
            </button>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-[80%] max-h-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[selectedImage].url}
                alt={`Gallery image ${selectedImage + 1}`}
                className="max-h-[90vh] w-auto object-contain"
                style={{
                  display: "block", // 추가
                  maxWidth: "100%", // 추가
                }}
              />
            </motion.div>

            {/* 다음 이미지 버튼 */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10"
              onClick={handleNextImage}
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroductionGallery;
