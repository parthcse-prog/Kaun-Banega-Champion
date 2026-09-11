import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Storage } from './Storage';

export default function AlgoBingo({ token }) {
  const contentSetId = "cs-algo-bingo";
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, WON, LOST
  const [session, setSession] = useState(null);
  const [contentSet, setContentSet] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string, categoryId: number }

  useEffect(() => {
    setContentSet(Storage.getContentSet(contentSetId));
  }, []);

  const startGame = () => {
    const newSession = Storage.createSession(contentSetId, token || 'Anonymous');
    setSession(newSession);
    setGameState('PLAYING');
    drawNextItem(newSession);
  };

  const getValidUnfilledCategories = (item, currentSession) => {
    return item.validCategoryIds.filter(catId => !currentSession.filledBoxes[catId]);
  };

  const getAvailableItems = (currentSession) => {
    if (!contentSet) return [];
    return contentSet.items.filter(item => getValidUnfilledCategories(item, currentSession).length > 0);
  };

  const drawNextItem = useCallback((currentSession = session) => {
    setFeedback(null);
    const available = getAvailableItems(currentSession);
    if (available.length === 0) {
      // Should ideally not happen unless game is won, but just in case
      return;
    }
    const next = available[Math.floor(Math.random() * available.length)];
    setCurrentItem(next);
    setTimeLeft(15);
    setTimerActive(true);
  }, [session, contentSet]);

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      // Timeout -> Skip
      handleSkip();
    }
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft]);

  const handleSkip = () => {
    setTimerActive(false);
    setFeedback({ type: 'error', message: "Time's up! Skipped.", categoryId: null });
    setTimeout(() => {
      drawNextItem(session);
    }, 1500);
  };

  const handleManualPass = () => {
    setTimerActive(false);
    setFeedback({ type: 'error', message: "Passed", categoryId: null });
    setTimeout(() => {
      drawNextItem(session);
    }, 1000);
  };

  const handleCategoryClick = (categoryId) => {
    if (!timerActive || !currentItem || feedback) return;

    setTimerActive(false);

    if (session.filledBoxes[categoryId]) {
      // Already filled
      setFeedback({ type: 'error', message: "Already filled!", categoryId });
      setTimeout(() => setTimerActive(true), 1000);
      return;
    }

    if (currentItem.validCategoryIds.includes(categoryId)) {
      // Correct!
      const newFilled = { ...session.filledBoxes, [categoryId]: currentItem.name };
      const newScore = session.score + 100 + (timeLeft * 10);
      
      const patch = { filledBoxes: newFilled, score: newScore };
      let newStatus = session.status;
      
      if (Object.keys(newFilled).length === contentSet.categories.length) {
        newStatus = 'won';
        patch.status = newStatus;
        patch.completedAt = new Date().toISOString();
      }
      
      const updated = Storage.updateSession(session._id, patch);
      setSession(updated);
      setFeedback({ type: 'success', message: "Correct!", categoryId });
      
      setTimeout(() => {
        if (newStatus === 'won') {
          setGameState('WON');
        } else {
          drawNextItem(updated);
        }
      }, 1500);

    } else {
      // Incorrect
      const newLives = session.lives - 1;
      const patch = { lives: newLives };
      let newStatus = session.status;
      
      if (newLives <= 0) {
        newStatus = 'lost';
        patch.status = newStatus;
        patch.completedAt = new Date().toISOString();
      }
      
      const updated = Storage.updateSession(session._id, patch);
      setSession(updated);
      setFeedback({ type: 'error', message: "Incorrect!", categoryId });
      
      setTimeout(() => {
        if (newStatus === 'lost') {
          setGameState('LOST');
        } else {
          drawNextItem(updated);
        }
      }, 1500);
    }
  };

  if (!contentSet) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = '/'} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-white tracking-tight">{contentSet.title}</h1>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{contentSet.branch} Branch</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 lg:p-8 relative">
        {gameState === 'MENU' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center mt-12 animate-in slide-in-from-bottom-8">
             <img src="/src/assets/Logos/algo_bingo.png" alt="Algo Bingo" className="h-32 object-contain mb-6 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]" />
             <h2 className="text-4xl font-black text-white mb-4 text-center">ALGO BINGO</h2>
             <p className="text-slate-400 text-center mb-8 max-w-md text-lg">Draw algorithms. Match them to their properties. Fill the board.</p>
             <button 
               onClick={startGame}
               className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02]"
             >
               START GAME
             </button>
          </div>
        )}

        {gameState === 'PLAYING' && session && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            
            {/* Score HUD */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 flex items-center justify-between mb-6 shadow-xl gap-4">
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black text-slate-500 uppercase">SCORE</div>
                <div className="text-2xl font-black text-indigo-400 font-mono">{session.score}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black text-slate-500 uppercase">FILLED</div>
                <div className="text-2xl font-black text-white font-mono">{Object.keys(session.filledBoxes).length}/16</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black text-slate-500 uppercase">LIVES</div>
                <div className="text-xl tracking-widest text-red-500 font-sans">
                  {'❤️'.repeat(session.lives)}{'🤍'.repeat(3 - session.lives)}
                </div>
              </div>
            </div>

            {/* Draw Engine / HUD */}
            <div className="w-full bg-indigo-950/40 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
               {feedback && feedback.categoryId === null && (
                 <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm z-10 flex items-center justify-center animate-in fade-in">
                   <div className="text-2xl font-black text-white bg-red-600 px-6 py-2 rounded-full shadow-2xl tracking-widest">{feedback.message}</div>
                 </div>
               )}
               
               <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">CURRENT DRAW</div>
               <div className="text-3xl md:text-5xl font-black text-white mb-6 text-center tracking-tight h-14">
                 {currentItem ? currentItem.name : '...'}
               </div>
               
               <div className="flex items-center gap-4 w-full max-w-md">
                 <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700">
                   <div 
                     className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                     style={{ width: `${(timeLeft / 15) * 100}%` }}
                   ></div>
                 </div>
                 <div className={`font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                   {timeLeft}s
                 </div>
                 <button 
                   onClick={handleManualPass}
                   disabled={!timerActive || !!feedback}
                   className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors border border-slate-700"
                 >
                   PASS
                 </button>
               </div>
            </div>

            {/* Grid Board */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {contentSet.categories.map((cat) => {
                const isFilled = !!session.filledBoxes[cat.id];
                const itemName = session.filledBoxes[cat.id];
                const isFeedbackTarget = feedback && feedback.categoryId === cat.id;
                
                let boxStyles = "bg-slate-900 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer";
                if (isFilled) {
                  boxStyles = "bg-indigo-900/40 border-indigo-500/50 cursor-default opacity-80";
                }
                
                if (isFeedbackTarget) {
                  if (feedback.type === 'success') boxStyles = "bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 scale-105";
                  if (feedback.type === 'error') boxStyles = "bg-red-600 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] z-10 scale-105";
                }

                return (
                  <div 
                    key={cat.id} 
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`aspect-square rounded-2xl border-2 p-3 md:p-4 flex flex-col justify-between transition-all duration-300 ${boxStyles}`}
                  >
                    <div className={`text-xs md:text-sm font-bold leading-tight ${isFilled ? 'text-indigo-300' : 'text-slate-400'}`}>
                      {cat.label}
                    </div>
                    {isFilled && (
                      <div className="text-sm md:text-base font-black text-white mt-2 leading-tight">
                        {itemName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WON STATE */}
        {gameState === 'WON' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center mt-12 animate-in zoom-in-95">
             <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <h2 className="text-4xl font-black text-white mb-2">BINGO!</h2>
             <p className="text-slate-400 mb-6">You successfully filled all categories!</p>
             <div className="text-6xl font-black text-indigo-400 font-mono mb-8">{session?.score}</div>
             
             <button 
               onClick={startGame}
               className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
             >
               PLAY AGAIN
             </button>
          </div>
        )}

        {/* LOST STATE */}
        {gameState === 'LOST' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center mt-12 animate-in zoom-in-95">
             <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
             </div>
             <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
             <p className="text-slate-400 mb-6">You ran out of lives.</p>
             <div className="text-4xl font-black text-slate-500 font-mono mb-8">Score: {session?.score}</div>
             
             <button 
               onClick={startGame}
               className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02]"
             >
               TRY AGAIN
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
