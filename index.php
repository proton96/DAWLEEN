<?php
/**
 * ==============================================================================
 * ENTRADA PRINCIPAL / ENRUTADOR RAÍZ
 * ==============================================================================
 *
 * El proyecto está estructurado modularmente en dos carpetas:
 * - /front: Capa cliente (DIW / DWEC) con HTML5, CSS3, JS Vanilla y Assets multimedia.
 * - /back:  Capa servidor (DWES / DAW) con PHP 8.x, sesiones y controladores.
 *
 * Conforme a la regla del proyecto ("El login debe ir antes de entrar a la web"),
 * esta raíz redirige automáticamente al módulo de autenticación: back/login.php.
 */

header('Location: back/login.php');
exit();
