<?php
/**
 * MÓDULO: PÁGINA PRINCIPAL DINÁMICA (index.php)
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
    <title>Atlantis Town - Noche de Halloween</title>
    <link rel="stylesheet" href="../front/css/style.css?v=5">
    <link rel="icon" type="image/png" href="../front/img/web/ui/icon-inicio.png?v=3">
</head>
<body class="stardew-theme">
    <div class="game-viewport">
        <!--Cabecera superior y HUD-->
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
            <!-- Panel lateral de navegacion-->
            <aside class="sidebar-panel">
                <a href="index.php" class="menu-btn active">
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

            <!-- Tablon principal de madera y pergamino -->
            <main class="main-board">
                <!-- Banner interno temático  -->
                <div class="home-banner-box">
                    <img src="../front/img/web/ui/home-banner-full.png" alt="El Recetario Perdido">
                </div>

                <!-- Cuadrícula de 2 tarjetas ilustradas con pie de foto descriptivo -->
                <div class="home-preview-grid">
                    <article class="preview-card">
                        <div class="preview-img-frame">
                            <img src="../front/img/web/ui/home-preview-town.png" alt="Vista de Atlantis Town">
                        </div>
                        <p class="preview-caption">
                            Atlantis Town se prepara para la festividad más esperada del año: la noche de Halloween.
                            Sin embargo, la calma se ha roto tras la desaparición de Bea, directora del instituto,
                            y la pérdida del recetario ancestral custodiado durante generaciones.
                        </p>
                    </article>

                    <article class="preview-card">
                        <div class="preview-img-frame">
                            <img src="../front/img/web/ui/home-preview-jack.png" alt="Jack Skellington en Atlantis Town">
                        </div>
                        <p class="preview-caption">
                            Jack Skellington, autor originario de las recetas mágicas de Halloween, ha regresado
                            para salvaguardar el orden entre el bosque místico y la ciudad. Acompaña al detective
                            Rock a desentrañar los acertijos antes de medianoche.
                        </p>
                    </article>
                </div>

                <!-- Llamada a la acción de jugar -->
                <div class="home-cta-box">
                    <p>Demuestra tu ingenio y ayuda a Bea y Rock a recuperar las recetas del bosque.</p>
                    <a href="juego.php" class="btn-pixel-play">
                        JUGAR AHORA <span class="play-arrow"></span>
                    </a>
                </div>
            </main>
        </div>
    </div>
    <script src="../front/js/hud.js?v=4"></script>
</body>
</html>
