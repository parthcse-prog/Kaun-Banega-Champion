import { useState, useEffect } from 'react';
import { questions, backupQuestions } from './questions';
import gameLogo from './assets/Logos/game_Logo.png';
import { saveGameAnalytics, getGameAnalytics, fetchGlobalXP } from './utils/analyticsStore';

const pointsLadder = [
  "1,000", "2,000", "3,000", "5,000", "10,000",
  "20,000", "40,000", "80,000", "160,000", "320,000",
  "640,000", "1,250,000", "2,500,000", "5,000,000", "10,000,000",
  "20,000,000", "30,000,000", "50,000,000", "75,000,000", "100,000,000"
];

export default function Dashboard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameState, setGameState] = useState('intro'); // intro, playing, gameover, completed
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    const fetchXP = async () => {
      const xp = await fetchGlobalXP();
      setTotalXP(xp);
    };
    fetchXP();
  }, [gameState]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: { used: false },
    swap: { used: false }
  });
  
  // Dynamic Questions from DB
  const [activeQuestions, setActiveQuestions] = useState(questions);
  const [activeBackup, setActiveBackup] = useState(backupQuestions);
  const [activeQuestion, setActiveQuestion] = useState(questions[0]);
  const [score, setScore] = useState(0); // Track correct answers

  useEffect(() => {
    // Fetch questions from MongoDB on mount
    fetch('http://localhost:5000/api/kbc/cs')
      .then(res => res.json())
      .then(data => {
        if (data && data.questions && data.questions.length > 0) {
          setActiveQuestions(data.questions);
          setActiveQuestion(data.questions[0]);
          if (data.backupQuestions) {
            setActiveBackup(data.backupQuestions);
          }
        }
      })
      .catch(err => console.error("Failed to fetch KBC questions, using local fallback", err));
  }, []);

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

  useEffect(() => {
    if (gameState === 'gameover' || gameState === 'completed') {
      const timePlayed = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
      saveGameAnalytics('Kaun Banega Champion', score, timePlayed, gameState === 'completed');
    }
  }, [gameState]);

  const startGame = () => {
    setCurrentQuestionIndex(0);
    setActiveQuestion(activeQuestions[0]);
    setGameState('playing');
    setTimeLeft(getTimerForQuestion(0));
    setLifelines({ fiftyFifty: { used: false }, swap: { used: false } });
    setScore(0);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setIsCorrect(null);
    setGameStartTime(Date.now());
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
            setActiveQuestion(activeQuestions[nextIndex]);
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
    const backup = activeBackup[Math.floor(Math.random() * activeBackup.length)];
    setActiveQuestion(backup);
    setLifelines(prev => ({ ...prev, swap: { used: true } }));
    setEliminatedOptions([]);
    setTimeLeft(getTimerForQuestion(currentQuestionIndex));
  };

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden text-slate-200 w-full"
           style={{
             backgroundColor: '#060913',
             backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(0, 242, 254, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 20%, rgba(168, 85, 247, 0.09) 0%, transparent 45%), radial-gradient(circle at 50% 85%, rgba(0, 245, 155, 0.06) 0%, transparent 50%), radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
             backgroundSize: '100% 100%, 100% 100%, 100% 100%, 28px 28px'
           }}>
        <style>{`
          .cyber-panel { background: rgba(11, 19, 38, 0.7); backdrop-filter: blur(14px); border: 1px solid rgba(0, 242, 254, 0.14); box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7); position: relative; }
          .cyber-panel:hover { border-color: rgba(0, 242, 254, 0.4); }
        `}</style>
        
        {/* TopNavigationBar */}
        <header className="sticky top-0 z-50 bg-[#060913]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3.5 transition-all">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-[0_0_25px_-5px_rgba(0,242,254,0.4)] overflow-hidden">
                  <img src="/src/assets/Logos/MIET Games.png" alt="MIET" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f59b] rounded-full ring-2 ring-[#060913] animate-pulse z-10"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-wider text-white uppercase group-hover:text-[#00f2fe] transition-colors">MIET</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-cyan-500/10 text-[#00f2fe] font-mono font-semibold border border-cyan-500/30">GAMES ARENA</span>
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
                    <span>ARENA 4K</span>
                    <span className="text-cyan-500">//</span>
                    <span className="text-[#00f59b]">PRO SHOWDOWN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MainContentArea */}
        <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
          
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[#00f2fe] text-xs font-mono font-semibold tracking-wider uppercase">
                  <span className="inline-block w-2 h-2 bg-[#00f2fe] rounded-sm"></span>
                  ARCADE CABINET DIRECTORY
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">Select Game</h2>
                <p className="text-xs sm:text-sm text-slate-400">Choose a challenge to begin</p>
              </div>
              
              <div className="flex items-center gap-3 bg-[#0a1128] border border-[#00f2fe]/30 px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(0,242,254,0.15)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.5,1L2,6V8H22V6L12.5,1M11.5,3.23L16.28,5.77L11.5,8.31L6.72,5.77L11.5,3.23M12,10.19L5,13.62V21.19L12,24.62L19,21.19V13.62L12,10.19Z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-amber-500 font-mono font-bold tracking-wider uppercase">Lifetime XP</span>
                  <span className="text-2xl font-black text-white tracking-tight">{totalXP.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              
              {/* KBC */}
              <article className="cyber-panel rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group border-cyan-500/20 hover:border-[#00f2fe] hover:shadow-[0_0_25px_-5px_rgba(0,242,254,0.4)]">
                <div className="space-y-5">
                  <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-[#0c1836] to-[#080d1a] border border-cyan-500/30 flex items-center justify-center overflow-hidden group-hover:border-cyan-400 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(0,242,254,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                      <img src={gameLogo} alt="Kaun Banega Champion" className="h-20 object-contain drop-shadow-[0_0_15px_rgba(255,183,3,0.8)] transform group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#00f2fe] transition-colors">Kaun Banega Champion</h3>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                      Test your knowledge with 20 questions of trivia. Can you beat the timer and reach the expert tier?
                    </p>
                  </div>
                </div>
                <div className="pt-5 mt-auto">
                  <button onClick={startGame} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_25px_-5px_rgba(0,242,254,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                    Play KBC
                  </button>
                </div>
              </article>

              {/* Word Connect */}
              <article className="cyber-panel rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group border-emerald-500/20 hover:border-[#00f59b] hover:shadow-[0_0_25px_-5px_rgba(0,245,155,0.4)]">
                <div className="space-y-5">
                  <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-[#09221d] to-[#080d1a] border border-emerald-500/30 flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(0,245,155,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                      <img src="/src/assets/Logos/concept_connect.png" alt="Concept Connect" className="h-20 object-contain drop-shadow-[0_0_15px_rgba(0,245,155,0.8)] transform group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#00f59b] transition-colors">Word Connect</h3>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                     Connect the letters to form a word in intended order and apply the concepts that u have learned.
                    </p>
                  </div>
                </div>
                <div className="pt-5 mt-auto">
                  <button onClick={() => window.location.href = '/word-connect'} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f59b] to-emerald-600 hover:from-teal-300 hover:to-emerald-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_25px_-5px_rgba(0,245,155,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                    Play Word Connect
                  </button>
                </div>
              </article>

              {/* Concept Ninja */}
              <article className="cyber-panel rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group border-blue-500/20 hover:border-[#3b82f6] hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.4)]">
                <div className="space-y-5">
                  <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-[#0c183b] to-[#080d1a] border border-blue-500/30 flex items-center justify-center overflow-hidden group-hover:border-blue-400 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                      <img src="/src/assets/Logos/concept_ninja.png" alt="Concept Ninja" className="h-20 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transform group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#3b82f6] transition-colors">Concept Ninja</h3>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                      Slice. Think. Master. Rapidly slice the correct flying concepts.
                    </p>
                  </div>
                </div>
                <div className="pt-5 mt-auto">
                  <button onClick={() => window.location.href = '/math-ninja'} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_25px_-5px_rgba(59,130,246,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                    Play Concept Ninja
                  </button>
                </div>
              </article>

              {/* Bingo Bonanza */}
              <article className="cyber-panel rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group border-pink-500/20 hover:border-[#ff007f] hover:shadow-[0_0_25px_-5px_rgba(255,0,127,0.4)]">
                <div className="space-y-5">
                  <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-[#240e21] to-[#080d1a] border border-pink-500/30 flex items-center justify-center overflow-hidden group-hover:border-pink-400 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,0,127,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                      <img src="/src/assets/Logos/bingo_bonanaza.png" alt="Bingo Bonanza" className="h-20 object-contain drop-shadow-[0_0_15px_rgba(255,0,127,0.8)] transform group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#ff007f] transition-colors">Bingo Bonanza</h3>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                      Drag and drop cards to their perfect match in this 3x3 immaculate grid challenge!
                    </p>
                  </div>
                </div>
                <div className="pt-5 mt-auto">
                  <button onClick={() => window.location.href = '/algo-bingo'} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_25px_-5px_rgba(255,0,127,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                    Play Bingo Bonanza
                  </button>
                </div>
              </article>

              {/* Whos That */}
              <article className="cyber-panel rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group border-purple-500/20 hover:border-[#c792f2] hover:shadow-[0_0_25px_-5px_rgba(199,146,242,0.4)]">
                <div className="space-y-5">
                  <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-[#1c0c2e] to-[#080d1a] border border-purple-500/30 flex items-center justify-center overflow-hidden group-hover:border-purple-400 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(199,146,242,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                       <img src="/src/assets/Logos/whose_that.png" alt="Who's That?!" className="h-20 object-contain drop-shadow-[0_0_15px_rgba(199,146,242,0.8)] transform group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#c792f2] transition-colors">Who's That?!</h3>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                     Guess the legend from their portrait!
                    </p>
                  </div>
                </div>
                <div className="pt-5 mt-auto">
                  <button onClick={() => window.location.href = '/whos-that'} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#c792f2] to-purple-600 hover:from-purple-400 hover:to-purple-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_25px_-5px_rgba(199,146,242,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                    Play Who's That?!
                  </button>
                </div>
              </article>

              {/* Knife Hit */}
              <article className="cyber-panel rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group border-amber-500/20 hover:border-[#F59E0B] hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]">
                <div className="space-y-5">
                  <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-[#2a1a00] to-[#080d1a] border border-amber-500/30 flex items-center justify-center overflow-hidden group-hover:border-amber-400 transition-colors">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                      <div className="h-20 flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="h-20 w-auto drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] transform group-hover:scale-110 transition-transform">
                          <circle cx="32" cy="32" r="14" fill="none" stroke="#F59E0B" strokeWidth="2" />
                          <circle cx="32" cy="32" r="8" fill="none" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
                          <circle cx="32" cy="32" r="3" fill="#FBBF24" />
                          <line x1="32" y1="18" x2="32" y2="6" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="32" cy="5" r="4" fill="#EF4444" />
                          <line x1="32" y1="46" x2="32" y2="58" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="32" cy="61" r="4" fill="#EF4444" />
                          <line x1="18" y1="32" x2="6" y2="32" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="3" cy="32" r="4" fill="#EF4444" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#F59E0B] transition-colors">Knife Hit(BETA Version)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                      Throw knives at the rotating target without hitting another knife. How far can you get?
                    </p>
                  </div>
                </div>
                <div className="pt-5 mt-auto">
                  <button onClick={() => window.location.href = '/knife-hit'} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                    Play Knife Hit
                  </button>
                </div>
              </article>
            </div>
          </section>
        </main>
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
  
  const currentLevelLabel = currentQuestionIndex < 5 ? 'EASY LEVEL' : currentQuestionIndex < 10 ? 'MEDIUM LEVEL' : currentQuestionIndex < 15 ? 'HARD LEVEL' : 'EXPERT LEVEL';
  const currentPrize = pointsLadder[currentQuestionIndex];
  const safePrize = currentQuestionIndex > 0 ? pointsLadder[currentQuestionIndex - 1] : '0';

  return (
    <div className="flex-1 w-full flex flex-col justify-between overflow-x-hidden relative selection:bg-cyan-500 selection:text-black min-h-screen text-slate-100 font-sans" style={{ backgroundColor: '#030612', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(26, 42, 108, 0.45) 0%, transparent 60%), radial-gradient(circle at 10% 85%, rgba(255, 0, 122, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.12) 0%, transparent 40%), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)', backgroundSize: '100% 100%, 100% 100%, 100% 100%, 36px 36px' }}>
      
      {/* Subtle Stage Spotlight Beams */}
      <div className="absolute -top-[120px] left-[15%] w-[250px] h-[700px] pointer-events-none blur-[40px] opacity-70" style={{ background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.12) 0%, transparent 80%)', transform: 'rotate(-25deg)' }}></div>
      <div className="absolute -top-[120px] right-[15%] w-[250px] h-[700px] pointer-events-none blur-[40px] opacity-70" style={{ background: 'linear-gradient(180deg, rgba(255, 184, 0, 0.1) 0%, transparent 80%)', transform: 'rotate(25deg)' }}></div>
      
      {/* BEGIN: TopHeader */}
      <header className="relative z-30 w-full px-4 md:px-6 py-4 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button onClick={() => setGameState('intro')} aria-label="Go Back" className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600/60 shadow-[0_6px_0_#0f172a,0_12px_25px_rgba(0,0,0,0.6)] flex items-center justify-center hover:border-cyan-400 active:translate-y-0.5 transition-all text-cyan-300">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
            </button>
            
            <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 gap-1">
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>SFX ON
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white">ARENA 4K</button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 p-0.5 shadow-[0_0_25px_rgba(255,184,0,0.5),inset_0_0_12px_rgba(255,232,117,0.25)] flex items-center justify-center hidden sm:flex">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(255,184,0,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-3V2H8v2H5a2 2 0 0 0-2 2v2a7 7 0 0 0 6.13 6.92A6 6 0 0 0 11 17.91V20H7v2h10v-2h-4v-2.09a6 6 0 0 0 1.87-2.99A7 7 0 0 0 21 8V6a2 2 0 0 0-2-2m-14 4V6h3v4.67A5 5 0 0 1 5 8m14 0a5 5 0 0 1-3 2.67V6h3z"></path></svg>
              </div>
            </div>
            <div className="text-left text-center sm:text-left">
              <h1 className="font-black text-lg md:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">KAUN BANEGA CHAMPION</h1>
              <p className="text-[9px] md:text-[10px] tracking-[0.25em] text-cyan-400 font-semibold uppercase -mt-0.5">PRO SHOWDOWN ARENA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 hidden sm:flex">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest leading-none">BANKED REWARD</span>
                <span className="font-black text-lg text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]">₹ {safePrize}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-20 flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LeftGameArenaStage (Cols 1-8) */}
        <section className="lg:col-span-8 flex flex-col gap-5 w-full">
          
          {/* Top Stage HUD */}
          <div className="rounded-2xl p-4 md:p-5 flex items-center justify-between relative overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(14, 21, 52, 0.85) 0%, rgba(6, 10, 28, 0.95) 100%)', border: '1px solid rgba(0, 240, 255, 0.22)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(16px)' }}>
            
            <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.8),0_0_4px_rgba(255,184,0,0.6)]" style={{ background: 'radial-gradient(circle at 30% 30%, #FFE875, #B45309)' }}></div>
            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.8),0_0_4px_rgba(255,184,0,0.6)]" style={{ background: 'radial-gradient(circle at 30% 30%, #FFE875, #B45309)' }}></div>
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.8),0_0_4px_rgba(255,184,0,0.6)]" style={{ background: 'radial-gradient(circle at 30% 30%, #FFE875, #B45309)' }}></div>
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.8),0_0_4px_rgba(255,184,0,0.6)]" style={{ background: 'radial-gradient(circle at 30% 30%, #FFE875, #B45309)' }}></div>
            
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-pink-500/20 text-pink-400 border border-pink-500/40 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>LIVE ROUND
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">LEVEL {currentQuestionIndex + 1} OF 20</span>
              </div>
              <h2 className="font-black text-xl md:text-2xl tracking-wide text-white flex items-baseline gap-2">
                <span className="text-pink-500 drop-shadow-[0_0_8px_rgba(255,0,122,0.6)] uppercase">QUESTION {(currentQuestionIndex + 1).toString().padStart(2, '0')}</span>
              </h2>
            </div>
            
            <div className="hidden md:flex flex-col items-center w-1/3">
              <div className="flex justify-between w-full text-[11px] text-slate-400 uppercase font-semibold mb-1">
                <span>START</span>
                <span className="text-amber-400 font-bold">SAFE (Q5)</span>
                <span>JACKPOT</span>
              </div>
              <div className="w-full h-3 bg-slate-900 border border-slate-700/80 rounded-full p-0.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.8)] relative" style={{ width: `${Math.max(5, progressPercent)}%` }}>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-sm"></span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" fill="transparent" r="25" stroke="rgba(255,255,255,0.08)" strokeWidth="4"></circle>
                  <circle className="drop-shadow-[0_0_8px_rgba(255,0,122,0.9)]" cx="30" cy="30" fill="transparent" r="25" stroke="#FF007A" strokeDasharray="157" strokeDashoffset={timeLeft !== null ? 157 - (157 * (timeLeft / (currentQuestionIndex < 5 ? 30 : currentQuestionIndex < 10 ? 45 : 60))) : 0} strokeLinecap="round" strokeWidth="4.5" style={{ transition: 'stroke-dashoffset 1s linear' }}></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-black text-lg md:text-xl text-pink-400 leading-none drop-shadow-[0_0_6px_rgba(255,0,122,0.8)]">{timeLeft !== null ? timeLeft : '∞'}</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-tighter uppercase">SEC</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* ActiveQuestionMarqueeBox */}
          <div className="rounded-3xl p-6 md:p-8 relative overflow-hidden border border-cyan-500/30 shadow-[0_0_35px_rgba(0,0,0,0.85)]" style={{ background: 'linear-gradient(145deg, rgba(14, 21, 52, 0.85) 0%, rgba(6, 10, 28, 0.95) 100%)' }}>
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-cyan-500/15 blur-3xl pointer-events-none"></div>
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', backgroundSize: '100% 4px' }}></div>
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]"></span>{currentLevelLabel}
              </span>
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                <span>WORTH:</span><span className="text-amber-400">₹ {currentPrize}</span>
              </div>
            </div>
            
            <div className="relative z-10 py-2 md:py-4 text-center">
              <h3 className="font-extrabold text-2xl md:text-3xl lg:text-4xl text-white tracking-normal leading-snug drop-shadow-md">
                {activeQuestion.question}
              </h3>
            </div>
            
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60"></div>
          </div>
          
          {/* LifelinePowerUpDock */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={useFiftyFifty}
              disabled={lifelines.fiftyFifty.used || currentQuestionIndex < 7}
              className={`group relative p-3 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border shadow-[0_6px_0_#0f172a,0_12px_25px_rgba(0,0,0,0.6)] text-left overflow-hidden transition-all ${lifelines.fiftyFifty.used || currentQuestionIndex < 7 ? 'opacity-50 cursor-not-allowed border-slate-700/50' : 'border-cyan-500/50 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.45)] active:translate-y-1'}`}
            >
              <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-cyan-500/10 rounded-full blur-lg"></div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">{currentQuestionIndex < 7 ? 'LOCKED' : 'LIFELINE'}</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F0FF] animate-pulse"></span>
              </div>
              <div className="font-black text-base md:text-lg text-white group-hover:text-cyan-200 tracking-wide">50:50</div>
              <div className="text-[10px] text-cyan-400/70 font-semibold tracking-wider uppercase mt-0.5">{currentQuestionIndex < 7 ? 'UNLOCKS AT Q8' : '2 WRONG CLEARED'}</div>
            </button>
            
            <button 
              onClick={useSwap}
              disabled={lifelines.swap.used || currentQuestionIndex < 10}
              className={`group relative p-3 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border shadow-[0_6px_0_#0f172a,0_12px_25px_rgba(0,0,0,0.6)] text-left overflow-hidden transition-all ${lifelines.swap.used || currentQuestionIndex < 10 ? 'opacity-50 cursor-not-allowed border-slate-700/50' : 'border-purple-500/50 hover:border-purple-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:translate-y-1'}`}
            >
              <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-purple-500/10 rounded-full blur-lg"></div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{currentQuestionIndex < 10 ? 'LOCKED' : 'POWER UP'}</span>
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#C084FC]"></span>
              </div>
              <div className="font-black text-base md:text-lg text-white group-hover:text-purple-200 tracking-wide">SWAP QUESTION</div>
              <div className="text-[10px] text-purple-400/70 font-semibold tracking-wider uppercase mt-0.5">{currentQuestionIndex < 10 ? 'UNLOCKS AT Q11' : 'NEW QUESTION'}</div>
            </button>
          </div>
          
          {/* InteractiveAnswerGrid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {activeQuestion.options.map((option, idx) => {
              const isEliminated = eliminatedOptions.includes(idx);
              const isSelected = selectedOption === idx;
              
              let wrapStyle = "bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border-slate-700/80 shadow-[0_6px_0_#0f172a,0_12px_25px_rgba(0,0,0,0.6)] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(0,240,255,0.35),inset_0_0_15px_rgba(0,240,255,0.15)] hover:border-[#00F0FF] active:translate-y-px";
              let letterPod = "bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600 text-cyan-400 group-hover:border-cyan-400 group-hover:text-cyan-300";
              let dotStyle = "border-slate-600 group-hover:border-cyan-400";
              
              if (isSelected) {
                if (isCorrect === null) {
                  wrapStyle = "bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-400 shadow-[0_0_30px_rgba(255,184,0,0.45),inset_0_0_15px_rgba(255,232,117,0.3)] border-2 scale-[1.01]";
                  letterPod = "bg-gradient-to-b from-amber-400 to-yellow-600 border-amber-200 text-slate-950";
                  dotStyle = "border-amber-400 bg-amber-400";
                } else if (isCorrect) {
                  wrapStyle = "bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.45),inset_0_0_15px_rgba(16,185,129,0.3)] border-2 scale-[1.01]";
                  letterPod = "bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-200 text-slate-950";
                  dotStyle = "border-emerald-400 bg-emerald-400";
                } else {
                  wrapStyle = "bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.45)] border-2";
                  letterPod = "bg-gradient-to-b from-red-500 to-red-600 border-red-300 text-slate-950";
                  dotStyle = "border-red-500 bg-red-500";
                }
              } else if (selectedOption !== null && idx === activeQuestion.answer && isCorrect === false) {
                wrapStyle = "bg-emerald-500/10 border-emerald-500/50 border-2";
                letterPod = "bg-emerald-500/20 text-emerald-400";
                dotStyle = "border-emerald-500";
              }
              
              if (isEliminated) {
                return (
                  <div key={idx} className="rounded-2xl p-4 border border-transparent flex items-center gap-4 text-left opacity-20 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center font-black text-base text-slate-500">{optionLetters[idx]}</div>
                  </div>
                );
              }

              return (
                <div key={idx} onClick={() => handleOptionClick(idx)} className={`group rounded-2xl p-4 flex items-center justify-between transition-all border ${wrapStyle}`} style={selectedOption === null ? { transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)' } : {}}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-base shadow-inner transition-colors ${letterPod}`}>
                      {optionLetters[idx]}
                    </div>
                    <div>
                      <span className={`font-bold text-lg ${isSelected ? (isCorrect === null ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(255,184,0,0.6)]' : isCorrect ? 'text-emerald-300' : 'text-red-300') : 'text-slate-200 group-hover:text-white'}`}>{option}</span>
                    </div>
                  </div>
                  {isSelected && isCorrect === null && (
                    <div className="flex items-center gap-1.5 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/40">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">SELECTED</span>
                    </div>
                  )}
                  {isSelected && isCorrect !== null && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isCorrect ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300' : 'bg-red-500/20 border-red-500/40 text-red-300'}`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">{isCorrect ? 'CORRECT' : 'INCORRECT'}</span>
                    </div>
                  )}
                  {!isSelected && (
                    <div className={`w-3 h-3 rounded-full border ${dotStyle}`}></div>
                  )}
                </div>
              );
            })}
          </div>
          
        </section>
        
        {/* Right Sidebar: Points Tower (Cols 9-12) */}
        <aside className="lg:col-span-4 flex flex-col h-full w-full max-w-sm mx-auto lg:max-w-none">
          <div className="rounded-3xl p-5 border border-cyan-500/25 relative shadow-2xl flex flex-col h-full flex-1" style={{ background: 'linear-gradient(145deg, rgba(14, 21, 52, 0.85) 0%, rgba(6, 10, 28, 0.95) 100%)', backdropFilter: 'blur(16px)' }}>
            <div className="absolute top-3 left-3 w-2 h-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.8),0_0_4px_rgba(255,184,0,0.6)]" style={{ background: 'radial-gradient(circle at 30% 30%, #FFE875, #B45309)' }}></div>
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.8),0_0_4px_rgba(255,184,0,0.6)]" style={{ background: 'radial-gradient(circle at 30% 30%, #FFE875, #B45309)' }}></div>
            
            <div className="border-b border-slate-700/80 pb-4 mb-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-amber-400 text-sm">✦</span>
                <h3 className="font-black text-base uppercase tracking-[0.2em] text-white">POINTS LADDER</h3>
                <span className="text-amber-400 text-sm">✦</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col-reverse gap-1 pr-1">
              {pointsLadder.map((points, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isPassed = idx < currentQuestionIndex;
                const isSafeHaven = (idx + 1) === 5 || (idx + 1) === 10 || (idx + 1) === 15;
                const isFinal = idx === 19;
                
                if (isCurrent) {
                  return (
                    <div key={idx} className="relative rounded-xl px-3.5 py-2 flex items-center justify-between bg-gradient-to-r from-cyan-500/30 via-cyan-500/10 to-transparent border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.45),inset_0_0_10px_rgba(0,240,255,0.2)]" style={{ animation: 'pulseRing 2.4s infinite ease-in-out' }}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF] animate-ping"></span>
                        <span className="font-black text-cyan-300 text-sm">Q{idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-cyan-300 text-base">₹ {points}</span>
                        <span className="text-cyan-400 font-bold text-xs">◀</span>
                      </div>
                    </div>
                  );
                } else if (isSafeHaven || isFinal) {
                  return (
                    <div key={idx} className={`rounded-xl px-3 py-1.5 flex items-center justify-between font-bold border ${isPassed ? 'border-amber-600/40 opacity-70' : 'border-amber-400/40 shadow-[0_0_15px_rgba(255,184,0,0.15)]'}`} style={{ background: 'linear-gradient(90deg, rgba(255, 184, 0, 0.18) 0%, rgba(255, 184, 0, 0.04) 100%)', borderLeft: '3px solid #FFB800' }}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${isPassed ? 'text-amber-600' : 'text-amber-400'}`}>★</span>
                        <span className={`font-extrabold ${isPassed ? 'text-amber-600' : 'text-amber-200'}`}>{idx + 1}</span>
                      </div>
                      <span className={`font-black text-base ${isPassed ? 'text-amber-600' : 'text-amber-300 drop-shadow-[0_0_8px_rgba(255,184,0,0.6)]'}`}>₹ {points}</span>
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="px-3 py-1 rounded-lg flex items-center justify-between hover:bg-slate-800/40">
                      <span className={`font-semibold ${isPassed ? 'text-emerald-700' : 'text-slate-500'}`}>{idx + 1}</span>
                      <span className={`font-medium ${isPassed ? 'text-emerald-700' : 'text-slate-300'}`}>₹ {points}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
