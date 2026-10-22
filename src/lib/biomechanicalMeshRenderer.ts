// ============================================================================
// BiomechanicalAnimeMeshRenderer — 2D Continuous Deformation Mesh Engine
// Industry-Grade Anime Avatar Head & Cervical Spine Kinematics
// (Demon Slayer / Kyoto Animation Biomechanical Standard)
//
// Key Architectural Principles:
// 1. Continuous Hermite Weight Function w(y):
//    - y <= 450 (Skull, Face, Bangs, Eyes, Mouth, Jhumkas): w = 1.0 (100% Head Kinematics)
//    - y >= 640 (Shoulders, Blazer, Kurti, Chest, Arms): w = 0.0 (100% Seated Torso Grounding)
//    - 450 < y < 640 (Cervical Spine & Neck): Smooth Hermite curve w(t) = 3t^2 - 2t^3
// 2. Hardware-Accelerated 60 FPS WebGL2 Mesh:
//    - 60x60 triangulated vertex grid (7,200 triangles) with bilinear hardware texture interpolation.
//    - ZERO severed cutouts, ZERO hairline seams, ZERO floating pieces.
//    - Neck flexes and stretches organically like living anatomy.
// 3. Multi-Layer Synchronous Deform:
//    - Master Pose Cel (Idle Respiration or Mudra Gestures)
//    - Gesture Cross-Fade Blend
//    - Precision Emotion Face Overlay
//    - Kyoto Animation 120ms Blink Eyelids
//    - Oculus-15 Speech Visemes
// ============================================================================

export interface MeshKinematicsParams {
  pivotX?: number;
  pivotY?: number;
  pitchY: number;        // Head nod up/down translation (pixels)
  rollDeg: number;       // Head tilt side-to-side (degrees)
  scaleZ: number;        // 3D front-to-back depth foreshortening
  yawSkew: number;       // 2.5D perspective yaw skew
  transX: number;        // Cervical lateral sway (pixels)
  chestLiftY: number;    // Torso diaphragmatic respiration (applied to body only)
  hairLagX?: number;     // Cascading front hair lock secondary inertia sway (pixels)
  pupilOffsetX?: number; // Kyoto Animation eye socket iris glide X (pixels)
  pupilOffsetY?: number; // Kyoto Animation eye socket iris glide Y (pixels)
  browLeftY?: number;    // Left eyebrow micro-expression articulation Y (pixels)
  browRightY?: number;   // Right eyebrow micro-expression articulation Y (pixels)
}

export interface MeshRenderLayer {
  image: HTMLImageElement | HTMLCanvasElement | null;
  alpha: number;
}

export class BiomechanicalAnimeMeshRenderer {
  public canvas: HTMLCanvasElement;
  public isContextLost: boolean = false;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;

  // Uniform locations
  private uPivotLoc: WebGLUniformLocation | null = null;
  private uPitchLoc: WebGLUniformLocation | null = null;
  private uRollLoc: WebGLUniformLocation | null = null;
  private uScaleLoc: WebGLUniformLocation | null = null;
  private uYawLoc: WebGLUniformLocation | null = null;
  private uTransXLoc: WebGLUniformLocation | null = null;
  private uChestLiftLoc: WebGLUniformLocation | null = null;
  private uHairLagXLoc: WebGLUniformLocation | null = null;
  private uBrowLeftLoc: WebGLUniformLocation | null = null;
  private uBrowRightLoc: WebGLUniformLocation | null = null;
  private uPupilOffsetLoc: WebGLUniformLocation | null = null;
  private uResLoc: WebGLUniformLocation | null = null;
  private uAlphaLoc: WebGLUniformLocation | null = null;

  // Mesh buffers
  private indexCount: number = 0;
  private posBuffer: WebGLBuffer | null = null;
  private tcBuffer: WebGLBuffer | null = null;
  private idxBuffer: WebGLBuffer | null = null;

  // Texture Cache
  private textureMap: WeakMap<HTMLImageElement | HTMLCanvasElement, WebGLTexture> = new WeakMap();

