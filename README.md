# 🎃 GUÍA Y MANUAL DE USUARIO: ATLANTIS TOWN - EL RECETARIO PERDIDO

> **¡Bienvenido a Atlantis Town!** Este manual está redactado con cariño y en un lenguaje claro, sencillo y paso a paso para que cualquier persona (padres, abuelos o aventureros de cualquier edad) pueda disfrutar plenamente de la experiencia sin ninguna complicación técnica.

---

## 🚀 0. Cómo Arrancar la Web con Docker en 1 Clic

Si deseas poner en marcha toda la web y el juego en tu ordenador utilizando contenedores (Docker o Podman), es tan fácil como abrir tu terminal en la carpeta del proyecto y ejecutar:

```bash
./docker-start.sh
```

El script detectará automáticamente tu entorno, construirá el contenedor y levantará el servidor web Apache + PHP 8.2 en el puerto `8080`.

* 🌐 **Acceso web inmediato**: Abre en tu navegador [http://localhost:8080](http://localhost:8080) (te llevará directamente a la pantalla de Login).
* 🔑 **Cuentas de prueba ya creadas**:
  * **Usuario:** `rock` | **Contraseña:** `detective123`
  * **Usuario:** `bea` | **Contraseña:** `instituto123`
* 🛑 **Para apagar el servidor**: Ejecuta `./docker-stop.sh` en cualquier momento.

---

## 🗺️ 1. ¿De qué trata esta aventura?

En vísperas de la noche de **Halloween**, un extraño misterio sacude el apacible pueblo de **Atlantis Town**:
- **Bea**, la directora del instituto Atlántida, ha desaparecido misteriosamente.
- Junto a ella, ha desaparecido el legendario **Recetario Ancestral de Halloween**, custodiado durante generaciones.
- El detective privado **Rock** y el enigmático espíritu de **Jack Skellington** necesitarán tu ayuda e ingenio para resolver **10 acertijos lógicos**, desenmascarar una conspiración y recuperar las deliciosas recetas del pueblo.

---

## 🧭 2. ¿Cómo moverse por la página? (Navegación)

En todo momento verás a la izquierda un **panel de madera con botones grandes y claros**. Al pulsar sobre cualquiera de ellos entrarás directamente a esa sección:

1. **🏠 Inicio**:
   - Es la plaza mayor de la web.
   - Aquí verás una vista general de Atlantis Town, las noticias del pueblo y un botón dorado para comenzar la aventura.

2. **❓ El Recetario Perdido**:
   - Aquí se encuentra el **juego interactivo**.
   - Verás el libro mágico flotante y el botón **"JUGAR ▶"**. Al pulsarlo, comenzará la historia interactiva.

3. **📖 Recetario**:
   - Es la cocina del pueblo con **10 recetas temáticas de Halloween** (Sopa de calabaza, Pastel de bayas, Guiso de setas, etc.).
   - Al hacer **clic sobre cualquier plato**, se abrirá una ficha mágica que te mostrará los ingredientes exactos, el modo de preparación en casa y sus efectos reconstituyentes.
   - Las recetas destacadas con marco dorado y estrellas son las **Recetas Top** de la festividad.

4. **👤 Sobre mí**:
   - Conoce la historia de los personajes principales: la directora **Bea**, el detective **Rock** y el mismísimo **Jack Skellington**.
   - También encontrarás los agradecimientos y los roles del equipo de desarrollo.

---

## 🔑 3. Cómo Registrarse y Entrar (Login y Cuenta)

Para poder participar activamente y enviar cartas secretas a Jack Skellington, puedes identificarte como vecino del pueblo:

### A) Si es tu primera vez (Crear una cuenta):
1. En el menú de la izquierda o en la pantalla de bienvenida, pulsa en **"Iniciar Sesión / Registro"**.
2. En la placa de madera de acceso, pulsa abajo en el enlace: **"» Nuevo habitante (Registrarse)"**.
3. Rellena los datos sencillos:
   - **Usuario**: Tu apodo o nombre.
   - **Contraseña**: Una clave que recuerdes con facilidad.
   - **Email**: Tu dirección de correo electrónico.
   - **Pregunta secreta**: Responde a tu objeto mágico favorito (servirá para recuperar tu contraseña si la olvidas).
4. Pulsa el botón marrón **"REGISTRARSE"**. ¡Listo! Ya formas parte del censo de Atlantis Town.

### B) Iniciar sesión:
1. Introduce tu **Usuario** y **Contraseña**.
2. Pulsa el botón **"JUGAR"**.
3. Verás que en el menú izquierdo ahora aparece tu nombre con la marca verde de **Sesión Activa**.

### C) ¿Has olvidado la clave?:
1. Pulsa en **"¿Olvidaste la clave?"**.
2. Escribe tu usuario y la respuesta mágica que pusiste al registrarte.
3. Escribe tu nueva contraseña y pulsa **"ACTUALIZAR"**.

---

## 🎮 4. Cómo Jugar al Minijuego de los 10 Acertijos

1. Entra en la sección **"El Recetario Perdido"** y pulsa el botón grande dorado **"JUGAR ▶"**.
2. **Los Diálogos**:
   - Los personajes irán hablando en una caja de diálogo de estilo videojuego clásico (retro).
   - Para avanzar de frase, simplemente pulsa con el ratón en el botón naranja **"Siguiente ▶"** o presiona la **barra espaciadora** de tu teclado.
3. **Las Escenas y Fotografías**:
   - Durante la narración, el detective Rock te mostrará recuerdos y fotos del pueblo (el instituto de día, de noche, la taberna y el bosque).
4. **Los Desafíos (Acertijos)**:
   - En momentos clave, aparecerá una ventana con una pregunta de lógica y 4 opciones (A, B, C, D).
   - Lee con calma el enunciado y haz clic sobre la opción que creas correcta.
   - Si aciertas: sonará una fanfarria mágica, verás una explicación clara de la solución y podrás continuar la historia.
   - Si fallas: no te preocupes, el juego te invitará a intentarlo de nuevo sin penalización.
5. **Victoria Final**:
   - Al resolver los 10 retos, Jack Skellington te entregará el Recetario Perdido.
   - Se activará una celebración especial y **se desbloqueará el recetario completo** para siempre.

---

## ✉️ 5. Cómo Enviar una Pesadilla a Jack Skellington

Una vez que tengas tu sesión iniciada:
1. En el panel izquierdo, pulsa en el botón morado **"✉ Enviar Pesadillas"** (o accede a la sección de correspondencia).
2. Verás que tu correo electrónico se introduce de forma totalmente automática.
3. Escribe el **Asunto** de tu mensaje (por ejemplo: *"Feliz noche de brujas Jack"*).
4. Escribe tu **Mensaje** en el cuadro de texto.
5. Pulsa el botón verde **"🦇 Enviar Pesadilla"**.
6. Recibirás una confirmación inmediata de que tu misiva ha sido entregada al buzón del inframundo.

---

## ❓ Preguntas Frecuentes

- **¿Es obligatorio iniciar sesión para entrar a la web?**
  Sí, para preservar la seguridad de Atlantis Town en la Noche de Brujas, la puerta de entrada a la web es el panel de identificación (Login). Puedes usar las cuentas precargadas de bienvenida (Rock o Bea) o registrar a tu propio habitante en un instante.
- **¿Qué pasa si cierro el navegador en mitad de una receta?**
  Tu avance y el recetario desbloqueado se guardan en tu navegador, así que no perderás tu logro.

¡Esperamos que disfrutes de tu estancia en Atlantis Town y que pases un inolvidable Halloween! 🎃👻
