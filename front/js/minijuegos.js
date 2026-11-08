/**
 * ==============================================================================
 * MÓDULO : MOTOR DE LOS 5 MINIJUEGOS CON EL SPRITE DE JC (minijuegos.js)
 * ==============================================================================
 *
 * 1. Sokoban de Almacén
 * 2. Laberinto Contrarreloj (con Niebla / Visión que se oscurece)
 * 3. Cruce Peligroso (Estilo Frogger)
 * 4. Recolector de Cosechas (Estilo Pac-Man con patrullas)
 * 5. Rompecabezas de Hielo (Deslizamiento continuo hasta chocar)
 */

(function () {
    'use strict';

    // Canvas y Contexto 2D
    const canvas = document.getElementById('minigameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Elementos del DOM
    const titleEl = document.getElementById('minigameTitle');
    const descEl = document.getElementById('minigameDesc');
    const hudVal1 = document.getElementById('hudVal1');
    const hudVal2 = document.getElementById('hudVal2');
    const hudVal3 = document.getElementById('hudVal3');
    const hudLbl1 = document.getElementById('hudLbl1');
    const hudLbl2 = document.getElementById('hudLbl2');
    const hudLbl3 = document.getElementById('hudLbl3');
    const overlay = document.getElementById('minigameOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMsg = document.getElementById('overlayMsg');
    const overlayBtnNext = document.getElementById('overlayBtnNext');
    const overlayBtnRetry = document.getElementById('overlayBtnRetry');
    const btnReset = document.getElementById('btnResetGame');
    const btnUndo = document.getElementById('btnUndoMove');
    const btnAudio = document.getElementById('btnToggleAudio');
    const btnFullscreen = document.getElementById('btnToggleFullscreen');
    const viewportFrame = document.querySelector('.minigame-viewport-frame');

    // Pre-carga de sprites de JC (las 4 direcciones)
    // Se añade parámetro ?v=5 para forzar la recarga limpia de sprites transparentes
    const spriteTimestamp = 'v=5';
    function createSafeSprite(relativePath) {
        const img = new Image();
        img.onerror = () => {
            if (!img.dataset.retried) {
                img.dataset.retried = '1';
                img.src = relativePath.startsWith('../') ? relativePath.replace('../', '') : '../' + relativePath;
            }
        };
        img.onload = () => {
            const driver = (typeof gameDrivers !== 'undefined' && gameDrivers) ? gameDrivers[currentGame] : null;
            if (driver && driver.render) driver.render();
        };
        img.src = relativePath + '?' + spriteTimestamp;
        return img;
    }

    const sprites = {
        down: createSafeSprite('../img/jc/jc-frente.png'),
        up: createSafeSprite('../img/jc/jc-atras.png'),
        left: createSafeSprite('../img/jc/jc-izq.png'),
        right: createSafeSprite('../img/jc/jc-der.png')
    };

    // Audio SFX
    let audioEnabled = true;
    const sfx = {
        click: new Audio('../music/sfx-click.mp3'),
        win: new Audio('../music/sfx-correcto.mp3'),
        lose: new Audio('../music/sfx-error.mp3'),
        unlock: new Audio('../music/sfx-desbloqueo.mp3'),
        monster: new Audio('../music/sfx-monstruo.mp3')
    };

    function playSound(soundName) {
        if (!audioEnabled || !sfx[soundName]) return;
        try {
            sfx[soundName].currentTime = 0;
            sfx[soundName].volume = 0.45;
            sfx[soundName].play().catch(() => {});
        } catch (e) {}
    }

    if (btnAudio) {
        btnAudio.addEventListener('click', () => {
            audioEnabled = !audioEnabled;
            btnAudio.textContent = audioEnabled ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
        });
    }

    // Estado global de juego
    let currentGame = 'sokoban';
    let animFrameId = null;

    // =========================================================================
    // JUEGO 1: SOKOBAN DE ALMACÉN (5 NIVELES)
    // =========================================================================
    const Sokoban = {
        levels: [
            // Nivel 1: Introducción a las Cajas (1 caja)
            {
                name: 'Introducción Rústica',
                map: [
                    "######",
                    "#@...#",
                    "#.$..#",
                    "#..*.#",
                    "######"
                ]
            },
            // Nivel 2: Almacén Rústico (2 cajas)
            {
                name: 'Almacén de Cosechas',
                map: [
                    "#######",
                    "#@....#",
                    "#.$$..#",
                    "#.**..#",
                    "#.....#",
                    "#######"
                ]
            },
            // Nivel 3: La Cámara de los Pasillos (2 cajas)
            {
                name: 'Cámara de los Pasillos',
                map: [
                    "########",
                    "#@..#..#",
                    "#.$....#",
                    "#..##..#",
                    "#..*#$.#",
                    "#...*..#",
                    "########"
                ]
            },
            // Nivel 4: El Despacho Central (3 cajas)
            {
                name: 'El Despacho Central',
                map: [
                    "########",
                    "#..#...#",
                    "#.$..$.#",
                    "#.**.*.#",
                    "#..$.#.#",
                    "#..@...#",
                    "########"
                ]
            },
            // Nivel 5: La Gran Bóveda de Jack (3 cajas)
            {
                name: 'La Bóveda de Jack',
                map: [
                    "#########",
                    "#...#...#",
                    "#.$.#.$.#",
                    "#.*.*.*.#",
                    "#...$...#",
                    "#...@...#",
                    "#########"
                ]
            }
        ],
        currentLevel: 0,
        grid: [],
        player: { x: 0, y: 0, dir: 'down' },
        moves: 0,
        history: [],
        tileSize: 56,
        offsetX: 0,
        offsetY: 0,

        init() {
            this.loadLevel(this.currentLevel);
        },

        loadLevel(lvlIndex) {
            this.currentLevel = lvlIndex % this.levels.length;
            const lvl = this.levels[this.currentLevel];
            this.grid = [];
            this.history = [];
            this.moves = 0;
            this.player.dir = 'down';

            const raw = lvl.map;
            const rows = raw.length;
            const cols = Math.max(...raw.map(r => r.length));

            this.tileSize = Math.min(Math.floor(canvas.width / cols), Math.floor((canvas.height - 20) / rows), 60);
            this.offsetX = Math.floor((canvas.width - cols * this.tileSize) / 2);
            this.offsetY = Math.floor((canvas.height - rows * this.tileSize) / 2);

            for (let r = 0; r < rows; r++) {
                const rowArr = [];
                for (let c = 0; c < cols; c++) {
                    const char = raw[r][c] || ' ';
                    if (char === '@') {
                        this.player.x = c;
                        this.player.y = r;
                        rowArr.push('.'); // suelo
                    } else if (char === '+') { // Jugador sobre meta
                        this.player.x = c;
                        this.player.y = r;
                        rowArr.push('*');
                    } else {
                        rowArr.push(char);
                    }
                }
                this.grid.push(rowArr);
            }

            this.updateHUD();
            this.render();
        },

        updateHUD() {
            hudLbl1.textContent = 'Nivel';
            hudVal1.textContent = `${this.currentLevel + 1} / ${this.levels.length}`;
            hudLbl2.textContent = 'Movimientos';
            hudVal2.textContent = this.moves;
            hudLbl3.textContent = 'Cajas Listas';
            const targetsTotal = this.countTargets();
            const targetsFilled = this.countFilledTargets();
            hudVal3.textContent = `${targetsFilled} / ${targetsTotal}`;
        },

        countTargets() {
            let count = 0;
            for (let r = 0; r < this.grid.length; r++) {
                for (let c = 0; c < this.grid[r].length; c++) {
                    const ch = this.grid[r][c];
                    if (ch === '*' || ch === '&') count++;
                }
            }
            return count;
        },

        countFilledTargets() {
            let count = 0;
            for (let r = 0; r < this.grid.length; r++) {
                for (let c = 0; c < this.grid[r].length; c++) {
                    if (this.grid[r][c] === '&') count++;
                }
            }
            return count;
        },

        move(dx, dy, dirName) {
            this.player.dir = dirName;
            const nx = this.player.x + dx;
            const ny = this.player.y + dy;

            if (ny < 0 || ny >= this.grid.length || nx < 0 || nx >= this.grid[ny].length) return;
            const dest = this.grid[ny][nx];

            // Chocar con pared o vacío
            if (dest === '#' || dest === ' ') {
                this.render();
                return;
            }

            // Suelo libre o meta vacía
            if (dest === '.' || dest === ' ' || dest === '*') {
                this.saveState();
                this.player.x = nx;
                this.player.y = ny;
                this.moves++;
                playSound('click');
                this.updateHUD();
                this.render();
                return;
            }

            // Hay una caja ($) o caja sobre meta (&)
            if (dest === '$' || dest === '&') {
                const nnx = nx + dx;
                const nny = ny + dy;
                if (nny < 0 || nny >= this.grid.length || nnx < 0 || nnx >= this.grid[nny].length) return;
                const beyond = this.grid[nny][nnx];

                // La celda detrás de la caja debe estar libre
                if (beyond === '.' || beyond === ' ' || beyond === '*') {
                    this.saveState();
                    // Mover caja
                    this.grid[ny][nx] = (dest === '&') ? '*' : '.';
                    this.grid[nny][nnx] = (beyond === '*') ? '&' : '$';

                    this.player.x = nx;
                    this.player.y = ny;
                    this.moves++;

                    if (beyond === '*') {
                        playSound('unlock');
                    } else {
                        playSound('click');
                    }

                    this.updateHUD();
                    this.render();
                    this.checkVictory();
                }
            }
        },

        saveState() {
            const gridCopy = this.grid.map(row => [...row]);
            this.history.push({
                grid: gridCopy,
                x: this.player.x,
                y: this.player.y,
                dir: this.player.dir,
                moves: this.moves
            });
            if (this.history.length > 50) this.history.shift();
        },

        undo() {
            if (!this.history.length) return;
            const last = this.history.pop();
            this.grid = last.grid;
            this.player.x = last.x;
            this.player.y = last.y;
            this.player.dir = last.dir;
            this.moves = last.moves;
            playSound('click');
            this.updateHUD();
            this.render();
        },

        checkVictory() {
            // Ganó si no queda ningún '$' normal y hay al menos una caja en meta
            let hasUnplacedBox = false;
            let placedBoxes = 0;
            for (let r = 0; r < this.grid.length; r++) {
                for (let c = 0; c < this.grid[r].length; c++) {
                    if (this.grid[r][c] === '$') hasUnplacedBox = true;
                    if (this.grid[r][c] === '&') placedBoxes++;
                }
            }

            if (!hasUnplacedBox && placedBoxes > 0) {
                playSound('win');
                setTimeout(() => {
                    showOverlay(
                        true,
                        '¡ALMACÉN ORDENADO!',
                        `¡Increíble trabajo! Has superado el Nivel ${this.currentLevel + 1} (${this.levels[this.currentLevel].name}) en ${this.moves} movimientos con el sprite de JC.`,
                        () => {
                            if (this.currentLevel + 1 < this.levels.length) {
                                this.loadLevel(this.currentLevel + 1);
                            } else {
                                this.loadLevel(0);
                            }
                        },
                        () => this.loadLevel(this.currentLevel)
                    );
                }, 150);
            }
        },

        render() {
            ctx.fillStyle = '#1c102a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const ts = this.tileSize;

            for (let r = 0; r < this.grid.length; r++) {
                for (let c = 0; c < this.grid[r].length; c++) {
                    const ch = this.grid[r][c];
                    const px = this.offsetX + c * ts;
                    const py = this.offsetY + r * ts;

                    if (ch === ' ') continue;

                    // Suelo rústico
                    ctx.fillStyle = (r + c) % 2 === 0 ? '#462b16' : '#3d2411';
                    ctx.fillRect(px, py, ts, ts);
                    ctx.strokeStyle = '#2b1709';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, ts, ts);

                    if (ch === '#') {
                        // Pared de piedra tallada
                        ctx.fillStyle = '#6d4527';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.fillStyle = '#845431';
                        ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
                        ctx.strokeStyle = '#381c09';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
                    } else if (ch === '*' || ch === '&') {
                        // Meta (Marca de calabaza brillante)
                        ctx.beginPath();
                        ctx.arc(px + ts / 2, py + ts / 2, ts * 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, 142, 36, 0.4)';
                        ctx.fill();
                        ctx.strokeStyle = '#ff8e24';
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // Icono calabacita
                        ctx.font = `${Math.floor(ts * 0.38)}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🎃', px + ts / 2, py + ts / 2);
                    }

                    if (ch === '$' || ch === '&') {
                        // Caja de madera
                        const pad = 4;
                        ctx.fillStyle = (ch === '&') ? '#2e6b27' : '#824619';
                        ctx.fillRect(px + pad, py + pad, ts - pad * 2, ts - pad * 2);

                        // Bordes metálicos
                        ctx.strokeStyle = (ch === '&') ? '#73d45f' : '#d4944d';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px + pad, py + pad, ts - pad * 2, ts - pad * 2);

                        // Cruz de refuerzo
                        ctx.beginPath();
                        ctx.moveTo(px + pad, py + pad);
                        ctx.lineTo(px + ts - pad, py + ts - pad);
                        ctx.moveTo(px + ts - pad, py + pad);
                        ctx.lineTo(px + pad, py + ts - pad);
                        ctx.stroke();

                        if (ch === '&') {
                            ctx.fillStyle = '#ffec99';
                            ctx.font = `${Math.floor(ts * 0.3)}px monospace`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('✓', px + ts / 2, py + ts / 2);
                        }
                    }
                }
            }

            // Dibujar a JC en su posición
            const spriteImg = sprites[this.player.dir] || sprites.down;
            const jcPx = this.offsetX + this.player.x * ts;
            const jcPy = this.offsetY + this.player.y * ts;

            // Sombra en el suelo
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(jcPx + ts / 2, jcPy + ts - 5, ts * 0.35, ts * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dibujar Sprite de JC manteniendo relación de aspecto
            if (spriteImg.complete && spriteImg.naturalWidth > 0) {
                const drawH = ts * 1.15;
                const drawW = drawH * (spriteImg.naturalWidth / spriteImg.naturalHeight);
                ctx.drawImage(
                    spriteImg,
                    jcPx + (ts - drawW) / 2,
                    jcPy + ts - drawH - 2,
                    drawW,
                    drawH
                );
            }
        }
    };

    // =========================================================================
    // JUEGO 2: LABERINTO CONTRARRELOJ (5 NIVELES CON NIEBLA Y LINTERNA)
    // =========================================================================
    const Laberinto = {
        levels: [
            {
                name: 'Catacumbas del Bosque',
                time: 50,
                start: { x: 1, y: 1 },
                key: { x: 13, y: 11 },
                exit: { x: 13, y: 1 },
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1],
                    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ]
            },
            {
                name: 'Galería de las Brujas',
                time: 45,
                start: { x: 1, y: 1 },
                key: { x: 1, y: 11 },
                exit: { x: 13, y: 1 },
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ]
            },
            {
                name: 'Cripta de los Murciélagos',
                time: 40,
                start: { x: 1, y: 1 },
                key: { x: 13, y: 11 },
                exit: { x: 13, y: 1 },
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
                    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ]
            },
            {
                name: 'Laberinto de Niebla',
                time: 35,
                start: { x: 1, y: 1 },
                key: { x: 7, y: 7 },
                exit: { x: 13, y: 1 },
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ]
            },
            {
                name: 'La Guarida de Jack',
                time: 30,
                start: { x: 1, y: 1 },
                key: { x: 7, y: 5 },
                exit: { x: 13, y: 1 },
                grid: [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
                    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
                    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ]
            }
        ],
        currentLevel: 0,
        grid: [],
        player: { x: 1, y: 1, dir: 'down' },
        keyPos: { x: 13, y: 11 },
        exitPos: { x: 13, y: 1 },
        hasKey: false,
        timeLeft: 45,
        timerInterval: null,
        tileSize: 38,
        offsetX: 0,
        offsetY: 0,

        init() {
            this.loadLevel(this.currentLevel);
        },

        loadLevel(lvlIndex) {
            this.currentLevel = lvlIndex % this.levels.length;
            const lvl = this.levels[this.currentLevel];
            this.grid = lvl.grid;
            this.player = { x: lvl.start.x, y: lvl.start.y, dir: 'down' };
            this.keyPos = { x: lvl.key.x, y: lvl.key.y };
            this.exitPos = { x: lvl.exit.x, y: lvl.exit.y };
            this.hasKey = false;
            this.timeLeft = lvl.time;

            const rows = this.grid.length;
            const cols = this.grid[0].length;
            this.tileSize = Math.floor(Math.min(canvas.width / cols, (canvas.height - 20) / rows));
            this.offsetX = Math.floor((canvas.width - cols * this.tileSize) / 2);
            this.offsetY = Math.floor((canvas.height - rows * this.tileSize) / 2);

            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this.updateHUD();
                this.render();

                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    playSound('lose');
                    showOverlay(
                        false,
                        '¡SE APAGÓ LA LUZ!',
                        `La oscuridad consumió el laberinto (${lvl.name}) antes de escapar. ¡Inténtalo de nuevo!`,
                        () => this.loadLevel(this.currentLevel),
                        () => this.loadLevel(this.currentLevel)
                    );
                }
            }, 1000);

            this.updateHUD();
            this.render();
        },

        cleanup() {
            if (this.timerInterval) clearInterval(this.timerInterval);
        },

        updateHUD() {
            hudLbl1.textContent = 'Nivel Laberinto';
            hudVal1.textContent = `${this.currentLevel + 1} / ${this.levels.length} (${this.timeLeft}s)`;
            hudLbl2.textContent = 'Llave Dorada';
            hudVal2.textContent = this.hasKey ? '🗝️ Conseguida' : '❌ Falta encontrar';
            hudLbl3.textContent = 'Puerta Salida';
            hudVal3.textContent = this.hasKey ? '🔓 ¡Abierta!' : '🔒 Bloqueada';
        },

        move(dx, dy, dirName) {
            if (this.timeLeft <= 0) return;
            this.player.dir = dirName;
            const nx = this.player.x + dx;
            const ny = this.player.y + dy;

            if (ny < 0 || ny >= this.grid.length || nx < 0 || nx >= this.grid[0].length) return;
            if (this.grid[ny][nx] === 1) return; // Muro

            this.player.x = nx;
            this.player.y = ny;
            playSound('click');

            // Conseguir llave
            if (!this.hasKey && nx === this.keyPos.x && ny === this.keyPos.y) {
                this.hasKey = true;
                playSound('unlock');
            }

            // Llegar a la salida
            if (nx === this.exitPos.x && ny === this.exitPos.y) {
                if (this.hasKey) {
                    clearInterval(this.timerInterval);
                    playSound('win');
                    showOverlay(
                        true,
                        '¡ESCAPASTE DEL LABERINTO!',
                        `¡Increíble rapidez! Has superado el Nivel ${this.currentLevel + 1} (${this.levels[this.currentLevel].name}) con ${this.timeLeft} segundos de sobra.`,
                        () => {
                            if (this.currentLevel + 1 < this.levels.length) {
                                this.loadLevel(this.currentLevel + 1);
                            } else {
                                this.loadLevel(0);
                            }
                        },
                        () => this.loadLevel(this.currentLevel)
                    );
                } else {
                    playSound('lose');
                }
            }

            this.updateHUD();
            this.render();
        },

        render() {
            ctx.fillStyle = '#0a0612';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const ts = this.tileSize;

            // Dibujar laberinto base
            for (let r = 0; r < this.grid.length; r++) {
                for (let c = 0; c < this.grid[r].length; c++) {
                    const px = this.offsetX + c * ts;
                    const py = this.offsetY + r * ts;

                    if (this.grid[r][c] === 1) {
                        ctx.fillStyle = '#3a2010';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.fillStyle = '#5c3319';
                        ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
                        ctx.strokeStyle = '#221107';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px, py, ts, ts);
                    } else {
                        ctx.fillStyle = '#1c1328';
                        ctx.fillRect(px, py, ts, ts);
                    }
                }
            }

            // Llave dorada
            if (!this.hasKey) {
                const kx = this.offsetX + this.keyPos.x * ts + ts / 2;
                const ky = this.offsetY + this.keyPos.y * ts + ts / 2;
                ctx.font = `${Math.floor(ts * 0.7)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🗝️', kx, ky);
            }

            // Puerta de salida
            const ex = this.offsetX + this.exitPos.x * ts + ts / 2;
            const ey = this.offsetY + this.exitPos.y * ts + ts / 2;
            ctx.font = `${Math.floor(ts * 0.7)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.hasKey ? '🚪' : '🔒', ex, ey);

            // Dibujar a JC
            const spriteImg = sprites[this.player.dir] || sprites.down;
            const jcPx = this.offsetX + this.player.x * ts;
            const jcPy = this.offsetY + this.player.y * ts;

            if (spriteImg.complete && spriteImg.naturalWidth > 0) {
                const drawH = ts * 1.25;
                const drawW = drawH * (spriteImg.naturalWidth / spriteImg.naturalHeight);
                ctx.drawImage(
                    spriteImg,
                    jcPx + (ts - drawW) / 2,
                    jcPy + ts - drawH - 2,
                    drawW,
                    drawH
                );
            }

            // NIEBLA DE GUERRA / LINTERNA DINÁMICA
            // El radio de visión se reduce progresivamente de 190 a 70 a medida que baja el temporizador
            const progress = Math.max(0, this.timeLeft / 45);
            const lanternRadius = 75 + progress * 115;
            const lightX = jcPx + ts / 2;
            const lightY = jcPy + ts / 2;

            const fog = ctx.createRadialGradient(lightX, lightY, lanternRadius * 0.35, lightX, lightY, lanternRadius);
            fog.addColorStop(0, 'rgba(0, 0, 0, 0)');
            fog.addColorStop(0.7, 'rgba(10, 6, 18, 0.6)');
            fog.addColorStop(1, 'rgba(10, 6, 18, 0.98)');

            ctx.fillStyle = fog;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    // =========================================================================
    // JUEGO 3: CRUCE PELIGROSO (5 NIVELES CON RÍO Y CARRETERA)
    // =========================================================================
    const Frogger = {
        gridCols: 13,
        gridRows: 11,
        tileSize: 42,
        levels: [
            {
                name: 'Orilla Tranquila',
                targetGoals: 1,
                carSpeed: 1.0,
                logSpeed: 1.0,
                logWidth: 4.0
            },
            {
                name: 'Tráfico de Brujas',
                targetGoals: 2,
                carSpeed: 1.3,
                logSpeed: 1.2,
                logWidth: 3.5
            },
            {
                name: 'Río Turbulento',
                targetGoals: 2,
                carSpeed: 1.6,
                logSpeed: 1.5,
                logWidth: 3.0
            },
            {
                name: 'Autopista de Pesadillas',
                targetGoals: 3,
                carSpeed: 2.0,
                logSpeed: 1.8,
                logWidth: 2.6
            },
            {
                name: 'El Torbellino de Jack',
                targetGoals: 3,
                carSpeed: 2.4,
                logSpeed: 2.2,
                logWidth: 2.2
            }
        ],
        currentLevel: 0,
        player: { x: 6, y: 10, dir: 'up' },
        lives: 3,
        score: 0,
        logs: [],
        cars: [],
        goalsReached: [false, false, false, false, false],
        offsetX: 0,
        offsetY: 0,

        init() {
            this.loadLevel(this.currentLevel);
        },

        loadLevel(lvlIndex) {
            this.currentLevel = lvlIndex % this.levels.length;
            const lvl = this.levels[this.currentLevel];
            this.player = { x: 6, y: 10, dir: 'up' };
            this.lives = 3;
            this.goalsReached = [false, false, false, false, false];

            this.tileSize = Math.floor(Math.min(canvas.width / this.gridCols, (canvas.height - 20) / this.gridRows));
            this.offsetX = Math.floor((canvas.width - this.gridCols * this.tileSize) / 2);
            this.offsetY = Math.floor((canvas.height - this.gridRows * this.tileSize) / 2);

            const lw = lvl.logWidth * this.tileSize;
            const ls = lvl.logSpeed;
            const cs = lvl.carSpeed;

            // Inicializar troncos en el río (filas 1, 2, 3)
            this.logs = [
                { y: 1, x: 0, w: lw, speed: 1.6 * ls },
                { y: 1, x: 7 * this.tileSize, w: lw, speed: 1.6 * ls },
                { y: 2, x: 2 * this.tileSize, w: lw + 0.5 * this.tileSize, speed: -2.0 * ls },
                { y: 2, x: 8 * this.tileSize, w: lw, speed: -2.0 * ls },
                { y: 3, x: 1 * this.tileSize, w: lw, speed: 1.8 * ls },
                { y: 3, x: 7 * this.tileSize, w: lw + 0.5 * this.tileSize, speed: 1.8 * ls }
            ];

            // Obstáculos móviles en la carretera (filas 5, 6, 7)
            this.cars = [
                { y: 5, x: 0, w: 1.5 * this.tileSize, speed: -2.2 * cs, icon: '🎃' },
                { y: 5, x: 6 * this.tileSize, w: 1.5 * this.tileSize, speed: -2.2 * cs, icon: '🎃' },
                { y: 6, x: 2 * this.tileSize, w: 1.5 * this.tileSize, speed: 2.0 * cs, icon: '👻' },
                { y: 6, x: 8 * this.tileSize, w: 1.5 * this.tileSize, speed: 2.0 * cs, icon: '👻' },
                { y: 7, x: 1 * this.tileSize, w: 1.8 * this.tileSize, speed: -1.7 * cs, icon: '🛒' },
                { y: 7, x: 7 * this.tileSize, w: 1.8 * this.tileSize, speed: -1.7 * cs, icon: '🛒' }
            ];

            this.updateHUD();
            this.startLoop();
        },

        cleanup() {
            if (animFrameId) cancelAnimationFrame(animFrameId);
        },

        updateHUD() {
            const lvl = this.levels[this.currentLevel];
            hudLbl1.textContent = 'Nivel Cruce';
            hudVal1.textContent = `${this.currentLevel + 1} / ${this.levels.length} (❤️ ${this.lives})`;
            hudLbl2.textContent = 'Puntuación';
            hudVal2.textContent = `${this.score} pts`;
            hudLbl3.textContent = 'Metas Nivel';
            const done = this.goalsReached.filter(Boolean).length;
            hudVal3.textContent = `${done} / ${lvl.targetGoals} 🎃`;
        },

        move(dx, dy, dirName) {
            this.player.dir = dirName;
            const nx = this.player.x + dx;
            const ny = this.player.y + dy;

            if (nx < 0 || nx >= this.gridCols || ny < 0 || ny >= this.gridRows) return;
            this.player.x = nx;
            this.player.y = ny;
            playSound('click');

            // Llegada a la meta superior (fila 0)
            if (ny === 0) {
                const goalSlot = Math.floor(nx / 2.6);
                const lvl = this.levels[this.currentLevel];
                if (goalSlot >= 0 && goalSlot < 5 && !this.goalsReached[goalSlot]) {
                    this.goalsReached[goalSlot] = true;
                    this.score += 200;
                    playSound('win');
                    this.resetPlayerPos();

                    const done = this.goalsReached.filter(Boolean).length;
                    if (done >= lvl.targetGoals) {
                        this.cleanup();
                        showOverlay(
                            true,
                            '¡CRUCE PELIGROSO SUPERADO!',
                            `¡Completaste el Nivel ${this.currentLevel + 1} (${lvl.name})! Puntuación total: ${this.score} pts.`,
                            () => {
                                if (this.currentLevel + 1 < this.levels.length) {
                                    this.loadLevel(this.currentLevel + 1);
                                } else {
                                    this.loadLevel(0);
                                }
                            },
                            () => this.loadLevel(this.currentLevel)
                        );
                    }
                } else {
                    this.score += 50;
                    this.resetPlayerPos();
                }
            }

            this.updateHUD();
        },

        resetPlayerPos() {
            this.player.x = 6;
            this.player.y = 10;
            this.player.dir = 'up';
        },

        handleDeath() {
            this.lives--;
            playSound('lose');
            this.updateHUD();

            if (this.lives <= 0) {
                this.cleanup();
                showOverlay(
                    false,
                    '¡HAS CAÍDO EN EL CAMINO!',
                    `Perdiste todas tus vidas en el Nivel ${this.currentLevel + 1}. ¡Inténtalo de nuevo!`,
                    () => this.loadLevel(this.currentLevel),
                    () => this.loadLevel(this.currentLevel)
                );
            } else {
                this.resetPlayerPos();
            }
        },

        startLoop() {
            const loop = () => {
                this.update();
                this.render();
                animFrameId = requestAnimationFrame(loop);
            };
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(loop);
        },

        update() {
            const ts = this.tileSize;
            const maxW = this.gridCols * ts;

            // Mover troncos
            this.logs.forEach(log => {
                log.x += log.speed;
                if (log.speed > 0 && log.x > maxW) log.x = -log.w;
                if (log.speed < 0 && log.x + log.w < 0) log.x = maxW;
            });

            // Mover carros / obstáculos
            this.cars.forEach(car => {
                car.x += car.speed;
                if (car.speed > 0 && car.x > maxW) car.x = -car.w;
                if (car.speed < 0 && car.x + car.w < 0) car.x = maxW;
            });

            const py = this.player.y;
            const px = this.player.x * ts;

            // Chequeo de colisión en carretera (filas 5, 6, 7)
            if (py >= 5 && py <= 7) {
                this.cars.filter(c => c.y === py).forEach(car => {
                    if (px + ts * 0.2 < car.x + car.w && px + ts * 0.8 > car.x) {
                        this.handleDeath();
                    }
                });
            }

            // Chequeo en río (filas 1, 2, 3)
            if (py >= 1 && py <= 3) {
                let onLog = false;
                const logsInRow = this.logs.filter(l => l.y === py);

                for (let l of logsInRow) {
                    if (px + ts * 0.3 >= l.x && px + ts * 0.7 <= l.x + l.w) {
                        onLog = true;
                        // Mover al jugador junto con el tronco
                        this.player.x += (l.speed / ts);
                        break;
                    }
                }

                if (!onLog || this.player.x < 0 || this.player.x >= this.gridCols) {
                    this.handleDeath();
                }
            }
        },

        render() {
            ctx.fillStyle = '#0f081c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const ts = this.tileSize;

            for (let r = 0; r < this.gridRows; r++) {
                const py = this.offsetY + r * ts;

                if (r === 0) {
                    // Meta superior
                    ctx.fillStyle = '#1c3c24';
                    ctx.fillRect(this.offsetX, py, this.gridCols * ts, ts);
                    for (let s = 0; s < 5; s++) {
                        const gx = this.offsetX + s * (2.6 * ts) + 0.6 * ts;
                        ctx.fillStyle = this.goalsReached[s] ? '#ffd700' : '#0e1e12';
                        ctx.fillRect(gx, py + 4, ts * 1.2, ts - 8);
                        ctx.font = `${Math.floor(ts * 0.55)}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(this.goalsReached[s] ? '🎃' : '⭐', gx + ts * 0.6, py + ts / 2);
                    }
                } else if (r >= 1 && r <= 3) {
                    // Río
                    ctx.fillStyle = '#0f2742';
                    ctx.fillRect(this.offsetX, py, this.gridCols * ts, ts);

                    // Olas pixel
                    ctx.fillStyle = '#1b3e66';
                    for (let c = 0; c < this.gridCols; c++) {
                        if ((c + r) % 2 === 0) {
                            ctx.fillRect(this.offsetX + c * ts + 4, py + 8, ts - 8, 3);
                        }
                    }
                } else if (r === 4 || r >= 8) {
                    // Zona de hierba segura
                    ctx.fillStyle = '#2d5a27';
                    ctx.fillRect(this.offsetX, py, this.gridCols * ts, ts);
                    ctx.fillStyle = '#397032';
                    ctx.fillRect(this.offsetX, py + 2, this.gridCols * ts, ts - 4);
                } else {
                    // Carretera asfaltada
                    ctx.fillStyle = '#26212b';
                    ctx.fillRect(this.offsetX, py, this.gridCols * ts, ts);
                    ctx.strokeStyle = '#473d52';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.offsetX, py, this.gridCols * ts, ts);
                }
            }

            // Dibujar Troncos
            this.logs.forEach(log => {
                const lx = this.offsetX + log.x;
                const ly = this.offsetY + log.y * ts;
                ctx.fillStyle = '#6b3c16';
                ctx.fillRect(lx, ly + 5, log.w, ts - 10);
                ctx.fillStyle = '#8f5221';
                ctx.fillRect(lx + 4, ly + 8, log.w - 8, ts - 16);
                ctx.strokeStyle = '#381c07';
                ctx.lineWidth = 2;
                ctx.strokeRect(lx, ly + 5, log.w, ts - 10);
            });

            // Dibujar Carros / Monstruos
            this.cars.forEach(car => {
                const cx = this.offsetX + car.x;
                const cy = this.offsetY + car.y * ts;
                ctx.font = `${Math.floor(ts * 0.7)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(car.icon, cx + car.w / 2, cy + ts / 2);
            });

            // Dibujar a JC (usando principalmente animaciones arriba/abajo)
            const spriteImg = sprites[this.player.dir] || sprites.up;
            const jcPx = this.offsetX + this.player.x * ts;
            const jcPy = this.offsetY + this.player.y * ts;

            if (spriteImg.complete && spriteImg.naturalWidth > 0) {
                const drawH = ts * 1.25;
                const drawW = drawH * (spriteImg.naturalWidth / spriteImg.naturalHeight);
                ctx.drawImage(
                    spriteImg,
                    jcPx + (ts - drawW) / 2,
                    jcPy + ts - drawH - 2,
                    drawW,
                    drawH
                );
            }
        }
    };

    // =========================================================================
    // JUEGO 4: RECOLECTOR DE COSECHAS (5 NIVELES CON PATRULLAS)
    // =========================================================================
    const Pacman = {
        levels: [
            {
                name: 'El Pequeño Huerto',
                map: [
                    "###############",
                    "#.............#",
                    "#.###.###.###.#",
                    "#.............#",
                    "#.###.#.#.###.#",
                    "#.....#.#.....#",
                    "#####.#.#.#####",
                    "#.....#.#.....#",
                    "#.###.#.#.###.#",
                    "#.............#",
                    "#.###.###.###.#",
                    "#.............#",
                    "###############"
                ],
                playerStart: { x: 7, y: 9 },
                speed: 380,
                enemies: [
                    { x: 1, y: 1, dx: 1, dy: 0, minX: 1, maxX: 13, icon: '👻', color: '#ff4d4d' }
                ]
            },
            {
                name: 'Jardines de Calabaza',
                map: [
                    "###############",
                    "#...#.....#...#",
                    "#.###.###.###.#",
                    "#.............#",
                    "#.###.#.#.###.#",
                    "#.....#.#.....#",
                    "#####.#.#.#####",
                    "#.....#.#.....#",
                    "#.###.#.#.###.#",
                    "#...#.....#...#",
                    "###.#.###.#.###",
                    "#.............#",
                    "###############"
                ],
                playerStart: { x: 7, y: 9 },
                speed: 350,
                enemies: [
                    { x: 1, y: 1, dx: 1, dy: 0, minX: 1, maxX: 13, icon: '👻', color: '#ff4d4d' },
                    { x: 13, y: 11, dx: -1, dy: 0, minX: 1, maxX: 13, icon: '👾', color: '#4da6ff' }
                ]
            },
            {
                name: 'La Cripta Central',
                map: [
                    "###############",
                    "#.............#",
                    "#.#####.#####.#",
                    "#.#.........#.#",
                    "#.#.###.###.#.#",
                    "#...#.....#...#",
                    "###.#.###.#.###",
                    "#...#.....#...#",
                    "#.#.###.###.#.#",
                    "#.#.........#.#",
                    "#.#####.#####.#",
                    "#.............#",
                    "###############"
                ],
                playerStart: { x: 7, y: 5 },
                speed: 330,
                enemies: [
                    { x: 1, y: 1, dx: 1, dy: 0, minX: 1, maxX: 13, icon: '👻', color: '#ff4d4d' },
                    { x: 13, y: 11, dx: -1, dy: 0, minX: 1, maxX: 13, icon: '👾', color: '#4da6ff' },
                    { x: 5, y: 5, path: [{x:5,y:5},{x:9,y:5},{x:9,y:7},{x:5,y:7}], step: 0, icon: '👹', color: '#b366ff' }
                ]
            },
            {
                name: 'Laberinto Encantado',
                map: [
                    "###############",
                    "#.#.........#.#",
                    "#.#.#######.#.#",
                    "#...#.....#...#",
                    "###.#.###.#.###",
                    "#.....#.#.....#",
                    "#.###.#.#.###.#",
                    "#.....#.#.....#",
                    "###.#.###.#.###",
                    "#...#.....#...#",
                    "#.#.#######.#.#",
                    "#.#.........#.#",
                    "###############"
                ],
                playerStart: { x: 7, y: 7 },
                speed: 300,
                enemies: [
                    { x: 1, y: 3, dx: 1, dy: 0, minX: 1, maxX: 13, icon: '👻', color: '#ff4d4d' },
                    { x: 13, y: 9, dx: -1, dy: 0, minX: 1, maxX: 13, icon: '👾', color: '#4da6ff' },
                    { x: 3, y: 1, path: [{x:3,y:1},{x:11,y:1},{x:11,y:11},{x:3,y:11}], step: 0, icon: '👹', color: '#b366ff' }
                ]
            },
            {
                name: 'El Festín de Halloween',
                map: [
                    "###############",
                    "#.............#",
                    "#.###.###.###.#",
                    "#.#.........#.#",
                    "#.###.#.#.###.#",
                    "#.....#.#.....#",
                    "#####.#.#.#####",
                    "#.....#.#.....#",
                    "#.###.#.#.###.#",
                    "#.#.........#.#",
                    "#.###.###.###.#",
                    "#.............#",
                    "###############"
                ],
                playerStart: { x: 7, y: 5 },
                speed: 270,
                enemies: [
                    { x: 1, y: 1, dx: 1, dy: 0, minX: 1, maxX: 13, icon: '👻', color: '#ff4d4d' },
                    { x: 13, y: 11, dx: -1, dy: 0, minX: 1, maxX: 13, icon: '👾', color: '#4da6ff' },
                    { x: 1, y: 11, dx: 1, dy: 0, minX: 1, maxX: 13, icon: '🎃', color: '#ff9900' },
                    { x: 5, y: 5, path: [{x:5,y:5},{x:9,y:5},{x:9,y:7},{x:5,y:7}], step: 0, icon: '👹', color: '#b366ff' }
                ]
            }
        ],
        currentLevel: 0,
        map: [],
        tileSize: 38,
        player: { x: 7, y: 9, dir: 'up' },
        score: 0,
        lives: 3,
        itemsTotal: 0,
        itemsCollected: 0,
        itemsGrid: [],
        enemies: [],
        enemySpeed: 350,
        offsetX: 0,
        offsetY: 0,

        init() {
            this.loadLevel(this.currentLevel);
        },

        loadLevel(lvlIndex) {
            this.currentLevel = lvlIndex % this.levels.length;
            const lvl = this.levels[this.currentLevel];
            this.map = lvl.map;
            this.enemySpeed = lvl.speed;
            this.lives = 3;
            this.itemsCollected = 0;
            this.itemsTotal = 0;
            this.player = { x: lvl.playerStart.x, y: lvl.playerStart.y, dir: 'up' };

            const rows = this.map.length;
            const cols = this.map[0].length;
            this.tileSize = Math.floor(Math.min(canvas.width / cols, (canvas.height - 20) / rows));
            this.offsetX = Math.floor((canvas.width - cols * this.tileSize) / 2);
            this.offsetY = Math.floor((canvas.height - rows * this.tileSize) / 2);

            this.itemsGrid = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    if (this.map[r][c] === '.') {
                        row.push(true); // Cosecha presente
                        this.itemsTotal++;
                    } else {
                        row.push(false);
                    }
                }
                this.itemsGrid.push(row);
            }

            // Clonar enemigos para este nivel
            this.enemies = JSON.parse(JSON.stringify(lvl.enemies));

            this.updateHUD();
            this.startLoop();
        },

        cleanup() {
            if (animFrameId) cancelAnimationFrame(animFrameId);
        },

        updateHUD() {
            hudLbl1.textContent = 'Nivel Cosechas';
            hudVal1.textContent = `${this.currentLevel + 1} / ${this.levels.length} (❤️ ${this.lives})`;
            hudLbl2.textContent = 'Cosechas';
            hudVal2.textContent = `${this.itemsCollected} / ${this.itemsTotal}`;
            hudLbl3.textContent = 'Puntuación';
            hudVal3.textContent = `${this.score} pts`;
        },

        move(dx, dy, dirName) {
            this.player.dir = dirName;
            const nx = this.player.x + dx;
            const ny = this.player.y + dy;

            if (ny < 0 || ny >= this.map.length || nx < 0 || nx >= this.map[0].length) return;
            if (this.map[ny][nx] === '#') return; // Muro

            this.player.x = nx;
            this.player.y = ny;

            // Recoger cosecha
            if (this.itemsGrid[ny][nx]) {
                this.itemsGrid[ny][nx] = false;
                this.itemsCollected++;
                this.score += 15;
                playSound('click');
                this.updateHUD();

                if (this.itemsCollected >= this.itemsTotal) {
                    this.cleanup();
                    playSound('win');
                    const lvl = this.levels[this.currentLevel];
                    showOverlay(
                        true,
                        '¡HUERTO COSECHADO!',
                        `¡Recogiste todas las cosechas del Nivel ${this.currentLevel + 1} (${lvl.name})! Puntuación: ${this.score} pts.`,
                        () => {
                            if (this.currentLevel + 1 < this.levels.length) {
                                this.loadLevel(this.currentLevel + 1);
                            } else {
                                this.loadLevel(0);
                            }
                        },
                        () => this.loadLevel(this.currentLevel)
                    );
                }
            }
        },

        startLoop() {
            let lastEnemyTick = performance.now();
            const loop = (now) => {
                if (now - lastEnemyTick > this.enemySpeed) { // velocidad de patrulla
                    this.updateEnemies();
                    lastEnemyTick = now;
                }
                this.render();
                animFrameId = requestAnimationFrame(loop);
            };
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(loop);
        },

        updateEnemies() {
            // Enemigo 1 y 2: Patrullas de ida y vuelta
            this.enemies.forEach(en => {
                if (en.minX !== undefined) {
                    const nextX = en.x + en.dx;
                    if (nextX < en.minX || nextX > en.maxX || this.map[en.y][nextX] === '#') {
                        en.dx = -en.dx;
                    } else {
                        en.x += en.dx;
                    }
                } else if (en.path) {
                    en.step = (en.step + 1) % en.path.length;
                    en.x = en.path[en.step].x;
                    en.y = en.path[en.step].y;
                }

                // Colisión con JC
                if (en.x === this.player.x && en.y === this.player.y) {
                    this.lives--;
                    playSound('lose');
                    this.updateHUD();

                    if (this.lives <= 0) {
                        this.cleanup();
                        showOverlay(
                            false,
                            '¡ATRAPADO POR EL MONSTRUO!',
                            `Los vigilantes del huerto te atraparon en el Nivel ${this.currentLevel + 1}. ¡Planea tu ruta y reintenta!`,
                            () => this.loadLevel(this.currentLevel),
                            () => this.loadLevel(this.currentLevel)
                        );
                    } else {
                        const lvl = this.levels[this.currentLevel];
                        this.player.x = lvl.playerStart.x;
                        this.player.y = lvl.playerStart.y;
                    }
                }
            });
        },

        render() {
            ctx.fillStyle = '#110a1c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const ts = this.tileSize;

            for (let r = 0; r < this.map.length; r++) {
                for (let c = 0; c < this.map[r].length; c++) {
                    const px = this.offsetX + c * ts;
                    const py = this.offsetY + r * ts;

                    if (this.map[r][c] === '#') {
                        ctx.fillStyle = '#2b1442';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = '#592987';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);
                    } else {
                        ctx.fillStyle = '#181026';
                        ctx.fillRect(px, py, ts, ts);

                        // Si hay fruta / cosecha
                        if (this.itemsGrid[r][c]) {
                            ctx.beginPath();
                            ctx.arc(px + ts / 2, py + ts / 2, ts * 0.18, 0, Math.PI * 2);
                            ctx.fillStyle = (r + c) % 3 === 0 ? '#ff8e24' : '#ffd700';
                            ctx.fill();
                            ctx.strokeStyle = '#381c09';
                            ctx.stroke();
                        }
                    }
                }
            }

            // Dibujar Enemigos patrulleros
            this.enemies.forEach(en => {
                const ex = this.offsetX + en.x * ts + ts / 2;
                const ey = this.offsetY + en.y * ts + ts / 2;
                ctx.font = `${Math.floor(ts * 0.75)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(en.icon, ex, ey);
            });

            // Dibujar a JC
            const spriteImg = sprites[this.player.dir] || sprites.up;
            const jcPx = this.offsetX + this.player.x * ts;
            const jcPy = this.offsetY + this.player.y * ts;

            if (spriteImg.complete && spriteImg.naturalWidth > 0) {
                const drawH = ts * 1.25;
                const drawW = drawH * (spriteImg.naturalWidth / spriteImg.naturalHeight);
                ctx.drawImage(
                    spriteImg,
                    jcPx + (ts - drawW) / 2,
                    jcPy + ts - drawH - 2,
                    drawW,
                    drawH
                );
            }
        }
    };

    // =========================================================================
    // JUEGO 5: ROMPECABEZAS DE HIELO (5 NIVELES CON INERCIA)
    // =========================================================================
    const Hielo = {
        levels: [
            // Nivel 1: Introducción a la inercia del hielo
            {
                name: 'El Estanque Escarchado',
                map: [
                    "###########",
                    "#@.......R#",
                    "#...R.....#",
                    "#.....R...#",
                    "#..R......#",
                    "#.......G.#",
                    "###########"
                ]
            },
            // Nivel 2: Esquinas y rocas intermedias
            {
                name: 'Paso Helado de Bea',
                map: [
                    "###########",
                    "#@..R.....#",
                    "#.....R...#",
                    "#..R....R.#",
                    "#.R.......#",
                    "#.....G.R.#",
                    "###########"
                ]
            },
            // Nivel 3: El Gran Glaciar
            {
                name: 'El Gran Glaciar',
                map: [
                    "###########",
                    "#@....R...#",
                    "#.R.R.....#",
                    "#.....R.R.#",
                    "#..R......#",
                    "#R...R..G.#",
                    "###########"
                ]
            },
            // Nivel 4: Caverna Helada
            {
                name: 'Caverna de Cristal',
                map: [
                    "###########",
                    "#@..R...R.#",
                    "#.....R...#",
                    "#..R...G..#",
                    "#.R....R..#",
                    "#...R...R.#",
                    "###########"
                ]
            },
            // Nivel 5: La Tumba de Hielo Ancestral
            {
                name: 'La Bóveda Helada de Jack',
                map: [
                    "###########",
                    "#@..R...R.#",
                    "#.R...R...#",
                    "#...R...R.#",
                    "#..R..R...#",
                    "#R....R.G.#",
                    "###########"
                ]
            }
        ],
        currentLevel: 0,
        map: [],
        player: { x: 1, y: 1, dir: 'right' },
        goal: { x: 8, y: 5 },
        isSliding: false,
        moves: 0,
        tileSize: 46,
        offsetX: 0,
        offsetY: 0,

        init() {
            this.loadLevel(this.currentLevel);
        },

        loadLevel(idx) {
            this.currentLevel = idx % this.levels.length;
            const lvl = this.levels[this.currentLevel];
            this.map = lvl.map.map(r => r.split(''));
            this.moves = 0;
            this.isSliding = false;
            this.player.dir = 'right';

            const rows = this.map.length;
            const cols = this.map[0].length;
            this.tileSize = Math.floor(Math.min(canvas.width / cols, (canvas.height - 20) / rows));
            this.offsetX = Math.floor((canvas.width - cols * this.tileSize) / 2);
            this.offsetY = Math.floor((canvas.height - rows * this.tileSize) / 2);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (this.map[r][c] === '@') {
                        this.player.x = c;
                        this.player.y = r;
                        this.map[r][c] = '.';
                    } else if (this.map[r][c] === 'G') {
                        this.goal.x = c;
                        this.goal.y = r;
                        this.map[r][c] = '.';
                    }
                }
            }

            this.updateHUD();
            this.render();
        },

        updateHUD() {
            hudLbl1.textContent = 'Nivel Glaciar';
            hudVal1.textContent = `${this.currentLevel + 1} / ${this.levels.length}`;
            hudLbl2.textContent = 'Deslizamientos';
            hudVal2.textContent = this.moves;
            hudLbl3.textContent = 'Superficie';
            hudVal3.textContent = this.isSliding ? '🧊 ¡Deslizándose!' : '🛑 En reposo';
        },

        move(dx, dy, dirName) {
            if (this.isSliding) return; // Ya se está deslizando
            this.player.dir = dirName;

            // Verificar si puede empezar a moverse
            const testX = this.player.x + dx;
            const testY = this.player.y + dy;
            if (this.isObstacle(testX, testY)) {
                this.render();
                return;
            }

            this.isSliding = true;
            this.moves++;
            playSound('click');
            this.updateHUD();

            // Animación continua de deslizamiento paso a paso
            const slideStep = () => {
                const nextX = this.player.x + dx;
                const nextY = this.player.y + dy;

                if (this.isObstacle(nextX, nextY)) {
                    // Chocó con roca o pared: se detiene
                    this.isSliding = false;
                    playSound('click');
                    this.updateHUD();
                    this.render();

                    // Comprobar si quedó sobre la meta
                    if (this.player.x === this.goal.x && this.player.y === this.goal.y) {
                        this.handleWin();
                    }
                    return;
                }

                // Continuar avanzando sobre el hielo
                this.player.x = nextX;
                this.player.y = nextY;
                this.render();

                // Si pasa exactamente sobre la meta mientras se desliza
                if (this.player.x === this.goal.x && this.player.y === this.goal.y) {
                    this.isSliding = false;
                    this.updateHUD();
                    this.render();
                    this.handleWin();
                    return;
                }

                setTimeout(slideStep, 80);
            };

            slideStep();
        },

        isObstacle(x, y) {
            if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) return true;
            const tile = this.map[y][x];
            return tile === '#' || tile === 'R';
        },

        handleWin() {
            playSound('win');
            setTimeout(() => {
                const lvl = this.levels[this.currentLevel];
                showOverlay(
                    true,
                    '¡META ALCANZADA EN EL HIELO!',
                    `¡Planificaste los choques a la perfección en el Nivel ${this.currentLevel + 1} (${lvl.name}) con ${this.moves} deslizamientos!`,
                    () => {
                        if (this.currentLevel + 1 < this.levels.length) {
                            this.loadLevel(this.currentLevel + 1);
                        } else {
                            this.loadLevel(0);
                        }
                    },
                    () => this.loadLevel(this.currentLevel)
                );
            }, 120);
        },

        render() {
            ctx.fillStyle = '#0a1424';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const ts = this.tileSize;

            for (let r = 0; r < this.map.length; r++) {
                for (let c = 0; c < this.map[r].length; c++) {
                    const px = this.offsetX + c * ts;
                    const py = this.offsetY + r * ts;
                    const ch = this.map[r][c];

                    // Suelo de hielo resbaladizo
                    ctx.fillStyle = '#a8e1ff';
                    ctx.fillRect(px, py, ts, ts);
                    ctx.fillStyle = '#c5ecff';
                    ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
                    ctx.strokeStyle = '#7ec3eb';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, ts, ts);

                    // Reflejo de brillo del hielo
                    if ((r + c) % 3 === 0) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.fillRect(px + 4, py + 4, ts * 0.4, 2);
                    }

                    if (ch === '#') {
                        // Pared perimetral de roca helada
                        ctx.fillStyle = '#263d59';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.fillStyle = '#3a5b82';
                        ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
                        ctx.strokeStyle = '#162436';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px, py, ts, ts);
                    } else if (ch === 'R') {
                        // Roca o bloque obstáculo
                        ctx.fillStyle = '#5c432d';
                        ctx.beginPath();
                        ctx.arc(px + ts / 2, py + ts / 2, ts * 0.38, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#2b1c0f';
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        ctx.fillStyle = '#ffffff';
                        ctx.font = `${Math.floor(ts * 0.45)}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🪨', px + ts / 2, py + ts / 2);
                    }
                }
            }

            // Meta cálida (Fogata / Bandera)
            const gx = this.offsetX + this.goal.x * ts + ts / 2;
            const gy = this.offsetY + this.goal.y * ts + ts / 2;
            ctx.font = `${Math.floor(ts * 0.7)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⛺', gx, gy);

            // Dibujar a JC en la dirección de deslizamiento
            const spriteImg = sprites[this.player.dir] || sprites.right;
            const jcPx = this.offsetX + this.player.x * ts;
            const jcPy = this.offsetY + this.player.y * ts;

            // Rastro de hielo
            if (this.isSliding) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect(jcPx + 4, jcPy + ts - 6, ts - 8, 4);
            }

            if (spriteImg.complete && spriteImg.naturalWidth > 0) {
                const drawH = ts * 1.25;
                const drawW = drawH * (spriteImg.naturalWidth / spriteImg.naturalHeight);
                ctx.drawImage(
                    spriteImg,
                    jcPx + (ts - drawW) / 2,
                    jcPy + ts - drawH - 2,
                    drawW,
                    drawH
                );
            }
        }
    };

    // =========================================================================
    // CONTROLADOR DE PESTAÑAS Y MODAL
    // =========================================================================
    const gameDrivers = {
        sokoban: Sokoban,
        laberinto: Laberinto,
        frogger: Frogger,
        pacman: Pacman,
        hielo: Hielo
    };

    const gameMetadata = {
        sokoban: {
            title: '1. SOKOBAN DE ALMACÉN',
            desc: 'Empuja las cajas de madera hacia las marcas de calabaza. Utiliza las 4 direcciones del sprite de JC para alinearte y empujar un bloque a la vez sin atascarte.'
        },
        laberinto: {
            title: '2. LABERINTO CONTRARRELOJ',
            desc: 'Guía a JC por el laberinto, encuentra la llave dorada 🗝️ y llega a la salida 🚪 antes de que el temporizador llegue a cero o la visión se oscurezca por completo.'
        },
        frogger: {
            title: '3. CRUCE PELIGROSO (ESTILO FROGGER)',
            desc: 'Cruza de abajo hacia arriba esquivando carros y fantasmas en la carretera, y salta sobre los troncos para no caer al río. JC utiliza principalmente las animaciones de frente y de espaldas.'
        },
        pacman: {
            title: '4. RECOLECTOR DE COSECHAS (ESTILO PAC-MAN)',
            desc: 'Recolecta todas las frutas del huerto para sumar puntos mientras esquivas a los monstruos que patrullan en patrones fijos.'
        },
        hielo: {
            title: '5. ROMPECABEZAS DE HIELO',
            desc: 'Al pulsar una dirección, JC se desliza sin detenerse hasta chocar con una pared o roca. Planea la secuencia exacta de choques para alcanzar la meta.'
        }
    };

    function switchGame(gameKey) {
        if (!gameDrivers[gameKey]) return;

        // Limpiar bucles previos
        if (animFrameId) cancelAnimationFrame(animFrameId);
        if (gameDrivers[currentGame] && gameDrivers[currentGame].cleanup) {
            gameDrivers[currentGame].cleanup();
        }

        currentGame = gameKey;
        hideOverlay();

        // Actualizar pestañas activas
        document.querySelectorAll('.minigame-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.game === gameKey);
        });

        // Actualizar títulos
        titleEl.textContent = gameMetadata[gameKey].title;
        descEl.textContent = gameMetadata[gameKey].desc;

        // Mostrar u ocultar botón de Deshacer (solo útil en Sokoban)
        if (btnUndo) {
            btnUndo.style.display = (gameKey === 'sokoban') ? 'inline-block' : 'none';
        }

        // Iniciar el juego seleccionado
        gameDrivers[gameKey].init();
    }

    function showOverlay(isWin, title, msg, onNext, onRetry) {
        if (isWin) {
            let coinsEarned = 50;
            if (currentGame === 'sokoban') coinsEarned = 50;
            else if (currentGame === 'laberinto') coinsEarned = 60;
            else if (currentGame === 'cruce') coinsEarned = 75;
            else if (currentGame === 'pacman') coinsEarned = 80;
            else if (currentGame === 'hielo') coinsEarned = 70;

            if (window.AtlantisHUD) {
                window.AtlantisHUD.addCoins(coinsEarned, `Victoria en ${currentGame}`);
            }
            msg += `\n\n💰 ¡Recompensa obtenida: +${coinsEarned} Monedas de Oro!`;
        }

        overlay.classList.add('active');
        overlayTitle.textContent = title;
        overlayTitle.className = 'minigame-overlay-title ' + (isWin ? 'win' : 'lose');
        overlayMsg.textContent = msg;

        overlayBtnNext.style.display = isWin ? 'inline-block' : 'none';
        overlayBtnNext.onclick = () => {
            hideOverlay();
            if (onNext) onNext();
        };

        overlayBtnRetry.onclick = () => {
            hideOverlay();
            if (onRetry) onRetry();
        };
    }

    function hideOverlay() {
        overlay.classList.remove('active');
    }

    // =========================================================================
    // ENTRADA: TECLADO Y BOTONES D-PAD
    // =========================================================================
    function handleDirectionInput(dx, dy, dirName) {
        const driver = gameDrivers[currentGame];
        if (driver && driver.move) {
            driver.move(dx, dy, dirName);
        }
    }

    window.addEventListener('keydown', (e) => {
        // Ignorar si el usuario está escribiendo en un input
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                handleDirectionInput(0, -1, 'up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                handleDirectionInput(0, 1, 'down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                handleDirectionInput(-1, 0, 'left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                handleDirectionInput(1, 0, 'right');
                break;
            case 'z':
            case 'Z':
                if (currentGame === 'sokoban' && Sokoban.undo) {
                    e.preventDefault();
                    Sokoban.undo();
                }
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                if (gameDrivers[currentGame]) gameDrivers[currentGame].init();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'Escape':
                if (isFrameFullscreen()) {
                    toggleFullscreen();
                }
                break;
        }
    });

    // D-Pad táctil
    document.querySelectorAll('[data-dpad]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dir = btn.dataset.dpad;
            if (dir === 'up') handleDirectionInput(0, -1, 'up');
            if (dir === 'down') handleDirectionInput(0, 1, 'down');
            if (dir === 'left') handleDirectionInput(-1, 0, 'left');
            if (dir === 'right') handleDirectionInput(1, 0, 'right');
            if (dir === 'action') {
                if (currentGame === 'sokoban') Sokoban.undo();
            }
        });
    });

    // Pestañas
    document.querySelectorAll('.minigame-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchGame(btn.dataset.game);
        });
    });

    // Botones de acción generales
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (gameDrivers[currentGame]) gameDrivers[currentGame].init();
        });
    }

    if (btnUndo) {
        btnUndo.addEventListener('click', () => {
            if (currentGame === 'sokoban') Sokoban.undo();
        });
    }

    // Funciones de Pantalla Completa para Minijuegos (exclusivo sobre el marco del juego)
    function isFrameFullscreen() {
        if (!viewportFrame) return false;
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        return fsEl === viewportFrame || viewportFrame.classList.contains('is-fullscreen-frame');
    }

    function toggleFullscreen() {
        if (!viewportFrame) return;
        const isFull = isFrameFullscreen();
        if (!isFull) {
            viewportFrame.classList.add('is-fullscreen-frame');
            if (viewportFrame.requestFullscreen) {
                viewportFrame.requestFullscreen().catch(() => {});
            } else if (viewportFrame.webkitRequestFullscreen) {
                viewportFrame.webkitRequestFullscreen();
            } else if (viewportFrame.mozRequestFullScreen) {
                viewportFrame.mozRequestFullScreen();
            } else if (viewportFrame.msRequestFullscreen) {
                viewportFrame.msRequestFullscreen();
            }
        } else {
            viewportFrame.classList.remove('is-fullscreen-frame');
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
        updateFullscreenUI();
    }

    function updateFullscreenUI() {
        const isFull = isFrameFullscreen();
        if (btnFullscreen) {
            btnFullscreen.textContent = isFull ? '🗗 Salir Pantalla Completa' : '⛶ Pantalla Completa';
            btnFullscreen.title = isFull ? 'Salir de Pantalla Completa (F / ESC)' : 'Pantalla Completa (F)';
        }
        const driver = gameDrivers[currentGame];
        if (driver && driver.render) {
            driver.render();
        }
    }

    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            toggleFullscreen();
        });
    }

    const onMinigameFsChange = () => {
        if (!viewportFrame) return;
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (fsEl === viewportFrame) {
            viewportFrame.classList.add('is-fullscreen-frame');
        } else {
            viewportFrame.classList.remove('is-fullscreen-frame');
        }
        updateFullscreenUI();
    };

    document.addEventListener('fullscreenchange', onMinigameFsChange);
    document.addEventListener('webkitfullscreenchange', onMinigameFsChange);
    document.addEventListener('mozfullscreenchange', onMinigameFsChange);
    document.addEventListener('MSFullscreenChange', onMinigameFsChange);

    // Inicializar el primer juego (Sokoban)
    switchGame('sokoban');
})();
