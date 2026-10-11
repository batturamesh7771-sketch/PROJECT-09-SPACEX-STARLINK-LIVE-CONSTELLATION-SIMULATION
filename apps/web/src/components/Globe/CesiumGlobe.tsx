"use client";
import { Viewer, Scene } from 'resium';
import { createWorldTerrainAsync, Cartesian3 } from 'cesium';
import { useEffect, useRef, useState } from 'react';
import SatelliteEntities from './SatelliteEntities';
import OrbitPath from './OrbitPath';
import AuroraOverlay from './AuroraOverlay';
import PlanetaryDefenseOverlay from './PlanetaryDefenseOverlay';
import EarthObsOverlay from './EarthObsOverlay';
import DeepSpaceGroundOverlay from './DeepSpaceGroundOverlay';
import TimeControls from '../Dashboard/TimeControls';
import { useSatelliteStore } from '@/stores/satelliteStore';

const CesiumGlobe = () => {
  const viewerRef = useRef<any>(null);
  const [terrainProvider, setTerrainProvider] = useState<any>(null);
  const { cameraTarget, flyToLocation } = useSatelliteStore();

  useEffect(() => {
    const init = async () => {
      try {
        const terrain = await createWorldTerrainAsync();
        setTerrainProvider(terrain);
      } catch (e) {
        console.warn('Failed to load terrain', e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!cameraTarget || !viewerRef.current?.cesiumElement) return;
    try {
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          cameraTarget.lon,
          cameraTarget.lat,
          cameraTarget.altMeters
        ),
        duration: 2.0,
      });
    } catch (e) {
      console.warn('Camera flyTo failed:', e);
    } finally {
      flyToLocation(null);
    }
  }, [cameraTarget, flyToLocation]);

  return (
    <>
      <Viewer
        ref={viewerRef}
        full
        timeline={true}
        animation={true}
        sceneModePicker={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        geocoder={false}
        infoBox={false}
        selectionIndicator={false}
        terrainProvider={terrainProvider}
      >
        <Scene />
        <SatelliteEntities />
        <OrbitPath />
        <AuroraOverlay />
        <PlanetaryDefenseOverlay />
        <EarthObsOverlay />
        <DeepSpaceGroundOverlay />
      </Viewer>
      <TimeControls />
    </>
  );
};

export default CesiumGlobe;
