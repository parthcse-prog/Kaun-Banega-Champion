const fs = require('fs');
const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/Dashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

const newGameCard = `

                {/* Whos That */}
                <article className="cyber-panel rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group border-purple-500/20 hover:border-[#c792f2] hover:shadow-[0_0_25px_-5px_rgba(199,146,242,0.4)]">
                  <div className="space-y-5">
                    <div className="relative w-full h-40 rounded-xl bg-gradient-to-b from-[#1c0c2e] to-[#080d1a] border border-purple-500/30 flex items-center justify-center overflow-hidden group-hover:border-purple-400 transition-colors">
                      <div className="absolute inset-0 bg-[radial-gradient(rgba(199,146,242,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                         <span className="text-4xl font-black text-[#c792f2] drop-shadow-[0_0_15px_rgba(199,146,242,0.8)] transform group-hover:scale-110 transition-transform">Who's That?!</span>
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
`;

// Find the string "Play Knife Hit" and the closing </article> after it
if (!content.includes("Who's That?!")) {
  const match = content.match(/Play Knife Hit[\s\S]*?<\/article>/);
  if (match) {
    content = content.replace(match[0], match[0] + newGameCard);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Dashboard.jsx updated with WhosThat card.");
  } else {
    console.error("Could not find Knife Hit article in Dashboard.jsx");
  }
} else {
  console.log("Whos That card already exists in Dashboard.jsx");
}
