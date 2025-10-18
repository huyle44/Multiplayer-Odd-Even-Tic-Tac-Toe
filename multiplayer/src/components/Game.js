import { useEffect, useRef, useState } from "react";
import Board from "./Board";
import "./Game.css";

const WS_URL = "ws://localhost:8000";

function Game() {
    const wsRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [statusText, setStatusText] = useState("Connecting...");
    const [player, setPlayer] = useState(null);
    const [board, setBoard] = useState(Array(25).fill(0));
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            setStatusText("Connected. Waiting for assignment...");
        };

        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);

            switch (msg.type) {
                case 'PLAYER_ASSIGNED':
                    setPlayer(msg.player);
                    setBoard(msg.board);
                    setStatusText(msg.status === "READY" ? `You are ${msg.player}. Game will start now.` : `You are ${msg.player}. Waiting for opponent...`);
                    break;
                case "CONNECTION_STATUS":
                    if (!msg.connected?.ODD || !msg.connected?.EVEN) {
                        setGameStarted(false);
                        setStatusText("Waiting for opponent...");
                    }
                    break;
                case "GAME_STATUS":
                    if (msg.status === "STARTED") {
                        setGameStarted(true);
                        setWinner(null);
                        setWinningLine(null);
                        setStatusText("Game started.");
                    }
                    break;
                case "UPDATE":
                    setBoard((prev) => {
                        const next = prev.slice();
                        next[msg.square] = msg.value;
                        return next;
                    });
                    break;
                case "GAME_OVER":
                    setWinner(msg.winner);
                    setWinningLine(msg.winningLine || null);
                    setGameStarted(false);
                    setStatusText(
                        msg.winner === "DRAW" ? "Game over: Draw." : `Game over: ${msg.winner} wins.`
                    );
                    break;
                case "OPPONENT_DISCONNECTED":
                    setGameStarted(false);
                    setStatusText("Opponent disconnected. Game ended.");
                    break;
                case "ERROR":
                    setStatusText(`Error: ${msg.message || msg.code}`);
                    break;
                default:
                    break;
            }
        };

        ws.onclose = () => {
            setConnected(false);
            setStatusText("Disconnected.");
        };

        return () => ws.close();

    }, []);

    const canPlay = connected && gameStarted && !winner;

    function handleSquareClick(idx) {
        if (!canPlay || !wsRef.current) return;
        if (wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: "INCREMENT", square: idx }));
    }

    return (
        <div className="game-app">
            <h1 className="game-title">Odd/Even Tic-Tac-Toe (5×5)</h1>

            <div className="game-status-bar">
                <span>Status: <b>{statusText}</b></span>
                <span>
                    Connection:{" "}
                    <b className={connected ? "status-connected" : "status-disconnected"}>
                        {connected ? "Connected" : "Disconnected"}
                    </b>
                </span>
                <span>You are: <b>{player ?? "—"}</b></span>
            </div>

            <Board board={board} winningLine={winningLine} onClick={handleSquareClick} />

            {winner && (
                <div className="game-over">
                    {winner === "DRAW" ? "It's a draw." : `${winner} wins.`}
                    <div className="game-over-subtitle">Refresh to start a new round.</div>
                </div>
            )}

            {!winner && !gameStarted && (
                <div className="game-helper">
                    Waiting room: game starts when both players connect.
                </div>
            )}
        </div>
    );
}

export default Game;