// ============================================================================
// AnimeKinematicsSystem — Core Mathematical Engines for Industry-Grade 2D Anime Animation
// Implements:
// 1. Two-Bone Inverse Kinematics (IK) for human arm/shoulder articulation.
// 2. Multi-Segment Verlet Integration Physics for flowing hair chains & side locks.
// 3. Semi-Implicit Euler Spring-Damper for Golden Jhumka earrings (with overshoot).
// 4. Catmull-Rom Splines for smooth organic gesture trajectory paths.
// 5. Quantized Frame Timing ("Animating on Twos/Threes") for authentic anime cadence.
// 6. Squash & Stretch with Volume Preservation.
// ============================================================================

/**
 * 2D Vector helper
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Two-Bone Inverse Kinematics Solver (Shoulder -> Elbow -> Hand)
 * Formula:
 *   cos(θ2) = (x² + y² - L1² - L2²) / (2 L1 L2)
 *   θ1 = atan2(y, x) - atan2(L2 sin θ2, L1 + L2 cos θ2)
 */
export class TwoBoneIKSolver {
  public l1: number; // Upper arm length
  public l2: number; // Forearm length

  constructor(l1: number = 145, l2: number = 135) {
    this.l1 = l1;
    this.l2 = l2;
  }

  /**
   * Solves joint angles for given shoulder origin and target hand position.
   * @param origin Shoulder position (px)
   * @param target Desired hand position (px)
   * @param bendDirection 1 for outward elbow bend, -1 for inward bend
   */
  public solve(
    origin: Vec2,
    target: Vec2,
    bendDirection: number = 1
  ): { elbow: Vec2; hand: Vec2; angle1: number; angle2: number } {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    const maxReach = (this.l1 + this.l2) * 0.999;
    const minReach = Math.abs(this.l1 - this.l2) * 1.001;
    const clampedDist = Math.max(minReach, Math.min(maxReach, dist));

    // Law of cosines for elbow angle θ2
    const cosAngle2 = (clampedDist * clampedDist - this.l1 * this.l1 - this.l2 * this.l2) / (2 * this.l1 * this.l2);
    const clampedCos2 = Math.max(-1, Math.min(1, cosAngle2));
    const angle2 = Math.acos(clampedCos2) * bendDirection;

    // Angle θ1 from shoulder to elbow
    const alpha = Math.atan2(dy, dx);
    const beta = Math.atan2(this.l2 * Math.sin(angle2), this.l1 + this.l2 * Math.cos(angle2));
    const angle1 = alpha - beta;

    const elbowX = origin.x + Math.cos(angle1) * this.l1;
    const elbowY = origin.y + Math.sin(angle1) * this.l1;

    const handX = elbowX + Math.cos(angle1 + angle2) * this.l2;
    const handY = elbowY + Math.sin(angle1 + angle2) * this.l2;

    return {
      elbow: { x: elbowX, y: elbowY },
      hand: { x: handX, y: handY },
      angle1,
      angle2
    };
  }
}

/**
 * Multi-Segment Verlet Integration Chain for Hair Locks & Bangs
 * Formula:
 *   x_new = 2x - x_old + a * dt²
 * Followed by distance-constraint relaxation passes to maintain bone length.
 */
export interface VerletNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

export class VerletHairChain {
  public nodes: VerletNode[] = [];
  public segmentLength: number;
  public gravity: number;
  public damping: number;

  constructor(
    rootX: number,
    rootY: number,
    numNodes: number = 5,
    segmentLength: number = 32,
    gravity: number = 0.35,
    damping: number = 0.94
  ) {
    this.segmentLength = segmentLength;
    this.gravity = gravity;
    this.damping = damping;

    for (let i = 0; i < numNodes; i++) {
      const y = rootY + i * segmentLength;
      this.nodes.push({
        x: rootX,
        y: y,
        oldX: rootX,
        oldY: y
      });
    }
  }

