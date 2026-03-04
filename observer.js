// --- Настройки игры ---
const MATCH_ID = '00000000-0000-0000-0000-000000000002';
const TOTAL_PLAYERS = 10;

// --- Socket.IO с Firebase Auth ---
// Сокет создаётся с autoConnect: false, чтобы сначала получить токен.
// Как только Firebase подтвердит аутентификацию пользователя — мы подключаемся
// с его ID-токеном. Сервер проверит токен через firebase-admin и идентифицирует юзера.
const socket = io('https://mafia-api-9z0w.onrender.com', {
  autoConnect: false,  // не коннектиться до получения токена
});

socket.on('connect',        () => console.log('[socket] observer connected:', socket.id));
socket.on('error_msg',      (e) => console.error('[socket] server error:', e.message));
socket.on('observer_saved', (d) => console.log('[socket] saved:', d));
socket.on('connect_error',  (e) => console.error('[socket] connect error:', e.message));

// Ждём, пока Firebase определит состояние авторизации,
// затем берём свежий ID-токен и подключаемся к сокету.
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    console.warn('[auth] Пользователь не авторизован. Сокет не подключён.');
    return;
  }
  try {
    const token = await user.getIdToken(/* forceRefresh */ true);
    socket.auth = { token };  // передаём токен в handshake
    socket.connect();
    console.log('[auth] Подключаемся к сокету как:', user.uid);
  } catch (err) {
    console.error('[auth] Не удалось получить ID-токен:', err);
  }
});

// Обновляем токен при его истечении (каждый час) и переподключаемся
setInterval(async () => {
  const user = firebase.auth().currentUser;
  if (!user || !socket.connected) return;
  try {
    const token = await user.getIdToken(/* forceRefresh */ true);
    socket.auth = { token };
    socket.disconnect().connect();  // переконнект со свежим токеном
  } catch (err) {
    console.error('[auth] Не удалось обновить токен:', err);
  }
}, 55 * 60 * 1000);  // 55 минут — чуть меньше 1-часового TTL токена
const TOTAL_VIEWERS = 1000;
const SCORE_MULTIPLIER = 50; // Множитель для штрафов и базы

// Истинные роли (Для теста. Позже можно брать из базы)
const actualBlacks = [1, 2, 3];
const actualDon = 3;       // Дон — один из чёрных
const actualSheriff = 7;   // Шериф — один из красных
const actualWinner = 'red';  // Победившая команда: 'red' | 'black'
const actualFirstKill = 4;   // Номер игрока, убитого в 1-ю ночь
let gameStartTime = Date.now();
let activePlayerId = null; // Какой игрок сейчас в модалке

// Макро-ставки пользователя
let betWinner    = null;  // 'red' | 'black' | null
let betFirstKill = null;  // number | null

// Игровые дни
let currentDay = 0;  // 0..3 — день, когда сделана ставка

// Данные для shareResult()
let _lastRankTitle  = '';
let _lastPercentile = '';
let _lastScore      = 0;

// Состояние ставок пользователя и симуляция толпы
let gameData = {};

function initGame() {
    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
        // Симуляция толпы:
        // Средняя ставка от -8 до +8
        const crowdAvg = (Math.random() * 16 - 8).toFixed(1); 
        // Процент зрителей, которые угадали цвет (от 10% до 90%)
        const crowdCorrectPercent = 0.1 + (Math.random() * 0.8); 

        gameData[i] = {
            val: 0,              // Текущая ставка (-10 до 10)
            betTime: null,       // Время ПЕРВОЙ ставки
            betDay: null,        // День (0-3) последней ставки
            penalties: 0,        // Сумма штрафов (единицах по 0.5)
            crowdAvg: parseFloat(crowdAvg),
            crowdPct: crowdCorrectPercent,
            specialRole: null    // null | 'sheriff' | 'don'
        };
    }
    renderGrid();
}

