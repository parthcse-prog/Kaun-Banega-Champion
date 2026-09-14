const fs = require('fs');

const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/MathNinja/MathNinja.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add fetch logic in component body
const fetchLogic = `
  const [allQuestions, setAllQuestions] = useState(QUESTIONS);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  useEffect(() => {
    const fetchQ = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/conceptninja/cs');
        if(res.ok) {
          const data = await res.json();
          if(data && data.length > 0) {
            setAllQuestions(data);
          }
        }
      } catch(e) {
        console.warn("Using local questions");
      }
    };
    fetchQ();
  }, []);

  // Update next round logic
  const handleNextRound = () => {
    if (currentQIndex + 1 < allQuestions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      startGame(allQuestions[nextIdx]);
    } else {
      // Done with all questions, go to menu or loop
      setGameState('MENU');
      setCurrentQIndex(0);
    }
  };
`;

// Replace `const [gameState, setGameState] = useState('MENU');` with the new logic
content = content.replace(
  `const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, RESULTS`,
  `const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, RESULTS\n${fetchLogic}`
);

// 2. We need to modify the MENU state to show `allQuestions` instead of `QUESTIONS`
content = content.replace(
  /QUESTIONS\.map\(\(q, i\)/g,
  `allQuestions.map((q, i)`
);

// 3. We also need to capture the current question index when a user clicks a level, so handleNextRound works correctly.
content = content.replace(
  `onClick={() => startGame(q)}`,
  `onClick={() => { setCurrentQIndex(i); startGame(q); }}`
);

// 4. Update the RESULTS screen to have a "NEXT ROUND" button.
// Find the BACK TO MENU button block
const oldMenuBtn = `<button onClick={() => setGameState('MENU')} className="px-12 py-4 bg-slate-900 border-2 border-cyan-500/50 text-cyan-400 font-bold rounded-xl hover:bg-cyan-950 transition-colors tracking-widest font-tech flex items-center gap-2 group shadow-[0_0_15px_rgba(0,242,254,0.1)]">`;
const newMenuBtn = `<button onClick={handleNextRound} className="px-12 py-4 bg-slate-900 border-2 border-cyan-500/50 text-cyan-400 font-bold rounded-xl hover:bg-cyan-950 transition-colors tracking-widest font-tech flex items-center gap-2 group shadow-[0_0_15px_rgba(0,242,254,0.1)]">`;

content = content.replace(oldMenuBtn, newMenuBtn);

// Also replace the text inside the button from BACK TO MENU to NEXT ROUND
content = content.replace(
  `BACK TO MENU\n                 </button>`,
  `NEXT ROUND\n                 </button>`
);


fs.writeFileSync(path, content, 'utf8');
console.log("Updated MathNinja.jsx");
