/**

 * Features:
 * - Multi-Touch Engine with pointer tracking & haptics
 * - 2-Player Split-Screen Touch Mode for tablets/phones
 * - Responsive Canvas Auto-scaler (Retina & high-DPI crisp)
 * - Orientation detection & Fullscreen API integration
 * - Fluid stickman physics, 3-hit combos, dash/dodge, & Web Audio synth
 */

// ============================================================================
// AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Files)
// ============================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPunch(combo = 1) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const baseFreq = 140 + combo * 35;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playKick(isAir = false) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAir ? 320 : 220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.55, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playDash() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playBlock() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.setValueAtTime(620, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playJump() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(360, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playSuper() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(850, this.ctx.currentTime + 0.28);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.32);
  }

  playKO() {
    if (!this.enabled || !this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = this.ctx.currentTime + idx * 0.1;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }
}

const sfx = new SoundFX();

// ============================================================================
// HAPTIC FEEDBACK HELPER
// ============================================================================
const Haptics = {
  enabled: true,
  trigger(ms = 15) {
    if (this.enabled && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) { }
    }
  }
};

// ============================================================================
// PARTICLES & GHOST TRAILS
// ============================================================================
class Particle {
  constructor(x, y, color, vx, vy, size = 3, life = 25) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.maxLife = life;
    this.life = life;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    this.life--;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class GhostTrail {
  constructor(x, y, facing, color) {
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.color = color;
    this.life = 12;
    this.maxLife = 12;
  }

  update() {
    this.life--;
  }

  draw(ctx) {
    const alpha = Math.max(0, (this.life / this.maxLife) * 0.35);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y - 68, 11, 0, Math.PI * 2);
    ctx.moveTo(this.x, this.y - 57);
    ctx.lineTo(this.x, this.y - 28);
    ctx.moveTo(this.x, this.y - 28);
    ctx.lineTo(this.x - this.facing * 12, this.y);
    ctx.moveTo(this.x, this.y - 28);
    ctx.lineTo(this.x + this.facing * 12, this.y);
    ctx.stroke();
    ctx.restore();
  }
}

class FloatingText {
  constructor(text, x, y, color = '#EFEFEF') {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 35;
    this.maxLife = 35;
  }

