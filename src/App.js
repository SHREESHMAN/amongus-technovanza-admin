import React, {useEffect, useState} from 'react';
import './App.css';
import useWebSocket from 'react-use-websocket';

const wsurl = 'ws://127.0.0.1:8000';
// const wsurl = 'wss://among-us-web-socket-server.glitch.me/';

function App() {

  //define states
  const [phaseMessage,setPhaseMessage] = useState("");
  const [time,setTime] = useState("");

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
  //markup
  return (
    <div className="App">
      <h1>Among Us IRL -TechnoVanza</h1>
      <h2>ADMIN PORTAL</h2>
      <p>{phaseMessage}{phaseMessage==="Game has not yet started"?"":":"}{time}</p>
      <button id="force-end-game" onClick={endGame}>FORCE END GAME</button>
    </div>
  );
}

export default App;
