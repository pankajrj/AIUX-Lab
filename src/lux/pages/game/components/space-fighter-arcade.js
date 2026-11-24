import {html, css, nothing, isServer} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {SpaceFighterGame, STATUS, VIEW_W, VIEW_H} from './engine.js';

const HI_SCORE_KEY = 'space-fighter:hi-score';
const MUTE_KEY = 'space-fighter:muted';
const MAX_FRAME_DT = 0.05;
const STEP = 1 / 120;

/** Maps raw keys to engine input actions. Case is normalized before lookup. */
const KEY_MAP = {
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  ' ': 'fire'
};

/**
 * Tiny WebAudio bleeper — every cue is synthesized, so the app ships no audio
 * assets. The context is created lazily on the first gesture because browsers
 * block autoplay before user interaction.
 */
class Bleeper {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _ensure() {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  _tone({type = 'square', from, to, duration, gain = 0.06, delay = 0}) {
    const ctx = this._ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + duration);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  _noise({duration = 0.3, gain = 0.16, lowpass = 1200}) {
    const ctx = this._ensure();
    if (!ctx) return;
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    src.connect(filter).connect(amp).connect(ctx.destination);
    src.start();
  }

  play(cue) {
    switch (cue) {
      case 'shoot':
        this._tone({from: 900, to: 220, duration: 0.09, gain: 0.045});
        break;
      case 'enemyShoot':
        this._tone({type: 'sawtooth', from: 300, to: 120, duration: 0.12, gain: 0.03});
        break;
      case 'hit':
        this._tone({from: 620, to: 380, duration: 0.06, gain: 0.05});
        break;
      case 'explode':
        this._noise({duration: 0.28, gain: 0.14, lowpass: 1400});
        this._tone({type: 'triangle', from: 200, to: 40, duration: 0.28, gain: 0.05});
        break;
      case 'death':
        this._noise({duration: 0.7, gain: 0.2, lowpass: 800});
        this._tone({type: 'sawtooth', from: 340, to: 30, duration: 0.7, gain: 0.08});
        break;
      case 'respawn':
        this._tone({from: 180, to: 720, duration: 0.28, gain: 0.05});
        break;
      case 'wave':
        [392, 523, 659].forEach((f, i) =>
          this._tone({from: f, to: f, duration: 0.12, gain: 0.05, delay: i * 0.11})
        );
        break;
      case 'waveClear':
        [523, 659, 784, 1047].forEach((f, i) =>
          this._tone({from: f, to: f, duration: 0.1, gain: 0.05, delay: i * 0.09})
        );
        break;
      case 'extraLife':
        [784, 988, 1319].forEach((f, i) =>
          this._tone({from: f, to: f, duration: 0.1, gain: 0.06, delay: i * 0.08})
        );
        break;
      case 'gameOver':
        [440, 349, 262, 175].forEach((f, i) =>
          this._tone({type: 'triangle', from: f, to: f, duration: 0.3, gain: 0.07, delay: i * 0.22})
        );
        break;
      default:
        break;
    }
  }

  close() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

@customElement('space-fighter-arcade')
export default class SpaceFighterArcade extends AIUXElement {
  @state() _status = STATUS.ATTRACT;
  @state() _score = 0;
  @state() _hiScore = 0;
  @state() _lives = 3;
  @state() _wave = 1;
  @state() _muted = false;
  @state() _announcement = '';

  @query('#play-field') _canvas;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    /* The cabinet is a fixed 3:4 virtual screen scaled to the available
       height, so the pixel art keeps its aspect ratio at every viewport. */
    .cabinet {
      aspect-ratio: 480 / 640;
      max-height: min(72vh, 640px);
      width: 100%;
      max-width: min(100%, 480px);
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      background: var(--arcade-void);
      touch-action: none;
      outline: none;
    }

    /* Focus lives on the wrapper because the canvas is a passive surface. */
    .screen:focus-visible {
      outline: 3px solid var(--arcade-beam);
      outline-offset: 3px;
    }

