<?php
/**
 * ==============================================================================
 * PROYECTO TRANSVERSAL DAWLLOWEEN / ATLANTIS TOWN
 * MÓDULO DWES / DIW: SOBRE MÍ / SOBRE NOSOTROS DINÁMICO (aboutus.php)
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
    <title>Sobre Mí / Sobre Nosotros - Atlantis Town</title>
    <link rel="stylesheet" href="../front/css/style.css?v=5">
    <link rel="icon" type="image/png" href="../front/img/web/ui/icon-sobre-mi.png?v=3">
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

                <a href="aboutus.php" class="menu-btn active">
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
                            <div>Equipo y Personajes</div>
                            <span class="session-badge">★ Atlantis Town</span>
                        </div>
                        <div class="session-links">
                            <a href="login.php" class="btn-session btn-session-login">🔑 Iniciar Sesión / Registro</a>
                            <a href="correo.php" class="btn-session btn-session-mail">✉ Enviar Pesadillas</a>
                        </div>
                    <?php endif; ?>
                </div>
            </aside>

            <!-- Tablon principal Sobre mi  -->
            <main class="main-board">
                <!-- Pergamino de cabecera -->
                <div class="board-header-scroll">
                    <img src="../front/img/web/ui/banner-sobre-mi.png" alt="SOBRE MÍ">
                </div>

                <!-- Mi ficha destacada -->
                <section class="creator-profile-card">
                    <div class="creator-portrait-box">
                        <img src="../front/img/web/autor.jpg" alt="Retrato del Creador" class="creator-avatar">
                        <div class="creator-badge">★ CREADOR ★</div>
                    </div>
                    <div class="creator-bio-box">
                        <div class="creator-header">
                            <h2>JOSÉ CARLOS MARTÍN <span>🎃</span></h2>
                            <span class="creator-tagline">Desarrollador Web • Administrador de Sistemas en red</span>
                        </div>
                        <p class="creator-message">
                            Hola! Gracias por utilizar esta web y espero que estes disfrutando de tu experiencia de hallowen interactiva con la historia de El Recetario Perdido, una idea que ha sido creada con creatividad y con referencias al instituto de este proyecto de FP y de mi juego favorito de la nintendo DS &quot;El Profesor Layton&quot;. Esta web ha sido recreada solo utilizando PHP , Java , Java Script Vanilla , HTML5 y CSS3.
                        </p>
                        <div class="tech-pills">
                            <span class="tech-pill">🐘 PHP</span>
                            <span class="tech-pill">☕ Java</span>
                            <span class="tech-pill">⚡ Java Script Vanilla</span>
                            <span class="tech-pill">🌐 HTML5</span>
                            <span class="tech-pill">🎨 CSS3</span>
                            <span class="tech-pill">🎮 " Juego principal basado en : El Profesor Layton" (Nintendo DS)</span>
                        </div>
                    </div>
                </section>

                <div class="section-divider">
                    <span class="divider-text">★ PERSONAJES DE LA HISTORIA ★</span>
                </div>

                <!-- Lista de personajes principales que estan en el juego -->
                <section class="characters-list">
                    <!-- Bea -->
                    <article class="character-card">
                        <div class="char-portrait">
                            <img src="../front/img/web/ui/portrait-bea.png" alt="Retrato de Bea">
                        </div>
                        <div class="char-info">
                            <h3>BEA <span>⭐</span></h3>
                            <p>
                                Directora del instituto Atlántida de AtlantisTown. Gran apasionada de la historia y el misterio.
                                Custodia el ancestral recetario de cocina que salvaguarda la tradición de Halloween en el pueblo.
                            </p>
                        </div>
                    </article>

                    <!-- Rock -->
                    <article class="character-card">
                        <div class="char-portrait">
                            <img src="../front/img/web/ui/portrait-rock.png" alt="Retrato de Rock">
                        </div>
                        <div class="char-info">
                            <h3>ROCK <span>🔍</span></h3>
                            <p>
                                Detective privado de AtlantisTown. Siempre tras el rastro de la verdad y de la naturaleza.
                                Su sagacidad y perseverancia son la clave para desenmascarar los oscuros planes en el bosque.
                            </p>
                        </div>
                    </article>

                    <!-- Jack Skellington -->
                    <article class="character-card">
                        <div class="char-portrait" style="display:flex; align-items:center; justify-content:center; background:#eddab2;">
                            <img src="../front/img/web/ui/icon-sobre-mi.png?v=3" alt="Retrato de Jack" style="width:90px; height:90px; object-fit:contain;">
                        </div>
                        <div class="char-info">
                            <h3>JACK SKELLINGTON <span>🎃</span></h3>
                            <p>
                                Autor legendario del recetario original. Espíritu protector que regresa cada noche de Halloween
                                para disfrutar de los aromas culinarios y defender el orden natural frente a la especulación.
                            </p>
                        </div>
                    </article>
                </section>
            </main>
        </div>
    </div>
    <script src="../front/js/hud.js?v=4"></script>
</body>
</html>