// --- Логика UI ---
function renderGrid() {
    const grid = document.getElementById('bet-grid');
    grid.innerHTML = ''; // Очищаем сетку перед перерисовкой

    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
        const d = gameData[i];
        const div = document.createElement('div');
        
        // Определяем цвет и текст значения ставки
        let valClass = 'val-zero';
        let valText = d.val; // По умолчанию просто ноль
        if (d.val > 0) {
            valClass = 'val-red';
            valText = '+' + d.val; // Добавляем плюс для красных
        } else if (d.val < 0) {
            valClass = 'val-black';
            valText = d.val; // Минус уже есть в числе
        }

        // Форматируем текст толпы
        const crowdText = d.val !== 0 ? (d.crowdAvg > 0 ? '+' + d.crowdAvg : d.crowdAvg) : '?';

        // Иконка спец-роли
        let roleBadge = '';
        if (d.specialRole === 'sheriff') roleBadge = '<div style="font-size:0.8em; margin-top:4px;">👮‍♂️</div>';
        else if (d.specialRole === 'don') roleBadge = '<div style="font-size:0.8em; margin-top:4px;">🎩</div>';

        div.className = 'bet-card';
        
        // ВАЖНО: Формируем красивую HTML-структуру внутри карточки
        div.innerHTML = `
            <div class="penalty-badge" style="display: ${d.penalties > 0 ? 'block' : 'none'}">
                -${d.penalties}
            </div>

            <div class="player-num">${i}</div>

            <div class="bet-value ${valClass}">${valText}</div>

            ${roleBadge}

            <div class="crowd-stat">Толпа: ${crowdText}</div>
        `;
        
        // Добавляем обработчик клика
        div.onclick = () => openModal(i);
        // Добавляем карточку в сетку
        grid.appendChild(div);
    }
    updateScoreUI(); // Обновляем общий счет
}

// --- Модальное окно и ползунок ---
// --- Переключатель дня ---
function setDay(day) {
    currentDay = day;
    for (let d = 0; d <= 3; d++) {
        document.getElementById(`day-btn-${d}`).classList.toggle('active', d === day);
    }
}

// --- Макро-ставки UI ---
function setWinnerBet(team) {
    betWinner = team;
    document.getElementById('btn-winner-red').classList.toggle('active-red',   team === 'red');
    document.getElementById('btn-winner-black').classList.toggle('active-black', team === 'black');
    updateScoreUI();
}

function setFirstKillBet(val) {
    betFirstKill = val ? Number(val) : null;
    updateScoreUI();
}

// Переключение спец-роли в модалке
let activeSpecialRole = null;

function toggleRole(role) {
    if (activeSpecialRole === role) {
        activeSpecialRole = null; // Снимаем при повторном нажатии
    } else {
        activeSpecialRole = role;
    }
    updateRoleUI();
}

function updateRoleUI() {
    const btnSheriff = document.getElementById('btn-sheriff');
    const btnDon     = document.getElementById('btn-don');
    btnSheriff.className = 'role-btn' + (activeSpecialRole === 'sheriff' ? ' active-sheriff' : '');
    btnDon.className     = 'role-btn' + (activeSpecialRole === 'don'     ? ' active-don'     : '');
}

