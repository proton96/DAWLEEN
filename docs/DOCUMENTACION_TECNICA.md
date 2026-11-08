# Memoria Técnica del Proyecto: Dawlloween (Atlantis Town)

Documentación del proyecto correspondiente a los módulos de **DIW**, **DAW**, **DWEC** y **DWES**.

---

## 1. Diseño de Interfaces Web (DIW)

### 1.1. Estructura del proyecto y separación Front / Back
El proyecto se ha dividido en dos directorios principales para desacoplar la maquetación estática de la lógica de servidor:

* **`front/` (Cliente)**:
  * `index.html`: Portada del sitio con la temática visual principal.
  * `juego.html`: Contenedor del minijuego de acertijos.
  * `recetas.html`: Listado de recetas organizadas en tarjetas con ventanas modales para el detalle.
  * `aboutus.html`: Sección de presentación y créditos.
  * `proximamente.html`: Página informativa para secciones en construcción.
  * `css/style.css`: Hoja de estilos compartida por toda la aplicación.
  * `js/`: Scripts en JavaScript nativo (`juego.js` y `recetas.js`).
  * `img/`: Recursos gráficos (sprites, fondos e iconos pixel-art).
* **`back/` (Servidor)**:
  * `VarGlobales.php`: Control de sesión, persistencia temporal de usuarios y funciones auxiliares.
  * `login.php`: Formulario de acceso y comprobación de credenciales.
  * `altaUsuario.php`: Registro de usuarios (asigna rol `user` por defecto).
  * `cambioPass.php`: Formulario de recuperación de contraseña mediante pregunta secreta.
  * `correo.php`: Envío de correos mediante la función `mail()` de PHP.
  * `logout.php`: Destrucción de la sesión y redirección.
  * Vistas protegidas (`index.php`, `juego.php`, `recetas.php`, `aboutus.php`).

### 1.2. Árbol de directorios
```text
dawlloween/
├── index.php (redirige a back/login.php si no hay sesión)
├── .htaccess
├── back/
│   ├── VarGlobales.php
│   ├── login.php
│   ├── altaUsuario.php
│   ├── cambioPass.php
│   ├── index.php
│   ├── juego.php
│   ├── recetas.php
│   ├── aboutus.php
│   ├── correo.php
│   ├── logout.php
│   └── img -> ../front/img (enlace simbólico para compartir recursos)
├── front/
│   ├── index.html
│   ├── juego.html
│   ├── recetas.html
│   ├── aboutus.html
│   ├── proximamente.html
│   ├── css/
│   ├── js/
│   └── img/
├── apache/
│   └── halloween.dev.conf
└── docs/
```

### 1.3. Paleta de colores y variables CSS
Se han centralizado las variables de diseño en el `:root` de CSS para mantener una estética consistente orientada a juegos de rol retro/pixel-art:

```css
:root {
    --color-morado-oscuro: #160d24;
    --color-morado-medio: #28143f;
    --color-verde-toxico: #43c048;
    --color-verde-bosque: #1c3c24;
    --color-naranja-calabaza: #d96c14;
    --color-naranja-brillante: #ff8e24;
    --color-madera-oscura: #3a1e0b;
    --color-madera-media: #6a3b17;
    --color-madera-clara: #a3612a;
    --color-pergamino: #faecc8;
    --color-pergamino-oscuro: #dfc593;
    --color-pergamino-texto: #371a07;
    --color-negro-medianoche: #0b0914;
    --color-gris-medianoche: #1a1727;
    --color-dorado-top: #ffcc00;
    --color-dorado-borde: #c48a12;
}
```

### 1.4. Tipografías
* Títulos principales: `'Press Start 2P'` y `'Creepster'`.
* Contenido y textos generales: `'Montserrat'` e `'Inter'`.
* Diálogos de personajes: `'VT323'`.

