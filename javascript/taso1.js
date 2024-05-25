const wordsToChooseFrom = ['HELSINKI', 'TAMPERE', 'JYVÄSKYLÄ', 'OULU', 'KEURUU', 'LAHTI', 'JÄMSÄ', 'ROVANIEMI', 'SEINÄJOKI', 'ÄÄNEKOSKI', 'PORI', 'VANTAA', 'VARKAUS', 'MIKKELI', 'KUOPIO', 'JOENSUU', 'TURKU', 'VAAJAKOSKI', 'MUURAME', 'KORPILAHTI'];
let wordsToUse = [];
for(let i = 0; i < wordsToChooseFrom.length; i++) {
    wordsToUse.push(wordsToChooseFrom[i]);
}
let remainingWords;
let currentDifficulty = 'round1';
let isHelpScreenVisible = true;
let wordItemList = [];


const difficulties = {
    round1: {
        rows: 8,
        columns: 8,
        wordAmount: 4
    },
    round2: {
        rows: 8,
        columns: 8,
        wordAmount: 4
    },
    round3: {
        rows: 8,
        columns: 8,
        wordAmount: 4
    },
    round4: {
        rows: 8,
        columns: 8,
        wordAmount: 4
    },
    round5: {
        rows: 8,
        columns: 8,
        wordAmount: 0
    },
};

const cityImages = {
    'HELSINKI': 'helsinki',
    'TAMPERE': 'tampere',
    'JYVÄSKYLÄ': 'jyvaskyla',
    'OULU': 'oulu',
    'KEURUU': 'keuruu',
    'LAHTI': 'lahti',
    'JÄMSÄ': 'jamsa',
    'ROVANIEMI': 'rovaniemi',
    'SEINÄJOKI': 'seinajoki',
    'ÄÄNEKOSKI': 'aanekoski',
    'PORI': 'pori',
    'VANTAA': 'vantaa',
    'VARKAUS': 'varkaus',
    'MIKKELI': 'mikkeli',
    'KUOPIO': 'kuopio',
    'JOENSUU': 'joensuu',
    'TURKU': 'turku',
    'VAAJAKOSKI': 'vaajakoski',
    'MUURAME': 'muurame',
    'KORPILAHTI': 'korpilahti'
};

const conflictingCities = {
    'JYVÄSKYLÄ': ['MUURAME', 'KORPILAHTI', 'KEURUU', 'VAAJAKOSKI'],
    'MUURAME': ['JYVÄSKYLÄ', 'KORPILAHTI', 'KEURUU', 'VAAJAKOSKI'],
    'KORPILAHTI': ['MUURAME', 'KEURUU', 'JYVÄSKYLÄ', 'JÄMSÄ', 'VAAJAKOSKI'],
    'KEURUU': ['KORPILAHTI', 'MUURAME', 'JYVÄSKYLÄ', 'VAAJAKOSKI'],
    'JÄMSÄ': ['KORPILAHTI'],
    'ÄÄNEKOSKI': ['KUOPIO'],
    'VAAJAKOSKI': ['MUURAME', 'JYVÄSKYLÄ', 'KUOPIO', 'KEURUU', 'VARKAUS', 'KORPILAHTI'],
    'KUOPIO': ['ÄÄNEKOSKI', 'VAAJAKOSKI'],
    'VARKAUS': ['VAAJAKOSKI']
};

const { rows, columns, wordAmount } = difficulties[currentDifficulty];
const emptyGrid = generateEmptyGrid(rows, columns);
const words_ = getRandomWords(wordAmount, Math.min(rows, columns));
const placedWordsCount = generateWords(emptyGrid, words_);
remainingWords = placedWordsCount;
displayGrid(emptyGrid, rows, columns);
document.getElementById('wordCount').textContent = `Sanoja löydetty: ${wordAmount - remainingWords}/${wordAmount}`;

addToWordList(wordItemList);

const container = document.getElementById('animation-test');
const images = container.getElementsByTagName('img');

function toggleHelpScreen() {
    const helpScreen = document.getElementById('helpScreen');
    const gridContainer = document.getElementById('grid-container')
    isHelpScreenVisible = !isHelpScreenVisible;
    helpScreen.style.display = isHelpScreenVisible ? 'block' : 'none';
    gridContainer.style.display = !isHelpScreenVisible ? 'block' : 'none';
    addToWordList(wordItemList);
}