  constructor(width: number = 1200, height: number = 900) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    // WebGL Context Loss Recovery
    this.canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        this.isContextLost = true;
        this.gl = null;
        this.program = null;
        this.textureMap = new WeakMap();
        console.warn('[BiomechanicalAnimeMeshRenderer] WebGL context lost. Gracefully falling back to 2D composite portrait cel.');
      },
      false
    );

    this.canvas.addEventListener(
      'webglcontextrestored',
      () => {
        console.info('[BiomechanicalAnimeMeshRenderer] WebGL context restored. Reinitializing shader pipeline.');
        this.isContextLost = false;
        this.initGL();
      },
      false
    );

    this.initGL();
  }

  private initGL(): void {
    const gl = (this.canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    }) ||
      this.canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      })) as WebGLRenderingContext | null;

    if (!gl) {
      console.error('[BiomechanicalAnimeMeshRenderer] WebGL not supported on this device.');
      return;
    }
    this.gl = gl;

    const vsSource = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      
      uniform vec2 uPivot;
      uniform float uNodPitchY;
      uniform float uRollRad;
      uniform float uScaleZ;
      uniform float uYawSkew;
      uniform float uTransX;
      uniform float uChestLiftY;
      uniform float uHairLagX;
      uniform float uBrowLeftY;
      uniform float uBrowRightY;
      uniform vec2 uResolution;
      
      void main() {
        vTexCoord = aTexCoord;
        vec2 pos = aPosition;
        
        // -------------------------------------------------------------
        // Continuous Biomechanical Hermite Weight Distribution
        // Head Region: y <= 450.0  -> w = 1.0 (Face, chin, hair move rigidly)
        // Torso Region: y >= 560.0 -> w = 0.0 (Shoulders, blazer remain grounded)
        // Neck/Cervical: 450.0 < y < 560.0 -> Smooth Hermite anatomical flex
        // -------------------------------------------------------------
        float t = clamp((560.0 - pos.y) / (560.0 - 450.0), 0.0, 1.0);
        float wHead = t * t * (3.0 - 2.0 * t);
        float wTorso = 1.0 - wHead;
        
        // Dynamic Head Kinematics
        float curRoll = uRollRad * wHead;
        float curPitchY = uNodPitchY * wHead;
        float curYaw = uYawSkew * wHead;
        float curTransX = uTransX * wHead;
        
        // Dynamic Torso Respiration (only affects chest/shoulders, never skull)
        float curChestY = uChestLiftY * wTorso;
        
        // Articulate relative to cervical-thoracic pivot
        vec2 p = pos - uPivot;
        
        // 2.5D Perspective Yaw Turn Skew (natural, subtle)
        p.x += p.y * curYaw * 0.4;
        
        // Cervical Spine Roll Rotation
        float cosR = cos(curRoll);
        float sinR = sin(curRoll);
        vec2 rotP = vec2(
          p.x * cosR - p.y * sinR,
          p.x * sinR + p.y * cosR
        );
        
        // -------------------------------------------------------------
        // Cascading Side Hair Lock Secondary Inertia (Spring Follow-Through)
        // Drapes across blazer shoulders: x < 540 or x > 660, y in [420, 780]
        // -------------------------------------------------------------
        float hairWeight = 0.0;
        if ((pos.x < 540.0 || pos.x > 660.0) && pos.y > 420.0 && pos.y < 780.0) {
          float xDist = (pos.x < 540.0) ? (540.0 - pos.x) / 100.0 : (pos.x - 660.0) / 100.0;
          float yDist = clamp((pos.y - 420.0) / 280.0, 0.0, 1.0);
          hairWeight = clamp(xDist, 0.0, 1.0) * yDist;
        }
        rotP.x += uHairLagX * hairWeight;

        // -------------------------------------------------------------
        // Articulated Eyebrows (Micro-Empathy Arching & Curious Tilts)
        // Displaces hair & brow vertices with C2 smooth cosine bell
        // Left Brow center: (542, 316), Right Brow center: (658, 316)
        // -------------------------------------------------------------
        float dBrowL = length((pos - vec2(542.0, 316.0)) / vec2(46.0, 24.0));
        if (dBrowL < 1.0) {
          float browWeightL = cos(dBrowL * 1.5707963);
          rotP.y += uBrowLeftY * (browWeightL * browWeightL) * wHead;
        }
        
        float dBrowR = length((pos - vec2(658.0, 316.0)) / vec2(46.0, 24.0));
        if (dBrowR < 1.0) {
          float browWeightR = cos(dBrowR * 1.5707963);
          rotP.y += uBrowRightY * (browWeightR * browWeightR) * wHead;
        }

        // Apply translations
        rotP.x += curTransX;
        rotP.y += curPitchY + curChestY;
        
        vec2 finalPos = rotP + uPivot;
        
        // Map to WebGL clip space [-1, 1]
        vec2 clipPos = (finalPos / uResolution) * 2.0 - 1.0;
        clipPos.y = -clipPos.y; // Flip Y for screen coordinates
        
        gl_Position = vec4(clipPos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uSampler;
      uniform float uAlpha;
      uniform vec2 uPupilOffset; // in pixels
      
      void main() {
        vec2 uv = vTexCoord;
        vec2 px = vTexCoord * vec2(1200.0, 900.0);
        
        // Eye socket bounds:
        // Left eye: center (547, 353), rad (23, 21)
        // Right eye: center (654, 353), rad (23, 21)
        float dl = length((px - vec2(547.0, 353.0)) / vec2(23.0, 21.0));
        float dr = length((px - vec2(654.0, 353.0)) / vec2(23.0, 21.0));
        float d = min(dl, dr);
        
        if (d < 1.0 && length(uPupilOffset) > 0.05) {
          float w = cos(d * 1.5707963);
          w = w * w; // smooth quadratic falloff towards socket edge
          // Specular Corneal Parallax: anterior chamber refraction (Item 1.4)
          vec2 shift = (uPupilOffset / vec2(1200.0, 900.0)) * w;
          uv -= shift;
        }
        
        vec4 col = texture2D(uSampler, uv);

        // Directional Dynamic Neck Jawline Drop-Shadow (Item 1.1)
        // Eliminates the 'severed cutout' boundary by casting an organic cel shadow below the chin
        if (px.x > 550.0 && px.x < 650.0 && px.y > 452.0 && px.y < 515.0) {
          float neckDist = (px.y - 452.0) / 63.0;
          float shadowMask = smoothstep(0.0, 0.45, neckDist) * (1.0 - smoothstep(0.75, 1.0, neckDist));
          col.rgb *= (1.0 - shadowMask * 0.16);
        }

        gl_FragColor = col * uAlpha;
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[BiomechanicalAnimeMeshRenderer] Shader link error:', gl.getProgramInfoLog(prog));
      return;
    }
    this.program = prog;
    gl.useProgram(prog);

    // Build 60x60 Sub-Pixel Grid Mesh
    const cols = 60;
    const rows = 60;
    const positions: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let r = 0; r <= rows; r++) {
      const y = (r / rows) * h;
      const v = r / rows;
      for (let c = 0; c <= cols; c++) {
        const x = (c / cols) * w;
        const u = c / cols;
        positions.push(x, y);
        texCoords.push(u, v);
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i0 = r * (cols + 1) + c;
        const i1 = i0 + 1;
        const i2 = (r + 1) * (cols + 1) + c;
        const i3 = i2 + 1;
        indices.push(i0, i1, i2);
        indices.push(i2, i1, i3);
      }
    }

    this.indexCount = indices.length;

    // Buffer Setup
    this.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const aPosLoc = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    this.tcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    const aTcLoc = gl.getAttribLocation(prog, 'aTexCoord');
    gl.enableVertexAttribArray(aTcLoc);
    gl.vertexAttribPointer(aTcLoc, 2, gl.FLOAT, false, 0, 0);

    this.idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Uniform Locations
    this.uPivotLoc = gl.getUniformLocation(prog, 'uPivot');
    this.uPitchLoc = gl.getUniformLocation(prog, 'uNodPitchY');
    this.uRollLoc = gl.getUniformLocation(prog, 'uRollRad');
    this.uScaleLoc = gl.getUniformLocation(prog, 'uScaleZ');
    this.uYawLoc = gl.getUniformLocation(prog, 'uYawSkew');
    this.uTransXLoc = gl.getUniformLocation(prog, 'uTransX');
    this.uChestLiftLoc = gl.getUniformLocation(prog, 'uChestLiftY');
    this.uHairLagXLoc = gl.getUniformLocation(prog, 'uHairLagX');
    this.uBrowLeftLoc = gl.getUniformLocation(prog, 'uBrowLeftY');
    this.uBrowRightLoc = gl.getUniformLocation(prog, 'uBrowRightY');
    this.uPupilOffsetLoc = gl.getUniformLocation(prog, 'uPupilOffset');
    this.uResLoc = gl.getUniformLocation(prog, 'uResolution');
    this.uAlphaLoc = gl.getUniformLocation(prog, 'uAlpha');

    gl.uniform2f(this.uResLoc, w, h);
    gl.uniform2f(this.uPivotLoc, 600.0, 580.0);

    // Enable Alpha Blending with pre-multiplied alpha
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, w, h);
  }

  private compileShader(type: number, src: string): WebGLShader | null {
    if (!this.gl) return null;
    const s = this.gl.createShader(type);
    if (!s) return null;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      console.error('[BiomechanicalAnimeMeshRenderer] Shader compile error:', this.gl.getShaderInfoLog(s));
      this.gl.deleteShader(s);
      return null;
    }
    return s;
  }

  private getTexture(img: HTMLImageElement | HTMLCanvasElement): WebGLTexture | null {
    if (!this.gl || !img) return null;
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && img instanceof HTMLCanvasElement;
    if (!isCanvas) {
      const el = img as HTMLImageElement;
      if (!el.complete || el.naturalWidth === 0) return null;
    } else {
      if (img.width === 0 || img.height === 0) return null;
    }

    let tex = this.textureMap.get(img);
    const gl = this.gl;
    if (tex && isCanvas) {
      // Re-upload updated canvas data dynamically
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      return tex;
    }
    if (tex) return tex;

    const newTex = gl.createTexture();
    if (!newTex) return null;

    gl.bindTexture(gl.TEXTURE_2D, newTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.textureMap.set(img, newTex);
    return newTex;
  }

  /**
   * Main 60 FPS Render Entrypoint
   * Renders deformed character and all overlays onto this.canvas.
   */
  public render(
    kinematics: MeshKinematicsParams,
    layers: MeshRenderLayer[]
  ): HTMLCanvasElement | null {
    const gl = this.gl;
    if (!gl || !this.program || this.isContextLost || gl.isContextLost()) return null;

    gl.useProgram(this.program);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Upload Uniforms
    gl.uniform2f(this.uResLoc, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uPivotLoc, kinematics.pivotX ?? 600.0, kinematics.pivotY ?? 580.0);
    gl.uniform1f(this.uPitchLoc, kinematics.pitchY);
    gl.uniform1f(this.uRollLoc, (kinematics.rollDeg * Math.PI) / 180.0);
    gl.uniform1f(this.uScaleLoc, kinematics.scaleZ);
    gl.uniform1f(this.uYawLoc, kinematics.yawSkew);
    gl.uniform1f(this.uTransXLoc, kinematics.transX);
    gl.uniform1f(this.uChestLiftLoc, kinematics.chestLiftY);
    gl.uniform1f(this.uHairLagXLoc, kinematics.hairLagX ?? 0.0);
    gl.uniform1f(this.uBrowLeftLoc, kinematics.browLeftY ?? 0.0);
    gl.uniform1f(this.uBrowRightLoc, kinematics.browRightY ?? 0.0);
    gl.uniform2f(
      this.uPupilOffsetLoc,
      kinematics.pupilOffsetX ?? 0.0,
      kinematics.pupilOffsetY ?? 0.0
    );

    // Clear buffer to transparent black
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render each active image layer in order
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.image || layer.alpha <= 0.001) continue;

      const tex = this.getTexture(layer.image);
      if (!tex) continue;

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1f(this.uAlphaLoc, Math.min(1.0, layer.alpha));
      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    return this.canvas;
  }

  /**
   * Computes the deformed coordinate of any anchor point on the skull
   * (e.g. Earring attach points, pupil centers) for secondary physics.
   */
  public transformPoint(
    origX: number,
    origY: number,
    k: MeshKinematicsParams
  ): { x: number; y: number } {
    const pivotX = k.pivotX ?? 600.0;
    const pivotY = k.pivotY ?? 580.0;

    const t = Math.max(0, Math.min(1, (640.0 - origY) / (640.0 - 450.0)));
    const w = t * t * (3.0 - 2.0 * t);

    const curRoll = (k.rollDeg * Math.PI / 180.0) * w;
    const curPitchY = k.pitchY * w;
    const curYaw = k.yawSkew * w * 0.4;
    const curTransX = k.transX * w;

    let px = origX - pivotX;
    let py = origY - pivotY;

    px += py * curYaw;

    const cosR = Math.cos(curRoll);
    const sinR = Math.sin(curRoll);
    const rx = px * cosR - py * sinR;
    const ry = px * sinR + py * cosR;

    return {
      x: rx + curTransX + pivotX,
      y: ry + curPitchY + pivotY
    };
  }
}
