"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 기존의 유틸리티 함수들은 그대로 유지
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

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

// 별 필드 컴포넌트 개선
function StarField() {
  const { size } = useThree();
  const starCount = 3000; // 별 개수 증가
  const starRef = useRef();

  const starGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const opacities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = randomRange(-size.width, size.width);
      positions[i * 3 + 1] = randomRange(-size.height, size.height);
      positions[i * 3 + 2] = randomRange(-3000, -500);
      sizes[i] = randomRange(1, 10);
      phases[i] = randomRange(0, Math.PI * 2);
      opacities[i] = randomRange(0.3, 0.8);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
    return geometry;
  }, [size, starCount]);

  useFrame((state) => {
    if (starRef.current) {
      const sizes = starRef.current.geometry.attributes.size.array;
      const phases = starRef.current.geometry.attributes.phase.array;
      const opacities = starRef.current.geometry.attributes.opacity.array;

      for (let i = 0; i < starCount; i++) {
        const twinkle =
          Math.sin(state.clock.elapsedTime * 2 + phases[i]) * 0.5 + 0.5;
        sizes[i] = randomRange(0.05, 0.2) * twinkle;
        opacities[i] = randomRange(0.3, 0.8) * twinkle;
      }
      starRef.current.geometry.attributes.size.needsUpdate = true;
      starRef.current.geometry.attributes.opacity.needsUpdate = true;
    }
  });

  return (
    <points ref={starRef}>
      <primitive object={starGeometry} />
      <pointsMaterial
        color={0xffffff}
        size={1}
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
      />
    </points>
  );
}

// 텍스처 메모이제이션을 위한 커스텀 훅
function useLightTexture() {
  return useMemo(() => {
    const size = 256;
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
    gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.4)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

// 입자 시스템 개선
function ParticleSystem({ count, size }) {
  const instancedMeshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const texture = useLightTexture();

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        randomRange(-size.width / 2, size.width / 2),
        randomRange(-size.height / 2, size.height / 2),
        randomRange(-300, 300),
      ],
      scale: randomRange(0.1, 3),
      color: new THREE.Color().setHSL(
        randomRange(0.4, 0.8),
        randomRange(0.1, 0.3),
        randomRange(0.8, 1.0)
      ),
      velocity: [
        randomRange(-0.05, 0.05),
        randomRange(-0.05, 0.05),
        randomRange(-0.02, 0.02),
      ],
      phase: randomRange(0, Math.PI * 2),
      life: randomRange(0, 2),
      fadeIn: true,
    }));
  }, [count, size]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      if (particle.fadeIn) {
        particle.life += 0.002;
        if (particle.life >= 1) {
          particle.fadeIn = false;
        }
      } else {
        particle.life -= 0.001;
        if (particle.life <= 0) {
          particle.position = [
            randomRange(-size.width / 2, size.width / 2),
            randomRange(-size.height / 2, size.height / 2),
            randomRange(-300, 300),
          ];
          particle.velocity = [
            randomRange(-0.05, 0.05),
            randomRange(-0.05, 0.05),
            randomRange(-0.02, 0.02),
          ];
          particle.phase = randomRange(0, Math.PI * 2);
          particle.life = 0;
          particle.fadeIn = true;
        }
      }

      particle.position[0] += particle.velocity[0];
      particle.position[1] += particle.velocity[1];
      particle.position[2] += particle.velocity[2];

      if (Math.abs(particle.position[0]) > 500) particle.velocity[0] *= -1;
      if (Math.abs(particle.position[1]) > 500) particle.velocity[1] *= -1;
      if (Math.abs(particle.position[2]) > 100) particle.velocity[2] *= -1;

      particle.position[0] +=
        Math.sin(state.clock.elapsedTime + particle.phase) * 0.1;
      particle.position[1] +=
        Math.cos(state.clock.elapsedTime + particle.phase) * 0.1;

      dummy.position.set(...particle.position);
      const scale = particle.scale * (particle.fadeIn ? particle.life : 1);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.6}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

