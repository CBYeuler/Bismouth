// ── DOM refs ────────────────────────────────────────────
const sidebar     = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const btn         = document.getElementById('toggle-sidebar');
const themeBtn    = document.getElementById('theme-toggle');
const editor      = document.getElementById('editor');
const lineNumbers = document.getElementById('line-numbers');
const wordCount   = document.getElementById('word-count');
const charCount   = document.getElementById('char-count');
const fileTree    = document.getElementById('file-tree');
const contextMenu = document.getElementById('context-menu');
const editorTab   = document.querySelector('.editor-tab span:last-child');

let currentFile    = null;   // path of open file
let contextTarget  = null;   // tree-item the context menu was opened on

themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    themeBtn.innerHTML = isLight
        ? '<i data-lucide="moon"></i>'
        : '<i data-lucide="sun"></i>';
    lucide.createIcons();
});

btn.addEventListener('click', () => {
    const isCollapsing = !sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    btn.classList.toggle('collapsed');
    btn.innerHTML = isCollapsing
        ? '<i data-lucide="chevron-right"></i>'
        : '<i data-lucide="chevron-left"></i>';
    lucide.createIcons();
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        btn.click();
    }
});

function updateLineNumbers() {
    const lines = editor.innerText === '' ? 1 : editor.innerText.split('\n').length;
    let nums = '';
    for (let i = 1; i <= lines; i++) nums += i + '\n';
    lineNumbers.textContent = nums;
}

function updateCounts() {
    const text  = editor.innerText.trim();
    const words = text === '' ? 0 : text.split(/\s+/).filter(Boolean).length;
    const chars = editor.innerText.replace(/\n$/, '').length;
    wordCount.textContent = words + ' word' + (words !== 1 ? 's' : '');
    charCount.textContent = chars + ' char' + (chars !== 1 ? 's' : '');
}

editor.addEventListener('input', () => {
    updateLineNumbers();
    updateCounts();
});


fileTree.addEventListener('click', (e) => {
    const row = e.target.closest('.tree-row');
    if (!row) return;

    const item = row.closest('.tree-item');

    // Folder — toggle open/collapsed
    if (item.dataset.type === 'folder') {
        item.classList.toggle('open');
        const children = item.querySelector('.tree-children');
        if (children) children.classList.toggle('collapsed');
        lucide.createIcons();
        return;
    }

    // File — set active + update tab
    if (item.dataset.type === 'file') {
        // Clear previous active
        document.querySelectorAll('.tree-row.active').forEach(r => r.classList.remove('active'));
        row.classList.add('active');

        currentFile = item.dataset.path;
        const name  = currentFile.split('/').pop();
        if (editorTab) editorTab.textContent = name;

        // TODO: replace with invoke('read_note', { path: currentFile }) when Tauri is wired
        editor.focus();
    }
});


fileTree.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const item = e.target.closest('.tree-item');
    if (!item) return;

    contextTarget = item;
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top  = e.clientY + 'px';
    contextMenu.classList.remove('hidden');
    lucide.createIcons();
});


document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
        contextMenu.classList.add('hidden');
        contextTarget = null;
    }
});

contextMenu.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !contextTarget) return;

    const action = btn.dataset.action;

    if (action === 'rename') {
        startRename(contextTarget);
    }

    if (action === 'delete') {
        // TODO: invoke('delete_note', { path: contextTarget.dataset.path })
        // For now just remove from DOM
        contextTarget.remove();
        if (currentFile === contextTarget.dataset.path) {
            editor.innerText = '';
            if (editorTab) editorTab.textContent = 'Untitled';
            currentFile = null;
        }
    }

    if (action === 'new-note') {
        createNewNote(contextTarget);
    }

    contextMenu.classList.add('hidden');
    contextTarget = null;
});

function startRename(item) {
    const label = item.querySelector('.tree-label');
    const oldName = label.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldName;
    input.className = 'tree-rename-input';

    label.replaceWith(input);
    input.focus();
    input.select();

    function commitRename() {
        const newName = input.value.trim() || oldName;
        const span = document.createElement('span');
        span.className = 'tree-label';
        span.textContent = newName;
        input.replaceWith(span);

       
        const dir = item.dataset.path.substring(0, item.dataset.path.lastIndexOf('/'));
        item.dataset.path = dir ? dir + '/' + newName : newName;

        // Update tab if this was the open file
        if (currentFile && editorTab && item.dataset.type === 'file') {
            editorTab.textContent = newName;
        }

        // TODO: invoke('rename_note', { oldPath, newPath })
    }

    input.addEventListener('blur', commitRename);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')  { input.blur(); }
        if (e.key === 'Escape') { input.value = oldName; input.blur(); }
    });
}


function createNewNote(parentItem) {
  
    let container;
    if (parentItem && parentItem.dataset.type === 'folder') {
        container = parentItem.querySelector('.tree-children');
        if (container) container.classList.remove('collapsed');
        parentItem.classList.add('open');
    } else {
        container = fileTree;
    }

    const newItem = document.createElement('div');
    newItem.className = 'tree-item file';
    newItem.dataset.type = 'file';
    newItem.dataset.path = 'untitled.md';
    newItem.innerHTML = `
        <div class="tree-row">
            <i data-lucide="file-text" class="tree-icon"></i>
            <span class="tree-label">untitled.md</span>
        </div>`;
    container.appendChild(newItem);
    lucide.createIcons();


    startRename(newItem);
}

document.getElementById('new-note-btn').addEventListener('click', () => {
    createNewNote(null);
});

document.getElementById('new-folder-btn').addEventListener('click', () => {
    const newItem = document.createElement('div');
    newItem.className = 'tree-item folder';
    newItem.dataset.type = 'folder';
    newItem.dataset.path = 'new-folder';
    newItem.innerHTML = `
        <div class="tree-row">
            <i data-lucide="chevron-right" class="tree-arrow"></i>
            <i data-lucide="folder" class="tree-icon folder-icon"></i>
            <span class="tree-label">new-folder</span>
        </div>
        <div class="tree-children collapsed"></div>`;
    fileTree.appendChild(newItem);
    lucide.createIcons();
    startRename(newItem);
});

lucide.createIcons();
updateLineNumbers();
updateCounts();
