import React, {useState} from "react"
import Home from "./components/Home.jsx"
import CanvasBoard from "./components/CanvasBoard.jsx"
// TODO: REFACTORING
const App = () => {
    const [roomCode, setRoomCode] = useState(null)

    const joinRoom = (code) => {
        setRoomCode(code)
        // DA FARE: COLLEGAMENTO AL SERVER GO
        console.log(`Connessione alla stanza: ${code}`)
    }

    const leaveRoom = () => {
    	setRoomCode(null)
    }

    return (
		<div style={{minHeight: "100vh", backgroundColor: "#fafafa", padding: "20px", fontFamily: "sans-serif"}}>
			{!roomCode ? (
				<Home joinRoom={joinRoom}/>
			) : (
				<div style={{maxWidth: "800px", margin: "0 auto"}}>
					<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "20px"}}>
						<h2 style={{margin: 0, color: "#2c3e50" }}>Stanza: <span style={{ color: "#e74c3c"}}>{roomCode}</span></h2>
						<button 
							onClick={leaveRoom}
							style={{padding: "8px 15px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}
						>
							Esci
						</button>
					</div>

					<CanvasBoard/>
				</div>
			)}
		</div>
    )
}

export default App