const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const mover = document.getElementById('canvas-mover');
const mCanvas = document.getElementById('mainCanvas');
const fCanvas = document.getElementById('fireCanvas');
const mCtx = mCanvas.getContext('2d');
const fCtx = fCanvas.getContext('2d');

mCanvas.width = fCanvas.width = 16000; 
mCanvas.height = fCanvas.height = 16000;

let scale = 0.08, posX = 0, posY = 0, isDragging = false, startX, startY;
let pixelData = {};

function drawGrid() {
    mCtx.strokeStyle = "#e0e0e0";
    mCtx.lineWidth = 1;
    for(let x=0; x<=16000; x+=200){ mCtx.beginPath(); mCtx.moveTo(x,0); mCtx.lineTo(x,16000); mCtx.stroke(); }
    for(let y=0; y<=16000; y+=200){ mCtx.beginPath(); mCtx.moveTo(0,y); mCtx.lineTo(16000,y); mCtx.stroke(); }
}

function apply() { mover.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`; }
apply();

window.addEventListener('wheel', (e) => {
    if (e.target.closest('#viewport')) {
        e.preventDefault();
        scale *= e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(0.02, Math.min(scale, 1.5));
        apply();
    }
}, { passive: false });

window.onmousemove = (e) => {
    if (isDragging) { posX = e.clientX - startX; posY = e.clientY - startY; apply(); }
    const r = mCanvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale;
    const y = (e.clientY - r.top) / scale;
    // Tooltip logic here...
};

window.onmousedown = (e) => { if(e.target.closest('#viewport')){ isDragging = true; startX = e.clientX-posX; startY = e.clientY-posY; }};
window.onmouseup = () => isDragging = false;

db.ref('pixels').on('value', snap => {
    pixelData = snap.val() || {};
    mCtx.clearRect(0,0,16000,16000);
    drawGrid();
    Object.keys(pixelData).forEach(id => {
        let p = pixelData[id];
        let img = new Image(); img.src = p.imageUrl;
        img.onload = () => mCtx.drawImage(img, ((id-1)%80)*200, Math.floor((id-1)/80)*200, 200, 200);
    });
});
