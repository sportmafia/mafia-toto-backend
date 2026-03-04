// =============================================================
//  lobby.js — Hostless Lobby Frontend (Socket.io only, no Firebase)
// =============================================================

(function () {
  'use strict';

  // ─── State ────────────────────────────────────────────────
  let socket        = null;
  let myPlayerId    = null;
  let myReady       = false;
  let currentRoomId = null;
  let myRole        = null;
  let isRoleShown   = false;
  let isRoleAccepted = false;
  let isCreator     = false;

  // ─── DOM helpers ──────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  const screenEntry   = $('screen-entry');
  const screenLobby   = $('screen-lobby');
  const screenSeating = $('screen-seating');
  const screenRoles   = $('screen-roles');

  function showScreen(name) {
    screenEntry.classList.toggle('active',   name === 'entry');
    screenLobby.classList.toggle('active',   name === 'lobby');
    screenSeating.classList.toggle('active', name === 'seating');
    screenRoles.classList.toggle('active',   name === 'roles');
  }

  function showEntryError(msg)   { $('entry-error').textContent   = msg || ''; }
  function showLobbyError(msg)   { $('lobby-error').textContent   = msg || ''; }
  function showSeatingError(msg) { const el = $('seating-error'); if (el) el.textContent = msg || ''; }
  function showRolesError(msg)   { const el = $('roles-error');   if (el) el.textContent = msg || ''; }

  function setButtonsDisabled(disabled) {
    $('btn-create').disabled = disabled;
    $('btn-join').disabled   = disabled;
  }

  // ─── Session persistence (for page transitions) ──────────
  function saveSession() {
    try {
      sessionStorage.setItem('hostless_roomId', currentRoomId || '');
      sessionStorage.setItem('hostless_playerId', myPlayerId || '');
      sessionStorage.setItem('hostless_isCreator', isCreator ? '1' : '0');
      sessionStorage.setItem('hostless_nickname', ($('input-nickname') ? $('input-nickname').value.trim() : ''));
    } catch (e) { /* ignore */ }
  }

  function loadSession() {
    try {
      return {
        roomId:    sessionStorage.getItem('hostless_roomId') || '',
        playerId:  sessionStorage.getItem('hostless_playerId') || '',
        isCreator: sessionStorage.getItem('hostless_isCreator') === '1',
        nickname:  sessionStorage.getItem('hostless_nickname') || ''
      };
    } catch (e) {
      return { roomId: '', playerId: '', isCreator: false, nickname: '' };
    }
  }

  // ═════════════════════════════════════════════════════════
  //  Socket.IO — connect WITHOUT Firebase Auth
  // ═════════════════════════════════════════════════════════
  function connectSocket() {
    if (socket && socket.connected) return Promise.resolve();

    return new Promise((resolve, reject) => {
      var apiBase = (window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE) || '';

      // Connect with hostless flag — server skips Firebase Auth for these
      socket = apiBase ? io(apiBase, { auth: { hostless: true } }) : io({ auth: { hostless: true } });

      socket.on('connect', () => {
        console.log('[Lobby] Socket connected:', socket.id);
        resolve();
      });

      socket.on('connect_error', (err) => {
        console.error('[Lobby] Connection error:', err.message);
        showEntryError('Ошибка подключения: ' + err.message);
        showLobbyError('Ошибка подключения: ' + err.message);
        reject(err);
      });

      socket.on('disconnect', (reason) => {
        console.warn('[Lobby] Disconnected:', reason);
      });

      // ── Lobby events ─────────────────────────────────────
      socket.on('room:updated', (snapshot) => {
        if (snapshot.phase === 'seating') {
          showScreen('seating');
          renderSeating(snapshot);
        } else if (snapshot.phase === 'roles') {
          showScreen('roles');
          updateRolesProgress(snapshot);
        } else if (snapshot.phase === 'active_game') {
          // Game started — redirect to game.html
          saveSession();
          window.location.href = 'game.html?roomId=' + (snapshot.roomId || currentRoomId);
        } else {
          renderLobby(snapshot);
        }
      });

      socket.on('game:seating_start', (snapshot) => {
        showScreen('seating');
        renderSeating(snapshot);
      });

      socket.on('game:started', (data) => {
        if (data && data.phase === 'seating') {
          showScreen('seating');
          renderSeating(data);
        } else {
          showScreen('seating');
        }
      });

      socket.on('game:roles_start', (snapshot) => {
        onRolesStart(snapshot);
      });

      socket.on('game:your_role', (data) => {
        myRole = data.role;
        console.log('[Lobby] My role received:', myRole);
      });

      socket.on('game:ready_to_play', (data) => {
        alert(data.message || 'Все игроки поняли роли! Игра начинается!');
        onGameFullyReady();
      });

      socket.on('game:phase_changed', (data) => {
        // If game phase changed to active — redirect to game table
        if (data.gamePhase && data.gamePhase !== 'lobby' && data.gamePhase !== 'waiting') {
          saveSession();
          window.location.href = 'game.html?roomId=' + currentRoomId;
        }
      });
    });
  }

  // ═════════════════════════════════════════════════════════
  //  Handlers — Create / Join / Toggle Ready
  // ═════════════════════════════════════════════════════════

  async function handleCreate() {
    const nickname = $('input-nickname').value.trim();
    if (!nickname) { showEntryError('Введите никнейм'); return; }

    showEntryError('');
    setButtonsDisabled(true);

    try {
      await connectSocket();

      const maxPlayers = parseInt($('select-max-players').value, 10) || 10;

      socket.emit('room:create', { nickname, maxPlayers }, (res) => {
        setButtonsDisabled(false);

        if (!res || !res.success) {
          showEntryError(res?.error || 'Не удалось создать комнату');
          return;
        }

        myPlayerId    = res.playerId;
        currentRoomId = res.room.roomId;
        myReady       = false;
        isCreator     = true;

        saveSession();

        $('lobby-room-id').textContent = currentRoomId;
        renderLobby(res.room);
        showScreen('lobby');
      });
    } catch (err) {
      setButtonsDisabled(false);
      showEntryError('Не удалось подключиться: ' + err.message);
    }
  }

  async function handleJoin() {
    const nickname = $('input-nickname').value.trim();
    const roomId   = $('input-room-id').value.trim().toUpperCase();

    if (!nickname) { showEntryError('Введите никнейм'); return; }
    if (!roomId)   { showEntryError('Введите ID комнаты'); return; }

    showEntryError('');
    setButtonsDisabled(true);

    try {
      await connectSocket();

      socket.emit('room:join', { roomId, nickname }, (res) => {
        setButtonsDisabled(false);

        if (!res || !res.success) {
          showEntryError(res?.error || 'Не удалось войти в комнату');
          return;
        }

        myPlayerId    = res.playerId;
        currentRoomId = res.room.roomId;
        myReady       = false;
        isCreator     = false;

        saveSession();

        $('lobby-room-id').textContent = currentRoomId;
        renderLobby(res.room);
        showScreen('lobby');
      });
    } catch (err) {
      setButtonsDisabled(false);
      showEntryError('Не удалось подключиться: ' + err.message);
    }
  }

  function handleToggleReady() {
    if (!socket || !socket.connected) {
      showLobbyError('Нет соединения с сервером');
      return;
    }

    socket.emit('player:toggleReady', {}, (res) => {
      if (!res || !res.success) {
        showLobbyError(res?.error || 'Ошибка');
        return;
      }

      showLobbyError('');
      myReady = res.isReady;
      updateReadyButton();
    });
  }

  // ═════════════════════════════════════════════════════════
  //  UI Rendering
  // ═════════════════════════════════════════════════════════

  function updateReadyButton() {
    const btn = $('btn-ready');
    if (myReady) {
      btn.textContent = '\u2705 Я ГОТОВ';
      btn.classList.add('is-ready');
    } else {
      btn.textContent = '\u2610 Я ГОТОВ';
      btn.classList.remove('is-ready');
    }
  }

  function renderLobby(snapshot) {
    if (!snapshot) return;

    const { roomId, maxPlayers, players } = snapshot;

    if (roomId) {
      $('lobby-room-id').textContent = roomId;
      currentRoomId = roomId;
    }

    const connected = players ? players.filter(p => p.isConnected).length : 0;
    $('lobby-player-count').textContent = `Игроков: ${connected} / ${maxPlayers || '?'}`;

    const list = $('lobby-players-list');
    list.innerHTML = '';

    if (!players || players.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Пока никого нет...';
      li.style.color = '#666';
      li.style.justifyContent = 'center';
      list.appendChild(li);
      return;
    }

    players.forEach((p) => {
      const li = document.createElement('li');
      if (p.isReady)      li.classList.add('ready');
      if (!p.isConnected) li.classList.add('disconnected');

      const nameSpan = document.createElement('span');
      nameSpan.className = 'player-name';
      nameSpan.textContent = p.nickname || 'Аноним';

      if (p.id === myPlayerId) {
        const youTag = document.createElement('span');
        youTag.className = 'you-tag';
        youTag.textContent = '(вы)';
        nameSpan.appendChild(youTag);

        if (p.isReady !== myReady) {
          myReady = p.isReady;
          updateReadyButton();
        }
      }

      const statusSpan = document.createElement('span');
      if (!p.isConnected) {
        statusSpan.className = 'player-status status-not-ready';
        statusSpan.textContent = '\u26A0 Отключён';
      } else if (p.isReady) {
        statusSpan.className = 'player-status status-ready';
        statusSpan.textContent = '\u2705 Готов';
      } else {
        statusSpan.className = 'player-status status-not-ready';
        statusSpan.textContent = '\u274C Не готов';
      }

      li.appendChild(nameSpan);
      li.appendChild(statusSpan);
      list.appendChild(li);
    });
  }

  function onGameStarted() {
    $('btn-ready').style.display          = 'none';
    $('lobby-players-list').style.display = 'none';
    $('game-started-banner').style.display = 'block';
  }

  // ═════════════════════════════════════════════════════════
  //  Seating Phase
  // ═════════════════════════════════════════════════════════

  function renderSeating(snapshot) {
    if (!snapshot) return;

    const { roomId, maxPlayers, players, turnQueue, currentTurnIndex } = snapshot;

    const roomLabel = $('seating-room-label');
    if (roomLabel) roomLabel.textContent = `Комната: ${roomId || currentRoomId}`;

    const currentTurnPlayerId = (turnQueue && turnQueue[currentTurnIndex] !== undefined)
      ? turnQueue[currentTurnIndex]
      : null;

    const isMyTurn = currentTurnPlayerId !== null && currentTurnPlayerId === myPlayerId;

    const currentTurnPlayer = players
      ? players.find(p => p.id === currentTurnPlayerId)
      : null;
    const currentTurnName = currentTurnPlayer
      ? currentTurnPlayer.nickname || 'Игрок'
      : '???';

    const statusEl = $('seating-status');
    if (statusEl) {
      if (currentTurnPlayerId === null) {
        statusEl.textContent = 'Все места выбраны!';
        statusEl.className = '';
        statusEl.style.color = 'var(--green)';
      } else if (isMyTurn) {
        statusEl.textContent = '\uD83C\uDFAF ВАШ ХОД! Выберите свободное место';
        statusEl.className = 'your-turn-text';
        statusEl.style.color = '';
      } else {
        statusEl.textContent = `\u23F3 Ходит: ${currentTurnName}...`;
        statusEl.className = 'waiting-turn-text';
        statusEl.style.color = '';
      }
    }

    const seatMap = {};
    if (players) {
      players.forEach(p => {
        if (p.seat) seatMap[p.seat] = p;
      });
    }

    const grid = $('seating-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const totalSeats = maxPlayers || 10;

    if (totalSeats <= 4)       grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    else if (totalSeats <= 6)  grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    else                       grid.style.gridTemplateColumns = 'repeat(5, 1fr)';

    for (let i = 1; i <= totalSeats; i++) {
      const btn = document.createElement('button');
      btn.className = 'seat-btn';

      const numberSpan = document.createElement('span');
      numberSpan.className = 'seat-number';
      numberSpan.textContent = i;

      const labelSpan = document.createElement('span');
      labelSpan.className = 'seat-label';

      if (seatMap[i]) {
        btn.classList.add('seat-taken');
        btn.disabled = true;
        const occupant = seatMap[i];
        const isMe = occupant.id === myPlayerId;
        labelSpan.textContent = isMe
          ? `${occupant.nickname} (вы)`
          : occupant.nickname;
        if (isMe) {
          btn.style.borderColor = 'var(--accent)';
          labelSpan.style.color = 'var(--accent)';
        }
      } else if (isMyTurn) {
        btn.classList.add('seat-available');
        labelSpan.textContent = 'Свободно';
        btn.onclick = () => selectSeat(i);
      } else {
        btn.classList.add('seat-waiting');
        btn.disabled = true;
        labelSpan.textContent = 'Свободно';
      }

      btn.appendChild(numberSpan);
      btn.appendChild(labelSpan);
      grid.appendChild(btn);
    }

    const infoEl = $('seating-players-info');
    if (infoEl && players) {
      const seatedCount = players.filter(p => p.seat).length;
      infoEl.innerHTML = `
        <p style="color: #888; font-size: 0.85em; text-align: center;">
          Выбрано мест: <b style="color: white;">${seatedCount}</b> / ${totalSeats}
        </p>`;
    }
  }

  function selectSeat(seatNumber) {
    if (!socket || !socket.connected) {
      showSeatingError('Нет соединения с сервером');
      return;
    }

    const grid = $('seating-grid');
    if (grid) {
      grid.querySelectorAll('.seat-btn').forEach(b => b.disabled = true);
    }

    showSeatingError('');

    socket.emit('room:selectSeat', { seatNumber }, (res) => {
      if (!res || !res.success) {
        showSeatingError(res?.error || 'Ошибка выбора места');
        if (grid) {
          grid.querySelectorAll('.seat-btn.seat-available').forEach(b => b.disabled = false);
        }
        return;
      }
      showSeatingError('');
    });
  }

  // ═════════════════════════════════════════════════════════
  //  Roles Phase
  // ═════════════════════════════════════════════════════════

  const ROLE_INFO = {
    don:     { emoji: '\uD83C\uDFA9',  name: 'ДОН',   cssClass: 'role-don' },
    mafia:   { emoji: '\uD83D\uDD2B',  name: 'МАФИЯ', cssClass: 'role-mafia' },
    sheriff: { emoji: '\u2B50',         name: 'ШЕРИФ', cssClass: 'role-sheriff' },
    citizen: { emoji: '\uD83D\uDC68\u200D\uD83C\uDF3E', name: 'МИРНЫЙ', cssClass: 'role-citizen' }
  };

  function onRolesStart(snapshot) {
    myRole = null;
    isRoleShown = false;
    isRoleAccepted = false;

    const card = $('role-card');
    if (card) {
      card.className = 'role-card';
      card.innerHTML = '<span class="role-hidden-text">Нажмите кнопку ниже, чтобы увидеть свою роль</span>'
        + '<span class="role-emoji">\u2753</span>';
    }

    const showBtn = $('btn-show-role');
    if (showBtn) {
      showBtn.textContent = '\uD83D\uDC41\uFE0F Показать роль';
      showBtn.disabled = false;
      showBtn.style.display = 'block';
    }

    const understandBtn = $('btn-understand-role');
    if (understandBtn) {
      understandBtn.style.display = 'none';
      understandBtn.disabled = false;
      understandBtn.textContent = '\u2705 Роль понял!';
      understandBtn.style.opacity = '1';
    }

    const roomLabel = $('roles-room-label');
    if (roomLabel) roomLabel.textContent = 'Комната: ' + (snapshot.roomId || currentRoomId);

    updateRolesProgress(snapshot);
    showScreen('roles');
  }

  function updateRolesProgress(snapshot) {
    const progressEl = $('roles-progress');
    if (!progressEl) return;

    if (snapshot.rolesUnderstood !== undefined && snapshot.rolesTotal !== undefined) {
      progressEl.textContent = 'Поняли роли: ' + snapshot.rolesUnderstood + ' / ' + snapshot.rolesTotal;
    } else if (snapshot.players) {
      const understood = snapshot.players.filter(p => p.roleUnderstood).length;
      const total = snapshot.players.length;
      progressEl.textContent = 'Поняли роли: ' + understood + ' / ' + total;
    }
  }

  function handleShowRole() {
    if (isRoleAccepted) return;

    const card = $('role-card');
    const showBtn = $('btn-show-role');
    const understandBtn = $('btn-understand-role');

    if (!isRoleShown) {
      if (!myRole) {
        showRolesError('Роль ещё не получена от сервера. Подождите...');
        return;
      }
      showRolesError('');

      const info = ROLE_INFO[myRole] || { emoji: '\u2753', name: myRole.toUpperCase(), cssClass: '' };

      card.className = 'role-card role-revealed role-animate';
      if (info.cssClass) card.classList.add(info.cssClass);

      card.innerHTML = '<span class="role-emoji">' + info.emoji + '</span>'
        + '<span class="role-name">' + info.name + '</span>';

      if (showBtn) showBtn.textContent = '\uD83D\uDE48 Скрыть роль';
      if (understandBtn) understandBtn.style.display = 'block';

      isRoleShown = true;
    } else {
      card.className = 'role-card';
      card.innerHTML = '<span class="role-hidden-text">Роль скрыта</span>'
        + '<span class="role-emoji">\uD83D\uDD12</span>';

      if (showBtn) showBtn.textContent = '\uD83D\uDC41\uFE0F Показать роль';

      isRoleShown = false;
    }
  }

  function handleRoleUnderstood() {
    if (!socket || !socket.connected) {
      showRolesError('Нет соединения с сервером');
      return;
    }
    if (isRoleAccepted) return;

    const showBtn = $('btn-show-role');
    const understandBtn = $('btn-understand-role');

    if (showBtn) showBtn.disabled = true;
    if (understandBtn) understandBtn.disabled = true;

    socket.emit('player:roleUnderstood', {}, (res) => {
      if (res && res.error) {
        showRolesError(res.error);
        if (showBtn) showBtn.disabled = false;
        if (understandBtn) understandBtn.disabled = false;
        return;
      }

      showRolesError('');
      isRoleAccepted = true;

      const card = $('role-card');
      if (card) {
        card.className = 'role-card role-accepted';
        card.innerHTML = '<span class="role-emoji">\u2705</span>'
          + '<span class="role-name">Роль принята</span>';
      }

      if (showBtn) showBtn.style.display = 'none';
      if (understandBtn) {
        understandBtn.style.display = 'block';
        understandBtn.disabled = true;
        understandBtn.textContent = '\u2705 Ожидаем остальных...';
        understandBtn.style.opacity = '0.6';
      }
    });
  }

  function onGameFullyReady() {
    const card = $('role-card');
    if (card) {
      card.className = 'role-card role-accepted';
      card.innerHTML = '<span class="role-emoji">\uD83C\uDFAE</span>'
        + '<span class="role-name">Игра начинается!</span>';
    }

    const showBtn = $('btn-show-role');
    if (showBtn) showBtn.style.display = 'none';

    const understandBtn = $('btn-understand-role');
    if (understandBtn) understandBtn.style.display = 'none';

    const progressEl = $('roles-progress');
    if (progressEl) {
      progressEl.innerHTML = '<b style="color: var(--gold);">\uD83C\uDF89 Все игроки готовы! Переход к игровому столу...</b>';
    }

    saveSession();
    setTimeout(() => {
      window.location.href = 'game.html?roomId=' + currentRoomId;
    }, 2000);
  }

  // ═════════════════════════════════════════════════════════
  //  Event binding
  // ═════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    $('btn-create').addEventListener('click', handleCreate);
    $('btn-join').addEventListener('click',   handleJoin);
    $('btn-ready').addEventListener('click',  handleToggleReady);
    $('btn-show-role').addEventListener('click', handleShowRole);
    $('btn-understand-role').addEventListener('click', handleRoleUnderstood);

    $('lobby-room-id').addEventListener('click', () => {
      const text = $('lobby-room-id').textContent;
      if (text && text !== '---') {
        navigator.clipboard.writeText(text).then(() => {
          const orig = $('lobby-room-id').textContent;
          $('lobby-room-id').textContent = '\uD83D\uDCCB Скопировано!';
          setTimeout(() => { $('lobby-room-id').textContent = orig; }, 1200);
        }).catch(() => {});
      }
    });

    $('input-room-id').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleJoin();
    });

    $('input-nickname').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCreate();
    });

    // Restore nickname from session
    const session = loadSession();
    if (session.nickname && $('input-nickname')) {
      $('input-nickname').value = session.nickname;
    }
  });

})();