// 빛나는 입자 컴포넌트 개선
function GlowingParticle({ position, scale, color }) {
  const particleRef = useRef();
  const initialPosition = useRef(position);
  const velocity = useRef([
    randomRange(-0.2, 0.2),
    randomRange(-0.2, 0.2),
    randomRange(-0.1, 0.1),
  ]);
  const phase = useRef(randomRange(0, Math.PI * 2));

  useFrame((state) => {
    if (particleRef.current) {
      // 기본 움직임
      particleRef.current.position.x += velocity.current[0];
      particleRef.current.position.y += velocity.current[1];
      particleRef.current.position.z += velocity.current[2];

      // 경계 체크 및 반전
      if (Math.abs(particleRef.current.position.x) > 500)
        velocity.current[0] *= -1;
      if (Math.abs(particleRef.current.position.y) > 500)
        velocity.current[1] *= -1;
      if (Math.abs(particleRef.current.position.z) > 100)
        velocity.current[2] *= -1;

      // 부드러운 움직임을 위한 사인파 추가
      particleRef.current.position.x +=
        Math.sin(state.clock.elapsedTime + phase.current) * 0.1;
      particleRef.current.position.y +=
        Math.cos(state.clock.elapsedTime + phase.current) * 0.1;
    }
  });

  return (
    <sprite ref={particleRef} position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={useLightTexture()}
        color={color}
        transparent
        opacity={0.6}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

// 큰 빛 컴포넌트 개선
function BigLight({ position, scale, colors }) {
  const lightRef = useRef();
  const initialPosition = useRef(position);
  const rotationSpeed = useRef(randomRange(-0.0005, 0.0005)); // 회전 속도 감소
  const pulseSpeed = useRef(randomRange(0.3, 0.8)); // 펄스 속도 감소
  const pulsePhase = useRef(randomRange(0, Math.PI * 2));

  useFrame((state) => {
    if (lightRef.current) {
      // 회전
      lightRef.current.rotation.z += rotationSpeed.current;

      // 펄스 효과
      const pulse =
        Math.sin(
          state.clock.elapsedTime * pulseSpeed.current + pulsePhase.current
        ) *
          0.03 +
        0.97;
      lightRef.current.scale.set(scale * pulse, scale * pulse, 1);

      // 부드러운 움직임
      lightRef.current.position.x =
        initialPosition.current[0] +
        Math.sin(state.clock.elapsedTime * 0.2) * 20;
      lightRef.current.position.y =
        initialPosition.current[1] +
        Math.cos(state.clock.elapsedTime * 0.2) * 20;
    }
  });

  return (
    <sprite ref={lightRef} position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={useLightTexture()}
        color={colors.color1}
        transparent
        opacity={0.6} // 투명도 증가 (0.2 → 0.4)
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

// 마우스 인터랙션을 위한 커스텀 훅
function useMouseParallax() {
  const { camera, size } = useThree();
  const mouse = useRef([0, 0]);

  useEffect(() => {
    const onMouseMove = (event) => {
      mouse.current = [
        (event.clientX / size.width) * 2 - 1,
        -(event.clientY / size.height) * 2 + 1,
      ];
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [size]);

  useFrame(() => {
    // 부드러운 카메라 움직임을 위한 보간
    camera.position.x += (mouse.current[0] * 35 - camera.position.x) * 0.05;
    camera.position.y += (mouse.current[1] * 35 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
}

// 스크롤 효과를 위한 커스텀 훅
function useScrollEffect() {
  const { camera } = useThree();
  const scrollOffset = useRef(0);
  const targetOffset = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      targetOffset.current = Math.min(scrollY / 7000, 3);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    // 부드러운 스크롤 효과를 위한 보간
    scrollOffset.current += (targetOffset.current - scrollOffset.current) * 0.1;

    // 카메라 위치와 시야각 업데이트
    const targetZ = 500 - scrollOffset.current * 150;
    const targetFov = 75 - scrollOffset.current * 5;
    const targetY = scrollOffset.current * 100;

    camera.position.z += (targetZ - camera.position.z) * 0.1;
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();
    camera.lookAt(0, targetY, 0);
  });
}

// 장면 컴포넌트 업데이트
function Scene() {
  const { size } = useThree();
  const particleCount = 500;
  const lightCount = 6;

  // 마우스와 스크롤 효과 적용
  useMouseParallax();
  useScrollEffect();

  const lights = useMemo(() => {
    return Array.from({ length: lightCount }, () => ({
      position: [
        randomRange(-size.width / 2, size.width / 2),
        randomRange(-size.height / 2, size.height / 2),
        randomRange(-50, 50),
      ],
      scale: randomRange(300, 600), // 크기 증가 (200-400 → 300-600)
      colors: getRandomBigLightColors(),
    }));
  }, [size, lightCount]);

  return (
    <>
      <fog attach="fog" args={[0x120012, 0.0008]} />
      <ParticleSystem count={particleCount} size={size} />
      {lights.map((props, i) => (
        <BigLight key={`light-${i}`} {...props} />
      ))}
    </>
  );
}

// 메인 Background 컴포넌트
export default function Background() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        background:
          "linear-gradient(135deg, black 0%, rgb(5, 1, 9) 50%, black 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 500], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
