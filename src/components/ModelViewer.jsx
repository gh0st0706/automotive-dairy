import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function CarModel({ url }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);

    scene.position.sub(center);
    scene.position.y += size.y * 0.05;

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    scene.scale.setScalar(8 / maxDimension);
  }, [scene]);

  return (
    <primitive
      object={scene}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

export default function ModelViewer({ url }) {
  return (
    <div className="model-viewer">
      <Canvas camera={{ position: [0, 3, 10], fov: 35, near: 0.1, far: 1000 }}>
        <color attach="background" args={['#dcdcdc']} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 3, 3]} intensity={1.6} />
        <Suspense fallback={null}>
          <CarModel url={url} />
        </Suspense>
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={1.5}
          maxDistance={24}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </div>
  );
}
