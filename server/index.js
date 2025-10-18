const WebSocket = require('ws');

const PORT = 8000;
const BOARD_N = 5;
const BOARD_LEN = BOARD_N * BOARD_N;

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WS server running on ws://localhost:${PORT}`);
});

let board = Array(BOARD_LEN).fill(0);
let players = { ODD: null, EVEN: null };
let gameActive = false;

// Helpers 
function assignRole() {
  if (!players.ODD) return 'ODD';
  if (!players.EVEN) return 'EVEN';
  return null;
}
function bothPlayersConnected() {
  return !!players.ODD && !!players.EVEN;
}
function roleOf(ws) {
  return ws?.role || null;
}
function safeSend(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}
function broadcast(msgObj) {
  const msg = JSON.stringify(msgObj);
  [players.ODD, players.EVEN].forEach(s => {
    if (s && s.readyState === WebSocket.OPEN) s.send(msg);
  });
}
function softResetAfterDisconnect(disconnectedRole) {
  board = Array(BOARD_LEN).fill(0);
  gameActive = false;
  if (disconnectedRole) players[disconnectedRole] = null;
}

// Winning lines
const LINES = (() => {
  const lines = [];
  // rows
  for (let r = 0; r < BOARD_N; ++r) {
    lines.push([...Array(BOARD_N)].map((_, c) => r * BOARD_N + c));
  }
  // cols  
  for (let c = 0; c < BOARD_N; ++c) {
    lines.push([...Array(BOARD_N)].map((_, r) => r * BOARD_N + c));
  }
  // diags
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
})();


function checkWinAfterMove(board, lastIdx) {
  const linesToCheck = LINES.filter(line => line.includes(lastIdx));
  for (const line of linesToCheck) {
    const vals = line.map(i => board[i]);
    const allOdd = vals.every(v => v % 2 === 1);
    const allEvenPos = vals.every(v => v % 2 === 0 && v > 0);
    if (allOdd) return { winner: 'ODD', line };
    if (allEvenPos) return { winner: 'EVEN', line };
  }
  return null;
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  const role = assignRole();
  if (!role) {
    safeSend(ws, { type: 'ERROR', code: 'ROOM_FULL', message: 'Two players already connected.' });
    ws.close();
    return;
  }

  ws.role = role;
  players[role] = ws;

  // Gán vai trò + state hiện tại cho người mới vào
  safeSend(ws, {
    type: 'PLAYER_ASSIGNED',
    player: role,
    board,
    status: bothPlayersConnected() ? 'READY' : 'WAITING'
  });

  // Báo trạng thái kết nối cho cả phòng
  broadcast({
    type: 'CONNECTION_STATUS',
    connected: { ODD: !!players.ODD, EVEN: !!players.EVEN }
  });

  // Bắt đầu game khi đủ 2 người
  if (bothPlayersConnected() && !gameActive) {
    gameActive = true;
    broadcast({ type: 'GAME_STATUS', status: 'STARTED' });
  }

  // Nhận message từ client
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg?.type === 'INCREMENT') {
      if (!gameActive || !bothPlayersConnected()) return;

      const idx = msg.square;
      if (typeof idx !== 'number' || idx < 0 || idx >= BOARD_LEN) return;

      // Server-authoritative: áp dụng +1 rồi broadcast
      board[idx] += 1;
      broadcast({ type: 'UPDATE', square: idx, value: board[idx] });

      // Kiểm tra thắng (tối ưu theo ô vừa bấm)
      const res = checkWinAfterMove(board, idx);
      if (res) {
        gameActive = false;
        broadcast({
          type: 'GAME_OVER',
          winner: res.winner,
          winningLine: res.line
        });
      }
    }
  });

  // Client rời
  ws.on('close', () => {
    const r = roleOf(ws);
    if (r && players[r] === ws) {
      broadcast({ type: 'OPPONENT_DISCONNECTED' });
      softResetAfterDisconnect(r);
    }
    console.log('Client disconnected:', r || 'unknown');
  });
});
