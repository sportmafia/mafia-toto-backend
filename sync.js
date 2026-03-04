(function () {
  var LS = {
    ROOM: 'sportmafia_room_id',
    TOKEN: 'sportmafia_player_token',
    HOST_QUEUE: 'sportmafia_host_queue',
    HOST_ROOM: 'sportmafia_host_room',
    HOST_LINKS: 'sportmafia_host_links'
  };

  var firebaseApp = null;
  var db = null;
  var auth = null;
  var currentUser = null;
  var connected = false;

  var hostState = {
    roomId: null,
    hostUid: null,
    stateVersion: 0,
    queue: [],
    processing: false,
    watchers: { unsubs: [] },
    linksBySeat: {},
    tokenHashBySeat: {},
    statusEl: null,
    presenceEl: null,
    qrEl: null,
    qrObj: null,
    selectedSeat: 1,
    stateProvider: null,
    onPublic: null,
    onError: null,
    onFoulsUpdate: null,
    onNominationsUpdate: null,
    onTableEvent: null
  };

  var playerState = {
    roomId: null,
    token: null,
    tokenHash: null,
    seat: null,
    statusEl: null,
    onPublic: null,
    onPrivate: null,
    onError: null,
    timerTick: null,
    timerState: null,
    privateRef: null,
    foulVotesRef: null,
    foulVotesHandler: null,
    tableEventsRef: null,
    tableEventsHandler: null,
    nominationsRef: null,
    nominationsHandler: null
  };

  function nowMs() { return Date.now(); }

  function safeJsonParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function pushToast(msg, type) {
    var detail = { message: msg, type: type || 'info' };
    document.dispatchEvent(new CustomEvent('sportmafia:toast', { detail: detail }));
  }

  function setText(el, value) {
    if (!el) return;
    el.textContent = value;
  }

  function setStatusDot(el, online, label) {
    if (!el) return;
    el.textContent = (online ? '🟢 ' : '🔴 ') + label;
  }

  function randomRoomId() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = '';
    var bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    for (var i = 0; i < 6; i += 1) out += chars[bytes[i] % chars.length];
    return out;
  }

  async function sha256Hex(input) {
    var data = new TextEncoder().encode(input);
    var hash = await crypto.subtle.digest('SHA-256', data);
    var bytes = Array.from(new Uint8Array(hash));
    return bytes.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function ensureFirebase() {
    if (!window.firebase) {
      throw new Error('Firebase SDK не загружен');
    }
    if (!window.SPORTMAFIA_FIREBASE_CONFIG || !window.SPORTMAFIA_FIREBASE_CONFIG.apiKey || window.SPORTMAFIA_FIREBASE_CONFIG.apiKey === 'PASTE_API_KEY') {
      throw new Error('Firebase config не заполнен в firebase-config.js');
    }
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(window.SPORTMAFIA_FIREBASE_CONFIG);
    } else {
      firebaseApp = firebase.app();
    }
    db = firebase.database();
    auth = firebase.auth();
  }

  function onConnectedChanged(cb) {
    if (!db) return;
    db.ref('.info/connected').on('value', function (snap) {
      connected = !!snap.val();
      cb(connected);
    });
  }

  async function ensureAuth() {
    ensureFirebase();
    if (auth.currentUser) {
      currentUser = auth.currentUser;
      return currentUser;
    }
    await auth.signInAnonymously();
    currentUser = auth.currentUser;
    return currentUser;
  }

  function setHostStatus(msg, isOnline) {
    setStatusDot(hostState.statusEl, !!isOnline, msg);
  }

  function setPlayerStatus(msg, isOnline) {
    setStatusDot(playerState.statusEl, !!isOnline, msg);
  }

  function roomRef(roomId) {
    return db.ref('rooms/' + roomId);
  }

  function runTransaction(ref, updater, applyLocally) {
    return new Promise(function (resolve, reject) {
      ref.transaction(updater, function (err, committed, snap) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ committed: committed, snapshot: snap });
      }, !!applyLocally);
    });
  }

  function queueKey(roomId) {
    return LS.HOST_QUEUE + ':' + roomId;
  }

  function loadHostQueue(roomId) {
    var raw = localStorage.getItem(queueKey(roomId));
    return safeJsonParse(raw, []);
  }

  function saveHostQueue(roomId, queue) {
    localStorage.setItem(queueKey(roomId), JSON.stringify(queue));
  }

  function enqueueHostAction(action) {
    if (!hostState.roomId) return;
    hostState.queue.push(action);
    saveHostQueue(hostState.roomId, hostState.queue);
  }

  function flushHostQueueSoon() {
    processHostQueue().catch(function () { });
  }

  async function processHostQueue() {
    if (!hostState.roomId || hostState.processing || !connected) return;
    hostState.processing = true;
    try {
      while (hostState.queue.length) {
        var action = hostState.queue[0];
        var committed = await applyHostAction(action);
        if (!committed) {
          break;
        }
        hostState.queue.shift();
        saveHostQueue(hostState.roomId, hostState.queue);
      }
    } finally {
      hostState.processing = false;
    }
  }

  function applyHostAction(action) {
    return new Promise(function (resolve) {
      var ref = roomRef(hostState.roomId);
      ref.transaction(function (room) {
        if (!room) return room;
        var currentVersion = Number(room.stateVersion || 0);
        var expected = Number(action.expectedVersion || 0);
        if (currentVersion !== expected) {
          return;
        }
        if (action.kind === 'snapshot') {
          room.publicState = action.payload.publicState;
          room.judgeMirrorState = action.payload.judgeMirrorState;
          room.timers = action.payload.timers;
          room.privateByToken = room.privateByToken || {};
          var privateMap = action.payload.privateByToken || {};
          Object.keys(privateMap).forEach(function (tokenHash) {
            var prev = room.privateByToken[tokenHash] || {};
            room.privateByToken[tokenHash] = {
              seat: privateMap[tokenHash].seat,
              role: privateMap[tokenHash].role,
              status: privateMap[tokenHash].status,
              isAlive: privateMap[tokenHash].isAlive,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
              ownerUid: prev.ownerUid || null
            };
          });
        }
        if (action.kind === 'event') {
          room.publicState = room.publicState || {};
          room.publicState.lastEvent = action.payload;
          room.publicState.updatedAt = firebase.database.ServerValue.TIMESTAMP;
        }
        room.stateVersion = currentVersion + 1;
        room.updatedAt = firebase.database.ServerValue.TIMESTAMP;
        return room;
      }, function (err, committed, snap) {
        if (err) {
          if (hostState.onError) hostState.onError(err);
          resolve(false);
          return;
        }
        if (!committed) {
          var latest = snap && snap.child ? Number(snap.child('stateVersion').val() || 0) : hostState.stateVersion;
          hostState.stateVersion = latest;
          if (hostState.queue.length) {
            hostState.queue[0].expectedVersion = latest;
            saveHostQueue(hostState.roomId, hostState.queue);
          }
          resolve(false);
          return;
        }
        hostState.stateVersion = Number(snap.child('stateVersion').val() || hostState.stateVersion + 1);
        resolve(true);
      }, false);
    });
  }

  function buildSnapshotPayload(state) {
    var players = Array.isArray(state.players) ? state.players : [];
    var aliveCount = players.filter(function (p) { return p.status === 'alive'; }).length;
    var publicState = {
      phase: state.currentGamePhase || 'PHASE_ROLES',
      dayNumber: Number(state.dayNumber || 0),
      aliveCount: aliveCount,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      lastEvent: {
        type: 'STATE_SYNC',
        phase: state.currentGamePhase || 'PHASE_ROLES',
        dayNumber: Number(state.dayNumber || 0),
        ts: nowMs()
      }
    };

    var timers = {
      manual: {
        mode: state.manualTimerRemaining > 0 ? 'paused' : 'ended',
        remainingSec: Number(state.manualTimerRemaining || 0),
        durationSec: Number(state.manualTimerDuration || 60),
        startedAtServer: null,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      }
    };

    var privateByToken = {};
    Object.keys(hostState.tokenHashBySeat).forEach(function (seatStr) {
      var seat = Number(seatStr);
      var tokenHash = hostState.tokenHashBySeat[seatStr];
      var player = players.find(function (p) { return Number(p.id) === seat; }) || { role: 'civilian', status: 'alive' };
      privateByToken[tokenHash] = {
        seat: seat,
        role: player.role || 'civilian',
        status: player.status || 'alive',
        isAlive: (player.status || 'alive') === 'alive'
      };
    });

    return {
      publicState: publicState,
      timers: timers,
      privateByToken: privateByToken,
      judgeMirrorState: {
        currentGamePhase: state.currentGamePhase || 'PHASE_ROLES',
        dayNumber: Number(state.dayNumber || 0),
        players: players.map(function (p) {
          return { id: p.id, status: p.status, role: p.role };
        }),
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      }
    };
  }

  async function hostCreateRoom() {
    if (!db || !currentUser) throw new Error('Firebase не инициализирован');

    var roomId = randomRoomId();
    hostState.roomId = roomId;
    hostState.hostUid = currentUser.uid;
    hostState.stateVersion = 0;

    var linksBySeat = {};
    var tokenHashBySeat = {};
    var linksNode = {};

    for (var seat = 1; seat <= 10; seat += 1) {
      var token = crypto.randomUUID();
      var tokenHash = await sha256Hex(token);
      var link = 'player.html?room=' + encodeURIComponent(roomId) + '&token=' + encodeURIComponent(token);
      linksBySeat[seat] = link;
      tokenHashBySeat[seat] = tokenHash;
      linksNode[tokenHash] = { seat: seat, createdAt: firebase.database.ServerValue.TIMESTAMP };
    }

    hostState.linksBySeat = linksBySeat;
    hostState.tokenHashBySeat = tokenHashBySeat;

    // Step 1: create meta first (allowed by meta .write rule when !data.exists())
    await roomRef(roomId).child('meta').set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      hostUid: currentUser.uid,
      status: 'lobby',
      version: 'v18-mp-mvp'
    });

    // Step 2: write remaining children via multi-path update
    // Each path is checked against its own .write rule using the now-existing meta/hostUid
    var updates = {};
    updates['stateVersion'] = 0;
    updates['publicState'] = {
      phase: 'PHASE_ROLES',
      dayNumber: 0,
      aliveCount: 10,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      lastEvent: { type: 'ROOM_CREATED', ts: nowMs() }
    };
    updates['timers'] = {
      manual: {
        mode: 'paused',
        durationSec: 60,
        remainingSec: 60,
        startedAtServer: null,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      }
    };
    Object.keys(linksNode).forEach(function (tokenHash) {
      updates['links/' + tokenHash] = linksNode[tokenHash];
    });
    await roomRef(roomId).update(updates);

    localStorage.setItem(LS.HOST_ROOM, roomId);
    localStorage.setItem(LS.HOST_LINKS + ':' + roomId, JSON.stringify(linksBySeat));

    hostState.queue = loadHostQueue(roomId);
    setHostStatus('Комната ' + roomId, true);
    bindJudgePresence(roomId);
    bindHostPlayerData(roomId);
    renderHostQr();

    return { roomId: roomId, linksBySeat: linksBySeat };
  }

  function renderHostQr() {
    if (!hostState.qrEl) return;
    var seat = Number(hostState.selectedSeat || 1);
    var link = hostState.linksBySeat[seat] || '';
    hostState.qrEl.innerHTML = '';
    if (!link || !window.QRCode) return;
    hostState.qrObj = new QRCode(hostState.qrEl, {
      text: location.origin + location.pathname.replace(/[^/]*$/, '') + link,
      width: 160,
      height: 160,
      colorDark: '#ffffff',
      colorLight: '#1a1a1d'
    });
  }

  async function hostSyncStateSnapshot(state) {
    if (!hostState.roomId) return;
    var payload = buildSnapshotPayload(state);
    enqueueHostAction({
      kind: 'snapshot',
      expectedVersion: hostState.stateVersion,
      payload: payload,
      ts: nowMs()
    });
    flushHostQueueSoon();
  }

  async function hostPublishTimer(mode, snapshot) {
    if (!hostState.roomId) return;
    var payload = {
      type: 'TIMER_' + String(mode || '').toUpperCase(),
      timer: {
        mode: mode,
        durationSec: Number(snapshot.manualTimerDuration || 60),
        remainingSec: Number(snapshot.manualTimerRemaining || 0),
        startedAtMs: nowMs()
      },
      ts: nowMs()
    };
    enqueueHostAction({
      kind: 'event',
      expectedVersion: hostState.stateVersion,
      payload: payload,
      ts: nowMs()
    });
    flushHostQueueSoon();
  }

  function bindJudgePresence(roomId) {
    var userPath = 'rooms/' + roomId + '/presence/judge/' + currentUser.uid;
    var ref = db.ref(userPath);
    ref.onDisconnect().set({ online: false, lastSeenAt: firebase.database.ServerValue.TIMESTAMP, role: 'judge' });
    ref.set({ online: true, lastSeenAt: firebase.database.ServerValue.TIMESTAMP, role: 'judge' });

    var playersRef = db.ref('rooms/' + roomId + '/presence/players');
    var linksRef = db.ref('rooms/' + roomId + '/links');

    var linksMap = {};
    linksRef.on('value', function (snap) {
      linksMap = snap.val() || {};
    });

    playersRef.on('value', function (snap) {
      if (!hostState.presenceEl) return;
      var val = snap.val() || {};
      var now = nowMs();
      var lines = [];
      Object.keys(val).forEach(function (tokenHash) {
        var p = val[tokenHash] || {};
        var seat = linksMap[tokenHash] && linksMap[tokenHash].seat ? linksMap[tokenHash].seat : '?';
        var lastSeen = Number(p.lastSeenAt || 0);
        var age = lastSeen ? Math.floor((now - lastSeen) / 1000) : null;
        var stale = age !== null && age > 120;
        var icon = p.online ? '🟢' : (stale ? '🟠' : '🔴');
        var tail = age === null ? '' : (' (' + age + 's)');
        lines.push(icon + ' Игрок ' + seat + tail);
      });
      if (!lines.length) lines.push('— Игроков онлайн пока нет');
      hostState.presenceEl.innerHTML = lines.map(function (x) { return '<div>' + x + '</div>'; }).join('');
    });
  }

  function bindHostPlayerData(roomId) {
    var foulsRef = db.ref('rooms/' + roomId + '/fouls');
    foulsRef.on('value', function (snap) {
      if (hostState.onFoulsUpdate) hostState.onFoulsUpdate(snap.val() || {});
    });

    var nominationsRef = db.ref('rooms/' + roomId + '/nominations');
    nominationsRef.on('value', function (snap) {
      if (hostState.onNominationsUpdate) hostState.onNominationsUpdate(snap.val() || {});
    });

    var tableEventsRef = db.ref('rooms/' + roomId + '/tableEvents').limitToLast(1);
    tableEventsRef.on('child_added', function (snap) {
      var event = snap.val() || {};
      if (hostState.onTableEvent) {
        hostState.onTableEvent({
          id: snap.key,
          type: event.type || '',
          byTokenHash: event.byTokenHash || null,
          ts: event.ts || null
        });
      }
    });
  }

  async function initHost(options) {
    options = options || {};
    try {
      await ensureAuth();
      hostState.statusEl = options.statusEl || null;
      hostState.presenceEl = options.presenceEl || null;
      hostState.qrEl = options.qrEl || null;
      hostState.onError = options.onError || null;
      hostState.stateProvider = options.stateProvider || null;
      hostState.onFoulsUpdate = options.onFoulsUpdate || null;
      hostState.onNominationsUpdate = options.onNominationsUpdate || null;
      hostState.onTableEvent = options.onTableEvent || null;

      onConnectedChanged(function (isConnected) {
        setHostStatus(isConnected ? 'Связь есть' : 'Нет связи', isConnected);
        if (isConnected) {
          if (hostState.roomId) {
            flushHostQueueSoon();
          }
        }
      });

      var persistedRoom = localStorage.getItem(LS.HOST_ROOM);
      if (persistedRoom) {
        hostState.roomId = persistedRoom;
        hostState.queue = loadHostQueue(persistedRoom);
        hostState.linksBySeat = safeJsonParse(localStorage.getItem(LS.HOST_LINKS + ':' + persistedRoom), {});
        Object.keys(hostState.linksBySeat).forEach(function (seatStr) {
          var link = hostState.linksBySeat[seatStr] || '';
          try {
            var parsed = new URL(link, location.href);
            var token = parsed.searchParams.get('token');
            if (token) {
              sha256Hex(token).then(function (h) {
                hostState.tokenHashBySeat[seatStr] = h;
              });
            }
          } catch (e) {}
        });
        var snap = await roomRef(persistedRoom).child('stateVersion').get();
        hostState.stateVersion = Number(snap.val() || 0);
        bindJudgePresence(persistedRoom);
        bindHostPlayerData(persistedRoom);
        renderHostQr();
      }

      return {
        isConnected: connected,
        roomId: hostState.roomId
      };
    } catch (e) {
      if (options.onError) options.onError(e);
      throw e;
    }
  }

  function getRoomId() {
    return hostState.roomId;
  }

  function getLinks() {
    return hostState.linksBySeat;
  }

  function setQrSeat(seat) {
    hostState.selectedSeat = Number(seat || 1);
    renderHostQr();
  }

  function bindJudgeAutoSync() {
    if (typeof window.saveState === 'function') {
      var origSaveState = window.saveState;
      var debouncedSync = debounce(function (state) {
        hostSyncStateSnapshot(state).catch(function () { });
      }, 250);
      window.saveState = function () {
        var state = origSaveState.apply(this, arguments);
        debouncedSync(state);
        return state;
      };
    }

    function wrapTimer(fnName, mode) {
      if (typeof window[fnName] !== 'function') return;
      var original = window[fnName];
      window[fnName] = function () {
        var result = original.apply(this, arguments);
        try {
          if (typeof window.saveState === 'function') {
            var snap = window.saveState();
            hostPublishTimer(mode, snap).catch(function () { });
          }
        } catch (e) {}
        return result;
      };
    }

    wrapTimer('startManualTimer', 'running');
    wrapTimer('stopManualTimer', 'paused');
    wrapTimer('resetManualTimer', 'reset');
  }

  async function claimPrivateNode(roomId, tokenHash) {
    var ref = db.ref('rooms/' + roomId + '/privateByToken/' + tokenHash + '/ownerUid');
    await ref.transaction(function (ownerUid) {
      if (!ownerUid) return currentUser.uid;
      if (ownerUid === currentUser.uid) return ownerUid;
      return;
    });
  }

  function setupPlayerPresence(roomId, tokenHash) {
    var ref = db.ref('rooms/' + roomId + '/presence/players/' + tokenHash);
    ref.onDisconnect().set({ online: false, lastSeenAt: firebase.database.ServerValue.TIMESTAMP });
    ref.set({ online: true, lastSeenAt: firebase.database.ServerValue.TIMESTAMP });
    setInterval(function () {
      ref.update({ online: connected, lastSeenAt: firebase.database.ServerValue.TIMESTAMP });
    }, 20000);
  }

  function subscribePlayer(roomId, tokenHash, onPublic, onPrivate) {
    var pubRef = db.ref('rooms/' + roomId + '/publicState');
    var timerRef = db.ref('rooms/' + roomId + '/timers/manual');
    var foulsRef = db.ref('rooms/' + roomId + '/fouls');
    var privateRef = db.ref('rooms/' + roomId + '/privateByToken/' + tokenHash);

    pubRef.on('value', function (snap) {
      if (onPublic) onPublic(snap.val() || {});
    });
    timerRef.on('value', function (snap) {
      var timer = snap.val() || null;
      playerState.timerState = timer;
      if (onPublic) onPublic({ timer: timer });
    });
    foulsRef.on('value', function (snap) {
      if (onPublic) onPublic({ fouls: snap.val() || {} });
    });
    privateRef.on('value', function (snap) {
      var privateData = snap.val() || {};
      playerState.seat = Number(privateData.seat || 0) || null;
      if (onPrivate) onPrivate(privateData);
    });

    playerState.privateRef = privateRef;
  }

  function countYesVotes(votes) {
    var yes = 0;
    var map = votes || {};
    Object.keys(map).forEach(function (tokenHash) {
      if (map[tokenHash] === true) yes += 1;
    });
    return yes;
  }

  function normalizeFoulType(foulType) {
    return foulType === 'technical' ? 'technical' : 'regular';
  }

  async function getAliveCount(roomId) {
    var snap = await db.ref('rooms/' + roomId + '/publicState/aliveCount').get();
    var aliveCount = Number(snap.val());
    if (!Number.isFinite(aliveCount) || aliveCount <= 0) return 10;
    return aliveCount;
  }

  async function tryResolveFoulVote(voteId, voteData) {
    if (!playerState.roomId || !voteId || !voteData) return false;
    if ((voteData.status && voteData.status !== 'active') || voteData.resolvedAt) return false;

    var aliveCount = await getAliveCount(playerState.roomId);
    var threshold = Math.floor(aliveCount / 2) + 1;
    var immediateYes = countYesVotes(voteData.votes || {});
    if (immediateYes < threshold) return false;

    var voteRef = db.ref('rooms/' + playerState.roomId + '/foulVotes/' + voteId);
    var tx = await runTransaction(voteRef, function (current) {
      if (!current) return;
      if ((current.status && current.status !== 'active') || current.resolvedAt) return;
      var yes = countYesVotes(current.votes || {});
      if (yes < threshold) return;
      current.status = 'passed';
      current.resolvedAt = firebase.database.ServerValue.TIMESTAMP;
      current.closedBy = 'majority';
      return current;
    }, false);

    if (!tx.committed) return false;

    var txTargetSeat = tx.snapshot ? Number(tx.snapshot.child('targetSeat').val()) : NaN;
    var targetSeat = Number(voteData.targetSeat || txTargetSeat);
    if (!Number.isFinite(targetSeat) || targetSeat < 1 || targetSeat > 10) return false;

    var txFoulType = tx.snapshot ? String(tx.snapshot.child('foulType').val() || '') : '';
    var foulType = normalizeFoulType(voteData.foulType || txFoulType);

    var foulRef = db.ref('rooms/' + playerState.roomId + '/fouls/' + targetSeat);
    await runTransaction(foulRef, function (prev) {
      var node = prev;
      if (typeof node !== 'object' || node === null || Array.isArray(node)) {
        node = { regular: Number(node || 0), technical: 0 };
      }
      node.regular = Number(node.regular || 0);
      node.technical = Number(node.technical || 0);
      node[foulType] = Number(node[foulType] || 0) + 1;
      return node;
    }, false);

    // Отключено для режима без судьи: обычные игроки не имеют прав записи в publicState.
    // await db.ref('rooms/' + playerState.roomId + '/publicState').update({
    //   updatedAt: firebase.database.ServerValue.TIMESTAMP,
    //   lastEvent: {
    //     type: 'FOUL_GIVEN',
    //     targetSeat: targetSeat,
    //     voteId: voteId,
    //     ts: nowMs()
    //   }
    // });

    return true;
  }

  async function proposeFoulVote(targetSeat, foulType) {
    if (!playerState.roomId || !playerState.tokenHash) throw new Error('Игрок не подключен к комнате');

    var seat = Number(targetSeat);
    var normalizedType = normalizeFoulType(foulType);
    if (!Number.isFinite(seat) || seat < 1 || seat > 10) throw new Error('Некорректное место игрока');
    if (playerState.seat && Number(playerState.seat) === seat) throw new Error('Нельзя выставить фол самому себе');

    var voteRef = db.ref('rooms/' + playerState.roomId + '/foulVotes').push();
    var payload = {
      targetSeat: seat,
      foulType: normalizedType,
      proposedByTokenHash: playerState.tokenHash,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      status: 'active',
      votes: {}
    };
    payload.votes[playerState.tokenHash] = true;

    await voteRef.set(payload);
    await tryResolveFoulVote(voteRef.key, payload);
    return { voteId: voteRef.key, targetSeat: seat, foulType: normalizedType };
  }

  async function castVote(voteId, decision) {
    if (!playerState.roomId || !playerState.tokenHash) throw new Error('Игрок не подключен к комнате');

    voteId = String(voteId || '').trim();
    if (!voteId) throw new Error('Не указан ID голосования');

    var boolDecision = !!decision;
    var votePath = 'rooms/' + playerState.roomId + '/foulVotes/' + voteId + '/votes/' + playerState.tokenHash;
    await db.ref(votePath).set(boolDecision);

    var voteSnap = await db.ref('rooms/' + playerState.roomId + '/foulVotes/' + voteId).get();
    await tryResolveFoulVote(voteId, voteSnap.val() || null);
    return { voteId: voteId, decision: boolDecision };
  }

  function listenToFoulVotes(callback) {
    if (!playerState.roomId) throw new Error('Игрок не подключен к комнате');

    if (playerState.foulVotesRef && playerState.foulVotesHandler) {
      playerState.foulVotesRef.off('value', playerState.foulVotesHandler);
      playerState.foulVotesRef = null;
      playerState.foulVotesHandler = null;
    }

    var ref = db.ref('rooms/' + playerState.roomId + '/foulVotes');
    var handler = function (snap) {
      var allVotes = snap.val() || {};
      var activeVotes = [];

      Object.keys(allVotes).forEach(function (voteId) {
        var vote = allVotes[voteId] || {};
        if ((vote.status || 'active') !== 'active' || vote.resolvedAt) return;

        activeVotes.push({
          id: voteId,
          targetSeat: Number(vote.targetSeat || 0),
          foulType: normalizeFoulType(vote.foulType),
          proposedByTokenHash: vote.proposedByTokenHash || null,
          createdAt: Number(vote.createdAt || 0),
          votes: vote.votes || {},
          status: vote.status || 'active'
        });

        tryResolveFoulVote(voteId, vote).catch(function () { });
      });

      activeVotes.sort(function (a, b) {
        return Number(a.createdAt || 0) - Number(b.createdAt || 0);
      });

      if (callback) callback(activeVotes);
    };

    ref.on('value', handler);
    playerState.foulVotesRef = ref;
    playerState.foulVotesHandler = handler;

    return function () {
      ref.off('value', handler);
      if (playerState.foulVotesRef === ref) {
        playerState.foulVotesRef = null;
        playerState.foulVotesHandler = null;
      }
    };
  }

  async function skipSpeech() {
    if (!playerState.roomId || !playerState.tokenHash) throw new Error('Игрок не подключен к комнате');

    var ref = db.ref('rooms/' + playerState.roomId + '/tableEvents').push();
    var payload = {
      type: 'SKIP_SPEECH',
      byTokenHash: playerState.tokenHash,
      ts: firebase.database.ServerValue.TIMESTAMP
    };
    await ref.set(payload);
    playerState.timerState = { mode: 'ended', remainingSec: 0, durationSec: 0, startedAtMs: nowMs() };
    return { eventId: ref.key, type: payload.type };
  }

  function listenToTableEvents(callback) {
    if (!playerState.roomId) throw new Error('Игрок не подключен к комнате');

    if (playerState.tableEventsRef && playerState.tableEventsHandler) {
      playerState.tableEventsRef.off('child_added', playerState.tableEventsHandler);
      playerState.tableEventsRef = null;
      playerState.tableEventsHandler = null;
    }

    var ref = db.ref('rooms/' + playerState.roomId + '/tableEvents').limitToLast(20);
    var handler = function (snap) {
      var event = snap.val() || {};
      var payload = {
        id: snap.key,
        type: event.type || '',
        byTokenHash: event.byTokenHash || null,
        ts: event.ts || null
      };

      if (payload.type === 'SKIP_SPEECH') {
        playerState.timerState = { mode: 'ended', remainingSec: 0, durationSec: 0, startedAtMs: nowMs() };
      }

      if (callback) callback(payload);
    };

    ref.on('child_added', handler);
    playerState.tableEventsRef = ref;
    playerState.tableEventsHandler = handler;

    return function () {
      ref.off('child_added', handler);
      if (playerState.tableEventsRef === ref) {
        playerState.tableEventsRef = null;
        playerState.tableEventsHandler = null;
      }
    };
  }

  async function nominatePlayer(targetSeat) {
    if (!playerState.roomId || !playerState.tokenHash) throw new Error('Игрок не подключен к комнате');

    var seat = Number(targetSeat);
    if (!Number.isFinite(seat) || seat < 1 || seat > 10) throw new Error('Некорректное место игрока');
    if (playerState.seat && Number(playerState.seat) === seat) throw new Error('Нельзя выставить самого себя');

    var ref = db.ref('rooms/' + playerState.roomId + '/nominations/' + playerState.tokenHash);
    var tx = await runTransaction(ref, function (current) {
      if (current !== null && current !== undefined) return;
      return seat;
    }, false);

    if (!tx.committed) throw new Error('Вы уже выставили игрока на голосование');
    return { nominator: playerState.tokenHash, targetSeat: seat };
  }

  function listenToNominations(callback) {
    if (!playerState.roomId) throw new Error('Игрок не подключен к комнате');

    if (playerState.nominationsRef && playerState.nominationsHandler) {
      playerState.nominationsRef.off('value', playerState.nominationsHandler);
      playerState.nominationsRef = null;
      playerState.nominationsHandler = null;
    }

    var ref = db.ref('rooms/' + playerState.roomId + '/nominations');
    var handler = function (snap) {
      if (callback) callback(snap.val() || {});
    };

    ref.on('value', handler);
    playerState.nominationsRef = ref;
    playerState.nominationsHandler = handler;

    return function () {
      ref.off('value', handler);
      if (playerState.nominationsRef === ref) {
        playerState.nominationsRef = null;
        playerState.nominationsHandler = null;
      }
    };
  }

  function computeTimerRemaining(timer) {
    if (!timer) return null;
    var mode = timer.mode || 'paused';
    var duration = Number(timer.durationSec || 60);
    var rem = Number(timer.remainingSec || duration);
    if (mode !== 'running') return Math.max(0, rem);
    var started = Number(timer.startedAtMs || nowMs());
    var elapsed = Math.floor((nowMs() - started) / 1000);
    return Math.max(0, rem - elapsed);
  }

  function startPlayerTimerTicker(onTick) {
    if (playerState.timerTick) clearInterval(playerState.timerTick);
    playerState.timerTick = setInterval(function () {
      if (!playerState.timerState) return;
      var left = computeTimerRemaining(playerState.timerState);
      if (onTick) onTick(left, playerState.timerState);
    }, 500);
  }

  async function initPlayer(options) {
    options = options || {};
    try {
      await ensureAuth();
      playerState.statusEl = options.statusEl || null;
      playerState.onPublic = options.onPublic || null;
      playerState.onPrivate = options.onPrivate || null;
      playerState.onError = options.onError || null;

      onConnectedChanged(function (isConnected) {
        setPlayerStatus(isConnected ? 'Связь есть' : 'Нет связи', isConnected);
      });

      var url = new URL(window.location.href);
      var roomId = (url.searchParams.get('room') || localStorage.getItem(LS.ROOM) || '').trim().toUpperCase();
      var token = (url.searchParams.get('token') || localStorage.getItem(LS.TOKEN) || '').trim();

      if (!roomId || !token) {
        return { needsJoin: true };
      }

      var tokenHash = await sha256Hex(token);
      await claimPrivateNode(roomId, tokenHash);
      setupPlayerPresence(roomId, tokenHash);
      subscribePlayer(roomId, tokenHash, playerState.onPublic, playerState.onPrivate);
      startPlayerTimerTicker(options.onTimerTick || null);

      playerState.roomId = roomId;
      playerState.token = token;
      playerState.tokenHash = tokenHash;

      localStorage.setItem(LS.ROOM, roomId);
      localStorage.setItem(LS.TOKEN, token);

      return { needsJoin: false, roomId: roomId, tokenHash: tokenHash };
    } catch (e) {
      if (playerState.onError) playerState.onError(e);
      throw e;
    }
  }

  async function joinPlayer(roomId, token) {
    roomId = String(roomId || '').trim().toUpperCase();
    token = String(token || '').trim();
    if (!roomId || !token) throw new Error('Укажите RoomID и token');

    localStorage.setItem(LS.ROOM, roomId);
    localStorage.setItem(LS.TOKEN, token);
    return initPlayer({
      statusEl: playerState.statusEl,
      onPublic: playerState.onPublic,
      onPrivate: playerState.onPrivate,
      onError: playerState.onError
    });
  }

  async function updatePlayerRole(role) {
    if (!playerState.roomId || !playerState.tokenHash) throw new Error('Игрок не подключен к комнате');

    const ref = db.ref('rooms/' + playerState.roomId + '/privateByToken/' + playerState.tokenHash);
    await ref.update({
      role: role,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  }

  // ===== Гибридный авто-судья: settings, nightActions, dayProposals, dayVotes =====

  /**
   * Обновить ветку settings для комнаты (только хост).
   * @param {Object} settingsObj — объект с тумблерами: { autoPhaseShift, autoFouls, autoVoting, autoNight }
   */
  async function updateRoomSettings(settingsObj) {
    if (!hostState.roomId) throw new Error('Хост не подключён к комнате');
    var ref = db.ref('rooms/' + hostState.roomId + '/settings');
    await ref.update(settingsObj);
  }

  /**
   * Подписка на изменения settings.
   * Работает и для хоста, и для игрока — берёт roomId откуда доступно.
   * @param {Function} callback(settingsObj)
   * @returns {Function} unsubscribe
   */
  function listenToRoomSettings(callback) {
    var roomId = hostState.roomId || playerState.roomId;
    if (!roomId) throw new Error('Нет подключённой комнаты');
    var ref = db.ref('rooms/' + roomId + '/settings');
    var handler = function (snap) {
      if (callback) callback(snap.val() || {});
    };
    ref.on('value', handler);
    return function () { ref.off('value', handler); };
  }

  /**
   * Отправить ночное действие (игрок → Firebase).
   * @param {number|string} targetId — номер цели (1-10) или 0 для промаха
   * @param {string} actionType — 'mafiaShot' | 'sheriffCheck' | 'donCheck'
   */
  async function sendNightAction(targetId, actionType) {
    if (!playerState.roomId || !playerState.tokenHash) throw new Error('Игрок не подключен к комнате');
    var seat = Number(targetId);
    if (!Number.isFinite(seat) || seat < 0 || seat > 10) throw new Error('Некорректный номер цели');
    var validTypes = ['mafiaShot', 'sheriffCheck', 'donCheck'];
    if (validTypes.indexOf(actionType) === -1) throw new Error('Неизвестный тип ночного действия: ' + actionType);

    var ref = db.ref('rooms/' + playerState.roomId + '/nightActions/' + playerState.tokenHash);
    await ref.set({
      targetId: seat,
      actionType: actionType,
      seat: playerState.seat || null,
      ts: firebase.database.ServerValue.TIMESTAMP
    });
    return { targetId: seat, actionType: actionType };
  }

  /**
   * Отправить дневное предложение (выставить на голосование / голос за кандидата).
   * @param {string} actionType — 'nominate' | 'vote'
   * @param {number|string} targetId — номер цели
   */
  async function proposeDayAction(actionType, targetId) {
    if (!playerState.roomId || !playerState.tokenHash) throw new Error('Игрок не подключен к комнате');
    var seat = Number(targetId);
    if (!Number.isFinite(seat) || seat < 1 || seat > 10) throw new Error('Некорректный номер цели');
    var validTypes = ['nominate', 'vote'];
    if (validTypes.indexOf(actionType) === -1) throw new Error('Неизвестный тип дневного действия: ' + actionType);

    if (actionType === 'nominate') {
      // Используем существующий механизм номинаций
      return nominatePlayer(seat);
    }

    // Голос за кандидата (dayVotes)
    var ref = db.ref('rooms/' + playerState.roomId + '/dayVotes/' + playerState.tokenHash);
    await ref.set({
      targetId: seat,
      seat: playerState.seat || null,
      ts: firebase.database.ServerValue.TIMESTAMP
    });
    return { actionType: actionType, targetId: seat };
  }

  /**
   * Подписка на dayVotes (для автосудьи в judge.html).
   * @param {Function} callback(votesMap) — вызывается при изменении
   * @returns {Function} unsubscribe
   */
  function listenToDayVotes(callback) {
    var roomId = hostState.roomId || playerState.roomId;
    if (!roomId) throw new Error('Нет подключённой комнаты');
    var ref = db.ref('rooms/' + roomId + '/dayVotes');
    var handler = function (snap) {
      if (callback) callback(snap.val() || {});
    };
    ref.on('value', handler);
    return function () { ref.off('value', handler); };
  }

  /**
   * Подписка на nightActions (для автосудьи в judge.html).
   * @param {Function} callback(actionsMap)
   * @returns {Function} unsubscribe
   */
  function listenToNightActions(callback) {
    var roomId = hostState.roomId || playerState.roomId;
    if (!roomId) throw new Error('Нет подключённой комнаты');
    var ref = db.ref('rooms/' + roomId + '/nightActions');
    var handler = function (snap) {
      if (callback) callback(snap.val() || {});
    };
    ref.on('value', handler);
    return function () { ref.off('value', handler); };
  }

  /**
   * Очистить nightActions (автосудья вызывает после обработки ночи).
   */
  async function clearNightActions() {
    var roomId = hostState.roomId;
    if (!roomId) return;
    await db.ref('rooms/' + roomId + '/nightActions').remove();
  }

  /**
   * Очистить dayVotes (автосудья вызывает после обработки голосования).
   */
  async function clearDayVotes() {
    var roomId = hostState.roomId;
    if (!roomId) return;
    await db.ref('rooms/' + roomId + '/dayVotes').remove();
  }

  /**
   * Получить tokenHash → seat маппинг (для автосудьи).
   */
  function getTokenHashToSeatMap() {
    var map = {};
    Object.keys(hostState.tokenHashBySeat).forEach(function (seatStr) {
      map[hostState.tokenHashBySeat[seatStr]] = Number(seatStr);
    });
    return map;
  }

  window.SportMafiaSync = {
    initHost: initHost,
    hostCreateRoom: hostCreateRoom,
    hostSyncStateSnapshot: hostSyncStateSnapshot,
    bindJudgeAutoSync: bindJudgeAutoSync,
    getRoomId: getRoomId,
    getLinks: getLinks,
    setQrSeat: setQrSeat,
    initPlayer: initPlayer,
    joinPlayer: joinPlayer,
    updatePlayerRole: updatePlayerRole,
    proposeFoulVote: proposeFoulVote,
    castVote: castVote,
    listenToFoulVotes: listenToFoulVotes,
    skipSpeech: skipSpeech,
    listenToTableEvents: listenToTableEvents,
    nominatePlayer: nominatePlayer,
    listenToNominations: listenToNominations,
    computeTimerRemaining: computeTimerRemaining,
    sha256Hex: sha256Hex,
    pushToast: pushToast,
    // Гибридный авто-судья
    updateRoomSettings: updateRoomSettings,
    listenToRoomSettings: listenToRoomSettings,
    sendNightAction: sendNightAction,
    proposeDayAction: proposeDayAction,
    listenToDayVotes: listenToDayVotes,
    listenToNightActions: listenToNightActions,
    clearNightActions: clearNightActions,
    clearDayVotes: clearDayVotes,
    getTokenHashToSeatMap: getTokenHashToSeatMap
  };
})();
