// ============================================================================
// TherapistKinematicsEngine — Biomechanical & Psychological Acting Engine
// Tailored specifically for a Seated AI Therapist Avatar (Chetana Sharma).
//
// Core Psychological & Acting Principles (Claude AI Synthesis):
// 1. Slow, Deep Thoracic & Diaphragmatic Respiration:
//    - T = 4.5 seconds per cycle, chest rise 2.2px, shoulders lagging by 0.4 rad.
// 2. Exponential (Poisson) Random Blinking:
//    - Natural interval: next_blink = -mean * ln(1 - rand()), mean = 4.0s.
//    - 3-frame snap close, 5-frame ease open, natural double-blinks.
// 3. Eye Gaze Hierarchy & Notes Glance:
//    - Smooth exponential follow: gaze += (target - gaze) * (1 - e^(-dt/0.08)).
//    - Eyes lead the head by 3 frames.
//    - Periodic thoughtful glance down at desk notes (1.5-2.2s) before returning eye contact.
// 4. Subtle Simplex Head Sway:
//    - Low amplitude (1.2° to 2.2°) organic weight shift preventing static freeze.
// 5. Therapeutic Listening Nods:
//    - Eased dip with easeOutBack overshoot into gentle easeInOutSine recovery.
// 6. Soft Calm Secondary Physics (Hair & Golden Jhumkas):
//    - Low stiffness (k), high damping (c) for serene, grounded elegance.
// 7. Desk Interactions & Two-Bone IK:
//    - Note-taking pen articulation, Namaste welcome, Thoughtful chin rest, Hand to heart.
// 8. Cinematic Breathing Camera Push-In:
//    - Slow 20s breathing zoom (1.0 to 1.06) during empathetic listening.
// ============================================================================

import { Vec2, TwoBoneIKSolver, SemiImplicitSpringDamper, VerletHairChain, AnimeEasing } from './animeKinematicsSystem';

export type TherapistGazeMode =
  | 'client'     // Direct warm eye contact with client / cursor
  | 'notes'      // Thoughtfully glancing down at desk notes
  | 'reflective' // Looking slightly upward/away while processing deep thoughts
  | 'webcam';    // Driven by real MediaPipe webcam landmarks

export type TherapistGestureState =
  | 'idle_desk'      // Relaxed hands resting on desk with gentle poise
  | 'namaste'        // Anjali mudra welcoming gesture at chest
  | 'wave'           // Warm, gentle executive welcoming wave
  | 'chin_rest'      // Thoughtful listening hand at chin
  | 'heart_empathy'  // Hand over heart with deep resonant breathing
  | 'writing_notes'; // Holding pen, taking clinical notes on desk pad

export interface TherapistPoseFrame {
  // Angular kinematics (degrees)
  yaw: number;
  pitch: number;
  roll: number;

  // Cervical spine translations (pixels) — Up/Down & Side/Side
  cervicalTransX: number;
  cervicalTransY: number;

  // 3D Front-to-Back Depth Foreshortening (Z-axis scale)
  depthScale: number;

  // Respiration offsets
  chestLiftY: number;
  shoulderLiftY: number;
  torsoScaleX: number;
  torsoScaleY: number;

  // Eye gaze offsets (pixels inside eye socket)
  pupilOffsetX: number;
  pupilOffsetY: number;
  eyeSaccadeX: number;
  eyeSaccadeY: number;

  // Eyelid blink aperture (0.0 open to 1.0 closed)
  blinkProgress: number;

  // Lower jaw drop during speech/empathy
  jawDropY: number;

  // Golden Jhumka earring angles (degrees)
  jhumkaLeftAngle: number;
  jhumkaRightAngle: number;
  jhumkaSparkleIntensity: number;

  // Secondary hair sway offset (pixels)
  hairLagOffsetX: number;

  // Articulated Eyebrows (Kyoto Animation micro-acting)
  browLeftY: number;      // pixels
  browRightY: number;     // pixels
  browTiltLeft: number;   // degrees
  browTiltRight: number;  // degrees

  // Desk note-taking pen coordinates
  penTipX: number;
  penTipY: number;
  isWriting: boolean;

  // Cinematic camera push-in factor (1.0 to 1.06)
  cinematicZoom: number;
}

export type TherapistGestureAction =
  | 'agree_nod'
  | 'deep_empathy_nod'
  | 'curious_tilt'
  | 'reassuring_shake'
  | 'alert_perk'
  | 'notes_glance';

