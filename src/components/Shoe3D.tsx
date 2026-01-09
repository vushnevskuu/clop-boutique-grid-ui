import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
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
  
  // Клонируем и центрируем модель
  const { clonedScene, scale } = useMemo(() => {
    if (!scene) {
      console.warn("Shoe model scene is empty");
      return { clonedScene: new THREE.Group(), scale: 1 };
    }
    
    const cloned = scene.clone();
    const box = new THREE.Box3().setFromObject(cloned);
    
    if (box.isEmpty()) {
      console.warn("Shoe model bounding box is empty");
      return { clonedScene: new THREE.Group(), scale: 1 };
    }
    
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleValue = maxDim > 0 ? 1.5 / maxDim : 3; // Масштаб для ботинка (увеличен в 3 раза)
    
    console.log("Shoe model loaded:", { size, maxDim, scaleValue });
    
    return { clonedScene: cloned, scale: scaleValue };
  }, [scene]);

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
  
  const gravity = -0.012;
  const damping = 0.995; // Сопротивление воздуха
  const bounceDamping = 0.5; // Затухание при отскоке
  const groundY = -2; // Уровень "земли" (равен точке вылета)
  const maxHeight = 4; // Максимальная высота полета (примерно 600px)

  useFrame(() => {
    if (!groupRef.current) return;

    // Обновляем позицию
    const [vx, vy, vz] = currentVelocity;
    const newX = position[0] + vx;
    const newY = position[1] + vy;
    const newZ = position[2] + vz;

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
      
      // Если скорость очень мала, останавливаем
      if (Math.abs(finalVy) < 0.01) {
        finalVy = 0;
      }
    }

    // Обновляем скорость с затуханием
    const newVx = vx * damping;
    const newVz = vz * damping;

    setPosition([newX, finalY, newZ]);
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
    groupRef.current.position.set(newX, finalY, newZ);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);

    // Удаляем если упал слишком низко или далеко, или если скорость очень мала и он на земле
    if (finalY < groundY - 3 || Math.abs(newX) > 8 || Math.abs(newZ) > 8 || 
        (finalY <= groundY && Math.abs(finalVy) < 0.005 && Math.abs(newVx) < 0.01 && Math.abs(newVz) < 0.01)) {
      onRemove();
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
      <mesh ref={groupRef} position={startPosition}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
    );
  }

  return (
    <group ref={groupRef} position={startPosition} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

export default Shoe3D;
