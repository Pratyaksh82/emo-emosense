// ============================================================================
// Biomechanical 3D Head Kinematics & Expressive Gesture Engine
// Implements Authentic Human Cervical Spine Kinematics, Kyoto Animation
// Micro-Saccades, Active Listening Micro-Nods, and Secondary Physics.
// Eliminates "cardboard cutout" flat rotations via continuous 3D perspective,
// non-linear bezier easing, cervical neck pivot translations, and inertia.
// ============================================================================

export type HeadGestureType =
  | 'none'
  | 'agree_nod'        // Natural double affirmation nod (rhythmic dip & rebound)
  | 'deep_empathy_nod' // Slow, thoughtful compassionate downward tilt & hold
  | 'curious_tilt'     // Inquisitive head tilt with micro-elevation (perk)
  | 'reassuring_shake' // Gentle, slow lateral head oscillation ("everything will be alright")
  | 'alert_perk';      // Sudden gentle upward alertness & chin lift

export interface HeadPoseState {
  yaw: number;         // 3D Horizontal turn (-30 to +30 deg)
  pitch: number;       // 3D Vertical nod (-25 to +25 deg)
  roll: number;        // 3D Lateral tilt (-20 to +20 deg)
  neckTransX: number;  // Biomechanical cervical spine compensation (px)
  neckTransY: number;  // Cervical spine compression / lift (px)
  jawDeformY: number;  // Sternocleidomastoid chin tuck / extension factor
  perspectiveSkew: number; // 2.5D facial feature foreshortening factor
  jhumkaLeftAngle: number;  // Secondary damped pendulum physics (deg)
  jhumkaRightAngle: number; // Secondary damped pendulum physics (deg)
  jhumkaSparkle: number;    // Specular flare intensity (0.0 to 1.0)
  hairSwayOffset: number;   // Front hair strand delayed inertia (px)
  eyeSaccadeX: number;      // Kyoto Animation micro-saccade offset (px)
  eyeSaccadeY: number;      // Kyoto Animation micro-saccade offset (px)
}

interface ActiveGestureAnimation {
  type: HeadGestureType;
  startTime: number;
  duration: number; // milliseconds
}

export class HeadKinematicsEngine {
  private activeGesture: ActiveGestureAnimation | null = null;
  private autonomousNodTimer: number = 0;
  private nextAutonomousNodTime: number = 2.5 + Math.random() * 2.5;
  private saccadeTimer: number = 0;
  private nextSaccadeTime: number = 0.4 + Math.random() * 0.5;

  // Spring physics states for Golden Jhumka earrings
  private jhumkaL = { angle: 0, vel: 0 };
  private jhumkaR = { angle: 0, vel: 0 };
  private lastRoll: number = 0;
  private lastYaw: number = 0;

  // Hair lag spring
  private hairOffset: number = 0;
  private hairVel: number = 0;

  // Micro-saccade state
  private saccadeX: number = 0;
  private saccadeY: number = 0;
  private targetSaccadeX: number = 0;
  private targetSaccadeY: number = 0;

  // Gesture state tracking
  public enableAutonomousNods: boolean = true;

  /**
   * Triggers an expressive human head animation gesture
   */
  public triggerGesture(type: HeadGestureType, nowMs: number = performance.now()): void {
    const durations: Record<HeadGestureType, number> = {
      none: 0,
      agree_nod: 1250,        // Double nod sequence
      deep_empathy_nod: 1650, // Slow deep compassionate nod
      curious_tilt: 1400,     // Inquisitive tilt and hold
      reassuring_shake: 1550, // Reassuring lateral sway
      alert_perk: 1100        // Alert perk up
    };

    this.activeGesture = {
      type,
      startTime: nowMs,
      duration: durations[type] || 1200
    };
  }

