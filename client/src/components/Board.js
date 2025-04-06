import { useState, useEffect} from 'react';
import Cell from './Cell';
import SuggestionButton from './SuggestionButton';
import '../styles/Board.css';
import Timer from './Timer';

function Board({ puzzleData }) {
  const [currentPuzzle, setCurrentPuzzle] = useState(puzzleData);
  const [timerKey, setTimerKey] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [grid, setGrid] = useState(() => {
    const initialGrid = Array(9).fill().map(() => Array(9).fill(0));
    for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
      const box = puzzleData[boxIndex];
      const startRow = Math.floor(boxIndex / 3) * 3;
      const startCol = (boxIndex % 3) * 3;
      
      for (let i = 0; i < 9; i++) {
        const row = startRow + Math.floor(i / 3);
        const col = startCol + (i % 3);
        initialGrid[row][col] = box[i];
      }
    }
    return initialGrid;
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [selectedCell, setSelectedCell] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [highlightedCell, setHighlightedCell] = useState(null);

  // Helper function to check if a cell is given
  function isCellGiven(row, col) {
    const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const positionInBox = (row % 3) * 3 + (col % 3);
    return currentPuzzle[boxIndex][positionInBox] !== 0;
  }

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;
  
      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let newRow = row, newCol = col;
        switch (e.key) {
          case 'ArrowUp': newRow = row > 0 ? row - 1 : 8; break;
          case 'ArrowDown': newRow = row < 8 ? row + 1 : 0; break;
          case 'ArrowLeft': newCol = col > 0 ? col - 1 : 8; break;
          case 'ArrowRight': newCol = col < 8 ? col + 1 : 0; break;
        }
        setSelectedCell({ row: newRow, col: newCol });
        return;
      }
  
      // Only allow modifying empty cells
      if (!isCellGiven(row, col)) {
        if (e.key >= '1' && e.key <= '9') {
          setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[row][col] = parseInt(e.key);
            return newGrid;
          });
        } 
        else if (e.key === '0' || e.key === 'Backspace') {
          setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[row][col] = 0;
            return newGrid;
          });
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell]); 

  // Auto-remove highlight after 3 seconds
  useEffect(() => {
    if (highlightedCell) {
      const timer = setTimeout(() => setHighlightedCell(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedCell]);

  const handleCheckPuzzle = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:5000/api/check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userGrid: grid })
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      setVerificationResult(result);
  
      if (result.isComplete && result.isValid) {
        setGameActive(false);
        alert(`🎉 Congratulations! You solved the puzzle in ${formatTime(currentTime)}!`);
      } else if (!result.isComplete) {
        alert("⚠️ Puzzle is not complete yet!");
      } else {
        alert("❌ There are errors in your solution");
      }
    } catch (error) {
      console.error("Failed to check solution:", error);
      alert("Failed to verify solution. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleNewPuzzle = async () => {
    setTimerKey(prev => prev + 1);
    setGameActive(true); // Reset timer when new puzzle is generated
    setIsGenerating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/new-puzzle?difficulty=${difficulty}`);
      const newPuzzleData = await response.json();
      setCurrentPuzzle(newPuzzleData.puzzle);
      const newGrid = Array(9).fill().map(() => Array(9).fill(0));
      for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
        const box = newPuzzleData.puzzle[boxIndex];
        const startRow = Math.floor(boxIndex / 3) * 3;
        const startCol = (boxIndex % 3) * 3;
        
        for (let i = 0; i < 9; i++) {
          const row = startRow + Math.floor(i / 3);
          const col = startCol + (i % 3);
          newGrid[row][col] = box[i];
        }
      }
      
      setGrid(newGrid);
      setSelectedCell(null);
      setVerificationResult(null);
      setHighlightedCell(null);
    } catch (error) {
      console.error("Failed to fetch new puzzle:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="sudoku-container">
      <Timer 
        key={timerKey}
        isActive={gameActive}
        onReset={timerKey}
        onTimeUpdate={setCurrentTime}
      />
      <div className="board">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
             <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              isGiven={isCellGiven(rowIndex, colIndex)}
              isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
              isError={verificationResult?.errors?.some(err => 
                err.row === rowIndex && err.col === colIndex
              )}
              isHighlighted={highlightedCell?.row === rowIndex && highlightedCell?.col === colIndex}
              suggestionValue={
                highlightedCell?.row === rowIndex && 
                highlightedCell?.col === colIndex && 
                highlightedCell?.possible_values?.[0]
              }
              onClick={() => !isCellGiven(rowIndex, colIndex) && setSelectedCell({ row: rowIndex, col: colIndex })}
            />
            ))}
          </div>
        ))}
      </div>
      
      <div className="controls">
        <button 
          className="control-btn generate-btn" 
          onClick={handleNewPuzzle}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Puzzle'}
        </button>
        <button 
          className="control-btn check-btn"
          onClick={handleCheckPuzzle}
          disabled={isChecking}
        >
          {isChecking ? 'Checking...' : 'Check Puzzle'}
        </button>
        <SuggestionButton 
          board={grid}
          onSuggestion={setHighlightedCell}
        />
      </div>
      <div className="difficulty-selector">
        <label>Difficulty: </label>
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
}

export default Board;