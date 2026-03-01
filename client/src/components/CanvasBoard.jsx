import React, {useRef, useState, useEffect} from "react"
import Toolbar from "./Toolbar.jsx"

const CanvasBoard = () => {
    const canvasRef = useRef(null)
    const contextRef = useRef(null)
    
    // Stati degli strumenti
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState("#000000")
    const [lineWidth, setLineWidth] = useState(5)
    const [isEraser, setIsEraser] = useState(false)
    
    // Stato per l'Undo
    const [history, setHistory] = useState([])

    // Inizializzazione del Canvas
    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = 400
        canvas.height = 600
        
        const context = canvas.getContext("2d")
        context.lineCap = "round"
        context.lineJoin = "round"
        // Sfondo bianco di default (altrimenti il PNG avrà sfondo trasparente)
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        contextRef.current = context
        
        saveHistoryState(canvas)
    }, [])

    // Aggiorna il contesto quando cambiano colore o spessore
    useEffect(() => {
        if(contextRef.current){
            contextRef.current.strokeStyle = isEraser ? "white" : color
            contextRef.current.lineWidth = lineWidth
        }
    }, [color, lineWidth, isEraser])

    // Funzioni di disegno
    const startDrawing = ({nativeEvent}) => {
        const {offsetX, offsetY} = nativeEvent
        contextRef.current.beginPath()
        contextRef.current.moveTo(offsetX, offsetY)
        setIsDrawing(true)
    }

    const draw = ({nativeEvent}) => {
        if(!isDrawing) return
        const {offsetX, offsetY} = nativeEvent
        contextRef.current.lineTo(offsetX, offsetY)
        contextRef.current.stroke()
    }

    const stopDrawing = () => {
        if(!isDrawing) return
        contextRef.current.closePath()
        setIsDrawing(false)
        saveHistoryState(canvasRef.current)
    }

    // Funzioni di utilità
    const saveHistoryState = (canvas) => {
        const dataUrl = canvas.toDataURL()
        setHistory((prev) => [...prev, dataUrl])
    }

    const undo = () => {
        if(history.length > 1){
            const newHistory = [...history]
            newHistory.pop()
            const previousState = newHistory[newHistory.length - 1]
            
            const canvas = canvasRef.current
            const context = canvas.getContext("2d")
            const img = new Image()
            img.src = previousState
            img.onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height)
                context.drawImage(img, 0, 0)
            }
            setHistory(newHistory)
        }
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        saveHistoryState(canvas)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
        
            <Toolbar 
                color={color} setColor={setColor}
                lineWidth={lineWidth} setLineWidth={setLineWidth}
                isEraser={isEraser} setIsEraser={setIsEraser}
                undo={undo} clearCanvas={clearCanvas}
            />

            {/* Contenitore relativo per sovrapporre le linee */}
            <div style={{position: "relative", border: "2px solid #333", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{display: "block", touchAction: "none"}}
                />

                {/* Overlay delle linee di mezzeria*/}
                <div style={{ 
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
                    pointerEvents: "none", display: "flex", flexDirection: "column" 
                }}>
                {/* Sezione Testa */}
                <div style={{flex: 1, borderBottom: "2px dashed rgba(0,0,0,0.3)"}}></div>
                {/* Sezione Busto */}
                <div style={{flex: 1, borderBottom: "2px dashed rgba(0,0,0,0.3)"}}></div>
                {/* Sezione Gambe */}
                <div style={{flex: 1}}></div>
                </div>
            </div>
            <p style={{marginTop: "10px", color: "#666", fontSize: "14px"}}>
                Le linee tratteggiate servono da guida e non verranno salvate nel PNG.
            </p>
        </div>
    )
}

export default CanvasBoard