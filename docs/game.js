const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
const game = {
    level: 1,
    hearts: 0,
    lives: 3,
    scrollX: 0,
    levelWidth: 2800,
    won: false,
    showingFinalScene: false,
    finalSceneStartTime: 0
};

const player = {
    x: 120,
    y: 350,
    width: 32,
    height: 48,
    velY: 0,
    onGround: true,
    speed: 5,
    jumpPower: 18,
    animFrame: 0
};

// Arrays de objetos del juego
const waves = [];
const hearts = [];
const clouds = [];
const platforms = [];


const keys = {};


function initLevel() {
    waves.length = 0;
    hearts.length = 0;
    platforms.length = 0;
    game.showingFinalScene = false;

    for (let i = 0; i < game.levelWidth; i += 100) {
        platforms.push({
            x: i,
            y: 450,
            width: 100,
            height: 150
        });
    }
 
    const waveCount = game.level === 1 ? 6 : 9;
    const waveHeight = game.level === 1 ? 50 : 70;
    const waveSpeed = game.level === 1 ? 1.5 : 2.5;
    
    for (let i = 0; i < waveCount; i++) {
        waves.push({
            x: 300 + i * 350,
            y: 450 - waveHeight,
            width: 80,
            height: waveHeight,
            speed: waveSpeed,
            offset: i * 0.8,
            canStandOn: true
        });
    }
 
    const heartPositions = game.level === 1 ? 
        [500, 950, 1280] : 
        [600, 1200, 1800];
            
    heartPositions.forEach(x => {
        hearts.push({
            x: x,
            y: 380,
            width: 24,
            height: 24,
            collected: false,
            bounce: 0
        });
    });
    
    clouds.length = 0;
    for (let i = 0; i < 8; i++) {
        clouds.push({
            x: Math.random() * game.levelWidth,
            y: 30 + Math.random() * 120,
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20,
            speed: 0.2 + Math.random() * 0.5
        });
    }
}

function drawPixelRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
}

function drawPlayer() {
    const screenX = player.x - game.scrollX;
    player.animFrame += 0.2;
    

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(screenX + 4, player.y + player.height, player.width - 8, 6);
    

    drawPixelRect(screenX + 8, player.y + 16, 16, 24, '#74b9ff');

    drawPixelRect(screenX + 6, player.y, 20, 20, '#ffeaa7');
    drawPixelRect(screenX + 4, player.y - 4, 24, 12, '#f1c40f');

    drawPixelRect(screenX + 10, player.y + 6, 3, 3, '#2d3436');
    drawPixelRect(screenX + 17, player.y + 6, 3, 3, '#2d3436');
    
    drawPixelRect(screenX + 9, player.y + 4, 4, 1, '#f39c12');
    drawPixelRect(screenX + 17, player.y + 4, 4, 1, '#f39c12');

    drawPixelRect(screenX + 12, player.y + 12, 8, 2, '#e74c3c');
    
    const legAnim = Math.sin(player.animFrame) * 3;
    drawPixelRect(screenX + 10, player.y + 36, 4, 12, '#2c3e50');
    drawPixelRect(screenX + 18, player.y + 36, 4, 12, '#2c3e50');

    drawPixelRect(screenX + 8 + legAnim, player.y + 44, 8, 4, '#ecf0f1');
    drawPixelRect(screenX + 16 - legAnim, player.y + 44, 8, 4, '#ecf0f1');
    
    const armAnim = Math.sin(player.animFrame + 1) * 2;
    drawPixelRect(screenX + 2, player.y + 20 + armAnim, 6, 16, '#ffeaa7');
    drawPixelRect(screenX + 24, player.y + 20 - armAnim, 6, 16, '#ffeaa7');
}

function drawWave(wave) {
    const screenX = wave.x - game.scrollX;
    const time = Date.now() * 0.003;
    
    ctx.beginPath();
    ctx.fillStyle = '#0984e3';

    ctx.fillRect(screenX, wave.y + 20, wave.width, wave.height - 20);
    
    ctx.beginPath();
    ctx.fillStyle = '#0984e3';
    
    const wavePoints = [];
    for (let i = 0; i <= wave.width; i += 8) {
        const waveY = wave.y + Math.sin((i / wave.width) * Math.PI * 2 + time + wave.offset) * 15;
        wavePoints.push({ x: screenX + i, y: waveY });
    }
    
    ctx.beginPath();
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
    
    for (let i = 1; i < wavePoints.length; i++) {
        ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
    }
    
    ctx.lineTo(screenX + wave.width, wave.y + wave.height);
    ctx.lineTo(screenX, wave.y + wave.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < wave.width; i += 6) {
        const foamY = wave.y + Math.sin((i / wave.width) * Math.PI * 2 + time + wave.offset) * 15;
        if (Math.random() > 0.3) {
            drawPixelRect(screenX + i, foamY - 6, 4, 4, '#ffffff');
        }
        if (Math.random() > 0.6) {
            drawPixelRect(screenX + i + 2, foamY - 10, 2, 2, '#ddd');
        }
    }
    

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(screenX + 10, wave.y + 5, wave.width - 20, 8);
}

