import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Shoe3DProps {
  startPosition: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  onRemove: () => void;
}

const Shoe3D = ({ startPosition, velocity, angularVelocity, onRemove }: Shoe3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState<[number, number, number]>(startPosition);
  const [currentVelocity, setCurrentVelocity] = useState<[number, number, number]>(velocity);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [currentAngularVelocity, setCurrentAngularVelocity] = useState<[number, number, number]>(angularVelocity);
  
  const gravity = -0.012;
  const damping = 0.995; // Сопротивление воздуха
  const bounceDamping = 0.5; // Затухание при отскоке
  const groundY = -4; // Уровень "земли" (за футером, ниже)
  const maxHeight = 4; // Максимальная высота полета (примерно 600px)

  useFrame(() => {
    if (!meshRef.current) return;

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

    // Применяем к мешу
    meshRef.current.position.set(newX, finalY, newZ);
    meshRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);

    // Удаляем если упал слишком низко или далеко, или если скорость очень мала и он на земле
    if (finalY < groundY - 3 || Math.abs(newX) > 8 || Math.abs(newZ) > 8 || 
        (finalY <= groundY && Math.abs(finalVy) < 0.005 && Math.abs(newVx) < 0.01 && Math.abs(newVz) < 0.01)) {
      onRemove();
    }
  });

  return (
    <mesh ref={meshRef} position={startPosition}>
      {/* Создаём простую модель ботинка из нескольких box геометрий */}
      <group>
        {/* Подошва */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.8, 0.1, 0.4]} />
          <meshStandardMaterial color="#2c2c2c" />
        </mesh>
        {/* Основная часть */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.4, 0.35]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        {/* Носок */}
        <mesh position={[0.25, 0.05, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.3]} />
          <meshStandardMaterial color="#2c2c2c" />
        </mesh>
        {/* Пятка */}
        <mesh position={[-0.25, 0.1, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.3]} />
          <meshStandardMaterial color="#2c2c2c" />
        </mesh>
        {/* Шнурки (декоративные линии) */}
        <mesh position={[0, 0.15, 0.18]}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </mesh>
  );
};

export default Shoe3D;
