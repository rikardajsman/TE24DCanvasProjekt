// ======================
// GRISCH FIGHT
// ======================

// ======================
// CANVAS
// ======================

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "black";

const gravity = 0.7;

// ======================
// Spelstaus
// ======================

let gameState = "menu";
let playerScore = 0;
let enemyScore = 0;
let timer = 99;
let timerId = null;
let gameEnded = false;

// ======================
// STYLE
// ======================

const style = document.createElement("style");

style.innerHTML = `
body{
  margin:0;
  overflow:hidden;
  background:black;
  font-family:Arial;
}

canvas{
  display:none;
  background:linear-gradient(to bottom,#111,#222);
}

#startScreen{
  position:absolute;
  inset:0;
  display:flex;
  justify-content:center;
  align-items:center;
  background:rgba(0,0,0,0.92);
  color:white;
  z-index:100;
}

.menu{
  width:320px;
  padding:40px;
  background:#111;
  border:2px solid #444;
  border-radius:12px;
  text-align:center;
}

.menu h1{
  color:gold;
  font-size:42px;
}

button{
  width:100%;
  padding:14px;
  margin-top:10px;
  font-size:16px;
  font-weight:bold;
  border:none;
  border-radius:8px;
  cursor:pointer;
  background:gold;
}

button:hover{
  transform:scale(1.03);
}

#controlsBox,
#highscoreBox{
  display:none;
  margin-top:20px;
  padding:15px;
  background:#1b1b1b;
  border-radius:10px;
}

#hud{
  position:absolute;
  top:20px;
  left:50%;
  transform:translateX(-50%);
  width:90%;
  display:none;
  justify-content:space-between;
  align-items:center;
  color:white;
  z-index:50;
}

.playerContainer{
  width:260px;
}

.enemyUI{
  text-align:right;
}

.healthWrapper{
  width:100%;
  height:24px;
  border:2px solid white;
  background:#330000;
  margin-top:8px;
}

.healthBar{
  width:100%;
  height:100%;
  background:limegreen;
  transition:0.2s;
}

#timer{
  width:90px;
  height:90px;
  border-radius:50%;
  border:4px solid yellow;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:30px;
  font-weight:bold;
  background:#111;
}
`;

document.head.appendChild(style);

// ======================
// Startskärmen
// ======================

const startScreen = document.createElement("div");

startScreen.id = "startScreen";

startScreen.innerHTML = `
<div class="menu">
  <h1>GRISCH FIGHT</h1>
  <button id="startBtn">START GAME</button>
  <button id="controlsBtn">CONTROLS</button>
  <button id="highscoreBtn">HIGHSCORES</button>
  <div id="controlsBox">
    <p>A / D = Move</p>
    <p>W = Jump</p>
    <p>SPACE = Attack</p>
  </div>

  <div id="highscoreBox">
    <h3>TOP SCORES</h3>
    <ul id="highscoreList"></ul>
  </div>
</div>
`;

document.body.appendChild(startScreen);

// ======================
// HUD
// ======================

const hud = document.createElement("div");

hud.id = "hud";

hud.innerHTML = `
<div class="playerContainer">
  <div>PLAYER</div>
  <div class="healthWrapper">
    <div id="playerHealth" class="healthBar"></div>
  </div>
</div>
<div id="timer">99</div>
<div class="playerContainer enemyUI">
  <div>ENEMY</div>
  <div class="healthWrapper">
    <div id="enemyHealth" class="healthBar"></div>
  </div>

</div>
`;

document.body.appendChild(hud);

// ======================
// Knappar
// ======================

document.getElementById("controlsBtn").onclick = () => {
  const box = document.getElementById("controlsBox");
  box.style.display =
    box.style.display === "block"
      ? "none"
      : "block";
};
document.getElementById("highscoreBtn").onclick = () => {
  const box = document.getElementById("highscoreBox");
  box.style.display =
    box.style.display === "block"
      ? "none"
      : "block";

  showHighscores();
};

document.getElementById("startBtn").onclick = () => {
  startScreen.style.display = "none";
  hud.style.display = "flex";
  canvas.style.display = "block";
  gameState = "playing";
  updateHUD();
  decreaseTimer();
  animate();
};

// ======================
// Fajtaren
// ======================

class Fighter {

  constructor({ x, y, color, offset }) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.width = 60;
    this.height = 160;
    this.color = color;
    this.health = 100;
    this.attacking = false;
    this.attackBox = {
      position: { x: 0, y: 0 },
      offset,
      width: 120,
      height: 50
    };
  }

  draw() {
    c.fillStyle = this.color;
    c.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    if (this.attacking) {
      c.fillStyle = "white";
      c.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }
  }

  update() {
    this.draw();
    this.attackBox.position.x =
      this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y =
      this.position.y + 40;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Golv

    if (this.position.y + this.height >= canvas.height - 50) {
      this.velocity.y = 0;
      this.position.y =
        canvas.height - this.height - 50;

    } else {
      this.velocity.y += gravity;
    }
    // WALLS

    if (this.position.x < 0) {
      this.position.x = 0;
    }

    if (this.position.x + this.width > canvas.width) {
      this.position.x =
        canvas.width - this.width;
    }
  }

  attack() {
    if (this.attacking) return;
    this.attacking = true;

    setTimeout(() => {
      this.attacking = false;
    }, 150);
  }

  hit() {
    this.health -= 10;
    if (this.health < 0) {
      this.health = 0;
    }
  }
}

