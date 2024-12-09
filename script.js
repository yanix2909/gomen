const bird = document.getElementById('bird');
const gameContainer = document.getElementById('gameContainer');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('finalScore');
const resetBtn = document.getElementById('resetBtn');
const startBtn = document.getElementById('startBtn');
const soundToggle = document.getElementById('soundToggle');
const bgMusic = document.getElementById('bgMusic');

let birdY = gameContainer.offsetHeight * 0.6;
let velocity = 0;
let score = 0;
let gameActive = false;
let soundEnabled = true;
const gravity = 0.2;
const jump = -5;
const pipes = [];

bird.style.width = '20%';
bird.style.maxWidth = '200px';

const jumpSound = new Audio('path/to/jump-sound.mp3');
const scoreSound = new Audio('path/to/score-sound.mp3');
const crashSound = new Audio('assets/sounds/crash.mp3');

function startGame() {
    startScreen.style.display = 'none';
    gameActive = true;
    reset();
    bgMusic.play();
}

function updateBird() {
    velocity += gravity;
    birdY += velocity;
    bird.style.transform = `translateY(${birdY}px) rotate(${velocity * 1.5}deg)`;

    const birdHeight = bird.offsetHeight;
    if (birdY < 0 || birdY > gameContainer.offsetHeight - birdHeight) {
        gameOver();
    }
}

function createPipe() {
    const gap = gameContainer.offsetHeight * 0.5;
    const pipeTop = document.createElement('div');
    const pipeBottom = document.createElement('div');
    const pipeHeight = Math.random() * (gameContainer.offsetHeight - gap - gameContainer.offsetHeight * 0.4) + gameContainer.offsetHeight * 0.2;

    pipeTop.className = 'pipe';
    pipeBottom.className = 'pipe';

    pipeTop.style.height = pipeHeight + 'px';
    pipeTop.style.left = gameContainer.offsetWidth + 'px';
    pipeTop.style.top = '0';

    pipeBottom.style.height = (gameContainer.offsetHeight - pipeHeight - gap) + 'px';
    pipeBottom.style.left = gameContainer.offsetWidth + 'px';
    pipeBottom.style.bottom = '0';

    gameContainer.appendChild(pipeTop);
    gameContainer.appendChild(pipeBottom);

    pipes.push({
        top: pipeTop,
        bottom: pipeBottom,
        x: gameContainer.offsetWidth,
        counted: false
    });
}

function updatePipes() {
    const speed = gameContainer.offsetWidth * 0.004;
    pipes.forEach((pipe, index) => {
        pipe.x -= speed;
        pipe.top.style.left = pipe.x + 'px';
        pipe.bottom.style.left = pipe.x + 'px';

        if (pipe.x < -pipe.top.offsetWidth) {
            gameContainer.removeChild(pipe.top);
            gameContainer.removeChild(pipe.bottom);
            pipes.splice(index, 1);
        }

        const birdWidth = bird.offsetWidth;
        if (pipe.x < birdWidth && !pipe.counted) {
            score++;
            scoreElement.textContent = score;
            pipe.counted = true;
            if (soundEnabled) scoreSound.play();

            // Check if score is 5 to show the treasure chest
            if (score === 5) {
                showTreasureChest();
            }
        }

        checkCollision(pipe);
    });
}

function checkCollision(pipe) {
    const birdRect = bird.getBoundingClientRect();
    const topPipeRect = pipe.top.getBoundingClientRect();
    const bottomPipeRect = pipe.bottom.getBoundingClientRect();

    if (
        birdRect.right > topPipeRect.left + 10 &&
        birdRect.left < topPipeRect.right - 10 &&
        (birdRect.top < topPipeRect.bottom - 10 || birdRect.bottom > bottomPipeRect.top + 10)
    ) {
        gameOver();
    }
}

