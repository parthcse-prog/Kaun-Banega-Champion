import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from './Data';
import { saveGameAnalytics } from '../utils/analyticsStore';

export default function MathNinja() {
  const canvasRef = useRef(null);
  
  // UI State
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, RESULTS
  const [gameStartTime, setGameStartTime] = useState(null);

  const [allQuestions, setAllQuestions] = useState(QUESTIONS);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  useEffect(() => {
    const fetchQ = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/conceptninja/cs');
        if(res.ok) {
          const data = await res.json();
          if(data && data.length > 0) {
            setAllQuestions(data);
          }
        }
      } catch(e) {
        console.warn("Using local questions");
      }
    };
    fetchQ();
  }, []);

  // Update next round logic
  const handleNextRound = () => {
    if (currentQIndex + 1 < allQuestions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      startGame(allQuestions[nextIdx]);
    } else {
      // Done with all questions, go to menu or loop
      setGameState('MENU');
      setCurrentQIndex(0);
    }
  };

  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // Game State React mirror (for HUD)
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [missedConcepts, setMissedConcepts] = useState([]);
  
  // Mutable Engine State (refs to avoid re-renders during 60fps loop)
  const engine = useRef({
    objects: [],
    particles: [],
    trail: [],
    score: 0,
    combo: 0,
    lives: 3,
    gameOver: false,
    spawnTimer: 0,
    spawnInterval: 1200,
    lastTime: null,
    nextId: 1,
    missed: [],
    timeRemaining: 30,
    activeQuestion: null
  });

  const rand = (min, max) => min + Math.random() * (max - min);

  const startGame = (question) => {
    setCurrentQuestion(question);
    
    // Reset Engine State
    engine.current = {
      objects: [],
      particles: [],
      trail: [],
      score: 0,
      combo: 0,
      lives: 3,
      gameOver: false,
      spawnTimer: 0,
      spawnInterval: 1200,
      lastTime: null,
      nextId: 1,
      missed: [],
      timeRemaining: 30,
      activeQuestion: question
    };
    
    setScore(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(30);
    setMissedConcepts([]);
    setGameStartTime(Date.now());
    setGameState('PLAYING');
  };

  const endGame = () => {
    engine.current.gameOver = true;
    setScore(engine.current.score);
    setMissedConcepts([...engine.current.missed]);
    if (gameStartTime) {
      const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
      const isWin = engine.current.lives > 0; // Win if didn't lose all lives
      saveGameAnalytics('Concept Ninja', engine.current.score, timePlayed, isWin);
    }
    setGameState('RESULTS');
  };

    // --- PHYSICS ENGINE LOOP ---
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let W = canvas.clientWidth;
    let H = canvas.clientHeight;
    canvas.width = W;
    canvas.height = H;

    const handleResize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    const GRAVITY = 380;

    const FRUIT_COLORS = [
      '239, 68, 68', // Red
      '249, 115, 22', // Orange
      '234, 179, 8', // Yellow
      '34, 197, 94', // Green
      '168, 85, 247' // Purple
    ];

    const burst = (x, y, color) => {
      for(let i=0; i<14; i++){
        const ang = rand(0, Math.PI * 2);
        const spd = rand(60, 220);
        engine.current.particles.push({
          x, y, 
          vx: Math.cos(ang) * spd, 
          vy: Math.sin(ang) * spd,
          life: 1, color
        });
      }
    };

    const spawnObject = () => {
      const q = engine.current.activeQuestion;
      if (!q) return;

      const isCorrect = Math.random() < 0.55; 
      const pool = isCorrect ? q.correctConcepts : q.distractors;
      const text = pool[Math.floor(Math.random() * pool.length)];
      
      const margin = Math.min(100, W * 0.15);
      const x = rand(margin, Math.max(W - margin, margin));
      const baseVy = Math.sqrt(2 * GRAVITY * Math.max(H - 50, 200));
      const vy = -rand(baseVy * 0.95, baseVy * 1.15) - Math.min(engine.current.combo * 10, 150);
      const vx = rand(-100, 100);
      
      ctx.font = 'bold 16px "Arial", sans-serif';
      const textWidth = ctx.measureText(text).width;
      
      const color = FRUIT_COLORS[Math.floor(Math.random() * FRUIT_COLORS.length)];

      engine.current.objects.push({
        id: engine.current.nextId++,
        text,
        isCorrect,
        color, // Fruit color
        x, y: H + 30,
        vx, vy,
        r: Math.max(textWidth / 2 + 15, 35), // slightly bigger hitboxes for "fruits"
        rot: rand(-0.2, 0.2), 
        vrot: rand(-2, 2),
        sliced: false
      });
    };

    const dist2 = (px, py, qx, qy) => { const dx = px - qx, dy = py - qy; return dx * dx + dy * dy; };

    const pointSegDist = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return Math.sqrt(dist2(px, py, x1, y1));
      let t = ((px - x1) * dx + (py - y1) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      return Math.sqrt(dist2(px, py, cx, cy));
    };

    const trySliceAt = (x1, y1, x2, y2) => {
      if (engine.current.gameOver) return;
      for (const o of engine.current.objects) {
        if (o.sliced) continue;
        const d = pointSegDist(o.x, o.y, x1, y1, x2, y2);
        if (d <= o.r) {
          o.sliced = true;
          if (o.isCorrect) {
            engine.current.score += 10 + engine.current.combo * 2;
            engine.current.combo += 1;
            burst(o.x, o.y, o.color); // Splash in fruit color
          } else {
            engine.current.combo = 0;
            engine.current.lives -= 1;
            burst(o.x, o.y, o.color); // Splash in fruit color for wrong ones too
            engine.current.missed.push({ text: o.text, reason: 'Sliced a distractor' });
            if (engine.current.lives <= 0) {
              endGame();
            }
          }
          // Sync HUD states
          setScore(engine.current.score);
          setCombo(engine.current.combo);
          setLives(engine.current.lives);
        }
      }
    };

    // Pointer Input Handling
    let dragging = false;
    let lastPt = null;

    const pointerPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      
      return { 
        x: (cx - rect.left) * scaleX, 
        y: (cy - rect.top) * scaleY 
      };
    };

    const down = (e) => {
      e.preventDefault();
      dragging = true;
      lastPt = pointerPos(e);
      engine.current.trail.push({ ...lastPt, t: performance.now() });
    };
    const move = (e) => {
      if (!dragging || engine.current.gameOver) return;
      e.preventDefault();
      const p = pointerPos(e);
      if (lastPt) trySliceAt(lastPt.x, lastPt.y, p.x, p.y);
      engine.current.trail.push({ ...p, t: performance.now() });
      lastPt = p;
    };
    const up = () => { dragging = false; lastPt = null; };

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', down, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);

    let animId;
    const loop = (now) => {
      // Auto-resize logic in case of CSS changes
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        canvas.width = W;
        canvas.height = H;
      }

      if (engine.current.lastTime === null) engine.current.lastTime = now;
      const dt = Math.min(40, now - engine.current.lastTime) / 1000;
      engine.current.lastTime = now;

      if (!engine.current.gameOver) {
        // Timer
        engine.current.timeRemaining -= dt;
        setTimeLeft(Math.max(0, engine.current.timeRemaining));
        if (engine.current.timeRemaining <= 0) {
          endGame();
          return;
        }

        // Spawner
        engine.current.spawnTimer += dt * 1000;
        const interval = Math.max(500, engine.current.spawnInterval - engine.current.combo * 20);
        if (engine.current.spawnTimer > interval) {
          engine.current.spawnTimer = 0;
          spawnObject();
        }

        // Physics
        for (const o of engine.current.objects) {
          o.x += o.vx * dt;
          o.y += o.vy * dt;
          o.vy += GRAVITY * dt;
          o.rot += o.vrot * dt;
        }

        // Missed Correct Concepts (fell off bottom)
        for (const o of engine.current.objects) {
          if (!o.sliced && o.y > H + 40 && o.isCorrect && !o._missed) {
            o._missed = true;
            engine.current.combo = 0;
            engine.current.missed.push({ text: o.text, reason: 'Missed correct concept' });
            setCombo(0);
          }
        }

        // Cleanup
        engine.current.objects = engine.current.objects.filter(o => o.y < H + 60 && !o.sliced);

        for (const p of engine.current.particles) {
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt * 1.6;
        }
        engine.current.particles = engine.current.particles.filter(p => p.life > 0);
      }

      // --- RENDERING (FRUIT NINJA AESTHETIC) ---
      // Wood background
      ctx.fillStyle = '#3a2311'; // Darker wood brown
      ctx.fillRect(0, 0, W, H);

      // Subtle wood texture stripes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let i = 0; i < W; i += 60) {
        ctx.fillRect(i, 0, 30, H);
      }

      // Draw Objects (Fruits)
      for (const o of engine.current.objects) {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate(o.rot);
        
        ctx.shadowBlur = 0;
        
        // Draw "Fruit" (Same for both correct and distractor so it's not obvious)
        ctx.fillStyle = `rgb(${o.color})`;
        ctx.beginPath();
        ctx.arc(0, 0, o.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner shine/highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(-o.r * 0.3, -o.r * 0.3, o.r * 0.4, o.r * 0.2, -Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        
        ctx.font = 'bold 16px "Arial", sans-serif';
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle';
        
        // Wrap text if too long (basic handling by making it slightly smaller if needed)
        ctx.fillText(o.text, 0, 0);
        ctx.restore();
      }

      // Draw Particles
      for (const p of engine.current.particles) {
        ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.life)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.random() * 4 + 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Trail (Slash)
      engine.current.trail = engine.current.trail.filter(p => now - p.t < 180); // Quicker fade
      if (engine.current.trail.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 1; i < engine.current.trail.length; i++) {
          const a = engine.current.trail[i - 1], b = engine.current.trail[i];
          const age = (now - b.t) / 180;
          
          // Outer glow (silver/light blue)
          ctx.strokeStyle = `rgba(186, 230, 253, ${1 - age})`;
          ctx.lineWidth = 12 * (1 - age) + 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // Inner sharp white core
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - age})`;
          ctx.lineWidth = 4 * (1 - age) + 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', down);
      canvas.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      canvas.removeEventListener('touchstart', down);
      canvas.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-neonPink selection:text-white relative" style={{ backgroundColor: '#03050c', backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(0, 242, 254, 0.08) 0%, transparent 60%), radial-gradient(circle at 85% 85%, rgba(244, 63, 94, 0.06) 0%, transparent 50%), linear-gradient(rgba(0, 242, 254, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.03) 1px, transparent 1px)', backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px' }}>
      
      {/* Header */}
      <header className="relative z-20 border-b border-cyan-900/40 bg-[#050813]/90 backdrop-blur-md px-4 py-2.5">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => window.location.href = '/'} className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d152a] border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-[0_0_25px_-5px_rgba(0,242,254,0.4)] overflow-hidden">
              <img src="/src/assets/Logos/MIET Games.png" alt="MIET" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f59b] rounded-full ring-2 ring-[#060913] animate-pulse z-10"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-xl tracking-wider text-white">MIET</span>
                <span className="px-2 py-0.5 text-sm font-mono tracking-wider font-semibold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">GAMES ARENA</span>
              </div>
              <p className="text-[10px] font-mono text-cyan-400 tracking-wider">CONCEPT NINJA <span className="text-rose-400"></span></p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1680px] mx-auto w-full px-4 py-3 flex flex-col gap-3 relative z-10">
        
        {/* MENU STATE */}
        {gameState === 'MENU' && (
          <div className="w-full max-w-2xl bg-[#0d152a]/90 border border-cyan-500/30 p-8 rounded-2xl flex flex-col items-center mx-auto mt-12 shadow-[0_0_20px_rgba(0,242,254,0.15)] animate-in slide-in-from-bottom-8">
             <img src="/src/assets/Logos/concept_ninja.png" alt="Concept Ninja" className="h-32 object-contain mb-6 drop-shadow-[0_0_30px_rgba(0,242,254,0.4)]" />
             <h2 className="text-3xl font-display font-black text-white mb-2 text-center tracking-wide">SELECT CHALLENGE</h2>
             <p className="text-cyan-300 font-mono text-xs text-center mb-8 max-w-md">Read the question. Slice the correct concepts. Avoid the wrong ones. Build your combo.</p>
             
             <div className="w-full space-y-4">
               {allQuestions.map((q, i) => (
                 <button 
                   key={q.id}
                   onClick={() => { setCurrentQIndex(i); startGame(q); }}
                   className="w-full text-left bg-slate-900/60 hover:bg-cyan-950/40 border border-cyan-900/50 hover:border-cyan-400/60 p-4 rounded-xl transition group flex items-center justify-between"
                 >
                   <div>
                     <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1 font-mono">{q.branch} • {q.topic}</div>
                     <div className="text-lg font-bold text-white font-tech">{q.questionText}</div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 border border-cyan-500/30 transition shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                     <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </div>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'PLAYING' && (
          <>
            <section className="w-full bg-gradient-to-r from-[#070d1e] via-[#0c142b] to-[#070d1e] border border-cyan-500/30 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(0,242,254,0.15)] relative overflow-hidden">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-12 bg-cyan-500/20 blur-xl pointer-events-none"></div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-6 flex flex-col space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded bg-cyan-950/90 text-cyan-400 border border-cyan-500/50">
                      CURRENT OBJECTIVE
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-rose-950/90 text-rose-400 border border-rose-500/50 animate-pulse">
                      ⚡ LIVE ROUND
                    </span>
                  </div>
                  <h1 className="text-xl lg:text-2xl font-display font-extrabold text-white tracking-wide drop-shadow-md">
                    {currentQuestion?.questionText}
                  </h1>
                </div>
                
                <div className="lg:col-span-6 flex items-center justify-between lg:justify-end space-x-3 sm:space-x-5">
                  <div className="text-center px-3 py-1.5 rounded-xl bg-[#0d152a]/90 border border-cyan-800/50 min-w-[90px]">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">SCORE</span>
                    <span className="text-2xl font-display font-black text-[#00f2fe] drop-shadow-[0_0_10px_rgba(0,242,254,0.8)]">{score}</span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-xl bg-[#0d152a]/90 border border-amber-600/50 min-w-[105px] relative">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block">COMBO</span>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-2xl font-display font-black text-amber-300">{combo}x</span>
                      {combo > 3 && <span className="text-xs text-orange-400 animate-bounce">⚡</span>}
                    </div>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-xl bg-[#0d152a]/90 border border-cyan-500/40 min-w-[85px] relative">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">TIME</span>
                    <div className="flex items-center justify-center space-x-1">
                      <span className={`text-2xl font-display font-black ${timeLeft < 10 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>{Math.ceil(timeLeft)}s</span>
                    </div>
                  </div>
                  <div className="text-center px-3.5 py-1.5 rounded-xl bg-[#0d152a]/90 border border-rose-800/50 min-w-[110px]">
                    <span className="text-[10px] font-mono uppercase text-rose-400 block">LIVES ({lives}/3)</span>
                    <div className="flex items-center justify-center space-x-1.5 mt-1 text-lg">
                      {Array(3).fill(0).map((_, i) => (
                        <span key={i} className={i < lives ? "text-[#f43f5e] drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" : "text-slate-600 filter grayscale opacity-60"}>
                          {i < lives ? '❤️' : '💔'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="w-full flex-1 min-h-[50vh] md:aspect-[21/9] md:min-h-0 md:max-h-[450px] mt-4 flex flex-col relative rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#070e24] via-[#050917] to-[#040711] shadow-[0_0_40px_rgba(0,242,254,0.15)] overflow-hidden cursor-crosshair">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-10"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-10"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-10"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-10"></div>
              
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full block z-0"
                style={{ cursor: 'crosshair', objectFit: 'cover' }}
              />
            </section>
          </>
        )}

        {/* RESULTS STATE */}
        {gameState === 'RESULTS' && (
          <div className="w-full max-w-2xl bg-[#0d152a]/90 border border-cyan-500/30 p-8 rounded-2xl flex flex-col items-center mx-auto mt-12 shadow-[0_0_20px_rgba(0,242,254,0.15)] animate-in slide-in-from-bottom-8">
             <h2 className="text-3xl font-display font-black text-white mb-2 tracking-widest text-center">ROUND COMPLETE</h2>
             <div className="text-6xl font-display font-black text-[#00f2fe] drop-shadow-[0_0_15px_rgba(0,242,254,0.8)] mb-8">{score}</div>
             
             {missedConcepts.length > 0 ? (
               <div className="w-full bg-[#050813] border border-slate-700 rounded-xl p-6 mb-8">
                 <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                   EVENT LOG: MISTAKES
                 </h3>
                 <div className="space-y-3 font-mono text-xs">
                   {Array.from(new Set(missedConcepts.map(m => m.text))).map(text => {
                     const isWrongSlice = currentQuestion.distractors.includes(text);
                     return (
                       <div key={text} className="bg-slate-900/60 p-3 rounded-lg border-l-2 border-rose-500 flex items-center gap-3">
                         <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isWrongSlice ? 'bg-rose-950/80 text-rose-400 border border-rose-500/50' : 'bg-amber-950/80 text-amber-400 border border-amber-500/50'}`}>
                           {isWrongSlice ? 'TRAP TRIGGERED' : 'TARGET MISSED'}
                         </span>
                         <span className="font-bold text-slate-200">{text}</span>
                       </div>
                     );
                   })}
                 </div>
               </div>
             ) : (
               <div className="w-full bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-6 mb-8 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                 <svg className="w-12 h-12 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <div className="text-emerald-400 font-bold font-display text-lg tracking-wider">FLAWLESS EXECUTION</div>
                 <div className="text-emerald-500/70 text-xs font-mono">100% ACCURACY RATING</div>
               </div>
             )}
             
             <button 
               onClick={() => setGameState('MENU')}
               className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all hover:scale-[1.02]"
             >
               CONTINUE
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
