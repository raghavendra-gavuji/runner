import Player from './player.js'; // Adjust the path as necessary
import { ParallaxLayer } from './parallax.js'; // Import ParallaxLayer

// Creating the canvas
const canvas = document.getElementById("mycanvas");
const container = document.getElementById("container");
const ctx = canvas.getContext("2d");

// Function to resize the canvas based on device pixel ratio
resize();
function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    // Save the current transformation matrix
    const transform = ctx.getTransform();

    // Adjust canvas size based on container size and device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Set the style width and height to match the container
    canvas.style.width = `${rect.width - 4}px`;
    canvas.style.height = `${rect.height - 4}px`;

    // Reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Scale the context to match the device pixel ratio
    ctx.scale(dpr, dpr);

    // Restore the previous transformation matrix
    ctx.setTransform(transform);
}
window.addEventListener("resize", resize);

let isGameOver = false;
let isGameStarted = false;

// Load parallax layers
const layers = [
    new ParallaxLayer('background/sky.png', 0.2, canvas),
    new ParallaxLayer('background/clouds.png', 0.4, canvas),
    new ParallaxLayer('background/background.png', 0.6, canvas),
    new ParallaxLayer('background/foreground.png', 0.8, canvas)
];

// Player object
const player = new Player({ x: 150, y: canvas.height - 140 }, 2, canvas); // Pass canvas to Player
player.gravity = 1.3;
player.velocity = 0;

function updatePlayer() {
    player.velocity += player.gravity;
    player.position.y += player.velocity;

    // Detect collision with the ground
    if (player.position.y + player.size.height > canvas.height) {
        player.position.y = canvas.height - player.size.height;
        player.velocity = 0; // Stop falling when on the ground
    }
}

function jump() {
    if (player.position.y + player.size.height >= canvas.height) {
        player.velocity = -35; // Adjust jump velocity
        if (player.state === 'idle') {
            player.setState('run'); // Change state to running if jumping from idle
        }
    }
}

function resetGame() {
    player.setState('idle'); // Reset player state to idle
    player.position = { x: 150, y: canvas.height - player.size.height }; // Reset player position
    player.velocity = 0;
    isGameOver = false;
    isGameStarted = false;
    obstacles = [];
    distanceCovered = 0;
    nextObstacleDistance = getRandomDistance(minObstacleDistance, maxObstacleDistance);
    globalSpeedFactor = 1;
    animate(0); // Restart the animation loop
}

// Obstacle class
class Obstacle {
    constructor(position, size, baseSpeed) {
        this.position = position;
        this.size = size;
        this.baseSpeed = baseSpeed;
        this.image = new Image();
        this.image.src = `obstacles/obstacle_${Math.floor(Math.random() * 7) + 1}.png`; // Random obstacle image
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update(globalSpeedFactor) {
        this.draw(ctx);
        this.position.x -= this.baseSpeed * globalSpeedFactor;
    }
}

// Obstacle array and other variables
let obstacles = [];
const minObstacleDistance = 500;
const maxObstacleDistance = 1000;
let distanceCovered = 0;
let nextObstacleDistance = getRandomDistance(minObstacleDistance, maxObstacleDistance);
const baseObstacleSpeed = 5;

function getRandomSize(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDistance(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isCollision(player, obstacle) {
    return player.position.x < obstacle.position.x + obstacle.size.width &&
           player.position.x + player.size.width > obstacle.position.x &&
           player.position.y < obstacle.position.y + obstacle.size.height &&
           player.position.y + player.size.height > obstacle.position.y;
}

let globalSpeedFactor = 1;
const speedIncrement = 0.0001;

function animate(time) {
    if (isGameOver && player.state === 'dead') {
        // Play dead animation
        player.update(ctx, globalSpeedFactor);
        if (player.frameIndex >= player.frames.length - 1) {
            return; // End animation when it finishes
        }
    } else {
        if (isGameOver) {
            return; // Stop updating if game is over
        }

        window.requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw parallax layers only if the game has started
        if (isGameStarted) {
            layers.forEach(layer => {
                layer.update(globalSpeedFactor);
                layer.draw(ctx);
            });

            updatePlayer();
            player.update(ctx, globalSpeedFactor); // Pass globalSpeedFactor to update method

            globalSpeedFactor += speedIncrement;
            distanceCovered += baseObstacleSpeed * globalSpeedFactor;

            if (distanceCovered >= nextObstacleDistance) {
                const obstacleWidth = getRandomSize(50, 100);
                const obstacleHeight = getRandomSize(70, 100);
                const obstaclePosition = { x: canvas.width, y: canvas.height - obstacleHeight };
                obstacles.push(new Obstacle(obstaclePosition, { width: obstacleWidth, height: obstacleHeight }, baseObstacleSpeed));
                nextObstacleDistance = distanceCovered + getRandomDistance(minObstacleDistance, maxObstacleDistance);
            }

            obstacles.forEach(obstacle => {
                obstacle.update(globalSpeedFactor);
            });

            obstacles = obstacles.filter(obstacle => obstacle.position.x + obstacle.size.width >= 0);

            obstacles.forEach(obstacle => {
                if (isCollision(player, obstacle)) {
                    isGameOver = true;
                    player.setState('dead'); // Change state to dead upon collision
                    return;
                }
            });
        } else {
            // Draw idle animation if the game hasn't started
            layers.forEach(layer => {
                layer.draw(ctx);
            });
            player.update(ctx, globalSpeedFactor);
        }
    }
}

animate(0);

// Handle keyboard input for jumping and starting/resetting the game
window.addEventListener("keydown", (event) => {
    if (event.code === 'KeyW' || event.code === 'ArrowUp') {
        jump();
    }
    if (event.code === 'KeyW' || event.code === 'Space') {
        if (isGameOver) {
            resetGame(); // Reset game on space or W key if game is over
        } else if (!isGameStarted) {
            isGameStarted = true; // Start the game on space or W key if not started
            player.setState('run'); // Ensure player starts in running state
        } else {
            jump();
        }
    }
});

// Handle touch input for jumping and starting/resetting the game
let touchStartY = 0;
canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStartY = touch.clientY;
    
    if (isGameOver) {
        resetGame(); // Reset game on touch if game is over
    } else if (!isGameStarted) {
        isGameStarted = true; // Start the game on touch if not started
        player.setState('run'); // Ensure player starts in running state
    }
});

canvas.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    
    if (touch.clientY < touchStartY) {
        jump(); // Trigger jump if the touch end position is above the start position
    }
});
