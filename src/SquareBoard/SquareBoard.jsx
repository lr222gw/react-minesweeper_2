import React, {useRef, useMemo,useState, useContext, useEffect} from 'react'
import Square from "../Square/Square"
import { GameContext } from '../App'

function SquareBoard() {
  const {options, setOptions,
        started,setStarted, 
        gameOver,setGameOver, 
        gameWon, setGameWon,
        setNrFlipped} = useContext(GameContext)
  const [mineArray, setMineArray] = useState(null)
  const [squareArray, setSquareArray] = useState([

  ])
  const [rowLen, setRowLen]   = useState(0)
  const [colLen, setColLen]   = useState(0)
  const [clear,  setClear]    = useState(false)
  const [flippedTiles, setFlippedTiles] = useState([])
  const countdbg    = useRef(0)
  const filledTiles_c    = useRef([])
  const flipping_nonvisited    = useRef([])
  const flipping_order    = useRef([])

  console.log("SQUAREBOARD___________"); //=TEMP
  useEffect(() => {
    console.log("Options Changed"); //=TEMP
    setRowLen(options.nrRow);
    setColLen(options.nrCol);
    setSquareArray(Array.from({length:options.nrRow*options.nrCol}, (x,index) => {
      return {
        id:index,
        color: "white" , 
        backgroundColor: undefined , 
        isFlipped: false , 
        innerText: "" ,
        classList: [] ,
      }
    }));
    pickMineSquares(options.nrMines, options.nrRow, options.nrCol);
    if (options.reset == true)
      setOptions({...options, reset:false});
    setClear(true);
    
  },
  [options]
  );

  useEffect(() => { // NOTE: UseEffect will initially cause One ReRender per defined UseEffect...
    console.log("Clear Changed"); //=TEMP
    if(clear)
      setClear(false);
  },
  [clear]
  );

  const pickMineSquares = (_nrMines, rows,cols) =>
  {
    let tempSquares = Array.from({length:rows*cols},(x,index) => {return index });

    let mineIds = Array.from({length:options.nrMines},(x) => 
      {
        let r = Math.floor(Math.random()*(tempSquares.length));
        let pickedIndex = tempSquares[r];
        tempSquares = [...tempSquares.filter((x,index) => index !== r )]
        return pickedIndex;
      }
    );
    setMineArray(mineIds);
  }

  const sleep = (ms) => {
    return new Promise(t => setTimeout(t, ms));
  }
  const triggerGameOver = async (bombId) => 
  {
    
    // Placing pressed bomb first will result in a more pleasent animation
    let tempArr = [bombId,...mineArray.filter(x => x != bombId)];
    let container = document.getElementById("effects");
    container.classList.add("shakeEffect");
    for (let i in tempArr)
    {
      let squareElem = document.getElementById(tempArr[i]);
      var curSymbol = squareElem.getElementsByClassName("symbol")[0];
      curSymbol.innerText = "💣";
      curSymbol.parentElement.parentElement.style.backgroundColor = "red";
      curSymbol.style.textShadow = "rgb(255 240 55) 0px 0px 5px";
      curSymbol.parentElement.parentElement.classList.add("blowUp")
      curSymbol.classList.add("blowUp");
      container.classList.add("shakeEffect");
      await sleep(50);
    }
    setGameOver(true);
  }

  
  const revealSquares = (id, visited = []) =>
  {
    console.time("startAll")
    console.time("norecursive")
    revealSquares_no_recursive(id, visited);

    console.timeEnd("norecursive")
    console.time("flipTime")
    let tempSquareArr = []
    for (let f in flipping_nonvisited.current)
    {
      let f_index = Number(f)

      let curId = flipping_nonvisited.current[f_index].id;
      let mcount = flipping_nonvisited.current[f_index].mine_count;

      tempSquareArr.push(flip(curId,mcount));
    }
    console.timeEnd("flipTime")
    
    countdbg.current = 0;
    let newArrayMap = squareArray.map(x => {
          let f = tempSquareArr.find(y => y.id === x.id)
          if (f) return f; 
          return x;
    });

    // SANITY CHECK...
    for(let x in newArrayMap)
    {
        if((newArrayMap[x].id) !== Number(x))
        {
            console.log(typeof(x ))
            console.log((typeof(newArrayMap[x].id)))
            console.log("ERROR");
            throw new "ERROROROR";
        }
    }
    setSquareArray(newArrayMap)
      
    let flipped = Object.entries(document.querySelectorAll(".symbol")).map(x=>x[1]).filter(x => x.hasAttribute("flipped"));
      if (flipped.length + options.nrMines === options.nrCol*options.nrRow)
        setGameWon(true);
      
    console.timeEnd("startAll")
  }

  const revealSquares_no_recursive = (id,  _visited = []) =>
  {
    if (gameOver) return;
    if (!started) setStarted(true);

    let rec_stack = [
      id // Insert first elem into fake stack
    ];
    
    let visited = new Set(_visited);
    let mineSet = new Set(mineArray);
    
    // Define Duration for Timers...
    let calcVisit_totalTime = 0;
    let slice_totalTime = 0; 
    let forVisit_totalTime = 0;
    let while_inner_totalTime = 0;
    let filledTiles_c_totalTime = 0;
    
    const while_start = performance.now();
    
    let filledTiles_c_temp = [];
    let counter = 0; 
    while(rec_stack.length !== counter)
    {
      const while_inner_start = performance.now();
        
      const slice_start = performance.now();
      var curDat = rec_stack[counter];
      id = curDat;
      counter++;

      slice_totalTime += (performance.now() - slice_start);
      
      let nid =Number(id);
      if (visited.has(nid)) continue;

      if (!flippedTiles.includes(id))
      {
        const filledTiles_c_start = performance.now();
        filledTiles_c_temp.push(id);
        filledTiles_c_totalTime += performance.now() - filledTiles_c_start;
      }
  
      if(mineSet.has(nid))
        triggerGameOver(nid)
      else
      {
        const calcVisit_start = performance.now();
   
        let c_index = (nid %  (colLen));
        let r_index = Math.floor(nid / (colLen) );
  
        let c_trav_from = Math.max(c_index-1,0);
        let c_trav_to   = Math.min(c_index+1,colLen-1);
        let r_trav_from = Math.max(r_index-1,0);
        let r_trav_to   = Math.min(r_index+1,rowLen-1);
        let visit = [];
        let mine_count = 0; 
        for (let i = r_trav_from; i <= r_trav_to; i++)
        {
          for(let j = c_trav_from; j <= c_trav_to; j++)
          {
            let travId = (i*colLen) + j;
            if(travId != nid)
              visit.push(travId);
  
            if(mineSet.has(travId))
              mine_count++;
          }
        }
        
        calcVisit_totalTime += (performance.now() - calcVisit_start);
        flipping_nonvisited.current.push({id: nid, mine_count : mine_count })

        visited.add(nid);
        if (mine_count == 0)
        {
          const forVisit_start = performance.now();

          for(let i in visit)
          {
            if(!visited.has(visit[i]))
              rec_stack.push(visit[i]);
          }

          forVisit_totalTime += (performance.now() - forVisit_start);
        } 
      }
      while_inner_totalTime += (performance.now() - while_inner_start);
    }

    filledTiles_c.current = filledTiles_c_temp
    
    let while_totalTime = (performance.now() - while_start);

    console.log(`while_inner_totalTime: ${while_inner_totalTime} ms`);
    console.log(`while_totalTime: ${while_totalTime} ms`);
    console.log(`slice_totalTime: ${slice_totalTime} ms`);
    console.log(`filledTiles_c_totalTime: ${filledTiles_c_totalTime} ms`);
    console.log(`calcVisit_totalTime: ${calcVisit_totalTime} ms`);
    console.log(`forVisit_totalTime: ${forVisit_totalTime} ms`);
    console.log("done non-recurse")
  }

  //NOTE: Deprecated...
  const revealSquares_recursive = async (id, squareElem, visited = []) =>
  {
    
    if (gameOver) return;
    if (!started) setStarted(true);
    let nid =Number(id);
    if (visited.includes(nid)) return;
    
    var curSymbol = squareElem.getElementsByClassName("symbol")[0];
    if (!flippedTiles.includes(id))
    {
      let newFlippedTilesArr= [...filledTiles_c.current,id ];
      filledTiles_c.current = newFlippedTilesArr
    }

    if(mineArray.includes(nid))
      triggerGameOver(nid)
    else
    {
    
      let c_index = (nid %  (colLen));
      let r_index = Math.floor(nid / (colLen) );

      let c_trav_from = Math.max(c_index-1,0);
      let c_trav_to   = Math.min(c_index+1,colLen-1);
      let r_trav_from = Math.max(r_index-1,0);
      let r_trav_to   = Math.min(r_index+1,rowLen-1);
      let visit = [];
      let mine_count = 0; 
      for (let i = r_trav_from; i <= r_trav_to; i++)
      {
        for(let j = c_trav_from; j <= c_trav_to; j++)
        {
          let travId = (i*colLen) + j;
          if(travId != nid)
            visit.push(travId);

          if(mineArray.includes(travId))
            mine_count++;
        }
      }

      flipping_nonvisited.current.push({elm: curSymbol, mine_count : mine_count })

      visited.push(nid);
      if (mine_count == 0)
      {
        countdbg.current++;

        for(let i in visit)
        {
          if(!visited.includes(visit[i]))
          {
            revealSquares_recursive(visit[i],document.getElementById(visit[i]), visited);
          }
        }
      } 
    }
  }

  const flip =  (id, mine_count) => {
      let classlist = []
      if (mine_count == 0)
        classlist.push("swell_spin_dance")
      else 
        classlist.push("swell")

      let color = mine_count == 0 ? "white" 
          : mine_count == 1 ? "green" 
          : mine_count == 2 ? "blue" 
          : mine_count == 3 ? "yellow" 
          : mine_count == 4 ? "red" 
          : mine_count > 4 ? "magenta" :""
          ; 

      return {
        id: id,
        color: color ,
        backgroundColor: "antiquewhite",
        isFlipped: true ,
        innerText: mine_count,
        classList: classlist
      };
    
  }

  const squarArrMem = useMemo(() => {
    return squareArray.map((x,index) => {
      return (<Square key={x.id} id={x.id}  revealSquares={revealSquares} 
        color={x.color}
        backgroundColor={x.backgroundColor}
        isFlippedAttr={x.isFlippedAttr}
        innerText={x.innerText}
        classList={x.classList}
        />);
    })
  }, [squareArray])


  return (
    <>
    <div style={{gridTemplateColumns:`repeat(${colLen},35px)`}} className='container' >
      { squarArrMem }
    </div>
    </>
  )
}

export default SquareBoard