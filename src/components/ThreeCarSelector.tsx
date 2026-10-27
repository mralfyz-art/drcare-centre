import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TouchZoneKey, Language, DefectPin } from '../types';
import { playAudioRadarChime } from '../services/storage';

interface ThreeCarSelectorProps {
  selectedZone: TouchZoneKey;
  onSelectZone: (zone: TouchZoneKey) => void;
  onPinsChange?: (pins: DefectPin[]) => void;
  carColorHex?: string;
  lang: Language;
}

export const ThreeCarSelector: React.FC<ThreeCarSelectorProps> = ({
  selectedZone,
  onSelectZone,
  onPinsChange,
  carColorHex = '#08080A',
  lang
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPart, setHoveredPart] = useState<TouchZoneKey | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'360' | 'front' | 'side-l' | 'side-r' | 'rear' | 'top'>('360');
  const [pins, setPins] = useState<DefectPin[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraZoom, setCameraZoom] = useState<number>(5.2);

  // Three.js mutable references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const partMeshesRef = useRef<Map<TouchZoneKey, THREE.Mesh[]>>(new Map());
  const bodyMaterialsRef = useRef<Map<TouchZoneKey, THREE.MeshPhysicalMaterial>>(new Map());
  const pinObjectsRef = useRef<THREE.Group[]>([]);
  const scanLaserRef = useRef<THREE.Mesh | null>(null);
  const scanPosRef = useRef<number>(-2.8);

  const isPointerDownRef = useRef<boolean>(false);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.16, y: 0.78 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.16, y: 0.78 });
  const targetCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.8, 5.2));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, 0));

  // Sync pins to parent
  useEffect(() => {
    if (onPinsChange) {
      onPinsChange(pins);
    }
  }, [pins, onPinsChange]);

  // Camera presets
  const setPresetView = (view: '360' | 'front' | 'side-l' | 'side-r' | 'rear' | 'top') => {
    setCameraView(view);
    setIsRotating(false);
    switch (view) {
      case 'front':
        targetRotationRef.current = { x: 0.14, y: 0 };
        targetCameraPosRef.current.set(0, 1.45, 4.4);
        targetLookAtRef.current.set(0, 0.5, 0.6);
        break;
      case 'side-l':
        targetRotationRef.current = { x: 0.08, y: Math.PI / 2 };
        targetCameraPosRef.current.set(0, 1.35, 4.8);
        targetLookAtRef.current.set(0, 0.45, 0);
        break;
      case 'side-r':
        targetRotationRef.current = { x: 0.08, y: -Math.PI / 2 };
        targetCameraPosRef.current.set(0, 1.35, 4.8);
        targetLookAtRef.current.set(0, 0.45, 0);
        break;
      case 'rear':
        targetRotationRef.current = { x: 0.16, y: Math.PI };
        targetCameraPosRef.current.set(0, 1.5, 4.5);
        targetLookAtRef.current.set(0, 0.5, -0.6);
        break;
      case 'top':
        targetRotationRef.current = { x: 0.72, y: 0 };
        targetCameraPosRef.current.set(0, 3.8, 2.5);
        targetLookAtRef.current.set(0, 0.4, 0);
        break;
      case '360':
      default:
        setIsRotating(true);
        targetCameraPosRef.current.set(0, 1.8, 5.2);
        targetLookAtRef.current.set(0, 0.45, 0);
        break;
    }
  };

  const handleZoom = (delta: number) => {
    setCameraZoom((prev) => {
      const next = Math.max(3.2, Math.min(6.8, prev + delta));
      targetCameraPosRef.current.normalize().multiplyScalar(next);
      return next;
    });
  };

  const triggerLaserScan = () => {
    setIsScanning(true);
    scanPosRef.current = -2.6;
    playAudioRadarChime();
    setTimeout(() => {
      setIsScanning(false);
    }, 4000);
  };

  const clearAllPins = () => {
    const carGroup = carGroupRef.current;
    if (carGroup) {
      pinObjectsRef.current.forEach((grp) => {
        carGroup.remove(grp);
      });
    }
    pinObjectsRef.current = [];
    setPins([]);
  };

  // Build the 3D Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL as per skill directive
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 640;
    const height = 390;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 1.8, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting Rig
    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);

    const hemiLight = new THREE.HemisphereLight(0xfffaed, 0x0c0e14, 0.9);
    scene.add(hemiLight);

    // Key Light for Crisp Specular Highlights
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
    keyLight.position.set(5.0, 7.0, 4.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0003;
    }
    scene.add(keyLight);

    // Rim Fill Light (Cool Blue for Horizon Separation)
    const rimLight = new THREE.DirectionalLight(0x7fb2ff, 1.1);
    rimLight.position.set(-5.0, 4.0, -4.5);
    scene.add(rimLight);

    // Overhead Atelier Spotlight (Gold Accent)
    const goldSpot = new THREE.PointLight(0xf5c518, 1.1, 12);
    goldSpot.position.set(0, 4.2, 1.5);
    scene.add(goldSpot);

    // Root Car Group
    const carGroup = new THREE.Group();
    carGroupRef.current = carGroup;
    scene.add(carGroup);

    // Materials Palette
    const createPaintMat = () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(carColorHex),
        metalness: 0.92,
        roughness: 0.13,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 0.96
      });

    const hoodMat = createPaintMat();
    const doorsMat = createPaintMat();
    const bumpersMat = createPaintMat();
    const roofMat = createPaintMat();

    bodyMaterialsRef.current.set('HOOD', hoodMat);
    bodyMaterialsRef.current.set('DOORS', doorsMat);
    bodyMaterialsRef.current.set('BUMPERS', bumpersMat);
    bodyMaterialsRef.current.set('FULL_BODY', roofMat);

    // Glass & Trims
    const tintedGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x07090e,
      metalness: 0.2,
      roughness: 0.03,
      transparent: true,
      opacity: 0.84,
      reflectivity: 0.98,
      clearcoat: 1.0
    });

    const glossBlackMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      metalness: 0.85,
      roughness: 0.12
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf0f3f6,
      metalness: 0.98,
      roughness: 0.05
    });

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x8a929b,
      metalness: 0.95,
      roughness: 0.22
    });

    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x14151a,
      roughness: 0.9,
      metalness: 0.04
    });

    const drilledDiscMat = new THREE.MeshStandardMaterial({
      color: 0xc8ced6,
      metalness: 0.94,
      roughness: 0.24
    });

    const goldBremboMat = new THREE.MeshStandardMaterial({
      color: 0xf5c518,
      metalness: 0.92,
      roughness: 0.16
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x121318,
      roughness: 0.42,
      metalness: 0.65
    });

    const interiorLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.75,
      metalness: 0.1
    });

    // -------------------------------------------------------------
    // PROCEDURAL CAR GEOMETRY: REALISTIC SCULPTED GT COUPE
    // -------------------------------------------------------------

    // 1. SCULPTED FRONT HOOD & FENDERS (Zone: 'HOOD')
    const hoodMeshes: THREE.Mesh[] = [];

    // Main sloping aerodynamic hood with curved power bulge
    const hoodShape = new THREE.Shape();
    hoodShape.moveTo(-0.84, 0);
    hoodShape.lineTo(0.84, 0);
    hoodShape.quadraticCurveTo(0.82, 0.5, 0.72, 1.48);
    hoodShape.quadraticCurveTo(0, 1.58, -0.72, 1.48);
    hoodShape.quadraticCurveTo(-0.82, 0.5, -0.84, 0);

    const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, {
      depth: 0.19,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 3,
      bevelSize: 0.045,
      bevelThickness: 0.045
    });
    hoodGeo.rotateX(-Math.PI / 2);
    const hoodMain = new THREE.Mesh(hoodGeo, hoodMat);
    hoodMain.position.set(0, 0.54, 0.16);
    hoodMain.castShadow = true;
    hoodMain.userData = { zoneKey: 'HOOD', nameEn: 'Front Hood', nameAr: 'الكبوت والمقدمة' };
    carGroup.add(hoodMain);
    hoodMeshes.push(hoodMain);

    // Center Aerodynamic Spine Crease
    const spineGeo = new THREE.BoxGeometry(0.06, 0.03, 1.1);
    const spine = new THREE.Mesh(spineGeo, hoodMat);
    spine.position.set(0, 0.74, 0.85);
    spine.rotation.x = 0.08;
    spine.userData = { zoneKey: 'HOOD' };
    carGroup.add(spine);
    hoodMeshes.push(spine);

    // Dual Hood Heat Extraction Louvers (Vents)
    [-0.34, 0.34].forEach((posX) => {
      const ventGeo = new THREE.BoxGeometry(0.14, 0.02, 0.42);
      const vent = new THREE.Mesh(ventGeo, glossBlackMat);
      vent.position.set(posX, 0.74, 0.82);
      vent.rotation.x = 0.08;
      carGroup.add(vent);

      const ventFrameGeo = new THREE.BoxGeometry(0.16, 0.015, 0.44);
      const ventFrame = new THREE.Mesh(ventFrameGeo, carbonMat);
      ventFrame.position.set(posX, 0.735, 0.82);
      ventFrame.rotation.x = 0.08;
      carGroup.add(ventFrame);
    });

    // Flared Front Fenders (Left & Right)
    [-1, 1].forEach((dir) => {
      const fenderShape = new THREE.Shape();
      fenderShape.moveTo(0, 0);
      fenderShape.lineTo(0.24, 0);
      fenderShape.quadraticCurveTo(0.24, 0.45, 0.18, 1.25);
      fenderShape.quadraticCurveTo(0, 1.3, 0, 0);

      const fenderGeo = new THREE.ExtrudeGeometry(fenderShape, {
        depth: 0.42,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.03,
        bevelThickness: 0.03
      });
      fenderGeo.rotateX(-Math.PI / 2);
      const fender = new THREE.Mesh(fenderGeo, hoodMat);
      fender.position.set(dir * 0.78, 0.38, 0.22);
      fender.castShadow = true;
      fender.userData = { zoneKey: 'HOOD', nameEn: 'Front Fender', nameAr: 'الرفرف الأمامي' };
      carGroup.add(fender);
      hoodMeshes.push(fender);

      // Fender Air Breather Gills (Aerodynamic extraction)
      const gillGeo = new THREE.BoxGeometry(0.04, 0.14, 0.02);
      for (let g = 0; g < 3; g++) {
        const gill = new THREE.Mesh(gillGeo, chromeMat);
        gill.position.set(dir * 0.94, 0.52 + g * 0.04, 0.42);
        carGroup.add(gill);
      }
    });

    // -------------------------------------------------------------
    // 2. SCULPTED DOORS & SIDE PROFILE (Zone: 'DOORS')
    // -------------------------------------------------------------
    const doorMeshes: THREE.Mesh[] = [];

    // Left & Right Doors with waistline shoulder and concave rocker scoop
    [-1, 1].forEach((dir) => {
      const isRight = dir === -1;
      const doorShape = new THREE.Shape();
      doorShape.moveTo(0, 0);
      doorShape.lineTo(0.18, 0);
      doorShape.lineTo(0.2, 1.7);
      doorShape.lineTo(0, 1.7);

      const doorGeo = new THREE.BoxGeometry(0.16, 0.58, 1.68);
      const doorMesh = new THREE.Mesh(doorGeo, doorsMat);
      doorMesh.position.set(dir * 0.88, 0.54, -0.32);
      doorMesh.castShadow = true;
      doorMesh.userData = {
        zoneKey: 'DOORS',
        nameEn: isRight ? 'Right Side Doors' : 'Left Driver Doors',
        nameAr: isRight ? 'الأبواب الجانبية اليمنى' : 'أبواب السائق اليسرى'
      };
      carGroup.add(doorMesh);
      doorMeshes.push(doorMesh);

      // Muscular Flared Rear Quarter Haunch
      const haunchGeo = new THREE.BoxGeometry(0.22, 0.56, 0.98);
      const haunch = new THREE.Mesh(haunchGeo, doorsMat);
      haunch.position.set(dir * 0.91, 0.56, -1.25);
      haunch.castShadow = true;
      haunch.userData = { zoneKey: 'DOORS', nameEn: 'Rear Quarter Haunch', nameAr: 'الرفرف والجانب الخلفي' };
      carGroup.add(haunch);
      doorMeshes.push(haunch);

      // Recessed Flush Door Handles
      const handleRecessGeo = new THREE.BoxGeometry(0.03, 0.04, 0.22);
      const handleRecess = new THREE.Mesh(handleRecessGeo, glossBlackMat);
      handleRecess.position.set(dir * 0.97, 0.68, -0.2);
      carGroup.add(handleRecess);

      const handleBarGeo = new THREE.BoxGeometry(0.02, 0.024, 0.18);
      const handleBar = new THREE.Mesh(handleBarGeo, chromeMat);
      handleBar.position.set(dir * 0.975, 0.68, -0.2);
      carGroup.add(handleBar);

      // Aerodynamic Sports Mirrors (2-Tone with Amber LED Indicator)
      const mirrorGroup = new THREE.Group();
      const mirrorStem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.14, 8), glossBlackMat);
      mirrorStem.rotation.z = dir * -Math.PI / 5;
      mirrorGroup.add(mirrorStem);

      const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.09, 0.15), doorsMat);
      mirrorHousing.position.set(dir * 0.08, 0.06, 0);
      mirrorGroup.add(mirrorHousing);

      // LED Indicator Strip
      const ledStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.02, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 1.2 })
      );
      ledStrip.position.set(dir * 0.17, 0.06, 0);
      mirrorGroup.add(ledStrip);

      // Chrome Mirror Face
      const mirrorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.08), chromeMat);
      mirrorGlass.position.set(dir * 0.08, 0.06, -0.076);
      mirrorGlass.rotation.y = Math.PI;
      mirrorGroup.add(mirrorGlass);

      mirrorGroup.position.set(dir * 0.93, 0.85, 0.26);
      carGroup.add(mirrorGroup);

      // Aerodynamic Carbon Fiber Side Skirt
      const skirtGeo = new THREE.BoxGeometry(0.09, 0.05, 2.38);
      const skirt = new THREE.Mesh(skirtGeo, carbonMat);
      skirt.position.set(dir * 0.93, 0.22, -0.15);
      carGroup.add(skirt);

      // Rear Side Aero Winglet
      const wingletGeo = new THREE.BoxGeometry(0.06, 0.11, 0.14);
      const winglet = new THREE.Mesh(wingletGeo, carbonMat);
      winglet.position.set(dir * 0.96, 0.26, -1.02);
      carGroup.add(winglet);
    });

    // -------------------------------------------------------------
    // 3. FRONT & REAR BUMPERS & AERODYNAMICS (Zone: 'BUMPERS')
    // -------------------------------------------------------------
    const bumperMeshes: THREE.Mesh[] = [];

    // Front Bumper with Sculpted Air Dams
    const frontBumperShape = new THREE.Shape();
    frontBumperShape.moveTo(-0.93, 0);
    frontBumperShape.lineTo(0.93, 0);
    frontBumperShape.quadraticCurveTo(0.88, 0.38, 0.74, 0.58);
    frontBumperShape.quadraticCurveTo(0, 0.64, -0.74, 0.58);
    frontBumperShape.quadraticCurveTo(-0.88, 0.38, -0.93, 0);

    const frontBumperGeo = new THREE.ExtrudeGeometry(frontBumperShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.05,
      bevelThickness: 0.05
    });
    frontBumperGeo.rotateX(Math.PI / 2);
    const frontBumper = new THREE.Mesh(frontBumperGeo, bumpersMat);
    frontBumper.position.set(0, 0.54, 1.48);
    frontBumper.castShadow = true;
    frontBumper.userData = { zoneKey: 'BUMPERS', nameEn: 'Front Bumper & Apron', nameAr: 'الصدام الأمامي' };
    carGroup.add(frontBumper);
    bumperMeshes.push(frontBumper);

    // Front Aerodynamic Carbon Splitter with Outer Winglets
    const splitterGeo = new THREE.BoxGeometry(1.86, 0.045, 0.48);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.21, 1.76);
    carGroup.add(splitter);

    [-0.92, 0.92].forEach((posX) => {
      const splitWinglet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.22), carbonMat);
      splitWinglet.position.set(posX, 0.26, 1.78);
      carGroup.add(splitWinglet);
    });

    // 3D Hexagonal Radiator Grille
    const grilleGeo = new THREE.BoxGeometry(1.08, 0.26, 0.05);
    const grille = new THREE.Mesh(grilleGeo, glossBlackMat);
    grille.position.set(0, 0.42, 1.88);
    carGroup.add(grille);

    // Grille Chrome Trim Border
    const grilleBorderGeo = new THREE.BoxGeometry(1.12, 0.29, 0.02);
    const grilleBorder = new THREE.Mesh(grilleBorderGeo, chromeMat);
    grilleBorder.position.set(0, 0.42, 1.895);
    carGroup.add(grilleBorder);

    // Centered DR. CARE Atelier Gold Brand Emblem on Grille
    const badgeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.02, 24);
    badgeGeo.rotateX(Math.PI / 2);
    const badgeMesh = new THREE.Mesh(badgeGeo, goldBremboMat);
    badgeMesh.position.set(0, 0.43, 1.91);
    carGroup.add(badgeMesh);

    // Lower Side Air Intakes
    [-0.7, 0.7].forEach((posX) => {
      const intake = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.19, 0.06), glossBlackMat);
      intake.position.set(posX, 0.38, 1.82);
      carGroup.add(intake);
    });

    // Rear Bumper with Diffuser
    const rearBumperGeo = new THREE.BoxGeometry(1.88, 0.5, 0.5);
    const rearBumper = new THREE.Mesh(rearBumperGeo, bumpersMat);
    rearBumper.position.set(0, 0.48, -1.68);
    rearBumper.castShadow = true;
    rearBumper.userData = { zoneKey: 'BUMPERS', nameEn: 'Rear Bumper & Diffuser', nameAr: 'الصدام الخلفي' };
    carGroup.add(rearBumper);
    bumperMeshes.push(rearBumper);

    // Rear Diffuser (Carbon) with 4 Flow Strakes
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.38), carbonMat);
    diffuser.position.set(0, 0.24, -1.82);
    carGroup.add(diffuser);

    [-0.46, -0.16, 0.16, 0.46].forEach((posX) => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.14, 0.28), carbonMat);
      fin.position.set(posX, 0.24, -1.88);
      carGroup.add(fin);
    });

    // Recessed License Plate with "DR. CARE" Atelier Vanity Plate
    const plateRecess = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.03), glossBlackMat);
    plateRecess.position.set(0, 0.48, -1.94);
    carGroup.add(plateRecess);

    // License Plate Canvas Texture
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 256;
    plateCanvas.height = 64;
    const pCtx = plateCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#0B0C10';
      pCtx.fillRect(0, 0, 256, 64);
      pCtx.strokeStyle = '#F5C518';
      pCtx.lineWidth = 4;
      pCtx.strokeRect(4, 4, 248, 56);
      pCtx.fillStyle = '#F5C518';
      pCtx.font = 'bold 26px serif';
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      pCtx.fillText('DR. CARE', 128, 32);
    }
    const plateTex = new THREE.CanvasTexture(plateCanvas);
    const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });
    const plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.16), plateMat);
    plateMesh.position.set(0, 0.48, -1.956);
    plateMesh.rotation.y = Math.PI;
    carGroup.add(plateMesh);

    // Quad Polished Exhaust Pipes (Chrome / Titanium with hollow bore)
    const exhaustPositions = [-0.64, -0.52, 0.52, 0.64];
    const exhaustGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.2, 20);
    exhaustGeo.rotateX(Math.PI / 2);
    const exInnerMat = new THREE.MeshBasicMaterial({ color: 0x050505 });

    exhaustPositions.forEach((posX) => {
      const exMesh = new THREE.Mesh(exhaustGeo, titaniumMat);
      exMesh.position.set(posX, 0.25, -1.93);
      carGroup.add(exMesh);

      const exRim = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.008, 12, 20), chromeMat);
      exRim.position.set(posX, 0.25, -2.03);
      carGroup.add(exRim);

      const exInner = new THREE.Mesh(new THREE.CircleGeometry(0.046, 16), exInnerMat);
      exInner.position.set(posX, 0.25, -2.031);
      carGroup.add(exInner);
    });

    // -------------------------------------------------------------
    // 4. CABIN GREENHOUSE, ROOF & INTERIOR (Zone: 'FULL_BODY')
    // -------------------------------------------------------------
    const roofMeshes: THREE.Mesh[] = [];

    // Sculpted Fastback Roof Shell
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-0.73, 0);
    roofShape.lineTo(0.73, 0);
    roofShape.quadraticCurveTo(0.71, 0.5, 0.63, 1.88);
    roofShape.quadraticCurveTo(0, 1.98, -0.63, 1.88);
    roofShape.quadraticCurveTo(-0.71, 0.5, -0.73, 0);

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.04,
      bevelThickness: 0.04
    });
    roofGeo.rotateX(-Math.PI / 2);
    const roofMain = new THREE.Mesh(roofGeo, roofMat);
    roofMain.position.set(0, 0.96, -1.1);
    roofMain.castShadow = true;
    roofMain.userData = { zoneKey: 'FULL_BODY', nameEn: 'Panoramic Roof & Pillars', nameAr: 'السقف والقوائم' };
    carGroup.add(roofMain);
    roofMeshes.push(roofMain);

    // Integrated Ducktail Rear Lip Spoiler
    const ducktailGeo = new THREE.BoxGeometry(1.52, 0.065, 0.3);
    const ducktail = new THREE.Mesh(ducktailGeo, roofMat);
    ducktail.position.set(0, 0.83, -1.65);
    ducktail.rotation.x = -0.16;
    ducktail.userData = { zoneKey: 'FULL_BODY', nameEn: 'Ducktail Lip Spoiler', nameAr: 'سبويلر الشنطة' };
    carGroup.add(ducktail);
    roofMeshes.push(ducktail);

    // Glass Greenhouse
    // Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.46, 0.035), tintedGlassMat);
    windshield.position.set(0, 0.89, 0.42);
    windshield.rotation.x = 0.63;
    carGroup.add(windshield);

    // Rear Screen
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.58, 0.035), tintedGlassMat);
    rearGlass.position.set(0, 0.87, -1.06);
    rearGlass.rotation.x = -0.59;
    carGroup.add(rearGlass);

    // Side Windows
    [-1, 1].forEach((dir) => {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 1.48), tintedGlassMat);
      sideGlass.position.set(dir * 0.77, 0.87, -0.3);
      carGroup.add(sideGlass);
    });

    // -------------------------------------------------------------
    // COCKPIT INTERIOR (Visible through tinted glass)
    // -------------------------------------------------------------
    // Dashboard
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.18, 0.5), interiorLeatherMat);
    dash.position.set(0, 0.72, 0.28);
    carGroup.add(dash);

    // Sports Steering Wheel with Flat Bottom
    const wheelTorus = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 8, 20), glossBlackMat);
    wheelTorus.position.set(0.38, 0.78, 0.08);
    wheelTorus.rotation.x = 0.45;
    carGroup.add(wheelTorus);

    const wheelHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), interiorLeatherMat);
    wheelHub.position.set(0.38, 0.78, 0.08);
    wheelHub.rotation.x = 0.45;
    carGroup.add(wheelHub);

    // High-Bolster Sport Bucket Seats (Driver & Passenger)
    [-0.36, 0.36].forEach((posX) => {
      // Seat Cushion
      const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.46), interiorLeatherMat);
      seatCushion.position.set(posX, 0.46, -0.22);
      carGroup.add(seatCushion);

      // Seat Backrest
      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.44, 0.12), interiorLeatherMat);
      seatBack.position.set(posX, 0.68, -0.42);
      seatBack.rotation.x = -0.15;
      carGroup.add(seatBack);

      // Headrest
      const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.08), interiorLeatherMat);
      headrest.position.set(posX, 0.94, -0.46);
      carGroup.add(headrest);
    });

    // Center Console
    const consoleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.7), interiorLeatherMat);
    consoleMesh.position.set(0, 0.48, -0.2);
    carGroup.add(consoleMesh);

    // -------------------------------------------------------------
    // 5. SIGNATURE CRYSTALLINE OPTICS & LED LIGHTBARS
    // -------------------------------------------------------------
    // Front Dual Projector Headlights
    const drlMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.5
    });
    const laserMat = new THREE.MeshStandardMaterial({
      color: 0x4499ff,
      emissive: 0x0077ff,
      emissiveIntensity: 1.0
    });

    [-1, 1].forEach((dir) => {
      // Swept Headlight DRL Brow
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.14), drlMat);
      brow.position.set(dir * 0.66, 0.58, 1.78);
      brow.rotation.y = dir * 0.16;
      carGroup.add(brow);

      // Projector Eye Lenses
      const lens1 = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), drlMat);
      lens1.position.set(dir * 0.58, 0.53, 1.84);
      carGroup.add(lens1);

      const lens2 = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), laserMat);
      lens2.position.set(dir * 0.74, 0.53, 1.8);
      carGroup.add(lens2);
    });

    // Rear Full-Width 3D OLED Neon Light Blade
    const oledMat = new THREE.MeshStandardMaterial({
      color: 0xff0022,
      emissive: 0xff0022,
      emissiveIntensity: 1.6
    });
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.05, 0.06), oledMat);
    tailBar.position.set(0, 0.69, -1.94);
    carGroup.add(tailBar);

    // -------------------------------------------------------------
    // 6. FORGED ALLOY WHEELS, VENTILATED BRAKES & GOLD CALIPERS (4x)
    // -------------------------------------------------------------
    const wheelPositions = [
      { x: 0.95, z: 1.14 },
      { x: -0.95, z: 1.14 },
      { x: 0.97, z: -1.25 },
      { x: -0.97, z: -1.25 }
    ];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, 0.35, pos.z);
      const isRight = pos.x < 0;

      // Tire with tread profile
      const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.25, 32);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireRubberMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Outer Concave Wheel Rim Lip
      const rimLipGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.26, 24);
      rimLipGeo.rotateZ(Math.PI / 2);
      const rimLip = new THREE.Mesh(rimLipGeo, chromeMat);
      wheelGroup.add(rimLip);

      // 10-Spoke Forged Wheel Face
      for (let s = 0; s < 10; s++) {
        const angle = (s / 10) * Math.PI * 2;
        const spokeGeo = new THREE.BoxGeometry(0.028, 0.26, 0.024);
        spokeGeo.rotateZ(angle);
        const spoke = new THREE.Mesh(spokeGeo, chromeMat);
        spoke.position.x = isRight ? -0.125 : 0.125;
        wheelGroup.add(spoke);
      }

      // Center Hub Cap with Gold Atelier Ring
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16), glossBlackMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.x = isRight ? -0.135 : 0.135;
      wheelGroup.add(hub);

      const hubGold = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.035, 16), goldBremboMat);
      hubGold.rotation.z = Math.PI / 2;
      hubGold.position.x = isRight ? -0.136 : 0.136;
      wheelGroup.add(hubGold);

      // Drilled & Slotted Brake Rotor
      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.022, 24), drilledDiscMat);
      rotor.rotation.z = Math.PI / 2;
      rotor.position.x = isRight ? -0.06 : 0.06;
      wheelGroup.add(rotor);

      // Gold 6-Piston Brembo-style Caliper
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.12), goldBremboMat);
      caliper.position.set(isRight ? -0.06 : 0.06, 0.15, 0);
      wheelGroup.add(caliper);

      carGroup.add(wheelGroup);
    });

    // -------------------------------------------------------------
    // 7. GROUND CONTACT SHADOW & SHOWROOM FLOOR
    // -------------------------------------------------------------
    const shadowGeo = new THREE.PlaneGeometry(4.4, 5.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 20, 128, 128, 122);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.88
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.008;
    scene.add(shadowPlane);

    // Studio Floor Grid Lines
    const gridHelper = new THREE.GridHelper(8, 16, 0xd4a017, 0x1f232d);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // -------------------------------------------------------------
    // 8. OPTICAL LASER SCANNER BEAM
    // -------------------------------------------------------------
    const scanLaserGeo = new THREE.PlaneGeometry(2.4, 0.06);
    const scanLaserMat = new THREE.MeshBasicMaterial({
      color: 0xf5c518,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const scanLaser = new THREE.Mesh(scanLaserGeo, scanLaserMat);
    scanLaser.rotation.x = Math.PI / 2;
    scanLaser.position.set(0, 0.6, -2.8);
    scanLaser.visible = false;
    scene.add(scanLaser);
    scanLaserRef.current = scanLaser;

    // Save Mesh References for Raycasting
    partMeshesRef.current.set('HOOD', hoodMeshes);
    partMeshesRef.current.set('DOORS', doorMeshes);
    partMeshesRef.current.set('BUMPERS', bumperMeshes);
    partMeshesRef.current.set('FULL_BODY', [...hoodMeshes, ...doorMeshes, ...bumperMeshes, ...roofMeshes]);

    // Setup Interactive Raycaster & Mouse Gestures
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDownRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerPosRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isPointerDownRef.current) {
        setIsRotating(false);
        const deltaX = clientX - pointerPosRef.current.x;
        const deltaY = clientY - pointerPosRef.current.y;
        targetRotationRef.current.y += deltaX * 0.009;
        targetRotationRef.current.x = Math.max(0.04, Math.min(0.68, targetRotationRef.current.x + deltaY * 0.005));
        pointerPosRef.current = { x: clientX, y: clientY };
      }

      // Hover Raycast
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const allInteractive: THREE.Mesh[] = [];
      partMeshesRef.current.forEach((list) => allInteractive.push(...list));
      const intersects = raycaster.intersectObjects(allInteractive, false);

      if (intersects.length > 0) {
        const topHit = intersects[0].object as THREE.Mesh;
        const key = topHit.userData.zoneKey as TouchZoneKey;
        if (key) setHoveredPart(key);
      } else {
        setHoveredPart(null);
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;

      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const allInteractive: THREE.Mesh[] = [];
      partMeshesRef.current.forEach((list) => allInteractive.push(...list));
      const intersects = raycaster.intersectObjects(allInteractive, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const topHit = hit.object as THREE.Mesh;
        const key = topHit.userData.zoneKey as TouchZoneKey;
        if (key) {
          onSelectZone(key);
          playAudioRadarChime();

          // Transform hit point into local car coordinates
          const localPoint = carGroup.worldToLocal(hit.point.clone());

          // Create 3D Holographic Pin Marker at exact point
          const pinGroup = new THREE.Group();
          pinGroup.position.copy(localPoint);

          // 1. Concentric Surface Target Rings
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xf5c518,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95
          });
          const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.055, 24), ringMat);
          ring1.rotation.x = -Math.PI / 2;
          pinGroup.add(ring1);

          const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.09, 24), ringMat);
          ring2.rotation.x = -Math.PI / 2;
          pinGroup.add(ring2);

          // 2. Glowing Vertical Laser Beacon Needle
          const needleMat = new THREE.LineBasicMaterial({ color: 0xffe066, linewidth: 2 });
          const needleGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.35, 0)
          ]);
          const needle = new THREE.Line(needleGeo, needleMat);
          pinGroup.add(needle);

          // 3. Glowing Diamond Pin Head
          const diamondGeo = new THREE.OctahedronGeometry(0.045, 0);
          const diamondMat = new THREE.MeshStandardMaterial({
            color: 0xf5c518,
            emissive: 0xffd700,
            emissiveIntensity: 1.8
          });
          const diamond = new THREE.Mesh(diamondGeo, diamondMat);
          diamond.position.y = 0.35;
          pinGroup.add(diamond);

          carGroup.add(pinGroup);
          pinObjectsRef.current.push(pinGroup);

          // Add to State
          const newPin: DefectPin = {
            id: `pin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            zone: key,
            x: parseFloat(localPoint.x.toFixed(2)),
            y: parseFloat(localPoint.y.toFixed(2)),
            z: parseFloat(localPoint.z.toFixed(2)),
            labelEn: topHit.userData.nameEn || key,
            labelAr: topHit.userData.nameAr || key
          };
          setPins((prev) => [...prev.slice(-4), newPin]); // Keep up to 5 markers

          // Smoothly glide camera toward damaged quadrant
          targetLookAtRef.current.set(localPoint.x * 0.4, 0.45, localPoint.z * 0.4);
          if (key === 'HOOD') {
            targetCameraPosRef.current.set(0, 1.45, 4.4);
          } else if (key === 'DOORS') {
            targetCameraPosRef.current.set(localPoint.x > 0 ? 3.5 : -3.5, 1.35, 3.2);
          } else if (key === 'BUMPERS') {
            targetCameraPosRef.current.set(0, 1.5, localPoint.z < 0 ? -4.4 : 4.4);
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || 640;
      cameraRef.current.aspect = w / 390;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, 390);
    };
    window.addEventListener('resize', handleResize);

    // 60FPS Smooth Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating && !isPointerDownRef.current) {
        targetRotationRef.current.y += delta * 0.38;
      }

      // Smooth rotation damping
      currentRotationRef.current.x = THREE.MathUtils.damp(
        currentRotationRef.current.x,
        targetRotationRef.current.x,
        6,
        delta
      );
      currentRotationRef.current.y = THREE.MathUtils.damp(
        currentRotationRef.current.y,
        targetRotationRef.current.y,
        6,
        delta
      );

      carGroup.rotation.x = currentRotationRef.current.x;
      carGroup.rotation.y = currentRotationRef.current.y;

      // Animate pin pulsing diamond rotation
      pinObjectsRef.current.forEach((grp, idx) => {
        grp.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.OctahedronGeometry) {
            child.rotation.y += delta * 2.5;
            child.position.y = 0.35 + Math.sin(clock.getElapsedTime() * 4 + idx) * 0.02;
          }
        });
      });

      // Optical Laser Scan Sweep
      if (scanLaserRef.current && isScanning) {
        scanLaserRef.current.visible = true;
        scanPosRef.current += delta * 1.5;
        scanLaserRef.current.position.z = scanPosRef.current;
        if (scanPosRef.current > 2.8) {
          scanPosRef.current = -2.8;
        }
      } else if (scanLaserRef.current) {
        scanLaserRef.current.visible = false;
      }

      // Smooth camera position & LookAt
      camera.position.lerp(targetCameraPosRef.current, delta * 3.5);
      currentLookAtRef.current.lerp(targetLookAtRef.current, delta * 4);
      camera.lookAt(currentLookAtRef.current);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    };
  }, [onSelectZone, isScanning]);

  // Synchronize dynamic paint finish & clearcoat highlights
  const updateMaterials = useCallback(() => {
    const baseColor = new THREE.Color(carColorHex);
    const goldGlow = new THREE.Color(0xf5c518);

    bodyMaterialsRef.current.forEach((mat, key) => {
      const isSelected = selectedZone === key || selectedZone === 'FULL_BODY';
      const isHovered = hoveredPart === key;

      if (isSelected) {
        // Luminous gold clear-coat surgical pulse
        mat.color.copy(baseColor).lerp(goldGlow, 0.42);
        mat.emissive.setHex(0xd4a017);
        mat.emissiveIntensity = 0.52;
        mat.roughness = 0.09;
      } else if (isHovered) {
        mat.color.copy(baseColor).lerp(goldGlow, 0.22);
        mat.emissive.setHex(0xf5c518);
        mat.emissiveIntensity = 0.25;
        mat.roughness = 0.12;
      } else {
        mat.color.copy(baseColor);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.roughness = 0.15;
      }
    });
  }, [carColorHex, selectedZone, hoveredPart]);

  useEffect(() => {
    updateMaterials();
  }, [updateMaterials]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#0c0d14] via-[#07080c] to-[#040406] border border-gold-400/40 shadow-2xl">
      {/* 3D VIEWPORT CANVAS MOUNT */}
      <div
        ref={containerRef}
        className="w-full h-[390px] cursor-crosshair active:cursor-grabbing relative select-none"
        title="Tap directly on car to pinpoint scratch location • Drag to orbit 360°"
      />

      {/* TOP FLOATING OVERLAY: CURRENT TELEMETRY & PIN STATUS */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-xs">
        <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-gold-400/40 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span>
          <span className="text-[11px] font-black uppercase tracking-wider text-gold-300">
            {lang === 'ar' ? 'الأتيليه ثلاثي الأبعاد — انقر لتحديد مكان الخدش بدقة' : '3D Atelier — Tap car surface to pinpoint scratch'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pins.length > 0 && (
            <div className="bg-gold-400/20 border border-gold-400/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-gold-300 font-extrabold text-[11px] shadow">
              📍 {pins.length} {lang === 'ar' ? 'نقطة خدش محددة' : 'Scratch Pin(s) Placed'}
            </div>
          )}

          <div className="bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-zinc-300 font-bold text-[11px] shadow">
            <span>{lang === 'ar' ? 'السطح: ' : 'Zone: '}</span>
            <strong className="text-gold-300">
              {selectedZone === 'HOOD'
                ? lang === 'ar' ? 'الكبوت والمقدمة' : 'Front Hood & Fenders'
                : selectedZone === 'DOORS'
                ? lang === 'ar' ? 'الأبواب والجوانب' : 'Doors & Side Panels'
                : selectedZone === 'BUMPERS'
                ? lang === 'ar' ? 'الصدامات والأركان' : 'Bumpers & Corners'
                : lang === 'ar' ? 'كامل بودي السيارة' : 'Full Vehicle Rejuvenation'}
            </strong>
          </div>
        </div>
      </div>

      {/* RECENT DAMAGE PIN CARD OVERLAY (IF ANY PIN PLACED) */}
      {pins.length > 0 && (
        <div className="absolute top-14 left-3.5 bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl border border-gold-400/30 text-[10px] space-y-1 max-w-[240px] shadow-xl">
          <div className="flex items-center justify-between text-gold-300 font-black">
            <span>{lang === 'ar' ? '🎯 آخر نقطة تم تحديدها:' : '🎯 Latest Marked Defect:'}</span>
            <button
              type="button"
              onClick={clearAllPins}
              className="text-red-400 hover:text-red-300 underline pointer-events-auto cursor-pointer text-[9px] font-bold"
            >
              {lang === 'ar' ? 'مسح النقاط' : 'Clear'}
            </button>
          </div>
          <p className="text-zinc-200 font-semibold truncate">
            {lang === 'ar' ? pins[pins.length - 1].labelAr : pins[pins.length - 1].labelEn}
          </p>
          <p className="text-zinc-400 font-mono text-[9px]">
            Coords: X: {pins[pins.length - 1].x} | Y: {pins[pins.length - 1].y} | Z: {pins[pins.length - 1].z}
          </p>
        </div>
      )}

      {/* RIGHT SIDE FLOATING ACTION BUTTONS: ZOOM & SCAN */}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-xl">
        <button
          type="button"
          onClick={() => handleZoom(-0.6)}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-gold-400 hover:text-black text-zinc-300 flex items-center justify-center font-black text-sm cursor-pointer transition shadow"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleZoom(0.6)}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-gold-400 hover:text-black text-zinc-300 flex items-center justify-center font-black text-sm cursor-pointer transition shadow"
          title="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          onClick={triggerLaserScan}
          disabled={isScanning}
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs cursor-pointer transition shadow ${
            isScanning
              ? 'bg-gold-400 text-black animate-pulse'
              : 'bg-white/5 hover:bg-gold-400/20 text-gold-300 border border-gold-400/30'
          }`}
          title={lang === 'ar' ? 'تشغيل المسح البصري للورنيش' : 'Trigger Optical Clear-Coat Laser Scan'}
        >
          ⚡
        </button>
      </div>

      {/* BOTTOM COLLAPSIBLE DOCK: CAMERA VIEWS & DIRECT PANEL SELECTORS */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/90 backdrop-blur-md p-1.5 rounded-2xl border border-gold-400/40 shadow-2xl max-w-[96%] overflow-x-auto">
        <button
          type="button"
          onClick={() => setPresetView('360')}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer whitespace-nowrap ${
            cameraView === '360' && isRotating
              ? 'bg-gold-400 text-black shadow'
              : 'text-zinc-300 hover:text-white bg-white/5'
          }`}
        >
          🔄 360° {lang === 'ar' ? 'دوران تلقائي' : 'Auto-Orbit'}
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectZone('HOOD');
            setPresetView('front');
          }}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer whitespace-nowrap ${
            selectedZone === 'HOOD'
              ? 'bg-gold-400 text-black shadow font-extrabold'
              : 'text-zinc-300 hover:text-white bg-white/5'
          }`}
        >
          {lang === 'ar' ? 'المقدمة والكبوت' : 'Front Hood'}
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectZone('DOORS');
            setPresetView('side-l');
          }}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer whitespace-nowrap ${
            selectedZone === 'DOORS'
              ? 'bg-gold-400 text-black shadow font-extrabold'
              : 'text-zinc-300 hover:text-white bg-white/5'
          }`}
        >
          {lang === 'ar' ? 'الأبواب والجوانب' : 'Side Doors'}
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectZone('BUMPERS');
            setPresetView('rear');
          }}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer whitespace-nowrap ${
            selectedZone === 'BUMPERS'
              ? 'bg-gold-400 text-black shadow font-extrabold'
              : 'text-zinc-300 hover:text-white bg-white/5'
          }`}
        >
          {lang === 'ar' ? 'الصدامات' : 'Bumpers'}
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectZone('FULL_BODY');
            setPresetView('top');
          }}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer whitespace-nowrap ${
            selectedZone === 'FULL_BODY'
              ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-black font-extrabold shadow'
              : 'text-gold-200 bg-gold-400/15 border border-gold-400/30'
          }`}
        >
          👑 {lang === 'ar' ? 'كامل البودي' : 'Full Car'}
        </button>

        {pins.length > 0 && (
          <button
            type="button"
            onClick={clearAllPins}
            className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-red-300 hover:bg-red-950/60 bg-red-900/30 border border-red-500/30 cursor-pointer whitespace-nowrap transition"
            title="Clear all marked defect pins"
          >
            ✕ {lang === 'ar' ? 'مسح' : 'Clear'}
          </button>
        )}
      </div>
    </div>
  );
};
