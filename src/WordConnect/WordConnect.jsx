import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Lightbulb, CheckCircle, ChevronRight, GraduationCap } from 'lucide-react';
import { MOCK_PROFILES, QUESTION_BANK } from './Data';
import { saveGameAnalytics } from '../utils/analyticsStore';
import { audio } from '../utils/audioManager';

export default function WordConnect() {
  const cseProfile = MOCK_PROFILES.find(p => p.stream === 'CSE') || MOCK_PROFILES[0];
  const cseQuestions = QUESTION_BANK.filter(q => q.stream === 'CSE');
  
  const [gameState, setGameState] = useState('PLAYING');
  const [profile, setProfile] = useState(cseProfile);
  
  // Content Engine State
  const [questions, setQuestions] = useState(cseQuestions);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [score, setScore] = useState(0);

  // Puzzle State
  const [circleLetters, setCircleLetters] = useState([]); // [{id, char, x, y}]
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState(null); // 'WRONG', 'CORRECT'
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  useEffect(() => {
    if (gameState === 'SUMMARY') {
      const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
      saveGameAnalytics('Word Connect', score, timePlayed, true);
    }
  }, [gameState]);

  const svgRef = useRef(null);

  // Dynamic Layout State for the circle tray
  const [circleConfig, setCircleConfig] = useState({ radius: 100, center: { x: 150, y: 150 } });

  // --- CONTENT ENGINE ---
  useEffect(() => {
    // Fetch CSE questions from MongoDB
    fetch('http://localhost:5000/api/wordconnect/cs')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // If we are currently on CSE profile, update the active questions
          if (profile.stream === 'CSE') {
            setQuestions(data);
            initPuzzle(data[currentQIdx].answer);
          }
        }
      })
      .catch(err => console.error("Failed to fetch Word Connect questions, using local fallback", err));
  }, []);

  const loadProfile = (selectedProfile) => {
    setProfile(selectedProfile);
    const filtered = QUESTION_BANK.filter(q => q.stream === selectedProfile.stream);
    setQuestions(filtered);
    setCurrentQIdx(0);
    setScore(0);
    setGameState('PLAYING');
    setGameStartTime(Date.now());
    initPuzzle(filtered[0].answer);
  };

  const nextQuestion = () => {
    if (currentQIdx + 1 < questions.length) {
      setCurrentQIdx(prev => prev + 1);
      initPuzzle(questions[currentQIdx + 1].answer);
      setGameState('PLAYING');
      setFeedback(null);
    } else {
      setGameState('SUMMARY');
    }
  };

  // --- WORD CONNECT ENGINE ---
  const initPuzzle = (answer) => {
    const rawChars = answer.replace(/[^A-Z]/gi, '').toUpperCase().split('');
    // Shuffle
    rawChars.sort(() => Math.random() - 0.5);
    
    // Position in circle
    const numLetters = rawChars.length;
    const angleStep = (Math.PI * 2) / numLetters;
    
    // Dynamic radius to prevent overlap on long words like POLYMORPHISM
    const dynamicRadius = Math.max(100, numLetters * 15);
    const dynamicCenter = { x: dynamicRadius + 50, y: dynamicRadius + 50 };
    
    const positioned = rawChars.map((char, i) => {
      const angle = i * angleStep - (Math.PI / 2); // Start at top
      return {
        id: `L_${i}`,
        char,
        x: dynamicCenter.x + dynamicRadius * Math.cos(angle),
        y: dynamicCenter.y + dynamicRadius * Math.sin(angle)
      };
    });
    
    setCircleConfig({ radius: dynamicRadius, center: dynamicCenter });
    setCircleLetters(positioned);
    setSelectedIds([]);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/wordconnect/cs');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setQuestions(data);
            initPuzzle(data[0].answer);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch from MongoDB backend, falling back to local data:", err);
      }
      
      // Fallback
      // Local shuffle to ensure different order
      const shuffled = [...cseQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      if (shuffled.length > 0) {
        initPuzzle(shuffled[0].answer);
      }
    };
    
    fetchQuestions();
  }, []);

  const currentQ = questions[currentQIdx];
  const targetChars = currentQ ? currentQ?.answer.toUpperCase().split('') : []; // Includes spaces
  const currentWord = selectedIds.map(id => circleLetters.find(l => l.id === id).char).join('');
  const targetClean = currentQ ? currentQ.answer.replace(/[^A-Z]/gi, '').toUpperCase() : '';

  // --- INTERACTION LOGIC ---
  const handlePointerDown = (id, e) => {
    if (feedback) return;
    setIsDragging(true);
    setSelectedIds([id]);
    updateMousePos(e);
    e.target.setPointerCapture(e.pointerId); // Keep tracking even if cursor leaves element
  };

  const handlePointerEnter = (id) => {
    if (isDragging && !selectedIds.includes(id)) {
      audio.playSFX('click');
      setSelectedIds(prev => [...prev, id]);
    } else if (isDragging && selectedIds.length > 1 && selectedIds[selectedIds.length - 2] === id) {
      // Backtrack
      setSelectedIds(prev => prev.slice(0, -1));
    }
  };

  const updateMousePos = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      updateMousePos(e);
      // Fallback intersection checking for touch devices where pointerEnter might fail
      if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
         const elements = document.elementsFromPoint(e.clientX, e.clientY);
         const letterEl = elements.find(el => el.hasAttribute('data-letter-id'));
         if (letterEl) {
           const id = letterEl.getAttribute('data-letter-id');
           handlePointerEnter(id);
         }
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    validateWord(currentWord);
  };

  const validateWord = (word) => {
    if (word === targetClean) {
      audio.playSFX('success');
      setFeedback('CORRECT');
      setScore(prev => prev + 100);
      setTimeout(() => {
        setGameState('EXPLANATION');
      }, 1000);
    } else {
      audio.playSFX('wrong');
      setFeedback('WRONG');
      setTimeout(() => {
        setFeedback(null);
        setSelectedIds([]);
      }, 500);
    }
  };

  const handleHint = () => {
    if (feedback || selectedIds.length > 0) return;
    setScore(prev => Math.max(0, prev - 20));
    // Find the first letter of the target and select it
    const firstChar = targetClean[0];
    const letterObj = circleLetters.find(l => l.char === firstChar);
    if (letterObj) {
      setSelectedIds([letterObj.id]);
    }
  };

  // --- RENDERERS ---

  if (gameState === 'SUMMARY') {
    return (
      <div className="min-h-screen bg-[#050812] text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_60%)] z-0 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-[#0a1513] via-[#09221d] to-[#040a08] border border-emerald-500/20 p-10 md:p-16 rounded-[2rem] shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-110 opacity-50 pointer-events-none"></div>
          
          <div className="h-24 w-24 rounded-full bg-emerald-500/20 border-4 border-emerald-400/50 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
            <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-500 mb-4 tracking-tight drop-shadow-lg">TOPIC MASTERED!</h2>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-md leading-relaxed">You successfully conquered {questions.length} concepts for {profile?.stream}.</p>
          
          <div className="flex flex-col items-center bg-emerald-950/40 border border-emerald-900 px-12 py-6 rounded-3xl mb-10 shadow-inner">
            <span className="text-emerald-500/70 uppercase font-black text-xs tracking-widest mb-2">Final Score</span>
            <div className="text-6xl md:text-7xl font-black text-emerald-400 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">{score}</div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-sm relative z-10">
            <button onClick={() => {
              import('../utils/shareUtils').then(({ shareResult }) => {
                shareResult('Word Connect', score, { level: profile?.stream || 'Completed' });
              });
            }} className="w-full md:w-1/2 py-4 rounded-xl bg-[#091512] border border-emerald-500/30 text-emerald-400 font-bold font-mono text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              Share
            </button>
            <button onClick={() => window.location.href = '/'} className="w-full md:w-1/2 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all">
              ARENA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col font-sans select-none overflow-x-hidden touch-none text-slate-200"
      style={{
        backgroundColor: '#050811',
        backgroundImage: 'radial-gradient(circle at 50% 18%, rgba(0, 150, 255, 0.12) 0%, transparent 60%), radial-gradient(circle at 85% 85%, rgba(255, 0, 122, 0.08) 0%, transparent 45%), radial-gradient(circle at 15% 75%, rgba(0, 240, 255, 0.08) 0%, transparent 50%), linear-gradient(to bottom, #050811 0%, #070d1d 50%, #050812 100%)',
        backgroundAttachment: 'fixed'
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <style>{`
        .cyber-grid { background-size: 32px 32px; background-image: radial-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px); }
        .slot-tile { background: linear-gradient(180deg, #131c31 0%, #0a1122 100%); border: 1.5px solid #233559; box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.08), inset 0 -3px 5px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0,0,0,0.5); }
        .slot-tile.filled { background: linear-gradient(180deg, #103254 0%, #07192f 100%); border-color: #00f0ff; box-shadow: 0 0 15px rgba(0, 240, 255, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.3), inset 0 -3px 6px rgba(0, 140, 255, 0.5); }
        .tech-bracket { position: absolute; width: 12px; height: 12px; border-color: #00f0ff; border-style: solid; }
        .tech-bracket-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .tech-bracket-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        .tech-bracket-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        .tech-bracket-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
      `}</style>
      
      <div className="absolute inset-0 pointer-events-none cyber-grid z-0"></div>

      {/* Header */}
      <header className="w-full border-b border-blue-900/60 bg-[#070d1a]/85 backdrop-blur-md px-4 sm:px-8 py-2.5 z-40 sticky top-0 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/'} className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1c2842] to-[#0e1628] border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 shadow-md transition active:scale-95">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-display font-bold text-[11px] tracking-wider text-cyan-400 uppercase">{profile.stream} • {currentQ?.subject}</span>
              </div>
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">{currentQ?.topic}</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_25px_-4px_rgba(255,183,3,0.5)]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1c1.98-.44 3.51-2.02 3.61-4.06C19.08 11.63 21 9.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"></path></svg>
            </div>
            <div className="text-center">
              <h1 className="font-display text-lg tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-yellow-400 drop-shadow-[0_2px_10px_rgba(255,183,3,0.4)]">
                CYBER LEXICON
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">WORD WHEEL ARCADE EDITION</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#09101f] border border-cyan-500/30 px-3.5 py-1 rounded-xl shadow-inner">
              <div className="text-right leading-none">
                <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400 block">BANKED SCORE</span>
                <span className="font-mono font-extrabold text-cyan-300 text-sm tracking-tight">{score}</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-xs font-mono font-bold">
                ⚡
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-2 sm:px-4 py-2 flex-1 flex flex-col gap-2 relative z-10 items-center">
        
        {/* Round Status Bar */}
        <section className="flex flex-wrap items-center justify-between gap-2 bg-[#080d1a]/70 border border-slate-800 rounded-xl px-4 py-1.5 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] w-full">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold text-[10px] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
              ROUND {(currentQIdx + 1).toString().padStart(2, '0')} / {questions.length.toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className={`w-4 sm:w-6 h-1.5 rounded-full ${i < currentQIdx ? 'bg-cyan-400 shadow-[0_0_10px_#00f0ff]' : i === currentQIdx ? 'bg-cyan-400 animate-pulse ring-1 ring-cyan-400/50' : 'bg-slate-700/80'}`} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={handleHint} className="bg-gradient-to-r from-[#171928] to-[#121424] hover:from-[#20243d] border border-amber-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5 transition active:scale-95 shadow-sm group">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
              <span className="font-bold text-[10px] tracking-wider text-white">USE HINT</span>
            </button>
          </div>
        </section>

        {/* Question Podium */}
        <section className="relative bg-gradient-to-b from-[#0e172e]/90 to-[#070d1d]/95 border border-cyan-500/40 rounded-xl p-3 sm:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl w-full">
          <div className="tech-bracket tech-bracket-tl"></div>
          <div className="tech-bracket tech-bracket-tr"></div>
          <div className="tech-bracket tech-bracket-bl"></div>
          <div className="tech-bracket tech-bracket-br"></div>
          
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">QUERY</span>
            </div>
          </div>
          
          <h2 className="text-center text-base sm:text-lg font-extrabold text-white tracking-wide max-w-3xl mx-auto leading-snug drop-shadow-md py-0.5">
            "{currentQ?.question}"
          </h2>
          
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <div className="text-center mb-1.5">
              <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-400/80">SPELL ASSEMBLY MATRIX</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              {targetChars.map((char, i) => {
                if (char === ' ' || char === '-') {
                  return <div key={i} className="w-6 h-8 flex items-center justify-center text-slate-600">-</div>;
                }
                const isRevealed = gameState === 'EXPLANATION' || feedback === 'CORRECT';
                return (
                  <div key={i} className={`slot-tile w-8 h-10 sm:w-10 sm:h-12 rounded-lg flex flex-col items-center justify-center ${isRevealed ? 'filled' : ''}`}>
                    {isRevealed ? (
                      <span className="font-display font-black text-lg sm:text-xl text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]">{char}</span>
                    ) : (
                      <span className="font-display font-black text-lg sm:text-xl text-slate-600">_</span>
                    )}
                    <span className="text-[7px] font-mono text-cyan-400/60 leading-none">{(i + 1).toString().padStart(2, '0')}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Live Feedback Line */}
            <div className={`mt-2 mx-auto max-w-xs h-6 flex items-center justify-center rounded-md font-bold text-xs tracking-widest transition-all ${feedback === 'WRONG' ? 'bg-red-500/20 text-red-400 animate-[shake_0.5s_ease-in-out] border border-red-500/50' : feedback === 'CORRECT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : selectedIds.length > 0 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'opacity-0'}`}>
              {currentWord || '...'}
            </div>
          </div>
        </section>

        {/* Circular Letter Tray */}
        <div 
          className="relative mt-auto mb-2 touch-none"
          style={{ width: circleConfig.radius * 2 + 100, height: circleConfig.radius * 2 + 100 }}
        >
          {/* Connecting Lines SVG */}
          <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Draw lines between selected nodes */}
            {selectedIds.length > 1 && selectedIds.map((id, i) => {
              if (i === 0) return null;
              const prev = circleLetters.find(l => l.id === selectedIds[i-1]);
              const curr = circleLetters.find(l => l.id === id);
              return <line key={`line-${i}`} x1={prev.x} y1={prev.y} x2={curr.x} y2={curr.y} stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" opacity="0.6" />;
            })}
            {/* Draw line from last node to mouse pointer */}
            {isDragging && selectedIds.length > 0 && (
              <line 
                x1={circleLetters.find(l => l.id === selectedIds[selectedIds.length - 1]).x} 
                y1={circleLetters.find(l => l.id === selectedIds[selectedIds.length - 1]).y} 
                x2={mousePos.x} 
                y2={mousePos.y} 
                stroke="#3b82f6" 
                strokeWidth="12" 
                strokeLinecap="round" 
                opacity="0.4" 
              />
            )}
          </svg>

          {/* Letter Nodes */}
          {circleLetters.map((l) => {
            const isSelected = selectedIds.includes(l.id);
            return (
              <div
                key={l.id}
                data-letter-id={l.id}
                className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center text-2xl font-black transition-all cursor-pointer z-10 border-2 select-none touch-none
                  ${isSelected ? 'bg-blue-500 text-white border-blue-400 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}`}
                style={{ left: l.x, top: l.y }}
                onPointerDown={(e) => handlePointerDown(l.id, e)}
                onPointerEnter={() => handlePointerEnter(l.id)}
              >
                {l.char}
              </div>
            );
          })}
        </div>

        {/* Explanation Overlay */}
        {gameState === 'EXPLANATION' && (
          <div className="absolute inset-0 z-50 bg-[#050811]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in">
            <div className="bg-gradient-to-b from-[#0a1815] to-[#040a08] border border-emerald-500/40 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] max-w-lg w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_20px_-5px_#10b981]">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></span>
                Concept Unlocked
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white mb-4 tracking-wider drop-shadow-md">{currentQ.answer}</h2>
              <div className="w-12 h-1 border-b border-emerald-500/30 border-dashed mx-auto mb-6" />
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                {currentQ?.explanation}
              </p>
              
              <button onClick={nextQuestion} className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-tech font-bold text-lg hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 active:scale-95">
                NEXT QUERY <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
