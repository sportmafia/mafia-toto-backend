require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const cors       = require('cors');
const { query, pool } = require('./db');

// ─────────────────────────────────────────────
// Firebase Admin SDK — верификация ID-токенов
// ─────────────────────────────────────────────
const admin = require('firebase-admin');
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  admin.initializeApp({
    credential: serviceAccountJson
      ? admin.credential.cert(JSON.parse(serviceAccountJson))
      : admin.credential.applicationDefault(),
    databaseURL: 'https://sportmafiaapp-default-rtdb.europe-west1.firebasedatabase.app',
  });
}

/**
 * Найти или создать пользователя в БД по Firebase UID.
 * Возвращает внутренний UUID из таблицы users.
 */
async function getOrCreateUser(firebaseUid) {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE firebase_uid = $1',
    [firebaseUid]
  );
  if (rows.length) return rows[0].id;

  const { rows: created } = await pool.query(
    `INSERT INTO users (firebase_uid, username, balance)
     VALUES ($1, $2, 1000)
     ON CONFLICT (firebase_uid) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid
     RETURNING id`,
    [firebaseUid, 'user_' + firebaseUid.slice(0, 8)]
  );
  return created[0].id;
}

// ─────────────────────────────────────────────
// MVP-заглушки: хардкод UUID до появления auth
// ─────────────────────────────────────────────
const MOCK_MATCH_ID = '00000000-0000-0000-0000-000000000002';
const MOCK_USER_ID  = '00000000-0000-0000-0000-000000000001';
// ─────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────
// CORS — Split Deployment (Netlify ↔ Render)
// ─────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://sportmafia.app',
  'https://www.sportmafia.app',
  /\.netlify\.app$/,
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://127.0.0.1:8080',
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.some(o =>
    o instanceof RegExp ? o.test(origin) : o === origin
  );
}