  /**
   * Main 60 FPS Kinematics Solver:
   * Combines baseline Lissajous life sway, mouse gaze orientation,
   * active gesture interpolation, cervical spine mechanics, and pendulum physics.
   */
  public update(
    timeSec: number,
    motionIntensity: number,
    gaze: { x: number; y: number },
    breathPhase: number,
    isSpeaking: boolean,
    nowMs: number = performance.now()
  ): HeadPoseState {
    // -------------------------------------------------------------------------
    // 1. BASELINE ORGANIC HUMAN LISSAJOUS DRIFT
    // Continuous subtle respiration-coupled sway preventing static rigidity.
    // -------------------------------------------------------------------------
    const baseRoll = Math.sin(timeSec * 0.78) * 2.8 * motionIntensity;
    const baseYaw = Math.sin(timeSec * 0.58) * 3.6 * motionIntensity;
    const basePitch = (Math.sin(timeSec * 1.6 + 0.3) * 2.2 + breathPhase * 1.2) * motionIntensity;

    // Mouse gaze orientation bias (Wide Authentic 3D Articulation)
    const gazeRoll = gaze.x * 5.2 * motionIntensity;
    const gazeYaw = gaze.x * 17.5 * motionIntensity;
    const gazePitch = -gaze.y * 12.8 * motionIntensity;

    let gestureYaw = 0;
    let gesturePitch = 0;
    let gestureRoll = 0;

    // -------------------------------------------------------------------------
    // 2. ACTIVE EXPRESSIVE HEAD GESTURE SEQUENCING
    // Procedural cubic-bezier curves for human-grade head motions.
    // -------------------------------------------------------------------------
    if (this.activeGesture && this.activeGesture.type !== 'none') {
      const elapsed = nowMs - this.activeGesture.startTime;
      const progress = Math.min(1.0, elapsed / this.activeGesture.duration);

      if (progress >= 1.0) {
        this.activeGesture = null;
      } else {
        const p = progress;
        switch (this.activeGesture.type) {
          case 'agree_nod': {
            // Authentic Japanese/Anime double-affirmation nod:
            // Dip 1 (strong), rebound, Dip 2 (softer), settling recovery
            const envelope = Math.sin(p * Math.PI); // 0 -> 1 -> 0
            const nodWave = Math.sin(p * Math.PI * 4.0 - Math.PI * 0.5) * 0.5 + 0.5;
            gesturePitch = (nodWave * 12.5 + p * 3.0) * envelope;
            gestureRoll = Math.sin(p * Math.PI * 2.0) * 2.5 * envelope; // subtle tilt during nod
            break;
          }

          case 'deep_empathy_nod': {
            // Slow, compassionate downward head dip with an affectionate 8.5 deg tilt
            let tCurve: number;
            if (p < 0.35) {
              const t = p / 0.35;
              tCurve = t * t * (3 - 2 * t);
            } else if (p < 0.70) {
              tCurve = 1.0 + Math.sin((p - 0.35) / 0.35 * Math.PI) * 0.12;
            } else {
              const t = (1.0 - p) / 0.30;
              tCurve = t * t * (3 - 2 * t);
            }
            gesturePitch = tCurve * 13.5;
            gestureRoll = tCurve * 8.5; // Tender empathetic head tilt
            gestureYaw = tCurve * -4.5; // Turning slightly closer to the user
            break;
          }

          case 'curious_tilt': {
            // Curious / Inquisitive head perk:
            // Quick alert tilt to 14 deg, chin lifts slightly, holds, then relaxes
            const envelope = Math.sin(p * Math.PI);
            gestureRoll = Math.sin(p * Math.PI) * 14.0;
            gesturePitch = -Math.sin(p * Math.PI) * 5.2; // Chin perks up
            gestureYaw = Math.sin(p * Math.PI * 0.8) * 6.5;
            break;
          }

          case 'reassuring_shake': {
            // Gentle lateral oscillation: "No, don't worry about that at all"
            const envelope = Math.sin(p * Math.PI);
            const shake = Math.sin(p * Math.PI * 4.5);
            gestureYaw = shake * 12.5 * envelope;
            gestureRoll = -shake * 3.6 * envelope;
            gesturePitch = Math.abs(shake) * 2.4 * envelope;
            break;
          }

          case 'alert_perk': {
            // Sudden gentle alertness: Head rises, yaw locks forward
            const envelope = Math.sin(p * Math.PI);
            gesturePitch = -envelope * 9.5; // Chin rises
            gestureRoll = Math.sin(p * Math.PI * 2.0) * 3.2 * envelope;
            break;
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. AUTONOMOUS ACTIVE LISTENING MICRO-NODS
    // Subtle 2.2 - 3.8 deg micro-nods occurring naturally every 3-5 seconds.
    // -------------------------------------------------------------------------
    let autonomousNodPitch = 0;
    if (this.enableAutonomousNods && !this.activeGesture) {
      this.autonomousNodTimer += 0.016;
      if (this.autonomousNodTimer >= this.nextAutonomousNodTime) {
        const nodPhase = (this.autonomousNodTimer - this.nextAutonomousNodTime) / 0.45;
        if (nodPhase < 1.0) {
          autonomousNodPitch = Math.sin(nodPhase * Math.PI) * (isSpeaking ? 2.2 : 3.4);
        } else {
          this.autonomousNodTimer = 0;
          this.nextAutonomousNodTime = 2.8 + Math.random() * 3.2;
        }
      }
    }

    // Combine all angular components
    const finalYaw = baseYaw + gazeYaw + gestureYaw;
    const finalPitch = basePitch + gazePitch + gesturePitch + autonomousNodPitch;
    const finalRoll = baseRoll + gazeRoll + gestureRoll;

    // -------------------------------------------------------------------------
    // 4. BIOMECHANICAL CERVICAL SPINE KINEMATICS (Anti-Cardboard Deformations)
    // Real heads do not rotate around the skull center! They articulate from the
    // C7 vertebra. As roll increases, the neck laterally bends.
    // -------------------------------------------------------------------------
    const neckLength = 65; // Virtual neck column length in pixels
    const radRoll = (finalRoll * Math.PI) / 180;
    const radYaw = (finalYaw * Math.PI) / 180;
    const radPitch = (finalPitch * Math.PI) / 180;

    // Lateral cervical shift
    const neckTransX = Math.sin(radRoll) * neckLength * 0.28 + Math.sin(radYaw) * 11.5;
    // Sternocleidomastoid compression (nod dips down, perk lifts up)
    const neckTransY = (1.0 - Math.cos(radRoll)) * neckLength * 0.22 + finalPitch * 0.65;

    // Chin tuck / jaw deformation factor (compression on nod, elongation on tilt)
    const jawDeformY = Math.max(-1.0, Math.min(1.0, finalPitch / 20.0));

    // 2.5D Facial foreshortening (near cheek expands, far cheek compresses)
    const perspectiveSkew = Math.sin(radYaw) * 0.14;

    // -------------------------------------------------------------------------
    // 5. SECONDARY PENDULUM DAMPING FOR GOLDEN JHUMKAS
    // Dual damped harmonic oscillators with inertia derived from head acceleration
    // -------------------------------------------------------------------------
    const dRoll = finalRoll - this.lastRoll;
    const dYaw = finalYaw - this.lastYaw;
    this.lastRoll = finalRoll;
    this.lastYaw = finalYaw;

    // Inertial driving force on earrings
    const inertiaL = (dRoll * 4.2 + dYaw * 2.8) * motionIntensity;
    const inertiaR = (dRoll * 4.2 + dYaw * 2.8) * motionIntensity;

    const kSpring = 0.16; // Elastic recovery
    const kDamp = 0.86;   // Air and skin friction damping

    this.jhumkaL.vel = (this.jhumkaL.vel - kSpring * this.jhumkaL.angle + inertiaL) * kDamp;
    this.jhumkaL.angle += this.jhumkaL.vel;

    this.jhumkaR.vel = (this.jhumkaR.vel - 0.15 * this.jhumkaR.angle + inertiaR) * 0.85;
    this.jhumkaR.angle += this.jhumkaR.vel;

    // Clamp jhumka angles to realistic human ear limits
    this.jhumkaL.angle = Math.max(-28, Math.min(28, this.jhumkaL.angle));
    this.jhumkaR.angle = Math.max(-28, Math.min(28, this.jhumkaR.angle));

    // Specular flare sparkles when head rotation catches ambient light
    // (Peaks around yaw = 4 deg and roll = 6 deg)
    const lightAlignment = Math.cos((finalYaw - 5.0) * 0.05) * Math.cos((finalRoll - 6.0) * 0.06);
    const jhumkaSparkle = Math.max(0, Math.pow(Math.max(0, lightAlignment), 8.0));

    // -------------------------------------------------------------------------
    // 6. SECONDARY HAIR INERTIA SWAY
    // Delayed spring lag for loose front strands
    // -------------------------------------------------------------------------
    const hairInertia = -(dYaw * 0.8 + dRoll * 0.5);
    this.hairVel = (this.hairVel - 0.18 * this.hairOffset + hairInertia) * 0.78;
    this.hairOffset += this.hairVel;

    // -------------------------------------------------------------------------
    // 7. KYOTO ANIMATION EYE MICRO-SACCADES
    // Natural human gaze darting every 300-600ms (1-2px organic shifts)
    // -------------------------------------------------------------------------
    this.saccadeTimer += 0.016;
    if (this.saccadeTimer >= this.nextSaccadeTime) {
      this.saccadeTimer = 0;
      this.nextSaccadeTime = 0.35 + Math.random() * 0.45;
      if (Math.random() < 0.65) {
        // Small organic jump
        this.targetSaccadeX = (Math.random() - 0.5) * 2.2;
        this.targetSaccadeY = (Math.random() - 0.5) * 1.5;
      } else {
        this.targetSaccadeX = 0;
        this.targetSaccadeY = 0;
      }
    }
    this.saccadeX += (this.targetSaccadeX - this.saccadeX) * 0.22;
    this.saccadeY += (this.targetSaccadeY - this.saccadeY) * 0.22;

    return {
      yaw: finalYaw,
      pitch: finalPitch,
      roll: finalRoll,
      neckTransX,
      neckTransY,
      jawDeformY,
      perspectiveSkew,
      jhumkaLeftAngle: this.jhumkaL.angle,
      jhumkaRightAngle: this.jhumkaR.angle,
      jhumkaSparkle,
      hairSwayOffset: this.hairOffset,
      eyeSaccadeX: this.saccadeX,
      eyeSaccadeY: this.saccadeY
    };
  }
}

export const globalHeadKinematics = new HeadKinematicsEngine();