### 1.5. Estilos de recetas destacadas
Las recetas destacadas (*Guiso de Setas* y *Galletas de Calabaza*) utilizan la clase `.top-recipe`, que añade un borde dorado con sombra, un fondo diferenciado y una etiqueta indicativa superior.

---

## 2. Despliegue de Aplicaciones Web (DAW)

### 2.1. Configuración de Apache (VirtualHost)
Fichero ubicado en `apache/halloween.dev.conf`:

```apache
<VirtualHost *:80>
    ServerName halloween.dev
    ServerAlias www.halloween.dev
    DocumentRoot /var/www/halloween

    <Directory /var/www/halloween>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
        DirectoryIndex index.php index.html
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/halloween_error.log
    CustomLog ${APACHE_LOG_DIR}/halloween_access.log combined
</VirtualHost>
```

### 2.2. Habilitación del sitio en Ubuntu/Debian
```bash
sudo cp apache/halloween.dev.conf /etc/apache2/sites-available/
sudo a2ensite halloween.dev.conf
sudo a2enmod rewrite
sudo systemctl reload apache2
```

### 2.3. Resolución de nombres en local
En el fichero `/etc/hosts` (o `C:\Windows\System32\drivers\etc\hosts` en Windows):
```text
127.0.0.1   halloween.dev www.halloween.dev atlantistown.dev
```

### 2.4. Permisos de carpetas y archivos
```bash
sudo chown -R www-data:www-data /var/www/halloween
find /var/www/halloween -type d -exec chmod 755 {} \;
find /var/www/halloween -type f -exec chmod 644 {} \;
```

### 2.5. Configuración del servicio de correo con Gmail
Para que la función `mail()` de PHP pueda enviar correos reales hacia cuentas externas, se utiliza una cuenta de correo con contraseña de aplicación conectada al servidor SMTP de Google (`smtp.gmail.com:587`).

#### En Linux / Docker mediante `msmtp`
Fichero `/etc/msmtprc`:
```ini
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /var/log/msmtp.log

account        gmail
host           smtp.gmail.com
port           587
from           protonstoreoficial@gmail.com
user           protonstoreoficial@gmail.com
password       aomywugitdfqahml

account default : gmail
```

Ajuste en `mail.ini` de PHP:
```ini
[mail function]
sendmail_path = "/usr/bin/msmtp -t -i"
```

#### En entorno local Windows (XAMPP `sendmail.ini`)
```ini
smtp_server=smtp.gmail.com
smtp_port=587
auth_username=protonstoreoficial@gmail.com
auth_password=aomywugitdfqahml
force_sender=protonstoreoficial@gmail.com
```

---

## 3. Desarrollo Web en Entorno Cliente (DWEC)

### 3.1. Lógica en JavaScript
* Se ha utilizado **Vanilla JS**, sin librerías externas ni dependencias añadidas.
* La lógica del juego se apoya en escuchadores de eventos estándar (`click`, `keydown`).
* Los diálogos muestran el texto con un retardo controlado caracter a caracter, permitiendo avanzar de golpe pulsando la barra espaciadora.

### 3.2. Efectos de sonido con Web Audio API
Los efectos sonoros del minijuego se generan mediante la API nativa `AudioContext` en `js/juego.js`, sin necesidad de cargar ficheros de audio externos:
* Onda cuadrada para pulsaciones de interfaz.
* Onda triangular para los aciertos.
* Onda de diente de sierra con frecuencia baja para los errores.

### 3.3. Banco de preguntas y lógica de validación
El juego carga los 10 acertijos definidos en los requisitos:
1. Las velas y el viento.
2. El número de hermanos.
3. El ascensor del rascacielos.
4. El cruce del río con peso límite.
5. El ladrillo en la balanza.
6. El problema de selección de Wason.
7. La toma de píldoras del náufrago.
8. La medición con relojes de arena.
9. Los tres interruptores y la bombilla.
10. La división del botín pirata.

