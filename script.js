const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const mover = document.getElementById('canvas-mover');
const mCanvas = document.getElementById('mainCanvas');
const fCanvas = document.getElementById('fireCanvas');
const mCtx = mCanvas.getContext('2d');
const fCtx = fCanvas.getContext('2d');

// ১.০২৪ বিলিয়ন পিক্সেল ম্যাপ সাইজ
mCanvas.width = fCanvas.width = 32000; 
mCanvas.height = fCanvas.height = 32000;

let scale = 0.05, posX = 0, posY = 0, isDragging = false, startX, startY;
let pixelData = {};

// গ্রিড বা দাগ টানার ফাংশন
function drawGrid() {
    mCtx.strokeStyle = "#dddddd"; // হালকা ধূসর দাগ
    mCtx.lineWidth = 2;
    for (let x = 0; x <= 32000; x += 200) {
        mCtx.beginPath(); mCtx.moveTo(x, 0); mCtx.lineTo(x, 32000); mCtx.stroke();
    }
    for (let y = 0; y <= 32000; y += 200) {
        mCtx.beginPath(); mCtx.moveTo(0, y); mCtx.lineTo(32000, y); mCtx.stroke();
    }
}
drawGrid(); // শুরুতে দাগ টেনে নেওয়া

function apply() { mover.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`; }
apply();

// জুম লজিক
window.addEventListener('wheel', (e) => {
    if (e.target.closest('#viewport')) {
        e.preventDefault();
        scale *= e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.min(Math.max(0.01, scale), 1.5);
        apply();
    }
}, { passive: false });

// নাড়াচাড়া ও পপ-আপ
window.onmousemove = (e) => {
    if (isDragging) {
        posX = e.clientX - startX; posY = e.clientY - startY; apply();
    }
    const r = mCanvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale;
    const y = (e.clientY - r.top) / scale;

    let hovered = null;
    Object.keys(pixelData).forEach(id => {
        let col = (id-1)%160, row = Math.floor((id-1)/160);
        if(x > col*200 && x < col*200+200 && y > row*200 && y < row*200+200) hovered = pixelData[id];
    });

    if(hovered) {
        tooltip.classList.remove('hidden');
        tooltip.style.left = e.clientX + 20 + "px"; tooltip.style.top = e.clientY + 20 + "px";
        document.getElementById('tt-title').innerText = hovered.companyName || "Partner";
        document.getElementById('tt-desc').innerText = hovered.description || "200x200 Slot";
    } else { tooltip.classList.add('hidden'); }
};

window.onmousedown = (e) => { if(e.target.closest('#viewport')){ isDragging = true; startX = e.clientX-posX; startY = e.clientY-posY; } };
window.onmouseup = () => isDragging = false;

// ডাটাবেস থেকে লোগো লোড
db.ref('pixels').on('value', snap => {
    pixelData = snap.val() || {};
    mCtx.clearRect(0,0,32000,32000);
    drawGrid(); // প্রতিবার ছবি লোড হলে গ্রিড পুনরায় আঁকবে
    Object.keys(pixelData).forEach(id => {
        let p = pixelData[id];
        let img = new Image(); img.src = p.imageUrl;
        img.onload = () => mCtx.drawImage(img, ((id-1)%160)*200, Math.floor((id-1)/160)*200, 200, 200);
    });
});
