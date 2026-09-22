import React, { useState, useEffect, useRef } from 'react';
import { Storage } from './Storage';
import { FALLBACK_BINGO_QUESTIONS } from './Data';
import { saveGameAnalytics } from '../utils/analyticsStore';
import { audio } from '../utils/audioManager';

export default function AlgoBingo({ token }) {
  const contentSetId = "cs-algo-bingo";
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, WON, LOST
  const [session, setSession] = useState(null);
  const [contentSet, setContentSet] = useState(null);
  const [gridConfig, setGridConfig] = useState(null); // { rows: [], cols: [] }
  const [feedback, setFeedback] = useState(null); 
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    setContentSet(Storage.getContentSet(contentSetId));
  }, []);

  const [allQuestions, setAllQuestions] = useState(FALLBACK_BINGO_QUESTIONS);
  
  useEffect(() => {
    const fetchQ = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/algobingo/cs');
        if (res.ok) {
          const data = await res.json();
          setAllQuestions(data);
        }
      } catch (err) {
        console.warn("Could not fetch from backend");
        setAllQuestions(FALLBACK_BINGO_QUESTIONS);
      }
    };
    fetchQ();
  }, []);


  // Timer Effect
  useEffect(() => {
    let timer;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0) {
      setGameState('LOST');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'WON' || gameState === 'LOST') {
      if (gameState === 'WON') {
        audio.playBGM('https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde9cb.mp3?filename=level-win-6416.mp3');
      } else {
        audio.playBGM('https://cdn.pixabay.com/download/audio/2021/08/04/audio_c269165b4c.mp3?filename=game-over-arcade-6435.mp3');
      }
      const timePlayed = 180 - timeLeft;
      saveGameAnalytics('Bingo Bonanza', session?.score || 0, timePlayed, gameState === 'WON');
    }
  }, [gameState]);

  const generateValidGrid = (categories, items) => {
    for (let attempt = 0; attempt < 50000; attempt++) {
      const shuffledCats = [...categories].sort(() => 0.5 - Math.random());
      const rowCats = shuffledCats.slice(0, 3);
      const colCats = shuffledCats.slice(3, 6);
      
      let usedItems = new Set();
      let assignment = [];
      
      const solve = (cellIndex) => {
        if (cellIndex === 9) return true;
        const r = Math.floor(cellIndex / 3);
        const c = cellIndex % 3;
        const rId = rowCats[r].id;
        const cId = colCats[c].id;
        
        const validItems = items.filter(i => 
          i.validCategoryIds.includes(rId) && 
          i.validCategoryIds.includes(cId) &&
          !usedItems.has(i.name)
        );
        
        for (const item of validItems) {
          usedItems.add(item.name);
          assignment.push(item);
          if (solve(cellIndex + 1)) return true;
          usedItems.delete(item.name);
          assignment.pop();
        }
        return false;
      };
      
      if (solve(0)) {
        const unusedItems = items.filter(i => !assignment.some(a => a.name === i.name));
        const distractors = unusedItems.sort(() => 0.5 - Math.random()).slice(0, 2);
        const bankItems = [...assignment, ...distractors].sort(() => 0.5 - Math.random());
        return { rows: rowCats, cols: colCats, bankItems };
      }
    }
    
    // Mathematically guaranteed fallback if no solution found after 50000 attempts
    const fallbackRows = categories.filter(c => [0, 1, 2].includes(c.id));
    const fallbackCols = categories.filter(c => [3, 4, 5].includes(c.id));
    const fallbackNames = [
      "Selection Sort", "Strand Sort", "Bubble Sort",
      "Heap Sort", "Tree Sort", "Timsort",
      "American Flag Sort", "Pigeonhole Sort", "Counting Sort"
    ];
    const fallbackAssignment = fallbackNames.map(name => items.find(i => i.name === name));
    const unusedItems = items.filter(i => !fallbackNames.includes(i.name));
    const distractors = unusedItems.slice(0, 2);
    const fallbackBankItems = [...fallbackAssignment, ...distractors].sort(() => 0.5 - Math.random());
    
    return { rows: fallbackRows, cols: fallbackCols, bankItems: fallbackBankItems };
  };

  const startGame = (question) => {
    audio.playSFX('click');
    const newSession = Storage.createSession(contentSetId, token || 'Anonymous');
    // If a specific question is provided (from the new JSON structure), use its gridConfig directly.
    // Otherwise fallback to generating one randomly using the legacy data.
    let newGrid = question ? question.gridConfig : generateValidGrid(contentSet.categories, contentSet.items);
    
    // Shuffle the bank items so they aren't painfully obvious
    if (newGrid && newGrid.bankItems) {
      newGrid = {
        ...newGrid,
        bankItems: [...newGrid.bankItems].sort(() => Math.random() - 0.5)
      };
    }
    
    const updated = Storage.updateSession(newSession._id, { gridConfig: newGrid });
    setSession(updated);
    setGridConfig(newGrid);
    setGameState('PLAYING');
    setDraggedItem(null);
    setHoveredCell(null);
    setFeedback(null);
    setTimeLeft(180);
    audio.playBGM('https://cdn.pixabay.com/download/audio/2022/01/21/audio_31743c588f.mp3?filename=8-bit-arcade-138828.mp3');
  };

  const handleDragStart = (e, item) => {
    audio.playSFX('click');
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.name);
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setHoveredCell(null);
  };

  const handleDrop = (e, r, c) => {
    e.preventDefault();
    setHoveredCell(null);
    if (feedback || session.filledBoxes[`${r}-${c}`]) return;
    
    const itemName = e.dataTransfer.getData('text/plain');
    const item = gridConfig.bankItems.find(i => i.name === itemName);
    if (!item) return;

    processMove(item, r, c);
  };

  const handleDragOver = (e, r, c) => {
    e.preventDefault();
    if (!session.filledBoxes[`${r}-${c}`]) {
      setHoveredCell({ r, c });
    }
  };

  const handleDragLeave = (e) => {
    setHoveredCell(null);
  };

  const handleRemoveBlock = (r, c) => {
    if (gameState !== 'PLAYING') return;
    const cellKey = `${r}-${c}`;
    if (!session.filledBoxes[cellKey]) return;
    audio.playSFX('click');
    const newFilled = { ...session.filledBoxes };
    delete newFilled[cellKey];
    
    const newScore = Math.max(0, session.score - 100);
    const updated = Storage.updateSession(session._id, { filledBoxes: newFilled, score: newScore });
    setSession(updated);
  };

  const processMove = (item, r, c) => {
    const cellKey = `${r}-${c}`;
    const rowCatId = gridConfig.rows[r].id;
    const colCatId = gridConfig.cols[c].id;

    const isValidLocally = item.validCategoryIds.includes(rowCatId) && item.validCategoryIds.includes(colCatId);

    if (isValidLocally) {
      audio.playSFX('success');
      const newFilled = { ...session.filledBoxes, [cellKey]: item.name };
      const newScore = session.score + 100;
      
      const patch = { filledBoxes: newFilled, score: newScore };
      let newStatus = session.status;
      
      if (Object.keys(newFilled).length === 9) {
        newStatus = 'won';
        patch.status = newStatus;
        patch.completedAt = new Date().toISOString();
      }
      
      const updated = Storage.updateSession(session._id, patch);
      setSession(updated);
      setFeedback({ type: 'success', message: "Correct!" });
      
      setTimeout(() => {
        setFeedback(null);
        if (newStatus === 'won') setGameState('WON');
      }, 1000);
    } else {
      audio.playSFX('wrong');
      setFeedback({ type: 'error', message: "Incorrect combination!" });
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!contentSet) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Ambient Arcade Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#28185c_0%,#100b2e_45%,#050612_85%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-600/15 rounded-full blur-[90px]"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-16 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-[70px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b277218_1px,transparent_1px),linear-gradient(to_bottom,#3b277218_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
      </div>

      <header className="relative z-10 pt-4 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = '/'} className="w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-700 to-indigo-900 border border-indigo-400/40 border-b-4 border-b-indigo-950 flex items-center justify-center text-indigo-100 shadow-[0_4px_10px_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b transition-all">
            <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl filter drop-shadow-[0_0_8px_#ffd13b] animate-bounce hidden md:inline">⚡</span>
              <h1 className="text-2xl md:text-3xl font-black uppercase bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
                {contentSet.title}
              </h1>
            </div>
            <div className="text-[10px] md:text-xs font-mono font-black text-amber-300 px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/40 inline-block uppercase mt-1">
              {contentSet.branch} Branch
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 lg:p-8 relative z-10">
        {feedback && (
           <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
             <div className={`px-6 py-3 rounded-xl border-b-4 font-black text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] tracking-widest uppercase ${feedback.type === 'success' ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-950' : 'bg-gradient-to-b from-red-500 to-red-700 border-red-950'}`}>
               {feedback.message}
             </div>
           </div>
        )}

        {gameState === 'MENU' && (
          <div className="w-full max-w-4xl bg-gradient-to-b from-[#181f42] to-[#0d122b] border-2 border-indigo-600/40 p-8 rounded-[2rem] flex flex-col items-center mt-12 animate-in zoom-in-95 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
             <img src="/src/assets/Logos/bingo_bonanaza.png" alt="Bingo Bonanza" className="h-28 object-contain mb-4 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
             <h2 className="text-3xl md:text-4xl font-black text-white mb-2 text-center tracking-wider drop-shadow-md">SELECT BINGO CHALLENGE</h2>
             <p className="text-indigo-200 text-center mb-6 max-w-xl text-md font-medium leading-relaxed">
               Choose a challenge below! Drag and drop concepts to their perfect intersecting properties in the 3x3 immaculate grid! Watch out for the distractors!
             </p>
             
             {allQuestions && allQuestions.length > 0 ? (
               <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                 {allQuestions.map(q => (
                   <button 
                     key={q.id}
                     onClick={() => startGame(q)}
                     className="w-full text-left bg-slate-900/60 hover:bg-indigo-900/40 border border-indigo-900/50 hover:border-indigo-400/60 p-5 rounded-2xl transition group flex flex-col justify-between shadow-lg"
                   >
                     <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 font-mono">
                       {q.branch} • {q.id}
                     </div>
                     <div className="text-xl md:text-2xl font-black text-white leading-snug mb-4 flex-1 flex items-center">
                       {q.questionText.replace(/Match the (.*?) concepts to the correct combination of.*/i, '$1')}
                     </div>
                     <div className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-center text-white font-black text-sm uppercase tracking-widest shadow-md group-hover:scale-[1.02] transition-transform">
                       PLAY
                     </div>
                   </button>
                 ))}
               </div>
             ) : (
               <button 
                 onClick={() => startGame()}
                 className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-600 border-t-2 border-yellow-100 border-b-4 border-amber-950 text-slate-950 font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(251,191,36,0.5)] active:translate-y-1 active:border-b-0 transition-all"
               >
                 START LEGACY GAME
               </button>
             )}
          </div>
        )}

        {gameState === 'PLAYING' && session && gridConfig && (
          <div className="w-full max-w-6xl flex flex-col items-center">
            
            {/* Chunky Arcade HUD Panel */}
            <div className="w-full max-w-3xl bg-gradient-to-b from-[#181f42] to-[#0d122b] rounded-2xl p-3 border-2 border-indigo-600/40 shadow-[0_8px_20px_-3px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 pl-2">
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-2 border-yellow-100 flex items-center justify-center text-slate-950 font-black shadow-[0_0_14px_rgba(251,191,36,0.6)] text-xl md:text-2xl">
                  ★
                  <div className="absolute inset-0 rounded-full bg-white/30 mix-blend-overlay"></div>
                </div>
                <div>
                  <span className="text-xs md:text-sm uppercase font-mono font-extrabold tracking-wider text-amber-400/90 block -mb-1 md:-mb-2">Score</span>
                  <span className="text-3xl md:text-5xl leading-tight font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{session.score}</span>
                </div>
              </div>

              <div className="text-center px-4">
                <span className="text-xs md:text-sm uppercase font-mono font-extrabold text-cyan-400 block -mb-1 md:-mb-2">Daubed</span>
                <span className="text-3xl md:text-5xl font-black text-white tracking-wide">
                  <span className="text-emerald-400">{Object.keys(session.filledBoxes).length}</span><span className="text-slate-500">/</span>9
                </span>
              </div>

              <div className="flex items-center gap-3 pr-2 bg-slate-950/70 border border-emerald-500/40 rounded-xl px-4 py-2 shadow-inner">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full border-[3px] border-t-transparent animate-spin ${timeLeft <= 30 ? 'border-red-500' : 'border-emerald-500'}`}></div>
                </div>
                <div className={`font-mono text-2xl md:text-3xl font-black tracking-tight ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-emerald-300'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6 w-full">
              {/* Left Side: Arcade Grid */}
              <div className="relative bg-gradient-to-b from-[#1c2247] via-[#131735] to-[#0c0f24] p-3 md:p-5 rounded-3xl border-2 border-amber-400/70 shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)] w-full flex-1 max-w-3xl">
                {/* Golden Corner Rivets */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                
                <div className="grid grid-cols-[80px_1fr_1fr_1fr] md:grid-cols-[110px_1fr_1fr_1fr] gap-2 w-full">
                  {/* Top-left empty */}
                  <div className="flex items-end justify-center pb-1">
                     <span className="text-[9px] md:text-xs font-mono uppercase text-indigo-300 font-black tracking-tighter bg-indigo-950/80 px-2 py-1 rounded border border-indigo-700/40">
                        PROP \ PROP
                     </span>
                  </div>
                  
                  {/* Col Headers */}
                  {gridConfig.cols.map((c, i) => {
                    const colors = [
                      "from-cyan-500 to-cyan-800 border-cyan-200 border-b-cyan-950 shadow-[0_3px_0_#083344,0_4px_10px_rgba(6,182,212,0.4)]",
                      "from-purple-500 to-purple-800 border-purple-200 border-b-purple-950 shadow-[0_3px_0_#3b0764,0_4px_10px_rgba(168,85,247,0.4)]",
                      "from-pink-500 to-rose-700 border-pink-200 border-b-pink-950 shadow-[0_3px_0_#881337,0_4px_10px_rgba(244,63,94,0.4)]"
                    ];
                    return (
                      <div key={`col-${c.id}`} className={`bg-gradient-to-b ${colors[i % 3]} border-t border-b-4 rounded-xl py-2 px-1 flex flex-col items-center justify-center text-center`}>
                        <span className="text-[9px] md:text-xs font-black text-white leading-tight uppercase drop-shadow">{c.label}</span>
                      </div>
                    );
                  })}

                  {/* Rows */}
                  {gridConfig.rows.map((rowCat, rIdx) => (
                    <React.Fragment key={`row-${rowCat.id}`}>
                      {/* Row Header */}
                      <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-400/40 rounded-xl flex flex-col justify-center items-center p-1 md:p-2 text-center shadow-inner min-h-[4.5rem] lg:min-h-[5.5rem]">
                        <span className="font-mono text-[9px] md:text-xs font-black text-amber-300 uppercase leading-tight">{rowCat.label}</span>
                      </div>
                      
                      {/* Cells */}
                      {[0, 1, 2].map(cIdx => {
                        const isFilled = !!session.filledBoxes[`${rIdx}-${cIdx}`];
                        const itemName = session.filledBoxes[`${rIdx}-${cIdx}`];
                        
                        let dragClasses = 'bg-slate-950/60 border border-slate-700/60 border-dashed hover:border-slate-500';
                        if (hoveredCell && hoveredCell.r === rIdx && hoveredCell.c === cIdx && draggedItem && !isFilled) {
                          const rowCatId = rowCat.id;
                          const colCatId = gridConfig.cols[cIdx].id;
                          const isValid = draggedItem.validCategoryIds.includes(rowCatId) && draggedItem.validCategoryIds.includes(colCatId);
                          
                          if (isValid) {
                            dragClasses = 'bg-slate-800/80 border border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105 z-10';
                          } else {
                            dragClasses = 'bg-red-950/60 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105 z-10';
                          }
                        }
                        
                        return (
                          <div 
                            key={`cell-${rIdx}-${cIdx}`}
                            onDragOver={(e) => handleDragOver(e, rIdx, cIdx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                            className={`min-h-[4.5rem] lg:min-h-[5.5rem] rounded-2xl flex flex-col items-center justify-center p-1 md:p-2 text-center transition-all relative overflow-hidden ${
                              isFilled 
                                ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                                : dragClasses
                            }`}
                          >
                            {isFilled ? (
                              <>
                                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(16,185,129,0.38)_0%,rgba(5,150,105,0.2)_70%,transparent_100%)] transform -rotate-[4deg] pointer-events-none"></div>
                                <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border border-yellow-100 flex items-center justify-center text-[8px] md:text-[10px] font-black text-slate-950 shadow-md">✓</div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRemoveBlock(rIdx, cIdx); }}
                                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold border border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20 transition-all hover:scale-110"
                                >
                                  ×
                                </button>
                                <div className="relative z-10 w-full flex flex-col justify-center items-center pointer-events-none">
                                  <span className="text-[9px] md:text-sm font-black text-white tracking-tight leading-tight">{itemName}</span>
                                  <span className="text-[7px] md:text-[8px] font-black text-emerald-300 font-mono tracking-wider uppercase bg-emerald-950/80 px-1 rounded mt-1 border border-emerald-600/40">DAUBED!</span>
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-500 font-black text-[10px] md:text-sm">DROP</span>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              {/* Right Side: CONCEPT BANK */}
              <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-gradient-to-b from-[#141a3a] via-[#0d1228] to-[#080a18] border-t-2 border-x-2 lg:border-2 border-indigo-500/50 rounded-t-3xl lg:rounded-3xl p-3 md:p-5 shadow-[0_-12px_30px_rgba(0,0,0,0.8)] lg:shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗂️</span>
                    <h2 className="text-sm uppercase tracking-wider text-amber-300 font-black drop-shadow">
                      CONCEPT BANK
                    </h2>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-cyan-300 font-mono font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/40">
                    {gridConfig.bankItems.filter(i => !Object.values(session.filledBoxes).includes(i.name)).length} Left
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-2 pb-2 lg:pb-0">
                  {gridConfig.bankItems && gridConfig.bankItems.map(item => {
                    const isUsed = Object.values(session.filledBoxes).includes(item.name);
                    if (isUsed) return null; 
                    
                    return (
                      <div
                        key={item.name}
                        draggable={!isUsed}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        className="w-full rounded-xl p-2 bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-600 border-b-4 border-b-slate-950 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-center flex flex-col justify-center cursor-grab active:cursor-grabbing hover:border-indigo-400 active:translate-y-1 transition-all group min-h-[3rem]"
                      >
                        <div className="font-black text-xs text-slate-200 leading-tight group-hover:text-indigo-200">{item.name}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-3 hidden lg:block">
                  <span className="text-[9px] text-indigo-300/80 font-mono font-semibold">Drag cards into the grid</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WON STATE */}
        {gameState === 'WON' && (
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#181f42] to-[#0d122b] border-2 border-emerald-500/50 p-8 rounded-[2rem] flex flex-col items-center mt-12 animate-in zoom-in-95 shadow-[0_10px_40px_rgba(16,185,129,0.3)]">
             <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-500 mb-2 drop-shadow-md tracking-wider">IMMACULATE!</h2>
             <p className="text-emerald-100/70 mb-6 text-lg font-medium">You filled the entire 3x3 grid flawlessly.</p>
             
             <div className="flex flex-col items-center mb-8 bg-slate-950/50 p-4 rounded-2xl border border-emerald-900">
               <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest mb-1">FINAL SCORE</span>
               <div className="text-6xl font-black text-emerald-400 font-mono">{session?.score}</div>
             </div>
             
             <div className="flex gap-4 w-full">
               <button onClick={() => {
                 import('../utils/shareUtils').then(({ shareResult }) => {
                   shareResult('Bingo Bonanza', session?.score || 0, { level: 'Grid Completed' });
                 });
               }} className="w-1/2 py-4 rounded-2xl bg-[#0a1122] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950 font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(0,0,0,0.4)] active:translate-y-1 transition-all flex items-center justify-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                 Share
               </button>
               <button 
                 onClick={() => setGameState('MENU')}
                 className="w-1/2 py-4 rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-600 border-t-2 border-emerald-200 border-b-4 border-b-teal-900 text-slate-950 font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:translate-y-1 active:border-b-0 transition-all"
               >
                 MENU
               </button>
             </div>
          </div>
        )}

        {/* LOST STATE */}
        {gameState === 'LOST' && (
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#181f42] to-[#0d122b] border-2 border-red-500/50 p-8 rounded-[2rem] flex flex-col items-center mt-12 animate-in zoom-in-95 shadow-[0_10px_40px_rgba(239,68,68,0.2)]">
             <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
             </div>
             <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600 mb-2 drop-shadow-md tracking-wider">TIME'S UP!</h2>
             <p className="text-red-100/70 mb-6 text-lg font-medium">You ran out of time.</p>
             
             <div className="flex flex-col items-center mb-8 bg-slate-950/50 p-4 rounded-2xl border border-red-900">
               <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest mb-1">SCORE SAVED</span>
               <div className="text-5xl font-black text-slate-300 font-mono">{session?.score}</div>
             </div>
             
             <button 
               onClick={() => setGameState('MENU')}
               className="w-full py-4 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-800 border-t-2 border-slate-400 border-b-4 border-b-slate-950 text-white font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(0,0,0,0.4)] active:translate-y-1 active:border-b-0 transition-all"
             >
               BACK TO MENU
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
