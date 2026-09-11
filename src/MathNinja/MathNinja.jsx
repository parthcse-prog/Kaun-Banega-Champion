import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from './Data';

export default function MathNinja() {
  const canvasRef = useRef(null);
  
  // UI State
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, RESULTS
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
    setGameState('PLAYING');
  };

  const endGame = () => {
    engine.current.gameOver = true;
    setScore(engine.current.score);
    setMissedConcepts([...engine.current.missed]);
    setGameState('RESULTS');
  };

  // --- PHYSICS ENGINE LOOP ---
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const GRAVITY = 620;

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
      
      const x = rand(100, W - 100);
      // Give objects a stronger initial upward velocity so they reach the top half of the screen
      const vy = -rand(750, 950) - Math.min(engine.current.combo * 12, 200);
      const vx = rand(-100, 100);
      
      ctx.font = '700 16px sans-serif';
      const textWidth = ctx.measureText(text).width;
      
      engine.current.objects.push({
        id: engine.current.nextId++,
        text,
        isCorrect,
        x, y: H + 30,
        vx, vy,
        r: Math.max(textWidth / 2 + 10, 30), // Hitbox radius based on text
        rot: rand(-0.2, 0.2), // Slight rotation
        vrot: rand(-1, 1),
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
            burst(o.x, o.y, '94, 242, 160'); // Green
          } else {
            engine.current.combo = 0;
            engine.current.lives -= 1;
            burst(o.x, o.y, '255, 94, 108'); // Red
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
      // Calculate scaling factors between internal canvas size and actual CSS size
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

      // --- RENDERING ---
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Draw Objects
      for (const o of engine.current.objects) {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate(o.rot);
        
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        // Draw pill
        const w = o.r * 2;
        const h = 40;
        ctx.roundRect(-w/2, -h/2, w, h, 20);
        ctx.fill(); ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 14px sans-serif';
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle';
        ctx.fillText(o.text, 0, 1);
        ctx.restore();
      }

      // Draw Particles
      for (const p of engine.current.particles) {
        ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.life)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Trail
      engine.current.trail = engine.current.trail.filter(p => now - p.t < 220);
      if (engine.current.trail.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        for (let i = 1; i < engine.current.trail.length; i++) {
          const a = engine.current.trail[i - 1], b = engine.current.trail[i];
          const age = (now - b.t) / 220;
          ctx.strokeStyle = `rgba(94,225,255,${1 - age})`;
          ctx.lineWidth = 8 * (1 - age) + 2;
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
    };
  }, [gameState]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 flex flex-col font-sans select-none touch-none">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = '/'} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-white tracking-tight">MATH NINJA</h1>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slice. Think. Master.</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 lg:p-8 relative">
        
        {/* MENU STATE */}
        {gameState === 'MENU' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center mt-12 animate-in slide-in-from-bottom-8">
             <img src="/src/assets/Logos/Math_ninja.png" alt="Math Ninja" className="h-32 object-contain mb-6 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
             <h2 className="text-3xl font-black text-white mb-2 text-center">SELECT CHALLENGE</h2>
             <p className="text-slate-400 text-center mb-8 max-w-md">Read the question. Slice the correct concepts. Avoid the wrong ones. Build your combo.</p>
             
             <div className="w-full space-y-4">
               {QUESTIONS.map(q => (
                 <button 
                   key={q.id}
                   onClick={() => startGame(q)}
                   className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl transition group flex items-center justify-between"
                 >
                   <div>
                     <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{q.branch} • {q.topic}</div>
                     <div className="text-lg font-bold text-white">{q.questionText}</div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 transition">
                     <svg className="w-5 h-5 text-blue-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </div>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            
            {/* Top HUD */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between mb-6 shadow-xl gap-4">
               
               {/* Question */}
               <div className="flex-1 text-center md:text-left order-2 md:order-1">
                 <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">CURRENT OBJECTIVE</div>
                 <div className="text-xl md:text-2xl font-black text-white">{currentQuestion?.questionText}</div>
               </div>

               {/* Stats */}
               <div className="flex items-center gap-6 md:gap-8 order-1 md:order-2 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase">SCORE</div>
                    <div className="text-2xl font-black text-blue-400 font-mono">{score}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase">COMBO</div>
                    <div className={`text-2xl font-black font-mono transition-colors ${combo > 3 ? 'text-amber-400' : 'text-white'}`}>x{combo}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase">TIME</div>
                    <div className={`text-2xl font-black font-mono ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{Math.ceil(timeLeft)}s</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase">LIVES</div>
                    <div className="text-xl tracking-widest text-red-500 font-sans">
                      {'❤️'.repeat(lives)}
                    </div>
                  </div>
               </div>
            </div>

            {/* Game Canvas */}
            <div className="w-full aspect-[16/9] max-h-[500px] relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-crosshair">
              <canvas 
                ref={canvasRef} 
                width={1000} 
                height={562} 
                className="w-full h-full block"
              />
            </div>
            
            <p className="text-slate-500 font-bold text-sm mt-6">Swipe or drag across the correct concepts. Avoid the distractors.</p>
          </div>
        )}

        {/* RESULTS STATE */}
        {gameState === 'RESULTS' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center mt-12 animate-in slide-in-from-bottom-8">
             <h2 className="text-4xl font-black text-white mb-2">ROUND COMPLETE</h2>
             <div className="text-6xl font-black text-blue-500 font-mono mb-8">{score}</div>
             
             {missedConcepts.length > 0 ? (
               <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8">
                 <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                   NEEDS PRACTICE
                 </h3>
                 <div className="space-y-4">
                   {/* Remove duplicates for clean learning view */}
                   {Array.from(new Set(missedConcepts.map(m => m.text))).map(text => {
                     const isWrongSlice = currentQuestion.distractors.includes(text);
                     const explanation = currentQuestion.explanations[text];
                     
                     return (
                       <div key={text} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                         <div className="flex items-center gap-2 mb-2">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isWrongSlice ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'} border`}>
                             {isWrongSlice ? 'SLICED WRONG CONCEPT' : 'MISSED CORRECT CONCEPT'}
                           </span>
                           <span className="font-bold text-white">{text}</span>
                         </div>
                         {explanation && <div className="text-sm text-slate-400">{explanation}</div>}
                       </div>
                     );
                   })}
                 </div>
               </div>
             ) : (
               <div className="w-full bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center text-center">
                 <svg className="w-12 h-12 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <div className="text-emerald-400 font-bold text-lg">FLAWLESS ROUND</div>
                 <div className="text-emerald-500/70 text-sm">You identified all concepts perfectly.</div>
               </div>
             )}
             
             <button 
               onClick={() => setGameState('MENU')}
               className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02]"
             >
               CONTINUE
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
