const firebaseConfig = {
    apiKey: "AIzaSyCHpkZmVWHvwP77s9VrrBP7pnGQEqR3z1g", 
    authDomain: "sportmafiaapp.firebaseapp.com",
    databaseURL: "https://sportmafiaapp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sportmafiaapp"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- Мультитенантность: channelId из Twitch Extension ---
let channelId = '';
function dbRef(path) { return database.ref('overlays/' + channelId + '/' + path); }

const grid = document.getElementById('main-grid');
let currentUserId = null;

// Ждем авторизацию от Twitch плеера
window.Twitch.ext.onAuthorized((auth) => {
    // Twitch выдает анонимный (opaque) ID для каждого зрителя, чтобы они могли голосовать
    currentUserId = auth.userId || auth.clientId || 'anonymous'; 
    
    if (!channelId) {
        channelId = auth.channelId;
        console.log("Twitch Extension подключено к каналу:", channelId);
        initFirebaseListeners(); // Запускаем слушателей только сейчас!
    }
});

// Создаем SVG для векторов (Граф "Кто кого подозревает")
const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svgOverlay.id = 'vector-canvas';
document.body.appendChild(svgOverlay);

// Создаем сетку игроков
for (let i = 1; i <= 10; i++) {
    const slot = document.createElement('div');
    slot.className = `player-slot slot-${i}`;
    slot.id = `player-slot-${i}`;
    
    // ОБНОВЛЕННЫЙ HTML: добавили классы player-number-text и player-score-text
    slot.innerHTML = `
        <div class="heatmap-overlay" id="heatmap-${i}"></div>
        <div class="foul-container" id="foul-container-${i}"></div>
        <div class="role-badge" id="role-badge-${i}"></div>
        
        <div class="slot-label" id="label-${i}">
            <span class="player-number-text">№${i}</span><br>
            <span class="player-score-text" id="status-${i}">0</span>
        </div>
        
        <div class="lie-detector-container" id="lie-detector-${i}"><div class="lie-detector-bar"></div></div>
        
        <div class="tutorial-tooltip" id="tut-${i}">Это игрок #${i}. Чат оценивает его "красноту".</div>
        
        <input type="range" min="-10" max="10" value="0" class="color-slider" id="slider-${i}">
        
        <div class="mvp-group" id="mvp-group-${i}">
            <button class="mvp-btn mvp-red" onclick="voteMVP(${i}, 'red')" title="Лучший красный">🔴</button>
            <button class="mvp-btn mvp-black" onclick="voteMVP(${i}, 'black')" title="Лучший черный">⚫</button>
            <button class="mvp-btn mvp-wtf" onclick="voteMVP(${i}, 'wtf')" title="Слом мозга">🤯</button>
        </div>
    `;
    grid.appendChild(slot);

    const slider = document.getElementById(`slider-${i}`);
    const statusText = document.getElementById(`status-${i}`);
    const currentSlot = document.getElementById(`player-slot-${i}`);

    // ОБНОВЛЕННАЯ ЛОГИКА ЦВЕТОВ
    slider.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        
        // 1. Меняем фон всего круга
        let bgColor = 'rgb(255, 255, 255)'; // Белый по умолчанию (0)
        if (val > 0) {
            // Уводим в красный: отнимаем зеленый и синий
            let gb = Math.round(255 - (val / 10) * 255);
            bgColor = `rgb(255, ${gb}, ${gb})`; 
        } else if (val < 0) {
            // Уводим в черный: отнимаем все цвета (от 255 до 0)
            let rgb = Math.round(255 - (Math.abs(val) / 10) * 255);
            bgColor = `rgb(${rgb}, ${rgb}, ${rgb})`;
        }
        currentSlot.style.backgroundColor = bgColor;

        // 2. Обновляем цифру (цвет текста теперь задается жестко через CSS, нам нужны только символы)
        if (val === 0) { 
            statusText.innerText = "0"; 
        } else if (val > 0) { 
            statusText.innerText = `+${val}`; 
        } else { 
            statusText.innerText = `${val}`; 
        }
    });

    slider.addEventListener('change', (e) => {
        if (!currentUserId || !channelId) return; // Защита от кликов до загрузки
        dbRef(`votes/${i}/${currentUserId}`).set({ score: parseInt(e.target.value) });
    });
}