app.use(cors({
  origin(origin, cb) {
    if (isOriginAllowed(origin)) cb(null, true);
    else { console.warn('[CORS] Blocked:', origin); cb(new Error('CORS blocked: ' + origin)); }
  },
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin(origin, cb) { cb(null, isOriginAllowed(origin)); },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─────────────────────────────────────────────
// Хранилище комнат (Hostless Mode)
// ─────────────────────────────────────────────
const rooms = new Map();

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─────────────────────────────────────────────
// Таблица ролей по количеству игроков
// ─────────────────────────────────────────────
const ROLE_TABLE = {
    2:  { citizen: 2, mafia: 1, don: 0, sheriff: 0, npc: true },
    3:  { citizen: 2, mafia: 1, don: 0, sheriff: 0, npc: false },
    4:  { citizen: 3, mafia: 1, don: 0, sheriff: 0, npc: false },
    5:  { citizen: 4, mafia: 1, don: 0, sheriff: 0, npc: false },
    6:  { citizen: 4, mafia: 2, don: 0, sheriff: 0, npc: false },
    7:  { citizen: 5, mafia: 2, don: 0, sheriff: 0, npc: false },
    8:  { citizen: 5, mafia: 1, don: 1, sheriff: 1, npc: false },
    9:  { citizen: 5, mafia: 2, don: 1, sheriff: 1, npc: false },
    10: { citizen: 6, mafia: 2, don: 1, sheriff: 1, npc: false },
};

function assignRoles(room) {
    const count = room.players.size;
    const config = ROLE_TABLE[count];

    if (!config) {
        // Fallback для нестандартного числа
        const roles = ['mafia'];
        if (count >= 8) { roles.push('don'); roles.push('sheriff'); }
        if (count >= 6) roles.push('mafia');
        while (roles.length < count) roles.push('citizen');
        const shuffled = shuffleArray(roles);
        let idx = 0;
        room.players.forEach((p) => { p.role = shuffled[idx++]; p.roleUnderstood = false; });
        room.hasNpc = false;
        room.npcPlayer = null;
        room.gameRules = getGameRules(count, false);
        console.log(`[Room ${room.roomId}] Роли назначены (fallback): ${shuffled.join(', ')}`);
        return;
    }

    const roles = [];
    for (let i = 0; i < config.don; i++) roles.push('don');
    for (let i = 0; i < config.mafia; i++) roles.push('mafia');
    for (let i = 0; i < config.sheriff; i++) roles.push('sheriff');
    for (let i = 0; i < config.citizen; i++) roles.push('citizen');

    if (config.npc) {
        // 2 игрока: 3 роли, 2 реальных + 1 NPC-невидимка
        const shuffled = shuffleArray(roles);
        let idx = 0;
        room.players.forEach((p) => { p.role = shuffled[idx++]; p.roleUnderstood = false; });

        const npcRole = shuffled[idx];
        const takenSeats = new Set();
        room.players.forEach(p => { if (p.seat) takenSeats.add(p.seat); });
        let npcSeat = null;
        for (let s = 1; s <= (room.maxPlayers || 3) + 1; s++) {
            if (!takenSeats.has(s)) { npcSeat = s; break; }
        }
        if (!npcSeat) npcSeat = (room.maxPlayers || 3) + 1;

        room.hasNpc = true;
        room.npcPlayer = {
            id: '__npc__',
            nickname: '\uD83D\uDC7B Невидимка',
            role: npcRole,
            seat: npcSeat,
            status: 'alive',
            isNpc: true,
            roleUnderstood: true
        };
        console.log(`[Room ${room.roomId}] Роли назначены (2+NPC): ${shuffled.join(', ')} | NPC=${npcRole} seat=${npcSeat}`);
    } else {
        const shuffled = shuffleArray(roles);
        let idx = 0;
        room.players.forEach((p) => { p.role = shuffled[idx++]; p.roleUnderstood = false; });
        room.hasNpc = false;
        room.npcPlayer = null;
        console.log(`[Room ${room.roomId}] Роли назначены: ${shuffled.join(', ')}`);
    }

    room.gameRules = getGameRules(count, config.npc);
}

function getGameRules(playerCount, hasNpc) {
    const rules = {
        playerCount,
        hasNpc: !!hasNpc,
        hasVoting: true,
        hasShooting: true,
        hasSheriff: playerCount >= 8,
        hasDon: playerCount >= 8,
        phases: [],
        description: ''
    };

    switch (playerCount) {
        case 2:
            rules.hasVoting = true; rules.hasShooting = false;
            rules.phases = ['speeches', 'voting'];
            rules.description = '2 игрока + Невидимка. Голосование, стрельбы нет.';
            break;
        case 3:
            rules.hasVoting = true; rules.hasShooting = false;
            rules.phases = ['speeches', 'voting'];
            rules.description = '3 игрока. Голосование, стрельбы нет.';
            break;
        case 4:
            rules.hasVoting = false; rules.hasShooting = true;
            rules.phases = ['speeches', 'shooting'];
            rules.description = '4 игрока. После речей — стрельба.';
            break;
        case 5:
            rules.hasVoting = true; rules.hasShooting = true;
            rules.phases = ['speeches', 'voting', 'shooting'];
            rules.description = '5 игроков. Голосование, затем стрельба.';
            break;
        case 6:
            rules.hasVoting = false; rules.hasShooting = true;
            rules.phases = ['speeches', 'night'];
            rules.description = '6 игроков. Нет голосования, сразу ночь.';
            break;
        case 7: case 8: case 9: case 10:
            rules.hasVoting = true; rules.hasShooting = true;
            rules.phases = ['speeches', 'voting', 'night'];
            rules.description = `${playerCount} игроков. Полный цикл.`;
            break;
        default:
            rules.phases = ['speeches', 'voting', 'night'];
            rules.description = `${playerCount} игроков.`;
    }
    return rules;
}

// ─────────────────────────────────────────────
// Видимость мафии: отправка ролей с партнёрами
// ─────────────────────────────────────────────
function sendRoleToPlayer(room, playerId) {
    const player = room.players.get(playerId);
    if (!player || !player.socketId) return;

    const payload = { role: player.role };

    // Мафия и Дон видят своих партнёров
    if (player.role === 'mafia' || player.role === 'don') {
        const partners = [];
        room.players.forEach((p, id) => {
            if (id !== playerId && (p.role === 'mafia' || p.role === 'don')) {
                partners.push({ id, nickname: p.nickname, seat: p.seat, role: p.role });
            }
        });
        // NPC-мафия тоже партнёр
        if (room.hasNpc && room.npcPlayer &&
            (room.npcPlayer.role === 'mafia' || room.npcPlayer.role === 'don')) {
            partners.push({ id: '__npc__', nickname: room.npcPlayer.nickname, seat: room.npcPlayer.seat, role: room.npcPlayer.role });
        }
        payload.partners = partners;
    }

    io.to(player.socketId).emit('game:your_role', payload);
}

function broadcastRoles(room) {
    room.players.forEach((p, id) => {
        sendRoleToPlayer(room, id);
    });
}

// ─────────────────────────────────────────────
// Таймеры фаз (речи 60с, голосование 30с, ночь 40с)
// ─────────────────────────────────────────────
const roomTimers = new Map();
const SPEECH_DURATION = 60;
const VOTING_DURATION = 30;
const NIGHT_DURATION  = 40;

function startSpeechTimer(room) {
    clearPhaseTimer(room.roomId);

    let remaining = SPEECH_DURATION;
    io.to(room.roomId).emit('game:timer_tick', { remaining, total: SPEECH_DURATION, phase: 'speeches' });

    const interval = setInterval(() => {
        remaining--;
        io.to(room.roomId).emit('game:timer_tick', { remaining, total: SPEECH_DURATION, phase: 'speeches' });

        if (remaining <= 0) {
            clearPhaseTimer(room.roomId);
            // Авто-переход к следующей речи
            if (room.phase === 'active_game' && room.gamePhase === 'speeches') {
                room.speechIndex++;
                if (room.speechIndex >= room.speechOrder.length) {
                    advanceGamePhase(room);
                } else {
                    room.currentSpeaker = room.speechOrder[room.speechIndex];
                    io.to(room.roomId).emit('game:phase_changed', {
                        gamePhase: 'speeches',
                        speaker: room.currentSpeaker,
                        speechOrder: room.speechOrder,
                        speechIndex: room.speechIndex,
                        dayNumber: room.dayNumber
                    });
                    startSpeechTimer(room);
                }
                io.to(room.roomId).emit('room:updated', buildRoomSnapshot(room));
            }
        }
    }, 1000);

    roomTimers.set(room.roomId, interval);
}

function startVotingTimer(room) {
    clearPhaseTimer(room.roomId);

    let remaining = VOTING_DURATION;
    io.to(room.roomId).emit('game:timer_tick', { remaining, total: VOTING_DURATION, phase: 'voting' });

    const interval = setInterval(() => {
        remaining--;
        io.to(room.roomId).emit('game:timer_tick', { remaining, total: VOTING_DURATION, phase: 'voting' });

        if (remaining <= 0) {
            clearPhaseTimer(room.roomId);
            // Авто-резолв голосования по таймеру (с теми голосами, что есть)
            if (room.phase === 'active_game' && room.gamePhase === 'voting') {
                console.log(`[Room ${room.roomId}] Voting timer expired — resolving with ${room.votes ? room.votes.size : 0} votes`);
                resolveVoting(room);
            }
        }
    }, 1000);

    roomTimers.set(room.roomId, interval);
}

function startNightTimer(room) {
    clearPhaseTimer(room.roomId);

    let remaining = NIGHT_DURATION;
    const phaseLabel = room.gamePhase || 'night';
    io.to(room.roomId).emit('game:timer_tick', { remaining, total: NIGHT_DURATION, phase: phaseLabel });

    const interval = setInterval(() => {
        remaining--;
        io.to(room.roomId).emit('game:timer_tick', { remaining, total: NIGHT_DURATION, phase: phaseLabel });

        if (remaining <= 0) {
            clearPhaseTimer(room.roomId);
            // Авто-резолв ночи по таймеру (с теми действиями, что есть)
            if (room.phase === 'active_game' && (room.gamePhase === 'night' || room.gamePhase === 'shooting')) {
                console.log(`[Room ${room.roomId}] Night timer expired — resolving with ${room.nightActions ? room.nightActions.size : 0} actions`);
                resolveNight(room);
            }
        }
    }, 1000);

    roomTimers.set(room.roomId, interval);
}

function clearPhaseTimer(roomId) {
    const timerId = roomTimers.get(roomId);
    if (timerId) {
        clearInterval(timerId);
        roomTimers.delete(roomId);
    }
}

// ─────────────────────────────────────────────
// Тото: расчёт выплат
// ─────────────────────────────────────────────
function getPayoutMultiplier(betRole) {
    switch (betRole) {
        case 'don':    return 4.0;
        case 'sheriff': return 4.0;
        case 'mafia':  return 2.5;
        case 'citizen': return 1.5;
        default:       return 1.0;
    }
}

function getRoleDisplayName(role) {
    const map = { don: 'Дон', mafia: 'Мафия', sheriff: 'Шериф', citizen: 'Мирный' };
    return map[role] || role;
}

async function processPayouts(room, eliminatedPlayerId) {
    try {
        // Находим место устранённого игрока
        let actualRole = null;
        const eliminated = room.players.get(eliminatedPlayerId);
        if (eliminated) {
            actualRole = eliminated.role;
        } else if (eliminatedPlayerId === '__npc__' && room.npcPlayer) {
            actualRole = room.npcPlayer.role;
        }
        if (!actualRole) return;

        const seatNum = eliminated ? eliminated.seat : (room.npcPlayer ? room.npcPlayer.seat : null);
        if (!seatNum) return;

        // Ищем ставки на этого игрока по номеру стола/места
        const { rows: bets } = await pool.query(
            `SELECT b.id, b.user_id, b.bet_type, b.points_wagered, b.match_player_id
             FROM bets b
             JOIN match_players mp ON mp.id = b.match_player_id
             WHERE mp.seat_number = $1 AND b.bet_type = 'role_value'`,
            [seatNum]
        );

        for (const bet of bets) {
            // predicted_value содержит числовое значение ≤0 = mafia-side, >0 = citizen-side
            // Логика: value < 0 → ставка на мафию, value >= 5 → ставка на шерифа, иные → мирный
            let predictedRole;
            const val = bet.points_wagered;
            if (val <= -7) predictedRole = 'don';
            else if (val < 0) predictedRole = 'mafia';
            else if (val >= 7) predictedRole = 'sheriff';
            else predictedRole = 'citizen';

            const correct = (predictedRole === actualRole);
            if (!correct) continue;

            const multiplier = getPayoutMultiplier(actualRole);
            const payout = Math.round(Math.abs(val) * multiplier);

            // Начисляем баланс
            await pool.query(
                'UPDATE users SET balance = balance + $1 WHERE id = $2',
                [payout, bet.user_id]
            );

            console.log(`[Toto] User ${bet.user_id} won ${payout} coins (predicted: ${predictedRole}, actual: ${actualRole})`);

            // Уведомляем пользователя через socket
            notifyUserPayout(bet.user_id, {
                type: 'role_correct',
                seat: seatNum,
                predictedRole,
                actualRole,
                payout,
                multiplier
            });
        }
    } catch (err) {
        console.error('[Toto] processPayouts error:', err.message);
    }
}

function notifyUserPayout(userId, data) {
    // Поиск сокета пользователя по userId
    for (const [, s] of io.sockets.sockets) {
        if (s.data.userId === userId) {
            s.emit('toto:payout', data);
            break;
        }
    }
}

async function processGameEndPayouts(room) {
    try {
        const winner = room.winner; // 'city' or 'mafia'
        if (!winner) return;

        // Уведомляем всех в комнате о результате для тото
        io.to(room.roomId).emit('toto:game_result', {
            winner,
            reason: room.winReason
        });

        // Бонусные выплаты за угадывание общего исхода можно реализовать далее
        console.log(`[Toto] Game ended in room ${room.roomId}. Winner: ${winner}`);
    } catch (err) {
        console.error('[Toto] processGameEndPayouts error:', err.message);
    }
}

// ─────────────────────────────────────────────
// Перезапуск комнаты (те же игроки, новые роли)
// ─────────────────────────────────────────────
function restartRoom(room) {
    clearPhaseTimer(room.roomId);

    // Сброс состояния комнаты
    room.phase = 'roles';
    room.winner = null;
    room.winReason = null;
    room.gamePhase = null;
    room.dayNumber = 0;
    room.votes = new Map();
    room.nightActions = new Map();
    room.eliminatedLog = [];
    room.currentSpeaker = null;
    room.speechOrder = [];
    room.speechIndex = 0;

    // Сброс игроков: все живы, роли очищены, подтверждение сброшено
    room.players.forEach(p => {
        p.status = 'alive';
        p.role = null;
        p.roleConfirmed = false;
    });
    if (room.npcPlayer) {
        room.npcPlayer.status = 'alive';
        room.npcPlayer.role = null;
    }

    // Назначаем новые роли
    assignRoles(room);

    // Отправляем каждому его новую роль (с партнёрами)
    broadcastRoles(room);

    const snapshot = buildRoomSnapshot(room);
    io.to(room.roomId).emit('game:restarted', { snapshot });
    io.to(room.roomId).emit('room:updated', snapshot);
    console.log(`[Room ${room.roomId}] Перезапуск игры с теми же игроками`);
}

// ─────────────────────────────────────────────
// Игровые вспомогательные функции
// ─────────────────────────────────────────────
function initActiveGame(room) {
    room.gamePhase = 'speeches';
    room.dayNumber = 1;
    room.votes = new Map();
    room.nightActions = new Map();
    room.eliminatedLog = [];
    room.players.forEach(p => { p.status = 'alive'; });
    if (room.npcPlayer) room.npcPlayer.status = 'alive';
    buildSpeechOrder(room);
    room.currentSpeaker = room.speechOrder[0] || null;
}

function buildSpeechOrder(room) {
    const alive = [];
    room.players.forEach((p, id) => {
        if (p.status === 'alive') alive.push({ id, seat: p.seat || 999 });
    });
    alive.sort((a, b) => a.seat - b.seat);
    room.speechOrder = alive.map(a => a.id);
    room.speechIndex = 0;
}

function getAliveRealPlayers(room) {
    const result = [];
    room.players.forEach((p, id) => {
        if (p.status === 'alive') result.push({ id, ...p });
    });
    return result;
}

function npcAutoVote(room) {
    if (!room.hasNpc || !room.npcPlayer || room.npcPlayer.status !== 'alive') return;
    if (!room.votes) room.votes = new Map();
    if (room.votes.has('__npc__')) return;

    const npcRole = room.npcPlayer.role;
    const alivePlayers = [];
    room.players.forEach((p, id) => {
        if (p.status === 'alive') alivePlayers.push({ id, role: p.role });
    });

    let target = null;
    if (npcRole === 'mafia' || npcRole === 'don') {
        const citizens = alivePlayers.filter(p => p.role === 'citizen' || p.role === 'sheriff');
        if (citizens.length > 0) target = citizens[Math.floor(Math.random() * citizens.length)].id;
    } else {
        if (alivePlayers.length > 0) target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
    }
    if (target) room.votes.set('__npc__', target);
}

function npcAutoShoot(room) {
    if (!room.hasNpc || !room.npcPlayer || room.npcPlayer.status !== 'alive') return;
    if (!room.nightActions) room.nightActions = new Map();
    if (room.nightActions.has('__npc__')) return;

    const npcRole = room.npcPlayer.role;
    if (npcRole !== 'mafia' && npcRole !== 'don') return;

    const alivePlayers = [];
    room.players.forEach((p, id) => {
        if (p.status === 'alive') alivePlayers.push({ id, role: p.role });
    });

    // NPC-мафия стреляет в случайного мирного/шерифа
    const targets = alivePlayers.filter(p => p.role === 'citizen' || p.role === 'sheriff');
    if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        room.nightActions.set('__npc__', { action: 'shoot', targetId: target.id });
    }
}

function advanceGamePhase(room) {
    const rules = room.gameRules;
    if (!rules) return;
    const phases = rules.phases;
    const idx = phases.indexOf(room.gamePhase);

    if (idx >= 0 && idx + 1 < phases.length) {
        transitionToPhase(room, phases[idx + 1]);
    } else {
        // Цикл завершён — новый день
        room.dayNumber++;
        buildSpeechOrder(room);
        transitionToPhase(room, 'speeches');
    }
}

function transitionToPhase(room, phase) {
    room.gamePhase = phase;
    room.votes = new Map();
    room.nightActions = new Map();

    // Останавливаем любой предыдущий таймер
    clearPhaseTimer(room.roomId);

    if (phase === 'speeches') {
        buildSpeechOrder(room);
        room.currentSpeaker = room.speechOrder[0] || null;
        // Запускаем таймер для первого оратора
        startSpeechTimer(room);
    } else if (phase === 'voting') {
        // NPC голосует автоматически
        if (room.hasNpc && room.npcPlayer && room.npcPlayer.status === 'alive') {
            npcAutoVote(room);
        }
        // Запускаем таймер голосования
        startVotingTimer(room);
    } else if (phase === 'night' || phase === 'shooting') {
        // NPC стреляет автоматически
        if (room.hasNpc && room.npcPlayer && room.npcPlayer.status === 'alive') {
            npcAutoShoot(room);
        }
        // Запускаем таймер ночи
        startNightTimer(room);
    }

    const snapshot = buildRoomSnapshot(room);
    io.to(room.roomId).emit('game:phase_changed', {
        gamePhase: phase,
        dayNumber: room.dayNumber,
        speaker: room.currentSpeaker || null,
        speechOrder: room.speechOrder || [],
        speechIndex: room.speechIndex || 0,
        rules: room.gameRules
    });
    io.to(room.roomId).emit('room:updated', snapshot);
    checkWinCondition(room);
}

function resolveVoting(room) {
    const voteCounts = {};
    room.votes.forEach((targetId, voterId) => {
        if (targetId === 'skip') return;
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let candidates = [];
    for (const [tid, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) { maxVotes = count; candidates = [tid]; }
        else if (count === maxVotes) candidates.push(tid);
    }

    const totalAlive = getAliveRealPlayers(room).length
        + (room.hasNpc && room.npcPlayer && room.npcPlayer.status === 'alive' ? 1 : 0);
    const threshold = Math.floor(totalAlive / 2) + 1;

    let eliminatedId = null;
    if (candidates.length === 1 && maxVotes >= threshold) {
        eliminatedId = candidates[0];
    }

    if (eliminatedId) {
        if (eliminatedId === '__npc__') {
            room.npcPlayer.status = 'eliminated_vote';
        } else {
            const target = room.players.get(eliminatedId);
            if (target) target.status = 'eliminated_vote';
        }
        room.eliminatedLog.push({ id: eliminatedId, reason: 'vote', day: room.dayNumber });
        io.to(room.roomId).emit('game:player_eliminated', { playerId: eliminatedId, reason: 'vote', voteCounts });

        // Тото: расчёт выплат за угаданную роль
        processPayouts(room, eliminatedId);
    } else {
        io.to(room.roomId).emit('game:vote_result', { result: 'no_elimination', voteCounts });
    }

    if (!checkWinCondition(room)) advanceGamePhase(room);
}

function resolveNight(room) {
    const shotTargets = {};
    if (room.nightActions) {
        room.nightActions.forEach((action) => {
            if (action.action === 'shoot') {
                shotTargets[action.targetId] = (shotTargets[action.targetId] || 0) + 1;
            }
        });
    }

    let maxShots = 0, victim = null;
    for (const [tid, count] of Object.entries(shotTargets)) {
        if (count > maxShots) { maxShots = count; victim = tid; }
    }

    if (victim) {
        const target = room.players.get(victim);
        if (target && target.status === 'alive') {
            target.status = 'killed_night';
            room.eliminatedLog.push({ id: victim, reason: 'night', day: room.dayNumber });
            io.to(room.roomId).emit('game:player_eliminated', { playerId: victim, reason: 'night_kill', dayNumber: room.dayNumber });

            // Тото: расчёт выплат за угаданную роль
            processPayouts(room, victim);
        }
    } else {
        io.to(room.roomId).emit('game:night_result', { result: 'miss', dayNumber: room.dayNumber });
    }

    room.nightActions = new Map();
    if (!checkWinCondition(room)) {
        room.dayNumber++;
        buildSpeechOrder(room);
        transitionToPhase(room, 'speeches');
    }
}

function checkWinCondition(room) {
    let mafiaAlive = 0, cityAlive = 0;
    room.players.forEach(p => {
        if (p.status !== 'alive') return;
        if (p.role === 'mafia' || p.role === 'don') mafiaAlive++;
        else cityAlive++;
    });
    if (room.hasNpc && room.npcPlayer && room.npcPlayer.status === 'alive') {
        if (room.npcPlayer.role === 'mafia' || room.npcPlayer.role === 'don') mafiaAlive++;
        else cityAlive++;
    }

    let winner = null, reason = '';
    if (mafiaAlive === 0) { winner = 'city'; reason = 'Все мафии устранены'; }
    else if (mafiaAlive >= cityAlive) { winner = 'mafia'; reason = 'Мафия в большинстве'; }

    if (winner) {
        room.phase = 'game_over';
        room.winner = winner;
        room.winReason = reason;
        clearPhaseTimer(room.roomId);
        processGameEndPayouts(room);
        saveMatchHistory(room, winner);
        io.to(room.roomId).emit('game:over', { winner, reason, snapshot: buildRoomSnapshot(room) });
        return true;
    }
    return false;
}

// Сохранение матча в историю
async function saveMatchHistory(room, winner) {
    try {
        const pool = require('./db').pool;
        const rolesData = [];
        room.players.forEach((p, id) => {
            rolesData.push({ seat: p.seat, nickname: p.nickname, role: p.role, status: p.status });
        });
        if (room.hasNpc && room.npcPlayer) {
            rolesData.push({ seat: room.npcPlayer.seat, nickname: room.npcPlayer.nickname, role: room.npcPlayer.role, status: room.npcPlayer.status, isNpc: true });
        }
        await pool.query(
            `INSERT INTO match_history (match_id, winner, win_reason, total_players, roles_json, duration_days)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [room.roomId, winner, room.winReason || '', room.players.size + (room.hasNpc ? 1 : 0), JSON.stringify(rolesData), room.dayNumber || 0]
        );
        console.log(`[History] Match ${room.roomId} saved: winner=${winner}`);
    } catch (err) {
        console.error('[History] Failed to save:', err.message);
    }
}

// ─────────────────────────────────────────────
// Snapshot
// ─────────────────────────────────────────────
function buildRoomSnapshot(room) {
    const playersArr = Array.from(room.players.values()).map(p => ({
        id: p.id,
        seat: p.seat,
        nickname: p.nickname,
        isReady: p.isReady,
        isConnected: p.isConnected,
        roleUnderstood: p.roleUnderstood || false,
        status: p.status || 'alive'
    }));

    // Добавляем NPC
    if (room.hasNpc && room.npcPlayer) {
        playersArr.push({
            id: room.npcPlayer.id,
            nickname: room.npcPlayer.nickname,
            seat: room.npcPlayer.seat,
            status: room.npcPlayer.status || 'alive',
            roleUnderstood: true,
            isNpc: true
        });
    }

    const snapshot = {
        roomId: room.roomId,
        maxPlayers: room.hasNpc ? (room.players.size + 1) : room.maxPlayers,
        actualPlayers: room.players.size,
        phase: room.phase,
        players: playersArr,
        hasNpc: room.hasNpc || false,
        gameRules: room.gameRules || null
    };

    // Рассадка
    if (room.phase === 'seating' && room.turnQueue) {
        snapshot.turnQueue = room.turnQueue;
        snapshot.currentTurnIndex = room.currentTurnIndex || 0;
    }

    // Прогресс ролей
    if (room.phase === 'roles') {
        let understood = 0, total = 0;
        room.players.forEach((p) => { total++; if (p.roleUnderstood) understood++; });
        snapshot.rolesUnderstood = understood;
        snapshot.rolesTotal = total;
    }

    // Игровая фаза
    if (room.phase === 'active_game' || room.phase === 'game_over') {
        snapshot.gamePhase = room.gamePhase || 'speeches';
        snapshot.dayNumber = room.dayNumber || 1;
        snapshot.currentSpeaker = room.currentSpeaker || null;
        snapshot.speechOrder = room.speechOrder || [];
        snapshot.speechIndex = room.speechIndex || 0;
        snapshot.votes = {};
        if (room.votes) room.votes.forEach((targetId, voterId) => { snapshot.votes[voterId] = targetId; });
        if (room.winner) { snapshot.winner = room.winner; snapshot.winReason = room.winReason; }
    }

    return snapshot;
}

function checkAutoStart(room) {
    if (room.phase !== 'lobby') return false;
    const players = Array.from(room.players.values());
    const connectedPlayers = players.filter(p => p.isConnected);

    // Условие 1: количество подключённых игроков === maxPlayers
    if (connectedPlayers.length !== room.maxPlayers) return false;

    // Условие 2: все подключённые игроки готовы
    const allReady = connectedPlayers.every(p => p.isReady);
    if (!allReady) return false;

    return true;
}

function startGame(room) {
    // Переводим в фазу рассадки (игроки выбирают места сами)
    room.phase = 'seating';

    // Очередь ходов — по порядку присоединения
    room.turnQueue = Array.from(room.players.keys());
    room.currentTurnIndex = 0;

    // Сбрасываем seat у всех
    room.players.forEach((p) => { p.seat = null; });

    const snapshot = buildRoomSnapshot(room);

    io.to(room.roomId).emit('game:seating_start', snapshot);
    io.to(room.roomId).emit('room:updated', snapshot);
    console.log(`[Room ${room.roomId}] Фаза рассадки началась (${room.maxPlayers} игроков)`);
}

// ─────────────────────────────────────────────
// Socket.IO middleware: Firebase Auth
// ─────────────────────────────────────────────
io.use(async (socket, next) => {
  // Hostless mode: allow connections without Firebase Auth
  const isHostless = socket.handshake.auth?.hostless === true;
  const token = socket.handshake.auth?.token;

  if (isHostless) {
    // Hostless — reuse playerId from handshake if provided (lobby→game reconnect),
    // otherwise assign a new guest ID
    const reconnectId = socket.handshake.auth?.playerId;
    socket.data.userId = reconnectId || ('guest_' + socket.id);
    socket.data.firebaseUid = null;
    socket.data.isHostless = true;
    console.log('[auth] Hostless guest connected:', socket.data.userId,
                reconnectId ? '(reconnect)' : '(new)');
    return next();
  }

  if (!token) {
    return next(new Error('AUTH_REQUIRED: передай { auth: { token } } при подключении'));
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // Находим/создаём пользователя в БД и сохраняем внутренний UUID
    socket.data.userId    = await getOrCreateUser(decoded.uid);
    socket.data.firebaseUid = decoded.uid;
    socket.data.isHostless = false;
    next();
  } catch (err) {
    console.error('[auth] Невалидный Firebase токен:', err.message);
    next(new Error('AUTH_INVALID: токен недействителен или истёк'));
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// Маршруты страниц
// ─────────────────────────────────────────────
// / → лобби (index.html раздаётся автоматически через static)
// /game → реал-тайм слайдер
app.get('/game', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'game.html')));
// /observer → тотализатор на ролях
app.get('/observer', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'observer.html')));
// /lobby → hostless лобби
app.get('/lobby', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'lobby.html')));

// /admin → God Mode панель
app.get('/admin', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// /history → История матчей
app.get('/history', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'history.html')));

// REST: список активных комнат (для админки)
app.get('/api/admin/rooms', (_req, res) => {
    const list = [];
    rooms.forEach((room, roomId) => {
        const playersArr = [];
        room.players.forEach((p, id) => {
            playersArr.push({
                id, nickname: p.nickname, seat: p.seat,
                role: p.role, status: p.status || 'alive'
            });
        });
        list.push({
            roomId, phase: room.phase, gamePhase: room.gamePhase,
            dayNumber: room.dayNumber || 0,
            playerCount: room.players.size,
            players: playersArr,
            hasNpc: room.hasNpc || false
        });
    });
    res.json({ rooms: list });
});

// REST: история матчей
app.get('/api/match-history', async (_req, res) => {
    try {
        const pool = require('./db').pool;
        const result = await pool.query(
            `SELECT * FROM match_history ORDER BY created_at DESC LIMIT 20`
        );
        res.json({ matches: result.rows });
    } catch (err) {
        res.json({ matches: [], error: err.message });
    }
});

// ─────────────────────────────────────────────
// REST: инициализация схемы БД + seed данных
// ─────────────────────────────────────────────
app.get('/api/seed', async (req, res) => {
  const client = await require('./db').pool.connect();
  try {
    await client.query('BEGIN');

    // 👇 ВОТ ОНА! НАША СПАСИТЕЛЬНАЯ СТРОЧКА 👇
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    
    // ── 1. CREATE TABLE IF NOT EXISTS ──────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid VARCHAR(128) UNIQUE,
        username     VARCHAR(50) UNIQUE NOT NULL,
        balance      INT DEFAULT 1000
      )`);
    // Миграция: добавляем firebase_uid в уже существующую таблицу (если не было)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title  VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending'
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS match_players (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        match_id    UUID REFERENCES matches(id) ON DELETE CASCADE,
        seat_number INT,
        player_name VARCHAR(100) NOT NULL,
        UNIQUE(match_id, seat_number)
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID REFERENCES users(id)         ON DELETE SET NULL,
        match_id        UUID REFERENCES matches(id)        ON DELETE CASCADE,
        match_player_id UUID REFERENCES match_players(id)  ON DELETE CASCADE,
        bet_type        VARCHAR(20)    NOT NULL,
        points_wagered  INT            NOT NULL,
        bet_multiplier  DECIMAL(5,2)   DEFAULT 1.00,
        created_at      TIMESTAMPTZ    DEFAULT NOW()
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS match_history (
        id             SERIAL PRIMARY KEY,
        match_id       VARCHAR(64) NOT NULL,
        winner         VARCHAR(16),
        win_reason     TEXT,
        total_players  INT DEFAULT 0,
        total_payouts  NUMERIC(12,2) DEFAULT 0,
        roles_json     JSONB,
        duration_days  INT DEFAULT 0,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )`);

    // ── 2. Очистка старых данных (порядок важен из-за FK) ──────────
    await client.query(`DELETE FROM bets          WHERE match_id        = $1`, [MOCK_MATCH_ID]);
    await client.query(`DELETE FROM match_players WHERE match_id        = $1`, [MOCK_MATCH_ID]);
    await client.query(`DELETE FROM matches       WHERE id              = $1`, [MOCK_MATCH_ID]);
    await client.query(`DELETE FROM users         WHERE id              = $1`, [MOCK_USER_ID]);

    // ── 3. Тестовый пользователь ────────────────────────────────────
    await client.query(
      `INSERT INTO users (id, username, balance) VALUES ($1, 'mock_user', 1000)`,
      [MOCK_USER_ID]
    );

    // ── 4. Тестовый матч ────────────────────────────────────────────
    await client.query(
      `INSERT INTO matches (id, title, status) VALUES ($1, 'Тестовый матч #1', 'active')`,
      [MOCK_MATCH_ID]
    );

    // ── 5. 10 игроков (seat 1–10) ───────────────────────────────────
    const playerValues = Array.from({ length: 10 }, (_, i) =>
      `('${MOCK_MATCH_ID}', ${i + 1}, 'Игрок ${i + 1}')`
    ).join(', ');
    await client.query(
      `INSERT INTO match_players (match_id, seat_number, player_name) VALUES ${playerValues}`
    );

    await client.query('COMMIT');
    console.log('[seed] ✅ БД инициализирована и заполнена');
    res.json({ ok: true, message: 'БД успешно инициализирована и заполнена!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed] ❌ Ошибка:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// REST: текущее crowd_update для всех seat-ов
// ─────────────────────────────────────────────
app.get('/api/crowd/:matchId', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT mp.seat_number, mp.player_name,
              COALESCE(AVG(b.points_wagered), 0)::NUMERIC(6,2) AS avg_trust
       FROM   match_players mp
       LEFT JOIN bets b
              ON b.match_player_id = mp.id
             AND b.bet_type = 'trust_slider'
       WHERE  mp.match_id = $1
       GROUP BY mp.seat_number, mp.player_name
       ORDER BY mp.seat_number`,
      [req.params.matchId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Socket.IO
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  /**
   * Событие: slider_move
   * Payload: { seat_number: number, value: number (0–100) }
   *
   * Алгоритм:
   *   1. Mock-авторизация: SELECT id тестовых user, match, match_player
   *   2. DELETE старой ставки пользователя → INSERT новой
   *   3. AVG(points_wagered) + COUNT(*) по match_player_id
   *   4. Broadcast crowd_update всем клиентам
   */
  socket.on('slider_move', async (data) => {
    const { seat_number, value } = data;

    if (typeof seat_number !== 'number' || typeof value !== 'number') {
      socket.emit('error_msg', { message: 'Invalid payload' });
      return;
    }

    const clampedValue = Math.max(0, Math.min(100, Math.round(value)));

    try {
      // 1. Mock-авторизация: динамически получаем id тестовых записей
      const { rows: userRows }   = await pool.query('SELECT id FROM users LIMIT 1');
      const { rows: matchRows }  = await pool.query('SELECT id FROM matches LIMIT 1');
      const { rows: playerRows } = await pool.query(
        'SELECT id FROM match_players WHERE seat_number = $1 LIMIT 1',
        [seat_number]
      );

      if (!userRows.length || !matchRows.length || !playerRows.length) {
        socket.emit('error_msg', {
          message: `Не найдены тестовые данные или seat_number ${seat_number} отсутствует`,
        });
        return;
      }

      const userId        = userRows[0].id;
      const matchId       = matchRows[0].id;
      const matchPlayerId = playerRows[0].id;

      // 2. Сохранение: DELETE старой ставки → INSERT новой
      await pool.query(
        `DELETE FROM bets
         WHERE user_id = $1 AND match_player_id = $2 AND bet_type = 'trust'`,
        [userId, matchPlayerId]
      );

      await pool.query(
        `INSERT INTO bets (user_id, match_id, match_player_id, bet_type, points_wagered)
         VALUES ($1, $2, $3, 'trust', $4)`,
        [userId, matchId, matchPlayerId, clampedValue]
      );

      // 3. Математика: реальный AVG и количество голосов
      const { rows: avgRows } = await pool.query(
        `SELECT AVG(points_wagered) AS avg_trust,
                COUNT(*)            AS total_votes
         FROM   bets
         WHERE  match_player_id = $1
           AND  bet_type        = 'trust'`,
        [matchPlayerId]
      );

      const avg_trust   = avgRows[0].avg_trust ?? 0;
      const total_votes = parseInt(avgRows[0].total_votes, 10);

      // 4. Рассылка всем клиентам
      io.emit('crowd_update', {
        seat_number:  data.seat_number,
        avg_trust:    Math.round(avg_trust),
        total_votes,
      });

      console.log(
        `[crowd] seat=${seat_number} value=${clampedValue} → avg=${Math.round(avg_trust)} (${total_votes} votes)`
      );
    } catch (err) {
      console.error('[socket] slider_move error:', err.message);
      socket.emit('error_msg', { message: 'Server error: ' + err.message });
    }
  });

  // --- НОВЫЙ БЛОК: Обработка ставок из Тотализатора (Observer) ---
  socket.on('observer_move', async (data) => {
    const { seat_number, value, specialRole } = data;
    // socket.data.userId — UUID из таблицы users, установлен middleware Auth
    const userId = socket.data.userId;
    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // Начинаем транзакцию

      // 1. Находим ID игрока за этим столом для текущего матча
      const playerRes = await client.query(
        'SELECT id FROM match_players WHERE match_id = $1 AND seat_number = $2',
        [MOCK_MATCH_ID, seat_number]
      );
      const matchPlayerId = playerRes.rows[0]?.id;

      if (!matchPlayerId) throw new Error('Игрок не найден');

      // 2. Сохраняем основную ставку на роль (-10 ... +10)
      // Сначала удаляем старую ставку типа 'role_value'
      await client.query(
        'DELETE FROM bets WHERE user_id = $1 AND match_player_id = $2 AND bet_type = $3',
        [userId, matchPlayerId, 'role_value']
      );
      // Вставляем новую ставку
      await client.query(
        'INSERT INTO bets (user_id, match_id, match_player_id, bet_type, points_wagered) VALUES ($1, $2, $3, $4, $5)',
        [userId, MOCK_MATCH_ID, matchPlayerId, 'role_value', value]
      );

      // 3. Логика Спец-ролей (Шериф / Дон)
      if (specialRole) {
        // Чтобы Шериф или Дон был только один в матче:
        // Удаляем эту спец-роль у всех игроков этого матча для этого юзера
        await client.query(
          'DELETE FROM bets WHERE match_id = $1 AND user_id = $2 AND bet_type = $3',
          [MOCK_MATCH_ID, userId, specialRole]
        );
        // Назначаем роль текущему игроку
        await client.query(
          'INSERT INTO bets (user_id, match_id, match_player_id, bet_type, points_wagered) VALUES ($1, $2, $3, $4, $5)',
          [userId, MOCK_MATCH_ID, matchPlayerId, specialRole, 1]
        );
      }

      await client.query('COMMIT'); // Сохраняем всё в БД
      socket.emit('observer_saved', { ok: true, seat_number });
      console.log(`[db] Тотализатор: сохранена ставка на игрока ${seat_number}`);

    } catch (err) {
      await client.query('ROLLBACK'); // Откатываем, если ошибка
      console.error('[socket] Ошибка сохранения Observer:', err.message);
      socket.emit('error_msg', { message: 'Ошибка БД при сохранении ставки' });
    } finally {
      client.release(); // Возвращаем соединение в пул
    }
  });

  // ─────────────────────────────────────────────
  // ЛОББИ: Hostless Mode
  // ─────────────────────────────────────────────
  let currentRoomId = null;
  // Используем ID из вашей БД (установлен в middleware), а не просто socket.id
  let currentPlayerId = socket.data.userId;

  socket.on('room:create', (data, callback) => {
      const maxPlayers = Math.min(10, Math.max(2, parseInt(data?.maxPlayers) || 10));
      // Имя можно брать из БД или переданного data
      const nickname = (data?.nickname || '').trim() || `Игрок_${currentPlayerId.substring(0,4)}`;
      const roomId = generateRoomId();

      const room = {
          roomId,
          maxPlayers,
          phase: 'lobby',
          createdAt: Date.now(),
          hostless: socket.data.isHostless || false,
          players: new Map()
      };

      room.players.set(currentPlayerId, {
          id: currentPlayerId,
          seat: null,
          nickname,
          isReady: false,
          isConnected: true,
          socketId: socket.id
      });

      rooms.set(roomId, room);
      currentRoomId = roomId;
      socket.join(roomId);

      const snapshot = buildRoomSnapshot(room);
      console.log(`[Room ${roomId}] Создана (maxPlayers: ${maxPlayers}) игроком "${nickname}"`);

      if (typeof callback === 'function') callback({ success: true, room: snapshot, playerId: currentPlayerId });
      io.to(roomId).emit('room:updated', snapshot);
  });

  socket.on('room:join', (data, callback) => {
      const roomId = (data?.roomId || '').trim().toUpperCase();
      const nickname = (data?.nickname || '').trim() || `Игрок_${currentPlayerId.substring(0,4)}`;
      const room = rooms.get(roomId);

      if (!room) return callback && callback({ success: false, error: 'Комната не найдена' });
      if (room.phase !== 'lobby') return callback && callback({ success: false, error: 'Игра уже началась' });

      const connectedCount = Array.from(room.players.values()).filter(p => p.isConnected).length;
      if (connectedCount >= room.maxPlayers) {
          return callback && callback({ success: false, error: `Комната заполнена (${room.maxPlayers}/${room.maxPlayers})` });
      }

      room.players.set(currentPlayerId, {
          id: currentPlayerId,
          seat: null,
          nickname,
          isReady: false,
          isConnected: true,
          socketId: socket.id
      });

      currentRoomId = roomId;
      socket.join(roomId);

      const snapshot = buildRoomSnapshot(room);
      console.log(`[Room ${roomId}] "${nickname}" присоединился (${connectedCount + 1}/${room.maxPlayers})`);

      if (typeof callback === 'function') callback({ success: true, room: snapshot, playerId: currentPlayerId });
      io.to(roomId).emit('room:updated', snapshot);
  });

  socket.on('player:toggleReady', (data, callback) => {
      if (!currentRoomId) return callback && callback({ success: false, error: 'Вы не в комнате' });
      
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'lobby') return;

      const player = room.players.get(currentPlayerId);
      if (!player) return;

      player.isReady = !player.isReady;
      const snapshot = buildRoomSnapshot(room);
      
      console.log(`[Room ${currentRoomId}] "${player.nickname}" → ${player.isReady ? 'ГОТОВ' : 'НЕ ГОТОВ'}`);
      if (typeof callback === 'function') callback({ success: true, isReady: player.isReady });
      
      io.to(currentRoomId).emit('room:updated', snapshot);

      if (checkAutoStart(room)) {
          setTimeout(() => {
              if (checkAutoStart(room)) startGame(room);
          }, 1500);
      }
  });

  // ─────────────────────────────────────────────
  // РАССАДКА: Выбор места (фаза seating)
  // ─────────────────────────────────────────────
  socket.on('room:selectSeat', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};

      if (!currentRoomId) return callback({ success: false, error: 'Вы не в комнате' });

      const room = rooms.get(currentRoomId);
      if (!room) return callback({ success: false, error: 'Комната не найдена' });

      // 1) Проверяем фазу
      if (room.phase !== 'seating') {
          return callback({ success: false, error: 'Сейчас не фаза выбора мест' });
      }

      // 2) Проверяем, что сейчас ход именно этого игрока
      const expectedPlayerId = room.turnQueue[room.currentTurnIndex];
      if (expectedPlayerId !== currentPlayerId) {
          return callback({ success: false, error: 'Сейчас не ваш ход' });
      }

      // 3) Валидация номера места
      const seatNumber = parseInt(data?.seatNumber, 10);
      if (!seatNumber || seatNumber < 1 || seatNumber > room.maxPlayers) {
          return callback({ success: false, error: `Место должно быть от 1 до ${room.maxPlayers}` });
      }

      // 4) Проверяем, что место не занято
      let seatTaken = false;
      room.players.forEach((p) => {
          if (p.seat === seatNumber) seatTaken = true;
      });
      if (seatTaken) {
          return callback({ success: false, error: `Место ${seatNumber} уже занято` });
      }

      // 5) Назначаем место
      const player = room.players.get(currentPlayerId);
      player.seat = seatNumber;
      console.log(`[Room ${currentRoomId}] "${player.nickname}" выбрал место ${seatNumber}`);

      // 6) Двигаем очередь
      room.currentTurnIndex++;

      // 7) Проверяем, закончилась ли очередь
      if (room.currentTurnIndex >= room.turnQueue.length) {
          // Все выбрали места → назначаем роли и переходим в фазу ролей
          assignRoles(room);
          room.phase = 'roles';
          const snapshot = buildRoomSnapshot(room);

          io.to(room.roomId).emit('game:roles_start', snapshot);
          io.to(room.roomId).emit('room:updated', snapshot);

          // Отправляем каждому игроку его персональную роль (с партнёрами для мафии)
          broadcastRoles(room);
          console.log(`[Room ${currentRoomId}] Все расселись! Роли назначены, переход к фазе ролей.`);

          callback({ success: true, seatNumber, phase: 'roles' });
      } else {
          // Ещё есть игроки в очереди
          const snapshot = buildRoomSnapshot(room);
          io.to(room.roomId).emit('room:updated', snapshot);

          callback({ success: true, seatNumber });
      }
  });

  // ─────────────────────────────────────────────
  // РОЛИ: Игрок понял свою роль
  // ─────────────────────────────────────────────
  socket.on('player:roleUnderstood', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};

      if (!currentRoomId) return callback({ success: false, error: 'Вы не в комнате' });

      const room = rooms.get(currentRoomId);
      if (!room) return callback({ success: false, error: 'Комната не найдена' });

      if (room.phase !== 'roles') {
          return callback({ success: false, error: 'Сейчас не фаза ролей' });
      }

      const player = room.players.get(currentPlayerId);
      if (!player) return callback({ success: false, error: 'Игрок не найден' });

      player.roleUnderstood = true;
      console.log(`[Room ${currentRoomId}] "${player.nickname}" понял свою роль`);

      const snapshot = buildRoomSnapshot(room);
      io.to(room.roomId).emit('room:updated', snapshot);

      // Проверяем, все ли поняли роли
      let allUnderstood = true;
      room.players.forEach((p) => {
          if (!p.roleUnderstood) allUnderstood = false;
      });

      if (allUnderstood) {
          // Инициализируем игровое состояние
          initActiveGame(room);
          room.phase = 'active_game';
          console.log(`[Room ${currentRoomId}] Все поняли роли! Переход к активной игре.`);

          const gameSnapshot = buildRoomSnapshot(room);
          io.to(room.roomId).emit('game:ready_to_play', {
              message: 'Все игроки поняли роли! Игра начинается!',
              snapshot: gameSnapshot
          });

          // Отправляем каждому его роль повторно (с партнёрами)
          broadcastRoles(room);
      }

      callback({ success: true });
  });

  // ─── game:joinTable — reconnect player after lobby→game redirect ───
  socket.on('game:joinTable', ({ roomId }, callback) => {
      if (!roomId) return callback({ success: false, error: 'roomId is required' });

      const room = rooms.get(roomId);
      if (!room) return callback({ success: false, error: 'Room not found' });

      const userId = socket.data.userId;
      const player = room.players.get(userId);
      if (!player) return callback({ success: false, error: 'Player not in this room' });

      // Update socket mapping
      player.socketId    = socket.id;
      player.isConnected = true;

      // Set closure variables so disconnect handler works
      currentRoomId   = roomId;
      currentPlayerId = userId;

      // Cancel grace timer if reconnecting
      if (room.graceTimer) {
          clearTimeout(room.graceTimer);
          delete room.graceTimer;
          console.log(`[Room ${roomId}] Grace timer cancelled — player reconnected`);
      }

      socket.join(roomId);

      // Send personal role (с партнёрами для мафии)
      sendRoleToPlayer(room, userId);

      // Notify everyone about reconnection
      const snapshot = buildRoomSnapshot(room);
      io.to(roomId).emit('room:updated', snapshot);

      console.log(`[Room ${roomId}] "${player.nickname}" joined game table (seat ${player.seat})`);
      callback({ success: true, snapshot, playerId: userId });

      // Hostless: auto-start speeches when ALL players have reconnected
      if (room.hostless && room.phase === 'active_game' && !room.gameAutoStarted) {
          const allConnected = Array.from(room.players.values())
              .every(p => p.isConnected);
          if (allConnected) {
              room.gameAutoStarted = true;
              console.log(`[Room ${roomId}] All players reconnected — auto-starting speeches`);
              // Small delay so clients finish rendering
              setTimeout(() => {
                  const r = rooms.get(roomId);
                  if (!r || r.phase !== 'active_game') return;
                  r.gamePhase = 'speeches';
                  r.speechIndex = 0;
                  buildSpeechOrder(r);
                  r.currentSpeaker = r.speechOrder[0] || null;
                  startSpeechTimer(r);
                  const snap = buildRoomSnapshot(r);
                  io.to(roomId).emit('room:updated', snap);
                  io.to(roomId).emit('game:phase_changed', {
                      gamePhase: 'speeches',
                      speaker: r.currentSpeaker,
                      speechOrder: r.speechOrder,
                      speechIndex: 0,
                      dayNumber: r.dayNumber,
                      rules: r.gameRules
                  });
              }, 2000);
          }
      }
  });

  // ─────────────────────────────────────────────
  // ИГРОВЫЕ ФАЗЫ: Речи, Голосование, Стрельба, Ночь
  // ─────────────────────────────────────────────
  socket.on('game:startSpeeches', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'active_game') return callback({ error: 'Игра не активна' });

      room.gamePhase = 'speeches';
      room.speechIndex = 0;
      buildSpeechOrder(room);
      room.currentSpeaker = room.speechOrder[0] || null;

      // Запускаем таймер
      startSpeechTimer(room);

      io.to(room.roomId).emit('room:updated', buildRoomSnapshot(room));
      io.to(room.roomId).emit('game:phase_changed', {
          gamePhase: 'speeches',
          speaker: room.currentSpeaker,
          speechOrder: room.speechOrder,
          speechIndex: 0,
          dayNumber: room.dayNumber,
          rules: room.gameRules
      });
      callback({ success: true });
  });

  socket.on('game:nextSpeech', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'active_game' || room.gamePhase !== 'speeches') {
          return callback({ error: 'Не фаза речей' });
      }

      // Останавливаем текущий таймер
      clearPhaseTimer(room.roomId);

      room.speechIndex++;
      if (room.speechIndex >= room.speechOrder.length) {
          advanceGamePhase(room);
      } else {
          room.currentSpeaker = room.speechOrder[room.speechIndex];
          io.to(room.roomId).emit('game:phase_changed', {
              gamePhase: 'speeches',
              speaker: room.currentSpeaker,
              speechOrder: room.speechOrder,
              speechIndex: room.speechIndex,
              dayNumber: room.dayNumber
          });
          // Запускаем таймер для следующего оратора
          startSpeechTimer(room);
      }
      io.to(room.roomId).emit('room:updated', buildRoomSnapshot(room));
      callback({ success: true });
  });

  socket.on('game:vote', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'active_game' || room.gamePhase !== 'voting') {
          return callback({ error: 'Не фаза голосования' });
      }

      const player = room.players.get(currentPlayerId);
      if (!player || player.status !== 'alive') return callback({ error: 'Вы не можете голосовать' });

      const targetId = data.targetId;
      let validTarget = false;
      if (targetId === 'skip') validTarget = true;
      else if (targetId === '__npc__' && room.hasNpc && room.npcPlayer && room.npcPlayer.status === 'alive') validTarget = true;
      else {
          const target = room.players.get(targetId);
          if (target && target.status === 'alive' && targetId !== currentPlayerId) validTarget = true;
      }
      if (!validTarget) return callback({ error: 'Недопустимая цель' });

      if (!room.votes) room.votes = new Map();
      room.votes.set(currentPlayerId, targetId);

      // NPC-невидимка голосует автоматически
      if (room.hasNpc && room.npcPlayer && room.npcPlayer.status === 'alive') npcAutoVote(room);

      const aliveReal = getAliveRealPlayers(room);
      io.to(room.roomId).emit('game:vote_cast', {
          voterId: currentPlayerId,
          totalVotes: room.votes.size,
          requiredVotes: aliveReal.length
      });

      const allVoted = aliveReal.every(p => room.votes.has(p.id));
      if (allVoted) {
          clearPhaseTimer(room.roomId);
          resolveVoting(room);
      }

      io.to(room.roomId).emit('room:updated', buildRoomSnapshot(room));
      callback({ success: true });
  });

  socket.on('game:shoot', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'active_game') return callback({ error: 'Игра не активна' });
      if (room.gamePhase !== 'shooting' && room.gamePhase !== 'night') return callback({ error: 'Не фаза стрельбы' });

      const shooter = room.players.get(currentPlayerId);
      if (!shooter || (shooter.role !== 'mafia' && shooter.role !== 'don')) return callback({ error: 'Только мафия' });
      if (shooter.status !== 'alive') return callback({ error: 'Вы мертвы' });

      const target = room.players.get(data.targetId);
      if (!target || target.status !== 'alive') return callback({ error: 'Недопустимая цель' });

      if (!room.nightActions) room.nightActions = new Map();
      room.nightActions.set(currentPlayerId, { action: 'shoot', targetId: data.targetId });

      const aliveMafia = [];
      room.players.forEach((p, id) => {
          if ((p.role === 'mafia' || p.role === 'don') && p.status === 'alive') aliveMafia.push(id);
      });

      io.to(room.roomId).emit('game:night_action', {
          actionsCount: room.nightActions.size,
          requiredActions: aliveMafia.length
      });

      const allMafiaActed = aliveMafia.every(id => room.nightActions.has(id));
      if (allMafiaActed) {
          clearPhaseTimer(room.roomId);
          resolveNight(room);
      }

      callback({ success: true });
  });

  socket.on('game:sheriffCheck', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'active_game' || room.gamePhase !== 'night') {
          return callback({ error: 'Не ночная фаза' });
      }

      const checker = room.players.get(currentPlayerId);
      if (!checker || checker.role !== 'sheriff' || checker.status !== 'alive') {
          return callback({ error: 'Только живой шериф' });
      }

      const target = room.players.get(data.targetId);
      if (!target || target.status !== 'alive' || data.targetId === currentPlayerId) {
          return callback({ error: 'Недопустимая цель' });
      }

      const isBlack = target.role === 'mafia' || target.role === 'don';

      if (!room.nightActions) room.nightActions = new Map();
      room.nightActions.set(currentPlayerId, { action: 'sheriffCheck', targetId: data.targetId, result: isBlack });

      socket.emit('game:check_result', {
          targetId: data.targetId,
          targetNickname: target.nickname,
          result: isBlack ? 'black' : 'red'
      });

      callback({ success: true });
  });

  // ─── Don's Check (Дон ищет Шерифа) ───
  socket.on('game:donCheck', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'active_game' || room.gamePhase !== 'night') {
          return callback({ error: 'Не ночная фаза' });
      }

      const checker = room.players.get(currentPlayerId);
      if (!checker || checker.role !== 'don' || checker.status !== 'alive') {
          return callback({ error: 'Только живой Дон может проверять' });
      }

      const target = room.players.get(data.targetId);
      if (!target || target.status !== 'alive' || data.targetId === currentPlayerId) {
          return callback({ error: 'Недопустимая цель' });
      }

      const isSheriff = target.role === 'sheriff';

      if (!room.nightActions) room.nightActions = new Map();
      const existing = room.nightActions.get(currentPlayerId) || {};
      room.nightActions.set(currentPlayerId, { ...existing, donCheck: { targetId: data.targetId, result: isSheriff } });

      // Результат ТОЛЬКО Дону
      socket.emit('game:don_check_result', {
          targetId: data.targetId,
          targetNickname: target.nickname,
          result: isSheriff ? 'sheriff' : 'not_sheriff'
      });

      callback({ success: true });
  });

  // ─── Mafia Night Chat ───
  socket.on('game:mafia_msg', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room || room.phase !== 'active_game') return callback({ error: 'Игра не активна' });

      const gp = room.gamePhase;
      if (gp !== 'night' && gp !== 'shooting') {
          return callback({ error: 'Чат доступен только ночью' });
      }

      const sender = room.players.get(currentPlayerId);
      if (!sender || (sender.role !== 'mafia' && sender.role !== 'don')) {
          return callback({ error: 'Чат только для мафии' });
      }
      if (sender.status !== 'alive') {
          return callback({ error: 'Мёртвые не чатятся' });
      }

      const text = (data.text || '').trim().substring(0, 200);
      if (!text) return callback({ error: 'Пустое сообщение' });

      const msgPayload = {
          senderId: currentPlayerId,
          nickname: sender.nickname,
          seat: sender.seat,
          text,
          timestamp: Date.now()
      };

      // Рассылаем всем живым мафиози в комнате
      room.players.forEach((p, pid) => {
          if ((p.role === 'mafia' || p.role === 'don') && p.status === 'alive' && p.socketId) {
              io.to(p.socketId).emit('game:mafia_msg', msgPayload);
          }
      });

      callback({ success: true });
  });

  // ─── Admin Actions ───
  socket.on('admin:action', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};

      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mafia_god_mode';
      if (data.password !== ADMIN_PASSWORD) {
          return callback({ error: 'Неверный пароль' });
      }

      const room = rooms.get(data.roomId);
      if (!room) return callback({ error: 'Комната не найдена' });

      switch (data.action) {
          case 'kill_player': {
              const target = room.players.get(data.playerId);
              if (target && target.status === 'alive') {
                  target.status = 'admin_killed';
                  room.eliminatedLog = room.eliminatedLog || [];
                  room.eliminatedLog.push({ id: data.playerId, reason: 'admin', day: room.dayNumber || 0 });
                  io.to(room.roomId).emit('admin:player_killed', { playerId: data.playerId, nickname: target.nickname });
                  io.to(room.roomId).emit('room:updated', buildRoomSnapshot(room));
                  checkWinCondition(room);
              }
              break;
          }
          case 'skip_phase': {
              if (room.phase === 'active_game') {
                  advanceGamePhase(room);
              }
              break;
          }
          case 'stop_timer': {
              clearPhaseTimer(room.roomId);
              io.to(room.roomId).emit('game:timer_tick', { remaining: 0, total: 0 });
              break;
          }
          case 'start_timer': {
              if (room.phase === 'active_game' && room.gamePhase === 'speeches') {
                  startSpeechTimer(room);
              }
              break;
          }
          case 'announcement': {
              const message = (data.message || '').trim().substring(0, 500);
              if (message) {
                  io.to(room.roomId).emit('admin:announcement', { message });
              }
              break;
          }
          case 'restart_room': {
              restartRoom(room);
              break;
          }
          default:
              return callback({ error: 'Неизвестное действие' });
      }

      callback({ success: true });
  });

  // ─── Restart Room (перезапуск с теми же игроками) ───
  socket.on('game:restartRoom', (data, callback) => {
      if (typeof callback !== 'function') callback = () => {};
      const room = rooms.get(currentRoomId);
      if (!room) return callback({ error: 'Комната не найдена' });
      if (room.phase !== 'game_over') return callback({ error: 'Игра ещё не завершена' });

      restartRoom(room);
      callback({ success: true });
  });

  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.id}`);
    
    // --- Логика выхода из лобби ---
    if (currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
            const player = room.players.get(currentPlayerId);
            if (player) {
                player.isConnected = false;
                player.isReady = false;
                console.log(`[Room ${currentRoomId}] "${player.nickname}" отключился`);
            }
            const snapshot = buildRoomSnapshot(room);
            io.to(currentRoomId).emit('room:updated', snapshot);

            // Удаляем пустые комнаты (с grace period для активных игр)
            const anyConnected = Array.from(room.players.values()).some(p => p.isConnected);
            if (!anyConnected) {
                const isGamePhase = room.phase === 'active_game' || room.phase === 'roles';
                if (isGamePhase) {
                    // Grace period 60s — дать время на редирект lobby→game
                    if (!room.graceTimer) {
                        console.log(`[Room ${currentRoomId}] All disconnected but game active. Grace 60s...`);
                        const capturedRoomId = currentRoomId;
                        room.graceTimer = setTimeout(() => {
                            const r = rooms.get(capturedRoomId);
                            if (!r) return;
                            delete r.graceTimer;
                            const still = Array.from(r.players.values()).some(p => p.isConnected);
                            if (!still) {
                                clearPhaseTimer(capturedRoomId);
                                rooms.delete(capturedRoomId);
                                console.log(`[Room ${capturedRoomId}] Удалена после grace period`);
                            }
                        }, 60000);
                    }
                } else {
                    clearPhaseTimer(currentRoomId);
                    rooms.delete(currentRoomId);
                    console.log(`[Room ${currentRoomId}] Удалена (все отключились)`);
                }
            }
        }
    }
  });
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Mafia Toto server running on http://localhost:${PORT}`);
  console.log(`   POST /api/seed        → seed mock data`);
  console.log(`   GET  /api/crowd/:id   → current trust averages`);
});
