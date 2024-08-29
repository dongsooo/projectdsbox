const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
canvas.width = 300;
canvas.height = 600;
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30; // 기존 블록 크기
const NEXT_BLOCK_SIZE = 50; // 다음 블록 크기

// 블록 디자인을 위한 이미지 로드
const blockImages = {};
const imageSources = {
  I: "img/02_i-tetromino.png",
  J: "img/02_j-tetromino.png",
  L: "img/02_l-tetromino.png",
  O: "img/02_o-tetromino.png",
  S: "img/02_s-tetromino.png",
  T: "img/02_t-tetromino.png",
  Z: "img/02_z-tetromino.png",
};

const shapes = {
  I: [[1, 1, 1, 1]], // I
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ], // J
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ], // L
  O: [
    [1, 1],
    [1, 1],
  ], // O
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
};

let board;
let currentShape;
let currentX;
let currentY;
let nextShape; // 변수 추가
let gameOver;
let score;
let interval;

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const gameOverElement = document.getElementById("game-over");
const scoreBoard = document.getElementById("score-board");
const nextBlockContainer = document.getElementById("next-block"); // 다음 블록 요소

// 이미지 로드 함수
function loadImages(callback) {
  let loadedImages = 0;
  const totalImages = Object.keys(imageSources).length;

  for (let key in imageSources) {
    blockImages[key] = new Image();
    blockImages[key].src = imageSources[key];
    blockImages[key].onload = () => {
      loadedImages++;
      if (loadedImages === totalImages) {
        callback();
      }
    };
  }
}

function initializeGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentShape = getRandomShape();
  nextShape = getRandomShape(); // 초기화
  currentX = Math.floor(COLS / 2) - 1;
  currentY = 0;
  gameOver = false;
  score = 0;
  updateScore();
  drawNextShape(); // 다음 블록 그리기
  gameOverElement.style.display = "none";
  restartButton.style.display = "none";
  interval = setInterval(update, 500);
  draw();
}

function getRandomShape() {
  const keys = Object.keys(shapes);
  const key = keys[Math.floor(Math.random() * keys.length)];
  return {
    shape: shapes[key],
    image: key,
  };
}

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        const image = blockImages[Object.keys(shapes)[board[y][x] - 1]]; // 인덱스에서 이미지 키 가져오기
        context.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    }
  }
}

function drawShape() {
  const shape = currentShape.shape;
  const image = blockImages[currentShape.image];
  context.globalAlpha = 1; // 이미지의 투명도 설정
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        context.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          (currentX + x) * BLOCK_SIZE,
          (currentY + y) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    }
  }
}

function drawNextShape() {
  nextBlockContainer.innerHTML = "<h3>Next Block</h3>";

  const nextBlockCanvas = document.createElement("canvas");
  nextBlockCanvas.width = NEXT_BLOCK_SIZE;
  nextBlockCanvas.height = NEXT_BLOCK_SIZE;
  const nextBlockContext = nextBlockCanvas.getContext("2d");

  nextBlockContext.clearRect(
    0,
    0,
    nextBlockCanvas.width,
    nextBlockCanvas.height
  );

  const shape = nextShape.shape;
  const image = blockImages[nextShape.image];
  const shapeSize = Math.min(
    NEXT_BLOCK_SIZE / shape[0].length,
    NEXT_BLOCK_SIZE / shape.length
  );

  const offsetX = (NEXT_BLOCK_SIZE - shapeSize * shape[0].length) / 2;
  const offsetY = (NEXT_BLOCK_SIZE - shapeSize * shape.length) / 2;

  nextBlockContext.globalAlpha = 1; // 이미지의 투명도 설정
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        nextBlockContext.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          x * shapeSize + offsetX,
          y * shapeSize + offsetY,
          shapeSize,
          shapeSize
        );
      }
    }
  }

  nextBlockContainer.appendChild(nextBlockCanvas);
}

function drawGuideLine() {
  let dropY = currentY;
  while (!collide(currentX, dropY + 1, currentShape.shape)) {
    dropY++;
  }

  const shape = currentShape.shape;
  const shapeSize = BLOCK_SIZE;
  const image = blockImages[currentShape.image];

  context.globalAlpha = 0.5; // 이미지의 투명도 설정
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        context.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          (currentX + x) * shapeSize,
          (dropY + y) * shapeSize,
          shapeSize,
          shapeSize
        );
      }
    }
  }

  context.globalAlpha = 1; // 투명도 복원
}

function updateScore() {
  scoreBoard.textContent = `Score: ${score}`;
}

function showGameOver() {
  gameOverElement.style.display = "block";
  restartButton.style.display = "inline-block";
}

function draw() {
  drawBoard();
  drawShape();
  drawGuideLine();
  if (gameOver) {
    showGameOver();
  }
}

function collide(x, y, shape) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] && (board[y + i] && board[y + i][x + j]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function rotateShape() {
  const shape = currentShape.shape;
  const rotatedShape = shape[0]
    .map((_, i) => shape.map((row) => row[i]))
    .reverse();
  if (!collide(currentX, currentY, rotatedShape)) {
    currentShape.shape = rotatedShape;
  }
}

function moveShape(dx, dy) {
  if (!collide(currentX + dx, currentY + dy, currentShape.shape)) {
    currentX += dx;
    currentY += dy;
  } else if (dy) {
    mergeShape();
    clearLines();
    currentShape = nextShape;
    nextShape = getRandomShape();
    drawNextShape();
    currentX = Math.floor(COLS / 2) - 1;
    currentY = 0;
    if (collide(currentX, currentY, currentShape.shape)) {
      gameOver = true;
      clearInterval(interval);
    }
  }
  draw();
}

function dropShape() {
  while (!collide(currentX, currentY + 1, currentShape.shape)) {
    currentY++;
  }
  moveShape(0, 0);
}

function mergeShape() {
  const shape = currentShape.shape;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        board[currentY + y][currentX + x] =
          Object.keys(shapes).indexOf(currentShape.image) + 1;
      }
    }
  }
}

function clearLines() {
  let linesCleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++;
    }
  }
  if (linesCleared > 0) {
    score += linesCleared === 4 ? 1000 : linesCleared * 100;
    updateScore();
  }
}

function update() {
  if (!gameOver) {
    moveShape(0, 1);
  }
}

// Load images and initialize game
loadImages(() => {
  startButton.addEventListener("click", () => {
    initializeGame();
    startButton.style.display = "none";
  });

  restartButton.addEventListener("click", () => {
    initializeGame();
  });

  document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    switch (e.key) {
      case "ArrowLeft":
        moveShape(-1, 0);
        break;
      case "ArrowRight":
        moveShape(1, 0);
        break;
      case "ArrowDown":
        moveShape(0, 1);
        break;
      case "ArrowUp":
        rotateShape();
        break;
      case " ":
        dropShape();
        break;
    }
    draw();
  });
});
