let canvas;
let ctx;

let wrap = document.querySelector(".contentsWrap");
canvas = document.createElement("canvas");
ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 700;
wrap.appendChild(canvas);

let backgroundImage,
  spaceshipImage,
  bulletImage,
  enemyImage,
  gameOverImage,
  sparkImage;
let gameOver = false;
let score = 0;
let spaceshipX = canvas.width / 2 - 32;
let spaceshipY = canvas.height - 64;

let bulletList = [];
let enemyList = [];
let sparkList = [];
let enemyInterval; // 적군 생성 타이머 변수

// Bullet 클래스 정의
class Bullet {
  constructor() {
    this.x = spaceshipX + 20;
    this.y = spaceshipY;
    this.alive = true;
    bulletList.push(this);
  }

  update() {
    this.y -= 4;

    // 총알이 화면을 벗어나면 비활성화
    if (this.y < -bulletImage.height) {
      this.alive = false;
    }
  }

  checkHit() {
    for (let i = 0; i < enemyList.length; i++) {
      if (
        this.y <= enemyList[i].y + 40 &&
        this.x >= enemyList[i].x &&
        this.x <= enemyList[i].x + 40
      ) {
        score++;
        this.alive = false;

        // 스파크 효과 생성
        new Spark(enemyList[i].x + 10, enemyList[i].y);

        // 적 제거
        enemyList.splice(i, 1);
        break;
      }
    }
  }
}

// Enemy 클래스 정의
class Enemy {
  constructor() {
    this.x = generateRandomValue(0, canvas.width - 48);
    this.y = 0;
    enemyList.push(this);
  }

  update() {
    this.y += 0.8; // 적군의 이동 속도
    if (this.y >= canvas.height - 48) {
      gameOver = true;
    }
  }
}

// Spark 클래스 정의
class Spark {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visible = true;
    sparkList.push(this);

    // 일정 시간 후에 스파크를 제거
    setTimeout(() => {
      this.visible = false;
    }, 200); // 스파크가 200ms 동안 표시됩니다.
  }

  render() {
    if (this.visible) {
      ctx.drawImage(sparkImage, this.x, this.y);
    }
  }
}

function generateRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadImage() {
  backgroundImage = new Image();
  backgroundImage.src = "img/04_Shooting_img2.avif";

  spaceshipImage = new Image();
  spaceshipImage.src = "img/04_Shooting_img1.png";

  bulletImage = new Image();
  bulletImage.src = "img/04_Shooting_img5.png";

  enemyImage = new Image();
  enemyImage.src = "img/04_Shooting_img6.png";

  gameOverImage = new Image();
  gameOverImage.src = "img/04_Shooting_img3.png";

  sparkImage = new Image();
  sparkImage.src = "img/04_Shooting_img7.png";
}

let keysDown = {};
function setupKeyboardListener() {
  document.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
  });

  document.addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];

    if (e.keyCode == 32) {
      createBullet();
    }
  });
}

function createBullet() {
  new Bullet();
}

function createEnemy() {
  // 이미 적군 생성 타이머가 설정된 경우 새로운 타이머를 설정하지 않음
  if (!enemyInterval) {
    enemyInterval = setInterval(() => {
      if (!gameOver) {
        new Enemy();
      }
    }, 1000);
  }
}

function stopCreatingEnemies() {
  // 적군 생성 타이머를 정지하고 변수 초기화
  if (enemyInterval) {
    clearInterval(enemyInterval);
    enemyInterval = null;
  }
}

function update() {
  const moveSpeed = 1.5;

  if (39 in keysDown) spaceshipX += moveSpeed;
  if (37 in keysDown) spaceshipX -= moveSpeed;

  spaceshipX = Math.max(0, Math.min(spaceshipX, canvas.width - 64));

  bulletList.forEach((bullet, index) => {
    if (bullet.alive) {
      bullet.update();
      bullet.checkHit();
    } else {
      // 비활성화된 총알을 리스트에서 제거
      bulletList.splice(index, 1);
    }
  });

  enemyList.forEach((enemy) => enemy.update());
}

function render() {
  // 배경 이미지는 게임이 시작되었을 때만 렌더링
  if (!gameOver) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(spaceshipImage, spaceshipX, spaceshipY);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);

  bulletList.forEach((bullet) => {
    if (bullet.alive) {
      ctx.drawImage(bulletImage, bullet.x, bullet.y);
    }
  });

  enemyList.forEach((enemy) => {
    ctx.drawImage(enemyImage, enemy.x, enemy.y);
  });

  // 스파크 효과 렌더링
  sparkList.forEach((spark) => spark.render());

  // 게임 오버 이미지 렌더링
  if (gameOver) {
    ctx.drawImage(gameOverImage, 25, 250, 350, 200);
    document.getElementById("restartButton").style.display = "block"; // 게임 오버 시 버튼 표시
  }
}

function main() {
  if (!gameOver) {
    update();
    render();
    requestAnimationFrame(main);
  } else {
    render(); // render() 함수 호출로 게임 오버 이미지가 나타나도록
  }
}

function startGame() {
  document.getElementById("startButton").style.display = "none";
  document.getElementById("restartButton").style.display = "none"; // 게임 시작 시 다시하기 버튼 숨기기
  setupKeyboardListener();
  createEnemy();
  main();
}

// 게임을 초기화하고 다시 시작하는 함수
function restartGame() {
  gameOver = false;
  score = 0;
  spaceshipX = canvas.width / 2 - 32;
  spaceshipY = canvas.height - 64;
  bulletList = [];
  enemyList = [];
  sparkList = [];

  // 버튼 숨기기
  document.getElementById("restartButton").style.display = "none";

  // 적군 생성 타이머 중지
  stopCreatingEnemies();

  // 새로운 적군 생성 타이머 설정
  createEnemy();
  main();
}

// 게임 로딩 후 배경을 표시하지 않도록 변경
loadImage();

// 스타트 버튼 클릭 이벤트
document.getElementById("startButton").addEventListener("click", startGame);

// 다시하기 버튼 클릭 이벤트
document.getElementById("restartButton").addEventListener("click", restartGame);
