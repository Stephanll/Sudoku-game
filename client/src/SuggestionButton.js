import React, { useState } from 'react';
import './Board.css';

function SuggestionButton({ board, onSuggestion }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
  
    const requestSuggestion = async () => {
      setIsLoading(true);
      setMessage('');
      
      try {
        const response = await fetch('http://localhost:5000/api/request-suggestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puzzle: board })
        });
        
        const data = await response.json();
        
        if (data.suggestion) {
          onSuggestion({
            ...data.suggestion,
            showValue: true // Temporary flag to show value
          });
          setMessage(`Look at (${data.suggestion.row+1}, ${data.suggestion.col+1}) - Should be: ${data.suggestion.possible_values[0]}`);
        } else {
          setMessage(data.message || "No obvious suggestions found");
        }
      } catch (error) {
        setMessage("Failed to get suggestion");
        console.error("Suggestion error:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="suggestion-container">
        <button onClick={requestSuggestion} disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Get Hint (Test Mode)'}
        </button>
        {message && <div className="suggestion-message">{message}</div>}
      </div>
    );
  }

export default SuggestionButton;