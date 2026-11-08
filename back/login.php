<?php
/**
 * MÓDULO: AUTENTICACIÓN DE USUARIOS (login.php)
 * ==============================================================================
 *
 * Formulario POST con Usuario y Contraseña.
 * Si las credenciales coinciden, invoca currentUser() y redirige al inicio.
 * Si fallan, muestra un mensaje descriptivo de error integrado en la placa.
 */

require_once __DIR__ . '/VarGlobales.php';

// Si ya está logueado, redirigir al index
if (isUserLoggedIn()) {
    redirect('index.php');
}

$mensajeError = '';

// Procesar el formulario POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
    $contraseña = isset($_POST['contrasena']) ? trim($_POST['contrasena']) : '';

    if (empty($usuario) || empty($contraseña)) {
        $mensajeError = 'Debes ingresar tanto el usuario como la contraseña.';
    } else {
        $autenticado = false;
        foreach ($_SESSION['mimatriz'] as $userRegistrado) {
            if (
                strcasecmp($userRegistrado['Usuario'], $usuario) === 0 &&
                $userRegistrado['Contraseña'] === $contraseña
            ) {
                $autenticado = true;
                break;
            }
        }

        if ($autenticado) {
            currentUser($usuario);
            // Sincronizar usuario en sesión del navegador y redirigir
            echo "<!DOCTYPE html><html><head><script>sessionStorage.setItem('usuario_activo', " . json_encode($usuario) . "); window.location.href = 'index.php';</script></head><body></body></html>";
            exit();
        } else {
            $mensajeError = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Atlantis Town | Halloween</title>
    <link rel="stylesheet" href="../front/css/style.css?v=5">
    <link rel="icon" type="image/png" href="../front/img/web/ui/icon-inicio.png?v=3">
</head>
<body class="login-view-body">
    <!-- Fondo multimedia interactivo video en bucle continuo  -->
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
        <!-- Logo temático oficial de Atlantis Town para Login (sin fondo con animación de rebote) -->
        <div class="login-logo-container">
            <h1 class="login-logo-heading">
                <img src="../img/juego/logo-login.png?v=2" alt="Atlantis Town" class="login-logo-img" onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='../front/img/juego/logo-login.png?v=2';}">
            </h1>
            <span class="visually-hidden">ATLANTIS TOWN</span>
        </div>

        <!-- Placa de madera central  -->
        <div class="wood-login-plaque">
            <div class="plaque-header">LOGIN</div>

            <?php if (!empty($mensajeError)): ?>
                <div class="alert-box alert-danger">
                    ⚠️ <?php echo htmlspecialchars($mensajeError, ENT_QUOTES, 'UTF-8'); ?>
                </div>
            <?php endif; ?>

            <form action="login.php" method="POST" autocomplete="off">
                <div class="login-form-group">
                    <label for="usuario" class="login-form-label">USUARIO</label>
                    <input
                        type="text"
                        id="usuario"
                        name="usuario"
                        class="login-form-input"
                        required
                        autofocus
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
                        required
                    >
                </div>

                <!-- Botones JUGAR y SALIR -->
                <div class="login-buttons-row">
                    <button type="submit" class="btn-plaque-action">JUGAR</button>
                    <a href="../front/proximamente.html" class="btn-plaque-action">SALIR</a>
                </div>
            </form>

            <!-- Enlaces a altaUsuario.php y cambioPass.php según especificación DWES -->
            <div class="login-plaque-links">
                <a href="altaUsuario.php">» Nuevo habitante (Registrarse)</a>
                <a href="cambioPass.php">» ¿Olvidaste la clave?</a>
            </div>
        </div>

        <div style="margin-top: 20px; font-family: var(--font-pixel); font-size: 8px; color: #f3cf9a; text-shadow: 1px 1px 2px #000; text-align: center;">
            Usuarios demo: <strong>rock</strong> (clave: <em>detective123</em>) | <strong>bea</strong> (clave: <em>instituto123</em>)
        </div>
    </main>
</body>
</html>
