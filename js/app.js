
// --- USER CUSTOM WEBSITE SCRIPT ---
const sparkleCanvas = document.getElementById('sparkle-canvas');
const sparkleCtx = sparkleCanvas.getContext('2d');
const mainCursor = document.getElementById('cursor-main');

let mouse = { x: 0, y: 0 };
let cursorParticles = [];

window.addEventListener('mousemove', (e) => {
    mouse = { x: e.clientX, y: e.clientY };
    mainCursor.style.left = mouse.x + 'px';
    mainCursor.style.top = mouse.y + 'px';
});

function animateCursor() {
    if (Math.random() > 0.9) {
        cursorParticles.push({
            x: mouse.x + (Math.random() - 0.5) * 8,
            y: mouse.y + 8,
            life: 1,
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 1 + 0.2,
            size: Math.random() * 1.2 + 0.2
        });
    }

    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
    cursorParticles.forEach((p, i) => {
        sparkleCtx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
        sparkleCtx.beginPath();
        sparkleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        sparkleCtx.fill();

        p.x += p.vx + Math.sin(p.life * 5) * 0.2;
        p.y += p.vy;
        p.life -= 0.015;

        if (p.life <= 0) cursorParticles.splice(i, 1);
    });
    requestAnimationFrame(animateCursor);
}

window.addEventListener('resize', () => { 
    sparkleCanvas.width = window.innerWidth; 
    sparkleCanvas.height = window.innerHeight; 
});
window.dispatchEvent(new Event('resize'));
animateCursor();

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
    const symbol = link.querySelector('.symbol');
    const originalSymbol = symbol?.textContent.trim();
    link.addEventListener('mouseenter', () => {
        if (originalSymbol === '➜') symbol.textContent = '↗';
        else if (originalSymbol === '┃') symbol.textContent = '×';
        mainCursor.style.opacity = '0';
    });
    link.addEventListener('mouseleave', () => {
        if (symbol) symbol.textContent = originalSymbol;
        mainCursor.style.opacity = '1';
    });
});
