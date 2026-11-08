<?php
/**
 * MÓDULO: FICHERO MODULAR DE VARIABLES Y FUNCIONES GLOBALES (VarGlobales.php)
 * ==============================================================================
 *
 * Este fichero gestiona:
 * 1. Inicialización de sesión PHP y almacenamiento en la matriz $_SESSION['mimatriz'].
 * 2. Población con usuarios base por defecto.
 * 3. Funciones del sistema: AltaUsuario, cambioContraseña, currentUser y redirect.
 */

// Reporte de errores limpio para producción educativa
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Iniciar sesión si aún no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Inicialización de la matriz de usuarios en sesión: $_SESSION['mimatriz']
 * Estructura de campos obligatorios por usuario:
 * - Usuario: string (identificador único)
 * - Contraseña: string (clave de acceso)
 * - Email: string (formato de correo válido)
 * - Perfil: string ('user' forzado)
 * - Pregunta: string (respuesta de seguridad para recuperación)
 * - UsuarioActual: bool / string (marca de sesión activa)
 */
if (!isset($_SESSION['mimatriz']) || !is_array($_SESSION['mimatriz']) || empty($_SESSION['mimatriz'])) {
    $_SESSION['mimatriz'] = [
        [
            'Usuario'       => 'rock',
            'Contraseña'    => 'detective123',
            'Email'         => 'rock.detective@atlantistown.dev',
            'Perfil'        => 'user',
            'Pregunta'      => 'sombrero',
            'UsuarioActual' => false
        ],
        [
            'Usuario'       => 'bea',
            'Contraseña'    => 'instituto123',
            'Email'         => 'bea.directora@atlantistown.dev',
            'Perfil'        => 'user',
            'Pregunta'      => 'recetario',
            'UsuarioActual' => false
        ],
        [
            'Usuario'       => 'jack',
            'Contraseña'    => 'halloween123',
            'Email'         => 'jack.skellington@atlantistown.dev',
            'Perfil'        => 'user',
            'Pregunta'      => 'pesadilla',
            'UsuarioActual' => false
        ],
        [
            'Usuario'       => 'admin',
            'Contraseña'    => 'admin123',
            'Email'         => 'protonstoreoficial@gmail.com',
            'Perfil'        => 'user',
            'Pregunta'      => 'calabaza',
            'UsuarioActual' => false
        ]
    ];
}

/**
 * Registra un nuevo usuario en $_SESSION
 *
 * @param array $nuevoUser Array asociativo con las claves requeridas
 * @return bool True si se dio de alta correctamente, False en caso contrario
 */
function AltaUsuario(array $nuevoUser): bool
{
    if (empty($nuevoUser['Usuario']) || empty($nuevoUser['Contraseña']) || empty($nuevoUser['Email'])) {
        return false;
    }

    // Comprobar si el nombre de usuario ya existe
    foreach ($_SESSION['mimatriz'] as $usuarioExistente) {
        if (strcasecmp($usuarioExistente['Usuario'], $nuevoUser['Usuario']) === 0) {
            // Usuario duplicado
            return false;
        }
    }

    // Asegurar estructura exacta y perfil forzado a 'user'
    $usuarioFormateado = [
        'Usuario'       => trim($nuevoUser['Usuario']),
        'Contraseña'    => trim($nuevoUser['Contraseña']),
        'Email'         => trim($nuevoUser['Email']),
        // Perfil forzado por especificación DWES
        'Perfil'        => 'user',
        'Pregunta'      => isset($nuevoUser['Pregunta']) ? trim($nuevoUser['Pregunta']) : '',
        'UsuarioActual' => false
    ];

    // Añadir al final de la matriz en sesión
    $_SESSION['mimatriz'][] = $usuarioFormateado;
    return true;
}

/**
 * Valida la identidad mediante pregunta de seguridad y actualiza la contraseña
 *
 * @param string $user Nombre de usuario
 * @param string $preguntaRespuesta Respuesta a la pregunta secreta
 * @param string $newPass Nueva clave a asignar
 * @return bool True si se actualizó con éxito, False si fallaron los datos
 */
function cambioContraseña(string $user, string $preguntaRespuesta, string $newPass): bool
{
    $user = trim($user);
    $preguntaRespuesta = trim($preguntaRespuesta);
    $newPass = trim($newPass);

    if (empty($user) || empty($preguntaRespuesta) || empty($newPass)) {
        return false;
    }

    foreach ($_SESSION['mimatriz'] as $indice => $datosUsuario) {
        if (strcasecmp($datosUsuario['Usuario'], $user) === 0) {
            // Comparar respuesta de seguridad y sin distinguir mayusculas
            if (strcasecmp(trim($datosUsuario['Pregunta']), $preguntaRespuesta) === 0) {
                $_SESSION['mimatriz'][$indice]['Contraseña'] = $newPass;

                // Sincronizar usuario activo si es el mismo
                if (isset($_SESSION['usuario_activo']) && strcasecmp($_SESSION['usuario_activo']['Usuario'], $user) === 0) {
                    $_SESSION['usuario_activo']['Contraseña'] = $newPass;
                }
                return true;
            }
            // Respuesta incorrecta
            return false;
        }
    }

    // Usuario no encontrado
    return false;
}

/**
 * Guarda los datos del usuario actualmente logueado en sesión
 *
 * @param string $user Nombre del usuario autenticado
 * @return bool True si el usuario fue localizado y activado
 */
function currentUser(string $user): bool
{
    $user = trim($user);

    foreach ($_SESSION['mimatriz'] as $indice => $datosUsuario) {
        if (strcasecmp($datosUsuario['Usuario'], $user) === 0) {
            // Desmarcar todos los demás usuarios
            foreach (array_keys($_SESSION['mimatriz']) as $k) {
                $_SESSION['mimatriz'][$k]['UsuarioActual'] = false;
            }

            // Marcar usuario actual
            $_SESSION['mimatriz'][$indice]['UsuarioActual'] = true;

            // Almacenar en la variable global de sesión para acceso rápido
            $_SESSION['usuario_activo'] = $_SESSION['mimatriz'][$indice];
            return true;
        }
    }

    return false;
}

/**
 * Maneja el redireccionamiento seguro con header() y die()
 *
 * @param string $url Dirección de destino
 * @return void
 */
function redirect(string $url): void
{
    header('Location: ' . $url);
    exit();
}

/**
 * Comprueba si hay una sesión de usuario activa
 *
 * @return bool
 */
function isUserLoggedIn(): bool
{
    return isset($_SESSION['usuario_activo']) && !empty($_SESSION['usuario_activo']['Usuario']);
}

/**
 * Devuelve el usuario activo o null
 *
 * @return array|null
 */
function getActiveUser(): ?array
{
    return isUserLoggedIn() ? $_SESSION['usuario_activo'] : null;
}
