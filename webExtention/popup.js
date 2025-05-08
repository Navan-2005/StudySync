// // Get elements from the DOM
// const addButton = document.getElementById('addBtn');
// const siteInput = document.getElementById('siteInput');
// const blockedList = document.getElementById('blockedList');

// // Function to add a website to the blocked list
// function addWebsiteToList(website) {
//   // Create a new list item
//   const listItem = document.createElement('li');
//   listItem.classList.add('blocked-item');
  
//   // Create the text node for the website URL
//   const textNode = document.createTextNode(website);

//   // Create the remove button (X button)
//   const removeButton = document.createElement('button');
//   removeButton.classList.add('remove-btn');
//   removeButton.innerHTML = '✖';

//   // Add an event listener for removing the website
//   removeButton.addEventListener('click', () => {
//     listItem.remove();
//     removeFromStorage(website); // Remove from localStorage or your storage system
//   });

//   // Append the text node and remove button to the list item
//   listItem.appendChild(textNode);
//   listItem.appendChild(removeButton);

//   // Append the list item to the blocked list
//   blockedList.appendChild(listItem);

//   // Save to localStorage (so it persists across refreshes)
//   saveToStorage(website);
// }

// // Function to save the blocked website to localStorage
// function saveToStorage(website) {
//   let blockedSites = JSON.parse(localStorage.getItem('blockedSites')) || [];
//   if (!blockedSites.includes(website)) {
//     blockedSites.push(website);
//     localStorage.setItem('blockedSites', JSON.stringify(blockedSites));
//   }
// }

// // Function to remove a website from localStorage
// function removeFromStorage(website) {
//   let blockedSites = JSON.parse(localStorage.getItem('blockedSites')) || [];
//   blockedSites = blockedSites.filter(site => site !== website);
//   localStorage.setItem('blockedSites', JSON.stringify(blockedSites));
// }

// // Load blocked sites from localStorage and display them
// function loadBlockedSites() {
//   const blockedSites = JSON.parse(localStorage.getItem('blockedSites')) || [];
//   blockedSites.forEach(site => {
//     addWebsiteToList(site);
//   });
// }

// // Event listener for the Add button
// addButton.addEventListener('click', () => {
//   const website = siteInput.value.trim();
//   if (website && !website.includes(" ")) {
//     addWebsiteToList(website);
//     siteInput.value = ''; // Clear the input field after adding
//   } else {
//     alert('Please enter a valid website.');
//   }
// });

// // Event listener for the Enter key on the input field
// siteInput.addEventListener('keydown', (event) => {
//   if (event.key === 'Enter') {
//     // Simulate the button click when the Enter key is pressed
//     addButton.click();
//   }
// });

// // Load previously blocked websites when the extension is opened
// loadBlockedSites();






// // Get elements from the DOM
// const addButton = document.getElementById('addBtn');
// const siteInput = document.getElementById('siteInput');
// const blockedList = document.getElementById('blockedList');

// // Function to add a website to the blocked list
// function addWebsiteToList(website) {
//   // Create a new list item
//   const listItem = document.createElement('li');
//   listItem.classList.add('blocked-item');
  
//   // Create the text node for the website URL
//   const textNode = document.createTextNode(website);

//   // Create the remove button (X button)
//   const removeButton = document.createElement('button');
//   removeButton.classList.add('remove-btn');
//   removeButton.innerHTML = '✖';

//   // Add an event listener for removing the website
//   removeButton.addEventListener('click', () => {
//     listItem.remove();
//     removeFromStorage(website); // Remove from chrome.storage
//   });

//   // Append the text node and remove button to the list item
//   listItem.appendChild(textNode);
//   listItem.appendChild(removeButton);

//   // Append the list item to the blocked list
//   blockedList.appendChild(listItem);

//   // Save to chrome.storage (so it persists across refreshes)
//   saveToStorage(website);
// }

// // Function to save the blocked website to chrome.storage
// function saveToStorage(website) {
//   chrome.storage.sync.get({ blockedSites: [] }, (data) => {
//     let blockedSites = data.blockedSites;
//     if (!blockedSites.includes(website)) {
//       blockedSites.push(website);
//       chrome.storage.sync.set({ blockedSites });
//     }
//   });
// }

// // Function to remove a website from chrome.storage
// function removeFromStorage(website) {
//   chrome.storage.sync.get({ blockedSites: [] }, (data) => {
//     let blockedSites = data.blockedSites;
//     blockedSites = blockedSites.filter(site => site !== website);
//     chrome.storage.sync.set({ blockedSites });
//   });
// }

// // Load blocked sites from chrome.storage and display them
// function loadBlockedSites() {
//   chrome.storage.sync.get({ blockedSites: [] }, (data) => {
//     const blockedSites = data.blockedSites;
//     blockedSites.forEach(site => {
//       addWebsiteToList(site);
//     });
//   });
// }

// // Event listener for the Add button
// addButton.addEventListener('click', () => {
//   const website = siteInput.value.trim();
//   if (website && !website.includes(" ")) {
//     addWebsiteToList(website);
//     siteInput.value = ''; // Clear the input field after adding
//   } else {
//     alert('Please enter a valid website.');
//   }
// });

// // Event listener for the Enter key on the input field
// siteInput.addEventListener('keydown', (event) => {
//   if (event.key === 'Enter') {
//     // Simulate the button click when the Enter key is pressed
//     addButton.click();
//   }
// });

