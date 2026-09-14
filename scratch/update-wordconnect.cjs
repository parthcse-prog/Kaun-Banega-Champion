const fs = require('fs');
const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WordConnect/WordConnect.jsx';
let content = fs.readFileSync(path, 'utf8');

// I need to change how `questions` is set inside `useEffect`.
// Originally:
/*
  useEffect(() => {
    if (cseQuestions.length > 0) {
      initPuzzle(cseQuestions[0].answer);
    }
  }, []);
*/

const oldUseEffect = `  useEffect(() => {
    if (cseQuestions.length > 0) {
      initPuzzle(cseQuestions[0].answer);
    }
  }, []);`;

const newUseEffect = `  useEffect(() => {
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
  }, []);`;

content = content.replace(oldUseEffect, newUseEffect);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated WordConnect.jsx to fetch from backend");
