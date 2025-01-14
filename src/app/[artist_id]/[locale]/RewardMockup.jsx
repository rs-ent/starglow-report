// src/app/[artist_id]/RewardMockup.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import TWEEN from '@tweenjs/tween.js';
import { useReport, useRewards } from '../../context/GlobalData';

const serifFont = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';

function createCardRoundedEdges(
  width,
  height,
  depth,
  radius,
  smoothness,
  frontTextureUrl
) {
  // radius 보정
  if (radius * 2 > width || radius * 2 > height) {
    console.warn('Warning: radius is too large. Reducing...');
    radius = Math.min(width, height) / 2;
  }

  // Shape 생성 (직사각형 + 둥근 모서리)
  const shape = new THREE.Shape();
  shape.moveTo(radius, 0);
  shape.lineTo(width - radius, 0);
  shape.absarc(width - radius, radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(width, height - radius);
  shape.absarc(width - radius, height - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(radius, height);
  shape.absarc(radius, height - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(0, radius);
  shape.absarc(radius, radius, radius, Math.PI, Math.PI * 1.5, false);

  // Extrude 설정
  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
    steps: 1,
    curveSegments: smoothness,
    // caps(앞+뒤) = materialIndex: 0
    material: 0,
    // side(측면) = materialIndex: 1
    extrudeMaterial: 1,
  };

  // ExtrudeGeometry 생성
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  // ----- 텍스처 로드 -----
  const textureLoader = new THREE.TextureLoader();
  const frontTexture = textureLoader.load(
    frontTextureUrl,
    () => console.log('Texture loaded successfully'),
    undefined,
    (err) => console.error('Error loading texture:', err)
  );

  // ----- geometry.groups 구조 -----
  // 기본적으로 그룹이 2개:
  //   0: 측면 (materialIndex = 1)
  //   1: 앞+뒤 (materialIndex = 0)
  //
  // 여기서 “앞면(front)”과 “뒷면(back)”을 나누기 위해 그룹 1을 둘로 쪼갠다.
  //
  // 예: 
  //   const sideGroup = geometry.groups[0];    // 측면
  //   const capGroup  = geometry.groups[1];    // 앞+뒤
  //     capGroup.start, capGroup.count  → 삼각형 범위
  //     앞면: 절반, 뒷면: 나머지 절반
  //

  const sideGroup = geometry.groups[0]; // (materialIndex = 1)
  const capGroup = geometry.groups[1];  // (materialIndex = 0) => 앞+뒤 통합

  const halfCount = capGroup.count / 2; // 앞, 뒤가 각각 절반

  // [앞면]: 기존 capGroup을 절반만 사용
  capGroup.count = halfCount;        
  capGroup.materialIndex = 0; // 앞면 => texture

  // [뒷면]: 새 그룹을 추가 (materialIndex = 2)
  geometry.groups.push({
    start: capGroup.start + halfCount,
    count: halfCount,
    materialIndex: 2,
  });

  // ----- 재질 3개 구성 -----
  // 인덱스별로: 0=앞면, 1=측면, 2=뒷면
  const matFront = new THREE.MeshStandardMaterial({
    map: frontTexture,
    roughness: 0.8,
    metalness: 0.3,
  });
  const matSide = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.8,
    metalness: 0.3,
  });
  const matBack = new THREE.MeshStandardMaterial({
    color: 0xff0000, // 빨강
  });

  const mesh = new THREE.Mesh(geometry, [matFront, matSide, matBack]);

  return mesh;
}

function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
  if (radius0 * 2 > depth) {
    console.warn('Warning: radius0 is too large for the given depth. Reducing radius0.');
    radius0 = depth / 2; // radius0가 depth보다 크지 않도록 조정
  }

  const shape = new THREE.Shape();

  const eps = 0.00001; // Precision adjustment
  const radius = radius0 - eps;

  // Draw rounded rectangle shape
  shape.absarc(eps, eps, radius, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, height - radius * 2, radius, Math.PI, Math.PI / 2, true);
  shape.absarc(width - radius * 2, height - radius * 2, radius, Math.PI / 2, 0, true);
  shape.absarc(width - radius * 2, eps, radius, 0, -Math.PI / 2, true);

  const extrudeSettings = {
    depth: depth, // Use "depth" directly
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius, // Bevel size is now proportional to radius
    bevelThickness: radius0,
    curveSegments: smoothness,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  return geometry;
}