function openModal(playerId) {
    activePlayerId = playerId;
    const d = gameData[playerId];
    
    document.getElementById('modal-player-title').innerText = `Игрок №${playerId}`;
    const slider = document.getElementById('bet-slider');
    slider.value = d.val;
    updateSliderUI();

    // Восстанавливаем выбор спец-роли
    activeSpecialRole = d.specialRole;
    updateRoleUI();
    
    document.getElementById('slider-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('slider-modal').style.display = 'none';
    activePlayerId = null;
}

function updateSliderUI() {
    const val = parseInt(document.getElementById('bet-slider').value);
    const textEl = document.getElementById('modal-current-val');
    
    if (val > 0) { textEl.innerText = '+' + val; textEl.className = 'current-slider-val val-red'; }
    else if (val < 0) { textEl.innerText = val; textEl.className = 'current-slider-val val-black'; }
    else { textEl.innerText = '0'; textEl.className = 'current-slider-val val-zero'; }
}

// --- Умные Штрафы и Сохранение ---
function saveBet() {
    const newVal = parseInt(document.getElementById('bet-slider').value);
    const d = gameData[activePlayerId];
    const oldVal = d.val;

    if (newVal !== oldVal) {
        // Логика штрафа -0.5
        let applyPenalty = true;

        if (oldVal === 0) {
            applyPenalty = false; // Первая ставка - без штрафа
            if (!d.betTime) d.betTime = Date.now(); // Фиксируем время первой ставки для гонки
        } 
        else if (oldVal > 0 && newVal > 0) {
            applyPenalty = false; // Метания в плюсе (красном) - без штрафа
        } 
        else if (oldVal < 0 && newVal < oldVal) {
            applyPenalty = false; // Углубление в минус - без штрафа (например -2 -> -8)
        }

        if (applyPenalty) {
            d.penalties += 0.5;
        }

        d.val = newVal;
    }

    // Фиксируем день последней ставки
    d.betDay = currentDay;

    // Уникальность спец-ролей: снимаем дубли у остальных игроков
    if (activeSpecialRole === 'don' || activeSpecialRole === 'sheriff') {
        for (let j = 1; j <= TOTAL_PLAYERS; j++) {
            if (j !== activePlayerId && gameData[j].specialRole === activeSpecialRole) {
                gameData[j].specialRole = null;
            }
        }
    }

    // Сохраняем выбор спец-роли
    d.specialRole = activeSpecialRole;

    // --- Отправка в БД через Socket.IO ---
    socket.emit('observer_move', {
        match_id:     MATCH_ID,
        seat_number:  activePlayerId,
        value:        newVal,
        specialRole:  activeSpecialRole,
    });

    closeModal();
    renderGrid();
}

// --- Подсчет Очков ---
function calculateScore() {
    let totalScore = 0;
    const log = [];

    // Аккумуляторы для лога
    let correctBasePoints = 0, wrongBasePoints = 0;
    let speedBonusTotal   = 0, wolfBonusCount   = 0;
    let dayBonusTotal     = 0, penaltyTotal      = 0;
    let correctCount      = 0, wrongCount        = 0;

    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
        const d = gameData[i];
        if (d.val === 0) continue;

        const isActuallyBlack = actualBlacks.includes(i);
        const betIsBlack = d.val < 0;
        const isCorrect  = (isActuallyBlack && betIsBlack) || (!isActuallyBlack && !betIsBlack);

        const baseReward  = (1 - d.crowdPct) * 500;
        const betStrength = Math.abs(d.val) / 10;
        let points        = baseReward * betStrength;

        if (isCorrect) {
            correctCount++;
            const secondsSinceStart = Math.floor(((d.betTime || gameStartTime) - gameStartTime) / 1000);
            const speedBonus = Math.max(0, 150 - (secondsSinceStart * 3));
            speedBonusTotal += speedBonus;

            let wolfMultiplier = 1;
            if ((betIsBlack && d.crowdAvg > 2) || (!betIsBlack && d.crowdAvg < -2)) {
                wolfMultiplier = 2;
                wolfBonusCount++;
            }
            points = (points * wolfMultiplier) + speedBonus;
            correctBasePoints += points;
        } else {
            wrongCount++;
            wrongBasePoints += points;
            points = -points;
        }

        // Множитель дня
        const dayMults = [3, 2, 1.5, 1];
        const dayMult  = (d.betDay !== null && dayMults[d.betDay] !== undefined) ? dayMults[d.betDay] : 1;
        const beforeMult = points;
        points *= dayMult;
        if (dayMult !== 1) dayBonusTotal += (points - beforeMult);

        // Штрафы
        const penaltyDeduction = d.penalties * SCORE_MULTIPLIER * 2;
        penaltyTotal += penaltyDeduction;

        totalScore += (points - penaltyDeduction);
    }

    // === Строим лог ===
    if (correctCount > 0) {
        const plural = correctCount === 1 ? 'игрока' : 'игроков';
        log.push({ text: `✅ Угадал ${correctCount} ${plural}`, value: Math.floor(correctBasePoints), color: '#69f0ae' });
    }
    if (wrongCount > 0) {
        const plural = wrongCount === 1 ? 'игроку' : 'игрокам';
        log.push({ text: `❌ Ошибся по ${wrongCount} ${plural}`, value: -Math.floor(wrongBasePoints), color: '#ff5252' });
    }
    if (speedBonusTotal > 0) {
        log.push({ text: '⚡ Бонус скорости', value: `+${Math.floor(speedBonusTotal)}`, color: '#ffb300' });
    }
    if (wolfBonusCount > 0) {
        log.push({ text: `🐺 Одинокий волк (${wolfBonusCount}×)`, value: '×2 к ставкам', color: '#ce93d8' });
    }
    if (currentDay < 3 && (correctCount + wrongCount) > 0) {
        const dayMults = [3, 2, 1.5, 1];
        const dm = dayMults[currentDay] ?? 1;
        log.push({ text: `📅 Множитель Дня ${currentDay}`, value: `×${dm}`, color: '#00e676' });
    }
    if (penaltyTotal > 0) {
        log.push({ text: '⚠️ Штрафы за смену цвета', value: -Math.floor(penaltyTotal), color: '#ff7043' });
    }

    // Бонусы/штрафы за спец-роли
    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
        const d = gameData[i];
        if (d.specialRole === 'sheriff') {
            const hit = i === actualSheriff;
            totalScore += hit ? 1000 : -500;
            log.push({ text: `👮 Шериф → Игрок ${i}`, value: hit ? 1000 : -500, color: hit ? 'gold' : '#ff5252' });
        } else if (d.specialRole === 'don') {
            const hit = i === actualDon;
            totalScore += hit ? 1000 : -500;
            log.push({ text: `🎩 Дон → Игрок ${i}`, value: hit ? 1000 : -500, color: hit ? 'gold' : '#ff5252' });
        }
    }

    // Макро: первая кровь
    if (betFirstKill !== null) {
        const hit = betFirstKill === actualFirstKill;
        if (hit) totalScore += 500;
        log.push({
            text: `🩸 Первая кровь — Игрок ${betFirstKill}`,
            value: hit ? '+500' : '0',
            color: hit ? '#69f0ae' : '#ff7043'
        });
    }

    // Макро: победитель (итоговый множитель ко всему)
    if (betWinner !== null) {
        const mult     = betWinner === actualWinner ? 1.5 : 0.5;
        const before   = Math.floor(totalScore);
        totalScore    *= mult;
        const after    = Math.floor(totalScore);
        const diffStr  = after - before >= 0 ? `+${after - before}` : `${after - before}`;
        const teamName = betWinner === 'red' ? '🔴 Город' : '⚫ Мафия';
        log.push({
            text: `🏆 Победитель (${teamName}) ×${mult}`,
            value: diffStr,
            color: mult === 1.5 ? '#69f0ae' : '#ff5252'
        });
    }

    return { total: Math.floor(totalScore), log };
}

