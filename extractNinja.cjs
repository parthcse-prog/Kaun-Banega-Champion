const fs = require('fs');

const logPath = 'C:\\Users\\Govind\\.gemini\\antigravity\\brain\\43ee79a6-e2bd-48ce-99d2-9bec0d204625\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

const jsons = [];

for (const line of lines) {
  if (!line) continue;
  try {
    const parsed = JSON.parse(line);
    if (parsed.source === 'USER_EXPLICIT' && typeof parsed.content === 'string') {
      const text = parsed.content;
      
      // Look for [ { "question_id" ... ]
      let startIndex = text.indexOf('[');
      while (startIndex !== -1) {
        let endIndex = text.indexOf(']', startIndex);
        if (endIndex !== -1) {
          const possibleJson = text.substring(startIndex, endIndex + 1);
          try {
            const arr = JSON.parse(possibleJson);
            if (Array.isArray(arr) && arr.length > 0 && arr[0].question_id) {
              jsons.push(arr);
            }
          } catch(e) {}
        }
        startIndex = text.indexOf('[', startIndex + 1);
      }
    }
  } catch(e) {}
}

console.log("Extracted arrays of lengths:", jsons.map(a => a.length));

if (jsons.length >= 4) {
  fs.writeFileSync('src/sem1_ninja.json', JSON.stringify(jsons[0].filter(q => q.question_id >= 52 && q.question_id <= 65)));
  fs.writeFileSync('src/sem3_ninja.json', JSON.stringify(jsons[1].filter(q => q.question_id >= 52 && q.question_id <= 65)));
  fs.writeFileSync('src/sem5_ninja.json', JSON.stringify(jsons[2].filter(q => q.question_id >= 52 && q.question_id <= 65)));
  fs.writeFileSync('src/sem7_ninja.json', JSON.stringify(jsons[3].filter(q => q.question_id >= 52 && q.question_id <= 65)));
  console.log("Wrote semX_ninja.json files.");
}
