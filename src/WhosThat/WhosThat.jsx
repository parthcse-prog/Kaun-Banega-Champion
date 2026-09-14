import React, { useState, useEffect } from 'react';
import './WhosThat.css';
import { saveGameAnalytics } from '../utils/analyticsStore';

const DEFAULT_PEOPLE = [
  { name: "Mark Zuckerberg", initials: "MZ", color: "#5a7ee6", hint: "Co-founded a social network from his Harvard dorm room in 2004; the company later renamed itself Meta." },
  { name: "Bill Gates", initials: "BG", color: "#6fcf97", hint: "Co-founded Microsoft and played a major role in the personal computer revolution." },
  { name: "Elon Musk", initials: "EM", color: "#c792f2", hint: "Runs an electric car company and a rocket company, and also owns the platform X (formerly Twitter)." },
  { name: "Sundar Pichai", initials: "SP", color: "#e6685a", hint: "The current CEO of Google and Alphabet Inc., who led the development of the Chrome browser." },
  { name: "Satya Nadella", initials: "SN", color: "#5aa9e6", hint: "Current CEO of Microsoft, widely credited with transforming the company's culture and pivoting it toward cloud computing." },
  { name: "Sam Altman", initials: "SA", color: "#e6b05a", hint: "CEO of a company known for building ChatGPT, and once testified before the US Congress about AI regulation." },
  { name: "Linus Torvalds", initials: "LT", color: "#6fcf97", hint: "Created the Linux kernel and the version control system Git." },
  { name: "Alan Turing", initials: "AT", color: "#c792f2", hint: "Considered the father of theoretical computer science and artificial intelligence; played a crucial role in cracking the Enigma code." },
  { name: "Ada Lovelace", initials: "AL", color: "#e6685a", hint: "Often recognized as the world's first computer programmer for her work on Charles Babbage's Analytical Engine." },
  { name: "James Gosling", initials: "JG", color: "#5a7ee6", hint: "Known as the father of the Java programming language." }
];

const MAX_ATTEMPTS = 4;
const TIME_LIMIT = 60; // 60 seconds per round

function accepted(person) {
  const parts = person.name.toLowerCase().split(' ');
  return [person.name.toLowerCase(), parts[parts.length - 1]];
}

function normalize(s) {
  return s.toLowerCase().trim().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');
}

