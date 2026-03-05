import React, {useState, useRef} from "react"
import Home from "./components/Home.jsx"
import Lobby from "./components/Lobby.jsx"
import CanvasBoard from "./components/CanvasBoard.jsx"
import {CANVAS_WIDTH, CANVAS_HEIGHT} from "./utils/config.js"
import {jsonready, jsonsubmit} from "./utils/websocket.js"
import {papers2png} from "./utils/media.js"
import styles from "./App.module.css"

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
			console.log("Connessione già in corso, blocco il tentativo duplicato!")
			return
		}

		const address = import.meta.env.VITE_SERVER_ADDRESS || window.location.hostname
    	const port = import.meta.env.VITE_SERVER_PORT || "1773"
		const ws = new WebSocket(`ws://${address}:${port}/ws?room=${code}`)

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
            		console.log("Messaggio sconosciuto:", data)
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

	const sendReady = () => {setIsReady(jsonready(wsRef))}

	const sendDrawing = imageData => {setHasSubmitted(jsonsubmit(wsRef, imageData, currentRound))}

	const downloadPNG = async (paper, index) => {papers2png(paper, index, CANVAS_HEIGHT, CANVAS_WIDTH)}

    const leaveRoom = () => {
    	if(wsRef.current){
			wsRef.current.close()
		}
		
    	setRoomCode(null)
    }

    return (
		<div className={styles.appContainer}>
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
				<div className={styles.roundContainer}>
					<div className={styles.roundHeader}>
						<h2 className={styles.roundTitle}>Round {currentRound}: {currentRound === 1 ? "La Testa" : currentRound === 2 ? "Il Busto" : "Le Gambe"}</h2>
						<button onClick={leaveRoom} className={styles.leaveButton}>
							Abbandona
						</button>
					</div>

					{hasSubmitted ? (
						<div className={styles.submittedContainer}>
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
				<div className={styles.gameOverContainer}>
					<h1 className={styles.gameOverTitle}>"Capolavori" Completati!</h1>
					<button
						onClick={() => window.location.reload()}
						className={styles.playAgainButton}
					>
						Gioca di nuovo
					</button>
					
					<div className={styles.papersList}>
						{finalPapers.map((paper, index) => (
							<div key={index} className={styles.paperItem}>
								<h3 className={styles.paperTitle}>Capolavoro {index + 1}</h3>
								
								{/* Sovrapposizione delle 3 immagini*/}
								<div className={styles.canvasContainer}>
									<img src={paper[0]} className={styles.final_img} alt="Testa"/>
									<img src={paper[1]} className={styles.final_img} alt="Busto"/>
									<img src={paper[2]} className={styles.final_img} alt="Gambe"/>
								</div>

								<button 
                                    onClick={() => downloadPNG(paper, index)}
                                    className={styles.downloadButton}
                                >
                                    🧨 Scarica Capolavoro
                                </button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
    )
}

export default App