import React, { useState } from 'react';
import '../styles/Elevator.css';

const playButtonSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 1000;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

const playArrivalSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // チンという高い音（2000Hz）
  oscillator.frequency.value = 2000;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

export const Elevator: React.FC = () => {
  const [maxFloor, setMaxFloor] = useState<number | null>(null);
  const [customFloorCount, setCustomFloorCount] = useState('');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [targetFloor, setTargetFloor] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const handleFloorSelection = (floor: number) => {
    playButtonSound();
    setMaxFloor(floor);
    setCurrentFloor(1);
    setTargetFloor(null);
    setDirection(null);
  };

  const handleCustomFloorSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const floor = Number(customFloorCount);
    if (!Number.isInteger(floor) || floor < 2 || floor > 20) return;
    handleFloorSelection(floor);
  };

  const handleButtonPress = (floor: number) => {
    if (isMoving || floor === currentFloor) return;
    playButtonSound();
    setTargetFloor(floor);
    if (floor > currentFloor) {
      setDirection('up');
    } else {
      setDirection('down');
    }
  };

  React.useEffect(() => {
    if (!isMoving || targetFloor === null || currentFloor === targetFloor) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentFloor(prev => {
        if (prev < targetFloor!) {
          return prev + 1;
        } else if (prev > targetFloor!) {
          return prev - 1;
        }
        return prev;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [isMoving, targetFloor, currentFloor]);

  React.useEffect(() => {
    if (targetFloor !== null && currentFloor === targetFloor) {
      playArrivalSound();
      setIsMoving(false);
      setTargetFloor(null);
      setDirection(null);
    } else if (targetFloor !== null && currentFloor !== targetFloor) {
      setIsMoving(true);
    }
  }, [currentFloor, targetFloor]);

  if (maxFloor === null) {
    return (
      <div className="elevator-container">
        <h1>🛗 エレベーターを選択</h1>
        <div className="floor-selection">
          <p>エレベーターの階数を選んでください：</p>
          <div className="selection-buttons">
            {[3, 5, 9, 15, 20].map(floor => (
              <button
                key={floor}
                className="selection-button"
                onClick={() => handleFloorSelection(floor)}
              >
                {floor}階
              </button>
            ))}
          </div>
          <form className="custom-floor-form" onSubmit={handleCustomFloorSubmit}>
            <label htmlFor="custom-floor-count">階数を指定（2〜20階）</label>
            <div className="custom-floor-controls">
              <input
                id="custom-floor-count"
                className="custom-floor-input"
                type="number"
                min="2"
                max="20"
                step="1"
                required
                value={customFloorCount}
                onChange={event => setCustomFloorCount(event.target.value)}
              />
              <button className="selection-button" type="submit">設定</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const floors = Array.from({ length: maxFloor }, (_, i) => i + 1);
  const displayedFloors = maxFloor >= 10
    ? Array.from({ length: Math.ceil(maxFloor / 2) }, (_, row) => {
        const leftFloor = Math.ceil(maxFloor / 2) - row;
        const rightFloor = maxFloor - row;
        return row < Math.floor(maxFloor / 2) ? [leftFloor, rightFloor] : [leftFloor];
      }).flat()
    : [...floors].reverse();

  return (
    <div className="elevator-container">
      <h1>🛗 エレベーター</h1>
      
      <div className="elevator-display">
        <div className="floor-display">
          {direction === 'down' && <span className="direction-arrow down">↓</span>}
          <span className="current-floor">{currentFloor}</span>
          {direction === 'up' && <span className="direction-arrow up">↑</span>}
        </div>

        <div className={`floor-buttons ${maxFloor >= 10 ? 'two-columns' : 'one-column'}`}>
          {displayedFloors.map(floor => (
            <button
              key={floor}
              className={`floor-button ${targetFloor === floor && !isMoving ? 'selected' : ''}`}
              onClick={() => handleButtonPress(floor)}
              disabled={isMoving}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>

      <button 
        className="reset-button"
        onClick={() => setMaxFloor(null)}
      >
        別のエレベーターを選ぶ
      </button>
    </div>
  );
};



