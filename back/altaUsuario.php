<?php
/**
 * MÓDULO: REGISTRO DE NUEVO USUARIO (altaUsuario.php)
 * ==============================================================================
 *
 * Formulario POST con:
 * - Usuario (único y obligatorio)
 * - Contraseña (obligatorio)
 * - Email (obligatorio, formato email válido)
 * - Perfil: forzado automáticamente a 'user'
 * - Pregunta / Respuesta de seguridad
 * Valida los datos y ejecuta la función AltaUsuario().
 */

require_once __DIR__ . '/VarGlobales.php';

$mensajeError = '';
$mensajeExito = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario    = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
    $contrasena = isset($_POST['contrasena']) ? trim($_POST['contrasena']) : '';
    $email      = isset($_POST['email']) ? trim($_POST['email']) : '';
    $pregunta   = isset($_POST['pregunta']) ? trim($_POST['pregunta']) : '';
    // Forzado a 'user'
    $perfil     = 'user';

    // Validaciones
    if (empty($usuario) || empty($contrasena) || empty($email) || empty($pregunta)) {
        $mensajeError = 'Todos los campos son estrictamente obligatorios.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mensajeError = 'El formato del correo electrónico no es válido.';
    } elseif (strlen($usuario) < 3) {
        $mensajeError = 'El nombre de usuario debe contener al menos 3 caracteres.';
    } else {
        $nuevoUsuario = [
            'Usuario'       => $usuario,
            'Contraseña'    => $contrasena,
            'Email'         => $email,
            'Perfil'        => $perfil,
            'Pregunta'      => $pregunta,
            'UsuarioActual' => false
        ];

        if (AltaUsuario($nuevoUsuario)) {
            $mensajeExito = '¡Habitante registrado con éxito en Atlantis Town!';
        } else {
            $mensajeError = 'El nombre de usuario "' . htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8') . '" ya está en uso.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Habitante - Atlantis Town</title>
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
        <h1 class="login-spooky-title">NUEVO HABITANTE</h1>

        <div class="wood-login-plaque" style="max-width: 580px;">
            <div class="plaque-header">REGISTRO EN EL CENSO</div>

            <?php if (!empty($mensajeError)): ?>
                <div class="alert-box alert-danger">
                    ⚠️ <?php echo htmlspecialchars($mensajeError, ENT_QUOTES, 'UTF-8'); ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($mensajeExito)): ?>
                <div class="alert-box alert-success">
                    🎃 <?php echo htmlspecialchars($mensajeExito, ENT_QUOTES, 'UTF-8'); ?>
                    <div style="margin-top: 10px;">
                        <a href="login.php" class="btn-plaque-action" style="display:inline-block; font-size:11px; padding:6px 12px;">Iniciar Sesión ahora</a>
                    </div>
                </div>
            <?php else: ?>

            <form action="altaUsuario.php" method="POST" autocomplete="off">
                <div class="login-form-group">
                    <label for="usuario" class="login-form-label">USUARIO</label>
                    <input
                        type="text"
                        id="usuario"
                        name="usuario"
                        class="login-form-input"
                        placeholder="Ej. cazador99"
                        required
                        value="<?php echo isset($_POST['usuario']) ? htmlspecialchars($_POST['usuario'], ENT_QUOTES, 'UTF-8') : ''; ?>"
                    >
                </div>

                <div class="login-form-group">
                    <label for="contrasena" class="login-form-label">CONTRASEÑA</label>
                    <input
                        type="password"
                        id="contrasena"
                        name="contrasena"
                        class="login-form-input"
                        placeholder="Tu clave secreta"
                        required
                    >
                </div>

                <div class="login-form-group">
                    <label for="email" class="login-form-label">EMAIL</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        class="login-form-input"
                        placeholder="habitante@atlantistown.dev"
                        required
                        value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email'], ENT_QUOTES, 'UTF-8') : ''; ?>"
                    >
                </div>

                <!-- Campo perfil inyectado automáticamente y no se puede editar -->
                <div class="login-form-group">
                    <label for="perfil" class="login-form-label">PERFIL</label>
                    <input
                        type="text"
                        id="perfil"
                        name="perfil_visual"
                        class="login-form-input"
                        value="user (rol estándar)"
                        readonly
                    >
                </div>

                <div class="login-form-group">
                    <label for="pregunta" class="login-form-label" style="font-size: 9px;">PREGUNTA SECRETA: ¿Tu objeto mágico favorito?</label>
                    <input
                        type="text"
                        id="pregunta"
                        name="pregunta"
                        class="login-form-input"
                        placeholder="Respuesta para recuperar clave"
                        required
                        value="<?php echo isset($_POST['pregunta']) ? htmlspecialchars($_POST['pregunta'], ENT_QUOTES, 'UTF-8') : ''; ?>"
                    >
                </div>

                <div class="login-buttons-row">
                    <button type="submit" class="btn-plaque-action">REGISTRARSE</button>
                    <a href="login.php" class="btn-plaque-action">VOLVER</a>
                </div>
            </form>

            <?php endif; ?>

            <div class="login-plaque-links" style="justify-content: center; margin-top: 15px;">
                <a href="login.php">¿Ya tienes cuenta? Inicia sesión aquí</a>
            </div>
        </div>
    </main>
</body>
</html>
