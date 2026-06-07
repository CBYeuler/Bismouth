window.addEventListener('DOMContentLoaded', () => {
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
    const filepathInput = document.getElementById('filepath');

    // Tauri API 
    const { invoke } = window.__TAURI__.core;
    const { open }   = window.__TAURI__.dialog;

    let currentFile      = null;   
    let currentWorkspace = null;   
    let contextTarget    = null;   
    let saveTimer        = null;   

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
        // Autosave 800ms after
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveNote, 800);
    });


    document.querySelector('.filepath-wrap').addEventListener('click', async () => {
        const selected = await open({
            directory: true,
            multiple: false,
            title: 'Open Workspace',
        });
        if (!selected) return;

        currentWorkspace = selected;
        filepathInput.value = selected;
        await loadWorkspace(selected);
    });

    async function loadWorkspace(dirPath) {
        try {
            const tree = await invoke('read_dir_tree', { path: dirPath });
            renderTree(tree, fileTree, 0);
            lucide.createIcons();
        } catch (err) {
            console.error('Failed to load workspace:', err);
        }
    }

    function renderTree(nodes, container, depth) {
        container.innerHTML = '';

        for (const node of nodes) {
            const item = document.createElement('div');
            item.className = 'tree-item ' + (node.is_dir ? 'folder' : 'file');
            item.dataset.type = node.is_dir ? 'folder' : 'file';
            item.dataset.path = node.path;

            if (node.is_dir) {
                item.innerHTML = `
                    <div class="tree-row" style="padding-left: ${8 + depth * 12}px">
                        <i data-lucide="chevron-right" class="tree-arrow"></i>
                        <i data-lucide="folder" class="tree-icon folder-icon"></i>
                        <span class="tree-label">${node.name}</span>
                    </div>
                    <div class="tree-children collapsed"></div>`;

                if (node.children.length > 0) {
                    renderTree(node.children, item.querySelector('.tree-children'), depth + 1);
                }
            } else {
                item.innerHTML = `
                    <div class="tree-row" style="padding-left: ${20 + depth * 12}px">
                        <i data-lucide="file-text" class="tree-icon"></i>
                        <span class="tree-label">${node.name}</span>
                    </div>`;
            }

            container.appendChild(item);
        }
    }

    async function openNote(filePath) {
        try {
            const content = await invoke('read_note', { path: filePath });
            editor.innerText = content;
            currentFile = filePath;

            const name = filePath.split(/[\\/]/).pop();
            if (editorTab) editorTab.textContent = name;

            updateLineNumbers();
            updateCounts();
            editor.focus();
        } catch (err) {
            console.error('Failed to open note:', err);
        }
    }

    async function saveNote() {
        if (!currentFile) return;
        try {
            await invoke('write_note', {
                path: currentFile,
                content: editor.innerText,
            });
        } catch (err) {
            console.error('Autosave failed:', err);
        }
    }


    fileTree.addEventListener('click', (e) => {
        const row  = e.target.closest('.tree-row');
        if (!row) return;
        const item = row.closest('.tree-item');


        if (item.dataset.type === 'folder') {
            item.classList.toggle('open');
            const children = item.querySelector('.tree-children');
            if (children) children.classList.toggle('collapsed');
            lucide.createIcons();
            return;
        }


        if (item.dataset.type === 'file') {
            document.querySelectorAll('.tree-row.active').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            openNote(item.dataset.path);
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

    contextMenu.addEventListener('click', async (e) => {
        const actionBtn = e.target.closest('button');
        if (!actionBtn || !contextTarget) return;
        const action = actionBtn.dataset.action;

        if (action === 'rename') {
            startRename(contextTarget);
        }

        if (action === 'delete') {
            try {
                await invoke('delete_note', { path: contextTarget.dataset.path });
                if (currentFile === contextTarget.dataset.path) {
                    editor.innerText = '';
                    if (editorTab) editorTab.textContent = 'Untitled';
                    currentFile = null;
                    updateLineNumbers();
                    updateCounts();
                }
                await loadWorkspace(currentWorkspace);
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }

        if (action === 'new-note') {
            await createNewNote(contextTarget);
        }

        contextMenu.classList.add('hidden');
        contextTarget = null;
    });


    function startRename(item) {
        const label   = item.querySelector('.tree-label');
        const oldName = label.textContent;
        const oldPath = item.dataset.path;

        const input = document.createElement('input');
        input.type      = 'text';
        input.value     = oldName;
        input.className = 'tree-rename-input';
        label.replaceWith(input);
        input.focus();
        input.select();

        async function commitRename() {
            const newName = input.value.trim() || oldName;
            const dir     = oldPath.substring(0, oldPath.lastIndexOf('/'));
            const newPath = (dir || currentWorkspace) + '/' + newName;

            if (newName !== oldName) {
                try {
                    await invoke('rename_note', { oldPath, newPath });
                    if (currentFile === oldPath) {
                        currentFile = newPath;
                        if (editorTab) editorTab.textContent = newName;
                    }
                } catch (err) {
                    console.error('Rename failed:', err);
                }
            }
            await loadWorkspace(currentWorkspace);
        }

        input.addEventListener('blur', commitRename);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')  input.blur();
            if (e.key === 'Escape') { input.value = oldName; input.blur(); }
        });
    }

    async function createNewNote(parentItem) {
        if (!currentWorkspace) return;

        const dir = parentItem?.dataset.type === 'folder'
            ? parentItem.dataset.path
            : currentWorkspace;

        const notePath = dir + '/untitled.md';
        try {
            await invoke('create_note', { path: notePath });
            await loadWorkspace(currentWorkspace);
            const newItem = [...fileTree.querySelectorAll('.tree-item.file')]
                .find(el => el.dataset.path === notePath);
            if (newItem) startRename(newItem);
        } catch (err) {
            console.error('Create note failed:', err);
        }
    }


    document.getElementById('new-note-btn').addEventListener('click', () => {
        createNewNote(null);
    });

    document.getElementById('new-folder-btn').addEventListener('click', async () => {
        if (!currentWorkspace) return;
        const folderPath = currentWorkspace + '/new-folder';
        try {
            await invoke('create_folder', { path: folderPath });
            await loadWorkspace(currentWorkspace);
            const newItem = [...fileTree.querySelectorAll('.tree-item.folder')]
                .find(el => el.dataset.path === folderPath);
            if (newItem) startRename(newItem);
        } catch (err) {
            console.error('Create folder failed:', err);
        }
    });

    lucide.createIcons();
    updateLineNumbers();
    updateCounts();


        const savedWorkspace = localStorage.getItem('bismouth-workspace');
        if (savedWorkspace) {
            currentWorkspace = savedWorkspace;
            filepathInput.value = savedWorkspace;
            loadWorkspace(savedWorkspace);
    }
});