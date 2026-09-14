const fs = require('fs');

const dashPath = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/Dashboard.jsx';
let dashContent = fs.readFileSync(dashPath, 'utf8');

dashContent = dashContent.replace(
  `<span className="text-4xl font-black text-[#c792f2] drop-shadow-[0_0_15px_rgba(199,146,242,0.8)] transform group-hover:scale-110 transition-transform">Who's That?!</span>`,
  `<img src="/src/assets/Logos/whose_that.png" alt="Who's That?!" className="h-20 object-contain drop-shadow-[0_0_15px_rgba(199,146,242,0.8)] transform group-hover:scale-110 transition-transform" />`
);

fs.writeFileSync(dashPath, dashContent, 'utf8');
console.log("Updated Dashboard.jsx");

const gamePath = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WhosThat/WhosThat.jsx';
let gameContent = fs.readFileSync(gamePath, 'utf8');

gameContent = gameContent.replace(
  `<h1 className="font-mono font-black text-4xl sm:text-5xl lg:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-200 to-emerald-300 drop-shadow-[0_2px_12px_rgba(168,85,247,0.5)]">
              Who's that?!
            </h1>`,
  `<img src="/src/assets/Logos/whose_that.png" alt="Who's That?!" className="h-16 sm:h-20 lg:h-28 object-contain drop-shadow-[0_2px_15px_rgba(168,85,247,0.6)]" />`
);

fs.writeFileSync(gamePath, gameContent, 'utf8');
console.log("Updated WhosThat.jsx");
