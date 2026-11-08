<?php
/**
 * MÓDULO: MINIJUEGOS DE JC (minijuegos.php)
 * ==============================================================================
 */

require_once __DIR__ . '/VarGlobales.php';

// El login debe ser obligatorio antes de entrar a la web
if (!isUserLoggedIn()) {
    redirect('login.php');
}

$usuarioActivo = getActiveUser();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minijuegos de JC - Atlantis Town</title>
    <link rel="stylesheet" href="../front/css/style.css?v=5">
    <link rel="icon" type="image/png" href="../img/jc/jc-frente.png?v=2">
</head>
<body class="stardew-theme">
    <div class="game-viewport">
        <!-- Cabecera superior y HUD -->
        <header class="top-header">
            <a href="index.php" class="town-banner" title="Atlantis Town">
                <img src="../front/img/web/ui/banner-atlantis-town.png?v=4" alt="Atlantis Town" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/banner-atlantis-town.png?v=4';}">
            </a>

            <div class="hud-container">
                <div class="hud-clock-box">
                    <div class="hud-clock-icon">🎃</div>
                    <div class="date-info">
                        <div class="hud-date-text">Noche de Brujas</div>
                        <div class="hud-time-text">23:59 PM</div>
                    </div>
                </div>
                <div class="hud-gold-box">
                    <span class="gold-coin"></span>
                    <span class="hud-gold-amount">1,312 G</span>
                </div>
                <div class="hud-energy-bar" title="Energía del jugador">
                    <span class="energy-label">E</span>
                    <div class="energy-track">
                        <div class="energy-fill"></div>
                    </div>
                </div>
            </div>
        </header>

        <div class="layout-grid">
            <!-- Panel lateral de navegacion -->
            <aside class="sidebar-panel">
                <a href="index.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-inicio.png?v=3" alt="Icono Inicio" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-inicio.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Inicio</span>
                </a>

                <a href="juego.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-recetario-perdido.png?v=3" alt="Icono Juego" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-recetario-perdido.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">El Recetario Perdido</span>
                </a>

                <a href="recetas.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-recetario.png?v=3" alt="Icono Recetario" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-recetario.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Recetario</span>
                </a>

                <a href="aboutus.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-sobre-mi.png?v=3" alt="Icono Sobre mí" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-sobre-mi.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Sobre mí</span>
                </a>

                <a href="minijuegos.php" class="menu-btn active">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-minijuegos.png?v=3" alt="Icono Minijuegos" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-minijuegos.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Minijuegos</span>
                </a>

                <!-- Control dinamico de sesion -->
                <div class="user-session-card">
                    <?php if ($usuarioActivo): ?>
                        <div class="session-info">
                            <div>Habitante: <strong><?php echo htmlspecialchars($usuarioActivo['Usuario'], ENT_QUOTES, 'UTF-8'); ?></strong></div>
                            <span class="session-badge">● Sesión Activa</span>
                        </div>
                        <div class="session-links">
                            <a href="correo.php" class="btn-session btn-session-mail">✉ Enviar Pesadillas</a>
                            <a href="logout.php" class="btn-session btn-session-logout">🚪 Cerrar Sesión</a>
                        </div>
                    <?php else: ?>
                        <div class="session-info">
                            <div>Bienvenido a <strong>Atlantis Town</strong></div>
                            <span class="session-badge">★ Visitante</span>
                        </div>
                        <div class="session-links">
                            <a href="login.php" class="btn-session btn-session-login">🔑 Iniciar Sesión / Registro</a>
                            <a href="correo.php" class="btn-session btn-session-mail">✉ Enviar Pesadillas</a>
                        </div>
                    <?php endif; ?>
                </div>
            </aside>

            <!-- Tablon principal de minijuegos-->
            <main class="main-board">
                <div class="minigames-hub">
                    <!-- Selector de pestañas para los 5 minijuegos -->
                    <nav class="minigames-tabs-bar" aria-label="Selector de Minijuegos">
                        <button class="minigame-tab-btn active" data-game="sokoban">
                            <span class="minigame-tab-icon">📦</span> Sokoban
                        </button>
                        <button class="minigame-tab-btn" data-game="laberinto">
                            <span class="minigame-tab-icon">⏳</span> Laberinto
                        </button>
                        <button class="minigame-tab-btn" data-game="frogger">
                            <span class="minigame-tab-icon">🐸</span> Cruce Peligroso
                        </button>
                        <button class="minigame-tab-btn" data-game="pacman">
                            <span class="minigame-tab-icon">🎃</span> Cosechas
                        </button>
                        <button class="minigame-tab-btn" data-game="hielo">
                            <span class="minigame-tab-icon">❄️</span> Hielo
                        </button>
                    </nav>

                    <!-- Marco del juego actual -->
                    <div class="minigame-viewport-frame">
                        <!-- Cabecera de información -->
                        <div class="minigame-info-header">
                            <div class="minigame-title-group">
                                <h2 id="minigameTitle">1. SOKOBAN DE ALMACÉN</h2>
                                <p id="minigameDesc" class="minigame-desc">
                                    Empuja las cajas de madera hacia las marcas de calabaza. Utiliza las 4 direcciones del sprite de JC para alinearte y empujar un bloque a la vez sin atascarte.
                                </p>
                            </div>
                            <div class="minigame-actions-group">
                                <button id="btnToggleAudio" class="btn-plaque-action" style="padding: 6px 10px; font-size: 8.5px;">
                                    🔊 Sonido: ON
                                </button>
                                <button id="btnResetGame" class="btn-plaque-action" style="padding: 6px 10px; font-size: 8.5px;">
                                    🔄 Reiniciar
                                </button>
                                <button id="btnUndoMove" class="btn-plaque-action" style="padding: 6px 10px; font-size: 8.5px;">
                                    ↩ Deshacer (Z)
                                </button>
                                <button id="btnToggleFullscreen" class="btn-plaque-action" style="padding: 6px 10px; font-size: 8.5px;" title="Alternar Pantalla Completa (F)">
                                    ⛶ Pantalla Completa
                                </button>
                            </div>
                        </div>

                        <!-- Barra HUD retro -->
                        <div class="minigame-hud-bar">
                            <div class="minigame-hud-item">
                                <span id="hudLbl1">Nivel:</span>
                                <span id="hudVal1" class="minigame-hud-val">1 / 3</span>
                            </div>
                            <div class="minigame-hud-item">
                                <span id="hudLbl2">Movimientos:</span>
                                <span id="hudVal2" class="minigame-hud-val">0</span>
                            </div>
                            <div class="minigame-hud-item">
                                <span id="hudLbl3">Cajas Listas:</span>
                                <span id="hudVal3" class="minigame-hud-val">0 / 2</span>
                            </div>
                        </div>

                        <!-- Contenedor del Canvas y Modal de Estado -->
                        <div class="minigame-canvas-container">
                            <canvas id="minigameCanvas" width="560" height="420"></canvas>

                            <!-- Modal de Victoria / Derrota -->
                            <div id="minigameOverlay" class="minigame-overlay">
                                <div class="minigame-overlay-box">
                                    <div id="overlayTitle" class="minigame-overlay-title win">¡NIVEL COMPLETADO!</div>
                                    <div id="overlayMsg" class="minigame-overlay-msg">¡Has superado el desafío con éxito!</div>
                                    <div style="display: flex; gap: 10px; justify-content: center;">
                                        <button id="overlayBtnNext" class="btn-plaque-action" style="padding: 8px 16px; font-size: 10px;">
                                            Siguiente ▶
                                        </button>
                                        <button id="overlayBtnRetry" class="btn-plaque-action" style="padding: 8px 16px; font-size: 10px;">
                                            Reintentar 🔄
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Panel inferior: Ayuda de controles y D-Pad táctil -->
                        <div class="minigame-bottom-panel">
                            <div class="minigame-keyboard-hints">
                                <div><strong>Controles de Teclado:</strong></div>
                                <div>• Mover a JC: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd></div>
                                <div>• Deshacer paso: <kbd>Z</kbd> | Reiniciar nivel: <kbd>R</kbd></div>
                            </div>

                            <!-- D-Pad para jugar en móvil o con ratón -->
                            <div class="minigame-dpad" aria-label="Pad de control en pantalla">
                                <button class="dpad-btn dpad-up" data-dpad="up" title="Arriba">▲</button>
                                <button class="dpad-btn dpad-left" data-dpad="left" title="Izquierda">◀</button>
                                <button class="dpad-btn dpad-action" data-dpad="action" title="Deshacer">↩</button>
                                <button class="dpad-btn dpad-right" data-dpad="right" title="Derecha">▶</button>
                                <button class="dpad-btn dpad-down" data-dpad="down" title="Abajo">▼</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Script del motor de los 5 minijuegos -->
    <script src="../front/js/hud.js?v=4"></script>
    <script src="../front/js/minijuegos.js?v=4"></script>
</body>
</html>
