import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Lightbulb, CheckCircle, ChevronRight, GraduationCap } from 'lucide-react';
import { MOCK_PROFILES, QUESTION_BANK } from './Data';

export default function WordConnect() {
  const [gameState, setGameState] = useState('PROFILE_SELECT'); // PROFILE_SELECT, PLAYING, EXPLANATION, SUMMARY
  const [profile, setProfile] = useState(null);
  
  // Content Engine State
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [score, setScore] = useState(0);

  // Puzzle State
  const [circleLetters, setCircleLetters] = useState([]); // [{id, char, x, y}]
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState(null); // 'WRONG', 'CORRECT'

  const svgRef = useRef(null);

  // Dynamic Layout State for the circle tray
  const [circleConfig, setCircleConfig] = useState({ radius: 100, center: { x: 150, y: 150 } });

  // --- CONTENT ENGINE ---
  const loadProfile = (selectedProfile) => {
    setProfile(selectedProfile);
    const filtered = QUESTION_BANK.filter(q => q.stream === selectedProfile.stream);
    setQuestions(filtered);
    setCurrentQIdx(0);
    setScore(0);
    setGameState('PLAYING');
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

  const currentQ = questions[currentQIdx];
  const targetChars = currentQ ? currentQ.answer.toUpperCase().split('') : []; // Includes spaces
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
      setFeedback('CORRECT');
      setScore(prev => prev + 100);
      setTimeout(() => {
        setGameState('EXPLANATION');
      }, 1000);
    } else {
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

  if (gameState === 'PROFILE_SELECT') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <button onClick={() => window.location.href = '/'} className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-lg">
          <RotateCcw className="w-4 h-4" /> Back to Arena
        </button>
        
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12 flex flex-col items-center">
            <img src="/src/assets/Logos/concept_connect.png" alt="Concept Connect" className="h-28 object-contain mb-4 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform" />
            <p className="text-slate-400">Select a mock student profile. The engine will dynamically load curriculum-relevant questions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PROFILES.map(p => (
              <div key={p.studentId} onClick={() => loadProfile(p)} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:bg-slate-800 hover:border-blue-500/50 transition-all group flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{p.name}</h3>
                  <p className="text-sm text-slate-400">{p.stream} • {p.course} • Sem {p.semester}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'SUMMARY') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans text-center">
        <CheckCircle className="w-24 h-24 text-emerald-400 mb-6" />
        <h2 className="text-4xl font-black text-white mb-2">Topic Completed!</h2>
        <p className="text-xl text-slate-400 mb-8">You mastered {questions.length} concepts for {profile.stream}.</p>
        <div className="bg-slate-900 px-8 py-4 rounded-2xl mb-8 border border-slate-800">
          <span className="text-slate-500 uppercase font-bold text-sm">Final Score</span>
          <div className="text-4xl font-black text-blue-400">{score}</div>
        </div>
        <button onClick={() => setGameState('PROFILE_SELECT')} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
          SWITCH PROFILE
        </button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans select-none overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setGameState('PROFILE_SELECT')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
            <RotateCcw className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">{profile.stream} • {currentQ.subject}</div>
            <div className="text-sm text-slate-300 font-medium">{currentQ.topic}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase">Score</div>
            <div className="text-xl font-black text-white font-mono">{score}</div>
          </div>
          <button onClick={handleHint} className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30 transition">
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-3xl mx-auto w-full relative">
        
        {/* Progress */}
        <div className="w-full flex justify-center gap-2 mb-6">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 w-12 rounded-full ${i < currentQIdx ? 'bg-emerald-500' : i === currentQIdx ? 'bg-blue-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        {/* Question Panel */}
        <div className="bg-slate-900 border border-slate-700 w-full p-6 sm:p-8 rounded-3xl shadow-2xl mb-8 flex flex-col items-center text-center">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Question</div>
          <h2 className="text-xl sm:text-2xl text-white font-medium leading-relaxed">
            "{currentQ.question}"
          </h2>
        </div>

        {/* Answer Slots Grid */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {targetChars.map((char, i) => {
            if (char === ' ' || char === '-') {
              return <div key={i} className="w-8 h-12 flex items-center justify-center text-slate-600">-</div>;
            }
            // Logic to reveal letters if correct or if hinting
            const isRevealed = gameState === 'EXPLANATION' || feedback === 'CORRECT';
            return (
              <div key={i} className={`w-10 h-12 sm:w-12 sm:h-14 border-b-4 flex items-center justify-center text-2xl font-black font-mono transition-colors ${isRevealed ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-transparent'}`}>
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Formed Word Display (Live Feedback) */}
        <div className={`h-12 flex items-center justify-center px-6 rounded-full font-black text-xl tracking-widest transition-all mb-4 ${feedback === 'WRONG' ? 'bg-red-500/20 text-red-400 animate-[shake_0.5s_ease-in-out]' : feedback === 'CORRECT' ? 'bg-emerald-500/20 text-emerald-400' : selectedIds.length > 0 ? 'bg-blue-500/20 text-blue-400' : 'opacity-0'}`}>
          {currentWord || '...'}
        </div>

        {/* Circular Letter Tray */}
        <div 
          className="relative mt-auto mb-12 touch-none"
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
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in">
            <div className="bg-slate-900 border border-emerald-500/50 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-lg w-full animate-in zoom-in-95">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <div className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Concept Unlocked</div>
              <h2 className="text-3xl font-black text-white mb-6 tracking-wide">{currentQ.answer}</h2>
              <div className="w-12 h-1 bg-slate-800 mx-auto mb-6 rounded-full" />
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                {currentQ.explanation}
              </p>
              <button onClick={nextQuestion} className="w-full py-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                NEXT QUESTION <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