// Глобальная функция для голосования за MVP (3 категории)
window.voteMVP = (player, category) => {
    if (!currentUserId || !channelId) return;
    dbRef(`mvpVotes/${category}/${currentUserId}`).set(player);
    document.querySelectorAll(`#mvp-group-${player} .mvp-btn`).forEach(b => b.classList.add('voted'));
    setTimeout(() => { document.querySelectorAll('.mvp-btn').forEach(b => b.classList.remove('voted')); }, 1000);
}

// Контейнеры для глобальных алертов и дуэли
const voiceAvatarContainer = document.createElement('div'); voiceAvatarContainer.id = 'voice-avatar-container'; document.body.appendChild(voiceAvatarContainer);
const highlightMsgContainer = document.createElement('div'); highlightMsgContainer.id = 'highlight-msg-container'; document.body.appendChild(highlightMsgContainer);
const sheriffDuelContainer = document.createElement('div'); sheriffDuelContainer.id = 'sheriff-duel-container'; document.body.appendChild(sheriffDuelContainer);

// --- Слушатели команд от Стримера (запускаются ТОЛЬКО после получения ID канала) ---
function initFirebaseListeners() {

    // Слушатели очков для Heatmap (по каждому игроку)
    for (let i = 1; i <= 10; i++) {
        const heatmapElement = document.getElementById(`heatmap-${i}`);
        dbRef(`votes/${i}`).on('value', snap => {
            let votes = snap.val() || {};
            let sum = 0, count = 0;
            for(let u in votes) { sum += votes[u].score; count++; }
            let avg = count > 0 ? (sum/count) : 0;
            
            if(avg > 0) heatmapElement.style.background = `rgba(255, 0, 0, ${Math.abs(avg)/15})`;
            else if (avg < 0) heatmapElement.style.background = `rgba(0, 0, 0, ${Math.abs(avg)/15})`;
            else heatmapElement.style.background = 'transparent';
        });
    }

    dbRef('gameState/overlayHidden').on('value', snap => { grid.style.display = snap.val() ? 'none' : 'grid'; });

    // Режим MVP (Тройной)
    dbRef('gameState/mvpMode').on('value', snap => {
        const isMVP = snap.val();
        document.querySelectorAll('.color-slider').forEach(s => s.style.display = isMVP ? 'none' : 'block');
        document.querySelectorAll('.mvp-group').forEach(b => b.style.display = isMVP ? 'flex' : 'none');
        document.querySelectorAll('.slot-label').forEach(l => l.style.display = isMVP ? 'none' : 'block');
    });

    // Хардкор режим (Слепое голосование)
    dbRef('gameState/blindMode').on('value', snap => {
        const isBlind = snap.val();
        document.querySelectorAll('.vote-status').forEach(el => el.style.opacity = isBlind ? '0' : '1');
        document.querySelectorAll('.color-slider').forEach(el => el.classList.toggle('blind', isBlind));
    });

    dbRef('gameState/heatmap').on('value', snap => {
        const isHeatmap = snap.val();
        document.querySelectorAll('.heatmap-overlay').forEach(el => el.style.display = isHeatmap ? 'block' : 'none');
    });

    // Режим Новичка (Тултипы)
    dbRef('gameState/tutorial').on('value', snap => {
        document.querySelectorAll('.tutorial-tooltip').forEach(el => el.style.display = snap.val() ? 'block' : 'none');
    });

    // Spotlight (Луч внимания)
    dbRef('gameState/spotlight').on('value', snap => {
        const data = snap.val();
        if(!data) {
            document.querySelectorAll('.player-slot').forEach(el => { el.classList.remove('spotlight-target'); el.classList.remove('spotlight-dim'); });
            return;
        }
        document.querySelectorAll('.player-slot').forEach(el => el.classList.add('spotlight-dim'));
        const target = document.getElementById(`player-slot-${data.player}`);
        if(target) { target.classList.remove('spotlight-dim'); target.classList.add('spotlight-target'); }
        setTimeout(() => { document.querySelectorAll('.player-slot').forEach(el => { el.classList.remove('spotlight-target'); el.classList.remove('spotlight-dim'); }); }, 10000);
    });

    // Эмодзи Дождь (Обычные голоса +-10)
    dbRef('gameState/emojiRain').on('value', snap => {
        const data = snap.val();
        if(!data) return;
        const slot = document.getElementById(`player-slot-${data.player}`);
        if(!slot) return;

        for(let i=0; i<5; i++) {
            setTimeout(() => {
                let emoji = document.createElement('div');
                emoji.className = 'falling-emoji';
                emoji.innerText = data.type === 'red' ? '🩸' : '🦇'; 
                emoji.style.left = Math.random() * 80 + '%';
                slot.appendChild(emoji);
                setTimeout(() => emoji.remove(), 2000);
            }, i * 150);
        }
    });

    // Фолы (Спортивная мафия)
    dbRef('gameState/fouls').on('value', snap => {
        const fouls = snap.val() || {};
        for(let i=1; i<=10; i++) {
            const container = document.getElementById(`foul-container-${i}`);
            if(container) {
                container.innerHTML = '';
                let count = fouls[i] || 0;
                for(let j=0; j<count; j++) {
                    let card = document.createElement('div');
                    card.className = (j===3) ? 'foul-card red-card' : 'foul-card yellow-card';
                    container.appendChild(card);
                }
            }
        }
    });

    // Детектор Лжи (+ / - в чат)
    dbRef('gameState/lieDetector').on('value', snap => {
        const data = snap.val();
        document.querySelectorAll('.lie-detector-container').forEach(el => el.style.display = 'none');
        
        if(data && data.speaker) {
            const container = document.getElementById(`lie-detector-${data.speaker}`);
            if(container) {
                container.style.display = 'block';
                const bar = container.querySelector('.lie-detector-bar');
                let percent = 50 + (data.score || 0); 
                percent = Math.max(0, Math.min(100, percent));
                bar.style.width = percent + '%';
                bar.style.background = percent > 50 ? '#00ff00' : (percent < 50 ? '#ff0000' : '#ffff00');
            }
        }
    });

    // Векторы Атаки (!sus)
    let currentVectors = null; // Храним текущие векторы для перерисовки

    function drawVectors() {
        svgOverlay.innerHTML = ''; // Очистка
        if(!currentVectors) return;
        
        for(let key in currentVectors) {
            let [from, to] = key.split('-');
            let elFrom = document.getElementById(`player-slot-${from}`);
            let elTo = document.getElementById(`player-slot-${to}`);
            
            if(elFrom && elTo) {
                let rect1 = elFrom.getBoundingClientRect();
                let rect2 = elTo.getBoundingClientRect();
                
                let x1 = rect1.left + rect1.width/2;
                let y1 = rect1.top + rect1.height/2;
                let x2 = rect2.left + rect2.width/2;
                let y2 = rect2.top + rect2.height/2;
                
                let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1);
                line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'rgba(255, 0, 0, 0.6)');
                line.setAttribute('stroke-width', '4');
                line.setAttribute('stroke-dasharray', '5,5');
                svgOverlay.appendChild(line);
            }
        }
    }

    dbRef('gameState/vectors').on('value', snap => {
        currentVectors = snap.val();
        drawVectors();
    });

    // Перерисовываем линии, если зритель изменил размер окна плеера
    window.addEventListener('resize', drawVectors);

    // Дуэль Шерифов (!real)
    let activeDuel = null;
    dbRef('gameState/duel').on('value', snap => {
        activeDuel = snap.val();
        if(!activeDuel) { sheriffDuelContainer.style.display = 'none'; return; }
        
        sheriffDuelContainer.style.display = 'flex';
        sheriffDuelContainer.innerHTML = `
            <div class="duel-bar">
                <div class="duel-side p1" id="duel-bar-1">#${activeDuel.p1}</div>
                <div class="duel-side p2" id="duel-bar-2">#${activeDuel.p2}</div>
            </div>
        `;
    });
    dbRef('gameState/duelVotes').on('value', snap => {
        if(!activeDuel) return;
        const votes = snap.val() || {};
        let c1 = 0, c2 = 0;
        for(let u in votes) { if(votes[u] === activeDuel.p1) c1++; else if(votes[u] === activeDuel.p2) c2++; }
        
        let total = c1 + c2;
        let p1Percent = total === 0 ? 50 : (c1/total)*100;
        let b1 = document.getElementById('duel-bar-1');
        let b2 = document.getElementById('duel-bar-2');
        if(b1 && b2) {
            b1.style.width = p1Percent + '%'; b1.innerText = `#${activeDuel.p1} (${c1})`;
            b2.style.width = (100 - p1Percent) + '%'; b2.innerText = `#${activeDuel.p2} (${c2})`;
        }
    });

    // Эмодзи-жесты чата
    dbRef('gameState/gestures').on('value', snap => {
        const data = snap.val();
        if(!data) return;
        
        let emojiMap = {
            'попил': '⚖️', 'шериф': '🕵️', 'черный': '⚫', 'красный': '🔴', 'пас': '⏭️'
        };
        let icon = emojiMap[data.type] || '❓';
        
        let el = document.createElement('div');
        el.className = 'gesture-icon';
        el.innerHTML = `${icon}<br><span style="font-size:10px">${data.user}</span>`;
        el.style.left = (20 + Math.random() * 60) + '%';
        el.style.top = (20 + Math.random() * 60) + '%';
        document.body.appendChild(el);
        
        setTimeout(() => el.remove(), 3000);
    });

    // Хайлайт сообщения
    dbRef('gameState/highlightMsg').on('value', snap => {
        const data = snap.val();
        if(!data) return;
        highlightMsgContainer.innerHTML = `<div class="msg-box"><span class="msg-author">${data.user}:</span> ${data.text}</div>`;
        highlightMsgContainer.style.display = 'flex';
        setTimeout(() => { highlightMsgContainer.style.display = 'none'; }, 6000);
    });

    // Аватар Голоса Народа (с Рангом)
    dbRef('gameState/voiceAvatar').on('value', snap => {
        const data = snap.val();
        if(!data) return;
        voiceAvatarContainer.innerHTML = `<div class="voice-box">👑 ${data.rank}: <b>${data.user}</b></div>`;
        voiceAvatarContainer.style.display = 'flex';
        setTimeout(() => { voiceAvatarContainer.style.display = 'none'; }, 8000);
    });

    // Раскрытие ролей
    dbRef('gameState/revealRoles').on('value', snap => {
        if(snap.val()) {
            dbRef('gameState/roles').once('value', rolesSnap => {
                const roles = rolesSnap.val() || {};
                for(let i=1; i<=10; i++) {
                    const badge = document.getElementById(`role-badge-${i}`);
                    const r = roles[i];
                    if(r && r !== 'unknown') {
                        badge.style.display = 'flex';
                        badge.className = `role-badge role-${r}`;
                        if(r==='don') badge.innerText = 'Д';
                        if(r==='mafia') badge.innerText = 'М';
                        if(r==='sheriff') badge.innerText = 'Ш';
                        if(r==='citizen') badge.innerText = 'МР';
                    }
                }
            });
        } else {
            document.querySelectorAll('.role-badge').forEach(b => b.style.display = 'none');
        }
    });

} // Конец функции initFirebaseListeners