    /* CRT scanlines + vignette. Purely decorative and never interactive. */
    .crt::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        repeating-linear-gradient(
          to bottom,
          var(--arcade-scanline) 0 1px,
          transparent 1px 3px
        ),
        radial-gradient(
          ellipse at center,
          transparent 55%,
          var(--arcade-vignette) 100%
        );
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Scanlines read as flicker to motion-sensitive users; keep the vignette. */
    @media (prefers-reduced-motion: reduce) {
      .crt::after {
        background: radial-gradient(
          ellipse at center,
          transparent 60%,
          var(--arcade-vignette) 100%
        );
      }
    }
  `;

  constructor() {
    super();
    // No browser access here — SSR runs the constructor too.
    this._game = null;
    this._audio = null;
    this._raf = 0;
    this._lastTime = 0;
    this._accumulator = 0;
    this._resizeObserver = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._tick = this._tick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (isServer) return;
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (isServer) return;
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    this._audio?.close();
    this._audio = null;
  }

  firstUpdated() {
    this._muted = this._readStored(MUTE_KEY) === 'true';
    this._audio = new Bleeper();
    this._audio.muted = this._muted;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this._game = new SpaceFighterGame({
      reducedMotion,
      hiScore: Number(this._readStored(HI_SCORE_KEY)) || 0,
      labels: this._engineLabels(),
      onEvent: (type, detail) => this._onGameEvent(type, detail)
    });

    this._hiScore = this._game.hiScore;

    this._resizeObserver = new ResizeObserver(() => this._sizeCanvas());
    this._resizeObserver.observe(this._canvas);
    this._sizeCanvas();

    this._lastTime = performance.now();
    this._raf = requestAnimationFrame(this._tick);
  }

  // -------------------------------------------------------------- game wiring

  _engineLabels() {
    return {
      waveBanner: n => i18n.getMessage('WAVE {0}', [n]),
      waveClear: i18n.getMessage('WAVE CLEAR'),
      extraLife: i18n.getMessage('EXTRA LIFE'),
      announceStart: i18n.getMessage(
        'Game started. Three lives. Arrow keys to fly, space to fire.'
      ),
      announcePaused: i18n.getMessage('Game paused.'),
      announceResumed: i18n.getMessage('Game resumed.'),
      announceExtraLife: i18n.getMessage('Extra life awarded.'),
      announceWave: n => i18n.getMessage('Wave {0} incoming.', [n]),
      announceRespawn: lives =>
        i18n.getMessage('Fighter destroyed. {0} lives remaining.', [lives]),
      announceGameOver: (score, wave) =>
        i18n.getMessage('Game over. Final score {0} on wave {1}.', [score, wave])
    };
  }

  _onGameEvent(type, detail) {
    if (type === 'sound') {
      if (!this._muted) this._audio?.play(detail.cue);
      return;
    }
    if (type === 'announce') {
      this._announcement = detail.message || '';
      return;
    }
    if (type === 'state') {
      this._status = detail.status;
      this._score = detail.score;
      this._hiScore = detail.hiScore;
      this._lives = detail.lives;
      this._wave = detail.wave;
      return;
    }
    if (type === 'gameover') {
      this._writeStored(HI_SCORE_KEY, String(this._game.hiScore));
    }
  }

  _sizeCanvas() {
    const canvas = this._canvas;
    if (!canvas) return;
    // Render at device resolution so the pixel sprites stay crisp on HiDPI.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(VIEW_W * dpr);
    const height = Math.round(VIEW_H * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  _tick(now) {
    this._raf = requestAnimationFrame(this._tick);
    if (!this._game) return;

    // Clamping guards against the huge dt a backgrounded tab produces, which
    // would otherwise tunnel bullets straight through the ship on return.
    const dt = Math.min((now - this._lastTime) / 1000, MAX_FRAME_DT);
    this._lastTime = now;
    this._accumulator += dt;

    let steps = 0;
    while (this._accumulator >= STEP && steps < 8) {
      this._game.update(STEP);
      this._accumulator -= STEP;
      steps++;
    }

    const ctx = this._canvas?.getContext('2d');
    if (ctx) this._game.render(ctx);
  }

  // -------------------------------------------------------------------- input

  _onKeyDown(event) {
    if (!this._game) return;
    const key = event.key.toLowerCase();

    if (key === 'enter') {
      event.preventDefault();
      if (this._status !== STATUS.PLAYING) this._startGame();
      return;
    }
    if (key === 'p' || key === 'escape') {
      event.preventDefault();
      this._game.togglePause();
      return;
    }
    if (key === 'm') {
      event.preventDefault();
      this._toggleMute();
      return;
    }

    const action = KEY_MAP[key];
    if (!action) return;
    // Arrows and space scroll the page by default; the cabinet owns them.
    event.preventDefault();
    if (this._status === STATUS.ATTRACT || this._status === STATUS.GAME_OVER) {
      if (action === 'fire') this._startGame();
      return;
    }
    this._game.setInput(action, true);
  }

  _onKeyUp(event) {
    const action = KEY_MAP[event.key.toLowerCase()];
    if (!action || !this._game) return;
    event.preventDefault();
    this._game.setInput(action, false);
  }

  _onBlur() {
    // Only release held keys. Pausing here would fight the Pause button, which
    // blurs the play field before its own click handler runs.
    this._game?.clearInput();
  }

  _onVisibilityChange() {
    if (document.hidden) {
      this._game?.clearInput();
      this._game?.pause();
    }
  }

  _onPointerDown(event) {
    if (!this._game) return;
    event.currentTarget.focus();
    if (this._status === STATUS.ATTRACT || this._status === STATUS.GAME_OVER) {
      this._startGame();
      return;
    }
    // Paused: let the overlay's own Resume button handle it rather than
    // restarting the run out from under the player.
    if (this._status !== STATUS.PLAYING) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    this._updatePointer(event, true);
  }

  _onPointerMove(event) {
    if (!this._game || this._status !== STATUS.PLAYING) return;
    if (!this._game.pointer) return;
    this._updatePointer(event, true);
  }

  _onPointerUp() {
    this._game?.setPointer(null);
  }

  _updatePointer(event, firing) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    this._game.setPointer(((event.clientX - rect.left) / rect.width) * VIEW_W, firing);
  }

  // ------------------------------------------------------------------ actions

  _startGame() {
    this._game?.start();
  }

  _togglePause() {
    this._game?.togglePause();
    this.renderRoot.querySelector('#screen')?.focus();
  }

  _toggleMute() {
    this._muted = !this._muted;
    if (this._audio) this._audio.muted = this._muted;
    this._writeStored(MUTE_KEY, String(this._muted));
  }

  _readStored(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  _writeStored(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Private-mode or blocked storage — scores simply do not persist.
    }
  }

  // ------------------------------------------------------------------- render

  /** Ship glyphs for the lives readout, capped so a long run stays on one line. */
  get _livesGlyph() {
    if (this._lives <= 0) return '\u2014';
    const shown = Math.min(this._lives, 6);
    const overflow = this._lives - shown;
    return '\u25b2'.repeat(shown) + (overflow > 0 ? ` +${overflow}` : '');
  }

  _renderHud() {
    const stat = (label, value) => html`
      <div class="flex flex-col gap-0.5">
        <span class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60"
          >${label}</span
        >
        <span class="font-mono text-lg font-bold leading-none tabular-nums"
          >${value}</span
        >
      </div>
    `;

    return html`
      <div
        class="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--arcade-edge)] px-4 py-3 text-[var(--arcade-phosphor)]"
      >
        ${stat(i18n.getMessage('Score'), String(this._score).padStart(6, '0'))}
        ${stat(i18n.getMessage('Hi-score'), String(this._hiScore).padStart(6, '0'))}
        ${stat(i18n.getMessage('Wave'), String(this._wave).padStart(2, '0'))}
        <div class="flex flex-col gap-0.5">
          <span
            class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60"
            >${i18n.getMessage('Lives')}</span
          >
          <span
            class="font-mono text-lg leading-none text-[var(--arcade-amber)]"
            role="img"
            aria-label=${i18n.getMessage('{0} lives remaining', [this._lives])}
          >
            ${this._livesGlyph}
          </span>
        </div>
      </div>
    `;
  }

  _renderOverlay() {
    if (this._status === STATUS.PLAYING) return nothing;

    const panels = {
      [STATUS.ATTRACT]: {
        title: i18n.getMessage('SPACE FIGHTER'),
        body: i18n.getMessage(
          'Clear each wave of drones and hunters. Three lives. Good luck, pilot.'
        ),
        action: i18n.getMessage('Insert coin — Start')
      },
      [STATUS.PAUSED]: {
        title: i18n.getMessage('PAUSED'),
        body: i18n.getMessage('Press P or Escape to resume.'),
        action: null
      },
      [STATUS.GAME_OVER]: {
        title: i18n.getMessage('GAME OVER'),
        body: i18n.getMessage('Final score {0} — reached wave {1}.', [
          this._score,
          this._wave
        ]),
        action: i18n.getMessage('Play again')
      }
    };

    const panel = panels[this._status];
    if (!panel) return nothing;

    return html`
      <div
        class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--arcade-scrim)] px-6 text-center"
      >
        <h3
          class="font-mono text-2xl font-bold tracking-[0.3em] text-[var(--arcade-amber)] sm:text-3xl"
        >
          ${panel.title}
        </h3>
        <p class="max-w-xs break-words font-mono text-xs leading-relaxed text-[var(--arcade-mist)]">
          ${panel.body}
        </p>
        ${panel.action
          ? html`
              <button
                class="aiux-btn aiux-btn-sm border-[var(--arcade-beam)] bg-[var(--arcade-panel)] font-mono tracking-widest text-[var(--arcade-phosphor)] hover:bg-[var(--arcade-panel-hover)]"
                @click=${this._startGame}
              >
                ${panel.action}
              </button>
            `
          : html`
              <button
                class="aiux-btn aiux-btn-sm border-[var(--arcade-beam)] bg-[var(--arcade-panel)] font-mono tracking-widest text-[var(--arcade-phosphor)] hover:bg-[var(--arcade-panel-hover)]"
                @click=${this._togglePause}
              >
                ${i18n.getMessage('Resume')}
              </button>
            `}
      </div>
    `;
  }

  render() {
    const isPlaying = this._status === STATUS.PLAYING;

    return html`
      <div
        class="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--arcade-edge)] bg-[var(--arcade-bezel)] shadow-[0_0_40px_var(--arcade-glow)]"
      >
        ${this._renderHud()}