function addToWordList(wordList) {
    const allCityImages = document.getElementsByClassName('city');
    for (let i = 0; i < allCityImages.length; i++) {
        allCityImages[i].style.display = 'none';
    }

    for (const word of wordList) {
        const cityId = cityImages[word.toUpperCase()];
        if (cityId) {
            const cityImage = document.getElementById(cityId);
            if (cityImage) {
                cityImage.style.display = 'inline';
            }
        }
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
        if(currentDifficulty == 'round5') {
            window.location.replace('end.html');
            return;
        }
        if(isHelpScreenVisible) {
            toggleWordList();
        }
        triggerAnimation();
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
    for (let i = 0; i < images.length; i++) {
        images[i].classList.add('fadeInAnimation');
    }
    const nextDifficultyScreen = document.getElementById('nextDifficultyScreen');
    nextDifficultyScreen.style.display = 'block';
    nextDifficultyScreen.style.pointerEvents = 'all';
    setTimeout(() => {
        nextDifficultyScreen.classList.add('show');
    }, 2400); 
}

function triggerAnimation() {
    const images = document.querySelectorAll('#animation-test img');
    images.forEach((img, index) => {
        img.classList.add(`animate${index + 1}`);
    });
}

function resetAnimation() {
    const images = document.querySelectorAll('#animation-test img');
    images.forEach((img, index) => {
        img.classList.remove(`animate${index + 1}`);
        void img.offsetWidth;
    });
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
document.addEventListener('DOMContentLoaded', (event) => {
    updateBackground(currentDifficulty); 
});

function updateBackground() {
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.classList.remove('round1-bg', 'round2-bg', 'round3-bg', 'round4-bg', 'round5-bg');
    if (currentDifficulty === 'round1') {
      gameScreen.classList.add('round1-bg');
    } else if (currentDifficulty === 'round2') {
      gameScreen.classList.add('round2-bg');
    } else if (currentDifficulty === 'round3') {
      gameScreen.classList.add('round3-bg');
    } else if (currentDifficulty === 'round4') {
      gameScreen.classList.add('round4-bg');
    } else if (currentDifficulty === 'round5') {
      gameScreen.classList.add('round5-bg');
    }
  }
function moveToNextDifficulty() {
    if(currentDifficulty === 'round1') {
        currentDifficulty = 'round2';
    } else if(currentDifficulty === 'round2') {
        currentDifficulty = 'round3';
    }else if(currentDifficulty === 'round3') {
        currentDifficulty = 'round4';
    }
    else if(currentDifficulty === 'round4') {
        currentDifficulty = 'round5';
    }
    updateBackground(currentDifficulty);
}

function resetGame() {
    resetAnimation();
    document.getElementById('gameScreen').style.display = 'flex';
    const nextDifficultyScreen = document.getElementById('nextDifficultyScreen');
    nextDifficultyScreen.classList.remove('show');
    nextDifficultyScreen.style.display = 'none';
    moveToNextDifficulty();
    const { rows, columns, wordAmount } = difficulties[currentDifficulty];
    wordsToUse = [];
    wordItemList = [];
    for (let i = 0; i < wordsToChooseFrom.length; i++) {
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
    toggleHelpScreen();
}

function getRandomWords(wordAmount, maxCharacterAmount) {
    const filteredWords = filterWordsByMaxCharacterAmount(wordsToUse, maxCharacterAmount);
    const wordsToChooseFromShuffled = shuffleArray(filteredWords);
    const selectedWords = [];
    const usedWords = new Set();

    for (let word of wordsToChooseFromShuffled) {
        if (selectedWords.length >= wordAmount) break;
        if (!usedWords.has(word) && canSelectWord(word, usedWords)) {
            selectedWords.push(word);
            usedWords.add(word);
            if (conflictingCities[word]) {
                conflictingCities[word].forEach(conflict => usedWords.add(conflict));
            }
        }
    }
    return selectedWords;
}

function canSelectWord(word, usedWords) {
    if (conflictingCities[word]) {
        for (let conflict of conflictingCities[word]) {
            if (usedWords.has(conflict)) {
                return false;
            }
        }
    }
    return true;
}