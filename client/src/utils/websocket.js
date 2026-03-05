export const jsonready = ws => {
    if(ws.current){
		ws.current.send(JSON.stringify({type: "READY"}))
        return true
	}
    
    return false
}

export const jsonsubmit = (ws, img, round) => {
    if(ws.current){
		ws.current.send(JSON.stringify({ 
			type: "SUBMIT_DRAWING", 
			image: img,
			round: round
		}))
		return true
	}

    return false
}