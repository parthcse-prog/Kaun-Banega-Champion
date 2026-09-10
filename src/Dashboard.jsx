import { useState, useEffect } from 'react';
import { questions, backupQuestions } from './questions';
import gameLogo from './assets/Logos/game_Logo.png';

const pointsLadder = [
  "1,000", "2,000", "3,000", "5,000", "10,000",
  "20,000", "40,000", "80,000", "160,000", "320,000",
  "640,000", "1,250,000", "2,500,000", "5,000,000", "10,000,000",
  "20,000,000", "30,000,000", "50,000,000", "75,000,000", "100,000,000"
];

export default function Dashboard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameState, setGameState] = useState('intro'); // intro, playing, gameover, completed
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: { used: false },
    swap: { used: false }
  });
  const [activeQuestion, setActiveQuestion] = useState(questions[0]);
  const [score, setScore] = useState(0); // Track correct answers

  // Time determination based on index
  const getTimerForQuestion = (index) => {
    if (index < 5) return 30;
    if (index < 10) return 45;
    if (index < 15) return 60;
    return null; // No timer for last 5
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft !== null && timeLeft > 0 && selectedOption === null) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (gameState === 'playing' && timeLeft === 0 && selectedOption === null) {
      setGameState('gameover');
    }
  }, [timeLeft, gameState, selectedOption]);

  const startGame = () => {
    setCurrentQuestionIndex(0);
    setActiveQuestion(questions[0]);
    setGameState('playing');
    setTimeLeft(getTimerForQuestion(0));
    setLifelines({ fiftyFifty: { used: false }, swap: { used: false } });
    setScore(0);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setIsCorrect(null);
  };

  const handleOptionClick = (optionIndex) => {
    if (selectedOption !== null || eliminatedOptions.includes(optionIndex)) return;
    
    setSelectedOption(optionIndex);
    
    // Simulate checking
    setTimeout(() => {
      if (optionIndex === activeQuestion.answer) {
        setIsCorrect(true);
        setScore(score + 1);
        setTimeout(() => {
          if (currentQuestionIndex === 19) {
            setGameState('completed');
          } else {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setActiveQuestion(questions[nextIndex]);
            setTimeLeft(getTimerForQuestion(nextIndex));
            setSelectedOption(null);
            setIsCorrect(null);
            setEliminatedOptions([]);
          }
        }, 1500);
      } else {
        setIsCorrect(false);
        setTimeout(() => {
          setGameState('gameover');
        }, 1500);
      }
    }, 1000);
  };

  const useFiftyFifty = () => {
    if (lifelines.fiftyFifty.used || currentQuestionIndex < 7) return;
    
    let wrongOptions = [0, 1, 2, 3].filter(idx => idx !== activeQuestion.answer);
    // Shuffle and pick 2 to eliminate
    wrongOptions.sort(() => Math.random() - 0.5);
    setEliminatedOptions([wrongOptions[0], wrongOptions[1]]);
    
    setLifelines(prev => ({ ...prev, fiftyFifty: { used: true } }));
  };

  const useSwap = () => {
    if (lifelines.swap.used || currentQuestionIndex < 10) return;
    
    // Use a backup question
    const backup = backupQuestions[Math.floor(Math.random() * backupQuestions.length)];
    setActiveQuestion(backup);
    setLifelines(prev => ({ ...prev, swap: { used: true } }));
    setEliminatedOptions([]);
    setTimeLeft(getTimerForQuestion(currentQuestionIndex));
  };

  if (gameState === 'intro') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-6xl mx-auto w-full gap-8">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-display font-black text-white tracking-tight drop-shadow-md">Select Game</h1>
          <p className="text-slate-400 mt-2 font-medium">Choose a challenge to begin</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* KBC Card */}
          <div className="glass-card rounded-3xl p-8 text-center border-purple-500/25 shadow-neonPurple flex flex-col items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <div>
              <img src={gameLogo} alt="Kaun Banega Champion" className="h-28 object-contain mb-6 drop-shadow-2xl mx-auto" />
              <p className="text-slate-300 mb-8 text-sm sm:text-base font-medium leading-relaxed">Test your knowledge with 20 levels of pure  trivia. Can you beat the timer and reach the expert tier?</p>
            </div>
            <button onClick={startGame} className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyber-cyan to-blue-500 font-bold text-slate-900 text-lg hover:brightness-110 transition-all shadow-neonCyan">Play KBC</button>
          </div>

          {/* Logic Blast Card */}
          <div className="glass-card rounded-3xl p-8 text-center border-pink-500/25 shadow-neonPink flex flex-col items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <div>
              <img src="/src/assets/Logos/Logic_Blast.png" alt="Logic Blast" className="h-28 object-contain mb-6 drop-shadow-2xl mx-auto" />
              <p className="text-slate-300 mb-8 text-sm sm:text-base font-medium leading-relaxed">Master programming concepts by building visual logic blocks. Solve puzzles and watch your code come to life!</p>
            </div>
            <button onClick={() => window.location.href = '/logic-blast'} className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 font-bold text-white text-lg hover:brightness-110 transition-all shadow-neonPink">Play Logic Blast</button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover' || gameState === 'completed') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-lg w-full text-center border-purple-500/25 shadow-neonPurple flex flex-col items-center">
          <img src={gameLogo} alt="Kaun Banega Champion" className="h-24 object-contain mb-4 drop-shadow-lg opacity-80" />
          <h1 className="text-4xl font-display font-black mb-2 text-white">
            {gameState === 'completed' ? 'Champion!' : 'Game Over'}
          </h1>
          <p className="text-slate-300 mb-2">
            {gameState === 'completed' 
              ? 'You answered all 20 questions correctly!' 
              : `You reached Question ${currentQuestionIndex + 1}.`}
          </p>
          <p className="text-amber-400 font-bold text-xl mb-8">
            Winnings: {currentQuestionIndex > 0 ? pointsLadder[currentQuestionIndex - 1] : '0'} PTS
          </p>
          <button onClick={startGame} className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyber-pink to-purple-500 font-bold text-white text-lg hover:scale-[1.02] transition-transform shadow-neonPink">Play Again</button>
        </div>
      </div>
    );
  }

  // PLAYING STATE
  const optionLetters = ['A', 'B', 'C', 'D'];
  const progressPercent = ((currentQuestionIndex) / 20) * 100;

  return (
    <div className="flex-1 flex items-start justify-center p-2 sm:p-6 w-full max-w-6xl mx-auto my-4 text-slate-100 font-sans gap-6 flex-col lg:flex-row">
      
      {/* Main Game Area */}
      <div className="w-full lg:flex-1 bg-cyber-bg relative flex flex-col justify-between overflow-hidden shadow-2xl rounded-3xl sm:rounded-[44px] border border-purple-900/40 pb-6 p-4">
        {/* Ambient Blobs inside container for neat effect */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 bg-cyber-pink/15 rounded-full blur-[90px]"></div>
        
        <div className="relative z-10 flex flex-col gap-4 pt-2">
          {/* TopBar */}
          <header className="flex items-center justify-between pb-1">
            <button onClick={() => setGameState('intro')} className="w-10 h-10 rounded-2xl glass-pill border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-red-400/40 hover:bg-red-500/10 transition active:scale-95" title="Quit Game">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img src={gameLogo} alt="Game Logo" className="h-8 object-contain" />
              <span className="font-display font-bold text-lg tracking-wider uppercase bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent drop-shadow-sm">
                Kaun Banega Champion
              </span>
            </div>
            <div className="w-10 h-10"></div> {/* Spacer for centering */}
          </header>

          {/* ProgressAndTimerSection */}
          <section className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-cyber-pink">Question {currentQuestionIndex + 1}</span>
                <span className="text-xs text-slate-400 font-medium">/ 20</span>
              </div>
              
              {timeLeft !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b0b2e] border border-cyber-pink/60 shadow-neonPink animate-timer-glow">
                  <svg className="w-3.5 h-3.5 text-cyber-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  </svg>
                  <span className={`font-display font-bold text-sm tracking-wider ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</span>
                </div>
              )}
            </div>
            {/* Step Progress Bar */}
            <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-purple-800/30">
              <div className="h-full bg-gradient-to-r from-cyber-purple via-cyber-pink to-cyber-cyan rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </section>

          {/* QuestionCard */}
          <article className="glass-card mt-2 rounded-3xl p-6 border border-purple-500/25 shadow-neonPurple relative overflow-hidden min-h-[140px] flex flex-col justify-center">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyber-cyan/15 rounded-full blur-xl pointer-events-none"></div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 mb-4 self-start">
              <span className={`w-2 h-2 rounded-full ${currentQuestionIndex < 5 ? 'bg-emerald-400' : currentQuestionIndex < 10 ? 'bg-amber-400' : currentQuestionIndex < 15 ? 'bg-red-400' : 'bg-purple-500'} animate-ping`}></span>
              <span className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
                {currentQuestionIndex < 5 ? 'Easy' : currentQuestionIndex < 10 ? 'Medium' : currentQuestionIndex < 15 ? 'Hard' : 'Expert'} Level
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl leading-snug font-bold text-white tracking-tight">
              {activeQuestion.question}
            </h1>
          </article>

          {/* LifelinesRow */}
          <div className="flex items-center justify-center gap-4 pt-2 my-2">
            <button 
              onClick={useFiftyFifty}
              disabled={lifelines.fiftyFifty.used || currentQuestionIndex < 7}
              className={`flex-1 py-2 px-3 rounded-2xl glass-pill border transition flex items-center justify-center gap-1.5 group ${lifelines.fiftyFifty.used || currentQuestionIndex < 7 ? 'opacity-40 cursor-not-allowed border-slate-700' : 'border-purple-400/25 hover:border-cyber-pink/50 hover:bg-cyber-pink/10 active:scale-95'}`} 
              type="button"
            >
              <span className={`font-display text-xs font-bold ${currentQuestionIndex < 7 ? 'text-slate-500' : 'text-cyber-pink'}`}>50:50</span>
              <span className="text-[11px] font-medium text-slate-300">{currentQuestionIndex < 7 ? 'Unlocks Q8' : 'Split'}</span>
            </button>
            
            <button 
              onClick={useSwap}
              disabled={lifelines.swap.used || currentQuestionIndex < 10}
              className={`flex-1 py-2 px-3 rounded-2xl glass-pill border transition flex items-center justify-center gap-1.5 group ${lifelines.swap.used || currentQuestionIndex < 10 ? 'opacity-40 cursor-not-allowed border-slate-700' : 'border-purple-400/25 hover:border-cyber-cyan/50 hover:bg-cyber-cyan/10 active:scale-95'}`} 
              type="button"
            >
              <svg className={`w-3.5 h-3.5 ${currentQuestionIndex < 10 ? 'text-slate-500' : 'text-cyber-cyan'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <span className="text-[11px] font-medium text-slate-300">{currentQuestionIndex < 10 ? 'Unlocks Q11' : 'Swap'}</span>
            </button>
          </div>

          {/* AnswerOptions */}
          <section className="flex flex-col gap-3 pt-1">
            {activeQuestion.options.map((option, idx) => {
              const isEliminated = eliminatedOptions.includes(idx);
              const isSelected = selectedOption === idx;
              
              let buttonStyle = "glass-pill border-white/10 hover:border-purple-400/50 hover:bg-purple-900/30";
              let letterStyle = "bg-slate-800/80 border-white/10 text-slate-300";
              let textStyle = "text-slate-200";

              if (isSelected) {
                if (isCorrect === null) {
                  // Selected but waiting for result
                  buttonStyle = "bg-gradient-to-r from-amber-500/20 via-purple-900/40 to-slate-900 border-amber-500 shadow-glow-amber";
                  letterStyle = "bg-amber-500 text-slate-900";
                  textStyle = "text-white font-bold";
                } else if (isCorrect) {
                  buttonStyle = "bg-gradient-to-r from-emerald-500/20 via-purple-900/40 to-slate-900 border-emerald-500 shadow-md";
                  letterStyle = "bg-emerald-500 text-slate-900";
                  textStyle = "text-white font-bold";
                } else {
                  buttonStyle = "bg-gradient-to-r from-red-500/20 via-purple-900/40 to-slate-900 border-red-500 shadow-md";
                  letterStyle = "bg-red-500 text-slate-900";
                  textStyle = "text-white font-bold";
                }
              } else if (selectedOption !== null && idx === activeQuestion.answer && isCorrect === false) {
                // Show correct answer if wrong was selected
                buttonStyle = "border-emerald-500/50 bg-emerald-500/10";
                letterStyle = "bg-emerald-500/20 text-emerald-400";
                textStyle = "text-emerald-400";
              }

              if (isEliminated) {
                return (
                  <button key={idx} disabled className="w-full rounded-2xl p-4 border border-transparent flex items-center gap-4 text-left opacity-20" type="button">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center font-display font-bold text-sm text-slate-500">
                      {optionLetters[idx]}
                    </div>
                  </button>
                );
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full rounded-2xl p-4 border-2 flex items-center gap-4 text-left transition duration-200 ${selectedOption === null ? 'active:scale-[0.98]' : ''} ${buttonStyle}`} 
                  type="button"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-display font-bold text-sm transition ${letterStyle}`}>
                    {optionLetters[idx]}
                  </div>
                  <span className={`text-base flex-1 ${textStyle}`}>{option}</span>
                  
                  {isSelected && isCorrect !== null && (
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                      {isCorrect ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </section>
        </div>
      </div>
      
      {/* Points Ladder Right Panel */}
      <div className="w-full lg:w-80 glass-card rounded-3xl p-4 border border-purple-500/25 flex flex-col h-[700px]">
        <h2 className="text-xl font-display font-black text-center text-purple-200 uppercase tracking-widest mb-4 border-b border-white/10 pb-4">Points</h2>
        
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col-reverse gap-1 pr-1">
          {pointsLadder.map((points, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const isPassed = idx < currentQuestionIndex;
            const isMilestone = (idx + 1) % 5 === 0;
            
            let itemStyle = "text-slate-400";
            let iconStyle = "text-slate-600";
            let bgStyle = "hover:bg-white/5";
            
            if (isCurrent) {
              itemStyle = "text-slate-900 font-bold";
              bgStyle = "bg-gradient-to-r from-amber-500 to-amber-400 shadow-glow-amber scale-[1.02] ml-2 rounded-xl z-10";
              iconStyle = "text-slate-900";
            } else if (isPassed) {
              itemStyle = "text-emerald-400/70";
              iconStyle = "text-emerald-500/50";
            } else if (isMilestone) {
              itemStyle = "text-white font-bold";
              iconStyle = "text-amber-400";
            }

            return (
              <div key={idx} className={`flex items-center justify-between p-2 rounded-lg transition-all ${bgStyle}`}>
                <div className="flex items-center gap-3">
                  {isMilestone && !isCurrent ? (
                    <svg className={`w-4 h-4 ${iconStyle}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                  ) : (
                    <span className={`font-display text-sm font-bold w-4 text-center ${iconStyle}`}>{isCurrent ? '▶' : (idx + 1)}</span>
                  )}
                  <span className={`text-sm ${itemStyle}`}>{idx + 1}</span>
                </div>
                <span className={`font-display text-sm ${itemStyle} ${isMilestone && !isCurrent ? 'text-amber-400 drop-shadow-sm' : ''}`}>
                  {points}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
