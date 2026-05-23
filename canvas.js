// Spelet - GRISCH FIGHT
// CANVAS

const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.display = "none";

const gravity = 0.7;

// GAME STATE

let gameState = "menu"; // menu | playing | gameover
let round = 1;
let maxRounds = 3;

let playerScore = 0;
let enemyScore = 0;

// UI - START

const startScreen = document.createElement("div");
startScreen.id = "startScreen";

startScreen.innerHTML = `
<div class="menu">
  <h1>GRISCH FIGHT</h1>

  <button id="startBtn">START GAME</button>
  <button id="controlsBtn">CONTROLS</button>

  <div id="controlsBox">
    <p>A / D = Move</p>
    <p>W = Jump</p>
    <p>SPACE = Attack</p>
    <p>Enemy = AI</p>
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
  <div class="playerName">PLAYER</div>
  <div class="healthWrapper">
    <div id="playerHealth" class="healthBar"></div>
  </div>
</div>

<div id="timer">100</div>

<div class="playerContainer enemyUI">
  <div class="playerName">ENEMY</div>
  <div class="healthWrapper">
    <div id="enemyHealth" class="healthBar"></div>
  </div>
</div>
`;

document.body.appendChild(hud);

// ======================
// STYLE (minimal, stable)
// ======================

const style = document.createElement("style");

style.innerHTML = `
body{margin:0;overflow:hidden;background:black;}

#startScreen{
  position:absolute;inset:0;
  display:flex;
  justify-content:center;
  align-items:center;
  background:rgba(0,0,0,0.85);
  z-index:100;
  color:white;
  text-align:center;
}

.menu button{
  display:block;
  margin:10px auto;
  padding:12px;
  width:200px;
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
}

.playerContainer{width:35%;}

.enemyUI{text-align:right;}

.healthWrapper{
  height:25px;
  border:2px solid white;
}

.healthBar{
  width:100%;
  height:100%;
  background:limegreen;
}

#timer{
  width:90px;
  height:90px;
  border-radius:50%;
  border:3px solid yellow;
  display:flex;
  justify-content:center;
  align-items:center;
  color:white;
}
`;

document.head.appendChild(style);

// KNAPPAR

document.getElementById("controlsBtn").onclick = () => {
  const box = document.getElementById("controlsBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

// START GAME

document.getElementById("startBtn").onclick = () => {
  startScreen.style.display = "none";
  hud.style.display = "flex";
  canvas.style.display = "block";

  gameState = "playing";

  decreaseTimer();
  animate();
};

// SPRITE KLASSER

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
      height: 50,
    };
  }

  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

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

    this.attackBox.position.y = this.position.y + 40;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height >= canvas.height - 50) {
      this.velocity.y = 0;
      this.position.y = canvas.height - this.height - 50;
    } else {
      this.velocity.y += gravity;
    }
  }

  attack() {
    this.attacking = true;
    setTimeout(() => (this.attacking = false), 100);
  }

  hit() {
    this.health -= 10;
    if (this.health < 0) this.health = 0;
  }
}

// Spelare

const player = new Fighter({
  x: 150,
  y: 0,
  color: "gold",
  offset: { x: 50, y: 0 },
});

const enemy = new Fighter({
  x: 800,
  y: 0,
  color: "blue",
  offset: { x: -110, y: 0 },
});

// Inputs

const keys = {
  a: false,
  d: false,
};

// Kollision

function hit(a, b) {
  return (
    a.attackBox.position.x + a.attackBox.width >= b.position.x &&
    a.attackBox.position.x <= b.position.x + b.width &&
    a.attackBox.position.y + a.attackBox.height >= b.position.y &&
    a.attackBox.position.y <= b.position.y + b.height
  );
}

// AI 

function enemyAI() {
  if (player.position.x < enemy.position.x) {
    enemy.velocity.x = -3;
  } else {
    enemy.velocity.x = 3;
  }

  if (Math.random() < 0.02) {
    enemy.attack();
  }
}

// HUD

function updateHUD() {
  document.getElementById("playerHealth").style.width = player.health + "%";
  document.getElementById("enemyHealth").style.width = enemy.health + "%";
}

// En Timer och rundor


let timer = 100;

function decreaseTimer() {
  if (gameState !== "playing") return;

  if (timer > 0) {
    timer--;

    document.getElementById("timer").innerHTML = timer;

    setTimeout(decreaseTimer, 1000);
  } else {
    endGameByTime();
  }
}

function nextRound() {
  round++;

  if (round > maxRounds) {
    endGame();
    return;
  }

  player.health = 100;
  enemy.health = 100;

  timer = 99;
  decreaseTimer();
  updateHUD();
}

// Spelet tar slut.

function endGame() {
  gameState = "gameover";

  if (player.health > enemy.health) {
    alert("PLAYER WINS");
    playerScore++;
  } else {
    alert("ENEMY WINS");
    enemyScore++;
  }

  location.reload();
}

// Spelet tar slut efter tiden har gått ut. //
function endGameByTime() {
  gameState = "ended";

  let message = "";

  if (player.health > enemy.health) {
    message = "PLAYER WINS";
    playerScore++;
  } else if (enemy.health > player.health) {
    message = "ENEMY WINS";
    enemyScore++;
  } else {
    message = "DRAW";
  }

  setTimeout(() => {
    alert(message);
    location.reload();
  }, 100);
}
// LOOP

function animate() {
  if (gameState !== "playing") return;

  requestAnimationFrame(animate);

  c.clearRect(0, 0, canvas.width, canvas.height);

  player.update();
  enemy.update();

  enemyAI();

  player.velocity.x = 0;

  if (keys.a) player.velocity.x = -6;
  if (keys.d) player.velocity.x = 6;

  // hits
  if (hit(player, enemy) && player.attacking) {
    enemy.hit();
    updateHUD();
    player.attacking = false;
  }

  if (hit(enemy, player) && enemy.attacking) {
    player.hit();
    updateHUD();
    enemy.attacking = false;
  }

  // Säkerhetskontroll för om spelare eller fiende har dött, för att undvika att spelet eventuellt fortsätter.
  if (player.health <= 0 || enemy.health <= 0) {
    endGameByTime();
  }
}

// ======================
// Kontroller
// ======================

window.addEventListener("keydown", (e) => {
  if (e.key === "a") keys.a = true;
  if (e.key === "d") keys.d = true;

  if (e.key === "w" && player.velocity.y === 0) {
    player.velocity.y = -18;
  }

  if (e.key === " ") {
    player.attack();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "a") keys.a = false;
  if (e.key === "d") keys.d = false;
});