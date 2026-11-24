/**
 * Space Fighter — pure game engine.
 *
 * Deliberately free of DOM and browser globals at module scope: the host
 * component owns the canvas, the requestAnimationFrame loop, input, audio and
 * persistence. Everything here advances from an explicit delta time and draws
 * into a 2D context that is handed in, which keeps the module import-safe
 * during server rendering.
 */

/** Virtual arcade resolution. The canvas is scaled to fit; logic never is. */
export const VIEW_W = 480;
export const VIEW_H = 640;

/** Size of one sprite "pixel" in virtual units — the chunky retro look. */
const PX = 4;

export const COLORS = {
  ship: {1: '#22d3ee', 2: '#fbbf24', 3: '#0e7490'},
  shipHit: {1: '#ffffff', 2: '#ffffff', 3: '#ffffff'},
  drone: {1: '#4ade80', 2: '#065f46', 3: '#065f46'},
  droneHit: {1: '#ffffff', 2: '#ffffff', 3: '#ffffff'},
  hunter: {1: '#f43f5e', 2: '#fde047', 3: '#7f1d1d'},
  hunterHit: {1: '#ffffff', 2: '#ffffff', 3: '#ffffff'}
};

// Sprites are read as a pixel grid; '.' is transparent, digits index COLORS.
export const SPRITE_SHIP = [
  '...1...',
  '..111..',
  '..131..',
  '.11111.',
  '1111111',
  '1.111.1',
  '..2.2..'
];

export const SPRITE_DRONE = [
  '..1..1..',
  '.111111.',
  '11122111',
  '11111111',
  '1.1111.1',
  '.1.11.1.'
];

export const SPRITE_HUNTER = [
  '1......1',
  '11....11',
  '11.22.11',
  '11122111',
  '.111111.',
  '..1111..',
  '...11...'
];

const SHIP_W = SPRITE_SHIP[0].length * PX;
const SHIP_H = SPRITE_SHIP.length * PX;
const DRONE_W = SPRITE_DRONE[0].length * PX;
const DRONE_H = SPRITE_DRONE.length * PX;
const HUNTER_W = SPRITE_HUNTER[0].length * PX;
const HUNTER_H = SPRITE_HUNTER.length * PX;

const PLAYER_SPEED = 260;
const PLAYER_FIRE_COOLDOWN = 0.16;
const PLAYER_BULLET_SPEED = 640;
const DRONE_BULLET_SPEED = 230;
const HUNTER_BULLET_SPEED = 320;

const RESPAWN_DELAY = 1.1;
const INVULN_TIME = 2.4;
const START_LIVES = 3;
const EXTRA_LIFE_EVERY = 5000;

const DRONE_POINTS = 100;
const HUNTER_POINTS = 250;
const WAVE_BONUS = 500;

const FORMATION_COLS = 6;
const FORMATION_X_GAP = 56;
const FORMATION_Y_GAP = 44;
const FORMATION_TOP = 92;