function gameOver() {
    gameActive = false;
    if (soundEnabled) crashSound.play();
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

function reset() {
    birdY = gameContainer.offsetHeight * 0.6;
    velocity = 0;
    score = 0;
    gameActive = true;
    scoreElement.textContent = '0';
    gameOverScreen.style.display = 'none';
    
    pipes.forEach(pipe => {
        gameContainer.removeChild(pipe.top);
        gameContainer.removeChild(pipe.bottom);
    });
    pipes.length = 0;
    
    // Don't reset the bird image if one was uploaded
    if (bird.style.backgroundImage) {
        bird.style.backgroundSize = 'contain';
        bird.style.backgroundPosition = 'center';
        bird.style.backgroundRepeat = 'no-repeat';
    }
    
    bgMusic.currentTime = 0;
    if (gameActive) bgMusic.play();
}

function handleInput() {
    if (!gameActive) return;
    velocity = jump;
    if (soundEnabled) jumpSound.play();
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space') handleInput();
});

gameContainer.addEventListener('click', handleInput);
resetBtn.addEventListener('click', reset);
startBtn.addEventListener('click', startGame);

soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🎵' : '🔈';
});

window.addEventListener('resize', () => {
    reset();
});

setInterval(() => {
    if (!gameActive) return;
    updateBird();
    updatePipes();
}, 1000/60);

setInterval(() => {
    if (!gameActive) return;
    createPipe();
}, 4000);

function showTreasureChest() {
    const finishLineMessage = document.getElementById('finishLineMessage');
    const treasureChest = document.getElementById('treasureChest');
    
    finishLineMessage.style.display = 'block';
    treasureChest.style.display = 'block';
    treasureChest.style.animation = 'bounce 1s infinite';
    gameActive = false;
    
    // Stop background music when reaching finish line
    bgMusic.pause();
    bgMusic.currentTime = 0;

    treasureChest.addEventListener('click', () => {
        treasureChest.style.display = 'none';
        finishLineMessage.style.display = 'none';
        showTrophy();
    });
}

function showTrophy() {
    const trophy = document.getElementById('trophy');
    const combineText = document.getElementById('combineText');
    const birdPosition = bird.getBoundingClientRect();
    const containerPosition = gameContainer.getBoundingClientRect();
    
    // Position trophy near the bird's last position
    const relativeTop = birdPosition.top - containerPosition.top;
    trophy.style.top = `${relativeTop}px`;
    trophy.style.display = 'block';
    trophy.style.animation = 'revealTrophy 1s ease-out forwards';
    
    // Show combine text after the reveal animation
    setTimeout(() => {
        combineText.style.display = 'block';
        // Automatically start combine animation after text appears
        trophy.style.animation = 'combine 2s ease-in-out forwards';
        
        // Automatically proceed to loading screen after combine animation
        setTimeout(() => {
            showLoadingAndFinalImage();
        }, 2000);
    }, 1000);
}

function showLoadingAndFinalImage() {
    const loadingScreen = document.getElementById('loadingScreen');
    const finalImage = document.getElementById('finalImage');
    const trophy = document.getElementById('trophy');
    const combineText = document.getElementById('combineText');
    const finalImageAudio = document.getElementById('finalImageAudio');
    const bodyBackgroundVideo = document.getElementById('bodyBackgroundVideo');
    const gameContainer = document.getElementById('gameContainer');
    
    // Hide trophy and combine text
    trophy.style.display = 'none';
    combineText.style.display = 'none';
    loadingScreen.style.display = 'block';
    
    // Simulate loading time (3 seconds)
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        finalImage.style.display = 'block';
        document.getElementById('revealedImage').src = 'noFilter.png';
        finalImageAudio.play();
        
        // Show and play the background video
        bodyBackgroundVideo.style.display = 'block';
        bodyBackgroundVideo.play();
        
        // Remove the gradient background from body
        document.body.style.background = 'none';
        document.body.style.animation = 'none';
        
        // Make the game container background and border transparent
        gameContainer.style.background = 'transparent';
        gameContainer.style.border = 'none';
    }, 3000);
}

