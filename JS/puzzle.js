const container = document.querySelector(".image-container");
const startButton = document.querySelector(".start-button");
const gameText = document.querySelector(".game-text");
const playTime = document.querySelector(".play-time");
const changePicButton = document.querySelector(".change-pic");
const dragged = {
  el: null,
  class: null,
  index: null,
};
const tiles = document.querySelectorAll(".image-container > li");
const cheatKey = document.querySelector(".cheat-key");

// 치트 키 버튼 클릭 처리
cheatKey.addEventListener("click", function () {
  [...container.children].forEach((child) => {
    child.innerText = child.getAttribute("data-type");
  });
});

let isPlaying = false;
let timeinterval = null;
let time = 0;

// 시작 버튼 클릭 처리
startButton.addEventListener("click", () => {
  setGame();
});

// 게임 설정
function setGame() {
  time = 0;
  gameText.style.display = "none";
  changePicButton.disabled = true; // 게임 시작 시 change-pic 버튼 비활성화

  // 이전 게임에서 cheatKey로 표시된 텍스트를 지우기
  [...container.children].forEach((child) => {
    child.innerText = "";
  });

  timeinterval = setInterval(() => {
    time++;
    playTime.innerText = time;
  }, 1000);

  const gameTiles = shuffle([...tiles]);
  container.innerHTML = "";
  gameTiles.forEach((tile) => {
    container.appendChild(tile);
  });
}

// 배열을 섞는 함수
function shuffle(array) {
  let index = array.length - 1;

  while (index > 0) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    index--;
  }

  return array;
}

// 게임 상태 확인
function checkStatus() {
  const currentlist = [...container.children];
  const unMatched = currentlist.filter((list, index) => {
    return Number(list.getAttribute("data-type")) !== index;
  });
  if (unMatched.length === 0) {
    isPlaying = false;
    clearInterval(timeinterval);
    gameText.style.display = "block";
    changePicButton.disabled = false; // 게임이 끝나면 change-pic 버튼 활성화
  }
}

// 드래그 이벤트 처리
container.addEventListener("dragstart", (e) => {
  const obj = e.target;
  dragged.el = obj;
  dragged.class = obj.className;
  dragged.index = [...obj.parentNode.children].indexOf(obj);
});

container.addEventListener("dragover", (e) => {
  e.preventDefault();
});

container.addEventListener("drop", (e) => {
  const obj = e.target;
  let orginPlace;
  let isLast = false;
  if (dragged.el.nextSibling) {
    orginPlace = dragged.el.nextSibling;
  } else {
    orginPlace = dragged.el.previousSibling;
    isLast = true;
  }
  const droppedIndex = [...obj.parentNode.children].indexOf(obj);
  dragged.index > droppedIndex ? obj.before(dragged.el) : obj.after(dragged.el);
  isLast ? orginPlace.after(obj) : orginPlace.before(obj);
  checkStatus();
});

// 특정 숫자 배열
const numbers = [20, 30, 45, 167, 460, 526, 529];

// 현재 사용 중인 숫자를 제외한 랜덤 숫자 선택 함수
function getRandomNumber(excludedNumbers) {
  const availableNumbers = numbers.filter(
    (num) => !excludedNumbers.includes(num)
  );
  if (availableNumbers.length === 0) {
    // 모든 숫자가 제외된 경우, 리스트를 재설정
    return numbers[Math.floor(Math.random() * numbers.length)];
  }
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  return availableNumbers[randomIndex];
}

// 랜덤 숫자로 배경 이미지 설정
function setBackgroundImage() {
  // 현재 사용 중인 배경 이미지 가져오기
  const usedNumbers = [...document.querySelectorAll("li")]
    .map((li) => {
      const url = li.style.backgroundImage;
      const match = url.match(/id\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    })
    .filter((num) => num !== null);

  // 현재 사용 중인 숫자를 제외한 새 랜덤 숫자 선택
  const randomNumber = getRandomNumber(usedNumbers);

  // 모든 타일에 새 배경 이미지 설정
  const images = document.querySelectorAll("li");
  images.forEach((image) => {
    image.style.backgroundImage = `url("https://picsum.photos/id/${randomNumber}/400/400")`;
  });
}

// change-pic 버튼 클릭 처리 함수
function handleChangePic() {
  if (!changePicButton.disabled) {
    // gameText가 화면에 나타난 상태라면 gameText를 숨기기
    if (gameText.style.display === "block") {
      gameText.style.display = "none";
    }

    // 데이터 타입 텍스트(숫자) 숨기기
    [...container.children].forEach((child) => {
      child.innerText = "";
    });

    setBackgroundImage();
  }
}

// change-pic 버튼에 클릭 이벤트 리스너 추가
changePicButton.addEventListener("click", handleChangePic);

// 페이지 로드 시 배경 이미지 초기화 및 change-pic 버튼 활성화
window.addEventListener("load", () => {
  setBackgroundImage();
  changePicButton.disabled = false; // 페이지 로드 시 change-pic 버튼 활성화
});
