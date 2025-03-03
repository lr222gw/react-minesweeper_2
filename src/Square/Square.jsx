import React, {useContext, useCallback , useEffect, useState, memo}from 'react'
import { GameContext } from '../App'

function Square({
  id,
  revealSquares,
  color,
  backgroundColor,
  isFlippedAttr,
  innerText,
  classList
}) {
  const {gameOver, gameWon, options, setFlags, flags} = useContext(GameContext)
  
 
  const clickSquare = useCallback((e) => 
  {
    console.log(e);
    if(e.button == 2)rightClickSquare(e);
    else if(e.button == 0)leftClickSquare(e);
    
  })
  const _setFlag = (squareelm) => {
    if (squareelm.innerText != "🚩" && squareelm.innerText.length == "")
    {
      if(flags == 0) return;
      squareelm.innerText = "🚩";
      setFlags(flags-1);
    }
    else if (squareelm.innerText == "🚩")
    {
      squareelm.innerText = "";
      setFlags(flags+1);
    }
  }
  const leftClickSquare = (e) => {
    var curSymbol = e.currentTarget.getElementsByClassName("symbol")[0];
    if (curSymbol.innerText != "🚩" && curSymbol.innerText.length == "")
      revealSquares(e.currentTarget.id,[])
    
  };
  const rightClickSquare = (e) => 
  {    
    e.preventDefault(); // Doesn't really work... (Kept in case of browser differences)
    if(gameOver || gameWon) return; 
    var curSymbol = e.currentTarget.getElementsByClassName("symbol")[0];
    _setFlag(curSymbol);
  }
  
  const mouseHover = useCallback( (elm) => 
  {
    if (elm.classList.length > 1 || (gameOver || gameWon)) return; 
    elm.classList.add("cellHover");
  })
  const mouseNotHover = useCallback((elm) => 
  {
    if (elm.classList.contains("cellHover"))
      elm.classList.remove("cellHover");
  })

  // document.addEventListener("onContextMenu",(e) => {e.preventDefault();} )
  return (
    <div id={id} className={["cell",...classList].join(" ")}
      onContextMenu={(e) => {e.preventDefault();}} // Prevent rightclick to open context menu...
      onMouseDown={(e) => {clickSquare(e)}} 
      onMouseEnter={(e) => mouseHover(e.currentTarget)}
      onMouseLeave={(e) => mouseNotHover(e.currentTarget)}
      >        
        <p className='square_id'>{id}</p>
        <div className='symbolDiv' style={{backgroundColor:backgroundColor}}>
          <p className="symbol" style={{color:color}} flipped={isFlippedAttr ? "true" : "false" } >{innerText}</p>
        </div>
    </div>
  )
}

export default Square