const RewardMockup = ({ gift }) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const objectsRef = useRef([]);
  const frameIdRef = useRef(null);
  const report = useReport();
  const rewardsData = useRewards();
  const imagePool = rewardsData.imagePool;

  useEffect(() => {
    if (!mountRef.current || !gift) return;

    // Clean up previous scene if any
    if (sceneRef.current) {
      disposeScene();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    }

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = 'srgb';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // 5. Lights
    // Initialize RectAreaLightUniformsLib
    RectAreaLightUniformsLib.init();

    const rectLight1 = new THREE.RectAreaLight( 0xff0000, 30, 4, 10 );
    rectLight1.position.set( - 8, 5, 5 );
    scene.add( rectLight1 );

    const rectLight2 = new THREE.RectAreaLight( 0x00ff00, 30, 4, 10 );
    rectLight2.position.set( 0, 5, 5 );
    scene.add( rectLight2 );

    const rectLight3 = new THREE.RectAreaLight( 0x0000ff, 30, 4, 10 );
    rectLight3.position.set( 8, 5, 5 );
    scene.add( rectLight3 );

    scene.add( new RectAreaLightHelper( rectLight1 ) );
    scene.add( new RectAreaLightHelper( rectLight2 ) );
    scene.add( new RectAreaLightHelper( rectLight3 ) );

    const syncLightsWithCamera = (camera) => {
      const offsetDistance = 10; // 카메라 뒤 조명의 거리
    
      // 카메라 방향 벡터 계산
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
    
      // 조명을 카메라 뒤에 배치
      const cameraPosition = camera.position.clone();
      const lightPosition = cameraPosition.clone().sub(cameraDirection.multiplyScalar(offsetDistance));
    
      rectLight1.position.copy(lightPosition);
      rectLight2.position.copy(lightPosition);
      rectLight3.position.copy(lightPosition);
    
      // 각 조명에 약간의 오프셋 추가 (분리 효과)
      rectLight1.position.x -= 2;
      rectLight3.position.x += 2;
    
      // 조명 방향 설정 (카메라 방향의 반대)
      rectLight1.lookAt(camera.position);
      rectLight2.lookAt(camera.position);
      rectLight3.lookAt(camera.position);
    };

    // Ambient Light - 낮은 강도로 전체적인 조명 제공
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // 강도 0.3
    scene.add(ambientLight);

    // 6. Objects
    objectsRef.current = [];
    const objects = createObjectsByQuantity(gift);
    objects.forEach((object) => {
      scene.add(object);
      objectsRef.current.push(object);
    });

    // 7. Animation Loop
    const animate = (time) => {
      frameIdRef.current = requestAnimationFrame(animate);
      controlsRef.current.update();
      TWEEN.update(time);
      syncLightsWithCamera(camera);
      rendererRef.current.render(scene, camera);
    };
    animate();

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      rendererRef.current.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // 9. Event Listener for Camera Animation
    const handleGiftSelected = (e) => {
      const { index } = e.detail;
      if (objectsRef.current && cameraRef.current) {
        const selectedObject = objectsRef.current[index];
        if (selectedObject) {
          animateCameraToObject(selectedObject);
        }
      }
    };

    document.addEventListener('giftSelected', handleGiftSelected);

    // Cleanup on Unmount or when gift changes
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('giftSelected', handleGiftSelected);

      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }

      disposeScene();
    };
  }, [gift]);

  const disposeScene = () => {
    // Dispose of objects and materials
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      sceneRef.current = null;
    }
  };

  const animateCameraToObject = (object) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const duration = 1000; // Animation duration in ms

    const from = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      tx: controls.target.x,
      ty: controls.target.y,
      tz: controls.target.z,
    };

    const to = {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z + 5,
      tx: object.position.x,
      ty: object.position.y,
      tz: object.position.z,
    };

    new TWEEN.Tween(from)
      .to(to, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        camera.position.set(from.x, from.y, from.z);
        controls.target.set(from.tx, from.ty, from.tz);
        controls.update();
      })
      .start();
  };

  // Function to create objects based on quantity
  const createObjectsByQuantity = (gift, baseAngle = 0) => {
    const quantity = gift.quantity || 1;
    const objects = [];
    const radius = 5; // 부채꼴 반지름
    const totalAngle = Math.PI / 3; // 부채꼴 전체 각도 (60도)
    const angleStep = quantity > 1 ? totalAngle / (quantity - 1) : 0; // 각 객체 간 각도
  
    if (gift.id === 'photoCard') {
      if (quantity === 1) {
        // 객체가 하나일 때: 정중앙에 위치
        const object = createPhotoCard();
        object.position.set(0, 0, 0); // 정중앙 위치
        objects.push(object);
      } else {
        for (let j = 0; j < quantity; j++) {
          const angle = baseAngle - totalAngle / 2 + j * angleStep; // 부채꼴 중심을 기준으로 각도 계산
          const object = createPhotoCard();
  
          // 부채꼴 위치 설정
          object.position.x = -Math.sin(angle) * radius; // x축에 sin 사용
          object.position.y = Math.cos(angle) * radius - 4.5; // y축에 cos 사용
          object.position.z = 0 + j / 15; 
  
          // 객체가 중심 방향을 바라보도록 회전
          object.rotation.z = angle;
  
          objects.push(object);
        }
      }
    } else {
      // 다른 유형의 객체 생성
      for (let i = 0; i < quantity; i++) {
        let object;
        switch (gift.id) {
          case 'album':
            object = createAlbum();
            break;
          case 'videoCall':
            object = createVideoCall();
            break;
          case 'invitation':
            object = createInvitation();
            break;
          case 'goods':
            object = createGoods();
            break;
          default:
            object = createDefault();
        }
  
        if (quantity === 1) {
          // 객체가 하나일 때: 정중앙에 위치
          object.position.set(0, 0, 1); // 정중앙 위치
        } else {
          // 여러 객체일 때: 일정 간격으로 나열
          object.position.x = i * 2.5; // x축 위치
          object.position.y = 0; // y축 위치
          object.position.z = 1; // z축은 고정
        }
  
        objects.push(object);
      }
    }
  
    return objects;
  };

  // Functions to create mockup objects with optional textures
  const textureLoader = new THREE.TextureLoader();

  function createPhotoCard() {
    const cardGroup = new THREE.Group();
  
    // 카드 크기
    const cardWidth = 4.4;
    const cardHeight = 6.8;
    const cardDepth = 0.1;
    const cornerRadius = 0.6;
    const smoothness = 8;
  
    // 임의 이미지 하나 고르기
    const randomIndex = Math.floor(Math.random() * imagePool.Photocard.length);
    const selectedImage = imagePool.Photocard[randomIndex];
  
    // 서버 환경에 따라 프록시 URL 등 처리 (예: window.location.host)
    const API_BASE_URL =
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}`
        : '';
    const proxiedImageUrl = `${API_BASE_URL}/api/image-proxy?url=${encodeURIComponent(
      selectedImage.url
    )}`;
  
    // 앞면에만 텍스처, 뒷면/측면은 흰색
    const cardMesh = createCardRoundedEdges(
      cardWidth,
      cardHeight,
      cardDepth,
      cornerRadius,
      smoothness,
      proxiedImageUrl
    );
  
    cardGroup.add(cardMesh);
    return cardGroup;
  }

  const createAlbum = () => {
    const geometry = new THREE.BoxGeometry(2, 2, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: '#00ccff' });
    return new THREE.Mesh(geometry, material);
  };

  const createVideoCall = () => {
    const geometry = new THREE.BoxGeometry(2, 4, 0.1);
    const material = new THREE.MeshStandardMaterial({ color: '#000000' });
    return new THREE.Mesh(geometry, material);
  };

  const createInvitation = () => {
    const geometry = new THREE.BoxGeometry(2, 3, 0.05);
    const texture = textureLoader.load('/textures/Paper001_1K-JPG_Color.jpg');
    const material = new THREE.MeshStandardMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
  };

  const createGoods = () => {
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshStandardMaterial({ color: '#66ff66' });
    return new THREE.Mesh(geometry, material);
  };

  const createDefault = () => {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ color: '#cccccc' });
    return new THREE.Mesh(geometry, material);
  };

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', cursor: 'grab' }}
    />
  );
};

export default RewardMockup;