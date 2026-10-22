// ============================================================================
// Demon Slayer / Ufotable High-Fidelity 60 FPS Particle Engine
// Simulates Wisteria Blossoms, Hinokami Solar Embers, Kyoto Rain & Sun Motes
// ============================================================================

import { AtmosphereMode } from './avatarTypes';

export interface AnimeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  rotation: number;
  rotSpeed: number;
  flipAngle: number; // 3D leaf tumble angle
  flipSpeed: number;
  phase: number;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  aspect: number;
}

export class DemonSlayerParticleEngine {
  private particles: AnimeParticle[] = [];
  private mode: AtmosphereMode = 'wisteria';
  private width: number = 1200;
  private height: number = 900;
  private intensity: number = 1.0;

  constructor(width: number = 1200, height: number = 900) {
    this.width = width;
    this.height = height;
  }

  public setMode(mode: AtmosphereMode, count: number = 45): void {
    this.mode = mode;
    this.initParticles(count);
  }

  public setIntensity(val: number): void {
    this.intensity = Math.max(0, Math.min(2.0, val));
  }

  public resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }

  private initParticles(targetCount: number): void {
    this.particles = [];
    const count = Math.round(targetCount * this.intensity);
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(randomizeY: boolean = false): AnimeParticle {
    const y = randomizeY ? Math.random() * this.height : (this.mode === 'solar' ? this.height + 20 : -30);
    const x = Math.random() * this.width;

    switch (this.mode) {
      case 'wisteria': {
        // Floating purple wisteria petals and spirit motes
        const isMote = Math.random() < 0.28;
        const colors = ['#c084fc', '#e879f9', '#a855f7', '#d8b4fe', '#818cf8'];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        return {
          x,
          y,
          vx: (Math.random() - 0.45) * 1.2,
          vy: 0.8 + Math.random() * 1.6,
          size: isMote ? 2.5 + Math.random() * 3.5 : 7.0 + Math.random() * 9.0,
          opacity: 0.35 + Math.random() * 0.55,
          baseOpacity: 0.35 + Math.random() * 0.55,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          flipAngle: Math.random() * Math.PI,
          flipSpeed: 0.02 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
          color: chosenColor,
          glowColor: isMote ? 'rgba(192, 132, 252, 0.8)' : 'rgba(232, 121, 249, 0.4)',
          life: 0,
          maxLife: 300 + Math.random() * 300,
          aspect: isMote ? 1.0 : 1.6 + Math.random() * 0.8
        };
      }

      case 'solar': {
        // Rising Hinokami solar embers & sparks
        const isSpark = Math.random() < 0.35;
        const colors = ['#f59e0b', '#fbbf24', '#f97316', '#ef4444', '#fde047'];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -(1.5 + Math.random() * 3.2),
          size: isSpark ? 1.8 + Math.random() * 2.5 : 4.0 + Math.random() * 5.5,
          opacity: 0.5 + Math.random() * 0.5,
          baseOpacity: 0.5 + Math.random() * 0.5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
          flipAngle: 0,
          flipSpeed: 0,
          phase: Math.random() * Math.PI * 2,
          color: chosenColor,
          glowColor: 'rgba(251, 191, 36, 0.75)',
          life: 0,
          maxLife: 180 + Math.random() * 240,
          aspect: isSpark ? 2.5 : 1.2
        };
      }

      case 'rainy': {
        // Falling rain streaks with slight angle
        return {
          x,
          y,
          vx: -0.8 - Math.random() * 0.4,
          vy: 14.0 + Math.random() * 10.0,
          size: 1.2 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.45,
          baseOpacity: 0.2 + Math.random() * 0.45,
          rotation: -0.06,
          rotSpeed: 0,
          flipAngle: 0,
          flipSpeed: 0,
          phase: 0,
          color: 'rgba(186, 230, 253, 0.65)',
          glowColor: 'rgba(56, 189, 248, 0.3)',
          life: 0,
          maxLife: 120,
          aspect: 24.0 // long streak
        };
      }

      case 'studio':
      default: {
        // Gentle golden/cyan dust motes floating in sunbeam
        const isCyan = Math.random() < 0.5;
        const color = isCyan ? 'rgba(56, 189, 248, 0.8)' : 'rgba(251, 191, 36, 0.8)';
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.2 - Math.random() * 0.4,
          size: 2.0 + Math.random() * 3.5,
          opacity: 0.25 + Math.random() * 0.5,
          baseOpacity: 0.25 + Math.random() * 0.5,
          rotation: 0,
          rotSpeed: 0,
          flipAngle: 0,
          flipSpeed: 0,
          phase: Math.random() * Math.PI * 2,
          color,
          glowColor: isCyan ? 'rgba(56, 189, 248, 0.6)' : 'rgba(251, 191, 36, 0.6)',
          life: 0,
          maxLife: 260 + Math.random() * 260,
          aspect: 1.0
        };
      }
    }
  }

  public update(timeSec: number): void {
    if (this.intensity <= 0.05) return;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life++;

      if (this.mode === 'wisteria') {
        // Sinusoidal wind sway & flutter
        p.x += p.vx + Math.sin(timeSec * 2.2 + p.phase) * 1.2;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.flipAngle += p.flipSpeed;
        p.opacity = p.baseOpacity * (0.8 + 0.2 * Math.sin(timeSec * 3.0 + p.phase));

        // Respawn if out of viewport
        if (p.y > this.height + 40 || p.x < -40 || p.x > this.width + 40 || p.life > p.maxLife) {
          this.particles[i] = this.createParticle(false);
        }
      } else if (this.mode === 'solar') {
        // Convective buoyancy + heat flicker
        p.x += p.vx + Math.sin(timeSec * 4.5 + p.phase) * 1.6;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = p.baseOpacity * Math.max(0, 1 - p.life / p.maxLife);

        if (p.y < -30 || p.life > p.maxLife) {
          this.particles[i] = this.createParticle(false);
        }
      } else if (this.mode === 'rainy') {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y > this.height + 30) {
          this.particles[i] = this.createParticle(false);
        }
      } else {
        // Ambient dust drift
        p.x += p.vx + Math.sin(timeSec * 0.8 + p.phase) * 0.4;
        p.y += p.vy;
        p.opacity = p.baseOpacity * (0.6 + 0.4 * Math.sin(timeSec * 1.8 + p.phase));

        if (p.y < -20 || p.y > this.height + 20 || p.x < -20 || p.x > this.width + 20 || p.life > p.maxLife) {
          this.particles[i] = this.createParticle(false);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.intensity <= 0.05) return;

    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      if (this.mode === 'wisteria') {
        // 3D Petal or glowing mote
        const scaleY = Math.cos(p.flipAngle);
        ctx.scale(1.0, scaleY);

        if (p.aspect > 1.2) {
          // Petal oval with soft tip
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 8;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.55, p.size * p.aspect * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Circular glowing spirit mote
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.mode === 'solar') {
        // Glowing solar spark / ember
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 14;
        ctx.fillStyle = p.color;
        if (p.aspect > 1.8) {
          // Streaking spark
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.4, p.size * p.aspect * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Diamond ember
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        }
      } else if (this.mode === 'rainy') {
        // Falling rain streak
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-p.vx * 2, p.vy * 1.5);
        ctx.stroke();
      } else {
        // Ambient dust mote
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }
}
