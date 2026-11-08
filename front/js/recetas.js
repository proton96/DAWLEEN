/**
 * ==============================================================================
 * MÓDULO: CATÁLOGO INTERACTIVO DE RECETAS (recetas.js)
 * ==============================================================================
 *
 * Manejo interactivo del DOM:
 * - Renderizado dinámico de detalles y modal de recetas estilo Stardew Valley.
 * - Comprobación y compra de recetas bloqueadas con monedas de Atlantis Town.
 * - Desbloqueo del 50% de las recetas de forma automática al superar la historia.
 * - Barra de progreso dinámica y sincronización reactiva con hud.js.
 * - Sonidos retro integrados en eventos de click y desbloqueo.
 */

const RECETAS_DETALLES = {
    'sopa-calabaza': {
        nombre: 'Sopa de Calabaza',
        icono: 'img/web/recetas/sopa-calabaza.png',
        estrellas: '★★☆',
        precio: 150,
        esTop: false,
        categoria: 'Plato Caliente',
        energia: '+135 Energía',
        salud: '+60 Salud',
        buff: '🛡️ +2 Defensa (7m 41s)',
        descripcion: 'Una crema reconfortante preparada con calabazas doradas de Atlantis Town y una pizca de especias otoñales. Desprende un vapor verdoso de aroma irresistible.',
        ingredientes: [
            '1x Calabaza de otoño fresca',
            '1x Leche entera de granja',
            '1x Especias del bosque nocturno'
        ],
        preparacion: 'Trocear la calabaza en dados pequeños y hervir a fuego lento junto con la leche hasta obtener una textura aterciopelada. Añadir las especias del bosque antes de servir bien caliente.'
    },
    'pastel-bayas': {
        nombre: 'Pastel de Bayas',
        icono: 'img/web/recetas/pastel-bayas.png',
        estrellas: '★★☆',
        precio: 150,
        esTop: false,
        categoria: 'Repostería',
        energia: '+180 Energía',
        salud: '+80 Salud',
        buff: '⚡ +1 Velocidad (5m)',
        descripcion: 'Tarta tradicional horneada con masa crujiente y una abundante capa de bayas sombrías recolectadas en los senderos más ocultos de Atlantis Town.',
        ingredientes: [
            '1x Harina de trigo molida',
            '1x Azúcar de caña',
            '1x Bayas del bosque nocturno'
        ],
        preparacion: 'Extender la masa quebrada sobre un molde de arcilla. Rellenar con las bayas previamente maceradas en azúcar y hornear a 180°C hasta que la corteza esté dorada.'
    },
    'guiso-setas': {
        nombre: 'Guiso de Setas',
        icono: 'img/web/recetas/guiso-setas.png',
        estrellas: '★★★',
        precio: 500,
        esTop: true, // REQUISITO DIW: RECETA TOP
        categoria: 'Especialidad Legendaria',
        energia: '+250 Energía',
        salud: '+110 Salud',
        buff: '⛏️ +3 Minería / 🔮 +2 Suerte (10m)',
        descripcion: 'La receta estrella custodiada por Bea. Una cocción magistral de tres variedades de hongos raros que brillan suavemente en la oscuridad de las minas.',
        ingredientes: [
            '1x Seta común del bosque',
            '1x Seta púrpura cavernaria',
            '1x Chantarela de raíz'
        ],
        preparacion: 'Saltear las setas en manteca rústica hasta que liberen su jugo luminiscente. Cubrir con caldo purificado y reducir a fuego muy lento durante 45 minutos.'
    },
    'pan-espeluznante': {
        nombre: 'Pan Espeluznante',
        icono: 'img/web/recetas/pan-espeluznante.png',
        estrellas: '★☆☆',
        precio: 150,
        esTop: false,
        categoria: 'Panadería',
        energia: '+90 Energía',
        salud: '+40 Salud',
        buff: '🥖 +1 Fuerza (4m)',
        descripcion: 'Pan denso de centeno moldeado con formas espectrales. Se dice que mantiene a raya a los malos espíritus durante la noche de Halloween.',
        ingredientes: [
            '2x Harina de centeno',
            '1x Levadura salvaje',
            '1x Pizca de sal gema'
        ],
        preparacion: 'Amasar con paciencia, dejar reposar bajo un paño de lino durante la noche de luna llena y hornear a leña hasta obtener una corteza gruesa y crujiente.'
    },
    'brebaje-olas': {
        nombre: 'Brebaje de Olas',
        icono: 'img/web/recetas/brebaje-olas.png',
        estrellas: '★☆☆',
        precio: 150,
        esTop: false,
        categoria: 'Poción Alquímica',
        energia: '+120 Energía',
        salud: '+50 Salud',
        buff: '⏱️ +2 Pesca marina (6m)',
        descripcion: 'Un caldo burbujeante de color azul zafiro servido en caldero esférico. Se elabora con aguas puras procedentes de las profundidades de Atlantis.',
        ingredientes: [
            '1x Esencia de agua profunda',
            '1x Alga marina azulada',
            '1x Lágrima de espíritu'
        ],
        preparacion: 'Llevar el agua marina a punto de ebullición, disolver el alga azul y enfriar rápidamente en hielo para atrapar las burbujas mágicas de energía.'
    },
    'pudin-nocturno': {
        nombre: 'Pudin Nocturno',
        icono: 'img/web/recetas/pudin-nocturno.png',
        estrellas: '★☆☆',
        precio: 150,
        esTop: false,
        categoria: 'Postre Espectral',
        energia: '+110 Energía',
        salud: '+45 Salud',
        buff: '🌙 +1 Sigilo nocturno (8m)',
        descripcion: 'Flan gelatinoso de color violeta intenso decorado con moras silvestres. Tiembla suavemente al ritmo de los susurros del viento otoñal.',
        ingredientes: [
            '1x Gelatina de mora silvestre',
            '1x Leche fresca aromatizada',
            '1x Moras del bosque profundo'
        ],
        preparacion: 'Calentar la leche aromatizada, incorporar el extracto de bayas y colar sobre moldes acampanados. Dejar cuajar en la fresquera de piedra durante 4 horas.'
    },
    'dulces-otono': {
        nombre: 'Dulces de Otoño',
        icono: 'img/web/recetas/dulces-otono.png',
        estrellas: '★★☆',
        precio: 250,
        esTop: false,
        categoria: 'Golosinas Festivas',
        energia: '+160 Energía',
        salud: '+70 Salud',
        buff: '🎃 +2 Carisma festivo (5m)',
        descripcion: 'Las clásicas golosinas triangulares de maíz y miel que los niños y brujitas de Atlantis Town piden en el tradicional truco o trato.',
        ingredientes: [
            '1x Jarabe de maíz dorado',
            '1x Miel de abejas del bosque',
            '1x Extracto de calabaza'
        ],
        preparacion: 'Cocer el jarabe junto a la miel a punto de caramelo blando. Dividir en tres partes, teñir con extractos vegetales en naranja, blanco y amarillo, y moldear en triángulos.'
    },
    'caldo-algas': {
        nombre: 'Caldo de Algas',
        icono: 'img/web/recetas/caldo-algas.png',
        estrellas: '★☆☆',
        precio: 200,
        esTop: false,
        categoria: 'Sopa Ligera',
        energia: '+85 Energía',
        salud: '+38 Salud',
        buff: '⏱️ +1 Resistencia acuática (6m)',
        descripcion: 'Sopa nutritiva y humeante de color esmeralda preparada con algas frescas cosechadas en los riachuelos que cruzan el bosque hacia Atlantis.',
        ingredientes: [
            '4x Algas verdes frescas',
            '1x Caldo vegetal clarificado',
            '1x Sal marina pura'
        ],
        preparacion: 'Lavar las algas minuciosamente en agua de manantial. Añadir al caldo hirviendo durante exactamente 3 minutos para mantener su frescura y propiedades reconstituyentes.'
    },
    'galletas-calabaza': {
        nombre: 'Galletas de Calabaza',
        icono: 'img/web/recetas/galletas-calabaza.png',
        estrellas: '★★☆',
        precio: 400,
        esTop: true, // REQUISITO DIW: RECETA TOP
        categoria: 'Especialidad Legendaria',
        energia: '+220 Energía',
        salud: '+95 Salud',
        buff: '👑 +2 Amistad con los espíritus / 🌟 +2 Suerte',
        descripcion: 'La merienda predilecta de Jack Skellington. Galletas de calabaza horneadas con rostros tallados que desprenden un dulce aroma a canela y nuez moscada.',
        ingredientes: [
            '1x Puré concentrado de calabaza',
            '1x Harina fina de repostería',
            '1x Azúcar moreno y canela'
        ],
        preparacion: 'Mezclar el puré con los ingredientes secos, extender la masa y cortar con formas de calabaza sonriente. Hornear a 190°C hasta que los bordes adquieran un tono caramelo.'
    },
    'estofado-bosque': {
        nombre: 'Estofado del Bosque',
        icono: 'img/web/recetas/estofado-bosque.png',
        estrellas: '★☆☆',
        precio: 300,
        esTop: false,
        categoria: 'Plato Contundente',
        energia: '+175 Energía',
        salud: '+75 Salud',
        buff: '⚔️ +2 Ataque (8m)',
        descripcion: 'Un guiso espeso con tubérculos de otoño y raíces aromáticas. El alimento indispensable de Rock para sus largas jornadas de investigación en el bosque.',
        ingredientes: [
            '1x Raíz invernal',
            '1x Patata dulce silvestre',
            '1x Caldo espeso de hierbas'
        ],
        preparacion: 'Dorar los tubérculos en olla de hierro fundido. Verter el caldo y estofar tapado a fuego suave hasta que todos los ingredientes queden tiernos.'
    }
};

