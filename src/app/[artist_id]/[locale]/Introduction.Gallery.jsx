"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

const IntroductionGallery = ({ galleryImages = [] }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 기본 사이즈 설정
    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    // Scene, Camera, Renderer 생성
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // 이미지 평면들을 저장할 배열
    const imageMeshes = [];
    const loader = new THREE.TextureLoader();

    // 평면 크기 및 간격
    const planeWidth = 3;
    const planeHeight = 2;
    const gap = 1.0;
    const totalWidth = galleryImages.length * (planeWidth + gap) - gap;

    // 각 이미지 로드 및 평면 생성
    galleryImages.forEach((image, index) => {
      loader.load(
        image.url,
        (texture) => {
          const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
          });
          const mesh = new THREE.Mesh(geometry, material);
          // 중앙 정렬: 각 평면을 X축 기준으로 배치
          mesh.position.x =
            index * (planeWidth + gap) - totalWidth / 2 + planeWidth / 2;
          scene.add(mesh);
          imageMeshes.push(mesh);

          // gsap를 이용해 각 평면의 opacity 애니메이션 적용
          gsap.to(material, {
            opacity: 1,
            duration: 1.5,
            delay: index * 0.2,
            ease: "power2.out",
          });
        },
        undefined,
        (error) => {
          console.error("Texture load error:", error);
        }
      );
    });

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 예시: gsap를 이용한 카메라 애니메이션 (딜레이 후 Z축 이동)
    gsap.to(camera.position, {
      z: 4,
      duration: 2,
      ease: "power2.inOut",
      delay: 1,
    });

    // 리사이즈 핸들러
    const handleResize = () => {
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // 클린업
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [galleryImages]);

  return <div ref={containerRef} style={{ width: "100%", height: "400px" }} />;
};

export default IntroductionGallery;
