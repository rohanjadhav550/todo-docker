// Get DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todo-list');
const inprogressList = document.getElementById('inprogress-list');
const doneList = document.getElementById('done-list');

// Modal elements
const taskModal = document.getElementById('taskModal');
const modalTaskTitle = document.getElementById('modalTaskTitle');
const taskDescription = document.getElementById('taskDescription');
const closeModalBtn = document.querySelector('.close-modal');
const checklistItemInput = document.getElementById('checklistItemInput');
const addChecklistBtn = document.getElementById('addChecklistBtn');
const checklistContainer = document.getElementById('checklistContainer');
const imageUpload = document.getElementById('imageUpload');
const uploadImageBtn = document.getElementById('uploadImageBtn');
const imageContainer = document.getElementById('imageContainer');
const commentInput = document.getElementById('commentInput');
const addCommentBtn = document.getElementById('addCommentBtn');
const commentsContainer = document.getElementById('commentsContainer');

// Current task being edited
let currentTaskId = null;

// Load tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', loadTasks);

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Modal event listeners
closeModalBtn.addEventListener('click', closeModal);
taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        closeModal();
    }
});

taskDescription.addEventListener('blur', saveTaskDescription);
addChecklistBtn.addEventListener('click', addChecklistItem);
checklistItemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addChecklistItem();
    }
});

uploadImageBtn.addEventListener('click', () => imageUpload.click());
imageUpload.addEventListener('change', handleImageUpload);

addCommentBtn.addEventListener('click', addComment);
commentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        addComment();
    }
});

// Add task function
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        status: 'todo',
        description: '',
        checklist: [],
        images: [],
        comments: []
    };

    createTaskElement(task);
    saveTask(task);
    taskInput.value = '';
    taskInput.focus();
}

// Create task element
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.dataset.id = task.id;
    div.draggable = true;

    // Task content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    // Task text
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    span.style.cursor = 'pointer';
    span.addEventListener('click', () => openTaskModal(task.id));

    // Task indicators (checklist, images, comments count)
    const indicatorsDiv = document.createElement('div');
    indicatorsDiv.className = 'task-indicators';

    if (task.checklist && task.checklist.length > 0) {
        const checklistIndicator = document.createElement('span');
        checklistIndicator.className = 'task-indicator';
        const completed = task.checklist.filter(item => item.completed).length;
        checklistIndicator.textContent = `☑ ${completed}/${task.checklist.length}`;
        indicatorsDiv.appendChild(checklistIndicator);
    }

    if (task.images && task.images.length > 0) {
        const imageIndicator = document.createElement('span');
        imageIndicator.className = 'task-indicator';
        imageIndicator.textContent = `🖼 ${task.images.length}`;
        indicatorsDiv.appendChild(imageIndicator);
    }

    if (task.comments && task.comments.length > 0) {
        const commentIndicator = document.createElement('span');
        commentIndicator.className = 'task-indicator';
        commentIndicator.textContent = `💬 ${task.comments.length}`;
        indicatorsDiv.appendChild(commentIndicator);
    }

    // Actions container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-task-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskModal(task.id);
    });
    actionsDiv.appendChild(editBtn);

    // Move buttons based on status
    if (task.status === 'todo') {
        const moveBtn = document.createElement('button');
        moveBtn.className = 'move-btn';
        moveBtn.textContent = 'Start';
        moveBtn.addEventListener('click', () => moveTask(task.id, 'inprogress'));
        actionsDiv.appendChild(moveBtn);
    } else if (task.status === 'inprogress') {
        const moveBackBtn = document.createElement('button');
        moveBackBtn.className = 'move-btn';
        moveBackBtn.textContent = 'To Do';
        moveBackBtn.addEventListener('click', () => moveTask(task.id, 'todo'));
        actionsDiv.appendChild(moveBackBtn);

        const moveDoneBtn = document.createElement('button');
        moveDoneBtn.className = 'move-btn';
        moveDoneBtn.textContent = 'Done';
        moveDoneBtn.addEventListener('click', () => moveTask(task.id, 'done'));
        actionsDiv.appendChild(moveDoneBtn);
    } else if (task.status === 'done') {
        const moveBtn = document.createElement('button');
        moveBtn.className = 'move-btn';
        moveBtn.textContent = 'Reopen';
        moveBtn.addEventListener('click', () => moveTask(task.id, 'todo'));
        actionsDiv.appendChild(moveBtn);
    }

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    actionsDiv.appendChild(deleteBtn);

    contentDiv.appendChild(span);
    if (indicatorsDiv.children.length > 0) {
        contentDiv.appendChild(indicatorsDiv);
    }
    contentDiv.appendChild(actionsDiv);
    div.appendChild(contentDiv);

    // Add drag and drop event listeners
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    // Add to appropriate list
    const targetList = getListByStatus(task.status);
    targetList.appendChild(div);

    updateEmptyStates();
    updateTaskCounts();
}