function resolveAsset(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('../')) return path;
    const isBack = window.location.pathname.includes('/back/');
    return isBack ? '../front/' + path : path;
}

// -----------------------------------------------------------------------------
// CONTROLADOR DEL CATÁLOGO DE RECETAS
// -----------------------------------------------------------------------------
const RecetarioUI = {
    init() {
        this.renderAllCards();
        this.renderProgressBar();
        this.setupModal();
        this.setupEventListeners();
    },

    setupEventListeners() {
        window.addEventListener('atlantis:recipesChanged', () => {
            this.renderAllCards();
            this.renderProgressBar();
        });

        window.addEventListener('atlantis:coinsChanged', () => {
            this.renderAllCards();
        });

        window.addEventListener('atlantis:storyCompleted', () => {
            this.renderAllCards();
            this.renderProgressBar();
        });
    },

    renderProgressBar() {
        const hud = window.AtlantisHUD;
        if (!hud) return;

        const unlocked = hud.getUnlockedRecipes();
        const total = Object.keys(RECETAS_DETALLES).length;
        const count = unlocked.length;
        const pct = Math.round((count / total) * 100);

        let progressContainer = document.getElementById('recetarioProgressSection');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'recetarioProgressSection';
            const boardHeader = document.querySelector('.board-header-scroll');
            if (boardHeader && boardHeader.nextElementSibling) {
                boardHeader.parentNode.insertBefore(progressContainer, boardHeader.nextElementSibling);
            }
        }

        const isStoryDone = hud.isStoryCompleted();

        progressContainer.innerHTML = `
            <div class="recipes-progress-container">
                <div class="recipes-progress-info">
                    <div class="recipes-progress-title">
                        <span>📖 Recetas Ancestrales Desbloqueadas:</span>
                        <strong style="color:#fff; font-size:11px;">${count} / ${total} (${pct}%)</strong>
                    </div>
                    <div class="recipes-progress-bar-track">
                        <div class="recipes-progress-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>

                <div class="recipes-story-banner ${isStoryDone ? '' : 'hint'}">
                    ${isStoryDone ?
                        '🏆 <strong>¡HISTORIA PRINCIPAL SUPERADA!</strong> Desbloqueaste la mitad de las recetas (50%) por equivalencia heroica.' :
                        '💡 <strong>Consejo de Atlantis:</strong> Desbloquea recetas con monedas o supera la Historia Principal para conseguir la mitad (5) gratis.'
                    }
                </div>
            </div>
        `;
    },

    renderAllCards() {
        const hud = window.AtlantisHUD;
        const cards = document.querySelectorAll('.recipe-card');

        cards.forEach(card => {
            const key = card.getAttribute('data-recipe');
            const data = RECETAS_DETALLES[key];
            if (!data) return;

            const isUnlocked = hud ? hud.isRecipeUnlocked(key) : true;

            // Limpiar elementos dinámicos previos
            const oldLock = card.querySelector('.recipe-lock-overlay');
            if (oldLock) oldLock.remove();
            const oldBtn = card.querySelector('.recipe-btn-unlock');
            if (oldBtn) oldBtn.remove();
            const oldStatus = card.querySelector('.recipe-status-unlocked');
            if (oldStatus) oldStatus.remove();

            if (isUnlocked) {
                card.classList.remove('locked');
                card.title = `✓ ${data.nombre} (Desbloqueada) - Click para ver preparación`;

                const statusSpan = document.createElement('span');
                statusSpan.className = 'recipe-status-unlocked';
                statusSpan.innerHTML = '✓ Desbloqueada';
                card.appendChild(statusSpan);
            } else {
                card.classList.add('locked');
                card.title = `🔒 ${data.nombre} (Bloqueada) - Desbloquear por ${data.precio} G`;

                const frame = card.querySelector('.recipe-icon-frame');
                if (frame) {
                    const lockDiv = document.createElement('div');
                    lockDiv.className = 'recipe-lock-overlay';
                    lockDiv.textContent = '🔒';
                    frame.appendChild(lockDiv);
                }

                const btnUnlock = document.createElement('button');
                btnUnlock.className = 'recipe-btn-unlock';
                btnUnlock.innerHTML = `💰 Desbloquear (${data.precio} G)`;
                btnUnlock.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.abrirModalDesbloqueo(key);
                });
                card.appendChild(btnUnlock);
            }

            // Manejador del click en la tarjeta completa
            card.onclick = () => {
                if (hud && !hud.isRecipeUnlocked(key)) {
                    this.abrirModalDesbloqueo(key);
                } else {
                    this.abrirModalReceta(key);
                }
            };
        });
    },

    abrirModalDesbloqueo(key) {
        const data = RECETAS_DETALLES[key];
        const hud = window.AtlantisHUD;
        if (!data || !hud) return;

        const modalBackdrop = document.getElementById('recipeModalBackdrop');
        const modalIcon = document.getElementById('modalRecipeIcon');
        const modalTitle = document.getElementById('modalRecipeTitle');
        const modalCategory = document.getElementById('modalRecipeCategory');
        const modalRating = document.getElementById('modalRecipeRating');
        const modalBuff = document.getElementById('modalRecipeBuff');
        const modalDesc = document.getElementById('modalRecipeDesc');
        const modalIngredientes = document.getElementById('modalRecipeIngredients');
        const modalPrep = document.getElementById('modalRecipePrep');

        if (modalIcon) modalIcon.src = resolveAsset(data.icono);
        if (modalTitle) modalTitle.textContent = `🔒 ${data.nombre}`;
        if (modalCategory) modalCategory.textContent = `${data.categoria} • Bloqueada`;
        if (modalRating) modalRating.textContent = data.estrellas;

        const coins = hud.getCoins();
        const canAfford = coins >= data.precio;

        if (modalBuff) {
            modalBuff.className = 'recipe-buff-badge';
            modalBuff.textContent = `Coste de Desbloqueo: ${data.precio} G | Tu Saldo: ${coins} G`;
        }

        if (modalDesc) {
            modalDesc.innerHTML = `
                <div style="font-family: var(--font-pixel); font-size: 10px; color: #5a2e12; margin-bottom: 8px;">
                    📜 <strong>RECETA ANCESTRAL BLOQUEADA:</strong>
                </div>
                Esta preparación tradicional está sellada en el antiguo recetario de Atlantis Town.
                Puedes desbloquearla usando tus monedas de oro conseguidas en minijuegos o acertijos.
            `;
        }

        if (modalIngredientes) {
            modalIngredientes.innerHTML = `
                <li style="color:#777; font-style:italic;">🔒 Ingredientes ocultos hasta su desbloqueo.</li>
                <li style="color:#777; font-style:italic;">🔒 Efectos y propiedades mágicas ocultas.</li>
            `;
        }

        if (modalPrep) {
            if (canAfford) {
                modalPrep.innerHTML = `
                    <div style="text-align:center; padding:12px 0;">
                        <button id="btnConfirmUnlockModal" class="btn-pixel-play" style="padding:10px 24px; font-size:11px; cursor:pointer;">
                            ✨ Desbloquear "${data.nombre}" por ${data.precio} G
                        </button>
                    </div>
                `;
                setTimeout(() => {
                    const btn = document.getElementById('btnConfirmUnlockModal');
                    if (btn) {
                        btn.onclick = () => {
                            const res = hud.purchaseRecipe(key);
                            if (res.success) {
                                this.abrirModalReceta(key);
                            } else {
                                alert(res.msg);
                            }
                        };
                    }
                }, 50);
            } else {
                const diff = data.precio - coins;
                const isBack = window.location.pathname.includes('/back/');
                const miniHref = isBack ? 'minijuegos.php' : 'minijuegos.html';
                const juegoHref = isBack ? 'juego.php' : 'juego.html';

                modalPrep.innerHTML = `
                    <div style="background:#4a1515; border:2px solid #e63946; border-radius:6px; padding:10px; color:#ffd700; font-family:var(--font-pixel); font-size:9px; text-align:center; line-height:1.5;">
                        <div>❌ Monedas insuficientes (te faltan ${diff} G).</div>
                        <div style="color:#faeed2; margin-top:4px; font-family:var(--font-body); font-size:12px;">
                            Juega a los <strong>Minijuegos</strong> o supera la <strong>Historia Principal</strong> para ganar oro rápidamente.
                        </div>
                        <div style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
                            <a href="${miniHref}" class="btn-pixel-play" style="font-size:9px; padding:6px 12px; text-decoration:none;">🎮 Jugar Minijuegos</a>
                            <a href="${juegoHref}" class="btn-plaque-action" style="font-size:9px; padding:6px 12px; text-decoration:none;">📜 Historia Principal</a>
                        </div>
                    </div>
                `;
            }
        }

        if (modalBackdrop) modalBackdrop.classList.add('open');
    },

    abrirModalReceta(recetaKey) {
        const data = RECETAS_DETALLES[recetaKey];
        if (!data) return;

        const modalBackdrop = document.getElementById('recipeModalBackdrop');
        const modalIcon = document.getElementById('modalRecipeIcon');
        const modalTitle = document.getElementById('modalRecipeTitle');
        const modalCategory = document.getElementById('modalRecipeCategory');
        const modalRating = document.getElementById('modalRecipeRating');
        const modalBuff = document.getElementById('modalRecipeBuff');
        const modalDesc = document.getElementById('modalRecipeDesc');
        const modalIngredientes = document.getElementById('modalRecipeIngredients');
        const modalPrep = document.getElementById('modalRecipePrep');

        if (modalIcon) modalIcon.src = resolveAsset(data.icono);
        if (modalTitle) modalTitle.textContent = data.nombre;
        if (modalCategory) modalCategory.textContent = data.categoria;
        if (modalRating) modalRating.textContent = data.estrellas;
        if (modalBuff) modalBuff.textContent = `${data.energia} | ${data.salud} | ${data.buff}`;
        if (modalDesc) modalDesc.textContent = data.descripcion;

        if (modalIngredientes) {
            modalIngredientes.innerHTML = '';
            data.ingredientes.forEach(ing => {
                const li = document.createElement('li');
                li.textContent = `• ${ing}`;
                modalIngredientes.appendChild(li);
            });
        }

        if (modalPrep) modalPrep.textContent = data.preparacion;
        if (modalBackdrop) modalBackdrop.classList.add('open');
    },

    setupModal() {
        const closeBtn = document.getElementById('closeRecipeModal');
        if (closeBtn) {
            closeBtn.onclick = () => this.cerrarModal();
        }

        const backdrop = document.getElementById('recipeModalBackdrop');
        if (backdrop) {
            backdrop.onclick = (e) => {
                if (e.target === backdrop) this.cerrarModal();
            };
        }
    },

    cerrarModal() {
        const modalBackdrop = document.getElementById('recipeModalBackdrop');
        if (modalBackdrop) modalBackdrop.classList.remove('open');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    RecetarioUI.init();
});

