window.onerror = function(message, source, lineno, colno, error) {
    var errorBox = document.getElementById('error-log');
    if(errorBox) {
        if(message && message.indexOf && message.indexOf('ResizeObserver') > -1) return;
        if(message === 'Script error.' && lineno === 0) return;
        errorBox.style.display = 'block';
        errorBox.innerText += "CRITICAL ERROR: " + message + " (Line " + lineno + ")\n";
    }
};

// ============================================================
// === ROUTING: Mode-to-File mapping and page navigation ===
// ============================================================
var MODE_FILE_MAP = {
    'newbie': 'index.html', 'easy': 'index.html', 'hard': 'index.html',
    'nightmare': 'index.html', 'impossible': 'index.html', 'calc': 'index.html',
    'automatch_newbie': 'automatch.html', 'automatch_easy': 'automatch.html',
    'automatch_hard': 'automatch.html', 'automatch_nightmare': 'automatch.html',
    'automatch_impossible': 'automatch.html', 'automatch_calc': 'automatch.html',
    'winchester_newbie': 'winchester.html', 'winchester_easy': 'winchester.html',
    'winchester_hard': 'winchester.html', 'winchester_nightmare': 'winchester.html',
    'winchester_impossible': 'winchester.html', 'winchester_calc': 'winchester.html',
    'ahalay_newbie': 'ahalay.html', 'ahalay_easy': 'ahalay.html',
    'ahalay_hard': 'ahalay.html', 'ahalay_nightmare': 'ahalay.html',
    'ahalay_impossible': 'ahalay.html', 'ahalay_calc': 'ahalay.html',
    'wolverine_easy': 'wolverine.html', 'wolverine_hard': 'wolverine.html',
    'who_newbie': 'who.html', 'who_easy': 'who.html',
    'who_hard': 'who.html', 'who_nightmare': 'who.html',
    'who_impossible': 'who.html', 'who_calc': 'who.html',
    'mantis_newbie': 'mantis.html', 'mantis_easy': 'mantis.html',
    'mantis_hard': 'mantis.html', 'mantis_nightmare': 'mantis.html',
    'mantis_impossible': 'mantis.html', 'mantis_calc': 'mantis.html',
    'check_newbie': 'check.html', 'check_easy': 'check.html',
    'check_hard': 'check.html', 'check_nightmare': 'check.html',
    'check_impossible': 'check.html', 'check_calc': 'check.html',
    'red_newbie': 'red.html', 'red_easy': 'red.html',
    'red_hard': 'red.html', 'red_nightmare': 'red.html',
    'red_impossible': 'red.html',
    'black_newbie': 'black.html', 'black_easy': 'black.html',
    'black_hard': 'black.html', 'black_nightmare': 'black.html',
    'black_impossible': 'black.html',
    'redblack_newbie': 'redblack.html', 'redblack_easy': 'redblack.html',
    'redblack_hard': 'redblack.html', 'redblack_nightmare': 'redblack.html',
    'redblack_impossible': 'redblack.html',
    'bazooka': 'bazooka.html', 'bazooka_pro': 'bazooka.html',
    'bazooka_newbie': 'bazooka.html', 'bazooka_easy': 'bazooka.html',
    'bazooka_hard': 'bazooka.html', 'bazooka_nightmare': 'bazooka.html',
    'bazooka_impossible': 'bazooka.html', 'bazooka_calc': 'bazooka.html',
    'bazooka_drill': 'bazooka.html',
    'math_mode': 'math.html',
    'judge': 'judge.html'
};

var PAGE_DEFAULTS = {
    'index.html': { mode: 'newbie', title: '\u{1F449} \u041A\u043E\u0441\u043C\u0430\u0442\u0438\u043A\u0430 (Newbie)' },
    'automatch.html': { mode: 'automatch_newbie', title: '\u{1F449}\u{1F449} \u0410\u0432\u0442\u043E\u043C\u0430\u0442 (Newbie)' },
    'winchester.html': { mode: 'winchester_newbie', title: '\u{1F449}\u270A \u0412\u0438\u043D\u0447\u0435\u0441\u0442\u0435\u0440 (Newbie)' },
    'ahalay.html': { mode: 'ahalay_newbie', title: '\u{1F44B}\u{1F44B} \u0410\u0445\u0430\u043B\u0430\u0439 (Newbie)' },
    'wolverine.html': { mode: 'wolverine_easy', title: '\u{1F43E} \u0420\u043E\u0441\u043E\u043C\u0430\u0445\u0430 (Easy)' },
    'who.html': { mode: 'who_newbie', title: '\u2753 \u041A\u0442\u043E (Newbie)' },
    'mantis.html': { mode: 'mantis_newbie', title: '\u{1F450} \u0411\u043E\u0433\u043E\u043C\u043E\u043B (Newbie)' },
    'check.html': { mode: 'check_newbie', title: '\u{1F50E} \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 (Newbie)' },
    'red.html': { mode: 'red_newbie', title: '\u{1F44D} \u041A\u0440\u0430\u0441\u043D\u044B\u0439 (Newbie)' },
    'black.html': { mode: 'black_newbie', title: '\u{1F44E} \u0427\u0451\u0440\u043D\u044B\u0439 (Newbie)' },
    'redblack.html': { mode: 'redblack_newbie', title: '\u{1F44D}\u{1F44E} \u041A\u0440\u0430\u0441\u043D\u044B\u0439/\u0427\u0451\u0440\u043D\u044B\u0439 (Newbie)' },
    'bazooka.html': { mode: 'bazooka_newbie', title: '\u{1F680} \u0411\u0430\u0437\u0443\u043A\u0430 (Newbie)' },
    'drills.html': { mode: 'newbie', title: '\u{1F449} \u041A\u043E\u0441\u043C\u0430\u0442\u0438\u043A\u0430 (Newbie)' },
    'math.html': { mode: 'math_mode', title: '\u{1F9EE} \u0421\u0447\u0451\u0442 \u0438\u0433\u0440\u044B' }
};

// Drills belong to drills.html
var DRILL_MODES = ['active-digit-1','active-digit-2','active-digit-3',
    'miss-night-1','miss-night-2','miss-night-3','miss-night-4','miss-night-5',
    'sheriff-alive','killed-sheriff','2-versions',
    'only-none','only-digit','only-badge'];

function getCurrentPageFile() {
    var path = window.location.pathname;
    var parts = path.replace(/\\/g, '/').split('/');
    var file = parts[parts.length - 1] || 'index.html';
    if (file === '' || file === '/') file = 'index.html';
    return file.toLowerCase();
}

function getTargetFileForMode(modeValue) {
    return MODE_FILE_MAP[modeValue] || 'index.html';
}

function shouldRedirect(modeValue) {
    var current = getCurrentPageFile();
    var target = getTargetFileForMode(modeValue);
    return current !== target.toLowerCase();
}

// ============================================================
// === CONTEXT-AWARE DIFFICULTY SWITCHER ===
// ============================================================
var FILE_MODE_PREFIX_MAP = {
    'bazooka.html':    { prefix: 'bazooka',    label: '🚀 Базука' },
    'automatch.html':  { prefix: 'automatch',  label: '👉👉 Автомат' },
    'winchester.html': { prefix: 'winchester', label: '👉✊ Винчестер' },
    'ahalay.html':     { prefix: 'ahalay',     label: '👋👋 Ахалай' },
    'wolverine.html':  { prefix: 'wolverine',  label: '🐾 Росомаха' },
    'mantis.html':     { prefix: 'mantis',     label: '👐 Богомол' },
    'who.html':        { prefix: 'who',        label: '❓ Кто' },
    'check.html':      { prefix: 'check',      label: '🔎 Проверка' },
    'red.html':        { prefix: 'red',        label: '👍 Красный' },
    'black.html':      { prefix: 'black',      label: '👎 Чёрный' },
    'redblack.html':   { prefix: 'redblack',   label: '👍👎 Красный/Чёрный' }
};

var DIFFICULTY_DISPLAY = {
    'newbie':    { icon: '👶', label: 'Newbie' },
    'easy':      { icon: '📚', label: 'Easy' },
    'hard':      { icon: '🔥', label: 'Hard' },
    'nightmare': { icon: '💀', label: 'Nightmare' },
    'impossible':{ icon: '☢️', label: 'Impossible' }
};

function changeDifficulty(level) {
    var filename = getCurrentPageFile();
    var context  = FILE_MODE_PREFIX_MAP[filename];
    var diff     = DIFFICULTY_DISPLAY[level] || { icon: '', label: level };

    // index.html or unknown page → base keys (Косматика)
    if (!context) {
        selectMode(level, '👉 Косматика (' + diff.label + ')');
        return;
    }

    var prefix = context.prefix;
    var sysLabel = context.label;

    // Росомаха supports only easy / hard
    if (prefix === 'wolverine' && level !== 'easy' && level !== 'hard') {
        if (typeof showToast === 'function') showToast('Этот уровень недоступен для Росомахи');
        return;
    }

    // Красный / Чёрный / Красный+Чёрный have no impossible mode
    var noImpossible = ['red', 'black', 'redblack'];
    if (noImpossible.indexOf(prefix) !== -1 && level === 'impossible') {
        if (typeof showToast === 'function') showToast('Этот уровень недоступен для данного тренажёра');
        return;
    }

    var modeKey   = prefix + '_' + level;
    var modeTitle = diff.icon + ' ' + sysLabel + ' (' + diff.label + ')';
    selectMode(modeKey, modeTitle);
}

// --- CHANGELOG CONSTANT ---
const CHANGELOG_HTML = `
<div class="space-y-6 text-sm text-gray-300">
    <div class="bg-gray-800 p-4 rounded-lg border border-yellow-500/30">
        <h3 class="text-lg font-bold text-yellow-400 mb-2">🔥 Update 18: Конструктор Дриллов</h3>
        <p class="mb-3">
            Главное нововведение — <strong>Конструктор Дриллов (Сценариев)</strong> во вкладке «Дриллы».
            Раньше можно было выбрать только сложность, теперь добавлен Режим Конструктора, который позволяет моделировать конкретные игровые ситуации.
        </p>
        
        <h4 class="font-bold text-white mt-4 mb-1">🛠 Переключатель «Режим Конструктора (Комбо)»:</h4>
        <p class="mb-2">Во вкладке «Дриллы» появился чекбокс, включающий режим ручного выбора условий.</p>

        <h4 class="font-bold text-white mt-3 mb-1">🎴 Мульти-выбор условий (Карточки):</h4>
        <p class="mb-2">Вы можете накликать комбинацию условий, которые хотите отработать:</p>
        <ul class="list-disc list-inside space-y-1 ml-2 text-gray-400">
            <li><strong class="text-gray-200">Стрельба:</strong> Принудительный выбор активной цифры (1, 2 или 3).</li>
            <li><strong class="text-gray-200">Промах:</strong> Сценарий промаха в конкретную ночь (1-ю... 5-ю).</li>
            <li><strong class="text-gray-200">Шериф:</strong> Выбор: «Шериф жив», «Убит Шериф» или «2 версии».</li>
            <li><strong class="text-gray-200">Действия Дона:</strong> Принудительно задать жест (Пас, Цифра, Жетон).</li>
        </ul>

        <div class="mt-4 p-2 bg-blue-900/30 rounded border border-blue-500/20">
            <strong class="text-blue-300">Кнопка «ЗАПУСТИТЬ ДРИЛЛ»:</strong><br>
            Генерирует задачу строго по вашим параметрам (например: «Убит Шериф» + «Промах во 2-ю ночь»).
        </div>
    </div>

    <hr class="border-gray-700">

    <div class="opacity-75">
        <h3 class="text-md font-bold text-gray-400 uppercase tracking-wider mb-4">Старые обновления</h3>

        <div class="mb-6">
            <h4 class="text-white font-bold text-lg">⚡️ Косматика PRO v17: Росомаха и Винчестер</h4>
            <p class="text-xs text-gray-500 mb-2">Глобальное обновление интерфейса и контента</p>
            
            <ul class="space-y-3">
                <li>
                    <strong class="text-amber-500">🐾 Новый спецрежим: РОСОМАХА</strong><br>
                    Механика: Дон гарантированно мертв. Включается "Протокол Росомаха".<br>
                    Визуал: Уникальный янтарный стиль и иконка 🐾.
                </li>
                <li>
                    <strong class="text-purple-400">🔫 Винчестер — больше не Beta!</strong><br>
                    Режим доказал стабильность и занял место в основном меню сразу после Автомата.
                </li>
                <li>
                    <strong>📋 Реорганизация Меню:</strong><br>
                    👉 Косматика (База) -> 👉👉 Автомат -> 👉✊ Винчестер -> 👋👋 Ахалай -> 🔒 Анонсы (Базука, Инта, Богомол).
                </li>
            </ul>
        </div>

        <div class="text-xs space-y-4">
            <div>
                <strong class="text-white block text-sm mb-1">👋👋 Ахалай-махалай (OldFire)</strong>
                Полная динамика! Активная цифра меняется каждую ночь. Включены отрицательные числа в заказах.
            </div>
            <div>
                <strong class="text-white block text-sm mb-1">👉👉 Расширение линейки "Автомат"</strong>
                Теперь это полноценная дисциплина с уровнями от Newbie до Nightmare.
            </div>
            <div>
                <strong class="text-white block text-sm mb-1">🏆 Система Прогресса & Калькуляторы</strong>
                Авто-повышение сложности после 10 побед. Отдельные калькуляторы под каждую систему (Эхо, Цикл, Винчестер).
            </div>
        </div>
    </div>
</div>
`;

// --- RULES CONSTANTS ---
const CONST_RULES_COSMATICS = `
<div id="rules-content">
    <h3>👉 КОСМАТИКА: Идеальная система</h3>
    <p>Это идеальная система для стрельбы ночью (От новичка до профи).<br>
    Ниже — алгоритм принятия решений.<br>
    Не учите его наизусть. Поймите логику: <strong>Косматика — это Статика (База) с возможностью переключения на Ахалай (Динамика).</strong></p>

    <div class="rules-section">
        <h4>⚙️ Как это работает? (Аналогия)</h4>
        <p>Представьте, что вы договорились с друзьями в баре в 20:00 (План А). Но сказали: «Если пойдет дождь, идем в кино» (План Б). А если заболел друг — никуда не идем (ЧП).</p>
        <ul>
            <li>Дождя нет? ➡️ Идем в бар (Работает <strong>Статика</strong>).</li>
            <li>Пошел дождь? ➡️ Идем в кино (Дон дал жест — работает <strong>Ахалай</strong>).</li>
            <li>Заболел друг? ➡️ (Если есть 100% проверенный красный — работает <strong>Охота</strong>).</li>
        </ul>
    </div>

    <div class="rules-section">
        <h4>🟢 УРОВЕНЬ 1: БЫСТРЫЙ СТАРТ - БАЗА (Подготовка)</h4>
        <p><strong>🤝 Договорка (Ночь 0)</strong><br>
        Дон показывает жест «Косматика» (👉) и ТРИ ЦИФРЫ (План).<br>
        <em>Пример: Дон показал 👉 2, 5, 9.</em></p>
        
        <p><strong>🔑 Понятие «Активная Цифра»</strong><br>
        Это цифра из Плана, которая актуальна на данный момент.</p>
        <ol>
            <li>Сначала это <strong>первая цифра (2)</strong> — она шла после жеста 👉.</li>
            <li>Только если 2 уже «отработала» (реализовалась как выстрел через статику или ахалай) — активной становится <strong>вторая цифра (5)</strong>.</li>
            <li>Только если 5 уже «отработала» — активной становится <strong>третья цифра (9)</strong>.</li>
        </ol>

        <p>🚫 <strong>Важно:</strong> Если вы промахнулись используя цифру 2, цифра 2 <strong>не сгорает</strong>. Следующей ночью вы снова используете цифру 2, она осталась активной цифрой. После сострела переход на следующую активную цифру.</p>

        <div style="background: rgba(255, 215, 0, 0.1); border-left: 4px solid gold; padding: 10px; margin: 10px 0;">
            <strong>🏆 ЗОЛОТОЕ ПРАВИЛО (Ваша подушка безопасности)</strong><br>
            Если вы сомневаетесь, не увидели жест от Дона, запаниковали — <strong>ВСЕГДА стреляйте «СТАТИКУ»</strong>. Это гарантия того, что у команды будет шанс синхронно выстрелить.
        </div>
        <p>Всё! Вы уже полезный член команды и не допустите несострела. Готовы узнать, как Дон может перевернуть игру одним жестом? Переходите на Уровень 2.</p>
    </div>

    <div class="rules-section">
        <h4>🟡 УРОВЕНЬ 2: АЛГОРИТМ ПРИНЯТИЯ РЕШЕНИЯ (Куда стрелять?)</h4>
        <p>Сначала самое важное понятие в Косматике:<br>
        <strong>⏱️ Боевой Тайминг = Когда смотреть на Дона?</strong><br>
        Внимание на Дона нужно ТОЛЬКО в промежутке:<br>
        🛑 <strong>ОТ:</strong> окончания речи последнего говорящего (прямо перед началом голосования).<br>
        🌑 <strong>ДО:</strong> фразы Ведущего «В Городе ночь».</p>
        
        <p>Около фазы Ночь, ещё днём, задайте себе 3 вопроса последовательно. Как только ответили «ДА» — выполняйте инструкцию и не переходите к следующему вопросу.</p>

        <div style="margin-bottom: 15px; border: 1px solid #d32f2f; padding: 10px; border-radius: 8px; background: rgba(211, 47, 47, 0.05);">
            <strong>❓ ВОПРОС 1: Единственный Шериф убит/заголосован И оставил Красные проверки? Или игра 2 версии и есть 100% двухсторонний проверенный красный?</strong><br>
            ➡️ <strong>ДА: РЕЖИМ «ОХОТА» (Высший приоритет)</strong><br>

            <div style="margin-top: 10px; padding-left: 10px; border-left: 2px solid #aaa;">
                <strong>Ситуация А: Единственный Шериф мертв</strong><br>
                <strong>Действие:</strong> Игнорируем всё. Стреляем в первую живую КРАСНУЮ проверку (по часовой стрелке от Активной цифры).<br>
                <strong>Исключение:</strong> Если вы хотите убить другую красную проверку, а не ближайшую. Нужно использовать Ахалай в Боевой Тайминг (активная цифра + ахалай), чтобы сумма была равна номеру, где сидит другая красная проверка.<br>
                <em>Во всех остальных случаях умирает ближайшая красная проверка.</em><br>
                <span style="font-size:0.9em; color:#aaa;">💡 Тактика: Смерть Единственного Шерифа — мирные проверки достоверно известны. Охота автоматически уничтожает их.</span>
            </div>

            <div style="margin-top: 10px; padding-left: 10px; border-left: 2px solid #aaa;">
                <strong>Ситуация Б: Игра в 2 версии (есть 100% красный)</strong><br>
                <strong>Действие:</strong> В Статику стреляем в первую живую 100% двухстороннюю проверенную КРАСНУЮ проверку (по часовой стрелке от Активной цифры).<br>
                <strong>Исключение:</strong> Если вы хотите убить любого другого игрока — нужно использовать Ахалай в Боевой Тайминг (активная цифра + ахалай).<br>
                <span style="font-size:0.9em; color:#aaa;">💡 Тактика: Иногда смерть Шерифа/Лже-Шерифа или убийство мешающего игрока важнее.</span>
            </div>

            <div style="text-align:center; font-weight:bold; margin-top:10px;">НЕТ ⬇️ Переходите к вопросу 2.</div>
        </div>

        <div style="margin-bottom: 15px; border: 1px solid #444; padding: 10px; border-radius: 8px;">
            <strong>❓ ВОПРОС 2: Дон показал жест (Цифру или Жетон) в «Боевой Тайминг»?</strong><br>
            ➡️ <strong>ДА: РЕЖИМ «АХАЛАЙ» (Динамика)</strong><br>
            Статика отменяется. Включаем простую математику.<br>
            <strong>Стреляем:</strong> По формуле (см. режим «Ахалай» Дон показал жест).<br>
            <p style="font-size:0.9em; color:#aaa; margin-top:5px;">💡 <em>Тактика (Зачем?): Использование жеста даёт возможность стрельнуть в любого игрока. Например: чтобы убить конкретного опасного игрока, которого нет в плане.</em></p>
            <div style="text-align:center; font-weight:bold; margin-top:5px;">НЕТ ⬇️ Переходите к вопросу 3.</div>
        </div>

        <div style="border: 1px solid #444; padding: 10px; border-radius: 8px;">
            <strong>❓ ВОПРОС 3: Дон ничего не показал (сидел спокойно) в «Боевой Тайминг»?</strong><br>
            ➡️ <strong>ДА: РЕЖИМ «СТАТИКА» (База)</strong><br>
            Работает режим по умолчанию ("План А").<br>
            <strong>Стреляем:</strong> В Активную цифру из плана.<br>
            <p style="font-size:0.9em; color:#aaa; margin-top:5px;">💡 <em>Тактика (Зачем?): Самый частый сценарий, самый простой и не привлекающий внимания.</em></p>
        </div>
    </div>

    <div class="rules-section">
        <h4>🔴 УРОВЕНЬ 3: ПРОФЕССИОНАЛ - ДЕТАЛЬНЫЙ РАЗБОР РЕЖИМОВ</h4>
        
        <p><strong>3.1. 🤫 Режим «СТАТИКА» (Дон ничего не показал)</strong><br>
        <strong>Триггер:</strong> Дон ничего не показал в Боевом Тайминге.<br>
        <strong>Действие:</strong> Стреляем в Активную цифру.<br>
        <strong>Правило смещения:</strong> Если Активная цифра указывает на «Запрещенную цель» (Свой черный, Проверенный черный, Шериф с 3-й ночи или Мертвец) — смещаемся на <strong>следующего живого КРАСНОГО</strong> игрока.<br>
        <em>Пример: План 2-5-9. Активная 2. Игрок 2 — ваш черный. Выстрел идет в 3.</em><br>
        <em>💡 Тактика: Безопасный режим. Стрельба только по красным. Система сама «перепрыгнет» своих.</em></p>

        <p><strong>3.2. 👋👋 Режим «АХАЛАЙ» (Дон показал жест)</strong><br>
        <strong>Триггер:</strong> Дон показал жест в Боевом Тайминге, Статика отменяется.<br>
        <strong>Считаем формулу:</strong> <code>Активная Цифра + Жест Дона = Цель</code></p>
        
        <div style="padding-left: 10px; border-left: 2px solid #d32f2f; margin-bottom: 10px; background: rgba(211, 47, 47, 0.1);">
            <strong>🅰️ Тип А: Жест «ЦИФРА» (от 1 до 10) — Стрельба в любого 🤬</strong><br>
            <strong>Формула:</strong> [Активная цифра] + [Показанная цифра]<br>
            <strong>Смысл:</strong> Убить конкретного игрока любой ценой.<br>
            <strong>Разрешено:</strong> Стрелять в Своих черных (тактический самострел).<br>
            <strong>Защита:</strong> Если сумма указывает на пустой стул — ищем следующего живого (любого).<br>
            <em>💡 Тактика: Универсальный инструмент для стрельбы в любого.</em>
        </div>

        <div style="padding-left: 10px; border-left: 2px solid #388e3c; background: rgba(56, 142, 60, 0.1);">
            <strong>🅱️ Тип Б: Жест «ЖЕТОН» (👌) — Стрельба с предохранителем 🛡️</strong><br>
            <strong>Формула:</strong> [Активная цифра] + [Номер места Дона]<br>
            <strong>Смысл:</strong> Аккуратная стрельба.<br>
            <strong>Запрещено:</strong> Стрелять в Своих черных, Проверенных черных и Шерифа (с 3-й ночи).<br>
            <strong>Действие:</strong> Если попали в запрещенного — смещаемся на следующего красного.<br>
            <em>💡 Тактика: Безопасный режим, как Статика. Стрельба только по красным.</em>
        </div>

        <p style="margin-top:15px;"><strong>3.3. 🚨 РЕЖИМ «ОХОТА» (Высший приоритет)</strong><br>
        <strong>Условие 1:</strong> Единственный Шериф мертв и оставил красные проверки.<br>
        <strong>Условие 2:</strong> ⚔️ 2 Версии + 100% двухсторонний проверенный красный.<br>
        <strong>ДЕЙСТВИЕ:</strong> Стреляем СТРОГО в Красную проверку.<br>
        (Если проверок несколько: Стреляем в первую живую по часовой стрелке начиная от активной цифры).<br>
        <strong>ОТМЕНА ПРАВИЛ:</strong> В этом режиме мы игнорируем обычную статику. Приоритет всегда у проверки.</p>
        
        <p><strong>🔧 ИСКЛЮЧЕНИЯ (Работают через Ахалай):</strong><br>
        <strong>Смена проверки:</strong> Если ахалай + активная цифра попадают на другую Красную проверку — стреляем в неё.<br>
        <em>(Пример: 👉Активная цифра 9. Красные проверки: 3 и 10. По кругу первая 10. Чтобы убить 3 вперёд 10, Дон показывает 4 -> 9+4=13=3).</em><br>
        <strong>Только для условия «игра ⚔️ в две версии»:</strong> Если вы хотите убить любого другого игрока — нужно использовать Ахалай в Боевой Тайминг. Если Дон показал ахалай, 100% проверенный красный <strong>НЕ стреляется</strong>, а стреляется тот, на кого указала (активная цифра + ахалай).</p>
    </div>

    <div class="rules-section">
        <h4>4. МАТРИЦА ЦЕЛЕЙ (Шпаргалка безопасности)</h4>
        <p>Куда стрелять, если итоговый номер (после расчетов) указывает на «особого» игрока?</p>
        <table style="width:100%; border-collapse: collapse; font-size: 0.85em;">
            <tr style="border-bottom: 2px solid #555;">
                <th style="text-align:left; padding:5px;">Категория цели</th>
                <th style="padding:5px;">СТАТИКА (Дон ничего не показывал)</th>
                <th style="padding:5px;">АХАЛАЙ: ЖЕТОН 👌</th>
                <th style="padding:5px;">АХАЛАЙ: ЦИФРА 🔢</th>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding:5px; font-weight:bold;">Свой Чёрный</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#f44336; font-weight:bold;">🔫 ВЫСТРЕЛ (Самострел)</td>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding:5px; font-weight:bold;">Проверенный Чёрный (красный игрок) Лже-шерифом</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#f44336; font-weight:bold;">🔫 ВЫСТРЕЛ (себе в ногу)</td>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding:5px; font-weight:bold;">Настоящий Шериф (с ночи №3)</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#f44336; font-weight:bold;">🔫 ВЫСТРЕЛ (Ужасно, но иногда нужно)</td>
            </tr>
            <tr>
                <td style="padding:5px; font-weight:bold;">Уже мертвый игрок</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#4caf50;">➡️ След. красный</td>
                <td style="color:#aaa;">➡️ След. любой живой игрок</td>
            </tr>
        </table>
    </div>

    <div class="rules-section">
        <h4>5. Почему Косматика лучше Ахалая?</h4>
        <ul>
            <li><strong>Право на ошибку:</strong> Если вы промахнулись (например, в 2), цифра 2 не сгорает. Следующей ночью вы снова используете цифру 2. Выстрел не пропадает.</li>
            <li><strong>Свобода глаз:</strong> Не нужно пялиться на Дона весь игровой день. Посмотрели только на Дона в Боевой Тайминг.</li>
            <li><strong>Не привлекает внимания:</strong> Дону не нужно постоянно махать руками. Если он ничего не показывает — стрельба всё равно идёт (по Статике).</li>
            <li><strong>Умная Охота:</strong> Система позволяет автоматически убивать красные проверки умершего Шерифа, даже если Дон ничего не показывает.</li>
        </ul>
    </div>

    <div class="rules-section">
        <h4>6. 📝 ПРИМЕРЫ ДОГОВОРКИ</h4>
        <p>👉 2, 5, 9 = План 2, 5, 9.<br>
        👉 1 = План 1, 1, 1 (всегда используем 1).<br>
        👉 2, 1 = План 2, 1, 1.<br>
        И так далее...</p>
        <p><strong>Главное:</strong> На договорке начинайте с жеста 👉, чтобы зафиксировать Активную цифру! И если дублируете договорку, то тоже начинайте с жеста 👉!</p>
    </div>
</div>
`;

const CONST_RULES_AUTOMATCH = `
<div id="rules-content">
    <h3>👉👉 Правила для Автомата</h3>
    <p><strong>Автомат</strong> — это статика на 3 ночи, которая имеет две дополнительные возможности модификации прямо во время круга: <strong>Эхо статика</strong> и <strong>FlashFire</strong> (быстрый Ахалай).</p>

    <div class="rules-section">
        <h4>1. Как это работает Автомат (Механика)</h4>
        <p>Дон показывает Автомат (👉👉) и 3 цифры на договорке (например: <strong>1 — 3 — 5</strong>). Это базовый план.</p>
        <p>Чтобы показать, что играем именно Автомат, Дон на договорке показывает двумя руками «пистолет упирается ещё в один пистолет» (👉👉).</p>
        <p>В этом режиме важно следить за Доном <strong>ТОЛЬКО в последнюю минуту перед ночью</strong> (крайняя речь до ночи).</p>
        <p>Приоритет действий (что важнее):</p>
        <ul>
            <li>⚡️ <strong>FlashFire (Ахалай):</strong> Самый важный. Если был жест цифры или жетона — стреляем по нему.</li>
            <li>🖐 <strong>Эхо статика:</strong> Если жестов цифр не было, но Дон показал кисть(кисти) рук — Эхо статика (+5).</li>
            <li>🤫 <strong>Базовая статика:</strong> Если Дон сидел смирно и ничего не показывал — стреляем в список.</li>
        </ul>
    </div>

    <div class="rules-section">
        <h4>2. Режим FlashFire + Ахалай — Высший приоритет</h4>
        <p>Включается, если Дон <strong>после начала последней речи и до ночи</strong> жестикулирует (показывает Цифру или Жетон).</p>
        <p>Это перебивает любую статику и Эхо статику.</p>
        <p><strong>Формула:</strong> <code>[Активная цифра] + [Жест Дона] = Цель</code></p>
        <p><strong>Правила стрельбы:</strong> Стреляем туда, куда показала математика.</p>
        <p>В FlashFire <strong>НЕТ</strong> правила «не стрелять в своих».</p>
        <p><strong>НО</strong>, если цель уже мертва, выстрел смещается на следующего живого по кругу. Тут включается защита:</p>
        <ul>
            <li>Мы всегда пропускаем Проверенных Черных.</li>
            <li><strong>Начиная с 3-й ночи:</strong> Мы также пропускаем Шерифа и Дона(лже-вскрытие) (их нельзя убить смещением, ТОЛЬКО прямым попаданием в номер шерифа или лже-шерифа).</li>
        </ul>
    </div>

    <div class="rules-section">
        <h4>3. Режим ЭХО СТАТИКА (+5)</h4>
        <p>Включается, если Ахалая не было, но на <strong>последней минуте</strong> Дон акцентированно показал кисти рук (одну, две или просто облокотился на стол или в экран, чтобы их было видно).</p>
        <p><strong>Формула:</strong> <code>[Активная цифра] + 5 = Цель</code></p>
        <p><em>Пример:</em> Активная цифра 2. Дон показал руки. Стреляем в <strong>7</strong> (2+5).</p>
        <p><em>Пример:</em> Активная цифра 8. Дон показал руки. Стреляем в <strong>3</strong> (8+5=13 -> 3).</p>
        <p><strong>ВАЖНО:</strong> Здесь работает «Предохранитель» (как в статике). См. пункт 5.</p>
    </div>

    <div class="rules-section">
        <h4>4. Режим БАЗОВАЯ СТАТИКА</h4>
        <p>Если Дон ничего не показывал (ни жестов, ни рук) — работает обычная статика по списку.</p>
        <p><strong>ВАЖНО:</strong> Здесь тоже работает «Предохранитель».</p>
    </div>

    <div class="rules-section">
        <h4>5. ПРЕДОХРАНИТЕЛЬ (Для Статики и Эхо Статики)</h4>
        <p>В режимах «Эхо статика» и «Базовая статика» мы играем аккуратно.</p>
        <p>Мы <strong>НИКОГДА</strong> не стреляем в:</p>
        <ul>
            <li>Своих Чёрных игроков.</li>
            <li>Проверенных Чёрных (лже-шерифов/разбежка).</li>
            <li>Настоящего Шерифа (начиная с Ночи №3).</li>
        </ul>
        <p><strong>Что делать, если заказ падает на них?</strong><br>
        Выстрел автоматически переносится на <strong>следующего живого КРАСНОГО</strong> игрока по кругу.</p>
    </div>
</div>
`;

const CONST_RULES_AHALAY = `
<div id="rules-content">
    <h3>👋👋 Ахалай-махалай (OldFire)</h3>
    <p><strong>Ахалай</strong> — это режим полной динамики. Здесь нет статики. Дон <strong>всегда</strong> показывает жесты, а активная цифра меняется каждую ночь по кругу.</p>

    <div class="rules-section">
        <h4>1. Цикл Активной Цифры</h4>
        <p>Дон заказывает 3 цифры (например: <strong>-2, 0, 5</strong>). В отличие от Косматики, цифры могут быть отрицательными или нулем.</p>
        <p>Какую цифру брать за основу?</p>
        <ul>
            <li>🌑 <strong>Ночь 1:</strong> Работает 1-я цифра.</li>
            <li>🌑 <strong>Ночь 2:</strong> Работает 2-я цифра.</li>
            <li>🌑 <strong>Ночь 3:</strong> Работает 3-я цифра.</li>
            <li>🌑 <strong>Ночь 4:</strong> Снова 1-я цифра (цикл повторяется).</li>
        </ul>
    </div>

    <div class="rules-section">
        <h4>2. Механика выстрела</h4>
        <p>Дон на протяжении своей речи (или последним жестом) показывает модификатор.</p>
        <p><strong>Формула:</strong> <code>[Цифра ночи] + [Жест Дона] = Цель</code></p>
        <p>Жесты:</p>
        <ul>
            <li>👆 <strong>Цифра:</strong> Прибавляем показанную цифру.</li>
            <li>👌 <strong>Жетон:</strong> Прибавляем номер места Дона.</li>
        </ul>
        <p><em>Математика круга (1-10): Если сумма больше 10, вычитаем 10. Если меньше 1, прибавляем 10.</em></p>
    </div>

    <div class="rules-section">
        <h4>3. Смещение (Если попали в труп)</h4>
        <p>В Ахалае <strong>НЕТ</strong> правила «не стрелять в своих» при прямом попадании. Куда математика привела — туда и стреляем.</p>
        <p><strong>НО</strong>, если цель уже мертва, выстрел смещается на следующего живого по кругу. Тут включается защита:</p>
        <ul>
            <li>Мы всегда пропускаем Проверенных Черных.</li>
            <li><strong>Начиная с 3-й ночи:</strong> Мы также пропускаем Шерифа и Дона(лже-вскрытие) (их нельзя убить смещением, ТОЛЬКО прямым попаданием в номер шерифа или лже-шерифа).</li>
        </ul>
    </div>
</div>
`;

const CONST_RULES_WOLVERINE = `
<div id="rules-content">
    <h3 style="color: var(--wolverine-color); display: flex; align-items: center; gap: 8px;">
        🐾 Режим РОСОМАХА
    </h3>
    
    <p style="margin-bottom: 15px;">
        <strong>Автоматический переход стрельбы:</strong><br>
        Если ДОН покидает стол (заголосован или удален), право на заказ отстрела автоматически переходит к мафии, которая показывала <strong>жест Росомахи</strong>.
    </p>

    <div style="background: rgba(255, 179, 0, 0.05); border-left: 3px solid var(--wolverine-color); padding: 15px; border-radius: 4px; margin: 10px 0;">
        <strong style="color: var(--wolverine-color); text-transform: uppercase;">⚠️ ВАЖНО / ОГРАНИЧЕНИЯ:</strong>
        <ul style="margin: 10px 0 0 20px; padding: 0; line-height: 1.6; color: #ddd;">
            <li style="margin-bottom: 8px;">
                <strong>Если Дон УДАЛЁН:</strong><br>
                Мафия использует <span style="color:#ff5252">ТОЛЬКО</span> стрельбу по Росомахе.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>Если Дон ЗАГОЛОСОВАН:</strong><br>
                Блокируется (игнорируется) любая стрельба от Дона на его крайней минуте.
            </li>
            <li>
                <strong>Эффект "Кривая Пуля":</strong><br>
                В жест Росомахи встроен блокиратор. Это означает блокировку любой стрельбы от любой другой мафии. Приоритет всегда у Росомахи.
            </li>
        </ul>
    </div>

    <p style="font-size: 0.85em; color: #777; font-style: italic; margin-top: 10px;">
        * В разработке: Росомаха с Уникальным жестом.
    </p>
</div>
`;

const CONST_RULES_WHO = `
<div id="rules-content">
    <h3 style="color: var(--who-color);">❓ Режим «Кто» (ClassicFire)</h3>
    <p><strong>ClassicFire</strong> — это режим "чистой" динамики на движке OldFire. Здесь нет статики, а стрельба ведется исключительно математикой цифр.</p>

    <div class="rules-section">
        <h4>1. Движок OldFire (Цикличность)</h4>
        <p>Активная цифра заказа меняется каждую ночь по кругу (как в Ахалае):</p>
        <ul>
            <li>🌑 <strong>Ночь 1:</strong> Работает 1-я цифра заказа.</li>
            <li>🌑 <strong>Ночь 2:</strong> Работает 2-я цифра.</li>
            <li>🌑 <strong>Ночь 3:</strong> Работает 3-я цифра.</li>
            <li>🔄 <strong>Ночь 4:</strong> Снова 1-я...</li>
        </ul>
    </div>

    <div class="rules-section">
        <h4>2. Механика (Только Цифры)</h4>
        <p>Дон показывает <strong>Жест Цифры</strong> (от 1 до 10).</p>
        <p><span style="color:#ff5252; font-weight:bold;">ВАЖНО:</span> В отличие от Ахалая, здесь <strong>НЕТ</strong> стрельбы от Жетона (👌) и нет указаний на игрока. Учитываются только цифры.</p>
        
        <p><strong>Формула:</strong><br>
        <code>[Активная цифра] + [Показанная цифра] = Цель</code></p>
        
        <p><em>Пример: Заказ (-2, 0, 5). Наступает Ночь 1 (активна -2). Дон показал 5. <br>Математика: -2 + 5 = 3. Стреляем в 3.</em></p>
    </div>

    <div class="rules-section">
        <h4>3. Смещение</h4>
        <p>Если цель мертва — смещаемся на следующего живого по кругу.</p>
        <p><strong>Правила защиты:</strong> При смещении мы пропускаем своих Проверенных Черных, а начиная с 3-й ночи — также Шерифа и Дона.</p>
    </div>
</div>
`;

const CONST_RULES_CHECK = `
<div id="rules-content">
    <h3 style="color: var(--check-color);">🔎 Режим «Проверка» (ClassicFire)</h3>
    <p><strong>Проверка</strong> — это режим на движке ClassicFire, аналогичный режимам "Кто" и "Богомол".</p>
    
    <div class="rules-section">
        <h4>1. Движок ClassicFire (Цикличность)</h4>
        <p>Активная цифра заказа меняется каждую ночь по кругу:</p>
        <ul>
            <li>🌑 <strong>Ночь 1:</strong> Работает 1-я цифра заказа.</li>
            <li>🌑 <strong>Ночь 2:</strong> Работает 2-я цифра.</li>
            <li>🌑 <strong>Ночь 3:</strong> Работает 3-я цифра.</li>
            <li>🔄 <strong>Ночь 4:</strong> Снова 1-я...</li>
        </ul>
    </div>

    <div class="rules-section">
        <h4>2. Механика (Только Цифры)</h4>
        <p>Дон показывает <strong>Жест Цифры</strong> (от 1 до 10).</p>
        <p><span style="color:#ff5252; font-weight:bold;">ВАЖНО:</span> Здесь <strong>НЕТ</strong> стрельбы от Жетона (👌). Учитываются только цифры.</p>
        
        <p><strong>Формула:</strong><br>
        <code>[Активная цифра] + [Показанная цифра] = Цель</code></p>
        
        <p><em>Пример: Заказ (-2, 0, 5). Наступает Ночь 1 (активна -2). Дон показал 5. <br>Математика: -2 + 5 = 3. Стреляем в 3.</em></p>
    </div>

    <div class="rules-section">
        <h4>3. Смещение</h4>
        <p>Если цель мертва — смещаемся на следующего живого по кругу.</p>
        <p><strong>Правила защиты:</strong> При смещении мы пропускаем своих Проверенных Черных, а начиная с 3-й ночи — также Шерифа и Дона.</p>
    </div>
</div>
`;

const CONST_RULES_WINCHESTER = `
<div id="rules-content">
    <h3>👉✊ Винчестер</h3>
    <p><strong>Винчестер</strong> — сложная система с четырьмя вариантами развития событий. В этом режиме важно следить за Доном ТОЛЬКО в последнюю минуту перед ночью (крайняя речь до ночи).</p>

    <div class="rules-section">
        <h4>1. Приоритеты действий</h4>
        <p>Смотрим, что показал Дон:</p>
        <ol>
            <li>⚡ <strong>FlashFire (Жест цифры/жетона):</strong> Высший приоритет. Чистая математика.</li>
            <li>🤫 <strong>Пас (Ничего):</strong> Обычная статика.</li>
            <li>🖐 <strong>Одна кисть руки:</strong> Эхо (+3).</li>
            <li>🖐🖐 <strong>Две кисти рук:</strong> Эхо (+6).</li>
        </ol>
    </div>

    <div class="rules-section">
        <h4>2. Режимы «ЭХО» и «СТАТИКА» (Безопасные)</h4>
        <p>Если Дон молчит или показывает кисти рук, работает <strong>Защита Своих</strong>.</p>
        <ul>
            <li><strong>Пас:</strong> Стреляем в активную цифру заказа.</li>
            <li><strong>1 Рука:</strong> Активная цифра + 3.</li>
            <li><strong>2 Руки:</strong> Активная цифра + 6.</li>
        </ul>
        <p><span style="color:var(--success); font-weight:bold;">ВАЖНО:</span> В этих режимах мы НЕ стреляем в своих черных, проверенных черных и Шерифа (3+ ночь). Если попадаем в них — переносим выстрел на следующего красного.</p>
    </div>

    <div class="rules-section">
        <h4>3. Режим FlashFire + Ахалай — Высший приоритет</h4>
        <p>Если Дон показал <strong>Цифру</strong> или <strong>Жетон</strong> — это динамика.</p>
        <p><strong>Формула:</strong> <code>[Активная цифра] + [Жест] = Цель</code></p>
        <p>Здесь <strong>НЕТ</strong> защиты своих при прямом попадании.</p>
        <p><strong>НО</strong>, если цель уже мертва, выстрел смещается на следующего живого по кругу. Тут включается защита:</p>
        <ul>
            <li>Мы всегда пропускаем Проверенных Черных.</li>
            <li><strong>Начиная с 3-й ночи:</strong> Мы также пропускаем Шерифа и Дона(лже-вскрытие) (их нельзя убить смещением, ТОЛЬКО прямым попаданием в номер шерифа или лже-шерифа).</li>
        </ul>
    </div>
</div>
`;

const CONST_RULES_MANTIS = `
<div id="rules-content">
    <h3 style="color: var(--mantis-color);">👐 Режим «Богомол» (ClassicFire)</h3>
    <p><strong>Богомол</strong> — это чистая математика. Дон показывает только цифры. Никаких цветов, никаких жетонов.</p>

    <div class="rules-section">
        <h4>1. Механика</h4>
        <p>Активная цифра меняется по кругу (1-я -> 2-я -> 3-я -> 1-я...).</p>
        <p>Дон показывает <strong>Жест Цифры</strong>.</p>
        <p><strong>Формула:</strong> <code>[Активная цифра] + [Жест Дона] = Цель</code></p>
    </div>
    
    <div class="rules-section">
        <h4>2. Смещение</h4>
        <p>Если цель мертва — смещаемся на следующего живого (пропускаем Проверенных Черных и Шерифа/Дона на 3+ ночь).</p>
    </div>
</div>
`;

const CONST_RULES_BAZOOKA = `
<div id="rules-content">
    <h3 style="color: var(--bazooka-color);">🚀 Базука — Стрельба по динамике</h3>
    <p><strong>Базука</strong> — система стрельбы через физический жест «держишь базуку»: одна рука на плече, вторая «ведущая» двигается вперёд-назад. Ведущая рука = <strong>главная рука</strong> (выбирается Доном).</p>

    <div class="rules-section">
        <h4>1. База и направление</h4>
        <p><strong>Базука N (правая/левая)</strong> — это номер базы и выбранная главная рука.</p>
        <ul>
            <li><strong>Классическая Базука:</strong> Отсчёт красных идёт ПО ЧАСОВОЙ СТРЕЛКЕ от указанной базы.</li>
            <li><strong>PRO-режим:</strong> Отсчёт ПРОТИВ часовой стрелки.</li>
        </ul>
        <p>Пример: <code>Базука 10 (правая)</code> = красные отсчитываются от номера 10 по часовой стрелке, главная рука — правая.</p>
    </div>

    <div class="rules-section">
        <h4>2. Смещения (жесты рук → поиск красного)</h4>
        <p>Отсчёт идёт <strong>только по красным</strong> (пропускаются: свои чёрные, чёрные проверки, шериф с 3-й ночи).</p>
        <table style="width:100%; border-collapse:collapse; margin:10px 0;">
            <tr style="border-bottom:1px solid #555;"><th style="text-align:left; padding:6px; color:#aaa;">Жест</th><th style="text-align:left; padding:6px; color:#aaa;">Смещение</th></tr>
            <tr style="border-bottom:1px solid #333;"><td style="padding:6px;">✋ <strong>Главная рука</strong> у своей щеки (тянется к маске одной рукой)</td><td style="padding:6px;">1-й красный</td></tr>
            <tr style="border-bottom:1px solid #333;"><td style="padding:6px;">🙌 <strong>Обе руки</strong> у лица (тянется к маске двумя руками)</td><td style="padding:6px;">2-й красный</td></tr>
            <tr style="border-bottom:1px solid #333;"><td style="padding:6px;">🤚 <strong>Не главная рука</strong> у своей щеки (тянется другой рукой)</td><td style="padding:6px;">3-й красный</td></tr>
            <tr><td style="padding:6px;">🚫 Руки опущены / спрятаны (маска уже надета)</td><td style="padding:6px;">4-й красный</td></tr>
        </table>
        <p><strong>Важно:</strong> Если главная рука = <strong>правая</strong>, то «правой рукой тянется» = 1-й, «левой» = 3-й. Если главная = <strong>левая</strong>, то наоборот.</p>
    </div>

    <div class="rules-section">
        <h4>3. Ахалай (Прямой заказ) — Высший приоритет</h4>
        <p>Если Дон показал <strong>явный таргет</strong> (например, жест проверки 4 от номера 7), стреляется именно этот игрок. Ахалай <strong>НИКОГДА не инвертируется</strong> в PRO-режиме.</p>
    </div>

    <div class="rules-section">
        <h4>4. InstaFire — Момент считывания</h4>
        <p>Жест фиксируется <strong>после окончания крайней речи до ночи</strong> с коротким промежутком до наступления ночи.</p>
        <ul>
            <li><strong>Офлайн:</strong> Мафия смотрит, как Дон тянется к маске.</li>
            <li><strong>Онлайн:</strong> Как Дон держит руки перед экраном перед засыпанием.</li>
        </ul>
    </div>
</div>
`;

// --- GLOBAL VARIABLES ---
var appCurrentSolution = null;
var appCurrentScenarioData = null;
var appLastBlackTeamJson = ""; // Для предотвращения повторения черной команды в режимах Ахалай
var appAhalayNewbieDynamicModifier = 0; // Модификатор динамики для ahalay_newbie при повторении черной команды 
var appStreak = 0;          
var appWrongStreak = 0;     
var appSkippedStreak = 0;   
var appTotalGames = 0;      
var appTotalCorrect = 0;   
var appTotalWrong = 0;     
var appTotalSkipped = 0;   
var appIsRoundActive = true;
var appGameMode = 'newbie'; // Default

var appStreakHard = 0;
var appStreakNightmare = 0;
var appHasTimeBonus = false;

// Стрики для режимов Автомата
var appAutomatchStreakNewbie = 0;
var appAutomatchStreakEasy = 0;
var appAutomatchStreakHard = 0;
var appAutomatchStreakNightmare = 0;

// Стрики для режимов Косматики (начиная с Easy, не Newbie)
var appKosmatikaStreakEasy = 0;
var appKosmatikaStreakHard = 0;
var appKosmatikaStreakNightmare = 0;
// Также добавляем для Newbie, если пользователь хочет видеть окна и в этом режиме
var appKosmatikaStreakNewbie = 0;

// Стрики для режимов Ахалая
var appAhalayStreakNewbie = 0;
var appAhalayStreakEasy = 0;
var appAhalayStreakHard = 0;
var appAhalayStreakNightmare = 0;

// Цикл ночей для Ахалай-махалай: [1, 2, 3] или подмножество
// Если попадание в ночь N - удаляем N из цикла
// Если промах в ночь N - восстанавливаем полный цикл [1, 2, 3]
var appAhalayNightCycle = [1, 2, 3];
var appAhalayNightCycleIndex = 0; // Текущий индекс в цикле


// Стрики для режимов Винчестера
var appWinchesterStreakNewbie = 0;
var appWinchesterStreakEasy = 0;
var appWinchesterStreakHard = 0;
var appWinchesterStreakNightmare = 0;

// Стрики для режимов Кто
var appWhoStreakEasy = 0;
var appWhoStreakHard = 0;
var appWhoStreakNightmare = 0;

// Стрики для режимов Богомола
var appMantisStreakEasy = 0;
var appMantisStreakHard = 0;
var appMantisStreakNightmare = 0;

// Стрики для режимов Базуки
var appBazookaStreakNewbie = 0;
var appBazookaStreakEasy = 0;
var appBazookaStreakHard = 0;
var appBazookaStreakNightmare = 0;

// Теоретические вопросы Базуки: счётчик раундов до следующего вопроса
var appBazookaTheoryCounter = 0;
var appBazookaTheoryMode = false; // true когда показан теоретический вопрос
var appBazookaTheoryAnswer = null; // правильный ответ текущего вопроса
var appBazookaTheoryPool = [
    { q: 'Какой жест означает смещение +1 для правши?', opts: ['Правая рука', 'Обе руки', 'Левая рука', 'Руки вниз'], ans: 0 },
    { q: 'Какой жест означает смещение +2?', opts: ['Правая рука', 'Обе руки', 'Левая рука', 'Руки вниз'], ans: 1 },
    { q: 'Какой жест означает смещение +3 для правши?', opts: ['Правая рука', 'Обе руки', 'Левая рука', 'Руки вниз'], ans: 2 },
    { q: 'Какой жест означает смещение +4?', opts: ['Правая рука', 'Обе руки', 'Левая рука', 'Руки вниз'], ans: 3 },
    { q: 'Если Дон — левша, какой жест даёт смещение +1?', opts: ['Правая рука', 'Левая рука', 'Обе руки', 'Руки вниз'], ans: 1 },
    { q: 'Если Дон — левша, какой жест даёт смещение +3?', opts: ['Левая рука', 'Обе руки', 'Правая рука', 'Руки вниз'], ans: 2 },
    { q: 'В каком направлении ищется красный по умолчанию?', opts: ['По часовой стрелке', 'Против часовой', 'В обе стороны', 'Рандомно'], ans: 0 },
    { q: 'Что меняет режим PRO в Базуке?', opts: ['Направление поиска красных', 'Количество смещений', 'Главную руку Дона', 'Ничего'], ans: 0 },
    { q: 'Если Ахалай попадает на клёкнутого, что происходит?', opts: ['Огонь по Ахалаю', 'Пропуск хода', 'Огонь по следующему красному', 'Выстрел в базу'], ans: 2 },
    { q: 'Через кого считается смещение в Базуке?', opts: ['Через всех игроков', 'Только через живых красных', 'Через мёртвых', 'Через чёрных'], ans: 1 },
    { q: 'Базука N — что такое N?', opts: ['Номер базы', 'Смещение жестом', 'Номер ночи', 'Номер Дона'], ans: 0 },
    { q: 'Сколько различных жестов в системе Базуки?', opts: ['2', '3', '4', '5'], ans: 2 },
    { q: 'Где начинается отсчёт красных в Базуке?', opts: ['От Дона', 'От базы', 'От мафии', 'От шерифа'], ans: 1 },
    { q: 'Если смещение +2, а от базы 1-й красный убит, кого стреляем?', opts: ['2-го красного', '1-го красного', '3-го красного', 'Базу'], ans: 0 },
    { q: 'Жест «Обе руки» — это какое смещение?', opts: ['+1', '+2', '+3', '+4'], ans: 1 },
    { q: 'При InstaFire когда мафия стреляет?', opts: ['Перед Доном', 'После Дона', 'Одновременно', 'Не стреляет'], ans: 0 }
];

// Math Mode (Счёт игры) State
var appMathStreak = 0;
var appMathCorrect = 0;
var appMathWrong = 0;
var appMathCurrentScenario = null; // { redCount, blackCount, correctAnswer }
var appMathDualMode = false; // Режим "2 Версии"
var appMathUserAnswers = { version1: null, version2: null }; // Выборы пользователя для Dual Mode

var impossibleTimer = null;

// Drill Mode State
var appDrillState = {
    isActive: false,
    tasksLeft: 0,
    requiredLogicTag: null,
    filterCriteria: { night: 0, actionType: 'none' }
};

// Drill Filter State (Manual Drills)
var appDrillFilter = {
    active: false,
    night: null,
    prevHit: null,
    actionType: null,
    kIndexOffset: 0,
    allowedScenarios: [],  // Массив объектов конфигурации для стрельбы (для конструктора)
    allowedActions: []     // Массив типов действий (для конструктора)
};
var appDrillFilterLabel = "";

// Drill Constructor State
var appDrillConstructorActive = false;
var appDrillConstructorSelection = {
    shooting: [],  // Массив выбранных дриллов стрельбы: ['active-digit-1', 'active-digit-2', ...]
    action: []     // Массив выбранных действий: ['only-none', 'only-digit', ...]
};
var currentDrillDifficulty = 'easy'; // Выбранная сложность для дриллов (по умолчанию Easy)
var currentDrillSystem = 'kosmatika'; // Выбранная дисциплина для дриллов (Косматика/Автомат/Винчестер)

var appNightmareState = { isActive: false, step: 0, savedScenario: null };
var appImpossibleState = { isActive: false, step: 0, hasPendingExam: false, savedScenario: null, pausedScenario: null, tasksCompleted: 0, timeRemaining: 60 };

// --- КАТАЛОГ РЕЖИМОВ ---
// Храним текущий режим
var currentModeName = '👉 Косматика (Easy)';

// Функции каталога
function openCatalog() {
    addClass('catalog-modal', 'open');
}

function closeCatalog() {
    removeClass('catalog-modal', 'open');
}

function showTab(tabId, buttonElement) {
    // 1. Скрыть все табы
    document.querySelectorAll('.catalog-tab-content').forEach(function(el) {
        el.style.display = 'none';
    });
    
    // 2. Показать нужный
    var tab = document.getElementById(tabId);
    if (tab) {
        tab.style.display = 'block';
    }
    
    // 3. Обновить стиль кнопок (active)
    document.querySelectorAll('.sidebar-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    // 4. Сбросить скролл правой области наверх
    var main = document.querySelector('.catalog-main');
    if (main) {
        main.scrollTop = 0;
    }
    
    // 5. Очистить поиск
    var searchInput = document.getElementById('cat-search');
    if (searchInput) {
        searchInput.value = '';
        filterCatalog();
    }
}

function filterCatalog() {
    var searchInput = document.getElementById('cat-search');
    if (!searchInput) return;
    
    var searchText = searchInput.value.toLowerCase().trim();
    var allTabs = document.querySelectorAll('.catalog-tab-content');
    
    // Работаем с секциями, чтобы сохранять структуру заголовков
    var allSections = document.querySelectorAll('.catalog-section');

    if (searchText === "") {
        // --- РЕЖИМ СБРОСА (Обычные вкладки) ---
        // 1. Сбрасываем видимость всех элементов
        document.querySelectorAll('.cat-card').forEach(function(c) { c.style.display = ''; });
        document.querySelectorAll('.cat-title').forEach(function(t) { t.style.display = ''; });
        allSections.forEach(function(s) { s.style.display = ''; });

        // 2. Определяем активную вкладку по кнопке
        var activeBtn = document.querySelector('.sidebar-btn.active');
        var targetTabId = 'tab-kosm'; 
        if (activeBtn) {
            var match = activeBtn.getAttribute('onclick').match(/'([^']+)'/);
            if (match) targetTabId = match[1];
        }

        // 3. Скрываем все вкладки, показываем только целевую
        allTabs.forEach(function(tab) {
            tab.style.display = (tab.id === targetTabId) ? 'block' : 'none';
        });
        
    } else {
        // --- РЕЖИМ ГЛОБАЛЬНОГО ПОИСКА ---
        // 1. Показываем содержимое ВСЕХ вкладок
        allTabs.forEach(function(tab) { tab.style.display = 'block'; });

        // 2. Фильтруем по Секциям
        allSections.forEach(function(section) {
            var titleEl = section.querySelector('.cat-title');
            var cards = section.querySelectorAll('.cat-card');
            
            // Текст заголовка секции (например "Красный (ClassicFire)")
            var sectionTitleText = titleEl ? titleEl.textContent.toLowerCase() : "";
            
            var visibleCardsCount = 0;

            cards.forEach(function(card) {
                var nameEl = card.querySelector('.cat-name');
                var name = nameEl ? nameEl.textContent.toLowerCase() : "";
                var onclickAttr = card.getAttribute('onclick') || "";
                
                // ВАЖНО: Ищем совпадение в Имени карты + ID режима + ЗАГОЛОВКЕ СЕКЦИИ
                // Это значит, если я пишу "красный", то найдутся все карты внутри секции "Красный", даже если на самих картах написано только "Hard"
                var searchScope = name + " " + onclickAttr.toLowerCase() + " " + sectionTitleText;

                if (searchScope.includes(searchText)) {
                    card.style.display = ''; // Показать
                    visibleCardsCount++;
                } else {
                    card.style.display = 'none'; // Скрыть
                }
            });

            // 3. Если в секции есть хоть что-то видимое — показываем секцию и ЗАГОЛОВОК
            if (visibleCardsCount > 0) {
                section.style.display = 'block';
                if (titleEl) titleEl.style.display = 'block'; // Явно показываем заголовок
            } else {
                section.style.display = 'none'; // Скрываем пустую секцию
            }
        });
    }
}

// --- ФУНКЦИИ ПЕРЕХОДА НА СЛЕДУЮЩИЙ УРОВЕНЬ (АВТОМАТ) ---
function closeLevelUpModal() {
    removeClass('level-up-modal', 'open');
}

function showLevelUpModal(streakCount, isSecond) {
    var content = getEl('level-up-content');
    if(!content) return;
    
    var question = '';
    var yesAction = '';
    
    if(isSecond) {
        question = 'Вы чётко поняли как работает это динамика на этом уровне! Пробуем следущий?';
    } else {
        question = 'Вы хорошо справляетесь, хотите попробовать следующий уровень?';
    }
    
    content.innerHTML = `
        <h2 style="color:white; margin-bottom: 20px;">🏆 Серия: ${streakCount} побед подряд!</h2>
        <p style="color:#ddd; font-size: 1.1em; margin-bottom: 30px;">${question}</p>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button class="next-btn-big" onclick="acceptLevelUp()" style="background: var(--success); flex: 1; min-width: 200px;">
                Да, хочу!
            </button>
            <button class="next-btn-big" onclick="rejectLevelUp()" style="background: #444; flex: 1; min-width: 200px;">
                ${isSecond ? 'Нет, я хочу просто набивать стрик! :)' : 'Нет, хочу ещё закрепить. Попозже перейду.'}
            </button>
        </div>
    `;
    addClass('level-up-modal', 'open');
}

function acceptLevelUp() {
    closeLevelUpModal();
    
    // Скрываем окно результата перед переходом
    var resultBox = getEl('trainer-result');
    if(resultBox) {
        showEl('trainer-result', false);
        resultBox.innerHTML = '';
    }
    
    // Сохраняем текущий режим для сброса стрика
    var currentMode = appGameMode;
    
    // Определяем следующий уровень
    var nextMode = '';
    var nextTitle = '';
    
    // Режимы Автомата
    if (appGameMode === 'automatch_newbie') {
        nextMode = 'automatch_easy';
        nextTitle = '👉👉 Автомат (Easy)';
    } else if (appGameMode === 'automatch_easy') {
        nextMode = 'automatch_hard';
        nextTitle = '👉👉 Автомат (Hard)';
    } else if (appGameMode === 'automatch_hard') {
        nextMode = 'automatch_nightmare';
        nextTitle = '👉👉 Автомат (Nightmare)';
    } else if (appGameMode === 'automatch_nightmare') {
        nextMode = 'automatch_impossible';
        nextTitle = '👉👉 Автомат (Impossible)';
    }
    // Режимы Косматики
    else if (appGameMode === 'newbie') {
        nextMode = 'easy';
        nextTitle = '👉 Косматика (Easy)';
    } else if (appGameMode === 'easy') {
        nextMode = 'hard';
        nextTitle = '👉 Косматика (Hard)';
    } else if (appGameMode === 'hard') {
        nextMode = 'nightmare';
        nextTitle = '👉 Косматика (Nightmare)';
    } else if (appGameMode === 'nightmare') {
        nextMode = 'impossible';
        nextTitle = '👉 Косматика (Impossible)';
    }
    // Режимы Ахалая
    else if (appGameMode === 'ahalay_newbie') {
        nextMode = 'ahalay_easy';
        nextTitle = '👋👋 Ахалай (Easy Mode)';
    } else if (appGameMode === 'ahalay_easy') {
        nextMode = 'ahalay_hard';
        nextTitle = '👋👋 Ахалай (Hard)';
    } else if (appGameMode === 'ahalay_hard') {
        nextMode = 'ahalay_nightmare';
        nextTitle = '👋👋 Ахалай (Nightmare)';
    } else if (appGameMode === 'ahalay_nightmare') {
        nextMode = 'ahalay_impossible';
        nextTitle = '👋👋 Ахалай (Impossible)';
    }
    // Режимы Винчестера
    else if (appGameMode === 'winchester_newbie') {
        nextMode = 'winchester_easy';
        nextTitle = '👉✊ Винчестер (Easy)';
    } else if (appGameMode === 'winchester_easy') {
        nextMode = 'winchester_hard';
        nextTitle = '👉✊ Винчестер (Hard)';
    } else if (appGameMode === 'winchester_hard') {
        nextMode = 'winchester_nightmare';
        nextTitle = '👉✊ Винчестер (Nightmare)';
    } else if (appGameMode === 'winchester_nightmare') {
        nextMode = 'winchester_impossible';
        nextTitle = '👉✊ Винчестер (Impossible)';
    }
    // Режимы Богомола
    else if (appGameMode === 'mantis_newbie') {
        nextMode = 'mantis_easy';
        nextTitle = '👐 Богомол (Easy Mode)';
    } else if (appGameMode === 'mantis_easy') {
        nextMode = 'mantis_hard';
        nextTitle = '👐 Богомол (Hard)';
    } else if (appGameMode === 'mantis_hard') {
        nextMode = 'mantis_nightmare';
        nextTitle = '👐 Богомол (Nightmare)';
    } else if (appGameMode === 'mantis_nightmare') {
        nextMode = 'mantis_impossible';
        nextTitle = '👐 Богомол (Impossible)';
    }
    
    if(nextMode) {
        // Сбрасываем стрик текущего режима перед переходом
        if (currentMode === 'automatch_easy') appAutomatchStreakEasy = 0;
        else if (currentMode === 'automatch_newbie') appAutomatchStreakNewbie = 0;
        else if (currentMode === 'automatch_easy') appAutomatchStreakEasy = 0;
        else if (currentMode === 'automatch_hard') appAutomatchStreakHard = 0;
        else if (currentMode === 'automatch_nightmare') appAutomatchStreakNightmare = 0;
        else if (currentMode === 'newbie') appKosmatikaStreakNewbie = 0;
        else if (currentMode === 'easy') appKosmatikaStreakEasy = 0;
        else if (currentMode === 'hard') appKosmatikaStreakHard = 0;
        else if (currentMode === 'nightmare') appKosmatikaStreakNightmare = 0;
        else if (currentMode === 'ahalay_newbie') appAhalayStreakNewbie = 0;
        else if (currentMode === 'ahalay_easy') appAhalayStreakEasy = 0;
        else if (currentMode === 'ahalay_hard') appAhalayStreakHard = 0;
        else if (currentMode === 'ahalay_nightmare') appAhalayStreakNightmare = 0;
        else if (currentMode === 'mantis_easy') appMantisStreakEasy = 0;
        else if (currentMode === 'mantis_hard') appMantisStreakHard = 0;
        else if (currentMode === 'mantis_nightmare') appMantisStreakNightmare = 0;
        else if (currentMode === 'who_easy') appWhoStreakEasy = 0;
        else if (currentMode === 'who_hard') appWhoStreakHard = 0;
        else if (currentMode === 'who_nightmare') appWhoStreakNightmare = 0;
        
        // Сбрасываем стрик нового режима (начинаем с нуля)
        if (nextMode === 'automatch_hard') appAutomatchStreakHard = 0;
        else if (nextMode === 'automatch_nightmare') appAutomatchStreakNightmare = 0;
        else if (nextMode === 'easy') appKosmatikaStreakEasy = 0;
        else if (nextMode === 'hard') appKosmatikaStreakHard = 0;
        else if (nextMode === 'nightmare') appKosmatikaStreakNightmare = 0;
        else if (nextMode === 'ahalay_easy') appAhalayStreakEasy = 0;
        else if (nextMode === 'ahalay_hard') appAhalayStreakHard = 0;
        else if (nextMode === 'ahalay_nightmare') appAhalayStreakNightmare = 0;
        else if (nextMode === 'mantis_easy') appMantisStreakEasy = 0;
        else if (nextMode === 'mantis_hard') appMantisStreakHard = 0;
        else if (nextMode === 'mantis_nightmare') appMantisStreakNightmare = 0;
        else if (nextMode === 'who_easy') appWhoStreakEasy = 0;
        else if (nextMode === 'who_hard') appWhoStreakHard = 0;
        else if (nextMode === 'who_nightmare') appWhoStreakNightmare = 0;
        
        // Сбрасываем состояние Nightmare, если было активно
        if (currentMode === 'automatch_nightmare' || currentMode === 'nightmare' || currentMode === 'ahalay_nightmare' || currentMode === 'mantis_nightmare') {
            appNightmareState.isActive = false;
        }
        
        // Переключаемся на следующий уровень
        selectMode(nextMode, nextTitle);
    }
}

function rejectLevelUp() {
    closeLevelUpModal();
    // Продолжаем тренировку в текущем режиме
    // Добавляем кнопку "Следующая задача" если её нет
    var resultBox = getEl('trainer-result');
    if(resultBox) {
        if(resultBox.querySelectorAll('button').length === 0) {
            var nextBtn = document.createElement('button');
            nextBtn.className = 'next-btn-big';
            nextBtn.innerText = 'Следующая задача ➡️';
            if (appGameMode === 'automatch_nightmare' || appGameMode === 'nightmare' || appGameMode === 'ahalay_nightmare') {
                nextBtn.onclick = function() { appNightmareState.isActive = false; runSkipTask(); };
            } else {
                nextBtn.onclick = runSkipTask;
            }
            resultBox.appendChild(nextBtn);
        }
    }
}

function resetDrillFilter() {
    appDrillFilter.active = false;
    appDrillFilter.night = null;
    appDrillFilter.prevHit = null;
    appDrillFilter.actionType = null;
    appDrillFilter.kIndexOffset = 0;
    appDrillFilter.allowedScenarios = [];
    appDrillFilter.allowedActions = [];
    appDrillFilterLabel = "";
    
    // Сброс кастомных данных
    appDrillFilter.customKosmatika = [];
    appDrillFilter.customBlacks = [];
    appDrillFilter.customDon = 0;
    appDrillFilter.customSheriff = 0;
}

function resetDrill() {
    // Сбрасываем фильтры дриллов
    resetDrillFilter();
    
    // Сбрасываем конструктор дриллов
    appDrillConstructorActive = false;
    appDrillConstructorSelection.shooting = [];
    appDrillConstructorSelection.action = [];
    
    // Сбрасываем визуальные элементы конструктора
    var constructorSwitch = document.querySelector('.drill-mode-switch');
    if (constructorSwitch) {
        constructorSwitch.classList.remove('active');
    }
    
    var selectedCards = document.querySelectorAll('.cat-card.selected');
    selectedCards.forEach(function(card) {
        card.classList.remove('selected');
    });
    
    var runBtn = document.getElementById('btn-run-drill');
    if (runBtn) {
        runBtn.style.display = 'none';
    }
    
    // Генерируем новый сценарий
    generateRandomScenario();
}

function selectDrill(drillType, event) {
    // --- ROUTING: redirect to drills.html if on a different page ---
    var currentFile = getCurrentPageFile();
    if (currentFile !== 'drills.html') {
        window.location.href = 'drills.html?drill=' + encodeURIComponent(drillType);
        return;
    }
    
    // Если режим конструктора активен, работаем с выделением карточек (Multi-select)
    if (appDrillConstructorActive) {
        // Определяем, к какой группе относится дрилл
        var shootingDrills = ['active-digit-1', 'active-digit-2', 'active-digit-3', 'miss-night-1', 'miss-night-2', 'miss-night-3', 'miss-night-4', 'miss-night-5', 'killed-sheriff', 'sheriff-alive', '2-versions'];
        var actionDrills = ['only-none', 'only-digit', 'only-badge'];
        
        if (shootingDrills.includes(drillType)) {
            // Toggle логика для дриллов стрельбы
            var idx = appDrillConstructorSelection.shooting.indexOf(drillType);
            if (idx > -1) {
                // Если уже выбран - убираем
                appDrillConstructorSelection.shooting.splice(idx, 1);
                if (event && event.currentTarget) {
                    event.currentTarget.classList.remove('selected');
                }
            } else {
                // Если не выбран - добавляем
                appDrillConstructorSelection.shooting.push(drillType);
                if (event && event.currentTarget) {
                    event.currentTarget.classList.add('selected');
                }
            }
        } else if (actionDrills.includes(drillType)) {
            // Toggle логика для дриллов действий
            var idx = appDrillConstructorSelection.action.indexOf(drillType);
            if (idx > -1) {
                // Если уже выбран - убираем
                appDrillConstructorSelection.action.splice(idx, 1);
                if (event && event.currentTarget) {
                    event.currentTarget.classList.remove('selected');
                }
            } else {
                // Если не выбран - добавляем
                appDrillConstructorSelection.action.push(drillType);
                if (event && event.currentTarget) {
                    event.currentTarget.classList.add('selected');
                }
            }
        }
        
        // Показываем/скрываем кнопку запуска
        var btnRun = document.getElementById('btn-run-drill');
        if (btnRun) {
            // Проверяем наличие кастомных данных
            var customNumbersInput = document.getElementById('drill-custom-numbers');
            var customBlacksInput = document.getElementById('drill-custom-blacks');
            var hasCustomData = (customNumbersInput && customNumbersInput.value.trim() !== '') || 
                                (customBlacksInput && customBlacksInput.value.trim() !== '');
            
            if (appDrillConstructorSelection.shooting.length > 0 || 
                appDrillConstructorSelection.action.length > 0 || 
                hasCustomData) {
                btnRun.style.display = 'block';
            } else {
                btnRun.style.display = 'none';
            }
        }
        
        return; // Не запускаем сценарий сразу
    }
    
    // Обычный режим - запускаем дрилл сразу
    // Используем выбранную сложность для дриллов
    var baseDifficulty = currentDrillDifficulty || 'easy';
    
    // МОДУЛЬНОЕ формирование заголовка режима на основе выбранной системы
    var drillSystem = (typeof currentDrillSystem !== 'undefined') ? currentDrillSystem : 'kosmatika';
    var modeName = getDrillModeTitle(drillSystem, baseDifficulty);
    
    // Префиксуем режим системой, чтобы generateRandomScenario использовал правильную систему
    var selectedMode = baseDifficulty;
    if (drillSystem === 'auto') {
        selectedMode = 'automatch_' + baseDifficulty;
    } else if (drillSystem === 'winchester') {
        selectedMode = 'winchester_' + baseDifficulty;
    } else if (drillSystem === 'bazooka') {
        selectedMode = 'bazooka_' + baseDifficulty;
    }
    
    selectMode(selectedMode, modeName, true);
    appDrillState.isActive = false;

    resetDrillFilter();
    appDrillFilter.active = true;

    switch (drillType) {
        case 'active-digit-1':
            appDrillFilterLabel = "1️⃣ Активна 1-я цифра";
            appDrillFilter.night = Math.random() < 0.5 ? 1 : 2; // Ночь 1 или 2
            appDrillFilter.prevHit = null;
            appDrillFilter.kIndexOffset = 0;
            break;
        case 'miss-night-1':
            appDrillFilterLabel = "❌ Промах в 1-ю ночь";
            appDrillFilter.night = 2;
            appDrillFilter.prevHit = false;
            appDrillFilter.kIndexOffset = 0;
            break;
        case 'miss-night-2':
            appDrillFilterLabel = "❌ Промах во 2-ю ночь";
            appDrillFilter.night = 3;
            appDrillFilter.prevHit = false;
            appDrillFilter.kIndexOffset = 0;
            break;
        case 'miss-night-3':
            appDrillFilterLabel = "❌ Промах в 3-ю ночь";
            appDrillFilter.night = 4;
            appDrillFilter.prevHit = false;
            appDrillFilter.kIndexOffset = 0;
            break;
        case 'miss-night-4':
            appDrillFilterLabel = "❌ Промах в 4-ю ночь";
            appDrillFilter.night = 5;
            appDrillFilter.prevHit = false;
            appDrillFilter.kIndexOffset = 0;
            break;
        case 'miss-night-5':
            appDrillFilterLabel = "❌ Промах в 5-ю ночь";
            appDrillFilter.night = 6;
            appDrillFilter.prevHit = false;
            appDrillFilter.kIndexOffset = 0;
            break;
        case 'active-digit-2':
            appDrillFilterLabel = "2️⃣ Активна 2-я цифра";
            appDrillFilter.night = Math.random() < 0.5 ? 2 : 3; // Ночь 2 или 3
            appDrillFilter.prevHit = true;
            appDrillFilter.kIndexOffset = 1;
            break;
        case 'active-digit-3':
            appDrillFilterLabel = "3️⃣ Активна 3-я цифра";
            appDrillFilter.night = Math.random() < 0.5 ? 3 : 4; // Ночь 3 или 4
            appDrillFilter.prevHit = true;
            appDrillFilter.kIndexOffset = 2;
            break;
        case 'only-badge':
            appDrillFilterLabel = "👌 Только Жетон";
            appDrillFilter.actionType = 'badge';
            break;
        case 'only-digit':
            appDrillFilterLabel = "👆 Только Цифра";
            appDrillFilter.actionType = 'digit';
            break;
        case 'only-none':
            appDrillFilterLabel = "🤫 Ничего не показывал (Пас)";
            appDrillFilter.actionType = 'none';
            break;
        case 'killed-sheriff':
            appDrillFilterLabel = "💀 Убит Шериф";
            appDrillFilter.night = Math.random() < 0.5 ? 2 : 3; // Ночь 2 или 3
            appDrillFilter.sheriffDead = true; // Шериф мертв
            appDrillFilter.ensureRedChecks = true; // Обязательно красные проверки Шерифа
            appDrillFilter.donNoChecks = true; // Дон не вскрывался (нет проверок)
            break;
        case 'sheriff-alive':
            appDrillFilterLabel = "🟢 Шериф жив";
            appDrillFilter.night = Math.random() < 0.5 ? 2 : 3; // Ночь 2 или 3
            appDrillFilter.sheriffAlive = true; // Шериф ОБЯЗАТЕЛЬНО жив
            break;
        case '2-versions':
            appDrillFilterLabel = "⚔️ 2 версии (Лже-шериф)";
            appDrillFilter.night = Math.random() < 0.5 ? 2 : 3; // Ночь 2 или 3
            appDrillFilter.dualVersions = true; // Режим 2 версий
            appDrillFilter.ensureBothChecks = true; // У обоих должны быть проверки
            break;
        default:
            appDrillFilterLabel = "🧩 Дрилл";
            break;
    }

    updateStatsUI();
    generateRandomScenario();
}

function setDrillDifficulty(difficulty) {
    // Обновляем глобальную переменную сложности
    currentDrillDifficulty = difficulty;
    
    // Убираем класс active со всех кнопок
    var allBtns = document.querySelectorAll('.drill-diff-selector .dd-btn');
    allBtns.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    // Добавляем класс active на выбранную кнопку
    var activeBtn = document.querySelector('.dd-btn[data-diff="' + difficulty + '"]');
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

/**
 * Генерирует заголовок режима для дриллов на основе выбранной системы и сложности.
 * 
 * @param {string} system - ID системы: 'kosmatika', 'auto', 'winchester'
 * @param {string} difficulty - Уровень сложности: 'newbie', 'easy', 'hard', 'nightmare', 'impossible'
 * @returns {string} Форматированный заголовок, например "👉✊ Винчестер (Easy)"
 */
function getDrillModeTitle(system, difficulty) {
    // Форматируем сложность (первая буква заглавная)
    var difficultyTitle = difficulty.split('-').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
    
    // МОДУЛЬНОЕ ОПРЕДЕЛЕНИЕ НАЗВАНИЯ И ИКОНКИ
    switch (system) {
        case 'auto':
            return '👉👉 Автомат (' + difficultyTitle + ')';
        
        case 'winchester':
            return '👉✊ Винчестер (' + difficultyTitle + ')';
        
        case 'bazooka':
            return '🚀 Базука (' + difficultyTitle + ')';
        
        case 'kosmatika':
        default:
            return '👉 Косматика (' + difficultyTitle + ')';
    }
}

/**
 * Переключает активную систему дриллов (Косматика/Автомат/Винчестер).
 * 
 * МОДУЛЬНАЯ АРХИТЕКТУРА:
 * Для добавления нового режима выполните 4 шага:
 * 
 * 1. HTML: Добавьте кнопку с id="drill-mode-НАЗВАНИЕ"
 *    <button onclick="setDrillMode('newmode')" id="drill-mode-newmode">Новый режим</button>
 * 
 * 2. CSS: Добавьте стиль для активного состояния
 *    #drill-mode-newmode.active-mode { background: #цвет; color: #fff; border-color: #цвет; }
 *    .bg-newmode-600 { background-color: #цвет !important; }
 * 
 * 3. JS (здесь): Добавьте case в блок управления цветом
 *    else if (system === 'newmode') { activeBtn.classList.add('bg-newmode-600'); }
 * 
 * 4. JS (generateRandomScenario): Добавьте case в switch модульного расчета
 *    case 'newmode': appGameMode = 'newmode_' + currentDrillDifficulty; ...
 * 
 * 5. JS (getDrillModeTitle): Добавьте case для названия режима
 *    case 'newmode': return '🎯 Новый Режим (' + difficultyTitle + ')';
 * 
 * @param {string} system - ID системы: 'kosmatika', 'auto', 'winchester'
 */
function setDrillMode(system) {
    // Обновляем глобальную переменную системы дриллов
    currentDrillSystem = system;
    
    // Убираем класс active-mode со всех кнопок
    var allBtns = document.querySelectorAll('.drill-mode-btn');
    allBtns.forEach(function(btn) {
        btn.classList.remove('active-mode');
        btn.classList.remove('text-white');
        btn.classList.add('text-gray-400');
        btn.classList.remove('bg-yellow-600', 'bg-blue-600', 'bg-orange-600', 'bg-green-600');
        // Убираем inline стили, если они были установлены
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
    });
    
    // Добавляем класс active-mode на выбранную кнопку
    var activeBtn = document.getElementById('drill-mode-' + system);
    if (activeBtn) {
        activeBtn.classList.add('active-mode');
        activeBtn.classList.remove('text-gray-400');
        activeBtn.classList.add('text-white');
        
        // МОДУЛЬНОЕ УПРАВЛЕНИЕ ЦВЕТОМ: добавьте новые режимы здесь
        if (system === 'kosmatika') {
            activeBtn.classList.add('bg-yellow-600');
        } else if (system === 'auto') {
            activeBtn.classList.add('bg-blue-600');
        } else if (system === 'winchester') {
            activeBtn.classList.add('bg-orange-600');
        } else if (system === 'bazooka') {
            activeBtn.classList.add('bg-green-600');
        }
        // Для нового режима: else if (system === 'newmode') { activeBtn.classList.add('bg-newmode-600'); }
    }
    
    // ВАЖНО: Сбрасываем текущую игру при смене системы
    if (typeof resetDrill === 'function') {
        resetDrill();
    }
    
    console.log('Drill system changed to:', system);
}

function toggleDrillConstructor() {
    appDrillConstructorActive = !appDrillConstructorActive;
    
    var switchEl = document.querySelector('.drill-mode-switch');
    var tabDrills = document.getElementById('tab-drills');
    var btnRun = document.getElementById('btn-run-drill');
    
    if (appDrillConstructorActive) {
        // Включаем режим конструктора
        if (switchEl) switchEl.classList.add('active');
        if (tabDrills) tabDrills.classList.add('constructor-active');
    } else {
        // Выключаем режим конструктора
        if (switchEl) switchEl.classList.remove('active');
        if (tabDrills) tabDrills.classList.remove('constructor-active');
        if (btnRun) btnRun.style.display = 'none';
        
        // Снимаем все выделения
        var allCards = document.querySelectorAll('#tab-drills .cat-card');
        allCards.forEach(function(card) {
            card.classList.remove('selected');
        });
        
        // Сбрасываем выбор (пустые массивы)
        appDrillConstructorSelection.shooting = [];
        appDrillConstructorSelection.action = [];
        
        // Очищаем кастомные инпуты
        var customNumbersInput = document.getElementById('drill-custom-numbers');
        var customBlacksInput = document.getElementById('drill-custom-blacks');
        var customDonInput = document.getElementById('drill-custom-don');
        var customSheriffInput = document.getElementById('drill-custom-sheriff');
        if (customNumbersInput) customNumbersInput.value = '';
        if (customBlacksInput) customBlacksInput.value = '';
        if (customDonInput) customDonInput.value = '';
        if (customSheriffInput) customSheriffInput.value = '';
    }
}

function runConstructorDrill() {
    var shootingArr = appDrillConstructorSelection.shooting;
    var actionArr = appDrillConstructorSelection.action;
    
    // === ШАГ 1: СНАЧАЛА СБРАСЫВАЕМ ФИЛЬТР ===
    var baseDifficulty = currentDrillDifficulty || 'easy';
    var drillSystem = (typeof currentDrillSystem !== 'undefined') ? currentDrillSystem : 'kosmatika';
    var modeName = getDrillModeTitle(drillSystem, baseDifficulty);
    
    // Префиксуем режим системой, чтобы generateRandomScenario использовал правильную систему
    var selectedMode = baseDifficulty;
    if (drillSystem === 'auto') {
        selectedMode = 'automatch_' + baseDifficulty;
    } else if (drillSystem === 'winchester') {
        selectedMode = 'winchester_' + baseDifficulty;
    } else if (drillSystem === 'bazooka') {
        selectedMode = 'bazooka_' + baseDifficulty;
    }
    
    selectMode(selectedMode, modeName, true);
    appDrillState.isActive = false;
    resetDrillFilter(); // Очищаем ВСЕ старые данные
    
    // === ШАГ 2: СЧИТЫВАЕМ КАСТОМНЫЕ ДАННЫЕ ИЗ ИНПУТОВ ===
    var customNumbersInput = document.getElementById('drill-custom-numbers');
    var customBlacksInput = document.getElementById('drill-custom-blacks');
    
    var customKosmatikaArr = [];
    var customBlacksArr = [];
    
    // Вспомогательная функция парсинга: слитные цифры, где "0" = 10
    function parseDigitString(str) {
        // 1. Удаляем все не-цифровые символы
        var digitsOnly = str.replace(/\D/g, '');
        
        // 2. Разбиваем на отдельные символы (цифры)
        // 3-5. Преобразуем каждую цифру в число, применяя правило "0 = 10"
        return digitsOnly.split('').map(function(digit) {
            var num = parseInt(digit, 10);
            return num === 0 ? 10 : num; // Правило: 0 -> 10
        });
    }
    
    // Парсинг цифр динамики (косматика)
    // Максимум 3 цифры
    // Пример: "123" -> [1, 2, 3], "120" -> [1, 2, 10], "890" -> [8, 9, 10]
    if (customNumbersInput && customNumbersInput.value.trim() !== '') {
        var parsed = parseDigitString(customNumbersInput.value);
        customKosmatikaArr = parsed.slice(0, 3); // Берем максимум 3
    }
    
    // Парсинг номеров черной команды (только 1-10, максимум 3, без дубликатов)
    // Пример: "123" -> [1, 2, 3], "890" -> [8, 9, 10]
    if (customBlacksInput && customBlacksInput.value.trim() !== '') {
        var parsed = parseDigitString(customBlacksInput.value);
        // Фильтруем: оставляем только валидные номера (1-10)
        parsed = parsed.filter(function(n) {
            return n >= 1 && n <= 10;
        });
        
        // Убираем дубликаты (оставляем только уникальные)
        var seen = {};
        var unique = [];
        for (var i = 0; i < parsed.length; i++) {
            if (!seen[parsed[i]]) {
                unique.push(parsed[i]);
                seen[parsed[i]] = true;
            }
        }
        
        // Берем максимум первые 3 уникальные
        customBlacksArr = unique.slice(0, 3);
    }
    
    // Парсинг Дона (одна цифра)
    var customDonInput = document.getElementById('drill-custom-don');
    var customDon = 0;
    if (customDonInput && customDonInput.value.trim() !== '') {
        var parsed = parseDigitString(customDonInput.value);
        if (parsed.length > 0 && parsed[0] >= 1 && parsed[0] <= 10) {
            customDon = parsed[0]; // Берем первую цифру
        }
    }
    
    // Парсинг Шерифа (одна цифра)
    var customSheriffInput = document.getElementById('drill-custom-sheriff');
    var customSheriff = 0;
    if (customSheriffInput && customSheriffInput.value.trim() !== '') {
        var parsed = parseDigitString(customSheriffInput.value);
        if (parsed.length > 0 && parsed[0] >= 1 && parsed[0] <= 10) {
            customSheriff = parsed[0]; // Берем первую цифру
        }
    }
    
    // === ШАГ 3: ПРОВЕРКА - ЕСТЬ ЛИ ЧТО ЗАПУСКАТЬ? ===
    var hasCustomData = (customKosmatikaArr.length > 0 || customBlacksArr.length > 0 || customDon > 0 || customSheriff > 0);
    if (shootingArr.length === 0 && actionArr.length === 0 && !hasCustomData) {
        return; // Нечего запускать
    }
    
    // === ШАГ 4: СОХРАНЯЕМ КАСТОМНЫЕ ДАННЫЕ В ФИЛЬТР ===
    appDrillFilter.customKosmatika = customKosmatikaArr;
    appDrillFilter.customBlacks = customBlacksArr;
    appDrillFilter.customDon = customDon;
    appDrillFilter.customSheriff = customSheriff;
    appDrillFilter.active = true; // Активируем фильтр
    
    // Преобразуем массив дриллов стрельбы в массив объектов конфигурации
    appDrillFilter.allowedScenarios = [];
    var scenarioLabels = [];
    
    for (var i = 0; i < shootingArr.length; i++) {
        var drillType = shootingArr[i];
        var config = null;
        var label = "";
        
        switch (drillType) {
            case 'active-digit-1':
                label = "1️⃣ Активна 1-я цифра";
                config = { night: Math.random() < 0.5 ? 1 : 2, prevHit: null, kIndexOffset: 0, label: label };
                break;
            case 'miss-night-1':
                label = "❌ Промах в 1-ю ночь";
                config = { night: 2, prevHit: false, kIndexOffset: 0, label: label };
                break;
            case 'miss-night-2':
                label = "❌ Промах во 2-ю ночь";
                config = { night: 3, prevHit: false, kIndexOffset: 0, label: label };
                break;
            case 'miss-night-3':
                label = "❌ Промах в 3-ю ночь";
                config = { night: 4, prevHit: false, kIndexOffset: 0, label: label };
                break;
            case 'active-digit-2':
                label = "2️⃣ Активна 2-я цифра";
                config = { night: Math.random() < 0.5 ? 2 : 3, prevHit: true, kIndexOffset: 1, label: label };
                break;
            case 'active-digit-3':
                label = "3️⃣ Активна 3-я цифра";
                config = { night: Math.random() < 0.5 ? 3 : 4, prevHit: true, kIndexOffset: 2, label: label };
                break;
            case 'miss-night-4':
                label = "❌ Промах в 4-ю ночь";
                config = { night: 5, prevHit: false, kIndexOffset: 0, label: label };
                break;
            case 'miss-night-5':
                label = "❌ Промах в 5-ю ночь";
                config = { night: 6, prevHit: false, kIndexOffset: 0, label: label };
                break;
            case 'killed-sheriff':
                label = "💀 Убит Шериф";
                config = { 
                    night: Math.random() < 0.5 ? 2 : 3, 
                    sheriffDead: true, 
                    ensureRedChecks: true, 
                    donNoChecks: true, 
                    label: label 
                };
                break;
            case 'sheriff-alive':
                label = "🟢 Шериф жив";
                config = { 
                    night: Math.random() < 0.5 ? 2 : 3, 
                    sheriffAlive: true, 
                    label: label 
                };
                break;
            case '2-versions':
                label = "⚔️ 2 версии";
                config = { 
                    night: Math.random() < 0.5 ? 2 : 3, 
                    dualVersions: true, 
                    ensureBothChecks: true, 
                    label: label 
                };
                break;
        }
        
        if (config) {
            appDrillFilter.allowedScenarios.push(config);
            scenarioLabels.push(label);
        }
    }
    
    // Преобразуем массив дриллов действий в массив типов действий
    appDrillFilter.allowedActions = [];
    var actionLabels = [];
    
    for (var j = 0; j < actionArr.length; j++) {
        var actionType = actionArr[j];
        var actionConfig = null;
        var actionLabel = "";
        
        switch (actionType) {
            case 'only-badge':
                actionLabel = "👌 Жетон";
                actionConfig = { type: 'badge', label: actionLabel };
                break;
            case 'only-digit':
                actionLabel = "👆 Цифра";
                actionConfig = { type: 'digit', label: actionLabel };
                break;
            case 'only-none':
                actionLabel = "🤫 Пас";
                actionConfig = { type: 'none', label: actionLabel };
                break;
        }
        
        if (actionConfig) {
            appDrillFilter.allowedActions.push(actionConfig);
            actionLabels.push(actionLabel);
        }
    }
    
    // Формируем общий лейбл для отображения
    if (scenarioLabels.length > 0 && actionLabels.length > 0) {
        appDrillFilterLabel = "🧩 Комбо: [" + scenarioLabels.join(", ") + "] × [" + actionLabels.join(", ") + "]";
    } else if (scenarioLabels.length > 0) {
        appDrillFilterLabel = "🧩 Стрельба: [" + scenarioLabels.join(", ") + "]";
    } else if (actionLabels.length > 0) {
        appDrillFilterLabel = "🧩 Действия: [" + actionLabels.join(", ") + "]";
    } else {
        appDrillFilterLabel = "🧩 Дрилл (Комбо)";
    }
    
    // Закрываем каталог и запускаем
    closeCatalog();
    updateStatsUI();
    generateRandomScenario();
}

// Главная функция переключения
function selectMode(modeValue, modeTitle, skipRedirect) {
    // --- ROUTING: redirect to another page if needed ---
    if (!skipRedirect && shouldRedirect(modeValue)) {
        localStorage.setItem('last_game_mode', modeValue);
        localStorage.setItem('last_game_title', modeTitle);
        var targetFile = getTargetFileForMode(modeValue);
        window.location.href = targetFile + '?mode=' + encodeURIComponent(modeValue) + '&title=' + encodeURIComponent(modeTitle);
        return;
    }
    
    closeCatalog();
    closeLevelUpModal();
    
    // Сохраняем предыдущий режим для проверки перехода на следующий уровень
    var prevMode = appGameMode;
    
    // Обновляем глобальную переменную
    appGameMode = modeValue;
    currentModeName = modeTitle;

    // Обновляем текст на главной кнопке
    var btnLabel = document.getElementById('current-mode-label');
    if(btnLabel) btnLabel.innerText = modeTitle;

    // Сброс таймеров и состояний
    if (impossibleTimer) clearInterval(impossibleTimer);
    appImpossibleState.isActive = false;
    appNightmareState.isActive = false;
    appDrillState.isActive = false;
    resetDrillFilter();
    
        // Инициализация цикла ночей для Ахалая
        if (isAhalayMode()) {
            appAhalayNightCycle = [1, 2, 3];
            appAhalayNightCycleIndex = 0;
            appLastBlackTeamJson = ""; 
            if (modeValue === 'ahalay_newbie') {
                appAhalayNewbieDynamicModifier = 0;
            }
        } else {
            appLastBlackTeamJson = "";
            appAhalayNewbieDynamicModifier = 0;
        }
        
        // Сброс переменных для Impossible
        if (modeValue === 'impossible' || modeValue === 'automatch_impossible' || modeValue === 'ahalay_impossible' || modeValue === 'winchester_impossible' || modeValue === 'who_impossible' || modeValue === 'mantis_impossible' || modeValue === 'red_impossible' || modeValue === 'black_impossible' || modeValue === 'redblack_impossible') {
            appImpossibleState.tasksCompleted = 0;
            appImpossibleState.timeRemaining = 60;
            appImpossibleState.hasPendingExam = false;
        }
    
    // Сброс стриков
    if (modeValue !== 'automatch_easy') appAutomatchStreakEasy = 0;
    if (modeValue !== 'automatch_hard') appAutomatchStreakHard = 0;
    if (modeValue !== 'automatch_nightmare') appAutomatchStreakNightmare = 0;
    if (modeValue !== 'newbie') appKosmatikaStreakNewbie = 0;
    if (modeValue !== 'easy') appKosmatikaStreakEasy = 0;
    if (modeValue !== 'ahalay_easy') appAhalayStreakEasy = 0;
    if (modeValue !== 'ahalay_hard') appAhalayStreakHard = 0;
    if (modeValue !== 'ahalay_nightmare') appAhalayStreakNightmare = 0;
    if (modeValue !== 'winchester_newbie') appWinchesterStreakNewbie = 0;
    if (modeValue !== 'winchester_easy') appWinchesterStreakEasy = 0;
    if (modeValue !== 'winchester_hard') appWinchesterStreakHard = 0;
    if (modeValue !== 'winchester_nightmare') appWinchesterStreakNightmare = 0;
    if (modeValue !== 'who_easy') appWhoStreakEasy = 0;
    if (modeValue !== 'who_hard') appWhoStreakHard = 0;
    if (modeValue !== 'who_nightmare') appWhoStreakNightmare = 0;
    if (modeValue !== 'mantis_easy') appMantisStreakEasy = 0;
    if (modeValue !== 'mantis_hard') appMantisStreakHard = 0;
    if (modeValue !== 'mantis_nightmare') appMantisStreakNightmare = 0;
    if (modeValue !== 'bazooka_newbie') appBazookaStreakNewbie = 0;
    if (modeValue !== 'bazooka_easy') appBazookaStreakEasy = 0;
    if (modeValue !== 'bazooka_hard') appBazookaStreakHard = 0;
    if (modeValue !== 'bazooka_nightmare') appBazookaStreakNightmare = 0;
    appBazookaTheoryMode = false;
    appBazookaTheoryCounter = 0;
    
    if (modeValue !== 'hard') appKosmatikaStreakHard = 0;
    if (modeValue !== 'nightmare') appKosmatikaStreakNightmare = 0;
    
    var ov = getEl('impossible-exam-overlay');
    if(ov) document.body.removeChild(ov);
    
    showEl('view-trainer', false);
    showEl('view-calc', false);
    showEl('view-calc-automatch', false);
    showEl('bonus-hint-text', false);
    showEl('trainer-result', false);
    showEl('skip-btn', true);
    
    removeClass('trainer-info-panel', 'content-hidden');
    setModeSelectorState(true);

    // Проверка на pending exam (Impossible)
    if ((modeValue === 'impossible' || modeValue === 'automatch_impossible' || modeValue === 'ahalay_impossible' || modeValue === 'winchester_impossible' || modeValue === 'who_impossible' || modeValue === 'mantis_impossible' || modeValue === 'red_impossible' || modeValue === 'black_impossible' || modeValue === 'redblack_impossible') && appImpossibleState.hasPendingExam && appImpossibleState.savedScenario) {
        appGameMode = modeValue;
        showEl('view-trainer', true);
        appCurrentScenarioData = appImpossibleState.savedScenario;
        appCurrentSolution = appCurrentScenarioData.solution;
        var trainerView = getEl('view-trainer');
        trainerView.classList.remove('hard-mode-active', 'nightmare-mode-active', 'automatch-mode-active', 'who-mode-active', 'mantis-mode-active', 'check-mode-active');
        trainerView.classList.add('impossible-mode-active');
        showEl('bonus-hint-text', true);
        renderScenario(appCurrentScenarioData);
        launchImpossibleExamOverlay();
        updateStatsUI();
        return;
    }

    // Логика отображения view
    if (modeValue === 'calc') {
        showEl('view-calc', true);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        var bi = getEl('bonus-indicator');
        if(bi) bi.style.display = 'none';
        appGameMode = 'calc';
    } else if (modeValue === 'automatch_calc') {
        showEl('view-trainer', false);
        showEl('view-calc', true);
        showEl('view-calc-automatch', true);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        var bi = getEl('bonus-indicator');
        if(bi) bi.style.display = 'none';
        appGameMode = 'automatch_calc';
    } else if (modeValue === 'ahalay_calc') {
        showEl('view-trainer', false);
        showEl('view-calc', true);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', true);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        var bi = getEl('bonus-indicator'); 
        if(bi) bi.style.display = 'none';
        appGameMode = 'ahalay_calc';
    } else if (modeValue === 'winchester_calc') {
        showEl('view-trainer', false);
        showEl('view-calc', true);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', true);
        showEl('view-math', false);
        var bi = getEl('bonus-indicator'); 
        if(bi) bi.style.display = 'none';
        appGameMode = 'winchester_calc';
    } else if (modeValue === 'who_calc') {
        showEl('view-trainer', false);
        showEl('view-calc', true);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', true);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        var bi = getEl('bonus-indicator'); if(bi) bi.style.display = 'none';
        appGameMode = 'who_calc';
    } else if (modeValue === 'mantis_calc') {
        showEl('view-trainer', false);
        showEl('view-calc', true);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', true);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        var bi = getEl('bonus-indicator'); if(bi) bi.style.display = 'none';
        appGameMode = 'mantis_calc';
    } else if (modeValue === 'check_calc') {
        showEl('view-trainer', false);
        showEl('view-calc', true);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', true);
        var bi = getEl('bonus-indicator'); if(bi) bi.style.display = 'none';
        appGameMode = 'check_calc';
    } else if (modeValue === 'math_mode') {
        showEl('view-trainer', false);
        showEl('view-calc', false);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', true);
        var bi = getEl('bonus-indicator'); if(bi) bi.style.display = 'none';
        appGameMode = 'math_mode';
        initMathMode();
    } else if (modeValue === 'bazooka' || modeValue === 'bazooka_pro' || modeValue === 'bazooka_calc') {
        showEl('view-trainer', false);
        showEl('view-calc', true);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        var bi = getEl('bonus-indicator'); if(bi) bi.style.display = 'none';
        appGameMode = modeValue;
    } else if (
        modeValue.startsWith('automatch_') || 
        modeValue.startsWith('ahalay_') ||
        modeValue.startsWith('winchester_') ||
        modeValue.startsWith('bazooka_') ||
        modeValue.startsWith('wolverine_') ||
        modeValue.startsWith('who_') ||
        modeValue.startsWith('mantis_') ||
        modeValue.startsWith('check_') ||
        modeValue.startsWith('red_') ||
        modeValue.startsWith('black_') ||
        modeValue.startsWith('redblack_')
    ) {
        showEl('view-trainer', true);
        showEl('view-calc', false);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        
        // Просто присваиваем режим
        appGameMode = modeValue;
        
        var trainerView = getEl('view-trainer');
        if (trainerView) {
            if (isMantisMode()) trainerView.classList.add('mantis-mode-active');
            else if (isCheckMode()) trainerView.classList.add('check-mode-active');
            else if (isWhoMode()) trainerView.classList.add('who-mode-active');
        }
        
        updateStatsUI();
        generateRandomScenario();
    } else if (modeValue === 'judge') {
        // Judge mode now lives in judge.html
        window.location.href = 'judge.html';
        return;
    } else {
        showEl('view-trainer', true);
        showEl('view-calc', false);
        showEl('view-calc-automatch', false);
        showEl('view-calc-ahalay', false);
        showEl('view-calc-winchester', false);
        showEl('view-calc-who', false);
        showEl('view-calc-mantis', false);
        showEl('view-calc-check', false);
        showEl('view-math', false);
        if (modeValue === 'hard') appGameMode = 'hard';
        else if (modeValue === 'nightmare') appGameMode = 'nightmare';
        else if (modeValue === 'impossible') appGameMode = 'impossible';
        else if (modeValue === 'newbie') appGameMode = 'newbie';
                else if (modeValue === 'easy') appGameMode = 'easy';
                else appGameMode = 'newbie'; // fallback
        
        updateStatsUI();
        generateRandomScenario();
    }
    
    // Сохраняем выбор в LocalStorage
    localStorage.setItem('last_game_mode', modeValue);
    localStorage.setItem('last_game_title', modeTitle);
}

// --- HELPER FUNCTIONS FOR DOM SAFETY ---
function getEl(id) { return document.getElementById(id); }
function setText(id, txt) { var e = getEl(id); if(e) e.innerText = txt; }
function setHtml(id, htm) { var e = getEl(id); if(e) e.innerHTML = htm; }
function showEl(id, show) { var e = getEl(id); if(e) e.style.display = show ? 'block' : 'none'; }
function addClass(id, cls) { var e = getEl(id); if(e) e.classList.add(cls); }
function removeClass(id, cls) { var e = getEl(id); if(e) e.classList.remove(cls); }

// --- ACHIEVEMENTS DATA ---
const SNIPER_ACHIEVEMENTS = {
    2: "Посмотрим, не случайность ли это? 😄",
    5: "Не зря открыл канал Манго 👐",
    10: "Уже начинаешь шарить 👉",
    20: "Это космос, детка 🚀",
    50: "Косматика 80-го уровня 🤓",
    100: "Косматический маньяк 👉",
    200: "Легенда Косматики 👉👉",
    500: "Звезда всех столов 🌩️",
    1000: "Бог Косматики 👐",
    2000: "Выйди потрогай траву 🌱",
    5000: "А теперь траву покоси 🌟",
    10000: "Походу, безработный 🗿"
};

const VETERAN_ACHIEVEMENTS = {
    10: "Первая кровь 🩸",
    50: "Ученик Дона 🎩",
    100: "Опытный стрелок 👉",
    500: "Гроза шерифов ⭐️",
    1000: "Косматический маньяк 🧮",
    2000: "Ночной кошмар города 🌃",
    5000: "Живу за столом 🪑",
    10000: "Владелец клуба 🏆",
    50000: "Гений от мира Мафии 🎬",
    100000: "Переиграл эту игру 👾"
};

// --- CORE FUNCTIONS ---

function openRules() {
    var container = getEl('rules-text-container');
    if (!container) return;

    // Очищаем контейнер
    container.innerHTML = "";

    // === ПРИОРИТЕТ 1: ДРИЛЛЫ ===
    // Для дриллов используем currentDrillSystem
    var isDrillActive = (typeof appDrillState !== 'undefined' && appDrillState.isActive) || 
                        (typeof appDrillFilter !== 'undefined' && appDrillFilter && appDrillFilter.active);
    
    if (isDrillActive && typeof currentDrillSystem !== 'undefined') {
        // Показываем правила в зависимости от выбранной системы дриллов
        if (currentDrillSystem === 'auto') {
            container.innerHTML = CONST_RULES_AUTOMATCH;
        } else if (currentDrillSystem === 'winchester') {
            container.innerHTML = CONST_RULES_WINCHESTER;
        } else {
            // 'kosmatika' или любой другой по умолчанию
            container.innerHTML = CONST_RULES_COSMATICS;
        }
    }
    // === ПРИОРИТЕТ 2: ОБЫЧНЫЕ РЕЖИМЫ ===
    else if (isWolverineMode()) {
        // Если выбран режим Росомахи
        container.innerHTML = CONST_RULES_WOLVERINE;
    } else if (isWhoMode()) {
        // Если выбран режим Кто
        container.innerHTML = CONST_RULES_WHO;
    } else if (isAutomatchMode()) {
        // Если выбран режим Автомата
        container.innerHTML = CONST_RULES_AUTOMATCH;
    } else if (isAhalayMode()) {
        // Если выбран режим Ахалай
        container.innerHTML = CONST_RULES_AHALAY;
    } else if (isWinchesterMode()) {
        // Если выбран режим Винчестер
        container.innerHTML = CONST_RULES_WINCHESTER;
    } else if (isMantisMode()) {
        container.innerHTML = CONST_RULES_MANTIS;
    } else if (isCheckMode()) {
        container.innerHTML = CONST_RULES_CHECK;
    } else if (isBazookaMode()) {
        container.innerHTML = CONST_RULES_BAZOOKA;
    } else {
        // По умолчанию (Косматика)
        container.innerHTML = CONST_RULES_COSMATICS;
    }
    
    addClass('rules-modal', 'open');
}

function openChangelog() {
    var container = getEl('rules-text-container');
    if(container) container.innerHTML = CHANGELOG_HTML;
    addClass('rules-modal', 'open');
}

function closeRules() {
    removeClass('rules-modal', 'open');
}

function loadStats() {
    var storedTotal = localStorage.getItem('kosmatika_total_correct');
    if (storedTotal) appTotalCorrect = parseInt(storedTotal);
}

function saveStats() {
    localStorage.setItem('kosmatika_total_correct', appTotalCorrect);
}

function showToast(title, message) {
    var container = getEl('toast-container');
    if(!container) return;
    var toast = document.createElement('div');
    toast.className = 'ach-toast';
    toast.innerHTML = '<div class="ach-icon">🏆</div><div class="ach-text"><div class="ach-title">' + title + '</div><div class="ach-desc">' + message + '</div></div>';
    container.appendChild(toast);
    setTimeout(function() {
        if(toast.parentNode) toast.parentNode.removeChild(toast);
    }, 10000);
}

function checkAchievements(isCorrect) {
    if (isCorrect) {
        if (SNIPER_ACHIEVEMENTS[appStreak]) showToast("Снайпер (Серия: " + appStreak + ")", SNIPER_ACHIEVEMENTS[appStreak]);
        if (VETERAN_ACHIEVEMENTS[appTotalCorrect]) showToast("Ветеран (Всего: " + appTotalCorrect + ")", VETERAN_ACHIEVEMENTS[appTotalCorrect]);
    }
}

function updateTableVisualEffects() {
    var table = getEl('trainer-table');
    if(!table) return;
    table.classList.remove('streak-fire-20', 'streak-fire-50', 'streak-fire-100');
    if (appStreak >= 100) table.classList.add('streak-fire-100');
    else if (appStreak >= 50) table.classList.add('streak-fire-50');
    else if (appStreak >= 20) table.classList.add('streak-fire-20');
}

function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Качественное перемешивание массива (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function parseSmartInput(input) {
    if (!input) return [];
    input = input.toString().trim();
    if (/[\s,.]/.test(input)) return input.split(/[\s,.]+/).map(function(n) { return parseInt(n); }).filter(function(n) { return !isNaN(n); });
    else {
        var res = [];
        for (var i = 0; i < input.length; i++) {
            var val = parseInt(input[i]);
            if (!isNaN(val)) res.push(val === 0 ? 10 : val);
        }
        return res;
    }
}

function normalizeSeatNumber(num) {
    var parsed = parseInt(num, 10);
    if (isNaN(parsed)) return null;
    while (parsed > 10) parsed -= 10;
    while (parsed < 1) parsed += 10;
    return parsed;
}

function getBazookaTarget(params) {
    if (!params || typeof params !== 'object') return null;

    var basePlayer = normalizeSeatNumber(params.basePlayer);
    var direction = params.direction;
    var targetCount = parseInt(params.targetCount, 10);
    var sheriff = normalizeSeatNumber(params.sheriff);
    var currentNight = parseInt(params.currentNight, 10);

    if (!basePlayer || !targetCount || targetCount < 1) return null;

    var mafiaSet = new Set((params.mafiaList || []).map(function(m) { return normalizeSeatNumber(m); }).filter(Boolean));
    var deadSet = new Set((params.deadList || []).map(function(d) { return normalizeSeatNumber(d); }).filter(Boolean));
    var checkedBlacksSet = new Set((params.checkedBlacks || []).map(function(c) { return normalizeSeatNumber(c); }).filter(Boolean));

    var step = (direction === 'counterclockwise') ? -1 : 1;
    var validReds = [];
    var candidate = basePlayer;

    for (var i = 0; i < 10; i++) {
        var isDead = deadSet.has(candidate);
        var isMafia = mafiaSet.has(candidate);
        var isCheckedBlack = checkedBlacksSet.has(candidate);
        var isSheriffExcluded = (!!sheriff && sheriff === candidate && currentNight >= 3);

        if (!isDead && !isMafia && !isCheckedBlack && !isSheriffExcluded) {
            validReds.push(candidate);
        }

        candidate += step;
        if (candidate > 10) candidate = 1;
        if (candidate < 1) candidate = 10;
    }

    if (validReds.length === 0) {
        if (params.returnMeta) {
            return {
                target: null,
                validReds: validReds,
                targetIndex: null
            };
        }
        return null;
    }

    var targetIndex = (targetCount - 1) % validReds.length;
    if (params.returnMeta) {
        return {
            target: validReds[targetIndex],
            validReds: validReds,
            targetIndex: targetIndex
        };
    }
    return validReds[targetIndex];
}

function calculateBazooka(don, mafia, base, state, isPro, fireSystem, bazookaContext) {
    var direction = isPro ? -1 : 1;
    var normalizedBase = normalizeSeatNumber(base);
    var normalizedDon = normalizeSeatNumber(don);
    var normalizedMafia = (mafia || []).map(function(m) { return normalizeSeatNumber(m); }).filter(Boolean);
    var logs = [];

    if (!normalizedBase) {
        return { target: null, method: 'Bazooka', fireSystem: fireSystem || 'instafire', logs: ['❌ Не указана базовая цифра.'] };
    }

    if (normalizedDon && normalizedMafia.indexOf(normalizedDon) === -1) {
        normalizedMafia.push(normalizedDon);
    }

    var selectedFireSystem = (fireSystem || 'instafire').toLowerCase();
    var fsLabelMap = {
        instafire: 'InstaFire (Базука)',
        addfire: 'AddFire (Косматика)',
        flashfire: 'FlashFire (Автомат)'
    };
    var fsLabel = fsLabelMap[selectedFireSystem] || 'InstaFire (Базука)';

    logs.push('🧭 База: <strong>' + normalizedBase + '</strong>. Направление: ' + (direction === 1 ? 'по часовой' : 'против часовой') + '.');
    logs.push('🔥 Система отстрела: <strong>' + fsLabel + '</strong>.');

    var isDirectOrder = false;
    var directTarget = null;

    if (typeof state === 'object' && state !== null && state.ahalay_target !== undefined) {
        isDirectOrder = true;
        directTarget = normalizeSeatNumber(state.ahalay_target);
    } else if (typeof state === 'string' && state.indexOf('ahalay_') === 0) {
        isDirectOrder = true;
        directTarget = normalizeSeatNumber(state.replace('ahalay_', ''));
    }

    if (isDirectOrder) {
        if (!directTarget) {
            return { target: null, method: 'Ахалай (Прямой заказ)', fireSystem: selectedFireSystem, logs: logs.concat(['❌ Для Ахалая не задана валидная цель.']) };
        }
        logs.push('👋 Ахалай (прямой заказ) имеет высший приоритет и перекрывает жесты.');
        logs.push('🎯 Цель: <strong>' + directTarget + '</strong>.');
        return { target: directTarget, method: 'Ахалай (Прямой заказ)', fireSystem: selectedFireSystem, logs: logs };
    }

    var offset = parseInt(state, 10);
    if (isNaN(offset) || offset < 1 || offset > 4) {
        return { target: null, method: 'Bazooka', fireSystem: selectedFireSystem, logs: logs.concat(['❌ Неверное состояние рук. Ожидается 1, 2, 3 или 4.']) };
    }

    var contextData = (bazookaContext && typeof bazookaContext === 'object') ? bazookaContext : {};

    var dominantHand = contextData.dominantHand || null; // 'right' | 'left' | null
    var nonMainHandLabel = dominantHand === 'right' ? 'Левая' : dominantHand === 'left' ? 'Правая' : 'Не главная';
    var mainHandLabel    = dominantHand === 'right' ? 'Правая' : dominantHand === 'left' ? 'Левая' : 'Главная';
    var stateLabels = {
        1: isPro ? 'Главная (' + mainHandLabel + ') рука у лица' : 'Главная рука у лица',
        2: 'Две руки у лица',
        3: nonMainHandLabel + ' (не главная) рука',
        4: 'Руки спрятаны / опущены'
    };
    logs.push('✋ Состояние: <strong>' + stateLabels[offset] + '</strong> (' + offset + '-й красный).');

    var bazookaTargetData = getBazookaTarget({
        basePlayer: normalizedBase,
        direction: direction === -1 ? 'counterclockwise' : 'clockwise',
        targetCount: offset,
        mafiaList: normalizedMafia,
        deadList: Array.isArray(contextData.deadList) ? contextData.deadList : [],
        checkedBlacks: Array.isArray(contextData.checkedBlacks) ? contextData.checkedBlacks : [],
        sheriff: contextData.sheriff,
        currentNight: contextData.currentNight,
        returnMeta: true
    });
    var target = bazookaTargetData ? bazookaTargetData.target : null;

    if (bazookaTargetData && bazookaTargetData.validReds) {
        logs.push('📋 validReds: <strong>' + (bazookaTargetData.validReds.length ? bazookaTargetData.validReds.join(', ') : 'пусто') + '</strong>.');
    }

    if (bazookaTargetData && bazookaTargetData.targetIndex !== null) {
        logs.push('🔁 Индекс цели: (' + offset + ' - 1) % ' + bazookaTargetData.validReds.length + ' = <strong>' + bazookaTargetData.targetIndex + '</strong>.');
    }

    if (!target) {
        return { target: null, method: fsLabel, fireSystem: selectedFireSystem, logs: logs.concat(['❌ Не удалось найти валидную красную цель.']) };
    }

    if (selectedFireSystem === 'addfire') {
        logs.push('➕ AddFire: База + смещение по жесту с фильтром по красным.');
    } else if (selectedFireSystem === 'flashfire') {
        logs.push('⚡ FlashFire: крайняя минута, берём последний валидный жест.');
    } else {
        logs.push('🚀 InstaFire: крайние секунды до ночи (маска/руки).');
    }

    logs.push('🎯 Цель: <strong>' + target + '</strong>.');
    return { target: target, method: fsLabel, fireSystem: selectedFireSystem, logs: logs };
}

function getDynamicTarget(baseTarget, modifier, deadPlayers, checkedBlacks, sheriffSeat, donSeat, nightNum, logs, direction, blackTeam, badgeSafety, votedOutPlayers) {
    // direction: +1 для по часовой стрелке (по умолчанию), -1 для против часовой стрелки
    if (direction === undefined) direction = 1;
    if (!blackTeam) blackTeam = [];
    if (badgeSafety === undefined) badgeSafety = false;
    if (!votedOutPlayers) votedOutPlayers = [];
    
    // 1. Считаем математику
    var sum = baseTarget + modifier;
    
    // Нормализация круга (1-10)
    while (sum > 10) sum -= 10;
    while (sum < 1) sum += 10;
    
    var rawTarget = sum;
    logs.push("🧮 Математика: " + baseTarget + " + " + modifier + " = <strong>" + rawTarget + "</strong>");

    // 2. Проверка на труп/своих (для жетона в не-Ахалае)
    var isBadgeProtected = false;
    if (badgeSafety) {
        isBadgeProtected = blackTeam.includes(rawTarget) ||
            checkedBlacks.includes(rawTarget) ||
            (nightNum >= 3 && sheriffSeat === rawTarget);
    }

    // Проверяем, мертва ли цель (ночью или днём)
    var targetDeadAtNight = deadPlayers.includes(rawTarget);
    var targetVotedOutDay = votedOutPlayers.includes(rawTarget);
    var targetIsDead = targetDeadAtNight || targetVotedOutDay;
    
    if (targetIsDead || isBadgeProtected) {
        var directionText = direction < 0 ? "против часовой стрелки" : "по часовой стрелке";
        if (targetIsDead) {
            logs.push('<span style="color:#e67e22">⚠️ Попадание в пустой стул (' + rawTarget + ')! Смещаемся (' + directionText + ').</span>');
        } else {
            logs.push('<span style="color:#e67e22">🛡️ Предохранитель: цель ' + rawTarget + ' защищена для Жетона. Смещаемся (' + directionText + ').</span>');
        }
        
        var candidate = rawTarget;
        for(var i=0; i<15; i++) {
            candidate += direction;
            if (direction > 0) {
                if (candidate > 10) candidate = 1;
            } else {
                if (candidate < 1) candidate = 10;
            }
            
            // Проверяем, мертв ли кандидат (ночью или днём)
            var candidateDeadAtNight = deadPlayers.includes(candidate);
            var candidateVotedOutDay = votedOutPlayers.includes(candidate);
            if (candidateDeadAtNight || candidateVotedOutDay) continue;
            
            // Защита от своих при смещении
            if (badgeSafety && blackTeam.includes(candidate)) {
                logs.push("❌ Игрок " + candidate + " жив, но Черный -> пропускаем.");
                continue;
            }
            if (checkedBlacks.includes(candidate)) { 
                logs.push("❌ Игрок " + candidate + " жив, но Проверенный Черный -> пропускаем."); 
                continue; 
            }
            if (nightNum >= 3) {
                if (sheriffSeat === candidate) { logs.push("❌ Игрок " + candidate + " (Шериф 3+ ночь) -> пропускаем."); continue; }
                if (donSeat === candidate) { logs.push("❌ Игрок " + candidate + " (Дон 3+ ночь) -> пропускаем."); continue; }
            }
            
            // Нашли живого и валидного
            return { target: candidate, tag: "DYNAMIC_SHIFT" };
        }
    } else {
        // Прямое попадание в живого. В динамике мы стреляем в своих (если не труп).
        logs.push("🎯 Цель " + rawTarget + " жива. Прямой выстрел.");
        return { target: rawTarget, tag: "DYNAMIC_DIRECT" };
    }
    return { target: rawTarget, tag: "DYNAMIC_FAIL" };
}

function getStaticTarget(baseTarget, blackTeam, checkedBlacks, deadPlayers, sheriffSeat, nightNum, logs, kIndex, votedOutPlayers) {
    var candidate = baseTarget;
    if (logs) logs.push("🔍 <strong>Статика:</strong> Базовая цифра — " + baseTarget);
    var tag = "STATIC_SIMPLE";
    for(var i=0; i<15; i++) {
        var reason = null;
        var skipTag = null;
        // Проверяем, мертв ли игрок (ночью или днём)
        var isDeadAtNight = deadPlayers && deadPlayers.includes(candidate);
        var isVotedOutDay = votedOutPlayers && votedOutPlayers.includes(candidate);
        if (isDeadAtNight || isVotedOutDay) { reason = "Мертв/Удален"; skipTag = "STATIC_SKIP_DEAD"; }
        else if (blackTeam.includes(candidate)) { reason = "Черный игрок"; skipTag = "STATIC_SKIP_BLACK"; }
        else if (checkedBlacks.includes(candidate)) { reason = "Проверенный Черный"; skipTag = "STATIC_SKIP_CHECKED"; }
        else if (sheriffSeat === candidate && (nightNum >= 3 || kIndex === 2)) { 
            if (kIndex === 2) { reason = "Шериф (3-я цифра косматики)"; }
            else { reason = "Шериф (3+ ночь)"; }
            skipTag = "STATIC_SKIP_SHERIFF"; 
        }

        if (!reason) {
            if (logs) logs.push("✅ Игрок " + candidate + " подходит.");
            return { target: candidate, tag: tag };
        }
        if (tag === "STATIC_SIMPLE") tag = skipTag;
        else if (skipTag === "STATIC_SKIP_SHERIFF") tag = skipTag;
        else if (skipTag === "STATIC_SKIP_CHECKED" && tag !== "STATIC_SKIP_SHERIFF") tag = skipTag;
        else if (skipTag === "STATIC_SKIP_BLACK" && tag === "STATIC_SKIP_DEAD") tag = skipTag;

        if (logs) logs.push("❌ Игрок " + candidate + " пропускается (" + reason + "). Смотрим следующего...");
        candidate++;
        if (candidate > 10) candidate = 1;
    }
    return { target: candidate, tag: tag }; 
}

function parseKosmatikaInput(input) {
    if (!input) return [];
    input = input.toString().trim();
    
    // Если есть разделители (запятые, пробелы), используем стандартный сплит
    if (/[\s,]/.test(input)) {
        return input.split(/[\s,]+/).map(function(s) { 
            return parseInt(s); 
        }).filter(function(n) { return !isNaN(n); });
    }
    
    // Компактный режим (например "-258" или "-2-5-8")
    var res = [];
    var isNextNegative = false;
    
    for (var i = 0; i < input.length; i++) {
        var char = input[i];
        
        if (char === '-') {
            isNextNegative = true;
            continue;
        }
        
        if (/\d/.test(char)) {
            var val = parseInt(char);
            if (val === 0) val = 10; // 0 это 10
            
            if (isNextNegative) {
                res.push(-val);
                isNextNegative = false;
            } else {
                res.push(val);
            }
        }
    }
    return res;
}

function getAhalayRawTarget(kosmatikaNum, donSeat, gestureType, gestureValue, logs) {
    var modifier = 0;
    var desc = "";
    
    if (gestureType === 'digit') { 
        modifier = gestureValue; 
        desc = "Показана цифра " + gestureValue; 
    } else if (gestureType === 'badge') { 
        modifier = donSeat; 
        desc = "Показан жетон (номер Дона: " + donSeat + ")"; 
    }
    
    // Сложение с учетом знака (kosmatikaNum может быть отрицательным)
    var sum = modifier + kosmatikaNum;
    
    // Форматируем отображение модификатора для логов
    var kosmatikaDisplay = kosmatikaNum >= 0 ? "+" + kosmatikaNum : kosmatikaNum.toString();
    if (logs) logs.push("⚡ <strong>Ахалай:</strong> " + desc + " + Модификатор (" + kosmatikaDisplay + ") = <strong>" + sum + "</strong>");
    
    // Нормализация круга (если > 10 или < 1)
    while (sum > 10) { 
        sum -= 10; 
        if (logs) logs.push("🔄 Больше 10, вычитаем 10 -> <strong>" + sum + "</strong>"); 
    }
    while (sum < 1) { 
        sum += 10; 
        if (logs) logs.push("🔄 Меньше 1, прибавляем 10 -> <strong>" + sum + "</strong>"); 
    }
    
    return sum;
}

function isAhalayMode() {
    return (appGameMode && appGameMode.indexOf('ahalay_') !== -1);
}

function isWinchesterMode() {
    return (appGameMode && appGameMode.indexOf('winchester_') !== -1);
}

function isBazookaMode() {
    return (appGameMode && appGameMode.indexOf('bazooka') !== -1);
}

function isWolverineMode() {
    return (appGameMode && appGameMode.indexOf('wolverine_') !== -1);
}

function isWhoMode() {
    return (appGameMode && appGameMode.indexOf('who_') !== -1);
}

function isMantisMode() {
    return (appGameMode && appGameMode.indexOf('mantis_') !== -1);
}

function isCheckMode() {
    return (appGameMode && appGameMode.indexOf('check_') !== -1);
}

function isRedMode() {
    return (appGameMode && appGameMode.indexOf('red_') !== -1);
}

function isBlackMode() {
    return (appGameMode && appGameMode.indexOf('black_') !== -1 && appGameMode.indexOf('redblack_') === -1);
}

function isRedBlackMode() {
    return (appGameMode && appGameMode.indexOf('redblack_') !== -1);
}

function isAutomatchMode() {
    return (appGameMode && appGameMode.indexOf('automatch_') !== -1);
}

// ═══════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: РАСЧЕТ РАССТОЯНИЯ ПО ЧАСОВОЙ СТРЕЛКЕ
// ═══════════════════════════════════════════════════════════════
function getDistanceClockwise(from, to) {
    // Расстояние от 'from' до 'to' по часовой стрелке (1 -> 2 -> ... -> 10 -> 1)
    // Формула: (to - from + 10) % 10
    // Если результат 0 и from !== to, значит это 10 шагов (полный круг)
    var distance = (to - from + 10) % 10;
    if (distance === 0 && from !== to) {
        distance = 10;
    }
    return distance;
}

// ═══════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: ОХОТА НА КРАСНУЮ ПРОВЕРКУ
// С ПРИОРИТЕТОМ "ДВОЙНОЙ КРАСНОЙ"
// ═══════════════════════════════════════════════════════════════
function findNearestRedCheck(anchorValue, state, logs) {
    if (!state.checkedReds || state.checkedReds.length === 0) {
        if (logs) {
            logs.push("<div style='background:rgba(244, 67, 54, 0.1); padding:8px; margin:5px 0; border-left:3px solid #f44336;'>⚠️ <strong style='color:#ff9800;'>ОШИБКА ОХОТЫ:</strong> Нет проверенных красных игроков!</div>");
            logs.push("<div style='color:#999; font-size:0.9em; font-style:italic;'>→ Режим \"Охота на Красную Проверку\" невозможен. Возврат к стандартной логике (статика или математика).</div>");
        }
        return null;
    }
    
    if (logs) logs.push("🎯 <strong style='color:#4caf50;'>Режим охоты активирован:</strong> поиск оптимальной Красной Проверки.");
    
    // ═══════════════════════════════════════════════════════════════
    // ПРАВИЛО "ЕДИНСТВЕННОГО ШЕРИФА" (Solo Sheriff Rule)
    // Если у Дона нет НИКАКОЙ информации (ни красных, ни черных проверок),
    // пропускаем поиск Двойной Красной и сразу идем к геометрии
    // ═══════════════════════════════════════════════════════════════
    var donHasNoInfo = (!state.donCheckedReds || state.donCheckedReds.length === 0) && 
                       (!state.donCheckedBlacks || state.donCheckedBlacks.length === 0);
    
    if (donHasNoInfo && logs) {
        logs.push("ℹ️ <strong style='color:#4caf50;'>Правило \"Единственного Шерифа\":</strong> У Дона нет проверок. Используем только проверки Шерифа.");
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ШАГ 1: ПОИСК "ДВОЙНОЙ КРАСНОЙ" (приоритет!)
    // ИСКЛЮЧЕНИЕ: В режиме Ахалай стрельба строго математическая/геометрическая
    // ИСКЛЮЧЕНИЕ 2: Если Дон не дал информации (Правило Единственного Шерифа)
    // ═══════════════════════════════════════════════════════════════
    var doubleRedCandidates = [];
    
    // ПРОВЕРКА РЕЖИМА: Двойная Красная НЕ работает в Ахалае и при отсутствии информации от Дона
    if (!isAhalayMode() && !donHasNoInfo && state.sheriffCheckedReds && state.donCheckedReds && 
        state.sheriffCheckedReds.length > 0 && state.donCheckedReds.length > 0) {
        
        if (logs) logs.push("🔍 <strong>Шаг 1:</strong> Проверка на <strong style='color:var(--winchester-color);'>Двойную Красную</strong> (проверен И Шерифом, И Доном)...");
        
        // Ищем пересечение: игроки проверенные И Шерифом, И Доном
        for (var i = 0; i < state.sheriffCheckedReds.length; i++) {
            var player = state.sheriffCheckedReds[i];
            
            // Проверяем: жив ли игрок
            if (state.deadPlayers && state.deadPlayers.includes(player)) {
                continue;
            }
            
            // Проверяем: есть ли в проверках Дона
            if (state.donCheckedReds.includes(player)) {
                doubleRedCandidates.push(player);
                if (logs) logs.push("✨ Игрок <strong>" + player + "</strong> - <strong style='color:var(--winchester-color);'>ДВОЙНАЯ КРАСНАЯ</strong>! (Шериф + Дон)");
            }
        }
        
        // Если нашли хотя бы одну двойную красную - возвращаем первую
        if (doubleRedCandidates.length > 0) {
            var target = doubleRedCandidates[0];
            if (logs) logs.push("🎯 <strong style='color:var(--winchester-color);'>ПРИОРИТЕТНАЯ ЦЕЛЬ:</strong> Двойная Красная - игрок <strong>" + target + "</strong>! (Игнорируем геометрию)");
            return target;
        } else {
            if (logs) logs.push("⚠️ Двойных Красных не найдено.");
        }
    } else if (isAhalayMode()) {
        // Для Ахалая пропускаем Шаг 1 (приоритет Двойной Красной не применяется)
        if (logs) logs.push("ℹ️ Режим Ахалай: приоритет Двойной Красной <strong>не применяется</strong>. Переход к геометрическому поиску.");
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ШАГ 2: ПОИСК БЛИЖАЙШЕЙ КРАСНОЙ ПО ЧАСОВОЙ СТРЕЛКЕ (геометрия)
    // ═══════════════════════════════════════════════════════════════
    if (logs) logs.push("🔍 <strong>Шаг 2:</strong> Поиск ближайшей Красной Проверки от якоря <strong>" + anchorValue + "</strong> по часовой стрелке...");
    
    // Фильтруем только живых игроков из красных проверок (проверяем и ночные убийства, и дневные голосования)
    var aliveCandidates = [];
    for (var i = 0; i < state.checkedReds.length; i++) {
        var player = state.checkedReds[i];
        
        // Проверяем: жив ли игрок (проверяем оба массива: мертвые ночью и убитые днём)
        var deadAtNight = state.deadPlayers && state.deadPlayers.includes(player);
        var votedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(player);
        
        if (deadAtNight || votedOutDay) {
            if (logs) logs.push("❌ Игрок " + player + " (Красная проверка) мертв -> пропускаем.");
            continue;
        }
        
        aliveCandidates.push(player);
    }
    
    // Если нет живых красных проверок
    if (aliveCandidates.length === 0) {
        if (logs) logs.push("⚠️ <span style='color:#ff9800;'>Охота:</span> не найдено живых проверенных красных. Возврат к стандартной статике.");
        return null;
    }
    
    // Сортируем кандидатов по расстоянию от якоря (по часовой стрелке)
    aliveCandidates.sort(function(a, b) {
        var distA = getDistanceClockwise(anchorValue, a);
        var distB = getDistanceClockwise(anchorValue, b);
        return distA - distB;
    });
    
    // Возвращаем ближайшего (первого в отсортированном списке)
    var nearestTarget = aliveCandidates[0];
    var distance = getDistanceClockwise(anchorValue, nearestTarget);
    
    if (logs) {
        logs.push("✅ <strong style='color:#4caf50;'>Найдена ближайшая Красная Проверка:</strong> игрок <strong>" + nearestTarget + "</strong>");
        logs.push("📐 <em>Расстояние по часовой стрелке:</em> " + distance + " шаг" + (distance === 1 ? "" : distance < 5 ? "а" : "ов") + " (" + anchorValue + " → " + nearestTarget + ")");
    }
    
    return nearestTarget;
}

function solveKosmatika(state) {
    var logs = [];
    if (!state.kosmatikaList || state.kosmatikaList.length === 0) return { target: 0, logs: ["Error: No kosmatika"] };
    
    var currentBase;
    var activeIndex;

    // FIX: Only Ahalay (OldFire) uses strict cyclic rotation based on night number.
    // Red, Black, RedBlack, Who, Mantis (ClassicFire) use the simulated kIndex passed in 'state'.
    if (isAhalayMode()) {
        // Night 1 -> Index 0, Night 2 -> Index 1, Night 3 -> Index 2...
        activeIndex = (state.nightNum - 1) % 3;
        currentBase = state.kosmatikaList[activeIndex];
    } else {
        // For Standard, Automatch, Winchester, and ClassicFire modes (Red/Black/Who/Mantis)
        currentBase = state.kosmatikaList[state.kIndex];
        activeIndex = state.kIndex;
    }
    
    var finalTarget = -1; 
    var method = ""; 
    var gestureVal = 0; 
    var logicTag = "";

    // Определяем значение жеста
    if (state.donAction === 'digit') gestureVal = state.donDigitVal; 
    else if (state.donAction === 'badge') gestureVal = state.donSeat; 
    else gestureVal = 0;
    
    var labelBase = (isAutomatchMode()) ? "Активная цифра автомата"
        : (isAhalayMode()) ? "Активная цифра ахалая"
        : (isWinchesterMode()) ? "Активная цифра винчестера"
        : (isWhoMode()) ? "Активная цифра Кто"
        : (isMantisMode()) ? "Активная цифра Богомола"
        : (isCheckMode()) ? "Активная цифра Проверки"
        : "Активная цифра косматики";
    
    // Для Ахалая, Кто и Богомола форматируем отображение с учетом знака
    var currentBaseDisplay = currentBase;
    if ((isAhalayMode() || isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) && currentBase >= 0) {
        currentBaseDisplay = "+" + currentBase;
    } else if (isAhalayMode() || isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
        currentBaseDisplay = currentBase.toString();
    }
    
    logs.push("ℹ️ " + labelBase + ": <strong>" + currentBaseDisplay + "</strong> (индекс " + (activeIndex + 1) + ")");

    // ═══════════════════════════════════════════════════════════════
    // ОПРЕДЕЛЕНИЕ РЕЖИМА "ОХОТА НА КРАСНУЮ ПРОВЕРКУ"
    // ═══════════════════════════════════════════════════════════════
    var isRedHuntingMode = false;
    var huntingAnchor = null;
    
    // Условие 1: Шериф Мертв (проверяем и ночные убийства, и дневные голосования)
    var sheriffDead = false;
    if (state.sheriffSeat) {
        sheriffDead = (state.deadPlayers && state.deadPlayers.includes(state.sheriffSeat)) ||
                      (state.votedOutPlayers && state.votedOutPlayers.includes(state.sheriffSeat));
    }
    
    // Условие 2: Двойная Красная Проверка (Шериф жив, Дон вскрыт, есть общая красная проверка)
    var doubleRedCheck = false;
    var doubleRedPlayers = [];
    if (!sheriffDead && state.sheriffCheckedReds && state.donCheckedReds) {
        // Ищем пересечение: есть ли игрок, проверенный красным И Шерифом, И Доном
        for (var i = 0; i < state.sheriffCheckedReds.length; i++) {
            var player = state.sheriffCheckedReds[i];
            if (state.donCheckedReds.includes(player)) {
                // Проверяем что игрок жив
                if (!state.deadPlayers || !state.deadPlayers.includes(player)) {
                    doubleRedCheck = true;
                    doubleRedPlayers.push(player);
                }
            }
        }
    }
    
    isRedHuntingMode = sheriffDead || doubleRedCheck;
    
    // ═══════════════════════════════════════════════════════════════
    // ОПРЕДЕЛЕНИЕ "SOLO SHERIFF MODE" (Строгое правило)
    // ═══════════════════════════════════════════════════════════════
    var isSoloSheriff = false;
    if (sheriffDead) {
        var donHasInfo = (state.donCheckedReds && state.donCheckedReds.length > 0) || 
                        (state.donCheckedBlacks && state.donCheckedBlacks.length > 0);
        isSoloSheriff = !donHasInfo; // Solo = Шериф мертв И у Дона нет проверок
    }
    // ═══════════════════════════════════════════════════════════════
    
    // Определяем Якорь для охоты
    if (isRedHuntingMode) {
        if (isAhalayMode()) {
            // Для Ахалая: якорь = номер ночи
            huntingAnchor = state.nightNum;
        } else {
            // Для Косматики/Автомата/Винчестера: якорь = текущая активная цифра заказа
            huntingAnchor = currentBase;
        }
        
        if (sheriffDead) {
            // Определяем контекст: Единственный Шериф или 2 Версии
            var donHasInfo = (state.donCheckedReds && state.donCheckedReds.length > 0) || 
                            (state.donCheckedBlacks && state.donCheckedBlacks.length > 0);
            var contextNote = "";
            
            // МОДУЛЬНОЕ формирование текста стратегии
            // ВАЖНО: При статике (Дон пасует) математика режимов НЕ ПРИМЕНЯЕТСЯ!
            var strategyText = "При статике (Дон пасует) стреляем ТОЛЬКО в ближайшую Красную проверку по часовой, без модификаторов режима.";
            
            if (!donHasInfo) {
                contextNote = "<div style='color:#90caf9; font-size:0.9em; margin-top:5px;'>📘 <strong>Контекст:</strong> ЕДИНСТВЕННЫЙ ШЕРИФ. Дон не вскрывался, у него нет проверок. " + strategyText + "</div>";
            } else {
                contextNote = "<div style='color:#ffb74d; font-size:0.9em; margin-top:5px;'>⚠️ <strong>Контекст:</strong> ИГРА В 2 ВЕРСИИ (Лже-шериф). У Дона есть проверки, но правило \"Двойной Красной\" не сработало.</div>";
            }
            
            logs.push("<div style='background:rgba(255,152,0,0.1); padding:8px; margin:5px 0; border-left:3px solid #ff9800;'>🔫 <strong>Шериф мертв.</strong> Активирован режим <strong style='color:#4caf50;'>ОХОТА НА КРАСНУЮ ПРОВЕРКУ</strong>. Якорь: <strong>" + huntingAnchor + "</strong>" + contextNote + "</div>");
        } else if (doubleRedCheck) {
            var doubleRedList = doubleRedPlayers.join(", ");
            logs.push("<div style='background:rgba(76,175,80,0.1); padding:8px; margin:5px 0; border-left:3px solid #4caf50;'>🎯 <strong>Обнаружена Двойная Красная!</strong> Игроки: <strong style='color:var(--winchester-color);'>" + doubleRedList + "</strong> (проверены И Шерифом, И Доном). Активирован режим <strong style='color:#4caf50;'>ОХОТА НА КРАСНУЮ ПРОВЕРКУ</strong>. Якорь: <strong>" + huntingAnchor + "</strong></div>");
        }
    }
    // ═══════════════════════════════════════════════════════════════
    
    // ═══════════════════════════════════════════════════════════════
    // ГЛОБАЛЬНАЯ ПРОВЕРКА: SOLO SHERIFF (ПРИОРИТЕТ КРАСНЫХ ПРОВЕРОК)
    // ═══════════════════════════════════════════════════════════════
    /**
     * КРИТИЧЕСКОЕ ПРАВИЛО:
     * Если Шериф мертв (Solo Sheriff) и есть Красные проверки,
     * мы ОБЯЗАНЫ стрелять ТОЛЬКО в них, игнорируя ВСЮ математику режимов.
     * Никаких +1 (Автомат), +3/+6 (Винчестер) или других модификаторов!
     * ЭТО ПРАВИЛО РАБОТАЕТ ДЛЯ ЛЮБОГО ЖЕСТА ДОНА (статика, динамика, флешфайр)!
     */
    // ИСПРАВЛЕНО: Ранняя проверка Solo Sheriff удалена!
    // Теперь проверка происходит ПОСЛЕ расчета динамики.
    var forceSoloSheriffKill = false;
    
    if (false) { // DISABLED: старая логика раннего выхода
        forceSoloSheriffKill = true;
        
        var actionText = state.donAction === 'none' ? 'Дон пасует' : 
                        state.donAction === 'digit' ? 'Дон показал цифру' : 
                        state.donAction === 'badge' ? 'Дон показал жетон' : 'Неизвестное действие';
        
        logs.push("<div style='background:rgba(255,87,34,0.15); padding:10px; margin:10px 0; border-left:4px solid #ff5722; border-radius:4px;'>⛔ <strong style='color:#ff5722; text-transform:uppercase;'>SOLO SHERIFF MODE:</strong> Единственный Шериф мертв. " + actionText + ". Математика режимов <strong>ПОЛНОСТЬЮ ОТКЛЮЧЕНА</strong>. Стреляем ТОЛЬКО в Красную проверку!</div>");
        
        method = "Охота (Solo Sheriff - Красная Проверка)";
        logicTag = "SOLO_SHERIFF_RED_HUNTING";
        
        // Фильтруем живых красных (проверяем и ночные убийства, и дневные голосования)
        var liveRedChecks = state.sheriffCheckedReds.filter(function(player) {
            var deadAtNight = state.deadPlayers && state.deadPlayers.includes(player);
            var votedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(player);
            return !deadAtNight && !votedOutDay;
        });
        
        if (liveRedChecks.length === 0) {
            logs.push("⚠️ <strong>ОШИБКА:</strong> Все Красные проверки мертвы! Fallback к стандартной логике.");
            forceSoloSheriffKill = false; // Отменяем принудительную охоту
        } else if (liveRedChecks.length === 1) {
            // Если проверка одна - стреляем в неё
            finalTarget = liveRedChecks[0];
            logs.push("🎯 Единственная живая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
            
            // ВАЖНО: Возвращаем результат СРАЗУ, не продолжая выполнение!
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: gestureVal,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        } else {
            // Если проверок 2 и более - берем ближайшую по часовой от якоря
            logs.push("🔍 Несколько живых Красных проверок: <strong>" + liveRedChecks.join(", ") + "</strong>. Ищем ближайшую от якоря <strong>" + huntingAnchor + "</strong>...");
            
            var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
            
            if (huntResult !== null) {
                finalTarget = huntResult;
                logs.push("✅ Ближайшая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
            } else {
                logs.push("⚠️ <strong>ОШИБКА:</strong> Алгоритм поиска не вернул цель. Выбираем первую из списка.");
                finalTarget = liveRedChecks[0];
            }
            
            // ВАЖНО: Возвращаем результат СРАЗУ, не продолжая выполнение!
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: gestureVal,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        }
    }
    // ═══════════════════════════════════════════════════════════════
    
    // Если сработал Solo Sheriff режим, пропускаем ВСЮ математику режимов
    if (!forceSoloSheriffKill) {

    // --- WOLVERINE LOGIC START ---
    var isWolverineTriggered = false;
    
    // Проверяем: Режим Росомахи ВКЛ + Дон МЕРТВ
    if (isWolverineMode() && state.deadPlayers && state.deadPlayers.includes(state.donSeat)) {
        isWolverineTriggered = true;
        
        // ВАЖНО: Берем цифры Росомахи, а не Дона
        var wolverineBase = 0;
        if (state.wolverineKosmatika && state.wolverineKosmatika.length > 0) {
            wolverineBase = state.wolverineKosmatika[state.kIndex];
            
            // Визуальные логи
            logs.push('<div class="wolverine-gesture" style="transform:scale(0.5); margin-bottom:-10px;"></div>');
            logs.push('<strong style="color:#ffb300; text-transform:uppercase;">⚠️ ДОН ПОКИНУЛ ИГРУ!</strong>');
            logs.push('Включается протокол <strong>РОСОМАХА</strong> (Игрок ' + state.wolverineSeat + ').');
            logs.push('Активная цифра Росомахи: <strong>' + wolverineBase + '</strong>');
        } else {
            logs.push('Ошибка: Нет данных о заказе Росомахи.');
        }

        // РАСЧЕТ ВЫСТРЕЛА ДЛЯ РОСОМАХИ (Теперь может быть Динамика!)
        var wolverineMethod = "";
        var wolverineResult;

        if (state.wolverineAction === 'digit') {
            wolverineMethod = "Росомаха (Ахалай/Цифра)";
            logs.push("🖐 Росомаха показал цифру <strong>" + state.wolverineDigit + "</strong>. Работает динамика.");
            var wolverineDirection = (wolverineBase < 0) ? -1 : 1;
            wolverineResult = getDynamicTarget(wolverineBase, state.wolverineDigit, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, wolverineDirection, null, false, state.votedOutPlayers);
        
        } else if (state.wolverineAction === 'badge') {
            wolverineMethod = "Росомаха (Ахалай/Жетон)";
            logs.push("🖐 Росомаха показал <strong>Жетон</strong> (свой номер: " + state.wolverineSeat + "). Работает динамика.");
            var wolverineDirection = (wolverineBase < 0) ? -1 : 1;
            wolverineResult = getDynamicTarget(wolverineBase, state.wolverineSeat, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, wolverineDirection, null, false, state.votedOutPlayers);
        
        } else {
            // Тишина -> Статика
            wolverineMethod = "Росомаха (Статика)";
            logs.push("🤫 Росомаха молчит. Работает статика.");
            wolverineResult = getStaticTarget(
                wolverineBase, 
                state.blackTeam, 
                state.checkedBlacks, 
                state.deadPlayers, 
                state.sheriffSeat, 
                state.nightNum, 
                logs, 
                state.kIndex,
                state.votedOutPlayers
            );
        }
        
        return { 
            target: wolverineResult.target, 
            method: wolverineMethod, 
            base: wolverineBase, 
            logs: logs 
        };
    }
    // --- END WOLVERINE LOGIC ---

    // --- AUTOMATCH MODE LOGIC ---
    if (isAutomatchMode()) {
        // 1. FLASHFIRE (Ahalay) - High Priority
        if (state.donAction === 'digit' || state.donAction === 'badge') {
            // ═══════════════════════════════════════════════════════════════
            // УСЛОВИЕ 1: ШЕРИФ МЕРТВ + КРАСНЫЕ ПРОВЕРКИ + FLASHFIRE
            // Ахалай может ПЕРЕНАПРАВИТЬ стрельбу на ДРУГУЮ красную проверку.
            // Если ахалай НЕ попал в красную проверку → стреляем ближайшую.
            // ═══════════════════════════════════════════════════════════════
            if (sheriffDead && state.sheriffCheckedReds && state.sheriffCheckedReds.length > 0) {
                var liveRedChecks = state.sheriffCheckedReds.filter(function(player) {
                    var deadAtNight = state.deadPlayers && state.deadPlayers.includes(player);
                    var votedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(player);
                    return !deadAtNight && !votedOutDay;
                });
                
                if (liveRedChecks.length === 0) {
                    logs.push("⚠️ <strong>ОШИБКА:</strong> Все Красные проверки мертвы! Fallback к FlashFire.");
                } else {
                    var rawTarget = getAhalayRawTarget(currentBase, state.donSeat, state.donAction, state.donDigitVal, logs);
                    
                    if (liveRedChecks.includes(rawTarget)) {
                        finalTarget = rawTarget;
                        method = "FlashFire → Смена Красной Проверки";
                        logicTag = "SHERIFF_DEAD_AHALAY_RED_REDIRECT";
                        logs.push("<div style='background:rgba(76,175,80,0.1); padding:8px; margin:5px 0; border-left:3px solid #4caf50;'>🎯 <strong style='color:#4caf50;'>СМЕНА ПРОВЕРКИ:</strong> FlashFire перенаправил стрельбу на Красную проверку <strong>" + rawTarget + "</strong>!</div>");
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: rawTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    } else {
                        method = "Охота (Шериф мертв - Красная Проверка)";
                        logicTag = "SHERIFF_DEAD_RED_HUNTING";
                        logs.push("<div style='background:rgba(255,152,0,0.1); padding:8px; margin:5px 0; border-left:3px solid #ff9800;'>⚠️ <strong>Шериф мертв.</strong> FlashFire показал <strong>" + rawTarget + "</strong>, но это НЕ Красная проверка. Стреляем в ближайшую Красную проверку!</div>");
                        
                        var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                        
                        if (huntResult !== null) {
                            finalTarget = huntResult;
                        } else {
                            finalTarget = liveRedChecks[0];
                        }
                        logs.push("✅ Стреляем в Красную проверку: <strong style='color:#4caf50;'>" + finalTarget + "</strong>.");
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: rawTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    }
                }
            }
            // ═══════════════════════════════════════════════════════════════
            
            method = "FlashFire (Ахалай)"; 
            logicTag = "AUTOMATCH_AHALAY";
            var rawTarget = getAhalayRawTarget(currentBase, state.donSeat, state.donAction, state.donDigitVal, logs);
            
            // FlashFire автомата: при попадании на пустой стул или защищенную цель смещаемся
            var badgeSafety = (state.donAction === 'badge' && !isAhalayMode());
            var isBadgeProtected = badgeSafety && (
                state.blackTeam.includes(rawTarget) ||
                state.checkedBlacks.includes(rawTarget) ||
                (state.nightNum >= 3 && state.sheriffSeat === rawTarget)
            );
            if (state.deadPlayers.includes(rawTarget) || isBadgeProtected) {
                if (state.deadPlayers.includes(rawTarget)) {
                    logs.push('<span class="warning-text">⚠️ Попадание в пустой стул (' + rawTarget + ')! Смещаемся.</span>');
                } else {
                    logs.push('<span class="warning-text">🛡️ Предохранитель: цель ' + rawTarget + ' защищена для Жетона. Смещаемся.</span>');
                }
                var candidate = rawTarget;
                for(var i=0; i<15; i++) {
                    candidate++; if (candidate > 10) candidate = 1;
                    if (state.deadPlayers.includes(candidate)) continue;
                    
                    if (badgeSafety && state.blackTeam.includes(candidate)) {
                        logs.push("❌ Игрок " + candidate + " жив, но Черный -> пропускаем.");
                        continue;
                    }
                    // При смещении пропускаем проверенных черных
                    if (state.checkedBlacks.includes(candidate)) {
                        logs.push("❌ Игрок " + candidate + " жив, но Проверенный Черный -> пропускаем.");
                        continue;
                    }
                    
                    // При смещении на 3+ ночи пропускаем шерифа и дона
                    if (state.nightNum >= 3) {
                        if (state.sheriffSeat === candidate) {
                            logs.push("❌ Игрок " + candidate + " жив, но Шериф (3+ ночь, смещение) -> пропускаем.");
                            continue;
                        }
                        if (state.donSeat === candidate) {
                            logs.push("❌ Игрок " + candidate + " жив, но Дон (3+ ночь, смещение) -> пропускаем.");
                            continue;
                        }
                    }
                    
                    break;
                }
                finalTarget = candidate;
                logs.push("➡️ Смещаемся на игрока: <strong>" + finalTarget + "</strong>.");
            } else {
                // ПРОВЕРКА: Активен ли режим охоты + Неудачная динамика? (Автомат FlashFire)
                var isBadTarget = false;
                
                var isBlackTeam = state.blackTeam && state.blackTeam.includes(rawTarget);
                var isCheckedBlack = state.checkedBlacks && state.checkedBlacks.includes(rawTarget);
                var isCheckedRed = state.checkedReds && state.checkedReds.includes(rawTarget);
                var isUnchecked = !isCheckedRed && !isCheckedBlack;
                
                isBadTarget = isBlackTeam || isUnchecked || isCheckedBlack;
                
                if (isRedHuntingMode && !doubleRedCheck && isBadTarget && huntingAnchor !== null) {
                    logs.push('<span class="warning-text">⚠️ FlashFire попал в "плохую" цель (' + rawTarget + '): ' + 
                        (isBlackTeam ? 'Черный' : isCheckedBlack ? 'Проверенный Черный' : 'Непроверенный') + 
                        '!</span>');
                    logs.push('🎯 <strong>Активирован fallback:</strong> Охота на Красную Проверку от якоря ' + huntingAnchor + '.');
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                        logicTag = "RED_HUNTING_FALLBACK";
                    } else {
                        logs.push("⚠️ Красная проверка не найдена. Стреляем по FlashFire как fallback.");
                        finalTarget = rawTarget;
                    }
                } else if (doubleRedCheck && isRedHuntingMode) {
                    // УСЛОВИЕ 2: 2 ВЕРСИИ + АХАЛАЙ = ПОЛНЫЙ OVERRIDE
                    finalTarget = rawTarget;
                    logicTag = "DUAL_AHALAY_OVERRIDE";
                    logs.push("<div style='background:rgba(33,150,243,0.1); padding:8px; margin:5px 0; border-left:3px solid #2196f3;'>⚔️ <strong style='color:#2196f3;'>2 ВЕРСИИ + АХАЛАЙ:</strong> Боевой Тайминг! Двухсторонний красный <strong>НЕ стреляется</strong>. Стреляем в цель FlashFire: <strong>" + rawTarget + "</strong>.</div>");
                } else {
                    // Обычная логика
                    finalTarget = rawTarget;
                    if (isCheckedRed) {
                        logs.push("🎯 Цель " + rawTarget + " жива и является <strong style='color:#4caf50;'>Проверенным Красным</strong>. FlashFire огонь!");
                    } else {
                        logs.push("🎯 Цель " + rawTarget + " жива. FlashFire огонь."); 
                    }
                }
            }
        } 
        // 2. ECHO STATIC or SIMPLE STATIC
        else {
            var targetBase = currentBase;
            if (state.mirrorActive) {
                method = "Эхо Статика (+5)";
                targetBase = currentBase + 5;
                if (targetBase > 10) targetBase -= 10;
                logs.push("🖐️ Дон показал кисти рук! Включается Эхо статика: " + currentBase + " + 5 = <strong>" + targetBase + "</strong>");
            } else {
                method = "Статика Автомата";
                logs.push("🤫 Дон пасует (без рук). Работает базовая статика: <strong>" + currentBase + "</strong>");
            }
            // Правила безопасности для Статики/Эха (как в обычной Косматике)
            // ПРОВЕРКА: Активен ли режим охоты для Статики/Эха Автомата?
            // ОТМЕНА ПРАВИЛ: В режиме охоты игнорируем обычную статику и эхо. Приоритет у проверки.
            if (isRedHuntingMode && huntingAnchor !== null) {
                logs.push('🎯 <strong>Режим охоты активен</strong> для ' + (state.mirrorActive ? 'Эхо' : 'статики') + ' Автомата. Статика/Эхо игнорируется.');
                var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                if (huntResult !== null) {
                    finalTarget = huntResult;
                    logicTag = "RED_HUNTING_MODE";
                } else {
                    var result = getStaticTarget(targetBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                    finalTarget = result.target; 
                    logicTag = result.tag;
                }
            } else {
                var result = getStaticTarget(targetBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                finalTarget = result.target; 
                logicTag = result.tag;
            }
        }

        return { target: finalTarget, method: method, base: currentBase, gestureVal: gestureVal, rawTargetBeforeMod: finalTarget, logs: logs, logicTag: logicTag };
    }
    
    // --- ЛОГИКА ВИНЧЕСТЕРА ---
    if (isWinchesterMode()) {
        if (state.donAction === 'none') {
            // Статика для Винчестера (когда Дон пасует)
            method = "Статика";
            logs.push("🤫 Дон ничего не показал. Работает статика.");
            var result = getStaticTarget(currentBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
            finalTarget = result.target; 
            logicTag = result.tag;
        } else if (state.donAction === 'digit' || state.donAction === 'badge') {
            // ═══════════════════════════════════════════════════════════════
            // ИСПРАВЛЕНО: Ранняя проверка Solo Sheriff для Винчестера ОТКЛЮЧЕНА
            // Теперь проверка происходит ПОСЛЕ расчета FlashFire (строки 5628+)
            // ═══════════════════════════════════════════════════════════════
            if (false && isSoloSheriff && state.sheriffCheckedReds && state.sheriffCheckedReds.length > 0) { // DISABLED
                logs.push("<div style='background:rgba(255,87,34,0.15); padding:10px; margin:10px 0; border-left:4px solid #ff5722; border-radius:4px;'>⛔ <strong style='color:#ff5722; text-transform:uppercase;'>SOLO SHERIFF MODE (ВИНЧЕСТЕР):</strong> Единственный Шериф мертв. Математика <strong>ОТКЛЮЧЕНА</strong>. Стреляем ТОЛЬКО в Красную проверку!</div>");
                
                method = "Охота (Solo Sheriff - Красная Проверка)";
                logicTag = "SOLO_SHERIFF_RED_HUNTING";
                
                var liveRedChecks = state.sheriffCheckedReds.filter(function(player) {
                    var deadAtNight = state.deadPlayers && state.deadPlayers.includes(player);
                    var votedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(player);
                    return !deadAtNight && !votedOutDay;
                });
                
                if (liveRedChecks.length === 0) {
                    logs.push("⚠️ <strong>ОШИБКА:</strong> Все Красные проверки мертвы! Fallback к FlashFire.");
                } else if (liveRedChecks.length === 1) {
                    finalTarget = liveRedChecks[0];
                    logs.push("🎯 Единственная живая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
                    
                    return {
                        target: finalTarget,
                        method: method,
                        base: currentBase,
                        gestureVal: gestureVal,
                        rawTargetBeforeMod: finalTarget,
                        logs: logs,
                        logicTag: logicTag
                    };
                } else {
                    logs.push("🔍 Несколько живых Красных проверок: <strong>" + liveRedChecks.join(", ") + "</strong>. Ищем ближайшую от якоря <strong>" + huntingAnchor + "</strong>...");
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                        logs.push("✅ Ближайшая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: finalTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    } else {
                        logs.push("⚠️ <strong>ОШИБКА:</strong> Алгоритм поиска не вернул цель. Выбираем первую из списка.");
                        finalTarget = liveRedChecks[0];
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: finalTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    }
                }
            }
            // ═══════════════════════════════════════════════════════════════
            
            // FlashFire (Ахалай) для Винчестера
            method = "FlashFire (Ахалай)";
            logicTag = "WINCHESTER_FLASHFIRE";
            var rawTarget = getAhalayRawTarget(currentBase, state.donSeat, state.donAction, state.donDigitVal, logs);
            
            // При попадании на пустой стул или защищенную цель смещаемся
            var badgeSafety = (state.donAction === 'badge' && !isAhalayMode());
            var isBadgeProtected = badgeSafety && (
                state.blackTeam.includes(rawTarget) ||
                state.checkedBlacks.includes(rawTarget) ||
                (state.nightNum >= 3 && state.sheriffSeat === rawTarget)
            );
            
            // Проверяем, мертва ли цель (ночью или днём)
            var rawTargetDeadAtNight = state.deadPlayers && state.deadPlayers.includes(rawTarget);
            var rawTargetVotedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(rawTarget);
            var rawTargetIsDead = rawTargetDeadAtNight || rawTargetVotedOutDay;
            
            if (rawTargetIsDead || isBadgeProtected) {
                if (rawTargetIsDead) {
                    logs.push('<span class="warning-text">⚠️ Попадание в пустой стул (' + rawTarget + ')! Смещаемся.</span>');
                } else {
                    logs.push('<span class="warning-text">🛡️ Предохранитель: цель ' + rawTarget + ' защищена для Жетона. Смещаемся.</span>');
                }
                var candidate = rawTarget;
                for(var i=0; i<15; i++) {
                    candidate++; if (candidate > 10) candidate = 1;
                    if (state.deadPlayers.includes(candidate)) continue;
                    
                    if (badgeSafety && state.blackTeam.includes(candidate)) {
                        logs.push("❌ Игрок " + candidate + " жив, но Черный -> пропускаем.");
                        continue;
                    }
                    // При смещении пропускаем проверенных черных
                    if (state.checkedBlacks.includes(candidate)) {
                        logs.push("❌ Игрок " + candidate + " жив, но Проверенный Черный -> пропускаем.");
                        continue;
                    }
                    
                    // При смещении на 3+ ночи пропускаем шерифа и дона
                    if (state.nightNum >= 3) {
                        if (state.sheriffSeat === candidate) {
                            logs.push("❌ Игрок " + candidate + " жив, но Шериф (3+ ночь, смещение) -> пропускаем.");
                            continue;
                        }
                        if (state.donSeat === candidate) {
                            logs.push("❌ Игрок " + candidate + " жив, но Дон (3+ ночь, смещение) -> пропускаем.");
                            continue;
                        }
                    }
                    
                    break;
                }
                finalTarget = candidate;
                logs.push("➡️ Смещаемся на игрока: <strong>" + finalTarget + "</strong>.");
            } else {
                // ПРОВЕРКА: Активен ли режим охоты + Неудачная динамика? (Винчестер FlashFire)
                var isBadTarget = false;
                
                var isBlackTeam = state.blackTeam && state.blackTeam.includes(rawTarget);
                var isCheckedBlack = state.checkedBlacks && state.checkedBlacks.includes(rawTarget);
                var isCheckedRed = state.checkedReds && state.checkedReds.includes(rawTarget);
                var isUnchecked = !isCheckedRed && !isCheckedBlack;
                
                isBadTarget = isBlackTeam || isUnchecked || isCheckedBlack;
                
                if (isRedHuntingMode && !doubleRedCheck && isBadTarget && huntingAnchor !== null) {
                    logs.push('<span class="warning-text">⚠️ FlashFire попал в "плохую" цель (' + rawTarget + '): ' + 
                        (isBlackTeam ? 'Черный' : isCheckedBlack ? 'Проверенный Черный' : 'Непроверенный') + 
                        '!</span>');
                    logs.push('🎯 <strong>Активирован fallback:</strong> Охота на Красную Проверку от якоря ' + huntingAnchor + '.');
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                        logicTag = "RED_HUNTING_FALLBACK";
                    } else {
                        logs.push("⚠️ Красная проверка не найдена. Стреляем по FlashFire как fallback.");
                        finalTarget = rawTarget;
                    }
                } else if (doubleRedCheck && isRedHuntingMode) {
                    // УСЛОВИЕ 2: 2 ВЕРСИИ + АХАЛАЙ = ПОЛНЫЙ OVERRIDE
                    finalTarget = rawTarget;
                    logicTag = "DUAL_AHALAY_OVERRIDE";
                    logs.push("<div style='background:rgba(33,150,243,0.1); padding:8px; margin:5px 0; border-left:3px solid #2196f3;'>⚔️ <strong style='color:#2196f3;'>2 ВЕРСИИ + АХАЛАЙ:</strong> Боевой Тайминг! Двухсторонний красный <strong>НЕ стреляется</strong>. Стреляем в цель FlashFire: <strong>" + rawTarget + "</strong>.</div>");
                } else {
                    // Обычная логика (не Solo Sheriff)
                    finalTarget = rawTarget;
                    if (isCheckedRed) {
                        logs.push("🎯 Цель " + rawTarget + " жива и является <strong style='color:#4caf50;'>Проверенным Красным</strong>. FlashFire огонь!");
                    } else {
                        logs.push("🎯 Цель " + rawTarget + " жива. FlashFire огонь.");
                    }
                }
            }
        } else if (state.donAction === 'hand1' || state.donAction === 'hand2') {
            // ═══════════════════════════════════════════════════════════════
            // ИСПРАВЛЕНО: Ранняя проверка Solo Sheriff для Эхо Винчестера ОТКЛЮЧЕНА
            // Теперь проверка происходит ПОСЛЕ расчета Эхо (строки 5755+)
            // ═══════════════════════════════════════════════════════════════
            if (false && isSoloSheriff && state.sheriffCheckedReds && state.sheriffCheckedReds.length > 0) { // DISABLED
                var echoMod = (state.donAction === 'hand1') ? 3 : 6;
                logs.push("<div style='background:rgba(255,87,34,0.15); padding:10px; margin:10px 0; border-left:4px solid #ff5722; border-radius:4px;'>⛔ <strong style='color:#ff5722; text-transform:uppercase;'>SOLO SHERIFF MODE (ЭХО ВИНЧЕСТЕРА):</strong> Единственный Шериф мертв. Расчет Эхо (+" + echoMod + ") <strong>ОТКЛЮЧЕН</strong>. Стреляем ТОЛЬКО в Красную проверку!</div>");
                
                method = "Охота (Solo Sheriff - Красная Проверка)";
                logicTag = "SOLO_SHERIFF_RED_HUNTING";
                
                var liveRedChecks = state.sheriffCheckedReds.filter(function(player) {
                    var deadAtNight = state.deadPlayers && state.deadPlayers.includes(player);
                    var votedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(player);
                    return !deadAtNight && !votedOutDay;
                });
                
                if (liveRedChecks.length === 0) {
                    logs.push("⚠️ <strong>ОШИБКА:</strong> Все Красные проверки мертвы! Fallback к Эхо.");
                } else if (liveRedChecks.length === 1) {
                    finalTarget = liveRedChecks[0];
                    logs.push("🎯 Единственная живая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
                    
                    return {
                        target: finalTarget,
                        method: method,
                        base: currentBase,
                        gestureVal: gestureVal,
                        rawTargetBeforeMod: finalTarget,
                        logs: logs,
                        logicTag: logicTag
                    };
                } else {
                    logs.push("🔍 Несколько живых Красных проверок: <strong>" + liveRedChecks.join(", ") + "</strong>. Ищем ближайшую от якоря <strong>" + huntingAnchor + "</strong>...");
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                        logs.push("✅ Ближайшая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: finalTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    } else {
                        logs.push("⚠️ <strong>ОШИБКА:</strong> Алгоритм поиска не вернул цель. Выбираем первую из списка.");
                        finalTarget = liveRedChecks[0];
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: finalTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    }
                }
            }
            // ═══════════════════════════════════════════════════════════════
            
            // Эхо для Винчестера
            var echoMod = (state.donAction === 'hand1') ? 3 : 6;
            method = "Эхо (+" + echoMod + ")";
            logicTag = "WINCHESTER_ECHO";
            var targetBase = currentBase + echoMod;
            if (targetBase > 10) targetBase -= 10;
            logs.push("👋 Дон показал " + ((state.donAction === 'hand1') ? "1 кисть" : "2 кисти") + "! Эхо: " + currentBase + " + " + echoMod + " = <strong>" + targetBase + "</strong>");
            
            // ═══════════════════════════════════════════════════════════════
            // ПРОВЕРКА: Режим охоты для Эха Винчестера
            // ОТМЕНА ПРАВИЛ: В режиме охоты Эхо игнорируется, приоритет у проверки.
            // ═══════════════════════════════════════════════════════════════
            if (isRedHuntingMode && huntingAnchor !== null) {
                // Фильтруем живых красных
                var liveRedChecks = (state.sheriffCheckedReds || []).filter(function(player) {
                    var deadAtNight = state.deadPlayers && state.deadPlayers.includes(player);
                    var votedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(player);
                    return !deadAtNight && !votedOutDay;
                });
                
                if (liveRedChecks.length > 0) {
                    logs.push("<div style='background:rgba(255,152,0,0.1); padding:8px; margin:5px 0; border-left:3px solid #ff9800;'>🎯 <strong>Режим охоты активен.</strong> Эхо (+" + echoMod + ") игнорируется. Стреляем в Красную проверку!</div>");
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                        logicTag = "RED_HUNTING_ECHO_OVERRIDE";
                    } else {
                        finalTarget = liveRedChecks[0];
                    }
                    logs.push("✅ Стреляем в Красную проверку: <strong style='color:#4caf50;'>" + finalTarget + "</strong>.");
                } else {
                    logs.push("⚠️ Красные проверки мертвы. Стреляем по Эхо.");
                    var result = getStaticTarget(targetBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                    finalTarget = result.target;
                    logicTag = result.tag;
                }
            } else {
                // Обычная логика (не Solo Sheriff) - применяем стандартные правила безопасности
                var result = getStaticTarget(targetBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                finalTarget = result.target;
                logicTag = result.tag;
            }
        } else {
            // Если действие не распознано или none, используем статику
            method = "Статика";
            
            // ПРОВЕРКА: Активен ли режим охоты для Статики Винчестера?
            if (isRedHuntingMode && state.donAction === 'none' && huntingAnchor !== null) {
                logs.push("🤫 Дон ничего не показал. <strong>Режим охоты активен.</strong>");
                var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                if (huntResult !== null) {
                    finalTarget = huntResult;
                    logicTag = "RED_HUNTING_MODE";
                } else {
                    logs.push("⚠️ Красная проверка не найдена. Переход к стандартной статике.");
                    var result = getStaticTarget(currentBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                    finalTarget = result.target;
                    logicTag = result.tag;
                }
            } else {
                if (state.donAction === 'none') {
                    logs.push("🤫 Дон ничего не показал. Работает статика.");
                } else {
                    logs.push("⚠️ Неизвестное действие Дона: " + state.donAction + ". Работает статика.");
                }
                var result = getStaticTarget(currentBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                finalTarget = result.target; 
                logicTag = result.tag;
            }
        }
        
        // Определяем gestureVal для возврата
        if (state.donAction === 'hand1') gestureVal = 3;
        else if (state.donAction === 'hand2') gestureVal = 6;
        else if (state.donAction === 'badge') gestureVal = state.donSeat;
        else if (state.donAction === 'digit') gestureVal = state.donDigitVal;
        else gestureVal = 0;
        
        return { target: finalTarget, method: method, base: currentBase, gestureVal: gestureVal, rawTargetBeforeMod: finalTarget, logs: logs, logicTag: logicTag };
    }
    
    // --- ЛОГИКА РЕЖИМА "КТО" (CLASSIC FIRE) ---
    if (isWhoMode()) {
        // В ClassicFire всегда ждем цифру. Если вдруг пришло что-то другое (баг) - обрабатываем как статику или ошибку.
        if (state.donAction === 'digit') {
            method = "ClassicFire (Только цифры)";
            logicTag = "CLASSIC_FIRE";

            // 1. Активная цифра (используем currentBase и activeIndex, вычисленные в начале функции)
            var activeDigit = currentBase;
            var activeIndexDisplay = activeIndex + 1;

            // 2. Математика: Активная + Жест
            var modifier = state.donDigitVal;
            var sum = activeDigit + modifier;

            // Логи
            var activeDisplay = activeDigit >= 0 ? "+" + activeDigit : activeDigit.toString();
            if (logs) logs.push("❓ <strong>ClassicFire:</strong> Дон показал цифру <strong>" + modifier + "</strong>. Активна " + activeIndexDisplay + "-я цифра (" + activeDisplay + ").");
            if (logs) logs.push("🧮 " + modifier + " " + activeDisplay + " = <strong>" + sum + "</strong>");

            // Нормализация (1-10)
            while (sum > 10) { sum -= 10; if (logs) logs.push("🔄 >10, вычитаем 10 -> <strong>" + sum + "</strong>"); }
            while (sum < 1) { sum += 10; if (logs) logs.push("🔄 <1, прибавляем 10 -> <strong>" + sum + "</strong>"); }

            // 3. Смещение (через helper) - направление зависит от знака активной цифры
            var whoDirection = (activeDigit < 0) ? -1 : 1;
            var dynamicResult = getDynamicTarget(activeDigit, modifier, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, whoDirection, state.blackTeam, (state.donAction === 'badge' && !isAhalayMode()), state.votedOutPlayers);
            
            return { 
                target: dynamicResult.target, 
                method: method, 
                base: activeDigit, 
                gestureVal: modifier, 
                rawTargetBeforeMod: sum, 
                logs: logs, 
                logicTag: dynamicResult.tag 
            };
        } else if (state.donAction === 'none') {
            method = "Пас Дона (Отстрел по столу)";
            logicTag = "PASS_FIRST_RED";
            if (logs) logs.push("🤫 Дон ничего не показал (Пас). Ищем первого живого красного игрока.");
            var finalTarget = -1;
            for (var seat = 1; seat <= 10; seat++) {
                if (state.deadPlayers.includes(seat)) continue; // Мертв
                if (state.blackTeam.includes(seat)) continue;   // Черный
                if (state.checkedBlacks.includes(seat)) continue; // Проверенный черный
                // Шериф на 3+ ночь (защита)
                if (state.nightNum >= 3 && state.sheriffSeat === seat) continue;
                finalTarget = seat;
                if (logs) logs.push("✅ Найден первый живой красный: <strong>" + finalTarget + "</strong>.");
                break;
            }
            if (finalTarget === -1) {
                finalTarget = 1; // Fallback
                if (logs) logs.push("⚠️ Не найдено красных. Fallback на 1.");
            }
            
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: 0,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        } else {
            // Fallback, если вдруг action != digit и != none (чего быть не должно в генераторе)
            if (logs) logs.push("⚠️ Ошибка: В режиме Кто Дон должен показывать цифру или пас.");
            return { target: 0, logs: logs };
        }
    }
    
    // --- ЛОГИКА РЕЖИМА "БОГОМОЛ" (CLASSIC FIRE) ---
    if (isMantisMode()) {
        // В ClassicFire всегда ждем цифру. Если вдруг пришло что-то другое (баг) - обрабатываем как статику или ошибку.
        if (state.donAction === 'digit') {
            method = "ClassicFire (Только цифры)";
            logicTag = "CLASSIC_FIRE";

            // 1. Активная цифра (используем currentBase и activeIndex, вычисленные в начале функции)
            var activeDigit = currentBase;
            var activeIndexDisplay = activeIndex + 1;

            // 2. Математика: Активная + Жест
            var modifier = state.donDigitVal;
            var sum = activeDigit + modifier;

            // Логи
            var activeDisplay = activeDigit >= 0 ? "+" + activeDigit : activeDigit.toString();
            if (logs) logs.push("👐 <strong>Богомол:</strong> Дон показал цифру <strong>" + modifier + "</strong>. Активна " + activeIndexDisplay + "-я цифра (" + activeDisplay + ").");
            if (logs) logs.push("🧮 " + modifier + " " + activeDisplay + " = <strong>" + sum + "</strong>");

            // Нормализация (1-10)
            while (sum > 10) { sum -= 10; if (logs) logs.push("🔄 >10, вычитаем 10 -> <strong>" + sum + "</strong>"); }
            while (sum < 1) { sum += 10; if (logs) logs.push("🔄 <1, прибавляем 10 -> <strong>" + sum + "</strong>"); }

            // 3. Смещение (через helper) - направление зависит от знака активной цифры
            var mantisDirection = (activeDigit < 0) ? -1 : 1;
            var dynamicResult = getDynamicTarget(activeDigit, modifier, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, mantisDirection, state.blackTeam, (state.donAction === 'badge' && !isAhalayMode()), state.votedOutPlayers);
            
            return { 
                target: dynamicResult.target, 
                method: method, 
                base: activeDigit, 
                gestureVal: modifier, 
                rawTargetBeforeMod: sum, 
                logs: logs, 
                logicTag: dynamicResult.tag 
            };
        } else if (state.donAction === 'none') {
            method = "Пас Дона (Отстрел по столу)";
            logicTag = "PASS_FIRST_RED";
            if (logs) logs.push("🤫 Дон ничего не показал (Пас). Ищем первого живого красного игрока.");
            var finalTarget = -1;
            for (var seat = 1; seat <= 10; seat++) {
                if (state.deadPlayers.includes(seat)) continue; // Мертв
                if (state.blackTeam.includes(seat)) continue;   // Черный
                if (state.checkedBlacks.includes(seat)) continue; // Проверенный черный
                // Шериф на 3+ ночь (защита)
                if (state.nightNum >= 3 && state.sheriffSeat === seat) continue;
                finalTarget = seat;
                if (logs) logs.push("✅ Найден первый живой красный: <strong>" + finalTarget + "</strong>.");
                break;
            }
            if (finalTarget === -1) {
                finalTarget = 1; // Fallback
                if (logs) logs.push("⚠️ Не найдено красных. Fallback на 1.");
            }
            
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: 0,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        } else {
            // Fallback, если вдруг action != digit и != none (чего быть не должно в генераторе)
            if (logs) logs.push("⚠️ Ошибка: В режиме Богомол Дон должен показывать цифру или пас.");
            return { target: 0, logs: logs };
        }
    }
    
    // --- ЛОГИКА РЕЖИМА "ПРОВЕРКА" (CLASSIC FIRE) ---
    if (isCheckMode()) {
        // В ClassicFire всегда ждем цифру. Если вдруг пришло что-то другое (баг) - обрабатываем как статику или ошибку.
        if (state.donAction === 'digit') {
            method = "ClassicFire (Только цифры)";
            logicTag = "CHECK_CLASSIC_FIRE";

            // 1. Активная цифра (используем currentBase и activeIndex, вычисленные в начале функции)
            var activeDigit = currentBase;
            var activeIndexDisplay = activeIndex + 1;

            // 2. Математика: Активная + Жест
            var modifier = state.donDigitVal;
            var sum = activeDigit + modifier;

            // Логи
            var activeDisplay = activeDigit >= 0 ? "+" + activeDigit : activeDigit.toString();
            if (logs) logs.push("🔎 <strong>Проверка:</strong> Дон показал цифру <strong>" + modifier + "</strong>. Активна " + activeIndexDisplay + "-я цифра (" + activeDisplay + ").");
            if (logs) logs.push("🧮 " + modifier + " " + activeDisplay + " = <strong>" + sum + "</strong>");

            // Нормализация (1-10)
            while (sum > 10) { sum -= 10; if (logs) logs.push("🔄 >10, вычитаем 10 -> <strong>" + sum + "</strong>"); }
            while (sum < 1) { sum += 10; if (logs) logs.push("🔄 <1, прибавляем 10 -> <strong>" + sum + "</strong>"); }

            // 3. Смещение (через helper) - направление зависит от знака активной цифры
            var checkDirection = (activeDigit < 0) ? -1 : 1;
            var dynamicResult = getDynamicTarget(activeDigit, modifier, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, checkDirection, state.blackTeam, (state.donAction === 'badge' && !isAhalayMode()), state.votedOutPlayers);
            
            return { 
                target: dynamicResult.target, 
                method: method, 
                base: activeDigit, 
                gestureVal: modifier, 
                rawTargetBeforeMod: sum, 
                logs: logs, 
                logicTag: logicTag 
            };
        } else if (state.donAction === 'none') {
            method = "Пас Дона (Отстрел по столу)";
            logicTag = "PASS_FIRST_RED";
            if (logs) logs.push("🤫 Дон ничего не показал (Пас). Ищем первого живого красного игрока.");
            var finalTarget = -1;
            for (var seat = 1; seat <= 10; seat++) {
                if (state.deadPlayers.includes(seat)) continue; // Мертв
                if (state.blackTeam.includes(seat)) continue;   // Черный
                if (state.checkedBlacks.includes(seat)) continue; // Проверенный черный
                // Шериф на 3+ ночь (защита)
                if (state.nightNum >= 3 && state.sheriffSeat === seat) continue;
                finalTarget = seat;
                if (logs) logs.push("✅ Найден первый живой красный: <strong>" + finalTarget + "</strong>.");
                break;
            }
            if (finalTarget === -1) {
                finalTarget = 1; // Fallback
                if (logs) logs.push("⚠️ Не найдено красных. Fallback на 1.");
            }
            
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: 0,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        } else {
            // Fallback, если вдруг action != digit и != none (чего быть не должно в генераторе)
            if (logs) logs.push("⚠️ Ошибка: В режиме Проверка Дон должен показывать цифру или пас.");
            return { target: 0, logs: logs };
        }
    }
    
    // --- ЛОГИКА РЕЖИМА "КРАСНЫЙ" (CLASSIC FIRE) ---
    if (isRedMode()) {
        // В ClassicFire всегда ждем цифру. Если вдруг пришло что-то другое (баг) - обрабатываем как статику или ошибку.
        if (state.donAction === 'digit') {
            method = "ClassicFire (Только цифры)";
            logicTag = "CLASSIC_FIRE";

            // 1. Активная цифра (используем currentBase и activeIndex, вычисленные в начале функции)
            var activeDigit = currentBase;
            var activeIndexDisplay = activeIndex + 1;

            // 2. Математика: Активная + Жест
            var modifier = state.donDigitVal;
            var sum = activeDigit + modifier;

            // Логи
            var activeDisplay = activeDigit >= 0 ? "+" + activeDigit : activeDigit.toString();
            if (logs) logs.push("👍 <strong>Красный (ClassicFire):</strong> Дон показал 👍 и цифру <strong>" + modifier + "</strong>. Активна " + activeIndexDisplay + "-я цифра (" + activeDisplay + ").");
            if (logs) logs.push("🧮 " + modifier + " " + activeDisplay + " = <strong>" + sum + "</strong>");

            // Нормализация (1-10)
            while (sum > 10) { sum -= 10; if (logs) logs.push("🔄 >10, вычитаем 10 -> <strong>" + sum + "</strong>"); }
            while (sum < 1) { sum += 10; if (logs) logs.push("🔄 <1, прибавляем 10 -> <strong>" + sum + "</strong>"); }

            // 3. Смещение (через helper) - направление зависит от знака активной цифры
            var redDirection = (activeDigit < 0) ? -1 : 1;
            var dynamicResult = getDynamicTarget(activeDigit, modifier, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, redDirection, state.blackTeam, (state.donAction === 'badge' && !isAhalayMode()), state.votedOutPlayers);
            
            return { 
                target: dynamicResult.target, 
                method: method, 
                base: activeDigit, 
                gestureVal: modifier, 
                rawTargetBeforeMod: sum, 
                logs: logs, 
                logicTag: dynamicResult.tag 
            };
        } else if (state.donAction === 'none') {
            method = "Пас Дона (Отстрел по столу)";
            logicTag = "PASS_FIRST_RED";
            if (logs) logs.push("🤫 Дон ничего не показал (Пас). Ищем первого живого красного игрока.");
            var finalTarget = -1;
            for (var seat = 1; seat <= 10; seat++) {
                if (state.deadPlayers.includes(seat)) continue; // Мертв
                if (state.blackTeam.includes(seat)) continue;   // Черный
                if (state.checkedBlacks.includes(seat)) continue; // Проверенный черный
                // Шериф на 3+ ночь (защита)
                if (state.nightNum >= 3 && state.sheriffSeat === seat) continue;
                finalTarget = seat;
                if (logs) logs.push("✅ Найден первый живой красный: <strong>" + finalTarget + "</strong>.");
                break;
            }
            if (finalTarget === -1) {
                finalTarget = 1; // Fallback
                if (logs) logs.push("⚠️ Не найдено красных. Fallback на 1.");
            }
            
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: 0,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        } else {
            // Fallback, если вдруг action != digit и != none (чего быть не должно в генераторе)
            if (logs) logs.push("⚠️ Ошибка: В режиме Красный Дон должен показывать 👍 и цифру или пас.");
            return { target: 0, logs: logs };
        }
    }
    
    // --- ЛОГИКА РЕЖИМА "ЧЁРНЫЙ" (CLASSIC FIRE) ---
    if (isBlackMode()) {
        // В ClassicFire всегда ждем цифру. Если вдруг пришло что-то другое (баг) - обрабатываем как статику или ошибку.
        if (state.donAction === 'digit') {
            method = "ClassicFire (Только цифры)";
            logicTag = "CLASSIC_FIRE";

            // 1. Активная цифра (используем currentBase и activeIndex, вычисленные в начале функции)
            var activeDigit = currentBase;
            var activeIndexDisplay = activeIndex + 1;

            // 2. Математика: Активная + Жест
            var modifier = state.donDigitVal;
            var sum = activeDigit + modifier;

            // Логи
            var activeDisplay = activeDigit >= 0 ? "+" + activeDigit : activeDigit.toString();
            if (logs) logs.push("👎 <strong>Чёрный (ClassicFire):</strong> Дон показал 👎 и цифру <strong>" + modifier + "</strong>. Активна " + activeIndexDisplay + "-я цифра (" + activeDisplay + ").");
            if (logs) logs.push("🧮 " + modifier + " " + activeDisplay + " = <strong>" + sum + "</strong>");

            // Нормализация (1-10)
            while (sum > 10) { sum -= 10; if (logs) logs.push("🔄 >10, вычитаем 10 -> <strong>" + sum + "</strong>"); }
            while (sum < 1) { sum += 10; if (logs) logs.push("🔄 <1, прибавляем 10 -> <strong>" + sum + "</strong>"); }

            // 3. Смещение (через helper) - направление зависит от знака активной цифры
            var blackDirection = (activeDigit < 0) ? -1 : 1;
            var dynamicResult = getDynamicTarget(activeDigit, modifier, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, blackDirection, state.blackTeam, (state.donAction === 'badge' && !isAhalayMode()), state.votedOutPlayers);
            
            return { 
                target: dynamicResult.target, 
                method: method, 
                base: activeDigit, 
                gestureVal: modifier, 
                rawTargetBeforeMod: sum, 
                logs: logs, 
                logicTag: dynamicResult.tag 
            };
        } else if (state.donAction === 'none') {
            method = "Пас Дона (Отстрел по столу)";
            logicTag = "PASS_FIRST_RED";
            if (logs) logs.push("🤫 Дон ничего не показал (Пас). Ищем первого живого красного игрока.");
            var finalTarget = -1;
            for (var seat = 1; seat <= 10; seat++) {
                if (state.deadPlayers.includes(seat)) continue; // Мертв
                if (state.blackTeam.includes(seat)) continue;   // Черный
                if (state.checkedBlacks.includes(seat)) continue; // Проверенный черный
                // Шериф на 3+ ночь (защита)
                if (state.nightNum >= 3 && state.sheriffSeat === seat) continue;
                finalTarget = seat;
                if (logs) logs.push("✅ Найден первый живой красный: <strong>" + finalTarget + "</strong>.");
                break;
            }
            if (finalTarget === -1) {
                finalTarget = 1; // Fallback
                if (logs) logs.push("⚠️ Не найдено красных. Fallback на 1.");
            }
            
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: 0,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        } else {
            // Fallback, если вдруг action != digit и != none (чего быть не должно в генераторе)
            if (logs) logs.push("⚠️ Ошибка: В режиме Чёрный Дон должен показывать 👎 и цифру или пас.");
            return { target: 0, logs: logs };
        }
    }
    
    // --- ЛОГИКА РЕЖИМА "КРАСНЫЙ/ЧЁРНЫЙ" (CLASSIC FIRE) ---
    if (isRedBlackMode()) {
        // В ClassicFire всегда ждем цифру. Если вдруг пришло что-то другое (баг) - обрабатываем как статику или ошибку.
        if (state.donAction === 'digit') {
            method = "ClassicFire (Только цифры)";
            logicTag = "CLASSIC_FIRE";

            // 1. Активная цифра (используем currentBase и activeIndex, вычисленные в начале функции)
            var activeDigit = currentBase;
            var activeIndexDisplay = activeIndex + 1;

            // 2. Математика: Активная + Жест
            var modifier = state.donDigitVal;
            var sum = activeDigit + modifier;

            // Логи
            var activeDisplay = activeDigit >= 0 ? "+" + activeDigit : activeDigit.toString();
            if (logs) logs.push("👍👎 <strong>Красный/Чёрный (ClassicFire):</strong> Дон показал 👍,👎 + <strong>" + modifier + "</strong>. Активна " + activeIndexDisplay + "-я цифра (" + activeDisplay + ").");
            if (logs) logs.push("🧮 " + modifier + " " + activeDisplay + " = <strong>" + sum + "</strong>");

            // Нормализация (1-10)
            while (sum > 10) { sum -= 10; if (logs) logs.push("🔄 >10, вычитаем 10 -> <strong>" + sum + "</strong>"); }
            while (sum < 1) { sum += 10; if (logs) logs.push("🔄 <1, прибавляем 10 -> <strong>" + sum + "</strong>"); }

            // 3. Смещение (через helper) - направление зависит от знака активной цифры
            var redblackDirection = (activeDigit < 0) ? -1 : 1;
            var dynamicResult = getDynamicTarget(activeDigit, modifier, state.deadPlayers, state.checkedBlacks, state.sheriffSeat, state.donSeat, state.nightNum, logs, redblackDirection, state.blackTeam, (state.donAction === 'badge' && !isAhalayMode()), state.votedOutPlayers);
            
            return { 
                target: dynamicResult.target, 
                method: method, 
                base: activeDigit, 
                gestureVal: modifier, 
                rawTargetBeforeMod: sum, 
                logs: logs, 
                logicTag: dynamicResult.tag 
            };
        } else if (state.donAction === 'none') {
            method = "Пас Дона (Отстрел по столу)";
            logicTag = "PASS_FIRST_RED";
            if (logs) logs.push("🤫 Дон ничего не показал (Пас). Ищем первого живого красного игрока.");
            var finalTarget = -1;
            for (var seat = 1; seat <= 10; seat++) {
                if (state.deadPlayers.includes(seat)) continue; // Мертв
                if (state.blackTeam.includes(seat)) continue;   // Черный
                if (state.checkedBlacks.includes(seat)) continue; // Проверенный черный
                // Шериф на 3+ ночь (защита)
                if (state.nightNum >= 3 && state.sheriffSeat === seat) continue;
                finalTarget = seat;
                if (logs) logs.push("✅ Найден первый живой красный: <strong>" + finalTarget + "</strong>.");
                break;
            }
            if (finalTarget === -1) {
                finalTarget = 1; // Fallback
                if (logs) logs.push("⚠️ Не найдено красных. Fallback на 1.");
            }
            
            return {
                target: finalTarget,
                method: method,
                base: currentBase,
                gestureVal: 0,
                rawTargetBeforeMod: finalTarget,
                logs: logs,
                logicTag: logicTag
            };
        } else {
            // Fallback, если вдруг action != digit и != none (чего быть не должно в генераторе)
            if (logs) logs.push("⚠️ Ошибка: В режиме Красный/Чёрный Дон должен показывать 👍,👎 + цифру или пас.");
            return { target: 0, logs: logs };
        }
    }
    
    // --- ЛОГИКА АХАЛАЯ (ДИНАМИКА) ---
    if (state.donAction === 'digit' || state.donAction === 'badge') {
        // ═══════════════════════════════════════════════════════════════
        // КРИТИЧЕСКАЯ ПРОВЕРКА: SOLO SHERIFF + КРАСНЫЕ ПРОВЕРКИ (ПРИОРИТЕТ)
        // ═══════════════════════════════════════════════════════════════
        // Если Единственный Шериф мертв и есть Красные проверки,
        // мы ОБЯЗАНЫ стрелять ТОЛЬКО в них, БЕЗ выполнения математики Ахалая!
        if (isSoloSheriff && state.sheriffCheckedReds && state.sheriffCheckedReds.length > 0) {
            logs.push("<div style='background:rgba(255,87,34,0.15); padding:10px; margin:10px 0; border-left:4px solid #ff5722; border-radius:4px;'>⛔ <strong style='color:#ff5722; text-transform:uppercase;'>SOLO SHERIFF MODE (ДИНАМИКА):</strong> Единственный Шериф мертв. Математика режимов <strong>ОТКЛЮЧЕНА</strong>. Стреляем ТОЛЬКО в Красную проверку!</div>");
            
            method = "Охота (Solo Sheriff - Красная Проверка)";
            logicTag = "SOLO_SHERIFF_RED_HUNTING";
            
            // Фильтруем живых красных
            var liveRedChecks = state.sheriffCheckedReds.filter(function(player) {
                return !state.deadPlayers || !state.deadPlayers.includes(player);
            });
            
            if (liveRedChecks.length === 0) {
                logs.push("⚠️ <strong>ОШИБКА:</strong> Все Красные проверки мертвы! Fallback к стандартной математике.");
                // Продолжаем выполнение обычной логики Ахалая ниже
            } else if (liveRedChecks.length === 1) {
                // Если проверка одна - стреляем в неё
                finalTarget = liveRedChecks[0];
                logs.push("🎯 Единственная живая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
                
                // ВАЖНО: Возвращаем результат СРАЗУ, не выполняя математику
                return {
                    target: finalTarget,
                    method: method,
                    base: currentBase,
                    gestureVal: gestureVal,
                    rawTargetBeforeMod: finalTarget,
                    logs: logs,
                    logicTag: logicTag
                };
            } else {
                // Если проверок 2 и более - берем ближайшую по часовой от якоря
                logs.push("🔍 Несколько живых Красных проверок: <strong>" + liveRedChecks.join(", ") + "</strong>. Ищем ближайшую от якоря <strong>" + huntingAnchor + "</strong>...");
                
                var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                
                if (huntResult !== null) {
                    finalTarget = huntResult;
                    logs.push("✅ Ближайшая Красная проверка: <strong style='color:#4caf50;'>" + finalTarget + "</strong>. Стреляем!");
                    
                    // ВАЖНО: Возвращаем результат СРАЗУ, не выполняя математику
                    return {
                        target: finalTarget,
                        method: method,
                        base: currentBase,
                        gestureVal: gestureVal,
                        rawTargetBeforeMod: finalTarget,
                        logs: logs,
                        logicTag: logicTag
                    };
                } else {
                    logs.push("⚠️ <strong>ОШИБКА:</strong> Алгоритм поиска не вернул цель. Выбираем первую из списка.");
                    finalTarget = liveRedChecks[0];
                    
                    // ВАЖНО: Возвращаем результат СРАЗУ, не выполняя математику
                    return {
                        target: finalTarget,
                        method: method,
                        base: currentBase,
                        gestureVal: gestureVal,
                        rawTargetBeforeMod: finalTarget,
                        logs: logs,
                        logicTag: logicTag
                    };
                }
            }
        }
        // ═══════════════════════════════════════════════════════════════
        
        // Для режимов Ахалая используем специальную логику
        if (isAhalayMode()) {
            method = "Ахалай-махалай (OldFire)"; 
            logicTag = "DYNAMICS_SIMPLE";
            
            // Определяем активную цифру Ахалая на основе номера ночи
            // Ночь 1 → 1-я цифра (индекс 0), Ночь 2 → 2-я цифра (индекс 1), Ночь 3 → 3-я цифра (индекс 2)
            // Потом снова 1, 2, 3...
            var nightIndex = (state.nightNum - 1) % 3;
            var activeKosmatikaDigit = state.kosmatikaList[nightIndex];
            var activeKosmatikaIndex = nightIndex + 1; // Для отображения (1-я, 2-я, 3-я)
            
            // Для ahalay_newbie: применяем модификатор динамики при повторении черной команды
            var dynamicModifier = 0;
            if (appGameMode === 'ahalay_newbie' && appAhalayNewbieDynamicModifier > 0) {
                dynamicModifier = appAhalayNewbieDynamicModifier + 1; // +2, +3, +4... (так как начинаем с 1)
            }
            
            var modifier = 0;
            var desc = "";
            
            if (state.donAction === 'digit') { 
                modifier = state.donDigitVal; 
                desc = "Показана цифра " + state.donDigitVal; 
            } else if (state.donAction === 'badge') { 
                modifier = state.donSeat; 
                desc = "Показан жетон (номер Дона: " + state.donSeat + ")"; 
            }
            
            // Применяем модификатор динамики к активной цифре
            var modifiedActiveDigit = activeKosmatikaDigit + dynamicModifier;
            var sum = modifier + modifiedActiveDigit;
            
            // Добавляем информацию о модификаторе в логи, если он применен
            if (dynamicModifier > 0 && logs) {
                logs.push("🔄 <strong>Повторение черной команды:</strong> применяем модификатор динамики +" + dynamicModifier + " к активной цифре.");
            }
            
            // Форматируем отображение активной цифры для логов (с учетом модификатора)
            var activeKosmatikaDisplay = modifiedActiveDigit >= 0 ? "+" + modifiedActiveDigit : modifiedActiveDigit.toString();
            var originalDisplay = activeKosmatikaDigit >= 0 ? "+" + activeKosmatikaDigit : activeKosmatikaDigit.toString();
            if (dynamicModifier > 0 && logs) {
                logs.push("⚡ <strong>Ахалай-махалай:</strong> " + desc + " + Активна " + activeKosmatikaIndex + "-я цифра (" + originalDisplay + " + " + dynamicModifier + " = " + activeKosmatikaDisplay + ") = <strong>" + sum + "</strong>");
            } else if (logs) {
                logs.push("⚡ <strong>Ахалай-махалай:</strong> " + desc + " + Активна " + activeKosmatikaIndex + "-я цифра (" + activeKosmatikaDisplay + ") = <strong>" + sum + "</strong>");
            }
            
            // Нормализация круга (если > 10 или < 1)
            while (sum > 10) { 
                sum -= 10; 
                if (logs) logs.push("🔄 Больше 10, вычитаем 10 -> <strong>" + sum + "</strong>"); 
            }
            while (sum < 1) { 
                sum += 10; 
                if (logs) logs.push("🔄 Меньше 1, прибавляем 10 -> <strong>" + sum + "</strong>"); 
            }
            
            var rawTarget = sum;
            
            // Определяем направление смещения: если активная цифра была отрицательной, смещаемся против часовой стрелки
            var shiftDirection = (activeKosmatikaDigit < 0) ? -1 : 1;
            
            // ПРОВЕРКА: ПОПАДАНИЕ В ПУСТОЙ СТУЛ (проверяем и ночные, и дневные смерти)
            var rawTargetDeadAtNight = state.deadPlayers && state.deadPlayers.includes(rawTarget);
            var rawTargetVotedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(rawTarget);
            if (rawTargetDeadAtNight || rawTargetVotedOutDay) {
                logicTag = "DYNAMICS_SKIP_DEAD";
                
                var directionText = shiftDirection < 0 ? "против часовой стрелки" : "по часовой стрелке";
                logs.push('<span class="warning-text">⚠️ Попадание в пустой стул (' + rawTarget + ')! Смещаемся (' + directionText + ').</span>');
                
                var candidate = rawTarget;
                // Ищем следующего игрока в нужном направлении
                for(var i=0; i<15; i++) {
                    candidate += shiftDirection;
                    if (shiftDirection > 0) {
                        if (candidate > 10) candidate = 1;
                    } else {
                        if (candidate < 1) candidate = 10;
                    }
                    
                    // 1. Если мертв (ночью или днём) - идем дальше
                    var candidateDeadAtNight = state.deadPlayers && state.deadPlayers.includes(candidate);
                    var candidateVotedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(candidate);
                    if (candidateDeadAtNight || candidateVotedOutDay) continue;
                    
                    // 2. Если Проверенный Черный (любой) - пропускаем
                    if (state.checkedBlacks.includes(candidate)) { 
                        logs.push("❌ Игрок " + candidate + " жив, но Проверенный Черный -> пропускаем."); 
                        logicTag = "DYNAMICS_SKIP_CHECKED"; 
                        continue; 
                    }
                    
                    // 3. Если Ночь 3+, включаем защиту ключевых ролей
                    if (state.nightNum >= 3) {
                        if (state.sheriffSeat === candidate) { 
                            logs.push("❌ Игрок " + candidate + " жив, но Шериф (3+ ночь) -> пропускаем."); 
                            logicTag = "DYNAMICS_SKIP_SHERIFF"; 
                            continue; 
                        }
                        if (state.donSeat === candidate) {
                             logs.push("❌ Игрок " + candidate + " жив, но Дон (3+ ночь) -> пропускаем.");
                             logicTag = "DYNAMICS_SKIP_DON";
                             continue;
                        }
                    }
                    
                    // Цель найдена
                    break;
                }
                finalTarget = candidate; 
                logs.push("➡️ Итоговая цель: <strong>" + finalTarget + "</strong>.");
            } else { 
                // ПРОВЕРКА: Активен ли режим охоты + Неудачная динамика?
                var isBadTarget = false;
                
                // Проверяем цель на "плохие" критерии (Черный/Непроверенный/Проверенный Черный)
                var isBlackTeam = state.blackTeam && state.blackTeam.includes(rawTarget);
                var isCheckedBlack = state.checkedBlacks && state.checkedBlacks.includes(rawTarget);
                var isCheckedRed = state.checkedReds && state.checkedReds.includes(rawTarget);
                var isUnchecked = !isCheckedRed && !isCheckedBlack;
                
                isBadTarget = isBlackTeam || isUnchecked || isCheckedBlack;
                
                if (isRedHuntingMode && isBadTarget && huntingAnchor !== null) {
                    // Неудачная динамика - переходим к охоте
                    logs.push('<span class="warning-text">⚠️ Динамика попала в "плохую" цель (' + rawTarget + '): ' + 
                        (isBlackTeam ? 'Черный' : isCheckedBlack ? 'Проверенный Черный' : 'Непроверенный') + 
                        '!</span>');
                    logs.push('🎯 <strong>Активирован fallback:</strong> Охота на Красную Проверку от якоря ' + huntingAnchor + '.');
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                        logicTag = "RED_HUNTING_FALLBACK";
                    } else {
                        // Если не нашли красную проверку, стреляем по математике (как было)
                        logs.push("⚠️ Красная проверка не найдена. Стреляем по математике как fallback.");
                        finalTarget = rawTarget;
                        logs.push("➡️ Итоговая цель (fallback): <strong>" + finalTarget + "</strong>.");
                    }
                } else {
                    // ═══════════════════════════════════════════════════════════════
                    // КРИТИЧЕСКАЯ ПРОВЕРКА: SOLO SHERIFF MODE (Strict Rule)
                    // ═══════════════════════════════════════════════════════════════
                    if (isSoloSheriff && state.sheriffCheckedReds && state.sheriffCheckedReds.length > 0) {
                        var targetIsRedCheck = state.sheriffCheckedReds.includes(rawTarget);
                        
                        if (!targetIsRedCheck) {
                            // ОШИБКА: В режиме Solo Sheriff динамика НЕ МОЖЕТ убить непроверенного
                            logs.push("<div style='background:rgba(244, 67, 54, 0.1); padding:8px; margin:5px 0; border-left:3px solid #f44336;'>⚠️ <strong>SOLO SHERIFF MODE:</strong> Математика попала НЕ в Красную Проверку (цель: " + rawTarget + "). Откат к охоте на ближайшую проверку.</div>");
                            
                            var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                            
                            if (huntResult !== null) {
                                finalTarget = huntResult;
                                logicTag = "SOLO_SHERIFF_FALLBACK";
                            } else {
                                logs.push("⚠️ Красная проверка не найдена. Стреляем по математике как последний fallback.");
                                finalTarget = rawTarget;
                            }
                        } else {
                            // ОК: Цель является Красной Проверкой
                            finalTarget = rawTarget;
                            logs.push("✅ <strong>SOLO SHERIFF MODE:</strong> Математика попала в Красную Проверку (" + rawTarget + "). Стреляем!");
                        }
                    } else {
                        // Обычная логика (не Solo Sheriff)
                        finalTarget = rawTarget;
                        if (isCheckedRed) {
                            logs.push("🎯 Цель " + rawTarget + " жива и является <strong style='color:#4caf50;'>Проверенным Красным</strong>. Математика сработала!");
                        } else {
                            logs.push("🎯 Цель " + rawTarget + " жива. Стреляем."); 
                        }
                    }
                }
            }
        } else {
            // ═══════════════════════════════════════════════════════════════
            // УСЛОВИЕ 1: ШЕРИФ МЕРТВ + КРАСНЫЕ ПРОВЕРКИ + АХАЛАЙ
            // Ахалай может ПЕРЕНАПРАВИТЬ стрельбу на ДРУГУЮ красную проверку.
            // Если ахалай НЕ попал в красную проверку → стреляем ближайшую.
            // ═══════════════════════════════════════════════════════════════
            if (sheriffDead && state.sheriffCheckedReds && state.sheriffCheckedReds.length > 0) {
                // Фильтруем живых красных
                var liveRedChecks = state.sheriffCheckedReds.filter(function(player) {
                    var deadAtNight = state.deadPlayers && state.deadPlayers.includes(player);
                    var votedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(player);
                    return !deadAtNight && !votedOutDay;
                });
                
                if (liveRedChecks.length === 0) {
                    logs.push("⚠️ <strong>ОШИБКА:</strong> Все Красные проверки мертвы! Fallback к стандартной математике.");
                    // Продолжаем выполнение обычной логики ниже
                } else {
                    // Считаем математику ахалая
                    var rawTarget = getAhalayRawTarget(currentBase, state.donSeat, state.donAction, state.donDigitVal, logs);
                    
                    // Проверяем: попал ли ахалай в ЖИВУЮ красную проверку?
                    if (liveRedChecks.includes(rawTarget)) {
                        // Ахалай попал в другую красную проверку → стреляем в неё!
                        finalTarget = rawTarget;
                        method = "Ахалай → Смена Красной Проверки";
                        logicTag = "SHERIFF_DEAD_AHALAY_RED_REDIRECT";
                        logs.push("<div style='background:rgba(76,175,80,0.1); padding:8px; margin:5px 0; border-left:3px solid #4caf50;'>🎯 <strong style='color:#4caf50;'>СМЕНА ПРОВЕРКИ:</strong> Ахалай перенаправил стрельбу на Красную проверку <strong>" + rawTarget + "</strong>!</div>");
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: rawTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    } else {
                        // Ахалай НЕ попал в красную проверку → стреляем ближайшую
                        method = "Охота (Шериф мертв - Красная Проверка)";
                        logicTag = "SHERIFF_DEAD_RED_HUNTING";
                        logs.push("<div style='background:rgba(255,152,0,0.1); padding:8px; margin:5px 0; border-left:3px solid #ff9800;'>⚠️ <strong>Шериф мертв.</strong> Ахалай показал <strong>" + rawTarget + "</strong>, но это НЕ Красная проверка. Стреляем в ближайшую Красную проверку!</div>");
                        
                        var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                        
                        if (huntResult !== null) {
                            finalTarget = huntResult;
                        } else {
                            finalTarget = liveRedChecks[0];
                        }
                        logs.push("✅ Стреляем в Красную проверку: <strong style='color:#4caf50;'>" + finalTarget + "</strong>.");
                        
                        return {
                            target: finalTarget,
                            method: method,
                            base: currentBase,
                            gestureVal: gestureVal,
                            rawTargetBeforeMod: rawTarget,
                            logs: logs,
                            logicTag: logicTag
                        };
                    }
                }
            }
            // ═══════════════════════════════════════════════════════════════
            
            // Классическая логика для обычной Косматики
            method = "Ахалай (Динамика)"; 
            logicTag = "DYNAMICS_SIMPLE";
            
            var rawTarget = getAhalayRawTarget(currentBase, state.donSeat, state.donAction, state.donDigitVal, logs);
            var badgeSafety = (state.donAction === 'badge' && !isAhalayMode());
            var isBadgeProtected = badgeSafety && (
                state.blackTeam.includes(rawTarget) ||
                state.checkedBlacks.includes(rawTarget) ||
                (state.nightNum >= 3 && state.sheriffSeat === rawTarget)
            );
            
            // Проверка мертвости цели (ночью или днём)
            var rawTargetDeadAtNight = state.deadPlayers && state.deadPlayers.includes(rawTarget);
            var rawTargetVotedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(rawTarget);
            var rawTargetIsDead = rawTargetDeadAtNight || rawTargetVotedOutDay;
            
            if (rawTargetIsDead || isBadgeProtected) {
                logicTag = "DYNAMICS_SKIP_DEAD";
                if (rawTargetIsDead) {
                    logs.push('<span class="warning-text">⚠️ Попадание в пустой стул (' + rawTarget + ')!<br>Примечание: промах многовероятен! Ищем следующего живого.</span>');
                } else {
                    logs.push('<span class="warning-text">🛡️ Предохранитель: цель ' + rawTarget + ' защищена для Жетона. Ищем следующего живого.</span>');
                }
                
                if(state.nightNum >= 3) {
                    if (badgeSafety) {
                        logs.push('Правило 3+ ночи: При смещении Шериф и Дон приравниваются к Проверенным Черным (их убить нельзя). Черных для Жетона тоже нельзя.');
                    } else {
                        logs.push('Правило 3+ ночи: При смещении Шериф и Дон приравниваются к Проверенным Черным (их убить нельзя). Обычного своего черного — можно.');
                    }
                }
                
                var candidate = rawTarget;
                for(var i=0; i<15; i++) {
                    candidate++; 
                    if (candidate > 10) candidate = 1;
                    
                    // Проверяем, мертв ли кандидат (ночью или днём)
                    var candidateDeadAtNight = state.deadPlayers && state.deadPlayers.includes(candidate);
                    var candidateVotedOutDay = state.votedOutPlayers && state.votedOutPlayers.includes(candidate);
                    if (candidateDeadAtNight || candidateVotedOutDay) continue;
                    
                    if (badgeSafety && state.blackTeam.includes(candidate)) {
                        logs.push("❌ Игрок " + candidate + " жив, но Черный -> пропускаем.");
                        continue;
                    }
                    if (state.checkedBlacks.includes(candidate)) { 
                        logs.push("❌ Игрок " + candidate + " жив, но Проверенный Черный -> пропускаем."); 
                        logicTag = "DYNAMICS_SKIP_CHECKED"; 
                        continue; 
                    }
                    
                    if (state.nightNum >= 3) {
                        if (state.sheriffSeat === candidate) { 
                            logs.push("❌ Игрок " + candidate + " жив, но Шериф (3+ ночь, смещение) -> пропускаем."); 
                            logicTag = "DYNAMICS_SKIP_SHERIFF"; 
                            continue; 
                        }
                        if (state.donSeat === candidate) {
                             logs.push("❌ Игрок " + candidate + " жив, но Дон (3+ ночь, смещение) -> пропускаем.");
                             logicTag = "DYNAMICS_SKIP_DON";
                             continue;
                        }
                    }
                    
                    break;
                }
                finalTarget = candidate; 
                logs.push("➡️ Смещаемся на игрока: <strong>" + finalTarget + "</strong>.");
            } else {
                // ПРОВЕРКА: Активен ли режим охоты + Неудачная динамика?
                var isBadTarget = false;
                
                // Проверяем цель на "плохие" критерии (Черный/Непроверенный/Проверенный Черный)
                var isBlackTeam = state.blackTeam && state.blackTeam.includes(rawTarget);
                var isCheckedBlack = state.checkedBlacks && state.checkedBlacks.includes(rawTarget);
                var isCheckedRed = state.checkedReds && state.checkedReds.includes(rawTarget);
                var isUnchecked = !isCheckedRed && !isCheckedBlack;
                
                isBadTarget = isBlackTeam || isUnchecked || isCheckedBlack;
                
                if (isRedHuntingMode && !doubleRedCheck && isBadTarget && huntingAnchor !== null) {
                    // Неудачная динамика (только для мертвого шерифа, НЕ для 2 версий) - переходим к охоте
                    logs.push('<span class="warning-text">⚠️ Динамика попала в "плохую" цель (' + rawTarget + '): ' + 
                        (isBlackTeam ? 'Черный' : isCheckedBlack ? 'Проверенный Черный' : 'Непроверенный') + 
                        '!</span>');
                    logs.push('🎯 <strong>Активирован fallback:</strong> Охота на Красную Проверку от якоря ' + huntingAnchor + '.');
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                        logicTag = "RED_HUNTING_FALLBACK";
                    } else {
                        // Если не нашли красную проверку, стреляем по математике (как было)
                        logs.push("⚠️ Красная проверка не найдена. Стреляем по математике как fallback.");
                        finalTarget = rawTarget;
                        logs.push("➡️ Итоговая цель (fallback): <strong>" + finalTarget + "</strong>.");
                    }
                } else if (doubleRedCheck && isRedHuntingMode) {
                    // ═══════════════════════════════════════════════════════════════
                    // УСЛОВИЕ 2: 2 ВЕРСИИ + АХАЛАЙ = ПОЛНЫЙ OVERRIDE
                    // В режиме «2 Версии» Ахалай в Боевой Тайминг полностью
                    // отменяет стрельбу в двухстороннего красного.
                    // Стреляем куда указала математика (активная цифра + ахалай).
                    // ═══════════════════════════════════════════════════════════════
                    finalTarget = rawTarget;
                    logicTag = "DUAL_AHALAY_OVERRIDE";
                    logs.push("<div style='background:rgba(33,150,243,0.1); padding:8px; margin:5px 0; border-left:3px solid #2196f3;'>⚔️ <strong style='color:#2196f3;'>2 ВЕРСИИ + АХАЛАЙ:</strong> Боевой Тайминг! Двухсторонний красный <strong>НЕ стреляется</strong>. Стреляем в цель ахалая: <strong>" + rawTarget + "</strong>.</div>");
                } else {
                    // Обычная логика
                    finalTarget = rawTarget;
                    if (isCheckedRed) {
                        logs.push("🎯 Цель " + rawTarget + " жива и является <strong style='color:#4caf50;'>Проверенным Красным</strong>. Математика сработала!");
                    } else {
                        logs.push("🎯 Цель " + rawTarget + " жива. Стреляем."); 
                    }
                }
            }
        }
    } else {
        // Логика для обычной Статики (Косматика), когда Дон молчит
        method = "Статика";
        logicTag = "STATIC_SIMPLE";
        // Если это не спецрежим, то это просто статика
        if (state.donAction === 'none') {
            // Специальная логика для Ахалая: при пасе Дона стреляем в первого живого красного
            if (isAhalayMode()) {
                // ПРОВЕРКА: Активен ли режим охоты?
                if (isRedHuntingMode && huntingAnchor !== null) {
                    method = "Охота (Поиск Красной Проверки)";
                    logicTag = "RED_HUNTING_MODE";
                    logs.push("🤫 Дон ничего не показал (ПАС). <strong>Режим охоты активен.</strong>");
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                    } else {
                        // Fallback: если не нашли красную проверку, используем старую логику
                        logs.push("⚠️ Красная проверка не найдена. Переход к стандартной логике (первый живой красный).");
                        method = "Пас Дона (Отстрел по столу)";
                        logicTag = "AHALAY_PASS_RED";
                        finalTarget = -1;
                        for (var seat = 1; seat <= 10; seat++) {
                            if (state.deadPlayers.includes(seat)) continue;
                            if (state.blackTeam.includes(seat)) continue;
                            if (state.checkedBlacks.includes(seat)) continue;
                            if (state.nightNum >= 3 && state.sheriffSeat === seat) continue;
                            finalTarget = seat;
                            logs.push("✅ Найден первый живой красный игрок: <strong>" + finalTarget + "</strong>.");
                            break;
                        }
                        if (finalTarget === -1) {
                            logs.push("⚠️ <strong>ОШИБКА:</strong> Не найден ни один подходящий красный игрок! Используем место 1 как fallback.");
                            finalTarget = 1;
                        }
                    }
                } else {
                    // Стандартная логика для Ахалая (без охоты)
                    method = "Пас Дона (Отстрел по столу)";
                    logicTag = "AHALAY_PASS_RED";
                    logs.push("🤫 Дон ничего не показал. <strong>Ахалай:</strong> Отстрел по столу — ищем первого живого красного игрока.");
                    
                    // Ищем первого живого красного игрока, начиная с места 1
                    finalTarget = -1;
                for (var seat = 1; seat <= 10; seat++) {
                    // 1. Проверка: игрок должен быть жив
                    if (state.deadPlayers.includes(seat)) {
                        logs.push("❌ Игрок " + seat + " мертв -> пропускаем.");
                        continue;
                    }
                    
                    // 2. Проверка: игрок должен быть красным (не в черной команде)
                    if (state.blackTeam.includes(seat)) {
                        logs.push("❌ Игрок " + seat + " жив, но черный -> пропускаем.");
                        continue;
                    }
                    
                    // 3. Проверка: игрок не должен быть проверенным черным (дополнительная защита)
                    if (state.checkedBlacks.includes(seat)) {
                        logs.push("❌ Игрок " + seat + " жив, но Проверенный Черный -> пропускаем.");
                        continue;
                    }
                    
                    // 4. Проверка: если ночь 3+, пропускаем шерифа
                    if (state.nightNum >= 3 && state.sheriffSeat === seat) {
                        logs.push("❌ Игрок " + seat + " жив и красный, но Шериф (3+ ночь) -> пропускаем.");
                        continue;
                    }
                    
                    // Все проверки пройдены - это наш целевой игрок
                    finalTarget = seat;
                    logs.push("✅ Найден первый живой красный игрок: <strong>" + finalTarget + "</strong>.");
                    break;
                }
                
                // Если не нашли подходящего игрока (крайне маловероятно, но на всякий случай)
                if (finalTarget === -1) {
                    logs.push("⚠️ <strong>ОШИБКА:</strong> Не найден ни один подходящий красный игрок! Используем место 1 как fallback.");
                    finalTarget = 1;
                }
                } // Закрытие блока else (стандартная логика Ахалая без охоты)
            } else {
                // Стандартная логика статики для не-Ахалая режимов (Косматика, Автомат, Винчестер)
                // ПРОВЕРКА: Активен ли режим охоты?
                if (isRedHuntingMode && huntingAnchor !== null) {
                    method = "Охота (Поиск Красной Проверки)";
                    logicTag = "RED_HUNTING_MODE";
                    logs.push("🤫 Дон ничего не показал (ПАС). <strong>Режим охоты активен.</strong>");
                    
                    var huntResult = findNearestRedCheck(huntingAnchor, state, logs);
                    
                    if (huntResult !== null) {
                        finalTarget = huntResult;
                    } else {
                        // Fallback: если не нашли красную проверку, используем обычную статику
                        logs.push("⚠️ Красная проверка не найдена. Переход к стандартной статике.");
                        var result = getStaticTarget(currentBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                        finalTarget = result.target;
                        logicTag = result.tag;
                    }
                } else {
                    // Стандартная статика (без охоты)
                    logs.push("🤫 Дон ничего не показал. Работает статика.");
                    var result = getStaticTarget(currentBase, state.blackTeam, state.checkedBlacks, state.deadPlayers, state.sheriffSeat, state.nightNum, logs, state.kIndex, state.votedOutPlayers);
                    finalTarget = result.target;
                    logicTag = result.tag;
                }
            }
        }
    }
    
    } // Закрытие блока if (!forceStaticKill) - конец математики режимов
    // ═══════════════════════════════════════════════════════════════
    
    // Определяем gestureVal для возврата
    if (isWinchesterMode()) {
        if (state.donAction === 'hand1') gestureVal = 3;
        else if (state.donAction === 'hand2') gestureVal = 6;
        else if (state.donAction === 'badge') gestureVal = state.donSeat;
        else if (state.donAction === 'digit') gestureVal = state.donDigitVal;
        else gestureVal = 0;
    } else if (isWhoMode()) {
        // Для режима "Кто" gestureVal уже установлен выше в блоке else if
        if (gestureVal === undefined) gestureVal = (state.donAction === 'digit') ? state.donDigitVal : 0;
    } else if (isAhalayMode() || isAutomatchMode()) {
        if (state.donAction === 'badge') gestureVal = state.donSeat;
        else if (state.donAction === 'digit') gestureVal = state.donDigitVal;
        else gestureVal = 0;
    }
    
    return { 
        target: finalTarget, 
        method: method, 
        base: currentBase, 
        gestureVal: gestureVal, 
        rawTargetBeforeMod: (isWinchesterMode() && (state.donAction === 'hand1' || state.donAction === 'hand2')) ? currentBase + gestureVal : currentBase + gestureVal, 
        logs: logs, 
        logicTag: logicTag 
    };
}

function updateStatsUI() {
    setText('st-total', appTotalGames);
    setText('st-correct', appTotalCorrect);
    setText('st-wrong', appTotalWrong);
    setText('st-streak', appStreak);
    
    var drillBadge = getEl('drill-badge');
    var trainerView = getEl('view-trainer');
    
    if (appDrillState.isActive) {
        if(trainerView) trainerView.classList.add('drill-active');
        if(drillBadge) {
            drillBadge.style.display = 'block';
            drillBadge.innerHTML = '🎯 Работа над ошибками: осталось ' + appDrillState.tasksLeft;
        }
    } else if (appDrillFilter.active) {
        if(trainerView) trainerView.classList.add('drill-active');
        if(drillBadge) {
            drillBadge.style.display = 'block';
            drillBadge.innerHTML = '🧩 Режим Дрилла: ' + (appDrillFilterLabel || 'Активен');
        }
    } else {
        if(trainerView) trainerView.classList.remove('drill-active');
        if(drillBadge) drillBadge.style.display = 'none';
    }

    var bonusInd = getEl('bonus-indicator');
    if(bonusInd) {
        bonusInd.style.display = 'none'; 
        if (
            appGameMode === 'hard' || appGameMode === 'nightmare' || appGameMode === 'impossible' ||
            appGameMode === 'automatch_hard' || appGameMode === 'automatch_nightmare' || appGameMode === 'automatch_impossible' ||
            appGameMode === 'ahalay_hard' || appGameMode === 'ahalay_nightmare' || appGameMode === 'ahalay_impossible' ||
            appGameMode === 'winchester_impossible'
        ) {
             if (appHasTimeBonus) {
                 bonusInd.style.display = 'inline-block';
                 bonusInd.innerText = "⚡ +20 сек АКТИВЕН";
             } else if (appGameMode === 'hard' || appGameMode === 'automatch_hard') {
                 bonusInd.style.display = 'inline-block';
                 bonusInd.innerText = "Hard: " + appStreakHard + "/5";
             } else if (appGameMode === 'ahalay_hard') {
                 bonusInd.style.display = 'inline-block';
                 bonusInd.innerText = "Hard: " + appAhalayStreakHard + "/5";
             } else if (appGameMode === 'winchester_hard') {
                 bonusInd.style.display = 'inline-block';
                 bonusInd.innerText = "Hard: " + appWinchesterStreakHard + "/5";
             } else if (appGameMode === 'nightmare' || appGameMode === 'automatch_nightmare') {
                 bonusInd.style.display = 'inline-block';
                 bonusInd.innerText = "NM: " + appStreakNightmare + "/2";
             } else if (appGameMode === 'ahalay_nightmare') {
                 bonusInd.style.display = 'inline-block';
                 bonusInd.innerText = "NM: " + appAhalayStreakNightmare + "/2";
             } else if (appGameMode === 'winchester_nightmare') {
                 bonusInd.style.display = 'inline-block';
                 bonusInd.innerText = "NM: " + appWinchesterStreakNightmare + "/2";
             }
        }
    }
}

function launchImpossibleExamOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'impossible-exam-overlay';
    overlay.className = 'container';
    overlay.style.position = 'fixed'; overlay.style.top = '50px'; overlay.style.zIndex = '9999';
    overlay.innerHTML = '<h2>❌ ОШИБКА! РЕЖИМ ЭКЗАМЕНА</h2><div id="imp-exam-content"></div>';
    document.body.appendChild(overlay);
    showEl('view-trainer', false);
    appImpossibleState.isActive = true;
    appImpossibleState.step = 0;
    renderImpossibleExamStep(getEl('imp-exam-content'));
}

function setModeSelectorState(enabled) {
    var sel = getEl('mode-selector');
    var msg = getEl('mode-lock-msg');
    if (sel) {
        sel.disabled = !enabled;
        sel.style.opacity = enabled ? '1' : '0.5';
        sel.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
    if (msg) msg.style.display = enabled ? 'none' : 'block';
}

function startImpossibleTimer() {
    // Если таймер уже запущен и работает, НЕ перезапускаем его
    if (impossibleTimer) {
        // Просто обновляем отображение времени из текущего состояния
        updateImpossibleTimerDisplay();
        return;
    }
    
    // Не блокируем смену режима в Impossible
    var timerBar = getEl('timer-bar');
    showEl('timer-bar-container', true);
    
    // Если таймер еще не запущен или время вышло, сбрасываем счетчик
    if (!appImpossibleState.isActive || appImpossibleState.timeRemaining <= 0) {
        appImpossibleState.tasksCompleted = 0;
        appImpossibleState.timeRemaining = 60;
        appImpossibleState.isActive = true;
    }
    
    // Убеждаемся, что время не отрицательное и не больше 60
    if (appImpossibleState.timeRemaining > 60) appImpossibleState.timeRemaining = 60;
    if (appImpossibleState.timeRemaining < 0) appImpossibleState.timeRemaining = 0;
    
    var duration = appImpossibleState.timeRemaining; // Используем оставшееся время
    
    // Убираем отображение таймера в правом верхнем углу
    var timerDisplay = getEl('timer-display');
    if (timerDisplay) {
        timerDisplay.style.display = 'none'; // Скрываем таймер
    }
    
    // Обновляем отображение времени только в сообщениях о результате
    updateImpossibleTimerDisplay();
    
    // Обновляем прогресс-бар
    if(timerBar) {
        var percentRemaining = (appImpossibleState.timeRemaining / 60) * 100;
        timerBar.style.width = percentRemaining + '%';
        timerBar.style.transition = 'none';
        void timerBar.offsetWidth;
        timerBar.style.transition = 'width ' + duration + 's linear';
        timerBar.style.width = '0%';
    }
    
    // Запускаем интервал обновления времени (только один раз!)
    impossibleTimer = setInterval(function() {
        appImpossibleState.timeRemaining--;
        
        // Обновляем все элементы отображения времени
        updateImpossibleTimerDisplay();
        
        if (appImpossibleState.timeRemaining <= 0) {
            clearInterval(impossibleTimer);
            impossibleTimer = null;
            appImpossibleState.isActive = false;
            setModeSelectorState(true); 
            addClass('trainer-info-panel', 'content-hidden');
            showEl('timer-bar-container', false); // Скрываем таймер
            showImpossibleResults();
        }
    }, 1000);
}

// Функция для обновления отображения времени во всех местах
function updateImpossibleTimerDisplay() {
    // Элементы impossible-time-display и impossible-time-display-error больше не используются
    // Время больше не отображается в сообщениях о результате
}

function showImpossibleResults() {
    if (impossibleTimer) {
        clearInterval(impossibleTimer);
        impossibleTimer = null;
    }
    appImpossibleState.isActive = false;
    appIsRoundActive = false;
    showEl('skip-btn', false);
    removeClass('trainer-info-panel', 'content-hidden');
    showEl('timer-bar-container', false); // Скрываем таймер
    
    var resultBox = getEl('trainer-result');
    if (resultBox) {
        showEl('trainer-result', true);
        resultBox.className = 'result-box correct';
        resultBox.style.borderColor = "#00bcd4";
        resultBox.innerHTML = '<h3>⏱️ Время вышло!</h3><p style="font-size: 1.2em; margin: 20px 0;">Выполнено заданий: <strong style="color: var(--impossible-color); font-size: 1.5em;">' + appImpossibleState.tasksCompleted + '</strong></p>';
        var nextBtn = document.createElement('button');
        nextBtn.className = 'next-btn-big';
        nextBtn.innerText = 'Новая попытка ➡️';
        nextBtn.onclick = function() {
            appImpossibleState.tasksCompleted = 0;
            appImpossibleState.timeRemaining = 60;
            appImpossibleState.isActive = false; // Сбрасываем состояние для нового запуска
            runSkipTask();
        };
        resultBox.appendChild(nextBtn);
    }
    updateStatsUI();
}

function runSkipTask() {
    // Для Nightmare режимов блокируем пропуск
    if (appNightmareState.isActive) return;
    // Для Impossible режимов разрешаем переход к следующей задаче (таймер продолжает работать)
    appImpossibleState.pausedScenario = null;
    // Убеждаемся, что раунд не активен для Impossible режимов
    if (appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'mantis_impossible' || appGameMode === 'red_impossible' || appGameMode === 'black_impossible' || appGameMode === 'redblack_impossible') {
        appIsRoundActive = false;
    } 

    if (appIsRoundActive) {
        appTotalGames++; appTotalSkipped++; appStreak = 0; 
        if (appGameMode === 'hard') appStreakHard = 0; 
        if (appGameMode === 'nightmare' || appGameMode === 'automatch_nightmare' || appGameMode === 'ahalay_nightmare' || appGameMode === 'winchester_nightmare') appStreakNightmare = 0;
        
        // Сброс стрика для режимов Автомата при пропуске
        if (appGameMode === 'automatch_newbie') appAutomatchStreakNewbie = 0;
        else if (appGameMode === 'automatch_easy') appAutomatchStreakEasy = 0;
        else if (appGameMode === 'automatch_hard') appAutomatchStreakHard = 0;
        else if (appGameMode === 'automatch_nightmare') appAutomatchStreakNightmare = 0;
        // Сброс стрика для режимов Косматики при пропуске
        else if (appGameMode === 'newbie') appKosmatikaStreakNewbie = 0;
        else if (appGameMode === 'easy') appKosmatikaStreakEasy = 0;
        else if (appGameMode === 'hard') appKosmatikaStreakHard = 0;
        else if (appGameMode === 'nightmare') appKosmatikaStreakNightmare = 0;
        // Сброс стрика для режимов Ахалая при пропуске
        else if (appGameMode === 'ahalay_newbie') appAhalayStreakNewbie = 0;
        else if (appGameMode === 'ahalay_easy') appAhalayStreakEasy = 0;
        else if (appGameMode === 'ahalay_hard') appAhalayStreakHard = 0;
        else if (appGameMode === 'ahalay_nightmare') appAhalayStreakNightmare = 0;
        // Сброс стрика для режимов Винчестера при пропуске
        else if (appGameMode === 'winchester_newbie') appWinchesterStreakNewbie = 0;
        else if (appGameMode === 'winchester_easy') appWinchesterStreakEasy = 0;
        else if (appGameMode === 'winchester_hard') appWinchesterStreakHard = 0;
        else if (appGameMode === 'winchester_nightmare') appWinchesterStreakNightmare = 0;
        
        appWrongStreak = 0; appSkippedStreak++;
        updateTableVisualEffects(); 
        updateStatsUI();
    }
    
    // Для Impossible режимов: если таймер закончился, сбрасываем состояние
    if ((appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'mantis_impossible') && appImpossibleState.timeRemaining <= 0) {
        appImpossibleState.isActive = false;
        appImpossibleState.tasksCompleted = 0;
        appImpossibleState.timeRemaining = 60;
    }
    
    generateRandomScenario();
}

// --- НОВАЯ ФУНКЦИЯ: Показывает роли только после победы ---
function revealRoles() {
    var data = appCurrentScenarioData;
    if (!data) return;

    for (var i = 1; i <= 10; i++) {
        var seat = document.getElementById('seat-' + i);
        if (!seat) continue;

        if (data.blacks.includes(i)) {
            if (i === data.don) seat.classList.add('don');
            else seat.classList.add('mafia');
        }
        if (data.sheriff === i && data.night >= 2) seat.classList.add('sheriff');
        if (data.checkedB && data.checkedB.includes(i)) seat.classList.add('checked-black');
        
        // Иконка Росомахи
        if (data.wolverineSeat === i) {
            seat.classList.add('wolverine-player');
        }
    }
}

function checkTrainerAnswer(selectedSeat) {
    if (!appCurrentSolution || !appIsRoundActive) return;
    
    appImpossibleState.pausedScenario = null; 
    if (impossibleTimer) clearTimeout(impossibleTimer);
    showEl('timer-bar-container', false);
    
    if (appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'who_impossible' || appGameMode === 'mantis_impossible' || appGameMode === 'red_impossible' || appGameMode === 'black_impossible' || appGameMode === 'redblack_impossible' || appGameMode === 'bazooka_impossible') { 
        setModeSelectorState(true); 
    }
    
    var isCorrect = (Number(selectedSeat) === Number(appCurrentSolution.target));
    var resultBox = getEl('trainer-result');
    var selectedSeatEl = getEl('seat-' + selectedSeat);

    // --- ЛОГИКА NIGHTMARE MODE ---
    if (appGameMode === 'nightmare' || appGameMode === 'automatch_nightmare' || appGameMode === 'ahalay_nightmare' || appGameMode === 'who_nightmare' || appGameMode === 'mantis_nightmare' || appGameMode === 'bazooka_nightmare') {
        appIsRoundActive = false; 
        showEl('trainer-result', true);
        
        if (isCorrect) {
            // ПОБЕДА
            appTotalGames++; appStreak++; appTotalCorrect++; checkAchievements(true); saveStats(); updateTableVisualEffects();
            
            // Проверка стрика для режима Nightmare (Автомат и Косматика)
            var shouldShowLevelUp = false;
            var isSecondQuestion = false;
            var currentStreak = 0;
            
            if (appGameMode === 'automatch_nightmare') {
                appAutomatchStreakNightmare++;
                currentStreak = appAutomatchStreakNightmare;
                if (appAutomatchStreakNightmare === 10 || appAutomatchStreakNightmare === 20) {
                    shouldShowLevelUp = true;
                    if (appAutomatchStreakNightmare === 20) isSecondQuestion = true;
                }
            } else if (appGameMode === 'nightmare') {
                appKosmatikaStreakNightmare++;
                currentStreak = appKosmatikaStreakNightmare;
                if (appKosmatikaStreakNightmare === 10 || appKosmatikaStreakNightmare === 20) {
                    shouldShowLevelUp = true;
                    if (appKosmatikaStreakNightmare === 20) isSecondQuestion = true;
                }
            } else if (appGameMode === 'ahalay_nightmare') {
                appAhalayStreakNightmare++;
                currentStreak = appAhalayStreakNightmare;
                if (appAhalayStreakNightmare === 10 || appAhalayStreakNightmare === 20) {
                    shouldShowLevelUp = true;
                    if (appAhalayStreakNightmare === 20) isSecondQuestion = true;
                }
            } else if (appGameMode === 'winchester_nightmare') {
                appWinchesterStreakNightmare++;
                currentStreak = appWinchesterStreakNightmare;
                if (appWinchesterStreakNightmare === 10 || appWinchesterStreakNightmare === 20) {
                    shouldShowLevelUp = true;
                    if (appWinchesterStreakNightmare === 20) isSecondQuestion = true;
                }
            } else if (appGameMode === 'mantis_nightmare') {
                appMantisStreakNightmare++;
                currentStreak = appMantisStreakNightmare;
                if (appMantisStreakNightmare === 10 || appMantisStreakNightmare === 20) {
                    shouldShowLevelUp = true;
                    if (appMantisStreakNightmare === 20) isSecondQuestion = true;
                }
            } else if (appGameMode === 'bazooka_nightmare') {
                appBazookaStreakNightmare++;
                currentStreak = appBazookaStreakNightmare;
                if (appBazookaStreakNightmare === 10 || appBazookaStreakNightmare === 20) {
                    shouldShowLevelUp = true;
                    if (appBazookaStreakNightmare === 20) isSecondQuestion = true;
                }
            }
            
            // 1. Показываем роли (делаем цветными)
            revealRoles();
            
            // 2. Подсвечиваем выбор
            if(selectedSeatEl) selectedSeatEl.classList.add('correct-choice');
            
            if(resultBox) { resultBox.className = 'result-box correct'; resultBox.style.borderColor = "#388e3c"; resultBox.innerHTML = '<h3>✅ ВЕРНО!</h3>'; }
            
            // Показываем модальное окно перехода на следующий уровень, если нужно
            if (shouldShowLevelUp) {
                showLevelUpModal(currentStreak, isSecondQuestion);
            } else {
                var nextBtn = document.createElement('button'); nextBtn.className = 'next-btn-big'; nextBtn.innerText = 'Следующая задача ➡️'; 
                nextBtn.onclick = function() { 
                    if (appGameMode === 'nightmare' || appGameMode === 'automatch_nightmare' || appGameMode === 'ahalay_nightmare' || appGameMode === 'winchester_nightmare' || appGameMode === 'mantis_nightmare' || appGameMode === 'bazooka_nightmare') {
                        appNightmareState.isActive = false;
                    }
                    runSkipTask(); 
                }; 
                if(resultBox) resultBox.appendChild(nextBtn);
            }
            showEl('skip-btn', false);
        } else {
            // ОШИБКА
            // Сброс стрика при ошибке для режима Nightmare (Автомат, Косматика, Ахалай и Богомол)
            if (appGameMode === 'automatch_nightmare') appAutomatchStreakNightmare = 0;
            else if (appGameMode === 'nightmare') appKosmatikaStreakNightmare = 0;
            else if (appGameMode === 'ahalay_nightmare') {
                appAhalayStreakNightmare = 0;
            } else if (appGameMode === 'mantis_nightmare') {
                appMantisStreakNightmare = 0;
            } else if (appGameMode === 'bazooka_nightmare') {
                appBazookaStreakNightmare = 0;
            }
            
            appTotalGames++; appStreak = 0; appTotalWrong++; updateTableVisualEffects();
            
            if(resultBox) resultBox.className = 'result-box wrong';
            
            // 3. Скрываем кружочки (Таблицу)
            var tableDiv = getEl('trainer-table');
            if(tableDiv) tableDiv.style.display = 'none';

            appNightmareState.isActive = true; 
            appNightmareState.step = 0; 
            appNightmareState.savedScenario = JSON.parse(JSON.stringify(appCurrentScenarioData)); 
            
            showEl('skip-btn', false);
            if(resultBox) renderNightmareExam(resultBox);
        }
        updateStatsUI(); 
        return;
    }

    // --- ЛОГИКА ОСТАЛЬНЫХ РЕЖИМОВ ---
    if (appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'mantis_impossible' || appGameMode === 'red_impossible' || appGameMode === 'black_impossible' || appGameMode === 'redblack_impossible' || appGameMode === 'bazooka_impossible') {
        appIsRoundActive = false;
        if (isCorrect) {
            appTotalGames++; appStreak++; appTotalCorrect++; 
            appImpossibleState.tasksCompleted++; // Увеличиваем счетчик выполненных заданий
            checkAchievements(true); saveStats(); updateTableVisualEffects();
            
            revealRoles(); // <--- Показываем роли при победе в Impossible
            
            if(resultBox) {
                showEl('trainer-result', true);
                resultBox.className = 'result-box correct'; resultBox.style.borderColor = "#00bcd4";
                if(selectedSeatEl) selectedSeatEl.classList.add('correct-choice');
                var timeInfo = '<p>Время тикает, давай дальше!</p>';
                resultBox.innerHTML = '<h3>☢️ ИМПОССИБЛ ВЗЯТ!</h3><p>Выполнено заданий: <strong>' + appImpossibleState.tasksCompleted + '</strong></p>' + timeInfo;
                var nextBtn = document.createElement('button'); 
                nextBtn.className = 'next-btn-big'; 
                nextBtn.innerText = 'Следующая задача ➡️'; 
                nextBtn.style.pointerEvents = 'auto';
                nextBtn.style.cursor = 'pointer';
                nextBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    runSkipTask();
                };
                resultBox.appendChild(nextBtn);
                
                // Обновляем отображение времени каждую секунду
                var timeDisplayEl = getEl('impossible-time-display');
                if (timeDisplayEl && impossibleTimer) {
                    var timeUpdateInterval = setInterval(function() {
                        if (timeDisplayEl && appImpossibleState.timeRemaining > 0) {
                            timeDisplayEl.textContent = appImpossibleState.timeRemaining + ' сек';
                        } else {
                            clearInterval(timeUpdateInterval);
                        }
                    }, 1000);
                }
            }
            showEl('skip-btn', false);
            removeClass('trainer-info-panel', 'content-hidden');
            // Показываем таймер даже после правильного ответа
            showEl('timer-bar-container', true); 
        } else {
            appTotalGames++; appStreak = 0; appTotalWrong++; updateTableVisualEffects();
            if(resultBox) {
                showEl('trainer-result', true);
                resultBox.className = 'result-box wrong';
                var timeInfo = '<p>Время тикает, давай дальше!</p>';
                resultBox.innerHTML = '<h3>❌ Ошибка</h3><p>Выполнено заданий: <strong>' + appImpossibleState.tasksCompleted + '</strong></p>' + timeInfo;
                var nextBtn = document.createElement('button'); 
                nextBtn.className = 'next-btn-big'; 
                nextBtn.innerText = 'Следующая задача ➡️'; 
                nextBtn.style.pointerEvents = 'auto';
                nextBtn.style.cursor = 'pointer';
                nextBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    runSkipTask();
                };
                resultBox.appendChild(nextBtn);
                // Время будет обновляться основным таймером
            }
            showEl('skip-btn', false);
            removeClass('trainer-info-panel', 'content-hidden');
            // Показываем таймер даже после ошибки
            showEl('timer-bar-container', true);
        }
        updateStatsUI(); return;
    }

    appIsRoundActive = false;
    showEl('skip-btn', false);
    appTotalGames++;
    showEl('trainer-result', true);
    var logsHtml = appCurrentSolution.logs.map(function(l) { return '<div class="expl-step">' + l + '</div>'; }).join('');

    if (isCorrect) {
        appStreak++; appTotalCorrect++; checkAchievements(true); saveStats(); updateTableVisualEffects();
        
        // Проверка стрика для режимов Автомата и Косматики (начиная с Easy Mode, не Newbie)
        var shouldShowLevelUp = false;
        var isSecondQuestion = false;
        var currentStreak = 0;
        
        // Режимы Автомата
        if (appGameMode === 'automatch_newbie') {
            appAutomatchStreakNewbie++;
            currentStreak = appAutomatchStreakNewbie;
            if (appAutomatchStreakNewbie === 10 || appAutomatchStreakNewbie === 20) {
                shouldShowLevelUp = true;
                if (appAutomatchStreakNewbie === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'automatch_easy') {
            appAutomatchStreakEasy++;
            currentStreak = appAutomatchStreakEasy;
            if (appAutomatchStreakEasy === 10 || appAutomatchStreakEasy === 20) {
                shouldShowLevelUp = true;
                if (appAutomatchStreakEasy === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'automatch_hard') {
            appAutomatchStreakHard++;
            currentStreak = appAutomatchStreakHard;
            if (appAutomatchStreakHard === 10 || appAutomatchStreakHard === 20) {
                shouldShowLevelUp = true;
                if (appAutomatchStreakHard === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'automatch_nightmare') {
            appAutomatchStreakNightmare++;
            currentStreak = appAutomatchStreakNightmare;
            if (appAutomatchStreakNightmare === 10 || appAutomatchStreakNightmare === 20) {
                shouldShowLevelUp = true;
                if (appAutomatchStreakNightmare === 20) isSecondQuestion = true;
            }
        }
        // Режимы Косматики (начиная с Easy)
        else if (appGameMode === 'newbie') {
            appKosmatikaStreakNewbie++;
            currentStreak = appKosmatikaStreakNewbie;
            if (appKosmatikaStreakNewbie === 10 || appKosmatikaStreakNewbie === 20) {
                shouldShowLevelUp = true;
                if (appKosmatikaStreakNewbie === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'easy') {
            appKosmatikaStreakEasy++;
            currentStreak = appKosmatikaStreakEasy;
            if (appKosmatikaStreakEasy === 10 || appKosmatikaStreakEasy === 20) {
                shouldShowLevelUp = true;
                if (appKosmatikaStreakEasy === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'hard') {
            appKosmatikaStreakHard++;
            currentStreak = appKosmatikaStreakHard;
            if (appKosmatikaStreakHard === 10 || appKosmatikaStreakHard === 20) {
                shouldShowLevelUp = true;
                if (appKosmatikaStreakHard === 20) isSecondQuestion = true;
            }
        }
        // Режимы Ахалая (начиная с Newbie)
        else if (appGameMode === 'ahalay_newbie') {
            appAhalayStreakNewbie++;
            currentStreak = appAhalayStreakNewbie;
            if (appAhalayStreakNewbie === 10 || appAhalayStreakNewbie === 20) {
                shouldShowLevelUp = true;
                if (appAhalayStreakNewbie === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'ahalay_easy') {
            appAhalayStreakEasy++;
            currentStreak = appAhalayStreakEasy;
            if (appAhalayStreakEasy === 10 || appAhalayStreakEasy === 20) {
                shouldShowLevelUp = true;
                if (appAhalayStreakEasy === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'ahalay_hard') {
            appAhalayStreakHard++;
            currentStreak = appAhalayStreakHard;
            if (appAhalayStreakHard === 10 || appAhalayStreakHard === 20) {
                shouldShowLevelUp = true;
                if (appAhalayStreakHard === 20) isSecondQuestion = true;
            }
        }
        
        // В Ахалае цикл ночей всегда идет 1, 2, 3, 1, 2, 3... независимо от попаданий/промахов
        // Не нужно обновлять цикл при попадании
        // Режимы Винчестера (начиная с Newbie)
        else if (appGameMode === 'winchester_newbie') {
            appWinchesterStreakNewbie++;
            currentStreak = appWinchesterStreakNewbie;
            if (appWinchesterStreakNewbie === 10 || appWinchesterStreakNewbie === 20) {
                shouldShowLevelUp = true;
                if (appWinchesterStreakNewbie === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'winchester_easy') {
            appWinchesterStreakEasy++;
            currentStreak = appWinchesterStreakEasy;
            if (appWinchesterStreakEasy === 10 || appWinchesterStreakEasy === 20) {
                shouldShowLevelUp = true;
                if (appWinchesterStreakEasy === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'winchester_hard') {
            appWinchesterStreakHard++;
            currentStreak = appWinchesterStreakHard;
            if (appWinchesterStreakHard === 10 || appWinchesterStreakHard === 20) {
                shouldShowLevelUp = true;
                if (appWinchesterStreakHard === 20) isSecondQuestion = true;
            }
        }
        // Режимы Богомола (начиная с Easy)
        else if (appGameMode === 'mantis_easy') {
            appMantisStreakEasy++;
            currentStreak = appMantisStreakEasy;
            if (appMantisStreakEasy === 10 || appMantisStreakEasy === 20) {
                shouldShowLevelUp = true;
                if (appMantisStreakEasy === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'mantis_hard') {
            appMantisStreakHard++;
            currentStreak = appMantisStreakHard;
            if (appMantisStreakHard === 10 || appMantisStreakHard === 20) {
                shouldShowLevelUp = true;
                if (appMantisStreakHard === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'mantis_nightmare') {
            appMantisStreakNightmare++;
            currentStreak = appMantisStreakNightmare;
            if (appMantisStreakNightmare === 10 || appMantisStreakNightmare === 20) {
                shouldShowLevelUp = true;
                if (appMantisStreakNightmare === 20) isSecondQuestion = true;
            }
        }
        // Режимы Кто (начиная с Easy)
        else if (appGameMode === 'who_easy') {
            appWhoStreakEasy++;
            currentStreak = appWhoStreakEasy;
            if (appWhoStreakEasy === 10 || appWhoStreakEasy === 20) {
                shouldShowLevelUp = true;
                if (appWhoStreakEasy === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'who_hard') {
            appWhoStreakHard++;
            currentStreak = appWhoStreakHard;
            if (appWhoStreakHard === 10 || appWhoStreakHard === 20) {
                shouldShowLevelUp = true;
                if (appWhoStreakHard === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'who_nightmare') {
            appWhoStreakNightmare++;
            currentStreak = appWhoStreakNightmare;
            if (appWhoStreakNightmare === 10 || appWhoStreakNightmare === 20) {
                shouldShowLevelUp = true;
                if (appWhoStreakNightmare === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'nightmare') {
            appKosmatikaStreakNightmare++;
            currentStreak = appKosmatikaStreakNightmare;
            if (appKosmatikaStreakNightmare === 10 || appKosmatikaStreakNightmare === 20) {
                shouldShowLevelUp = true;
                if (appKosmatikaStreakNightmare === 20) isSecondQuestion = true;
            }
        }
        // Режимы Базуки
        else if (appGameMode === 'bazooka_newbie') {
            appBazookaStreakNewbie++;
            currentStreak = appBazookaStreakNewbie;
            if (appBazookaStreakNewbie === 10 || appBazookaStreakNewbie === 20) {
                shouldShowLevelUp = true;
                if (appBazookaStreakNewbie === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'bazooka_easy') {
            appBazookaStreakEasy++;
            currentStreak = appBazookaStreakEasy;
            if (appBazookaStreakEasy === 10 || appBazookaStreakEasy === 20) {
                shouldShowLevelUp = true;
                if (appBazookaStreakEasy === 20) isSecondQuestion = true;
            }
        } else if (appGameMode === 'bazooka_hard') {
            appBazookaStreakHard++;
            currentStreak = appBazookaStreakHard;
            if (appBazookaStreakHard === 10 || appBazookaStreakHard === 20) {
                shouldShowLevelUp = true;
                if (appBazookaStreakHard === 20) isSecondQuestion = true;
            }
        }
        
        revealRoles(); // <--- Показываем роли при победе
        if(resultBox) {
            resultBox.className = 'result-box correct';
            resultBox.innerHTML = '<h3>✅ Верно!</h3>' + logsHtml;
        }
        if(selectedSeatEl) selectedSeatEl.classList.add('correct-choice');
        
        // Показываем модальное окно перехода на следующий уровень, если нужно
        if (shouldShowLevelUp) {
            showLevelUpModal(currentStreak, isSecondQuestion);
        } else {
            // Обычная кнопка "Следующая задача"
            var btnText = 'Следующая задача ➡️';
            var nextBtn = document.createElement('button'); nextBtn.className = 'next-btn-big';
            nextBtn.innerHTML = btnText;
            nextBtn.onclick = runSkipTask;
            if(resultBox) resultBox.appendChild(nextBtn);
        }
    } else {
        // Сброс стрика при ошибке для режимов Автомата
        if (appGameMode === 'automatch_newbie') appAutomatchStreakNewbie = 0;
        else if (appGameMode === 'automatch_easy') appAutomatchStreakEasy = 0;
        else if (appGameMode === 'automatch_hard') appAutomatchStreakHard = 0;
        else if (appGameMode === 'automatch_nightmare') appAutomatchStreakNightmare = 0;
        // Сброс стрика при ошибке для режимов Косматики
        else if (appGameMode === 'newbie') appKosmatikaStreakNewbie = 0;
        else if (appGameMode === 'easy') appKosmatikaStreakEasy = 0;
        else if (appGameMode === 'hard') appKosmatikaStreakHard = 0;
        else if (appGameMode === 'nightmare') appKosmatikaStreakNightmare = 0;
        // Сброс стрика при ошибке для режимов Ахалая
        else if (appGameMode === 'ahalay_newbie') appAhalayStreakNewbie = 0;
        else if (appGameMode === 'ahalay_easy') appAhalayStreakEasy = 0;
        else if (appGameMode === 'ahalay_hard') appAhalayStreakHard = 0;
        else if (appGameMode === 'ahalay_nightmare') appAhalayStreakNightmare = 0;
        
        // В Ахалае цикл ночей всегда идет 1, 2, 3, 1, 2, 3... независимо от попаданий/промахов
        // Не нужно восстанавливать цикл при промахе
        
        // Сброс стрика при ошибке для режимов Винчестера
        else if (appGameMode === 'winchester_newbie') appWinchesterStreakNewbie = 0;
        else if (appGameMode === 'winchester_easy') appWinchesterStreakEasy = 0;
        else if (appGameMode === 'winchester_hard') appWinchesterStreakHard = 0;
        else if (appGameMode === 'winchester_nightmare') appWinchesterStreakNightmare = 0;
        // Сброс стрика при ошибке для режимов Богомола
        else if (appGameMode === 'mantis_easy') appMantisStreakEasy = 0;
        else if (appGameMode === 'mantis_hard') appMantisStreakHard = 0;
        else if (appGameMode === 'mantis_nightmare') appMantisStreakNightmare = 0;
        // Сброс стрика при ошибке для режимов Кто
        else if (appGameMode === 'who_easy') appWhoStreakEasy = 0;
        else if (appGameMode === 'who_hard') appWhoStreakHard = 0;
        else if (appGameMode === 'who_nightmare') appWhoStreakNightmare = 0;
        // Сброс стрика при ошибке для режимов Базуки
        else if (appGameMode === 'bazooka_newbie') appBazookaStreakNewbie = 0;
        else if (appGameMode === 'bazooka_easy') appBazookaStreakEasy = 0;
        else if (appGameMode === 'bazooka_hard') appBazookaStreakHard = 0;
        else if (appGameMode === 'bazooka_nightmare') appBazookaStreakNightmare = 0;
        
        revealRoles(); // <--- Показываем роли при ошибке, чтобы понять, где ошиблись
        appStreak = 0; appTotalWrong++; updateTableVisualEffects();
        if(resultBox) resultBox.className = 'result-box wrong';
        if(selectedSeatEl) selectedSeatEl.classList.add('wrong-choice');
        var correctEl = getEl('seat-' + appCurrentSolution.target);
        if(correctEl) correctEl.classList.add('correct-choice');
        
        var errContent = '<h3>❌ Ошибка. Выстрел в ' + selectedSeat + '.</h3>';
        errContent += '<p>Правильный ответ: <strong>' + appCurrentSolution.target + '</strong></p>';
        errContent += '<button class="read-rules-btn" onclick="openRules()">📖 ПОЧЕМУ ТАК? ЧИТАТЬ ПРАВИЛА</button>';
        errContent += logsHtml;
        if(resultBox) resultBox.innerHTML = errContent;
        
        var btnText = 'Попробовать снова (Новая задача)';
        var nextBtn = document.createElement('button'); nextBtn.className = 'next-btn-big';
        nextBtn.style.background = '#444';
        nextBtn.innerHTML = btnText;
        nextBtn.onclick = runSkipTask;
        if(resultBox) resultBox.appendChild(nextBtn);
    }
    
    updateStatsUI();
}

// --- Теоретические вопросы Базуки ---
function showBazookaTheoryQuestion() {
    var pool = appBazookaTheoryPool;
    var idx = Math.floor(Math.random() * pool.length);
    var q = pool[idx];
    appBazookaTheoryMode = true;
    appBazookaTheoryAnswer = q.ans;
    appIsRoundActive = false;
    
    // Скрываем таблицу и сценарий, показываем блок результата как вопрос
    var tableDiv = getEl('trainer-table');
    if (tableDiv) tableDiv.style.display = 'none';
    
    showEl('skip-btn', true);
    showEl('trainer-result', true);
    var resultBox = getEl('trainer-result');
    if (!resultBox) return;
    
    resultBox.className = 'result-box';
    resultBox.style.borderColor = '#ff9800';
    
    var html = '<h3>📚 Вопрос по теории</h3>';
    html += '<p style="font-size:1.1em; margin: 15px 0;">' + q.q + '</p>';
    html += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">';
    for (var i = 0; i < q.opts.length; i++) {
        html += '<button class="next-btn-big" style="background:#37474f; text-align:left; padding:10px 15px;" data-theory-idx="' + i + '" onclick="checkBazookaTheoryAnswer(' + i + ')">' + (i + 1) + '. ' + q.opts[i] + '</button>';
    }
    html += '</div>';
    resultBox.innerHTML = html;
    
    // Обновляем панель информации
    var lbl = getEl('lbl-kosm');
    if (lbl) lbl.innerText = 'Базука:';
    setText('t-kosm-disp', '📚 Теоретический вопрос');
    setText('t-night-disp', '—');
    setText('t-action-disp', '—');
    setText('t-dead-disp', '—');
}

function checkBazookaTheoryAnswer(selected) {
    if (!appBazookaTheoryMode) return;
    appBazookaTheoryMode = false;
    
    var resultBox = getEl('trainer-result');
    if (!resultBox) return;
    
    var buttons = resultBox.querySelectorAll('[data-theory-idx]');
    
    if (selected === appBazookaTheoryAnswer) {
        // Правильно
        appTotalGames++; appTotalCorrect++; appStreak++; 
        checkAchievements(true); saveStats(); updateTableVisualEffects();
        
        // Подсветка правильного ответа
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
            if (parseInt(buttons[i].getAttribute('data-theory-idx')) === selected) {
                buttons[i].style.background = '#388e3c';
                buttons[i].style.color = '#fff';
            }
        }
        
        var successHtml = '<h3>✅ Верно!</h3>';
        successHtml += '<button class="next-btn-big" onclick="runSkipTask()">Следующая задача ➡️</button>';
        
        // Сохраняем текст вопроса и добавляем результат
        var qText = resultBox.querySelector('p');
        resultBox.innerHTML = successHtml;
        resultBox.className = 'result-box correct';
        resultBox.style.borderColor = '#388e3c';
    } else {
        // Неправильно
        appTotalGames++; appTotalWrong++; appStreak = 0;
        updateTableVisualEffects();
        
        // Подсветка
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
            var bIdx = parseInt(buttons[i].getAttribute('data-theory-idx'));
            if (bIdx === selected) {
                buttons[i].style.background = '#c62828';
                buttons[i].style.color = '#fff';
            }
            if (bIdx === appBazookaTheoryAnswer) {
                buttons[i].style.background = '#388e3c';
                buttons[i].style.color = '#fff';
            }
        }
        
        var pool = appBazookaTheoryPool;
        var correctText = pool.filter(function(p) { return p.ans === appBazookaTheoryAnswer; }).length > 0 ? '' : '';
        
        var errHtml = '<h3>❌ Неверно</h3>';
        errHtml += '<p>Правильный ответ выделен зелёным.</p>';
        errHtml += '<button class="read-rules-btn" onclick="openRules()">📖 ЧИТАТЬ ПРАВИЛА</button>';
        errHtml += '<button class="next-btn-big" style="background:#444; margin-top:10px;" onclick="runSkipTask()">Следующая задача ➡️</button>';
        
        // Вставляем после кнопок
        var container = document.createElement('div');
        container.innerHTML = errHtml;
        resultBox.appendChild(container);
        resultBox.className = 'result-box wrong';
        resultBox.style.borderColor = '#c62828';
    }
    
    updateStatsUI();
}

// Выбор главной руки в калькуляторе Базуки
function selectBazookaHand(hand) {
    var btns = document.querySelectorAll('#bazooka-hand-buttons .bazooka-state-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    var target = document.querySelector('#bazooka-hand-buttons [data-hand="' + hand + '"]');
    if (target) target.classList.add('active');

    var isProToggle = getEl('bazooka-pro-toggle');
    var isPro = !!(isProToggle && isProToggle.checked);
    var mainLabel  = (hand === 'right') ? 'Правая' : 'Левая';
    var otherLabel = (hand === 'right') ? 'Левая'  : 'Правая';

    // Обновляем лейблы жестов
    var stateButtons = document.querySelectorAll('#bazooka-state-buttons .bazooka-state-btn');
    stateButtons.forEach(function(btn) {
        var state = btn.getAttribute('data-state');
        if (state === '1') {
            btn.textContent = isPro
                ? 'Главная (' + mainLabel + ') рука (1)'
                : mainLabel + ' рука (1)';
        } else if (state === '3') {
            btn.textContent = isPro
                ? 'Не главная (' + otherLabel + ') рука (3)'
                : otherLabel + ' рука (3)';
        }
    });
}

function renderImpossibleExamStep(container) {
    container.innerHTML = '';
    var step = appImpossibleState.step;
    var wrapper = document.createElement('div');
    function setupAutoTab(ids) { ids.forEach(function(id, index) { var el = document.getElementById(id); if(!el) return; var resetCursor = function() { this.setSelectionRange(0, 0); }; el.addEventListener('focus', resetCursor); el.addEventListener('click', resetCursor); el.addEventListener('mouseup', function(e) { e.preventDefault(); resetCursor.call(this); }); el.addEventListener('keydown', function(e) { var key = e.key; if (/^\d$/.test(key)) { e.preventDefault(); if (this.value === "1" && key === "0") { this.value = "10"; if (index < ids.length - 1) document.getElementById(ids[index + 1]).focus(); return; } this.value = key; if (key === "1") { } else { if (index < ids.length - 1) document.getElementById(ids[index + 1]).focus(); } return; } if (key === 'Backspace') { e.preventDefault(); this.value = ''; if (index > 0) document.getElementById(ids[index - 1]).focus(); return; } if (key === 'ArrowRight' && index < ids.length - 1) { e.preventDefault(); document.getElementById(ids[index + 1]).focus(); } if (key === 'ArrowLeft' && index > 0) { e.preventDefault(); document.getElementById(ids[index - 1]).focus(); } }); }); if(ids.length > 0) document.getElementById(ids[0]).focus(); }
    
    if (step === 0) { wrapper.innerHTML = '<h4>Экзамен: Какая была косматика?</h4><input type="text" inputmode="numeric" id="imp-k1" placeholder="1" class="exam-input" maxlength="2"> <input type="text" inputmode="numeric" id="imp-k2" placeholder="2" class="exam-input" maxlength="2"> <input type="text" inputmode="numeric" id="imp-k3" placeholder="3" class="exam-input" maxlength="2">'; var btn = document.createElement('button'); btn.className='next-btn-big'; btn.innerText='Дальше'; btn.onclick = function() { var v1 = parseInt(document.getElementById('imp-k1').value); var v2 = parseInt(document.getElementById('imp-k2').value); var v3 = parseInt(document.getElementById('imp-k3').value); var actual = appCurrentScenarioData.kosmatika; if (v1===actual[0] && v2===actual[1] && v3===actual[2]) { appImpossibleState.step++; renderImpossibleExamStep(container); } else { alert("Неверно!"); } }; wrapper.appendChild(btn); setTimeout(function(){ setupAutoTab(['imp-k1', 'imp-k2', 'imp-k3']); }, 50); }
    else if (step === 1) { wrapper.innerHTML = '<h4>Черная команда:</h4><input type="text" inputmode="numeric" id="imp-b1" placeholder="1" class="exam-input" maxlength="2"> <input type="text" inputmode="numeric" id="imp-b2" placeholder="2" class="exam-input" maxlength="2"> <input type="text" inputmode="numeric" id="imp-b3" placeholder="3" class="exam-input" maxlength="2">'; var btn = document.createElement('button'); btn.className='next-btn-big'; btn.innerText='Дальше'; btn.onclick = function() { var inputs = [ parseInt(document.getElementById('imp-b1').value), parseInt(document.getElementById('imp-b2').value), parseInt(document.getElementById('imp-b3').value) ].sort((a,b)=>a-b); var actual = appCurrentScenarioData.blacks.slice().sort((a,b)=>a-b); inputs = inputs.map(x => x===0?10:x).sort((a,b)=>a-b); if (JSON.stringify(inputs) === JSON.stringify(actual)) { appImpossibleState.step++; renderImpossibleExamStep(container); } else { alert("Неверно!"); } }; wrapper.appendChild(btn); setTimeout(function(){ setupAutoTab(['imp-b1', 'imp-b2', 'imp-b3']); }, 50); }
    else if (step === 2) { wrapper.innerHTML = '<h4>Какая была ночь:</h4><input type="number" id="imp-n" class="exam-input">'; var btn = document.createElement('button'); btn.className='next-btn-big'; btn.innerText='Дальше'; btn.onclick = function() { if (parseInt(document.getElementById('imp-n').value) === appCurrentScenarioData.night) { appImpossibleState.step++; renderImpossibleExamStep(container); } else { alert("Неверно!"); } }; wrapper.appendChild(btn); }
    else if (step === 3) { wrapper.innerHTML = '<h4>Кто был убит (через запятую или 0):</h4><input type="text" id="imp-kill" class="exam-input wide">'; var btn = document.createElement('button'); btn.className='next-btn-big'; btn.innerText='Дальше'; btn.onclick = function() { var val = document.getElementById('imp-kill').value; var inputs = parseSmartInput(val).sort((a,b)=>a-b); var actual = appCurrentScenarioData.dead.sort((a,b)=>a-b); if (JSON.stringify(inputs) === JSON.stringify(actual)) { appImpossibleState.step++; renderImpossibleExamStep(container); } else { if(actual.length === 0 && (inputs.length===0 || inputs[0]===0)) { appImpossibleState.step++; renderImpossibleExamStep(container); } else { alert("Неверно!"); } } }; wrapper.appendChild(btn); }
    else if (step === 4) { appImpossibleState.step++; renderImpossibleExamStep(container); }
    else if (step === 5) { wrapper.innerHTML = '<h4>Что делал Дон?</h4><select id="imp-don" class="exam-input wide"><option value="none">Ничего не показал</option><option value="badge">Показал Жетон</option><option value="digit">Показал Цифру</option></select>'; var btn = document.createElement('button'); btn.className='next-btn-big'; btn.innerText='Дальше'; btn.onclick = function() { var val = document.getElementById('imp-don').value; if (val === appCurrentScenarioData.solution.donActionRaw) { appImpossibleState.hasPendingExam = false; document.body.removeChild(document.getElementById('impossible-exam-overlay')); showEl('view-trainer', true); removeClass('trainer-info-panel', 'content-hidden'); var resBox = getEl('trainer-result'); if(resBox) { resBox.style.display = 'block'; resBox.className = 'result-box wrong'; } appNightmareState.isActive = true; if(resBox) renderNightmareExam(resBox); } else { alert("Неверно!"); } }; wrapper.appendChild(btn); }
    
    var exitBtn = document.createElement('button'); exitBtn.className = 'secondary'; exitBtn.style.marginTop = '10px'; exitBtn.innerText = 'Сдаться / Сменить режим'; 
    exitBtn.onclick = function() { 
        var ov = document.getElementById('impossible-exam-overlay'); if(ov) document.body.removeChild(ov); 
        showEl('view-trainer', true); removeClass('trainer-info-panel', 'content-hidden'); showEl('skip-btn', true); 
        appImpossibleState.isActive = false; setModeSelectorState(true); 
        selectMode('hard', '👉 Косматика (Hard)'); 
    }; 
    wrapper.appendChild(exitBtn); container.appendChild(wrapper);
}

function renderNightmareExam(container) {
    container.innerHTML = '<h3>💪 Финальный рывок</h3><p>Восстановите логику выстрела:</p>';
    
    // Шаг 1
    var step1 = document.createElement('div'); step1.className = 'exam-step active'; 
    var label = (isAutomatchMode()) ? 'Активная цифра автомата' : 
                (isAhalayMode()) ? 'Активная цифра Ахалая' : 
                (isWhoMode()) ? 'Активная цифра Кто' : 
                (isMantisMode()) ? 'Активная цифра Богомола' : 
                (isRedMode()) ? 'Активная цифра Красного' :
                (isBlackMode()) ? 'Активная цифра Чёрного' :
                (isRedBlackMode()) ? 'Активная цифра Красного/Чёрного' :
                'Активная цифра косматики';
    step1.innerHTML = 'ℹ️ ' + label + ': <input type="number" class="exam-input" id="ex-in-1"> <span id="ex-fb-1"></span>'; 
    container.appendChild(step1);
    
    // Шаг 2
    var step2 = document.createElement('div'); step2.className = 'exam-step'; step2.id = 'ex-step-2'; 
    
    var step2Label = "";
    if (isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
        // Упрощенный текст для Кто, Богомола и Проверки
        step2Label = '⚡ Показана цифра / 0 (если пас):';
    } else if (isAhalayMode()) {
        step2Label = '⚡ Ахалай-махалай: Показана цифра / жетон (всегда есть жест):';
    } else {
        step2Label = '⚡ Ахалай: Показана цифра / жетон / 0 (если пас):';
    }

    step2.innerHTML = step2Label + ' <input type="number" class="exam-input" id="ex-in-2"> <span id="ex-fb-2"></span>'; 
    container.appendChild(step2);
    
    // Шаг 3 (ИЗМЕНЕН ТЕКСТ)
    var step3 = document.createElement('div'); step3.className = 'exam-step'; step3.id = 'ex-step-3'; 
    step3.innerHTML = '⚡ Стрелять нужно: <input type="number" class="exam-input" id="ex-in-3"> <span id="ex-fb-3"></span>'; 
    container.appendChild(step3);
    
    // Финал
    var finalDiv = document.createElement('div'); finalDiv.id = 'ex-final'; finalDiv.style.display = 'none'; finalDiv.style.marginTop = '15px'; 
    finalDiv.innerHTML = '<div class="expl-step" style="border: 1px solid #388e3c; background: rgba(56,142,60,0.2);">✅ Вы выполнили задание.</div>'; 
    
    var nextBtn = document.createElement('button'); nextBtn.className = 'next-btn-big'; nextBtn.innerHTML = 'Следующая задача ➡️'; 
    nextBtn.onclick = function() { appNightmareState.isActive = false; runSkipTask(); }; 
    finalDiv.appendChild(nextBtn); 
    container.appendChild(finalDiv);

    document.getElementById('ex-in-1').addEventListener('input', function() { checkNightmareInput(1, this); });
    document.getElementById('ex-in-2').addEventListener('input', function() { checkNightmareInput(2, this); });
    document.getElementById('ex-in-3').addEventListener('input', function() { checkNightmareInput(3, this); });
    document.getElementById('ex-in-1').focus();
}

function checkNightmareInput(step, inputEl) {
    var val = parseInt(inputEl.value); if (isNaN(val)) return;
    var isCorrect = false; var correctVal = 0;
    
    if (step === 1) { 
        correctVal = appCurrentSolution.base; 
        // Для режима Ахалая base может быть отрицательным
        if (val === correctVal) isCorrect = true; 
    } 
    else if (step === 2) { 
        correctVal = appCurrentSolution.gestureVal; 
        // Для режима Ахалая gestureVal всегда есть (0 для badge = donSeat, или цифра)
        // Для обычной косматики может быть 0 (пас)
        if (val === correctVal || (correctVal === 10 && val === 0)) isCorrect = true; 
    }
    else if (step === 3) { 
        // Здесь проверка финальной цели
        correctVal = appCurrentSolution.target;
        // 0 должен работать как 10
        if (val === correctVal || (val === 0 && correctVal === 10) || (val === 10 && correctVal === 0)) isCorrect = true; 
    }
    
    if (isCorrect) {
        inputEl.classList.add('exam-correct'); inputEl.classList.remove('exam-wrong'); inputEl.disabled = true;
        
        if (step === 1) { 
            document.getElementById('ex-fb-1').innerHTML = '✅'; 
            showEl('ex-step-2', true); 
            document.getElementById('ex-in-2').focus(); 
        } 
        else if (step === 2) { 
            document.getElementById('ex-fb-2').innerHTML = '✅'; 
            showEl('ex-step-3', true); 
            document.getElementById('ex-in-3').focus(); 
        } 
        else if (step === 3) { 
            document.getElementById('ex-fb-3').innerHTML = '✅'; 
            showEl('ex-final', true); 
            
            // Восстанавливаем роли и таблицу, так как экзамен пройден
            revealRoles();
            var tableDiv = getEl('trainer-table');
            if(tableDiv) tableDiv.style.display = 'flex';
        }
    } else { 
        inputEl.classList.add('exam-wrong'); 
    }
}

function renderScenario(data) {
    appCurrentSolution = data.solution;
    
    // LABEL CHANGE LOGIC
    var lbl = getEl('lbl-kosm');
    var valDisplay = getEl('t-kosm-disp');
    
    // Формируем строку косматики Дона
    var kosmSeparator = (isAhalayMode() || isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) ? " / " : " - ";
    var donKosmStr = data.kosmatika.map(function(n) {
        // Для режима Ахалая, Кто, Богомола и Проверки: положительные числа показываем с "+"
        if ((isAhalayMode() || isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) && n > 0) {
            return "+" + n;
        }
        return n.toString();
    }).join(kosmSeparator);
    
    // === ЛОГИКА ОТОБРАЖЕНИЯ КОСМАТИКИ ===
    if (appGameMode && appGameMode.startsWith('wolverine_')) {
        // --- РЕЖИМ РОСОМАХИ ---
        if (lbl) lbl.style.display = 'none';
        if (valDisplay) {
            valDisplay.style.display = 'block';
            valDisplay.style.width = '100%';
        }
        
        var wolvKosmStr = data.wolverineKosmatika ? data.wolverineKosmatika.join(" - ") : "???";
        var donLabel = "Косматика Дона (Мертв):";
        var donNumStyle = "text-decoration:line-through; opacity: 0.6;";
        
        if (appGameMode === 'wolverine_hard') {
            donLabel = "Косматика Дона:";
            donNumStyle = "opacity: 0.6;";
        }
        
        var htmlDisplay = '<div style="display:flex; flex-direction:column; align-items:center; width:100%; margin: 10px 0;">';
        htmlDisplay += '<div style="margin-bottom:8px;"><span style="color:#777; font-size:0.8em; text-transform:uppercase; margin-right:8px;">' + donLabel + '</span> <span style="color:#999; font-size: 1.1em; ' + donNumStyle + '">' + donKosmStr + '</span></div>';
        htmlDisplay += '<div><span style="color:var(--wolverine-color); font-size:0.8em; text-transform:uppercase; margin-right:8px;">КОСМАТИКА РОСОМАХИ:</span> <span style="color:var(--wolverine-color); font-weight:bold; font-size:1.5em; letter-spacing:2px; text-shadow: 0 0 15px rgba(255, 179, 0, 0.4);">' + wolvKosmStr + '</span></div>';
        htmlDisplay += '</div>';
        
        setHtml('t-kosm-disp', htmlDisplay);
    } else {
        // --- ОБЫЧНЫЕ РЕЖИМЫ ---
        if (lbl) {
            lbl.style.display = 'inline';
            
            // Для дриллов: определяем лейбл по активной системе дриллов
            var isDrillActive = (typeof appDrillState !== 'undefined' && appDrillState.isActive) || 
                                (typeof appDrillFilter !== 'undefined' && appDrillFilter && appDrillFilter.active);
            var activeDrillSystem = (typeof currentDrillSystem !== 'undefined') ? currentDrillSystem : null;
            
            if (isDrillActive && activeDrillSystem) {
                /**
                 * МОДУЛЬНОЕ ОПРЕДЕЛЕНИЕ ЛЕЙБЛА ДЛЯ ДРИЛЛОВ
                 * Switch-архитектура позволяет легко добавлять новые режимы.
                 * Для добавления нового режима: добавьте case 'new_mode': lbl.innerText = 'Новый:';
                 */
                switch (activeDrillSystem) {
                    case 'kosmatika':
                        lbl.innerText = 'Косматика:';
                        break;
                    case 'auto':
                        lbl.innerText = 'Автомат:';
                        break;
                    case 'winchester':
                        lbl.innerText = 'Винчестер:';
                        break;
                    case 'bazooka':
                        lbl.innerText = 'Базука:';
                        break;
                    default:
                        lbl.innerText = 'Косматика:';
                        break;
                }
            } else {
                // Стандартное определение для обычных режимов
                if (isAutomatchMode()) lbl.innerText = 'Автомат:';
                else if (isAhalayMode()) lbl.innerText = 'Ахалай:';
                else if (isWinchesterMode()) lbl.innerText = 'Винчестер:';
                else if (isWhoMode()) lbl.innerText = 'Кто:';
                else if (isMantisMode()) lbl.innerText = 'Богомол:';
                else if (isCheckMode()) lbl.innerText = 'Проверка:';
                else if (isRedMode && isRedMode()) lbl.innerText = 'Красный:';
                else if (isBlackMode && isBlackMode()) lbl.innerText = 'Чёрный:';
                else if (isRedBlackMode && isRedBlackMode()) lbl.innerText = 'Красный/Чёрный:';
                else if (isBazookaMode()) lbl.innerText = 'Базука:';
                else lbl.innerText = 'Косматика:';
            }
        }
        if (valDisplay) {
            valDisplay.style.display = 'inline';
            valDisplay.style.width = 'auto';
        }
        
        // Базука: особое отображение
        if (isBazookaMode() && data.bazookaBase) {
            var bazLabel = 'Базука ' + data.bazookaBase;
            var handLabel = (data.bazookaDominantHand === 'right') ? '(правая)' : '(левая)';
            var proLabel = data.bazookaIsPro ? ' PRO ⬆️' : '';
            setHtml('t-kosm-disp', '<strong style="color:var(--bazooka-color);">' + bazLabel + ' ' + handLabel + proLabel + '</strong>');
        } else {
            setText('t-kosm-disp', donKosmStr);
        }
    }
    
    // В Nightmare режиме скрываем, кто Дон в текстовом поле, если нужно (но вы просили на картинке, т.е. на столе).
    // Если нужно скрыть и текст "Дон сидит на", раскомментируйте код ниже. Сейчас он показывает правду, как и было.
    var formattedBlacks = data.blacks.map(function(seat) {
        if (seat !== data.don) return '<span class="highlight-mafia">' + seat + '</span>';
        else return '<span class="highlight-don">' + seat + '</span>';
    });
    setHtml('t-black-disp', formattedBlacks.join(", "));
    setText('t-don-disp', data.don);
    
    // ═══════════════════════════════════════════════════════════════
    // ОТОБРАЖЕНИЕ BADGE: "Единственный Шериф" vs "2 Версии"
    // ═══════════════════════════════════════════════════════════════
    var badgeEl = getEl('sheriff-context-badge');
    var badgeIcon = getEl('sheriff-context-icon');
    var badgeText = getEl('sheriff-context-text');
    var badgeHint = getEl('sheriff-context-hint');
    
    if (badgeEl && badgeIcon && badgeText && badgeHint) {
        var sheriffHasChecks = data.sheriffCheckedReds && data.sheriffCheckedReds.length > 0;
        var donHasAnyChecks = (data.donCheckedReds && data.donCheckedReds.length > 0) || 
                              (data.donCheckedBlacks && data.donCheckedBlacks.length > 0);
        
        if (data.isSoloSheriff && sheriffHasChecks) {
            // СЦЕНАРИЙ 1: Единственный Шериф
            badgeEl.style.display = 'block';
            badgeEl.style.background = 'rgba(33, 150, 243, 0.15)';
            badgeEl.style.borderColor = '#2196f3';
            badgeEl.style.color = '#90caf9';
            
            badgeIcon.innerHTML = '👮';
            badgeText.innerHTML = 'СИТУАЦИЯ: <strong>ЕДИНСТВЕННЫЙ ШЕРИФ</strong>';
            
            // МОДУЛЬНОЕ формирование подсказки в зависимости от режима дриллов
            var isDrillActive = (typeof appDrillState !== 'undefined' && appDrillState.isActive) || 
                                (typeof drillFilterActive !== 'undefined' && drillFilterActive) ||
                                (typeof appDrillFilter !== 'undefined' && appDrillFilter.active);
            var activeDrillSystem = (typeof currentDrillSystem !== 'undefined') ? currentDrillSystem : 'kosmatika';
            
            // ОПРЕДЕЛЯЕМ ТЕКУЩУЮ СЛОЖНОСТЬ (для дриллов и обычных режимов)
            var currentDiff = '';
            if (isDrillActive) {
                // Для дриллов используем currentDrillDifficulty
                currentDiff = (typeof currentDrillDifficulty !== 'undefined') ? currentDrillDifficulty.toLowerCase() : 'easy';
            } else {
                // Для обычных режимов извлекаем сложность из appGameMode
                if (typeof appGameMode !== 'undefined') {
                    var modeParts = appGameMode.split('_');
                    if (modeParts.length > 1) {
                        currentDiff = modeParts[modeParts.length - 1].toLowerCase();
                    } else {
                        currentDiff = appGameMode.toLowerCase();
                    }
                }
            }
            
            // Список хардкорных сложностей, где подсказки НЕ нужны
            var hardcoreModes = ['hard', 'nightmare', 'impossible'];
            
            var hintText = '';
            
            // Генерируем текст подсказки ТОЛЬКО для Newbie и Easy
            if (!hardcoreModes.includes(currentDiff)) {
                if (isDrillActive) {
                    switch (activeDrillSystem) {
                        case 'auto':
                            hintText = 'Автомат: При статике (Дон пасует) стреляем в Красную проверку БЕЗ смещения. Динамика (+1) работает только если цель красная';
                            break;
                        case 'winchester':
                            hintText = 'Винчестер: При статике (Дон пасует) стреляем в Красную проверку БЕЗ баллов за жест. Баллы работают только при динамике';
                            break;
                        case 'bazooka':
                            hintText = '';
                            break;
                        case 'kosmatika':
                        default:
                            hintText = 'При мертвом Шерифе и статике (Дон пасует) стреляем в ближайшую Красную проверку по часовой';
                            break;
                    }
                } else {
                    // Для обычных режимов (не дриллы) определяем по appGameMode
                    if (typeof isAutomatchMode === 'function' && isAutomatchMode()) {
                        hintText = 'Автомат: При статике стреляем в Красную проверку БЕЗ смещения';
                    } else if (typeof isWinchesterMode === 'function' && isWinchesterMode()) {
                        hintText = 'Винчестер: При статике стреляем в Красную проверку БЕЗ баллов за жест';
                    } else {
                        hintText = 'При мертвом Шерифе и статике стреляем в ближайшую Красную проверку по часовой';
                    }
                }
            }
            
            // Применяем текст подсказки
            badgeHint.innerHTML = hintText;
            
            // ВАЖНО: Скрываем блок подсказки, если текста нет (Hard/Nightmare/Impossible)
            if (hintText === '') {
                badgeHint.style.display = 'none';
            } else {
                badgeHint.style.display = 'block';
            }
        } else if (!data.isSoloSheriff && sheriffHasChecks && donHasAnyChecks) {
            // СЦЕНАРИЙ 2: Игра в 2 версии (Лже-шериф)
            badgeEl.style.display = 'block';
            badgeEl.style.background = 'rgba(255, 152, 0, 0.15)';
            badgeEl.style.borderColor = '#ff9800';
            badgeEl.style.color = '#ffb74d';
            
            badgeIcon.innerHTML = '⚔️';
            badgeText.innerHTML = 'СИТУАЦИЯ: <strong>2 ВЕРСИИ (ЛЖЕ-ШЕРИФ)</strong>';
            
            // ПРОВЕРКА СЛОЖНОСТИ: для хардкорных режимов не показываем подсказки
            var isDrillActive2 = (typeof appDrillState !== 'undefined' && appDrillState.isActive) || 
                                 (typeof drillFilterActive !== 'undefined' && drillFilterActive) ||
                                 (typeof appDrillFilter !== 'undefined' && appDrillFilter.active);
            
            var currentDiff2 = '';
            if (isDrillActive2) {
                currentDiff2 = (typeof currentDrillDifficulty !== 'undefined') ? currentDrillDifficulty.toLowerCase() : 'easy';
            } else {
                if (typeof appGameMode !== 'undefined') {
                    var modeParts2 = appGameMode.split('_');
                    if (modeParts2.length > 1) {
                        currentDiff2 = modeParts2[modeParts2.length - 1].toLowerCase();
                    } else {
                        currentDiff2 = appGameMode.toLowerCase();
                    }
                }
            }
            
            var hardcoreModes2 = ['hard', 'nightmare', 'impossible'];
            
            var donChecksText = '';
            
            // Формируем текст подсказки ТОЛЬКО для Newbie и Easy
            if (!hardcoreModes2.includes(currentDiff2)) {
                if (data.donCheckedReds && data.donCheckedReds.length > 0) {
                    donChecksText += 'Красные: ' + data.donCheckedReds.join(', ');
                }
                if (data.donCheckedBlacks && data.donCheckedBlacks.length > 0) {
                    if (donChecksText) donChecksText += ' | ';
                    donChecksText += 'Черные: ' + data.donCheckedBlacks.join(', ');
                }
                
                if (donChecksText) {
                    donChecksText = 'Проверки Дона: ' + donChecksText;
                }
            }
            
            badgeHint.innerHTML = donChecksText;
            
            // Скрываем блок подсказки, если текста нет
            if (donChecksText === '') {
                badgeHint.style.display = 'none';
            } else {
                badgeHint.style.display = 'block';
            }
        } else {
            // СЦЕНАРИЙ 3: Нет информации или недостаточно данных
            badgeEl.style.display = 'none';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ВИЗУАЛИЗАЦИЯ ПРОВЕРОК ШЕРИФА (Если Шериф мертв)
    // ═══════════════════════════════════════════════════════════════
    var sheriffChecksInfoEl = getEl('sheriff-checks-info');
    if (!sheriffChecksInfoEl) {
        // Если элемент не существует, создаем его динамически
        sheriffChecksInfoEl = document.createElement('div');
        sheriffChecksInfoEl.id = 'sheriff-checks-info';
        sheriffChecksInfoEl.style.cssText = 'display:none; margin-top:15px; padding:12px 15px; border-radius:6px; background:rgba(76, 175, 212, 0.15); border:2px solid #4caf50; color:#81c784; font-weight:bold; font-size:0.95em;';
        
        var badgeParent = getEl('sheriff-context-badge');
        if (badgeParent && badgeParent.parentNode) {
            badgeParent.parentNode.insertBefore(sheriffChecksInfoEl, badgeParent.nextSibling);
        }
    }
    
    if (sheriffChecksInfoEl) {
        // КРИТИЧЕСКИ ВАЖНО: Проверяем Шерифа и в dead, и в votedOutPlayers
        var sheriffDead = data.sheriffSeat && (
            (data.dead && data.dead.includes(data.sheriffSeat)) ||
            (data.votedOutPlayers && data.votedOutPlayers.includes(data.sheriffSeat))
        );
        
        if (sheriffDead) {
            // Шериф мертв - показываем его проверки
            sheriffChecksInfoEl.style.display = 'block';
            
            var checksHtml = '<div style="font-size:1.1em; margin-bottom:8px;">📜 <strong>ПРОВЕРКИ ШЕРИФА:</strong></div>';
            
            if (data.sheriffCheckedReds && data.sheriffCheckedReds.length > 0) {
                // Форматируем красные проверки
                var redsFormatted = data.sheriffCheckedReds.map(function(num) {
                    return '<span style="color:#4caf50; font-size:1.2em; font-weight:bold; padding:3px 8px; background:rgba(76, 175, 212, 0.2); border-radius:4px; margin:0 3px;">' + num + '</span>';
                }).join(' ');
                
                checksHtml += '<div style="margin-top:5px;">Красные: ' + redsFormatted + '</div>';
            } else {
                // Если проверок нет (не должно быть в дрилле, но на всякий случай)
                checksHtml += '<div style="color:#ff9800; margin-top:5px;">⚠️ Нет проверок (Охота невозможна)</div>';
            }
            
            sheriffChecksInfoEl.innerHTML = checksHtml;
        } else {
            // Шериф жив или неизвестен - скрываем блок
            sheriffChecksInfoEl.style.display = 'none';
        }
    }

    // === ВОТ ЗДЕСЬ ИЗМЕНЕНИЯ ===
    // Вместо старых полей заполняем новые
    setHtml('panel-night-info', data.txtNight || ''); // Ночь и активная цифра
    setHtml('panel-history', data.txtHistory || '');  // История стола
    setHtml('panel-action', data.txtAction || '');    // Действие Дона
    // ============================

    setHtml('scenario-desc', data.descHtml || ''); // Оставляем для совместимости (хоть он и скрыт)

    var tableDiv = getEl('trainer-table');
    if(tableDiv) {
        tableDiv.style.display = 'flex'; // Убеждаемся, что таблица видна
        tableDiv.innerHTML = '';
        for(var i=1; i<=10; i++) {
            (function(i) {
                var seat = document.createElement('div');
                seat.className = 'player-seat'; // По умолчанию красный (--accent)
                seat.id = 'seat-' + i; 
                seat.innerText = i;
                
                // Roles (Icons) - Show ONLY in Easy/Newbie (Hide in Hard, Nightmare, Impossible)
                // Also fix: usage of data.sheriffSeat instead of data.sheriff
                var isHard = (appGameMode && appGameMode.indexOf('hard') !== -1);
                var isNightmare = (appGameMode && appGameMode.indexOf('nightmare') !== -1);
                var isImpossible = (appGameMode && appGameMode.indexOf('impossible') !== -1);
                if (!isHard && !isNightmare && !isImpossible) {
                    if (data.sheriffSeat === i) {
                        seat.innerHTML += '<div class="role-badge sheriff-badge"><i class="fas fa-star"></i></div>';
                    }
                    if (data.donSeat === i) {
                        seat.innerHTML += '<div class="role-badge don-badge"><i class="fas fa-hat-cowboy"></i></div>';
                    }
                }
                
                // ВАЖНО: Мы НЕ добавляем классы mafia/don/sheriff здесь если режим NIGHTMARE
                // Но если это обычный режим - добавляем.
                if (appGameMode && appGameMode.indexOf('nightmare') === -1) {
                     if (data.blacks.includes(i)) { if (i === data.don) seat.classList.add('don'); else seat.classList.add('mafia'); }
                     if (data.sheriff === i && data.night >= 2) seat.classList.add('sheriff');
                     if (data.checkedB.includes(i)) seat.classList.add('checked-black');
                }
                
                // Иконка Росомахи
                if (appGameMode && appGameMode.startsWith('wolverine_') && data.wolverineSeat === i) {
                    seat.classList.add('wolverine-player');
                }
                
                // Статус "мертв" виден всегда (проверяем и dead, и votedOutPlayers)
                var isPlayerDead = data.dead.includes(i) || 
                                   (data.votedOutPlayers && data.votedOutPlayers.includes(i));
                
                if (isPlayerDead) {
                    seat.classList.add('dead');
                }
                
                seat.onclick = function() { checkTrainerAnswer(i); };
                tableDiv.appendChild(seat);
            })(i);
        }
    }
    updateTableVisualEffects();
    
    var resBox = getEl('trainer-result'); 
    if(resBox) { showEl('trainer-result', false); resBox.className = 'result-box'; resBox.innerHTML = ''; }
    
    if (appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'who_impossible' || appGameMode === 'mantis_impossible' || appGameMode === 'red_impossible' || appGameMode === 'black_impossible' || appGameMode === 'redblack_impossible') { 
        showEl('skip-btn', false); 
    } else { 
        showEl('skip-btn', true); 
    }
    removeClass('trainer-info-panel', 'content-hidden');
    
    // CSS классы контейнера
    var trainerView = getEl('view-trainer');
    if(trainerView) {
        trainerView.className = ''; // Сброс классов
        if (appGameMode && appGameMode.startsWith('wolverine_')) trainerView.classList.add('wolverine-mode-active');
        else if(appGameMode && appGameMode.indexOf('hard') !== -1) trainerView.classList.add('hard-mode-active');
        else if(appGameMode && appGameMode.indexOf('nightmare') !== -1) trainerView.classList.add('nightmare-mode-active');
        else if(appGameMode && appGameMode.indexOf('impossible') !== -1) trainerView.classList.add('impossible-mode-active');
        else if(isAutomatchMode()) trainerView.classList.add('automatch-mode-active');
        else if(isAhalayMode()) trainerView.classList.add('automatch-mode-active'); // Ahalay style
        else if(isWinchesterMode()) trainerView.classList.add('automatch-mode-active'); // Winchester style
        else if(isBazookaMode()) trainerView.classList.add('automatch-mode-active'); // Bazooka style
        // Новые режимы ClassicFire:
        else if(isWhoMode()) trainerView.classList.add('who-mode-active');
        else if(isMantisMode()) trainerView.classList.add('mantis-mode-active');
        else if(isCheckMode()) trainerView.classList.add('check-mode-active');
        else if(isRedMode()) trainerView.classList.add('red-mode-active');
        else if(isBlackMode()) trainerView.classList.add('black-mode-active');
        else if(isRedBlackMode()) trainerView.classList.add('redblack-mode-active');
    }
    
    if (appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'who_impossible' || appGameMode === 'mantis_impossible' || appGameMode === 'red_impossible' || appGameMode === 'black_impossible' || appGameMode === 'redblack_impossible') {
        startImpossibleTimer(); 
    } else { 
        showEl('timer-bar-container', false); 
    }
}

function formatCheckList(list) { return list.sort(function(a,b){return a-b;}).join(', '); }

function simulateClassicFire(targetNight) {
    // 0 = 1-я цифра, 1 = 2-я цифра, 2 = 3-я цифра
    var cycle = [0, 1, 2];
    var pointer = 0;
    var history = []; // true = попадание, false = промах
    
    // Симулируем ночи от 1 до (targetNight - 1)
    for (var n = 1; n < targetNight; n++) {
        // Текущая активная цифра
        if (cycle.length === 0) cycle = [0, 1, 2]; // Защита (рестарт цикла)
        if (pointer >= cycle.length) pointer = 0;
        
        // Рандомно решаем: было попадание или промах в прошлом?
        // 50/50, но можно настроить баланс
        var isHit = Math.random() < 0.5;
        
        history.push({ night: n, activeIndex: cycle[pointer], isHit: isHit });
        
        if (isHit) {
            // ПОПАДАНИЕ: Удаляем цифру из цикла
            cycle.splice(pointer, 1);
            // Указатель остается на том же месте (т.к. массив сдвинулся), 
            // но если он вышел за пределы, сбрасываем
            if (pointer >= cycle.length) pointer = 0;
        } else {
            // ПРОМАХ: Идем дальше
            pointer++;
            if (pointer >= cycle.length) pointer = 0;
        }
    }
    
    // Определяем активный индекс для ТЕКУЩЕЙ (targetNight) ночи
    if (cycle.length === 0) cycle = [0, 1, 2];
    if (pointer >= cycle.length) pointer = 0;
    var currentActiveIndex = cycle[pointer];
    
    return {
        kIndex: currentActiveIndex,
        history: history
    };
}

function generateRandomScenario() {
    try {
        // --- Проверка теоретического вопроса Базуки ---
        if (isBazookaMode() && !appGameMode.includes('calc') && !appGameMode.includes('impossible')) {
            appBazookaTheoryCounter++;
            var theoryInterval = 5; // Newbie: каждые 5
            if (appGameMode === 'bazooka_easy') theoryInterval = 8;
            else if (appGameMode === 'bazooka_hard' || appGameMode === 'bazooka_nightmare') theoryInterval = 12;
            
            if (appBazookaTheoryCounter >= theoryInterval) {
                appBazookaTheoryCounter = 0;
                showBazookaTheoryQuestion();
                return;
            }
        }
        
        var scenarioIsValid = false; var attempts = 0;
        var maxAttempts = 1000;

        while (!scenarioIsValid && attempts < maxAttempts) {
            attempts++;
            
            // 1. Define Red/Black variant (50/50) for this attempt
            var rbVariant = (Math.random() > 0.5) ? 'red' : 'black';

            var forceNight = 0; var forceActionType = null;
            var drillForceActionType = null;
            var drillFilterActive = (appDrillFilter && appDrillFilter.active);
            if (appDrillState.isActive) {
                forceNight = appDrillState.filterCriteria.night;
                forceActionType = appDrillState.filterCriteria.actionType;
                if (attempts > 300) forceNight = 0; 
                if (attempts > 900) appDrillState.isActive = false; 
            }
            if (drillFilterActive) {
                // Если есть массивы конфигураций (режим конструктора), выбираем случайно
                if (appDrillFilter.allowedScenarios && appDrillFilter.allowedScenarios.length > 0) {
                    var randomScenario = appDrillFilter.allowedScenarios[
                        Math.floor(Math.random() * appDrillFilter.allowedScenarios.length)
                    ];
                    if (randomScenario.night) {
                        forceNight = randomScenario.night;
                        appDrillFilter.night = randomScenario.night;
                    }
                    if (randomScenario.prevHit !== undefined) {
                        appDrillFilter.prevHit = randomScenario.prevHit;
                    }
                    if (randomScenario.kIndexOffset !== undefined) {
                        appDrillFilter.kIndexOffset = randomScenario.kIndexOffset;
                    }
                    // Новые флаги для дриллов
                    if (randomScenario.sheriffDead !== undefined) {
                        appDrillFilter.sheriffDead = randomScenario.sheriffDead;
                    }
                    if (randomScenario.ensureRedChecks !== undefined) {
                        appDrillFilter.ensureRedChecks = randomScenario.ensureRedChecks;
                    }
                    if (randomScenario.donNoChecks !== undefined) {
                        appDrillFilter.donNoChecks = randomScenario.donNoChecks;
                    }
                    if (randomScenario.sheriffAlive !== undefined) {
                        appDrillFilter.sheriffAlive = randomScenario.sheriffAlive;
                    }
                    if (randomScenario.dualVersions !== undefined) {
                        appDrillFilter.dualVersions = randomScenario.dualVersions;
                    }
                    if (randomScenario.ensureBothChecks !== undefined) {
                        appDrillFilter.ensureBothChecks = randomScenario.ensureBothChecks;
                    }
                } else {
                    // Одиночный дрилл (старая логика)
                    if (appDrillFilter.night) forceNight = appDrillFilter.night;
                }
                
                if (appDrillFilter.allowedActions && appDrillFilter.allowedActions.length > 0) {
                    var randomAction = appDrillFilter.allowedActions[
                        Math.floor(Math.random() * appDrillFilter.allowedActions.length)
                    ];
                    if (randomAction.type) {
                        drillForceActionType = randomAction.type;
                        appDrillFilter.actionType = randomAction.type;
                    }
                } else {
                    // Одиночный дрилл (старая логика)
                    if (appDrillFilter.actionType) drillForceActionType = appDrillFilter.actionType;
                }
            }

            // 1. ГЕНЕРАЦИЯ ИГРОКОВ И КОМАНД (стандартная случайная)
            var seats = [1,2,3,4,5,6,7,8,9,10];
            shuffleArray(seats); 
            var blacks = seats.slice(0, 3).sort(function(a,b){return a-b});
            var reds = seats.slice(3).sort(function(a,b){return a-b});

            // 2. ПРОВЕРКА НА ПОВТОР (только для случайной генерации, не для кастомных настроек)
            var hasCustomSettings = (drillFilterActive && appDrillFilter.active && 
                                     ((appDrillFilter.customBlacks && appDrillFilter.customBlacks.length > 0) ||
                                      (appDrillFilter.customKosmatika && appDrillFilter.customKosmatika.length > 0)));
            
            if (!hasCustomSettings) {
                var blacksJson = JSON.stringify(blacks);
                if (blacksJson === appLastBlackTeamJson) {
                    // Для ahalay_newbie: увеличиваем модификатор динамики вместо пропуска
                    if (appGameMode === 'ahalay_newbie') {
                        appAhalayNewbieDynamicModifier += 1; // При первом повторении: 1, при втором: 2, и т.д.
                        // Не делаем continue, продолжаем генерацию с увеличенным модификатором
                    } else {
                        // Для остальных режимов: пропускаем этот вариант
                        continue; 
                    }
                } else {
                    // Если черная команда не повторяется, сбрасываем модификатор
                    if (appGameMode === 'ahalay_newbie') {
                        appAhalayNewbieDynamicModifier = 0;
                    }
                }
            }
            
            var don = blacks[getRandomInt(0, 2)];
            
            // 2. ГЕНЕРАЦИЯ ЦИФР (КОСМАТИКИ/ДИНАМИКИ) - стандартная логика
            var kosmatika;
            if (appGameMode === 'newbie' || appGameMode === 'automatch_newbie' || appGameMode === 'automatch_easy') {
                kosmatika = [getRandomInt(1, 10)];
            } else if (isWinchesterMode()) {
                // Для Винчестера: обычные числа 1-10 (как в стандартной косматике)
                kosmatika = [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)];
            } else if (isAhalayMode()) {
                // Для режимов Ахалая: числа от -5 до 5, обязательно включая 0
                if (appGameMode === 'ahalay_newbie') {
                    // Для newbie: 0 или 1 по 50%
                    var val = (Math.random() > 0.5) ? 1 : 0;
                    // Создаем массив из 3-х одинаковых цифр, чтобы на 2-ю и 3-ю ночь не было ошибки
                    kosmatika = [val, val, val]; 
                } else {
                    // Для остальных режимов: три числа от -5 до 5, хотя бы одно должно быть 0
                    var possibleValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
                    var n1 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n2 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n3 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    
                    // Гарантируем, что хотя бы одно число будет 0
                    if (n1 !== 0 && n2 !== 0 && n3 !== 0) {
                        var zeroIndex = getRandomInt(0, 2);
                        if (zeroIndex === 0) n1 = 0;
                        else if (zeroIndex === 1) n2 = 0;
                        else n3 = 0;
                    }
                    
                    kosmatika = [n1, n2, n3];
                }
            } else if (isWhoMode()) {
                // Для режима "Кто": цикл ночей как Ахалай
                if (appGameMode === 'who_newbie') {
                    // Для newbie: числа 1-10
                    kosmatika = [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)];
                } else {
                    // Для остальных: числа от -5 до 5 (включая 0)
                    var possibleValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
                    var n1 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n2 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n3 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    kosmatika = [n1, n2, n3];
                }
            } else if (isMantisMode()) {
                // Для режима "Богомол": как в Ахалае/Кто
                if (appGameMode === 'mantis_newbie') {
                    // Для newbie: только положительные 1-10
                    kosmatika = [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)];
                } else {
                    // Для остальных: числа от -5 до 5 (включая 0)
                    var possibleValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
                    var n1 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n2 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n3 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    kosmatika = [n1, n2, n3];
                }
            } else if (isCheckMode()) {
                // Для режима "Проверка": как в Кто/Богомол
                if (appGameMode === 'check_newbie') {
                    // Для newbie: только положительные 1-10
                    kosmatika = [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)];
                } else {
                    // Для остальных: числа от -5 до 5 (включая 0)
                    var possibleValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
                    var n1 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n2 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n3 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    kosmatika = [n1, n2, n3];
                }
            } else if (isRedMode() || isBlackMode() || isRedBlackMode()) {
                // 1. Newbie Override (Random 1-10)
                if (appGameMode.indexOf('newbie') !== -1) {
                    kosmatika = [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)];
                } 
                // 2. Red/Black Mode - RED VARIANT (Strictly [1, 5, 1])
                else if (isRedBlackMode() && rbVariant === 'red') {
                    kosmatika = [1, 5, 1]; 
                } 
                // 3. Black Mode / Red Mode / RedBlack Black Variant (Random -5 to 5)
                else {
                    var possibleValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
                    var n1 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n2 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    var n3 = possibleValues[getRandomInt(0, possibleValues.length - 1)];
                    
                    // Ensure at least one zero if needed (optional logic from original code)
                    if (n1 !== 0 && n2 !== 0 && n3 !== 0) {
                        var zeroIndex = getRandomInt(0, 2);
                        if (zeroIndex === 0) n1 = 0; else if (zeroIndex === 1) n2 = 0; else n3 = 0;
                    }
                    kosmatika = [n1, n2, n3];
                }
            } else if (isBazookaMode()) {
                // Для Базуки: kosmatika хранит базовую цифру (только 1 цифра 1-10)
                kosmatika = [getRandomInt(1, 10)];
            } else {
                kosmatika = [getRandomInt(1,10), getRandomInt(1,10), getRandomInt(1,10)];
            }
            
            // ============================================================
            // === FORCE CUSTOM SETUP: ЖЕСТКОЕ ПЕРЕОПРЕДЕЛЕНИЕ ===
            // ============================================================
            if (drillFilterActive && appDrillFilter.active) {
                // 1. ПЕРЕОПРЕДЕЛЯЕМ ЧЕРНУЮ КОМАНДУ
                if (appDrillFilter.customBlacks && appDrillFilter.customBlacks.length > 0) {
                    var customB = appDrillFilter.customBlacks.slice();
                    
                    // Если ввели меньше 3 цифр, дополняем случайными уникальными
                    if (customB.length < 3) {
                        var allSeats = [1,2,3,4,5,6,7,8,9,10];
                        var availableSeats = [];
                        for (var i = 0; i < allSeats.length; i++) {
                            if (customB.indexOf(allSeats[i]) === -1) {
                                availableSeats.push(allSeats[i]);
                            }
                        }
                        shuffleArray(availableSeats);
                        
                        while (customB.length < 3 && availableSeats.length > 0) {
                            customB.push(availableSeats.shift());
                        }
                    }
                    
                    // Берем первые 3 и сортируем
                    blacks = customB.slice(0, 3).sort(function(a,b){return a-b});
                    
                    // ПЕРЕСЧИТЫВАЕМ КРАСНЫХ (все, кто не черные)
                    reds = [];
                    for (var i = 1; i <= 10; i++) {
                        if (blacks.indexOf(i) === -1) {
                            reds.push(i);
                        }
                    }
                    
                    // ДОН - случайный из черных (по умолчанию)
                    don = blacks[Math.floor(Math.random() * blacks.length)];
                }
                
                // 1.1. ПЕРЕОПРЕДЕЛЯЕМ ДОНА (если указан кастомный)
                if (appDrillFilter.customDon && appDrillFilter.customDon > 0) {
                    var customD = appDrillFilter.customDon;
                    // Проверяем, есть ли он в черной команде
                    if (blacks.indexOf(customD) !== -1) {
                        don = customD; // Применяем кастомного Дона
                    }
                    // Иначе игнорируем и оставляем случайного
                }
                
                // 2. ПЕРЕОПРЕДЕЛЯЕМ КОСМАТИКУ (цифры динамики)
                if (appDrillFilter.customKosmatika && appDrillFilter.customKosmatika.length > 0) {
                    var customK = appDrillFilter.customKosmatika;
                    
                    // НОВАЯ ЛОГИКА РАСШИРЕНИЯ:
                    // 1 цифра -> [x, x, x] (все 3 ночи одинаковые)
                    // 2 цифры -> [x, y, y] (последняя повторяется)
                    // 3 цифры -> [x, y, z] (как есть)
                    if (customK.length === 1) {
                        kosmatika = [customK[0], customK[0], customK[0]];
                    } else if (customK.length === 2) {
                        kosmatika = [customK[0], customK[1], customK[1]]; // Последняя повторяется!
                    } else {
                        kosmatika = customK.slice(0, 3);
                    }
                }
            }
            // ============================================================
            // === END FORCE CUSTOM SETUP ===
            // ============================================================
            
            // --- РОСОМАХА: Назначение ---
            var wolverineSeat = 0;
            var wolverineKosmatika = [];
            var isWolverine = (appGameMode && appGameMode.startsWith('wolverine_'));
            if (isWolverine) {
                var possibleWolverines = blacks.filter(function(b) { return b !== don; });
                if (possibleWolverines.length > 0) {
                    wolverineSeat = possibleWolverines[getRandomInt(0, possibleWolverines.length - 1)];
                    wolverineKosmatika = [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)];
                }
            }
            
            var r = Math.random() * 100; var night;
            if (forceNight > 0) { night = forceNight; } 
            else {
                // Для Ахалая, Кто и Богомола используем проценты из соответствующих уровней Косматики
                if (isAhalayMode() || isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
                    if (appGameMode === 'ahalay_nightmare' || appGameMode === 'who_nightmare' || appGameMode === 'mantis_nightmare' || appGameMode === 'check_nightmare' || appGameMode === 'red_nightmare' || appGameMode === 'black_nightmare' || appGameMode === 'redblack_nightmare') {
                        // Проценты из nightmare Косматики, адаптированные для ночей 1-3
                        // Nightmare Косматики: 25% ночь 2, 50% ночь 3, 15% ночь 4, 10% ночь 5
                        // Для Ахалая/Кто: перераспределяем на ночи 1-3 (25% ночь 1, 50% ночь 2, 25% ночь 3)
                        if (r < 25) night = 1; else if (r < 75) night = 2; else night = 3;
                    } else {
                        // Проценты из newbie/easy/hard Косматики: 45% ночь 1, 30% ночь 2, 20% ночь 3, 5% ночь 4
                        // Для Ахалая/Кто: 45% ночь 1, 30% ночь 2, 25% ночь 3 (5% от ночи 4 добавляем к ночи 3)
                        night = (r < 45) ? 1 : (r < 75) ? 2 : 3;
                    }
                } else if (isWolverine) {
                    // Для Росомахи: ночь 1 или 2
                    night = (r < 60) ? 1 : 2;
                } else if (appGameMode === 'nightmare' || appGameMode === 'impossible' || appGameMode === 'automatch_nightmare' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible') { 
                    if (r < 38) night = 2; else if (r < 88) night = 3; else if (r < 98) night = 4; else night = 5; 
                } else { 
                    night = (r < 45) ? 1 : (r < 75) ? 2 : (r < 95) ? 3 : (r < 99) ? 4 : 5; 
                }
            }
            
            var isEjectionScenario = Math.random() < 0.10; var ejectedPlayer = 0;
            var kIndex = 0; var descNightTitle = "";
            var classicFireHits = undefined; // Количество попаданий из истории ClassicFire
            var simResult = undefined; // Результат симуляции ClassicFire (для отображения истории)

            if (night === 1) { 
                descNightTitle = (Math.random() > 0.5) ? "1-я Ночь" : "Ночь №1";
                // Для режимов Кто и Богомол используем ClassicFire даже для ночи 1
                if (isWhoMode() || isMantisMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
                    simResult = simulateClassicFire(night);
                    kIndex = simResult.kIndex;
                    classicFireHits = simResult.history.filter(function(h) { return h.isHit; }).length;
                } else {
                    kIndex = 0;
                }
            } else { 
                descNightTitle = "Ночь №" + night; 
                if (appGameMode === 'newbie' || appGameMode === 'automatch_newbie' || appGameMode === 'automatch_easy' || appGameMode === 'ahalay_newbie') {
                    kIndex = 0;
                } else if (isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
                    // ClassicFire Logic
                    simResult = simulateClassicFire(night);
                    kIndex = simResult.kIndex;

                    // Сохраняем количество попаданий из истории симуляции
                    classicFireHits = simResult.history.filter(function(h) { return h.isHit; }).length;
                } else if (isAhalayMode()) {
                    kIndex = (night - 1) % 3; // OldFire (простой цикл)
                } else {
                    var maxIndex = Math.min(2, night - 1); 
                    kIndex = getRandomInt(0, maxIndex); 
                }
            }
            
            // DRILL FILTER: Принудительная установка kIndex для дриллов
            if (drillFilterActive && typeof appDrillFilter.kIndexOffset === 'number') {
                // Устанавливаем kIndex из фильтра дрилла
                kIndex = appDrillFilter.kIndexOffset;
                // Примеры:
                // - Промах в 1-ю ночь (kIndexOffset=0): активна 1-я цифра (kIndex=0)
                // - Промах во 2-ю ночь (kIndexOffset=1): активна 2-я цифра (kIndex=1)
                // - Активна 2-я цифра после попадания (kIndexOffset=1): kIndex=1
                // - Активна 3-я цифра после попаданий (kIndexOffset=2): kIndex=2
            }
            
            // DRILL FILTER: Переопределение заголовка для "1-я Ночь"
            if (drillFilterActive && appDrillFilterLabel === "1️⃣ Активна 1-я цифра") {
                descNightTitle = "1-я Ночь";
            }

            var dead = []; var votedOutPlayers = [];
            var absentReasons = {}; // Причины отсутствия: { playerNum: 'Дисквалифицирован' | 'Удалён' } 
            var shootingVictimsNeeded = 0;

            // Проверка newbie режимов (должна быть первой, чтобы переопределить все остальное)
            // Исключаем who_newbie и mantis_newbie - они обрабатываются в блоке ClassicFire
            if (appGameMode === 'newbie' || appGameMode === 'automatch_newbie' || appGameMode === 'automatch_easy' || appGameMode === 'ahalay_newbie') {
                shootingVictimsNeeded = 0;
            } else if (isWhoMode() || isMantisMode() || isCheckMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
                // Для ClassicFire берем количество попаданий из истории симуляции
                if (typeof classicFireHits !== 'undefined') {
                    shootingVictimsNeeded = classicFireHits;
                } else {
                    shootingVictimsNeeded = (night - 1); // Fallback
                }
            } else {
                // Стандартная логика для Косматики/Ахалая
                shootingVictimsNeeded = kIndex;
            }

            if (drillFilterActive && appDrillFilter.prevHit !== null) {
                if (appDrillFilter.prevHit === false) {
                    // ПРОМАХ: жертв нет, kIndex остается тем же
                    shootingVictimsNeeded = 0;
                } else if (appDrillFilter.prevHit === true) {
                    // ПОПАДАНИЕ: количество жертв = kIndex (активная цифра)
                    // Например, kIndex=1 (2-я цифра) -> 1 жертва прошлой ночи
                    shootingVictimsNeeded = Math.max(0, appDrillFilter.kIndexOffset || 0);
                }
            }
            
            // КРИТИЧЕСКИ ВАЖНО: В первую ночь мафия НЕ убивает!
            // Убийства начинаются только со второй ночи (night >= 2)
            // Эта проверка должна быть ПОСЛЕ всех остальных установок, чтобы гарантировать отсутствие убийств в 1-ю ночь
            if (night === 1) {
                shootingVictimsNeeded = 0;
            }
            
            // Для режимов Ахалая (кроме Newbie и Easy Mode) добавляем вариацию промахов: 60% промах, 40% убийство
            // Применяем вероятность промаха для каждой ночи (начиная с ночи 2)
            if (isAhalayMode() && appGameMode !== 'ahalay_newbie' && appGameMode !== 'ahalay_easy' && night > 1 && shootingVictimsNeeded > 0) {
                // Для каждой ночи с вероятностью 60% будет промах (не добавляем убийство)
                // Для ночи 2: если kIndex = 1, то с вероятностью 60% делаем промах (shootingVictimsNeeded = 0)
                // Для ночи 3: если kIndex = 2, то с вероятностью 60% уменьшаем на 1 (shootingVictimsNeeded = 1)
                //              если kIndex = 1, то с вероятностью 60% делаем промах (shootingVictimsNeeded = 0)
                var missRoll = Math.random();
                if (missRoll < 0.60) {
                    // 60% шанс промаха - уменьшаем количество убийств
                    if (shootingVictimsNeeded === 1) {
                        shootingVictimsNeeded = 0; // Полный промах
                    } else if (shootingVictimsNeeded >= 2) {
                        shootingVictimsNeeded = shootingVictimsNeeded - 1; // Уменьшаем на 1
                    }
                }
                // 40% шанс убийства - оставляем shootingVictimsNeeded как есть
            }

            for (var i = 0; i < shootingVictimsNeeded; i++) {
                var isRedVictim = (Math.random() <= 0.97); var victimPool = isRedVictim ? reds : blacks;
                var available = victimPool.filter(function(p) { return !dead.includes(p) && p !== don; });
                if (available.length === 0) available = seats.filter(function(p) { return !dead.includes(p) && p !== don; });
                if (available.length > 0) dead.push(available[getRandomInt(0, available.length - 1)]);
            }

            var missCount = Math.max(0, (night - 1) - shootingVictimsNeeded);

            if (!isEjectionScenario) {
                for (var d = 0; d < night; d++) {
                    var someoneVotedOut = false;
                    if (d === 0) { if (Math.random() > 0.95) someoneVotedOut = true; }
                    else { if (Math.random() < 0.80) someoneVotedOut = true; }
                    if (someoneVotedOut) {
                        var available = seats.filter(function(p) { return !dead.includes(p) && p !== don; });
                        if (available.length > 0) { var votedOne = available[getRandomInt(0, available.length - 1)]; dead.push(votedOne); votedOutPlayers.push(votedOne); }
                    }
                }
            } else {
                 for (var d = 0; d < night - 1; d++) {
                     if (Math.random() < 0.80) {
                        var available = seats.filter(function(p) { return !dead.includes(p) && p !== don; });
                        if (available.length > 0) { var votedOne = available[getRandomInt(0, available.length - 1)]; dead.push(votedOne); votedOutPlayers.push(votedOne); }
                     }
                }
                var aliveForEjection = seats.filter(function(p) { return !dead.includes(p); }); 
                if (aliveForEjection.length > 0) { ejectedPlayer = aliveForEjection[getRandomInt(0, aliveForEjection.length - 1)]; dead.push(ejectedPlayer); }
            }

            // --- РОСОМАХА: Гарантированная смерть Дона ---
            if (isWolverine) {
                if (!dead.includes(don)) {
                    dead.push(don);
                    if (night === 1) {
                        isEjectionScenario = true;
                        ejectedPlayer = don;
                        votedOutPlayers = votedOutPlayers.filter(function(p) { return p !== don; });
                    } else {
                        if (Math.random() < 0.80) {
                            votedOutPlayers.push(don);
                            isEjectionScenario = false;
                            ejectedPlayer = 0;
                        } else {
                            isEjectionScenario = true;
                            ejectedPlayer = don;
                        }
                    }
                }
                // Докидываем труп красного, чтобы не было скучно
                if (night > 1) {
                    var vic = reds.filter(function(r) { return !dead.includes(r); });
                    if (vic.length > 0 && Math.random() < 0.5) {
                        dead.push(vic[getRandomInt(0, vic.length - 1)]);
                    }
                }
            }

            var alivePlayers = seats.filter(function(s) { return !dead.includes(s); });
            var aliveBlacks = alivePlayers.filter(function(s) { return blacks.includes(s); }).length;
            var aliveReds = alivePlayers.filter(function(s) { return reds.includes(s); }).length;
            // Пропускаем сценарии, где живых черных игроков ровно 1
            if (aliveBlacks === 1) continue;
            if (aliveBlacks >= aliveReds) continue; 
            // Для Росомахи Дон должен быть мертв, поэтому пропускаем проверку dead.includes(don)
            if (!isWolverine && dead.includes(don)) continue; 
            if (aliveBlacks === aliveReds - 1) {
                if (Math.random() > 0.01) continue; 
            }

            scenarioIsValid = true;

            var sheriffRevealChance = 0; 
            if (night === 2) sheriffRevealChance = 0.33;
            if (night >= 3 || missCount >= 2) sheriffRevealChance = 1.0; 

            var sheriff = 0;
            var possibleSheriffs = reds.filter(function(s) { return !dead.includes(s); });
            if (Math.random() <= sheriffRevealChance && possibleSheriffs.length > 0) { 
                sheriff = possibleSheriffs[0]; 
            }
            
            // Применяем кастомного Шерифа (если был задан в Custom Setup)
            if (drillFilterActive && appDrillFilter.active && appDrillFilter.customSheriff && appDrillFilter.customSheriff > 0) {
                var customS = appDrillFilter.customSheriff;
                // Проверяем, что он в красной команде и жив
                if (reds.indexOf(customS) !== -1 && !dead.includes(customS)) {
                    sheriff = customS;
                }
            }

            var checkedB = []; 
            
            var action = 'none'; var digitVal = 0; var actionText = "";
            var isCritical = (aliveBlacks === aliveReds - 1); var actionAttempts = 0; var validActionFound = false;

            var dBlacks = [], dReds = [], dSheriffs = []; 
            var sBlacks = [], sReds = [];

            // ═══════════════════════════════════════════════════════════════
            // АВТО-ГЕНЕРАЦИЯ: «ОХОТА» и «2 ВЕРСИИ» для Nightmare/Impossible
            // (только в стандартном потоке, без активного дрилла)
            // ═══════════════════════════════════════════════════════════════
            var autoHuntMode = false;
            var autoDualVersions = false;
            var isNightmareOrImpossible = (appGameMode === 'nightmare' || appGameMode === 'impossible' || appGameMode === 'automatch_nightmare' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'who_nightmare' || appGameMode === 'who_impossible' || appGameMode === 'mantis_nightmare' || appGameMode === 'mantis_impossible');

            if (!drillFilterActive && isNightmareOrImpossible && sheriff > 0) {
                var autoRoll = Math.random();
                // Вероятность «Охота» (Шериф убит + красные проверки): Nightmare 15%, Impossible 30%
                var huntChance = (appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible') ? 0.30 : 0.15;
                // Вероятность «2 версии» (Шериф жив + Лже-шериф): Nightmare 10%, Impossible 20%
                var dualChance = (appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible') ? 0.20 : 0.10;

                if (night >= 3 && autoRoll < huntChance) {
                    // ═══ АВТО-ОХОТА: Шериф убит, оставил 2-3 красные проверки ═══
                    autoHuntMode = true;

                    // Шериф убит ночью (97%) или заголосован днём (3%)
                    if (Math.random() <= 0.97) {
                        if (!dead.includes(sheriff)) dead.push(sheriff);
                    } else {
                        if (!votedOutPlayers.includes(sheriff)) votedOutPlayers.push(sheriff);
                    }

                    // Генерируем красные проверки Шерифа (2-3 штуки)
                    var availableRedsForHunt = reds.filter(function(r) {
                        return r !== sheriff && !dead.includes(r) && !votedOutPlayers.includes(r) && !blacks.includes(r);
                    });
                    if (availableRedsForHunt.length > 0) {
                        var maxChecksForNight = Math.max(0, night - 1);
                        // 2 или 3 проверки (50/50), ограничено ночью и доступными игроками
                        var numHuntChecks = Math.random() < 0.5 ? 2 : 3;
                        numHuntChecks = Math.min(numHuntChecks, maxChecksForNight);
                        numHuntChecks = Math.min(numHuntChecks, availableRedsForHunt.length);
                        if (numHuntChecks < 1) numHuntChecks = 1;
                        shuffleArray(availableRedsForHunt);
                        for (var hc = 0; hc < numHuntChecks; hc++) {
                            sReds.push(availableRedsForHunt[hc]);
                        }
                    }
                    // Дон не вскрывался (Solo Sheriff) — dReds, dBlacks, dSheriffs остаются пустыми

                } else if (night >= 2 && autoRoll < huntChance + dualChance) {
                    // ═══ АВТО-2 ВЕРСИИ: Шериф жив + Лже-шериф (Дон с проверками) ═══
                    autoDualVersions = true;

                    // Генерируем проверки Шерифа (минимум 1 красная)
                    var availableRedsForSheriff = reds.filter(function(r) {
                        return r !== sheriff && !dead.includes(r) && !blacks.includes(r);
                    });
                    if (availableRedsForSheriff.length > 0) {
                        shuffleArray(availableRedsForSheriff);
                        var numSheriffChecks = Math.min(Math.max(1, night - 1), availableRedsForSheriff.length);
                        for (var sc = 0; sc < numSheriffChecks; sc++) {
                            sReds.push(availableRedsForSheriff[sc]);
                        }
                    }

                    // Генерируем проверки Дона
                    // 50% шанс что один игрок будет красный у ОБОИХ (doubleRedCheck → Охота)
                    // 50% шанс что проверки НЕ пересекаются (обычные 2 версии без Охоты)
                    var doubleRedOverlap = (Math.random() < 0.50);
                    if (doubleRedOverlap && sReds.length > 0) {
                        // Берём одного из красных проверок Шерифа и добавляем в проверки Дона
                        dReds.push(sReds[0]);
                    } else {
                        // Генерируем отдельного красного для Дона (не пересекается с sReds)
                        var availableRedsForDon = reds.filter(function(r) {
                            return r !== sheriff && !dead.includes(r) && !blacks.includes(r) && !sReds.includes(r);
                        });
                        if (availableRedsForDon.length > 0) {
                            shuffleArray(availableRedsForDon);
                            dReds.push(availableRedsForDon[0]);
                        }
                    }
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // ДРИЛЛ: "УБИТ ШЕРИФ"
            // Специальная логика для генерации сценария с мертвым Шерифом
            // ═══════════════════════════════════════════════════════════════
            if (drillFilterActive && appDrillFilter.sheriffDead) {
                // 1. Назначаем Шерифа (если еще не назначен)
                if (sheriff === 0) {
                    var possibleSheriffs = reds.filter(function(s) { return !dead.includes(s); });
                    if (possibleSheriffs.length > 0) {
                        sheriff = possibleSheriffs[getRandomInt(0, possibleSheriffs.length - 1)];
                    }
                }
                
                // 2. КРИТИЧЕСКИ ВАЖНО: ОЧИЩАЕМ МАССИВЫ И ПРАВИЛЬНО РАСПРЕДЕЛЯЕМ ЖЕРТВ
                /**
                 * СТРОГАЯ ЛОГИКА (Согласно правилам игры):
                 * 
                 * ШЕРИФ:
                 * - 97% Шериф убит ночью (dead)
                 * - 3% Шериф заголосован днём (votedOutPlayers)
                 * 
                 * НОЧНЫЕ ЖЕРТВЫ (dead):
                 * - Количество ночных жертв = kIndex (номер активной цифры)
                 * - kIndex = 0 (1-я цифра): dead = [] (жертв нет, начало стрельбы)
                 * - kIndex = 1 (2-я цифра): dead = [1 игрок] (прошла 1 ночь)
                 * - kIndex = 2 (3-я цифра): dead = [2 игрока] (прошло 2 ночи)
                 */
                
                // Очищаем массивы полностью
                dead = [];
                votedOutPlayers = [];
                
                // 3. Шериф убит ночью (97%) или заголосован днём (3%)
                if (sheriff > 0) {
                    if (Math.random() <= 0.97) {
                        dead.push(sheriff);
                    } else {
                        votedOutPlayers.push(sheriff);
                    }
                }
                
                // 4. ГЕНЕРИРУЕМ НОЧНЫЕ ЖЕРТВЫ (в зависимости от активной цифры)
                var nightVictimsCount = kIndex; // kIndex = 0, 1 или 2
                
                for (var nv = 0; nv < nightVictimsCount; nv++) {
                    // Генерируем случайную жертву (97% красные, 3% черные)
                    var isRedVictim = (Math.random() <= 0.97);
                    var victimPool = isRedVictim ? reds : blacks;
                    
                    // Фильтруем доступных: живы, не Дон, не Шериф, не в dead, не в votedOut
                    var availableVictims = victimPool.filter(function(p) { 
                        return !dead.includes(p) && 
                               !votedOutPlayers.includes(p) && 
                               p !== don && 
                               p !== sheriff; 
                    });
                    
                    // Fallback: если пул пуст, берем из всех живых
                    if (availableVictims.length === 0) {
                        availableVictims = seats.filter(function(p) { 
                            return !dead.includes(p) && 
                                   !votedOutPlayers.includes(p) && 
                                   p !== don && 
                                   p !== sheriff; 
                        });
                    }
                    
                    // Добавляем жертву в список НОЧНЫХ мертвых
                    if (availableVictims.length > 0) {
                        var victim = availableVictims[getRandomInt(0, availableVictims.length - 1)];
                        dead.push(victim);
                    }
                }
                
                // 5. Генерируем красные проверки для Шерифа (1-2 живых красных)
                if (appDrillFilter.ensureRedChecks && sheriff > 0) {
                    var availableReds = reds.filter(function(r) { 
                        return r !== sheriff && !dead.includes(r) && !blacks.includes(r); 
                    });
                    
                    // ВАЖНО: Гарантируем минимум 1-2 проверки
                    if (availableReds.length === 0) {
                        // Если нет живых красных (маловероятно), используем всех красных кроме шерифа
                        availableReds = reds.filter(function(r) { return r !== sheriff && !blacks.includes(r); });
                    }
                    
                    if (availableReds.length > 0) {
                        // ВРЕМЕННАЯ ЛОГИКА: Количество проверок = (night - 1)
                        var maxChecksForNight = Math.max(0, night - 1);
                        var numChecks = Math.random() < 0.5 ? 1 : 2; // 1 или 2 проверки
                        numChecks = Math.min(numChecks, maxChecksForNight); // Не больше, чем позволяет временная линия
                        numChecks = Math.min(numChecks, availableReds.length); // Не больше, чем есть доступных
                        
                        shuffleArray(availableReds);
                        
                        for (var rc = 0; rc < numChecks; rc++) {
                            sReds.push(availableReds[rc]);
                        }
                        
                        // ФИНАЛЬНАЯ ГАРАНТИЯ: Если после всего sReds всё еще пуст (не должно быть)
                        if (sReds.length === 0 && availableReds.length > 0) {
                            sReds.push(availableReds[0]); // Добавляем хотя бы одного
                        }
                    }
                }
                
                // 6. Оставляем проверки Дона пустыми (Дон не вскрывался)
                if (appDrillFilter.donNoChecks) {
                    dBlacks = [];
                    dReds = [];
                    dSheriffs = [];
                }
                
                // 7. КРИТИЧЕСКАЯ ВАЛИДАЦИЯ: Проверяем, что у Шерифа есть проверки
                // ВАЖНО: Только если временная линия позволяет (night >= 2)
                if (appDrillFilter.ensureRedChecks && night >= 2 && sReds.length === 0) {
                    // Если после всех попыток проверок нет - это критическая ошибка
                    // Пропускаем этот вариант сценария и генерируем новый
                    continue; // Переход к следующей итерации while loop
                }
            }
            
            // ═══════════════════════════════════════════════════════════════
            // ДРИЛЛ: "ШЕРИФ ЖИВ"
            // Гарантируем что Шериф будет живым и не попадёт в dead
            // ═══════════════════════════════════════════════════════════════
            if (drillFilterActive && appDrillFilter.sheriffAlive) {
                // 1. Назначаем Шерифа (если еще не назначен)
                if (sheriff === 0) {
                    var possibleSheriffs = reds.filter(function(s) { return !dead.includes(s); });
                    if (possibleSheriffs.length > 0) {
                        sheriff = possibleSheriffs[getRandomInt(0, possibleSheriffs.length - 1)];
                    }
                }
                
                // 2. КРИТИЧЕСКИ ВАЖНО: Удаляем Шерифа из списка мертвых (если он там)
                if (sheriff > 0 && dead.includes(sheriff)) {
                    dead = dead.filter(function(p) { return p !== sheriff; });
                }
            }
            
            // ═══════════════════════════════════════════════════════════════
            // ДРИЛЛ: "2 ВЕРСИИ" (Лже-шериф)
            // Гарантируем что у обоих (Шериф + Дон) есть проверки
            // ═══════════════════════════════════════════════════════════════
            if (drillFilterActive && appDrillFilter.dualVersions && appDrillFilter.ensureBothChecks) {
                // 1. Назначаем Шерифа (если еще не назначен)
                if (sheriff === 0 && night >= 2) {
                    var possibleSheriffs = reds.filter(function(s) { return !dead.includes(s); });
                    if (possibleSheriffs.length > 0) {
                        sheriff = possibleSheriffs[getRandomInt(0, possibleSheriffs.length - 1)];
                    }
                }
                
                // 2. Генерируем красные проверки для Шерифа (минимум 1 живой красный)
                if (sheriff > 0 && night >= 2) {
                    var availableReds = reds.filter(function(r) { 
                        return r !== sheriff && !dead.includes(r) && !blacks.includes(r); 
                    });
                    
                    if (availableReds.length > 0) {
                        shuffleArray(availableReds);
                        sReds.push(availableReds[0]); // Добавляем минимум 1 проверку
                    }
                }
                
                // 3. Генерируем красные проверки для Дона (минимум 1 живой красный)
                if (night >= 2) {
                    var availableReds = reds.filter(function(r) { 
                        return r !== sheriff && !dead.includes(r) && !blacks.includes(r) && !sReds.includes(r);
                    });
                    
                    if (availableReds.length > 0) {
                        shuffleArray(availableReds);
                        dReds.push(availableReds[0]); // Добавляем минимум 1 проверку
                    }
                }
            }
            
            // Пропускаем стандартную генерацию проверок, если активен специальный дрилл или авто-сценарий
            var skipStandardChecks = (drillFilterActive && (appDrillFilter.sheriffDead || appDrillFilter.dualVersions)) || autoHuntMode || autoDualVersions;
            
            if (!skipStandardChecks && (appGameMode === 'nightmare' || appGameMode === 'impossible' || appGameMode === 'automatch_nightmare' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible') && night >= 3) {
                var sKnown = [], dKnown = [];
                
                for(var i=1; i<night; i++) {
                    if(sheriff > 0) {
                        var possibleS = seats.filter(function(p){ return p !== sheriff && !sKnown.includes(p); });
                        if(possibleS.length > 0) {
                            var checkedS = possibleS[getRandomInt(0, possibleS.length - 1)];
                            sKnown.push(checkedS);
                            if(blacks.includes(checkedS)) { sBlacks.push(checkedS); if(!checkedB.includes(checkedS)) checkedB.push(checkedS); } 
                            else sReds.push(checkedS);
                        }
                    }
                    
                    var possibleD = seats.filter(function(p){ return p !== don && !dKnown.includes(p); });
                    
                    if(possibleD.length > 0) {
                        var checkedD = possibleD[getRandomInt(0, possibleD.length - 1)];
                        dKnown.push(checkedD);
                        var mafiaFoundCount = dBlacks.length + dSheriffs.length;
                        var forceRed = (mafiaFoundCount >= 3);
                        if(!forceRed && Math.random() > 0.5) {
                            dBlacks.push(checkedD); 
                            if(!checkedB.includes(checkedD)) checkedB.push(checkedD); 
                        } else {
                            if (checkedD === sheriff) { dSheriffs.push(checkedD); } else { dReds.push(checkedD); }
                        }
                    }
                }
            } else if (!skipStandardChecks) {
                var donCheckChance = 0;
                if (night === 2) donCheckChance = 0.5;
                if (night >= 3 || missCount >= 2) donCheckChance = 1.0;
    
                if (night >= 2 && Math.random() <= donCheckChance) { 
                   var aliveReds = reds.filter(function(r) { return !dead.includes(r); }); 
                   if (aliveReds.length > 0) checkedB.push(aliveReds[0]); 
                }
            }
            
            // --- AUTOMATCH MIRROR/ECHO GENERATION ---
            var mirrorActive = false;
            if (isAutomatchMode()) {
                // 50% Hands (Echo) vs 30% Nothing (Static)
                // Ratio: 50 / (50+30) = 0.625
                if (Math.random() < 0.625) mirrorActive = true;
            }
            
            // ═══════════════════════════════════════════════════════════════
            // ОГРАНИЧЕНИЕ КОЛИЧЕСТВА ПРОВЕРОК ПО ВРЕМЕННОЙ ЛОГИКЕ
            // ═══════════════════════════════════════════════════════════════
            // Формула: MaxChecks = CurrentNight - 1
            // Если Наступает Ночь 1 -> 0 проверок (еще ничего не известно)
            // Если Наступает Ночь 2 -> 1 проверка (результат 1-й ночи)
            // Если Наступает Ночь 3 -> 2 проверки (результаты 1-й и 2-й ночей)
            var maxAllowedChecks = Math.max(0, night - 1);
            
            // Применяем ограничение ко всем массивам проверок
            if (sReds.length > maxAllowedChecks) {
                sReds = sReds.slice(0, maxAllowedChecks);
            }
            if (sBlacks.length > maxAllowedChecks) {
                sBlacks = sBlacks.slice(0, maxAllowedChecks);
            }
            if (dReds.length > maxAllowedChecks) {
                dReds = dReds.slice(0, maxAllowedChecks);
            }
            if (dBlacks.length > maxAllowedChecks) {
                dBlacks = dBlacks.slice(0, maxAllowedChecks);
            }
            if (dSheriffs.length > maxAllowedChecks) {
                dSheriffs = dSheriffs.slice(0, maxAllowedChecks);
            }
            
            // Также ограничиваем checkedB (общий массив черных проверок)
            if (checkedB.length > maxAllowedChecks) {
                checkedB = checkedB.slice(0, maxAllowedChecks);
            }
            // ═══════════════════════════════════════════════════════════════
            
            // Формируем объединенный массив checkedReds (для обратной совместимости)
            var allCheckedReds = sReds.concat(dReds.filter(function(r) { return !sReds.includes(r); }));
            
            // ═══════════════════════════════════════════════════════════════
            // КРИТИЧЕСКИ ВАЖНО: Подготовка deadPlayers для solveKosmatika
            // ═══════════════════════════════════════════════════════════════
            // ИСПРАВЛЕНО: Функция solveKosmatika теперь сама проверяет votedOutPlayers
            // для определения мёртв ли Шериф. Старый workaround больше не нужен.
            // ═══════════════════════════════════════════════════════════════
            
            var partialState = { 
                kosmatikaList: kosmatika, 
                kIndex: kIndex, 
                donSeat: don, 
                blackTeam: blacks, 
                deadPlayers: dead, // Передаём оригинальный массив (только ночные жертвы)
                votedOutPlayers: votedOutPlayers, // Игроки, убитые днём (для проверки мёртв ли Шериф)
                checkedBlacks: checkedB, 
                checkedReds: allCheckedReds,  // Общий массив красных проверок
                sheriffCheckedReds: sReds,    // Красные проверки Шерифа
                donCheckedReds: dReds,        // Красные проверки Дона
                donCheckedBlacks: dBlacks,    // Черные проверки Дона (для правила "Единственного Шерифа")
                sheriffSeat: sheriff, 
                nightNum: night, 
                mirrorActive: mirrorActive 
            };

            while(!validActionFound && actionAttempts < 50) {
                actionAttempts++;
                if (appDrillState.isActive && forceActionType) {
                    // Логика Drill Mode (оставляем как есть)
                    if (forceActionType === 'none') { action = 'none'; } else { action = (Math.random() > 0.5) ? 'badge' : 'digit'; }
                } else if (drillForceActionType) {
                    action = drillForceActionType;
                } else {
                    if (isEjectionScenario) { 
                        var rAct = Math.random(); 
                        if (rAct < 0.50) action = 'none'; else if (rAct < 0.90) action = 'badge'; else action = 'digit'; 
                    } 
                    else {
                        if (isAutomatchMode()) {
                             var rA = Math.random();
                             if (rA < 0.80) action = 'none'; // 80% Статика/Эхо
                             else if (rA < 0.90) action = 'badge'; 
                             else action = 'digit'; 
                        } 
                        // --- ЛОГИКА ДЛЯ АХАЛАЯ ---
                        else if (isAhalayMode()) {
                             // В режиме Ахалай Дон ВСЕГДА показывает жест (математика)
                             // 50% Цифра, 50% Жетон
                             action = (Math.random() > 0.5) ? 'badge' : 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ КТО (ClassicFire) ---
                        else if (isWhoMode()) {
                             // В режиме "Кто" Дон ВСЕГДА показывает только ЦИФРУ (1-10)
                             // НЕТ жетона, НЕТ указания на игрока
                             action = 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ БОГОМОЛА (ClassicFire) ---
                        else if (isMantisMode()) {
                             // В режиме "Богомол" Дон ВСЕГДА показывает только ЦИФРУ (1-10)
                             // НЕТ жетона, НЕТ указания на игрока
                             action = 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ ПРОВЕРКИ (ClassicFire) ---
                        else if (isCheckMode()) {
                             // В режиме "Проверка" Дон ВСЕГДА показывает только ЦИФРУ (1-10)
                             // НЕТ жетона, НЕТ указания на игрока
                             action = 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ КРАСНОГО (ClassicFire) ---
                        else if (isRedMode()) {
                             // В режиме "Красный" Дон ВСЕГДА показывает 👍 и ЦИФРУ (1-10)
                             action = 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ ЧЁРНОГО (ClassicFire) ---
                        else if (isBlackMode()) {
                             // В режиме "Чёрный" Дон ВСЕГДА показывает 👎 и ЦИФРУ (1-10)
                             action = 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ КРАСНОГО/ЧЁРНОГО (ClassicFire) ---
                        else if (isRedBlackMode()) {
                             // В режиме "Красный/Чёрный" Дон ВСЕГДА показывает 👍👎 и ЦИФРУ (1-10)
                             action = 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ ВИНЧЕСТЕРА ---
                        else if (isWinchesterMode()) {
                             // Для Винчестера: 30% hand1, 30% hand2, 15% none, 15% badge, 10% digit
                             var rWin = Math.random();
                             if (rWin < 0.30) action = 'hand1';
                             else if (rWin < 0.60) action = 'hand2';
                             else if (rWin < 0.75) action = 'none';
                             else if (rWin < 0.90) action = 'badge';
                             else action = 'digit';
                        }
                        // --- ЛОГИКА ДЛЯ БАЗУКИ (InstaFire) ---
                        else if (isBazookaMode()) {
                             // Для Базуки action всегда 'bazooka_gesture'
                             // Реальные жесты генерируются отдельно (bazookaGestureState)
                             action = 'bazooka_gesture';
                        }
                        // -------------------------------
                        else {
                             // Классическая косматика (преимущественно статика)
                             var actions = ['none', 'none', 'badge', 'digit']; 
                             action = actions[getRandomInt(0, actions.length-1)]; 
                        }
                    }
                    
                    // FORCE DIGIT for ClassicFire modes (Override any random selection or ejection result)
                    if (isRedMode() || isBlackMode() || isRedBlackMode() || isWhoMode() || isMantisMode() || isCheckMode()) {
                        action = 'digit';
                    }
                }

                if (action === 'digit') {
                    // Для режима ahalay_newbie: 0 или 1 по 50%
                    if (appGameMode === 'ahalay_newbie') {
                        digitVal = (Math.random() > 0.5) ? 1 : 0;
                    } else if (appGameMode === 'who_newbie') {
                        // Для Who newbie: 1-10 для интересного счета
                        digitVal = getRandomInt(1, 10);
                    } else {
                        // Для Who и остальных режимов: 1-10
                        digitVal = getRandomInt(1, 10);
                    }
                } else {
                    digitVal = 0;
                }
                
                // === БАЗУКА: Специальная генерация жеста и решение ===
                if (isBazookaMode()) {
                    // Генерируем параметры Базуки
                    var bazookaBase = kosmatika[0]; // Базовая цифра
                    var bazookaDominantHand = (Math.random() > 0.5) ? 'right' : 'left'; // Главная рука
                    var bazookaIsPro = false;
                    var bazookaAhalayTarget = null;
                    
                    // PRO режим для Hard+
                    if (appGameMode === 'bazooka_hard' || appGameMode === 'bazooka_nightmare' || appGameMode === 'bazooka_impossible') {
                        bazookaIsPro = (Math.random() < 0.3); // 30% шанс PRO-режима
                    }
                    
                    // Выбираем физический жест (какой рукой тянется к маске)
                    // ahalay_direct доступен для Hard+ (10% шанс)
                    var bazookaPhysicalGesture; // 'right_hand', 'both_hands', 'left_hand', 'hands_down', 'ahalay_direct'
                    var bazookaGestureState; // число 1-4 или объект {ahalay_target: N}
                    
                    var gestureRoll = Math.random();
                    var ahalayChance = (appGameMode === 'bazooka_hard' || appGameMode === 'bazooka_nightmare' || appGameMode === 'bazooka_impossible') ? 0.10 : 0;
                    
                    if (gestureRoll < ahalayChance) {
                        // Ахалай — прямой заказ
                        bazookaPhysicalGesture = 'ahalay_direct';
                        var ahalayPool = reds.filter(function(r) { return !dead.includes(r); });
                        bazookaAhalayTarget = ahalayPool[getRandomInt(0, ahalayPool.length - 1)];
                        bazookaGestureState = { ahalay_target: bazookaAhalayTarget };
                    } else {
                        // Обычный жест рук: случайный из 4 вариантов
                        var physicalOptions = ['right_hand', 'both_hands', 'left_hand', 'hands_down'];
                        bazookaPhysicalGesture = physicalOptions[getRandomInt(0, 3)];
                        
                        // Определяем смещение по правилам
                        if (bazookaPhysicalGesture === 'right_hand') {
                            bazookaGestureState = (bazookaDominantHand === 'right') ? 1 : 3;
                        } else if (bazookaPhysicalGesture === 'both_hands') {
                            bazookaGestureState = 2;
                        } else if (bazookaPhysicalGesture === 'left_hand') {
                            bazookaGestureState = (bazookaDominantHand === 'left') ? 1 : 3;
                        } else { // hands_down
                            bazookaGestureState = 4;
                        }
                    }
                    
                    // Считаем цель через calculateBazooka
                    var bazookaResult = calculateBazooka(don, blacks, bazookaBase, bazookaGestureState, bazookaIsPro, 'instafire', {
                        deadList: dead,
                        checkedBlacks: checkedB,
                        sheriff: sheriff,
                        currentNight: night,
                        dominantHand: bazookaDominantHand
                    });
                    
                    if (!bazookaResult || !bazookaResult.target) {
                        validActionFound = false;
                        continue;
                    }
                    
                    // Проверяем, что цель — красный (не свой)
                    if (isCritical && blacks.includes(bazookaResult.target)) {
                        continue;
                    }
                    
                    // Сохраняем данные Базуки для рендера
                    partialState.bazookaBase = bazookaBase;
                    partialState.bazookaDominantHand = bazookaDominantHand;
                    partialState.bazookaIsPro = bazookaIsPro;
                    partialState.bazookaPhysicalGesture = bazookaPhysicalGesture;
                    partialState.bazookaGestureState = bazookaGestureState;
                    partialState.bazookaAhalayTarget = bazookaAhalayTarget;
                    
                    appCurrentSolution = {
                        target: bazookaResult.target,
                        method: bazookaResult.method,
                        logs: bazookaResult.logs,
                        base: bazookaBase,
                        gestureVal: (typeof bazookaGestureState === 'number') ? bazookaGestureState : 0,
                        donActionRaw: 'bazooka_gesture'
                    };
                    
                    validActionFound = true;
                    // Пропускаем стандартный solveKosmatika для Базуки
                } else {
                    // Стандартная логика для всех остальных динамик
                    partialState.donAction = action; partialState.donDigitVal = digitVal;
                    var testResult = solveKosmatika(partialState);
                    if (isCritical) { if (blacks.includes(testResult.target)) continue; }
                    if (appDrillState.isActive) { if (testResult.logicTag !== appDrillState.requiredLogicTag) continue; }
                    validActionFound = true;
                }
                validActionFound = true;
            }
            if (!validActionFound) continue;

            if (drillFilterActive && appDrillFilter.prevHit !== null) {
                if (appDrillFilter.prevHit === true) {
                    var forcedHits = Math.max(0, appDrillFilter.kIndexOffset || 0);
                    var simDead = [];
                    var forcedTargets = [];
                    for (var h = 0; h < forcedHits; h++) {
                        var simState = {
                            kosmatikaList: kosmatika,
                            kIndex: h,
                            donSeat: don,
                            blackTeam: blacks,
                            deadPlayers: simDead.slice(),
                            checkedBlacks: [],
                            sheriffSeat: 0,
                            nightNum: Math.max(1, h + 1),
                            donAction: action,
                            donDigitVal: digitVal
                        };
                        var simResult = solveKosmatika(simState);
                        if (simResult && simResult.target) {
                            simDead.push(simResult.target);
                            forcedTargets.push(simResult.target);
                        }
                    }
                    forcedTargets.forEach(function(t) {
                        if (!dead.includes(t)) dead.push(t);
                    });
                } else if (night > 1) {
                    var prevState = {
                        kosmatikaList: kosmatika,
                        kIndex: kIndex,
                        donSeat: don,
                        blackTeam: blacks,
                        deadPlayers: [],
                        checkedBlacks: [],
                        sheriffSeat: 0,
                        nightNum: Math.max(1, night - 1),
                        donAction: action,
                        donDigitVal: digitVal
                    };
                    var prevResult = solveKosmatika(prevState);
                    if (prevResult && prevResult.target && dead.includes(prevResult.target)) {
                        dead = dead.filter(function(p) { return p !== prevResult.target; });
                        var replacementPool = seats.filter(function(p) { return !dead.includes(p) && p !== don; });
                        if (replacementPool.length > 0) {
                            dead.push(replacementPool[getRandomInt(0, replacementPool.length - 1)]);
                        }
                    }
                }

                checkedB = checkedB.filter(function(p) { return !dead.includes(p); });
                
                // ВАЖНО: Если Шериф был в списке ночных мертвых (не должно быть в дриллах), удаляем его
                if (sheriff > 0 && dead.includes(sheriff)) sheriff = 0;
                
                // КРИТИЧЕСКИ ВАЖНО: Обновляем deadPlayers правильно (с Шерифом для логики Solo Sheriff)
                var updatedDeadForCalc = dead.slice(); // Копия текущего состояния dead
                if (drillFilterActive && appDrillFilter.sheriffDead && sheriff > 0 && votedOutPlayers.includes(sheriff)) {
                    if (!updatedDeadForCalc.includes(sheriff)) {
                        updatedDeadForCalc.push(sheriff);
                    }
                }
                
                partialState.deadPlayers = updatedDeadForCalc; // Используем правильный массив
                partialState.checkedBlacks = checkedB;
                partialState.sheriffSeat = sheriff;

                var alivePlayersCheck = seats.filter(function(s) { return !dead.includes(s); });
                var aliveBlacksCheck = alivePlayersCheck.filter(function(s) { return blacks.includes(s); }).length;
                var aliveRedsCheck = alivePlayersCheck.filter(function(s) { return reds.includes(s); }).length;
                if (aliveBlacksCheck === 1) continue;
                if (aliveBlacksCheck >= aliveRedsCheck) continue;
                if (!isWolverine && dead.includes(don)) continue;
                if (aliveBlacksCheck === aliveRedsCheck - 1) {
                    if (Math.random() > 0.01) continue;
                }
            }

            // --- РОСОМАХА: Генерация действий ---
            var wolvAction = 'none';
            var wolvDigit = 0;
            var donText = "";
            var wolvText = "";
            
            if (isWolverine) {
                // ГЕНЕРАЦИЯ ДЛЯ РОСОМАХИ (Легенда смерти Дона)
                var rDon = Math.random();
                if (rDon < 0.25) {
                    var tx = (sheriff > 0) ? sheriff : reds.filter(function(r) { return !dead.includes(r); })[0];
                    donText = 'взял 4-ый фол "я дон, шериф игрок ' + tx + ', стреляем в ' + tx + '"';
                } else if (rDon < 0.5) {
                    var rr = reds.filter(function(r) { return !dead.includes(r); });
                    var rrVal = (rr.length > 1) ? rr[1] : rr[0];
                    donText = 'лже-вскрылся "я дон, шериф ' + rrVal + ', проверил, стреляем в ' + rrVal + '"';
                } else if (rDon < 0.75) {
                    donText = 'показал цифру ' + getRandomInt(1,10);
                } else {
                    donText = 'показал Жетон';
                }

                // Действие Росомахи
                var rW = Math.random();
                if (rW < 0.3) { 
                    wolvAction = 'none'; 
                    wolvText = 'ничего не показывал'; 
                } else if (rW < 0.9) { 
                    wolvAction = 'digit'; 
                    wolvDigit = getRandomInt(1,10); 
                    wolvText = 'показал цифру ' + wolvDigit; 
                } else { 
                    wolvAction = 'badge'; 
                    wolvText = 'показал Жетон'; 
                }
            }
            
            var dynamicColorType = null; // Initialize variable to capture Red/Black choice for RedBlack mode
            // Initialize appCurrentScenarioData as empty object to allow setting properties
            if (!appCurrentScenarioData || typeof appCurrentScenarioData !== 'object') {
                appCurrentScenarioData = {};
            }
            
            if (action === 'none') {
                 if (isAutomatchMode() && mirrorActive) actionText = "Показал кисть руки (🖐️) или обе кисти рук (🖐️)(🖐️)";
                 else actionText = "Ничего не показывал"; 
            } else if (action === 'badge') actionText = "Показал 👌 (жетон)"; 
            else if (action === 'hand1') actionText = "Показал кисть руки (🖐️)";
            else if (action === 'hand2') actionText = "Показал обе кисти рук (🖐️🖐️)";
            else if (action === 'digit') {
                if (isRedMode()) {
                    actionText = "цифру " + (digitVal === 0 ? 10 : digitVal) + " +👍красный";
                } else if (isBlackMode()) {
                    actionText = "цифру " + (digitVal === 0 ? 10 : digitVal) + " +👎чёрный";
                } else if (isRedBlackMode()) {
                    // Use the variant defined at the start of the loop
                    if (rbVariant === 'red') {
                        actionText = "цифру " + (digitVal === 0 ? 10 : digitVal) + " +👍красный";
                        // We will pass this to data below
                    } else {
                        actionText = "цифру " + (digitVal === 0 ? 10 : digitVal) + " +👎чёрный";
                    }
                } else {
                    actionText = "Показал цифру " + (digitVal === 0 ? 10 : digitVal);
                }
            }
            else if (action === 'hand1') actionText = "Показал кисть руки (🖐️)";
            else if (action === 'hand2') actionText = "Показал обе кисти рук (🖐️)(🖐️)";
            else if (action === 'bazooka_gesture') {
                // Базука: формируем текст действия с физическим жестом
                var bpg = partialState.bazookaPhysicalGesture;
                var bdh = partialState.bazookaDominantHand;
                var bIsPro = partialState.bazookaIsPro;

                if (bpg === 'ahalay_direct') {
                    actionText = '👋 Ахалай — прямой заказ: игрок ' + partialState.bazookaAhalayTarget;
                } else if (bpg === 'right_hand') {
                    if (bIsPro && bdh === 'left') {
                        // Правая = не главная (главная — левая)
                        actionText = 'Тянется к маске НЕ ГЛАВНОЙ рукой (правая)';
                    } else if (bIsPro && bdh === 'right') {
                        // Правая = главная
                        actionText = 'Тянется к маске ГЛАВНОЙ рукой (правая)';
                    } else {
                        actionText = 'Тянется к маске ПРАВОЙ рукой';
                    }
                } else if (bpg === 'left_hand') {
                    if (bIsPro && bdh === 'right') {
                        // Левая = не главная (главная — правая)
                        actionText = 'Тянется к маске НЕ ГЛАВНОЙ рукой (левая)';
                    } else if (bIsPro && bdh === 'left') {
                        // Левая = главная
                        actionText = 'Тянется к маске ГЛАВНОЙ рукой (левая)';
                    } else {
                        actionText = 'Тянется к маске ЛЕВОЙ рукой';
                    }
                } else if (bpg === 'both_hands') {
                    actionText = 'Тянется к маске ДВУМЯ руками';
                } else if (bpg === 'hands_down') {
                    actionText = 'Руки опущены / спрятаны (маска уже надета)';
                }
            }
            
            // ═══════════════════════════════════════════════════════════════
            // АДАПТАЦИЯ ACTION ПОД СИСТЕМУ ДРИЛЛОВ (ДО ВЫЗОВА solveKosmatika)
            // ═══════════════════════════════════════════════════════════════
            var originalAction = action; // Сохраняем оригинальный action для UI
            var drillSystemMode = (typeof currentDrillSystem !== 'undefined') ? currentDrillSystem : 'kosmatika';
            var winchesterHandType = null;
            
            if (drillFilterActive || appDrillState.isActive) {
                if (drillSystemMode === 'winchester') {
                    // Для Винчестера в дриллах: генерируем случайный тип руки
                    winchesterHandType = (Math.random() > 0.5) ? 'one' : 'two';
                    
                    // Если action был 'none', заменяем на hand1/hand2 (Эхо)
                    if (action === 'none') {
                        action = (winchesterHandType === 'one') ? 'hand1' : 'hand2';
                        partialState.donAction = action;
                    }
                    // Если action был 'digit' или 'badge', оставляем как есть (FlashFire)
                    // но сохраняем тип руки для отображения в UI
                }
            }
            
            // Обновляем partialState для Росомахи
            if (isWolverine) {
                partialState.wolverineSeat = wolverineSeat;
                partialState.wolverineKosmatika = wolverineKosmatika;
                partialState.wolverineAction = wolvAction;
                partialState.wolverineDigit = wolvDigit;
            }
            
            // ═══════════════════════════════════════════════════════════════
            // МОДУЛЬНЫЙ РАСЧЕТ РЕШЕНИЯ ДЛЯ ДРИЛЛОВ (Switch-based Architecture)
            // ═══════════════════════════════════════════════════════════════
            /**
             * Архитектура расчета решения:
             * - Каждый режим (Косматика/Автомат/Винчестер) имеет свой case в switch
             * - Расширяемость: для добавления нового режима достаточно добавить case
             * - Модульность: каждый case содержит только специфичную логику своего режима
             * - Чистота: нет лишних префиксов, так как лейбл заказа показывает активную систему
             */
            if (drillFilterActive || appDrillState.isActive) {
                // Используем модульный подход: выбираем систему расчета через switch
                var tempMode = appGameMode; // Сохраняем текущий режим
                
                switch (drillSystemMode) {
                    case 'kosmatika':
                        // КОСМАТИКА: Стандартная математика Заказа
                        // - Дон показывает цифру/жетон
                        // - Расчет: База (цифра заказа) + жест Дона
                        appCurrentSolution = solveKosmatika(partialState);
                        break;
                    
                    case 'auto':
                        // АВТОМАТ: Смещение на +1 игрока от динамики
                        // - Дон показывает цифру/жетон → Стреляем в (Цель + 1)
                        // - Эхо-статика: Если показаны руки → Зеркало (mirrorActive)
                        appGameMode = 'automatch_' + currentDrillDifficulty;
                        
                        if (action === 'hands') {
                            partialState.mirrorActive = true;
                        }
                        
                        appCurrentSolution = solveKosmatika(partialState);
                        break;
                    
                    case 'winchester':
                        // ВИНЧЕСТЕР: Жесты рук (+3 / +6) и FlashFire (цифра)
                        // - Одна рука: +3 к базе
                        // - Две руки: +6 к базе
                        // - FlashFire (цифра): Стреляем в показанную цифру
                        appGameMode = 'winchester_' + currentDrillDifficulty;
                        appCurrentSolution = solveKosmatika(partialState);
                        break;
                    
                    case 'bazooka':
                        // БАЗУКА: Решение уже вычислено в блоке isBazookaMode() выше
                        // через calculateBazooka — не перезаписываем appCurrentSolution
                        break;
                    
                    default:
                        // FALLBACK: Если система не распознана, используем Косматику
                        console.warn('Unknown drill system:', drillSystemMode);
                        appCurrentSolution = solveKosmatika(partialState);
                        break;
                }
                
                // Сохраняем оригинальное действие для UI
                appCurrentSolution.donActionRaw = originalAction;
                
                // Возвращаем режим обратно
                appGameMode = tempMode;
            } else {
                // Если дриллы не активны, используем стандартную логику
                if (isBazookaMode()) {
                    // Базука уже вычислила appCurrentSolution выше
                    // Ничего не делаем
                } else {
                    appCurrentSolution = solveKosmatika(partialState);
                    appCurrentSolution.donActionRaw = originalAction;
                }
            }

            // === НАЧАЛО ИЗМЕНЕННОГО БЛОКА ФОРМИРОВАНИЯ ТЕКСТА ===
            
            // 1. Формируем Блок "Ночь и Активная цифра"
            var txtNight = "";
            
            // ═══════════════════════════════════════════════════════════════
            // КРИТИЧЕСКИ ВАЖНО: ОТОБРАЖЕНИЕ ИГРОКОВ, ПОКИНУВШИХ СТОЛ ДНЕМ
            // ═══════════════════════════════════════════════════════════════
            /**
             * ПРОБЛЕМА:
             * Для дриллов "Убит Шериф" мы переместили Шерифа в votedOutPlayers,
             * чтобы он не считался ночной жертвой. НО пользователь не видит,
             * что Шериф мертв, и думает, что он жив.
             * 
             * РЕШЕНИЕ:
             * Явно отображаем список игроков из votedOutPlayers ПЕРЕД текстом
             * "Наступает Ночь...", чтобы было видно, кто покинул стол днем.
             */
            if (votedOutPlayers && votedOutPlayers.length > 0) {
                // Формируем список игроков, отмечая Шерифа специальной меткой
                var votedNames = votedOutPlayers.map(function(p) {
                    if (p === sheriff && sheriff > 0) {
                        return '<strong style="color:#ff5252;">' + p + ' (Шериф)</strong>';
                    } else {
                        return p;
                    }
                }).join(", ");
                
                // Добавляем информацию о проголосованных в начало блока
                txtNight += '<div style="background:rgba(255,82,82,0.1); padding:8px; margin-bottom:10px; border-left:3px solid #ff5252; border-radius:4px;">';
                txtNight += '❌ <strong>Днем покинули стол:</strong> ' + votedNames + '.';
                txtNight += '</div>';
            }
            
            // Добавляем стандартный текст о наступающей ночи
            txtNight += "Наступает " + descNightTitle + ".<br>";
            
            // СПЕЦИАЛЬНАЯ ЛОГИКА ТЕКСТА ДЛЯ КТО И БОГОМОЛ (ClassicFire)
            if (isWhoMode() || isMantisMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
                var activeDigitNum = kIndex + 1;
                var histInfo = "";
                
                // Проверяем историю симуляции (если она есть)
                if (typeof simResult !== 'undefined' && simResult.history && simResult.history.length > 0) {
                    var hitsCount = simResult.history.filter(function(h){ return h.isHit; }).length;
                    var missCount = simResult.history.length - hitsCount;
                    
                    if (hitsCount === 0) {
                        // ТОЛЬКО ЕСЛИ РЕАЛЬНО БЫЛИ ОДНИ ПРОМАХИ
                        if (night === 2) histInfo = "В прошлую ночь был промах.";
                        else histInfo = "Предыдущие ночи были промахи.";
                    } else {
                        // БЫЛИ ПОПАДАНИЯ - Перечисляем жертв
                        var prevVictims = dead.filter(function(d){ return d !== ejectedPlayer && !votedOutPlayers.includes(d); }).sort(function(a,b){return b-a});
                        if (prevVictims.length > 0) {
                            var victimsList = prevVictims.join(" и "); // Упрощенно
                            histInfo = "Убиты: " + victimsList + ".";
                        } else {
                            histInfo = "Смещения цифр по попаданиям.";
                        }
                    }
                } else {
                    // Fallback для ночи 1 или когда истории нет
                    if (night === 1) {
                        histInfo = "Все игроки за столом.";
                    } else {
                        histInfo = "Смещения цифр по попаданиям."; // Fallback
                    }
                }
                
                txtNight += '<span style="color:#aaa; font-weight:normal; font-size:0.9em;">' + histInfo + ' <span class="helper-info">Активна ' + activeDigitNum + '-я цифра.</span></span>';
                
                // Добавляем техническую историю (как мы делали раньше)
                if (typeof simResult !== 'undefined' && simResult.history && simResult.history.length > 0) {
                     var histText = simResult.history.map(function(h) {
                        return "Ночь " + h.night + " (" + (h.activeIndex+1) + "-я цифра): " + (h.isHit ? "❌ Попадание" : "💨 Промах");
                    }).join("<br>");
                    txtNight += '<div class="expl-step" style="margin-top:5px; font-size:0.85em;">📜 История круга:<br>' + histText + '</div>';
                }

            } else {
                // СТАНДАРТНАЯ ЛОГИКА (Косматика / Ахалай / Автомат)
                var activeSuffix = (appGameMode.indexOf('newbie') !== -1 || appGameMode === 'automatch_easy') ? '' : ' Активна 1-я цифра.';
                var mentionedInHeader = [];

                if (kIndex === 0) {
                    if (night === 1) txtNight += '<span style="color:#aaa; font-weight:normal; font-size:0.9em;"><span class="helper-info">Все игроки за столом.' + activeSuffix + '</span></span>';
                    else if (night === 2) txtNight += '<span style="color:#aaa; font-weight:normal; font-size:0.9em;"><span class="helper-info">В прошлую ночь был промах.' + activeSuffix + '</span></span>';
                    else txtNight += '<span style="color:#aaa; font-weight:normal; font-size:0.9em;"><span class="helper-info">Предыдущие ночи были промахи.' + activeSuffix + '</span></span>';
                } else if (kIndex >= 1) {
                    var prevVictims = dead.filter(function(d){ return d !== ejectedPlayer && !votedOutPlayers.includes(d); }).sort(function(a,b){return b-a});
                    var victimsCount = prevVictims.length;
                    
                    if (victimsCount > 0) {
                        for (var vi = 0; vi < prevVictims.length; vi++) { mentionedInHeader.push(prevVictims[vi]); }
                        
                        var victimsText = "";
                        if (victimsCount === 1) victimsText = "Убит " + prevVictims[0];
                        else if (victimsCount === 2) victimsText = "Убиты " + prevVictims[0] + " и " + prevVictims[1];
                        else {
                            var victimsList = prevVictims.slice(0, -1).join(", ");
                            var lastVictim = prevVictims[prevVictims.length - 1];
                            victimsText = "Убиты " + victimsList + " и " + lastVictim;
                        }
                        
                        var activeInfo = (kIndex === 1) ? "Активна 2-я цифра." : (kIndex === 2) ? "Активна 3-я цифра." : "Активна " + (kIndex + 1) + "-я цифра.";
                        // Добавляем жертв в блок ночи, так как это объясняет активную цифру
                        txtNight += '<span style="color:#aaa; font-weight:normal; font-size:0.9em;">' + victimsText + '. <span class="helper-info">' + activeInfo + '</span></span>';
                    }
                }
            }

            // 2. Формируем Блок "История / Состояние стола"
            var txtHistory = "";
            var votedList = dead.filter(function(d) { return votedOutPlayers.includes(d); }).sort(function(a,b){return a-b});
            var otherDead = dead.filter(function(d) { return !votedOutPlayers.includes(d) && !mentionedInHeader.includes(d); }).sort(function(a,b){return a-b});

            // Присваиваем причины отсутствия для игроков, которые не заголосованы
            for (var i = 0; i < otherDead.length; i++) {
                var playerNum = otherDead[i];
                if (!absentReasons[playerNum]) {
                    // Случайно выбираем причину: Дисквалифицирован или Удалён
                    absentReasons[playerNum] = (Math.random() > 0.5) ? 'Дисквалифицирован' : 'Удалён';
                }
            }

            if (dead.length === 0) { txtHistory += "Все игроки за столом.<br>"; }
            // Удалено дублирование: информация о заголосованных теперь выводится только в красном блоке "❌ Днем покинули стол"
            
            // НОВАЯ ЛОГИКА: Выводим причины отсутствия для каждого игрока
            if (otherDead.length > 0) {
                var absentStatuses = otherDead.map(function(playerNum) {
                    var reason = absentReasons[playerNum] || 'Отсутствует';
                    return '<strong>' + reason + '</strong> ' + playerNum;
                });
                txtHistory += absentStatuses.join('. ') + '.<br>';
            }

            // Добавляем инфу о Шерифе и проверках в Историю
            if (sheriff > 0) {
                if (appGameMode === 'nightmare' || appGameMode === 'automatch_nightmare' || appGameMode === 'ahalay_nightmare' || appGameMode === 'winchester_nightmare' || 
                    appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible') {
                    if (night >= 2) txtHistory += "Шериф (" + sheriff + ") известен.<br>";
                } else {
                    if (night >= 3) txtHistory += "Шериф (" + sheriff + ") известен.<br>";
                }
            }

            // Проверки видны ВСЕГДА, когда они есть (независимо от режима и ночи)
            if (sBlacks.length > 0 || sReds.length > 0) {
                txtHistory += "Шериф проверил: ";
                if (sBlacks.length > 0) txtHistory += "чёрные " + formatCheckList(sBlacks) + "; ";
                if (sReds.length > 0) txtHistory += "красные " + formatCheckList(sReds) + ".";
                txtHistory += "<br>";
            }
            if (dBlacks.length > 0 || dReds.length > 0 || dSheriffs.length > 0) { 
                txtHistory += "Дон дал проверки: ";
                var allDonBlacks = dBlacks.concat(dSheriffs).sort(function(a,b){return a-b;});
                if (allDonBlacks.length > 0) txtHistory += "чёрные " + formatCheckList(allDonBlacks) + "; ";
                if (dReds.length > 0) txtHistory += "красные " + formatCheckList(dReds) + ".";
                txtHistory += "<br>";
            }
            // Старая логика checkedB (проверка Дона чёрный) — только если нет расширенных проверок
            if (checkedB.length > 0 && sBlacks.length === 0 && sReds.length === 0 && dBlacks.length === 0 && dReds.length === 0) {
                txtHistory += "Дон дал проверку - чёрный <strong>" + checkedB.join(',') + "</strong>.<br>";
            }

            if (isEjectionScenario) { 
                txtHistory += '<strong style="color: #ff3d00; text-transform: uppercase;">⚠️ Игрок ' + ejectedPlayer + ' удален! Голосования нет.</strong><br>'; 
            }

            // 3. Формируем Блок "Действие Дона" и "Действие Росомахи"
            var txtAction = "";
            var timingStr;
            
            // УНИФИЦИРОВАННАЯ ЛОГИКА: Если голосования нет, для ВСЕХ режимов один текст
            if (isEjectionScenario) {
                timingStr = 'После завершения крайней минуты и до наступления ночи';
            } else {
                // Когда голосование есть - разные тексты для разных режимов
                if (isAutomatchMode() || isWinchesterMode()) {
                    timingStr = 'На последней минуте до ночи';
                } else if (isAhalayMode() || isRedMode() || isBlackMode() || isRedBlackMode()) {
                    timingStr = 'На протяжении всего дня';
                } else {
                    timingStr = 'После начала голосования';
                }
            }
            
            // === МОДУЛЬНОЕ ФОРМИРОВАНИЕ ОПИСАНИЯ ДЕЙСТВИЯ ===
            // Префиксы режимов убраны, так как лейбл заказа уже показывает систему
            
            if (isWolverine) {
                var donLbl = (appGameMode === 'wolverine_hard') ? "Дон" : "Дон (мертв)";
                txtAction += timingStr + ':<br>';
                txtAction += donLbl + ': <strong>' + donText + '</strong>.<br>';
                txtAction += 'Росомаха: <strong>' + wolvText + '</strong>.';
            } else {
                txtAction += timingStr + ':<br>Дон: <strong>';
                
                /**
                 * МОДУЛЬНОЕ ФОРМИРОВАНИЕ ТЕКСТА ДЕЙСТВИЯ
                 * Для Винчестера/Автомата в дриллах используем специфичный формат
                 */
                var isDrillActive = (drillFilterActive || appDrillState.isActive);
                
                if (isDrillActive && drillSystemMode === 'winchester') {
                    // === ВИНЧЕСТЕР: ЧИСТЫЙ ВЫВОД БЕЗ ДУБЛИРОВАНИЯ ===
                    /**
                     * ЛОГИКА ВИНЧЕСТЕРА:
                     * - hand1/hand2: Эхо (жесты рук) → "✋ 1 рука (+3)" или "🙌 2 руки (+6)"
                     * - digit/badge: FlashFire (чистая математика) → "Показал цифру X" или "Показал 👌 (жетон)"
                     * - none: Статика → "Ничего не показывал"
                     */
                    if (action === 'hand1' || action === 'hand2') {
                        // ЭХО: Жесты рук (только для hand1/hand2)
                        if (winchesterHandType === 'one' || action === 'hand1') {
                            txtAction += '✋ 1 рука (+3)';
                        } else if (winchesterHandType === 'two' || action === 'hand2') {
                            txtAction += '🙌 2 руки (+6)';
                        } else {
                            // Fallback
                            txtAction += actionText;
                        }
                    } else if (action === 'digit' || action === 'badge') {
                        // FLASHFIRE: Чистая математика (БЕЗ упоминания рук)
                        txtAction += actionText;
                    } else {
                        // СТАТИКА или другое
                        txtAction += actionText;
                    }
                } else if (isDrillActive && drillSystemMode === 'auto') {
                    // === АВТОМАТ: СТАНДАРТНЫЙ ВЫВОД + ПОДСКАЗКА ===
                    txtAction += actionText;
                    if (action === 'digit' || action === 'badge') {
                        txtAction += ' <span style="display:inline-block; margin-left:8px; padding:2px 6px; background:rgba(37, 99, 235, 0.2); color:#93bbff; font-size:0.8em; border:1px solid #2563eb; border-radius:4px;">📍 Автомат: смещение +1</span>';
                    }
                } else {
                    // === КОСМАТИКА И ОБЫЧНЫЕ РЕЖИМЫ: СТАНДАРТНЫЙ ВЫВОД ===
                    txtAction += actionText;
                }
                
                txtAction += '</strong>.';
            }

            // Запоминаем эту команду, чтобы она не выпала в следующий раз
            appLastBlackTeamJson = JSON.stringify(blacks);
            
            // Для ahalay_newbie: сохраняем модификатор в сценарий для отображения
            if (appGameMode === 'ahalay_newbie' && appAhalayNewbieDynamicModifier > 0) {
                // Модификатор уже применен в solveKosmatika, просто сохраняем для справки
            }

            // ═══════════════════════════════════════════════════════════════
            // ОПРЕДЕЛЕНИЕ КОНТЕКСТА: "Единственный Шериф" vs "2 Версии"
            // ═══════════════════════════════════════════════════════════════
            var isSoloSheriff = false;
            var sheriffHasChecks = (partialState.sheriffCheckedReds && partialState.sheriffCheckedReds.length > 0);
            var donHasChecks = (partialState.donCheckedReds && partialState.donCheckedReds.length > 0) || 
                               (partialState.donCheckedBlacks && partialState.donCheckedBlacks.length > 0);
            
            // Для дрилла "Убит Шериф" принудительно устанавливаем isSoloSheriff = true
            if (drillFilterActive && appDrillFilter.sheriffDead) {
                isSoloSheriff = true;
            } else if (drillFilterActive && appDrillFilter.dualVersions) {
                // Для дрилла "2 версии" принудительно устанавливаем isSoloSheriff = false
                isSoloSheriff = false;
            } else if (sheriffHasChecks && !donHasChecks) {
                // Шериф есть, Дон не вскрывался
                isSoloSheriff = true;
            }
            
            // Собираем объект data с новыми полями
            var nightTitleText = "Наступает <strong>" + descNightTitle + "</strong>.";
            var desc = txtHistory + txtAction + txtNight; // Старый формат на всякий случай
            appCurrentScenarioData = { 
                solution: appCurrentSolution, 
                kosmatika: kosmatika, 
                blacks: blacks, 
                don: don, 
                descHtml: desc, // Старый формат на всякий случай
                txtNight: txtNight,     // <--- НОВОЕ ПОЛЕ
                txtHistory: txtHistory, // <--- НОВОЕ ПОЛЕ
                txtAction: txtAction,   // <--- НОВОЕ ПОЛЕ
                nightTitle: nightTitleText, 
                dead: dead, 
                votedOutPlayers: votedOutPlayers, // <--- НОВОЕ ПОЛЕ: Игроки, покинувшие стол днем
                sheriff: sheriff, 
                sheriffSeat: sheriff,   // Для рендера
                donSeat: don,           // Для рендера
                night: night, 
                checkedB: checkedB, 
                mirrorActive: mirrorActive,
                wolverineSeat: wolverineSeat,
                wolverineKosmatika: wolverineKosmatika,
                wolverineAction: wolvAction,
                wolverineDigit: wolvDigit,
                dynamicColorType: (isRedBlackMode() ? rbVariant : null), // Use rbVariant for RedBlack mode
                isSoloSheriff: isSoloSheriff,           // <--- НОВОЕ ПОЛЕ: Контекст шерифа
                sheriffCheckedReds: partialState.sheriffCheckedReds || [],  // <--- Проверки шерифа
                donCheckedReds: partialState.donCheckedReds || [],          // <--- Проверки дона (красные)
                donCheckedBlacks: partialState.donCheckedBlacks || [],       // <--- Проверки дона (черные)
                // Базука-специфичные данные
                bazookaBase: partialState.bazookaBase || null,
                bazookaDominantHand: partialState.bazookaDominantHand || null,
                bazookaIsPro: partialState.bazookaIsPro || false,
                bazookaPhysicalGesture: partialState.bazookaPhysicalGesture || null,
                bazookaGestureState: partialState.bazookaGestureState || null,
                bazookaAhalayTarget: partialState.bazookaAhalayTarget || null
            };
            
            // === КОНЕЦ ИЗМЕНЕННОГО БЛОКА ===
            appIsRoundActive = true;
            
            var trainerView = getEl('view-trainer');
            if(trainerView) {
                trainerView.classList.remove('hard-mode-active', 'nightmare-mode-active', 'impossible-mode-active', 'automatch-mode-active');
                showEl('bonus-hint-text', false);

                if(appGameMode === 'hard' || appGameMode === 'automatch_hard' || appGameMode === 'ahalay_hard' || appGameMode === 'winchester_hard' || appGameMode === 'bazooka_hard') trainerView.classList.add('hard-mode-active');
                else if(appGameMode === 'nightmare' || appGameMode === 'automatch_nightmare' || appGameMode === 'ahalay_nightmare' || appGameMode === 'winchester_nightmare' || appGameMode === 'bazooka_nightmare') trainerView.classList.add('nightmare-mode-active');
                else if(appGameMode === 'impossible' || appGameMode === 'automatch_impossible' || appGameMode === 'ahalay_impossible' || appGameMode === 'winchester_impossible' || appGameMode === 'bazooka_impossible') {
                    trainerView.classList.add('impossible-mode-active');
                    showEl('bonus-hint-text', true);
                }
                else if(isAutomatchMode()) trainerView.classList.add('automatch-mode-active');
                else if(isAhalayMode()) trainerView.classList.add('automatch-mode-active'); // Используем тот же стиль для Ахалая
                else if(isWinchesterMode()) trainerView.classList.add('automatch-mode-active'); // Используем тот же стиль для Винчестера
                else if(isBazookaMode()) trainerView.classList.add('automatch-mode-active'); // Используем тот же стиль для Базуки
            }

            renderScenario(appCurrentScenarioData);
            return; 
            
        } 
        
        if (!scenarioIsValid) {
            console.log("Generator timed out. Resetting drill mode.");
            appDrillState.isActive = false;
            
            var fallbackData = {
                solution: { target: 1, method: "Fallback", base: 1, gestureVal: 0, rawTargetBeforeMod: 1, logs: ["System Reset"], logicTag: "RESET" },
                kosmatika: [1, 2, 3],
                blacks: [8, 9, 10],
                don: 10,
                descHtml: "Система перезагружена из-за ошибки генерации.<br>Нажмите пропустить.",
                dead: [],
                sheriff: 0,
                night: 1,
                checkedB: []
            };
            appCurrentScenarioData = fallbackData;
            renderScenario(fallbackData);
        }

    } catch (e) { var el = document.getElementById('error-log'); if(el) el.innerText = "Gen Error: " + e.message; }
}
// --- ВСТАВИТЬ ЭТОТ КОД ---
    // Показываем кнопку "Поделиться"
    var shareBtn = document.getElementById('btn-share-layout');
    if (shareBtn) {
        shareBtn.style.display = 'flex';
    }
    // -------------------------
document.addEventListener("DOMContentLoaded", function() {
    loadStats(); updateStatsUI();
    var calcContainer = getEl('calc-seat-container');
    if(calcContainer) { calcContainer.innerHTML = ''; for(var i=1; i<=10; i++) { (function(i) { var seat = document.createElement('div'); seat.className = 'player-seat'; seat.innerText = i; seat.id = 'calc-seat-' + i; seat.addEventListener('click', function() { this.classList.toggle('dead'); }); calcContainer.appendChild(seat); })(i); } }
    var ahCalcContainer = getEl('ah-seat-container');
    if(ahCalcContainer) { ahCalcContainer.innerHTML = ''; for(var i=1; i<=10; i++) { (function(i) { var seat = document.createElement('div'); seat.className = 'player-seat'; seat.innerText = i; seat.id = 'ah-seat-' + i; seat.addEventListener('click', function() { this.classList.toggle('dead'); }); ahCalcContainer.appendChild(seat); })(i); } }
    var winCalcContainer = getEl('win-seat-container');
    if(winCalcContainer) { winCalcContainer.innerHTML = ''; for(var i=1; i<=10; i++) { (function(i) { var seat = document.createElement('div'); seat.className = 'player-seat'; seat.innerText = i; seat.id = 'win-seat-' + i; seat.addEventListener('click', function() { this.classList.toggle('dead'); }); winCalcContainer.appendChild(seat); })(i); } }
    var whoCalcContainer = getEl('who-seat-container');
    if(whoCalcContainer) { whoCalcContainer.innerHTML = ''; for(var i=1; i<=10; i++) { (function(i) { var seat = document.createElement('div'); seat.className = 'player-seat'; seat.innerText = i; seat.id = 'who-seat-' + i; seat.addEventListener('click', function() { this.classList.toggle('dead'); }); whoCalcContainer.appendChild(seat); })(i); } }
    var mantisCalcContainer = getEl('mantis-seat-container');
    if(mantisCalcContainer) { mantisCalcContainer.innerHTML = ''; for(var i=1; i<=10; i++) { (function(i) { var seat = document.createElement('div'); seat.className = 'player-seat'; seat.innerText = i; seat.id = 'mantis-seat-' + i; seat.addEventListener('click', function() { this.classList.toggle('dead'); }); mantisCalcContainer.appendChild(seat); })(i); } }
    var acCalcContainer = getEl('ac-seat-container');
    if(acCalcContainer) { acCalcContainer.innerHTML = ''; for(var i=1; i<=10; i++) { (function(i) { var seat = document.createElement('div'); seat.className = 'player-seat'; seat.innerText = i; seat.id = 'ac-seat-' + i; seat.addEventListener('click', function() { this.classList.toggle('dead'); }); acCalcContainer.appendChild(seat); })(i); } }
    var skipBtn = getEl('skip-btn'); if(skipBtn) skipBtn.addEventListener('click', runSkipTask);
    
    // ============================================================
    // === ОБРАБОТЧИКИ ДЛЯ КАСТОМНЫХ ИНПУТОВ ДРИЛЛА (Custom Setup) ===
    // ============================================================
    var customNumbersInput = document.getElementById('drill-custom-numbers');
    var customBlacksInput = document.getElementById('drill-custom-blacks');
    var customDonInput = document.getElementById('drill-custom-don');
    var customSheriffInput = document.getElementById('drill-custom-sheriff');
    
    // Вспомогательная функция парсинга цифр (слитно, "0" = 10)
    function parseDigitString(str) {
        var digitsOnly = str.replace(/\D/g, '');
        return digitsOnly.split('').map(function(digit) {
            var num = parseInt(digit, 10);
            return num === 0 ? 10 : num;
        });
    }
    
    // ============================================================
    // === LOCALSTORAGE: Сохранение и загрузка настроек ===
    // ============================================================
    var STORAGE_KEYS = {
        numbers: 'drill_custom_numbers',
        blacks: 'drill_custom_blacks',
        don: 'drill_custom_don',
        sheriff: 'drill_custom_sheriff'
    };
    
    function saveCustomSetupToStorage() {
        try {
            if (customNumbersInput) localStorage.setItem(STORAGE_KEYS.numbers, customNumbersInput.value);
            if (customBlacksInput) localStorage.setItem(STORAGE_KEYS.blacks, customBlacksInput.value);
            if (customDonInput) localStorage.setItem(STORAGE_KEYS.don, customDonInput.value);
            if (customSheriffInput) localStorage.setItem(STORAGE_KEYS.sheriff, customSheriffInput.value);
        } catch (e) {
            console.warn('LocalStorage недоступен:', e);
        }
    }
    
    function loadCustomSetupFromStorage() {
        try {
            if (customNumbersInput) {
                var val = localStorage.getItem(STORAGE_KEYS.numbers);
                if (val) {
                    customNumbersInput.value = val;
                    updateNumbersPreview();
                }
            }
            if (customBlacksInput) {
                var val = localStorage.getItem(STORAGE_KEYS.blacks);
                if (val) {
                    customBlacksInput.value = val;
                    updateBlacksPreview();
                }
            }
            if (customDonInput) {
                var val = localStorage.getItem(STORAGE_KEYS.don);
                if (val) {
                    customDonInput.value = val;
                    updateDonPreview();
                }
            }
            if (customSheriffInput) {
                var val = localStorage.getItem(STORAGE_KEYS.sheriff);
                if (val) {
                    customSheriffInput.value = val;
                    updateSheriffPreview();
                }
            }
            // Обновляем кнопку запуска после загрузки
            updateDrillRunButton();
        } catch (e) {
            console.warn('Не удалось загрузить из LocalStorage:', e);
        }
    }
    
    function clearCustomSetup() {
        // Очищаем инпуты
        if (customNumbersInput) customNumbersInput.value = '';
        if (customBlacksInput) customBlacksInput.value = '';
        if (customDonInput) customDonInput.value = '';
        if (customSheriffInput) customSheriffInput.value = '';
        
        // Очищаем превью
        var previewNumbers = document.getElementById('preview-numbers');
        var previewBlacks = document.getElementById('preview-blacks');
        var previewDon = document.getElementById('preview-don');
        var previewSheriff = document.getElementById('preview-sheriff');
        
        if (previewNumbers) previewNumbers.textContent = '';
        if (previewBlacks) previewBlacks.textContent = '';
        if (previewDon) previewDon.textContent = '';
        if (previewSheriff) previewSheriff.textContent = '';
        
        // Очищаем localStorage
        try {
            localStorage.removeItem(STORAGE_KEYS.numbers);
            localStorage.removeItem(STORAGE_KEYS.blacks);
            localStorage.removeItem(STORAGE_KEYS.don);
            localStorage.removeItem(STORAGE_KEYS.sheriff);
        } catch (e) {
            console.warn('Не удалось очистить LocalStorage:', e);
        }
        
        // Обновляем кнопку запуска
        updateDrillRunButton();
    }
    
    // Live-превью для цифр динамики
    function updateNumbersPreview() {
        var preview = document.getElementById('preview-numbers');
        if (!preview || !customNumbersInput) return;
        
        var val = customNumbersInput.value.trim();
        if (val === '') {
            preview.textContent = '';
            preview.style.color = '#4caf50';
            return;
        }
        
        var parsed = parseDigitString(val);
        
        // Максимум 3 цифры
        if (parsed.length > 3) {
            parsed = parsed.slice(0, 3);
            preview.textContent = '⚠ Взято первые 3: [' + parsed.join(', ') + ']';
            preview.style.color = '#ff9800';
        } else if (parsed.length > 0) {
            // Показываем как будет расширен массив
            var expanded;
            if (parsed.length === 1) {
                expanded = [parsed[0], parsed[0], parsed[0]];
            } else if (parsed.length === 2) {
                expanded = [parsed[0], parsed[1], parsed[1]];
            } else {
                expanded = parsed;
            }
            preview.textContent = '✓ Распознано: [' + expanded.join(', ') + ']';
            preview.style.color = '#4caf50';
        } else {
            preview.textContent = '';
        }
    }
    
    // Live-превью для черной команды
    function updateBlacksPreview() {
        var preview = document.getElementById('preview-blacks');
        if (!preview || !customBlacksInput) return;
        
        var val = customBlacksInput.value.trim();
        if (val === '') {
            preview.textContent = '';
            preview.style.color = '#4caf50';
            return;
        }
        
        var parsed = parseDigitString(val).filter(function(n) {
            return n >= 1 && n <= 10;
        });
        
        if (parsed.length === 0) {
            preview.textContent = '⚠ Нет валидных номеров (1-10)';
            preview.style.color = '#ff9800';
            return;
        }
        
        // Проверка на дубликаты
        var uniqueSet = {};
        var hasDuplicates = false;
        for (var i = 0; i < parsed.length; i++) {
            if (uniqueSet[parsed[i]]) {
                hasDuplicates = true;
                break;
            }
            uniqueSet[parsed[i]] = true;
        }
        
        if (hasDuplicates) {
            preview.textContent = '❌ Цифры не должны повторяться!';
            preview.style.color = '#f44336';
            return;
        }
        
        // Максимум 3 цифры
        if (parsed.length > 3) {
            var trimmed = parsed.slice(0, 3);
            preview.textContent = '⚠ Взято первые 3 уникальные: [' + trimmed.join(', ') + ']';
            preview.style.color = '#ff9800';
        } else {
            preview.textContent = '✓ Распознано: [' + parsed.join(', ') + ']';
            preview.style.color = '#4caf50';
        }
    }
    
    // Live-превью для Дона (с валидацией)
    function updateDonPreview() {
        var preview = document.getElementById('preview-don');
        if (!preview || !customDonInput) return;
        
        var val = customDonInput.value.trim();
        if (val === '') {
            preview.textContent = '';
            preview.style.color = '#4caf50';
            return;
        }
        
        var parsed = parseDigitString(val);
        if (parsed.length === 0) {
            preview.textContent = '';
            return;
        }
        
        var don = parsed[0]; // Берем ТОЛЬКО первую цифру
        
        // Показываем предупреждение, если введено больше одной цифры
        if (parsed.length > 1) {
            preview.textContent = '⚠ Взята первая цифра: ' + don;
            preview.style.color = '#ff9800';
        }
        
        // Валидация: Дон должен быть среди черных
        var blacksVal = customBlacksInput ? customBlacksInput.value.trim() : '';
        if (blacksVal !== '') {
            var blacks = parseDigitString(blacksVal).filter(function(n) {
                return n >= 1 && n <= 10;
            });
            
            // Убираем дубликаты из черных для проверки
            var uniqueBlacks = [];
            var seen = {};
            for (var i = 0; i < blacks.length; i++) {
                if (!seen[blacks[i]]) {
                    uniqueBlacks.push(blacks[i]);
                    seen[blacks[i]] = true;
                }
            }
            
            if (uniqueBlacks.indexOf(don) === -1) {
                preview.textContent = '❌ Дон (' + don + ') должен быть среди черных!';
                preview.style.color = '#f44336';
                return;
            }
        }
        
        if (parsed.length === 1) {
            preview.textContent = '✓ Дон: ' + don;
            preview.style.color = '#4caf50';
        }
    }
    
    // Live-превью для Шерифа (с перекрестной валидацией)
    function updateSheriffPreview() {
        var preview = document.getElementById('preview-sheriff');
        if (!preview || !customSheriffInput) return;
        
        var val = customSheriffInput.value.trim();
        if (val === '') {
            preview.textContent = '';
            preview.style.color = '#4caf50';
            return;
        }
        
        var parsed = parseDigitString(val);
        if (parsed.length === 0) {
            preview.textContent = '';
            return;
        }
        
        var sheriff = parsed[0]; // Берем ТОЛЬКО первую цифру
        
        // Показываем предупреждение, если введено больше одной цифры
        if (parsed.length > 1) {
            preview.textContent = '⚠ Взята первая цифра: ' + sheriff;
            preview.style.color = '#ff9800';
        }
        
        // === ПЕРЕКРЕСТНАЯ ВАЛИДАЦИЯ ===
        
        // 1. Проверка: Шериф не может быть черным
        var blacksVal = customBlacksInput ? customBlacksInput.value.trim() : '';
        if (blacksVal !== '') {
            var blacks = parseDigitString(blacksVal).filter(function(n) {
                return n >= 1 && n <= 10;
            });
            
            // Убираем дубликаты из черных для проверки
            var uniqueBlacks = [];
            var seen = {};
            for (var i = 0; i < blacks.length; i++) {
                if (!seen[blacks[i]]) {
                    uniqueBlacks.push(blacks[i]);
                    seen[blacks[i]] = true;
                }
            }
            
            if (uniqueBlacks.indexOf(sheriff) !== -1) {
                preview.textContent = '❌ Шериф не может быть черным!';
                preview.style.color = '#f44336';
                return;
            }
        }
        
        // 2. Проверка: Шериф не может быть Доном
        var donVal = customDonInput ? customDonInput.value.trim() : '';
        if (donVal !== '') {
            var donParsed = parseDigitString(donVal);
            if (donParsed.length > 0 && donParsed[0] === sheriff) {
                preview.textContent = '❌ Шериф и Дон не могут быть одним игроком!';
                preview.style.color = '#f44336';
                return;
            }
        }
        
        // Если все проверки пройдены
        if (parsed.length === 1) {
            preview.textContent = '✓ Шериф: ' + sheriff;
            preview.style.color = '#4caf50';
        }
    }
    
    // Обновление кнопки запуска
    function updateDrillRunButton() {
        if (!appDrillConstructorActive) return;
        
        var btnRun = document.getElementById('btn-run-drill');
        if (!btnRun) return;
        
        var hasCustomData = (customNumbersInput && customNumbersInput.value.trim() !== '') || 
                            (customBlacksInput && customBlacksInput.value.trim() !== '') ||
                            (customDonInput && customDonInput.value.trim() !== '') ||
                            (customSheriffInput && customSheriffInput.value.trim() !== '');
        
        if (appDrillConstructorSelection.shooting.length > 0 || 
            appDrillConstructorSelection.action.length > 0 || 
            hasCustomData) {
            btnRun.style.display = 'block';
        } else {
            btnRun.style.display = 'none';
        }
    }
    
    // Обработчики событий input для всех инпутов
    if (customNumbersInput) {
        customNumbersInput.addEventListener('input', function() {
            updateNumbersPreview();
            updateDrillRunButton();
            saveCustomSetupToStorage(); // Сохраняем при каждом изменении
        });
    }
    
    if (customBlacksInput) {
        customBlacksInput.addEventListener('input', function() {
            updateBlacksPreview();
            updateDonPreview(); // Обновляем превью Дона при изменении черных
            updateSheriffPreview(); // Обновляем превью Шерифа при изменении черных
            updateDrillRunButton();
            saveCustomSetupToStorage(); // Сохраняем при каждом изменении
        });
    }
    
    if (customDonInput) {
        customDonInput.addEventListener('input', function() {
            updateDonPreview();
            updateSheriffPreview(); // Обновляем превью Шерифа при изменении Дона
            updateDrillRunButton();
            saveCustomSetupToStorage(); // Сохраняем при каждом изменении
        });
    }
    
    if (customSheriffInput) {
        customSheriffInput.addEventListener('input', function() {
            updateSheriffPreview();
            updateDrillRunButton();
            saveCustomSetupToStorage(); // Сохраняем при каждом изменении
        });
    }
    
    // Обработчик кнопки "Очистить"
    var btnClearCustomSetup = document.getElementById('btn-clear-custom-setup');
    if (btnClearCustomSetup) {
        btnClearCustomSetup.addEventListener('click', function(e) {
            e.preventDefault();
            clearCustomSetup();
        });
    }
    
    // ============================================================
    // === АГРЕССИВНАЯ БЛОКИРОВКА СВАЙПОВ И ЖЕСТОВ (FIX) ===
    // ============================================================
    // Проблема: Глобальные обработчики свайпов на window перехватывают события
    // Решение: Создаем "Щит" на весь контейнер Custom Setup с максимальной защитой
    
    var setupBlock = document.querySelector('.drill-custom-setup');
    if (setupBlock) {
        // Список ВСЕХ событий, которые могут вызывать свайп/прокрутку
        var eventsToKill = [
            'mousedown', 'mousemove', 'mouseup',
            'touchstart', 'touchmove', 'touchend',
            'pointerdown', 'pointermove', 'pointerup',
            'click'
        ];

        eventsToKill.forEach(function(evt) {
            // Вешаем обработчик на ВЕСЬ блок настроек
            setupBlock.addEventListener(evt, function(e) {
                // ВСЕГДА останавливаем всплытие к глобальным обработчикам
                e.stopPropagation();
                
                // Для событий движения (touchmove, mousemove, pointermove) используем
                // stopImmediatePropagation() - это останавливает даже другие обработчики
                // на том же элементе, которые были добавлены позже
                if (evt === 'touchmove' || evt === 'mousemove' || evt === 'pointermove') {
                    e.stopImmediatePropagation();
                }
                
                // ОПЦИОНАЛЬНО: Можно раскомментировать для полной блокировки touchmove,
                // но это может помешать скроллу внутри инпутов на мобильных
                // if (evt === 'touchmove') {
                //     e.preventDefault();
                // }
            }, { passive: false }); // КРИТИЧНО: passive: false разрешает preventDefault и полный контроль
        });
        
        console.log('🛡️ Щит от свайпов активирован на блоке Custom Setup');
    }
    
    // === ЗАГРУЗКА НАСТРОЕК ИЗ LOCALSTORAGE ПРИ ИНИЦИАЛИЗАЦИИ ===
    loadCustomSetupFromStorage();
    
    // Функция для выбора режима из модального окна (глобальная)
    window.selectModeFromModal = function(modeValue) {
        showEl('am-selection-modal', false);
        showEl('catalog-modal', false);
        // Вызываем selectMode напрямую для правильной обработки всех режимов
        var modeTitle = '';
        if (modeValue === 'calc') modeTitle = '👉 Калькулятор (Косматика)';
        else if (modeValue === 'automatch_calc') modeTitle = '👉👉 Калькулятор (Автомат)';
        else if (modeValue === 'ahalay_calc') modeTitle = '👋👋 Калькулятор для Ахалая';
        else if (modeValue === 'winchester_calc') modeTitle = '👉✊ Калькулятор для Винчестера';
        else if (modeValue === 'bazooka_calc') modeTitle = '🚀 Калькулятор для Базуки';
        else if (modeValue.startsWith('automatch_')) modeTitle = '👉👉 Автомат (' + modeValue.replace('automatch_', '') + ')';
        else if (modeValue.startsWith('ahalay_')) modeTitle = '👋👋 Ахалай (' + modeValue.replace('ahalay_', '') + ')';
        else if (modeValue.startsWith('winchester_')) {
            var winMode = modeValue.replace('winchester_', '');
            if (winMode === 'easy-mode') winMode = 'Easy Mode';
            modeTitle = '👉✊ Винчестер (' + winMode + ')';
        }
        else if (modeValue.startsWith('bazooka_')) {
            var bzMode = modeValue.replace('bazooka_', '');
            bzMode = bzMode.charAt(0).toUpperCase() + bzMode.slice(1);
            modeTitle = '🚀 Базука (' + bzMode + ')';
        }
        else modeTitle = '👉 Косматика (' + modeValue + ')';
        selectMode(modeValue, modeTitle);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // NEW SYSTEM SELECTION MODAL HANDLERS
    var btnCancel = getEl('btn-cancel-auto');

    if(btnCancel) {
        btnCancel.addEventListener('click', function() {
            showEl('am-selection-modal', false); // Close Modal
        });
    }

    // Обработчик кнопки каталога
    var btnCatalog = getEl('btn-open-catalog');
    if(btnCatalog) {
        btnCatalog.addEventListener('click', openCatalog);
    }

    // === WINCHESTER CALCULATOR INITIALIZATION ===
    var winContainer = getEl('win-seat-container');
    if(winContainer) {
        winContainer.innerHTML = '';
        for(var i=1; i<=10; i++) {
            (function(i) {
                var seat = document.createElement('div');
                seat.className = 'player-seat';
                seat.id = 'win-seat-' + i;
                seat.innerText = i;
                seat.onclick = function() { this.classList.toggle('dead'); };
                winContainer.appendChild(seat);
            })(i);
        }
    }

    // Вспомогательная функция для парсинга номера места (0 = 10, пустая строка = null)
    function parseSeatNumber(inputEl) {
        if(!inputEl) return null;
        var value = inputEl.value.trim();
        if(value === '') return null;
        var num = parseInt(value);
        if(isNaN(num)) return null;
        return (num === 0) ? 10 : num;
    }

    // === BAZOOKA CALCULATOR INITIALIZATION ===
    function parseBazookaState() {
        var selectedStateEl = document.querySelector('#bazooka-state-buttons .bazooka-state-btn.active');
        if (!selectedStateEl) return 1;
        var stateValue = selectedStateEl.getAttribute('data-state');
        if (stateValue === 'ahalay') {
            var ahalayTargetInput = getEl('bazooka-ahalay-target');
            return {
                ahalay_target: ahalayTargetInput ? ahalayTargetInput.value : null
            };
        }
        return parseInt(stateValue, 10) || 1;
    }

    function updateBazookaAhalayInputVisibility() {
        var selectedStateEl = document.querySelector('#bazooka-state-buttons .bazooka-state-btn.active');
        var isAhalay = !!(selectedStateEl && selectedStateEl.getAttribute('data-state') === 'ahalay');
        var ahalayWrap = getEl('bazooka-ahalay-wrap');
        if (ahalayWrap) ahalayWrap.style.display = isAhalay ? 'block' : 'none';
    }

    function renderBazookaResult() {
        var resultBox = getEl('bazooka-result');
        if (!resultBox) return;

        var donSeatInput = getEl('bazooka-don-seat');
        var mafiaInput = getEl('bazooka-mafia-team');
        var baseInput = getEl('bazooka-base-digit');
        var isProToggle = getEl('bazooka-pro-toggle');
        var fireSystemSelect = getEl('fire-system-select');

        var donSeat = donSeatInput ? donSeatInput.value : '';
        var mafia = parseSmartInput(mafiaInput ? mafiaInput.value : '');
        var base = baseInput ? baseInput.value : '';
        var state = parseBazookaState();
        var isPro = !!(isProToggle && isProToggle.checked);
        var fireSystem = fireSystemSelect ? fireSystemSelect.value : 'instafire';

        var dominantHandBtn = document.querySelector('#bazooka-hand-buttons .bazooka-state-btn.active');
        var dominantHand = dominantHandBtn ? dominantHandBtn.getAttribute('data-hand') : 'right';
        var result = calculateBazooka(donSeat, mafia, base, state, isPro, fireSystem, { dominantHand: dominantHand });
        var targetText = result.target ? result.target : '—';

        resultBox.style.display = 'block';
        resultBox.className = 'result-box correct';
        resultBox.style.borderColor = 'var(--bazooka-color)';
        resultBox.innerHTML = '<h3>🎯 Базука: ' + targetText + '</h3>' +
            '<div>Метод: <strong>' + result.method + '</strong></div>' +
            '<hr style="border-color:#555">' +
            result.logs.map(function(line) { return '<div class="expl-step">' + line + '</div>'; }).join('');
    }

    var bazookaButtons = document.querySelectorAll('#bazooka-state-buttons .bazooka-state-btn');
    bazookaButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            bazookaButtons.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            updateBazookaAhalayInputVisibility();
            renderBazookaResult();
        });
    });

    ['bazooka-don-seat', 'bazooka-mafia-team', 'bazooka-base-digit', 'bazooka-ahalay-target'].forEach(function(id) {
        var el = getEl(id);
        if (el) el.addEventListener('input', renderBazookaResult);
    });

    var bazookaProToggle = getEl('bazooka-pro-toggle');
    if (bazookaProToggle) {
        bazookaProToggle.addEventListener('change', function() {
            appGameMode = bazookaProToggle.checked ? 'bazooka_pro' : 'bazooka';
            // Обновляем лейблы кнопок жестов под текущую руку и PRO-режим
            var activeHandBtn = document.querySelector('#bazooka-hand-buttons .bazooka-state-btn.active');
            var activeHand = activeHandBtn ? activeHandBtn.getAttribute('data-hand') : 'right';
            selectBazookaHand(activeHand);
            renderBazookaResult();
        });
    }

    var fireSystemSelect = getEl('fire-system-select');
    if (fireSystemSelect) {
        fireSystemSelect.addEventListener('change', renderBazookaResult);
    }

    var bazookaCalcBtn = getEl('bazooka-calc-btn');
    if (bazookaCalcBtn) {
        bazookaCalcBtn.addEventListener('click', renderBazookaResult);
    }

    updateBazookaAhalayInputVisibility();
    renderBazookaResult();
    
    // Валидация поля Шерифа: проверка, что Шериф не находится на месте Мафии
    function validateSheriffSeat(sheriffInputEl, blackTeamInputId) {
        if(!sheriffInputEl) return;
        
        var value = sheriffInputEl.value.trim();
        if(value === '') return; // Пустое поле - валидно
        
        var num = parseInt(value);
        if(isNaN(num)) return; // Не число - валидно (будет обработано другой валидацией)
        
        var sheriffSeat = (num === 0) ? 10 : num;
        
        // Получаем черную команду
        var blackTeamInput = getEl(blackTeamInputId);
        if(!blackTeamInput) return;
        
        var blackTeam = parseSmartInput(blackTeamInput.value);
        
        // Проверяем, не находится ли Шериф на месте Мафии
        if(blackTeam.includes(sheriffSeat)) {
            // Конфликт! Очищаем поле
            sheriffInputEl.value = '';
            
            // Добавляем класс ошибки
            sheriffInputEl.classList.add('input-error');
            
            // Убираем класс ошибки через 500мс
            setTimeout(function() {
                sheriffInputEl.classList.remove('input-error');
            }, 500);
        }
    }
    
    // Winchester calculator functions
    function updateWinchesterVisualTable() {
        var sheriffInputEl = getEl('win-sheriff-seat');
        var donInputEl = getEl('win-don-seat');
        var sheriffSeat = parseSeatNumber(sheriffInputEl);
        var donSeat = parseSeatNumber(donInputEl);
        var blackTeamStr = getEl('win-black-team').value;
        var blackTeam = parseSmartInput(blackTeamStr);
        var checkedBlacksStr = getEl('win-checked-blacks').value;
        var checkedBlacks = parseSmartInput(checkedBlacksStr);
        
        // Валидация: Дон не может быть Шерифом
        var hasConflict = (donSeat !== null && sheriffSeat !== null && donSeat === sheriffSeat);
        if(donInputEl) {
            if(hasConflict) donInputEl.classList.add('input-error');
            else donInputEl.classList.remove('input-error');
        }
        if(sheriffInputEl) {
            if(hasConflict) sheriffInputEl.classList.add('input-error');
            else sheriffInputEl.classList.remove('input-error');
        }

        for (var i = 1; i <= 10; i++) {
            var seat = getEl('win-seat-' + i);
            if (!seat) continue;
            seat.classList.remove('sheriff', 'don', 'mafia', 'checked-black');
            if (checkedBlacks.includes(i)) {
                seat.classList.add('checked-black');
            }
            if (sheriffSeat !== null && i === sheriffSeat && !hasConflict) {
                seat.classList.add('sheriff');
                continue;
            }
            if (donSeat !== null && i === donSeat) {
                seat.classList.add('don');
                continue;
            }
            if (blackTeam.includes(i)) {
                seat.classList.add('mafia');
            }
        }
    }

    function handleWinchesterCheckedBlacksInput(e) {
        var rawVal = this.value;
        var digitsOnly = rawVal.replace(/[^0-9]/g, '');
        var uniqueDigits = "";
        var seen = new Set();
        var nums = [];
        for (var i = 0; i < digitsOnly.length; i++) {
            var char = digitsOnly[i];
            if (!seen.has(char)) {
                seen.add(char);
                uniqueDigits += char;
                nums.push(parseInt(char) === 0 ? 10 : parseInt(char));
            }
        }
        var sheriffInput = getEl('win-sheriff-seat').value;
        var hasSheriff = (sheriffInput.trim() !== "");
        var sheriffNum = hasSheriff ? (parseInt(sheriffInput) || 0) : null;
        if(sheriffNum === 0) sheriffNum = 10;
        var blackTeam = parseSmartInput(getEl('win-black-team').value);
        var donVal = parseInt(getEl('win-don-seat').value);
        var donNum = (isNaN(donVal) ? null : (donVal === 0 ? 10 : donVal));
        var acceptedNums = [];
        var donOthersCount = 0;
        
        for (var i = 0; i < nums.length; i++) {
            var n = nums[i];
            if (donNum !== null && n === donNum) continue;
            var isSheriff = (hasSheriff && n === sheriffNum);
            var isBlack = blackTeam.includes(n);
            
            if (hasSheriff) {
                if (isBlack) {
                    acceptedNums.push(n);
                } else if (isSheriff) {
                    acceptedNums.push(n);
                } else {
                    if (donOthersCount < 2) {
                        acceptedNums.push(n);
                        donOthersCount++;
                    }
                }
            } else {
                if (acceptedNums.length < 3) {
                    acceptedNums.push(n);
                }
            }
        }
        
        if (hasSheriff && acceptedNums.length > 6) {
            acceptedNums = acceptedNums.slice(0, 6);
        }
        var newString = acceptedNums.map(n => n === 10 ? 0 : n).join('');
        this.value = newString;
        updateWinchesterVisualTable();
    }

    function updateWinchesterCheckedBlacksOnSheriffChange(newSheriffNum) {
        var inputEl = getEl('win-checked-blacks');
        var currentNums = parseSmartInput(inputEl.value);
        if (currentNums.includes(newSheriffNum)) return;
        if (currentNums.length >= 3) {
            currentNums.pop();
            currentNums.push(newSheriffNum);
            var newString = currentNums.map(n => n === 10 ? 0 : n).join('');
            inputEl.value = newString;
            handleWinchesterCheckedBlacksInput.call(inputEl, null);
        }
    }

    function handleWinchesterBlackTeamInput(e) {
        var rawVal = this.value;
        var digitsOnly = rawVal.replace(/[^0-9]/g, '');
        var uniqueDigits = "";
        var seen = new Set();
        for (var i = 0; i < digitsOnly.length; i++) {
            var char = digitsOnly[i];
            if (!seen.has(char)) {
                seen.add(char);
                uniqueDigits += char;
            }
        }
        if (uniqueDigits.length > 3) uniqueDigits = uniqueDigits.slice(0, 3);
        this.value = uniqueDigits;
        
        var nums = parseSmartInput(uniqueDigits);
        if (nums.length > 0) {
            var firstNum = nums[0];
            getEl('win-don-seat').value = (firstNum === 10 ? 0 : firstNum);
        }
        updateWinchesterVisualTable();
        handleWinchesterCheckedBlacksInput.call(getEl('win-checked-blacks'), null);
    }

    function handleWinchesterDonInputLogic(inputElement) {
        var valStr = inputElement.value;
        if (valStr.length > 2) valStr = valStr.slice(0, 2); 
        var newDonVal = parseInt(valStr);
        if (isNaN(newDonVal)) return;
        if (newDonVal > 10) {
            valStr = valStr.slice(-1);
            newDonVal = parseInt(valStr);
            inputElement.value = newDonVal;
        }
        
        var blackTeamInput = getEl('win-black-team');
        var currentTeam = parseSmartInput(blackTeamInput.value);
        var newDonNum = (newDonVal === 0) ? 10 : newDonVal;

        if (currentTeam.length === 0) {
            currentTeam = [newDonNum];
        } else {
            var existingIndex = currentTeam.indexOf(newDonNum);
            if (existingIndex !== -1) {
                var oldDon = currentTeam[0];
                currentTeam[0] = newDonNum;
                currentTeam[existingIndex] = oldDon;
            } else {
                currentTeam[0] = newDonNum;
            }
        }

        var uniqueTeam = [];
        var seen = new Set();
        for(var i=0; i<currentTeam.length; i++) {
            if(!seen.has(currentTeam[i])) { seen.add(currentTeam[i]); uniqueTeam.push(currentTeam[i]); }
        }
        currentTeam = uniqueTeam;

        var newString = currentTeam.map(function(n) { return (n === 10 ? 0 : n); }).join('');
        blackTeamInput.value = newString;
        updateWinchesterVisualTable();
        handleWinchesterCheckedBlacksInput.call(getEl('win-checked-blacks'), null);
    }
    
    function handleWinchesterSheriffInputLogic(inputElement) {
        var valStr = inputElement.value.replace(/[^0-9]/g, '');
        inputElement.classList.remove('input-error');
        if (valStr.length > 2) valStr = valStr.slice(0, 2);
        var num = parseInt(valStr);
        if (num > 10) valStr = valStr.slice(-1);
        num = parseInt(valStr); 

        if (!isNaN(num)) {
            var blackTeam = parseSmartInput(getEl('win-black-team').value);
            var checkVal = (num === 0) ? 10 : num;
            if (blackTeam.includes(checkVal)) {
                inputElement.classList.add('input-error');
                setTimeout(function() { inputElement.classList.remove('input-error'); }, 300);
                inputElement.value = ""; 
                updateWinchesterVisualTable();
                return;
            }
            updateWinchesterCheckedBlacksOnSheriffChange(num);
        }
        
        inputElement.value = valStr;
        updateWinchesterVisualTable();
        handleWinchesterCheckedBlacksInput.call(getEl('win-checked-blacks'), null);
    }

    function calculateWinchester() {
        var logs = [];
        try {
            var kList = parseSmartInput(getEl('win-kosm-list').value);
            if (kList.length === 1) kList = [kList[0], kList[0], kList[0]];
            else if (kList.length === 2) kList = [kList[0], kList[1], kList[1]];
            
            var kIndex = parseInt(getEl('win-kosm-index').value);
            var currentBase = kList.length > 0 ? kList[kIndex] : 0;
            if(!currentBase) throw new Error("Заполните поле Косматика!");

            var blackTeam = parseSmartInput(getEl('win-black-team').value);
            var checkedBlacks = parseSmartInput(getEl('win-checked-blacks').value);
            
            var deadPlayers = [];
            document.querySelectorAll('#win-seat-container .player-seat.dead').forEach(s => deadPlayers.push(parseInt(s.innerText)));

            var donInput = parseInt(getEl('win-don-seat').value);
            var donSeat = (donInput === 0) ? 10 : (donInput || 0);
            
            var sherInput = parseInt(getEl('win-sheriff-seat').value);
            var sheriffSeat = (sherInput === 0) ? 10 : (sherInput || 0);
            var nightNum = parseInt(getEl('win-night-num').value);

            var rawAction = getEl('win-don-action').value;
            var donDigitVal = parseInt(getEl('win-don-digit').value) || 0;
            
            // НОВАЯ ЛОГИКА: Считываем данные для охоты на красную проверку (Винчестер)
            var sheriffStatus = getEl('win-sheriff-status') ? getEl('win-sheriff-status').value : 'alive';
            // ИСПРАВЛЕНО: sheriffDead = true ТОЛЬКО при dead_solo (НЕ при dual!)
            var sheriffDead = (sheriffStatus === 'dead_solo');
            var isSoloSheriff = (sheriffStatus === 'dead_solo');
            var sheriffRedChecks = [];
            var donRedChecks = [];
            var allCheckedReds = [];
            
            // Режим "Охота на красную проверку" активен ТОЛЬКО при dead_solo
            if(sheriffStatus === 'dead_solo') {
                sheriffRedChecks = parseSmartInput(getEl('win-sheriff-red-checks').value);
                // Объединяем для общего массива (в режиме Solo Sheriff Дон не дает информацию)
                allCheckedReds = sheriffRedChecks;
                
                // КРИТИЧЕСКИ ВАЖНО: Добавляем шерифа в список мертвых для Solo Sheriff Mode
                if(sheriffSeat > 0 && !deadPlayers.includes(sheriffSeat)) {
                    deadPlayers.push(sheriffSeat);
                }
            }
            
            // Режим "2 Версии" (dual) - читаем проверки обеих версий, но НЕ активируем охоту
            if(sheriffStatus === 'dual') {
                sheriffRedChecks = parseSmartInput(getEl('win-sheriff-red-checks').value);
                donRedChecks = parseSmartInput(getEl('win-don-red-checks').value);
                // Объединяем для поиска "Двойной Красной" (если нужно)
                allCheckedReds = sheriffRedChecks.concat(donRedChecks.filter(function(r) { return !sheriffRedChecks.includes(r); }));
                // НЕ добавляем шерифа в мертвые - это режим "2 версии", стреляем по математике!
            }

            var state = {
                kosmatikaList: kList,
                kIndex: kIndex,
                donSeat: donSeat,
                blackTeam: blackTeam,
                deadPlayers: deadPlayers,
                checkedBlacks: checkedBlacks,
                checkedReds: allCheckedReds,
                sheriffCheckedReds: sheriffRedChecks,
                donCheckedReds: donRedChecks,
                donCheckedBlacks: [],  // Для калькулятора нет ввода черных проверок Дона
                sheriffSeat: sheriffSeat,
                nightNum: nightNum,
                donAction: rawAction,
                donDigitVal: donDigitVal
            };
            
            var result = solveKosmatika(state);
            var resBox = getEl('win-result-box');
            resBox.style.display = 'block';
            resBox.innerHTML = `
                <h2 style="color:var(--winchester-color); margin-top:0;">СТРЕЛЯТЬ В: ${result.target}</h2>
                <div style="color:#aaa; font-size:0.9em;">Метод: ${result.method}</div>
                <hr style="border-color:#444; opacity:0.3">
                ${result.logs.map(l => `<div class="expl-step">${l}</div>`).join('')}
            `;

        } catch (e) { alert(e.message); }
    }

    // Event listeners for winchester calculator
    var winKosmListEl = getEl('win-kosm-list');
    if(winKosmListEl) {
        winKosmListEl.addEventListener('blur', function() {
            var val = this.value.replace(/[^0-9]/g, '');
            if (val.length === 1) {
                // Если введена 1 цифра, дописываем её еще 2 раза
                this.value = val + val + val;
            } else if (val.length === 2) {
                // Если введены 2 цифры, дописываем последнюю
                this.value = val + val[1];
            }
        });
    }
    
    var winSheriffInputEl = getEl('win-sheriff-seat');
    if(winSheriffInputEl) {
        winSheriffInputEl.addEventListener('input', function() { 
            validateSheriffSeat(this, 'win-black-team');
            handleWinchesterSheriffInputLogic(this); 
        });
        winSheriffInputEl.addEventListener('focus', function() { this.select(); });
    }
    
    var winBlackTeamEl = getEl('win-black-team');
    if(winBlackTeamEl) {
        winBlackTeamEl.addEventListener('input', handleWinchesterBlackTeamInput);
    }
    
    var winDonInputEl = getEl('win-don-seat');
    if(winDonInputEl) {
        winDonInputEl.addEventListener('focus', function() { this.select(); });
        winDonInputEl.addEventListener('input', function() { handleWinchesterDonInputLogic(this); });
    }
    
    var winCheckedBlacksEl = getEl('win-checked-blacks');
    if(winCheckedBlacksEl) {
        winCheckedBlacksEl.addEventListener('input', handleWinchesterCheckedBlacksInput);
    }

    var winDonActionEl = getEl('win-don-action');
    if(winDonActionEl) {
        winDonActionEl.addEventListener('change', function() {
            getEl('win-digit-input-div').style.display = (this.value === 'digit') ? 'block' : 'none';
            if(this.value === 'digit') {
                document.getElementById('win-don-digit').value = "1";
            }
        });
    }

    var winCalcBtn = getEl('win-calc-btn');
    if(winCalcBtn) {
        winCalcBtn.addEventListener('click', calculateWinchester);
    }
    
    // Initialize winchester visuals
    if(winBlackTeamEl) {
        var event = new Event('input');
        winBlackTeamEl.dispatchEvent(event);
    }
    
    // === ROUTING: Initialize mode from URL params or page defaults ===
    (function initPageMode() {
        var params = new URLSearchParams(window.location.search);
        var urlMode = params.get('mode');
        var urlTitle = params.get('title');
        var urlDrill = params.get('drill');
        
        if (urlMode && urlTitle) {
            // Priority 1: URL parameters (from cross-page redirect)
            selectMode(decodeURIComponent(urlMode), decodeURIComponent(urlTitle), true);
        } else {
            // Priority 2: Page-specific default mode (never redirect)
            var currentFile = getCurrentPageFile();
            var defaults = PAGE_DEFAULTS[currentFile] || PAGE_DEFAULTS['index.html'];
            selectMode(defaults.mode, defaults.title, true);
        }
        
        // Handle drill redirect: ?drill=drillType
        if (urlDrill) {
            selectDrill(decodeURIComponent(urlDrill));
        }
    })();
    
    // ═══════════════════════════════════════════════════════════════
    // КАЛЬКУЛЯТОР КОСМАТИКИ: Логика "Статус Шерифа"
    // ═══════════════════════════════════════════════════════════════
    var cSheriffStatusSelect = getEl('c-sheriff-status');
    var cSheriffSeatInput = getEl('c-sheriff-seat');
    
    if(cSheriffStatusSelect && cSheriffSeatInput) {
        // Обработчик select: показ/скрытие полей проверок
        cSheriffStatusSelect.addEventListener('change', function() {
            var status = this.value;
            var sheriffValue = cSheriffSeatInput.value.trim();
            var container = getEl('c-red-checks-container');
            
            // Если выбран статус "мертв" или "2 версии", но шериф не указан
            if((status === 'dead_solo' || status === 'dual') && !sheriffValue) {
                // Возвращаем на "жив"
                this.value = 'alive';
                
                // Визуальный фидбэк: тряска поля
                cSheriffSeatInput.classList.add('input-error');
                setTimeout(function() {
                    cSheriffSeatInput.classList.remove('input-error');
                }, 600);
                
                if(container) container.style.display = 'none';
                return;
            }
            
            // Показываем блок проверок, если выбрано "мертв" или "2 версии"
            if(container) {
                container.style.display = (status !== 'alive') ? 'block' : 'none';
            }
        });
        
        // Обработчик поля "Шериф": автосброс статуса при очистке
        cSheriffSeatInput.addEventListener('input', function() {
            if(!this.value.trim()) {
                // Если поле пустое - сбрасываем статус на "жив"
                if(cSheriffStatusSelect.value !== 'alive') {
                    cSheriffStatusSelect.value = 'alive';
                    
                    var container = getEl('c-red-checks-container');
                    if(container) container.style.display = 'none';
                }
                
                // Очищаем поля проверок
                var sherRedInput = getEl('c-sheriff-red-checks');
                var donRedInput = getEl('c-don-red-checks');
                if(sherRedInput) sherRedInput.value = '';
                if(donRedInput) donRedInput.value = '';
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // КАЛЬКУЛЯТОР АВТОМАТА: Логика "Статус Шерифа"
    // ═══════════════════════════════════════════════════════════════
    var acSheriffStatusSelect = getEl('ac-sheriff-status');
    var acSheriffSeatInput = getEl('ac-sheriff-seat');
    
    if(acSheriffStatusSelect && acSheriffSeatInput) {
        // Обработчик select: показ/скрытие полей проверок
        acSheriffStatusSelect.addEventListener('change', function() {
            var status = this.value;
            var sheriffValue = acSheriffSeatInput.value.trim();
            var container = getEl('ac-red-checks-container');
            
            // Если выбран статус "мертв" или "2 версии", но шериф не указан
            if((status === 'dead_solo' || status === 'dual') && !sheriffValue) {
                // Возвращаем на "жив"
                this.value = 'alive';
                
                // Визуальный фидбэк: тряска поля
                acSheriffSeatInput.classList.add('input-error');
                setTimeout(function() {
                    acSheriffSeatInput.classList.remove('input-error');
                }, 600);
                
                if(container) container.style.display = 'none';
                return;
            }
            
            // Показываем блок проверок, если выбрано "мертв" или "2 версии"
            if(container) {
                container.style.display = (status !== 'alive') ? 'block' : 'none';
            }
        });
        
        // Обработчик поля "Шериф": автосброс статуса при очистке
        acSheriffSeatInput.addEventListener('input', function() {
            if(!this.value.trim()) {
                // Если поле пустое - сбрасываем статус на "жив"
                if(acSheriffStatusSelect.value !== 'alive') {
                    acSheriffStatusSelect.value = 'alive';
                    
                    var container = getEl('ac-red-checks-container');
                    if(container) container.style.display = 'none';
                }
                
                // Очищаем поля проверок
                var sherRedInput = getEl('ac-sheriff-red-checks');
                var donRedInput = getEl('ac-don-red-checks');
                if(sherRedInput) sherRedInput.value = '';
                if(donRedInput) donRedInput.value = '';
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // КАЛЬКУЛЯТОР ВИНЧЕСТЕРА: Логика "Статус Шерифа"
    // ═══════════════════════════════════════════════════════════════
    var winSheriffStatusSelect = getEl('win-sheriff-status');
    var winSheriffSeatInput = getEl('win-sheriff-seat');
    
    if(winSheriffStatusSelect && winSheriffSeatInput) {
        // Обработчик select: показ/скрытие полей проверок
        winSheriffStatusSelect.addEventListener('change', function() {
            var status = this.value;
            var sheriffValue = winSheriffSeatInput.value.trim();
            var container = getEl('win-red-checks-container');
            
            // Если выбран статус "мертв" или "2 версии", но шериф не указан
            if((status === 'dead_solo' || status === 'dual') && !sheriffValue) {
                // Возвращаем на "жив"
                this.value = 'alive';
                
                // Визуальный фидбэк: тряска поля
                winSheriffSeatInput.classList.add('input-error');
                setTimeout(function() {
                    winSheriffSeatInput.classList.remove('input-error');
                }, 600);
                
                if(container) container.style.display = 'none';
                return;
            }
            
            // Показываем блок проверок, если выбрано "мертв" или "2 версии"
            if(container) {
                container.style.display = (status !== 'alive') ? 'block' : 'none';
            }
        });
        
        // Обработчик поля "Шериф": автосброс статуса при очистке
        winSheriffSeatInput.addEventListener('input', function() {
            if(!this.value.trim()) {
                // Если поле пустое - сбрасываем статус на "жив"
                if(winSheriffStatusSelect.value !== 'alive') {
                    winSheriffStatusSelect.value = 'alive';
                    
                    var container = getEl('win-red-checks-container');
                    if(container) container.style.display = 'none';
                }
                
                // Очищаем поля проверок
                var sherRedInput = getEl('win-sheriff-red-checks');
                var donRedInput = getEl('win-don-red-checks');
                if(sherRedInput) sherRedInput.value = '';
                if(donRedInput) donRedInput.value = '';
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ: Валидация поля "Красные проверки Шерифа"
    // ═══════════════════════════════════════════════════════════════
    function setupSheriffValidation(prefix) {
        var sheriffInput = getEl(prefix + '-sheriff-seat');
        var donInput = getEl(prefix + '-don-seat');
        var blackTeamInput = getEl(prefix + '-black-team');
        var redChecksInput = getEl(prefix + '-sheriff-red-checks');
        
        if(!sheriffInput || !redChecksInput) return;
        
        // 1. БЛОКИРОВКА/РАЗБЛОКИРОВКА поля проверок в зависимости от наличия шерифа
        function updateRedChecksAvailability() {
            var sheriffValue = sheriffInput.value.trim();
            
            if(!sheriffValue) {
                // Если шерифа нет - блокируем и очищаем поле проверок
                redChecksInput.disabled = true;
                redChecksInput.value = '';
                redChecksInput.style.opacity = '0.5';
                redChecksInput.style.cursor = 'not-allowed';
            } else {
                // Если шериф есть - разблокируем
                redChecksInput.disabled = false;
                redChecksInput.style.opacity = '1';
                redChecksInput.style.cursor = 'text';
            }
        }
        
        // Инициализация при загрузке
        updateRedChecksAvailability();
        
        // Отслеживаем изменения в поле Шерифа
        sheriffInput.addEventListener('input', updateRedChecksAvailability);
        
        // 2. ВАЛИДАЦИЯ вводимых данных (фильтрация запрещенных номеров)
        redChecksInput.addEventListener('input', function() {
            var inputValue = this.value;
            var numbers = parseSmartInput(inputValue);
            
            // Получаем номер Шерифа (с учетом 0 = 10)
            var sheriffNum = parseInt(sheriffInput.value);
            if(sheriffNum === 0) sheriffNum = 10;
            
            // Получаем номер Дона (с учетом 0 = 10)
            var donNum = null;
            if(donInput) {
                var donVal = parseInt(donInput.value);
                if(donVal === 0) donNum = 10;
                else if(donVal) donNum = donVal;
            }
            
            // Получаем черную команду (если есть)
            var blackTeam = [];
            if(blackTeamInput) {
                blackTeam = parseSmartInput(blackTeamInput.value);
            }
            
            // Проверяем каждое введенное число
            var invalidNumbers = [];
            var validNumbers = [];
            
            for(var i = 0; i < numbers.length; i++) {
                var num = numbers[i];
                var isInvalid = false;
                
                // Проверка 1: Нельзя проверить самого себя (Шерифа)
                if(num === sheriffNum) {
                    isInvalid = true;
                    invalidNumbers.push(num + ' (Шериф)');
                }
                
                // Проверка 2: Нельзя проверить Дона (он черный)
                if(!isInvalid && donNum !== null && num === donNum) {
                    isInvalid = true;
                    invalidNumbers.push(num + ' (Дон)');
                }
                
                // Проверка 3: Нельзя проверить членов черной команды
                if(!isInvalid && blackTeam.length > 0 && blackTeam.includes(num)) {
                    isInvalid = true;
                    invalidNumbers.push(num + ' (Черный)');
                }
                
                // Проверка 4: Нельзя добавлять повторяющиеся номера
                if(!isInvalid && !validNumbers.includes(num)) {
                    validNumbers.push(num);
                }
            }
            
            // Если были найдены некорректные номера
            if(invalidNumbers.length > 0) {
                // Обновляем поле только валидными номерами
                this.value = validNumbers.join(' ');
                
                // Эффект тряски
                this.classList.add('input-error');
                setTimeout(function() {
                    redChecksInput.classList.remove('input-error');
                }, 600);
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ: Валидация поля "Проверенные ЧЕРНЫЕ (версия Шерифа)"
    // ═══════════════════════════════════════════════════════════════
    function setupBlackChecksValidation(prefix, checksFieldSuffix) {
        var blackTeamInput = getEl(prefix + '-black-team');
        var checksInput = getEl(prefix + '-' + checksFieldSuffix);
        
        if(!blackTeamInput || !checksInput) return;
        
        // Функция фильтрации: оставить только цифры из черной команды
        function filterChecksAgainstBlackTeam() {
            var blackTeam = parseSmartInput(blackTeamInput.value);
            var currentChecks = parseSmartInput(checksInput.value);
            
            // Фильтруем проверки: оставляем только те, что есть в черной команде
            var validChecks = currentChecks.filter(function(num) {
                return blackTeam.includes(num);
            });
            
            // Если были удалены какие-то цифры, обновляем поле
            if(validChecks.length !== currentChecks.length) {
                checksInput.value = validChecks.join(' ');
            }
        }
        
        // СЦЕНАРИЙ А: Валидация при вводе в поле "Проверенные ЧЕРНЫЕ"
        checksInput.addEventListener('input', function() {
            var inputValue = this.value;
            var numbers = parseSmartInput(inputValue);
            var blackTeam = parseSmartInput(blackTeamInput.value);
            
            // Проверяем каждое введенное число
            var invalidNumbers = [];
            var validNumbers = [];
            
            for(var i = 0; i < numbers.length; i++) {
                var num = numbers[i];
                
                // Проверка: Число ДОЛЖНО быть в черной команде
                if(blackTeam.includes(num)) {
                    validNumbers.push(num);
                } else {
                    invalidNumbers.push(num);
                }
            }
            
            // Если были найдены некорректные номера
            if(invalidNumbers.length > 0) {
                // Обновляем поле только валидными номерами
                this.value = validNumbers.join(' ');
                
                // Эффект тряски
                this.classList.add('input-error');
                setTimeout(function() {
                    checksInput.classList.remove('input-error');
                }, 600);
            }
        });
        
        // СЦЕНАРИЙ Б: Автоочистка при изменении черной команды
        blackTeamInput.addEventListener('input', function() {
            filterChecksAgainstBlackTeam();
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ: Запрет дублирования цифр в списках
    // (Двухуровневая защита от спама и вставки)
    // ═══════════════════════════════════════════════════════════════
    function enforceUniqueDigits(inputId) {
        var inputElement = getEl(inputId);
        if(!inputElement) return;
        
        // УРОВЕНЬ 1: Блокировка ввода дубликатов на лету (keydown)
        inputElement.addEventListener('keydown', function(e) {
            // Разрешаем управляющие клавиши (Backspace, Delete, стрелки, Tab, Enter и т.д.)
            if(e.key.length > 1) return;
            
            // Если это цифра и она уже есть в поле
            if(/\d/.test(e.key) && this.value.includes(e.key)) {
                e.preventDefault(); // БЛОКИРУЕМ ввод
                
                // Эффект тряски
                this.classList.add('input-error');
                var self = this;
                setTimeout(function() {
                    self.classList.remove('input-error');
                }, 500);
            }
        });
        
        // УРОВЕНЬ 2: Санитарная зачистка от мусора и повторов (input)
        // Срабатывает при Paste, Autofill, или если keydown проскочил
        inputElement.addEventListener('input', function() {
            var raw = this.value.replace(/\D/g, ''); // Удаляем ВСЁ кроме цифр (включая пробелы!)
            
            // Преобразуем в массив символов, убираем дубликаты через Set, склеиваем обратно
            var unique = Array.from(new Set(raw.split(''))).join('');
            
            // Если итоговое значение отличается от текущего
            if(this.value !== unique) {
                this.value = unique;
                
                // Эффект тряски
                this.classList.add('input-error');
                var self = this;
                setTimeout(function() {
                    self.classList.remove('input-error');
                }, 500);
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ: Валидация поля "Дон сидит на"
    // (Дон ОБЯЗАН быть членом Черной команды)
    // ═══════════════════════════════════════════════════════════════
    function setupDonValidation(prefix) {
        var blackTeamInput = getEl(prefix + '-black-team');
        var donInput = getEl(prefix + '-don-seat');
        
        if(!blackTeamInput || !donInput) return;
        
        // ПРАВИЛО 1: Валидация ввода Дона (должен быть из черной команды)
        donInput.addEventListener('input', function() {
            var donValue = this.value.trim();
            
            // Если поле пустое - разрешаем
            if(donValue === '') return;
            
            // Ограничение: только 1 цифра (Дон всегда один)
            if(donValue.length > 1) {
                this.value = donValue.charAt(donValue.length - 1); // Берём только последнюю цифру
                donValue = this.value;
            }
            
            // Удаляем всё кроме цифр
            var cleanValue = donValue.replace(/\D/g, '');
            if(cleanValue !== donValue) {
                this.value = cleanValue;
                donValue = cleanValue;
            }
            
            // Если после очистки поле пустое - выходим
            if(donValue === '') return;
            
            // Получаем черную команду (используем parseSmartInput для корректной обработки)
            var blackTeam = parseSmartInput(blackTeamInput.value);
            
            // Преобразуем введенное значение Дона (с учетом 0 = 10)
            var donNum = parseInt(donValue);
            if(donNum === 0) donNum = 10;
            
            // Проверяем: есть ли Дон в черной команде?
            if(!blackTeam.includes(donNum)) {
                // НЕТ - удаляем
                this.value = '';
                
                // Эффект тряски
                this.classList.add('input-error');
                var self = this;
                setTimeout(function() {
                    self.classList.remove('input-error');
                }, 600);
            }
        });
        
        // ПРАВИЛО 2: Авто-заполнение + Синхронизация при изменении черной команды
        blackTeamInput.addEventListener('input', function() {
            var teamValue = this.value.trim();
            
            // АВТО-ЗАПОЛНЕНИЕ: Берём первую цифру команды и ставим её как Дона
            if(teamValue.length > 0) {
                // Извлекаем первую цифру (игнорируя пробелы в начале)
                var firstDigit = teamValue.replace(/\D/g, '').charAt(0);
                
                if(firstDigit) {
                    donInput.value = firstDigit;
                } else {
                    // Если нет цифр вообще - очищаем Дона
                    donInput.value = '';
                }
            } else {
                // Если команда пустая - очищаем Дона
                donInput.value = '';
            }
            
            // СИНХРОНИЗАЦИЯ: Проверяем, что Дон всё ещё в команде (на случай ручного изменения)
            var donValue = donInput.value.trim();
            if(donValue === '') return;
            
            // Получаем черную команду
            var blackTeam = parseSmartInput(this.value);
            
            // Преобразуем Дона (с учетом 0 = 10)
            var donNum = parseInt(donValue);
            if(donNum === 0) donNum = 10;
            
            // Если Дона больше нет в команде - очищаем поле Дона
            if(!blackTeam.includes(donNum)) {
                donInput.value = '';
            }
        });
    }
    
    // Применяем валидацию для всех трех калькуляторов
    setupSheriffValidation('c');    // Косматика
    setupSheriffValidation('ac');   // Автомат
    setupSheriffValidation('win');  // Винчестер
    
    // Применяем валидацию "Проверенных ЧЕРНЫХ"
    // Поля версии Шерифа
    setupBlackChecksValidation('c', 'sheriff-checked-blacks');      // Косматика: поле Шерифа
    setupBlackChecksValidation('ah', 'sheriff-checked-blacks');     // Ahalay: поле Шерифа
    setupBlackChecksValidation('who', 'sheriff-checked-blacks');    // Кто: поле Шерифа
    setupBlackChecksValidation('mantis', 'sheriff-checked-blacks'); // Богомол: поле Шерифа
    setupBlackChecksValidation('check', 'sheriff-checked-blacks');  // Проверка: поле Шерифа
    
    // Поля версии Дона/Лже (общие)
    setupBlackChecksValidation('c', 'checked-blacks');              // Косматика: поле Дона
    setupBlackChecksValidation('ac', 'checked-blacks');             // Автомат: поле Дона
    setupBlackChecksValidation('win', 'checked-blacks');            // Винчестер: поле Дона
    setupBlackChecksValidation('ah', 'checked-blacks');             // Ahalay: поле Дона
    setupBlackChecksValidation('who', 'checked-blacks');            // Кто: поле Дона
    setupBlackChecksValidation('mantis', 'checked-blacks');         // Богомол: поле Дона
    setupBlackChecksValidation('check', 'checked-blacks');          // Проверка: поле Дона
    
    // ═══════════════════════════════════════════════════════════════
    // Применяем валидацию "Уникальность цифр" для всех полей списков
    // ═══════════════════════════════════════════════════════════════
    var prefixes = ['c', 'ac', 'win', 'ah', 'who', 'mantis', 'check'];
    var listFields = [
        'black-team',
        'sheriff-red-checks',
        'don-red-checks',
        'sheriff-checked-blacks',
        'checked-blacks'
    ];
    
    prefixes.forEach(function(prefix) {
        listFields.forEach(function(field) {
            enforceUniqueDigits(prefix + '-' + field);
        });
    });
    
    // ═══════════════════════════════════════════════════════════════
    // Применяем валидацию "Дон = член Черной команды"
    // ═══════════════════════════════════════════════════════════════
    setupDonValidation('c');        // Косматика
    setupDonValidation('ac');       // Автомат
    setupDonValidation('win');      // Винчестер
    setupDonValidation('ah');       // Ahalay
    setupDonValidation('who');      // Кто
    setupDonValidation('mantis');   // Богомол
    setupDonValidation('check');    // Проверка
    
    var calcBtn = getEl('calc-btn');
    if(calcBtn) {
        calcBtn.addEventListener('click', function() { 
            try { 
                var kList = parseSmartInput(getEl('c-kosm-list').value); 
                if (kList.length > 0) { 
                    if (kList.length === 1) kList = [kList[0], kList[0], kList[0]]; 
                    else if (kList.length === 2) kList = [kList[0], kList[1], kList[1]]; 
                } 
                var blackTeam = parseSmartInput(getEl('c-black-team').value); 
                if (blackTeam.length < 3) { 
                    alert("Не хватает чёрных игроков!"); 
                    return; 
                } 
        
                var checkedBlacks1 = parseSmartInput(getEl('c-checked-blacks').value); 
                var checkedBlacks2 = parseSmartInput(getEl('c-sheriff-checked-blacks').value);
                var checkedBlacks = checkedBlacks1.concat(checkedBlacks2.filter(function (item) { return checkedBlacks1.indexOf(item) < 0; }));
        
                var kIndex = parseInt(getEl('c-kosm-index').value); 
                var donInput = parseInt(getEl('c-don-seat').value); 
                var donSeat = (donInput === 0) ? 10 : (donInput || 0); 
                var nightNum = parseInt(getEl('c-night-num').value); 
                var sherInput = parseInt(getEl('c-sheriff-seat').value); 
                var sheriffSeat = (sherInput === 0) ? 10 : (sherInput || 0); 
                var donAction = getEl('c-don-action').value; 
                var donDigitVal = parseInt(getEl('c-don-digit').value) || 0; 
                var deadPlayers = []; 
                for(var i=1; i<=10; i++) { 
                    var seat = getEl('calc-seat-' + i); 
                    if(seat && seat.classList.contains('dead')) deadPlayers.push(i); 
                } 
                if(kList.length === 0) { 
                    alert("Введите косматику!"); 
                    return; 
                }
                
                // НОВАЯ ЛОГИКА: Считываем данные для охоты на красную проверку
                var sheriffStatus = getEl('c-sheriff-status') ? getEl('c-sheriff-status').value : 'alive';
                // ИСПРАВЛЕНО: sheriffDead = true ТОЛЬКО при dead_solo (НЕ при dual!)
                var sheriffDead = (sheriffStatus === 'dead_solo');
                var isSoloSheriff = (sheriffStatus === 'dead_solo');
                var sheriffRedChecks = [];
                var donRedChecks = [];
                var allCheckedReds = [];
                
                // Режим "Охота на красную проверку" активен ТОЛЬКО при dead_solo
                if(sheriffStatus === 'dead_solo') {
                    sheriffRedChecks = parseSmartInput(getEl('c-sheriff-red-checks').value);
                    // Объединяем для общего массива (в режиме Solo Sheriff Дон не дает информацию)
                    allCheckedReds = sheriffRedChecks;
                    
                    // КРИТИЧЕСКИ ВАЖНО: Добавляем шерифа в список мертвых для Solo Sheriff Mode
                    if(sheriffSeat > 0 && !deadPlayers.includes(sheriffSeat)) {
                        deadPlayers.push(sheriffSeat);
                    }
                }
                
                // Режим "2 Версии" (dual) - читаем проверки обеих версий, но НЕ активируем охоту
                if(sheriffStatus === 'dual') {
                    sheriffRedChecks = parseSmartInput(getEl('c-sheriff-red-checks').value);
                    donRedChecks = parseSmartInput(getEl('c-don-red-checks').value);
                    // Объединяем для поиска "Двойной Красной" (если нужно)
                    allCheckedReds = sheriffRedChecks.concat(donRedChecks.filter(function(r) { return !sheriffRedChecks.includes(r); }));
                    // НЕ добавляем шерифа в мертвые - это режим "2 версии", стреляем по математике!
                }
                
                var state = { 
                    kosmatikaList: kList, 
                    kIndex: kIndex, 
                    donSeat: donSeat, 
                    blackTeam: blackTeam, 
                    deadPlayers: deadPlayers, 
                    checkedBlacks: checkedBlacks, 
                    checkedReds: allCheckedReds,
                    sheriffCheckedReds: sheriffRedChecks,
                    donCheckedReds: donRedChecks,
                    donCheckedBlacks: [],  // Для калькулятора нет ввода черных проверок Дона
                    sheriffSeat: sheriffSeat, 
                    nightNum: nightNum, 
                    donAction: donAction, 
                    donDigitVal: donDigitVal 
                }; 
                
                var result = solveKosmatika(state); 
                var rBox = getEl('calc-result'); 
                if(rBox) { 
                    showEl('calc-result', true); 
                    rBox.className = 'result-box correct'; 
                    rBox.style.borderColor = "#f1c40f"; 
                    var logsHtml = result.logs.map(function(l) { return '<div class="expl-step">' + l + '</div>'; }).join(''); 
                    rBox.innerHTML = '<h3>🎯 Стреляем в: ' + result.target + '</h3><div>Метод: <strong>' + result.method + '</strong></div><hr style="border-color:#555">' + logsHtml; 
                } 
            } catch(e) { 
                alert("Error: " + e.message); 
            } 
        });
    }
    
    // Вспомогательная функция для парсинга номера места (0 = 10, пустая строка = null)
    function parseSeatNumber(inputEl) {
        if(!inputEl) return null;
        var value = inputEl.value.trim();
        if(value === '') return null;
        var num = parseInt(value);
        if(isNaN(num)) return null;
        return (num === 0) ? 10 : num;
    }
    
    // Общая функция обновления визуалов стандартного калькулятора
    function updateCalcVisuals() { 
        var bt = getEl('c-black-team'); if(!bt) return;
        var blackTeam = parseSmartInput(bt.value); 
        var dS = getEl('c-don-seat');
        var donSeat = parseSeatNumber(dS);
        var sS = getEl('c-sheriff-seat');
        var sheriffSeat = parseSeatNumber(sS);
        
        var cB1 = getEl('c-checked-blacks'); var cb1 = cB1 ? parseSmartInput(cB1.value) : []; 
        var cB2 = getEl('c-sheriff-checked-blacks'); var cb2 = cB2 ? parseSmartInput(cB2.value) : []; 
        var checkedBlacks = cb1.concat(cb2);
        
        // Валидация: Дон не может быть Шерифом
        var donInputEl = getEl('c-don-seat');
        var sheriffInputEl = getEl('c-sheriff-seat');
        var hasConflict = (donSeat !== null && sheriffSeat !== null && donSeat === sheriffSeat);
        if(donInputEl) {
            if(hasConflict) donInputEl.classList.add('input-error');
            else donInputEl.classList.remove('input-error');
        }
        if(sheriffInputEl) {
            if(hasConflict) sheriffInputEl.classList.add('input-error');
            else sheriffInputEl.classList.remove('input-error');
        }

        for(var i=1; i<=10; i++) { 
            var seat = getEl('calc-seat-' + i); if(!seat) continue; 
            seat.classList.remove('mafia', 'don', 'sheriff', 'checked-black'); 
            if(blackTeam.includes(i)) { 
                if (donSeat !== null && i === donSeat) seat.classList.add('don'); 
                else seat.classList.add('mafia'); 
            } 
            if(sheriffSeat !== null && i === sheriffSeat && !hasConflict) seat.classList.add('sheriff'); 
            if(checkedBlacks.includes(i)) seat.classList.add('checked-black'); 
        } 
    }
    // Подключаем слушатели на обновление визуалов
    ['c-black-team', 'c-don-seat', 'c-sheriff-seat', 'c-checked-blacks', 'c-sheriff-checked-blacks'].forEach(function(id) {
        var el = getEl(id); if(el) el.addEventListener('input', updateCalcVisuals);
    });
    // Валидация поля Шерифа для Косматики
    var cSheriffEl = getEl('c-sheriff-seat');
    if(cSheriffEl) {
        cSheriffEl.addEventListener('input', function() {
            validateSheriffSeat(this, 'c-black-team');
        });
    }
    updateCalcVisuals();
    
    // Обработчик для c-don-action
    var cDonActionEl = getEl('c-don-action');
    if(cDonActionEl) {
        cDonActionEl.addEventListener('change', function() {
            var digitDiv = getEl('c-digit-input-div');
            if(digitDiv) {
                digitDiv.style.display = (this.value === 'digit') ? 'block' : 'none';
            }
            if(this.value === 'digit') {
                document.getElementById('c-don-digit').value = "1";
            }
        });
    }
    
    // --- 1. КАЛЬКУЛЯТОР АХАЛАЯ (ALAHAY) ---
    var ahCalcBtn = getEl('ah-calc-btn');
    if(ahCalcBtn) {
        ahCalcBtn.addEventListener('click', function() { 
            try { 
                var logicMode = 'calc';
                var kList = parseKosmatikaInput(getEl('ah-kosm-list').value);

                var blackTeam = parseSmartInput(getEl('ah-black-team').value); 
                if (blackTeam.length < 3) { alert("Не хватает чёрных игроков!"); return; } 
                
                var checkedBlacks1 = parseSmartInput(getEl('ah-checked-blacks').value); 
                var checkedBlacks2 = parseSmartInput(getEl('ah-sheriff-checked-blacks').value);
                var checkedBlacks = checkedBlacks1.concat(checkedBlacks2.filter(function (item) { return checkedBlacks1.indexOf(item) < 0; }));
                
                var kIndex = parseInt(getEl('ah-kosm-index').value); 
                var donInput = parseInt(getEl('ah-don-seat').value); var donSeat = (donInput === 0) ? 10 : (donInput || 0); 
                var nightNum = parseInt(getEl('ah-night-num').value); 
                var sherInput = parseInt(getEl('ah-sheriff-seat').value); var sheriffSeat = (sherInput === 0) ? 10 : (sherInput || 0); 
                var donAction = getEl('ah-don-action').value; 
                var donDigitVal = parseInt(getEl('ah-don-digit').value) || 0; 
                
                var deadPlayers = []; 
                for(var i=1; i<=10; i++) { var seat = getEl('ah-seat-' + i); if(seat && seat.classList.contains('dead')) deadPlayers.push(i); } 
                
                // Временно меняем режим для корректного расчета
                var oldMode = appGameMode;
                appGameMode = 'ahalay_calc';

                var state = { 
                    mode: logicMode,
                    kosmatikaList: kList, 
                    kIndex: kIndex, 
                    donSeat: donSeat, 
                    blackTeam: blackTeam, 
                    deadPlayers: deadPlayers, 
                    checkedBlacks: checkedBlacks, 
                    sheriffSeat: sheriffSeat, 
                    nightNum: nightNum, 
                    donAction: donAction, 
                    donDigitVal: donDigitVal 
                }; 
                
                var result = solveKosmatika(state); 
                appGameMode = oldMode; // Возвращаем режим

                var rBox = getEl('ah-calc-result'); 
                if(rBox) { 
                    showEl('ah-calc-result', true); 
                    rBox.className = 'result-box correct'; 
                    rBox.style.borderColor = "#e91e63"; 
                    var logsHtml = result.logs.map(function(l) { return '<div class="expl-step">' + l + '</div>'; }).join(''); 
                    rBox.innerHTML = '<h3>🎯 Стреляем в: ' + result.target + '</h3><div>Метод: <strong>' + result.method + '</strong></div><hr style="border-color:#555">' + logsHtml; 
                } 
            } catch(e) { alert("Error: " + e.message); } 
        });
    }
    
    // Listeners ввода для Ахалая (упрощенная версия для надежности)
    var ahInpBlack = getEl('ah-black-team'); 
    if(ahInpBlack) {
        ahInpBlack.addEventListener('input', function() { 
            var val = this.value.replace(/[^0-9]/g, '').slice(0, 3);
            var unique = ''; var s = {}; for(var i=0; i<val.length; i++) { if(!s[val[i]]) { s[val[i]]=true; unique+=val[i]; } }
            this.value = unique;
            if(unique.length>0) getEl('ah-don-seat').value = unique[0];
            updateAhalayCalcVisuals();
        });
    }
    
    var ahDonAct = getEl('ah-don-action'); 
    if(ahDonAct) {
        ahDonAct.addEventListener('change', function() {
            showEl('ah-digit-input-div', (this.value === 'digit'));
            if(this.value === 'digit') {
                document.getElementById('ah-don-digit').value = "1";
            }
        });
    }

    // Общая функция обновления визуалов Ахалая
    function updateAhalayCalcVisuals() { 
        var bt = getEl('ah-black-team'); if(!bt) return;
        var blackTeam = parseSmartInput(bt.value); 
        var dS = getEl('ah-don-seat');
        var donSeat = parseSeatNumber(dS);
        var sS = getEl('ah-sheriff-seat');
        var sheriffSeat = parseSeatNumber(sS);
        
        var cB1 = getEl('ah-checked-blacks'); var cb1 = cB1 ? parseSmartInput(cB1.value) : []; 
        var cB2 = getEl('ah-sheriff-checked-blacks'); var cb2 = cB2 ? parseSmartInput(cB2.value) : []; 
        var checkedBlacks = cb1.concat(cb2);
        
        // Валидация: Дон не может быть Шерифом
        var donInputEl = getEl('ah-don-seat');
        var sheriffInputEl = getEl('ah-sheriff-seat');
        var hasConflict = (donSeat !== null && sheriffSeat !== null && donSeat === sheriffSeat);
        if(donInputEl) {
            if(hasConflict) donInputEl.classList.add('input-error');
            else donInputEl.classList.remove('input-error');
        }
        if(sheriffInputEl) {
            if(hasConflict) sheriffInputEl.classList.add('input-error');
            else sheriffInputEl.classList.remove('input-error');
        }

        for(var i=1; i<=10; i++) { 
            var seat = getEl('ah-seat-' + i); if(!seat) continue; 
            seat.classList.remove('mafia', 'don', 'sheriff', 'checked-black'); 
            if(blackTeam.includes(i)) { 
                if (donSeat !== null && i === donSeat) seat.classList.add('don'); 
                else seat.classList.add('mafia'); 
            } 
            if(sheriffSeat !== null && i === sheriffSeat && !hasConflict) seat.classList.add('sheriff'); 
            if(checkedBlacks.includes(i)) seat.classList.add('checked-black'); 
        } 
    }
    // Подключаем слушатели на обновление визуалов
    ['ah-don-seat', 'ah-sheriff-seat', 'ah-checked-blacks', 'ah-sheriff-checked-blacks'].forEach(function(id) {
        var el = getEl(id); if(el) el.addEventListener('input', updateAhalayCalcVisuals);
    });
    // Валидация поля Шерифа для Ахалая
    var ahSheriffEl = getEl('ah-sheriff-seat');
    if(ahSheriffEl) {
        ahSheriffEl.addEventListener('input', function() {
            validateSheriffSeat(this, 'ah-black-team');
        });
    }
    updateAhalayCalcVisuals();


    // --- 2. КАЛЬКУЛЯТОР "КТО" (WHO) ---
    var whoCalcBtn = getEl('who-calc-btn');
    var whoContainer = getEl('who-seat-container');
    if(whoContainer) { whoContainer.innerHTML=''; for(var i=1;i<=10;i++){ (function(i){ var s=document.createElement('div'); s.className='player-seat'; s.innerText=i; s.id='who-seat-'+i; s.onclick=function(){this.classList.toggle('dead');}; whoContainer.appendChild(s); })(i); } }

    if(whoCalcBtn) {
        whoCalcBtn.addEventListener('click', function() {
            try {
                var oldMode = appGameMode; appGameMode = 'who_calc'; // Важно для solveKosmatika
                
                var kList = parseKosmatikaInput(getEl('who-kosm-list').value);
                var blackTeam = parseSmartInput(getEl('who-black-team').value);
                if (blackTeam.length < 3) { alert("Не хватает чёрных!"); return; }
                
                var cb1 = parseSmartInput(getEl('who-checked-blacks').value);
                var cb2 = parseSmartInput(getEl('who-sheriff-checked-blacks').value);
                var checkedBlacks = cb1.concat(cb2.filter(function(i){return cb1.indexOf(i)<0;}));

                var kIndex = parseInt(getEl('who-kosm-index').value);
                var donInput = parseInt(getEl('who-don-seat').value); var donSeat = (donInput===0)?10:(donInput||0);
                var nightNum = parseInt(getEl('who-night-num').value);
                var sherInput = parseInt(getEl('who-sheriff-seat').value); var sheriffSeat = (sherInput===0)?10:(sherInput||0);
                var donAction = getEl('who-don-action').value;
                var donDigitVal = parseInt(getEl('who-don-digit').value)||0;

                var deadPlayers = [];
                for(var i=1;i<=10;i++){ var s=getEl('who-seat-'+i); if(s&&s.classList.contains('dead')) deadPlayers.push(i); }

                var state = { kosmatikaList: kList, kIndex: kIndex, donSeat: donSeat, blackTeam: blackTeam, deadPlayers: deadPlayers, checkedBlacks: checkedBlacks, sheriffSeat: sheriffSeat, nightNum: nightNum, donAction: donAction, donDigitVal: donDigitVal };
                var result = solveKosmatika(state);
                appGameMode = oldMode;

                var rBox = getEl('who-calc-result');
                if(rBox) {
                    showEl('who-calc-result', true);
                    rBox.className = 'result-box correct';
                    rBox.style.borderColor = "#9c27b0";
                    var logsHtml = result.logs.map(function(l){return '<div class="expl-step">'+l+'</div>';}).join('');
                    rBox.innerHTML = '<h3>🎯 Стреляем в: '+result.target+'</h3><div>Метод: <strong>'+result.method+'</strong></div><hr style="border-color:#555">'+logsHtml;
                }
            } catch(e) { alert("Error: "+e.message); }
        });
    }
    // Listeners Who
    var whoInpB = getEl('who-black-team'); if(whoInpB) whoInpB.addEventListener('input', function(){ var val=this.value.replace(/[^0-9]/g,'').slice(0,3); var u=''; var s={}; for(var i=0;i<val.length;i++){if(!s[val[i]]){s[val[i]]=true; u+=val[i];}} this.value=u; if(u.length>0) getEl('who-don-seat').value=u[0]; updateWhoVisuals(); });
    var whoAct = getEl('who-don-action');
    if(whoAct) {
        whoAct.addEventListener('change', function() {
            showEl('who-digit-input-div', (this.value === 'digit'));
            if(this.value === 'digit') {
                document.getElementById('who-don-digit').value = "1";
            }
        });
    }
    ['who-don-seat','who-sheriff-seat','who-checked-blacks','who-sheriff-checked-blacks'].forEach(function(id){ var el=getEl(id); if(el) el.addEventListener('input', updateWhoVisuals); });
    // Валидация поля Шерифа для Кто
    var whoSheriffEl = getEl('who-sheriff-seat');
    if(whoSheriffEl) {
        whoSheriffEl.addEventListener('input', function() {
            validateSheriffSeat(this, 'who-black-team');
        });
    }
    function updateWhoVisuals() {
        var btEl = getEl('who-black-team'); if(!btEl) return;
        var bt = parseSmartInput(btEl.value);
        var dS = getEl('who-don-seat');
        var donSeat = parseSeatNumber(dS);
        var sS = getEl('who-sheriff-seat');
        var sheriffSeat = parseSeatNumber(sS);
        var cbEl1 = getEl('who-checked-blacks'), cbEl2 = getEl('who-sheriff-checked-blacks');
        var cb = parseSmartInput(cbEl1 ? cbEl1.value : '').concat(parseSmartInput(cbEl2 ? cbEl2.value : ''));
        
        // Валидация: Дон не может быть Шерифом
        var donInputEl = getEl('who-don-seat');
        var sheriffInputEl = getEl('who-sheriff-seat');
        var hasConflict = (donSeat !== null && sheriffSeat !== null && donSeat === sheriffSeat);
        if(donInputEl) {
            if(hasConflict) donInputEl.classList.add('input-error');
            else donInputEl.classList.remove('input-error');
        }
        if(sheriffInputEl) {
            if(hasConflict) sheriffInputEl.classList.add('input-error');
            else sheriffInputEl.classList.remove('input-error');
        }
        
        for(var i=1; i<=10; i++) {
            var s = getEl('who-seat-' + i);
            if(!s) continue;
            s.classList.remove('mafia', 'don', 'sheriff', 'checked-black');
            if(bt.includes(i)) {
                if(donSeat !== null && i === donSeat) s.classList.add('don');
                else s.classList.add('mafia');
            }
            if(sheriffSeat !== null && i === sheriffSeat && !hasConflict) s.classList.add('sheriff');
            if(cb.includes(i)) s.classList.add('checked-black');
        }
    }
    updateWhoVisuals();


    // --- 3. КАЛЬКУЛЯТОР "БОГОМОЛ" (MANTIS) ---
    var mantisCalcBtn = getEl('mantis-calc-btn');
    var mantisContainer = getEl('mantis-seat-container');
    if(mantisContainer) { mantisContainer.innerHTML=''; for(var i=1;i<=10;i++){ (function(i){ var s=document.createElement('div'); s.className='player-seat'; s.innerText=i; s.id='mantis-seat-'+i; s.onclick=function(){this.classList.toggle('dead');}; mantisContainer.appendChild(s); })(i); } }

    if(mantisCalcBtn) {
        mantisCalcBtn.addEventListener('click', function() {
            try {
                var oldMode = appGameMode; appGameMode = 'mantis_calc'; // Важно
                
                var kList = parseKosmatikaInput(getEl('mantis-kosm-list').value);
                var blackTeam = parseSmartInput(getEl('mantis-black-team').value);
                if (blackTeam.length < 3) { alert("Не хватает чёрных!"); return; }
                
                var cb1 = parseSmartInput(getEl('mantis-checked-blacks').value);
                var cb2 = parseSmartInput(getEl('mantis-sheriff-checked-blacks').value);
                var checkedBlacks = cb1.concat(cb2.filter(function(i){return cb1.indexOf(i)<0;}));

                var kIndex = parseInt(getEl('mantis-kosm-index').value);
                var donInput = parseInt(getEl('mantis-don-seat').value); var donSeat = (donInput===0)?10:(donInput||0);
                var nightNum = parseInt(getEl('mantis-night-num').value);
                var sherInput = parseInt(getEl('mantis-sheriff-seat').value); var sheriffSeat = (sherInput===0)?10:(sherInput||0);
                var donAction = getEl('mantis-don-action').value;
                var donDigitVal = parseInt(getEl('mantis-don-digit').value)||0;

                var deadPlayers = [];
                for(var i=1;i<=10;i++){ var s=getEl('mantis-seat-'+i); if(s&&s.classList.contains('dead')) deadPlayers.push(i); }

                var state = { kosmatikaList: kList, kIndex: kIndex, donSeat: donSeat, blackTeam: blackTeam, deadPlayers: deadPlayers, checkedBlacks: checkedBlacks, sheriffSeat: sheriffSeat, nightNum: nightNum, donAction: donAction, donDigitVal: donDigitVal };
                var result = solveKosmatika(state);
                appGameMode = oldMode;

                var rBox = getEl('mantis-calc-result');
                if(rBox) {
                    showEl('mantis-calc-result', true);
                    rBox.className = 'result-box correct';
                    rBox.style.borderColor = "#76ff03";
                    var logsHtml = result.logs.map(function(l){return '<div class="expl-step">'+l+'</div>';}).join('');
                    rBox.innerHTML = '<h3>🎯 Стреляем в: '+result.target+'</h3><div>Метод: <strong>'+result.method+'</strong></div><hr style="border-color:#555">'+logsHtml;
                }
            } catch(e) { alert("Error: "+e.message); }
        });
    }
    // Listeners Mantis
    var mantisInpB = getEl('mantis-black-team'); if(mantisInpB) mantisInpB.addEventListener('input', function(){ var val=this.value.replace(/[^0-9]/g,'').slice(0,3); var u=''; var s={}; for(var i=0;i<val.length;i++){if(!s[val[i]]){s[val[i]]=true; u+=val[i];}} this.value=u; if(u.length>0) getEl('mantis-don-seat').value=u[0]; updateMantisVisuals(); });
    var mantisAct = getEl('mantis-don-action');
    if(mantisAct) {
        mantisAct.addEventListener('change', function() {
            showEl('mantis-digit-input-div', (this.value === 'digit'));
            if(this.value === 'digit') {
                document.getElementById('mantis-don-digit').value = "1";
            }
        });
    }
    ['mantis-don-seat','mantis-sheriff-seat','mantis-checked-blacks','mantis-sheriff-checked-blacks'].forEach(function(id){ var el=getEl(id); if(el) el.addEventListener('input', updateMantisVisuals); });
    // Валидация поля Шерифа для Богомол
    var mantisSheriffEl = getEl('mantis-sheriff-seat');
    if(mantisSheriffEl) {
        mantisSheriffEl.addEventListener('input', function() {
            validateSheriffSeat(this, 'mantis-black-team');
        });
    }
    function updateMantisVisuals() {
        var btEl = getEl('mantis-black-team'); if(!btEl) return;
        var bt = parseSmartInput(btEl.value);
        var dS = getEl('mantis-don-seat');
        var donSeat = parseSeatNumber(dS);
        var sS = getEl('mantis-sheriff-seat');
        var sheriffSeat = parseSeatNumber(sS);
        var mcbEl1 = getEl('mantis-checked-blacks'), mcbEl2 = getEl('mantis-sheriff-checked-blacks');
        var cb = parseSmartInput(mcbEl1 ? mcbEl1.value : '').concat(parseSmartInput(mcbEl2 ? mcbEl2.value : ''));
        
        // Валидация: Дон не может быть Шерифом
        var donInputEl = getEl('mantis-don-seat');
        var sheriffInputEl = getEl('mantis-sheriff-seat');
        var hasConflict = (donSeat !== null && sheriffSeat !== null && donSeat === sheriffSeat);
        if(donInputEl) {
            if(hasConflict) donInputEl.classList.add('input-error');
            else donInputEl.classList.remove('input-error');
        }
        if(sheriffInputEl) {
            if(hasConflict) sheriffInputEl.classList.add('input-error');
            else sheriffInputEl.classList.remove('input-error');
        }
        
        for(var i=1; i<=10; i++) {
            var s = getEl('mantis-seat-' + i);
            if(!s) continue;
            s.classList.remove('mafia', 'don', 'sheriff', 'checked-black');
            if(bt.includes(i)) {
                if(donSeat !== null && i === donSeat) s.classList.add('don');
                else s.classList.add('mafia');
            }
            if(sheriffSeat !== null && i === sheriffSeat && !hasConflict) s.classList.add('sheriff');
            if(cb.includes(i)) s.classList.add('checked-black');
        }
    }
    updateMantisVisuals();

    // --- 4. КАЛЬКУЛЯТОР "ПРОВЕРКА" (CHECK) ---
    var checkCalcBtn = getEl('check-calc-btn');
    var checkContainer = getEl('check-seat-container');
    if(checkContainer) { checkContainer.innerHTML=''; for(var i=1;i<=10;i++){ (function(i){ var s=document.createElement('div'); s.className='player-seat'; s.innerText=i; s.id='check-seat-'+i; s.onclick=function(){this.classList.toggle('dead');}; checkContainer.appendChild(s); })(i); } }

    if(checkCalcBtn) {
        checkCalcBtn.addEventListener('click', function() {
            try {
                var oldMode = appGameMode; appGameMode = 'check_calc'; // Важно для solveKosmatika
                
                var kList = parseKosmatikaInput(getEl('check-kosm-list').value);
                var blackTeam = parseSmartInput(getEl('check-black-team').value);
                if (blackTeam.length < 3) { alert("Не хватает чёрных!"); return; }
                
                var cb1 = parseSmartInput(getEl('check-checked-blacks').value);
                var cb2 = parseSmartInput(getEl('check-sheriff-checked-blacks').value);
                var checkedBlacks = cb1.concat(cb2.filter(function(i){return cb1.indexOf(i)<0;}));

                var kIndex = parseInt(getEl('check-kosm-index').value);
                var donInput = parseInt(getEl('check-don-seat').value); var donSeat = (donInput===0)?10:(donInput||0);
                var nightNum = parseInt(getEl('check-night-num').value);
                var sherInput = parseInt(getEl('check-sheriff-seat').value); var sheriffSeat = (sherInput===0)?10:(sherInput||0);
                var donAction = getEl('check-don-action').value;
                var donDigitVal = parseInt(getEl('check-don-digit').value)||0;

                var deadPlayers = [];
                for(var i=1;i<=10;i++){ var s=getEl('check-seat-'+i); if(s&&s.classList.contains('dead')) deadPlayers.push(i); }

                var state = { kosmatikaList: kList, kIndex: kIndex, donSeat: donSeat, blackTeam: blackTeam, deadPlayers: deadPlayers, checkedBlacks: checkedBlacks, sheriffSeat: sheriffSeat, nightNum: nightNum, donAction: donAction, donDigitVal: donDigitVal };
                var result = solveKosmatika(state);
                appGameMode = oldMode;

                var rBox = getEl('check-calc-result');
                if(rBox) {
                    showEl('check-calc-result', true);
                    rBox.className = 'result-box correct';
                    rBox.style.borderColor = "#18ffff";
                    var logsHtml = result.logs.map(function(l){return '<div class="expl-step">'+l+'</div>';}).join('');
                    rBox.innerHTML = '<h3>🎯 Стреляем в: '+result.target+'</h3><div>Метод: <strong>'+result.method+'</strong></div><hr style="border-color:#555">'+logsHtml;
                }
            } catch(e) { alert("Error: "+e.message); }
        });
    }
    // Listeners Check
    var checkInpB = getEl('check-black-team'); if(checkInpB) checkInpB.addEventListener('input', function(){ var val=this.value.replace(/[^0-9]/g,'').slice(0,3); var u=''; var s={}; for(var i=0;i<val.length;i++){if(!s[val[i]]){s[val[i]]=true; u+=val[i];}} this.value=u; if(u.length>0) getEl('check-don-seat').value=u[0]; updateCheckVisuals(); });
    var checkAct = getEl('check-don-action');
    if(checkAct) {
        checkAct.addEventListener('change', function() {
            showEl('check-digit-input-div', (this.value === 'digit'));
            if(this.value === 'digit') {
                document.getElementById('check-don-digit').value = "1";
            }
        });
    }
    ['check-don-seat','check-sheriff-seat','check-checked-blacks','check-sheriff-checked-blacks'].forEach(function(id){ var el=getEl(id); if(el) el.addEventListener('input', updateCheckVisuals); });
    // Валидация поля Шерифа для Проверка
    var checkSheriffEl = getEl('check-sheriff-seat');
    if(checkSheriffEl) {
        checkSheriffEl.addEventListener('input', function() {
            validateSheriffSeat(this, 'check-black-team');
        });
    }
    function updateCheckVisuals() {
        var btEl = getEl('check-black-team'); if(!btEl) return;
        var bt = parseSmartInput(btEl.value);
        var dS = getEl('check-don-seat');
        var donSeat = parseSeatNumber(dS);
        var sS = getEl('check-sheriff-seat');
        var sheriffSeat = parseSeatNumber(sS);
        var ccbEl1 = getEl('check-checked-blacks'), ccbEl2 = getEl('check-sheriff-checked-blacks');
        var cb = parseSmartInput(ccbEl1 ? ccbEl1.value : '').concat(parseSmartInput(ccbEl2 ? ccbEl2.value : ''));
        
        // Валидация: Дон не может быть Шерифом
        var donInputEl = getEl('check-don-seat');
        var sheriffInputEl = getEl('check-sheriff-seat');
        var hasConflict = (donSeat !== null && sheriffSeat !== null && donSeat === sheriffSeat);
        if(donInputEl) {
            if(hasConflict) donInputEl.classList.add('input-error');
            else donInputEl.classList.remove('input-error');
        }
        if(sheriffInputEl) {
            if(hasConflict) sheriffInputEl.classList.add('input-error');
            else sheriffInputEl.classList.remove('input-error');
        }
        
        for(var i=1; i<=10; i++) {
            var s = getEl('check-seat-' + i);
            if(!s) continue;
            s.classList.remove('mafia', 'don', 'sheriff', 'checked-black');
            if(bt.includes(i)) {
                if(donSeat !== null && i === donSeat) s.classList.add('don');
                else s.classList.add('mafia');
            }
            if(sheriffSeat !== null && i === sheriffSeat && !hasConflict) s.classList.add('sheriff');
            if(cb.includes(i)) s.classList.add('checked-black');
        }
    }
    updateCheckVisuals();
    
    // Применяем валидацию к полю ввода цифры для Проверка
    addDigitInputValidation('check-don-digit');

    // --- КАЛЬКУЛЯТОР АВТОМАТА (AUTOMATCH) ---
    var acCalcBtn = getEl('ac-calc-btn');
    if(acCalcBtn) {
        acCalcBtn.addEventListener('click', function() {
            try {
                var oldMode = appGameMode;
                appGameMode = 'automatch_calc';
                
                var kList = parseSmartInput(getEl('ac-kosm-list').value);
                if (kList.length > 0) {
                    if (kList.length === 1) kList = [kList[0], kList[0], kList[0]];
                    else if (kList.length === 2) kList = [kList[0], kList[1], kList[1]];
                }
                if (kList.length === 0) {
                    alert("Введите косматику!");
                    return;
                }
                
                var blackTeam = parseSmartInput(getEl('ac-black-team').value);
                if (blackTeam.length < 3) {
                    alert("Не хватает чёрных игроков!");
                    return;
                }
                
                var checkedBlacks = parseSmartInput(getEl('ac-checked-blacks').value);
                
                var kIndex = parseInt(getEl('ac-kosm-index').value);
                var donInput = parseInt(getEl('ac-don-seat').value);
                var donSeat = (donInput === 0) ? 10 : (donInput || 0);
                var nightNum = parseInt(getEl('ac-night-num').value);
                var sherInput = parseInt(getEl('ac-sheriff-seat').value);
                var sheriffSeat = (sherInput === 0) ? 10 : (sherInput || 0);
                var donAction = getEl('ac-don-action').value;
                var donDigitVal = parseInt(getEl('ac-don-digit').value) || 0;
                
                var deadPlayers = [];
                for(var i=1; i<=10; i++) {
                    var seat = getEl('ac-seat-' + i);
                    if(seat && seat.classList.contains('dead')) deadPlayers.push(i);
                }
                
                // НОВАЯ ЛОГИКА: Считываем данные для охоты на красную проверку (Автомат)
                var sheriffStatus = getEl('ac-sheriff-status') ? getEl('ac-sheriff-status').value : 'alive';
                // ИСПРАВЛЕНО: sheriffDead = true ТОЛЬКО при dead_solo (НЕ при dual!)
                var sheriffDead = (sheriffStatus === 'dead_solo');
                var isSoloSheriff = (sheriffStatus === 'dead_solo');
                var sheriffRedChecks = [];
                var donRedChecks = [];
                var allCheckedReds = [];
                
                // Режим "Охота на красную проверку" активен ТОЛЬКО при dead_solo
                if(sheriffStatus === 'dead_solo') {
                    sheriffRedChecks = parseSmartInput(getEl('ac-sheriff-red-checks').value);
                    // Объединяем для общего массива (в режиме Solo Sheriff Дон не дает информацию)
                    allCheckedReds = sheriffRedChecks;
                    
                    // КРИТИЧЕСКИ ВАЖНО: Добавляем шерифа в список мертвых для Solo Sheriff Mode
                    if(sheriffSeat > 0 && !deadPlayers.includes(sheriffSeat)) {
                        deadPlayers.push(sheriffSeat);
                    }
                }
                
                // Режим "2 Версии" (dual) - читаем проверки обеих версий, но НЕ активируем охоту
                if(sheriffStatus === 'dual') {
                    sheriffRedChecks = parseSmartInput(getEl('ac-sheriff-red-checks').value);
                    donRedChecks = parseSmartInput(getEl('ac-don-red-checks').value);
                    // Объединяем для поиска "Двойной Красной" (если нужно)
                    allCheckedReds = sheriffRedChecks.concat(donRedChecks.filter(function(r) { return !sheriffRedChecks.includes(r); }));
                    // НЕ добавляем шерифа в мертвые - это режим "2 версии", стреляем по математике!
                }
                
                var state = {
                    kosmatikaList: kList,
                    kIndex: kIndex,
                    donSeat: donSeat,
                    blackTeam: blackTeam,
                    deadPlayers: deadPlayers,
                    checkedBlacks: checkedBlacks,
                    checkedReds: allCheckedReds,
                    sheriffCheckedReds: sheriffRedChecks,
                    donCheckedReds: donRedChecks,
                    donCheckedBlacks: [],  // Для калькулятора нет ввода черных проверок Дона
                    sheriffSeat: sheriffSeat,
                    nightNum: nightNum,
                    donAction: donAction,
                    donDigitVal: donDigitVal
                };
                
                // Если действие Дона - "hands", устанавливаем mirrorActive для Эхо-статики
                if (donAction === 'hands') {
                    state.mirrorActive = true;
                }
                
                var result = solveKosmatika(state);
                appGameMode = oldMode;
                
                var rBox = getEl('ac-result-box');
                if(rBox) {
                    showEl('ac-result-box', true);
                    rBox.className = 'result-box correct';
                    rBox.style.borderColor = "#d32f2f";
                    var logsHtml = result.logs.map(function(l) { return '<div class="expl-step">' + l + '</div>'; }).join('');
                    rBox.innerHTML = '<h3>🎯 Стреляем в: ' + result.target + '</h3><div>Метод: <strong>' + result.method + '</strong></div><hr style="border-color:#555">' + logsHtml;
                }
            } catch(e) {
                alert("Error: " + e.message);
            }
        });
    }
    
    // Общая функция обновления визуалов Автомата
    function updateAutomatchVisuals() {
        var bt = getEl('ac-black-team');
        if(!bt) return;
        var blackTeam = parseSmartInput(bt.value);
        var dS = getEl('ac-don-seat');
        var donSeat = parseSeatNumber(dS);
        var sS = getEl('ac-sheriff-seat');
        var sheriffSeat = parseSeatNumber(sS);
        
        var cB = getEl('ac-checked-blacks');
        var checkedBlacks = cB ? parseSmartInput(cB.value) : [];
        
        // Валидация: Дон не может быть Шерифом
        var donInputEl = getEl('ac-don-seat');
        var sheriffInputEl = getEl('ac-sheriff-seat');
        var hasConflict = (donSeat !== null && sheriffSeat !== null && donSeat === sheriffSeat);
        if(donInputEl) {
            if(hasConflict) donInputEl.classList.add('input-error');
            else donInputEl.classList.remove('input-error');
        }
        if(sheriffInputEl) {
            if(hasConflict) sheriffInputEl.classList.add('input-error');
            else sheriffInputEl.classList.remove('input-error');
        }
        
        for(var i=1; i<=10; i++) {
            var seat = getEl('ac-seat-' + i);
            if(!seat) continue;
            seat.classList.remove('mafia', 'don', 'sheriff', 'checked-black');
            if(blackTeam.includes(i)) {
                if (donSeat !== null && i === donSeat) seat.classList.add('don');
                else seat.classList.add('mafia');
            }
            if(sheriffSeat !== null && i === sheriffSeat && !hasConflict) seat.classList.add('sheriff');
            if(checkedBlacks.includes(i)) seat.classList.add('checked-black');
        }
    }
    
    // Подключаем слушатели на обновление визуалов
    ['ac-black-team', 'ac-don-seat', 'ac-sheriff-seat', 'ac-checked-blacks'].forEach(function(id) {
        var el = getEl(id);
        if(el) el.addEventListener('input', updateAutomatchVisuals);
    });
    // Валидация поля Шерифа для Автомата
    var acSheriffEl = getEl('ac-sheriff-seat');
    if(acSheriffEl) {
        acSheriffEl.addEventListener('input', function() {
            validateSheriffSeat(this, 'ac-black-team');
        });
    }
    updateAutomatchVisuals();
    
    // Слушатель для показа/скрытия поля ввода цифры
    var acDonActionEl = getEl('ac-don-action');
    if(acDonActionEl) {
        acDonActionEl.addEventListener('change', function() {
            var digitDiv = getEl('ac-digit-input-div');
            if(digitDiv) {
                digitDiv.style.display = (this.value === 'digit') ? 'block' : 'none';
            }
            // Автоматически заполняем поле ввода цифры значением "0" при выборе 'digit'
            if(this.value === 'digit') {
                document.getElementById('ac-don-digit').value = "1";
            }
        });
    }
    
    // Универсальная валидация для всех полей ввода цифры (Косматика, Автомат, Ахалай, Винчестер)
    // Функция для добавления валидации к полю ввода цифры
    function addDigitInputValidation(inputId) {
        var inputEl = getEl(inputId);
        if(!inputEl) return;
        
        inputEl.addEventListener('input', function() {
            // Удаляем все нечисловые символы
            this.value = this.value.replace(/[^0-9]/g, '');
            
            var value = parseInt(this.value);
            if(!isNaN(value)) {
                if(value === 0) {
                    this.value = "10"; // 0 превращается в 10
                } else if(value > 10) {
                    this.value = "10";
                }
            }
        });
        
        inputEl.addEventListener('blur', function() {
            // Если пусто, ставим 1 по умолчанию
            if (this.value === '' || isNaN(parseInt(this.value))) {
                this.value = "1";
            }
        });
    }
    
    // Применяем валидацию ко всем полям ввода цифры
    addDigitInputValidation('c-don-digit');
    addDigitInputValidation('ac-don-digit');
    addDigitInputValidation('ah-don-digit');
    addDigitInputValidation('win-don-digit');
    addDigitInputValidation('who-don-digit');
    addDigitInputValidation('mantis-don-digit');
    addDigitInputValidation('check-don-digit');

}); // ЗАКРЫТИЕ DOMContentLoaded

// ========================================
// MATH MODE (Счёт игры) - ЛОГИКА
// ========================================

function initMathMode() {
    console.log('🧮 Math Mode initialized');
    
    // Сброс статистики при входе в режим
    appMathStreak = 0;
    appMathCorrect = 0;
    appMathWrong = 0;
    appMathDualMode = false; // Сброс режима на Single
    appMathUserAnswers = { version1: null, version2: null };
    
    // Сброс переключателя
    var toggle = getEl('math-dual-toggle');
    if (toggle) toggle.checked = false;
    
    // Показываем Single элементы, скрываем Dual элементы
    var singleBoard = getEl('math-scoreboard-single');
    var scenarioContainer = getEl('math-scenario-container');
    var singleButtons = getEl('math-single-buttons');
    
    if (singleBoard) singleBoard.style.display = 'block';
    if (scenarioContainer) scenarioContainer.style.display = 'none';
    if (singleButtons) singleButtons.style.display = 'flex';
    
    // Скрываем кнопки "Следующая игра"
    var nextBtnSingle = getEl('math-next-single-btn');
    var nextBtnDual = getEl('math-next-btn');
    if (nextBtnSingle) nextBtnSingle.style.display = 'none';
    if (nextBtnDual) nextBtnDual.style.display = 'none';
    
    // Показываем кнопку проверки
    var checkDualBtn = getEl('math-check-dual-btn');
    if (checkDualBtn) checkDualBtn.style.display = 'block';
    
    updateMathStats();
    generateMathScenario();
}

function generateMathScenario() {
    if (!appMathDualMode) {
        // === SINGLE MODE (1 Версия) - Симуляция от стартового состава 7+3 ===
        
        var redCount, blackCount, correctAnswer;
        var validScenarioFound = false;
        var attempts = 0;
        var maxAttempts = 100;
        
        while (!validScenarioFound && attempts < maxAttempts) {
            attempts++;
            
            // СТАРТОВЫЙ СОСТАВ: 7 Красных + 3 Мафии (Всегда!)
            var r = 7;
            var b = 3;
            
            // Выбираем целевое количество живых игроков (от 3 до 10)
            // Используем веса: чаще будут 7-9 игроков (более интересные ситуации)
            var rand = Math.random();
            var targetTotal;
            
            if (rand < 0.15) {
                targetTotal = 10; // 15% шанс: никто не ушел (7 vs 3)
            } else if (rand < 0.35) {
                targetTotal = 9;  // 20% шанс: 1 игрок ушел
            } else if (rand < 0.55) {
                targetTotal = 8;  // 20% шанс: 2 игрока ушли
            } else if (rand < 0.75) {
                targetTotal = 7;  // 20% шанс: 3 игрока ушли
            } else if (rand < 0.90) {
                targetTotal = 6;  // 15% шанс: 4 игрока ушли
            } else {
                targetTotal = getRandomInt(3, 5); // 10% шанс: 5-7 ушли (жесткие сценарии)
            }
            
            // СИМУЛЯЦИЯ УХОДА ИГРОКОВ
            while ((r + b) > targetTotal) {
                // Решаем, кто уходит (Красный или Черный)
                // Используем вероятность 60% красный, 40% черный (реалистичнее)
                var removeRed = Math.random() < 0.6;
                
                if (removeRed) {
                    // Пытаемся убрать красного
                    if (r > b + 2) {
                        // Безопасно убирать красного (не приведет к критике или ГГ)
                        r--;
                    } else if (r > b) {
                        // Убираем красного, но осторожно
                        r--;
                    } else {
                        // Убирать красного нельзя (будет ГГ), убираем черного
                        if (b > 1) {
                            b--;
                        } else {
                            // Тупиковая ситуация, прерываем
                            break;
                        }
                    }
                } else {
                    // Пытаемся убрать черного
                    if (b > 1) {
                        b--;
                    } else {
                        // Черных должен остаться хотя бы 1, убираем красного
                        if (r > b) {
                            r--;
                        } else {
                            // Тупик
                            break;
                        }
                    }
                }
            }
            
            // ПРОВЕРКА ВАЛИДНОСТИ СЦЕНАРИЯ
            // 1. Мафия не выиграла (r > b)
            // 2. Мафия есть (b >= 1)
            // 3. Достигли целевого количества игроков
            if (r > b && b >= 1 && (r + b) === targetTotal) {
                redCount = r;
                blackCount = b;
                correctAnswer = calculateStatus(redCount, blackCount);
                
                // Дополнительная проверка: не ГГ
                if (correctAnswer !== 'gg') {
                    validScenarioFound = true;
                }
            }
        }
        
        // Если не смогли сгенерировать, ставим безопасный сценарий (7 vs 2 = Критика)
        if (!validScenarioFound) {
            console.warn('Could not generate valid scenario in ' + maxAttempts + ' attempts, using fallback');
            redCount = 7;
            blackCount = 2;
            correctAnswer = 'kritika';
        }
        
        var totalPlayers = redCount + blackCount;
        
        appMathCurrentScenario = {
            redCount: redCount,
            blackCount: blackCount,
            totalPlayers: totalPlayers,
            correctAnswer: correctAnswer
        };
    } else {
        // === DUAL MODE (2 Версии) - Симулятор игрового стола с Smart AI ===
        
        var allPlayers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var totalMafia = 3; // Всегда 3 мафии в игре
        
        var sheriffA, sheriffB, deadPlayers, totalAlive, scenarioType, scenarioData;
        var checksA, checksB, mafiaTeammate, resultA, resultB;
        var maxAttempts = 50; // Защита от бесконечного цикла
        var attempts = 0;
        
        // ЦИКЛ ГЕНЕРАЦИИ: Перегенерируем пока не получим сценарий без ГГ
        do {
            attempts++;
            
            // 1. Выбираем 2 шерифов (они будут спорить, кто настоящий)
            sheriffA = allPlayers[getRandomInt(0, 9)];
            do {
                sheriffB = allPlayers[getRandomInt(0, 9)];
            } while (sheriffB === sheriffA);
            
            // 2. Генерируем список мертвых с заданным распределением вероятностей
            // 25% - 9 живых (1 мертвый), 25% - 8 живых (2 мертвых), 
            // 25% - 7 живых (3 мертвых), 25% - 5 живых (5 мертвых)
            var rand = Math.random();
            var targetAlive;
            
            if (rand < 0.25) {
                targetAlive = 9; // 25% шанс: 1 мертвый
            } else if (rand < 0.50) {
                targetAlive = 8; // 25% шанс: 2 мертвых
            } else if (rand < 0.75) {
                targetAlive = 7; // 25% шанс: 3 мертвых
            } else {
                targetAlive = 5; // 25% шанс: 5 мертвых
            }
            
            var deadCount = 10 - targetAlive;
            deadPlayers = [];
            
            // Генерируем указанное количество мертвых игроков (шерифы МОГУТ умирать!)
            while (deadPlayers.length < deadCount) {
                var idx = getRandomInt(0, allPlayers.length - 1);
                var player = allPlayers[idx];
                // Проверяем, что еще не мертв
                if (deadPlayers.indexOf(player) === -1) {
                    deadPlayers.push(player);
                }
            }
            
            totalAlive = 10 - deadPlayers.length;
            
            // 3. ВЫБОР СЦЕНАРИЯ (Smart AI)
            var scenarioTypes = ['aggressive', 'bus', 'passive'];
            scenarioType = scenarioTypes[getRandomInt(0, scenarioTypes.length - 1)];
            
            // 4. Генерируем проверки по выбранному сценарию
            scenarioData = generateSmartScenario(scenarioType, sheriffA, sheriffB, allPlayers, deadPlayers);
            
            checksA = scenarioData.checksA;
            checksB = scenarioData.checksB;
            mafiaTeammate = scenarioData.mafiaTeammate;
            
            // 5. Рассчитываем статус для Версии A (верим Шерифу A)
            resultA = calculateDualStatusNew(sheriffA, sheriffB, checksA, deadPlayers, totalAlive, totalMafia);
            
            // 6. Рассчитываем статус для Версии B (верим Шерифу B)
            resultB = calculateDualStatusNew(sheriffB, sheriffA, checksB, deadPlayers, totalAlive, totalMafia);
            
            // Проверяем: если хотя бы одна версия ГГ - перегенерируем
        } while ((resultA.status === 'gg' || resultB.status === 'gg') && attempts < maxAttempts);
        
        // Если не смогли сгенерировать за 50 попыток, принудительно ставим критику (fallback)
        if (attempts >= maxAttempts) {
            console.warn('Could not generate non-GG scenario in 50 attempts, forcing kritika');
            resultA.status = 'kritika';
            resultB.status = 'kritika';
        }
        
        // Сбрасываем выборы пользователя
        appMathUserAnswers = { version1: null, version2: null };
        
        appMathCurrentScenario = {
            allPlayers: allPlayers,
            totalAlive: totalAlive,
            deadPlayers: deadPlayers,
            sheriffA: sheriffA,
            sheriffB: sheriffB,
            checksA: checksA,
            checksB: checksB,
            resultA: resultA,
            resultB: resultB,
            correctAnswerV1: resultA.status,
            correctAnswerV2: resultB.status,
            scenarioType: scenarioType,
            mafiaTeammate: mafiaTeammate
        };
        
        console.log('Generated valid scenario (no GG) in ' + attempts + ' attempts');
    }
    
    // Обновляем UI
    updateMathDisplay();
    
    // Скрываем feedback
    var feedback = getEl('math-feedback');
    if (feedback) feedback.style.display = 'none';
    
    // Очищаем подсветки с прошлой задачи
    clearHighlight();
    
    // Включаем кнопки
    enableMathButtons(true);
    
    console.log('Generated scenario:', appMathCurrentScenario);
}

// Вспомогательная функция для расчета статуса (Single Mode)
function calculateStatus(redCount, blackCount) {
    if (blackCount >= redCount) {
        return 'gg';
    } else if ((redCount - blackCount) <= 2) {
        return 'kritika';
    } else {
        return 'pno';
    }
}

// === SMART AI: Генерация сценариев ===
function generateSmartScenario(scenarioType, sheriffA, sheriffB, allPlayers, deadPlayers) {
    var checksA = { red: [], black: [] };
    var checksB = { red: [], black: [] };
    var mafiaTeammate = null;
    
    // Выбираем третью мафию (не шериф A и не шериф B)
    var availableForMafia = allPlayers.filter(function(p) {
        return p !== sheriffA && p !== sheriffB;
    });
    if (availableForMafia.length > 0) {
        mafiaTeammate = availableForMafia[getRandomInt(0, availableForMafia.length - 1)];
    }
    
    if (scenarioType === 'aggressive') {
        // АГРЕССИЯ: Взаимные черные проверки
        // Шериф A проверяет Шерифа B -> ЧЁРНЫЙ
        checksA.black.push(sheriffB);
        
        // Шериф B проверяет Шерифа A -> ЧЁРНЫЙ
        checksB.black.push(sheriffA);
        
        // Добавляем еще по 1 случайной проверке (если есть живые игроки)
        var othersA = allPlayers.filter(function(p) { 
            return p !== sheriffA && p !== sheriffB; 
        });
        if (othersA.length > 0) {
            var randomA = othersA[getRandomInt(0, othersA.length - 1)];
            if (Math.random() > 0.5) {
                checksA.black.push(randomA);
            } else {
                checksA.red.push(randomA);
            }
        }
        
        var othersB = allPlayers.filter(function(p) { 
            return p !== sheriffB && p !== sheriffA && checksB.black.indexOf(p) === -1;
        });
        if (othersB.length > 0) {
            var randomB = othersB[getRandomInt(0, othersB.length - 1)];
            if (Math.random() > 0.5) {
                checksB.black.push(randomB);
            } else {
                checksB.red.push(randomB);
            }
        }
        
    } else if (scenarioType === 'bus') {
        // АВТОБУС: Лже-шериф сдает своего напарника
        // Шериф A делает 1-2 случайные проверки (не в себя и не в Шерифа B)
        var availableA = allPlayers.filter(function(p) { 
            return p !== sheriffA && p !== sheriffB; 
        });
        var checksCountA = getRandomInt(1, 2);
        for (var i = 0; i < checksCountA && availableA.length > 0; i++) {
            var idx = getRandomInt(0, availableA.length - 1);
            var player = availableA[idx];
            availableA.splice(idx, 1);
            
            // Случайный цвет
            if (Math.random() > 0.5) {
                checksA.black.push(player);
            } else {
                checksA.red.push(player);
            }
        }
        
        // Шериф B (лже-шериф) сдает своего напарника (mafiaTeammate) ЧЁРНЫМ
        if (mafiaTeammate) {
            checksB.black.push(mafiaTeammate);
        }
        
        // Опционально: дает еще одну проверку
        var availableB = allPlayers.filter(function(p) { 
            return p !== sheriffB && p !== mafiaTeammate && p !== sheriffA;
        });
        if (availableB.length > 0 && Math.random() > 0.4) {
            var randomB = availableB[getRandomInt(0, availableB.length - 1)];
            if (Math.random() > 0.5) {
                checksB.black.push(randomB);
            } else {
                checksB.red.push(randomB);
            }
        }
        
    } else if (scenarioType === 'passive') {
        // ПАССИВНОСТЬ: Проверки в мертвых (Призрачные проверки)
        // Обе шерифы делают проверки, которые попадают в мертвых игроков
        
        if (deadPlayers.length > 0) {
            // Шериф A проверяет мертвого
            var deadForA = deadPlayers[getRandomInt(0, deadPlayers.length - 1)];
            if (Math.random() > 0.5) {
                checksA.black.push(deadForA);
            } else {
                checksA.red.push(deadForA);
            }
            
            // Шериф B проверяет мертвого (может быть того же или другого)
            var deadForB = deadPlayers[getRandomInt(0, deadPlayers.length - 1)];
            if (Math.random() > 0.5) {
                checksB.black.push(deadForB);
            } else {
                checksB.red.push(deadForB);
            }
        }
        
        // Добавляем еще по 1 случайной проверке в живых
        var aliveA = allPlayers.filter(function(p) { 
            return p !== sheriffA && deadPlayers.indexOf(p) === -1; 
        });
        if (aliveA.length > 0) {
            var randomA = aliveA[getRandomInt(0, aliveA.length - 1)];
            if (Math.random() > 0.5) {
                checksA.black.push(randomA);
            } else {
                checksA.red.push(randomA);
            }
        }
        
        var aliveB = allPlayers.filter(function(p) { 
            return p !== sheriffB && deadPlayers.indexOf(p) === -1; 
        });
        if (aliveB.length > 0) {
            var randomB = aliveB[getRandomInt(0, aliveB.length - 1)];
            if (Math.random() > 0.5) {
                checksB.black.push(randomB);
            } else {
                checksB.red.push(randomB);
            }
        }
    }
    
    return {
        checksA: checksA,
        checksB: checksB,
        mafiaTeammate: mafiaTeammate
    };
}

// Рассчитать статус для одной версии (NEW - по алгоритму пользователя)
function calculateDualStatusNew(trueSheriff, falseSheriff, checks, deadPlayers, totalAlive, totalMafia) {
    // В этой версии:
    // trueSheriff = Красный (мы ему верим)
    // falseSheriff = ЧЁРНЫЙ (автоматически, даже без проверки)
    // checks = проверки trueSheriff (им верим)
    
    var deadMafiaCount = 0;
    
    // 1. Если лже-шериф (falseSheriff) мертв -> это мертвая мафия
    var isFalseSheriffDead = deadPlayers.indexOf(falseSheriff) !== -1;
    if (isFalseSheriffDead) {
        deadMafiaCount++;
    }
    
    // 2. Мертвые игроки, которых trueSheriff проверил ЧЁРНЫМИ -> мертвые мафии
    for (var i = 0; i < checks.black.length; i++) {
        var checkedPlayer = checks.black[i];
        if (deadPlayers.indexOf(checkedPlayer) !== -1 && checkedPlayer !== falseSheriff) {
            deadMafiaCount++;
        }
    }
    
    // Ограничиваем
    if (deadMafiaCount > totalMafia) deadMafiaCount = totalMafia;
    
    // Живая мафия = 3 - мертвая мафия
    var aliveMafia = totalMafia - deadMafiaCount;
    
    // Живые красные = все живые - живая мафия
    var aliveRed = totalAlive - aliveMafia;
    if (aliveRed < 0) aliveRed = 0;
    if (aliveMafia < 0) aliveMafia = 0;
    
    // Определяем статус
    var status = calculateStatus(aliveRed, aliveMafia);
    
    return {
        status: status,
        aliveRed: aliveRed,
        aliveMafia: aliveMafia,
        deadMafia: deadMafiaCount,
        details: {
            trueSheriff: trueSheriff,
            falseSheriff: falseSheriff,
            isFalseSheriffDead: isFalseSheriffDead
        }
    };
}

function updateMathDisplay() {
    if (!appMathCurrentScenario) return;
    
    if (!appMathDualMode) {
        // Single Mode
        setText('math-red-count', appMathCurrentScenario.redCount);
        setText('math-black-count', appMathCurrentScenario.blackCount);
        setText('math-total-count', appMathCurrentScenario.totalPlayers);
    } else {
        // Dual Mode - Рисуем игровой стол
        var scenario = appMathCurrentScenario;
        
        // Отрисовка стола
        renderGameTable(scenario);
        
        // Обновляем ID шерифов в панели ответов
        setText('answer-sheriff1-id', scenario.sheriffA);
        setText('answer-sheriff2-id', scenario.sheriffB);
        
        // Сбрасываем выбранные кнопки
        resetMathAnswerButtons();
    }
}

// Отрисовка игрового стола с игроками
function renderGameTable(scenario) {
    var table = getEl('math-game-table');
    if (!table) return;
    
    table.innerHTML = ''; // Очищаем
    
    for (var i = 1; i <= 10; i++) {
        var slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.innerHTML = i;
        slot.setAttribute('data-player', i); // Для поиска позиции
        
        // Проверяем состояние игрока
        var isDead = scenario.deadPlayers.indexOf(i) !== -1;
        var isSheriff1 = i === scenario.sheriffA;
        var isSheriff2 = i === scenario.sheriffB;
        
        if (isDead) slot.classList.add('is-dead');
        if (isSheriff1) slot.classList.add('is-sheriff-1');
        if (isSheriff2) slot.classList.add('is-sheriff-2');
        
        // Добавляем бейджи проверок
        addCheckBadges(slot, i, scenario);
        
        table.appendChild(slot);
    }
}

// Добавление бейджей проверок к слоту
function addCheckBadges(slot, playerNum, scenario) {
    var badges = [];
    var isPlayerDead = scenario.deadPlayers.indexOf(playerNum) !== -1;
    
    // Проверки Шерифа 1
    if (scenario.checksA.red.indexOf(playerNum) !== -1) {
        badges.push({ text: '🔴 Ш1', type: 'red-check', isGhost: isPlayerDead });
    }
    if (scenario.checksA.black.indexOf(playerNum) !== -1) {
        badges.push({ text: '⚫ Ш1', type: 'black-check', isGhost: isPlayerDead });
    }
    
    // Проверки Шерифа 2
    if (scenario.checksB.red.indexOf(playerNum) !== -1) {
        badges.push({ text: '🔴 Ш2', type: 'red-check', isGhost: isPlayerDead });
    }
    if (scenario.checksB.black.indexOf(playerNum) !== -1) {
        badges.push({ text: '⚫ Ш2', type: 'black-check', isGhost: isPlayerDead });
    }
    
    // Позиции для бейджей
    var positions = ['pos-top', 'pos-bottom', 'pos-left', 'pos-right'];
    
    for (var i = 0; i < badges.length && i < 4; i++) {
        var badge = document.createElement('div');
        badge.className = 'check-badge ' + badges[i].type + ' ' + positions[i];
        
        // Добавляем класс is-ghost, если проверка на мертвом
        if (badges[i].isGhost) {
            badge.classList.add('is-ghost');
        }
        
        badge.textContent = badges[i].text;
        slot.appendChild(badge);
    }
}

// Форматирование проверок с цветами
function formatChecks(checks) {
    var parts = [];
    
    if (checks.red.length > 0) {
        var redTxt = checks.red.map(function(p) {
            return '<span class="red-txt">' + p + '</span>';
        }).join(', ');
        parts.push('Кр: ' + redTxt);
    }
    
    if (checks.black.length > 0) {
        var blackTxt = checks.black.map(function(p) {
            return '<span class="black-txt">' + p + '</span>';
        }).join(', ');
        parts.push('Чр: ' + blackTxt);
    }
    
    if (parts.length === 0) {
        return '<span style="color:#999;">Нет проверок</span>';
    }
    
    return parts.join('; ');
}

function getStatusLabel(status) {
    if (status === 'gg') return '💀 ГГ';
    if (status === 'kritika') return '⚠️ КРИТИКА';
    return '✅ НЕ КРИТИКА';
}

function getStatusColor(status) {
    if (status === 'gg') return '#d32f2f';
    if (status === 'kritika') return '#ff9800';
    return '#4caf50';
}

function updateMathStats() {
    setText('math-streak', appMathStreak);
    setText('math-correct', appMathCorrect);
    setText('math-wrong', appMathWrong);
}

function enableMathButtons(enabled) {
    var buttons = ['math-answer-pno', 'math-answer-kritika'];
    buttons.forEach(function(btnId) {
        var btn = getEl(btnId);
        if (btn) {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.5';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        }
    });
}

function checkMathAnswer(userAnswer) {
    if (!appMathCurrentScenario) return;
    
    var isCorrect = userAnswer === appMathCurrentScenario.correctAnswer;
    var feedback = getEl('math-feedback');
    
    // Отключаем кнопки
    enableMathButtons(false);
    
    if (isCorrect) {
        // Правильный ответ
        appMathStreak++;
        appMathCorrect++;
        
        // Подсветка правильной кнопки
        var btn = getEl('math-answer-' + userAnswer);
        if (btn) {
            btn.style.background = 'linear-gradient(135deg, rgba(76,175,80,0.8), rgba(76,175,80,1))';
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 0 20px rgba(76,175,80,0.6)';
        }
        
        // Показываем feedback
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.3))';
            feedback.style.border = '2px solid #4caf50';
            feedback.style.color = '#4caf50';
            feedback.innerHTML = '✅ Верно! Стрик: ' + appMathStreak;
        }
        
        updateMathStats();
        
        // Отключаем кнопки ответов
        enableMathButtons(false);
        
        // Показываем кнопку "Следующая игра"
        var nextBtn = getEl('math-next-single-btn');
        if (nextBtn) nextBtn.style.display = 'block';
        
    } else {
        // Неправильный ответ
        appMathStreak = 0;
        appMathWrong++;
        
        // Подсветка неправильной кнопки красным
        var btn = getEl('math-answer-' + userAnswer);
        if (btn) {
            btn.style.background = 'linear-gradient(135deg, rgba(211,47,47,0.8), rgba(211,47,47,1))';
            btn.style.transform = 'scale(0.95)';
            btn.style.boxShadow = '0 0 20px rgba(211,47,47,0.6)';
            
            // Вибрация (если поддерживается)
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
        }
        
        // Подсветка правильной кнопки зелёным
        var correctBtn = getEl('math-answer-' + appMathCurrentScenario.correctAnswer);
        if (correctBtn) {
            correctBtn.style.background = 'linear-gradient(135deg, rgba(76,175,80,0.6), rgba(76,175,80,0.8))';
            correctBtn.style.border = '2px solid #4caf50';
        }
        
        // Показываем feedback с объяснением
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = 'linear-gradient(135deg, rgba(211,47,47,0.2), rgba(211,47,47,0.3))';
            feedback.style.border = '2px solid #d32f2f';
            feedback.style.color = '#d32f2f';
            
            var explanation = getExplanation(appMathCurrentScenario);
            feedback.innerHTML = '❌ Ошибка! Правильный ответ: <strong>' + getAnswerLabel(appMathCurrentScenario.correctAnswer) + '</strong><br>' +
                '<span style="font-size:0.85em; color:#aaa; margin-top:5px; display:block;">' + explanation + '</span>';
        }
        
        updateMathStats();
        
        // Отключаем кнопки ответов
        enableMathButtons(false);
        
        // Показываем кнопку "Следующая игра"
        var nextBtn = getEl('math-next-single-btn');
        if (nextBtn) nextBtn.style.display = 'block';
    }
}

function resetMathButtons() {
    var buttons = [
        { id: 'math-answer-pno', bg: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.4))', border: '#4caf50', color: '#4caf50' },
        { id: 'math-answer-kritika', bg: 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,152,0,0.4))', border: '#ff9800', color: '#ff9800' }
    ];
    
    buttons.forEach(function(btnData) {
        var btn = getEl(btnData.id);
        if (btn) {
            btn.style.background = btnData.bg;
            btn.style.border = '2px solid ' + btnData.border;
            btn.style.color = btnData.color;
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        }
    });
}

// Выбор ответа для версии (Dual Mode)
function selectMathAnswer(version, answer) {
    if (version === 1) {
        appMathUserAnswers.version1 = answer;
    } else if (version === 2) {
        appMathUserAnswers.version2 = answer;
    }
    
    // Убираем класс selected у всех кнопок этой версии
    var allButtons = document.querySelectorAll('.math-answer-btn[data-version="' + version + '"]');
    allButtons.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    
    // Добавляем класс selected к нажатой кнопке
    var targetBtn = document.querySelector('.math-answer-btn[data-version="' + version + '"][data-answer="' + answer + '"]');
    if (targetBtn) {
        targetBtn.classList.add('selected');
    }
    
    console.log('Selected for V' + version + ':', answer);
}

// Проверка ответов в Dual Mode
function checkMathDualAnswer() {
    if (!appMathCurrentScenario) return;
    
    var scenario = appMathCurrentScenario;
    var feedback = getEl('math-feedback');
    
    // Проверяем, что оба ответа выбраны
    if (!appMathUserAnswers.version1 || !appMathUserAnswers.version2) {
        showToast('⚠️ Внимание', 'Выберите ответ для обеих версий!');
        return;
    }
    
    var isV1Correct = appMathUserAnswers.version1 === scenario.correctAnswerV1;
    var isV2Correct = appMathUserAnswers.version2 === scenario.correctAnswerV2;
    var isBothCorrect = isV1Correct && isV2Correct;
    
    // Отключаем кнопку проверки
    var checkBtn = getEl('math-check-dual-btn');
    if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.style.opacity = '0.5';
        checkBtn.style.cursor = 'not-allowed';
    }
    
    if (isBothCorrect) {
        // ОБА ПРАВИЛЬНО
        appMathStreak++;
        appMathCorrect++;
        
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.3))';
            feedback.style.border = '2px solid #4caf50';
            feedback.style.color = '#4caf50';
            
            // Генерируем полное объяснение (для раскрытия по кнопке)
            var fullExplanation = getDualExplanation(scenario, isV1Correct, isV2Correct);
            var visButtons = createVisualizationButtons();
            
            // Компактный блок с кнопкой раскрытия
            var successHTML = '<div style="text-align:center; margin-bottom:15px;">' +
                '<div style="font-size: 1.5em; color: #4caf50; margin-bottom: 10px;">🎉 Абсолютно верно!</div>' +
                '<div style="color: #aaa; font-size: 0.9em;">Ты правильно оценил обе версии. Стрик: <strong>' + appMathStreak + '</strong></div>' +
                '<button id="math-show-details-btn" onclick="toggleSuccessDetails()" ' +
                'style="background:transparent; border:1px solid #888; color:#fff; padding:8px 16px; border-radius:20px; cursor:pointer; margin-top:15px; font-size:0.9em; transition:all 0.3s;">' +
                '📖 Показать подробный разбор' +
                '</button>' +
                '</div>' +
                '<div id="math-success-details" style="display:none;">' +
                fullExplanation + visButtons +
                '</div>';
            
            feedback.innerHTML = successHTML;
        }
        
        updateMathStats();
        
        // Скрываем кнопку проверки
        if (checkBtn) checkBtn.style.display = 'none';
        
        // Показываем кнопку "Следующая игра"
        var nextBtn = getEl('math-next-btn');
        if (nextBtn) nextBtn.style.display = 'block';
        
    } else {
        // ОШИБКА (хотя бы в одной версии)
        appMathStreak = 0;
        appMathWrong++;
        
        // Вибрация
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
        
        // Показываем детальное объяснение
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = 'linear-gradient(135deg, rgba(211,47,47,0.2), rgba(211,47,47,0.3))';
            feedback.style.border = '2px solid #d32f2f';
            feedback.style.color = '#d32f2f';
            
            var explanation = getDualExplanation(appMathCurrentScenario, isV1Correct, isV2Correct);
            var visButtons = createVisualizationButtons();
            feedback.innerHTML = '❌ Ошибка!<br>' + explanation + visButtons;
        }
        
        updateMathStats();
        
        // Автоматически показываем визуализацию Версии 1 (где была ошибка)
        setTimeout(function() {
            if (!isV1Correct) {
                // Если ошибка в V1, показываем V1
                highlightVersion1(appMathCurrentScenario);
                var v1Btn = document.querySelector('.vis-btn.v1');
                if (v1Btn) v1Btn.classList.add('active');
            } else {
                // Если ошибка в V2, показываем V2
                highlightVersion2(appMathCurrentScenario);
                var v2Btn = document.querySelector('.vis-btn.v2');
                if (v2Btn) v2Btn.classList.add('active');
            }
        }, 100);
        
        // Скрываем кнопку проверки
        if (checkBtn) checkBtn.style.display = 'none';
        
        // Показываем кнопку "Следующая игра"
        var nextBtn = getEl('math-next-btn');
        if (nextBtn) nextBtn.style.display = 'block';
    }
}

// Переключение отображения подробного разбора при правильном ответе
function toggleSuccessDetails() {
    var details = document.getElementById('math-success-details');
    var btn = document.getElementById('math-show-details-btn');
    
    if (!details || !btn) return;
    
    if (details.style.display === 'none') {
        // Раскрываем детали
        details.style.display = 'block';
        btn.textContent = '🔼 Скрыть разбор';
        btn.style.borderColor = '#4caf50';
        btn.style.color = '#4caf50';
        
        // Запускаем визуализацию Версии 1
        setTimeout(function() {
            highlightVersion1(appMathCurrentScenario);
            // Активируем кнопку V1
            document.querySelectorAll('.vis-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            var v1Btn = document.querySelector('.vis-btn.v1');
            if (v1Btn) v1Btn.classList.add('active');
        }, 100);
    } else {
        // Скрываем детали
        details.style.display = 'none';
        btn.textContent = '📖 Показать подробный разбор';
        btn.style.borderColor = '#888';
        btn.style.color = '#fff';
        
        // Очищаем визуализацию
        clearHighlight();
    }
}

// Сброс выбранных кнопок ответов (Dual Mode)
function resetMathAnswerButtons() {
    var allButtons = document.querySelectorAll('.math-answer-btn');
    allButtons.forEach(function(btn) {
        btn.classList.remove('selected');
    });
    
    // Сбрасываем выборы пользователя
    appMathUserAnswers = { version1: null, version2: null };
    
    // Убираем подсветки
    clearHighlight();
}

// === ВИЗУАЛИЗАЦИЯ РЕЗУЛЬТАТА ===

// === ФОРМАТИРОВАНИЕ ТЕКСТА С ИНТЕРАКТИВНЫМИ БЕЙДЖАМИ ===

// Форматирование номера игрока в интерактивный бейдж
function formatPlayerBadge(number, type) {
    if (!number) return '';
    
    var typeClass = type ? 'type-' + type : 'type-neutral';
    var content = number;
    
    // Добавляем префикс-эмодзи для некоторых типов
    if (type === 'sheriff1') {
        content = '👮' + number;
    } else if (type === 'sheriff2') {
        content = '🕵️' + number;
    } else if (type === 'dead') {
        content = '💀' + number;
    }
    
    return '<span class="text-badge ' + typeClass + '" ' +
           'onmouseover="highlightSlot(' + number + ')" ' +
           'onmouseout="resetSlotHighlight(' + number + ')" ' +
           'ontouchstart="highlightSlot(' + number + ')" ' +
           'ontouchend="resetSlotHighlight(' + number + ')">' +
           content + '</span>';
}

// Подсветка слота на столе при наведении на бейдж в тексте
function highlightSlot(num) {
    var slot = document.querySelector('.player-slot[data-player="' + num + '"]');
    if (slot && !slot.classList.contains('highlight-mafia-v1') && !slot.classList.contains('highlight-mafia-v2')) {
        slot.classList.add('hover-highlight');
    }
}

// Снятие подсветки слота
function resetSlotHighlight(num) {
    var slot = document.querySelector('.player-slot[data-player="' + num + '"]');
    if (slot) {
        slot.classList.remove('hover-highlight');
    }
}

// Форматирование списка проверок с бейджами
function formatChecksWithBadges(checks, colorType) {
    var parts = [];
    
    if (checks.red && checks.red.length > 0) {
        var redBadges = checks.red.map(function(p) {
            return formatPlayerBadge(p, 'red');
        }).join(' ');
        parts.push('🔴 Кр: ' + redBadges);
    }
    
    if (checks.black && checks.black.length > 0) {
        var blackBadges = checks.black.map(function(p) {
            return formatPlayerBadge(p, 'black');
        }).join(' ');
        parts.push('⚫ Чр: ' + blackBadges);
    }
    
    return parts.length > 0 ? parts.join('; ') : '<span style="opacity:0.6;">нет проверок</span>';
}

// Обновление динамического табло счета
function updateResultScore(scenario, version) {
    var resultScoreDiv = getEl('math-result-score');
    var resultVersionDiv = getEl('math-result-version');
    var resultRedDiv = getEl('math-result-red');
    var resultBlackDiv = getEl('math-result-black');
    var resultStatusDiv = getEl('math-result-status');
    
    if (!resultScoreDiv) return;
    
    // Показываем табло с анимацией
    resultScoreDiv.style.display = 'block';
    setTimeout(function() {
        resultScoreDiv.style.opacity = '1';
    }, 10);
    
    var aliveRed, aliveMafia, status, sheriffNum;
    
    if (version === 1) {
        // Версия 1: Верим Шерифу A
        sheriffNum = scenario.sheriffA;
        aliveRed = scenario.resultA.aliveRed;
        aliveMafia = scenario.resultA.aliveMafia;
        status = scenario.resultA.status;
        
        resultVersionDiv.textContent = '📊 Счёт по версии Шерифа 1 (Игрок ' + sheriffNum + ')';
    } else {
        // Версия 2: Верим Шерифу B
        sheriffNum = scenario.sheriffB;
        aliveRed = scenario.resultB.aliveRed;
        aliveMafia = scenario.resultB.aliveMafia;
        status = scenario.resultB.status;
        
        resultVersionDiv.textContent = '📊 Счёт по версии Шерифа 2 (Игрок ' + sheriffNum + ')';
    }
    
    // Обновляем цифры
    resultRedDiv.textContent = '🔴 ' + aliveRed;
    resultBlackDiv.textContent = '⚫ ' + aliveMafia;
    
    // Обновляем статус
    if (status === 'kritika') {
        resultStatusDiv.textContent = '⚠️ КРИТИКА';
        resultStatusDiv.style.background = 'linear-gradient(135deg, rgba(255,152,0,0.3), rgba(255,152,0,0.4))';
        resultStatusDiv.style.border = '2px solid #ff9800';
        resultStatusDiv.style.color = '#ff9800';
    } else if (status === 'pno') {
        resultStatusDiv.textContent = '✅ НЕ КРИТИКА';
        resultStatusDiv.style.background = 'linear-gradient(135deg, rgba(76,175,80,0.3), rgba(76,175,80,0.4))';
        resultStatusDiv.style.border = '2px solid #4caf50';
        resultStatusDiv.style.color = '#4caf50';
    } else if (status === 'gg') {
        resultStatusDiv.textContent = '💀 ГГ';
        resultStatusDiv.style.background = 'linear-gradient(135deg, rgba(211,47,47,0.3), rgba(211,47,47,0.4))';
        resultStatusDiv.style.border = '2px solid #d32f2f';
        resultStatusDiv.style.color = '#d32f2f';
    }
    
    console.log('Updated result score for V' + version + ':', aliveRed, 'vs', aliveMafia, '(' + status + ')');
}

// Очистка всех подсветок
function clearHighlight() {
    var allSlots = document.querySelectorAll('.player-slot');
    allSlots.forEach(function(slot) {
        slot.classList.remove('highlight-mafia-v1', 'highlight-mafia-v2', 'dimmed');
    });
    
    // Убираем active с кнопок визуализации
    var visButtons = document.querySelectorAll('.vis-btn');
    visButtons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    // Скрываем динамическое табло счета
    var resultScoreDiv = getEl('math-result-score');
    if (resultScoreDiv) {
        resultScoreDiv.style.opacity = '0';
        setTimeout(function() {
            resultScoreDiv.style.display = 'none';
        }, 400); // Ждем окончания анимации
    }
}

// Подсветка мафий для версии 1 (Верим Шерифу A)
function highlightVersion1(scenario) {
    clearHighlight();
    
    var mafiaPlayers = [];
    
    // 1. Лже-шериф (Шериф B) - это ТОЧНО мафия
    mafiaPlayers.push(scenario.sheriffB);
    
    // 2. Игроки, проверенные Шерифом A как ЧЁРНЫЕ (живые)
    for (var i = 0; i < scenario.checksA.black.length; i++) {
        var player = scenario.checksA.black[i];
        // Только живые игроки
        if (scenario.deadPlayers.indexOf(player) === -1) {
            mafiaPlayers.push(player);
        }
    }
    
    // Подсвечиваем мафий
    for (var j = 0; j < mafiaPlayers.length; j++) {
        var slot = document.querySelector('.player-slot[data-player="' + mafiaPlayers[j] + '"]');
        if (slot) {
            slot.classList.add('highlight-mafia-v1');
        }
    }
    
    // Затемняем остальных (мирных)
    var allSlots = document.querySelectorAll('.player-slot');
    allSlots.forEach(function(slot) {
        var playerNum = parseInt(slot.getAttribute('data-player'));
        if (mafiaPlayers.indexOf(playerNum) === -1) {
            slot.classList.add('dimmed');
        }
    });
    
    // Обновляем динамическое табло счета
    updateResultScore(scenario, 1);
    
    console.log('Highlighted V1 mafias:', mafiaPlayers);
}

// Подсветка мафий для версии 2 (Верим Шерифу B)
function highlightVersion2(scenario) {
    clearHighlight();
    
    var mafiaPlayers = [];
    
    // 1. Лже-шериф (Шериф A) - это ТОЧНО мафия
    mafiaPlayers.push(scenario.sheriffA);
    
    // 2. Игроки, проверенные Шерифом B как ЧЁРНЫЕ (живые)
    for (var i = 0; i < scenario.checksB.black.length; i++) {
        var player = scenario.checksB.black[i];
        // Только живые игроки
        if (scenario.deadPlayers.indexOf(player) === -1) {
            mafiaPlayers.push(player);
        }
    }
    
    // Подсвечиваем мафий
    for (var j = 0; j < mafiaPlayers.length; j++) {
        var slot = document.querySelector('.player-slot[data-player="' + mafiaPlayers[j] + '"]');
        if (slot) {
            slot.classList.add('highlight-mafia-v2');
        }
    }
    
    // Затемняем остальных (мирных)
    var allSlots = document.querySelectorAll('.player-slot');
    allSlots.forEach(function(slot) {
        var playerNum = parseInt(slot.getAttribute('data-player'));
        if (mafiaPlayers.indexOf(playerNum) === -1) {
            slot.classList.add('dimmed');
        }
    });
    
    // Обновляем динамическое табло счета
    updateResultScore(scenario, 2);
    
    console.log('Highlighted V2 mafias:', mafiaPlayers);
}

// Создание кнопок визуализации
function createVisualizationButtons() {
    var buttonsHtml = '<div style="margin-top:15px; padding-top:15px; border-top:1px solid #444; text-align:center;">' +
        '<div style="color:#aaa; font-size:0.9em; margin-bottom:10px;">👁️ Визуализация математики:</div>' +
        '<button class="vis-btn v1" onclick="highlightVersion1(appMathCurrentScenario); document.querySelectorAll(\'.vis-btn\').forEach(function(b){b.classList.remove(\'active\');}); event.target.classList.add(\'active\');">Показать мафию по Ш1</button>' +
        '<button class="vis-btn v2" onclick="highlightVersion2(appMathCurrentScenario); document.querySelectorAll(\'.vis-btn\').forEach(function(b){b.classList.remove(\'active\');}); event.target.classList.add(\'active\');">Показать мафию по Ш2</button>' +
        '<button class="vis-btn clear" onclick="clearHighlight();">Очистить</button>' +
        '</div>';
    
    return buttonsHtml;
}

function getAnswerLabel(answer) {
    switch(answer) {
        case 'pno': return '✅ Есть право на ошибку';
        case 'kritika': return '⚠️ КРИТИКА (Нельзя ошибаться)';
        default: return answer;
    }
}

function getExplanation(scenario) {
    if (!appMathDualMode) {
        // Single Mode
        var diff = scenario.redCount - scenario.blackCount;
        
        if (scenario.correctAnswer === 'kritika') {
            var afterVote = scenario.redCount - 1;
            var afterNight = afterVote - 1;
            return '⚠️ КРИТИКА! ' + scenario.redCount + ' кр. vs ' + scenario.blackCount + ' ч. ' +
                   'Если уйдёт красный (' + afterVote + ' кр.), ночью отстрелят ещё одного (' + afterNight + ' кр. vs ' + scenario.blackCount + ' ч.) = Победа мафии!';
        } else {
            return '✅ Есть право на ошибку. ' + scenario.redCount + ' кр. vs ' + scenario.blackCount + ' ч. Разница ' + diff + ' - есть запас прочности.';
        }
    } else {
        // Dual Mode - подробное объяснение ситуации с указанием сценария
        var s = scenario;
        
        // Описание сценария
        var scenarioName = '';
        var scenarioDesc = '';
        
        if (s.scenarioType === 'aggressive') {
            scenarioName = '🔥 АГРЕССИЯ';
            scenarioDesc = 'Взаимные черные проверки между шерифами. Жесткий конфликт версий.';
        } else if (s.scenarioType === 'bus') {
            scenarioName = '🚌 АВТОБУС / РАЗБЕЖКА';
            scenarioDesc = 'Лже-шериф сдал своего напарника ' + formatPlayerBadge(s.mafiaTeammate, 'black') + ', чтобы купить доверие.';
        } else if (s.scenarioType === 'passive') {
            scenarioName = '👻 ПАССИВНОСТЬ';
            scenarioDesc = 'Призрачные проверки в мертвых игроках. Усложняет поиск живых мафий.';
        }
        
        var scenarioInfo = '<div style="background:rgba(255,193,7,0.1); border-left:3px solid #ffc107; padding:10px; margin-bottom:15px; border-radius:4px;">' +
            '<strong style="color:#ffc107;">Сценарий: ' + scenarioName + '</strong><br>' +
            '<span style="font-size:0.9em; color:#ccc;">' + scenarioDesc + '</span>' +
            '</div>';
        
        // Формируем список мертвых с бейджами
        var deadList = s.deadPlayers.length === 0 ? '<span style="opacity:0.6;">никто</span>' : 
            s.deadPlayers.map(function(p) { return formatPlayerBadge(p, 'dead'); }).join(' ');
        
        // Версия 1
        var exp1 = '<strong style="color:#1976d2;">👮 Версия 1 (Шериф ' + formatPlayerBadge(s.sheriffA, 'sheriff1') + '):</strong><br>';
        exp1 += '🎲 За столом: <strong>' + s.totalAlive + '</strong> игроков. ';
        exp1 += '💀 Ушли: ' + deadList + '<br>';
        exp1 += '🔍 Проверки: ' + formatChecksWithBadges(s.checksA) + '<br>';
        exp1 += '⚰️ Мертвых мафий: <strong>' + s.resultA.deadMafia + '</strong>. ';
        exp1 += '📊 За столом: <span style="color:#ff3333; font-weight:bold;">' + s.resultA.aliveRed + ' кр.</span> vs <span style="color:#00bcd4; font-weight:bold;">' + s.resultA.aliveMafia + ' ч.</span> → ';
        exp1 += '<strong style="color:' + getStatusColor(s.resultA.status) + ';">' + getStatusLabel(s.resultA.status) + '</strong>';
        
        // Версия 2
        var exp2 = '<strong style="color:#ff9800;">🕵️ Версия 2 (Шериф ' + formatPlayerBadge(s.sheriffB, 'sheriff2') + '):</strong><br>';
        exp2 += '🎲 За столом: <strong>' + s.totalAlive + '</strong> игроков. ';
        exp2 += '💀 Ушли: ' + deadList + '<br>';
        exp2 += '🔍 Проверки: ' + formatChecksWithBadges(s.checksB) + '<br>';
        exp2 += '⚰️ Мертвых мафий: <strong>' + s.resultB.deadMafia + '</strong>. ';
        exp2 += '📊 За столом: <span style="color:#ff3333; font-weight:bold;">' + s.resultB.aliveRed + ' кр.</span> vs <span style="color:#00bcd4; font-weight:bold;">' + s.resultB.aliveMafia + ' ч.</span> → ';
        exp2 += '<strong style="color:' + getStatusColor(s.resultB.status) + ';">' + getStatusLabel(s.resultB.status) + '</strong>';
        
        // Вывод
        var conclusion = '<br><strong>Итог:</strong> ';
        
        if (s.correctAnswerV1 === 'kritika' || s.correctAnswerV2 === 'kritika') {
            conclusion += 'Хотя бы в одной версии <strong style="color:#ff9800;">КРИТИКА</strong> → Играем от худшего';
        } else {
            conclusion += 'В обеих версиях <strong style="color:#4caf50;">НЕ КРИТИКА</strong> → Есть запас прочности';
        }
        
        return scenarioInfo + exp1 + '<br><br>' + exp2 + conclusion;
    }
}

// Форматирование проверок для текста (без HTML тегов)
function formatChecksPlain(checks) {
    var parts = [];
    if (checks.red.length > 0) parts.push('Кр: ' + checks.red.join(', '));
    if (checks.black.length > 0) parts.push('Чр: ' + checks.black.join(', '));
    return parts.length > 0 ? parts.join('; ') : 'нет проверок';
}

// Подробное объяснение для Dual Mode
function getDualExplanation(s, isV1Correct, isV2Correct) {
    var exp = '';
    
    // Описание сценария
    var scenarioName = '';
    var scenarioDesc = '';
    
    if (s.scenarioType === 'aggressive') {
        scenarioName = '🔥 АГРЕССИЯ';
        scenarioDesc = 'Взаимные черные проверки. Жесткий конфликт версий.';
    } else if (s.scenarioType === 'bus') {
        scenarioName = '🚌 АВТОБУС / РАЗБЕЖКА';
        scenarioDesc = 'Лже-шериф сдал напарника ' + formatPlayerBadge(s.mafiaTeammate, 'black') + '.';
    } else if (s.scenarioType === 'passive') {
        scenarioName = '👻 ПАССИВНОСТЬ';
        scenarioDesc = 'Призрачные проверки в мертвых игроках.';
    }
    
    exp += '<div style="background:rgba(255,193,7,0.1); border-left:3px solid #ffc107; padding:10px; margin-bottom:15px; border-radius:4px;">' +
        '<strong style="color:#ffc107;">Сценарий: ' + scenarioName + '</strong><br>' +
        '<span style="font-size:0.85em; color:#ccc;">' + scenarioDesc + '</span>' +
        '</div>';
    
    // Формируем список мертвых с бейджами
    var deadListDual = s.deadPlayers.length === 0 ? '<span style="opacity:0.6;">никто</span>' : 
        s.deadPlayers.map(function(p) { return formatPlayerBadge(p, 'dead'); }).join(' ');
    
    // Версия 1
    exp += '<div style="margin-bottom:15px; padding:12px; background:rgba(25,118,210,0.1); border-radius:8px; border-left:3px solid #1976d2;">';
    exp += '<strong style="color:#1976d2;">👮 Версия 1 (Шериф ' + formatPlayerBadge(s.sheriffA, 'sheriff1') + '):</strong><br>';
    exp += '<span style="font-size:0.9em;">💀 Ушли: ' + deadListDual + '. ';
    exp += '🔍 Проверки: ' + formatChecksWithBadges(s.checksA) + '.<br>';
    
    // Подробный расчет
    exp += '<strong>Расчет:</strong> ' + formatPlayerBadge(s.sheriffB, 'black') + ' = мафия (лже-шериф). ';
    if (s.resultA.details.isFalseSheriffDead) {
        exp += 'Он мертв (+1 мертвая мафия). ';
    } else {
        exp += 'Он жив (живая мафия). ';
    }
    
    var deadBlacksByChecks = 0;
    for (var i = 0; i < s.checksA.black.length; i++) {
        if (s.deadPlayers.indexOf(s.checksA.black[i]) !== -1 && s.checksA.black[i] !== s.sheriffB) {
            deadBlacksByChecks++;
        }
    }
    if (deadBlacksByChecks > 0) {
        exp += 'Мертвых черных по проверкам: ' + deadBlacksByChecks + '. ';
    }
    
    exp += '<br>Итого мертвых мафий: ' + s.resultA.deadMafia + '. ';
    exp += 'Живая мафия: ' + s.resultA.aliveMafia + '. ';
    exp += '<br>Счёт: <span style="color:#ff3333;">' + s.resultA.aliveRed + ' кр.</span> vs <span style="color:#00bcd4;">' + s.resultA.aliveMafia + ' ч.</span> → ';
    exp += '<strong style="color:' + getStatusColor(s.resultA.status) + ';">' + getStatusLabel(s.resultA.status) + '</strong>';
    
    if (!isV1Correct) {
        exp += ' <strong style="color:#d32f2f;">[Ваш ответ: ' + getStatusLabel(appMathUserAnswers.version1) + ' ❌]</strong>';
    } else {
        exp += ' <strong style="color:#4caf50;">[✓]</strong>';
    }
    exp += '</span></div>';
    
    // Версия 2
    exp += '<div style="margin-bottom:15px; padding:12px; background:rgba(255,152,0,0.1); border-radius:8px; border-left:3px solid #ff9800;">';
    exp += '<strong style="color:#ff9800;">🕵️ Версия 2 (Шериф ' + formatPlayerBadge(s.sheriffB, 'sheriff2') + '):</strong><br>';
    exp += '<span style="font-size:0.9em;">💀 Ушли: ' + deadListDual + '. ';
    exp += '🔍 Проверки: ' + formatChecksWithBadges(s.checksB) + '.<br>';
    
    // Подробный расчет
    exp += '<strong>Расчет:</strong> ' + formatPlayerBadge(s.sheriffA, 'black') + ' = мафия (лже-шериф). ';
    if (s.resultB.details.isFalseSheriffDead) {
        exp += 'Он мертв (+1 мертвая мафия). ';
    } else {
        exp += 'Он жив (живая мафия). ';
    }
    
    var deadBlacksByChecksB = 0;
    for (var j = 0; j < s.checksB.black.length; j++) {
        if (s.deadPlayers.indexOf(s.checksB.black[j]) !== -1 && s.checksB.black[j] !== s.sheriffA) {
            deadBlacksByChecksB++;
        }
    }
    if (deadBlacksByChecksB > 0) {
        exp += 'Мертвых черных по проверкам: ' + deadBlacksByChecksB + '. ';
    }
    
    exp += '<br>Итого мертвых мафий: ' + s.resultB.deadMafia + '. ';
    exp += 'Живая мафия: ' + s.resultB.aliveMafia + '. ';
    exp += '<br>Счёт: <span style="color:#ff3333;">' + s.resultB.aliveRed + ' кр.</span> vs <span style="color:#00bcd4;">' + s.resultB.aliveMafia + ' ч.</span> → ';
    exp += '<strong style="color:' + getStatusColor(s.resultB.status) + ';">' + getStatusLabel(s.resultB.status) + '</strong>';
    
    if (!isV2Correct) {
        exp += ' <strong style="color:#d32f2f;">[Ваш ответ: ' + getStatusLabel(appMathUserAnswers.version2) + ' ❌]</strong>';
    } else {
        exp += ' <strong style="color:#4caf50;">[✓]</strong>';
    }
    exp += '</span></div>';
    
    return exp;
}

// Переключение режима 1 Версия / 2 Версии
function toggleMathDualMode() {
    var checkbox = getEl('math-dual-toggle');
    if (!checkbox) return;
    
    appMathDualMode = checkbox.checked;
    
    // Показываем/скрываем нужное табло и кнопки
    var singleBoard = getEl('math-scoreboard-single');
    var scenarioContainer = getEl('math-scenario-container');
    var singleButtons = getEl('math-single-buttons');
    
    if (singleBoard) singleBoard.style.display = appMathDualMode ? 'none' : 'block';
    if (scenarioContainer) scenarioContainer.style.display = appMathDualMode ? 'block' : 'none';
    if (singleButtons) singleButtons.style.display = appMathDualMode ? 'none' : 'flex';
    
    // Скрываем/показываем feedback
    var feedback = getEl('math-feedback');
    if (feedback) feedback.style.display = 'none';
    
    // Скрываем кнопки "Следующая игра" при переключении режимов
    var nextBtnSingle = getEl('math-next-single-btn');
    var nextBtnDual = getEl('math-next-btn');
    if (nextBtnSingle) nextBtnSingle.style.display = 'none';
    if (nextBtnDual) nextBtnDual.style.display = 'none';
    
    // Показываем кнопку проверки
    var checkDualBtn = getEl('math-check-dual-btn');
    if (checkDualBtn) {
        checkDualBtn.style.display = 'block';
        checkDualBtn.disabled = false;
        checkDualBtn.style.opacity = '1';
        checkDualBtn.style.cursor = 'pointer';
    }
    
    // Генерируем новую задачу
    generateMathScenario();
    
    console.log('Math Mode switched to:', appMathDualMode ? 'DUAL (Game Table)' : 'SINGLE');
}

// Переход к следующему раунду (Math Mode)
function nextMathRound() {
    console.log('Next Math Round');
    
    // Скрываем кнопки "Следующая игра"
    var nextBtnSingle = getEl('math-next-single-btn');
    var nextBtnDual = getEl('math-next-btn');
    if (nextBtnSingle) nextBtnSingle.style.display = 'none';
    if (nextBtnDual) nextBtnDual.style.display = 'none';
    
    // Показываем кнопки проверки
    if (appMathDualMode) {
        // Dual Mode - показываем кнопку "Проверить"
        var checkBtn = getEl('math-check-dual-btn');
        if (checkBtn) {
            checkBtn.style.display = 'block';
            checkBtn.disabled = false;
            checkBtn.style.opacity = '1';
            checkBtn.style.cursor = 'pointer';
        }
    } else {
        // Single Mode - включаем кнопки ответов
        enableMathButtons(true);
    }
    
    // Скрываем и очищаем блок результата
    var feedback = getEl('math-feedback');
    if (feedback) {
        feedback.style.display = 'none';
        feedback.innerHTML = '';
    }
    
    // Очищаем подсветки на столе и кнопках
    clearHighlight();
    
    // Сбрасываем выбранные кнопки ответов (Dual Mode)
    if (appMathDualMode) {
        var allAnswerButtons = document.querySelectorAll('.math-answer-btn');
        allAnswerButtons.forEach(function(btn) {
            btn.classList.remove('selected');
        });
        
        // Сбрасываем выборы пользователя
        appMathUserAnswers = { version1: null, version2: null };
    } else {
        // Single Mode - сбрасываем стили кнопок
        resetMathButtons();
    }
    
    // Запускаем генерацию новой задачи
    generateMathScenario();
}
// ==========================================
// ФУНКЦИЯ: УМНОЕ КОПИРОВАНИЕ (БЕЗ СЛОЖНОСТИ)
// ==========================================
function shareLayout() {
    var data = window.appCurrentScenarioData || window.appMathCurrentScenario;
    if (!data) { alert("Сначала сгенерируйте расклад!"); return; }

    // --- 1. ОПРЕДЕЛЯЕМ ТОЛЬКО РЕЖИМ (ИГНОРИРУЕМ СЛОЖНОСТЬ) ---
    var detectedMode = "";
    
    // Список режимов, которые мы ищем (приоритетные)
    var priorityModes = ['Винчестер', 'Автомат', 'Росомаха', 'Ахалай', 'Дрель', 'Светлая', 'Красная', 'Кто', 'Богомол', 'Проверка', 'Матрица'];
    
    // Слова, которые мы ТОЧНО игнорируем (сложность)
    var ignoreWords = ['Easy', 'Hard', 'Nightmare', 'Impossible', 'Newbie', 'Кошмар', 'Сложно', 'Легко', 'Норма', 'Меню', 'Math', 'Menu', 'Спецрежимы', 'Special'];

    // 1. Ищем среди активных кнопок
    var activeBtns = document.querySelectorAll('.mode-btn.active, .nav-btn.active, button.active');
    
    for (var i = 0; i < activeBtns.length; i++) {
        var txt = activeBtns[i].innerText.trim().replace(/Режим\s+/i, '');
        
        // Если это слово из "черного списка" (сложность), пропускаем его
        var isIgnored = false;
        for (var w = 0; w < ignoreWords.length; w++) {
            if (txt.indexOf(ignoreWords[w]) !== -1) {
                isIgnored = true;
                break;
            }
        }
        if (isIgnored) continue;

        // Если это приоритетный режим (Винчестер и т.д.) - берем его сразу и выходим
        for (var m = 0; m < priorityModes.length; m++) {
            if (txt.indexOf(priorityModes[m]) !== -1) {
                detectedMode = priorityModes[m];
                if (detectedMode === 'Ахалай') detectedMode = 'Ахалай-махалай';
                break;
            }
        }
        if (detectedMode) break;

        // Если не приоритетный и не игнорируемый, запоминаем (на случай, если это просто "Косматика")
        if (txt.length > 2) detectedMode = txt;
    }

    // 2. Если ничего не нашли, берем из данных или ставим "Косматика"
    if (!detectedMode) {
        detectedMode = data.modeName || "Косматика";
        // Если в данных написано "Special", меняем на "Косматика" (так как спецрежим не выбран)
        if (detectedMode === "Special" || detectedMode === "Спецрежимы") detectedMode = "Косматика";
    }

    // --- 2. ФОРМИРУЕМ ЗАГОЛОВОК ---
    var icon = "🎯"; 
    if (detectedMode.indexOf("Винчестер") !== -1) icon = "👉✊"; // или 🔫
    else if (detectedMode.indexOf("Автомат") !== -1) icon = "🤖";
    else if (detectedMode.indexOf("Росомаха") !== -1) icon = "🐾";
    else if (detectedMode.indexOf("Ахалай") !== -1) icon = "✨";

    // Убираем возможные остатки сложности, если они попали из data.modeName
    detectedMode = detectedMode.replace(/\(.*\)/, '').trim();

    var text = icon + " " + detectedMode + ": РАСКЛАД\n";
    text += "══════════════════════════════\n";

    // --- 3. СТРОКА ЦИФР ---
    var kosmatika = data.kosmatika || data.kosmatikaList;
    if (kosmatika && kosmatika.length) {
        text += "🔢 " + detectedMode + ": " + kosmatika.join(' - ') + "\n";
    }

    // --- 4. РОЛИ ---
    var blacks = data.blacks || data.blackTeam || [];
    if (blacks.length > 0) text += "🖤 Мафия: " + blacks.join(', ') + "\n";

    var don = data.don || data.donSeat;
    if (don) text += "🎩 Дон: " + don + "\n";

    var sheriff = data.sheriff || data.sheriffSeat;
    if (sheriff) text += "⭐️ Шериф: " + sheriff + "\n"; // Можно вернуть ✡️ если нужно

    text += "\n"; 

    // --- 5. СИТУАЦИЯ (С фиксом слипания строк) ---
    var scenarioBlock = document.getElementById('scenario-desc');
    if (scenarioBlock) {
        text += "📋 СИТУАЦИЯ:\n";
        var rawHtml = scenarioBlock.innerHTML;
        
        // Меняем теги на переносы
        rawHtml = rawHtml.replace(/<br\s*\/?>/gi, '\n')
                         .replace(/<\/div>/gi, '\n')
                         .replace(/<\/p>/gi, '\n')
                         .replace(/<\/li>/gi, '\n');

        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = rawHtml;
        var cleanText = tempDiv.textContent || tempDiv.innerText;

        // Разлепляем эмодзи и текст (чтобы не было "показывал.❌")
        cleanText = cleanText.replace(/([^\n\s])(❌|⚠️|ℹ️|✅|📌|💀|🔍|📝|🔫|🖐|👌|👎)/g, '$1\n$2');
        cleanText = cleanText.replace(/\(\n/g, '('); 

        var lines = cleanText.split('\n');
        var formattedLines = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.length > 0) formattedLines.push(line);
        }
        text += formattedLines.join('\n') + "\n"; 
    }

    // --- 6. РЕШЕНИЕ (Если открыто) ---
    var feedbackBlock = document.getElementById('math-feedback');
    if (feedbackBlock && feedbackBlock.style.display !== 'none' && feedbackBlock.innerText.trim() !== "") {
        text += "\n──────────────────────────────\n";
        var isError = feedbackBlock.classList.contains('error') || feedbackBlock.innerText.includes('ОШИБКА');
        text += isError ? "❌ ИТОГ: ОШИБКА\n" : "✅ ИТОГ: ВЕРНО\n";
        
        var rawRes = feedbackBlock.innerHTML.replace(/<br>/g, '\n').replace(/<\/div>/g, '\n');
        var tempRes = document.createElement("div");
        tempRes.innerHTML = rawRes;
        var resText = tempRes.textContent || tempRes.innerText;
        resText = resText.replace(/([^\n\s])(❌|⚠️|ℹ️|✅|📌|💀)/g, '$1\n$2');
        
        text += "\n📝 ХОД РЕШЕНИЯ:\n";
        text += resText.split('\n').map(function(l){return l.trim()}).filter(function(l){return l.length>0}).join('\n') + "\n";
    }

    // --- 7. ПОДВАЛ ---
    text += "\n──────────────────────────────\n";
    text += "потренироваться по этой ссылке - sportmafia.app";

    // Копирование
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        if (successful) {
            var btn = document.getElementById('btn-share-layout');
            var originalText = btn.innerText;
            btn.innerText = "✅ Скопировано!";
            btn.style.background = "#388e3c";
            btn.style.borderColor = "#388e3c";
            setTimeout(function() {
                btn.innerText = originalText;
                btn.style.background = "";
                btn.style.borderColor = "";
            }, 2000);
            if (typeof showAchievementToast === 'function') showAchievementToast("📋 Текст скопирован!");
        }
    } catch (err) {}
    document.body.removeChild(textArea);
}

// Вспомогательная функция копирования (если её нет)
function copyToClipboard(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        if (typeof showAchievementToast === 'function') {
            showAchievementToast("📋 Подробный расклад скопирован!");
        } else {
            alert("Расклад скопирован!");
        }
    } catch (e) { console.error(e); }
    document.body.removeChild(ta);
}

// Слушатель нажатия
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('btn-share-layout');
    if (btn) btn.addEventListener('click', shareLayout);
});