function drawHeart(heart) {
    if (heart.collected) return;
    
    const screenX = heart.x - game.scrollX;
    heart.bounce += 0.15;
    const bounceY = Math.sin(heart.bounce) * 8;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(screenX + 2, heart.y + bounceY + 20, 20, 4);

    ctx.fillStyle = '#e84393';
    drawPixelRect(screenX + 6, heart.y + bounceY + 6, 12, 8, '#e84393');
    drawPixelRect(screenX + 10, heart.y + bounceY + 2, 4, 4, '#e84393');
    drawPixelRect(screenX + 4, heart.y + bounceY + 4, 4, 4, '#e84393');
    drawPixelRect(screenX + 16, heart.y + bounceY + 4, 4, 4, '#e84393');
    drawPixelRect(screenX + 8, heart.y + bounceY + 14, 8, 4, '#e84393');

    ctx.fillStyle = '#ffffff';
    drawPixelRect(screenX + 8, heart.y + bounceY + 4, 2, 2, '#ffffff');

    for (let i = 0; i < 3; i++) {
        const sparkleX = screenX + 12 + Math.sin(heart.bounce + i) * 15;
        const sparkleY = heart.y + bounceY + 10 + Math.cos(heart.bounce + i * 2) * 10;
        drawPixelRect(sparkleX, sparkleY, 2, 2, '#ff7675');
    }
}

function drawCloud(cloud) {
    const screenX = cloud.x - game.scrollX;
    if (screenX < -cloud.width || screenX > canvas.width) return;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
 
    drawPixelRect(screenX + 10, cloud.y + 10, cloud.width - 20, 12, 'rgba(255, 255, 255, 0.9)');
    drawPixelRect(screenX + 5, cloud.y + 15, cloud.width - 10, 8, 'rgba(255, 255, 255, 0.9)');
    drawPixelRect(screenX, cloud.y + 18, cloud.width, 6, 'rgba(255, 255, 255, 0.9)');
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    drawPixelRect(screenX + 2, cloud.y + 22, cloud.width - 4, 4, 'rgba(200, 200, 200, 0.3)');
}

function drawBackground() {

    const gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, '#74b9ff');
    gradient.addColorStop(0.7, '#81ecec');
    gradient.addColorStop(1, '#00cec9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 450);

    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, 450, canvas.width, 150);
  
    ctx.fillStyle = '#e67e22';
    for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 450; j < 600; j += 15) {
            if (Math.random() > 0.7) {
                drawPixelRect(i + Math.random() * 10, j, 2, 2, '#e67e22');
            }
        }
    }

    ctx.fillStyle = '#0984e3';
    ctx.fillRect(0, 500, canvas.width, 100);
    
    ctx.fillStyle = '#fdcb6e';
    drawPixelRect(680, 40, 60, 60, '#fdcb6e');
    drawPixelRect(675, 50, 70, 40, '#fdcb6e');
    drawPixelRect(685, 35, 50, 70, '#fdcb6e');
    ctx.fillStyle = '#f39c12';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rayX = 710 + Math.cos(angle) * 80;
        const rayY = 70 + Math.sin(angle) * 80;
        drawPixelRect(rayX, rayY, 6, 6, '#f39c12');
    }
}

function drawFinalScene() {

    if (game.level !== 2) return;
    
    const endX = game.levelWidth - 250;
    const screenEndX = endX - game.scrollX;
    
    if (screenEndX > -150 && screenEndX < canvas.width + 150 && player.x >= game.levelWidth - 200) {
        if (!game.showingFinalScene) {
            game.showingFinalScene = true;
            game.finalSceneStartTime = Date.now();
        }

        const jumpTime = Date.now() * 0.008;
        const jumpOffset = Math.abs(Math.sin(jumpTime)) * 30;
        
        const meX = screenEndX;
        const meY = 340 - jumpOffset;
        

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(meX + 8, 420, 20, 8);
        

        drawPixelRect(meX + 6, meY + 20, 24, 28, '#e84393');
        

        drawPixelRect(meX + 10, meY - 8, 16, 12, '#2d3436'); 
        drawPixelRect(meX + 8, meY + 4, 20, 16, '#ffeaa7'); 
        
      
        drawPixelRect(meX + 12, meY + 8, 2, 2, '#2d3436');
        drawPixelRect(meX + 18, meY + 8, 2, 2, '#2d3436');
        drawPixelRect(meX + 14, meY + 12, 6, 1, '#e74c3c');

        drawPixelRect(meX + 2, meY + 24, 6, 20, '#ffeaa7');
        drawPixelRect(meX + 26, meY + 24, 6, 20, '#ffeaa7');

        drawPixelRect(meX + 12, meY + 46, 6, 16, '#ffeaa7');
        drawPixelRect(meX + 20, meY + 46, 6, 16, '#ffeaa7');
 
        const dogX = meX + 40;
        const dogY = 380 - jumpOffset * 0.7;

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(dogX + 4, 420, 16, 6);
      
        drawPixelRect(dogX, dogY + 8, 20, 12, '#8B4513');

        drawPixelRect(dogX + 4, dogY + 10, 6, 4, '#ffffff');
        drawPixelRect(dogX + 12, dogY + 12, 4, 3, '#ffffff');

        drawPixelRect(dogX - 4, dogY, 12, 10, '#8B4513');

        drawPixelRect(dogX - 2, dogY + 2, 8, 6, '#ffffff');
        
        drawPixelRect(dogX - 6, dogY - 2, 4, 8, '#A0522D');
        drawPixelRect(dogX + 8, dogY - 2, 4, 8, '#A0522D');
  
        drawPixelRect(dogX, dogY + 3, 2, 2, '#2d3436');
        drawPixelRect(dogX + 4, dogY + 3, 2, 2, '#2d3436');

        drawPixelRect(dogX + 2, dogY + 6, 1, 1, '#2d3436');

        drawPixelRect(dogX + 2, dogY + 18, 2, 4, '#8B4513');
        drawPixelRect(dogX + 6, dogY + 18, 2, 4, '#8B4513');
        drawPixelRect(dogX + 12, dogY + 18, 2, 4, '#8B4513');
        drawPixelRect(dogX + 16, dogY + 18, 2, 4, '#8B4513');
        const tailWag = Math.sin(Date.now() * 0.02) * 4;
        drawPixelRect(dogX + 18, dogY + 2 + tailWag, 3, 8, '#8B4513');
        

        for (let i = 0; i < 3; i++) {
            const heartFloat = Math.sin(Date.now() * 0.005 + i) * 8;
            const heartX = meX + 30 + i * 6;
            const heartY = meY + 10 + heartFloat;
            drawPixelRect(heartX, heartY, 4, 4, '#e84393');
        }
    }
}

