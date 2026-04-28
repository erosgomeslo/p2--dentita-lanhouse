// script.js – Landing Page Interactions
// Handles fade‑in scroll animations and smooth anchor navigation

// Fade‑in on scroll using IntersectionObserver
const animateElements = document.querySelectorAll('[data-animate]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animateElements.forEach(el => observer.observe(el));
} else {
  // Fallback – instantly show all
  animateElements.forEach(el => el.classList.add('animate-fade-in'));
}

// Smooth scrolling for internal links (if any)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Optional: Back to top button visibility (if you add one later)
// const backToTop = document.getElementById('back-to-top');
// if (backToTop) {
//   window.addEventListener('scroll', () => {
//     if (window.scrollY > 300) backToTop.classList.add('visible');
//     else backToTop.classList.remove('visible');
//   });
// }
// Pac-Man Game implementation
const playBtn = document.getElementById('play-game');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = false;
let pacman = { x: 1, y: 1, dir: 'right', nextDir: 'right' };
let ghosts = [
  { x: 18, y: 1, color: '#ff0000', dir: 'left' },
  { x: 18, y: 5, color: '#ffb8ff', dir: 'up' }
];
const tileSize = 20;

// Simple map: 1 = wall, 0 = path
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function drawMap() {
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === 1) {
        ctx.fillStyle = '#00ffef';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffef';
        ctx.fillRect(c * tileSize + 2, r * tileSize + 2, tileSize - 4, tileSize - 4);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawPacman() {
  ctx.fillStyle = '#ffff00';
  const px = pacman.x * tileSize + tileSize / 2;
  const py = pacman.y * tileSize + tileSize / 2;
  ctx.beginPath();
  ctx.arc(px, py, tileSize / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
  ctx.lineTo(px, py);
  ctx.fill();
}

function drawGhosts() {
  ghosts.forEach(g => {
    ctx.fillStyle = g.color;
    const gx = g.x * tileSize + tileSize / 2;
    const gy = g.y * tileSize + tileSize / 2;
    ctx.beginPath();
    ctx.arc(gx, gy, tileSize / 2 - 2, Math.PI, 0);
    ctx.lineTo(gx + tileSize / 2 - 2, gy + tileSize / 2 - 2);
    ctx.lineTo(gx - (tileSize / 2 - 2), gy + tileSize / 2 - 2);
    ctx.fill();
  });
}

function canMove(nx, ny) {
  return map[ny] && map[ny][nx] === 0;
}

function update() {
  // Update Pacman
  if (canMove(pacman.x + (pacman.nextDir === 'right' ? 1 : pacman.nextDir === 'left' ? -1 : 0), 
              pacman.y + (pacman.nextDir === 'down' ? 1 : pacman.nextDir === 'up' ? -1 : 0))) {
    pacman.dir = pacman.nextDir;
  }

  let nx = pacman.x + (pacman.dir === 'right' ? 1 : pacman.dir === 'left' ? -1 : 0);
  let ny = pacman.y + (pacman.dir === 'down' ? 1 : pacman.dir === 'up' ? -1 : 0);

  if (canMove(nx, ny)) {
    pacman.x = nx;
    pacman.y = ny;
  }

  // Update Ghosts
  ghosts.forEach(g => {
    const dirs = ['up', 'down', 'left', 'right'];
    if (!canMove(g.x + (g.dir === 'right' ? 1 : g.dir === 'left' ? -1 : 0), 
                 g.y + (g.dir === 'down' ? 1 : g.dir === 'up' ? -1 : 0)) || Math.random() < 0.1) {
      g.dir = dirs[Math.floor(Math.random() * dirs.length)];
    }
    let gnx = g.x + (g.dir === 'right' ? 1 : g.dir === 'left' ? -1 : 0);
    let gny = g.y + (g.dir === 'down' ? 1 : g.dir === 'up' ? -1 : 0);
    if (canMove(gnx, gny)) {
      g.x = gnx;
      g.y = gny;
    }

    // Check collision
    if (g.x === pacman.x && g.y === pacman.y) {
      gameRunning = false;
      alert('GAME OVER! Você foi pego!');
      gameContainer.classList.add('hidden');
    }
  });
}

let lastTime = 0;
function loop(time) {
  if (!gameRunning) return;
  if (time - lastTime > 150) { // Slower movement
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPacman();
    drawGhosts();
    update();
    lastTime = time;
  }
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  if (e.key === 'ArrowUp') pacman.nextDir = 'up';
  if (e.key === 'ArrowDown') pacman.nextDir = 'down';
  if (e.key === 'ArrowLeft') pacman.nextDir = 'left';
  if (e.key === 'ArrowRight') pacman.nextDir = 'right';
});

playBtn.addEventListener('click', () => {
  if (!gameRunning) {
    gameRunning = true;
    gameContainer.classList.remove('hidden');
    pacman = { x: 1, y: 1, dir: 'right', nextDir: 'right' };
    ghosts = [
      { x: 18, y: 1, color: '#ff0000', dir: 'left' },
      { x: 18, y: 5, color: '#ffb8ff', dir: 'up' }
    ];
    requestAnimationFrame(loop);
  } else {
    gameRunning = false;
    gameContainer.classList.add('hidden');
  }
});
