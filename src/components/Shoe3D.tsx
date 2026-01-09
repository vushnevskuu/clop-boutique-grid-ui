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
  
  const gravity = -0.01; // Гравитация для дугообразной траектории (применяется к Y)
  const damping = 0.998; // Сопротивление воздуха (немного увеличено для более плавной дуги)
  const bounceDamping = 0.2; // Затухание при отскоке (уменьшено, чтобы ботинок исчезал в футере)
  const groundY = -1; // Уровень "земли" = -1 (футер, точка исчезновения) - по оси Y
  const maxHeight = 10; // Максимальная высота полета = 10 единиц (примерно 1000px, 1 единица = 100px) - по оси Y

  useFrame(() => {
    if (!groupRef.current) return;

    // Обновляем позицию напрямую из текущей позиции группы
    // X = горизонтальная ось (влево-вправо)
    // Y = вертикальная ось (скролл страницы, вверх-вниз) - ЭТО ОСЬ ДВИЖЕНИЯ
    // Z = ось глубины (ближе-дальше от камеры)
    const currentPos = groupRef.current.position;
    const [vx, vy, vz] = currentVelocity;
    
    // Вычисляем новую позицию
    const newX = currentPos.x + vx; // X - горизонталь
    const newY = currentPos.y + vy; // Y - вертикаль (скролл) - ОСЬ ДВИЖЕНИЯ
    const newZ = currentPos.z + vz; // Z - глубина

    // Применяем гравитацию к оси Y - всегда работает, чтобы ботинок падал
    const newVy = vy + gravity;

    // Проверяем столкновение с "землёй" и максимальную высоту по оси Y
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

    // Обновляем скорость с затуханием
    const newVx = vx * damping;
    const newVz = vz * damping;

    // Обновляем состояние для логики удаления
    setPosition([newX, finalY, newZ]);
    setCurrentVelocity([newVx, finalVy, newVz]);

    // Обновляем вращение
    const [rx, ry, rz] = rotation;
    const [avx, avy, avz] = currentAngularVelocity;
    const newRotation: [number, number, number] = [rx + avx, ry + avy, rz + avz];
    setRotation(newRotation);
    
    // Затухание угловой скорости
    setCurrentAngularVelocity([
      avx * damping,
      avy * damping,
      avz * damping
    ]);

    // ПРИМЕНЯЕМ К ГРУППЕ НЕМЕДЛЕННО: X (горизонталь), Y (вертикаль/скролл - ОСЬ ДВИЖЕНИЯ), Z (глубина)
    groupRef.current.position.set(newX, finalY, newZ);
    groupRef.current.rotation.set(newRotation[0], newRotation[1], newRotation[2]);

    // Удаляем если вернулся к Y = 0 (футер) или упал слишком низко/далеко
    if (finalY <= groundY && (Math.abs(finalVy) < 0.01 && Math.abs(newVx) < 0.02 && Math.abs(newVz) < 0.02)) {
      // Ботинок остановился на Y = 0 (футер) - удаляем
      onRemove();
    } else if (finalY < groundY - 2 || Math.abs(newX) > 5 || Math.abs(newZ) > 5) {
      // Ботинок упал слишком низко или далеко - удаляем
      onRemove();
    }
  });

  // Применяем начальную позицию при первом рендере
  useEffect(() => {
    if (groupRef.current) {
      // Убеждаемся, что ботинок стартует ИЗ-ПОД футера (Y = -1)
      // X (горизонталь), Y (вертикаль/скролл - ОСЬ ДВИЖЕНИЯ), Z (глубина)
      groupRef.current.position.set(startPosition[0], startPosition[1], startPosition[2]);
      // Убеждаемся, что начальная скорость направлена ВВЕРХ по Y
      if (velocity[1] <= 0) {
        console.warn('Shoe velocity Y should be positive for upward flight, got:', velocity[1]);
      } else {
        console.log('Shoe created at Y=', startPosition[1], 'with velocity Y=', velocity[1]);
      }
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

export default Shoe3D;