function updatePlayer() {

    if (keys['ArrowLeft'] && player.x > game.scrollX + 20) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < game.levelWidth - 50) {
        player.x += player.speed;
    }
    
    if (keys['ArrowUp'] && player.onGround) {
        player.velY = -player.jumpPower;
        player.onGround = false;
    }

    if (!player.onGround) {
        player.velY += 0.8;
        player.y += player.velY;
    }
    
    player.onGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 20 &&
            player.velY >= 0) {
            
            player.y = platform.y - player.height;
            player.velY = 0;
            player.onGround = true;
        }
    });
    

    if (player.y > 600) {
        player.x = 120;
        player.y = 350;
        game.scrollX = 0;
        game.lives--;
        
        if (game.lives <= 0) {
            game.lives = 3;
            game.level = 1;
            game.hearts = 0;
            initLevel();
        }
    }
    
    const targetScrollX = player.x - 300;
    game.scrollX += (targetScrollX - game.scrollX) * 0.08;
    game.scrollX = Math.max(0, Math.min(game.scrollX, game.levelWidth - canvas.width));
}

function showLoseMessage() {
    const loseMessage = document.getElementById("loseMessage");
    loseMessage.style.display = "block";

    setTimeout(() => {
        loseMessage.style.display = "none";
        initLevel();
    }, 4000); 
}

function checkCollisions() {

    waves.forEach(wave => {
        if (player.x < wave.x + wave.width &&
            player.x + player.width > wave.x &&
            player.y < wave.y + wave.height &&
            player.y + player.height > wave.y) {
            
            game.lives--;
            player.x = 120;
            player.y = 350;
            game.scrollX = 0;
            
            if (game.lives <= 0) {
                game.lives = 3;
                game.level = 1;
                game.hearts = 0;
                showLoseMessage();
            }
        }
    });


    hearts.forEach(heart => {
        if (!heart.collected &&
            player.x < heart.x + heart.width &&
            player.x + player.width > heart.x &&
            player.y < heart.y + heart.height &&
            player.y + player.height > heart.y) {
            
            heart.collected = true;
            game.hearts++;
        }
    });
    

    if (player.x >= game.levelWidth - 200) {
        if (game.hearts >= 3) {
            if (game.level === 1) {
                game.level = 2;
                game.hearts = 0;
                player.x = 120;
                player.y = 350;
                game.scrollX = 0;
                initLevel();
            } else {
                if (game.showingFinalScene && Date.now() - game.finalSceneStartTime > 3000) {
                    game.won = true;
                    const winMessage = document.getElementById('winMessage');
                    winMessage.style.display = 'block';
                    setTimeout(() => {
                        winMessage.classList.add('show');
                    }, 100);
                }
            }
        }
    }
}

function updateUI() {
    document.getElementById('level').textContent = game.level;
    document.getElementById('hearts').textContent = game.hearts;
    document.getElementById('lives').textContent = game.lives;
}

function gameLoop() {
    if (game.won) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.width) {
            cloud.x = game.levelWidth + Math.random() * 300;
        }
        drawCloud(cloud);
    });

    waves.forEach(wave => {
        drawWave(wave);
    });

    
    hearts.forEach(drawHeart);
    drawFinalScene();

    updatePlayer();
    drawPlayer();

    checkCollisions();

    updateUI();
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    e.preventDefault();
});

document.addEventListener('DOMContentLoaded', () => {
    initLevel();
    gameLoop();
});