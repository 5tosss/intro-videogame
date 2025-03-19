// Obtener el canvas y su contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTime = 0;
const playerImage = new Image();
playerImage.src = "files/player.png";
const enemyImage = new Image();
enemyImage.src = "files/enemyTwo.png";
let damageTaken = 0; // Impactos recibidos
let enemiesDestroyed = 0; // Naves destruidas
let startTime = Date.now(); // Para calcular el tiempo transcurrido
let timer; // Variable para almacenar el temporizador
let elapsedTime = 0; // Tiempo transcurrido en segundos

// Obtener el elemento de audio del disparo del jugador
var playerShootSound = document.getElementById("playerShootSound");

var enemyShootSound = document.getElementById("enemyShootSound");

// Función para reproducir el sonido del disparo del jugador

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
    document.getElementById("enemiesDestroyed").textContent = enemiesDestroyed;
    document.getElementById("timeElapsed").textContent = elapsedTime;
    // Mostrar el mejor tiempo del nivel
    document.getElementById("bestTime").textContent = getBestTime("level1") + " s"; // Muestra el mejor tiempo para el nivel 1
}
// Mostrar un mensaje al comenzar
window.onload = function () {
    if (confirm("¡El imperio nos contraataca, toma tu X-Wing y defiende!")) {
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
// Definición del jugador
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    damage: 0,
    draw: function () {
        ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
    }
};
playerImage.onload = function () {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
};

// Arreglos para proyectiles y naves enemigas
const playerProjectiles = [];
const enemyShips = [];
const enemyProjectiles = [];
let enemyDestroyedCount = 0;

// Control de teclas para mover al jugador
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Disparo del jugador con click izquierdo
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        playerShootSound.play();
        playerProjectiles.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 10,
            speed: 7,
            update: function () { this.y -= this.speed; },
            draw: function () {
                ctx.fillStyle = 'red';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        });
    }
});

// Función para crear naves enemigas
function spawnEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 4 + Math.random() * 2,
        update: function () { this.y += this.speed; },
        draw: function () {
            ctx.drawImage(enemyImage, this.x, this.y, this.width, this.height);
        }
    };
    enemyShips.push(enemy);
}
setInterval(spawnEnemy, 1000);

// Función para que las naves enemigas disparen
function enemyShoot() {
    if (enemyShips.length > 0) {
        const enemy = enemyShips[Math.floor(Math.random() * enemyShips.length)];
        enemyShootSound.play();  // Reproducir el sonido de disparo del enemigo
        enemyProjectiles.push({
            x: enemy.x + enemy.width / 2 - 2.5,
            y: enemy.y + enemy.height,
            width: 5,
            height: 10,
            speed: 8,
            update: function () { this.y += this.speed; },
            draw: function () {
                ctx.fillStyle = '#4ff113';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        });
    }
}
setInterval(enemyShoot, 1500);

// Función para detectar colisiones
function checkCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// Función principal de actualización del juego
function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar la posición del jugador según teclas
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
    player.draw();

    // Actualizar y dibujar los proyectiles del jugador
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        const proj = playerProjectiles[i];
        proj.update();
        proj.draw();
        if (proj.y + proj.height < 0) {
            playerProjectiles.splice(i, 1);
            continue;
        }
        // Comprobar colisión con cada nave enemiga
        for (let j = enemyShips.length - 1; j >= 0; j--) {
            const enemy = enemyShips[j];
            if (checkCollision(proj, enemy)) {
                enemyShips.splice(j, 1);
                playerProjectiles.splice(i, 1);
                enemyDestroyedCount++;
                // Ejemplo cuando una nave enemiga es destruida:
                enemiesDestroyed++; // Aumenta el contador
                updateStats(); // Actualiza la visualización
                break;
            }
        }
    }

    // Actualizar y dibujar las naves enemigas
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        const enemy = enemyShips[i];
        enemy.update();
        enemy.draw();
        if (enemy.y > canvas.height) {
            enemyShips.splice(i, 1);
        }
    }

    // Actualizar y dibujar los proyectiles enemigos
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const proj = enemyProjectiles[i];
        proj.update();
        proj.draw();
        if (proj.y > canvas.height) {
            enemyProjectiles.splice(i, 1);
            continue;
        }
        // Comprobar colisión con el jugador
        if (checkCollision(proj, player)) {
            enemyProjectiles.splice(i, 1);
            player.damage++;
            // Ejemplo cuando el jugador recibe un impacto:
            damageTaken++; // Aumenta el contador
            updateStats(); // Actualiza la visualización
            if (player.damage >= 5) {
                stopTimer(); // Detener el cronómetro y guardar el mejor tiempo
                alert("Estuvimos tan cerca de la victoria...");
                window.location.href = "index.html";
                return;
            }
        }
    }

    // Condición de victoria: 50 enemigos destruidos
    if (enemyDestroyedCount >= 50) {
        stopTimer(); // Detener el cronómetro y guardar el mejor tiempo
        alert("Eres el mejor piloto de la galaxia, el imperio está muy debil.");
        window.location.href = "index.html";
        return;
    }
}
function gameLoop() {
    updateStats(); // Actualiza las estadísticas en cada ciclo
    requestAnimationFrame(gameLoop);
}
// Función para iniciar el juego
function startGame() {
    startTime = Date.now(); // Resetear el tiempo al inicio
    elapsedTime = 0; // Resetear el tiempo transcurrido
    startTimer(); // Iniciar el cronómetro
    requestAnimationFrame(gameLoop);
}
// Bucle principal del juego usando requestAnimationFrame
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    update(deltaTime);
    requestAnimationFrame(gameLoop);
}
