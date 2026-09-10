import React, { useState, useEffect, useRef } from 'react';
import { SHAPES, conditionLesson } from './Data';
import { Zap, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

// --- UTILS ---
const BOARD_SIZE = 8;
const createEmptyBoard = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill({ filled: false, color: '', value: null }));

const getRandomShapes = (count = 3) => {
  return Array(count).fill(null).map(() => SHAPES[Math.floor(Math.random() * SHAPES.length)]);
};

export default function LogicBlast({ token }) {
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING
  const [userName, setUserName] = useState('Student');
  
  // Game State
  const [board, setBoard] = useState(createEmptyBoard());
  const [tray, setTray] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  // Educational State
  const [stageIdx, setStageIdx] = useState(0);
  const [clearsInStage, setClearsInStage] = useState(0);
  const [evaluationQueue, setEvaluationQueue] = useState([]); // Lines waiting to be evaluated visually
  const [predictionRequest, setPredictionRequest] = useState(null); // { value, resolve }
  
  const stage = conditionLesson.stages[stageIdx];
  
  // Drag State
  const gridRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { index, shape, clientX, clientY }
  const [hoverPos, setHoverPos] = useState(null); // { row, col, valid }

  // API Fetch
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://pi360.net/site/api/endpoints/api_student_profile.php?institute_id=mietjammu', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          const studentData = data?.student?.[0] || {};
          setUserName(studentData.FirstName || studentData.Name || 'Student');
        } else {
          setUserName('Student');
        }
      } catch (err) {
        setUserName('Student');
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Handle pointer events for dragging
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragging || !gridRef.current) return;
      
      const gridRect = gridRef.current.getBoundingClientRect();
      const cellSize = gridRect.width / BOARD_SIZE;
      
      // Calculate piece top-left based on touch/mouse pos
      // Offset it slightly above the cursor for visibility
      const pieceRows = dragging.shape.matrix.length;
      const pieceCols = dragging.shape.matrix[0].length;
      
      const px = e.clientX - (pieceCols * cellSize) / 2;
      const py = e.clientY - (pieceRows * cellSize) - (cellSize * 0.5); // Offset above
      
      const col = Math.round((px - gridRect.left) / cellSize);
      const row = Math.round((py - gridRect.top) / cellSize);
      
      setDragging(prev => ({ ...prev, clientX: e.clientX, clientY: e.clientY }));

      // Check boundaries and overlap
      if (row >= 0 && row + pieceRows <= BOARD_SIZE && col >= 0 && col + pieceCols <= BOARD_SIZE) {
        let valid = true;
        for (let r = 0; r < pieceRows; r++) {
          for (let c = 0; c < pieceCols; c++) {
            if (dragging.shape.matrix[r][c] && board[row + r][col + c].filled) {
              valid = false;
            }
          }
        }
        setHoverPos({ row, col, valid });
      } else {
        setHoverPos(null);
      }
    };

    const handlePointerUp = () => {
      if (dragging) {
        if (hoverPos && hoverPos.valid) {
          placePiece(dragging.index, dragging.shape, hoverPos.row, hoverPos.col);
        }
        setDragging(null);
        setHoverPos(null);
      }
    };

    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, hoverPos, board]);

  // Start / Reset
  const startGame = () => {
    setBoard(createEmptyBoard());
    setTray(getRandomShapes());
    setScore(0);
    setCombo(0);
    setStageIdx(0);
    setClearsInStage(0);
    setEvaluationQueue([]);
    setGameState('PLAYING');
    spawnValues(createEmptyBoard(), 0); // Spawn initial values
  };

  const spawnValues = (currentBoard, stgIdx) => {
    const currentStage = conditionLesson.stages[stgIdx];
    if (!currentStage) return currentBoard;

    let newBoard = currentBoard.map(row => [...row]);
    let emptyCells = [];
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!newBoard[r][c].filled && !newBoard[r][c].value) emptyCells.push({r, c});
      }
    }
    
    // Spawn 2-3 random values from the stage's pool
    const spawnCount = Math.min(emptyCells.length, 3);
    for (let i = 0; i < spawnCount; i++) {
      const cellIdx = Math.floor(Math.random() * emptyCells.length);
      const {r, c} = emptyCells.splice(cellIdx, 1)[0];
      const valIdx = Math.floor(Math.random() * currentStage.valuesToSpawn.length);
      newBoard[r][c] = { ...newBoard[r][c], value: currentStage.valuesToSpawn[valIdx] };
    }
    setBoard(newBoard);
    return newBoard;
  };

  const placePiece = (trayIndex, shape, startRow, startCol) => {
    // 1. Update Board
    let newBoard = board.map(row => [...row]);
    for (let r = 0; r < shape.matrix.length; r++) {
      for (let c = 0; c < shape.matrix[0].length; c++) {
        if (shape.matrix[r][c]) {
          newBoard[startRow + r][startCol + c] = { 
            ...newBoard[startRow + r][startCol + c], 
            filled: true, 
            color: shape.color 
          };
        }
      }
    }
    
    // 2. Remove from tray
    const newTray = [...tray];
    newTray[trayIndex] = null;
    if (newTray.every(p => p === null)) {
      setTray(getRandomShapes());
    } else {
      setTray(newTray);
    }

    // 3. Check Lines
    checkAndClearLines(newBoard);
  };

  const checkAndClearLines = async (newBoard) => {
    let rowsToClear = [];
    let colsToClear = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newBoard[r].every(cell => cell.filled)) rowsToClear.push(r);
    }
    for (let c = 0; c < BOARD_SIZE; c++) {
      let full = true;
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (!newBoard[r][c].filled) full = false;
      }
      if (full) colsToClear.push(c);
    }

    if (rowsToClear.length === 0 && colsToClear.length === 0) {
      setCombo(0);
      setBoard(newBoard);
      checkGameOver(newBoard, tray);
      return;
    }

    // Lines found!
    const linesCount = rowsToClear.length + colsToClear.length;
    setCombo(prev => prev + 1);
    setScore(prev => prev + (linesCount * 100) * (combo + 1));

    // Extract Educational Values
    let valuesToProcess = [];
    rowsToClear.forEach(r => {
      for(let c=0; c<BOARD_SIZE; c++) {
        if (newBoard[r][c].value !== null) valuesToProcess.push(newBoard[r][c].value);
      }
    });
    colsToClear.forEach(c => {
      for(let r=0; r<BOARD_SIZE; r++) {
        // Avoid double counting intersections
        if (newBoard[r][c].value !== null && !rowsToClear.includes(r)) {
          valuesToProcess.push(newBoard[r][c].value);
        }
      }
    });

    // Clear the lines visually
    let clearedBoard = newBoard.map((row, r) => row.map((cell, c) => {
      if (rowsToClear.includes(r) || colsToClear.includes(c)) {
        return { filled: false, color: '', value: null };
      }
      return cell;
    }));

    setBoard(clearedBoard);

    // Trigger Educational Event if values exist
    if (valuesToProcess.length > 0) {
      setEvaluationQueue(valuesToProcess);
    } else {
      checkGameOver(clearedBoard, tray);
    }
  };

  const processEvaluationQueue = async () => {
    if (evaluationQueue.length === 0) return;

    let passes = 0;
    
    // Process one by one for effect
    for (let i = 0; i < evaluationQueue.length; i++) {
      const val = evaluationQueue[i];
      
      if (stage.type === 'PREDICT') {
        // Pause and wait for user prediction
        const prediction = await new Promise(resolve => {
          setPredictionRequest({ value: val, resolve });
        });
        setPredictionRequest(null);
        // We could track if prediction was correct here
      }

      const isPass = stage.ruleFunction(val);
      if (isPass) passes++;
      
      // Artificial delay to show evaluation
      await new Promise(r => setTimeout(r, 1200));
    }

    // Cleanup queue
    setEvaluationQueue([]);

    // Check Stage Goals
    let newStageIdx = stageIdx;
    let newClears = clearsInStage + 1;
    
    if (stage.type === 'CONTROL') {
      if (passes >= stage.targetPasses) {
        newStageIdx++;
        newClears = 0;
      }
    } else {
      if (newClears >= stage.targetClears && stageIdx < conditionLesson.stages.length - 1) {
        newStageIdx++;
        newClears = 0;
      }
    }

    if (newStageIdx !== stageIdx) {
      setStageIdx(newStageIdx);
      setClearsInStage(newClears);
      spawnValues(board, newStageIdx); // Spawn new values for new stage
    } else {
      setClearsInStage(newClears);
      spawnValues(board, stageIdx); // Refill values
    }

    checkGameOver(board, tray);
  };

  // Run evaluation effect when queue changes
  useEffect(() => {
    if (evaluationQueue.length > 0 && !predictionRequest) {
      processEvaluationQueue();
    }
  }, [evaluationQueue]);

  const checkGameOver = (currentBoard, currentTray) => {
    // A real implementation would check if any piece in the tray can fit anywhere.
    // Omitted for prototype simplicity, assuming infinite space until physically blocked.
  };

  // --- RENDERERS ---

  if (gameState === 'MENU') {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative">
        <button 
          onClick={() => window.location.href = '/'} 
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-lg"
        >
          <RotateCcw className="w-4 h-4" /> Back to Arena
        </button>

        <div className="max-w-md w-full bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center mt-12">
          <img src="/src/assets/Logos/Logic_Blast.png" alt="Logic Blast" className="h-32 object-contain mb-4 drop-shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-transform" />
          <p className="text-slate-400 mb-8 text-center text-sm">Genuine Block Puzzle • Educational Consequences</p>
          
          <div className="w-full bg-slate-950/50 rounded-2xl p-4 mb-8 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 text-sm">Player</span>
              <span className="font-bold text-pink-400">{userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Lesson</span>
              <span className="font-bold text-cyan-400">COM-101: Conditions</span>
            </div>
          </div>

          <button onClick={startGame} className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95">
            PLAY PUZZLE
          </button>
        </div>
      </div>
    );
  }

  // PLAYING
  const isEvaluating = evaluationQueue.length > 0;
  
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans select-none overflow-hidden touch-none">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button onClick={() => setGameState('MENU')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
            <RotateCcw className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <div className="text-xs font-bold text-pink-500 uppercase tracking-widest">{stage.title}</div>
            <div className="text-sm text-slate-300 font-medium">{stage.objectiveText}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-500 uppercase">Score</div>
          <div className="text-xl font-black text-white font-mono">{score}</div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* The Rule HUD */}
        <div className="mb-6 px-6 py-3 bg-slate-900 border border-slate-700 rounded-2xl flex items-center gap-3 shadow-lg z-10">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="font-mono text-lg font-bold text-white tracking-wide">
            {stage.ruleLabel}
          </span>
        </div>

        {/* The Grid */}
        <div 
          ref={gridRef}
          className="bg-slate-900 p-2 rounded-xl border-2 border-slate-800 shadow-2xl relative"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            gap: '2px',
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)'
          }}
        >
          {board.map((row, r) => row.map((cell, c) => {
            const isHovered = hoverPos && hoverPos.valid && r >= hoverPos.row && r < hoverPos.row + dragging.shape.matrix.length && c >= hoverPos.col && c < hoverPos.col + dragging.shape.matrix[0].length && dragging.shape.matrix[r - hoverPos.row][c - hoverPos.col];
            
            return (
              <div 
                key={`${r}-${c}`} 
                className={`rounded-md relative flex items-center justify-center transition-colors
                  ${cell.filled ? cell.color : 'bg-slate-950'}
                  ${isHovered ? 'brightness-150 ring-2 ring-white z-10' : ''}
                `}
              >
                {/* Visual block bevel */}
                {cell.filled && <div className="absolute inset-0 border-t border-l border-white/20 rounded-md"></div>}
                {cell.filled && <div className="absolute inset-0 border-b border-r border-black/20 rounded-md"></div>}
                
                {/* Educational Value */}
                {cell.value !== null && (
                  <div className={`z-20 font-black font-mono text-lg drop-shadow-md ${cell.filled ? 'text-white' : 'text-slate-500'}`}>
                    {cell.value}
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        {/* Evaluation Overlay */}
        {isEvaluating && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in">
            {predictionRequest ? (
              <div className="bg-slate-900 border border-purple-500 p-6 rounded-3xl text-center shadow-2xl shadow-purple-500/20 max-w-sm w-full animate-in zoom-in-95">
                <h3 className="text-purple-400 font-bold uppercase tracking-widest mb-2">Predict</h3>
                <p className="text-xl text-white mb-6">If the rule is <span className="font-mono text-amber-400">{stage.ruleLabel}</span>...</p>
                <div className="text-5xl font-black font-mono text-white mb-8 bg-slate-800 inline-block px-6 py-4 rounded-2xl shadow-inner">
                  {predictionRequest.value}
                </div>
                <p className="text-slate-400 mb-4">Will this PASS or FAIL?</p>
                <div className="flex gap-4">
                  <button onClick={() => predictionRequest.resolve('PASS')} className="flex-1 py-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 font-bold text-lg hover:bg-emerald-500 hover:text-slate-900 transition-colors">
                    PASS
                  </button>
                  <button onClick={() => predictionRequest.resolve('FAIL')} className="flex-1 py-4 rounded-xl bg-red-500/20 border-2 border-red-500 text-red-400 font-bold text-lg hover:bg-red-500 hover:text-slate-900 transition-colors">
                    FAIL
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl max-w-sm w-full">
                <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-4">Evaluating Lines</h3>
                
                {/* Show currently evaluating value */}
                <div className="relative h-32 flex items-center justify-center">
                   {evaluationQueue.map((val, i) => {
                     // Just show the first one in the queue conceptually
                     if (i !== 0) return null;
                     const isPass = stage.ruleFunction(val);
                     return (
                       <div key={i} className="flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-300">
                         <div className="flex items-center gap-4 text-3xl font-mono font-black mb-4">
                           <span className="text-white">{val}</span>
                           <span className="text-slate-500">→</span>
                           <span className={isPass ? 'text-emerald-400' : 'text-red-400'}>{isPass ? 'TRUE' : 'FALSE'}</span>
                         </div>
                         <div className={`px-6 py-2 rounded-full font-bold text-xl flex items-center gap-2 ${isPass ? 'bg-emerald-500 text-slate-900' : 'bg-red-500 text-white'}`}>
                           {isPass ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                           {isPass ? 'PASS' : 'FAIL'}
                         </div>
                       </div>
                     );
                   })}
                </div>
                
                <p className="text-slate-500 mt-4 font-mono text-sm">Remaining: {evaluationQueue.length - 1}</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Tray Area */}
      <div className="h-48 bg-slate-900/80 border-t border-slate-800 p-4 flex justify-center items-center gap-4 sm:gap-8 z-20">
        {tray.map((piece, i) => (
          <div key={i} className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            {piece && (
              <div 
                className="relative touch-none cursor-grab active:cursor-grabbing"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${piece.matrix[0].length}, 20px)`,
                  gridTemplateRows: `repeat(${piece.matrix.length}, 20px)`,
                  gap: '2px',
                  opacity: (dragging && dragging.index === i) ? 0.3 : 1
                }}
                onPointerDown={(e) => {
                  if (isEvaluating) return;
                  e.target.setPointerCapture(e.pointerId);
                  setDragging({ index: i, shape: piece, clientX: e.clientX, clientY: e.clientY });
                }}
              >
                {piece.matrix.map((row, r) => row.map((cell, c) => (
                  <div key={`${r}-${c}`} className={`w-full h-full rounded-[4px] ${cell ? piece.color : 'bg-transparent'}`}>
                    {cell ? <div className="w-full h-full border-t border-l border-white/30 rounded-[4px]"></div> : null}
                  </div>
                )))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dragging Overlay rendering the active piece physically under the finger */}
      {dragging && (
        <div 
          className="fixed pointer-events-none z-50 drop-shadow-2xl"
          style={{
            left: dragging.clientX - (dragging.shape.matrix[0].length * (gridRef.current?.getBoundingClientRect().width/BOARD_SIZE || 40)) / 2,
            top: dragging.clientY - (dragging.shape.matrix.length * (gridRef.current?.getBoundingClientRect().width/BOARD_SIZE || 40)) - 20,
            display: 'grid',
            gridTemplateColumns: `repeat(${dragging.shape.matrix[0].length}, ${gridRef.current?.getBoundingClientRect().width/BOARD_SIZE || 40}px)`,
            gridTemplateRows: `repeat(${dragging.shape.matrix.length}, ${gridRef.current?.getBoundingClientRect().width/BOARD_SIZE || 40}px)`,
            gap: '2px'
          }}
        >
          {dragging.shape.matrix.map((row, r) => row.map((cell, c) => (
            <div key={`drag-${r}-${c}`} className={`w-full h-full rounded-md ${cell ? dragging.shape.color : 'bg-transparent'}`}>
              {cell ? <div className="w-full h-full border-t border-l border-white/30 rounded-md"></div> : null}
            </div>
          )))}
        </div>
      )}

    </div>
  );
}
