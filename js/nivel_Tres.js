// Obtener el canvas y su contexto
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bossImage = new Image();
bossImage.src = "/files/bossShip.png"; 
const playerImage = new Image();
playerImage.src = "/files/player.png";
let damageTaken = 0; // Impactos recibidos
let enemiesDestroyed = 0; // Naves destruidas
let startTime = Date.now(); // Para calcular el tiempo transcurrido
let timer; // Variable para almacenar el temporizador
let elapsedTime = 0; // Tiempo transcurrido en segundos
// Obtener el elemento de audio del disparo del jugador
var playerShootSound = document.getElementById("playerShootSound");

var enemyShootSound = document.getElementById("enemyShootSound");

// Guardar el mejor tiempo en localStorage
function saveBestTime(level, time) {
    let bestTime = localStorage.getItem(level); // Obtener el mejor tiempo almacenado para el nivel
    if (!bestTime || time < bestTime) {
        localStorage.setItem(level, time); // Guardar el mejor tiempo si el nuevo tiempo es menor
    }
}

// Recuperar el mejor tiempo del nivel desde localStorage
function getBestTime(level) {
    return localStorage.getItem(level) || "N/A"; // Si no existe un tiempo guardado, devolver "N/A"
}

// Recuperar el mejor tiempo del nivel desde localStorage
function getBestTime(level) {
    return localStorage.getItem(level) || "N/A"; // Si no existe un tiempo guardado, devolver "N/A"
}

// Actualizar estadísticas
function updateStats() {
    // Calcular el tiempo transcurrido
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    // Actualizar el DOM con los valores
    document.getElementById("damageTaken").textContent = damageTaken;
    document.getElementById("enemiesDestroyed").textContent = boss.health;
    document.getElementById("timeElapsed").textContent = elapsedTime;
    // Mostrar el mejor tiempo del nivel
    document.getElementById("bestTime").textContent = getBestTime("level1") + " s"; // Muestra el mejor tiempo para el nivel 1
}
// Mostrar un mensaje al comenzar
window.onload = function () {
    if (confirm("¡Cuidado, nos ataca un Destructor Estelar!")) {
        startGame();  // Llamar a la función para comenzar el juego
    } else {
        window.location.href = "index.html"; // Volver al menú principal si el jugador cancela
    }
};
// Iniciar el cronómetro
function startTimer() {
    timer = setInterval(function () {
        elapsedTime++; // Aumentar el tiempo transcurrido en 1 segundo
        updateStats(); // Actualizar las estadísticas en pantalla
    }, 1000); // Se actualiza cada 1000 ms (1 segundo)
}

// Detener el cronómetro (cuando el juego termine)
function stopTimer() {
    clearInterval(timer); // Detener el cronómetro
    saveBestTime("level1", elapsedTime); // Guardar el mejor tiempo para el nivel 1
}

// Variables del jugador
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    health: 5,
    score: 0
};

// Variables del jefe final
const boss = {
    x: canvas.width / 2 - 75,
    y: 50,
    width: 200,
    height: 200,
    health: 80,
    speed: 2,
    direction: 1, // 1: derecha, -1: izquierda
    bullets: []
};

// Variables del proyectil del jugador
let playerBullets = [];

// Variables de teclas
let keys = {};

// Variables del juego
let gameOver = false;

// Detectar las teclas presionadas
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Función para mover al jugador
function movePlayer() {
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// Función para dibujar la nave del jugador
function drawPlayer() {
    ctx.drawImage(playerImage ,player.x, player.y, player.width, player.height);
}

// Función para disparar los proyectiles del jugador
document.addEventListener("click", () => {
    playerShootSound.play();
    playerBullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 5
    });
});

// Función para dibujar los proyectiles del jugador
function drawPlayerBullets() {
    ctx.fillStyle = "red";
    playerBullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            playerBullets.splice(index, 1);
        }
    });
}

// Función para mover el jefe final
function moveBoss() {
    boss.x += boss.speed * boss.direction;

    // Cambiar dirección y velocidad aleatoriamente
    if (Math.random() < 0.01) { // Probabilidad de cambiar dirección
        boss.direction *= -1; 
        boss.speed = Math.random() * 3 + 1; // Nueva velocidad aleatoria entre 1 y 4
    }

    // Asegurar que el jefe no salga de los límites
    if (boss.x <= 0) {
        boss.x = 0;
        boss.direction = 1;
    }
    if (boss.x + boss.width >= canvas.width) {
        boss.x = canvas.width - boss.width;
        boss.direction = -1;
    }
}

// Función para dibujar al jefe final
function drawBoss() {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
}

// Función para mover los proyectiles del jefe
function moveBossBullets() {
    boss.bullets.forEach((bullet, index) => {
        ctx.fillStyle = "#4ff113";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y += bullet.speed;
        if (bullet.y > canvas.height) {
            boss.bullets.splice(index, 1);
        }
    });
}

// Función para disparar los proyectiles del jefe
function shootBossBullets() {
    if (Math.random() < 0.02) {
        enemyShootSound.play();
        boss.bullets.push({
            x: boss.x + boss.width / 2 - 2.5,
            y: boss.y + boss.height,
            width: 5,
            height: 10,
            speed: 8
        });
    }
}

// Función para manejar las colisiones
function checkCollisions() {
    // Colisiones entre los proyectiles del jugador y el jefe
    playerBullets.forEach((bullet, index) => {
        if (bullet.x < boss.x + boss.width &&
            bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.height > boss.y) {
            boss.health -= 1;
            playerBullets.splice(index, 1);
            if (boss.health <= 0) {
                stopTimer(); // Detener el cronómetro y guardar el mejor tiempo
                gameOver = true;
                alert("¡El imperio ha caido, celebremos en Endor!");
                window.location.href = "index.html";
            }
        }
    });

    // Colisiones entre los proyectiles del jefe y el jugador
    boss.bullets.forEach((bullet, index) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            player.health -= 1;
            boss.bullets.splice(index, 1);
            damageTaken++;
            if (player.health <= 0) {
                gameOver = true;
                alert("Será un tiempo mas de opresion del imperio...");
                window.location.href = "index.html";
            }
        }
    });
}


// Función para actualizar el juego
function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Limpiar el canvas

    startTimer();
    movePlayer();
    moveBoss();
    moveBossBullets();
    shootBossBullets();
    checkCollisions();

    drawPlayer();
    drawPlayerBullets();
    drawBoss();

    requestAnimationFrame(update);  // Llamar a la función de actualización
}

update();

