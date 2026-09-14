const fs = require('fs');

const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/AlgoBingo/AlgoBingo.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state for allQuestions
const stateInjection = `  const [allQuestions, setAllQuestions] = useState([]);
  
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
      }
    };
    fetchQ();
  }, []);
`;

content = content.replace(
  `  useEffect(() => {\n    setContentSet(Storage.getContentSet(contentSetId));\n  }, []);`,
  `  useEffect(() => {\n    setContentSet(Storage.getContentSet(contentSetId));\n  }, []);\n\n${stateInjection}`
);

// 2. Modify startGame to take a specific question
const oldStartGame = `  const startGame = () => {
    const newSession = Storage.createSession(contentSetId, token || 'Anonymous');
    const newGrid = generateValidGrid(contentSet.categories, contentSet.items);`;

const newStartGame = `  const startGame = (question) => {
    const newSession = Storage.createSession(contentSetId, token || 'Anonymous');
    // If a specific question is provided (from the new JSON structure), use its gridConfig directly.
    // Otherwise fallback to generating one randomly using the legacy data.
    const newGrid = question ? question.gridConfig : generateValidGrid(contentSet.categories, contentSet.items);`;

content = content.replace(oldStartGame, newStartGame);

// 3. Modify the MENU rendering block to map over questions
const oldMenuBlock = `<div className="w-full max-w-2xl bg-gradient-to-b from-[#181f42] to-[#0d122b] border-2 border-indigo-600/40 p-8 rounded-[2rem] flex flex-col items-center mt-12 animate-in zoom-in-95 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
             <img src="/src/assets/Logos/bingo_bonanaza.png" alt="Bingo Bonanza" className="h-32 object-contain mb-6 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
             <h2 className="text-4xl md:text-5xl font-black text-white mb-4 text-center tracking-wider drop-shadow-md">BINGO BONANZA</h2>
             <p className="text-indigo-200 text-center mb-8 max-w-md text-lg font-medium leading-relaxed">
               Match drawn algorithms to their properties. Drag and drop 9 of the 11 algorithms to their perfect match in this 3x3 immaculate grid! Watch out for the 2 distractors!
             </p>
             <button 
               onClick={startGame}
               className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-600 border-t-2 border-yellow-100 border-b-4 border-amber-950 text-slate-950 font-black text-xl uppercase tracking-widest shadow-[0_6px_20px_rgba(251,191,36,0.5)] active:translate-y-1 active:border-b-0 transition-all"
             >
               START GAME
             </button>
          </div>`;

const newMenuBlock = `<div className="w-full max-w-4xl bg-gradient-to-b from-[#181f42] to-[#0d122b] border-2 border-indigo-600/40 p-8 rounded-[2rem] flex flex-col items-center mt-12 animate-in zoom-in-95 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
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
                     <div className="text-lg font-bold text-white leading-snug mb-4 flex-1">
                       {q.questionText}
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
          </div>`;

content = content.replace(oldMenuBlock, newMenuBlock);

// 4. Update the "PLAY AGAIN" / "TRY AGAIN" buttons to go back to MENU instead of immediately re-starting a random game
content = content.replace(
  `onClick={startGame}\n                 className="w-full py-4 rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-600`,
  `onClick={() => setGameState('MENU')}\n                 className="w-full py-4 rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-600`
);
content = content.replace(
  `onClick={startGame}\n                 className="w-full py-4 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-800`,
  `onClick={() => setGameState('MENU')}\n                 className="w-full py-4 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-800`
);

// We need to change the button text to "BACK TO MENU"
content = content.replace(
  />\n                 PLAY AGAIN\n               <\/button>/g,
  `>\n                 BACK TO MENU\n               </button>`
);
content = content.replace(
  />\n                 TRY AGAIN\n               <\/button>/g,
  `>\n                 BACK TO MENU\n               </button>`
);


fs.writeFileSync(path, content, 'utf8');
console.log("Updated AlgoBingo.jsx");
