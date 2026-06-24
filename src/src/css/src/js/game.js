// Core Engine & State Controller
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'TUTORIAL';
let score = 0;
const targetScore = 10;
let health = 100;

let core = { x: 0, y: 0, radius: 40, pulse: 0 };
let enemies = [];
let particles = [];
let spawnTimer = 0;

function handleCTAClick() {
    alert("Portfolio Demo: Redirecting to App Store!");
}

function resize() {
    const baseWidth = 720;
    const baseHeight = 1280;
    let w = window.innerWidth;
    let h = window.innerHeight;

    if (w / h > baseWidth / baseHeight) {
        w = h * (baseWidth / baseHeight);
    } else {
        h = w / (baseHeight / baseWidth);
    }

    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(w / baseWidth, h / baseHeight);
    
    core.x = baseWidth / 2;
    core.y = baseHeight / 2;
}
window.addEventListener('resize', resize);
resize();

function handleInput(clientX, clientY) {
    if (gameState !== 'PLAYING') return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((clientX - rect.left) / rect.width) * 720;
    const clickY = ((clientY - rect.top) / rect.height) * 1280;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const dist = Math.hypot(enemies[i].x - clickX, enemies[i].y - clickY);
        if (dist < enemies[i].radius + 30) {
            for (let p = 0; p < 12; p++) {
                particles.push(new Particle(enemies[i].x, enemies[i].y, '#ff0055'));
            }
            enemies.splice(i, 1);
            score++;
            if (score >= targetScore) endGame(true);
            break;
        }
    }
}

window.addEventListener('touchstart', (e) => handleInput(e.touches[0].clientX, e.touches[0].clientY));
window.addEventListener('mousedown', (e) => handleInput(e.clientX, e.clientY));

function startGame() {
    gameState = 'PLAYING';
    document.getElementById('tutorial-overlay').classList.add('hidden');
}

function endGame(isWin) {
    gameState = 'END';
    const ctaOverlay = document.getElementById('cta-overlay');
    const title = document.getElementById('end-title');
    const subtitle = document.getElementById('end-subtitle');

    if (isWin) {
        title.innerText = "System Restored!";
        subtitle.innerText = `Excellent reflex mechanics! You saved the core with ${health}% health remaining.`;
    } else {
        title.innerText = "Core Breached!";
        subtitle.innerText = "The system has been overwhelmed.";
    }
    ctaOverlay.classList.remove('hidden');
}

function update() {
    if (gameState === 'PLAYING') {
        spawnTimer++;
        if (spawnTimer > 40) {
            enemies.push(new Enemy(core.x, core.y));
            spawnTimer = 0;
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].update();
            const dist = Math.hypot(enemies[i].x - core.x, enemies[i].y - core.y);
            if (dist < enemies[i].radius + core.radius) {
                health -= 20;
                for (let p = 0; p < 8; p++) {
                    particles.push(new Particle(enemies[i].x, enemies[i].y, '#00f2fe'));
                }
                enemies.splice(i, 1);
                if (health <= 0) endGame(false);
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
    core.pulse += 0.05;
}

function draw() {
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 720, 1280);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 720; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1280); ctx.stroke();
    }
    for (let j = 0; j < 1280; j += 60) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(720, j); ctx.stroke();
    }

    ctx.save();
    ctx.beginPath();
    const pulseRadius = core.radius + Math.sin(core.pulse) * 5;
    ctx.arc(core.x, core.y, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2fe';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00f2fe';
    ctx.fill();
    ctx.restore();

    enemies.forEach(e => e.draw(ctx));
    particles.forEach(p => p.draw(ctx));

    if (gameState === 'PLAYING') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Crystals Defused: ${score} / ${targetScore}`, 40, 60);

        ctx.textAlign = 'right';
        ctx.fillStyle = health > 40 ? '#00f2fe' : '#ff0055';
        ctx.fillText(`Core Stability: ${health}%`, 680, 60);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

document.getElementById('start-btn').addEventListener('click', (e) => { e.stopPropagation(); startGame(); });
document.getElementById('cta-btn').addEventListener('click', (e) => { e.stopPropagation(); handleCTAClick(); });

requestAnimationFrame(loop);
      
