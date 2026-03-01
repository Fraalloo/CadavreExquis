import React from "react"

const Lobby = ({roomCode, playerCount, isReady, sendReady, roomState}) => {
    const isFull = roomState === "FULL"

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px", fontFamily: "sans-serif"}}>
            <h2>Stanza: <span style={{color: "#e74c3c"}}>{roomCode}</span></h2>
            
            <div style={{margin: "30px 0", padding: "20px", border: "2px solid #ddd", borderRadius: "10px", textAlign: "center", width: "300px"}}>
                <h3>Giocatori: {playerCount} / 3</h3>
                
                {/* Barra di progresso visuale */}
                <div style={{display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px"}}>
                    {[1, 2, 3].map(num => (
                        <div key={num} style={{ 
                            width: "20px", height: "20px", borderRadius: "50%", 
                            backgroundColor: num <= playerCount ? "#2ecc71" : "#ecf0f1" 
                        }}></div>
                    ))}
                </div>
            </div>

            {!isFull ? (
                <p style={{color: "#7f8c8d", fontStyle: "italic"}}>In attesa di altri giocatori...</p>
            ) : (
                <button 
                onClick={sendReady} 
                disabled={isReady}
                style={{ 
                    padding: "15px 40px", fontSize: "1.2rem", fontWeight: "bold", border: "none", borderRadius: "8px", cursor: isReady ? "default" : "pointer",
                    backgroundColor: isReady ? "#95a5a6" : "#f39c12", color: "white",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
                >
                {isReady ? "IN ATTESA DEGLI ALTRI..." : "PRONTO!"}
                </button>
            )}
        </div>
    )
}

export default Lobby