export class TherapistKinematicsEngine {
  // Configurable baseline parameters
  public respirationPeriod: number = 4.5; // seconds per full breath cycle
  public respirationAmplitude: number = 6.5; // pixels (prominent, organic diaphragmatic expansion)
  public shoulderPhaseLag: number = 0.40; // radians
  public blinkMeanInterval: number = 4.0; // seconds

  // Internal timers
  private timeSec: number = 0;
  private lastTimestamp: number = performance.now();
  private nextBlinkTime: number = 2.5;
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private blinkProgress: number = 0;

  // Eye gaze tracking state
  public gazeMode: TherapistGazeMode = 'client';
  private currentGaze: Vec2 = { x: 0, y: 0 };
  private targetGaze: Vec2 = { x: 0, y: 0 };
  private saccadeOffset: Vec2 = { x: 0, y: 0 };
  private nextSaccadeTime: number = 0.8;
  private saccadeTimer: number = 0;

  // Notes glance timer (attentive glance down at notes every 7-12 seconds)
  public enableAutonomousNotesGlance: boolean = true;
  private notesGlanceTimer: number = 0;
  private nextNotesGlanceTime: number = 8.5;
  private isGlancingAtNotes: boolean = false;
  private notesGlanceProgress: number = 0;

  // Active therapeutic nod animation state
  private activeNod: { startTime: number; duration: number; amplitude: number } | null = null;
  private autoNodTimer: number = 0;
  private nextAutoNodTime: number = 4.2;
  public enableAutoNods: boolean = true;

  // Secondary physics: Soft calm spring-dampers for Jhumkas & cascading hair locks
  private jhumkaL: SemiImplicitSpringDamper;
  private jhumkaR: SemiImplicitSpringDamper;
  private hairSpring: SemiImplicitSpringDamper;
  private lastRoll: number = 0;
  private lastYaw: number = 0;
  private lastPitch: number = 0;

  // Note-taking pen kinematics
  private penProgress: number = 0;

  public setGazeMode(mode: TherapistGazeMode): void {
    this.gazeMode = mode;
    if (mode === 'notes') {
      this.triggerNotesGlance();
    }
  }

  private activeGesture: {
    type: TherapistGestureAction;
    startTime: number;
    duration: number;
  } | null = null;

  constructor() {
    // Soft, tranquil spring settings: low stiffness (95), high damping (0.82) for serene therapist motion
    this.jhumkaL = new SemiImplicitSpringDamper(95, 0.82, 1.0);
    this.jhumkaR = new SemiImplicitSpringDamper(95, 0.82, 1.0);
    // Secondary hair physics: low stiffness (105), high damping (0.82) for organic hair lock inertia
    this.hairSpring = new SemiImplicitSpringDamper(105, 0.82, 1.0);
  }

  /**
   * Triggers a thoughtful therapeutic nod (Affirmation or Deep Empathy)
   */
  public triggerNod(amplitude: number = 11.5, durationMs: number = 1350): void {
    this.activeNod = {
      startTime: performance.now(),
      duration: durationMs,
      amplitude
    };
  }

  /**
   * Triggers an expressive therapeutic head gesture
   */
  public triggerGesture(action: TherapistGestureAction): void {
    if (action === 'notes_glance') {
      this.triggerNotesGlance();
      return;
    }
    const durations: Record<TherapistGestureAction, number> = {
      agree_nod: 1350,
      deep_empathy_nod: 1850,
      curious_tilt: 1400,
      reassuring_shake: 1550,
      alert_perk: 1200,
      notes_glance: 1850
    };
    this.activeGesture = {
      type: action,
      startTime: performance.now(),
      duration: durations[action] || 1400
    };
  }

  /**
   * Triggers a momentary glance down at notes on the desk
   */
  public triggerNotesGlance(): void {
    this.isGlancingAtNotes = true;
    this.notesGlanceProgress = 0;
  }