export const STATUS = {
  ATTRACT: 'attract',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover'
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function overlaps(a, b) {
  return (
    Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h
  );
}

function drawSprite(ctx, sprite, cx, cy, colors) {
  const left = Math.round(cx - (sprite[0].length * PX) / 2);
  const top = Math.round(cy - (sprite.length * PX) / 2);
  for (let r = 0; r < sprite.length; r++) {
    const row = sprite[r];
    for (let c = 0; c < row.length; c++) {
      const key = row[c];
      if (key === '.') continue;
      ctx.fillStyle = colors[key];
      ctx.fillRect(left + c * PX, top + r * PX, PX, PX);
    }
  }
}

export class SpaceFighterGame {
  /**
   * @param {object} options
   * @param {(type: string, detail?: object) => void} options.onEvent
   *   Notified for sound cues, HUD changes and screen-reader announcements.
   * @param {boolean} [options.reducedMotion] Suppresses shake and thins particles.
   * @param {object} [options.labels] Localized strings drawn onto the canvas.
   * @param {number} [options.hiScore] Restored high score.
   */
  constructor({onEvent, reducedMotion = false, labels = {}, hiScore = 0} = {}) {
    this.onEvent = onEvent || (() => {});
    this.reducedMotion = reducedMotion;
    this.labels = labels;
    this.hiScore = hiScore;

    this.status = STATUS.ATTRACT;
    this.score = 0;
    this.lives = START_LIVES;
    this.wave = 1;

    this.input = {left: false, right: false, up: false, down: false, fire: false};
    this.pointer = null;

    this.stars = [];
    for (let layer = 0; layer < 3; layer++) {
      const count = [40, 26, 14][layer];
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: rand(0, VIEW_W),
          y: rand(0, VIEW_H),
          speed: [18, 42, 86][layer],
          size: layer === 2 ? 2 : 1,
          alpha: [0.35, 0.6, 0.95][layer]
        });
      }
    }

    this._resetRun();
  }

  // ---------------------------------------------------------------- lifecycle

  _resetRun() {
    this.score = 0;
    this.lives = START_LIVES;
    this.wave = 1;
    this.nextExtraLife = EXTRA_LIFE_EVERY;
    this.time = 0;
    this.shake = 0;
    this.flash = 0;
    this.banner = null;
    this.bannerTimer = 0;
    this.waveIntermission = 0;
    this.respawnTimer = 0;
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.particles = [];
    this.formationDrift = 0;
    this.player = {
      x: VIEW_W / 2,
      y: VIEW_H - 72,
      w: SHIP_W - 8,
      h: SHIP_H - 8,
      cooldown: 0,
      invuln: INVULN_TIME,
      alive: true
    };
    this._spawnWave(1);
  }

  start() {
    this._resetRun();
    this.status = STATUS.PLAYING;
    this._showBanner(this.labels.waveBanner?.(1), 1.4);
    this._emitState();
    this.onEvent('sound', {cue: 'wave'});
    this.onEvent('announce', {message: this.labels.announceStart});
  }

  togglePause() {
    if (this.status === STATUS.PLAYING) {
      this.status = STATUS.PAUSED;
    } else if (this.status === STATUS.PAUSED) {
      this.status = STATUS.PLAYING;
    } else {
      return;
    }
    this._emitState();
    this.onEvent('announce', {
      message:
        this.status === STATUS.PAUSED
          ? this.labels.announcePaused
          : this.labels.announceResumed
    });
  }

  pause() {
    if (this.status !== STATUS.PLAYING) return;
    this.status = STATUS.PAUSED;
    this._emitState();
  }

  setInput(action, isDown) {
    if (action in this.input) this.input[action] = isDown;
  }

  clearInput() {
    for (const key of Object.keys(this.input)) this.input[key] = false;
    this.pointer = null;
  }

  /** Pointer/touch steering: the ship eases toward `x` and fires while held. */
  setPointer(x, firing) {
    this.pointer = x === null ? null : {x, firing};
  }

  getState() {
    return {
      status: this.status,
      score: this.score,
      hiScore: this.hiScore,
      lives: this.lives,
      wave: this.wave
    };
  }

  // ------------------------------------------------------------------- update

  update(dt) {
    this.time += dt;

    for (const star of this.stars) {
      const drift = this.reducedMotion ? 0.35 : 1;
      star.y += star.speed * drift * dt;
      if (star.y > VIEW_H) {
        star.y -= VIEW_H;
        star.x = rand(0, VIEW_W);
      }
    }

    if (this.status !== STATUS.PLAYING) return;

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 26);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3.2);
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner = null;
    }

    this._updatePlayer(dt);
    this._updateEnemies(dt);
    this._updateBullets(dt);
    this._updateParticles(dt);
    this._resolveCollisions();

    if (this.waveIntermission > 0) {
      this.waveIntermission -= dt;
      if (this.waveIntermission <= 0) {
        this.wave += 1;
        this._spawnWave(this.wave);
        this._showBanner(this.labels.waveBanner?.(this.wave), 1.4);
        this.onEvent('sound', {cue: 'wave'});
        this.onEvent('announce', {
          message: this.labels.announceWave?.(this.wave)
        });
        this._emitState();
      }
    } else if (this.enemies.length === 0) {
      this.waveIntermission = 2;
      this._addScore(WAVE_BONUS);
      this._showBanner(this.labels.waveClear, 1.8);
      this.onEvent('sound', {cue: 'waveClear'});
    }
  }

  _updatePlayer(dt) {
    const p = this.player;

    if (!p.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        if (this.lives > 0) {
          p.alive = true;
          p.x = VIEW_W / 2;
          p.y = VIEW_H - 72;
          p.invuln = INVULN_TIME;
          p.cooldown = 0;
          this.enemyBullets = [];
          this.onEvent('sound', {cue: 'respawn'});
          this.onEvent('announce', {
            message: this.labels.announceRespawn?.(this.lives)
          });
        } else {
          this.status = STATUS.GAME_OVER;
          if (this.score > this.hiScore) this.hiScore = this.score;
          this.onEvent('sound', {cue: 'gameOver'});
          this.onEvent('announce', {
            message: this.labels.announceGameOver?.(this.score, this.wave)
          });
          this._emitState();
          this.onEvent('gameover', {score: this.score, wave: this.wave});
        }
      }
      return;
    }

    if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);

    let dx = 0;
    let dy = 0;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;
    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;

    if (this.pointer) {
      const delta = this.pointer.x - p.x;
      if (Math.abs(delta) > 3) dx = clamp(delta / 40, -1, 1);
    }

    if (dx !== 0 && dy !== 0) {
      const inv = Math.SQRT1_2;
      dx *= inv;
      dy *= inv;
    }

    p.x = clamp(p.x + dx * PLAYER_SPEED * dt, SHIP_W / 2, VIEW_W - SHIP_W / 2);
    p.y = clamp(
      p.y + dy * PLAYER_SPEED * dt,
      VIEW_H * 0.55,
      VIEW_H - SHIP_H / 2 - 8
    );

    p.cooldown -= dt;
    const wantsFire = this.input.fire || this.pointer?.firing;
    if (wantsFire && p.cooldown <= 0) {
      p.cooldown = PLAYER_FIRE_COOLDOWN;
      this.bullets.push({
        x: p.x,
        y: p.y - SHIP_H / 2,
        vx: 0,
        vy: -PLAYER_BULLET_SPEED,
        w: 4,
        h: 14
      });
      this._spawnParticles(p.x, p.y - SHIP_H / 2, 3, '#22d3ee', 90);
      this.onEvent('sound', {cue: 'shoot'});
    }
  }

  _updateEnemies(dt) {
    const p = this.player;
    const speedScale = 1 + (this.wave - 1) * 0.11;
    this.formationDrift = Math.sin(this.time * 0.75) * 46;

    for (const e of this.enemies) {
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt * 8);
      e.fireTimer -= dt;

      if (e.type === 'drone') {
        if (!e.entered) {
          e.y += 190 * dt;
          if (e.y >= e.slotY) {
            e.y = e.slotY;
            e.entered = true;
          }
        } else {
          e.slotY += 3.2 * speedScale * dt;
          e.y = e.slotY + Math.sin(this.time * 2 + e.phase) * 5;
          e.x = e.slotX + this.formationDrift;
        }

        if (e.entered && e.fireTimer <= 0 && p.alive) {
          e.fireTimer = rand(2.4, 6.2) / speedScale;
          this.enemyBullets.push({
            x: e.x,
            y: e.y + DRONE_H / 2,
            vx: 0,
            vy: DRONE_BULLET_SPEED * speedScale,
            w: 5,
            h: 10,
            color: '#4ade80'
          });
          this.onEvent('sound', {cue: 'enemyShoot'});
        }

        // A drone that drifts past the ship is a lost containment, not a hit.
        if (e.y > VIEW_H + DRONE_H) {
          e.slotY = FORMATION_TOP - 60;
          e.y = -DRONE_H;
          e.entered = false;
        }
      } else {
        // Hunters swoop: they steer toward the ship's column while diving, then
        // loop back over the top of the field for another pass.
        const steer = clamp((p.x - e.x) / 90, -1, 1);
        e.vx += steer * 340 * dt;
        e.vx = clamp(e.vx, -210 * speedScale, 210 * speedScale);
        e.x += e.vx * dt;
        e.y += e.vy * speedScale * dt;

        if (e.x < HUNTER_W / 2) {
          e.x = HUNTER_W / 2;
          e.vx = Math.abs(e.vx);
        }
        if (e.x > VIEW_W - HUNTER_W / 2) {
          e.x = VIEW_W - HUNTER_W / 2;
          e.vx = -Math.abs(e.vx);
        }

        if (e.y > VIEW_H - 90) {
          e.y = -HUNTER_H;
          e.x = rand(HUNTER_W, VIEW_W - HUNTER_W);
          e.vx = 0;
        }

        if (e.fireTimer <= 0 && p.alive && e.y > 0 && e.y < VIEW_H - 160) {
          e.fireTimer = rand(1.5, 3.2) / speedScale;
          const dx = p.x - e.x;
          const dy = p.y - e.y;
          const len = Math.hypot(dx, dy) || 1;
          this.enemyBullets.push({
            x: e.x,
            y: e.y + HUNTER_H / 2,
            vx: (dx / len) * HUNTER_BULLET_SPEED,
            vy: (dy / len) * HUNTER_BULLET_SPEED,
            w: 6,
            h: 6,
            color: '#f43f5e'
          });
          this.onEvent('sound', {cue: 'enemyShoot'});
        }
      }
    }
  }

  _updateBullets(dt) {
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
    this.bullets = this.bullets.filter(b => b.y > -20);

    for (const b of this.enemyBullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
    this.enemyBullets = this.enemyBullets.filter(
      b => b.y < VIEW_H + 20 && b.y > -20 && b.x > -20 && b.x < VIEW_W + 20
    );
  }

  _updateParticles(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  _resolveCollisions() {
    const p = this.player;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (!overlaps(b, e)) continue;
        this.bullets.splice(i, 1);
        e.hp -= 1;
        if (e.hp <= 0) {
          this.enemies.splice(j, 1);
          this._addScore(e.type === 'drone' ? DRONE_POINTS : HUNTER_POINTS);
          this._spawnParticles(
            e.x,
            e.y,
            this.reducedMotion ? 8 : 20,
            e.type === 'drone' ? '#4ade80' : '#f43f5e',
            200
          );
          this.shake = this.reducedMotion ? 0 : 5;
          this.onEvent('sound', {cue: 'explode'});
        } else {
          e.hitFlash = 1;
          this._spawnParticles(b.x, b.y, 5, '#ffffff', 130);
          this.onEvent('sound', {cue: 'hit'});
        }
        break;
      }
    }

    if (!p.alive || p.invuln > 0) return;

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      if (overlaps(this.enemyBullets[i], p)) {
        this.enemyBullets.splice(i, 1);
        this._killPlayer();
        return;
      }
    }

    for (const e of this.enemies) {
      if (overlaps(e, p)) {
        this._killPlayer();
        return;
      }
    }
  }

  _killPlayer() {
    const p = this.player;
    p.alive = false;
    this.lives -= 1;
    this.respawnTimer = RESPAWN_DELAY;
    this.shake = this.reducedMotion ? 0 : 16;
    this.flash = 1;
    this._spawnParticles(
      p.x,
      p.y,
      this.reducedMotion ? 12 : 34,
      '#22d3ee',
      260
    );
    this.onEvent('sound', {cue: 'death'});
    this._emitState();
  }

  _addScore(points) {
    this.score += points;
    if (this.score >= this.nextExtraLife) {
      this.nextExtraLife += EXTRA_LIFE_EVERY;
      this.lives += 1;
      this.onEvent('sound', {cue: 'extraLife'});
      this.onEvent('announce', {message: this.labels.announceExtraLife});
      this._showBanner(this.labels.extraLife, 1.2);
    }
    if (this.score > this.hiScore) this.hiScore = this.score;
    this._emitState();
  }

  _spawnWave(wave) {
    this.enemies = [];
    const rows = clamp(2 + Math.floor((wave - 1) / 2), 2, 4);
    const startX = (VIEW_W - (FORMATION_COLS - 1) * FORMATION_X_GAP) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < FORMATION_COLS; col++) {
        const slotX = startX + col * FORMATION_X_GAP;
        const slotY = FORMATION_TOP + row * FORMATION_Y_GAP;
        this.enemies.push({
          type: 'drone',
          x: slotX,
          y: -DRONE_H - row * 46 - col * 8,
          slotX,
          slotY,
          w: DRONE_W - 8,
          h: DRONE_H - 6,
          hp: 1,
          hitFlash: 0,
          entered: false,
          phase: rand(0, Math.PI * 2),
          fireTimer: rand(1.5, 5)
        });
      }
    }

    const hunters = clamp(1 + Math.floor(wave / 2), 1, 5);
    for (let i = 0; i < hunters; i++) {
      this.enemies.push({
        type: 'hunter',
        x: rand(HUNTER_W, VIEW_W - HUNTER_W),
        y: -HUNTER_H - i * 150,
        vx: 0,
        vy: 92 + wave * 5,
        w: HUNTER_W - 8,
        h: HUNTER_H - 6,
        hp: 2,
        hitFlash: 0,
        fireTimer: rand(2, 4)
      });
    }
  }

  _spawnParticles(x, y, count, color, speed) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const velocity = rand(speed * 0.25, speed);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: rand(0.25, 0.7),
        color,
        size: rand(2, 4)
      });
    }
  }

  _showBanner(text, seconds) {
    if (!text) return;
    this.banner = text;
    this.bannerTimer = seconds;
  }

  _emitState() {
    this.onEvent('state', this.getState());
  }

  // ------------------------------------------------------------------- render

  render(ctx) {
    ctx.save();
    ctx.fillStyle = '#04070f';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (this.shake > 0) {
      ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));
    }

    for (const star of this.stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = '#cbd5f5';
      ctx.fillRect(star.x | 0, star.y | 0, star.size, star.size);
    }
    ctx.globalAlpha = 1;

    for (const p of this.particles) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    for (const b of this.bullets) {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.28)';
      ctx.fillRect(b.x - b.w, b.y - b.h / 2 - 3, b.w * 2, b.h + 6);
      ctx.fillStyle = '#e0fbff';
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }

    for (const b of this.enemyBullets) {
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(b.x - b.w, b.y - b.h, b.w * 2, b.h * 2);
      ctx.globalAlpha = 1;
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }

    for (const e of this.enemies) {
      const sprite = e.type === 'drone' ? SPRITE_DRONE : SPRITE_HUNTER;
      const palette =
        e.hitFlash > 0.4
          ? e.type === 'drone'
            ? COLORS.droneHit
            : COLORS.hunterHit
          : e.type === 'drone'
            ? COLORS.drone
            : COLORS.hunter;
      drawSprite(ctx, sprite, e.x, e.y, palette);
    }

    const p = this.player;
    if (p.alive) {
      // Blink while the respawn shield is up so invulnerability is legible.
      const blinking = p.invuln > 0 && Math.floor(this.time * 14) % 2 === 0;
      if (!blinking) {
        drawSprite(ctx, SPRITE_SHIP, p.x, p.y, COLORS.ship);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.fillRect(p.x - 6, p.y + SHIP_H / 2 - 2, 4, rand(4, 10));
        ctx.fillRect(p.x + 2, p.y + SHIP_H / 2 - 2, 4, rand(4, 10));
      }
      if (p.invuln > 0) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, SHIP_W * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(244, 63, 94, ${this.flash * 0.35})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }

    if (this.banner) {
      ctx.save();
      ctx.font = 'bold 26px "Courier New", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(4, 7, 15, 0.72)';
      ctx.fillRect(0, VIEW_H / 2 - 34, VIEW_W, 68);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(this.banner, VIEW_W / 2, VIEW_H / 2);
      ctx.restore();
    }
  }
}
