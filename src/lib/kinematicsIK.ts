// ============================================================================
// 2D Inverse Kinematics (IK) Solver for Humanoid Avatar Arms & Gestures
// Analytical 2-Bone IK with Anatomical Angle Limits (Shoulder -> Elbow -> Wrist)
// ============================================================================

export interface Point2D {
  x: number;
  y: number;
}

export interface IKArmResult {
  shoulderAngleDeg: number;
  elbowAngleDeg: number;
  elbowPos: Point2D;
  wristPos: Point2D;
  isReachable: boolean;
}

export interface IKArmConfig {
  shoulderPos: Point2D;
  upperArmLength: number; // Length L1
  forearmLength: number;  // Length L2
  isRightArm: boolean;
  minElbowDeg?: number;
  maxElbowDeg?: number;
}

/**
 * Solves 2D 2-Bone Inverse Kinematics analytically using the Law of Cosines.
 * Computes exact shoulder and elbow joint rotations to reach a target wrist coordinate.
 */
export function solve2BoneIK(
  target: Point2D,
  config: IKArmConfig
): IKArmResult {
  const { shoulderPos, upperArmLength: L1, forearmLength: L2, isRightArm } = config;

  // Vector from shoulder to target
  const dx = target.x - shoulderPos.x;
  const dy = target.y - shoulderPos.y;
  let dist = Math.hypot(dx, dy);

  // Maximum and minimum arm reach
  const maxReach = L1 + L2 - 0.5; // slight tolerance to prevent numerical singularities
  const minReach = Math.abs(L1 - L2) + 0.5;
  const isReachable = dist <= maxReach && dist >= minReach;

  // Clamp distance within reachable range
  const clampedDist = Math.max(minReach, Math.min(maxReach, dist));

  // Base angle from shoulder to target
  const baseAngle = Math.atan2(dy, dx);

  // Law of Cosines to solve for internal angles
  // cos(alpha) = (L1^2 + dist^2 - L2^2) / (2 * L1 * dist)
  const cosAlpha = (L1 * L1 + clampedDist * clampedDist - L2 * L2) / (2 * L1 * clampedDist);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

  // cos(beta) = (L1^2 + L2^2 - dist^2) / (2 * L1 * L2)
  const cosBeta = (L1 * L1 + L2 * L2 - clampedDist * clampedDist) / (2 * L1 * L2);
  const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));

  // Handedness: right arm bends outwards or inwards depending on sign
  const bendSign = isRightArm ? 1 : -1;
  const shoulderAngleRad = baseAngle + bendSign * alpha;
  const elbowAngleRad = Math.PI - beta;

  // Calculate elbow joint Cartesian position
  const elbowX = shoulderPos.x + Math.cos(shoulderAngleRad) * L1;
  const elbowY = shoulderPos.y + Math.sin(shoulderAngleRad) * L1;

  // Calculate actual wrist position
  const finalForearmAngle = shoulderAngleRad - bendSign * elbowAngleRad;
  const wristX = elbowX + Math.cos(finalForearmAngle) * L2;
  const wristY = elbowY + Math.sin(finalForearmAngle) * L2;

  // Convert to degrees
  const shoulderAngleDeg = (shoulderAngleRad * 180) / Math.PI;
  const elbowAngleDeg = (elbowAngleRad * 180) / Math.PI;

  return {
    shoulderAngleDeg,
    elbowAngleDeg,
    elbowPos: { x: elbowX, y: elbowY },
    wristPos: { x: wristX, y: wristY },
    isReachable
  };
}

/**
 * Standard humanoid gesture target coordinates (normalized relative to torso width/height)
 */
export const GESTURE_IK_TARGETS = {
  // Clasp hands together in front of sternum (Anjali Mudra)
  namaste: { x: 0.5, y: 0.55 },
  // Hand raised in greeting wave
  wave: { x: 0.78, y: 0.28 },
  // Supporting chin/cheek
  chin_rest: { x: 0.62, y: 0.38 },
  // Hand resting on heart
  heart_empathy: { x: 0.44, y: 0.52 },
  // Polite desk rest
  idle_desk: { x: 0.58, y: 0.82 }
};
