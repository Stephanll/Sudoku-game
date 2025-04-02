import './Board.css';

function Cell({ value, isGiven, isSelected, isError, onClick }) {
  return (
    <div
      className={`
        cell 
        ${isGiven ? 'given' : ''}
        ${!isGiven && value !== 0 ? 'user-input' : ''}
        ${isSelected ? 'selected' : ''}
        ${isError ? 'error' : ''}
      `}
      onClick={onClick}
    >
      {value !== 0 ? value : ''}
    </div>
  );
}

export default Cell;