const SETTING_TIME = 11;
let words = ["Banana", "Apple", "Monkey", "Car", "Go", "Korea", "React"];
let time;
let isReady = false;
let isPlaying = false;
let score = 0;
let timeInterval;

const url = "https://random-word-api.herokuapp.com/word?number=100";
const wordDisplay = document.querySelector(".word-display");
const wordInput = document.querySelector(".word-input");
const scoreDisplay = document.querySelector(".score");
const timeDisplay = document.querySelector(".time");
const button = document.querySelector(".button");

// function
const runToast = (text) => {
  const contentsWrap = document.querySelector(".contentsWrap");
  const rect = contentsWrap.getBoundingClientRect();

  const option = {
    text: text,
    duration: 3000,
    newWindow: true,

    background: "linear-gradient(to right, orange, yellow)",
    style: {
      position: "fixed", // 페이지의 고정 위치에 표시
      top: `${rect.top + 300}px`, // contentsWrap의 상단 위치에 맞추기
      left: `${rect.left + rect.width}px`, // contentsWrap의 오른쪽 위치에 맞추기
      background: "skyblue",
      color: "white", // 텍스트 색상 설정 (투명도 없음)
      zIndex: 9999,
      width: "100px", // 너비 설정
      padding: "10px", // 필요에 따라 여백 추가
      textAlign: "center", // 텍스트 중앙 정렬
    },
  };

  Toastify(option).showToast();
};

const getWords = () => {
  axios
    .get(url)
    .then((res) => {
      words = res.data.filter((word) => word.length < 7);
      button.innerText = "게임시작";
      button.classList.remove("loading");
      isReady = true;
    })
    .catch((err) => console.log("err"));
};

const init = () => {
  time = SETTING_TIME;
  getWords();
  wordInput.disabled = true; // 초기 상태에서 입력 필드 비활성화
};

const countDown = () => {
  if (time > 0) {
    time--;
  } else {
    clearInterval(timeInterval);
    isPlaying = false;
    wordInput.disabled = true; // 시간 종료 후 입력 필드 비활성화
  }

  timeDisplay.innerText = time;
  if (time === 0) {
    button.innerText = "다시 하기";
  }
};

const run = () => {
  wordDisplay.innerText = "Hello";
  clearInterval(timeInterval);
  button.innerText = "게임 중";
  if (isReady === false) {
    return;
  }
  timeInterval = setInterval(countDown, 1000);
  wordInput.value = "";
  score = 0;
  time = SETTING_TIME;
  scoreDisplay.innerText = score;
  isPlaying = true;
  wordInput.disabled = false; // 게임 시작 시 입력 필드 활성화
  wordInput.focus(); // 입력 필드에 포커스 설정
};

const checkMatch = () => {
  if (!isPlaying) {
    return;
  }
  if (wordInput.value.toLowerCase() === wordDisplay.innerText.toLowerCase()) {
    score++;
    runToast(wordDisplay.innerText);
    wordInput.value = "";
    time = SETTING_TIME;

    const randomIndex = Math.floor(Math.random() * words.length);
    wordDisplay.innerText = words[randomIndex];
  }

  scoreDisplay.innerText = score;
};

// event
wordInput.addEventListener("input", checkMatch);

// game start
init();
