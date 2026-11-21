"use client";

import { memo, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { education, experience, featuredProjects as projects, profile, sections, skills, stats, type SectionId } from "@/content/profile";
import { Lamp } from "./Flora";
import { TreehouseStudio } from "./Treehouse";
import { Schoolhouse } from "./Schoolhouse";
import { TOP_Y, along, islands, labelAnchors, palette, steps, views, type Vec3 } from "./layout";

type Focus = SectionId | null;

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Y rotation that turns a +Z-facing plane at `pos` toward the section's camera. */
function facing(pos: Vec3, id: SectionId) {
  const cam = views[id].camera;
  return Math.atan2(cam[0] - pos[0], cam[2] - pos[2]);
}

/* ------------------------------------------------------------------ */
/* Shared wrappers                                                     */
/* ------------------------------------------------------------------ */

function Landmark({ id, focus, onSelect, children }: { id: SectionId; focus: Focus; onSelect: (id: SectionId) => void; children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const meta = sections.find((s) => s.id === id)!;
  const active = focus === id;
  const hidden = focus !== null && !active;

  return (
    <group>
      <group
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        {children}
      </group>
      {!active && (
        <Html position={labelAnchors[id]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <button
            type="button"
            className={`pin${hovered ? " pin--hover" : ""}${hidden ? " pin--dim" : ""}`}
            onClick={() => onSelect(id)}
            tabIndex={-1}
          >
            <span className="pin__label">{meta.label}</span>
            <span className="pin__place">{meta.place}</span>
          </button>
        </Html>
      )}
    </group>
  );
}

/** A signboard that lives in the 3D scene and appears when its section is open. */
function Board({
  id,
  position,
  width = 240,
  scale = 1,
  delay = 0,
  children,
  className = "",
}: {
  id: SectionId;
  position: Vec3;
  width?: number;
  scale?: number;
  delay?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Html
      transform
      position={position}
      rotation={[0, facing(position, id), 0]}
      distanceFactor={4 * scale}
      zIndexRange={[30, 10]}
    >
      <div className={`board ${className}`} style={{ width, animationDelay: `${delay}ms` }}>
        {children}
      </div>
    </Html>
  );
}

function Post({ height = 1.6 }: { height?: number }) {
  return (
    <mesh position={[0, height / 2, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.06, height, 6]} />
      <meshStandardMaterial color={palette.goldDeep} metalness={0.4} roughness={0.5} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* About: a big shade tree and treehouse; the developer codes beneath */
/* ------------------------------------------------------------------ */

function SkyHall({ active }: { active: boolean }) {
  const base = add(islands.hall.position, [0, TOP_Y, 0]);
  return (
    <group position={base}>
      <TreehouseStudio active={active} rotation={facing(base, "about")} />
    </group>
  );
}

function AboutBoards() {
  const c = islands.hall.position;
  return (
    <>
      {stats.map((s, i) => (
        <Board key={i} id="about" position={along("about", c, 4.6, (i - 1) * 2.5, 0.9)} width={190} delay={150 + i * 120} className="board--stat">
          <strong>{s.big}</strong>
          <span>{s.small}</span>
        </Board>
      ))}
      <Board id="about" position={along("about", c, 4.2, -3.4, 3.6)} width={250} delay={520} className="board--stone">
        <span>{profile.focus.join(" · ")}</span>
        <em>Practical architecture, stable delivery.</em>
      </Board>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Origin: a red-brick campus schoolhouse, for university in Mandalay */
/* ------------------------------------------------------------------ */

function Campus({ active }: { active: boolean }) {
  const base = add(islands.origin.position, [0, TOP_Y, 0]);
  return (
    <group position={base}>
      <Schoolhouse active={active} rotation={facing(base, "origin")} />
    </group>
  );
}

function OriginBoards() {
  const c = islands.origin.position;
  return (
    <>
      <Board id="origin" position={along("origin", c, 2.2, 2.7, 3.5)} width={250} delay={150} className="board--plaque">
        <small>{education.period}</small>
        <strong>{education.degree}</strong>
        <span>{education.school}</span>
      </Board>
      <Board id="origin" position={along("origin", c, 2.6, -1.9, 1.2)} width={170} delay={330} className="board--stone">
        <span>Mandalay, Myanmar</span>
        <em>where it started</em>
      </Board>
      <Board id="origin" position={along("origin", c, 2.4, -1.7, 2.6)} width={190} delay={480} className="board--stone">
        <span>{profile.languages.map((l) => l.name).join(" · ")}</span>
        <em>languages</em>
      </Board>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Experience: a banner on each cloud step, a gate on the top one     */
/* ------------------------------------------------------------------ */

const bannerColors = ["#9fb6d9", "#a8c98f", "#e7b38f", "#c7a6dd", palette.gold];

function Banner({ color, phase }: { color: string; phase: number }) {
  const cloth = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(clock.elapsedTime * 1.6 + phase) * 0.25;
  });
  return (
    <group>
      <Post height={2} />
      <mesh ref={cloth} position={[0.32, 1.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Gate() {
  return (
    <group>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 2.4, 10]} />
          <meshStandardMaterial color={palette.marble} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.9, 0.12, 8, 24, Math.PI]} />
        <meshStandardMaterial color={palette.gold} metalness={0.6} roughness={0.3} emissive={palette.gold} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Steps() {
  return (
    <group>
      {steps.map((s, i) => {
        const top = add(s, [0, TOP_Y, 0]);
        const last = i === steps.length - 1;
        const rot = facing(s, "experience");
        return (
          <group key={i} position={top} rotation={[0, rot, 0]}>
            {last ? (
              <Gate />
            ) : (
              <group position={[-0.7, 0, -0.2]}>
                <Banner color={bannerColors[i]} phase={i} />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

function ExperienceBoards() {
  // experience[] is newest first; steps[] are oldest first.
  const ordered = [...experience].reverse();
  return (
    <>
      {steps.map((s, i) => {
        const job = ordered[i];
        return (
          <Board key={job.company} id="experience" position={along("experience", s, 0.4, 0, 2.3)} width={200} scale={1.5} delay={100 + i * 110} className={`board--step${i === steps.length - 1 ? " board--now" : ""}`}>
            <small>{job.period}</small>
            <strong>{job.company}</strong>
            <span>{job.role}</span>
          </Board>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Skills: an observatory with skill crystals in orbit                */
/* ------------------------------------------------------------------ */

const crystalColors = ["#7fc8f8", "#f6c453", "#f49cbb", "#9be39b", "#c7a6dd", "#ffb48a", "#8fd6c8", "#f7d38a"];

function Observatory({ active }: { active: boolean }) {
  const orbit = useRef<THREE.Group>(null);
  const scope = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (orbit.current) orbit.current.rotation.y += dt * (active ? 0.25 : 0.5);
    if (scope.current) scope.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.8;
  });
  const c = add(islands.skills.position, [0, TOP_Y, 0]);
  return (
    <group position={c}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.3, 32]} />
        <meshStandardMaterial color={palette.marble} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.95, 1.1, 2.6, 24]} />
        <meshStandardMaterial color={palette.marble} roughness={0.6} />
      </mesh>
      {[0.9, 1.9].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[1.04, 0.04, 6, 32]} />
          <meshStandardMaterial color={palette.gold} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.4, 1.02]}>
        <planeGeometry args={[0.45, 0.8]} />
        <meshStandardMaterial color={palette.window} emissive={palette.window} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 2.9, 0]} castShadow>
        <sphereGeometry args={[1.05, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={palette.roof} roughness={0.4} metalness={0.2} />
      </mesh>
      <group ref={scope} position={[0, 3.5, 0]}>
        <mesh rotation={[0, 0, -0.7]} position={[0.45, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.2, 1.3, 12]} />
          <meshStandardMaterial color={palette.gold} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      <group ref={orbit} position={[0, 4.6, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6, 0.025, 4, 64]} />
          <meshStandardMaterial color={palette.gold} emissive={palette.gold} emissiveIntensity={0.5} />
        </mesh>
        {skills.map((g, i) => {
          const a = (i / skills.length) * Math.PI * 2;
          return (
            <group key={g.group} position={[Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6]}>
              <mesh castShadow>
                <octahedronGeometry args={[0.26, 0]} />
                <meshStandardMaterial color={crystalColors[i]} emissive={crystalColors[i]} emissiveIntensity={0.6} flatShading />
              </mesh>
              {active && (
                <Html center position={[0, 0.62, 0]} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
                  <span className="crystal-tag" style={{ borderColor: crystalColors[i] }}>
                    {g.group}
                  </span>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
}

function SkillBoards() {
  const c = islands.skills.position;
  return (
    <Board id="skills" position={along("skills", c, 3, 1.9, 2.1)} width={250} delay={200} className="board--list">
      {skills.map((g, i) => (
        <div key={g.group} className="board__row">
          <i style={{ background: crystalColors[i] }} />
          <b>{g.group}</b>
          <span>{g.items.slice(0, 3).join(" · ")}</span>
        </div>
      ))}
    </Board>
  );
}

/* ------------------------------------------------------------------ */
/* Projects: a gallery of floating screens                            */
/* ------------------------------------------------------------------ */

const screenColors = ["#7fc8f8", "#f49cbb", "#f6c453", "#9be39b", "#c7a6dd", "#ffb48a"];

function galleryLayout() {
  const c = islands.projects.position;
  const rot = facing(c, "projects");
  // Two rows of three screens, squarely facing the projects camera.
  return projects.map((_, i) => {
    const col = (i % 3) - 1;
    const row = Math.floor(i / 3);
    const pos = along("projects", c, 1.5 - Math.abs(col) * 0.5, col * 1.75, TOP_Y + 2.75 - row * 1.18);
    return { pos, rot: rot - col * 0.22, phase: i * 0.9 };
  });
}

function Gallery({ active }: { active: boolean }) {
  const layout = useMemo(galleryLayout, []);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    group.current?.children.forEach((ch, i) => {
      ch.position.y = layout[i].pos[1] + Math.sin(clock.elapsedTime * 0.9 + layout[i].phase) * 0.12;
    });
  });
  const c = add(islands.projects.position, [0, TOP_Y, 0]);
  return (
    <group>
      <group position={c}>
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[1.4, 1.6, 0.4, 32]} />
          <meshStandardMaterial color={palette.marble} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.45, 0.7, 16]} />
          <meshStandardMaterial color={palette.gold} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <icosahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial color="#e9f6ff" emissive="#a8dcff" emissiveIntensity={1.4} flatShading />
        </mesh>
      </group>
      <group ref={group}>
        {layout.map((l, i) => (
          <group key={i} position={l.pos} rotation={[0, l.rot, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 1, 0.08]} />
              <meshStandardMaterial color={palette.marble} />
            </mesh>
            <mesh position={[0, 0, 0.045]}>
              <planeGeometry args={[1.36, 0.86]} />
              <meshStandardMaterial color={screenColors[i]} emissive={screenColors[i]} emissiveIntensity={active ? 0.25 : 0.7} />
            </mesh>
            {active && (
              <Html transform position={[0, 0, 0.06]} distanceFactor={3.6} zIndexRange={[30, 10]}>
                <div className="screen" style={{ animationDelay: `${120 + i * 90}ms` }}>
                  <strong>{projects[i].name}</strong>
                  <span>{projects[i].metric ?? projects[i].role}</span>
                </div>
              </Html>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Contact: a balloon dock, a mailbox and a paper plane               */
/* ------------------------------------------------------------------ */

function Balloon() {
  const ref = useRef<THREE.Group>(null);
  const envelope = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const r = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 1.2 * (0.35 + 0.65 * t) + 0.18 * (1 - t);
      pts.push(new THREE.Vector2(Math.max(0.01, r), t * 2.6));
    }
    pts.push(new THREE.Vector2(0, 2.65));
    return new THREE.LatheGeometry(pts, 16);
  }, []);
  const stripes = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 4;
    const ctx = c.getContext("2d")!;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? "#ffffff" : "#f49cbb";
      ctx.fillRect(i * 8, 0, 8, 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.position.y = 4.1 + Math.sin(clock.elapsedTime * 0.8) * 0.25;
    g.rotation.y = clock.elapsedTime * 0.1;
  });
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.2, 20]} />
        <meshStandardMaterial color={palette.plank} flatShading />
      </mesh>
      <group ref={ref}>
        <mesh position={[0, -1.3, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.26, 0.42, 10]} />
          <meshStandardMaterial color={palette.plank} flatShading />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.28, -0.6, Math.sin(a) * 0.28]}>
              <cylinderGeometry args={[0.012, 0.012, 1.05, 3]} />
              <meshStandardMaterial color={palette.rope} />
            </mesh>
          );
        })}
        <mesh geometry={envelope} position={[0, -0.15, 0]} castShadow>
          <meshStandardMaterial map={stripes} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function PaperPlane() {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0.35, 0, 0, -0.25, 0, 0.22, -0.15, 0.02, 0, 0.35, 0, 0, -0.15, 0.02, 0, -0.25, 0, -0.22, 0.35, 0, 0, -0.15, 0.02, 0, -0.2, -0.1, 0], 3)
    );
    g.computeVertexNormals();
    return g;
  }, []);
  const c = islands.contact.position;
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const a = clock.elapsedTime * 0.5;
    g.position.set(c[0] + Math.cos(a) * 3.6, c[1] + 2.6 + Math.sin(a * 2) * 0.4, c[2] + Math.sin(a) * 3.6);
    g.rotation.set(0, -(a + Math.PI / 2), Math.sin(a * 2) * 0.25);
  });
  return (
    <group ref={ref}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} flatShading />
      </mesh>
    </group>
  );
}

function ContactDock() {
  const c = add(islands.contact.position, [0, TOP_Y, 0]);
  return (
    <group>
      <group position={c}>
        <Balloon />
        <group position={[1.4, 0, 0.9]} rotation={[0, facing(islands.contact.position, "contact"), 0]}>
          <Post height={1} />
          <mesh position={[0, 1.12, 0]} castShadow>
            <boxGeometry args={[0.42, 0.34, 0.6]} />
            <meshStandardMaterial color={palette.roof} />
          </mesh>
          <mesh position={[0.24, 1.25, 0.1]}>
            <boxGeometry args={[0.04, 0.3, 0.08]} />
            <meshStandardMaterial color="#e2673f" />
          </mesh>
        </group>
      </group>
      <PaperPlane />
    </group>
  );
}

function ContactBoards() {
  const c = islands.contact.position;
  return (
    <Board id="contact" position={along("contact", c, 2.2, 1.9, 2.9)} width={250} delay={200} className="board--plaque board--contact">
      <small>Say hello</small>
      <a href={`mailto:${profile.email}`}>{profile.email}</a>
      <div className="board__links">
        {profile.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
        ))}
      </div>
    </Board>
  );
}

/* ------------------------------------------------------------------ */

export const Landmarks = memo(function Landmarks({ focus, onSelect }: { focus: Focus; onSelect: (id: SectionId) => void }) {
  return (
    <group>
      <Landmark id="about" focus={focus} onSelect={onSelect}>
        <SkyHall active={focus === "about"} />
      </Landmark>
      <Landmark id="origin" focus={focus} onSelect={onSelect}>
        <Campus active={focus === "origin"} />
      </Landmark>
      <Landmark id="experience" focus={focus} onSelect={onSelect}>
        <Steps />
      </Landmark>
      <Landmark id="skills" focus={focus} onSelect={onSelect}>
        <Observatory active={focus === "skills"} />
      </Landmark>
      <Landmark id="projects" focus={focus} onSelect={onSelect}>
        <Gallery active={focus === "projects"} />
      </Landmark>
      <Landmark id="contact" focus={focus} onSelect={onSelect}>
        <ContactDock />
      </Landmark>

      {focus === "about" && <AboutBoards />}
      {focus === "origin" && <OriginBoards />}
      {focus === "experience" && <ExperienceBoards />}
      {focus === "skills" && <SkillBoards />}
      {focus === "contact" && <ContactBoards />}
    </group>
  );
});
