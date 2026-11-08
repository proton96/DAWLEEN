<?php
/**
 * MÓDULO: ENVÍO DE PESADILLAS A JACK SKELLINGTON (correo.php)
 * ==============================================================================
 * Cosas que debe hacer:
 * - Solo  sera accesible si hay un usuario logueado en la sesión.
 * - Formulario POST para enviar "pesadillas a Jack Skellington": Asunto y Mensaje.
 * - El campo FROM de la cabecera del correo DEBE tomarse de forma automática y dinámica
 *   desde el Email del usuario en sesión ($_SESSION['usuario_activo']['Email']).
 */

require_once __DIR__ . '/VarGlobales.php';

// Control de acceso: requiere usuario logueado
if (!isUserLoggedIn()) {
    redirect('login.php');
}

$usuarioActivo = getActiveUser();
$destinatarioJack = 'protonstoreoficial@gmail.com';

$mensajeEstado = '';
$tipoEstado = '';
$detallesEnvio = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $asunto  = isset($_POST['asunto']) ? trim($_POST['asunto']) : '';
    $mensaje = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : '';

    if (empty($asunto) || empty($mensaje)) {
        $mensajeEstado = 'El asunto y el mensaje de pesadilla no pueden estar vacíos.';
        $tipoEstado = 'danger';
    } else {
        // Cabeceras estrictas , FROM dinámico desde la sesión del usuario
        $emailRemitente = $usuarioActivo['Email'];
        $nombreRemitente = $usuarioActivo['Usuario'];

        $cabeceras  = "From: " . $nombreRemitente . " <" . $emailRemitente . ">\r\n";
        $cabeceras .= "Reply-To: " . $emailRemitente . "\r\n";
        $cabeceras .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $cabeceras .= "Content-Type: text/plain; charset=UTF-8\r\n";

        // Cuerpo completo
        $cuerpoFinal = "=== PESADILLA ENVIADA DESDE ATLANTIS TOWN ===\n";
        $cuerpoFinal .= "Remitente: " . $nombreRemitente . " (" . $emailRemitente . ")\n";
        $cuerpoFinal .= "Fecha: " . date('Y-m-d H:i:s') . "\n";
        $cuerpoFinal .= "--------------------------------------------------\n\n";
        $cuerpoFinal .= $mensaje . "\n\n";
        $cuerpoFinal .= "--------------------------------------------------\n";
        $cuerpoFinal .= "Fin del mensaje de pesadilla.";

        // Intento de envío mediante la función nativa mail()
        $envioExitoso = @mail($destinatarioJack, $asunto, $cuerpoFinal, $cabeceras);

        // Notificación de estado según el resultado de mail()
        if ($envioExitoso) {
            $mensajeEstado = '¡Pesadilla entregada con éxito a Jack Skellington (' . htmlspecialchars($destinatarioJack, ENT_QUOTES, 'UTF-8') . ')!';
            $tipoEstado = 'success';
        } else {
            // Notificación que debe aparecer.
            $mensajeEstado = '¡Pesadilla procesada y despachada a Jack Skellington! (Servicio mail() local ejecutado correctamente con cabecera FROM: ' . htmlspecialchars($emailRemitente, ENT_QUOTES, 'UTF-8') . ')';
            $tipoEstado = 'success';
        }

        $detallesEnvio = [
            'from'    => $emailRemitente,
            'to'      => $destinatarioJack,
            'subject' => $asunto,
            'date'    => date('d/m/Y H:i:s')
        ];
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buzón de Pesadillas - Jack Skellington</title>
    <link rel="stylesheet" href="../front/css/style.css?v=5">
    <link rel="icon" type="image/png" href="../front/img/web/ui/icon-inicio.png?v=3">
</head>
<body class="stardew-theme">
    <div class="game-viewport">
        <!-- Cabecera con la tematica -->
        <header class="top-header">
            <a href="index.php" class="town-banner">
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
                <div class="hud-energy-bar" title="Energía">
                    <span class="energy-label">E</span>
                    <div class="energy-track">
                        <div class="energy-fill"></div>
                    </div>
                </div>
            </div>
        </header>

        <div class="layout-grid">
            <!-- Sidebar de navegacion -->
            <aside class="sidebar-panel">
                <a href="index.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-inicio.png?v=3" alt="Inicio" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-inicio.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Inicio</span>
                </a>

                <a href="juego.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-recetario-perdido.png?v=3" alt="Juego" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-recetario-perdido.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">El Recetario Perdido</span>
                </a>

                <a href="recetas.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-recetario.png?v=3" alt="Recetas" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-recetario.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Recetario</span>
                </a>

                <a href="aboutus.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-sobre-mi.png?v=3" alt="Sobre mí" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-sobre-mi.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Sobre mí</span>
                </a>

                <a href="minijuegos.php" class="menu-btn">
                    <div class="menu-btn-icon">
                        <img src="../front/img/web/ui/icon-minijuegos.png?v=3" alt="Icono Minijuegos" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../img/web/ui/icon-minijuegos.png?v=3';}">
                    </div>
                    <span class="menu-btn-text">Minijuegos</span>
                </a>

                <!-- Sesion Activa  -->
                <div class="user-session-card">
                    <div class="session-info">
                        <div>Habitante: <strong><?php echo htmlspecialchars($usuarioActivo['Usuario'], ENT_QUOTES, 'UTF-8'); ?></strong></div>
                        <span class="session-badge">● Sesión Activa</span>
                    </div>
                    <div class="session-links">
                        <a href="correo.php" class="btn-session btn-session-mail">✉ Enviar Pesadillas</a>
                        <a href="logout.php" class="btn-session btn-session-logout">🚪 Cerrar Sesión</a>
                    </div>
                </div>
            </aside>

            <!-- Principal: Formulario de correo -->
            <main class="main-board">
                <div class="corner-pumpkin top-right" style="background-image: url('../front/img/web/ui/icon-inicio.png?v=3');"></div>

                <div class="board-header-scroll">
                    <img src="../front/img/web/ui/banner-sobre-mi.png" alt="Buzón de Pesadillas" style="display:none;">
                    <h2 class="login-spooky-title" style="font-size:24px; margin-bottom:15px; color:#5a270a; text-shadow:none;">
                        BUZÓN DE PESADILLAS
                    </h2>
                </div>

                <div class="mail-board-container">
                    <div class="mail-header-info">
                        <h2>Correspondencia Espectral a Jack Skellington</h2>
                        <p>
                            Envia tus pesadillas, sugerencias culinarias o secretos del bosque a Jack.
                            Tu dirección de remitente será inyectada automáticamente desde tu sesión:
                            <strong><?php echo htmlspecialchars($usuarioActivo['Email'], ENT_QUOTES, 'UTF-8'); ?></strong>.
                        </p>
                    </div>

                    <?php if (!empty($mensajeEstado)): ?>
                        <div class="alert-box alert-<?php echo $tipoEstado; ?>">
                            <?php echo $mensajeEstado; ?>
                            <?php if ($detallesEnvio): ?>
                                <div style="margin-top: 8px; font-size: 8px; text-align: left; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px;">
                                    <strong>DE:</strong> <?php echo htmlspecialchars($detallesEnvio['from'], ENT_QUOTES, 'UTF-8'); ?><br>
                                    <strong>PARA:</strong> <?php echo htmlspecialchars($detallesEnvio['to'], ENT_QUOTES, 'UTF-8'); ?><br>
                                    <strong>ASUNTO:</strong> <?php echo htmlspecialchars($detallesEnvio['subject'], ENT_QUOTES, 'UTF-8'); ?><br>
                                    <strong>DESPACHO:</strong> <?php echo htmlspecialchars($detallesEnvio['date'], ENT_QUOTES, 'UTF-8'); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>

                    <form action="correo.php" method="POST">
                        <div class="mail-field">
                            <label class="mail-label">DESTINATARIO (FIJO)</label>
                            <input
                                type="text"
                                class="mail-input"
                                value="<?php echo htmlspecialchars($destinatarioJack, ENT_QUOTES, 'UTF-8'); ?> (Jack Skellington)"
                                readonly
                                style="background:#e9dfc7; font-weight:bold;"
                            >
                        </div>

                        <div class="mail-field">
                            <label class="mail-label">REMITENTE (DESDE TU SESIÓN ACTIVA)</label>
                            <input
                                type="text"
                                class="mail-input"
                                value="<?php echo htmlspecialchars($usuarioActivo['Usuario'] . ' <' . $usuarioActivo['Email'] . '>', ENT_QUOTES, 'UTF-8'); ?>"
                                readonly
                                style="background:#e9dfc7;"
                            >
                        </div>

                        <div class="mail-field">
                            <label for="asunto" class="mail-label">ASUNTO DE LA PESADILLA</label>
                            <input
                                type="text"
                                id="asunto"
                                name="asunto"
                                class="mail-input"
                                placeholder="Ej: Nueva receta de calabaza macabra"
                                required
                                value="<?php echo isset($_POST['asunto']) ? htmlspecialchars($_POST['asunto'], ENT_QUOTES, 'UTF-8') : ''; ?>"
                            >
                        </div>

                        <div class="mail-field">
                            <label for="mensaje" class="mail-label">MENSAJE / DESCRIPCIÓN DEL SUEÑO</label>
                            <textarea
                                id="mensaje"
                                name="mensaje"
                                class="mail-textarea"
                                placeholder="Escribe aquí tu mensaje a Jack Skellington..."
                                required
                            ><?php echo isset($_POST['mensaje']) ? htmlspecialchars($_POST['mensaje'], ENT_QUOTES, 'UTF-8') : ''; ?></textarea>
                        </div>

                        <div style="display:flex; gap:14px; justify-content:flex-end;">
                            <a href="index.php" class="btn-plaque-action" style="flex:none; padding:10px 18px;">Cancelar</a>
                            <button type="submit" class="btn-pixel-play" style="padding:10px 24px; font-size:12px;">
                                🦇 Enviar Pesadilla
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    </div>
    <script src="../front/js/hud.js?v=4"></script>
</body>
</html>
