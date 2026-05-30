import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Scissors, ShoppingBag, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Group, Mesh } from "three";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

function FashionCard({ position, color, speed, scale = 1 }: { position: [number, number, number]; color: string; speed: number; scale?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * speed) * 0.18;
    ref.current.rotation.y = clock.elapsedTime * (speed * 0.28);
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed) * 0.2;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <boxGeometry args={[1.05, 1.48, 0.06]} />
      <meshStandardMaterial color={color} roughness={0.32} metalness={0.16} />
    </mesh>
  );
}

function FabricRibbon({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * speed) * 0.18;
    ref.current.rotation.y = clock.elapsedTime * 0.12;
  });
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[Math.PI / 2.6, 0, 0.2]}>
        <torusGeometry args={[1.25, 0.025, 14, 120]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0.4, -0.45]} scale={[1.2, 0.7, 1]}>
        <torusGeometry args={[0.75, 0.018, 12, 90]} />
        <meshStandardMaterial color="#ffffff" roughness={0.55} metalness={0.04} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[3, 4, 5]} intensity={2.3} />
      <pointLight position={[-3, -2, 3]} color="#E85D25" intensity={2.2} />
      <FabricRibbon position={[0, -0.25, -0.7]} color="#D7A545" speed={0.85} />
      <FashionCard position={[-1.85, 0.55, 0]} color="#E85D25" speed={0.78} scale={1.04} />
      <FashionCard position={[0, -0.18, -0.25]} color="#111111" speed={0.94} scale={0.92} />
      <FashionCard position={[1.7, 0.48, 0.1]} color="#B9D84F" speed={0.68} scale={0.98} />
    </>
  );
}

export function FashionIntro3D() {
  const [visible, setVisible] = useState(true);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setWebgl(supportsWebGL());
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  const skip = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-[#11100f] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80" alt="Fashion editorial" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(232,93,37,0.32),transparent_28%),linear-gradient(90deg,rgba(17,16,15,0.94),rgba(17,16,15,0.72),rgba(17,16,15,0.92))]" />
          <motion.div className="absolute bottom-8 right-0 whitespace-nowrap text-4xl font-black uppercase tracking-normal text-white/10 md:text-7xl" animate={{ x: ["0%", "18%"] }} transition={{ duration: 3, ease: "linear" }}>
            FASHION + OFFERS + FAMILY STYLE + GHALEB MALL + فساتين + رجالي + ستاتي +
          </motion.div>
          <button aria-label="Skip intro" className="absolute left-5 top-5 z-10 rounded-md bg-white/10 p-3 hover:bg-white/20" onClick={skip}><X /></button>
          <div className="container-page relative grid h-full min-h-[100svh] items-center gap-6 py-8 md:grid-cols-[1.08fr_0.92fr]">
            <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="order-2 max-w-3xl space-y-4 md:order-1 md:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/80">
                <Scissors size={17} /> افتتاحية أزياء قصيرة
              </div>
              <h1 className="text-5xl font-black leading-[0.95] md:text-8xl">غالب مول</h1>
              <p className="text-2xl font-black text-mallGold md:text-4xl">Ghaleb Mall</p>
              <p className="max-w-xl text-lg leading-8 text-white/76">طبقات أزياء، حركة قماش ناعمة، وعرض افتتاحي سريع يكشف تجربة التسوق خلال 3 ثواني.</p>
              <div className="flex flex-wrap gap-2 text-sm font-bold text-white/78">
                <span className="rounded-full bg-white/10 px-3 py-2"><Sparkles size={15} className="inline" /> ستاتي</span>
                <span className="rounded-full bg-white/10 px-3 py-2">رجالي</span>
                <span className="rounded-full bg-white/10 px-3 py-2">فساتين</span>
                <span className="rounded-full bg-white/10 px-3 py-2">عروض</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.92, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8 }} className="order-1 grid h-[42vh] min-h-72 md:order-2 md:h-[620px]">
              <div className="relative">
                <div className="absolute left-4 top-4 h-32 w-24 overflow-hidden rounded-md border border-white/15 md:h-48 md:w-36">
                  <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80" alt="Fashion layer" className="h-full w-full object-cover" />
                </div>
                <div className="absolute bottom-6 right-3 h-32 w-24 overflow-hidden rounded-md border border-white/15 md:h-52 md:w-40">
                  <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80" alt="Dress layer" className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0">
                  {webgl ? <Canvas camera={{ position: [0, 0, 5], fov: 42 }}><Scene /></Canvas> : <img src="/ghaleb-logo-transparent.png" alt="Ghaleb Mall" className="mx-auto h-full object-contain" />}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
