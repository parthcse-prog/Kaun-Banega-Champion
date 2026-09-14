import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Target, Zap, Skull } from 'lucide-react';
import logo from '../assets/Logos/Logic_Blast.png';
import './KnifeHit.css';

/* ──────────── constants ──────────── */
const LOG_RADIUS = 80;
const KNIFE_LENGTH = 70;
const THROW_DURATION = 350; // ms — time for knife to travel from launch to stick
const THROW_SPEED_BASE = 8;
const KNIFE_MIN_GAP = 0.22; // radians — derived from knife width vs log radius
const KNIFE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F472B6', '#34D399', '#FB923C', '#38BDF8'];
const LEVEL_TRANSITION_MS = 500; // delay before log clears for the next level
const APPLE_SPAWN_MIN = 0; // minimum apples per level
const APPLE_SPAWN_MAX = 2; // maximum apples per level

/* ──────────── sound (unchanged) ──────────── */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const playSound = (type) => {
  try {
    if (!audioCtx) audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    switch (type) {
      case 'throw':
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
        break;
      case 'hit':
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
        break;
      case 'levelup':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
        break;
      case 'gameover':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.5);
        break;
      case 'combo':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
        break;
      case 'apple':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
        break;
      case 'power':
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
        break;
      default:
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.05);
    }
  } catch (_) { /* silent */ }
};

