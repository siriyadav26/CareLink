import { Platform } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';

let accSub = null;
let gyroSub = null;

// Threshold Constants
const FREE_FALL_THRESHOLD = 0.35; // g (Reduced from 0.5 to ensure it's a real drop)
const IMPACT_THRESHOLD = 2.2;    // g (Reduced from 2.5 to catch softer impacts)
const INACTIVITY_THRESHOLD = 0.6; // Increased from 0.4 for maximum noise tolerance
const MAX_IMPACT_WAIT = 1000;    // 1 second to find impact after free-fall
const STABILIZATION_TIME = 1200; // Increased to 1.2s to let phone settle fully
const INACTIVITY_DURATION = 800; // Only 0.8s of stillness needed once settled
const DEBOUNCE_TIME = 30000;     // 30 seconds between detections

// State Variables
let stage = 'IDLE';
let freeFallStartTime = 0;
let impactDetectedTime = 0;
let lastDetectionTime = 0;

export const fallDetectionService = {
  subscribe: (onFallDetected) => {
    if (Platform.OS === 'web') {
      console.log('Fall detection sensors not available on web.');
      return;
    }

    Accelerometer.setUpdateInterval(20);

    accSub = Accelerometer.addListener(accData => {
      const now = Date.now();
      const magnitude = Math.sqrt(accData.x**2 + accData.y**2 + accData.z**2);

      // 0. Debounce
      if (now - lastDetectionTime < DEBOUNCE_TIME) {
        if (stage !== 'IDLE') stage = 'IDLE';
        return;
      }

      // 1. FREE-FALL PHASE
      if (stage === 'IDLE') {
        if (magnitude < FREE_FALL_THRESHOLD) {
          console.log('Fall Detection: Stage 1 (Free-fall)');
          stage = 'FREE_FALL';
          freeFallStartTime = now;
        }
      }

      // 2. IMPACT PHASE
      else if (stage === 'FREE_FALL') {
        if (magnitude > IMPACT_THRESHOLD) {
          if (now - freeFallStartTime < MAX_IMPACT_WAIT) {
            console.log('Fall Detection: Stage 2 (Impact)');
            stage = 'IMPACT';
            impactDetectedTime = now;
          } else {
            console.log('Fall Detection: Impact timed out');
            stage = 'IDLE';
          }
        } else if (now - freeFallStartTime > MAX_IMPACT_WAIT) {
          stage = 'IDLE';
        }
      }

      // 3. POST-IMPACT INACTIVITY
      else if (stage === 'IMPACT') {
        // Wait for stabilization before checking stillness
        if (now - impactDetectedTime < STABILIZATION_TIME) {
          return;
        }

        const deviation = Math.abs(magnitude - 1.0);
        
        if (deviation > INACTIVITY_THRESHOLD) {
          // If moving too much, reset
          console.log('Fall Detection: Movement too high (', deviation.toFixed(2), '), resetting');
          stage = 'IDLE';
        } else if (now - (impactDetectedTime + STABILIZATION_TIME) > INACTIVITY_DURATION) {
          // Success!
          console.log('Fall Detection: SUCCESS (Stage 3 complete)');
          lastDetectionTime = now;
          stage = 'IDLE';
          onFallDetected();
        }
      }
    });
  },

  unsubscribe: () => {
    accSub && accSub.remove();
    gyroSub && gyroSub.remove();
    accSub = null;
    gyroSub = null;
    stage = 'IDLE';
  }
};