// ======================
// PLAYERS
// ======================

const player = new Fighter({
  x: 150,
  y: 0,
  color: "gold",
  offset: { x: 50, y: 0 }
});

const enemy = new Fighter({
  x: 900,
  y: 0,
  color: "deepskyblue",
  offset: { x: -110, y: 0 }
});

// ======================
// Kontroller
// ======================

const keys = {
  a: false,
  d: false
};

// ======================
// Kollision
// ======================

function hit(a, b) {

  return (
    a.attackBox.position.x +
      a.attackBox.width >=
      b.position.x &&

    a.attackBox.position.x <=
      b.position.x + b.width &&

    a.attackBox.position.y +
      a.attackBox.height >=
      b.position.y &&

    a.attackBox.position.y <=
      b.position.y + b.height
  );
}

// ======================
// AI
// ======================

function enemyAI() {

  const distance =
    player.position.x - enemy.position.x;

  if (distance < -80) {
    enemy.velocity.x = -3;
  } else if (distance > 80) {
    enemy.velocity.x = 3;
  } else {
    enemy.velocity.x = 0;
    if (Math.random() < 0.05) {
      enemy.attack();
    }
  }

  if (
    Math.random() < 0.002 &&
    enemy.velocity.y === 0
  ) {

    enemy.velocity.y = -15;
  }
}

// ======================
// HUD
// ======================

function updateHUD() {
  document.getElementById("playerHealth")
    .style.width = player.health + "%";
  document.getElementById("enemyHealth")
    .style.width = enemy.health + "%";
}

// ======================
// TIMER
// ======================

function decreaseTimer() {

  if (gameState !== "playing") return;
  if (timer > 0) {
    timer--;
    document.getElementById("timer")
      .innerHTML = timer;

    timerId = setTimeout(
      decreaseTimer,
      1000
    );

  } else {
    endGame();
  }
}

// ======================
// HIGHSCORES
// ======================

function getHighscores() {

  return JSON.parse(
    localStorage.getItem(
      "grisch_highscores"
    ) || "[]"
  );
}

function saveHighscore(score) {
  const list = getHighscores();
  list.push(score);
  list.sort((a, b) => b - a);

  const trimmed = list.slice(0, 10);

  localStorage.setItem(
    "grisch_highscores",
    JSON.stringify(trimmed)
  );
}

function showHighscores() {
  const list = getHighscores();
  const box =
    document.getElementById("highscoreList");
  box.innerHTML = "";

  list.forEach(score => {

    const li =
      document.createElement("li");
    li.textContent = score;
    box.appendChild(li);
  });
}

// ======================
// GAME OVER
// ======================

function endGame() {

  if (gameEnded) return;
  gameEnded = true;
  gameState = "gameover";

  clearTimeout(timerId);

  let message = "";
  if (player.health > enemy.health) {
    message = "PLAYER WINS!";
    playerScore++;
    saveHighscore(player.health);

  } else if (
    enemy.health > player.health
  ) {

    message = "ENEMY WINS!";
    enemyScore++;

  } else {

    message = "DRAW!";
  }

  setTimeout(() => {

    alert(message);

    location.reload();

  }, 200);
}

// ======================
// GAME LOOP
// ======================

function animate() {

  if (gameState !== "playing") return;
  requestAnimationFrame(animate);

  c.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Marken

  c.fillStyle = "#333";

  c.fillRect(
    0,
    canvas.height - 50,
    canvas.width,
    50
  );

  // Uppdateringar

  player.update();
  enemy.update();
  enemyAI();

  // PLAYER MOVEMENT

  player.velocity.x = 0;
  if (keys.a) {
    player.velocity.x = -6;
  }

  if (keys.d) {

    player.velocity.x = 6;
  }

  // Spelarattacker

  if (
    player.attacking &&
    hit(player, enemy)
  ) {
    enemy.hit();
    updateHUD();
    player.attacking = false;
  }

  // Fiendens attack

  if (
    enemy.attacking &&
    hit(enemy, player)
  ) {

    player.hit();
    updateHUD();
    enemy.attacking = false;
  }

  // Slutet

  if (
    player.health <= 0 ||
    enemy.health <= 0
  ) {
    endGame();
  }
}

// ======================
// Tangentbord
// ======================

window.addEventListener(
  "keydown",
  (e) => {

    if (gameState !== "playing") return;

    switch (e.key.toLowerCase()) {

      case "a":
        keys.a = true;
        break;

      case "d":
        keys.d = true;
        break;

      case "w":

        if (player.velocity.y === 0) {
          player.velocity.y = -18;
        }

        break;

      case " ":

        player.attack();

        break;
    }
  }
);

window.addEventListener(
  "keyup",
  (e) => {

    switch (e.key.toLowerCase()) {

      case "a":
        keys.a = false;
        break;

      case "d":
        keys.d = false;
        break;
    }
  }
);
window.addEventListener(
  "resize",
  () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
);