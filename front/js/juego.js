/**
 * ==============================================================================
 * MÓDULO : MOTOR DEL MINIJUEGO "EL RECETARIO PERDIDO" (juego.js)
 * ==============================================================================
 *
 * Desarrollado en Vanilla JavaScript según rúbrica DWEC:
 * - Manipulación avanzada del DOM en tiempo real sin recarga de página.
 * - Flujo narrativo completo de HISTORIA.txt y los 10 acertijos de acertijos.txt.
 * - Efectos de sonido retro 8-bit sintetizados con Web Audio API nativo y seguro.
 * - Sistema de desbloqueo sincronizado con localStorage.
 * - Navegación intuitiva por click en cuadro de diálogo, botón o teclado (Espacio/Enter).
 */

// -----------------------------------------------------------------------------
// SINTETIZADOR DE AUDIO RETRO 8-BIT (Web Audio API nativo)
// -----------------------------------------------------------------------------
const RetroAudio = {
    ctx: null,

    init() {
        if (!this.ctx) {
            try {
                const AudioContext = window.AudioContext || window['webkitAudioContext'];
                if (AudioContext) {
                    this.ctx = new AudioContext();
                }
            } catch (e) {
                // Audio no disponible
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    },

    playTone(freq, type, duration, delay = 0) {
        try {
            this.init();
            if (!this.ctx) return;
            setTimeout(() => {
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                } catch (err) {
                    // Ignorar errores de audio en navegadores con políticas estrictas
                }
            }, delay * 1000);
        } catch (e) {}
    },

    click() {
        this.playTone(320, 'square', 0.05);
    },

    correct() {
        this.playTone(523.25, 'triangle', 0.1, 0);     // C5
        this.playTone(659.25, 'triangle', 0.1, 0.08);  // E5
        this.playTone(783.99, 'triangle', 0.2, 0.16);  // G5
        this.playTone(1046.50, 'triangle', 0.35, 0.24);// C6
    },

    wrong() {
        this.playTone(180, 'sawtooth', 0.15, 0);
        this.playTone(130, 'sawtooth', 0.22, 0.1);
    },

    mystery() {
        this.playTone(220, 'sine', 0.25, 0);
        this.playTone(277.18, 'sine', 0.35, 0.15);
    }
};

// -----------------------------------------------------------------------------
// BASE DE DATOS DE LOS 10 ACERTIJOS (acertijos.txt)
// -----------------------------------------------------------------------------
const ACERTIJOS_DATA = {
    1: {
        titulo: "1. LAS VELAS Y EL VIENTO",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-1.jpeg",
        enunciado: "Tienes una mesa con 10 velas encendidas. Entra una fuerte ráfaga de aire por la ventana y apaga 2 velas. Un rato después, otra ráfaga apaga una vela más. Para evitar que se sigan apagando, cierras la ventana. Si ninguna otra vela se apaga por el viento, ¿cuántas velas te quedarán al final del día?",
        opciones: [
            { letra: "A", texto: "Ninguna vela, con el paso de las horas se consumen todas." },
            { letra: "B", texto: "7 velas." },
            { letra: "C", texto: "3 velas." },
            { letra: "D", texto: "10 velas." }
        ],
        correcta: "C",
        explicacion: "¡Correcto! Las 7 velas que permanecieron encendidas continuarán ardiendo hasta consumirse por completo y desaparecer. Las únicas que se conservarán intactas al final del día son las 3 que se apagaron a tiempo."
    },
    2: {
        titulo: "2. EL MISTERIO DEL NÚMERO DE HERMANOS",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-2.jpeg",
        enunciado: "En una familia particular, cada hijo varón tiene exactamente el mismo número de hermanos que de hermanas. Sin embargo, cada una de las hijas tiene el doble de hermanos que de hermanas. ¿Cuántos chicos y cuántas chicas componen los hijos de esta familia?",
        opciones: [
            { letra: "A", texto: "3 chicos y 2 chicas." },
            { letra: "B", texto: "4 chicos y 3 chicas." },
            { letra: "C", texto: "4 chicos y 2 chicas." },
            { letra: "D", texto: "5 chicos y 3 chicas." }
        ],
        correcta: "B",
        explicacion: "¡Exacto! Hay 4 chicos y 3 chicas en total: Cada hijo varón tiene 3 hermanos varones y 3 hermanas mujeres (mismo número). Cada hija mujer tiene 2 hermanas y 4 hermanos (el doble)."
    },
    3: {
        titulo: "3. EL ASCENSOR DEL RASCACIELOS",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-3.jpeg",
        enunciado: "Un hombre vive en el piso 17 de un rascacielos. Cada mañana toma el ascensor en el piso 17 y baja directo hasta la planta baja para ir a trabajar. Cuando regresa por la tarde, entra al ascensor en la planta baja, pulsa el botón del piso 9 y sube a pie los 8 pisos restantes por las escaleras hasta su casa... excepto en dos situaciones: cuando llueve o cuando va acompañado de otros vecinos en el ascensor, casos en los que sube directamente hasta el piso 17. ¿Por qué lo hace?",
        opciones: [
            { letra: "A", texto: "Realiza ejercicio diario por prescripción médica, salvo si está mojado o acompañado." },
            { letra: "B", texto: "El ascensor requiere una llave especial por encima del piso 9 que solo llevan los vecinos." },
            { letra: "C", texto: "Es una persona de baja estatura que no alcanza botones más altos que el piso 9; en días de lluvia usa su paraguas y si va acompañado pide ayuda." },
            { letra: "D", texto: "Es supersticioso con los pisos de dos dígitos cuando viaja en soledad." }
        ],
        correcta: "C",
        explicacion: "¡Brillante deducción! El hombre tiene una limitación de alcance por su baja estatura física. Solo llega con su brazo hasta el botón del piso 9. Cuando llueve lleva paraguas y usa la punta para pulsar el 17, o pide ayuda si va acompañado."
    },
    4: {
        titulo: "4. EL CRUCE DEL RÍO CON PESOS LÍMITE",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-4.jpeg",
        enunciado: "Dos adultos y dos niños necesitan cruzar un río caudaloso en una pequeña barca de remos. La barca solo soporta un peso máximo de 100 kg. Cada adulto pesa exactamente 100 kg y cada niño pesa exactamente 50 kg. ¿Cuál es el número mínimo de viajes que debe realizar la barca de una orilla a la otra para que todos crucen con éxito?",
        opciones: [
            { letra: "A", texto: "5 viajes." },
            { letra: "B", texto: "7 viajes." },
            { letra: "C", texto: "9 viajes." },
            { letra: "D", texto: "11 viajes." }
        ],
        correcta: "C",
        explicacion: "¡Impecable! Se requieren 9 trayectos: 1) Cruzan los 2 niños (100 kg). 2) Regresa 1 niño. 3) Cruza 1 adulto (100 kg). 4) Regresa el otro niño. 5) Cruzan los 2 niños. 6) Regresa 1 niño. 7) Cruza el 2º adulto (100 kg). 8) Regresa el otro niño. 9) Cruzan ambos niños juntos por última vez."
    },
    5: {
        titulo: "5. EL LADRILLO EN LA BALANZA",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-5.jpeg",
        enunciado: "Un ladrillo de construcción estándar pesa exactamente 1 kilogramo más medio ladrillo. ¿Cuánto pesan tres ladrillos iguales?",
        opciones: [
            { letra: "A", texto: "3 kilogramos." },
            { letra: "B", texto: "4.5 kilogramos." },
            { letra: "C", texto: "6 kilogramos." },
            { letra: "D", texto: "9 kilogramos." }
        ],
        correcta: "C",
        explicacion: "¡Perfecto! Ecuación: 1 Ladrillo = 1 kg + 0.5 Ladrillos => Restando medio ladrillo: 0.5 Ladrillos = 1 kg => 1 Ladrillo entero = 2 kg. Tres ladrillos pesan: 3 × 2 kg = 6 kg."
    },
    6: {
        titulo: "6. LAS CUATRO CARTAS LÓGICAS (PROBLEMA DE WASON)",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-6.jpeg",
        enunciado: "Delante de ti hay cuatro cartas sobre la mesa: muestran respectivamente A, B, 4 y 7. Se afirma la siguiente regla: 'Si una carta tiene una vocal en una cara, entonces tiene un número par en la otra cara'. ¿Cuáles son las cartas mínimas y exactas que debes voltear para comprobar sin ninguna duda si la regla es verdadera o falsa?",
        opciones: [
            { letra: "A", texto: "Únicamente la carta 'A'." },
            { letra: "B", texto: "La carta 'A' y la carta '4'." },
            { letra: "C", texto: "La carta 'A' y la carta '7'." },
            { letra: "D", texto: "Las cuatro cartas ('A', 'B', '4' y '7')." }
        ],
        correcta: "C",
        explicacion: "¡Magnífica lógica! La carta 'A' (vocal) debe comprobarse para verificar si detrás tiene un número par. La carta '7' (impar) debe voltearse para confirmar que NO tenga una vocal. El resto no aporta información decisiva."
    },
    7: {
        titulo: "7. LA PÍLDORA DEL NÁUFRAGO",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-7.jpeg",
        enunciado: "Un náufrago ciego tiene en su poder cuatro pastillas idénticas en tamaño, forma, peso y textura: dos son de la medicina vital A y dos son de la medicina vital B. Para sobrevivir, debe tomar exactamente una pastilla A y una pastilla B hoy, y el resto mañana. Si toma una dosis incorrecta, morirá al instante. Al no poder ver los colores, ¿cómo puede tomar la dosis exacta hoy y mañana?",
        opciones: [
            { letra: "A", texto: "Triturar las cuatro pastillas juntas en un vaso con agua marina y beber la mitad hoy y la mitad mañana." },
            { letra: "B", texto: "Partir cada una de las cuatro pastillas exactamente por la mitad, tomando una mitad de cada pastilla hoy y la otra mitad de cada una mañana." },
            { letra: "C", texto: "Ingerir dos pastillas al azar hoy confiando en la probabilidad y esperar los efectos secundarios." },
            { letra: "D", texto: "Medir la solubilidad en agua gota a gota para diferenciarlas antes de consumirlas." }
        ],
        correcta: "B",
        explicacion: "¡Acertado! Al partir las 4 pastillas por la mitad y tomar media mitad de cada una hoy, consume: (0.5+0.5) de A y (0.5+0.5) de B, lo que suma exactamente una pastilla A entera y una pastilla B entera cada día."
    },
    8: {
        titulo: "8. EL RELOJ DE ARENA Y EL TIEMPO JUSTO",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-8.jpeg",
        enunciado: "Tienes únicamente dos relojes de arena: uno mide exactamente 7 minutos y el otro mide exactamente 4 minutos. Necesitas medir un intervalo exacto de 9 minutos para preparar una pócima sin cometer el menor fallo de tiempo. ¿Cómo lo logras con el menor número de pasos?",
        opciones: [
            { letra: "A", texto: "Iniciar el de 7 min, y cuando acabe poner el de 4 min deteniéndolo a ojo en la mitad." },
            { letra: "B", texto: "Poner el reloj de 7 min dos veces consecutivas y restar una vuelta del de 4 min." },
            { letra: "C", texto: "Iniciar ambos a la vez. Al vaciarse el de 4 min, voltearlo de inmediato. Al vaciarse el de 7 min (queda 1 min en el de 4), se inicia la pócima dejando caer ese 1 min y volteando el de 4 dos veces completas (1 + 4 + 4 = 9 min exactos)." },
            { letra: "D", texto: "Voltear el reloj de 4 min dos veces seguidas y calcular un cuarto del reloj de 7 min." }
        ],
        correcta: "C",
        explicacion: "¡Precisión matemática absoluta! Al minuto 7, al reloj de 4 min le queda exactamente 1 min arriba. En ese momento se inicia la cocción: 1 min residual + dos tandas de 4 min (4 + 4) = 9 minutos exactos."
    },
    9: {
        titulo: "9. LOS TRES INTERRUPTORES Y LA BOMBILLA",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-9.jpeg",
        enunciado: "Te encuentras en la planta baja frente a un panel con tres interruptores normales (marcados como 1, 2 y 3), todos en posición de apagado. En el ático del edificio hay una única bombilla incandescente tradicional conectada a uno de esos tres interruptores. Desde donde estás es imposible ver si la luz está encendida o no. Tienes permiso de subir al ático una única vez. ¿Cómo averiguas con certeza cuál es el interruptor que controla la bombilla?",
        opciones: [
            { letra: "A", texto: "Encender el interruptor 1 y el 2 juntos; si no enciende la luz en el ático, deducir que es el 3." },
            { letra: "B", texto: "Encender el interruptor 1 durante 10 minutos, apagarlo, encender de inmediato el 2 y subir al ático: si está encendida es el 2; si está apagada pero caliente es el 1; si está apagada y fría es el 3." },
            { letra: "C", texto: "Encender el interruptor 2, subir a verificar, y si está apagada bajar a pulsar el 1." },
            { letra: "D", texto: "Dejar los tres interruptores a medio pulsar y comprobar si emiten chispas en la caja de fusibles." }
        ],
        correcta: "B",
        explicacion: "¡Fabuloso pensamiento lateral! Las bombillas incandescentes generan calor residual. Este calor permite almacenar un segundo estado físico distinguible, permitiendo evaluar las 3 posibilidades en un solo viaje."
    },
    10: {
        titulo: "10. LA DIVISIÓN DEL TESORO PIRATA",
        imagenFondo: "img/juego/ACERTIJOS/acertijo-10.jpeg",
        enunciado: "Tres caballeros encuentran un cofre con monedas de oro en una cueva. Llegan al acuerdo de repartirlo a partes iguales al día siguiente y se van a dormir. A medianoche el 1º se despierta desconfiado: divide en 3 pilas iguales, sobra 1 moneda que tira al mar y se lleva su tercio. Más tarde el 2º hace lo mismo sin saber lo del primero: divide en 3, sobra 1 que tira al mar y se lleva su tercio. Finalmente el 3º antes del amanecer divide en 3 lo que queda, sobra 1 moneda que arroja al mar y se lleva su tercio. ¿Cuál es el número mínimo positivo de monedas de oro que debía contener el cofre originalmente?",
        opciones: [
            { letra: "A", texto: "19 monedas." },
            { letra: "B", texto: "22 monedas." },
            { letra: "C", texto: "25 monedas." },
            { letra: "D", texto: "31 monedas." }
        ],
        correcta: "C",
        explicacion: "¡Victoria total! Con 25 monedas: 1º tira 1 (24), toma 8 y quedan 16. 2º tira 1 (15), toma 5 y quedan 10. 3º tira 1 (9), toma 3 y quedan 6. En cada paso el número sobrante tras tirar una moneda es entero y múltiplo de 3."
    }
};

// -----------------------------------------------------------------------------
// SECUENCIA NARRATIVA COMPLETA (HISTORIA.txt)
// -----------------------------------------------------------------------------
const STORY_NODES = [
    // 0: Bienvenida inicial
    {
        type: 'intro_screen',
        bg: 'img/juego/bienvenida-juego.jpeg'
    },
    // 1: Introducción Rock - AtlantisTown
    {
        type: 'dialogue',
        bg: 'img/juego/atlantistown.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: '¡Hola! Te doy la bienvenida a AtlantisTown. Debe haber sido un viaje duro, hacía mal tiempo anoche. Me he tomado la molestia de conseguir la información del caso antes de tu llegada.'
    },
    // 2: Introducción Rock - Instituto de día
    {
        type: 'dialogue',
        bg: 'img/juego/instituto-dia.png',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Resulta que Bea, la directora del instituto Atlántida, ha desaparecido esta semana; lleva 4 días perdida. He estado investigando en el instituto donde trabaja ella. Resulta abrumador, el edificio se ve perfecto y tranquilo...'
    },
    // 3: Introducción Rock - Instituto de noche y recetario
    {
        type: 'dialogue',
        bg: 'img/juego/instituto-noche.png',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Mañana es la noche de Halloween y Bea tiene un recetario de un antepasado que lleva custodiando años. Anoche dejaron el instituto preparado con la temática de Halloween... pero falta lo más importante: ¡el Recetario Ancestral!'
    },
    // 4: Introducción Rock - Nota del enmascarado
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/rock-inicio.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Me encontré con un curioso enmascarado que cuando corrí tras él, me dejó una dirección y una hora exacta. Intuyo que quiere vernos en la Taberna... ¡Vamos a comenzar por eso!'
    },
    // 5: Taberna - Encuentro con Enigma
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-cabreado.png',
        text: '¡Eres el de anoche! Cogí tu nota. Intuyo que sabes algo de la desaparición de Bea y la relación con la desaparición del recetario.'
    },
    // 6: Taberna - Enigma propone reto
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
        speaker: 'Enigma',
        sprite: 'img/juego/sprites/enigma.png',
        text: 'Así es, pero no es tan sencillo. Para poder darte la información, vas a tener que pasar dos retos. Si aceptas, te diré quién tiene a la chica y el recetario perdido.'
    },
    // 7: Taberna - Rock sorprendido
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-sorprendido.png',
        text: '¿No lo estarás diciendo en serio? ¿Y por qué crees que voy a acceder a eso?'
    },
    // 8: Taberna - Enigma insiste
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
        speaker: 'Enigma',
        sprite: 'img/juego/sprites/enigma.png',
        text: 'Porque me necesitas... soy la única persona que puede ayudarte.'
    },
    // 9: Taberna - Rock acepta
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'De acuerdo, no te preocupes que no hay acertijo que se me resista. ¡Venga ese primer reto!'
    },
    // 10: ACERTIJO 1
    { type: 'riddle', riddleId: 1 },
    // 11: ACERTIJO 2
    { type: 'riddle', riddleId: 2 },
    // 12: Enigma revela la pista del bosque
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
        speaker: 'Enigma',
        sprite: 'img/juego/sprites/enigma.png',
        text: 'Me has demostrado que eres capaz de hacerle cara... está bien. A quien buscáis se encuentra en la profundidad del bosque de AtlantisTown. Debéis ir cuando caiga la noche.'
    },
    // 13: Rock hacia el bosque
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Gracias. Conseguiremos resolver este misterio. ¡Nos adentramos en el bosque de inmediato!'
    },
    // 14: Bosque Atlantis - Encuentro Monstruo
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-monstruoyrock.jpeg',
        speaker: 'Monstruo Spirit',
        sprite: 'img/juego/sprites/monstruo-normal.png',
        text: 'Os esperaba con entusiasmo. Enigma cree que sois capaces de superar la prueba, pero tengo la certeza de que no tendréis la astucia suficiente.'
    },
    // 15: Rock cuestiona
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-monstruoyrock.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-cabreado.png',
        text: '¿Qué eres exactamente? ¿Has mencionado a Enigma? Seguro que te refieres al personaje misterioso de la taberna.'
    },
    // 16: Monstruo risa
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-monstruoyrock.jpeg',
        speaker: 'Monstruo Spirit',
        sprite: 'img/juego/sprites/monstruo-risa.png',
        text: '¡WAJAJA! Así es, parece que tienes astucia después de todo.'
    },
    // 17: Rock exige liberación
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-monstruoyrock.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-cabreado.png',
        text: 'No me voy a andar con rodeos, ¿dónde tienes a Bea? ¿Y el recetario?'
    },
    // 18: Monstruo pide 2 pruebas
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-monstruoyrock.jpeg',
        speaker: 'Monstruo Spirit',
        sprite: 'img/juego/sprites/monstruo-normal.png',
        text: 'Lo siento amigos míos, pero si queréis que libere a Bea tendréis que pasar por 2 pruebas. Si tenéis lo que hay que tener.'
    },
    // 19: Rock acepta
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/encuentro-monstruoyrock.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: '¡Por supuesto! ¡Pon a prueba nuestra mente!'
    },
    // 20: ACERTIJO 3
    { type: 'riddle', riddleId: 3 },
    // 21: ACERTIJO 4
    { type: 'riddle', riddleId: 4 },
    // 22: Bosque - Bea apresada
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/liberar-bea.jpeg',
        speaker: 'Bea',
        sprite: 'img/juego/sprites/bea-llorando.png',
        text: '¡No le hagáis caso! No me soltará hasta que resolváis el acertijo secreto...'
    },
    // 23: Monstruo confiado
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/liberar-bea.jpeg',
        speaker: 'Monstruo Spirit',
        sprite: 'img/juego/sprites/monstruo-risa.png',
        text: '¡WAJAJWAJWJ! Chica lista...'
    },
    // 24: Rock sorprendido
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/liberar-bea.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-sorprendido.png',
        text: '¿¿¿CÓMO??? ¡Tranquila Bea, resolveremos ese acertijo secreto ahora mismo!'
    },
    // 25: ACERTIJO 5 (Secreto)
    { type: 'riddle', riddleId: 5 },
    // 26: Bea aliviada
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/liberar-bea.jpeg',
        speaker: 'Bea',
        sprite: 'img/juego/sprites/bea-normal.png',
        text: '¡INCREÍBLE! Gracias... pero este monstruo no se irá tan fácil.'
    },
    // 27: Rock furioso
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/liberar-bea.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-cabreado.png',
        text: '¡Esto se acabó, suéltala YAAA!'
    },
    // 28: Monstruo miedo
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/liberar-bea.jpeg',
        speaker: 'Monstruo Spirit',
        sprite: 'img/juego/sprites/monstruo-miedo.png',
        text: '¿PERO QUÉEEE? ¡No puede ser, la fuerza del bosque me abandona!'
    },
    // 29: Transición cinematográfica
    {
        type: 'blackout',
        duration: 900
    },
    // 30: Escena 3 Llegada de Jack
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: '¡Eso es, huye! ¡Ya sabes lo que te iba a pasar maldito Spirit!'
    },
    // 31: Rock sorprendido por Jack
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-sorprendido.png',
        text: '¿¿Quién eres tú??'
    },
    // 32: Jack se presenta
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-riendose.png',
        text: 'Perdona, qué poco educado por mi parte. Soy Jack, el autor del recetario ancestral.'
    },
    // 33: Rock incrédulo
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-sorprendido.png',
        text: '¿CÓMO? Pero si tú estás...'
    },
    // 34: Jack explica su condición
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: '¿Muerto? Sí. Pero ya me ves... tras mi muerte el recetario creó un vínculo especial con los señores del bosque y la ciudad. Solo una vez al año puedo disfrutar viendo cómo el pueblo cocina mis recetas para HALLOWEEN.'
    },
    // 35: Rock explica la pérdida
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Lamento decirte que el recetario se ha perdido, creíamos que lo había robado esa criatura... ¿puede ser que le hayas llamado Spirit?'
    },
    // 36: Jack desvela la verdad de Enigma y Airbnb
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: 'Y así es. Esa criatura salvaguarda el bosque de AtlantisTown. Pero se ha corrompido el orden natural con la llegada de Enigma y Bea lo descubrió. Enigma trabaja para una empresa que quiere talar el bosque para edificar un complejo turístico de Airbnb.'
    },
    // 37: Jack confiesa el rescate
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: 'Cuando eso ocurrió el Spirit fue a por él, pero se confundió con Bea. Pensando que era ella la destructora, yo mismo le quité el recetario para protegerlo y dejé que el Spirit la apresara. ¡Pero tranquilos, la acabo de rescatar!'
    },
    // 38: Rock pregunta por el recetario
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: '¿Entonces nos vas a devolver a Bea y el recetario?'
    },
    // 39: Jack propone reto final
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: 'Así es. Confío en vosotros pero no lo suficiente. Para devolveros a la portadora y al recetario, tenéis que superar...'
    },
    // 40: Rock risas
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-feliz.png',
        text: '¿Unas pruebas? Jajajaja, ya me estoy acostumbrando a este pueblo.'
    },
    // 41: Jack inicio del gran reto final
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: '¡Exacto! De acuerdo, sin más demora... ¡Que comience el gran reto final de 5 acertijos lógicos!'
    },
    // 42: ACERTIJO 6
    { type: 'riddle', riddleId: 6 },
    // 43: ACERTIJO 7
    { type: 'riddle', riddleId: 7 },
    // 44: ACERTIJO 8
    { type: 'riddle', riddleId: 8 },
    // 45: ACERTIJO 9
    { type: 'riddle', riddleId: 9 },
    // 46: ACERTIJO 10
    { type: 'riddle', riddleId: 10 },
    // 47: FINAL - Jack libera a Bea
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: 'Bueno Bea, eres completamente libre.'
    },
    // 48: Bea agradecida
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Bea',
        sprite: 'img/juego/sprites/bea-feliz.png',
        text: '¡He visto cómo habéis resuelto todos los acertijos de Jack! ¡Ha sido fantástico! ¡Muchas gracias por rescatarme!'
    },
    // 49: Rock pide el recetario
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Sí... han sido duros. Pero ha merecido la pena. Jack, creo que nos debes aún el recetario.'
    },
    // 50: Jack entrega el recetario (muestra libro de recetas)
    {
        type: 'dialogue',
        bg: 'img/juego/libro-recetas.png',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: 'Es correcto. Aquí tenéis... ¡el auténtico Recetario Ancestral de Halloween!'
    },
    // 51: Bea emocionada
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Bea',
        sprite: 'img/juego/sprites/bea-feliz.png',
        text: 'El recetario... ¡hemos conseguido llegar a tiempo para HALLOWEEN! Es la festividad especial del pueblo, en el instituto elaboramos junto con los chicos cada una de las recetas.'
    },
    // 52: Rock se despide de Jack
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Es una suerte, ¿pero y tú Jack? ¿Vas a aparecer ante el pueblo?'
    },
    // 53: Jack cuenta pendiente
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Jack Skellington',
        sprite: 'img/juego/sprites/jack-normal.png',
        text: 'Lamento mucho amigos pero mi viaje llega a su fin por este año. Aunque me queda una cuenta pendiente con nuestro amigo ENIGMA... buscaré la forma de darle su merecido.'
    },
    // 54: Bea cierre
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Bea',
        sprite: 'img/juego/sprites/bea-feliz.png',
        text: 'Espero que así sea. Esas empresas no van a destrozar nuestro querido pueblo. ¡Gracias a todos chicos!'
    },
    // 55: Rock despide al jugador
    {
        type: 'dialogue',
        bg: 'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
        speaker: 'Rock',
        sprite: 'img/juego/sprites/rock-normal.png',
        text: 'Bueno, nuestro viaje acaba aquí. Amig@ detective, ¡nos veremos en la próxima aventura!'
    },
    // 56: FINAL FELIZ Y DESBLOQUEO
    {
        type: 'game_end'
    }
];

