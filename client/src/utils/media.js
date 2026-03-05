const loadImage = src => {
    return new Promise(res => {
        const img = new Image()
        img.onload = () => res(img)
        img.src = src
    })
}

export const papers2png = async (paper, index, width, height) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")    

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.globalCompositeOperation = "multiply"

    for(let i = 0; i < paper.length; i++){
        if(paper[i]){
            const img = await loadImage(paper[i])
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
    }

    const link = document.createElement("a")
    link.download = `cadavre-${Math.random().toString(36).substring(2, 8).toUpperCase()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
}