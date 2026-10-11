"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as satellite from 'satellite.js';

export interface SatelliteRecord {
  instanceId: number;
  noradId: number;
  name: string;
  designator?: string;
  constellation?: string;
  hardwareVersion?: string;
  line1: string;
  line2: string;
  satrec?: satellite.SatRec;
  altitude?: number;
  velocity?: number;
}

interface InstancedSatelliteSwarmProps {
  /** Master TLE array in the exact same order as Web Worker instances */
  satData: SatelliteRecord[];
  /** Web Worker Float32Array of XYZ coordinates (length = satData.length * 3) */
  workerPositions: Float32Array;
  /** External state setter if parent renders the 2D sidebar outside <Canvas> */
  onSelectSatellite?: (sat: SatelliteRecord | null) => void;
}

/**
 * R3F InstancedMesh with Bulletproof Raycasting Hitbox & Global Deselect
 */
export const InstancedSatelliteSwarm: React.FC<InstancedSatelliteSwarmProps> = ({
  satData,
  workerPositions,
  onSelectSatellite,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteRecord | null>(null);

  const { raycaster } = useThree();
  const count = satData.length;

  // Step 1: Fix the Tiny Geometry Problem (The Hitbox)
  // Pre-compute bounding sphere & bounding box in useMemo so Three.js never misses the raycast
  const hitGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.08, 10, 10);
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    return geo;
  }, []);

  const hitMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#38bdf8' });
  }, []);

  useEffect(() => {
    if (raycaster.params.Mesh) {
      raycaster.params.Mesh.threshold = 0.5;
    } else {
      raycaster.params.Mesh = { threshold: 0.5 };
    }
    if (meshRef.current) {
      meshRef.current.geometry.computeBoundingSphere();
      meshRef.current. geometry.computeBoundingBox();
      meshRef.current.computeBoundingSphere();
    }
  }, [raycaster, hitGeometry]);

  // Keep instance matrices synced with Web Worker positions and update top-level bounding sphere
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || workerPositions.length < count * 3) return;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      dummy.position.set(
        workerPositions[idx],
        workerPositions[idx + 1],
        workerPositions[idx + 2]
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  });

  const updateSelection = (sat: SatelliteRecord | null) => {
    setSelectedSatellite(sat);
    onSelectSatellite?.(sat);
  };

  return (
    <group>
      {/* Step 2 & Step 3: Bulletproof Event Handler + Global Deselect onPointerMissed */}
      <instancedMesh
        ref={meshRef}
        args={[hitGeometry, hitMaterial, count]}
        frustumCulled={false}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          // 1. MUST stop propagation so the Earth behind it doesn't trigger a deselect
          e.stopPropagation();

          // 2. Ensure we actually hit an instance
          if (e.instanceId === undefined) return;

          // 3. Look up the exact satellite in `satData[e.instanceId]`
          const clickedSat = satData[e.instanceId];

          if (clickedSat) {
            console.log("🎯 HIT:", clickedSat.name, "NORAD:", clickedSat.noradId);
            updateSelection(clickedSat);
          }
        }}
        onPointerMissed={() => {
          // Step 3: Global Deselect when clicking empty space
          updateSelection(null);
        }}
      />
    </group>
  );
};

/**
 * Step 4: The 2D UI Overlay (satellitemap.space Left Slide-Out Sidebar)
 * Render outside <Canvas> in the main React tree.
 */
export const SatelliteSidebarOverlay: React.FC<{
  selectedSatellite: SatelliteRecord | null;
  setSelectedSatellite: (sat: SatelliteRecord | null) => void;
}> = ({ selectedSatellite, setSelectedSatellite }) => {
  if (!selectedSatellite) return null;

  return (
    <aside
      style={{
        position: 'fixed',
        top: '58px',
        left: '14px',
        width: '320px',
        background: 'rgba(10, 14, 23, 0.96)',
        border: '1px solid rgba(148, 163, 184, 0.22)',
        borderRadius: '8px',
        padding: '16px',
        color: '#e2e8f0',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
        zIndex: 1200,
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header with Satellite Name & Close "X" Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '14px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
          {selectedSatellite.name}
        </h2>
        <button
          onClick={() => setSelectedSatellite(null)}
          aria-label="Close panel"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Metadata Rows: NORAD ID, International Designator, Constellation */}
      <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>NORAD ID:</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>{selectedSatellite.noradId} ↗</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>International Designator:</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>
            {selectedSatellite.designator || '2023-046'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Constellation:</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>
            {selectedSatellite.constellation || 'starlink'} ↗
          </span>
        </div>
      </div>

      {/* Orbit Badges */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', marginBottom: '14px' }}>
        <span
          style={{
            background: '#1d4ed8',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '999px',
          }}
        >
          LEO
        </span>
        <span
          style={{
            background: '#1d4ed8',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '999px',
          }}
        >
          CIRCULAR
        </span>
      </div>

      {/* Collapsible Sections matching satellitemap.space */}
      {['Orbital Elements (at latest TLE)', 'Current Position', 'Hardware', 'Pictures', 'Launch'].map(
        (section) => (
          <div
            key={section}
            style={{
              background: 'rgba(30, 41, 59, 0.55)',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{section}</span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>⌄</span>
          </div>
        )
      )}
    </aside>
  );
};

export default InstancedSatelliteSwarm;
