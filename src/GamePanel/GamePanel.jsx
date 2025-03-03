import React, {useContext, useEffect, useState} from 'react'
import { GameContext } from '../App'

function GamePanel() {
  const {options,setOptions, 
        started, setStarted,
        gameOver, setGameOver, 
        nrFlipped, setNrFlipped,
        gameWon, setGameWon,
        flags  } = useContext(GameContext)
  const [nrRevealedSquares, setNrRevealedSquares] = useState(0);
  const [elapsedTimeMin, setElsapedTimeMin] = useState(0);
  const [elapsedTimeSec, setElsapedTimeSec] = useState(0);
  const [timer, setTimer] = useState(null);
  useEffect(() => {
    console.log(started && !gameOver);
    if (started && !gameOver)
      startTimer(); 

  },
  [started]
  );
  useEffect(() => {
    if(gameOver)
    {
      clearInterval(timer);
      setTimer(null);
      console.log("Game Over");
      let l = Array.from(document.querySelectorAll(".symbol")).filter(x => x.hasAttribute("flipped"));
      setNrRevealedSquares(l.length);
    }
  },
  [gameOver]
  );
  useEffect(() => {
    if(gameWon)
    {
      clearInterval(timer);
      setTimer(null);
      console.log("Winner winner chicken dinner");
      let l = Array.from(document.querySelectorAll(".symbol")).filter(x => x.hasAttribute("flipped"));
      setNrRevealedSquares(l.length);
    }
  },
  [gameWon]
  );

  const startTimer = () => {
    if (timer != null) return;
    console.log("Start Timer")
    let dur = 0;
    setTimer(setInterval(() => {
      let elapsed = dur++; 

      setElsapedTimeMin(Math.floor(elapsed / 60));
      setElsapedTimeSec(elapsed % 60)
      
    },
    1000
    ));
  }

  const getElapsedSec = () => {
    return elapsedTimeSec < 10 ? ("0"+elapsedTimeSec.toString()) : (elapsedTimeSec);
  }
  const getElapsedMin = () => {
    return elapsedTimeMin < 10 ? ("0"+elapsedTimeMin.toString()) : (elapsedTimeMin);
  }

  const handleChange = (e) => {
    if (e.currentTarget.max.length == 0 && e.currentTarget.type == 'number')
      setOptions({...options,[e.currentTarget.name]:Number(e.currentTarget.value) })
    else if (Number(e.currentTarget.value) <= Number(e.currentTarget.max))
      setOptions({...options,[e.currentTarget.name]:Number(e.currentTarget.value) })
    else if (e.currentTarget.type == 'number')
      setOptions({...options,[e.currentTarget.name]:Number(e.currentTarget.max) })
    else 
    {
      setOptions({...options,[e.currentTarget.name]:e.currentTarget.value })
    }
  }
  const handleResetPress = () => 
  {
    setOptions({...options, reset: true});
    setStarted(false);
    setGameOver(false);
    setGameWon(false);
    setNrFlipped(0);
    setElsapedTimeMin(0);
    setElsapedTimeSec(0);
    if(timer != null);
      clearInterval(timer);
  }
  return (
    <div id="gamepanel" >
      <div className='HUD_Left'>
          <label>Player Name:</label>
          <input type="text" name={"playername"} disabled={started} value={options.playername}  onChange={(e) =>handleChange(e)}  ></input>
          <div className='HUD_buttons'>
            <button  className={gameOver||gameWon ? "beat resetButton" : "resetButton"} style={{
              visibility:started?"visible":"hidden",
              borderRadius:"5px",
              boxShadow: gameOver||gameWon ? "0px 0px 20px rgb(219, 252, 31), inset 0px 0px 5px rgb(52, 150, 7)" : "inset 0px 0px 5px rgb(52, 150, 7)",
              border: gameOver||gameWon ? "3px solid rgb(219, 252, 31)" : "3px solid rgb(0, 0, 0)"
              }} onClick={() => handleResetPress()}>Reset</button>
          </div>
          <div id="playtime_flagCounter">
            <div id='playtime'>
              <div id="minutes" className='timeBoxes'>{getElapsedMin()}</div>
              <div className='timeBoxes'>:</div>
              <div id="seconds" className='timeBoxes'>{getElapsedSec()}</div>
            </div>
            <div id='flagsCounter'>
            {flags}🚩
            </div>
          </div>

        </div>
        <div id="FinalScoreBoard" className={gameOver||gameWon ? "swell" : ""} style={{visibility:gameOver||gameWon?"visible":"hidden"}}>
          <h3>{gameOver ? "Game Over" : "Winner Winner chicken dinner"}</h3>
          <div className='scoreboardinfo'>
            <div>
              <label htmlFor="nrRevealedSquares">Revealed Tiles</label>
              <p>{nrRevealedSquares}</p>
            </div>
            <div>
            <label htmlFor="nrFlipped">User Flipped Tiles</label>
              <p>{nrFlipped}</p>
            </div>
            <div>
              <label htmlFor="Duration">Duration</label>
              <p>{elapsedTimeMin}m {elapsedTimeSec}s</p>
            </div>
          </div>
        </div>
        <div className='HUD_Right'>
          <label>Bombs</label>
          <input type="number" min={1} max={options.nrCol*options.nrRow} disabled={started} name={"nrMines"} value={options.nrMines}  onChange={(e) =>handleChange(e)}  ></input>
          
          <label>Columns</label>
          <input type="number" min={1} max={50 } name={"nrCol"} value={options.nrCol} disabled={started} onChange={(e) =>handleChange(e)}  ></input>
          
          <label>Rows</label>
          <input type="number" min={1} max={50} name={"nrRow"} value={options.nrRow} disabled={started} onChange={(e) =>handleChange(e)}  ></input>
        </div>        
    </div>
  )
}

export default GamePanel