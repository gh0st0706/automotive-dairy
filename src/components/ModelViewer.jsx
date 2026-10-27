import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { Icon } from "./UI";

function CarModel({ url, wireframe, onReady }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    onReady(true);
  }, [onReady]);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    // The supplied reference models use opposite forward axes.
    if (/ignis/i.test(url)) copy.rotation.y += Math.PI;
    // The source Maruti asset includes a large presentation plane. Exclude it
    // from this instance so camera fitting measures the car, not that backdrop.
    const backdrop = copy.getObjectByName("Plane");
    if (backdrop) backdrop.removeFromParent();
    copy.traverse((object) => {
      if (object.isMesh) {
        object.material = Array.isArray(object.material)
          ? object.material.map((m) => m.clone())
          : object.material.clone();
      }
    });
    const box = new THREE.Box3().setFromObject(copy);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 7.4 / Math.max(size.x, size.y, size.z);
    return {
      copy,
      scale,
      position: [-center.x, -box.min.y - 1.05 / scale, -center.z],
    };
  }, [scene, url]);
  useEffect(() => {
    model.copy.traverse((object) => {
      if (object.isMesh)
        for (const material of [object.material].flat())
          material.wireframe = wireframe;
    });
  }, [model, wireframe]);
  useEffect(
    () => () => {
      model.copy.traverse((object) => {
        if (object.isMesh)
          for (const material of [object.material].flat()) material.dispose();
      });
    },
    [model],
  );
  return (
    <group scale={model.scale}>
      <primitive object={model.copy} position={model.position} />
    </group>
  );
}

function CameraRig({ view, revision, rotate }) {
  const controls = useRef();
  const { camera, invalidate, size } = useThree();
  useEffect(() => {
    camera.position.set(
      ...{
        perspective: [7.5, 3.4, -7.5],
        side: [12, 1.2, 0],
        front: [0, 1.2, -12],
        top: [0, 15, 0.01],
      }[view],
    );
    camera.position.multiplyScalar(
      Math.max(1, 1.85 / (size.width / size.height)),
    );
    camera.up.set(0, 1, 0);
    controls.current?.target.set(0, 0.65, 0);
    controls.current?.update();
    invalidate();
  }, [view, revision, camera, invalidate, size.width, size.height]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      autoRotate={rotate}
      autoRotateSpeed={0.65}
      minDistance={5}
      maxDistance={23}
      maxPolarAngle={Math.PI / 2 + 0.03}
      target={[0, 0.65, 0]}
    />
  );
}

class ViewerBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="viewer-fallback">
        <Icon name="cube" size={32} />
        <strong>3D view unavailable</strong>
        <p>The model could not load or WebGL is unavailable.</p>
        <button className="secondary-button" onClick={this.props.retry}>
          Retry viewer
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function ModelViewer({ url }) {
  const [view, setView] = useState("perspective");
  const [wireframe, setWireframe] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [revision, setRevision] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const modelUrl = `${import.meta.env.BASE_URL}${(url || "").replace(/^\/+/, "")}`;
  return (
    <div className="model-viewer" data-ready={ready}>
      <div
        className="viewer-canvas"
        role="img"
        aria-label="Interactive 3D vehicle model"
      >
        <ViewerBoundary
          key={attempt}
          retry={() => {
            useGLTF.clear(modelUrl);
            setAttempt((a) => a + 1);
          }}
        >
          <Canvas
            frameloop={rotate ? "always" : "demand"}
            dpr={[1, 1.5]}
            camera={{
              position: [7.5, 3.4, -7.5],
              fov: 30,
              near: 0.1,
              far: 100,
            }}
            gl={{ antialias: true, alpha: true }}
            fallback={
              <div className="viewer-fallback">
                WebGL is unavailable. Your engineering records are still
                accessible.
              </div>
            }
          >
            <ambientLight intensity={0.8} />
            <hemisphereLight args={["#d9e4ff", "#686050", 1.7]} />
            <directionalLight position={[4, 8, 5]} intensity={2.6} />
            <directionalLight position={[-5, 3, -4]} intensity={2} />
            <Suspense
              fallback={
                <Html center>
                  <div className="model-loading">
                    <span />
                  </div>
                </Html>
              }
            >
              <CarModel
                url={modelUrl}
                wireframe={wireframe}
                onReady={setReady}
              />
              <Environment resolution={128} frames={1}>
                <Lightformer
                  intensity={3}
                  position={[0, 5, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[10, 10, 1]}
                />
                <Lightformer
                  intensity={2}
                  position={[-5, 2, 0]}
                  rotation={[0, Math.PI / 2, 0]}
                  scale={[5, 4, 1]}
                />
              </Environment>
              <ContactShadows
                position={[0, -1.07, 0]}
                opacity={0.5}
                scale={15}
                blur={2.5}
                far={5}
                resolution={256}
                frames={1}
              />
            </Suspense>
            <gridHelper
              args={[24, 24, "#465440", "#34412f"]}
              position={[0, -1.09, 0]}
            />
            <CameraRig view={view} revision={revision} rotate={rotate} />
          </Canvas>
        </ViewerBoundary>
      </div>
      <div className="viewer-toolbar">
        <div className="view-presets">
          {[
            ["perspective", "3D"],
            ["side", "Side"],
            ["front", "Front"],
            ["top", "Top"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={view === id}
              className={view === id ? "selected" : ""}
              onClick={() => {
                setView(id);
                setRotate(false);
                setRevision((r) => r + 1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="viewer-tools">
          <button
            className={wireframe ? "selected" : ""}
            aria-label="Toggle wireframe"
            aria-pressed={wireframe}
            title="Wireframe"
            onClick={() => setWireframe((w) => !w)}
          >
            <Icon name="cube" size={17} />
          </button>
          <button
            className={rotate ? "selected" : ""}
            aria-label={rotate ? "Pause rotation" : "Rotate model"}
            aria-pressed={rotate}
            title="Auto rotate"
            onClick={() => setRotate((r) => !r)}
          >
            <Icon name={rotate ? "pause" : "play"} size={16} />
          </button>
          <button
            aria-label="Reset camera"
            title="Reset camera"
            onClick={() => {
              setView("perspective");
              setRotate(false);
              setRevision((r) => r + 1);
            }}
          >
            <Icon name="reset" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
