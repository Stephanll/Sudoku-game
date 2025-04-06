import './Board.css';

function Cell({ value, isGiven, isSelected, isError, isHighlighted, suggestionValue, onClick }) {
  return (
    <div
      className={`cell 
        ${isGiven ? 'given' : ''}
        ${!isGiven && value !== 0 ? 'user-input' : ''}
        ${isSelected ? 'selected' : ''}
        ${isError ? 'error' : ''}
        ${isHighlighted ? 'highlighted-cell' : ''}
      `}
      onClick={onClick}
    >
      {value !== 0 ? value : ''}
      {/* Temporary value display for testing */}
      {isHighlighted && suggestionValue && (
        <div className="hint-value">{suggestionValue}</div>
      )}
    </div>
  );
}

export default Cell;