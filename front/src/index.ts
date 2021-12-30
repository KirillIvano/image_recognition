import './main.scss';
import './fonts.scss';

import {smoothLine} from './utils/smoothLine';
import {fetchStatus, fetchAtom} from './state';
import type {Dot} from './types';

const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
const submitBtnEl = document.getElementById('submit-btn') as HTMLButtonElement;
const clearBtnEl = document.getElementById('clear-btn') as HTMLButtonElement;
const resultEl = document.getElementById('result') as HTMLDivElement;

const bars = Array.from({length: 10}).map((_, i) => {
    const bar = document.createElement('div');
    const caption = document.createElement('div');
    const barBg = document.createElement('div');

    bar.classList.add('bar');
    barBg.classList.add('bar-bg');
    caption.classList.add('bar-caption');

    caption.innerText = String(i); 

    bar.append(barBg);
    bar.append(caption);
    resultEl.append(bar);

    return barBg;
})

const ctx = canvasEl.getContext('2d') as CanvasRenderingContext2D;

let drawing = false;
let currentLine: Dot[] = [];            

const {x: canvasX, y: canvasY, width: canvasWidth, height: canvasHeight} = canvasEl.getBoundingClientRect();

fetchAtom.subscribe(val => {
    for (const i in bars) {
        bars[i].style.transform = `scaleY(${String(val[i])})`;       
    }
});
fetchStatus.subscribe(status => {
    submitBtnEl.disabled = status === 'pending';
});

const clearScreen = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

const handleReset = () => {currentLine = []; fetchAtom.reset.dispatch()};
const handleMouseDown = () => {drawing = true; handleReset();}
const handleMouseUp = () => {
    if (!drawing) return;

    drawing = false;
    currentLine = smoothLine(currentLine);
}
const handleMouseMove = (e: MouseEvent) => {
    if (!drawing) return;
    currentLine.push([e.clientX - canvasX, e.clientY - canvasY]);
}

const handleDigest = async () => {
    if (!currentLine.length) return;
    fetchStatus.start.dispatch();

    try {
        const blob = await new Promise<Blob | null>(resolve => canvasEl.toBlob(resolve));
        if (!blob) throw new Error('Неизвестная ошибка')
    
        const res = await fetch('http://127.0.0.1:5000/check', {method: 'POST', body: blob});
        const json = await res.json() as {num: number[]};    

        fetchAtom.fulfilled.dispatch(json.num);
        fetchStatus.end.dispatch();
    } catch {
        fetchStatus.reset();
    }
}

const init = () => {
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('mousemove', handleMouseMove);

    submitBtnEl.addEventListener('click', handleDigest);
    clearBtnEl.addEventListener('click', handleReset);

    ctx.lineWidth = 18;
}

const FREQ = 30;
const DIFF = 1000 / FREQ;
let prevTiming = 0; 

const run = (timeout: number = 0) => {
    if (timeout - prevTiming < DIFF) {
        requestAnimationFrame(run);
        return;
    }

    prevTiming = timeout;

    clearScreen();

    const start = currentLine[0] ?? [0, 0];

    ctx.beginPath();
    ctx.moveTo(...start);

    for (const [x, y] of currentLine) {
        ctx.lineTo(x, y);
    }

    ctx.stroke();
    requestAnimationFrame(run);
}

init();
run();

