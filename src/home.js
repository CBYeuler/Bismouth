window.addEventListener('DOMContentLoaded', () => {
    const { invoke } = window.__TAURI__.core;
    const wsList       = document.getElementById('ws-list');
    const createBtn    = document.getElementById('create-btn');
    const openBtn      = document.getElementById('open-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCancel  = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const wsNameInput  = document.getElementById('ws-name-input');

    async function loadWorkspaces() {
        try {
            const workspaces = await invoke('list_workspaces');
            renderWorkspaces(workspaces);
        } catch (err) {
            console.error('Failed to load workspaces:', err);
            wsList.innerHTML = '<p class="ws-empty">Failed to load workspaces.</p>';
        }
    }

    function formatDate(unixSecs) {
        const diff = Math.floor(Date.now() / 1000) - unixSecs;
        if (diff < 60)    return 'Less than a minute ago';
        if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    function renderWorkspaces(workspaces) {
        if (workspaces.length === 0) {
            wsList.innerHTML = '<p class="ws-empty">No workspaces yet.</p>';
            return;
        }

        wsList.innerHTML = workspaces.map(ws => `
            <div class="ws-list-item" data-path="${ws.path}">
                <div class="ws-left">
                    <i data-lucide="folder" class="folder"></i>
                    <div class="ws-info">
                        <span class="ws-name">${ws.name}</span>
                        <span class="ws-date">${formatDate(ws.modified)}</span>
                    </div>
                </div>
                <button class="delete-btn" data-path="${ws.path}">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `).join('');

        lucide.createIcons();

        wsList.querySelectorAll('.ws-list-item').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn')) return;
                openWorkspace(card.dataset.path);
            });
        });

        wsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const path = btn.dataset.path;
                const name = path.split('/').pop();
                if (!confirm(`Delete workspace "${name}"? This cannot be undone.`)) return;
                try {
                    await invoke('delete_workspace', { path });
                    await loadWorkspaces();
                } catch (err) {
                    console.error('Delete failed:', err);
                }
            });
        });
    }

    function openWorkspace(path) {
        localStorage.setItem('bismouth-workspace', path);
        location.href = 'index.html';
    }

    function showModal() {
        wsNameInput.value = '';
        modalOverlay.classList.add('active');
        setTimeout(() => wsNameInput.focus(), 50);
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
    }

    createBtn.addEventListener('click', showModal);
    modalCancel.addEventListener('click', hideModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal();
    });

    modalConfirm.addEventListener('click', createWorkspace);

    wsNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')  createWorkspace();
        if (e.key === 'Escape') hideModal();
    });

    async function createWorkspace() {
        const raw = wsNameInput.value.trim();
        if (!raw) { wsNameInput.focus(); return; }

        const name = raw.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
        if (!name) { wsNameInput.focus(); return; }

        try {
            const path = await invoke('create_workspace', { name });
            hideModal();
            openWorkspace(path);
        } catch (err) {
            console.error('Create workspace failed:', err);
        }
    }

    openBtn.addEventListener('click', async () => {
        const { open } = window.__TAURI__.dialog;
        const selected = await open({
            directory: true,
            multiple: false,
            title: 'Open Workspace',
        });
        if (selected) openWorkspace(selected);
    });

    lucide.createIcons();
    loadWorkspaces();
});