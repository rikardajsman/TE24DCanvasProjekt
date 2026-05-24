// ======================
// GRISCH FIGHT
// ======================

const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = "none";

const gravity = 0.7;

// Spelarnas status

let gameState = "menu";

let round = 1;
let maxRounds = 3;

let playerScore = 0;
let enemyScore = 0;

let timer = 99;

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

  <div id="controlsBox" style="display:none;">
    <p>A / D = Move</p>
    <p>W = Jump</p>
    <p>SPACE = Attack</p>
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
  <div class="healthWrapper"><div id="playerHealth" class="healthBar"></div></div>
</div>

<div id="timer">99</div>

<div class="playerContainer enemyUI">
  <div>ENEMY</div>
  <div class="healthWrapper"><div id="enemyHealth" class="healthBar"></div></div>
</div>
`;

document.body.appendChild(hud);

// ======================
// STYLE
// ======================

const style = document.createElement("style");

style.innerHTML = `
body{margin:0;overflow:hidden;background:black;}

#startBtn, #controlsBtn {
  padding:10px 20px;
  margin:10px;
  font-size:16px;
}

#startScreen{
  position:absolute;inset:0;
  display:flex;
  justify-content:center;
  align-items:center;
  background:rgba(0,0,0,0.85);
  color:white;
  z-index:100;
  text-align:center;
}

#hud{
  position:absolute;
  top:20px;
  left:50%;
  transform:translateX(-50%);
  width:90%;
  display:none;
  justify-content:space-between;
  color:white;
}

.healthWrapper{
  width:200px;
  height:20px;
  border:2px solid white;
}

.healthBar{
  width:100%;
  height:100%;
  background:limegreen;
}

#timer{
  width:80px;
  height:80px;
  border-radius:50%;
  border:3px solid yellow;
  display:flex;
  align-items:center;
  justify-content:center;
  color:white;
}
`;

document.head.appendChild(style);

// ======================
// Knappar
// ======================

document.getElementById("controlsBtn").onclick = () => {
  const box = document.getElementById("controlsBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

document.getElementById("startBtn").onclick = () => {
  startScreen.style.display = "none";
  hud.style.display = "flex";
  canvas.style.display = "block";

  gameState = "playing";

  decreaseTimer();
  animate();
};

// ======================
// Fightare
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

// ======================
// Spelare
// ======================

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


const keys = { a: false, d: false };

// ======================
// Kollisioner
// ======================

function hit(a, b) {
  return (
    a.attackBox.position.x + a.attackBox.width >= b.position.x &&
    a.attackBox.position.x <= b.position.x + b.width &&
    a.attackBox.position.y + a.attackBox.height >= b.position.y &&
    a.attackBox.position.y <= b.position.y + b.height
  );
}

// ======================
// AI
// ======================

function enemyAI() {
  const distance = player.position.x - enemy.position.x;

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

  if (Math.random() < 0.002 && enemy.velocity.y === 0) {
    enemy.velocity.y = -15;
  }
}

// ======================
// HUD
// ======================

function updateHUD() {
  document.getElementById("playerHealth").style.width = player.health + "%";
  document.getElementById("enemyHealth").style.width = enemy.health + "%";
}

// ======================
// Tidtagare
// ======================

function decreaseTimer() {
  if (gameState !== "playing") return;

  if (timer > 0) {
    timer--;
    document.getElementById("timer").innerHTML = timer;
    setTimeout(decreaseTimer, 1000);
  } else {
    endGame();
  }
}

// ======================
// GAME OVER på riktigt!
// ======================

function endGame() {
  gameState = "gameover";

  let message = "";

  if (player.health > enemy.health) {
    message = "PLAYER WINS!";
    playerScore++;
  } else if (enemy.health > player.health) {
    message = "ENEMY WINS!";
    enemyScore++;
  } else {
    message = "DRAW!";
  }

  setTimeout(() => {
    alert(message);
    location.reload();
  }, 100);
}

// ======================
// Spelets loop
// ======================

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

  if (player.attacking && hit(player, enemy)) {
    enemy.hit();
    updateHUD();
    player.attacking = false;
  }

  if (enemy.attacking && hit(enemy, player)) {
    player.hit();
    updateHUD();
    enemy.attacking = false;
  }

  if (player.health <= 0 || enemy.health <= 0) {
    endGame();
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