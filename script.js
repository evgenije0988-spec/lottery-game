// Глобальные переменные
let selectedNumbers = [];
let gameState = {
  isGameActive: false,
  winningNumbers: [],
  results: [],
  players: [] // Сохраняем информацию об игроках между раундами
};

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
  initializeGame();
  setupEventListeners();
});

function initializeGame() {
  resetGameState();
  showNumberSelection();
  createNumberGrid();
}

function setupEventListeners() {
  document.getElementById('startGameBtn').addEventListener('click', startGame);
  document.getElementById('resetBtn').addEventListener('click', fullReset);
  document.getElementById('confirmSelection').addEventListener('click', confirmSelection);
  document.getElementById('startLotteryBtn').addEventListener('click', startLottery);
}

function resetGameState() {
  selectedNumbers = [];
  gameState.winningNumbers = [];
  gameState.results = [];

  // Сбрасываем визуальные элементы
  document.querySelectorAll('.number-btn').forEach(btn => {
    btn.classList.remove('selected');
  });

  document.getElementById('ballsContainer').innerHTML = '';
  document.getElementById('result').innerHTML = '';
}

function showNumberSelection() {
  document.getElementById('numberSelection').style.display = 'block';
  document.getElementById('playersContainer').style.display = 'none';
  document.getElementById('startLotteryBtn').style.display = 'none';
  document.getElementById('ballsContainer').style.display = 'none';
}

// Создание сетки чисел 1–36
function createNumberGrid() {
  const numberGrid = document.getElementById('numberGrid');
  numberGrid.innerHTML = '';

  for (let i = 1; i <= 36; i++) {
    const btn = document.createElement('button');
    btn.className = 'number-btn';
    btn.textContent = i;
    btn.addEventListener('click', () => selectNumber(i, btn));
    numberGrid.appendChild(btn);
  }
}

// Выбор числа игроком
function selectNumber(number, button) {
  if (selectedNumbers.includes(number)) {
    selectedNumbers = selectedNumbers.filter(num => num !== number);
    button.classList.remove('selected');
  } else if (selectedNumbers.length < 6) {
    selectedNumbers.push(number);
    button.classList.add('selected');
  }
}

// Подтверждение выбора чисел
function confirmSelection() {
  if (selectedNumbers.length !== 6) {
    alert('Пожалуйста, выберите ровно 6 чисел!');
    return;
  }
  console.log('Выбранные числа:', selectedNumbers);

  document.getElementById('numberSelection').style.display = 'none';
  document.getElementById('playersContainer').style.display = 'block';
}

// Начало игры (вызывается только один раз)
function startGame() {
  const participantsCount = parseInt(document.getElementById('participantsCount').value);
  const playersContainer = document.getElementById('playersContainer');
  playersContainer.innerHTML = '';

  for (let i = 1; i <= participantsCount; i++) {
    const playerName = i === 1 ? 'Игрок 1' : `Компьютер ${i}`;
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    playerCard.innerHTML = `
      <div class="player-name">${playerName}</div>
      <div class="player-balance">Баланс: 1000 руб.</div>
      <input type="number" class="bet-input" min="10" max="100" value="10">
      <button class="confirm-bet-btn">Подтвердить ставку</button>
    `;
    playersContainer.appendChild(playerCard);
  }

  // Сохраняем информацию об игроках
  gameState.players = Array.from(document.querySelectorAll('.player-card'));

  // Добавляем обработчики для кнопок подтверждения ставок
  document.querySelectorAll('.confirm-bet-btn').forEach(btn => {
    btn.addEventListener('click', handleBetConfirmation);
  });
}

// Обработка подтверждения ставки
function handleBetConfirmation(event) {
  const playerCard = event.target.closest('.player-card');
  const betInput = playerCard.querySelector('.bet-input');
  const balanceDiv = playerCard.querySelector('.player-balance');

  const bet = parseInt(betInput.value);
  let currentBalance = parseInt(balanceDiv.textContent.replace('Баланс: ', '').replace(' руб.', ''));

  // Проверяем валидность ставки
  if (bet < 10 || bet > 100 || bet > currentBalance) {
    alert('Некорректная ставка! Минимум 10, максимум 100 или весь баланс.');
    return;
  }

  // Скрываем поле ввода и кнопку после подтверждения
  betInput.style.display = 'none';
  event.target.style.display = 'none';

  // Обновляем баланс (вычитаем ставку)
  currentBalance -= bet;
  balanceDiv.textContent = `Баланс: ${currentBalance} руб.`;

  // Помечаем, что ставка подтверждена
  playerCard.dataset.betConfirmed = 'true';
  playerCard.dataset.betAmount = bet;

  // Проверяем, все ли игроки подтвердили ставки
  checkAllBetsConfirmed();
}

