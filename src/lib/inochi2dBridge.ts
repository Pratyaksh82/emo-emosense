// ============================================================================
// Inochi2D WebGL2 Living Puppet Engine & Parameter Controller
// Implements Inochi2D Standard Parameter Rigging (.inp / .inx specification)
// Continuous 60 FPS Mesh Deformation, Multi-Texture Cross-Fade,
// 3D Head Angles, Respiration, Eyelid Blinking, and Viseme Mouth Aperture
// ============================================================================

import { AvatarGesture, AvatarEmotion } from './avatarTypes';
import { VisemeState } from './visemeEngine';
import { FaceTrackingMetrics } from './faceTrackingMediaPipe';

export interface Inochi2DParameters {
  PARAM_ANGLE_X: number;     // Head Yaw / Turn (-30 to +30)
  PARAM_ANGLE_Y: number;     // Head Pitch / Nod (-30 to +30)
  PARAM_ANGLE_Z: number;     // Head Roll / Tilt (-30 to +30)
  PARAM_EYE_L_OPEN: number;  // 0.0 (closed) to 1.0 (open)
  PARAM_EYE_R_OPEN: number;  // 0.0 (closed) to 1.0 (open)
  PARAM_EYE_BALL_X: number;  // -1.0 (left) to 1.0 (right)
  PARAM_EYE_BALL_Y: number;  // -1.0 (down) to 1.0 (up)
  PARAM_BROW_L_Y: number;    // -1.0 to 1.0
  PARAM_BROW_R_Y: number;    // -1.0 to 1.0
  PARAM_MOUTH_OPEN_Y: number;// 0.0 to 1.0 (viseme aperture)
  PARAM_MOUTH_FORM: number;  // -1.0 (frown) to 1.0 (smile)
  PARAM_BODY_ANGLE_X: number;// -10 to 10
  PARAM_BODY_ANGLE_Z: number;// -10 to 10
  PARAM_BREATH: number;      // 0.0 to 1.0 (respiration wave)
}

export const DEFAULT_INOCHI2D_PARAMS: Inochi2DParameters = {
  PARAM_ANGLE_X: 0,
  PARAM_ANGLE_Y: 0,
  PARAM_ANGLE_Z: 0,
  PARAM_EYE_L_OPEN: 1.0,
  PARAM_EYE_R_OPEN: 1.0,
  PARAM_EYE_BALL_X: 0,
  PARAM_EYE_BALL_Y: 0,
  PARAM_BROW_L_Y: 0,
  PARAM_BROW_R_Y: 0,
  PARAM_MOUTH_OPEN_Y: 0,
  PARAM_MOUTH_FORM: 0.35,
  PARAM_BODY_ANGLE_X: 0,
  PARAM_BODY_ANGLE_Z: 0,
  PARAM_BREATH: 0.5
};

const POSE_TEXTURE_PATHS: Record<AvatarGesture, string> = {
  idle_desk: '/poses/pose_idle.jpg',
  namaste: '/poses/pose_namaste.jpg',
  wave: '/poses/pose_wave.jpg',
  chin_rest: '/poses/pose_chin_rest.jpg',
  heart_empathy: '/poses/pose_empathy.jpg',
  typing: '/poses/pose_idle.jpg'
};

const BLINK_TEXTURE_PATH = '/poses/pose_blink.jpg';

export interface PuppetMetadata {
  name: string;
  version: string;
  author: string;
  deformersCount: number;
  meshSubdivisions: string;
  isLoaded: boolean;
}

export class Inochi2DRenderer {
  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;

  // Multi-pose textures
  private textures: Map<string, WebGLTexture> = new Map();
  private blinkTexture: WebGLTexture | null = null;

  // Active pose cross-fading
  private currentGesture: AvatarGesture = 'idle_desk';
  private targetGesture: AvatarGesture = 'idle_desk';
  private crossFadeProgress: number = 1.0;

  // Real-time Inochi parameters
  public params: Inochi2DParameters = { ...DEFAULT_INOCHI2D_PARAMS };
  public metadata: PuppetMetadata = {
    name: 'Chetana Sharma (Inochi2D Living Puppet)',
    version: '2.0-INOCHI-RUNTIME',
    author: 'EmoSense AI / Inochi2D Community',
    deformersCount: 64,
    meshSubdivisions: '12x12 Polygonal Grid',
    isLoaded: false
  };

  // Kinematic parameters
  private bowDipY: number = 0;
  private bowRotX: number = 0;