// // Load previously blocked websites when the extension is opened
// loadBlockedSites();


// // ===========================
// // Pomodoro Timer Section
// // ===========================

// let timer;
// let timeLeft = 25 * 60; // 25 minutes
// let isRunning = false;

// const timerDisplay = document.getElementById('timerDisplay');
// const startBtn = document.getElementById('startTimer');
// const pauseBtn = document.getElementById('pauseTimer');
// const resetBtn = document.getElementById('resetTimer');

// function updateTimerDisplay() {
//   const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
//   const seconds = String(timeLeft % 60).padStart(2, '0');
//   if (timerDisplay) {
//     timerDisplay.textContent = `${minutes}:${seconds}`;
//   }
// }

// function startTimer() {
//   if (isRunning) return;
//   isRunning = true;

//   chrome.storage.local.set({ isFocusTime: true });

//   timer = setInterval(() => {
//     if (timeLeft > 0) {
//       timeLeft--;
//       updateTimerDisplay();
//     } else {
//       clearInterval(timer);
//       isRunning = false;
//       chrome.storage.local.set({ isFocusTime: false });
//       alert("⏳ Time's up! Take a break!");
//     }
//   }, 1000);
// }

// function pauseTimer() {
//   clearInterval(timer);
//   isRunning = false;
// }

// function resetTimer() {
//   clearInterval(timer);
//   isRunning = false;
//   timeLeft = 25 * 60;
//   updateTimerDisplay();
//   chrome.storage.local.set({ isFocusTime: false });
// }

// // Attach button event listeners if they exist
// if (startBtn) startBtn.addEventListener('click', startTimer);
// if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
// if (resetBtn) resetBtn.addEventListener('click', resetTimer);

// // Initialize display
// updateTimerDisplay();


// // ===========================
// // Tickable To-Do List
// // ===========================

// const todoInput = document.getElementById('todoInput');
// const addTodoBtn = document.getElementById('addTodoBtn');
// const todoList = document.getElementById('todoList');


// function addTodoToList(taskObj) {
//     const listItem = document.createElement('li');
//     listItem.classList.add('todo-item');
  
//     const leftSection = document.createElement('div');
//     leftSection.style.display = 'flex';
//     leftSection.style.alignItems = 'center';
//     leftSection.style.flexGrow = '1';
//     leftSection.style.gap = '1px';
  
//     const checkbox = document.createElement('input');
//     checkbox.type = 'checkbox';
//     checkbox.checked = taskObj.completed;
  
//     const taskText = document.createElement('span');
//     taskText.textContent = taskObj.task;
//     taskText.style.flexGrow = '1';
//     if (taskObj.completed) {
//       taskText.style.textDecoration = 'line-through';
//       taskText.style.color = '#a0aec0';
//     }
  
//     checkbox.addEventListener('change', () => {
//       taskObj.completed = checkbox.checked;
//       if (checkbox.checked) {
//         taskText.style.textDecoration = 'line-through';
//         taskText.style.color = '#a0aec0';
//       } else {
//         taskText.style.textDecoration = 'none';
//         taskText.style.color = 'white';
//       }
//       updateTaskInStorage(taskObj);
//     });
  
//     leftSection.appendChild(checkbox);
//     leftSection.appendChild(taskText);
  
//     const removeButton = document.createElement('button');
//     removeButton.innerHTML = '✖';
//     removeButton.classList.add('remove-btn');
//     removeButton.addEventListener('click', () => {
//       listItem.remove();
//       removeFromStorage(taskObj.task);
//     });
  
//     listItem.appendChild(leftSection);
//     listItem.appendChild(removeButton);
//     todoList.appendChild(listItem);
//   }
  



// // Save task to storage
// function saveToStorage(task) {
//   chrome.storage.sync.get({ todoList: [] }, (data) => {
//     let todoListData = data.todoList;
//     todoListData.push({ task, completed: false });
//     chrome.storage.sync.set({ todoList: todoListData });
//   });
// }

// // Update task completion in storage
// function updateTaskInStorage(updatedTask) {
//   chrome.storage.sync.get({ todoList: [] }, (data) => {
//     let todoListData = data.todoList.map(task =>
//       task.task === updatedTask.task ? updatedTask : task
//     );
//     chrome.storage.sync.set({ todoList: todoListData });
//   });
// }

// // Remove task from storage
// function removeFromStorage(taskName) {
//   chrome.storage.sync.get({ todoList: [] }, (data) => {
//     let todoListData = data.todoList.filter(task => task.task !== taskName);
//     chrome.storage.sync.set({ todoList: todoListData });
//   });
// }

// // Load tasks from storage
// function loadTodoList() {
//   chrome.storage.sync.get({ todoList: [] }, (data) => {
//     const todoListData = data.todoList;
//     todoListData.forEach(taskObj => {
//       addTodoToList(taskObj);
//     });
//   });
// }

// // Event listener for adding task
// addTodoBtn.addEventListener('click', () => {
//   const task = todoInput.value.trim();
//   if (task) {
//     const taskObj = { task, completed: false };
//     addTodoToList(taskObj);
//     saveToStorage(task);
//     todoInput.value = '';
//   } else {
//     alert('Please enter a valid task.');
//   }
// });

// loadTodoList();




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
