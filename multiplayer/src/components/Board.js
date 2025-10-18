// import "./Board.css"

// export default function Board({ board, winningLine, onClick }) {
//     return (
//         <div className="board-grid">
//             {board.map((val, i) => {
//                 const isOdd = val % 2 === 1;
//                 const isWinning = winningLine?.includes(i);
                
//                 const cellClasses = [
//                     'board-cell',
//                     isOdd ? 'odd' : 'even',
//                     isWinning ? 'winning' : ''
//                 ].filter(Boolean).join(' ');
                
//                 return (
//                     <button
//                         key={i}
//                         onClick={() => onClick(i)}
//                         disabled={!!winningLine}
//                         className={cellClasses}
//                     >
//                         <span className="board-cell-value">{val}</span>
//                     </button>
//                 );
//             })}
//         </div>
//     );
// }

import './Board.css';

export default function Board({ board, winningLine, onClick }) {
    return (
        <div className="board-grid">
            {board.map((val, i) => {
                const isOdd = val % 2 === 1;
                const isZero = val === 0;
                const isWinning = winningLine?.includes(i);
                
                const cellClasses = [
                    'board-cell',
                    isZero ? 'zero' : (isOdd ? 'odd' : 'even'),
                    isWinning ? 'winning' : ''
                ].filter(Boolean).join(' ');
                
                return (
                    <button
                        key={i}
                        onClick={() => onClick(i)}
                        disabled={!!winningLine}
                        className={cellClasses}
                    >
                        <span className="board-cell-value">{val}</span>
                    </button>
                );
            })}
        </div>
    );
}