        <div class="crt relative flex justify-center bg-[var(--arcade-void)] p-3">
          <div
            id="screen"
            class="screen cabinet relative"
            tabindex="0"
            role="application"
            data-a11y-skip="role=application is the correct role for a keyboard-driven
              game surface; it is not in the plugin's interactive-role allowlist"
            aria-label=${i18n.getMessage(
              'Space Fighter play field. Arrow keys or W A S D to fly, space to fire, P to pause, M to mute.'
            )}
            @keydown=${this._onKeyDown}
            @keyup=${this._onKeyUp}
            @blur=${this._onBlur}
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @pointercancel=${this._onPointerUp}
          >
            <canvas id="play-field" aria-hidden="true"></canvas>
            ${this._renderOverlay()}
          </div>
        </div>

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--arcade-edge)] px-4 py-3"
        >
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--arcade-dim)]">
            ${i18n.getMessage('Arrows / WASD move — Space fires — P pauses')}
          </p>
          <div class="flex gap-2">
            <button
              class="aiux-btn aiux-btn-xs aiux-btn-ghost font-mono text-[var(--arcade-phosphor)]"
              @click=${this._togglePause}
              ?disabled=${this._status === STATUS.ATTRACT ||
              this._status === STATUS.GAME_OVER}
              aria-pressed=${this._status === STATUS.PAUSED}
            >
              ${isPlaying ? i18n.getMessage('Pause') : i18n.getMessage('Resume')}
            </button>
            <button
              class="aiux-btn aiux-btn-xs aiux-btn-ghost font-mono text-[var(--arcade-phosphor)]"
              @click=${this._toggleMute}
              aria-pressed=${this._muted}
            >
              ${this._muted
                ? i18n.getMessage('Sound off')
                : i18n.getMessage('Sound on')}
            </button>
          </div>
        </div>
      </div>

      <p class="sr-only" role="status" aria-live="polite">
        ${this._announcement}
      </p>
    `;
  }
}
