'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { WORKER_AGENTS } from '@/core/config/constants';
import type { AgentCode } from '@/core/domain/codes';
import { AgentCharacter } from './AgentCharacter';
import { BACK_LAYERS, FRONT_LAYERS, type SceneLayer } from './streetLayers';

/** Road speed loop length; slower layers take 24 s ÷ speed (DESIGN.md §5.1). */
const BASE_LOOP_SECONDS = 24;
const PETAL_COUNT = 12;
const PETALS = Array.from({ length: PETAL_COUNT }, (_, index) => index);

interface ParallaxSceneProps {
  /** 1 = normal, 0.25 while the Reviewer has a flag up, 1.6 when plans go out. */
  readonly worldSpeed?: number;
  readonly activeAgent?: AgentCode | null;
  readonly className?: string;
}

function LayerStrip({ layer }: Readonly<{ layer: SceneLayer }>) {
  const { Tile } = layer;
  return (
    <div className="absolute inset-0">
      <div
        className="scene-strip"
        style={{ animationDuration: `${BASE_LOOP_SECONDS / layer.speed}s` }}
      >
        <Tile />
        <Tile />
      </div>
    </div>
  );
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void): () => void {
  const query = globalThis.matchMedia?.(REDUCED_MOTION);
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}

const prefersReducedMotion = () => globalThis.matchMedia?.(REDUCED_MOTION).matches ?? false;

/** The Jacaranda Street: parallax layers, drifting petals and the five agents walking with their signs. */
export function ParallaxScene({
  worldSpeed = 1,
  activeAgent = null,
  className = '',
}: ParallaxSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const prefersStill = useSyncExternalStore(
    subscribeToMotionPreference,
    prefersReducedMotion,
    () => false,
  );
  // The viewer's own click wins; until then, reduced-motion viewers start with a still street.
  const [choice, setChoice] = useState<'play' | 'pause' | null>(null);
  const isPaused = choice === null ? prefersStill : choice === 'pause';

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }
    // Changing playbackRate keeps every layer where it is, so speed changes are smooth.
    for (const animation of scene.getAnimations({ subtree: true })) {
      animation.updatePlaybackRate(worldSpeed);
      if (isPaused) {
        animation.pause();
      } else {
        animation.play();
      }
    }
  }, [worldSpeed, isPaused]);

  return (
    <div
      ref={sceneRef}
      data-motion={isPaused ? 'off' : 'on'}
      className={`scene relative overflow-hidden ${className}`}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-jacaranda-50 via-paper to-blush" />
        <div className="absolute right-[12%] top-[12%] size-16 rounded-full bg-sun/80 sm:size-24" />
        {BACK_LAYERS.map((layer) => (
          <LayerStrip key={layer.id} layer={layer} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[17%] flex items-end justify-center gap-[3vw]">
        {WORKER_AGENTS.map((agent) => (
          <AgentCharacter key={agent.code} agent={agent} isActive={agent.code === activeAgent} />
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {FRONT_LAYERS.map((layer) => (
          <LayerStrip key={layer.id} layer={layer} />
        ))}
        {PETALS.map((index) => (
          <span
            key={index}
            className="petal"
            style={{
              left: `${(index * 97) % 100}%`,
              animationDuration: `${9 + (index % 4) * 2}s`,
              animationDelay: `-${index * 1.4}s`,
            }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setChoice(isPaused ? 'play' : 'pause')}
        className="absolute bottom-2 right-2 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-paper"
      >
        {isPaused ? '▶ Play motion' : '❚❚ Pause motion'}
      </button>
    </div>
  );
}
