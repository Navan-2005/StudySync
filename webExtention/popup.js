
// ===========================
// Website Blocker Section
// ===========================

// Get elements from the DOM
const addButton = document.getElementById('addBtn');
const siteInput = document.getElementById('siteInput');
const blockedList = document.getElementById('blockedList');

// Function to add a website to the blocked list
function addWebsiteToList(website) {
  const listItem = document.createElement('li');
  listItem.classList.add('blocked-item');

  const textNode = document.createTextNode(website);

  const removeButton = document.createElement('button');
  removeButton.classList.add('remove-btn');
  removeButton.innerHTML = '✖';

  removeButton.addEventListener('click', () => {
    listItem.remove();
    removeBlockedSiteFromStorage(website);
  });

  listItem.appendChild(textNode);
  listItem.appendChild(removeButton);
  blockedList.appendChild(listItem);

  saveBlockedSiteToStorage(website);
}

function saveBlockedSiteToStorage(website) {
  chrome.storage.sync.get({ blockedSites: [] }, (data) => {
    let blockedSites = data.blockedSites;
    if (!blockedSites.includes(website)) {
      blockedSites.push(website);
      chrome.storage.sync.set({ blockedSites });
    }
  });
}

function removeBlockedSiteFromStorage(website) {
  chrome.storage.sync.get({ blockedSites: [] }, (data) => {
    let blockedSites = data.blockedSites.filter(site => site !== website);
    chrome.storage.sync.set({ blockedSites });
  });
}

function loadBlockedSites() {
  chrome.storage.sync.get({ blockedSites: [] }, (data) => {
    data.blockedSites.forEach(addWebsiteToList);
  });
}

addButton.addEventListener('click', () => {
  const website = siteInput.value.trim();
  if (website && !website.includes(" ")) {
    addWebsiteToList(website);
    siteInput.value = '';
  } else {
    alert('Please enter a valid website.');
  }
});

siteInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addButton.click();
});

loadBlockedSites();


// ===========================
// Pomodoro Timer Section
// ===========================

let timer;
let timeLeft = 25 * 60;
let isRunning = false;

const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startTimer');
const pauseBtn = document.getElementById('pauseTimer');
const resetBtn = document.getElementById('resetTimer');

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  if (timerDisplay) timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  chrome.storage.local.set({ isFocusTime: true });

  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      isRunning = false;
      chrome.storage.local.set({ isFocusTime: false });
      alert("⏳ Time's up! Take a break!");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = 25 * 60;
  updateTimerDisplay();
  chrome.storage.local.set({ isFocusTime: false });
}

if (startBtn) startBtn.addEventListener('click', startTimer);
if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);

updateTimerDisplay();


// ===========================
// Tickable To-Do List
// ===========================

const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

function addTodoToList(taskObj) {
  const listItem = document.createElement('li');
  listItem.classList.add('todo-item');

  const leftSection = document.createElement('div');
  leftSection.style.display = 'flex';
  leftSection.style.alignItems = 'center';
  leftSection.style.flexGrow = '1';
  leftSection.style.gap = '1px';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = taskObj.completed;

  const taskText = document.createElement('span');
  taskText.textContent = taskObj.task;
  taskText.style.flexGrow = '1';
  if (taskObj.completed) {
    taskText.style.textDecoration = 'line-through';
    taskText.style.color = '#a0aec0';
  }

  checkbox.addEventListener('change', () => {
    taskObj.completed = checkbox.checked;
    taskText.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    taskText.style.color = checkbox.checked ? '#a0aec0' : 'white';
    updateTodoInStorage(taskObj);
  });

  leftSection.appendChild(checkbox);
  leftSection.appendChild(taskText);

  const removeButton = document.createElement('button');
  removeButton.innerHTML = '✖';
  removeButton.classList.add('remove-btn');
  removeButton.addEventListener('click', () => {
    listItem.remove();
    removeTodoFromStorage(taskObj.task);
  });

  listItem.appendChild(leftSection);
  listItem.appendChild(removeButton);
  todoList.appendChild(listItem);
}

function saveTodoToStorage(task) {
  chrome.storage.sync.get({ todoList: [] }, (data) => {
    let todoListData = data.todoList;
    todoListData.push({ task, completed: false });
    chrome.storage.sync.set({ todoList: todoListData });
  });
}

function updateTodoInStorage(updatedTask) {
  chrome.storage.sync.get({ todoList: [] }, (data) => {
    let todoListData = data.todoList.map(task =>
      task.task === updatedTask.task ? updatedTask : task
    );
    chrome.storage.sync.set({ todoList: todoListData });
  });
}

function removeTodoFromStorage(taskName) {
  chrome.storage.sync.get({ todoList: [] }, (data) => {
    let todoListData = data.todoList.filter(task => task.task !== taskName);
    chrome.storage.sync.set({ todoList: todoListData });
  });
}

function loadTodoList() {
  chrome.storage.sync.get({ todoList: [] }, (data) => {
    data.todoList.forEach(addTodoToList);
  });
}

addTodoBtn.addEventListener('click', () => {
  const task = todoInput.value.trim();
  if (task) {
    const taskObj = { task, completed: false };
    addTodoToList(taskObj);
    saveTodoToStorage(task);
    todoInput.value = '';
  } else {
    alert('Please enter a valid task.');
  }
});

loadTodoList();



document.getElementById('screenshotBtn').addEventListener('click', () => {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
    if (chrome.runtime.lastError) {
      console.error('Error taking screenshot:', chrome.runtime.lastError);
      return;
    }
    sendScreenshotToServer(dataUrl);
  });
});

function sendScreenshotToServer(dataUrl) {
  fetch('https://yourserver.com/api/screenshot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: dataUrl })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Server response:', data);
    alert('✅ Screenshot sent successfully!');
  })
  .catch(err => {
    console.error('Failed to send screenshot:', err);
    alert('❌ Failed to send screenshot');
  });
}
