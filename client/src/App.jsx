import React, {useState, useRef} from "react"
import Home from "./components/Home.jsx"
import Lobby from "./components/Lobby.jsx"
import CanvasBoard from "./components/CanvasBoard.jsx"

const App = () => {
    const [roomCode, setRoomCode] = useState(null)
	const [gameState, setGameState] = useState("HOME")
	const [playerCount, setPlayerCount] = useState(0)
	const [isReady, setIsReady] = useState(false)
	const [currentRound, setCurrentRound] = useState(1)
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const [previousImage, setPreviousImage] = useState(null)
  	const [finalPapers, setFinalPapers] = useState([])
	const wsRef = useRef(null)

    const joinRoom = (code) => {
		if(wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)){
			console.log("Connessione già in corso, blocco il tentativo duplicato!");
			return;
		}

		const ws = new WebSocket(`ws://${window.location.hostname}:1775/ws?room=${code}`) // Hardcoded temporaneamente

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

			switch(data.type){
				case "STATE_UPDATE":
					setPlayerCount(data.playerCount)
					setGameState(data.state)
					break

				case "GAME_START":
					setGameState("ROUND_1")
					setCurrentRound(1)
					setHasSubmitted(false)
					break

				case "NEXT_ROUND":
					setGameState(`ROUND_${data.round}`)
					setCurrentRound(data.round)
					setPreviousImage(data.image)
					setHasSubmitted(false)
					break

				case "GAME_OVER":
					setGameState("GAME_OVER")
					setFinalPapers(data.papers)
					break
				
				default:
            		console.log("Messaggio sconosciuto:", data);
			}
		}
		
		ws.onclose = () => {
			setRoomCode(null)
			setGameState("HOME")
			setPlayerCount(0)
			setIsReady(false)
			wsRef.current = null
		}
		
		ws.onerror = (error) => {
			alert("Errore WebSocket:", error)
		}

		wsRef.current = ws
    }

	const sendReady = () => {
		if(wsRef.current){
			wsRef.current.send(JSON.stringify({type: "READY"}))
			setIsReady(true)
		}
	}

	const sendDrawing = (imageData) => {
		if(wsRef.current){
			wsRef.current.send(JSON.stringify({ 
				type: "SUBMIT_DRAWING", 
				image: imageData,
				round: currentRound
			}))
			setHasSubmitted(true)
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

			{gameState.startsWith("ROUND_") && (
				<div style={{maxWidth: "800px", margin: "0 auto"}}>
					<div style={{display: "flex", justifyContent: "space-between", padding: "10px 20px", backgroundColor: "white", borderRadius: "8px", marginBottom: "20px"}}>
						<h2 style={{margin: 0}}>Round {currentRound}: {currentRound === 1 ? "La Testa" : currentRound === 2 ? "Il Busto" : "Le Gambe"}</h2>
						<button onClick={leaveRoom} style={{padding: "8px 15px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}>
							Abbandona
						</button>
					</div>

					{hasSubmitted ? (
						<div style={{textAlign: "center", padding: "50px", backgroundColor: "white", borderRadius: "8px"}}>
							<h3>Disegno inviato! 🎨</h3>
							<p>In attesa che gli altri giocatori finiscano...</p>
						</div>
					) : (
						<CanvasBoard
							round={currentRound}
							sendDrawing={sendDrawing}
							previousImage={previousImage}
						/>
					)}
				</div>
			)}

			{gameState === "GAME_OVER" && (
				<div style={{textAlign: "center"}}>
					<h1 style={{color: "#2c3e50", fontSize: "2.5rem"}}>"Capolavori" Completati!</h1>
					<button
						onClick={() => window.location.reload()}
						style={{marginBottom: "30px", padding: "10px 20px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}
					>
						Gioca di nuovo
					</button>
					
					<div style={{display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap"}}>
						{finalPapers.map((paper, index) => (
							<div key={index} style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
								<h3 style={{color: "#7f8c8d"}}>Creatura {index + 1}</h3>
								
								{/* Contenitore dei capolavori */}
								<div style={{ 
									position: "relative", 
									width: "300px", 
									height: "450px",
									backgroundColor: "white", 
									border: "4px solid #2c3e50", 
									borderRadius: "8px", 
									boxShadow: "0 10px 20px rgba(0,0,0,0.1)" 
								}}>

								{/* Sovrapposizione delle 3 immagini*/}
								<img src={paper[0]} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", mixBlendMode: "multiply"}} alt="Testa"/>
								<img src={paper[1]} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", mixBlendMode: "multiply"}} alt="Busto"/>
								<img src={paper[2]} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", mixBlendMode: "multiply"}} alt="Gambe"/>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
    )
}

export default App