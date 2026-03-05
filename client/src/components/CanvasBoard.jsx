import React, {useRef, useState, useEffect} from "react"
import Toolbar from "./Toolbar.jsx"
import {CANVAS_WIDTH, CANVAS_HEIGHT, SECTION_HEIGHT} from "../utils/config.js"

const CanvasBoard = ({round = 1, sendDrawing, previousImage}) => {
    const canvasRef = useRef(null)
    const contextRef = useRef(null)
    
    // Stati degli strumenti
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState("#000000")
    const [lineWidth, setLineWidth] = useState(5)
    const [isEraser, setIsEraser] = useState(false)
    
    // Stato per l"Undo
    const [history, setHistory] = useState([])

    const minY = (round - 1) * SECTION_HEIGHT
    const maxY = round * SECTION_HEIGHT

    // Inizializzazione del Canvas
    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = CANVAS_WIDTH
        canvas.height = CANVAS_HEIGHT
        
        const context = canvas.getContext("2d")
        context.lineCap = "round"
        context.lineJoin = "round"
        // Sfondo bianco di default (altrimenti il PNG avrà sfondo trasparente)
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        contextRef.current = context
        
        saveHistoryState(canvas)
    }, [round])

    // Aggiorna il contesto quando cambiano colore o spessore
    useEffect(() => {
        if(contextRef.current){
            contextRef.current.strokeStyle = isEraser ? "white" : color
            contextRef.current.lineWidth = lineWidth
        }
    }, [color, lineWidth, isEraser])

    const isWithinBounds = y => y >= minY && y <= maxY

    const getCoordinates = (e) => {
        if(e.touches && e.touches.length > 0){
            const touch = e.touches[0]
            const canvas = canvasRef.current
            const rect = canvas.getBoundingClientRect()
            
            // Scala per rimpicciolimento dei dispositivi mobile 
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            return {
                offsetX: (touch.clientX - rect.left) * scaleX,
                offsetY: (touch.clientY - rect.top) * scaleY
            }
        }else{
            return {
                offsetX: e.nativeEvent.offsetX,
                offsetY: e.nativeEvent.offsetY
            }
        }
    }

    // Funzioni di disegno
    const startDrawing = (e) => {
        const {offsetX, offsetY} = getCoordinates(e)
        if(!isWithinBounds(offsetY)) return

        contextRef.current.beginPath()
        contextRef.current.moveTo(offsetX, offsetY)
        setIsDrawing(true)
    }

    const draw = (e) => {
        if(!isDrawing) return
        const {offsetX, offsetY} = getCoordinates(e)
        if(!isWithinBounds(offsetY)){
            stopDrawing()
            return
        }

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

    const clearPartialCanvas = () => {
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        context.fillStyle = "white"
        context.fillRect(0, minY, canvas.width, SECTION_HEIGHT)
        saveHistoryState(canvas)
    }

    const handleDone = () => {
        const canvas = canvasRef.current
        const imageData = canvas.toDataURL("image/png")
        sendDrawing(imageData)
    }

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px"}}>
            <div style={{position: "sticky", top: 0, zIndex: 50, backgroundColor: "transparent"}}>
                <Toolbar 
                    color={color} setColor={setColor}
                    lineWidth={lineWidth} setLineWidth={setLineWidth}
                    isEraser={isEraser} setIsEraser={setIsEraser}
                    undo={undo} clearPartialCanvas={clearPartialCanvas}
                />
            </div>

            {/* Contenitore relativo per sovrapporre le linee */}
            <div style={{position: "relative", border: "2px solid #333", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                    style={{display: "block", touchAction: "none"}}
                />

                {/* Overlay superiore dei round precedenti */}
                {round > 1 && (
                    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: `${minY}px`, backgroundColor: "white", zIndex: 10, overflow: "hidden" }}>
                        {previousImage && (
                            <img
                                src={previousImage}
                                alt="Precedente"
                                style={{position: "absolute", top: 0, left: 0, width: "100%", opacity: 0.4}}
                            />
                        )}

                        {/* Il div dell'overlay */}
                        <div style={{ 
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
                            background: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) calc(100% - 30px), transparent 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                        }}>
                            <p style={{margin: 0, opacity: 0.5, fontSize: "1.2rem"}}>Disegno precedente</p>
                        </div>
                    </div>
                )}

                {/* Overlay inferiore dei round futuri */}
                {round < 3 && (
                    <div style={{position: "absolute", top: `${maxY}px`, left: 0, width: "100%", height: `${CANVAS_HEIGHT - maxY}px`, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.2rem"}}>
                        <p style={{margin: 0, opacity: 0.5}}>Area bloccata</p>
                    </div>
                )}

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

            <div style={{display: "flex", flexDirection: "column", padding: "1%", position: "sticky", bottom: 0, zIndex: 50, backgroundColor: "#fafafa", borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
                <button 
                    onClick={handleDone}
                    style={{marginTop: "20px", padding: "15px 40px", fontSize: "1.2rem", fontWeight: "bold", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}}
                >
                    🎨 FATTO! Invia disegno
                </button>

                <p style={{marginTop: "10px", color: "#666", fontSize: "14px"}}>
                    Le linee tratteggiate servono da guida e non verranno salvate nel PNG.
                </p>
            </div>
        </div>
    )
}

export default CanvasBoard