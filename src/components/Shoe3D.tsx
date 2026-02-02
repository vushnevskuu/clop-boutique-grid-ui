import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useIsMobile } from "@/hooks/use-mobile";
import * as THREE from "three";

interface Shoe3DProps {
  startPosition: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  onRemove: () => void;
}

const Shoe3D = ({ startPosition, velocity, angularVelocity, onRemove }: Shoe3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/shoe.glb", true);
  const isMobile = useIsMobile();
  
  // Клонируем и центрируем модель
  const { clonedScene, scale } = useMemo(() => {
    if (!scene) {
      console.warn("Shoe model scene is empty, using fallback");
      return { clonedScene: new THREE.Group(), scale: 1 };
    }
    
    try {
      const cloned = scene.clone();
      const box = new THREE.Box3().setFromObject(cloned);
      
      if (box.isEmpty()) {
        console.warn("Shoe model bounding box is empty, using fallback");
        return { clonedScene: new THREE.Group(), scale: 1 };
      }
      
      const center = box.getCenter(new THREE.Vector3());
      cloned.position.sub(center);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      // На мобильных уменьшаем масштаб в 2 раза
      const baseScale = maxDim > 0 ? 1.5 / maxDim : 3;
      const scaleValue = isMobile ? baseScale * 0.5 : baseScale; // Масштаб для ботинка (меньше на мобильных)
      
      console.log("Shoe model loaded:", { size, maxDim, scaleValue, isMobile });
      
      return { clonedScene: cloned, scale: scaleValue };
    } catch (error) {
      console.error("Error processing shoe model:", error);
      return { clonedScene: new THREE.Group(), scale: 1 };
    }
  }, [scene, isMobile]);

  // Очистка ресурсов
  useEffect(() => {
    return () => {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [clonedScene]);
  const [position, setPosition] = useState<[number, number, number]>(startPosition);
  const [currentVelocity, setCurrentVelocity] = useState<[number, number, number]>(velocity);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [currentAngularVelocity, setCurrentAngularVelocity] = useState<[number, number, number]>(angularVelocity);
  const landedTimeRef = useRef<number | null>(null);
  const isLandedRef = useRef(false);
  
  const gravity = -0.012;
  const damping = 0.997; // Сопротивление воздуха (увеличено для более медленного движения)
  const bounceDamping = 0.5; // Затухание при отскоке
  const groundY = -5; // Уровень "земли" (за футером, ниже)
  const maxHeight = 10; // Максимальная высота полета

  useFrame(() => {
    if (!groupRef.current) return;

    // Обновляем позицию
    const [vx, vy, vz] = currentVelocity;
    const newX = position[0] + vx;
    const newY = position[1] + vy;
    // Z координата фиксирована, не изменяется
    const fixedZ = position[2]; // Сохраняем изначальную Z координату

    // Применяем гравитацию
    const newVy = vy + gravity;

    // Проверяем столкновение с "землёй" и максимальную высоту
    let finalY = newY;
    let finalVy = newVy;
    
    // Ограничиваем максимальную высоту
    if (newY > maxHeight) {
      finalY = maxHeight;
    finalVy = 0; // Останавливаем на вершине
    } else if (newY <= groundY) {
      finalY = groundY;
      finalVy = -newVy * bounceDamping; // Отскок с затуханием
    }

    // Обновляем скорость с затуханием (Z скорость всегда 0, так как глубина фиксирована)
    const newVx = vx * damping;
    const newVz = 0; // Z скорость всегда 0, глубина фиксирована
    
    // Если скорость очень мала, останавливаем и отмечаем приземление
    if (Math.abs(finalVy) < 0.01 && Math.abs(newVx) < 0.01 && finalY <= groundY) {
      finalVy = 0;
      if (!isLandedRef.current) {
        isLandedRef.current = true;
        landedTimeRef.current = Date.now();
      }
    }

    setPosition([newX, finalY, fixedZ]); // Z всегда остается изначальной
    setCurrentVelocity([newVx, finalVy, newVz]);

    // Обновляем вращение
    const [rx, ry, rz] = rotation;
    const [avx, avy, avz] = currentAngularVelocity;
    setRotation([rx + avx, ry + avy, rz + avz]);
    
    // Затухание угловой скорости
    setCurrentAngularVelocity([
      avx * damping,
      avy * damping,
      avz * damping
    ]);

    // Применяем к группе
    groupRef.current.position.set(newX, finalY, fixedZ);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);

    // Удаляем если упал слишком низко или далеко
    // Z координата не проверяется, так как она фиксирована
    if (finalY < groundY - 3 || Math.abs(newX) > 8) {
      onRemove();
      return;
    }
    
    // Удаляем через 1 секунду после приземления
    if (isLandedRef.current && landedTimeRef.current) {
      const timeSinceLanding = Date.now() - landedTimeRef.current;
      if (timeSinceLanding >= 1000) {
        onRemove();
        return;
      }
    }
  });

  // Проверяем, что модель загрузилась
  useEffect(() => {
    if (clonedScene && clonedScene.children.length > 0) {
      console.log("Shoe3D rendered with model, children count:", clonedScene.children.length);
    } else {
      console.warn("Shoe3D: model not loaded or empty");
    }
  }, [clonedScene]);

  if (!clonedScene || clonedScene.children.length === 0) {
    // Fallback если модель не загрузилась
    console.warn("Using fallback geometry for shoe");
    return (
      <group ref={groupRef} position={startPosition}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#2c2c2c" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={startPosition} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

export default Shoe3D;
