<?php
/**
 * MÓDULO: CATÁLOGO DE RECETAS DINÁMICO (recetas.php)
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
    <title>Recetario de Halloween - Atlantis Town</title>
    <link rel="stylesheet" href="../front/css/style.css?v=5">
    <link rel="icon" type="image/png" href="../front/img/web/ui/icon-recetario.png?v=3">
</head>
<body class="stardew-theme">
    <div class="game-viewport">
        <!-- Cabecera superio y HUD -->
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

                <a href="recetas.php" class="menu-btn active">
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

                <a href="minijuegos.php" class="menu-btn">
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
                            <div>Recetario Ancestral</div>
                            <span class="session-badge">★ 10 Fórmulas</span>
                        </div>
                        <div class="session-links">
                            <a href="login.php" class="btn-session btn-session-login">🔑 Iniciar Sesión / Registro</a>
                            <a href="correo.php" class="btn-session btn-session-mail">✉ Enviar Pesadillas</a>
                        </div>
                    <?php endif; ?>
                </div>
            </aside>

            <!-- Tablon principal -->
            <main class="main-board">
                <!-- Pergamino de cabecera 'RECETARIO' -->
                <div class="board-header-scroll">
                    <img src="../front/img/web/ui/banner-recetario.png" alt="RECETARIO">
                </div>

                <!-- Sección dinámica de progreso del recetario y recompensa de historia -->
                <div id="recetarioProgressSection"></div>

                <!-- Cuadrícula 2x5 de las 10 recetas  -->
                <div class="recipes-grid">
                    <!-- 1. Sopa de Calabaza -->
                    <div class="recipe-card" data-recipe="sopa-calabaza" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/sopa-calabaza.png" alt="Sopa de Calabaza">
                        </div>
                        <h3 class="recipe-title">Sopa de Calabaza</h3>
                        <div class="recipe-rating">★★☆</div>
                        <span class="recipe-badge-tag">Plato Caliente</span>
                    </div>

                    <!-- 2. Pastel de Bayas -->
                    <div class="recipe-card" data-recipe="pastel-bayas" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/pastel-bayas.png" alt="Pastel de Bayas">
                        </div>
                        <h3 class="recipe-title">Pastel de Bayas</h3>
                        <div class="recipe-rating">★★☆</div>
                        <span class="recipe-badge-tag">Repostería</span>
                    </div>

                    <!-- 3. Guiso de Setas (RECETA TOP DIW - Marco dorado y distintivo) -->
                    <div class="recipe-card top-recipe" data-recipe="guiso-setas" title="★ RECETA TOP ★ - Click para ver detalles legendarios">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/guiso-setas.png" alt="Guiso de Setas">
                        </div>
                        <h3 class="recipe-title">Guiso de Setas</h3>
                        <div class="recipe-rating">★★★</div>
                        <span class="recipe-badge-tag" style="background:#ffd700; color:#4a220a; font-weight:bold;">Legendaria</span>
                    </div>

                    <!-- 4. Pan Espeluznante -->
                    <div class="recipe-card" data-recipe="pan-espeluznante" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/pan-espeluznante.png" alt="Pan Espeluznante">
                        </div>
                        <h3 class="recipe-title">Pan Espeluznante</h3>
                        <div class="recipe-rating">★☆☆</div>
                        <span class="recipe-badge-tag">Panadería</span>
                    </div>

                    <!-- 5. Brebaje de Olas -->
                    <div class="recipe-card" data-recipe="brebaje-olas" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/brebaje-olas.png" alt="Brebaje de Olas">
                        </div>
                        <h3 class="recipe-title">Brebaje de Olas</h3>
                        <div class="recipe-rating">⏱️ ★☆☆</div>
                        <span class="recipe-badge-tag">Poción Marina</span>
                    </div>

                    <!-- 6. Pudin Nocturno -->
                    <div class="recipe-card" data-recipe="pudin-nocturno" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/pudin-nocturno.png" alt="Pudin Nocturno">
                        </div>
                        <h3 class="recipe-title">Pudin Nocturno</h3>
                        <div class="recipe-rating">★☆☆</div>
                        <span class="recipe-badge-tag">Postre Espectral</span>
                    </div>

                    <!-- 7. Dulces de Otoño -->
                    <div class="recipe-card" data-recipe="dulces-otono" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/dulces-otono.png" alt="Dulces de Otoño">
                        </div>
                        <h3 class="recipe-title">Dulces de Otoño</h3>
                        <div class="recipe-rating">★★☆</div>
                        <span class="recipe-badge-tag">Golosinas</span>
                    </div>

                    <!-- 8. Caldo de Algas -->
                    <div class="recipe-card" data-recipe="caldo-algas" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/caldo-algas.png" alt="Caldo de Algas">
                        </div>
                        <h3 class="recipe-title">Caldo de Algas</h3>
                        <div class="recipe-rating">⏱️ ★☆☆</div>
                        <span class="recipe-badge-tag">Sopa Ligera</span>
                    </div>

                    <!-- 9. Galletas de Calabaza  -->
                    <div class="recipe-card top-recipe" data-recipe="galletas-calabaza" title="★ RECETA TOP ★ - Click para ver detalles legendarios">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/galletas-calabaza.png" alt="Galletas de Calabaza">
                        </div>
                        <h3 class="recipe-title">Galletas de Calabaza</h3>
                        <div class="recipe-rating">★★☆</div>
                        <span class="recipe-badge-tag" style="background:#ffd700; color:#4a220a; font-weight:bold;">Especialidad</span>
                    </div>

                    <!-- 10. Estofado del Bosque -->
                    <div class="recipe-card" data-recipe="estofado-bosque" title="Click para ver ingredientes y preparación">
                        <div class="recipe-icon-frame">
                            <img src="../front/img/web/recetas/estofado-bosque.png" alt="Estofado del Bosque">
                        </div>
                        <h3 class="recipe-title">Estofado del Bosque</h3>
                        <div class="recipe-rating">⚔️ ★☆☆</div>
                        <span class="recipe-badge-tag">Contundente</span>
                    </div>
                </div>

                <div style="text-align: center; font-family: var(--font-pixel); font-size: 9px; color: #693817; margin-top: auto;">
                    💡 Selecciona cualquier receta para inspeccionar ingredientes, modo de preparación y efectos mágicos.
                </div>
            </main>
        </div>
    </div>

    <!-- Modal interactivo de detalles de receta  -->
    <div id="recipeModalBackdrop" class="recipe-modal-backdrop">
        <div class="recipe-modal">
            <button id="closeRecipeModal" class="recipe-modal-close" title="Cerrar ventana">✕</button>

            <div class="recipe-modal-header">
                <div class="recipe-modal-icon">
                    <img id="modalRecipeIcon" src="../front/img/web/recetas/sopa-calabaza.png" alt="Icono de Receta">
                </div>
                <div class="recipe-modal-title">
                    <h3 id="modalRecipeTitle">Sopa de Calabaza</h3>
                    <div id="modalRecipeCategory" style="font-family: var(--font-pixel); font-size: 9px; color: #a45318;">Plato Caliente</div>
                    <div id="modalRecipeRating" style="color: #e69500; font-size: 14px; margin-top: 4px;">★★☆</div>
                </div>
            </div>

            <div class="recipe-modal-body">
                <p id="modalRecipeDesc" style="font-size: 13px; line-height: 1.4; margin-bottom: 12px; color: #371a07; font-style: italic;"></p>
                <div id="modalRecipeBuff" class="recipe-buff-badge"></div>

                <h4>Ingredientes Requeridos:</h4>
                <ul id="modalRecipeIngredients"></ul>

                <h4>Modo de Elaboración:</h4>
                <p id="modalRecipePrep" style="font-size: 13px; line-height: 1.4; color: #431f08;"></p>
            </div>
        </div>
    </div>

    <script src="../front/js/hud.js?v=4"></script>
    <script src="../front/js/recetas.js?v=4"></script>
</body>
</html>
