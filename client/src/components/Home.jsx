import React, {useState} from "react"

const Home = ({joinRoom}) => {
    const [roomInput, setRoomInput] = useState("")

    // Codice casuale della stanza
    const createNewRoom = () => {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        joinRoom(newCode)
    }

    const handleJoin = e => {
        e.preventDefault()
        if(roomInput.trim().length > 0){
            joinRoom(roomInput.trim().toUpperCase())
        }
    }

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", fontFamily: "sans-serif"}}>
            <h1 style={{fontSize: "3rem", marginBottom: "10px", color: "#2c3e50"}}>Cadavre Exquis</h1>
            <p style={{fontSize: "1.2rem", color: "#7f8c8d", marginBottom: "40px"}}>Il gioco di disegno cooperativo</p>

            <div style={{display: "flex", flexDirection: "column", gap: "20px", width: "300px"}}>
                <button 
                    onClick={createNewRoom}
                    style={{padding: "15px", fontSize: "1.1rem", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}}
                >
                    ✨ Crea Nuova Stanza
                </button>

                <div style={{display: "flex", alignItems: "center", gap: "10px", margin: "10px 0"}}>
                    <hr style={{flex: 1, border: "none", borderTop: "1px solid #ddd"}}/>
                    <span style={{color: "#aaa", fontSize: "0.9rem" }}>OPPURE</span>
                    <hr style={{flex: 1, border: "none", borderTop: "1px solid #ddd"}}/>
                </div>

                <form onSubmit={handleJoin} style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                    <input 
                        type="text" 
                        placeholder="Codice stanza (es. A7X9WQ)" 
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        style={{padding: "12px", fontSize: "1rem", border: "2px solid #ddd", borderRadius: "8px", textAlign: "center", textTransform: "uppercase"}}
                    />
                    <button 
                        type="submit"
                        style={{padding: "15px", fontSize: "1.1rem", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}}
                    >
                        Entra nella Stanza
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Home