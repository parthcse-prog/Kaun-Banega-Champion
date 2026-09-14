const fs = require('fs');
const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WordConnect/WordConnect.jsx';
let content = fs.readFileSync(path, 'utf8');

const doubleUseEffect = `  useEffect(() => {
    if (cseQuestions.length > 0) {
      initPuzzle(cseQuestions[0].answer);
    }
  }, []);

  useEffect(() => {
    if (cseQuestions.length > 0) {
      initPuzzle(cseQuestions[0].answer);
    }
  }, []);`;

const singleUseEffect = `  useEffect(() => {
    if (cseQuestions.length > 0) {
      initPuzzle(cseQuestions[0].answer);
    }
  }, []);`;

content = content.replace(doubleUseEffect, singleUseEffect);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed double useEffect");
