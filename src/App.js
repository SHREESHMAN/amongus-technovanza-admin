import React, {useEffect, useState} from 'react';
import './App.css';
import useWebSocket from 'react-use-websocket';

// const wsurl = 'ws://127.0.0.1:8000';
const wsurl = 'wss://among-us-web-socket-server.glitch.me/';

const Table = ({ tableData }) => {
  if (Object.keys(tableData).length === 0) {
    return <p>(No data available)</p>;
  }

  const headers = Object.keys(tableData[Object.keys(tableData)[0]]);

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(tableData).map((rowKey) => (
          <tr key={rowKey}>
            {headers.map((header) => (
              <td key={header}>{JSON.stringify(tableData[rowKey][header])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function App() {

  //define states
  const [phaseMessage,setPhaseMessage] = useState("");
  const [time,setTime] = useState("");
  const [tableData, setTableData] = useState({});
  //websocket connection
    const {sendJsonMessage,lastJsonMessage} = useWebSocket(wsurl,{
      onOpen: () => {
        console.log('Admin: WebSocket connection established.');
      },
      share:true,
      filter:false,
  });

  //requests
  useEffect(() => {
    sendJsonMessage({
        type: 'authAdmin'
    });
  },[sendJsonMessage]);

  //incoming
  useEffect(() => {
    if(lastJsonMessage){
        if (lastJsonMessage.type==='authAdmin') {
          console.log("Authorized self as admin!");
        }
        else if(lastJsonMessage.type==='gamePhase'){
          if(lastJsonMessage.data === 'waiting'){
            setPhaseMessage("Game has not yet started");
          }
          else if(lastJsonMessage.data === 'ready'){
            setPhaseMessage("Game is about to start");
          }
          else if(lastJsonMessage.data === 'pregame'){
            setPhaseMessage("Game is in pre-game phase");
          }
          else if(lastJsonMessage.data === 'ingame'){
            setPhaseMessage("Game is underway");
          }
        }
        else if(lastJsonMessage.type==='broadcastTime'){
          setTime(secondsToMMSS(lastJsonMessage.data));
          if(phaseMessage==='Game has not yet started'){
            setTime('');
          }
        }
        else if(lastJsonMessage.type==='playerEvent'){
          setTableData(lastJsonMessage.data);
        }
        else if(lastJsonMessage.type === 'endGame'){
          setPhaseMessage("Game has not yet started");
          setTime('');
        }
    }
  }, [lastJsonMessage]);

  //functions
  function secondsToMMSS(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
  }
  function endGame(){
    sendJsonMessage({
      type: 'endGame'
    })
  }
  function startVoting(){
    sendJsonMessage({
      type: 'allowVoting'
    })
  }
  //markup
  return (
    <div className="App">
      <h1>Among Us IRL -TechnoVanza</h1>
      <h2>ADMIN PORTAL</h2>
      <p>{phaseMessage}{phaseMessage==="Game has not yet started"?"":": "}{time}</p>
      <Table tableData={tableData} />
      <button id="force-end-game" onClick={endGame}>FORCE END GAME</button>
      <button id="start-voting" onClick={startVoting}>EMERGENCY MEETING</button>
    </div>
  );
}

export default App;
