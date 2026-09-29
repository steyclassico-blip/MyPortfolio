// =====================================================
// PORTFOLIO EDIT MODE — localStorage-based CMS
// =====================================================

const STORAGE_KEY = 'portfolio_edits';

function loadEdits() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const edits = JSON.parse(saved);
        Object.entries(edits).forEach(([id, value]) => {
            const el = document.querySelector(`[data-edit-id="${id}"]`);
            if (el) el.innerHTML = value;
        });
    } catch (e) {
        console.warn('[EditMode] Failed to load edits:', e);
    }
}

function saveEdits() {
    const edits = {};
    document.querySelectorAll('[data-edit-id]').forEach(el => {
        edits[el.dataset.editId] = el.innerHTML;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    showToast('✅ Alterações guardadas!');
}

function clearEdits() {
    localStorage.removeItem(STORAGE_KEY);
    showToast('🗑️ Edições removidas. A recarregar...');
    setTimeout(() => location.reload(), 1200);
}

function enableEditing() {
    document.querySelectorAll('[data-edit-id]').forEach(el => {
        el.contentEditable = 'true';
        el.classList.add('edit-active');
    });
}

function disableEditing() {
    document.querySelectorAll('[data-edit-id]').forEach(el => {
        el.contentEditable = 'false';
        el.classList.remove('edit-active');
    });
}

function showToast(msg) {
    const t = document.getElementById('edit-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

function createEditUI() {
    // Floating button
    const fab = document.createElement('button');
    fab.id = 'edit-fab';
    fab.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Editar</span>`;
    fab.setAttribute('title', 'Ativar Modo de Edição');

    // Edit panel
    const panel = document.createElement('div');
    panel.id = 'edit-panel';
    panel.innerHTML = `
        <div class="edit-panel-header">
            <div class="edit-panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Modo de Edição
            </div>
            <span class="edit-panel-status" id="edit-status">Inativo</span>
        </div>
        <p class="edit-panel-hint">Clica nos textos para editá-los. As alterações ficam guardadas no teu browser.</p>
        <div class="edit-panel-actions">
            <button id="edit-toggle-btn" class="edit-btn-primary">Ativar</button>
            <button id="edit-save-btn" class="edit-btn-secondary" disabled>Guardar</button>
        </div>
        <div class="edit-panel-actions" style="margin-top: 0.5rem;">
            <button id="edit-clear-btn" class="edit-btn-danger">Apagar Edições</button>
        </div>`;

    // Toast
    const toast = document.createElement('div');
    toast.id = 'edit-toast';

    document.body.appendChild(fab);
    document.body.appendChild(panel);
    document.body.appendChild(toast);

    let isEditing = false;
    let panelOpen = false;

    const toggleBtn = document.getElementById('edit-toggle-btn');
    const saveBtn = document.getElementById('edit-save-btn');
    const clearBtn = document.getElementById('edit-clear-btn');
    const status = document.getElementById('edit-status');

    fab.addEventListener('click', () => {
        panelOpen = !panelOpen;
        panel.classList.toggle('open', panelOpen);
    });

    toggleBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        if (isEditing) {
            enableEditing();
            toggleBtn.textContent = 'Desativar';
            toggleBtn.classList.add('active');
            saveBtn.disabled = false;
            status.textContent = 'Ativo';
            status.style.color = '#00ffaa';
        } else {
            disableEditing();
            toggleBtn.textContent = 'Ativar';
            toggleBtn.classList.remove('active');
            saveBtn.disabled = true;
            status.textContent = 'Inativo';
            status.style.color = '';
        }
    });

    saveBtn.addEventListener('click', () => {
        saveEdits();
        isEditing = false;
        disableEditing();
        toggleBtn.textContent = 'Ativar';
        toggleBtn.classList.remove('active');
        saveBtn.disabled = true;
        status.textContent = 'Inativo';
        status.style.color = '';
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Apagar todas as edições guardadas e voltar ao original?')) {
            clearEdits();
        }
    });
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    createEditUI();
    loadEdits();
});
