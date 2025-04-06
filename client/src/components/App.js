import Board from './Board';
import '../styles/App.css';

function App() {
  // Test puzzle data (9 boxes, each with 9 values)
  const testPuzzle = [
    [5, 3, 0, 6, 0, 0, 0, 9, 8], // Box 0 (top-left)
    [0, 7, 0, 1, 9, 5, 0, 0, 0], // Box 1 (top-center)
    [0, 0, 0, 0, 0, 0, 0, 6, 0], // Box 2 (top-right)
    [8, 0, 0, 4, 0, 0, 7, 0, 0], // Box 3 (middle-left)
    [0, 6, 0, 8, 0, 3, 0, 2, 0], // Box 4 (center)
    [0, 0, 3, 0, 0, 1, 0, 0, 6], // Box 5 (middle-right)
    [0, 6, 0, 0, 0, 0, 0, 0, 0], // Box 6 (bottom-left)
    [0, 0, 0, 4, 1, 9, 0, 8, 0], // Box 7 (bottom-center)
    [2, 8, 0, 0, 0, 5, 0, 7, 9]  // Box 8 (bottom-right)
  ];

  return (
    <div className="App">
      <div className="header">
        <h1>Sudoku</h1>
      </div>
      <Board puzzleData={testPuzzle} />
    </div>
  );
}

export default App;