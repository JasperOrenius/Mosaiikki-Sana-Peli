const wordsToChooseFrom = ['HELSINKI', 'TAMPERE', 'JYVÄSKYLÄ', 'OULU', 'KEURUU', 'LAHTI', 'JÄMSÄ', 'ROVANIEMI', 'SEINÄJOKI', 'ÄÄNEKOSKI', 'PORI', 'VANTAA', 'VARKAUS', 'MIKKELI', 'KUOPIO', 'JOENSUU', 'TURKU', 'VAAJAKOSKI', 'MUURAME', 'KORPILAHTI'];
let wordsToUse = [];
for(let i = 0; i < wordsToChooseFrom.length; i++) {
    wordsToUse.push(wordsToChooseFrom[i]);
}
let remainingWords;
let currentDifficulty = 'easy';
let isWordListVisible = false;
let wordItemList = [];

const difficulties = {
    easy: {
        rows: 6,
        columns: 6,
        wordAmount: 2
    },
    normal: {
        rows: 8,
        columns: 8,
        wordAmount: 4
    },
    hard: {
        rows: 10,
        columns: 10,
        wordAmount: 6
    },

};
    
const { rows, columns, wordAmount } = difficulties[currentDifficulty];
const emptyGrid = generateEmptyGrid(rows, columns);
const words_ = getRandomWords(wordAmount, Math.min(rows, columns));
const placedWordsCount = generateWords(emptyGrid, words_);
remainingWords = placedWordsCount;
displayGrid(emptyGrid, rows, columns);
document.getElementById('wordCount').textContent = `Sanoja löydetty: ${wordAmount - remainingWords}/${wordAmount}`;

function toggleWordList() {
    const wordList = document.getElementById('wordList');
    isWordListVisible = !isWordListVisible;
    wordList.style.display = isWordListVisible ? 'block' : 'none';
    addToWordList(wordItemList);
}

function addToWordList(wordList) {
    const wordListItems = document.getElementById('wordListItems');
    wordListItems.innerHTML = '';
    for(let i = 0; i < wordList.length; i++) {
        const li = document.createElement('li');
        li.textContent = wordList[i];
        wordListItems.appendChild(li);
    }
}

function getRandomCharacter() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZOÄÖ';
    return characters.charAt(Math.floor(Math.random() * characters.length));
}

function generateEmptyGrid(rows, columns) {
    const grid = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
            row.push('');
        }
        grid.push(row);
    }
    return grid;
}

function generateWords(grid, words) {
    const { rows, columns, wordAmount } = difficulties[currentDifficulty];
    let placedWordsCount = 0;
    const shuffledWords = shuffleArray(words);
    const filteredWords = filterWordsByMaxCharacterAmount(shuffledWords, Math.min(rows, columns));
    for(let j = 0; j < filteredWords.length; j++) {
        wordItemList.push(filteredWords[j]);
    }
    for (let i = 0; i < wordAmount && i < filteredWords.length; i++) {
        const word = filteredWords[i];
        let placed = false;
        while (!placed) {
            const direction = Math.random() < 0.5 ? 'vertical' : 'horizontal';
            const length = word.length;
            let startRow, startCol;
            if (direction === 'vertical') {
                startRow = Math.floor(Math.random() * (rows - length + 1));
                startCol = Math.floor(Math.random() * columns);
            } else {
                startRow = Math.floor(Math.random() * rows);
                startCol = Math.floor(Math.random() * (columns - length + 1));
            }
            if (checkOverlap(grid, word, startRow, startCol, length, direction)) {
                if (direction === 'vertical') {
                    for (let j = 0; j < length; j++) {
                        grid[startRow + j][startCol] = word[j];
                    }
                } else {
                    for (let j = 0; j < length; j++) {
                        grid[startRow][startCol + j] = word[j];
                    }
                }
                placed = true;
                placedWordsCount++;
            }
        }
    }
    return placedWordsCount;
}

function checkOverlap(grid, word, startRow, startCol, length, direction) {
    if (direction === 'vertical') {
        for (let i = 0; i < length; i++) {
            if (grid[startRow + i][startCol] !== '' && grid[startRow + i][startCol] !== word[i]) {
                return false;
            }
        }
    } else {
        for (let i = 0; i < length; i++) {
            if (grid[startRow][startCol + i] !== '' && grid[startRow][startCol + i] !== word[i]) {
                return false;
            }
        }
    }
    return true;
}

function displayGrid(grid, rows, columns) {
    const table = document.getElementById('grid');
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < columns; j++) {
            const cell = document.createElement('td');
            cell.textContent = grid[i][j] || getRandomCharacter();
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

let selectedCells = [];

let isDragging = false;
let startCell = null;
let endCell = null;

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleTouchEnd);

function handleMouseDown(event) {
    isDragging = true;
    startCell = getCellFromEvent(event);
}

