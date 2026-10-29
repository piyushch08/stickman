/**
 * STICKMAN CLASH - 1v1 Arena Fighter
 * High-performance HTML5 Canvas physics, stickman skeletal animation,
 * synthesized sound effects, AI bot & 2-player local multiplayer.
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

  playPunch() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playKick() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  playBlock() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.04);
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
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.12);
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
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
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
// PARTICLE & FLOATING TEXT ENGINE
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
    this.vy += 0.2; // gravity
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

class FloatingText {
  constructor(text, x, y, color = '#ffffff') {
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
    this.dir = dir; // 1 or -1
    this.owner = owner;
    this.radius = 16;
    this.speed = 12 * dir;
    this.damage = 25;
    this.color = owner.color;
    this.active = true;
  }

  update(arena) {
    this.x += this.speed;
    if (this.x < -50 || this.x > arena.width + 50) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
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

    // Stats
    this.maxHealth = 100;
    this.health = 100;
    this.superMeter = 0; // 0 to 100
    this.roundsWon = 0;

    // Movement & Physics
    this.speed = 5.5;
    this.jumpForce = -13.5;
    this.gravity = 0.65;
    this.grounded = false;
    this.jumpCount = 0;
    this.maxJumps = 2; // Double jump!

    // Actions & States
    this.isBlocking = false;
    this.isPunching = false;
    this.isKicking = false;
    this.punchTimer = 0;
    this.kickTimer = 0;
    this.hitStun = 0;
    this.isDead = false;

    // Animation Cycle
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
    this.punchTimer = 0;
    this.kickTimer = 0;
    this.hitStun = 0;
    this.isDead = false;
    this.facing = this.isP1 ? 1 : -1;
  }

  moveLeft() {
    if (this.hitStun > 0 || this.isBlocking || this.isDead) return;
    this.vx = -this.speed;
    this.facing = -1;
  }

  moveRight() {
    if (this.hitStun > 0 || this.isBlocking || this.isDead) return;
    this.vx = this.speed;
    this.facing = 1;
  }

  stopMove() {
    if (this.hitStun > 0) return;
    this.vx *= 0.7;
    if (Math.abs(this.vx) < 0.2) this.vx = 0;
  }

  jump() {
    if (this.hitStun > 0 || this.isBlocking || this.isDead) return;
    if (this.jumpCount < this.maxJumps) {
      this.vy = this.jumpForce;
      this.jumpCount++;
      this.grounded = false;
      sfx.playJump();
    }
  }

  block(active) {
    if (this.hitStun > 0 || this.isDead) return;
    this.isBlocking = active;
    if (active) this.vx = 0;
  }

  punch(opponent, game) {
    if (this.hitStun > 0 || this.isPunching || this.isKicking || this.isBlocking || this.isDead) return;
    this.isPunching = true;
    this.punchTimer = 14;
    sfx.playPunch();

    // Hitbox detection
    const reach = 55;
    const hitX = this.x + this.facing * reach;
    const dist = Math.abs(hitX - opponent.x);
    const vertDist = Math.abs(this.y - opponent.y);

    if (dist < 45 && vertDist < 50) {
      opponent.takeDamage(10, this.facing * 4, -4, game, 'PUNCH');
      this.addSuper(12);
    }
  }

  kick(opponent, game) {
    if (this.hitStun > 0 || this.isPunching || this.isKicking || this.isBlocking || this.isDead) return;
    this.isKicking = true;
    this.kickTimer = 22;
    sfx.playKick();

    // Hitbox detection
    const reach = 65;
    const hitX = this.x + this.facing * reach;
    const dist = Math.abs(hitX - opponent.x);
    const vertDist = Math.abs(this.y - opponent.y);

    if (dist < 50 && vertDist < 55) {
      opponent.takeDamage(18, this.facing * 10, -7, game, 'KICK');
      this.addSuper(18);
    }
  }

  fireSuper(game) {
    if (this.hitStun > 0 || this.isDead || this.superMeter < 100) return;
    this.superMeter = 0;
    sfx.playSuper();
    game.addProjectile(new Projectile(this.x + this.facing * 35, this.y - 25, this.facing, this));
    game.addFloatingText('SUPER!', this.x, this.y - 60, '#facc15');
    game.triggerScreenShake(8);
  }

  addSuper(amt) {
    this.superMeter = Math.min(100, this.superMeter + amt);
  }

  takeDamage(amt, knockX, knockY, game, type) {
    if (this.isDead) return;

    if (this.isBlocking) {
      amt = Math.max(2, Math.round(amt * 0.25));
      knockX *= 0.2;
      knockY = 0;
      sfx.playBlock();
      game.addFloatingText('BLOCKED!', this.x, this.y - 40, '#38bdf8');
      game.createSparks(this.x, this.y - 30, '#38bdf8', 6);
    } else {
      this.hitStun = 12;
      this.vx = knockX;
      this.vy = knockY;
      game.triggerScreenShake(type === 'KICK' ? 6 : 3);
      game.addFloatingText(`-${amt}`, this.x, this.y - 45, '#f43f5e');
      game.createSparks(this.x, this.y - 25, '#facc15', type === 'KICK' ? 14 : 8);
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
    game.onPlayerKnockedOut(this);
  }

  update(platforms, arenaHeight) {
    // Timers
    if (this.punchTimer > 0) {
      this.punchTimer--;
      if (this.punchTimer === 0) this.isPunching = false;
    }
    if (this.kickTimer > 0) {
      this.kickTimer--;
      if (this.kickTimer === 0) this.isKicking = false;
    }
    if (this.hitStun > 0) this.hitStun--;

    // Physics
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    // Platform collisions
    this.grounded = false;
    platforms.forEach(plat => {
      // Check falling onto platform top
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

    // Ring-out / Abyss fall
    if (this.y > arenaHeight + 60 && !this.isDead) {
      this.die(window.gameInstance);
    }

    // Animation ticker
    if (Math.abs(this.vx) > 0.5 && this.grounded) {
      this.animTime += 0.25;
    } else {
      this.animTime += 0.05;
    }
  }

  // Draw procedural stickman
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Hit stun flash
    if (this.hitStun > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.strokeStyle = this.color;
      ctx.fillStyle = this.color;
    }

    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const dir = this.facing;
    const bounce = Math.sin(this.animTime) * 2;

    // Blocking Shield Aura
    if (this.isBlocking) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(dir * 10, -35, 45, -Math.PI / 2, Math.PI / 2, dir === -1);
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // 1. Head
    const headY = -68 + bounce;
    ctx.beginPath();
    ctx.arc(0, headY, 11, 0, Math.PI * 2);
    ctx.fill();

    // Headband / eye visor
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.rect(dir * 2, headY - 3, dir * 7, 3);
    ctx.fill();

    // 2. Spine / Torso
    const neckY = headY + 11;
    const hipY = -28 + bounce;
    ctx.beginPath();
    ctx.moveTo(0, neckY);
    ctx.lineTo(0, hipY);
    ctx.stroke();

    // 3. Legs
    const legPhase = this.grounded ? Math.sin(this.animTime * 3) : 0;
    const lFootX = Math.sin(legPhase) * 16;
    const rFootX = -Math.sin(legPhase) * 16;

    // Left Leg
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(-4 + lFootX * 0.4, hipY + 16);
    ctx.lineTo(-6 + lFootX, 0);
    ctx.stroke();

    // Right Leg (or Kick animation)
    if (this.isKicking) {
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(dir * 25, hipY - 6);
      ctx.lineTo(dir * 55, hipY - 10);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(4 + rFootX * 0.4, hipY + 16);
      ctx.lineTo(6 + rFootX, 0);
      ctx.stroke();
    }

    // 4. Arms
    const shoulderY = neckY + 6;

    // Back Arm
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(-dir * 12, shoulderY + 14);
    ctx.lineTo(-dir * 18, shoulderY + 22);
    ctx.stroke();

    // Front Arm (or Punch / Block)
    if (this.isPunching) {
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(dir * 22, shoulderY);
      ctx.lineTo(dir * 46, shoulderY);
      ctx.stroke();

      // Punch fist trail
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(dir * 48, shoulderY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.isBlocking) {
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(dir * 16, shoulderY - 8);
      ctx.lineTo(dir * 12, shoulderY - 26);
      ctx.stroke();
    } else {
      // Idle arm swing
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
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Modes & States
    this.mode = '2P'; // '2P' or 'AI'
    this.state = 'MENU'; // 'MENU', 'ROUND_START', 'PLAYING', 'ROUND_OVER', 'MATCH_OVER'
    this.round = 1;
    this.maxRounds = 3;
    this.roundTime = 60;
    this.timerInterval = null;

    // Screen Shake & Slow-Mo
    this.screenShake = 0;
    this.slowMo = 1.0;

    // Platforms in Arena
    this.platforms = [
      { x: 180, y: 490, w: 640, h: 26, name: 'Main Platform' },
      { x: 120, y: 350, w: 220, h: 18, name: 'Left Platform' },
      { x: 660, y: 350, w: 220, h: 18, name: 'Right Platform' }
    ];

    // Players
    this.p1 = new Stickman(260, 480, '#38bdf8', true);
    this.p2 = new Stickman(740, 480, '#f43f5e', false);

    // Entity lists
    this.particles = [];
    this.projectiles = [];
    this.floatingTexts = [];

    // Keyboard state
    this.keys = {};

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

    this.bindEvents();
    window.gameInstance = this;
    this.loop();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      sfx.init();
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyS') this.p1.block(false);
      if (e.code === 'ArrowDown') this.p2.block(false);
    });

    // Menu buttons
    document.getElementById('btn-mode-2p').addEventListener('click', () => {
      sfx.init();
      this.startNewMatch('2P');
    });

    document.getElementById('btn-mode-ai').addEventListener('click', () => {
      sfx.init();
      this.startNewMatch('AI');
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

    // Settings
    document.getElementById('toggle-sfx').addEventListener('change', (e) => {
      sfx.enabled = e.target.checked;
    });

    document.getElementById('toggle-touch').addEventListener('change', (e) => {
      const tc = document.getElementById('touch-controls');
      if (e.target.checked) tc.classList.remove('hidden');
      else tc.classList.add('hidden');
    });

    // Touch controls for P1
    const bindTouch = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      el.addEventListener('touchstart', (e) => { e.preventDefault(); sfx.init(); onDown(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); if (onUp) onUp(); });
    };

    bindTouch('tb-left', () => this.p1.moveLeft(), () => this.p1.stopMove());
    bindTouch('tb-right', () => this.p1.moveRight(), () => this.p1.stopMove());
    bindTouch('tb-jump', () => this.p1.jump());
    bindTouch('tb-block', () => this.p1.block(true), () => this.p1.block(false));
    bindTouch('tb-punch', () => this.p1.punch(this.p2, this));
    bindTouch('tb-kick', () => this.p1.kick(this.p2, this));
    bindTouch('tb-super', () => this.p1.fireSuper(this));
  }

  startNewMatch(mode) {
    this.mode = mode;
    this.round = 1;
    this.p1.roundsWon = 0;
    this.p2.roundsWon = 0;

    document.getElementById('p2-display-name').textContent = mode === 'AI' ? 'BOT (AI)' : 'PLAYER 2';

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
    this.slowMo = 1.0;
    this.state = 'ROUND_START';

    this.updateHUD();
    this.domRoundTitle.textContent = `ROUND ${this.round}`;

    // Callout animation
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
    this.slowMo = 0.35; // Dramatic Slow Motion!

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
      // Match Over!
      this.state = 'MATCH_OVER';
      const winnerName = this.p1.roundsWon >= 2 ? 'PLAYER 1' : (this.mode === 'AI' ? 'BOT (AI)' : 'PLAYER 2');
      document.getElementById('victory-header').textContent = `${winnerName} WINS!`;
      document.getElementById('victory-sub').textContent = `Dominating victory with ${this.p1.roundsWon >= 2 ? this.p1.roundsWon : this.p2.roundsWon} round wins.`;
      this.domGameOverOverlay.classList.remove('hidden');
    } else {
      // Next Round
      this.round++;
      this.startRound();
    }
  }

  updateHUD() {
    this.domP1Health.style.width = `${(this.p1.health / this.p1.maxHealth) * 100}%`;
    this.domP2Health.style.width = `${(this.p2.health / this.p2.maxHealth) * 100}%`;

    this.domP1Super.style.width = `${this.p1.superMeter}%`;
    this.domP2Super.style.width = `${this.p2.superMeter}%`;

    // Round Win Dots
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

  // Handle Player Inputs & AI Brain
  handleInputs() {
    if (this.state !== 'PLAYING') return;

    // --- PLAYER 1 (WASD + F / G / V) ---
    if (this.keys['KeyA']) this.p1.moveLeft();
    else if (this.keys['KeyD']) this.p1.moveRight();
    else this.p1.stopMove();

    if (this.keys['KeyW']) {
      this.p1.jump();
      this.keys['KeyW'] = false; // single trigger
    }

    if (this.keys['KeyS']) this.p1.block(true);

    if (this.keys['KeyF']) {
      this.p1.punch(this.p2, this);
      this.keys['KeyF'] = false;
    }

    if (this.keys['KeyG']) {
      this.p1.kick(this.p2, this);
      this.keys['KeyG'] = false;
    }

    if (this.keys['KeyV']) {
      this.p1.fireSuper(this);
      this.keys['KeyV'] = false;
    }

    // --- PLAYER 2 (Arrows + L / K / M) OR AI BOT ---
    if (this.mode === '2P') {
      if (this.keys['ArrowLeft']) this.p2.moveLeft();
      else if (this.keys['ArrowRight']) this.p2.moveRight();
      else this.p2.stopMove();

      if (this.keys['ArrowUp']) {
        this.p2.jump();
        this.keys['ArrowUp'] = false;
      }

      if (this.keys['ArrowDown']) this.p2.block(true);

      if (this.keys['KeyL']) {
        this.p2.punch(this.p1, this);
        this.keys['KeyL'] = false;
      }

      if (this.keys['KeyK']) {
        this.p2.kick(this.p1, this);
        this.keys['KeyK'] = false;
      }

      if (this.keys['KeyM']) {
        this.p2.fireSuper(this);
        this.keys['KeyM'] = false;
      }
    } else {
      this.handleAIBot();
    }
  }

  // Intelligent AI Competitor
  handleAIBot() {
    const dist = Math.abs(this.p2.x - this.p1.x);
    const vertDist = Math.abs(this.p2.y - this.p1.y);

    // Look at player
    this.p2.facing = this.p1.x > this.p2.x ? 1 : -1;

    // Avoid falling off main platform edge
    if (this.p2.x < 210 && this.p2.grounded) {
      this.p2.moveRight();
      this.p2.jump();
      return;
    }
    if (this.p2.x > 790 && this.p2.grounded) {
      this.p2.moveLeft();
      this.p2.jump();
      return;
    }

    // Fire Super if available
    if (this.p2.superMeter >= 100 && Math.random() < 0.05) {
      this.p2.fireSuper(this);
      return;
    }

    // Combat Range Tactics
    if (dist < 60 && vertDist < 40) {
      this.p2.stopMove();
      // Block incoming punches/kicks
      if (this.p1.isPunching || this.p1.isKicking) {
        if (Math.random() < 0.6) {
          this.p2.block(true);
          return;
        }
      } else {
        this.p2.block(false);
      }

      // Attack
      const actionRoll = Math.random();
      if (actionRoll < 0.08) {
        this.p2.punch(this.p1, this);
      } else if (actionRoll < 0.14) {
        this.p2.kick(this.p1, this);
      }
    } else {
      // Approach Player
      this.p2.block(false);
      if (this.p1.x > this.p2.x) this.p2.moveRight();
      else this.p2.moveLeft();

      // Jump over obstacles / up to higher platform
      if (this.p1.y < this.p2.y - 40 && Math.random() < 0.04) {
        this.p2.jump();
      }
    }
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(this);

      // Collision with players
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

    // Update Players
    this.p1.update(this.platforms, this.height);
    this.p2.update(this.platforms, this.height);

    // Update Entities
    this.updateProjectiles();

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

    // Screen Shake effect
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake * 3;
      const shakeY = (Math.random() - 0.5) * this.screenShake * 3;
      this.ctx.translate(shakeX, shakeY);
    }

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Arena Background Grid / Nebula Glow
    this.drawArenaBackdrop();

    // Draw Platforms
    this.drawPlatforms();

    // Draw Players
    this.p1.draw(this.ctx);
    this.p2.draw(this.ctx);

    // Draw Projectiles & Particles
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.particles.forEach(pt => pt.draw(this.ctx));
    this.floatingTexts.forEach(ft => ft.draw(this.ctx));

    this.ctx.restore();
  }

  drawArenaBackdrop() {
    // Star dots
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37) % this.width;
      const sy = (i * 29) % (this.height - 100);
      this.ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Grid Floor glow below arena
    this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
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
      // Glow boundary
      this.ctx.shadowColor = '#6366f1';
      this.ctx.shadowBlur = 12;

      // Platform Core
      this.ctx.fillStyle = '#1e2238';
      this.ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Neon Top Edge
      this.ctx.fillStyle = '#818cf8';
      this.ctx.fillRect(plat.x, plat.y, plat.w, 4);

      // Bevel trim
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.fillRect(plat.x + 2, plat.y + 4, plat.w - 4, plat.h - 6);
    });
  }

  loop() {
    // Frame step with slow motion multiplier
    this.update();
    this.draw();

    requestAnimationFrame(() => this.loop());
  }
}

// Start Game on load
window.addEventListener('DOMContentLoaded', () => {
  new StickmanGame();
});

