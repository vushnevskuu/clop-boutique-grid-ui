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
    const cloned = scene.clone();
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleValue = maxDim > 0 ? 3.0 / maxDim : 6; // Масштаб для ботинка (увеличен в 6 раз = 3*2)
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
  // Инициализируем позицию и скорость из пропсов
  const [position, setPosition] = useState<[number, number, number]>(startPosition);
  const [currentVelocity, setCurrentVelocity] = useState<[number, number, number]>(velocity);
  
  // Сбрасываем позицию и скорость при изменении пропсов
  useEffect(() => {
    setPosition(startPosition);
    setCurrentVelocity(velocity);
  }, [startPosition, velocity]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [currentAngularVelocity, setCurrentAngularVelocity] = useState<[number, number, number]>(angularVelocity);
  
  const gravity = -0.012;
  const damping = 0.995; // Сопротивление воздуха
  const bounceDamping = 0.3; // Затухание при отскоке (уменьшено для более быстрого затухания)
  const groundY = -2; // Уровень "земли" (за футером, ниже начальной позиции)
  const maxHeight = 10; // Максимальная высота полета (примерно 1000px в 3D пространстве)

  useFrame(() => {
    if (!groupRef.current) return;

    // Обновляем позицию (начинаем с начальной позиции)
    const [vx, vy, vz] = currentVelocity;
    const newX = position[0] + vx;
    const newY = position[1] + vy;
    const newZ = position[2] + vz;
    
    // Убеждаемся, что ботинок не появляется сверху - если Y > 0 и скорость вниз, значит что-то не так
    if (position[1] > 0 && currentVelocity[1] < 0) {
      // Сбрасываем на правильную начальную позицию
      setPosition(startPosition);
      setCurrentVelocity(velocity);
      return;
    }

    // Применяем гравитацию - всегда работает, чтобы ботинок падал
    const newVy = vy + gravity;

    // Проверяем столкновение с "землёй" и максимальную высоту
    let finalY = newY;
    let finalVy = newVy;
    
    // Ограничиваем максимальную высоту только на подъеме
    if (newY > maxHeight && newVy > 0) {
      finalY = maxHeight;
      finalVy = 0; // Останавливаем на вершине
    } else if (newY <= groundY) {
      // Ботинок достиг земли - всегда останавливаем на groundY
      finalY = groundY;
      finalVy = -newVy * bounceDamping; // Отскок с затуханием
      
      // Если скорость очень мала, останавливаем
      if (Math.abs(finalVy) < 0.01) {
        finalVy = 0;
      }
    }
    
    // Гарантируем, что если ботинок выше groundY и скорость вниз, он продолжает падать
    if (finalY > groundY && finalVy > -0.001) {
      // Если скорость почти нулевая, но ботинок еще не на земле, продолжаем применять гравитацию
      finalVy = Math.min(finalVy, gravity * 2); // Усиливаем гравитацию если скорость слишком мала
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
    // Убеждаемся, что ботинок всегда падает за футер (groundY = -5)
    if (finalY <= groundY && (Math.abs(finalVy) < 0.01 && Math.abs(newVx) < 0.02 && Math.abs(newVz) < 0.02)) {
      // Ботинок остановился на земле - удаляем
      onRemove();
    } else if (finalY < groundY - 2 || Math.abs(newX) > 8 || Math.abs(newZ) > 8) {
      // Ботинок упал слишком низко или далеко - удаляем
      onRemove();
    }
  });

  // Применяем начальную позицию при первом рендере
  useEffect(() => {
    if (groupRef.current) {
      // Убеждаемся, что ботинок стартует снизу (startY должен быть отрицательным)
      groupRef.current.position.set(startPosition[0], startPosition[1], startPosition[2]);
      // Убеждаемся, что начальная скорость направлена вверх
      if (velocity[1] <= 0) {
        console.warn('Shoe velocity Y should be positive for upward flight');
      }
    }
  }, [startPosition, velocity]);

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

export default Shoe3D;
