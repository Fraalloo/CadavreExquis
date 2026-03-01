import React from "react"

const Toolbar = ({
    color,
    setColor,
    lineWidth,
    setLineWidth,
    isEraser,
    setIsEraser,
    undo,
    clearCanvas
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
                style={{backgroundColor: isEraser ? "#ffcccc" : "white", border: "1px solid #ccc", padding: "5px 10px", borderRadius: "4px", cursor: "pointer"}}
            >
                {isEraser ? "✏️ Usa Pennello" : "🧽 Gomma"}
            </button>

            <button onClick={undo} style={{padding: "5px 10px", cursor: "pointer"}}>↩️ Annulla</button>
            <button onClick={clearCanvas} style={{padding: "5px 10px", cursor: "pointer", color: "red"}}>🗑️ Pulisci</button>
            
            {/* Separatore */}
            <div style={{flex: 1}}></div>
        </div>
    )
}

export default Toolbar