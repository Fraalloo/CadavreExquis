import React from "react"

const Toolbar = ({
    color,
    setColor,
    lineWidth,
    setLineWidth,
    isEraser,
    setIsEraser,
    undo,
    clearPartialCanvas
}) => {
    return (
        <div style={{display: "flex", gap: "15px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "8px", marginBottom: "10px", alignItems: "center", flexWrap: "wrap"}}>
            {/* Colore */}
            <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <label htmlFor="colorPicker">Colore:</label>
                <input
                    type="color" 
                    id="colorPicker" 
                    value={isEraser ? "#ffffff" : color} 
                    onChange={e => {
                        setColor(e.target.value)
                        setIsEraser(false)
                    }} 
                    disabled={isEraser}
                />
            </div>

            {/* Spessore */}
            <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <label htmlFor="lineWidth">Spessore:</label>
                <input 
                    type="range" 
                    id="lineWidth" 
                    min="1" 
                    max="20" 
                    value={lineWidth} 
                    onChange={(e) => setLineWidth(e.target.value)}
                />
            </div>

            {/* Strumenti */}
            <button 
                onClick={() => setIsEraser(!isEraser)}
                style={{padding: "5px 10px", backgroundColor: isEraser ? "#ffcccc" : "white", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer"}}
            >
                {isEraser ? "✏️ Usa Pennello" : "🧽 Gomma"}
            </button>

            <button onClick={undo} style={{padding: "5px 10px", cursor: "pointer", backgroundColor: "white", borderRadius: "4px", border: "1px solid #ccc"}}>↩️ Annulla</button>
            <button onClick={clearPartialCanvas} style={{padding: "5px 10px", cursor: "pointer", color: "red", backgroundColor: "white", borderRadius: "4px", border: "1px solid #ccc"}}>🗑️ Pulisci</button>
            
            {/* Separatore */}
            <div style={{flex: 1}}></div>
        </div>
    )
}

export default Toolbar