// Проверка, все ли ставки подтверждены
function checkAllBetsConfirmed() {
  const allPlayers = document.querySelectorAll('.player-card');
  const allConfirmed = Array.from(allPlayers).every(player =>
    player.dataset.betConfirmed === 'true'
  );

  if (allConfirmed) {
    document.getElementById('startLotteryBtn').style.display = 'block';
    document.getElementById('startLotteryBtn').classList.add('pulse');
  }
}

// Полный сброс игры (полная перезагрузка)
function fullReset() {
  location.reload();
}

// Запуск лотереи
function startLottery() {
  document.getElementById('startLotteryBtn').classList.remove('pulse');

  // Генерируем выигрышные числа (6 из 36)
  const winningNumbers = generateWinningNumbers();
  gameState.winningNumbers = winningNumbers;

  displayLotteryBalls(winningNumbers);

  // Рассчитываем результаты для игроков
  const results = calculateResults(winningNumbers);
  gameState.results = results;
  displayResults(results);
}

// Генерация выигрышных чисел
function generateWinningNumbers() {
  const numbers = Array.from({length: 36}, (_, i) => i + 1);
  return numbers
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .sort((a, b) => a - b);
}

// Отображение шаров
function displayLotteryBalls(numbers) {
  const ballsContainer = document.getElementById('ballsContainer');
  ballsContainer.innerHTML = '';
  ballsContainer.style.display = 'flex';

  numbers.forEach((num, index) => {
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.textContent = num;
    ballsContainer.appendChild(ball);

    setTimeout(() => {
      ball.classList.add('visible');
    }, 300 * index);
  });
}

// Расчёт результатов
function calculateResults(winningNumbers) {
  const players = document.querySelectorAll('.player-card');
  const results = [];

  players.forEach(player => {
    const name = player.querySelector('.player-name').textContent;
    let balance = parseInt(player.querySelector('.player-balance').textContent.replace('Баланс: ', '').replace(' руб.', ''));
    const bet = parseInt(player.dataset.betAmount) || 10;

    // Для игрока используем выбранные числа, для компьютеров — случайные
    let playerNumbers;
    if (name === 'Игрок 1') {
      playerNumbers = selectedNumbers;
    } else {
      // Имитация выбора чисел компьютером (случайные 6 из 36 без повторений)
      const tempNumbers = new Set();
      while (tempNumbers.size < 6) {
        tempNumbers.add(Math.floor(Math.random() * 36) + 1);
      }
      playerNumbers = Array.from(tempNumbers);
    }

    const matches = playerNumbers.filter(num => winningNumbers.includes(num)).length;
    let winnings = 0;

    switch (matches) {
          case 2:
      winnings = bet * 10;
      break;
    case 3:
      winnings = bet * 25;
      break;
    case 4:
      winnings = bet * 100;
      break;
    case 5:
      winnings = bet * 500;
      break;
    case 6:
      winnings = bet * 5000;
      break;
    default:
      winnings = 0;
  }

  results.push({
    name,
    matches,
    winnings,
    balance: balance + winnings
  });
});

// Обновляем балансы в интерфейсе
players.forEach((player, index) => {
  const balanceDiv = player.querySelector('.player-balance');
  if (balanceDiv) {
    balanceDiv.textContent = `Баланс: ${results[index].balance} руб.`;
  }
});

return results;
}

// Отображение результатов
function displayResults(results) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<h3>Результаты розыгрыша:</h3>';

  results.forEach(player => {
    const playerClass = `player-result win-${player.matches}`;
    const playerElement = document.createElement('div');
    playerElement.className = playerClass;

    playerElement.innerHTML = `
      <span class="player-name-in-result">${player.name}</span>
      угадал <span class="win-count">${player.matches} чисел</span>,
      выигрыш: <span class="win-amount">${player.winnings} руб.</span>
      (баланс: <span class="balance-update">${player.balance} руб.</span>)
    `;

    resultDiv.appendChild(playerElement);
  });

  // Добавляем итоговую статистику
  addSummaryStatistics(results);
}

