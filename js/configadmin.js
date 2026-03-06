// js/configadmin.js

document.addEventListener('DOMContentLoaded', () => {

    // ── NAVEGAÇÃO ─────────────────────────────────────────────────────────────
    const categoriasTab    = document.getElementById('categoriasTab');
    const horariosTab      = document.getElementById('horariosTab');
    const categoriasSection = document.getElementById('categoriasSection');
    const horariosSection  = document.getElementById('horariosSection');

    categoriasTab.addEventListener('click', () => {
        showSection([categoriasSection, horariosSection], 'categoriasSection');
        updateActiveTab([categoriasTab, horariosTab], 'categoriasTab');
        renderCategories();
    });
    horariosTab.addEventListener('click', () => {
        showSection([categoriasSection, horariosSection], 'horariosSection');
        updateActiveTab([categoriasTab, horariosTab], 'horariosTab');
    });

    // ── CATEGORIAS ────────────────────────────────────────────────────────────
    async function renderCategories() {
        const list = document.getElementById('categoryList');
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><span>Carregando...</span></div>';

        const response = await fetchData('api/categorias.php');
        if (!response.success) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏷️</div><span>Erro ao carregar categorias.</span></div>';
            return;
        }

        const categories = response.categories;
        if (categories.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏷️</div><span>Nenhuma categoria cadastrada.</span></div>';
            return;
        }

        list.innerHTML = categories.map(c => `
            <div class="config-card">
                <div class="info"><h3>${escapeHtml(c.nome)}</h3></div>
                <div class="config-card-actions">
                    <button class="btn btn-delete" onclick="deleteCategory(${c.id})">🗑 Excluir</button>
                </div>
            </div>
        `).join('');
    }

    // Modal Categoria
    const addCategoryModal  = document.getElementById('addCategoryModal');
    const categoryForm      = document.getElementById('categoryForm');
    const categoryNameInput = document.getElementById('categoryName');

    document.getElementById('openAddCategoryModal').addEventListener('click', () => {
        categoryForm.reset();
        addCategoryModal.style.display = 'flex';
    });
    document.getElementById('closeCategoryModal').addEventListener('click', () => {
        addCategoryModal.style.display = 'none';
    });
    window.addEventListener('click', e => {
        if (e.target === addCategoryModal) addCategoryModal.style.display = 'none';
    });

    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const response = await fetchData('api/categorias.php', 'POST', {
            name: categoryNameInput.value.trim(),
        });
        if (response.success) {
            addCategoryModal.style.display = 'none';
            categoryForm.reset();
            renderCategories();
        } else {
            alert('Erro: ' + response.message);
        }
    });

    window.deleteCategory = async (id) => {
        if (!confirm('Excluir esta categoria? Produtos vinculados perderão a categoria.')) return;
        const response = await fetchData('api/categorias.php', 'DELETE', { id });
        if (response.success) {
            renderCategories();
        } else {
            alert('Erro: ' + response.message);
        }
    };

    // ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────
    renderCategories();
});

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