function updateScoreUI() {
    document.getElementById('current-score').innerText = calculateScore().total;
    updateBalanceRadar();
}

function updateBalanceRadar() {
    let mafiaCount   = 0;
    let donCount     = 0;
    let sheriffCount = 0;

    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
        const d = gameData[i];
        if (d.val < 0)                   mafiaCount++;
        if (d.specialRole === 'don')     donCount++;
        if (d.specialRole === 'sheriff') sheriffCount++;
    }

    const radarMafia   = document.getElementById('radar-mafia');
    const radarDon     = document.getElementById('radar-don');
    const radarSheriff = document.getElementById('radar-sheriff');

    radarMafia.querySelector('.chip-val').textContent   = `${mafiaCount} / 3`;
    radarDon.querySelector('.chip-val').textContent     = `${donCount} / 1`;
    radarSheriff.querySelector('.chip-val').textContent = `${sheriffCount} / 1`;

    radarMafia.classList.toggle('over-limit',   mafiaCount > 3);
    radarDon.classList.toggle('over-limit',     donCount > 1);
    radarSheriff.classList.toggle('over-limit', sheriffCount > 1);
}

// --- Финал и Расчет Рейтинга (КИНЕМАТОГРАФИЧЕСКОЕ ВСКРЫТИЕ) ---
async function revealRoles() {
    const myScore = calculateScore().total;

    // Показываем оверлей
    const overlay = document.getElementById('reveal-overlay');
    overlay.style.display = 'block';

    // Строим мини-карточки
    const grid = document.getElementById('reveal-grid');
    grid.innerHTML = '';
    const cards = [];
    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
        const card = document.createElement('div');
        card.className = 'reveal-card';
        card.id = `rc-${i}`;
        card.innerHTML = `
            <div class="rc-num">${i}</div>
            <div class="rc-role">?</div>
            <div class="rc-verdict"></div>
        `;
        grid.appendChild(card);
        cards.push(card);
    }

    // Анимация: открываем по одной карточке каждые 400мс
    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
        await new Promise(res => setTimeout(res, 400));

        const d = gameData[i];
        const card = cards[i - 1];

        // Определяем реальную роль
        let roleIcon, roleClass;
        if (i === actualDon) {
            roleIcon = '🎩 Дон'; roleClass = 'role-don';
        } else if (i === actualSheriff) {
            roleIcon = '👮‍♂️ Шериф'; roleClass = 'role-sheriff';
        } else if (actualBlacks.includes(i)) {
            roleIcon = '⚫ Мафия'; roleClass = 'role-black';
        } else {
            roleIcon = '🔴 Мирный'; roleClass = 'role-red';
        }

        // Определяем, угадал ли зритель: цвет + спец-роль
        const betIsBlack = d.val < 0;
        const isActuallyBlack = actualBlacks.includes(i);
        const colorCorrect = d.val !== 0 && ((isActuallyBlack && betIsBlack) || (!isActuallyBlack && !betIsBlack));

        let verdict = '';
        if (d.val === 0 && !d.specialRole) {
            verdict = '➖'; // Не ставил
        } else {
            let hit = colorCorrect;
            if (d.specialRole === 'sheriff') hit = (i === actualSheriff);
            else if (d.specialRole === 'don')    hit = (i === actualDon);
            verdict = hit ? '✅' : '❌';
        }

        card.querySelector('.rc-role').textContent = roleIcon;
        card.querySelector('.rc-verdict').textContent = verdict;
        card.classList.add(roleClass, 'visible');
    }

    // После всех карточек — показываем макро-результаты
    await new Promise(res => setTimeout(res, 600));

    const winnerName  = actualWinner === 'red' ? 'ГОРОД 🔴' : 'МАФИЯ ⚫';
    const winnerOk    = betWinner !== null && betWinner === actualWinner;
    const winnerMiss  = betWinner !== null && betWinner !== actualWinner;
    const multText    = betWinner === null ? '<span style="color:#666">не поставил (x1.0)</span>'
                      : winnerOk  ? '<span class="macro-res-ok">✅ Угадал! Множитель ×1.5</span>'
                      :              '<span class="macro-res-fail">❌ Ошибка! Множитель ×0.5</span>';

    const firstKillOk = betFirstKill !== null && betFirstKill === actualFirstKill;
    const fkText      = betFirstKill === null
        ? '<span style="color:#666">не поставил</span>'
        : firstKillOk
            ? `<span class="macro-res-ok">✅ Угадал! Игрок ${actualFirstKill} (+500 очков)</span>`
            : `<span class="macro-res-fail">❌ Ошибка. Убит Игрок ${actualFirstKill}</span>`;

    const macroEl = document.getElementById('reveal-macro-results');
    macroEl.innerHTML = `
        <div class="macro-res-row">
            <span class="macro-res-label">🏆 Победитель:</span>
            <span class="macro-res-val">${winnerName}</span>
            <span>—</span>
            ${multText}
        </div>
        <div class="macro-res-row">
            <span class="macro-res-label">🩸 Первая кровь:</span>
            ${fkText}
        </div>
    `;
    macroEl.classList.add('visible');

    await new Promise(res => setTimeout(res, 500));

    // Финальный счёт (уже включает макро-множитель)
    const { total: finalScore, log: scoreLog } = calculateScore();

    // Рейтинг среди толпы
    let crowdScores = [];
    for (let i = 0; i < TOTAL_VIEWERS; i++) {
        let s = 800 + (Math.random() * 2000 - 1000) + (Math.random() * 1500);
        crowdScores.push(s);
    }
    crowdScores.push(finalScore);
    crowdScores.sort((a, b) => b - a);
    const myRank = crowdScores.indexOf(finalScore) + 1;
    const percentile = ((myRank / (TOTAL_VIEWERS + 1)) * 100).toFixed(1);

    let rankTitle = '🤔 Среднячок';
    let rankColor = '#aaa';
    if      (percentile < 5)  { rankTitle = '🏆 ЛЕГЕНДА АНАЛИТИКИ'; rankColor = 'gold'; }
    else if (percentile < 20) { rankTitle = '🔥 Профессионал';       rankColor = '#ff7043'; }
    else if (percentile > 80) { rankTitle = '🤡 Корм для Мафии';     rankColor = '#ef5350'; }

    const resultsEl = document.getElementById('reveal-results');
    document.getElementById('res-score').textContent = finalScore;
    document.getElementById('res-rank').textContent  = `Место ${myRank} из ${TOTAL_VIEWERS + 1} зрителей`;
    const titleEl = document.getElementById('res-title');
    titleEl.textContent  = rankTitle;
    titleEl.style.color  = rankColor;
    document.getElementById('res-pct').textContent = `Топ-${percentile}% лучших зрителей`;

    // Сохраняем для shareResult()
    _lastRankTitle  = rankTitle;
    _lastPercentile = percentile;
    _lastScore      = finalScore;

    // Детализация счёта
    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = '';
    for (const item of scoreLog) {
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        const valStr = typeof item.value === 'number'
            ? (item.value >= 0 ? `+${item.value}` : `${item.value}`)
            : item.value;
        row.innerHTML = `<span class="breakdown-label">${item.text}</span><span class="breakdown-value" style="color:${item.color}">${valStr}</span>`;
        breakdown.appendChild(row);
    }

    resultsEl.classList.add('visible');
}

// --- Поделиться результатом ---
function shareResult() {
    const winnerGuess = betWinner === null
        ? '➖ не ставил'
        : betWinner === actualWinner ? '✅ Да' : '❌ Нет';
    const firstKillGuess = betFirstKill === null
        ? '➖ не ставил'
        : betFirstKill === actualFirstKill ? '✅ Да' : '❌ Нет';

    const text =
`👁️ Тотализатор Мафии
🏆 Статус: ${_lastRankTitle} (Топ-${_lastPercentile}%)
💰 Очки: ${_lastScore}
🏅 Победитель угадан: ${winnerGuess}
🩸 Первая кровь угадана: ${firstKillGuess}
📅 День старта ставок: День ${currentDay}`;

    navigator.clipboard.writeText(text)
        .then(() => alert('✅ Результат скопирован в буфер обмена!'))
        .catch(() => alert(text));
}

// Запуск
document.addEventListener('DOMContentLoaded', initGame);