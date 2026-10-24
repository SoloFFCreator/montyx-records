import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

const networkNodes = [
  [1.65, 0.05, 0.04],
  [-1.55, 0.7, 0.16],
  [-0.25, 1.8, -0.1],
  [0.75, -1.6, 0.08],
  [-1.65, -0.9, -0.08],
  [1.55, 1.12, 0.12],
] as const;

function SignalDisc() {
  const disc = useRef<Group>(null);
  const orbit = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (disc.current) disc.current.rotation.z = clock.elapsedTime * 0.1;
    if (orbit.current) orbit.current.rotation.z = -clock.elapsedTime * 0.055;
  });

  return (
    <group>
      <group ref={disc}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.075, 96]} />
          <meshStandardMaterial
            color="#111217"
            metalness={0.72}
            roughness={0.3}
          />
        </mesh>
        {[0.37, 0.52, 0.66, 0.74].map(radius => (
          <mesh key={radius} position={[0, 0, 0.043]}>
            <torusGeometry args={[radius, 0.006, 6, 72]} />
            <meshStandardMaterial
              color={radius === 0.74 ? "#8b2532" : "#38343a"}
              metalness={0.52}
              roughness={0.38}
            />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.062]}>
          <cylinderGeometry args={[0.2, 0.2, 0.035, 48]} />
          <meshStandardMaterial
            color="#e11d35"
            emissive="#5b0714"
            emissiveIntensity={0.45}
            metalness={0.4}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[0, 0, 0.084]}>
          <circleGeometry args={[0.035, 24]} />
          <meshBasicMaterial color="#f4ece9" />
        </mesh>
      </group>

      <group ref={orbit}>
        <mesh rotation={[0.53, 0.24, -0.2]}>
          <torusGeometry args={[1.32, 0.008, 6, 120]} />
          <meshBasicMaterial color="#bd3445" transparent opacity={0.76} />
        </mesh>
        <mesh rotation={[-0.63, 0.8, 0.52]}>
          <torusGeometry args={[1.62, 0.006, 6, 120]} />
          <meshBasicMaterial color="#d8c7c4" transparent opacity={0.56} />
        </mesh>
        {networkNodes.map(([x, y, z], index) => (
          <mesh key={index} position={[x, y, z]}>
            <sphereGeometry args={[index % 2 === 0 ? 0.042 : 0.031, 12, 12]} />
            <meshBasicMaterial
              color={index % 3 === 0 ? "#f2e7e5" : "#e11d35"}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function SignalOrbit() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let supportsWebGL = false;
    try {
      const probe = document.createElement("canvas");
      supportsWebGL = Boolean(
        probe.getContext("webgl2") || probe.getContext("webgl")
      );
    } catch {
      supportsWebGL = false;
    }
    if (!supportsWebGL) return;

    setEnabled(true);
    const element = visualRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const inView = entries.some(entry => entry.isIntersecting);
        setVisible(inView);
        if (inView) setStarted(true);
      },
      { threshold: 0.12 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="signal-orbit" ref={visualRef} aria-hidden="true">
      <div className="signal-orbit__static">
        <span className="signal-orbit__ring signal-orbit__ring--one" />
        <span className="signal-orbit__ring signal-orbit__ring--two" />
        <span className="signal-orbit__disc">
          <span />
        </span>
        <span className="signal-orbit__node signal-orbit__node--one" />
        <span className="signal-orbit__node signal-orbit__node--two" />
        <span className="signal-orbit__node signal-orbit__node--three" />
      </div>
      {enabled && started && (
        <Canvas
          className="signal-orbit__canvas"
          camera={{ position: [0, 0, 5], fov: 39 }}
          dpr={[1, 1.3]}
          frameloop={visible ? "always" : "never"}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        >
          <ambientLight intensity={0.8} />
          <pointLight position={[3, 3, 4]} intensity={22} color="#f9d7d7" />
          <pointLight position={[-3, -2, 3]} intensity={10} color="#d91f3b" />
          <SignalDisc />
        </Canvas>
      )}
    </div>
  );
}