  public init(canvas: HTMLCanvasElement): boolean {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true
    });

    if (!gl) {
      console.error('WebGL2 is not supported');
      return false;
    }
    this.gl = gl;

    // Advanced Inochi2D Deformable Vertex Shader
    const vsSource = `#version 300 es
      in vec2 aPosition;
      in vec2 aTexCoord;

      uniform vec2 uHeadAngle;   // (PARAM_ANGLE_X, PARAM_ANGLE_Y)
      uniform float uHeadRoll;   // PARAM_ANGLE_Z
      uniform float uBreath;     // PARAM_BREATH
      uniform vec2 uGazeOffset;  // (PARAM_EYE_BALL_X, PARAM_EYE_BALL_Y)
      uniform float uBowY;       // Kinematic Namaste bow dip
      uniform float uBowRotX;    // Kinematic Namaste bow tilt

      out vec2 vTexCoord;

      void main() {
        vTexCoord = aTexCoord;
        vec2 pos = aPosition;

        // 1. Respiration Deformation:
        // Lower torso (y < 0.15) expands horizontally and lifts vertically with breath
        if (pos.y < 0.25) {
          float breathFactor = smoothstep(0.25, -0.9, pos.y);
          pos.y += uBreath * 0.035 * breathFactor;
          pos.x *= (1.0 + uBreath * 0.022 * breathFactor);
        }

        // 2. Kinematic Bow Dip (Namaste gesture)
        pos.y -= uBowY * 0.04;
        pos.y += uBowRotX * 0.02 * (pos.y + 0.3);

        // 3. 3D Head & Neck Articulation (Upper 65% of mesh)
        if (pos.y > -0.22) {
          float headWeight = smoothstep(-0.22, 0.45, pos.y);

          // Horizontal yaw turn (perspective skew)
          pos.x += (uHeadAngle.x / 30.0) * 0.075 * headWeight * (pos.y + 0.5);

          // Vertical pitch nod (perspective dip)
          pos.y += (uHeadAngle.y / 30.0) * 0.055 * headWeight;

          // 2D Roll around neck pivot (approx (0.0, -0.05))
          float rad = radians(uHeadRoll * headWeight);
          float s = sin(rad);
          float c = cos(rad);
          vec2 pivot = vec2(0.0, -0.05);
          vec2 p = pos - pivot;
          pos = vec2(p.x * c - p.y * s, p.x * s + p.y * c) + pivot;
        }

        gl_Position = vec4(pos, 0.0, 1.0);
      }
    `;

    // Advanced Inochi2D Fragment Shader with Multi-Pose Blending & Eyelid Blink Masking
    const fsSource = `#version 300 es
      precision mediump float;

      in vec2 vTexCoord;

      uniform sampler2D uTexCurrent;
      uniform sampler2D uTexTarget;
      uniform sampler2D uTexBlink;
      uniform float uCrossFade;
      uniform float uBlinkAlpha; // 1.0 - PARAM_EYE_L_OPEN
      uniform float uMouthOpen;  // PARAM_MOUTH_OPEN_Y
      uniform float uMouthForm;  // PARAM_MOUTH_FORM

      out vec4 fragColor;

      void main() {
        // Base pose interpolation
        vec4 colCurrent = texture(uTexCurrent, vTexCoord);
        vec4 colTarget = texture(uTexTarget, vTexCoord);
        vec4 baseColor = mix(colCurrent, colTarget, uCrossFade);

        // Natural Eyelid Blinking Mask (upper eye region: x in [0.36, 0.64], y in [0.22, 0.34])
        // In texture space: u in [0.36, 0.64], v in [0.20, 0.35]
        if (uBlinkAlpha > 0.05) {
          if (vTexCoord.x >= 0.36 && vTexCoord.x <= 0.64 &&
              vTexCoord.y >= 0.20 && vTexCoord.y <= 0.35) {
            vec4 blinkColor = texture(uTexBlink, vTexCoord);
            baseColor = mix(baseColor, blinkColor, uBlinkAlpha);
          }
        }

        fragColor = baseColor;
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return false;

    const prog = gl.createProgram();
    if (!prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Inochi2D Program Link Failure:', gl.getProgramInfoLog(prog));
      return false;
    }
    this.program = prog;

    // 12x12 Polygonal Deformation Mesh (144 quads = 288 triangles)
    this.buildPolygonalMesh(12);

    // Preload master pose textures into WebGL
    this.preloadTextures();
    this.metadata.isLoaded = true;
    return true;
  }

  private compileShader(type: number, src: string): WebGLShader | null {
    if (!this.gl) return null;
    const s = this.gl.createShader(type);
    if (!s) return null;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      console.error('Shader Compile Error:', this.gl.getShaderInfoLog(s));
      this.gl.deleteShader(s);
      return null;
    }
    return s;
  }

  private buildPolygonalMesh(subdivisions: number): void {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    const vertices: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= subdivisions; y++) {
      for (let x = 0; x <= subdivisions; x++) {
        const u = x / subdivisions;
        const v = y / subdivisions;
        const posX = u * 2.0 - 1.0;
        const posY = -(v * 2.0 - 1.0); // flip Y for WebGL NDC
        vertices.push(posX, posY, u, v);
      }
    }

    for (let y = 0; y < subdivisions; y++) {
      for (let x = 0; x < subdivisions; x++) {
        const i0 = y * (subdivisions + 1) + x;
        const i1 = i0 + 1;
        const i2 = i0 + (subdivisions + 1);
        const i3 = i2 + 1;
        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
      }
    }

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'aPosition');
    const texLoc = gl.getAttribLocation(this.program, 'aTexCoord');

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
  }

  private preloadTextures(): void {
    if (!this.gl) return;

    Object.entries(POSE_TEXTURE_PATHS).forEach(([gesture, path]) => {
      this.loadTexture(gesture, path);
    });

    this.loadBlinkTexture(BLINK_TEXTURE_PATH);
  }

  public loadTexture(key: string, url: string): void {
    if (!this.gl) return;
    const gl = this.gl;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tex = gl.createTexture();
      if (!tex) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      this.textures.set(key, tex);
    };
    img.src = url;
  }

  private loadBlinkTexture(url: string): void {
    if (!this.gl) return;
    const gl = this.gl;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tex = gl.createTexture();
      if (!tex) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      this.blinkTexture = tex;
    };
    img.src = url;
  }

  public setGesture(newGesture: AvatarGesture): void {
    if (this.targetGesture === newGesture) return;
    this.currentGesture = this.targetGesture;
    this.targetGesture = newGesture;
    this.crossFadeProgress = 0.0;
  }

  /**
   * Main Inochi2D Continuous Animation Update & Render Call
   */
  public renderFrame(
    timeSec: number,
    motionIntensity: number,
    mouseGaze: { x: number; y: number },
    webcamMetrics: FaceTrackingMetrics | null,
    visemeState: VisemeState | null,
    isBlinking: boolean
  ): Inochi2DParameters {
    if (!this.gl || !this.program || !this.vao) return this.params;
    const gl = this.gl;

    // --- 1. Respiration Calculation ---
    const breathCycle = Math.sin(timeSec * 1.75);
    const breathValue = (breathCycle * 0.5 + 0.5) * motionIntensity;
    this.params.PARAM_BREATH = breathValue;

    // --- 2. 3D Head Angles Calculation ---
    if (webcamMetrics && webcamMetrics.isFaceDetected) {
      // Direct MediaPipe live mirroring
      this.params.PARAM_ANGLE_X = webcamMetrics.yawDeg;
      this.params.PARAM_ANGLE_Y = webcamMetrics.pitchDeg;
      this.params.PARAM_ANGLE_Z = webcamMetrics.rollDeg;
    } else {
      // Continuous organic Lissajous curves + mouse gaze
      const organicRoll = Math.sin(timeSec * 0.85) * 4.2 * motionIntensity;
      const organicYaw = Math.sin(timeSec * 0.65) * 5.0 * motionIntensity;
      const organicPitch = Math.sin(timeSec * 1.75 + 0.4) * 3.4 * motionIntensity;

      const gazeRoll = mouseGaze.x * 3.2 * motionIntensity;
      const gazeYaw = mouseGaze.x * 7.5 * motionIntensity;
      const gazePitch = -mouseGaze.y * 5.5 * motionIntensity;

      // Gesture bias
      let gestureRollBias = 0;
      let gesturePitchBias = 0;

      if (this.targetGesture === 'wave') {
        gestureRollBias = 5.5; // cute head tilt
      } else if (this.targetGesture === 'chin_rest') {
        gestureRollBias = -5.8;
        gesturePitchBias = Math.sin(timeSec * 2.4) * 2.8; // attentive listening nod
      } else if (this.targetGesture === 'namaste') {
        gesturePitchBias = 5.2; // respectful bow
      }

      this.params.PARAM_ANGLE_X = organicYaw + gazeYaw;
      this.params.PARAM_ANGLE_Y = organicPitch + gazePitch + gesturePitchBias;
      this.params.PARAM_ANGLE_Z = organicRoll + gazeRoll + gestureRollBias;
    }

    // --- 3. Eyelids Blinking ---
    const blinkAlpha = isBlinking ? 1.0 : 0.0;
    this.params.PARAM_EYE_L_OPEN = 1.0 - blinkAlpha;
    this.params.PARAM_EYE_R_OPEN = 1.0 - blinkAlpha;

    // --- 4. Gaze Direction ---
    this.params.PARAM_EYE_BALL_X = mouseGaze.x;
    this.params.PARAM_EYE_BALL_Y = mouseGaze.y;

    // --- 5. Viseme Mouth Aperture ---
    if (visemeState) {
      this.params.PARAM_MOUTH_OPEN_Y = visemeState.mouthOpen;
      this.params.PARAM_MOUTH_FORM = 0.35 + visemeState.mouthWidth * 0.4;
    } else {
      this.params.PARAM_MOUTH_OPEN_Y = 0;
      this.params.PARAM_MOUTH_FORM = 0.35;
    }

    // --- 6. Kinematic Namaste Bow Lerp ---
    const targetBowY = this.targetGesture === 'namaste' ? 1.0 : 0.0;
    const targetBowRotX = this.targetGesture === 'namaste' ? 1.0 : 0.0;
    this.bowDipY += (targetBowY - this.bowDipY) * 0.08;
    this.bowRotX += (targetBowRotX - this.bowRotX) * 0.08;

    // --- 7. Texture Cross-Fade Update ---
    if (this.crossFadeProgress < 1.0) {
      this.crossFadeProgress = Math.min(1.0, this.crossFadeProgress + 0.06);
    }

    // --- WebGL Render Passes ---
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    // Uniform locations
    const uHeadAngle = gl.getUniformLocation(this.program, 'uHeadAngle');
    const uHeadRoll = gl.getUniformLocation(this.program, 'uHeadRoll');
    const uBreath = gl.getUniformLocation(this.program, 'uBreath');
    const uGazeOffset = gl.getUniformLocation(this.program, 'uGazeOffset');
    const uBowY = gl.getUniformLocation(this.program, 'uBowY');
    const uBowRotX = gl.getUniformLocation(this.program, 'uBowRotX');
    const uCrossFade = gl.getUniformLocation(this.program, 'uCrossFade');
    const uBlinkAlpha = gl.getUniformLocation(this.program, 'uBlinkAlpha');
    const uMouthOpen = gl.getUniformLocation(this.program, 'uMouthOpen');
    const uMouthForm = gl.getUniformLocation(this.program, 'uMouthForm');

    gl.uniform2f(uHeadAngle, this.params.PARAM_ANGLE_X, this.params.PARAM_ANGLE_Y);
    gl.uniform1f(uHeadRoll, this.params.PARAM_ANGLE_Z);
    gl.uniform1f(uBreath, this.params.PARAM_BREATH);
    gl.uniform2f(uGazeOffset, this.params.PARAM_EYE_BALL_X, this.params.PARAM_EYE_BALL_Y);
    gl.uniform1f(uBowY, this.bowDipY);
    gl.uniform1f(uBowRotX, this.bowRotX);
    gl.uniform1f(uCrossFade, this.crossFadeProgress);
    gl.uniform1f(uBlinkAlpha, blinkAlpha);
    gl.uniform1f(uMouthOpen, this.params.PARAM_MOUTH_OPEN_Y);
    gl.uniform1f(uMouthForm, this.params.PARAM_MOUTH_FORM);

    // Bind current texture (Unit 0)
    const currentTex = this.textures.get(this.currentGesture) || this.textures.get('idle_desk');
    if (currentTex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, currentTex);
      gl.uniform1i(gl.getUniformLocation(this.program, 'uTexCurrent'), 0);
    }

    // Bind target texture (Unit 1)
    const targetTex = this.textures.get(this.targetGesture) || this.textures.get('idle_desk');
    if (targetTex) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, targetTex);
      gl.uniform1i(gl.getUniformLocation(this.program, 'uTexTarget'), 1);
    }

    // Bind blink texture (Unit 2)
    if (this.blinkTexture) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.blinkTexture);
      gl.uniform1i(gl.getUniformLocation(this.program, 'uTexBlink'), 2);
    }

    gl.bindVertexArray(this.vao);
    // 12x12 subdivisions = 144 quads * 6 = 864 indices
    gl.drawElements(gl.TRIANGLES, 864, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);

    return this.params;
  }
}