async function fetchWikipediaImage(title) {
  let lastError = null;
  const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  try {
    const res = await fetch(restUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail && data.thumbnail.source) return { url: data.thumbnail.source, error: null };
      lastError = 'REST endpoint returned no thumbnail';
    } else {
      lastError = `REST endpoint responded ${res.status}`;
    }
  } catch (err) {
    lastError = `REST fetch failed: ${err.message}`;
  }

  try {
    const actionUrl = `https://en.wikipedia.org/w/api.php?action=query&redirects=1&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const res = await fetch(actionUrl);
    if (!res.ok) { lastError = `Action API responded ${res.status}`; return { url: null, error: lastError }; }
    const data = await res.json();
    const pages = data && data.query && data.query.pages;
    const page = pages && Object.values(pages)[0];
    if (page && page.thumbnail && page.thumbnail.source) return { url: page.thumbnail.source, error: null };
    lastError = 'Action API returned no thumbnail';
    return { url: null, error: lastError };
  } catch (err) {
    return { url: null, error: `Action fetch failed: ${err.message}` };
  }
}

export default function WhosThat() {
  const [people, setPeople] = useState([]);
  const [order, setOrder] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: 'neutral' });
  
  const [photoData, setPhotoData] = useState({ url: null, error: null, loading: false, loaded: false });
  const [shake, setShake] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  useEffect(() => {
    if (isGameFinished) {
      const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
      const isWin = score === (order.length || DEFAULT_PEOPLE.length);
      saveGameAnalytics("Who's That?!", score, timePlayed, isWin);
    }
  }, [isGameFinished]);

  useEffect(() => {
    const initGame = async () => {
      let fetchedPeople = DEFAULT_PEOPLE;
      try {
        const res = await fetch('http://localhost:5000/api/whosthat/cs');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) fetchedPeople = data;
        }
      } catch (err) {
        console.warn("Using local who's that fallback");
      }
      
      const shuffledIndices = fetchedPeople.map((_, i) => i).sort(() => Math.random() - 0.5);
      setPeople(fetchedPeople);
      setOrder(shuffledIndices);
      setGameStartTime(Date.now());
    };
    initGame();
  }, []);

  useEffect(() => {
    if (people.length === 0 || roundOver || isGameFinished) return;
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      handleGiveUp("Time's up! Out of time.");
    }
  }, [timeLeft, roundOver, isGameFinished, people]);

  const currentPerson = people.length > 0 && order.length > 0 ? people[order[roundIndex]] : null;

  useEffect(() => {
    if (!currentPerson || isGameFinished) return;
    let isSubscribed = true;
    setPhotoData({ url: null, error: null, loading: true, loaded: false });
    
    const loadPhoto = async () => {
      if (currentPerson.imageUrl !== undefined) {
        if (isSubscribed) setPhotoData({ url: currentPerson.imageUrl, error: currentPerson.imageError, loading: false, loaded: false });
      } else {
        const result = await fetchWikipediaImage(currentPerson.wikiTitle || currentPerson.name);
        currentPerson.imageUrl = result.url;
        currentPerson.imageError = result.error;
        if (isSubscribed) setPhotoData({ url: result.url, error: result.error, loading: false, loaded: false });
      }
    };
    loadPhoto();
    
    return () => { isSubscribed = false; };
  }, [roundIndex, currentPerson, isGameFinished]);

  if (people.length === 0) return <div className="whos-that-bg text-white min-h-screen flex items-center justify-center text-xl lg:text-3xl">Loading...</div>;

  const handleGuess = () => {
    if (roundOver) return;
    const raw = guess;
    if (!raw.trim()) return;
    const normalizedGuess = normalize(raw);
    const isCorrect = accepted(currentPerson).some(a => normalizedGuess === a || normalizedGuess.includes(a));

    if (isCorrect) {
      setScore(s => s + 1);
      revealAnswer(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setFeedback({ text: "L take — out of guesses. Here's who it was.", type: 'bad' });
        revealAnswer(false);
      } else {
        setFeedback({ text: `Not quite. ${MAX_ATTEMPTS - newAttempts} guess${MAX_ATTEMPTS - newAttempts === 1 ? '' : 'es'} left.`, type: 'bad' });
        setGuess('');
      }
    }
  };

  const handleGiveUp = (customMsg) => {
    if (roundOver) return;
    setFeedback({ text: customMsg || "Gave up. Here is the answer.", type: 'bad' });
    revealAnswer(false);
  };

  const revealAnswer = (wasCorrect) => {
    setRoundOver(true);
    if (wasCorrect) {
      setFeedback({ text: `That's a W — it's ${currentPerson.name}! 🔥`, type: 'good' });
    }
  };

  const nextRound = () => {
    if (roundIndex + 1 >= order.length) {
      setIsGameFinished(true);
    } else {
      setRoundIndex(r => r + 1);
      setAttempts(0);
      setRoundOver(false);
      setGuess('');
      setFeedback({ text: '', type: 'neutral' });
      setTimeLeft(TIME_LIMIT);
    }
  };

  const replay = () => {
    setOrder(order.sort(() => Math.random() - 0.5));
    setRoundIndex(0);
    setScore(0);
    setAttempts(0);
    setRoundOver(false);
    setIsGameFinished(false);
    setGuess('');
    setFeedback({ text: '', type: 'neutral' });
    setTimeLeft(TIME_LIMIT);
    setGameStartTime(Date.now());
  };

  const blurLevels = [6, 4, 2.5, 1];
  const currentBlur = blurLevels[Math.min(attempts, blurLevels.length - 1)];

  return (
    <div className="whos-that-bg min-h-screen text-slate-100 font-sans antialiased overflow-x-hidden flex flex-col justify-between selection:bg-[#34d399] selection:text-black">
      
      <main className="flex-1 max-w-2xl lg:max-w-4xl w-full mx-auto px-4 pt-8 pb-6 flex flex-col justify-center relative z-20">
        
        <div className="text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center space-x-2 mb-3 lg:mb-4">
            <img src="/src/assets/Logos/whose_that.png" alt="Who's That?!" className="h-16 sm:h-20 lg:h-28 object-contain drop-shadow-[0_2px_15px_rgba(168,85,247,0.6)]" />
          </div>
          <p className="text-sm sm:text-base lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real portraits pulled live from Wikipedia, blurred to oblivion — name's hidden too. Drop your guess below, no Googling 👀.
          </p>
        </div>

        {!isGameFinished && (
          <div className="bg-[#121222]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 lg:p-6 border border-[#2a2a46] mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-3 text-sm lg:text-lg font-mono">
              <div className="flex items-center space-x-1.5 lg:space-x-3">
                <span className="text-slate-400">Score:</span>
                <span className="text-[#34d399] font-bold text-base lg:text-xl">{score}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400 text-base lg:text-xl">{roundOver ? roundIndex + 1 : roundIndex}</span>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3 bg-[#0a0a14]/90 px-4 py-1.5 lg:py-2 rounded-lg border border-purple-500/30">
                <span className="relative flex h-3 w-3 lg:h-4 lg:w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 lg:h-4 lg:w-4 bg-red-500"></span>
                </span>
                <span className="font-mono font-bold text-sm lg:text-lg tracking-wider text-rose-300">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="text-slate-400">
                <span>Round <strong className="text-slate-200">{roundIndex + 1}</strong> of {order.length}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-10 gap-1.5 lg:gap-2 pt-2">
              {order.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 lg:h-3 rounded-full ${i < roundIndex ? 'bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : i === roundIndex ? 'bg-[#34d399] animate-pulse shadow-[0_0_12px_#34d399]' : 'bg-slate-800'}`} 
                />
              ))}
            </div>
          </div>
        )}

        {isGameFinished ? (
          <section className="bg-[#18182b]/95 rounded-3xl p-10 lg:p-14 border border-[#2a2a46]/80 neon-violet-glow relative overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-2xl text-center">
            <h2 className="font-mono text-5xl lg:text-7xl mb-6 text-[#34d399]">{score} / {order.length}</h2>
            <p className="text-lg lg:text-2xl text-slate-400 mb-10">{score === order.length ? "Perfect score — absolute legend, no cap." : score === 0 ? "Rough round, it happens — run it back." : "Solid — not bad, not bad."}</p>
            <button 
              className="px-8 py-5 lg:py-6 rounded-2xl bg-purple-600/80 hover:bg-purple-600 border border-purple-400/40 text-white font-mono font-bold text-lg lg:text-2xl transition flex items-center justify-center space-x-3 shadow-lg shadow-purple-900/30 active:scale-95 w-full" 
              onClick={replay}
            >
              Run it back
            </button>
          </section>
        ) : (
          <section className="bg-[#18182b]/95 rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#2a2a46]/80 neon-violet-glow relative overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-2xl">
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 lg:w-72 lg:h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center justify-center relative mb-6 lg:mb-8">
              <div className={`w-40 h-40 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full p-1.5 lg:p-2 bg-gradient-to-tr from-[#34d399] via-violet-500 to-indigo-500 flex items-center justify-center ${roundOver ? '' : 'animate-pulse-glow'} ${shake ? 'whos-that-shake' : ''}`}>
                <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-900 border-4 border-slate-950 flex items-center justify-center shadow-inner">
                  {!photoData.loaded && (
                    <svg className="w-20 h-20 lg:w-32 lg:h-32 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
                    </svg>
                  )}
                  {photoData.url && (
                    <img 
                      className="w-full h-full object-cover object-top scale-110 transition-all duration-500 ease-out filter" 
                      src={photoData.url} 
                      alt="" 
                      style={{ 
                        display: photoData.loaded ? 'block' : 'none',
                        filter: roundOver ? 'none' : `blur(${currentBlur * 1.5}px) grayscale(1)`
                      }}
                      onLoad={() => setPhotoData(p => ({ ...p, loaded: true }))}
                      onError={() => setPhotoData(p => ({ ...p, error: 'Failed to load img', url: null }))}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
                  
                  {roundOver && !photoData.url && (
                    <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-5xl lg:text-7xl text-[#14121c]" style={{ background: currentPerson.color }}>
                      {currentPerson.initials}
                    </div>
                  )}
                </div>
              </div>
              
              {roundOver && (
                <div className="mt-6 lg:mt-8 text-center">
                  <h2 className="font-mono font-bold text-2xl sm:text-3xl lg:text-4xl text-[#34d399] tracking-wide drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                    {currentPerson.name}
                  </h2>
                </div>
              )}
            </div>

            <div className="bg-[#121222]/90 rounded-2xl p-4 sm:p-5 lg:p-6 border border-[#2a2a46]/60 mb-6 lg:mb-8 transition hover:border-violet-500/30">
              <div className="flex items-start space-x-3 lg:space-x-4">
                <span className="text-amber-300 text-lg lg:text-2xl mt-0.5 lg:mt-0 flex-shrink-0">💡</span>
                <div className="text-sm sm:text-base lg:text-xl text-slate-300 leading-relaxed">
                  <strong className="text-amber-200 font-semibold font-mono mr-2">Hint:</strong> 
                  {currentPerson.hint}
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 lg:pl-5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-12 lg:pl-14 pr-5 py-3 sm:py-4 lg:py-5 bg-[#121222]/90 border border-[#2a2a46] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] text-white text-sm sm:text-base lg:text-xl rounded-2xl placeholder-slate-500 transition shadow-inner font-sans outline-none" 
                    placeholder="Guess person's name..." 
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGuess()}
                    disabled={roundOver}
                    spellCheck="false"
                  />
                </div>
                <button 
                  className="px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-2xl bg-purple-600/80 hover:bg-purple-600 border border-purple-400/40 text-white font-mono font-bold text-sm sm:text-base lg:text-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/30 active:scale-95 disabled:opacity-50" 
                  onClick={handleGuess} 
                  disabled={roundOver}
                >
                  <span>Guess</span>
                  <kbd className="hidden sm:inline text-xs lg:text-sm opacity-70 bg-purple-950 px-2 py-1 rounded border border-purple-400/30">↵</kbd>
                </button>
              </div>

              {feedback.text && (
                <div className={`flex items-center justify-center space-x-3 py-3 lg:py-4 px-4 lg:px-5 rounded-2xl border text-sm sm:text-base lg:text-lg font-semibold font-mono ${feedback.type === 'good' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 animate-bounce-gentle' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                  <span className="text-lg lg:text-2xl">{feedback.type === 'good' ? '🔥' : '❌'}</span>
                  <span>{feedback.text}</span>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-3 lg:space-x-4 text-xs lg:text-base font-mono text-slate-400 pt-2 lg:pt-3">
                <span>Attempts:</span>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <span key={i} className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${i < attempts ? 'bg-[#34d399] shadow-[0_0_8px_#34d399]' : 'bg-slate-700/80'}`} title={`Attempt ${i + 1}`}></span>
                  ))}
                </div>
              </div>

              {roundOver ? (
                <button 
                  className="w-full mt-4 lg:mt-6 py-4 sm:py-5 lg:py-6 px-6 lg:px-8 rounded-2xl bg-gradient-to-r from-emerald-400 via-[#34d399] to-teal-400 text-slate-950 font-bold font-mono text-base sm:text-lg lg:text-2xl tracking-wide flex items-center justify-center space-x-3 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_28px_rgba(52,211,153,0.6)] hover:brightness-105 active:scale-[0.99] transition-all transform" 
                  onClick={nextRound}
                >
                  <span>{roundIndex + 1 >= order.length ? 'View Results' : 'Next round'}</span>
                  <svg className="w-5 h-5 lg:w-7 lg:h-7 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              ) : (
                <div className="mt-5 lg:mt-6 pt-4 lg:pt-5 border-t border-[#2a2a46]/40 flex items-center justify-center text-xs lg:text-base font-mono text-slate-400">
                  <button className="hover:text-rose-400 transition-colors" onClick={() => handleGiveUp()} type="button">
                    <span>Reveal Answer (-1 pt)</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
