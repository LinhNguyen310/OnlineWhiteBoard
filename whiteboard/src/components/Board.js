import React, {useRef, useEffect} from 'react'
import './styles/board.css'

const Board = ()=> {
    const canvasRef = useRef(null);
    const colorsRef = useRef(null);
    const socketRef = useRef();

    useEffect(() =>{
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const colors = document.getElementsByClassName('color')
        const current = {
            color : 'black'
        }

        let dataURL = ''
        let drawing = false

        const onColorUpdate = (e)=> {
            current.color = e.target.className.split(' ')[1]
        }

        const drawLine = (x0, y0, x1, y1, color, send) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
            context.save()
        }

        const onMousedown = (e) => {
            drawing = true
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        }
        const onMousemove = (e) => {
            if (!drawing) return;
            drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true)
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        }

        const onMouseup = (e) => {
            drawing = false
            drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true)
        }


        const throttle = (callback,  delay) => {
            let previousCall = new Date().getTime()
            return function (){
                const time = new Date().getTime()
                if ((time = previousCall) >= delay){
                    previousCall = time
                    callback.apply (null, arguments)
                }

            }
            }

        canvas.addEventListener('mousedown', onMousedown, false)
        canvas.addEventListener('mouseup', onMouseup, false)
        canvas.addEventListener('mouseout', onMouseup, false)
        canvas.addEventListener('mousemove', throttle(onMousemove, 10), false)

        canvas.addEventListener('touchstart', onMousedown, false)
        canvas.addEventListener('touchend', onMouseup, false)
        canvas.addEventListener('touchcancel', onMouseup, false)
        canvas.addEventListener('touchmove', throttle(onMousemove, 10), false)



        for (let i = 0; i <colors.length; i ++){
            colors[i].addEventListener('click', onColorUpdate, false)
        }
        const onResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            let img = document.createElement('img')
            img.src = dataURL
            context.drawImage(img, 0, 0)
            context.restore()
        }
        window.addEventListener('resize', onResize, false)
        onResize()


        const onDrawingEvent = (data) => {
            const w = canvas.width
            const h = canvas.height

            drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color)
        }

        socketRef.current = new WebSocket('wss://echo.websocket.org')

        socketRef.current.onopen = e => {
            console.log('open', e)
        }

        socketRef.current.onmessage = e => {
            console.log(e)
        }

        socketRef.onerror = e => {
            console.log('error', e)
        }

    } , [])

    return (
        <div>
            <canvas ref = {canvasRef} className='whiteboard'/>
            <div ref = {colorsRef} className='colors'>
                <div className='color black'/>
                <div className='color red'/>
                <div className='color green'/>
                <div className='color blue'/>
                <div className='color yellow'/>
            </div>
        </div>
    )
}

export default Board;