// Get list element by status
function getListByStatus(status) {
    switch (status) {
        case 'todo':
            return todoList;
        case 'inprogress':
            return inprogressList;
        case 'done':
            return doneList;
        default:
            return todoList;
    }
}

// Move task to different status
function moveTask(id, newStatus) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);

    if (task) {
        task.status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(tasks));

        const taskElement = document.querySelector(`[data-id="${id}"]`);
        taskElement.remove();
        createTaskElement(task);
    }
}

// Delete task
function deleteTask(id) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));

    const taskElement = document.querySelector(`[data-id="${id}"]`);
    taskElement.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
        taskElement.remove();
        updateEmptyStates();
        updateTaskCounts();
    }, 300);
}

// Save task to localStorage
function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Get tasks from localStorage
function getTasks() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

// Load tasks from localStorage
function loadTasks() {
    const tasks = getTasks();
    tasks.forEach(task => createTaskElement(task));
    updateEmptyStates();
    updateTaskCounts();
}

// Update empty state messages
function updateEmptyStates() {
    updateEmptyState(todoList, 'No tasks in To Do');
    updateEmptyState(inprogressList, 'No tasks in progress');
    updateEmptyState(doneList, 'No completed tasks');
}

function updateEmptyState(list, message) {
    const existingEmptyState = list.querySelector('.empty-state');
    const taskItems = list.querySelectorAll('.task-item');

    if (taskItems.length === 0) {
        if (!existingEmptyState) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = message;
            list.appendChild(emptyState);
        }
    } else {
        if (existingEmptyState) {
            existingEmptyState.remove();
        }
    }
}

// Update task counts
function updateTaskCounts() {
    const tasks = getTasks();
    const todoCounts = tasks.filter(t => t.status === 'todo').length;
    const inprogressCounts = tasks.filter(t => t.status === 'inprogress').length;
    const doneCounts = tasks.filter(t => t.status === 'done').length;

    document.getElementById('todo-count').textContent = todoCounts;
    document.getElementById('inprogress-count').textContent = inprogressCounts;
    document.getElementById('done-count').textContent = doneCounts;
}

// Drag and drop functionality
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

// Add drag and drop to columns
[todoList, inprogressList, doneList].forEach(list => {
    list.addEventListener('dragover', handleDragOver);
    list.addEventListener('drop', handleDrop);
});

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement && draggedElement !== this) {
        const taskId = parseInt(draggedElement.dataset.id);
        const newStatus = this.closest('.kanban-column').dataset.status;

        moveTask(taskId, newStatus);
    }

    return false;
}

// ========== MODAL FUNCTIONS ==========

// Open task modal
function openTaskModal(taskId) {
    currentTaskId = taskId;
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    modalTaskTitle.textContent = task.text;
    taskDescription.value = task.description || '';

    // Load checklist
    renderChecklist(task);

    // Load images
    renderImages(task);

    // Load comments
    renderComments(task);

    taskModal.classList.add('show');
}

// Close modal
function closeModal() {
    taskModal.classList.remove('show');
    currentTaskId = null;

    // Clear inputs
    checklistItemInput.value = '';
    commentInput.value = '';
    imageUpload.value = '';
}

// Save task description
function saveTaskDescription() {
    if (!currentTaskId) return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task) {
        task.description = taskDescription.value;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// Update task in storage
function updateTaskInStorage(taskId, updates) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Refresh the task card
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
            createTaskElement(tasks[taskIndex]);
        }
    }
}

// ========== CHECKLIST FUNCTIONS ==========

// Add checklist item
function addChecklistItem() {
    if (!currentTaskId) return;

    const itemText = checklistItemInput.value.trim();
    if (itemText === '') return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task) {
        if (!task.checklist) {
            task.checklist = [];
        }

        const checklistItem = {
            id: Date.now(),
            text: itemText,
            completed: false
        };

        task.checklist.push(checklistItem);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        renderChecklist(task);
        checklistItemInput.value = '';
        checklistItemInput.focus();

        // Update task card
        updateTaskInStorage(currentTaskId, { checklist: task.checklist });
    }
}