Al responder cada pregunta, se comprueba la solución en cliente y se muestra una explicación del resultado antes de dar paso a la siguiente fase.

---

## 4. Desarrollo Web en Entorno Servidor (DWES)

### 4.1. Control de accesos y sesiones
* **Restricción de vistas**: Si un usuario entra a `index.php`, `recetas.php`, `aboutus.php`, `juego.php` o `correo.php` sin haber iniciado sesión, la función `isUserLoggedIn()` lo redirige automáticamente a `login.php`.
* **Inicialización**: Cada archivo del backend incluye `VarGlobales.php`, donde se comprueba el estado de la sesión y se llama a `session_start()`.
* **Almacenamiento de usuarios en sesión**: Como no se usa base de datos relacional para esta práctica, los usuarios se gestionan en una matriz en `$_SESSION['mimatriz']`:

```php
[
    'Usuario'       => 'rock',
    'Contraseña'    => 'detective123',
    'Email'         => 'rock.detective@atlantistown.dev',
    'Perfil'        => 'user',
    'Pregunta'      => 'sombrero',
    'UsuarioActual' => false
]
```

### 4.2. Funciones de `VarGlobales.php`
* `AltaUsuario($nuevoUser)`: Comprueba que el nombre no esté en uso, sanea los valores recibidos, asigna el rol `user` y agrega el nuevo elemento al array de sesión.
* `cambioContraseña($user, $preguntaRespuesta, $newPass)`: Valida usuario y respuesta de recuperación de forma insensible a mayúsculas/minúsculas. Si coinciden, actualiza la clave en la matriz y en la variable de usuario activo.
* `currentUser($user)`: Marca en la matriz qué usuario ha iniciado sesión y guarda sus datos en `$_SESSION['usuario_activo']`.
* `redirect($url)`: Envía la cabecera `Location` y corta la ejecución del script con `exit()`.

### 4.3. Envío de correos (`correo.php`)
* Si no hay sesión válida, se bloquea la ejecución y se envía al usuario a `login.php`.
* La cabecera `From:` se monta a partir de los datos del usuario conectado en ese momento:
```php
$emailRemitente = $_SESSION['usuario_activo']['Email'];
$cabeceras = "From: " . $_SESSION['usuario_activo']['Usuario'] . " <" . $emailRemitente . ">\r\n";
```
* El envío se realiza con la función nativa `mail()`.

### 4.4. Buenas prácticas y seguridad
* Compatibilidad con PHP 8.x con reporte `E_ALL` sin avisos de variables sin definir.
* Saneamiento de salidas en el HTML mediante `htmlspecialchars()` para prevenir inyecciones XSS.
* Indentación consistente a 4 espacios en todo el código fuente.

---

## 5. Entorno de Desarrollo y Despliegue con Docker

### 5.1. Configuración del contenedor
* **Imagen base**: `php:8.2-apache`.
* **Módulos habilitados**: `rewrite`, `headers` y `expires`.
* **Apache**:
  * Directiva `FollowSymLinks` activa para permitir el enlace simbólico entre las carpetas de imágenes de front y back.
  * `AllowOverride All` para procesar el `.htaccess`.
* **Mapeo de puertos**: Se expone el puerto `8080:80` para evitar conflictos si el equipo anfitrión ya tiene otro Apache corriendo en el 80.
* **Montaje**: `./:/var/www/html` para reflejar cambios en caliente durante el desarrollo.

### 5.2. Ficheros del entorno
* `Dockerfile`: Instalación de paquetes del sistema (`msmtp`, certificados) y módulos de PHP.
* `docker-compose.yml`: Definición del servicio y volúmenes de trabajo.
* `.dockerignore`: Exclusión de ficheros temporales y documentación.
* `docker-start.sh` y `docker-stop.sh`: Scripts bash para levantar y parar el contenedor cómodamente tanto con Docker como con Podman.