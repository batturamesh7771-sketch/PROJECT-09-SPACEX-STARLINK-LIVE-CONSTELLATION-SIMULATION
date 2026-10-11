"use client";
import React from 'react';
import CesiumGlobe from './CesiumGlobe';
import { Ion } from 'cesium';

// User needs a free Cesium Ion token here.
Ion.defaultAccessToken = 'YOUR_CESIUM_ION_TOKEN';

export default function GlobeWrapper() {
  return (
    <div className="w-full h-full relative">
      <CesiumGlobe />
    </div>
  );
}
