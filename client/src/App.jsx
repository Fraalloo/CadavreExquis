import React, {useState, useRef} from "react"
import Home from "./components/Home.jsx"
import Lobby from "./components/Lobby.jsx"
import CanvasBoard from "./components/CanvasBoard.jsx"

const App = () => {
    const [roomCode, setRoomCode] = useState(null)
	const [gameState, setGameState] = useState("HOME")
	const [playerCount, setPlayerCount] = useState(0)
	const [isReady, setIsReady] = useState(false)
	const wsRef = useRef(null)

    const joinRoom = (code) => {
		const ws = new WebSocket(`ws://localhost:1775/ws?room=${code}`) // Hardcoded temporaneamente

		ws.onopen = () => {
			console.log(`Connessione alla stanza: ${code}`)
			setRoomCode(code)
			setGameState("WAITING")
		}       

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data)
      
			if(data.error){
				alert(data.error)
				setRoomCode(null)
				setGameState("HOME")
				return
			}

			if(data.type === "STATE_UPDATE"){
				setPlayerCount(data.playerCount)
				setGameState(data.state)
			}else if(data.type === "GAME_START"){
				setGameState("ROUND_1")
			}
		}
		
		ws.onclose = () => {
			setRoomCode(null)
			setGameState("HOME")
			setPlayerCount(0)
			setIsReady(false)
		}
		
		ws.onerror = (error) => {
			console.error("Errore WebSocket:", error)
		}

		wsRef.current = ws
    }

	const sendReady = () => {
		if(wsRef.current){
			wsRef.current.send(JSON.stringify({type: "READY"}));
			setIsReady(true);
		}
	}

    const leaveRoom = () => {
    	if(wsRef.current){
			wsRef.current.close()
		}
		
    	setRoomCode(null)
    }

    return (
		<div style={{minHeight: "100vh", backgroundColor: "#fafafa", padding: "20px", fontFamily: "sans-serif"}}>
			{gameState === "HOME" && <Home joinRoom={joinRoom}/>}

			{(gameState === "WAITING" || gameState === "FULL") && (
				<Lobby 
					roomCode={roomCode}
					playerCount={playerCount}
					isReady={isReady}
					sendReady={sendReady}
					roomState={gameState}
				/>
			)}

			{gameState === "ROUND_1" && (
				<div style={{maxWidth: "800px", margin: "0 auto"}}>
				<div style={{display: "flex", justifyContent: "space-between", padding: "10px 20px", backgroundColor: "white", borderRadius: "8px", marginBottom: "20px"}}>
					<h2 style={{margin: 0 }}>Round 1: La Testa</h2>
					<button onClick={leaveRoom} style={{padding: "8px 15px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}>
						Abbandona
					</button>
				</div>
				<CanvasBoard />
				</div>
			)}
		</div>
    )
}

export default App