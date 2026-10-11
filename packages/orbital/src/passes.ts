import * as satellite from 'satellite.js';
import { TLE, ObserverLocation, PassPrediction } from '@cosmos/types';
import { propagate } from './propagator';
import { lookAngle } from './coordinates';

export function predictPasses(
  tle: TLE,
  observer: ObserverLocation,
  startDate: Date,
  days: number,
  minElevation: number
): PassPrediction[] {
  const passes: PassPrediction[] = [];
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  
  let t = startDate.getTime();
  const stepCoarse = 30 * 1000; // 30 seconds
  const stepFine = 1 * 1000;    // 1 second

  let currentPass: Partial<PassPrediction> | null = null;

  while (t <= endDate.getTime()) {
    const date = new Date(t);
    try {
      const state = propagate(tle, date);
      const gmst = satellite.gstime(date);
      const look = lookAngle(observer, state.position, gmst);

      if (look.elevation >= minElevation) {
        if (!currentPass) {
          // Found potential AOS, backtrack to refine
          let refineT = t - stepCoarse;
          while (refineT < t) {
            const rDate = new Date(refineT);
            const rState = propagate(tle, rDate);
            const rGmst = satellite.gstime(rDate);
            const rLook = lookAngle(observer, rState.position, rGmst);
            if (rLook.elevation >= minElevation) {
              currentPass = {
                noradId: tle.noradId,
                satelliteName: tle.name,
                aos: { time: rDate, azimuth: rLook.azimuth, elevation: rLook.elevation },
                maxElevation: { time: rDate, azimuth: rLook.azimuth, elevation: rLook.elevation },
                isVisible: true
              };
              break;
            }
            refineT += stepFine;
          }
        } else {
          // Update max elevation
          if (look.elevation > currentPass.maxElevation!.elevation) {
            currentPass.maxElevation = { time: date, azimuth: look.azimuth, elevation: look.elevation };
          }
        }
        t += stepFine; // Step fine while visible
      } else {
        if (currentPass) {
          // Found LOS
          currentPass.los = { time: date, azimuth: look.azimuth, elevation: look.elevation };
          currentPass.duration = (currentPass.los.time.getTime() - currentPass.aos!.time.getTime()) / 1000;
          passes.push(currentPass as PassPrediction);
          currentPass = null;
        }
        t += stepCoarse; // Step coarse while not visible
      }
    } catch (e) {
      // Propagation error, skip this step
      t += stepCoarse;
    }
  }

  if (currentPass) {
    // Pass still ongoing at end of window
    const date = new Date(t);
    currentPass.los = { time: date, azimuth: 0, elevation: 0 }; // Approximation
    currentPass.duration = (currentPass.los.time.getTime() - currentPass.aos!.time.getTime()) / 1000;
    passes.push(currentPass as PassPrediction);
  }

  return passes;
}