// Функция для добавления итоговой статистики
function addSummaryStatistics(results) {
  const resultDiv = document.getElementById('result');

  // Находим победителя (игрока с максимальным выигрышем)
  const winner = results.reduce((max, player) =>
    player.winnings > max.winnings ? player : max
  );

  const summaryElement = document.createElement('div');
  summaryElement.className = 'summary-stats';
  summaryElement.style.marginTop = '20px';
  summaryElement.style.padding = '15px';
  summaryElement.style.background = '#f5f5f5';
  summaryElement.style.borderRadius = '10px';
  summaryElement.style.textAlign = 'center';

  summaryElement.innerHTML = `
    <h4 style="color: #2a4ae2; margin-bottom: 10px;">Итоговая статистика</h4>
    <p>Всего участников: <strong>${results.length}</strong></p>
    <p>Выигрышные числа: <strong>${gameState.winningNumbers.join(', ')}</strong></p>
    <p style="color: #4caf50; font-weight: bold;">
      Победитель: <span style="color: #6a1b9a;">${winner.name}</span> (выигрыш: ${winner.winnings} руб.)
    </p>
  `;

  resultDiv.appendChild(summaryElement);

  // Показываем кнопку для нового раунда
  showNewRoundButton();
}

// Показ кнопки нового раунда (продолжение игры с теми же игроками)
function showNewRoundButton() {
  const resultDiv = document.getElementById('result');

  // Проверяем, существует ли уже кнопка, чтобы не создавать дубликаты
  if (document.getElementById('newRoundBtn')) {
    return;
  }

  const newRoundBtn = document.createElement('button');
  newRoundBtn.id = 'newRoundBtn';
  newRoundBtn.textContent = 'Новый раунд';
  newRoundBtn.style.cssText = `
    background: linear-gradient(45deg, #2196f3, #4caf50);
    color: white;
    border: none;
    padding: 12px 24px;
    margin-top: 20px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    display: block;
    width: 200px;
    margin: 20px auto 0;
  `;

  newRoundBtn.addEventListener('click', () => {
    // Сбрасываем состояние для нового раунда (без перезагрузки страницы)
    resetForNewRound();
  });

  resultDiv.appendChild(newRoundBtn);

  // Анимация кнопки
  newRoundBtn.classList.add('pulse');
}

// Сброс для нового раунда (сохраняем игроков и балансы)
function resetForNewRound() {
  // Скрываем результаты и шары
  document.getElementById('ballsContainer').innerHTML = '';
  document.getElementById('ballsContainer').style.display = 'none';
  document.getElementById('result').innerHTML = '';

  // Удаляем кнопку «Новый раунд»
  const existingBtn = document.getElementById('newRoundBtn');
  if (existingBtn) {
    existingBtn.remove();
  }

  // Сбрасываем выбранные числа игрока
  selectedNumbers = [];
  document.querySelectorAll('.number-btn.selected').forEach(btn => {
    btn.classList.remove('selected');
  });

  // Показываем блок выбора чисел
  showNumberSelection();

  // Скрываем кнопку запуска лотереи
  document.getElementById('startLotteryBtn').style.display = 'none';
  document.getElementById('startLotteryBtn').classList.remove('pulse');

  // Восстанавливаем поля ввода ставок для всех игроков
  document.querySelectorAll('.player-card').forEach(playerCard => {
    const betInput = playerCard.querySelector('.bet-input');
    const confirmBtn = playerCard.querySelector('.confirm-bet-btn');

    // Очищаем данные о предыдущих ставках
    playerCard.dataset.betConfirmed = '';
    playerCard.dataset.betAmount = '';

    // Показываем поля ввода и кнопки подтверждения
    if (betInput) {
      betInput.style.display = 'block';
      betInput.value = 10; // Устанавливаем значение по умолчанию
    }
    if (confirmBtn) confirmBtn.style.display = 'block';
  });
}
