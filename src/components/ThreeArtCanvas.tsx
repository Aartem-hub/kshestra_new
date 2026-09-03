import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeArtCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create organic 3D sculptural dust particles
    const particleCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorTerracotta = new THREE.Color('#5C1D24');
    const colorMoss = new THREE.Color('#8A8E3E');
    const colorOchre = new THREE.Color('#8A8E3E');
    const colorCharcoal = new THREE.Color('#3A2B27');

    for (let i = 0; i < particleCount; i++) {
      const theta = i * 0.22;
      const radius = 3.5 + Math.sin(i * 0.1) * 4.5 + (Math.random() - 0.5) * 3;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius + (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      let chosenColor = colorMoss;
      const rand = Math.random();
      if (rand < 0.55) chosenColor = colorMoss;
      else if (rand < 0.80) chosenColor = colorTerracotta;
      else if (rand < 0.92) chosenColor = colorOchre;
      else chosenColor = colorCharcoal;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending
    });

    const particlesMesh = new THREE.Points(geometry, pMaterial);
    scene.add(particlesMesh);

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 2;
      targetY = y * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      particlesMesh.rotation.y = elapsedTime * 0.03 + mouseX * 0.2;
      particlesMesh.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1 - mouseY * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      pMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-80"
      aria-hidden="true"
    />
  );
};
