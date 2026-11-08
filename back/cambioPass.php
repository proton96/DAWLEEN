<?php
/**
 * MÓDULO: RECUPERACIÓN / CAMBIO DE CONTRASEÑA (cambioPass.php)
 * ==============================================================================
 *
 * Formulario POST:
 * - Nombre de usuario
 * - Respuesta a pregunta de seguridad
 * - Nueva contraseña
 * - Ejecuta la función cambioContraseña() y notifica el resultado.
 */

require_once __DIR__ . '/VarGlobales.php';

$mensajeError = '';
$mensajeExito = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario     = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
    $respuesta   = isset($_POST['respuesta']) ? trim($_POST['respuesta']) : '';
    $nuevaClave  = isset($_POST['nueva_clave']) ? trim($_POST['nueva_clave']) : '';

    if (empty($usuario) || empty($respuesta) || empty($nuevaClave)) {
        $mensajeError = 'Por favor, rellena todos los campos para verificar tu identidad.';
    } elseif (strlen($nuevaClave) < 4) {
        $mensajeError = 'La nueva clave debe tener al menos 4 caracteres.';
    } else {
        if (cambioContraseña($usuario, $respuesta, $nuevaClave)) {
            $mensajeExito = '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva clave.';
        } else {
            $mensajeError = 'El usuario no existe o la respuesta secreta no coincide con nuestros registros.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Clave - Atlantis Town</title>
    <link rel="stylesheet" href="../front/css/style.css?v=5">
    <link rel="icon" type="image/png" href="../front/img/web/ui/icon-inicio.png?v=3">
</head>
<body class="login-view-body">
    <!-- Fondo multimedia interactivo / video en bucle continuo -->
    <div class="login-video-bg-container" aria-hidden="true">
        <video class="login-video-bg" autoplay muted loop playsinline poster="../img/web/fondo-login-halloween.png">
            <source src="../img/juego/fondo_login.mp4" type="video/mp4">
            <source src="../img/web/fondo_login.mp4" type="video/mp4">
            <source src="../img/juego/fondo-login.mp4" type="video/mp4">
            <source src="../img/web/fondo-login.mp4" type="video/mp4">
        </video>
        <div class="login-video-overlay"></div>
    </div>

    <main class="login-page-container">
        <h1 class="login-spooky-title">RECUPERAR CLAVE</h1>

        <div class="wood-login-plaque" style="max-width: 580px;">
            <div class="plaque-header">VERIFICACIÓN DE IDENTIDAD</div>

            <?php if (!empty($mensajeError)): ?>
                <div class="alert-box alert-danger">
                    ⚠️ <?php echo htmlspecialchars($mensajeError, ENT_QUOTES, 'UTF-8'); ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($mensajeExito)): ?>
                <div class="alert-box alert-success">
                    ✨ <?php echo htmlspecialchars($mensajeExito, ENT_QUOTES, 'UTF-8'); ?>
                    <div style="margin-top: 10px;">
                        <a href="login.php" class="btn-plaque-action" style="display:inline-block; font-size:11px; padding:6px 12px;">Iniciar Sesión</a>
                    </div>
                </div>
            <?php else: ?>

            <form action="cambioPass.php" method="POST" autocomplete="off">
                <div class="login-form-group">
                    <label for="usuario" class="login-form-label">USUARIO</label>
                    <input
                        type="text"
                        id="usuario"
                        name="usuario"
                        class="login-form-input"
                        placeholder="Nombre de habitante"
                        required
                        value="<?php echo isset($_POST['usuario']) ? htmlspecialchars($_POST['usuario'], ENT_QUOTES, 'UTF-8') : ''; ?>"
                    >
                </div>

                <div class="login-form-group">
                    <label for="respuesta" class="login-form-label" style="font-size: 9px;">RESPUESTA A TU PREGUNTA SECRETA</label>
                    <input
                        type="text"
                        id="respuesta"
                        name="respuesta"
                        class="login-form-input"
                        placeholder="Tu respuesta secreta"
                        required
                    >
                </div>

                <div class="login-form-group">
                    <label for="nueva_clave" class="login-form-label">NUEVA CLAVE</label>
                    <input
                        type="password"
                        id="nueva_clave"
                        name="nueva_clave"
                        class="login-form-input"
                        placeholder="Escribe tu nueva clave"
                        required
                    >
                </div>

                <div class="login-buttons-row">
                    <button type="submit" class="btn-plaque-action">ACTUALIZAR</button>
                    <a href="login.php" class="btn-plaque-action">CANCELAR</a>
                </div>
            </form>

            <?php endif; ?>

            <div class="login-plaque-links" style="margin-top: 15px;">
                <a href="login.php">« Volver al Login</a>
                <a href="altaUsuario.php">Crear cuenta nueva »</a>
            </div>
        </div>
    </main>
</body>
</html>
