let fields = [
    null, null, null,
    null, null, null,
    null, null, null,
];

let currentPlayer = 'circle';
let gameOver = false;
let gameMode = null;

function init() {
    render();
}

function startGame(mode) {
    gameMode = mode;
    document.getElementById('mode-selection').classList.add('display-none');
    document.getElementById('content').style.display = 'inline-block';
    init();
}

function render() {
    let html = `
        <div style="position: relative; display: inline-block;">
            <table id="board">
    `;

    for (let row = 0; row < 3; row++) {
        html += '<tr>';
        for (let col = 0; col < 3; col++) {
            let index = row * 3 + col;
            let cell = fields[index];
            let symbol = '';
            if (cell === 'circle') symbol = generateCircleSVG();
            if (cell === 'cross') symbol = generateCrossSVG();
            let clickHandler = cell === null && !gameOver ? `onclick="handleClick(${index}, this)"` : '';
            html += `<td ${clickHandler}>${symbol}</td>`;
        }
        html += '</tr>';
    }

    html += `
            </table>
            <svg id="winning-line" width="100%" height="100%" 
                 style="position:absolute; top:0; left:0; pointer-events:none;"></svg>
        </div>
    `;

    document.getElementById('content').innerHTML = html;
}


function handleClick(index, tdElement) {
    if (gameOver || fields[index] !== null) return;

    fields[index] = currentPlayer;

    if (currentPlayer === 'circle') {
        tdElement.innerHTML = generateCircleSVG();
    } else {
        tdElement.innerHTML = generateCrossSVG();
    }

    tdElement.onclick = null;

    let winnerCombo = checkWinner();
    if (winnerCombo) {
        gameOver = true;
        drawWinningLine(winnerCombo);
        return;
    }

    if (gameMode === 'solo') {
        currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle';
    } else if (gameMode === 'computer') {
        currentPlayer = 'cross';
        setTimeout(computerMove, 500);
        return;
    }

    checkDraw();
}

function checkWinner() {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (fields[a] && fields[a] === fields[b] && fields[a] === fields[c]) {
            return combo;
        }
    }
    return null;
}

function computerMove() {
    if (gameOver) return;

    const emptyIndices = fields.map((f, i) => f === null ? i : null).filter(i => i !== null);
    if (emptyIndices.length === 0) return;

    const moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const tdElement = document.querySelectorAll('#board td')[moveIndex];

    fields[moveIndex] = 'cross';
    tdElement.innerHTML = generateCrossSVG();
    tdElement.onclick = null;

    let winnerCombo = checkWinner();
    if (winnerCombo) {
        gameOver = true;
        drawWinningLine(winnerCombo);
        return;
    }

    currentPlayer = 'circle';
    checkDraw();
}



function checkDraw() {
    const allFilled = fields.every(field => field !== null);
    const winnerExists = checkWinner();

    if (allFilled && !winnerExists) {
        document.getElementById("restart-Button").classList.remove("display-none");
        gameOver = true;
    }
}


function drawWinningLine(combo) {
    const board = document.getElementById('board');
    const svg = document.getElementById('winning-line');
    const rect = board.getBoundingClientRect();

    const cellSize = rect.width / 3;
    const half = cellSize / 2;

    const [startIdx, , endIdx] = combo;
    const startRow = Math.floor(startIdx / 3);
    const startCol = startIdx % 3;
    const endRow = Math.floor(endIdx / 3);
    const endCol = endIdx % 3;

    const x1 = startCol * cellSize + half;
    const y1 = startRow * cellSize + half;
    const x2 = endCol * cellSize + half;
    const y2 = endRow * cellSize + half;

    svg.innerHTML = `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
              stroke="white" stroke-width="8" stroke-linecap="round" />
    `;

    document.getElementById("restart-Button").classList.remove("display-none");
}

function generateCircleSVG({ size = 70, color = '#00B0EF', strokeWidth = 6, duration = 800 } = {}) {
    const r = (size / 2) - (strokeWidth / 2);
    const c = 2 * Math.PI * r;

    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Kreis">
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${r}"
    fill="none"
    stroke="${color}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="${c}"
    stroke-dashoffset="${c}">
    <animate attributeName="stroke-dashoffset" from="${c}" to="0" dur="${duration}ms" fill="freeze" />
  </circle>
</svg>`;
}

function generateCrossSVG({ size = 70, color = '#FFC000', strokeWidth = 6, duration = 400 } = {}) {
    const lineLength = Math.sqrt(2) * size;

    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Kreuz">
  <line 
    x1="10" y1="10" 
    x2="${size - 10}" y2="${size - 10}"
    stroke="${color}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="${lineLength}"
    stroke-dashoffset="${lineLength}">
    <animate attributeName="stroke-dashoffset" from="${lineLength}" to="0" dur="${duration}ms" fill="freeze" />
  </line>

  <line 
    x1="${size - 10}" y1="10" 
    x2="10" y2="${size - 10}"
    stroke="${color}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-dasharray="${lineLength}"
    stroke-dashoffset="${lineLength}">
    <animate attributeName="stroke-dashoffset" from="${lineLength}" to="0" dur="${duration}ms" fill="freeze" begin="${duration}ms" />
  </line>
</svg>`;
}

function restartGame() {
    fields = Array(9).fill(null);
    currentPlayer = 'circle';
    gameOver = false;
    document.getElementById('winning-line').innerHTML = '';
    document.getElementById("restart-Button").classList.add("display-none");
    document.getElementById('content').style.display = 'none';
    document.getElementById('mode-selection').classList.remove('display-none');
    render();
}
