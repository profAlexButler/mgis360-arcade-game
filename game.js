/**
 * GAME CONFIGURATION
 */
const FPS = 60;
const FRICTION = 0.7; // friction coefficient (0 = none, 1 = max)
const SHIP_SIZE = 20; // ship height in pixels
const SHIP_THRUST = 5; // acceleration in pixels per second per second
const SHIP_TURN_SPEED = 360; // turn speed in degrees per second
const SHOW_BOUNDING_BOX = false; // for debugging

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score-val");

// Set canvas size
function resize() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;
}
window.addEventListener('resize', resize);
resize();

/**
 * GAME STATE
 */
let score = 0;
let ship = newShip();

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // convert to radians (facing up)
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    };
}

/**
 * INPUT HANDLING
 */
const keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

/**
 * GAME LOOP
 */
setInterval(update, 1000 / FPS);

function update() {
    // 1. Handle Input
    ship.rot = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) {
        ship.rot = SHIP_TURN_SPEED / 180 * Math.PI / FPS;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        ship.rot = -SHIP_TURN_SPEED / 180 * Math.PI / FPS;
    }
    ship.thrusting = (keys['ArrowUp'] || keys['KeyW']);

    // 2. Draw Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Update Ship Physics
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        // Draw thrust flame
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = SHIP_SIZE / 10;
        ctx.beginPath();
        ctx.moveTo( // rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo( // rear center (flame tip)
            ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
        );
        ctx.lineTo( // rear right
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.stroke();
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // Rotate ship
    ship.a += ship.rot;

    // Move ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // Handle edge of screen wrapping
    if (ship.x < 0 - ship.r) ship.x = canvas.width + ship.r;
    else if (ship.x > canvas.width + ship.r) ship.x = 0 - ship.r;
    
    if (ship.y < 0 - ship.r) ship.y = canvas.height + ship.r;
    else if (ship.y > canvas.height + ship.r) ship.y = 0 - ship.r;

    // 4. Draw Ship
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = SHIP_SIZE / 10;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f2ff";
    
    ctx.beginPath();
    ctx.moveTo( // nose
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( // rear left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( // rear right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();
    
    ctx.shadowBlur = 0; // Reset shadow for other elements

    if (SHOW_BOUNDING_BOX) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }
}