// Render checklist
function renderChecklist(task) {
    checklistContainer.innerHTML = '';

    if (!task.checklist || task.checklist.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-state';
        emptyMsg.textContent = 'No checklist items yet';
        checklistContainer.appendChild(emptyMsg);
        return;
    }

    task.checklist.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;
        checkbox.addEventListener('change', () => toggleChecklistItem(item.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'checklist-item-text';
        if (item.completed) {
            textSpan.classList.add('completed');
        }
        textSpan.textContent = item.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'checklist-item-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteChecklistItem(item.id));

        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(textSpan);
        itemDiv.appendChild(deleteBtn);
        checklistContainer.appendChild(itemDiv);
    });
}

// Toggle checklist item
function toggleChecklistItem(itemId) {
    if (!currentTaskId) return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task && task.checklist) {
        const item = task.checklist.find(i => i.id === itemId);
        if (item) {
            item.completed = !item.completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderChecklist(task);

            // Update task card
            updateTaskInStorage(currentTaskId, { checklist: task.checklist });
        }
    }
}

// Delete checklist item
function deleteChecklistItem(itemId) {
    if (!currentTaskId) return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task && task.checklist) {
        task.checklist = task.checklist.filter(i => i.id !== itemId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderChecklist(task);

        // Update task card
        updateTaskInStorage(currentTaskId, { checklist: task.checklist });
    }
}

// ========== IMAGE FUNCTIONS ==========

// Handle image upload
function handleImageUpload(e) {
    if (!currentTaskId) return;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task) {
        if (!task.images) {
            task.images = [];
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageData = {
                    id: Date.now() + Math.random(),
                    data: event.target.result,
                    name: file.name
                };

                task.images.push(imageData);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderImages(task);

                // Update task card
                updateTaskInStorage(currentTaskId, { images: task.images });
            };
            reader.readAsDataURL(file);
        });

        imageUpload.value = '';
    }
}

// Render images
function renderImages(task) {
    imageContainer.innerHTML = '';

    if (!task.images || task.images.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-state';
        emptyMsg.textContent = 'No images uploaded yet';
        imageContainer.appendChild(emptyMsg);
        return;
    }

    task.images.forEach(image => {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'image-item';

        const img = document.createElement('img');
        img.src = image.data;
        img.alt = image.name;
        img.addEventListener('click', () => {
            window.open(image.data, '_blank');
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'image-delete';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteImage(image.id);
        });

        imageDiv.appendChild(img);
        imageDiv.appendChild(deleteBtn);
        imageContainer.appendChild(imageDiv);
    });
}

// Delete image
function deleteImage(imageId) {
    if (!currentTaskId) return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task && task.images) {
        task.images = task.images.filter(i => i.id !== imageId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderImages(task);

        // Update task card
        updateTaskInStorage(currentTaskId, { images: task.images });
    }
}

// ========== COMMENT FUNCTIONS ==========

// Add comment
function addComment() {
    if (!currentTaskId) return;

    const commentText = commentInput.value.trim();
    if (commentText === '') return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task) {
        if (!task.comments) {
            task.comments = [];
        }

        const comment = {
            id: Date.now(),
            text: commentText,
            date: new Date().toLocaleString()
        };

        task.comments.push(comment);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        renderComments(task);
        commentInput.value = '';
        commentInput.focus();

        // Update task card
        updateTaskInStorage(currentTaskId, { comments: task.comments });
    }
}

// Render comments
function renderComments(task) {
    commentsContainer.innerHTML = '';

    if (!task.comments || task.comments.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-state';
        emptyMsg.textContent = 'No comments yet';
        commentsContainer.appendChild(emptyMsg);
        return;
    }

    task.comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'comment-header';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'comment-date';
        dateSpan.textContent = comment.date;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'comment-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteComment(comment.id));

        headerDiv.appendChild(dateSpan);
        headerDiv.appendChild(deleteBtn);

        const textDiv = document.createElement('div');
        textDiv.className = 'comment-text';
        textDiv.textContent = comment.text;

        commentDiv.appendChild(headerDiv);
        commentDiv.appendChild(textDiv);
        commentsContainer.appendChild(commentDiv);
    });
}

// Delete comment
function deleteComment(commentId) {
    if (!currentTaskId) return;

    const tasks = getTasks();
    const task = tasks.find(t => t.id === currentTaskId);

    if (task && task.comments) {
        task.comments = task.comments.filter(c => c.id !== commentId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderComments(task);

        // Update task card
        updateTaskInStorage(currentTaskId, { comments: task.comments });
    }
}