  /**
   * Updates Verlet physics with head motion acceleration and wind
   */
  public update(
    rootX: number,
    rootY: number,
    forceX: number = 0,
    forceY: number = 0,
    iterations: number = 4
  ): void {
    // Pin root node to head transform anchor
    this.nodes[0].x = rootX;
    this.nodes[0].y = rootY;

    // Verlet integration step
    for (let i = 1; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const vx = (n.x - n.oldX) * this.damping;
      const vy = (n.y - n.oldY) * this.damping;

      n.oldX = n.x;
      n.oldY = n.y;

      n.x += vx + (forceX * 0.15) / (i + 1);
      n.y += vy + (this.gravity + forceY * 0.1) / (i + 1);
    }

    // Distance constraint relaxation passes
    for (let it = 0; it < iterations; it++) {
      this.nodes[0].x = rootX;
      this.nodes[0].y = rootY;

      for (let i = 0; i < this.nodes.length - 1; i++) {
        const p1 = this.nodes[i];
        const p2 = this.nodes[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1e-4;
        const diff = (dist - this.segmentLength) / dist;

        if (i === 0) {
          // p1 is pinned, only move p2
          p2.x -= dx * diff;
          p2.y -= dy * diff;
        } else {
          // Share displacement between nodes
          p1.x += dx * diff * 0.5;
          p1.y += dy * diff * 0.5;
          p2.x -= dx * diff * 0.5;
          p2.y -= dy * diff * 0.5;
        }
      }
    }
  }

  /**
   * Returns smooth Catmull-Rom spline control points for rendering hair ribbon
   */
  public getPoints(): Vec2[] {
    return this.nodes.map((n) => ({ x: n.x, y: n.y }));
  }
}

/**
 * Semi-Implicit Euler Spring-Damper for Golden Jhumka Pendulums
 * Formula:
 *   a = -k (x - target) - c * v
 *   v += a * dt; x += v * dt
 *   c = 2 * sqrt(k * m) * dampingRatio (underdamped < 1.0 for juicy anime wobble)
 */
export class SemiImplicitSpringDamper {
  public value: number = 0;
  public velocity: number = 0;
  public stiffness: number; // k
  public dampingRatio: number; // ratio of critical damping (0.65 = sweet overshoot)
  public mass: number;

  constructor(stiffness: number = 180, dampingRatio: number = 0.62, mass: number = 1.0) {
    this.stiffness = stiffness;
    this.dampingRatio = dampingRatio;
    this.mass = mass;
  }

  public update(target: number, dt: number, externalForce: number = 0): number {
    const c = 2 * Math.sqrt(this.stiffness * this.mass) * this.dampingRatio;
    const springForce = -this.stiffness * (this.value - target);
    const dampingForce = -c * this.velocity;
    const accel = (springForce + dampingForce + externalForce) / this.mass;

    this.velocity += accel * dt;
    this.value += this.velocity * dt;

    return this.value;
  }
}

/**
 * Catmull-Rom Spline Trajectory Interpolator for Organic Hand Arcs
 * Formula:
 *   P(t) = 0.5 * [ 2P1 + (-P0+P2)t + (2P0-5P1+4P2-P3)t² + (-P0+3P1-3P2+P3)t³ ]
 */
export function catmullRom(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const t2 = t * t;
  const t3 = t2 * t;

  const f0 = -0.5 * t3 + t2 - 0.5 * t;
  const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
  const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
  const f3 = 0.5 * t3 - 0.5 * t2;

  return {
    x: p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3,
    y: p0.y * f0 + p1.y * f1 + p2.y * f2 + p3.y * f3
  };
}

/**
 * Quantized Frame Timing ("On Twos / Threes")
 * Formula:
 *   t_q = floor(t * fps / step) * step / fps   (step = 2 or 3)
 */
export function quantizeAnimeTiming(timeSec: number, fps: number = 60, step: number = 2): number {
  return (Math.floor((timeSec * fps) / step) * step) / fps;
}

/**
 * Volume-Preserving Squash and Stretch
 * Formula:
 *   stretch = 1 + k * |v|
 *   scale_along = stretch
 *   scale_perp = 1 / sqrt(stretch)
 */
export function calcSquashStretch(velocityMag: number, k: number = 0.008): { scaleX: number; scaleY: number } {
  const stretch = Math.max(0.7, Math.min(1.4, 1.0 + k * velocityMag));
  const perp = 1.0 / Math.sqrt(stretch);
  return { scaleX: perp, scaleY: stretch };
}

/**
 * Non-linear Easing Functions (Fast-in / Slow-out, Overshoot)
 */
export const AnimeEasing = {
  // easeOutExpo: 1 - 2^(-10t)
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  // easeInCubic: t³
  easeInCubic: (t: number): number => t * t * t,

  // easeOutBack: 1 + c3 (t-1)³ + c1 (t-1)²  (c1 = 1.70158, c3 = 2.70158)
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Snappy Anime Strike: fast anticipation, explosive strike over 2 frames, settling hold
  animeStrike: (t: number): number => {
    if (t < 0.18) {
      // Wind-up: slight anticipation backward dip
      const p = t / 0.18;
      return -0.06 * Math.sin(p * Math.PI);
    } else {
      // Explosive strike with easeOutExpo into settle
      const p = (t - 0.18) / 0.82;
      return 1 - Math.pow(2, -8 * p);
    }
  }
};