  /**
   * Main 60 FPS update solver
   */
  public update(
    mouseClientTarget: Vec2,
    motionIntensity: number = 1.0,
    isSpeaking: boolean = false,
    nowMs: number = performance.now()
  ): TherapistPoseFrame {
    const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastTimestamp) * 0.001));
    this.lastTimestamp = nowMs;
    this.timeSec += dt;

    // -------------------------------------------------------------------------
    // 1. SLOW THORACIC & DIAPHRAGMATIC RESPIRATION
    // chest_y = A * sin(2π t / T)
    // shoulder_y = 0.5 * A * sin(2π t / T - 0.4)
    // -------------------------------------------------------------------------
    const omega = (2 * Math.PI) / this.respirationPeriod;
    const breathPhase = Math.sin(this.timeSec * omega);
    const chestLiftY = -this.respirationAmplitude * breathPhase * motionIntensity;
    const shoulderLiftY = -0.55 * this.respirationAmplitude * Math.sin(this.timeSec * omega - this.shoulderPhaseLag) * motionIntensity;

    const torsoScaleY = 1.0 + (breathPhase * 0.015) * motionIntensity;
    const torsoScaleX = 1.0 + (breathPhase * 0.006) * motionIntensity;

    // -------------------------------------------------------------------------
    // 2. EXPONENTIAL POISSON BLINKING
    // next_blink = -mean * ln(1 - rand())
    // Close over 3 frames (45ms), open over 5 frames (85ms)
    // -------------------------------------------------------------------------
    this.blinkTimer += dt;
    if (!this.isBlinking && this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkTimer = 0;
      this.nextBlinkTime = -this.blinkMeanInterval * Math.log(1.0 - Math.min(0.98, Math.random()));
    }

    if (this.isBlinking) {
      const closeDuration = 0.120; // 120ms snap shut
      const openDuration = 0.280;  // 280ms cubic-bezier ease open
      const totalBlink = closeDuration + openDuration;

      if (this.blinkTimer < closeDuration) {
        // Fast muscular contraction snap shut
        const t = this.blinkTimer / closeDuration;
        this.blinkProgress = Math.min(1.0, t * t * 1.25);
      } else if (this.blinkTimer < totalBlink) {
        // Slow cubic-bezier smooth ease open: f(t) = 1.0 - t^2(3 - 2t)
        const t = (this.blinkTimer - closeDuration) / openDuration;
        const easedOpen = t * t * (3.0 - 2.0 * t);
        this.blinkProgress = Math.max(0.0, 1.0 - easedOpen);
      } else {
        this.isBlinking = false;
        this.blinkProgress = 0;

        // 18% chance of gentle double-blink common in attentive listening
        if (Math.random() < 0.18) {
          this.nextBlinkTime = 0.18;
        }
      }
    } else {
      this.blinkProgress = 0;
    }

    // -------------------------------------------------------------------------
    // 3. EYE SACCADES & GAZE FOCUS
    // gaze += (target - gaze) * (1 - e^(-dt / τ))
    // -------------------------------------------------------------------------
    // Notes glance cycle (therapist periodically glances down at notepad)
    if (this.enableAutonomousNotesGlance) {
      this.notesGlanceTimer += dt;
      if (!this.isGlancingAtNotes && this.notesGlanceTimer >= this.nextNotesGlanceTime) {
        this.isGlancingAtNotes = true;
        this.notesGlanceTimer = 0;
        this.notesGlanceProgress = 0;
        this.nextNotesGlanceTime = 7.0 + Math.random() * 6.0;
      }
    }

    let effectiveTargetX = mouseClientTarget.x;
    let effectiveTargetY = mouseClientTarget.y;

    if (this.gazeMode === 'reflective') {
      // Look thoughtfully upward-right into mid-distance
      effectiveTargetX = -0.32;
      effectiveTargetY = -0.42;
    } else if (this.gazeMode === 'notes') {
      // Focused on desk notes
      effectiveTargetX = 0.12;
      effectiveTargetY = 0.82;
    }

    if (this.isGlancingAtNotes && this.gazeMode !== 'notes' && this.gazeMode !== 'reflective') {
      this.notesGlanceProgress += dt / 1.85; // 1.85s glance down and return
      if (this.notesGlanceProgress < 0.4) {
        // Glance down at desk notepad (x: 0.12, y: 0.82)
        const t = this.notesGlanceProgress / 0.4;
        effectiveTargetX = mouseClientTarget.x * (1 - t) + 0.12 * t;
        effectiveTargetY = mouseClientTarget.y * (1 - t) + 0.82 * t;
      } else if (this.notesGlanceProgress < 0.7) {
        effectiveTargetX = 0.12;
        effectiveTargetY = 0.82;
      } else if (this.notesGlanceProgress < 1.0) {
        const t = (this.notesGlanceProgress - 0.7) / 0.3;
        effectiveTargetX = 0.12 * (1 - t) + mouseClientTarget.x * t;
        effectiveTargetY = 0.82 * (1 - t) + mouseClientTarget.y * t;
      } else {
        this.isGlancingAtNotes = false;
      }
    }

    // Smooth exponential follow (tau = 0.08s)
    const tau = 0.08;
    const followFactor = 1.0 - Math.exp(-dt / tau);
    this.currentGaze.x += (effectiveTargetX - this.currentGaze.x) * followFactor;
    this.currentGaze.y += (effectiveTargetY - this.currentGaze.y) * followFactor;

    // Micro-saccades every 0.3 - 1.2s (±1.2 px organic tremor)
    this.saccadeTimer += dt;
    if (this.saccadeTimer >= this.nextSaccadeTime) {
      this.saccadeTimer = 0;
      this.nextSaccadeTime = 0.35 + Math.random() * 0.85;
      this.saccadeOffset.x = (Math.random() - 0.5) * 2.2 * motionIntensity;
      this.saccadeOffset.y = (Math.random() - 0.5) * 1.6 * motionIntensity;
    }

    // Anatomical socket limits: keep pupils comfortably inside sclera with expressive gaze range
    const pupilOffsetX = Math.max(-9.5, Math.min(9.5, (this.currentGaze.x * 10.5 + this.saccadeOffset.x) * motionIntensity));
    const pupilOffsetY = Math.max(-6.5, Math.min(8.5, (this.currentGaze.y * 9.5 + this.saccadeOffset.y) * motionIntensity));

    // -------------------------------------------------------------------------
    // 4. SUBTLE SIMPLEX HEAD SWAY & ATTENTIVE TILT
    // head_angle = A * sin(t * 0.3)
    // -------------------------------------------------------------------------
    const baseHeadSwayYaw = Math.sin(this.timeSec * 0.45) * 3.6 * motionIntensity;
    const baseHeadSwayPitch = Math.sin(this.timeSec * 0.65) * 2.8 * motionIntensity;
    const baseHeadSwayRoll = Math.sin(this.timeSec * 0.38) * 2.6 * motionIntensity;

    // Head follows gaze with a gentle lag (expressive, natural follow)
    const gazeYaw = this.currentGaze.x * 14.0 * motionIntensity;
    const gazePitch = -this.currentGaze.y * 10.0 * motionIntensity;
    const gazeRoll = this.currentGaze.x * 5.5 * motionIntensity;

    // -------------------------------------------------------------------------
    // 5. THERAPEUTIC LISTENING NODS (easeOutBack into easeInOutSine)
    // -------------------------------------------------------------------------
    let nodPitch = 0;
    let nodRoll = 0;

    if (this.activeNod) {
      const elapsed = (nowMs - this.activeNod.startTime) * 0.001;
      const durationSec = this.activeNod.duration * 0.001;
      const p = Math.min(1.0, elapsed / durationSec);

      if (p < 0.45) {
        // Dip with easeOutBack overshoot
        const t = p / 0.45;
        nodPitch = this.activeNod.amplitude * AnimeEasing.easeOutBack(t);
        nodRoll = 2.4 * Math.sin(t * Math.PI); // subtle reassuring tilt
      } else if (p < 1.0) {
        // Return with smooth easeInOutSine
        const t = (p - 0.45) / 0.55;
        const returnFactor = 0.5 * (1.0 + Math.cos(t * Math.PI));
        nodPitch = this.activeNod.amplitude * returnFactor;
        nodRoll = 2.4 * returnFactor;
      } else {
        this.activeNod = null;
      }
    }

    // Periodic autonomous listening nods (every 4-7 seconds when listening)
    if (this.enableAutoNods && !this.activeNod) {
      this.autoNodTimer += dt;
      if (this.autoNodTimer >= this.nextAutoNodTime) {
        this.autoNodTimer = 0;
        this.nextAutoNodTime = 4.0 + Math.random() * 3.5;
        this.triggerNod(isSpeaking ? 2.0 : 3.8, 950);
      }
    }

    // -------------------------------------------------------------------------
    // 5B. ACTIVE THERAPEUTIC HEAD GESTURE PROCESSING
    // -------------------------------------------------------------------------
    let gestureYaw = 0;
    let gesturePitch = 0;
    let gestureRoll = 0;

    if (this.activeGesture) {
      const elapsed = nowMs - this.activeGesture.startTime;
      const p = Math.min(1.0, elapsed / this.activeGesture.duration);
      if (p >= 1.0) {
        this.activeGesture = null;
      } else {
        switch (this.activeGesture.type) {
          case 'agree_nod': {
            const envelope = Math.sin(p * Math.PI);
            // Expressive double-dip affirmation nod: graceful, subtle therapeutic double nod
            const nodWave = Math.sin(p * Math.PI * 4.0 - Math.PI * 0.5) * 0.5 + 0.5;
            gesturePitch = nodWave * 5.2 * envelope;
            gestureRoll = Math.sin(p * Math.PI * 2.0) * 1.5 * envelope;
            gestureYaw = Math.sin(p * Math.PI * 1.5) * 1.0 * envelope;
            break;
          }
          case 'deep_empathy_nod': {
            let tCurve: number;
            if (p < 0.35) {
              const t = p / 0.35;
              tCurve = t * t * (3 - 2 * t);
            } else if (p < 0.70) {
              tCurve = 1.0 + Math.sin((p - 0.35) / 0.35 * Math.PI) * 0.08;
            } else {
              const t = (1.0 - p) / 0.30;
              tCurve = t * t * (3 - 2 * t);
            }
            // Deep, compassionate dip down/front with hold and return
            gesturePitch = tCurve * 6.5;
            gestureRoll = tCurve * 2.8;  // side-to-side compassionate tilt
            gestureYaw = tCurve * -2.4;  // attentive turn toward client
            break;
          }
          case 'curious_tilt': {
            const envelope = Math.sin(p * Math.PI);
            // Expressive side-to-side inquisitive tilt
            gestureRoll = envelope * 6.5;
            gesturePitch = -envelope * 2.0; // slight perk up
            gestureYaw = envelope * 3.0;    // turn side to side
            break;
          }
          case 'reassuring_shake': {
            const envelope = Math.sin(p * Math.PI);
            // Expressive side-to-side gentle head shake
            const shake = Math.sin(p * Math.PI * 5.0);
            gestureYaw = shake * 4.8 * envelope;
            gestureRoll = shake * -1.8 * envelope;
            gesturePitch = Math.abs(shake) * 1.0 * envelope;
            break;
          }
          case 'alert_perk': {
            const envelope = Math.sin(p * Math.PI);
            gesturePitch = -envelope * 4.5; // perk head up and back
            gestureYaw = envelope * -1.8;
            gestureRoll = envelope * 1.5;
            break;
          }
        }
      }
    }

    const finalYaw = baseHeadSwayYaw + gazeYaw + gestureYaw;
    const finalPitch = baseHeadSwayPitch + gazePitch + nodPitch + gesturePitch;
    const finalRoll = baseHeadSwayRoll + gazeRoll + nodRoll + gestureRoll;

    // -------------------------------------------------------------------------
    // 6. CERVICAL SPINE MECHANICS & 3D HEAD TRANSLATION
    // Nodding = UP & DOWN (pitch translation Y)
    // Sways = SIDE to SIDE (roll tilt, yaw turn, and lateral translation X)
    // -------------------------------------------------------------------------
    const radRoll = (finalRoll * Math.PI) / 180;
    const radYaw = (finalYaw * Math.PI) / 180;

    // Side to side lateral shift: lateral head sway + neck tilt (prominent, organic)
    const cervicalTransX = (Math.sin(radRoll) * 18.0 + Math.sin(radYaw) * 14.0) * motionIntensity;

    // Up and down vertical dip: head pitch dip (nod down/up) + cervical arch (prominent, natural)
    const cervicalTransY = (finalPitch * 1.35 + (1.0 - Math.cos(radRoll)) * 4.5) * motionIntensity;

    // -------------------------------------------------------------------------
    // 6B. SOLID ANATOMICAL SKULL (Rigid structural geometry, zero rubber ballooning)
    // -------------------------------------------------------------------------
    const depthScale = 1.0;

    // -------------------------------------------------------------------------
    // 7. SOFT CALM SPRING PHYSICS FOR JHUMKA EARRINGS
    // -------------------------------------------------------------------------
    const dRoll = finalRoll - this.lastRoll;
    const dYaw = finalYaw - this.lastYaw;
    const dPitch = finalPitch - this.lastPitch;
    this.lastRoll = finalRoll;
    this.lastYaw = finalYaw;
    this.lastPitch = finalPitch;

    const externalInertia = (dRoll * 2.8 + dYaw * 2.0 + Math.abs(dPitch) * 1.6) * motionIntensity;
    const jhumkaLeftAngle = this.jhumkaL.update(0, dt, externalInertia);
    const jhumkaRightAngle = this.jhumkaR.update(0, dt, externalInertia * 0.95);

    const speed = Math.abs(this.jhumkaL.velocity) + Math.abs(this.jhumkaR.velocity);
    const jhumkaSparkleIntensity = Math.min(1.0, speed * 0.04);

    // Dynamic front hair lock inertia (spring-damped follow-through across blazer)
    const externalHairInertia = (-dYaw * 2.2 - dRoll * 2.6) * motionIntensity;
    const hairLagOffsetX = Math.max(-12, Math.min(12, this.hairSpring.update(0, dt, externalHairInertia)));

    // -------------------------------------------------------------------------
    // 7B. ARTICULATED EYEBROWS (Kyoto Animation Micro-Acting, Item 1.3)
    // -------------------------------------------------------------------------
    let browLeftY = 0;
    let browRightY = 0;
    let browTiltLeft = 0;
    let browTiltRight = 0;

    if (this.activeGesture) {
      const elapsed = nowMs - this.activeGesture.startTime;
      const p = Math.min(1.0, elapsed / this.activeGesture.duration);
      const envelope = Math.sin(p * Math.PI);
      if (this.activeGesture.type === 'curious_tilt') {
        // Inquisitive asymmetric brow lift: left brow arches +2.5px, right brow rests poised
        browLeftY = -2.5 * envelope;
        browRightY = 0.4 * envelope;
        browTiltLeft = -2.0 * envelope;
        browTiltRight = 0.5 * envelope;
      } else if (this.activeGesture.type === 'deep_empathy_nod') {
        // Warm inner brow empathy arch: medial corners elevate +1.8px inward
        browLeftY = -1.8 * envelope;
        browRightY = -1.8 * envelope;
        browTiltLeft = 1.8 * envelope;
        browTiltRight = -1.8 * envelope;
      } else if (this.activeGesture.type === 'agree_nod') {
        // Attentive brow perk
        browLeftY = -1.2 * envelope;
        browRightY = -1.2 * envelope;
      } else if (this.activeGesture.type === 'alert_perk') {
        browLeftY = -3.0 * envelope;
        browRightY = -3.0 * envelope;
      }
    }

    // Subtle breathing micro-variation on brows
    const browBreath = Math.sin(this.timeSec * 0.7) * 0.35 * motionIntensity;
    browLeftY += browBreath;
    browRightY += browBreath;

    // -------------------------------------------------------------------------
    // 8. NOTE-TAKING DESK PEN ARTICULATION
    // -------------------------------------------------------------------------
    this.penProgress += dt * 3.5;
    const penTipX = 640 + Math.sin(this.penProgress) * 12;
    const penTipY = 720 + Math.cos(this.penProgress * 2.0) * 4;

    // -------------------------------------------------------------------------
    // 9. CINEMATIC BREATHING CAMERA PUSH-IN (Slow 20s cycle)
    // scale(t) = 1 + 0.05 * easeInOutSine(t / 20)
    // -------------------------------------------------------------------------
    const cameraCycle = (Math.sin(this.timeSec * 0.31) * 0.5 + 0.5);
    const cinematicZoom = 1.0 + 0.045 * (0.5 * (1.0 - Math.cos(cameraCycle * Math.PI)));

    return {
      yaw: finalYaw,
      pitch: finalPitch,
      roll: finalRoll,
      cervicalTransX,
      cervicalTransY,
      depthScale,
      chestLiftY,
      shoulderLiftY,
      torsoScaleX,
      torsoScaleY,
      pupilOffsetX,
      pupilOffsetY,
      eyeSaccadeX: this.saccadeOffset.x,
      eyeSaccadeY: this.saccadeOffset.y,
      blinkProgress: this.blinkProgress,
      jawDropY: 0,
      jhumkaLeftAngle: Math.max(-20, Math.min(20, jhumkaLeftAngle)),
      jhumkaRightAngle: Math.max(-20, Math.min(20, jhumkaRightAngle)),
      jhumkaSparkleIntensity,
      hairLagOffsetX,
      browLeftY,
      browRightY,
      browTiltLeft,
      browTiltRight,
      penTipX,
      penTipY,
      isWriting: this.isGlancingAtNotes,
      cinematicZoom
    };
  }
}

export const globalTherapistKinematics = new TherapistKinematicsEngine();
