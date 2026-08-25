"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

export default function Hero3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.6);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xd4a574, 0.4, 20);
    pointLight.position.set(-3, 2, 4);
    scene.add(pointLight);

    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0xc9956b, roughness: 0.4, metalness: 0.8, transparent: true, opacity: 0.6 });
    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.4, metalness: 0.8, transparent: true, opacity: 0.6 });
    const ringMat3 = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.4, metalness: 0.8, transparent: true, opacity: 0.6 });
    const sphereMat1 = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0.4 });
    const sphereMat2 = new THREE.MeshStandardMaterial({ color: 0xcd853f, roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0.4 });
    const icoMat1 = new THREE.MeshStandardMaterial({ color: 0xd4a574, wireframe: true, transparent: true, opacity: 0.35 });
    const icoMat2 = new THREE.MeshStandardMaterial({ color: 0x8b7355, wireframe: true, transparent: true, opacity: 0.35 });

    const ringGeo = new THREE.TorusGeometry(1, 0.25, 16, 64);
    const ring1 = new THREE.Mesh(ringGeo, ringMat1); ring1.position.set(-3.5, 1.5, -1); ring1.scale.setScalar(1.2); scene.add(ring1);
    const ring2 = new THREE.Mesh(ringGeo, ringMat2); ring2.position.set(3.8, -1, -2); ring2.scale.setScalar(0.9); scene.add(ring2);
    const ring3 = new THREE.Mesh(ringGeo, ringMat3); ring3.position.set(0, -2.5, -1.5); ring3.scale.setScalar(0.7); scene.add(ring3);

    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const sphere1 = new THREE.Mesh(sphereGeo, sphereMat1); sphere1.position.set(-2, -1.5, -3); sphere1.scale.setScalar(1.8); scene.add(sphere1);
    const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2); sphere2.position.set(2.5, 2, -4); sphere2.scale.setScalar(2.2); scene.add(sphere2);

    const icoGeo = new THREE.IcosahedronGeometry(1, 1);
    const ico1 = new THREE.Mesh(icoGeo, icoMat1); ico1.position.set(4, 0.5, -2); ico1.scale.setScalar(1.5); scene.add(ico1);
    const ico2 = new THREE.Mesh(icoGeo, icoMat2); ico2.position.set(-4, -2, -3); ico2.scale.setScalar(2); scene.add(ico2);

    const particleCount = 150;
    const particleGeo = new THREE.SphereGeometry(1, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xd4a574, transparent: true, opacity: 0.8 });
    const particles: THREE.Mesh[] = [];
    const pData: { speed: number; offset: number; bx: number; by: number; bz: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      const bx = (Math.random() - 0.5) * 16, by = (Math.random() - 0.5) * 10, bz = (Math.random() - 0.5) * 8 - 2;
      p.position.set(bx, by, bz); p.scale.setScalar(0.02); scene.add(p);
      particles.push(p);
      pData.push({ speed: 0.2 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2, bx, by, bz });
    }

    let animationId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      ring1.rotation.x = Math.sin(t * 0.3) * 0.4; ring1.rotation.y = t * 0.15; ring1.rotation.z = Math.cos(t * 0.21) * 0.3; ring1.position.y = 1.5 + Math.sin(t * 1.5) * 0.4;
      ring2.rotation.x = Math.sin(t * 0.25) * 0.4; ring2.rotation.y = t * 0.125; ring2.rotation.z = Math.cos(t * 0.175) * 0.3; ring2.position.y = -1 + Math.cos(t * 1.5) * 0.4;
      ring3.rotation.x = Math.sin(t * 0.35) * 0.4; ring3.rotation.y = t * 0.175; ring3.rotation.z = Math.cos(t * 0.245) * 0.3; ring3.position.y = -2.5 + Math.sin(t * 1.2) * 0.3;

      sphere1.rotation.y = t * 0.12; sphere1.rotation.x = t * 0.06; sphere1.scale.setScalar(1.8 * (1 + Math.sin(t * 0.4) * 0.08)); sphere1.position.y = -1.5 + Math.sin(t * 2) * 0.25;
      sphere2.rotation.y = t * 0.09; sphere2.rotation.x = t * 0.045; sphere2.scale.setScalar(2.2 * (1 + Math.sin(t * 0.3) * 0.08)); sphere2.position.y = 2 + Math.cos(t * 1.8) * 0.2;

      ico1.rotation.x = t * 0.04; ico1.rotation.y = t * 0.07; ico1.rotation.z = Math.sin(t * 0.1) * 0.2; ico1.position.y = 0.5 + Math.sin(t * 1.2) * 0.3;
      ico2.rotation.x = t * 0.03; ico2.rotation.y = t * 0.0525; ico2.rotation.z = Math.sin(t * 0.075) * 0.2; ico2.position.y = -2 + Math.cos(t * 1.4) * 0.25;

      particles.forEach((p, i) => {
        const d = pData[i];
        p.position.x = d.bx + Math.sin(t * d.speed + d.offset) * 0.5;
        p.position.y = d.by + Math.cos(t * d.speed * 0.7 + d.offset) * 0.3;
        p.scale.setScalar(Math.max(0.005, 0.02 + Math.sin(t * d.speed + d.offset) * 0.01));
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth, h = canvas.parentElement.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 -z-10" style={{ pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}