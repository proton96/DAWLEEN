<?php
/**
 * MÓDULO: CIERRE DE SESIÓN (logout.php)
 * ==============================================================================
 */

require_once __DIR__ . '/VarGlobales.php';

// Desmarcar UsuarioActual en la matriz de sesión si existe
if (isset($_SESSION['usuario_activo']) && isset($_SESSION['mimatriz'])) {
    foreach ($_SESSION['mimatriz'] as $k => $u) {
        $_SESSION['mimatriz'][$k]['UsuarioActual'] = false;
    }
}

// Eliminar datos de usuario activo
unset($_SESSION['usuario_activo']);

// Limpiar sesión en navegador y redirigir al login
echo "<!DOCTYPE html><html><head><script>sessionStorage.removeItem('usuario_activo'); window.location.href = 'login.php';</script></head><body></body></html>";
exit();
