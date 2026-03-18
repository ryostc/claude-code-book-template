const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart');

const W = canvas.width;
const H = canvas.height;

// ブロック設定
const COLS = 10;
const ROWS = 5;
const BLOCK_W = 42;
const BLOCK_H = 16;
const BLOCK_PAD = 4;
const BLOCK_TOP = 40;

const COLORS = ['#e94560', '#f5a623', '#f8e71c', '#7ed321', '#4a90e2', '#9b59b6'];

let ball, paddle, blocks, score, lives, gameRunning, animId;

const keys = { left: false, right: false };

function createBlocks() {
  const arr = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      arr.push({
        x: c * (BLOCK_W + BLOCK_PAD) + BLOCK_PAD + 3,
        y: r * (BLOCK_H + BLOCK_PAD) + BLOCK_TOP,
        w: BLOCK_W,
        h: BLOCK_H,
        color: COLORS[r % COLORS.length],
        alive: true,
      });
    }
  }
  return arr;
}

function startGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  messageEl.textContent = '';
  restartBtn.style.display = 'none';

  paddle = { x: W / 2 - 40, y: H - 24, w: 80, h: 10, speed: 6 };
  ball = { x: W / 2, y: H - 60, r: 7, vx: 2.4, vy: -3.2 };
  blocks = createBlocks();

  gameRunning = true;
  if (animId) cancelAnimationFrame(animId);
  loop();
}

function resetBall() {
  ball.x = W / 2;
  ball.y = H - 60;
  ball.vx = (Math.random() > 0.5 ? 1 : -1) * 2.4;
  ball.vy = -3.2;
  paddle.x = W / 2 - paddle.w / 2;
}

function loop() {
  update();
  draw();
  if (gameRunning) animId = requestAnimationFrame(loop);
}

function update() {
  // パドル移動
  if (keys.left) paddle.x = Math.max(0, paddle.x - paddle.speed);
  if (keys.right) paddle.x = Math.min(W - paddle.w, paddle.x + paddle.speed);

  // ボール移動
  ball.x += ball.vx;
  ball.y += ball.vy;

  // 壁反射
  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
  if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

  // ボール落下
  if (ball.y - ball.r > H) {
    lives--;
    livesEl.textContent = lives;
    if (lives <= 0) {
      gameOver();
      return;
    }
    resetBall();
  }

  // パドルとの衝突
  if (
    ball.y + ball.r >= paddle.y &&
    ball.y - ball.r <= paddle.y + paddle.h &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.w &&
    ball.vy > 0
  ) {
    const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    ball.vx = hit * 4;
    ball.vy = -Math.abs(ball.vy);
    const speed = Math.hypot(ball.vx, ball.vy);
    const maxSpeed = 5.6;
    if (speed > maxSpeed) {
      ball.vx = (ball.vx / speed) * maxSpeed;
      ball.vy = (ball.vy / speed) * maxSpeed;
    }
  }

  // ブロックとの衝突
  let remaining = 0;
  for (const b of blocks) {
    if (!b.alive) continue;
    remaining++;
    if (
      ball.x + ball.r > b.x &&
      ball.x - ball.r < b.x + b.w &&
      ball.y + ball.r > b.y &&
      ball.y - ball.r < b.y + b.h
    ) {
      b.alive = false;
      remaining--;
      score += 10;
      scoreEl.textContent = score;

      const overlapLeft = ball.x + ball.r - b.x;
      const overlapRight = b.x + b.w - (ball.x - ball.r);
      const overlapTop = ball.y + ball.r - b.y;
      const overlapBottom = b.y + b.h - (ball.y - ball.r);
      const minH = Math.min(overlapLeft, overlapRight);
      const minV = Math.min(overlapTop, overlapBottom);
      if (minH < minV) ball.vx = -ball.vx;
      else ball.vy = -ball.vy;
    }
  }

  if (remaining === 0) {
    gameClear();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // ブロック描画
  for (const b of blocks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 4);
  }

  // パドル
  const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
  grad.addColorStop(0, '#aad4f5');
  grad.addColorStop(1, '#4a90e2');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
  ctx.fill();

  // ボール
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff3333';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ball.x - 2, ball.y - 2, ball.r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,180,180,0.6)';
  ctx.fill();
}

function gameOver() {
  gameRunning = false;
  messageEl.textContent = 'ゲームオーバー...';
  restartBtn.style.display = 'inline-block';
}

function gameClear() {
  gameRunning = false;
  messageEl.textContent = 'クリア! スコア: ' + score;
  restartBtn.style.display = 'inline-block';
}

// キーボード操作
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
});

// マウス/タッチ操作
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  paddle.x = e.clientX - rect.left - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  paddle.x = e.touches[0].clientX - rect.left - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}, { passive: false });

startGame();
