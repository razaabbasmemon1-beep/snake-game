const board = document.querySelector('.board');
const startButton = document.querySelector(".btn-start")
const modal = document.querySelector(".modal")
const startGameModal = document.querySelector(".start-game")
const gameOvermodal = document.querySelector(".game-over")
const restartButton = document.querySelector(".btn-restart")
const pauseButton = document.getElementById("pauseButton") // 👈 added

const highScoreElement = document.querySelector("#high-score")
const ScoreElement = document.querySelector("#score")
const timeElement = document.querySelector("#time")

const blockHeight = 50
const blockWidth = 50

let highScore = localStorage.getItem("highScore") || 0
let score = 0
let time = `00-00`
let isPaused = false // 👈 added

highScoreElement.innerText = highScore

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);
let intervalId = null
let timerIntervalId = null

let food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
const blocks = []
let snake = [{ x: 1, y: 3 }]
let direction = 'down'

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div');
        block.classList.add("block")
        board.appendChild(block);
        blocks[`${row}-${col}`] = block
    }
}

function render() {
    let head = null
    blocks[`${food.x}-${food.y}`].classList.add("food")

    if (direction === "left") {
        head = { x: snake[0].x, y: snake[0].y - 1 }
    } else if (direction === "right") {
        head = { x: snake[0].x, y: snake[0].y + 1 }
    } else if (direction === "down") {
        head = { x: snake[0].x + 1, y: snake[0].y }
    } else if (direction === "up") {
        head = { x: snake[0].x - 1, y: snake[0].y }
    }

    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalId)
        clearInterval(timerIntervalId)
        modal.style.display = "flex"
        startGameModal.style.display = "none"
        gameOvermodal.style.display = "flex"
        return;
    }

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
        blocks[`${segment.x}-${segment.y}`].classList.remove("head")
    })

    if (head.x == food.x && head.y == food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food")
        food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
        blocks[`${food.x}-${food.y}`].classList.add("food")
        snake.unshift(head)
        score += 10
        ScoreElement.innerText = score
        if (score > highScore) {
            highScore = score
            localStorage.setItem("highScore", highScore.toString())
        }
    } else {
        snake.unshift(head)
        snake.pop()
    }

    snake.forEach((segment, index) => {
        if (index === 0) {
            blocks[`${segment.x}-${segment.y}`].classList.add("head")
        } else {
            blocks[`${segment.x}-${segment.y}`].classList.add("fill")
        }
    })
}

// 👈 pause logic
pauseButton.addEventListener("click", () => {
    if (isPaused) {
        intervalId = setInterval(() => { render() }, 300)
        timerIntervalId = setInterval(() => { updateTimer() }, 1000)
        pauseButton.innerText = "Pause"
        isPaused = false
    } else {
        clearInterval(intervalId)
        clearInterval(timerIntervalId)
        pauseButton.innerText = "Resume"
        isPaused = true
    }
})

function updateTimer() {
    let [min, sec] = time.split("-").map(Number)
    if (sec == 59) {
        min += 1
        sec = 0
    } else {
        sec += 1
    }
    time = `${min}-${sec}`
    timeElement.innerText = time
}

startButton.addEventListener("click", () => {
    modal.style.display = "none"
    intervalId = setInterval(() => { render() }, 300)
    timerIntervalId = setInterval(() => { updateTimer() }, 1000)
})

restartButton.addEventListener("click", restartGame)

function restartGame() {

    clearInterval(intervalId)       // 👈 add this
    clearInterval(timerIntervalId)  // 👈 add this

    blocks[`${food.x}-${food.y}`].classList.remove("food")
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
        blocks[`${segment.x}-${segment.y}`].classList.remove("head")
    })
    score = 0
    time = `00-00`
    isPaused = false // 👈 reset pause
    pauseButton.innerText = "Pause" // 👈 reset button text
    ScoreElement.innerText = score
    timeElement.innerText = time
    highScoreElement.innerText = highScore
    modal.style.display = "none"
    direction = "down"
    snake = [{ x: 1, y: 3 }]
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
    intervalId = setInterval(() => { render() }, 300)
    timerIntervalId = setInterval(() => { updateTimer() }, 1000)
}

// 👈 all keydown in one place — no duplicates
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") direction = "up"
    else if (e.key === "ArrowRight") direction = "right"
    else if (e.key === "ArrowLeft") direction = "left"
    else if (e.key === "ArrowDown") direction = "down"
    else if (e.key === " ") pauseButton.click() // spacebar to pause
    else if (e.key === "x" || e.key === "X") {
        if (!isPaused) {
            clearInterval(intervalId)
            intervalId = setInterval(() => { render() }, 50)
        }
    }
})

document.addEventListener("keyup", (e) => {
    if (e.key === "x" || e.key === "X") {
        if (!isPaused) {
            clearInterval(intervalId)
            intervalId = setInterval(() => { render() }, 300)
        }
    }
})





// Mouse-controlled snake direction
document.addEventListener('mousemove', (e) => {
    const boardRect = board.getBoundingClientRect();
    const mouseCol = Math.floor((e.clientX - boardRect.left) / blockWidth);
    const mouseRow = Math.floor((e.clientY - boardRect.top) / blockHeight);

    const headRow = snake[0].x;
    const headCol = snake[0].y;

    const dx = mouseCol - headCol;
    const dy = mouseRow - headRow;

    let newDirection;
    if (Math.abs(dx) > Math.abs(dy)) {
        newDirection = dx > 0 ? 'right' : 'left';
    } else {
        newDirection = dy > 0 ? 'down' : 'up';
    }

    // block reversing straight into yourself
    if (
        (newDirection === 'left' && direction === 'right') ||
        (newDirection === 'right' && direction === 'left') ||
        (newDirection === 'up' && direction === 'down') ||
        (newDirection === 'down' && direction === 'up')
    ) {
        return;
    }

    direction = newDirection;
});










const faviconFrames = [
    "favicon_io(1)/favicon1.png",
    "favicon_io(1)/favicon3.png"
]
let fIndex = 0
const faviconLink = document.querySelector("link[rel='icon']")

setInterval(() => {
    faviconLink.href = faviconFrames[fIndex]
    fIndex = (fIndex + 1) % faviconFrames.length
}, 3000)