  update() {
    this.y -= 1.2;
    this.life--;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 20px Orbitron, sans-serif';
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// ============================================================================
// PROJECTILE: SUPER ENERGY BLAST
// ============================================================================
class Projectile {
  constructor(x, y, dir, owner) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.owner = owner;
    this.radius = 16;
    this.speed = 13 * dir;
    this.damage = 25;
    this.color = owner.color;
    this.active = true;
  }

  update(arena) {
    this.x += this.speed;
    if (this.x < -60 || this.x > arena.width + 60) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================================
// STICKMAN FIGHTER CLASS
// ============================================================================
class Stickman {
  constructor(x, y, color, isP1 = true) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 40;
    this.height = 80;
    this.color = color;
    this.isP1 = isP1;
    this.facing = isP1 ? 1 : -1;

    // Combat Stats
    this.maxHealth = 100;
    this.health = 100;
    this.superMeter = 0;
    this.roundsWon = 0;

    // Physics & Movement
    this.speed = 6.0;
    this.jumpForce = -13.8;
    this.gravity = 0.68;
    this.grounded = false;
    this.jumpCount = 0;
    this.maxJumps = 2;

    // Drop Through, Coyote & Buffer
    this.dropThroughTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    // Dash / Dodge
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.isInvincible = false;

    // Combo System (1-2-3 Punch)
    this.comboStep = 0;
    this.comboResetTimer = 0;

    // Action Timers
    this.isBlocking = false;
    this.isPunching = false;
    this.isKicking = false;
    this.isAirKicking = false;
    this.punchTimer = 0;
    this.kickTimer = 0;
    this.hitStun = 0;
    this.isDead = false;

    this.animTime = 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.superMeter = 0;
    this.grounded = false;
    this.jumpCount = 0;
    this.isBlocking = false;
    this.isPunching = false;
    this.isKicking = false;
    this.isAirKicking = false;
    this.punchTimer = 0;
    this.kickTimer = 0;
    this.hitStun = 0;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dropThroughTimer = 0;
    this.comboStep = 0;
    this.isDead = false;
    this.facing = this.isP1 ? 1 : -1;
  }

  move(dir) {
    if (this.hitStun > 0 || this.dashTimer > 0 || this.isBlocking || this.isDead) return;
    this.vx = dir * this.speed;
    this.facing = dir;
  }

  stopMove() {
    if (this.hitStun > 0 || this.dashTimer > 0) return;
    this.vx *= 0.65;
    if (Math.abs(this.vx) < 0.2) this.vx = 0;
  }

  triggerJump() {
    this.jumpBufferTimer = 8;
  }

  executeJump(game) {
    if (this.hitStun > 0 || this.dashTimer > 0 || this.isBlocking || this.isDead) return;

    if (this.grounded || this.coyoteTimer > 0) {
      this.vy = this.jumpForce;
      this.grounded = false;
      this.coyoteTimer = 0;
      this.jumpCount = 1;
      this.jumpBufferTimer = 0;
      sfx.playJump();
      if (game) game.createSparks(this.x, this.y, '#EFEFEF', 5);
    } else if (this.jumpCount < this.maxJumps) {
      this.vy = this.jumpForce * 0.95;
      this.jumpCount++;
      this.jumpBufferTimer = 0;
      sfx.playJump();
      if (game) game.createSparks(this.x, this.y, this.color, 8);
    }
  }

  dropDown() {
    if (this.grounded && this.y < 420) {
      this.dropThroughTimer = 16;
      this.grounded = false;
      this.y += 4;
      this.vy = 2;
    }
  }

  dash(game) {
    if (this.hitStun > 0 || this.dashCooldown > 0 || this.dashTimer > 0 || this.isDead) return;
    this.dashTimer = 12;
    this.dashCooldown = 32;
    this.isInvincible = true;
    this.vx = this.facing * 14;
    this.vy = 0;
    sfx.playDash();
    Haptics.trigger(20);
    game.ghostTrails.push(new GhostTrail(this.x, this.y, this.facing, this.color));
  }

  block(active) {
    if (this.hitStun > 0 || this.dashTimer > 0 || this.isDead) return;
    this.isBlocking = active;
    if (active) this.vx = 0;
  }

  punch(opponent, game) {
    if (this.hitStun > 0 || this.dashTimer > 0 || this.isPunching || this.isKicking || this.isBlocking || this.isDead) return;

    this.comboStep = (this.comboStep % 3) + 1;
    this.comboResetTimer = 28;
    this.isPunching = true;
    this.punchTimer = 12;

    sfx.playPunch(this.comboStep);
    Haptics.trigger(15);

    const reach = 55 + (this.comboStep === 3 ? 12 : 0);
    const hitX = this.x + this.facing * reach;
    const dist = Math.abs(hitX - opponent.x);
    const vertDist = Math.abs(this.y - opponent.y);

    if (dist < 46 && vertDist < 50) {
      const isFinisher = this.comboStep === 3;
      const damage = isFinisher ? 16 : 8;
      const knockX = this.facing * (isFinisher ? 10 : 3.5);
      const knockY = isFinisher ? -7 : -2;

      opponent.takeDamage(damage, knockX, knockY, game, isFinisher ? 'COMBO' : 'PUNCH');
      this.addSuper(isFinisher ? 18 : 10);

      if (isFinisher) {
        game.addFloatingText('💥 3-HIT FINISHER!', this.x, this.y - 70, '#F9D601');
        Haptics.trigger(30);
      } else if (this.comboStep === 2) {
        game.addFloatingText('COMBO x2!', this.x, this.y - 60, this.color);
      }
    }
  }

  kick(opponent, game) {
    if (this.hitStun > 0 || this.dashTimer > 0 || this.isPunching || this.isKicking || this.isBlocking || this.isDead) return;

    this.isKicking = true;
    this.isAirKicking = !this.grounded;
    this.kickTimer = 18;

    if (this.isAirKicking) {
      this.vy = 8;
      this.vx = this.facing * 7;
      sfx.playKick(true);
      game.addFloatingText('⚡ DIVE KICK!', this.x, this.y - 60, '#F9D601');
    } else {
      sfx.playKick(false);
    }
    Haptics.trigger(20);

    const reach = 65;
    const hitX = this.x + this.facing * reach;
    const dist = Math.abs(hitX - opponent.x);
    const vertDist = Math.abs(this.y - opponent.y);

    if (dist < 52 && vertDist < 55) {
      const damage = this.isAirKicking ? 20 : 16;
      const knockX = this.facing * (this.isAirKicking ? 8 : 11);
      const knockY = this.isAirKicking ? 7 : -7;

      opponent.takeDamage(damage, knockX, knockY, game, 'KICK');
      this.addSuper(16);
      Haptics.trigger(35);
    }
  }

  fireSuper(game) {
    if (this.hitStun > 0 || this.dashTimer > 0 || this.isDead || this.superMeter < 100) return;
    this.superMeter = 0;
    sfx.playSuper();
    Haptics.trigger(50);
    game.addProjectile(new Projectile(this.x + this.facing * 35, this.y - 25, this.facing, this));
    game.addFloatingText('SUPER BLAST!', this.x, this.y - 60, '#facc15');
    game.triggerScreenShake(8);
  }

  addSuper(amt) {
    this.superMeter = Math.min(100, this.superMeter + amt);
  }

  takeDamage(amt, knockX, knockY, game, type) {
    if (this.isDead || this.isInvincible) return;

    if (this.isBlocking) {
      amt = Math.max(2, Math.round(amt * 0.25));
      knockX *= 0.15;
      knockY = 0;
      sfx.playBlock();
      Haptics.trigger(10);
      game.addFloatingText('BLOCKED!', this.x, this.y - 40, this.color);
      game.createSparks(this.x, this.y - 30, this.color, 6);
    } else {
      this.hitStun = 12;
      this.vx = knockX;
      this.vy = knockY;
      Haptics.trigger(type === 'KICK' || type === 'COMBO' ? 40 : 25);
      game.triggerScreenShake(type === 'COMBO' || type === 'KICK' ? 6 : 3);
      game.addFloatingText(`-${amt}`, this.x, this.y - 45, '#F9D601');
      game.createSparks(this.x, this.y - 25, '#F9D601', type === 'KICK' ? 14 : 8);
      this.addSuper(amt * 0.7);
    }

    this.health = Math.max(0, this.health - amt);
    if (this.health <= 0) {
      this.die(game);
    }
  }

  die(game) {
    if (this.isDead) return;
    this.isDead = true;
    this.health = 0;
    this.vy = -8;
    this.vx = -this.facing * 5;
    sfx.playKO();
    Haptics.trigger(80);
    game.onPlayerKnockedOut(this);
  }

  update(platforms, arenaHeight, game) {
    if (this.punchTimer > 0) {
      this.punchTimer--;
      if (this.punchTimer === 0) this.isPunching = false;
    }
    if (this.kickTimer > 0) {
      this.kickTimer--;
      if (this.kickTimer === 0) {
        this.isKicking = false;
        this.isAirKicking = false;
      }
    }
    if (this.hitStun > 0) this.hitStun--;
    if (this.dropThroughTimer > 0) this.dropThroughTimer--;
    if (this.dashCooldown > 0) this.dashCooldown--;

    if (this.dashTimer > 0) {
      this.dashTimer--;
      if (Math.random() < 0.4) {
        game.ghostTrails.push(new GhostTrail(this.x, this.y, this.facing, this.color));
      }
      if (this.dashTimer === 0) {
        this.isInvincible = false;
        this.vx *= 0.3;
      }
    }

    if (this.comboResetTimer > 0) {
      this.comboResetTimer--;
      if (this.comboResetTimer === 0) this.comboStep = 0;
    }

    if (this.jumpBufferTimer > 0) {
      this.executeJump(game);
      this.jumpBufferTimer--;
    }

    if (this.grounded) {
      this.coyoteTimer = 6;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    this.grounded = false;

    if (this.dropThroughTimer <= 0) {
      platforms.forEach(plat => {
        if (
          this.vy >= 0 &&
          this.y <= plat.y &&
          this.y + this.vy >= plat.y &&
          this.x >= plat.x - 20 &&
          this.x <= plat.x + plat.w + 20
        ) {
          this.y = plat.y;
          this.vy = 0;
          this.grounded = true;
          this.jumpCount = 0;
        }
      });
    }

    if (this.y > arenaHeight + 60 && !this.isDead) {
      this.die(game);
    }

    if (Math.abs(this.vx) > 0.5 && this.grounded) {
      this.animTime += 0.28;
    } else {
      this.animTime += 0.05;
    }
  }

  draw(ctx, platforms) {
    // Soft Floor Shadow projected on platform beneath feet
    if (platforms) {
      platforms.forEach(plat => {
        if (this.x >= plat.x - 15 && this.x <= plat.x + plat.w + 15 && plat.y >= this.y && plat.y - this.y < 120) {
          const shadowDist = plat.y - this.y;
          const shadowAlpha = Math.max(0.08, 0.42 - (shadowDist / 120) * 0.34);
          const shadowWidth = Math.max(14, 28 - (shadowDist / 120) * 12);
          ctx.save();
          ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
          ctx.beginPath();
          ctx.ellipse(this.x, plat.y + 1, shadowWidth, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isInvincible) {
      ctx.globalAlpha = 0.5;
    }

    if (this.hitStun > 0 && Math.floor(Date.now() / 40) % 2 === 0) {
      ctx.strokeStyle = '#EFEFEF';
      ctx.fillStyle = '#EFEFEF';
    } else {
      ctx.strokeStyle = this.color;
      ctx.fillStyle = this.color;
    }

    ctx.lineWidth = 4.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const dir = this.facing;
    const bounce = Math.sin(this.animTime) * 2;

    if (this.isBlocking) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(dir * 12, -35, 48, -Math.PI / 2, Math.PI / 2, dir === -1);
      ctx.strokeStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }

    // Head
    const headY = -68 + bounce;

    // Martial Arts Flowing Headband Ribbon
    const ribbonDrift = -dir * 18 - (this.vx * 2.5);
    const ribbonWave = Math.sin(this.animTime * 3) * 5;
    ctx.beginPath();
    ctx.moveTo(-dir * 8, headY - 1);
    ctx.quadraticCurveTo(ribbonDrift * 0.5, headY - 4 + ribbonWave, ribbonDrift, headY + 3 + ribbonWave * 1.5);
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = this.isP1 ? '#F9D601' : '#3670FF';
    ctx.stroke();
    ctx.lineWidth = 4.8;

    ctx.beginPath();
    ctx.arc(0, headY, 11, 0, Math.PI * 2);
    ctx.fill();

    // Eye visor
    ctx.fillStyle = '#EFEFEF';
    ctx.beginPath();
    ctx.rect(dir * 2, headY - 3, dir * 7, 3);
    ctx.fill();

    // Torso
    const neckY = headY + 11;
    const hipY = -28 + bounce;
    ctx.beginPath();
    ctx.moveTo(0, neckY);
    ctx.lineTo(0, hipY);
    ctx.stroke();

    // Legs
    const legPhase = this.grounded ? Math.sin(this.animTime * 3) : 0;
    const lFootX = Math.sin(legPhase) * 16;
    const rFootX = -Math.sin(legPhase) * 16;

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(-4 + lFootX * 0.4, hipY + 16);
    ctx.lineTo(-6 + lFootX, 0);
    ctx.stroke();

    if (this.isKicking) {
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(dir * 25, hipY - (this.isAirKicking ? 18 : 6));
      ctx.lineTo(dir * 58, hipY - (this.isAirKicking ? 24 : 10));
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(4 + rFootX * 0.4, hipY + 16);
      ctx.lineTo(6 + rFootX, 0);
      ctx.stroke();
    }

    // Arms
    const shoulderY = neckY + 6;

    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(-dir * 12, shoulderY + 14);
    ctx.lineTo(-dir * 18, shoulderY + 22);
    ctx.stroke();

    if (this.isPunching) {
      const punchReach = 44 + (this.comboStep === 3 ? 12 : 0);
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(dir * 22, shoulderY - (this.comboStep === 3 ? 8 : 0));
      ctx.lineTo(dir * punchReach, shoulderY - (this.comboStep === 3 ? 14 : 0));
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = this.comboStep === 3 ? '#F9D601' : (this.isP1 ? '#3670FF' : '#F9D601');
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(dir * punchReach, shoulderY - (this.comboStep === 3 ? 14 : 0), 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.isBlocking) {
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(dir * 16, shoulderY - 8);
      ctx.lineTo(dir * 12, shoulderY - 26);
      ctx.stroke();
    } else {
      const armSwing = Math.sin(this.animTime * 2) * 6;
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(dir * 10 + armSwing, shoulderY + 12);
      ctx.lineTo(dir * 14 + armSwing, shoulderY + 22);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ============================================================================
// MAIN GAME ENGINE & ARENA ORCHESTRATOR
// ============================================================================
class StickmanGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = 1000;
    this.height = 600;

    // Modes & States
    this.mode = 'AI'; // Default to vs AI on mobile
    this.touchMode = '1P'; // '1P' or '2P_SPLIT'
    this.state = 'MENU';
    this.round = 1;
    this.maxRounds = 3;
    this.roundTime = 60;
    this.timerInterval = null;

    this.screenShake = 0;
    this.slowMo = 1.0;

    // Platforms
    this.platforms = [
      { x: 180, y: 490, w: 640, h: 26, name: 'Main Platform' },
      { x: 120, y: 350, w: 220, h: 18, name: 'Left Platform' },
      { x: 660, y: 350, w: 220, h: 18, name: 'Right Platform' }
    ];

    // Players (P1: Ultramarine Blue #3670FF, P2: Golden #F9D601)
    this.p1 = new Stickman(260, 480, '#3670FF', true);
    this.p2 = new Stickman(740, 480, '#F9D601', false);

    // Entity lists
    this.particles = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.ghostTrails = [];

    // Keyboard & Touch tracking
    this.keys = {};
    this.justPressed = {};
    this.activeTouchPointers = new Map(); // pointerId -> action

    // DOM Elements
    this.domP1Health = document.getElementById('p1-health');
    this.domP2Health = document.getElementById('p2-health');
    this.domP1Super = document.getElementById('p1-super');
    this.domP2Super = document.getElementById('p2-super');
    this.domTimer = document.getElementById('match-timer');
    this.domRoundTitle = document.getElementById('round-title');
    this.domCallout = document.getElementById('callout-overlay');
    this.domCalloutText = document.getElementById('callout-text');
    this.domMenuOverlay = document.getElementById('menu-overlay');
    this.domControlsOverlay = document.getElementById('controls-overlay');
    this.domGameOverOverlay = document.getElementById('gameover-overlay');
    this.domP1Rounds = document.getElementById('p1-rounds').children;
    this.domP2Rounds = document.getElementById('p2-rounds').children;
    this.domSuperBtn = document.getElementById('tb-super');
    this.domTouch1P = document.getElementById('touch-controls');
    this.domTouch2P = document.getElementById('touch-controls-2p');
    this.domRotatePrompt = document.getElementById('rotate-prompt');

    this.initDeviceResponsiveness();
    this.bindEvents();
    this.bindTouchControls();

    window.gameInstance = this;
    this.loop();
  }

  // Auto-detect touch device and setup responsive viewport
  initDeviceResponsiveness() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const touchCheckbox = document.getElementById('toggle-touch');

    if (isTouchDevice) {
      touchCheckbox.checked = true;
      this.domTouch1P.classList.remove('hidden');
    }

    // Check device orientation for rotate prompt
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isMobileWidth = window.innerWidth < 850;
      if (isTouchDevice && isPortrait && isMobileWidth) {
        this.domRotatePrompt.classList.remove('hidden');
      } else {
        this.domRotatePrompt.classList.add('hidden');
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation();

    document.getElementById('btn-dismiss-rotate').addEventListener('click', () => {
      this.domRotatePrompt.classList.add('hidden');
    });

    // Fullscreen toggle
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      sfx.init();
      if (!document.fullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) docEl.requestFullscreen();
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      sfx.init();

      // Quick Rematch via Space or Enter on Victory Screen
      if (this.state === 'MATCH_OVER' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        this.startNewMatch(this.mode);
        return;
      }

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this.justPressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (['KeyS', 'KeyC'].includes(e.code)) this.p1.block(false);
      if (['ArrowDown', 'Numpad1'].includes(e.code)) this.p2.block(false);
    });

    // Menus
    document.getElementById('btn-mode-ai').addEventListener('click', () => {
      sfx.init();
      this.touchMode = '1P';
      this.startNewMatch('AI');
    });

    document.getElementById('btn-mode-2p').addEventListener('click', () => {
      sfx.init();
      this.touchMode = '1P';
      this.startNewMatch('2P');
    });

    document.getElementById('btn-mode-2p-mobile').addEventListener('click', () => {
      sfx.init();
      this.touchMode = '2P_SPLIT';
      this.startNewMatch('2P');
    });

    document.getElementById('btn-controls').addEventListener('click', () => {
      this.domControlsOverlay.classList.remove('hidden');
    });

    document.getElementById('btn-close-controls').addEventListener('click', () => {
      this.domControlsOverlay.classList.add('hidden');
    });

    document.getElementById('btn-rematch').addEventListener('click', () => {
      this.startNewMatch(this.mode);
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this.domGameOverOverlay.classList.add('hidden');
      this.domMenuOverlay.classList.remove('hidden');
      this.state = 'MENU';
    });

    document.getElementById('toggle-sfx').addEventListener('change', (e) => {
      sfx.enabled = e.target.checked;
    });

    document.getElementById('toggle-vibration').addEventListener('change', (e) => {
      Haptics.enabled = e.target.checked;
    });

    document.getElementById('toggle-touch').addEventListener('change', (e) => {
      if (e.target.checked) {
        if (this.touchMode === '2P_SPLIT') this.domTouch2P.classList.remove('hidden');
        else this.domTouch1P.classList.remove('hidden');
      } else {
        this.domTouch1P.classList.add('hidden');
        this.domTouch2P.classList.add('hidden');
      }
    });
  }

  // Pointer / Multi-Touch Architecture with slide tracking
  bindTouchControls() {
    const handleTouchAction = (action, isPressed) => {
      if (this.state !== 'PLAYING') return;

      // 1-Player Actions (Player 1)
      if (action === 'left') {
        if (isPressed) this.p1.move(-1);
        else this.p1.stopMove();
      } else if (action === 'right') {
        if (isPressed) this.p1.move(1);
        else this.p1.stopMove();
      } else if (action === 'jump') {
        if (isPressed) this.p1.triggerJump();
      } else if (action === 'drop') {
        if (isPressed) {
          if (this.p1.y < 420 && this.p1.grounded) this.p1.dropDown();
          else this.p1.block(true);
        } else {
          this.p1.block(false);
        }
      } else if (action === 'block') {
        this.p1.block(isPressed);
      } else if (action === 'dash') {
        if (isPressed) this.p1.dash(this);
      } else if (action === 'punch') {
        if (isPressed) this.p1.punch(this.p2, this);
      } else if (action === 'kick') {
        if (isPressed) this.p1.kick(this.p2, this);
      } else if (action === 'super') {
        if (isPressed) this.p1.fireSuper(this);
      }

      // 2-Player Split Tablet Actions
      if (this.touchMode === '2P_SPLIT') {
        if (action === 'p1-left') isPressed ? this.p1.move(-1) : this.p1.stopMove();
        if (action === 'p1-right') isPressed ? this.p1.move(1) : this.p1.stopMove();
        if (action === 'p1-jump' && isPressed) this.p1.triggerJump();
        if (action === 'p1-punch' && isPressed) this.p1.punch(this.p2, this);
        if (action === 'p1-kick' && isPressed) this.p1.kick(this.p2, this);
        if (action === 'p1-block') this.p1.block(isPressed);
        if (action === 'p1-dash' && isPressed) this.p1.dash(this);

        if (action === 'p2-left') isPressed ? this.p2.move(-1) : this.p2.stopMove();
        if (action === 'p2-right') isPressed ? this.p2.move(1) : this.p2.stopMove();
        if (action === 'p2-jump' && isPressed) this.p2.triggerJump();
        if (action === 'p2-punch' && isPressed) this.p2.punch(this.p1, this);
        if (action === 'p2-kick' && isPressed) this.p2.kick(this.p1, this);
        if (action === 'p2-block') this.p2.block(isPressed);
        if (action === 'p2-dash' && isPressed) this.p2.dash(this);
      }
    };

    // Attach Pointer events to all touch buttons
    const buttons = document.querySelectorAll('.touch-btn');
    buttons.forEach(btn => {
      const action = btn.dataset.btn;

      const onPointerDown = (e) => {
        e.preventDefault();
        sfx.init();
        btn.setPointerCapture(e.pointerId);
        btn.classList.add('pressed');
        this.activeTouchPointers.set(e.pointerId, { btn, action });
        handleTouchAction(action, true);
      };

      const onPointerUp = (e) => {
        e.preventDefault();
        btn.classList.remove('pressed');
        if (this.activeTouchPointers.has(e.pointerId)) {
          this.activeTouchPointers.delete(e.pointerId);
          handleTouchAction(action, false);
        }
      };

      const onPointerCancel = (e) => {
        btn.classList.remove('pressed');
        if (this.activeTouchPointers.has(e.pointerId)) {
          this.activeTouchPointers.delete(e.pointerId);
          handleTouchAction(action, false);
        }
      };

      btn.addEventListener('pointerdown', onPointerDown);
      btn.addEventListener('pointerup', onPointerUp);
      btn.addEventListener('pointercancel', onPointerCancel);
    });
  }

  // Poll standard Gamepad controllers
  pollGamepads() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();

    if (gamepads[0]) {
      const gp = gamepads[0];
      const axisX = gp.axes[0];
      const axisY = gp.axes[1];

      if (axisX < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed)) this.p1.move(-1);
      else if (axisX > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed)) this.p1.move(1);
      else this.p1.stopMove();

      if (axisY > 0.6 || (gp.buttons[13] && gp.buttons[13].pressed)) this.p1.dropDown();

      if (gp.buttons[0] && gp.buttons[0].pressed) this.p1.triggerJump();
      if (gp.buttons[2] && gp.buttons[2].pressed) this.p1.punch(this.p2, this);
      if (gp.buttons[1] && gp.buttons[1].pressed) this.p1.kick(this.p2, this);
      if (gp.buttons[3] && gp.buttons[3].pressed) this.p1.fireSuper(this);
      if ((gp.buttons[4] && gp.buttons[4].pressed) || (gp.buttons[5] && gp.buttons[5].pressed)) this.p1.dash(this);
      this.p1.block((gp.buttons[6] && gp.buttons[6].pressed) || (gp.buttons[7] && gp.buttons[7].pressed));
    }

    if (gamepads[1] && this.mode === '2P') {
      const gp = gamepads[1];
      const axisX = gp.axes[0];
      const axisY = gp.axes[1];

      if (axisX < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed)) this.p2.move(-1);
      else if (axisX > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed)) this.p2.move(1);
      else this.p2.stopMove();

      if (axisY > 0.6 || (gp.buttons[13] && gp.buttons[13].pressed)) this.p2.dropDown();

      if (gp.buttons[0] && gp.buttons[0].pressed) this.p2.triggerJump();
      if (gp.buttons[2] && gp.buttons[2].pressed) this.p2.punch(this.p1, this);
      if (gp.buttons[1] && gp.buttons[1].pressed) this.p2.kick(this.p1, this);
      if (gp.buttons[3] && gp.buttons[3].pressed) this.p2.fireSuper(this);
      if ((gp.buttons[4] && gp.buttons[4].pressed) || (gp.buttons[5] && gp.buttons[5].pressed)) this.p2.dash(this);
      this.p2.block((gp.buttons[6] && gp.buttons[6].pressed) || (gp.buttons[7] && gp.buttons[7].pressed));
    }
  }

  startNewMatch(mode) {
    this.mode = mode;
    this.round = 1;
    this.p1.roundsWon = 0;
    this.p2.roundsWon = 0;

    const p1NameEl = document.getElementById('p1-display-name');
    if (p1NameEl) p1NameEl.textContent = 'COBALT STRIKER';

    const p2NameEl = document.getElementById('p2-display-name');
    if (p2NameEl) p2NameEl.textContent = mode === 'AI' ? 'SOLARIS (AI)' : 'SOLARIS';

    // Toggle touch UI based on selected mode
    const isTouchEnabled = document.getElementById('toggle-touch').checked;
    if (isTouchEnabled) {
      if (this.touchMode === '2P_SPLIT') {
        this.domTouch1P.classList.add('hidden');
        this.domTouch2P.classList.remove('hidden');
      } else {
        this.domTouch1P.classList.remove('hidden');
        this.domTouch2P.classList.add('hidden');
      }
    }

    this.domMenuOverlay.classList.add('hidden');
    this.domGameOverOverlay.classList.add('hidden');
    this.startRound();
  }

  startRound() {
    this.p1.reset(260, 480);
    this.p2.reset(740, 480);
    this.roundTime = 60;
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.ghostTrails = [];
    this.slowMo = 1.0;
    this.state = 'ROUND_START';

    this.updateHUD();
    this.domRoundTitle.textContent = `ROUND ${this.round} • BEST OF 3`;

    this.showCallout(`ROUND ${this.round}`, 1200, () => {
      this.showCallout('FIGHT!', 800, () => {
        this.state = 'PLAYING';
        this.startTimer();
      });
    });
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state === 'PLAYING') {
        this.roundTime--;
        this.domTimer.textContent = this.roundTime;
        if (this.roundTime <= 0) {
          clearInterval(this.timerInterval);
          this.onTimeExpired();
        }
      }
    }, 1000);
  }

  showCallout(text, duration, callback) {
    this.domCalloutText.textContent = text;
    this.domCallout.classList.remove('hidden');
    setTimeout(() => {
      this.domCallout.classList.add('hidden');
      if (callback) callback();
    }, duration);
  }

  onPlayerKnockedOut(loser) {
    this.state = 'ROUND_OVER';
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.slowMo = 0.35;

    const winner = loser === this.p1 ? this.p2 : this.p1;
    winner.roundsWon++;

    this.showCallout('K.O.!', 1600, () => {
      this.slowMo = 1.0;
      this.checkMatchStatus();
    });
  }

  onTimeExpired() {
    this.state = 'ROUND_OVER';
    let winner = null;
    if (this.p1.health > this.p2.health) winner = this.p1;
    else if (this.p2.health > this.p1.health) winner = this.p2;

    if (winner) {
      winner.roundsWon++;
      this.showCallout('TIME UP!', 1600, () => this.checkMatchStatus());
    } else {
      this.showCallout('DRAW!', 1600, () => this.startRound());
    }
  }

  checkMatchStatus() {
    this.updateHUD();

    if (this.p1.roundsWon >= 2 || this.p2.roundsWon >= 2) {
      this.state = 'MATCH_OVER';
      const isP1 = this.p1.roundsWon >= 2;
      const winnerName = isP1 ? 'COBALT STRIKER' : (this.mode === 'AI' ? 'SOLARIS (AI)' : 'SOLARIS');
      document.getElementById('victory-header').textContent = `${winnerName} WINS!`;
      document.getElementById('victory-sub').textContent = isP1
        ? `Tournament champion with a dominant ${this.p1.roundsWon} - ${this.p2.roundsWon} victory!`
        : `Solaris claims the championship with a ${this.p2.roundsWon} - ${this.p1.roundsWon} score!`;

      const statScore = document.getElementById('stat-score');
      if (statScore) statScore.textContent = `${this.p1.roundsWon} - ${this.p2.roundsWon}`;

      const statRounds = document.getElementById('stat-rounds');
      if (statRounds) statRounds.textContent = `${this.p1.roundsWon + this.p2.roundsWon}`;

      this.domGameOverOverlay.classList.remove('hidden');
    } else {
      this.round++;
      this.startRound();
    }
  }

  updateHUD() {
    this.domP1Health.style.width = `${(this.p1.health / this.p1.maxHealth) * 100}%`;
    this.domP2Health.style.width = `${(this.p2.health / this.p2.maxHealth) * 100}%`;

    // Numeric HP readout
    const p1HpLabel = document.getElementById('p1-hp-text');
    if (p1HpLabel) p1HpLabel.textContent = `${Math.max(0, Math.ceil(this.p1.health))} HP`;
    const p2HpLabel = document.getElementById('p2-hp-text');
    if (p2HpLabel) p2HpLabel.textContent = `${Math.max(0, Math.ceil(this.p2.health))} HP`;

    // Super bars
    this.domP1Super.style.width = `${this.p1.superMeter}%`;
    this.domP2Super.style.width = `${this.p2.superMeter}%`;

    // Super status subtext
    const p1SuperLabel = document.getElementById('p1-super-text');
    if (p1SuperLabel) {
      p1SuperLabel.textContent = this.p1.superMeter >= 100 ? '⚡ SUPER READY!' : `SUPER: ${Math.floor(this.p1.superMeter)}%`;
      p1SuperLabel.style.color = this.p1.superMeter >= 100 ? '#F9D601' : '';
    }
    const p2SuperLabel = document.getElementById('p2-super-text');
    if (p2SuperLabel) {
      p2SuperLabel.textContent = this.p2.superMeter >= 100 ? '⚡ SUPER READY!' : `SUPER: ${Math.floor(this.p2.superMeter)}%`;
      p2SuperLabel.style.color = this.p2.superMeter >= 100 ? '#F9D601' : '';
    }

    // Glow on Super Button when meter is 100%
    if (this.p1.superMeter >= 100) {
      this.domSuperBtn.classList.add('ready');
    } else {
      this.domSuperBtn.classList.remove('ready');
    }

    for (let i = 0; i < 2; i++) {
      if (i < this.p1.roundsWon) this.domP1Rounds[i].classList.add('won');
      else this.domP1Rounds[i].classList.remove('won');

      if (i < this.p2.roundsWon) this.domP2Rounds[i].classList.add('won');
      else this.domP2Rounds[i].classList.remove('won');
    }
  }

  triggerScreenShake(intensity = 5) {
    this.screenShake = intensity;
  }

  createSparks(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push(new Particle(x, y, color, vx, vy, Math.random() * 3 + 2));
    }
  }

  addProjectile(proj) {
    this.projectiles.push(proj);
  }

  addFloatingText(text, x, y, color) {
    this.floatingTexts.push(new FloatingText(text, x, y, color));
  }

  handleInputs() {
    if (this.state !== 'PLAYING') return;

    this.pollGamepads();

    // Keyboard P1
    if (this.keys['KeyA']) this.p1.move(-1);
    else if (this.keys['KeyD']) this.p1.move(1);
    else if (!this.activeTouchPointers.size) this.p1.stopMove();

    if (this.justPressed['KeyW'] || this.justPressed['Space']) this.p1.triggerJump();

    if (this.keys['KeyS']) {
      if (this.p1.y < 420 && this.p1.grounded) this.p1.dropDown();
      else this.p1.block(true);
    }
    if (this.keys['KeyC']) this.p1.block(true);

    if (this.justPressed['KeyQ'] || this.justPressed['KeyE']) this.p1.dash(this);
    if (this.justPressed['KeyF'] || this.justPressed['KeyJ']) this.p1.punch(this.p2, this);
    if (this.justPressed['KeyG'] || this.justPressed['KeyK']) this.p1.kick(this.p2, this);
    if (this.justPressed['KeyV'] || this.justPressed['KeyR']) this.p1.fireSuper(this);

    // Keyboard P2 (if 2P mode and not split touch)
    if (this.mode === '2P' && this.touchMode !== '2P_SPLIT') {
      if (this.keys['ArrowLeft'] || this.keys['Numpad4']) this.p2.move(-1);
      else if (this.keys['ArrowRight'] || this.keys['Numpad6']) this.p2.move(1);
      else this.p2.stopMove();

      if (this.justPressed['ArrowUp'] || this.justPressed['Numpad8'] || this.justPressed['Numpad0']) {
        this.p2.triggerJump();
      }

      if (this.keys['ArrowDown'] || this.keys['Numpad2']) {
        if (this.p2.y < 420 && this.p2.grounded) this.p2.dropDown();
        else this.p2.block(true);
      }
      if (this.keys['Numpad1']) this.p2.block(true);

      if (this.justPressed['KeyI'] || this.justPressed['Numpad7']) this.p2.dash(this);
      if (this.justPressed['KeyL']) this.p2.punch(this.p1, this);
      if (this.justPressed['KeyK'] || this.justPressed['Numpad5']) this.p2.kick(this.p1, this);
      if (this.justPressed['KeyM'] || this.justPressed['NumpadEnter']) this.p2.fireSuper(this);
    } else if (this.mode === 'AI') {
      this.handleAIBot();
    }

    this.justPressed = {};
  }

  handleAIBot() {
    const dist = Math.abs(this.p2.x - this.p1.x);
    const vertDist = Math.abs(this.p2.y - this.p1.y);

    this.p2.facing = this.p1.x > this.p2.x ? 1 : -1;

    if (this.p2.x < 210 && this.p2.grounded) {
      this.p2.move(1);
      this.p2.triggerJump();
      return;
    }
    if (this.p2.x > 790 && this.p2.grounded) {
      this.p2.move(-1);
      this.p2.triggerJump();
      return;
    }

    if (this.p2.y < 400 && this.p1.y > 440 && Math.random() < 0.03) {
      this.p2.dropDown();
    }

    if (this.p2.superMeter >= 100 && Math.random() < 0.05) {
      this.p2.fireSuper(this);
      return;
    }

    if (dist > 180 && dist < 320 && Math.random() < 0.03) {
      this.p2.dash(this);
    }

    if (dist < 60 && vertDist < 45) {
      this.p2.stopMove();

      if (this.p1.isPunching || this.p1.isKicking) {
        if (Math.random() < 0.65) {
          this.p2.block(true);
          return;
        }
      } else {
        this.p2.block(false);
      }

      const actionRoll = Math.random();
      if (actionRoll < 0.1) {
        this.p2.punch(this.p1, this);
      } else if (actionRoll < 0.16) {
        this.p2.kick(this.p1, this);
      }
    } else {
      this.p2.block(false);
      if (this.p1.x > this.p2.x) this.p2.move(1);
      else this.p2.move(-1);

      if (this.p1.y < this.p2.y - 40 && Math.random() < 0.04) {
        this.p2.triggerJump();
      }
    }
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(this);

      const target = p.owner === this.p1 ? this.p2 : this.p1;
      const dist = Math.abs(p.x - target.x);
      const vertDist = Math.abs(p.y - (target.y - 30));

      if (dist < p.radius + 20 && vertDist < 35 && p.active) {
        p.active = false;
        target.takeDamage(p.damage, p.dir * 14, -6, this, 'SUPER');
      }

      if (!p.active) {
        this.createSparks(p.x, p.y, p.color, 15);
        this.projectiles.splice(i, 1);
      }
    }
  }

  update() {
    this.handleInputs();

    this.p1.update(this.platforms, this.height, this);
    this.p2.update(this.platforms, this.height, this);

    this.updateProjectiles();

    for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
      this.ghostTrails[i].update();
      if (this.ghostTrails[i].life <= 0) this.ghostTrails.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update();
      if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
    }

    this.updateHUD();

    if (this.screenShake > 0) this.screenShake -= 0.5;
  }

  draw() {
    this.ctx.save();

    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake * 3;
      const shakeY = (Math.random() - 0.5) * this.screenShake * 3;
      this.ctx.translate(shakeX, shakeY);
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawArenaBackdrop();
    this.drawPlatforms();

    this.ghostTrails.forEach(gt => gt.draw(this.ctx));
    this.p1.draw(this.ctx, this.platforms);
    this.p2.draw(this.ctx, this.platforms);
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.particles.forEach(pt => pt.draw(this.ctx));
    this.floatingTexts.forEach(ft => ft.draw(this.ctx));

    this.ctx.restore();
  }

  drawArenaBackdrop() {
    this.ctx.fillStyle = 'rgba(239, 239, 239, 0.25)';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37) % this.width;
      const sy = (i * 29) % (this.height - 100);
      this.ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    this.ctx.strokeStyle = 'rgba(54, 112, 255, 0.12)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 480);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }

  drawPlatforms() {
    this.platforms.forEach(plat => {
      this.ctx.shadowColor = '#3670FF';
      this.ctx.shadowBlur = 14;

      // Platform Core (Chinese Black #171717)
      this.ctx.fillStyle = '#171717';
      this.ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Ultramarine Blue Top Edge
      this.ctx.fillStyle = '#3670FF';
      this.ctx.fillRect(plat.x, plat.y, plat.w, 4);

      // Bright Gray Bevel Trim
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = 'rgba(239, 239, 239, 0.15)';
      this.ctx.fillRect(plat.x + 2, plat.y + 4, plat.w - 4, plat.h - 6);
    });
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new StickmanGame();
});