// -----------------------------------------------------------------------------
// RESOLUTOR DINÁMICO DE ASSETS (FRONT / BACK / ROOT)
// -----------------------------------------------------------------------------
function resolveAsset(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    // Normalizar ruta: quitar ./, ../ y prefijo front/
    let clean = path.replace(/^\.\//, '').replace(/^\.\.\//, '').replace(/^front\//, '');

    // Normalizar carpeta de sprites para evitar problemas de codificación de espacios
    clean = clean.replace('SPRITES DIALOGOS', 'sprites');

    // Determinar si el documento actual se ejecuta desde un subdirectorio (/back/ o /front/)
    const pathname = window.location.pathname || '';
    const isSubdir = pathname.includes('/back/') || pathname.includes('/front/');

    let resolved = isSubdir ? ('../' + clean) : clean;
    return encodeURI(resolved);
}

// -----------------------------------------------------------------------------
// CONTROLADOR DEL JUEGO
// -----------------------------------------------------------------------------
class RecetarioGame {
    constructor() {
        this.currentNodeIndex = 0;
        this.typingInterval = null;
        this.isTyping = false;
        this.currentFullText = '';

        // Elementos DOM
        this.screenWrapper = document.getElementById('gameScreenWrapper');
        this.bgLayer = document.getElementById('gameBgLayer');
        this.dialogueBox = document.getElementById('gameDialogueBox');
        this.speakerName = document.getElementById('dialogueSpeakerName');
        this.speakerSprite = document.getElementById('dialogueSpeakerImg');
        this.dialogueText = document.getElementById('dialogueText');
        this.btnNext = document.getElementById('btnDialogNext');
        this.riddleModal = document.getElementById('gameRiddleModal');
        this.fadeBlack = document.getElementById('gameFadeBlack');

        this.preloadAssets();
        this.init();
    }

    preloadAssets() {
        const bgList = [
            'img/juego/bienvenida-juego.jpeg',
            'img/juego/atlantistown.jpeg',
            'img/juego/instituto-dia.png',
            'img/juego/instituto-noche.png',
            'img/juego/libro-recetas.png',
            'img/juego/ACERTIJOS/rock-inicio.jpeg',
            'img/juego/ACERTIJOS/encuentro-enigmayrock.jpeg',
            'img/juego/ACERTIJOS/encuentro-monstruoyrock.jpeg',
            'img/juego/ACERTIJOS/liberar-bea.jpeg',
            'img/juego/ACERTIJOS/huida-monstruo-llegada-jack.jpeg',
            'img/juego/ACERTIJOS/fin-felizhistoria.jpeg',
            'img/juego/ACERTIJOS/acertijo-1.jpeg',
            'img/juego/ACERTIJOS/acertijo-2.jpeg',
            'img/juego/ACERTIJOS/acertijo-3.jpeg',
            'img/juego/ACERTIJOS/acertijo-4.jpeg',
            'img/juego/ACERTIJOS/acertijo-5.jpeg',
            'img/juego/ACERTIJOS/acertijo-6.jpeg',
            'img/juego/ACERTIJOS/acertijo-7.jpeg',
            'img/juego/ACERTIJOS/acertijo-8.jpeg',
            'img/juego/ACERTIJOS/acertijo-9.jpeg',
            'img/juego/ACERTIJOS/acertijo-10.jpeg',
            'img/juego/sprites/rock-normal.png',
            'img/juego/sprites/rock-cabreado.png',
            'img/juego/sprites/rock-sorprendido.png',
            'img/juego/sprites/rock-feliz.png',
            'img/juego/sprites/bea-normal.png',
            'img/juego/sprites/bea-llorando.png',
            'img/juego/sprites/bea-feliz.png',
            'img/juego/sprites/enigma.png',
            'img/juego/sprites/monstruo-normal.png',
            'img/juego/sprites/monstruo-miedo.png',
            'img/juego/sprites/monstruo-risa.png',
            'img/juego/sprites/jack-normal.png',
            'img/juego/sprites/jack-riendose.png'
        ];
        bgList.forEach(p => {
            const img = new Image();
            img.src = resolveAsset(p);
        });
    }

    init() {
        if (!this.screenWrapper) return;

        if (this.speakerSprite) {
            this.speakerSprite.onerror = () => {
                if (!this.speakerSprite.dataset.fallback) {
                    this.speakerSprite.dataset.fallback = '1';
                    this.speakerSprite.src = resolveAsset('img/juego/sprites/rock-normal.png');
                }
            };
        }

        // Click en el botón siguiente del cuadro de diálogo
        if (this.btnNext) {
            this.btnNext.addEventListener('click', (e) => {
                e.stopPropagation();
                RetroAudio.click();
                this.handleNextClick();
            });
        }

        // Click en cualquier parte del cuadro de diálogo para avanzar
        if (this.dialogueBox) {
            this.dialogueBox.addEventListener('click', (e) => {
                e.stopPropagation();
                RetroAudio.click();
                this.handleNextClick();
            });
        }

        // Click en el área visible de la pantalla del juego (permite avanzar tocando en cualquier punto)
        this.screenWrapper.addEventListener('click', (e) => {
            // Si el modal del acertijo está activo, no avanzar automáticamente
            if (this.riddleModal && this.riddleModal.classList.contains('active')) {
                return;
            }
            // Si el click fue en un botón interactivo específico, dejar que su handler actúe
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            RetroAudio.click();
            this.handleNextClick();
        });

        // Control de Pantalla Completa (exclusivo sobre el marco del juego #gameScreenWrapper)
        const gameWrapper = this.screenWrapper || document.getElementById('gameScreenWrapper');

        const isGameFullscreen = () => {
            const target = gameWrapper;
            if (!target) return false;
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            return fsEl === target || target.classList.contains('is-fullscreen-frame');
        };

        const toggleFullscreen = () => {
            const target = gameWrapper;
            if (!target) return;
            const isFull = isGameFullscreen();
            if (!isFull) {
                target.classList.add('is-fullscreen-frame');
                if (target.requestFullscreen) {
                    target.requestFullscreen().catch(() => {});
                } else if (target.webkitRequestFullscreen) {
                    target.webkitRequestFullscreen();
                } else if (target.mozRequestFullScreen) {
                    target.mozRequestFullScreen();
                } else if (target.msRequestFullscreen) {
                    target.msRequestFullscreen();
                }
            } else {
                target.classList.remove('is-fullscreen-frame');
                if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen().catch(() => {});
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            }
            updateFsButtons();
        };

        const updateFsButtons = () => {
            const isFull = isGameFullscreen();
            const btnFs = document.getElementById('btnToggleGameFullscreen');
            const btnFloat = document.getElementById('btnFloatingFullscreen');
            const btnPres = document.getElementById('btnPresentationFullscreen');
            if (btnFs) {
                btnFs.textContent = isFull ? '🗗 Salir Pantalla Completa' : '⛶ Pantalla Completa';
                btnFs.title = isFull ? 'Salir de Pantalla Completa (F / ESC)' : 'Pantalla Completa (F)';
            }
            if (btnFloat) {
                btnFloat.textContent = isFull ? '🗗 Salir' : '⛶';
                btnFloat.title = isFull ? 'Salir de Pantalla Completa (F / ESC)' : 'Pantalla Completa (F)';
            }
            if (btnPres) {
                btnPres.textContent = isFull ? '🗗 Salir Pantalla Completa' : '⛶ Pantalla Completa (F)';
            }
        };

        const onGameFsChange = () => {
            const target = this.screenWrapper || document.getElementById('gameScreenWrapper');
            if (!target) return;
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (fsEl === target) {
                target.classList.add('is-fullscreen-frame');
            } else {
                target.classList.remove('is-fullscreen-frame');
            }
            updateFsButtons();
        };

        document.addEventListener('fullscreenchange', onGameFsChange);
        document.addEventListener('webkitfullscreenchange', onGameFsChange);
        document.addEventListener('mozfullscreenchange', onGameFsChange);
        document.addEventListener('MSFullscreenChange', onGameFsChange);

        const btnFs = document.getElementById('btnToggleGameFullscreen');
        if (btnFs) {
            btnFs.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullscreen();
            });
        }

        const btnFloat = document.getElementById('btnFloatingFullscreen');
        if (btnFloat) {
            btnFloat.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullscreen();
            });
        }

        // Teclado: Espacio o Enter avanza el diálogo; F o Escape alternan pantalla completa
        window.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
                e.preventDefault();
                const container = document.getElementById('gameInteractiveContainer');
                if (container && container.style.display === 'none') {
                    const btnPlay = document.getElementById('btnLaunchInteractiveGame');
                    if (btnPlay) btnPlay.click();
                }
                toggleFullscreen();
                return;
            }

            if (e.key === 'Escape') {
                if (isGameFullscreen()) {
                    toggleFullscreen();
                }
                return;
            }

            if (e.code === 'Space' || e.code === 'Enter') {
                // Si el modal de acertijo está activo, permitir navegación interna
                if (this.riddleModal && this.riddleModal.classList.contains('active')) {
                    return;
                }
                const container = document.getElementById('gameInteractiveContainer');
                if (container && container.style.display !== 'none') {
                    e.preventDefault();
                    RetroAudio.click();
                    this.handleNextClick();
                }
            }
        });
    }

    startAdventure() {
        this.currentNodeIndex = 0;
        this.renderNode();
    }

    handleNextClick() {
        // Si el texto se está escribiendo, completarlo de inmediato
        if (this.isTyping) {
            clearInterval(this.typingInterval);
            this.dialogueText.textContent = this.currentFullText;
            this.isTyping = false;
            return;
        }

        // Avanzar al siguiente nodo
        this.currentNodeIndex++;
        if (this.currentNodeIndex < STORY_NODES.length) {
            this.renderNode();
        } else {
            this.endGame();
        }
    }

    renderNode() {
        const node = STORY_NODES[this.currentNodeIndex];
        if (!node) return;

        // Ocultar modales y fundidos
        if (this.riddleModal) this.riddleModal.classList.remove('active');
        if (this.fadeBlack) this.fadeBlack.classList.remove('active');

        switch (node.type) {
            case 'intro_screen':
                this.renderIntroScreen(node);
                break;
            case 'dialogue':
                this.renderDialogue(node);
                break;
            case 'riddle':
                this.renderRiddle(node.riddleId);
                break;
            case 'blackout':
                this.renderBlackout(node);
                break;
            case 'game_end':
                this.endGame();
                break;
        }
    }

    setGameBackground(bgPath, isSpecialCover = false) {
        if (!this.bgLayer) return;
        this.bgLayer.classList.remove('game-bg-intro');

        if (isSpecialCover) {
            this.bgLayer.style.backgroundSize = 'contain';
            this.bgLayer.style.backgroundPosition = 'center';
            this.bgLayer.style.backgroundRepeat = 'no-repeat';
            this.bgLayer.style.backgroundColor = '#0b0614';
        } else {
            this.bgLayer.style.backgroundSize = 'cover';
            this.bgLayer.style.backgroundPosition = 'center';
            this.bgLayer.style.backgroundRepeat = 'no-repeat';
            this.bgLayer.style.backgroundColor = '#000';
        }

        const primaryUrl = resolveAsset(bgPath);
        this.bgLayer.style.backgroundImage = `url("${primaryUrl}")`;

        // Pre-validar en memoria con lista de fallbacks en caso de fallo de red/ruta
        const testImg = new Image();
        const fallbacks = [
            primaryUrl.replace('../img/', '../front/img/'),
            primaryUrl.replace('../front/img/', '../img/'),
            primaryUrl.replace('/ACERTIJOS/', '/acertijos/'),
            primaryUrl.replace('/sprites/', '/SPRITES%20DIALOGOS/')
        ];
        let attempt = 0;
        testImg.onerror = () => {
            if (attempt < fallbacks.length) {
                const nextUrl = fallbacks[attempt++];
                const retryImg = new Image();
                retryImg.onload = () => {
                    this.bgLayer.style.backgroundImage = `url("${nextUrl}")`;
                };
                retryImg.src = nextUrl;
            }
        };
        testImg.src = primaryUrl;
    }

    setSpeakerSprite(spritePath, speakerName) {
        if (!this.speakerSprite) return;
        this.speakerSprite.alt = speakerName || 'Personaje';

        const primaryUrl = resolveAsset(spritePath);
        const fallbacks = [
            primaryUrl,
            primaryUrl.replace('/sprites/', '/SPRITES%20DIALOGOS/'),
            primaryUrl.replace('../img/', '../front/img/'),
            primaryUrl.replace('../front/img/', '../img/'),
            primaryUrl.replace('/sprites/', '/'),
            resolveAsset('img/juego/sprites/rock-normal.png')
        ];

        let attempt = 0;
        this.speakerSprite.onerror = () => {
            attempt++;
            if (attempt < fallbacks.length) {
                this.speakerSprite.src = fallbacks[attempt];
            }
        };
        this.speakerSprite.src = primaryUrl;
    }

    renderIntroScreen(node) {
        this.setGameBackground(node.bg, false);
        this.bgLayer.classList.add('game-bg-intro');
        this.dialogueBox.style.display = 'none';

        // Remover botones previos si los hubiera
        const oldBtn = document.getElementById('gameStartBtnOverlay');
        if (oldBtn) oldBtn.remove();

        // Botón grande sobre bienvenida-juego.jpeg con resplandor dorado (sin solapar el texto)
        const startBtn = document.createElement('button');
        startBtn.id = 'gameStartBtnOverlay';
        startBtn.className = 'btn-big-play';
        startBtn.style.position = 'absolute';
        startBtn.style.bottom = '18px';
        startBtn.style.left = '50%';
        startBtn.style.transform = 'translateX(-50%)';
        startBtn.style.zIndex = '35';
        startBtn.style.padding = '12px 28px';
        startBtn.style.fontSize = '14px';
        startBtn.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.9), 0 8px 25px rgba(0, 0, 0, 0.9)';
        startBtn.innerHTML = 'COMENZAR INVESTIGACIÓN <span class="play-arrow"></span>';
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            RetroAudio.click();
            startBtn.remove();
            this.handleNextClick();
        });
        this.screenWrapper.appendChild(startBtn);
    }

    renderDialogue(node) {
        // Limpiar overlays
        const oldBtn = document.getElementById('gameStartBtnOverlay');
        if (oldBtn) oldBtn.remove();

        const isSpecialCover = node.bg && (node.bg.includes('libro-recetas') || node.bg.includes('instituto-dia') || node.bg.includes('instituto-noche'));
        this.setGameBackground(node.bg, isSpecialCover);

        this.dialogueBox.style.display = 'grid';
        this.speakerName.textContent = node.speaker;
        this.setSpeakerSprite(node.sprite, node.speaker);

        // Efecto typing
        this.typeText(node.text);
    }

    typeText(text) {
        clearInterval(this.typingInterval);
        this.isTyping = true;
        this.currentFullText = text;
        this.dialogueText.textContent = '';
        let index = 0;

        this.typingInterval = setInterval(() => {
            if (index < text.length) {
                this.dialogueText.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(this.typingInterval);
                this.isTyping = false;
            }
        }, 16);
    }

    renderRiddle(riddleId) {
        const riddle = ACERTIJOS_DATA[riddleId];
        if (!riddle) return;

        this.dialogueBox.style.display = 'none';
        this.setGameBackground(riddle.imagenFondo, false);

        const counterEl = document.getElementById('riddleCounter');
        const titleEl = document.getElementById('riddleTitle');
        const stmtEl = document.getElementById('riddleStatement');
        const optionsList = document.getElementById('riddleOptionsList');
        const feedbackEl = document.getElementById('riddleFeedback');

        if (counterEl) counterEl.textContent = `Acertijo ${riddleId} / 10`;
        if (titleEl) titleEl.textContent = riddle.titulo;
        if (stmtEl) stmtEl.textContent = riddle.enunciado;
        if (feedbackEl) {
            feedbackEl.className = 'riddle-feedback';
            feedbackEl.style.display = 'none';
            feedbackEl.innerHTML = '';
        }

        optionsList.innerHTML = '';
        riddle.opciones.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'riddle-option-btn';
            btn.innerHTML = `
                <span class="riddle-letter-badge">${opt.letra}</span>
                <span>${opt.texto}</span>
            `;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.checkRiddleAnswer(riddle, opt.letra, feedbackEl, optionsList, btn);
            });
            optionsList.appendChild(btn);
        });

        this.riddleModal.classList.add('active');
        RetroAudio.mystery();
    }

    checkRiddleAnswer(riddle, selectedLetra, feedbackEl, optionsList, clickedBtn) {
        if (selectedLetra === riddle.correcta) {
            RetroAudio.correct();
            clickedBtn.style.borderColor = '#43c048';
            clickedBtn.style.background = '#1e4722';

            // Recompensa de monedas por resolver el acertijo
            if (window.AtlantisHUD) {
                window.AtlantisHUD.addCoins(50, `Acertijo ${riddle.titulo} resuelto`);
            }

            feedbackEl.className = 'riddle-feedback correct';
            feedbackEl.innerHTML = `
                <div>✨ ¡RESPUESTA CORRECTA!</div>
                <div style="font-family: var(--font-pixel); font-size: 10px; color: #ffd700; margin: 4px 0;">💰 +50 Monedas de Oro ganadas</div>
                <div style="font-family: var(--font-body); font-size:12px; margin-top:6px; color:#faeed2;">${riddle.explicacion}</div>
                <button id="btnNextAfterRiddle" class="btn-pixel-play" style="margin-top:12px; padding:8px 18px; font-size:11px;">
                    Continuar Historia ▶
                </button>
            `;
            feedbackEl.style.display = 'block';

            // Deshabilitar todas las opciones
            const buttons = optionsList.querySelectorAll('.riddle-option-btn');
            buttons.forEach(b => b.disabled = true);

            document.getElementById('btnNextAfterRiddle').addEventListener('click', (e) => {
                e.stopPropagation();
                RetroAudio.click();
                this.riddleModal.classList.remove('active');
                this.handleNextClick();
            });
        } else {
            RetroAudio.wrong();
            clickedBtn.style.borderColor = '#e63946';
            clickedBtn.style.background = '#4a1515';

            feedbackEl.className = 'riddle-feedback wrong';
            feedbackEl.innerHTML = `
                <div>💀 ¡RESPUESTA INCORRECTA!</div>
                <div style="font-family: var(--font-body); font-size:11px; margin-top:4px;">
                    Esa respuesta no resuelve el misterio. ¡Piénsalo bien y prueba otra opción!
                </div>
            `;
            feedbackEl.style.display = 'block';
        }
    }

    renderBlackout(node) {
        this.dialogueBox.style.display = 'none';
        this.fadeBlack.classList.add('active');
        setTimeout(() => {
            this.fadeBlack.classList.remove('active');
            this.handleNextClick();
        }, node.duration || 900);
    }

    endGame() {
        // Desbloqueo permanente y recompensa heroica: mitad del recetario (5 recetas) + monedas
        if (window.AtlantisHUD) {
            window.AtlantisHUD.completeMainStory();
        } else {
            localStorage.setItem('recetario_desbloqueado', 'true');
            localStorage.setItem('atlantis_historia_completada', 'true');
        }
        RetroAudio.correct();

        const isBack = window.location.pathname.includes('/back/');
        const recetasHref = isBack ? 'recetas.php' : 'recetas.html';
        const indexHref = isBack ? 'index.php' : 'index.html';
        const victoryBg = resolveAsset('img/juego/ACERTIJOS/fin-felizhistoria.jpeg');

        // Pantalla de desenlace triunfal
        this.screenWrapper.innerHTML = `
            <div style="position:absolute; inset:0; background: url('${victoryBg}') no-repeat center; background-size:cover; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; z-index:50;">
                <div style="background: rgba(30, 14, 6, 0.95); border: 8px solid #ffd700; border-radius: 12px; padding: 25px; max-width: 650px; box-shadow: 0 0 35px #ffd700;">
                    <h2 class="login-spooky-title" style="font-size: 24px; color: #ffd700; margin-bottom: 12px;">
                        ¡MISIÓN CUMPLIDA!
                    </h2>
                    <p style="font-family: var(--font-pixel-dialog); font-size: 20px; color: #faeed2; line-height: 1.4; margin-bottom: 16px;">
                        ¡Has rescatado a Bea y recuperado el Recetario Ancestral de Jack Skellington!
                    </p>
                    <div style="background: rgba(0, 0, 0, 0.45); border: 2px solid #ffd700; border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left; font-family: var(--font-pixel); font-size: 10px; color: #ffd700; line-height: 1.6;">
                        <div>✨ <strong>RECOMPENSA HEROICA POR COMPLETAR LA HISTORIA:</strong></div>
                        <div style="color: #faeed2; margin-top: 4px;">📖 <strong>Has obtenido la mitad del recetario en equivalencia (5 recetas desbloqueadas).</strong></div>
                        <div style="color: #ffd700;">💰 <strong>+500 Monedas de Oro añadidas a tu monedero.</strong> ¡Úsalas para desbloquear el resto de recetas!</div>
                    </div>
                    <div style="display:flex; gap:14px; justify-content:center; flex-wrap:wrap;">
                        <a href="${recetasHref}" class="btn-pixel-play" style="padding:10px 20px; font-size:11px;">
                            📖 Ver Recetas Desbloqueadas
                        </a>
                        <a href="${indexHref}" class="btn-plaque-action" style="padding:10px 20px; font-size:11px;">
                            🏠 Volver al Inicio
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    jumpToRiddle(riddleNum) {
        // Encontrar el nodo que corresponde a ese acertijo
        const index = STORY_NODES.findIndex(n => n.type === 'riddle' && n.riddleId === riddleNum);
        if (index !== -1) {
            this.currentNodeIndex = index;
            this.renderNode();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new RecetarioGame();
});
