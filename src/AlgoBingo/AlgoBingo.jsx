import React, { useState, useEffect, useRef } from 'react';
import { Storage } from './Storage';

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

  const generateValidGrid = (categories, items) => {
    for (let attempt = 0; attempt < 5000; attempt++) {
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
        const bankItems = [...assignment].sort(() => 0.5 - Math.random());
        return { rows: rowCats, cols: colCats, bankItems };
      }
    }
    return { rows: categories.slice(0,3), cols: categories.slice(3,6), bankItems: items.slice(0, 9) };
  };

  const startGame = () => {
    const newSession = Storage.createSession(contentSetId, token || 'Anonymous');
    const newGrid = generateValidGrid(contentSet.categories, contentSet.items);
    
    const updated = Storage.updateSession(newSession._id, { gridConfig: newGrid });
    setSession(updated);
    setGridConfig(newGrid);
    setGameState('PLAYING');
    setDraggedItem(null);
    setHoveredCell(null);
    setFeedback(null);
    setTimeLeft(180);
  };

  const handleDragStart = (e, item) => {
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

  const processMove = (item, r, c) => {
    const cellKey = `${r}-${c}`;
    const rowCatId = gridConfig.rows[r].id;
    const colCatId = gridConfig.cols[c].id;

    const isValid = item.validCategoryIds.includes(rowCatId) && item.validCategoryIds.includes(colCatId);

    if (isValid) {
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
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#181f42] to-[#0d122b] border-2 border-indigo-600/40 p-8 rounded-[2rem] flex flex-col items-center mt-12 animate-in zoom-in-95 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
             <img src="/src/assets/Logos/bingo_bonanaza.png" alt="Bingo Bonanza" className="h-32 object-contain mb-6 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
             <h2 className="text-4xl md:text-5xl font-black text-white mb-4 text-center tracking-wider drop-shadow-md">BINGO BONANZA</h2>
             <p className="text-indigo-200 text-center mb-8 max-w-md text-lg font-medium leading-relaxed">
               Match drawn algorithms to their properties. Drag and drop the exact 9 algorithms to their perfect match in this 3x3 immaculate grid!
             </p>
             <button 
               onClick={startGame}
               className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-600 border-t-2 border-yellow-100 border-b-4 border-amber-950 text-slate-950 font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(251,191,36,0.5)] active:translate-y-1 active:border-b-0 transition-all"
             >
               START GAME
             </button>
          </div>
        )}

        {gameState === 'PLAYING' && session && gridConfig && (
          <div className="w-full max-w-6xl flex flex-col items-center">
            
            {/* Chunky Arcade HUD Panel */}
            <div className="w-full max-w-3xl bg-gradient-to-b from-[#181f42] to-[#0d122b] rounded-2xl p-3 border-2 border-indigo-600/40 shadow-[0_8px_20px_-3px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 pl-2">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-2 border-yellow-100 flex items-center justify-center text-slate-950 font-black shadow-[0_0_14px_rgba(251,191,36,0.6)]">
                  ★
                  <div className="absolute inset-0 rounded-full bg-white/30 mix-blend-overlay"></div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-400/90 block -mb-1">Score</span>
                  <span className="text-xl md:text-2xl leading-tight font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{session.score}</span>
                </div>
              </div>

              <div className="text-center px-4">
                <span className="text-[10px] uppercase font-mono font-extrabold text-cyan-400 block -mb-1">Daubed</span>
                <span className="text-xl md:text-2xl font-black text-white tracking-wide">
                  <span className="text-emerald-400">{Object.keys(session.filledBoxes).length}</span><span className="text-slate-500">/</span>9
                </span>
              </div>

              <div className="flex items-center gap-2 pr-2 bg-slate-950/70 border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-inner">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin ${timeLeft <= 30 ? 'border-red-500' : 'border-emerald-500'}`}></div>
                </div>
                <div className={`font-mono text-lg font-black tracking-tight ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-emerald-300'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full">
              {/* Left Side: Arcade Grid */}
              <div className="relative bg-gradient-to-b from-[#1c2247] via-[#131735] to-[#0c0f24] p-3 md:p-5 rounded-3xl border-2 border-amber-400/70 shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)] w-full flex-1 max-w-3xl">
                {/* Golden Corner Rivets */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-b from-yellow-200 to-amber-600 border border-yellow-100 shadow-sm hidden md:block"></div>
                
                <div className="grid grid-cols-[80px_1fr_1fr_1fr] md:grid-cols-[120px_1fr_1fr_1fr] gap-2 md:gap-3 w-full">
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
                        <span className="text-[10px] md:text-sm font-black text-white leading-tight uppercase drop-shadow">{c.label}</span>
                      </div>
                    );
                  })}

                  {/* Rows */}
                  {gridConfig.rows.map((rowCat, rIdx) => (
                    <React.Fragment key={`row-${rowCat.id}`}>
                      {/* Row Header */}
                      <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-400/40 rounded-xl flex flex-col justify-center items-center p-1 md:p-2 text-center shadow-inner">
                        <span className="font-mono text-[10px] md:text-sm font-black text-amber-300 uppercase">{rowCat.label}</span>
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
                            dragClasses = 'bg-slate-800/80 border border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105';
                          } else {
                            dragClasses = 'bg-red-950/60 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105';
                          }
                        }
                        
                        return (
                          <div 
                            key={`cell-${rIdx}-${cIdx}`}
                            onDragOver={(e) => handleDragOver(e, rIdx, cIdx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 md:p-2 text-center transition-all relative overflow-hidden ${
                              isFilled 
                                ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                                : dragClasses
                            }`}
                          >
                            {isFilled ? (
                              <>
                                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(16,185,129,0.38)_0%,rgba(5,150,105,0.2)_70%,transparent_100%)] transform -rotate-[4deg] pointer-events-none"></div>
                                <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border border-yellow-100 flex items-center justify-center text-[8px] md:text-[10px] font-black text-slate-950 shadow-md">✓</div>
                                <div className="relative z-10 w-full flex flex-col justify-center items-center">
                                  <span className="text-[10px] md:text-sm font-black text-white tracking-tight leading-tight">{itemName}</span>
                                  <span className="text-[7px] md:text-[9px] font-black text-emerald-300 font-mono tracking-wider uppercase bg-emerald-950/80 px-1 rounded mt-1 border border-emerald-600/40">DAUBED!</span>
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
              
              {/* Right Side: Algorithm Bank */}
              <div className="w-full lg:w-80 shrink-0 bg-gradient-to-b from-[#141a3a] via-[#0d1228] to-[#080a18] border-t-2 border-x-2 lg:border-2 border-indigo-500/50 rounded-t-3xl lg:rounded-3xl p-4 md:p-6 shadow-[0_-12px_30px_rgba(0,0,0,0.8)] lg:shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗂️</span>
                    <h2 className="text-sm uppercase tracking-wider text-amber-300 font-black drop-shadow">
                      Algo Rack
                    </h2>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-cyan-300 font-mono font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/40">
                    {gridConfig.bankItems.filter(i => !Object.values(session.filledBoxes).includes(i.name)).length} Left
                  </span>
                </div>

                <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar">
                  {gridConfig.bankItems && gridConfig.bankItems.map(item => {
                    const isUsed = Object.values(session.filledBoxes).includes(item.name);
                    if (isUsed) return null; 
                    
                    return (
                      <div
                        key={item.name}
                        draggable={!isUsed}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        className="flex-shrink-0 w-40 lg:w-full rounded-2xl p-3 bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-600 border-b-4 border-b-slate-950 shadow-[0_4px_8px_rgba(0,0,0,0.4)] text-left flex flex-col justify-center cursor-grab active:cursor-grabbing hover:border-indigo-400 active:translate-y-1 transition-all group"
                      >
                        <div className="font-black text-sm text-slate-200 leading-tight group-hover:text-indigo-200">{item.name}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-4 hidden lg:block">
                  <span className="text-[10px] text-indigo-300/80 font-mono font-semibold">Drag cards into the grid</span>
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
             
             <button 
               onClick={startGame}
               className="w-full py-4 rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-600 border-t-2 border-emerald-200 border-b-4 border-b-teal-900 text-slate-950 font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:translate-y-1 active:border-b-0 transition-all"
             >
               PLAY AGAIN
             </button>
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
               onClick={startGame}
               className="w-full py-4 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-800 border-t-2 border-slate-400 border-b-4 border-b-slate-950 text-white font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(0,0,0,0.4)] active:translate-y-1 active:border-b-0 transition-all"
             >
               TRY AGAIN
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
