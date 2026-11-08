/**
 * ==============================================================================
 * MÓDULO: GESTOR GLOBAL DE HUD, MONEDAS, RELOJ Y RECETAS (hud.js)
 * ==============================================================================
 *
 * Características:
 * 1. Reloj en tiempo real real sincronizado cada segundo con formato retro Stardew Valley.
 * 2. Monedero persistente (localStorage) con animaciones flotantes (+X G / -X G).
 * 3. Recompensas de monedas en minijuegos y acertijos de la historia principal.
 * 4. Sistema de desbloqueo de recetas con monedas y bonificación del 50% al pasarse la historia.
 * 5. Audio retro sintetizado (Web Audio API) y soporte de archivos de sonido.
 */

(function () {
    'use strict';

    const STORAGE_KEY_COINS = 'atlantis_monedas';
    const STORAGE_KEY_RECIPES = 'atlantis_recetas_desbloqueadas';
    const STORAGE_KEY_STORY = 'atlantis_historia_completada';
    const STORAGE_KEY_LEGACY = 'recetario_desbloqueado';

    const DEFAULT_COINS = 1312;

    // Las 10 recetas oficiales y su coste
    const RECETAS_CATALOGO = [
        { key: 'sopa-calabaza',     nombre: 'Sopa de Calabaza',     precio: 150, estrellas: '★★☆', esHistoria: true },
        { key: 'pastel-bayas',      nombre: 'Pastel de Bayas',      precio: 150, estrellas: '★★☆', esHistoria: true },
        { key: 'pan-espeluznante',  nombre: 'Pan Espeluznante',     precio: 150, estrellas: '★☆☆', esHistoria: true },
        { key: 'brebaje-olas',      nombre: 'Brebaje de Olas',      precio: 150, estrellas: '★☆☆', esHistoria: true },
        { key: 'pudin-nocturno',    nombre: 'Pudin Nocturno',       precio: 150, estrellas: '★☆☆', esHistoria: true },
        { key: 'caldo-algas',       nombre: 'Caldo de Algas',       precio: 200, estrellas: '★☆☆', esHistoria: false },
        { key: 'dulces-otono',      nombre: 'Dulces de Otoño',      precio: 250, estrellas: '★★☆', esHistoria: false },
        { key: 'estofado-bosque',   nombre: 'Estofado del Bosque',  precio: 300, estrellas: '★☆☆', esHistoria: false },
        { key: 'galletas-calabaza', nombre: 'Galletas de Calabaza', precio: 400, estrellas: '★★☆', esHistoria: false, esTop: true },
        { key: 'guiso-setas',       nombre: 'Guiso de Setas',       precio: 500, estrellas: '★★★', esHistoria: false, esTop: true }
    ];

    // Sintetizador de audio retro para SFX de monedas y desbloqueo
    const AudioHelper = {
        ctx: null,
        init() {
            if (!this.ctx) {
                try {
                    const AudioCtx = window.AudioContext || window['webkitAudioContext'];
                    if (AudioCtx) this.ctx = new AudioCtx();
                } catch (e) {}
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        },
        playCoinSound() {
            this.init();
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(987.77, now); // B5
                osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            } catch (e) {}
        },
        playUnlockSound() {
            this.init();
            if (!this.ctx) return;
            try {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const now = this.ctx.currentTime + (idx * 0.08);
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.25);
                });
            } catch (e) {}
        },
        playErrorSound() {
            this.init();
            if (!this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.setValueAtTime(120, now + 0.1);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } catch (e) {}
        }
    };

    const AtlantisHUD = {
        catalog: RECETAS_CATALOGO,

        // =====================================================================
        // INICIALIZACIÓN
        // =====================================================================
        init() {
            this.initStorage();
            this.startClock();
            this.renderAllCoins();
            this.setupStorageListener();
        },

        initStorage() {
            if (localStorage.getItem(STORAGE_KEY_COINS) === null) {
                localStorage.setItem(STORAGE_KEY_COINS, String(DEFAULT_COINS));
            }

            // Sincronización inicial de recetas
            let unlocked = this.getUnlockedRecipes();
            const legacyDone = localStorage.getItem(STORAGE_KEY_LEGACY) === 'true';
            const storyDone = localStorage.getItem(STORAGE_KEY_STORY) === 'true';

            if (storyDone || legacyDone) {
                // Si la historia ya estaba completada en una sesión previa, asegurar las 5 recetas
                const storyKeys = RECETAS_CATALOGO.filter(r => r.esHistoria).map(r => r.key);
                let changed = false;
                storyKeys.forEach(k => {
                    if (!unlocked.includes(k)) {
                        unlocked.push(k);
                        changed = true;
                    }
                });
                if (changed) {
                    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(unlocked));
                }
            }
        },

        setupStorageListener() {
            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_KEY_COINS) {
                    this.renderAllCoins();
                }
            });
        },

        // =====================================================================
        // GESTIÓN DE MONEDAS
        // =====================================================================
        getCoins() {
            const val = parseInt(localStorage.getItem(STORAGE_KEY_COINS), 10);
            return isNaN(val) ? DEFAULT_COINS : Math.max(0, val);
        },

        setCoins(amount) {
            const clean = Math.max(0, Math.floor(amount));
            localStorage.setItem(STORAGE_KEY_COINS, String(clean));
            this.renderAllCoins();
            window.dispatchEvent(new CustomEvent('atlantis:coinsChanged', { detail: { coins: clean } }));
        },

        addCoins(amount, _reason = '') {
            if (amount <= 0) return this.getCoins();
            const current = this.getCoins();
            const updated = current + amount;
            this.setCoins(updated);
            this.animateFloatingCoins(`+${amount} G`, 'gain');
            AudioHelper.playCoinSound();
            return updated;
        },

        spendCoins(amount, _reason = '') {
            if (amount <= 0) return true;
            const current = this.getCoins();
            if (current < amount) {
                AudioHelper.playErrorSound();
                return false;
            }
            const updated = current - amount;
            this.setCoins(updated);
            this.animateFloatingCoins(`-${amount} G`, 'spend');
            AudioHelper.playCoinSound();
            return true;
        },

        formatCoins(num) {
            return Number(num).toLocaleString('es-ES') + ' G';
        },

        renderAllCoins() {
            const formatted = this.formatCoins(this.getCoins());
            // Buscar todas las cajas de oro en la página
            const goldBoxes = document.querySelectorAll('.hud-gold-box');
            goldBoxes.forEach(box => {
                let amountSpan = box.querySelector('.hud-gold-amount');
                if (!amountSpan) {
                    // Si no tiene clase, buscar el segundo span o el span de texto
                    const spans = box.querySelectorAll('span');
                    if (spans.length >= 2) {
                        amountSpan = spans[1];
                        amountSpan.classList.add('hud-gold-amount');
                    } else if (spans.length === 1 && !spans[0].classList.contains('gold-coin')) {
                        amountSpan = spans[0];
                        amountSpan.classList.add('hud-gold-amount');
                    } else {
                        amountSpan = document.createElement('span');
                        amountSpan.className = 'hud-gold-amount';
                        box.appendChild(amountSpan);
                    }
                }
                amountSpan.textContent = formatted;
            });
        },

        animateFloatingCoins(text, type) {
            const goldBox = document.querySelector('.hud-gold-box');
            if (!goldBox) return;

            const badge = document.createElement('div');
            badge.className = `hud-floating-coin ${type}`;
            badge.textContent = text;
            goldBox.appendChild(badge);

            setTimeout(() => {
                if (badge && badge.parentNode) {
                    badge.parentNode.removeChild(badge);
                }
            }, 1200);
        },

        // =====================================================================
        // RELOJ EN TIEMPO REAL (HORA ACTUAL REAL Y FECHA)
        // =====================================================================
        startClock() {
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
        },

        updateClock() {
            const now = new Date();
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            const diaSem = diasSemana[now.getDay()];
            const diaNum = now.getDate();
            const mesNom = meses[now.getMonth()];

            // Formato de hora estilo Stardew Valley (12 horas AM/PM )
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;

            const timeString = `${hours12}:${minutes}:${seconds} ${ampm}`;
            const dateString = `${diaSem}. ${diaNum} ${mesNom}`;

            // Determinar icono sol/luna/calabaza según franja horaria
            const isNight = hours >= 20 || hours < 7;
            const clockIcon = isNight ? '🎃' : '☀️';

            // Actualizar todos los HUDs presentes en el DOM
            const clockBoxes = document.querySelectorAll('.hud-clock-box');
            clockBoxes.forEach(box => {
                const iconEl = box.querySelector('.hud-clock-icon');
                if (iconEl) {
                    // Mantener temática Halloween pero indicar día/noche sutilmente
                    iconEl.textContent = clockIcon;
                    iconEl.title = isNight ? 'Noche en Atlantis Town' : 'Día en Atlantis Town';
                }

                const dateInfo = box.querySelector('.date-info');
                if (dateInfo) {
                    let dateEl = dateInfo.querySelector('.hud-date-text');
                    let timeEl = dateInfo.querySelector('.hud-time-text');

                    if (!dateEl || !timeEl) {
                        const divs = dateInfo.querySelectorAll('div');
                        if (divs.length >= 2) {
                            dateEl = divs[0];
                            dateEl.classList.add('hud-date-text');
                            timeEl = divs[1];
                            timeEl.classList.add('hud-time-text');
                        } else {
                            dateInfo.innerHTML = `
                                <div class="hud-date-text">${dateString}</div>
                                <div class="hud-time-text">${timeString}</div>
                            `;
                            return;
                        }
                    }

                    dateEl.textContent = `${dateString} • Noche de Brujas`;
                    timeEl.textContent = timeString;
                }
            });
        },

        // =====================================================================
        // GESTIÓN DE RECETAS (COMPRA CON MONEDAS & 50% HISTORIA PRINCIPAL)
        // =====================================================================
        getUnlockedRecipes() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY_RECIPES);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) {}
            return [];
        },

        isRecipeUnlocked(recipeKey) {
            const unlocked = this.getUnlockedRecipes();
            return unlocked.includes(recipeKey);
        },

        unlockRecipe(recipeKey) {
            const unlocked = this.getUnlockedRecipes();
            if (!unlocked.includes(recipeKey)) {
                unlocked.push(recipeKey);
                localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(unlocked));
                AudioHelper.playUnlockSound();
                window.dispatchEvent(new CustomEvent('atlantis:recipesChanged', { detail: { unlocked } }));
                return true;
            }
            return false;
        },

        purchaseRecipe(recipeKey) {
            const receta = RECETAS_CATALOGO.find(r => r.key === recipeKey);
            if (!receta) return { success: false, msg: 'Receta no encontrada.' };

            if (this.isRecipeUnlocked(recipeKey)) {
                return { success: true, msg: '¡Esta receta ya está desbloqueada!' };
            }

            if (this.getCoins() < receta.precio) {
                AudioHelper.playErrorSound();
                return {
                    success: false,
                    msg: `Te faltan ${this.formatCoins(receta.precio - this.getCoins())} para desbloquear esta receta.`
                };
            }

            const spent = this.spendCoins(receta.precio, `Desbloqueo de receta: ${receta.nombre}`);
            if (spent) {
                this.unlockRecipe(recipeKey);
                return { success: true, msg: `¡Has desbloqueado "${receta.nombre}" por ${receta.precio} G!` };
            }
            return { success: false, msg: 'Error al procesar el pago.' };
        },

        isStoryCompleted() {
            return localStorage.getItem(STORAGE_KEY_STORY) === 'true' ||
                   localStorage.getItem(STORAGE_KEY_LEGACY) === 'true';
        },

        /**
         * Recompensa heroica al completar la historia principal:
         * Desbloquea la mitad (50% = 5 recetas) en equivalencia de valor y otorga 500 G de recompensa.
         */
        completeMainStory() {
            localStorage.setItem(STORAGE_KEY_STORY, 'true');
            localStorage.setItem(STORAGE_KEY_LEGACY, 'true');

            // Las 5 recetas oficiales de historia
            const storyKeys = RECETAS_CATALOGO.filter(r => r.esHistoria).map(r => r.key);
            let unlocked = this.getUnlockedRecipes();
            let addedCount = 0;

            // Primero intentar desbloquear las 5 de historia
            storyKeys.forEach(k => {
                if (!unlocked.includes(k)) {
                    unlocked.push(k);
                    addedCount++;
                }
            });

            // Si el jugador ya había comprado alguna de las de historia, desbloquear otras hasta sumar 5 recetas ganadas
            if (addedCount < 5) {
                for (const r of RECETAS_CATALOGO) {
                    if (addedCount >= 5) break;
                    if (!unlocked.includes(r.key)) {
                        unlocked.push(r.key);
                        addedCount++;
                    }
                }
            }

            localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(unlocked));

            // Recompensa de 500 G por completar la historia
            this.addCoins(500, 'Recompensa por completar la Historia Principal');
            AudioHelper.playUnlockSound();

            window.dispatchEvent(new CustomEvent('atlantis:storyCompleted', { detail: { addedRecipes: addedCount } }));
            window.dispatchEvent(new CustomEvent('atlantis:recipesChanged', { detail: { unlocked } }));

            return {
                unlockedCount: addedCount,
                bonusCoins: 500
            };
        }
    };

    // Publicar en ámbito global
    window.AtlantisHUD = AtlantisHUD;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AtlantisHUD.init());
    } else {
        AtlantisHUD.init();
    }
})();