/* ──────────── MAIN COMPONENT ──────────── */
export default function KnifeHit() {
  // React state
  const [gameState, setGameState] = useState('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('knifehit_highscore') || '0', 10); } catch { return 0; }
  });
  const [knives, setKnives] = useState([]);
  const [apples, setApples] = useState([]);
  const [logRotation, setLogRotation] = useState(0);
  const [throwingKnife, setThrowingKnife] = useState(null);
  const [level, setLevel] = useState(1);
  const [knivesForLevel, setKnivesForLevel] = useState(0);
  const [requiredKnives, setRequiredKnives] = useState(4);
  const [rotationDir, setRotationDir] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(0);
  const [freezeActive, setFreezeActive] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [screenFlash, setScreenFlash] = useState(null);
  const [appleCount, setAppleCount] = useState(0);

  // Mutable refs
  const logRotRef = useRef(0);
  const gsRef = useRef('MENU');
  const spdRef = useRef(0);
  const dirRef = useRef(1);
  const freezeRef = useRef(false);
  const knivesRef = useRef([]);
  const applesRef = useRef([]);
  const lvlRef = useRef(1);
  const kflRef = useRef(0);
  const rqRef = useRef(4);
  const kiRef = useRef(0);
  const wobRef = useRef(0);
  const appleCountRef = useRef(0);

  useEffect(() => { gsRef.current = gameState; }, [gameState]);
  useEffect(() => { spdRef.current = rotationSpeed; }, [rotationSpeed]);
  useEffect(() => { dirRef.current = rotationDir; }, [rotationDir]);
  useEffect(() => { freezeRef.current = freezeActive; }, [freezeActive]);
  useEffect(() => { knivesRef.current = knives; }, [knives]);
  useEffect(() => { applesRef.current = apples; }, [apples]);
  useEffect(() => { lvlRef.current = level; }, [level]);
  useEffect(() => { kflRef.current = knivesForLevel; }, [knivesForLevel]);
  useEffect(() => { rqRef.current = requiredKnives; }, [requiredKnives]);
  useEffect(() => { appleCountRef.current = appleCount; }, [appleCount]);

  const normalizeAngle = (a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  const angularDistance = (a, b) => {
    let d = Math.abs(a - b) % (Math.PI * 2);
    return d > Math.PI ? Math.PI * 2 - d : d;
  };

  const checkKnifeCollision = (newAngle) =>
    knivesRef.current.some((k) => angularDistance(newAngle, k.angle) < KNIFE_MIN_GAP);

  const checkAppleHit = (angle) =>
    applesRef.current.findIndex((a) => !a.hit && angularDistance(angle, a.angle) < 0.35);

  const computeRotationSpeed = (lvl) => Math.min(0.018 + lvl * 0.0035, 0.06);

  const scoreRef = useRef(0);
  const hsRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { hsRef.current = highScore; }, [highScore]);

  const resetGame = useCallback(() => {
    setScore(0); setKnives([]); setApples([]); setLogRotation(0); logRotRef.current = 0;
    setLevel(1); setKnivesForLevel(0); setRequiredKnives(4);
    setRotationDir(1); const s = computeRotationSpeed(1); setRotationSpeed(s); spdRef.current = s; dirRef.current = 1;
    setFreezeActive(false); freezeRef.current = false; kiRef.current = 0; wobRef.current = 0;
    setShakeTarget(false); setShowScore(false); setScreenFlash(null);
    setAppleCount(0); appleCountRef.current = 0;
    setGameState('PLAYING');
  }, []);

  // MAIN ROTATION LOOP — single rAF driving logRotation every frame
  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      if (gsRef.current === 'PLAYING' && !freezeRef.current) {
        if (lvlRef.current >= 3) {
          wobRef.current += 1;
          if (wobRef.current >= 60 + Math.floor(Math.random() * 41)) {
            dirRef.current *= -1;
            setRotationDir(dirRef.current);
            wobRef.current = 0;
          }
        }
        logRotRef.current += spdRef.current * dirRef.current;
        if (logRotRef.current > Math.PI * 4) logRotRef.current -= Math.PI * 4;
        if (logRotRef.current < -Math.PI * 4) logRotRef.current += Math.PI * 4;
        setLogRotation(logRotRef.current);
      }
      if (alive) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); throwKnife(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Spawn apples only at level start (0-2 apples per level)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    // Generate 0-2 apples with random angles on the log
    const count = APPLE_SPAWN_MIN + Math.floor(Math.random() * (APPLE_SPAWN_MAX + 1));
    const newApples = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      hit: false,
      id: Date.now() + Math.random(),
    }));
    setApples(newApples);
    applesRef.current = newApples;
  }, [gameState, level]);

  // throwKnife — uses refs for per-frame mutation
  const throwKnife = useCallback(() => {
    if (gsRef.current !== 'PLAYING') return;
    setShakeTarget(false);
    setThrowingKnife({ progress: 0, active: true });
    playSound('throw');
    const startTime = performance.now();
    const anim = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / THROW_DURATION, 1);
      // Ease-out: starts fast, slows near the log edge
      const eased = 1 - Math.pow(1 - t, 3);
      const y = -KNIFE_LENGTH + eased * KNIFE_LENGTH; // -70 → 0
      setThrowingKnife({ y, active: true });
      if (t < 1) {
        requestAnimationFrame(anim);
      } else {
        setThrowingKnife(null);
        const hitAngle = (-Math.PI / 2) - logRotRef.current;
        const relAngle = normalizeAngle(hitAngle);

        // Check knife collision
        if (checkKnifeCollision(relAngle)) {
          setGameState('GAMEOVER');
          playSound('gameover');
          const cur = scoreRef.current; setScore(cur);
          if (cur > hsRef.current) { setHighScore(cur); try { localStorage.setItem('knifehit_highscore', String(cur)); } catch {} }
          return;
        }

        // Shake the target on successful hit
        setShakeTarget(true);
        setTimeout(() => setShakeTarget(false), 100);

        // Check apple hit
        const appleIdx = checkAppleHit(relAngle);
        if (appleIdx !== -1) {
          setScreenFlash('#FF6B6B');
          setTimeout(() => setScreenFlash(null), 200);
          playSound('apple');
          setApples((prev) => { const u = [...prev]; u[appleIdx] = { ...u[appleIdx], hit: true }; return u; });
          setAppleCount((c) => { const n = c + 1; appleCountRef.current = n; return n; });
        }

        // Stick knife
        const newKnives = [...knivesRef.current, { angle: relAngle, color: KNIFE_COLORS[kiRef.current % KNIFE_COLORS.length], id: Date.now() }];
        setKnives(newKnives); knivesRef.current = newKnives;
        setScore((s) => { const n = s + 1; scoreRef.current = n; return n; });
        setShowScore(true);
        setTimeout(() => setShowScore(false), 600);
        kiRef.current += 1;
        setKnivesForLevel((prev) => {
          const next = prev + 1;
          if (next >= rqRef.current) {
            // Level complete: brief delay + visual effect, then clear log
            setScreenFlash('#FBBF24');
            setTimeout(() => setScreenFlash(null), 300);
            playSound('levelup');
            setTimeout(() => {
              // Clear all knives and apples for the new level
              setKnives([]); knivesRef.current = [];
              setApples([]); applesRef.current = [];
              // Advance to next level
              const nl = lvlRef.current + 1;
              setLevel(nl); setKnivesForLevel(0);
              const nr = 4 + nl; setRequiredKnives(nr);
              const ns = computeRotationSpeed(nl); setRotationSpeed(ns); spdRef.current = ns;
            }, LEVEL_TRANSITION_MS);
          }
          return next;
        });
      }
    };
    requestAnimationFrame(anim);
  }, []);

  /* ── render helpers ── */
  // Stuck knives: each knife knows its RELATIVE angle; rendering adds current logRotation
  const renderKnivesOnTarget = () =>
    knives.map((knife) => {
      const absRad = knife.angle + logRotation;
      return (
        <g key={knife.id}>
          <line
            x1={LOG_RADIUS * Math.cos(absRad)}
            y1={LOG_RADIUS * Math.sin(absRad)}
            x2={LOG_RADIUS * Math.cos(absRad) + KNIFE_LENGTH * Math.cos(absRad)}
            y2={LOG_RADIUS * Math.sin(absRad) + KNIFE_LENGTH * Math.sin(absRad)}
            stroke={knife.color}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle
            cx={LOG_RADIUS * Math.cos(absRad) + KNIFE_LENGTH * Math.cos(absRad)}
            cy={LOG_RADIUS * Math.sin(absRad) + KNIFE_LENGTH * Math.sin(absRad)}
            r="6"
            fill={knife.color}
          />
        </g>
      );
    });

  // Apples on target: render only un-hit ones
  const renderApplesOnTarget = () =>
    apples.filter((a) => !a.hit).map((apple) => {
      const absRad = apple.angle + logRotation;
      const ax = LOG_RADIUS * Math.cos(absRad);
      const ay = LOG_RADIUS * Math.sin(absRad);
      return (
        <g key={apple.id}>
          <circle cx={ax} cy={ay} r="10" fill="#FF4444" />
          <circle cx={ax} cy={ay} r="5" fill="#CC0000" opacity="0.6" />
          <line x1={ax} y1={ay - 10} x2={ax + 3} y2={ay - 15} stroke="#228B22" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx={ax + 5} cy={ay - 14} rx="5" ry="3" fill="#228B22" />
        </g>
      );
    });

  return (
    <div className="knifehit-game">
      <style>{`
        @keyframes scorePop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes targetShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .score-pop { animation: scorePop 0.5s ease-out; }
        .target-shake { animation: targetShake 0.4s ease-out; }
        .fade-in-up { animation: fadeInUp 0.4s ease-out; }
      `}</style>
      <div className="knifehit-bg"><div className="knifehit-bg-glow" /><div className="knifehit-bg-pattern" /></div>
      <header className="knifehit-header">
        <div className="knifehit-header-left">
          <img src={logo} alt="Logo" className="knifehit-logo" />
          <span className="knifehit-title">KNIFE HIT</span>
        </div>
        <div className="knifehit-header-right">
          <div className="knifehit-stat"><Trophy size={16} className="knifehit-stat-icon" /><span>Best: {highScore}</span></div>
          <div className="knifehit-stat knifehit-stat-level"><Zap size={16} /><span>Lvl {level}</span></div>
          <div className="knifehit-stat knifehit-stat-apples">
            <span style={{ fontSize: '1rem', filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.6))' }}>🍎</span>
            <span className="knifehit-stat-apples-count">{appleCount}</span>
          </div>
        </div>
      </header>
      <main className="knifehit-main">
        {gameState === 'MENU' && (
          <div className="knifehit-menu fade-in-up">
            <div className="knifehit-menu-card">
              <div className="knifehit-menu-icon"><Target size={48} /></div>
              <h1 className="knifehit-menu-title">KNIFE HIT</h1>
              <p className="knifehit-menu-desc">Tap or press Space to throw knives at the rotating target.{"\n"}Don't hit an existing knife!</p>
              <button className="knifehit-btn knifehit-btn-primary" onClick={resetGame}><PlayIcon />START GAME</button>
              {highScore > 0 && <div className="knifehit-highscore"><Trophy size={14} /> High Score: {highScore}</div>}
            </div>
          </div>
        )}
        {gameState === 'PLAYING' && (
          <div className="knifehit-playarea fade-in-up">
            <div className="knifehit-score-bar">
              <div className="knifehit-score-value"><span className={showScore ? 'score-pop' : ''}>{score}</span></div>
              <div className="knifehit-level-badge">LEVEL {level}</div>
            </div>
            <div className={`knifehit-canvas-wrap ${shakeTarget ? 'target-shake' : ''}`}>
              <svg viewBox="-200 -200 400 400" className="knifehit-svg">
                <defs>
                  <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </radialGradient>
                  <filter id="targetShadow"><feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#F59E0B" floodOpacity="0.5" /></filter>
                  <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <circle cx="0" cy="0" r={LOG_RADIUS + 20} fill="url(#targetGlow)" />
                <circle cx="0" cy="0" r={LOG_RADIUS} fill="#1a0a00" stroke="#F59E0B" strokeWidth="3" filter="url(#targetShadow)" />
                <circle cx="0" cy="0" r={LOG_RADIUS * 0.75} fill="none" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="0" cy="0" r={LOG_RADIUS * 0.5} fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="0" cy="0" r={LOG_RADIUS * 0.25} fill="none" stroke="#FBBF24" strokeWidth="1" />
                <circle cx="0" cy="0" r="8" fill="#FBBF24" />
                <line x1={-LOG_RADIUS} y1="0" x2={LOG_RADIUS} y2="0" stroke="#D97706" strokeWidth="0.5" opacity="0.4" />
                <line x1="0" y1={-LOG_RADIUS} x2="0" y2={LOG_RADIUS} stroke="#D97706" strokeWidth="0.5" opacity="0.4" />
                {renderKnivesOnTarget()}
                {renderApplesOnTarget()}
                {throwingKnife && (() => {
                  // Hit point is at top of circle (angle -π/2 → SVG y=-80).
                  // Blade tip travels from y=-150 (above screen) → y=-80 (log edge).
                  // Knife handle trails below the blade tip by KNIFE_LENGTH.
                  const bladeTipY = -LOG_RADIUS + throwingKnife.y;        // -150 → -80
                  const handleY = bladeTipY + KNIFE_LENGTH;                //  -80 → -10
                  return (
                    <g>
                      <line x1="0" y1={bladeTipY} x2="0" y2={handleY} stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="0" cy={handleY} r="5" fill="#94A3B8" />
                    </g>
                  );
                })()}
              </svg>
            </div>
            <button className="knifehit-throw-btn" onClick={throwKnife} style={{ touchAction: 'manipulation' }}>THROW KNIFE</button>
            <div className="knifehit-knife-tray">
              {Array.from({ length: Math.max(3, requiredKnives - knivesForLevel) }).map((_, i) => (<div key={i} className="knife-tray-icon" />))}
            </div>
          </div>
        )}
        {gameState === 'GAMEOVER' && (
          <div className="knifehit-gameover fade-in-up">
            <div className="knifehit-gameover-card">
              <div className="knifehit-gameover-icon"><Skull size={56} /></div>
              <h2 className="knifehit-gameover-title">GAME OVER</h2>
              <p className="knifehit-gameover-sub">You hit another knife!</p>
              <div className="knifehit-go-stats">
                <div className="knifehit-go-stat"><span className="knifehit-go-stat-label">SCORE</span><span className="knifehit-go-stat-value">{score}</span></div>
                <div className="knifehit-go-stat"><span className="knifehit-go-stat-label">BEST</span><span className="knifehit-go-stat-value knifehit-go-best">{highScore}</span></div>
              </div>
              {score === highScore && score > 0 && <div className="knifehit-newbest"><Trophy size={16} /> NEW HIGH SCORE!</div>}
              <div className="knifehit-go-details">Reached Level {level} - {knives.length} knife{knives.length !== 1 ? 's' : ''} stuck</div>
              <button className="knifehit-btn knifehit-btn-primary" onClick={resetGame}><RotateCcw size={18} />PLAY AGAIN</button>
            </div>
          </div>
        )}
      </main>
      {screenFlash && <div className="knifehit-screen-flash" style={{ backgroundColor: screenFlash }} />}
    </div>
  );
}

function PlayIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>);
}