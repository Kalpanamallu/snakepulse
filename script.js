function fixVH() {
  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`
  );
}
fixVH();
window.addEventListener("resize", fixVH);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//const bgMusic = document.getElementById('bgMusic');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');
const uiClick = document.getElementById('uiClick');


const levelSelect = document.getElementById('levelSelect');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const restartBtn = document.getElementById('restartBtn');

const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const goodMsgEl = document.getElementById('goodMsg');

/* ================= MOBILE + HIGH SCORE FIX ================= */

// 🔥 High score per individual (device)
let snake = [],
  food,
  dir = null,
  score = 0,
  highScore = localStorage.getItem("snakeHighScore") || 0,
  interval,
  baseSpeed = 150,
  isGameOver = false;
  let foodBounce = 0;


const box = 20;

// 📱 Mobile full-screen canvas (desktop untouched)
function resizeCanvas() {
  if (window.innerWidth < 768) {
    const availableHeight =
      window.innerHeight -
      document.querySelector('.scoreboard').offsetHeight -
      200; // space for controls

    const size = Math.min(window.innerWidth - 20, availableHeight);
    canvas.width = size;
    canvas.height = size;
  } else {
    canvas.width = 500;
    canvas.height = 500;
  }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ========================================================== */

// Particle effect array
let particles = [];

// Level selection
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.onclick = () => {
    uiClick.currentTime = 0;
    uiClick.play();
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    baseSpeed = parseInt(btn.dataset.speed);
    levelSelect.classList.add('hidden');
    startGame();
  };
});

// Restart button
restartBtn.onclick = () => {

  uiClick.currentTime = 0;
  uiClick.play();
  gameOverOverlay.classList.add('hidden');
  levelSelect.classList.remove('hidden');
};

// Start the game
function startGame() {
  uiClick.currentTime = 0;
    uiClick.play();
  snake = [{ x: Math.floor(canvas.width / 2 / box) * box, y: Math.floor(canvas.height / 2 / box) * box }];
  dir = null;
  score = 0;
  isGameOver = false;
  food = randomFood();

  //bgMusic.volume = 0.4;
  //bgMusic.currentTime = 0;
  //bgMusic.play();

  currentScoreEl.textContent = 0;
  highScoreEl.textContent = highScore;

  draw();
  document.addEventListener('keydown', keyDir);
  clearInterval(interval);
  interval = setInterval(update, baseSpeed);
  

}

// Snake direction control
function keyDir(e) {
  if (e.key === "ArrowLeft" && dir !== "RIGHT") dir = "LEFT";
  else if (e.key === "ArrowRight" && dir !== "LEFT") dir = "RIGHT";
  else if (e.key === "ArrowUp" && dir !== "DOWN") dir = "UP";
  else if (e.key === "ArrowDown" && dir !== "UP") dir = "DOWN";
}

// Random food generation
function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

// Particle creation
function createParticles(x, y) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x + 10,
      y: y + 10,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      alpha: 1,
      size: Math.random() * 3 + 2,
      r: Math.floor(Math.random() * 255),
      g: Math.floor(Math.random() * 255),
      b: Math.floor(Math.random() * 255)
    });
  }
}

// Update particle positions
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    if (p.alpha <= 0) particles.splice(i, 1);
  }
}

// Update game state
function update() {
  if (isGameOver) return;

  let head = { ...snake[0] };
  if (dir === "LEFT") head.x -= box;
  if (dir === "RIGHT") head.x += box;
  if (dir === "UP") head.y -= box;
  if (dir === "DOWN") head.y += box;

  // Eating food
  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head);
    score++;
    eatSound.currentTime = 0;
    eatSound.play();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
    }

    currentScoreEl.textContent = score;
    highScoreEl.textContent = highScore;

    createParticles(food.x, food.y);
    food = randomFood();

    if (score % 10 === 0) {
      goodMsgEl.textContent = "Good Job!";
      setTimeout(() => (goodMsgEl.textContent = ""), 800);
    }
  } else {
    snake.pop();
    snake.unshift(head);
  }

  // Border collision
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    collision(head, snake.slice(1))
  ) {
    endGame();
  }

  draw();
}

// Collision check
function collision(head, arr) {
  return arr.some(s => s.x === head.x && s.y === head.y);
}

// End game
function endGame() {
  isGameOver = true;
  clearInterval(interval);
 // bgMusic.pause();
  gameOverSound.play();
  gameOverOverlay.classList.remove('hidden');
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ff4f81";
  // Food
  ctx.fillStyle = "#ff4f81";
  ctx.beginPath();
  ctx.arc(food.x + 10, food.y + 10, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Snake
  snake.forEach((s, i) => {
    const grad = ctx.createRadialGradient(s.x + 10, s.y + 10, 3, s.x + 10, s.y + 10, 10);
    grad.addColorStop(0, "#7CFC00");
    grad.addColorStop(1, "#003300");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x + 10, s.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    if (i === 0) {
      const eyeOffset = Math.sin(Date.now() / 150) * 2;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x + 6 + eyeOffset, s.y + 6, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s.x + 14 + eyeOffset, s.y + 6, 3, 0, Math.PI * 2); ctx.fill();
    }
  });

  updateParticles();
}

// 📱 Mobile arrow buttons → existing keyboard logic
function pressKey(key) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

/*window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loadingScreen").style.display = "none";
  }, 1500);
});
*/