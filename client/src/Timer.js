import { useEffect, useState} from 'react';
import './Timer.css';

export default function Timer({ isActive, onReset, onTimeUpdate, isCompleted }) {
    const [time, setTime] = useState(0);
  
    useEffect(() => {
      let interval;
      if (isActive) {
        interval = setInterval(() => {
          setTime(prevTime => {
            const newTime = prevTime + 1;
            if (onTimeUpdate) onTimeUpdate(newTime);
            return newTime;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isActive, onTimeUpdate]);
  
    useEffect(() => {
      if (onReset) {
        setTime(0);
      }
    }, [onReset]);
  
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
  
    return (
      <div className={`timer-container ${isCompleted ? 'completed' : isActive ? 'active' : 'paused'}`}>
        <div className="timer-digits">{formatTime(time)}</div>
        <div className="timer-bar" style={{ width: `${(time % 60 / 60) * 100}%` }}></div>
      </div>
    );
  }