function handleMouseMove(event) {
    if (isDragging) {
        const cell = getCellFromEvent(event);
        if (cell) {
            endCell = cell;
            highlightCells(startCell, endCell);
        }
    }
}

function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        if (startCell && endCell) {
            checkWord(startCell, endCell);
        }
        resetSelection();
    }
}

function handleTouchStart(event) {
    const touch = event.touches[0];
    startCell = getCellFromTouchEvent(touch);
}

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    endCell = getCellFromTouchEvent(touch);
    highlightCells(startCell, endCell);
}

function handleTouchEnd(event) {
    if (startCell && endCell) {
        checkWord(startCell, endCell);
    }
    resetSelection();
}

function getCellFromEvent(event) {
    const target = event.target;
    if (target.tagName === 'TD') {
        const row = target.parentNode.rowIndex;
        const col = target.cellIndex;
        return { row, col };
    }
    return null;
}

function getCellFromTouchEvent(touch) {
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target.tagName === 'TD') {
        const row = target.parentNode.rowIndex;
        const col = target.cellIndex;
        return { row, col };
    }
    return null;
}

function highlightCells(startCell, endCell) {
    resetHighlight();
    const grid = document.getElementById('grid');
    const minRow = Math.min(startCell.row, endCell.row);
    const maxRow = Math.max(startCell.row, endCell.row);
    const minCol = Math.min(startCell.col, endCell.col);
     const maxCol = Math.max(startCell.col, endCell.col);
    for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
            const cell = grid.rows[i].cells[j];
            cell.classList.add('highlighted');
        }
    }
}

function checkWord(startCell, endCell) {
    const grid = document.getElementById('grid');
    const minRow = Math.min(startCell.row, endCell.row);
    const maxRow = Math.max(startCell.row, endCell.row);
    const minCol = Math.min(startCell.col, endCell.col);
    const maxCol = Math.max(startCell.col, endCell.col);
    let word = '';
    for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
            const cell = grid.rows[i].cells[j];
            word += cell.textContent;
        }
    }
    if (wordsToUse.includes(word)) {
        wordsToUse.splice(wordsToUse.indexOf(word), 1)
        remainingWords--;
        const { wordAmount } = difficulties[currentDifficulty];
        document.getElementById('wordCount').textContent = `Sanoja löydetty: ${wordAmount - remainingWords}/${wordAmount}`;
        highlightFoundWords(minRow, minCol, maxRow, maxCol);
    }
    if(remainingWords === 0) {
        if(currentDifficulty == 'hard') {
            window.location.replace('end.html');
            return;
        }
        if(isWordListVisible) {
            toggleWordList();
        }
        showNextDifficultyScreen();
    }
}

function highlightFoundWords(startRow, startCol, endRow, endCol) {
    const grid = document.getElementById('grid');
    for(let i = startRow; i <= endRow; i++) {
        for(let j = startCol; j <= endCol; j++) {
            const cell = grid.rows[i].cells[j];
            cell.style.backgroundColor = 'lightgreen';
        }
    }
}

function showNextDifficultyScreen() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('nextDifficultyScreen').style.display = 'block';
        
}

function resetSelection() {
    startCell = null;
    endCell = null;
    resetHighlight();
}

function resetHighlight() {
    const highlightedCells = document.querySelectorAll('.highlighted');
    highlightedCells.forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

function filterWordsByMaxCharacterAmount(array, maxCharacterAmount) {
    const filteredWords = [];
    for(let i = 0; i < array.length; i++) {
        if(array[i].length <= maxCharacterAmount) {
            filteredWords.push(array[i]);
        }
    }
    return filteredWords;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function moveToNextDifficulty() {
    if(currentDifficulty === 'easy') {
        currentDifficulty = 'normal';
    } else if(currentDifficulty === 'normal') {
        currentDifficulty = 'hard';
    }
}

function resetGame() {
    document.getElementById('gameScreen').style.display = 'flex';
    document.getElementById('nextDifficultyScreen').style.display = 'none';
    moveToNextDifficulty();
    const { rows, columns, wordAmount} = difficulties[currentDifficulty];
    wordsToUse = [];
    wordItemList = [];
    for(let i = 0; i < wordsToChooseFrom.length; i++) {
        wordsToUse.push(wordsToChooseFrom[i]);
    }
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    remainingWords = wordAmount;
    const words = getRandomWords(wordAmount, Math.min(rows, columns));
    const emptyGrid = generateEmptyGrid(rows, columns);
    generateWords(emptyGrid, words);
    displayGrid(emptyGrid, rows, columns);
    document.getElementById('wordCount').textContent = `Sanoja löydetty: ${wordAmount - remainingWords}/${wordAmount}`;
}

function getRandomWords(wordAmount, maxCharacterAmount) {
    const filteredWords = filterWordsByMaxCharacterAmount(wordsToUse, maxCharacterAmount);
    const wordsToChooseFromShuffled = shuffleArray(filteredWords);
    return wordsToChooseFromShuffled.slice(0, wordAmount);
}
