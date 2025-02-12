"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** 주어진 범위 내 무작위 수 반환 */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/** 큰 빛에 사용할 랜덤 색상 팔레트 생성 (보라/블루 계열) */
function getRandomBigLightColors() {
  const hue1 = randomRange(260, 300);
  const sat1 = randomRange(65, 140);
  const light1 = randomRange(5, 15);
  const hue2 = randomRange(260, 300);
  const sat2 = randomRange(65, 140);
  const light2 = randomRange(2, 5);
  const color1 = `hsla(${hue1}, ${sat1}%, ${light1}%, 1)`;
  const color2 = `hsla(${hue2}, ${sat2}%, ${light2}%, 0.1)`;
  return { color1, color2 };
}

export default function Background() {
  const containerRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // ---------------------------------------------------
    // Scene, Camera, Renderer 설정
    // ---------------------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x120012, 0.0008);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // ---------------------------------------------------
    // easing 함수
    // ---------------------------------------------------
    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    function linear(t) {
      return t;
    }

    // ---------------------------------------------------
    // 텍스처 생성 함수
    // ---------------------------------------------------
    // 작은 입자용 텍스처 (중심은 흰색, 외곽은 투명)
    function createParticleTexture() {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      return new THREE.CanvasTexture(canvas);
    }

    // 동적 큰 빛 텍스처 생성 (매 프레임 업데이트)
    function createDynamicBigLightTexture() {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return { canvas, ctx, texture, size, params: {} };
    }

    // 동적 텍스처 업데이트 (각 큰 빛마다 고유 파라미터 적용)
    function updateDynamicBigLightTexture(dynamicTexture, time) {
      const { canvas, ctx, size, params } = dynamicTexture;
      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size / 2;
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      ctx.filter = "blur(48px)";
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      const steps = 100;
      const freq = params.freq || 3;
      const amp = params.amp ? baseRadius * params.amp : baseRadius * 0.1;
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const variation = Math.sin(angle * freq + time) * amp;
        const r = baseRadius + variation;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      const colors = params.colors || {
        color1: "rgba(35,7,60,1)",
        color2: "rgba(30,0,50,0.2)",
      };
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius);
      gradient.addColorStop(0, colors.color1);
      gradient.addColorStop(0.8, colors.color2);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      dynamicTexture.texture.needsUpdate = true;
    }

    // ---------------------------------------------------
    // 애니메이션 오브젝트 설정
    // ---------------------------------------------------
    const lightCount = 5; // 큰 빛의 개수
    const particleCount = 200; // 작은 입자의 개수
    const animatedObjects = [];

    function createAnimatedObject(type) {
      let material;
      let baseSize;
      let dynamicTexture = null;
      const obj = {};

      if (type === "light") {
        dynamicTexture = createDynamicBigLightTexture();
        dynamicTexture.params = {
          freq: randomRange(1, 6),
          amp: randomRange(0.01, 0.1),
          colors: getRandomBigLightColors(),
        };
        material = new THREE.SpriteMaterial({
          map: dynamicTexture.texture,
          transparent: true,
          opacity: randomRange(0.2, 0.4),
          depthTest: false,
        });
        baseSize = 400;
        obj.rotationSpeed = randomRange(-0.001, 0.001);
      } else if (type === "particle") {
        material = new THREE.SpriteMaterial({
          map: createParticleTexture(),
          transparent: true,
          opacity: 0.6,
          depthTest: false,
        });
        baseSize = 15;
        obj.jitter = {
          freq: randomRange(1, 3),
          amp: randomRange(1, 5),
          phaseX: randomRange(0, Math.PI * 2),
          phaseY: randomRange(0, Math.PI * 2),
        };
      }
      const sprite = new THREE.Sprite(material);
      scene.add(sprite);

      // 초기 startState 및 목표 targetState
      let startState, targetState, easeFunc;
      if (type === "light") {
        startState = {
          x: randomRange(-width / 2, width / 2),
          y: randomRange(-height / 2, height / 2),
          z: randomRange(-100, 100),
          scale: randomRange(0.7, 1.4),
          opacity: randomRange(0.6, 1.0),
        };
        targetState = getContinuousTarget(startState, type);
        easeFunc = easeInOut;
      } else {
        startState = {
          x: randomRange(-width / 2, width / 2),
          y: randomRange(-height / 2, height / 2),
          z: randomRange(-100, 100),
          scale: randomRange(0.1, 0.2),
          opacity: 0.7,
        };
        targetState = getContinuousTarget(startState, type);
        easeFunc = linear;
      }

      obj.sprite = sprite;
      obj.type = type;
      obj.baseSize = baseSize;
      obj.startState = startState;
      obj.targetState = targetState;
      // 시작 시간을 THREE.Clock과 유사하게 사용 (초 단위)
      obj.startTime = performance.now() / 1000;
      obj.ease = easeFunc;
      if (dynamicTexture) {
        obj.dynamicTexture = dynamicTexture;
      }
      return obj;
    }

    // 목표 상태를 이전 상태에서 충분한 범위의 델타를 주어 연속적인 이동 구현
    function getContinuousTarget(prev, type) {
      if (type === "light") {
        return {
          x: prev.x + randomRange(-200, 200),
          y: prev.y + randomRange(-200, 200),
          z: prev.z + randomRange(-50, 50),
          scale: randomRange(0.35, 2),
          opacity: randomRange(0.3, 1.0),
          duration: randomRange(20, 40),
        };
      } else {
        return {
          x: prev.x + randomRange(-200, 200),
          y: prev.y + randomRange(-200, 200),
          z: prev.z + randomRange(-50, 50),
          scale: randomRange(0.1, 0.2),
          opacity: randomRange(0.1, 1.0),
          duration: randomRange(30, 60),
        };
      }
    }

    // 큰 빛과 입자 생성
    for (let i = 0; i < lightCount; i++) {
      animatedObjects.push(createAnimatedObject("light"));
    }
    for (let i = 0; i < particleCount; i++) {
      animatedObjects.push(createAnimatedObject("particle"));
    }

    // ---------------------------------------------------
    // 별 필드 (우주 느낌 강화)
    // ---------------------------------------------------
    const starCount = 1000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = randomRange(-width, width);
      starPositions[i * 3 + 1] = randomRange(-height, height);
      starPositions[i * 3 + 2] = randomRange(-1000, 0);
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: randomRange(0.55, 1.65),
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // ---------------------------------------------------
    // 마우스 이동에 따른 카메라 Parallax 효과
    // ---------------------------------------------------
    function onMouseMove(event) {
      const mouseX = (event.clientX / width) * 2 - 1;
      const mouseY = (event.clientY / height) * 2 - 1;
      camera.position.x = mouseX * 35;
      camera.position.y = -mouseY * 35;
      camera.lookAt(0, 0, 0);
    }
    document.addEventListener("mousemove", onMouseMove);

    // ---------------------------------------------------
    // 스크롤 이벤트 처리
    // ---------------------------------------------------
    let targetScrollOffset = 0;
    let currentScrollOffset = 0;
    function onScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // 스크롤에 따라 0 ~ 3 사이의 값 (필요에 따라 조정)
      targetScrollOffset = Math.min(scrollY / 7000, 3);
    }
    window.addEventListener("scroll", onScroll);

    // ---------------------------------------------------
    // 유틸리티: 선형 보간 함수
    // ---------------------------------------------------
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    // ---------------------------------------------------
    // 시간 관리: THREE.Clock 사용
    // ---------------------------------------------------
    const clock = new THREE.Clock();

    // ---------------------------------------------------
    // 애니메이션 업데이트 함수들
    // ---------------------------------------------------
    function updateAnimatedObjects(deltaTime, currentTime) {
      animatedObjects.forEach((obj) => {
        let t = (currentTime - obj.startTime) / obj.targetState.duration;
        if (t >= 1) {
          obj.startState = { ...obj.targetState };
          obj.targetState = getContinuousTarget(obj.startState, obj.type);
          obj.startTime = currentTime;
          t = 0;
        }
        const easedT = obj.ease(t);
        const currentState = {
          x: lerp(obj.startState.x, obj.targetState.x, easedT),
          y: lerp(obj.startState.y, obj.targetState.y, easedT),
          z: lerp(obj.startState.z, obj.targetState.z, easedT),
          scale: lerp(obj.startState.scale, obj.targetState.scale, easedT),
          opacity: lerp(obj.startState.opacity, obj.targetState.opacity, easedT),
        };

        // 스프라이트 업데이트
        obj.sprite.position.set(currentState.x, currentState.y, currentState.z);
        const finalSize = obj.baseSize * currentState.scale;
        obj.sprite.scale.set(finalSize, finalSize, 1);
        if (obj.sprite.material) {
          obj.sprite.material.opacity = currentState.opacity;
        }

        // 큰 빛: 동적 텍스처 업데이트 및 회전 효과
        if (obj.type === "light" && obj.dynamicTexture) {
          updateDynamicBigLightTexture(obj.dynamicTexture, currentTime);
          obj.sprite.material.rotation += (obj.rotationSpeed || 0) * deltaTime;
        }

        // 작은 입자: 미세한 잔물결(jitter) 효과
        if (obj.type === "particle" && obj.jitter) {
          obj.sprite.position.x += Math.sin(currentTime * obj.jitter.freq + obj.jitter.phaseX) * obj.jitter.amp;
          obj.sprite.position.y += Math.cos(currentTime * obj.jitter.freq + obj.jitter.phaseY) * obj.jitter.amp;
        }
      });
    }

    function updateCamera() {
      // 스크롤 값에 관성 효과 적용
      currentScrollOffset = lerp(currentScrollOffset, targetScrollOffset, 0.1);
      const targetZ = 500 - currentScrollOffset * 150;
      const targetFov = 75 - currentScrollOffset * 5;
      const targetY = currentScrollOffset * 100;

      camera.position.z = lerp(camera.position.z, targetZ, 0.1);
      camera.fov = lerp(camera.fov, targetFov, 0.1);
      camera.updateProjectionMatrix();
      camera.lookAt(0, targetY, 0);
    }

    // ---------------------------------------------------
    // 메인 애니메이션 루프
    // ---------------------------------------------------
    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const deltaTime = clock.getDelta();
      const currentTime = clock.elapsedTime;

      updateAnimatedObjects(deltaTime, currentTime);
      updateCamera();

      renderer.render(scene, camera);
    }
    animate();

    // ---------------------------------------------------
    // 창 크기 변경 처리
    // ---------------------------------------------------
    function onWindowResize() {
      width = container.clientWidth;
      height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onWindowResize);

    // ---------------------------------------------------
    // 클린업: 이벤트 및 리소스 정리
    // ---------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousemove", onMouseMove);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        background: "linear-gradient(135deg, black 0%, rgb(4, 0, 7) 50%, black 100%)",
      }}
    />
  );
}
