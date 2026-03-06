// js/admin.js
// Lógica exclusiva do painel admin (admin.php)

document.addEventListener('DOMContentLoaded', () => {
    const user = window.SESSION_USER;

    // ── NAVEGAÇÃO ─────────────────────────────────────────────────────────────
    const tabs     = ['adminAgendamentos', 'adminProdutos', 'adminServicos'];
    const tabBtns  = tabs.map(t => document.getElementById(t + 'Tab'));
    const sections = tabs.map(t => document.getElementById(t + 'Section'));

    tabBtns[0].addEventListener('click', () => switchTab(0, renderAdminAppointments));
    tabBtns[1].addEventListener('click', () => switchTab(1, renderAdminProducts));
    tabBtns[2].addEventListener('click', () => switchTab(2, renderAdminServices));

    function switchTab(index, renderFn) {
        sections.forEach((s, i) => s.classList.toggle('hidden', i !== index));
        tabBtns.forEach((b, i) => b.classList.toggle('active', i === index));
        renderFn();
    }

    // ── CARDS DE RESUMO (receita real) ────────────────────────────────────────
    async function updateAdminSummary() {
        const res = await fetchData('api/relatorio.php');
        if (!res.success) return;

        document.getElementById('totalAppointments').textContent  = res.total_agendamentos;
        document.getElementById('pendingAppointments').textContent = res.pending_agendamentos;
        document.getElementById('totalProducts').textContent      = res.total_produtos;
        document.getElementById('totalRevenue').textContent       = formatCurrency(res.receita_realizada);
    }

    // ── AGENDAMENTOS ──────────────────────────────────────────────────────────
    async function renderAdminAppointments() {
        const list = document.getElementById('adminAppointmentsList');
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><span>Carregando...</span></div>';

        const response = await fetchData('api/agendamentos.php');
        if (!response.success) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><span>Erro ao carregar agendamentos.</span></div>';
            return;
        }

        const appointments = response.agendamentos;
        if (appointments.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><span>Nenhum agendamento encontrado.</span></div>';
            return;
        }

        list.innerHTML = appointments.map(app => `
            <div class="appointment-card">
                <div class="info">
                    <h3>${escapeHtml(app.nome_servico)}</h3>
                    <p>Cliente: <strong>${escapeHtml(app.nome_cliente)}</strong> · ${escapeHtml(app.email_cliente)}</p>
                    <div class="appointment-meta">
                        <span class="appointment-meta-item">📅 ${formatDateToBrazilian(app.data_agendamento)}</span>
                        <span class="appointment-meta-item">🕐 ${formatTime(app.hora_agendamento)}</span>
                        <span class="status ${statusClass(app.status)}">${escapeHtml(app.status)}</span>
                    </div>
                    ${app.observacoes ? `<p class="appointment-obs">Obs: ${escapeHtml(app.observacoes)}</p>` : ''}
                </div>
                <div class="appointment-actions">
                    ${app.status === 'Agendado'
                        ? `<button class="btn btn-complete" onclick="updateAppointmentStatus(${app.id}, 'Concluído')">✓ Concluir</button>
                           <button class="btn btn-cancel"   onclick="updateAppointmentStatus(${app.id}, 'Cancelado')">✕ Cancelar</button>`
                        : ''
                    }
                </div>
            </div>
        `).join('');
    }

    window.updateAppointmentStatus = async (id, newStatus) => {
        const response = await fetchData('api/agendamentos.php', 'PUT', { id, status: newStatus });
        if (response.success) {
            renderAdminAppointments();
            updateAdminSummary();
        } else {
            alert('Erro ao atualizar: ' + response.message);
        }
    };

    // ── PRODUTOS ──────────────────────────────────────────────────────────────
    async function renderAdminProducts() {
        const list = document.getElementById('adminProductList');
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><span>Carregando...</span></div>';

        const response = await fetchData('api/produtos.php');
        if (!response.success) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><span>Erro ao carregar produtos.</span></div>';
            return;
        }

        const products = response.products;
        if (products.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><span>Nenhum produto cadastrado. Adicione o primeiro!</span></div>';
            return;
        }

        list.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.url_imagem ? escapeHtml(p.url_imagem) : 'img/sem-foto.svg'}"
                     alt="${escapeHtml(p.nome)}" loading="lazy">
                <div class="info">
                    <h3>${escapeHtml(p.nome)}</h3>
                    <p>${escapeHtml(p.descricao || '')}</p>
                    <p class="price">${formatCurrency(p.preco)}</p>
                    ${p.nome_categoria ? `<span class="badge">${escapeHtml(p.nome_categoria)}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-edit"   onclick="editProduct(${p.id})">✏ Editar</button>
                    <button class="btn btn-delete" onclick="deleteProduct(${p.id})">🗑 Excluir</button>
                </div>
            </div>
        `).join('');
    }

    // Modal Produto
    const addProductModal     = document.getElementById('addProductModal');
    const productForm         = document.getElementById('productForm');
    const productIdInput      = document.getElementById('productId');
    const productNameInput    = document.getElementById('productName');
    const productCategorySelect = document.getElementById('productCategory');
    const productPriceInput   = document.getElementById('productPrice');
    const productDescInput    = document.getElementById('productDescription');
    const saveProductBtn      = document.getElementById('saveProductBtn');
    const productImageInput   = document.getElementById('productImage');
    const productImagePreview = document.getElementById('productImagePreview');

    document.getElementById('openAddProductModal').addEventListener('click', async () => {
        productForm.reset();
        productIdInput.value         = '';
        productImagePreview.style.display = 'none';
        document.getElementById('productModalTitle').textContent = 'Novo Produto';
        saveProductBtn.textContent   = 'Adicionar Produto';
        await loadProductCategories();
        addProductModal.style.display = 'flex';
    });

    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    window.addEventListener('click', e => { if (e.target === addProductModal) closeProductModal(); });

    function closeProductModal() {
        addProductModal.style.display = 'none';
        productForm.reset();
        productImagePreview.style.display = 'none';
    }

    productImageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                productImagePreview.src = e.target.result;
                productImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Salva produto — sempre via FormData para suportar upload de imagem
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveProductBtn.disabled    = true;
        saveProductBtn.textContent = 'Salvando...';

        const id = productIdInput.value;

        // FormData funciona tanto para POST (criar) quanto PUT (editar com imagem)
        const formData = new FormData();
        if (id) formData.append('id', id);
        formData.append('name',        productNameInput.value.trim());
        formData.append('category',    productCategorySelect.value);
        formData.append('price',       productPriceInput.value);
        formData.append('description', productDescInput.value.trim());
        if (productImageInput.files.length > 0) {
            formData.append('image', productImageInput.files[0]);
        }

        try {
            const response = await fetch('api/produtos.php', {
                method: id ? 'PUT' : 'POST',
                credentials: 'same-origin',
                body: formData,
                // NÃO definir Content-Type — o browser define automaticamente com o boundary correto
            });

            if (!response.ok) {
                throw new Error('Erro HTTP ' + response.status);
            }

            const data = await response.json();
            if (data.success) {
                closeProductModal();
                renderAdminProducts();
                updateAdminSummary();
            } else {
                alert('Erro ao salvar: ' + data.message);
            }
        } catch (err) {
            alert('Erro ao enviar: ' + err.message);
        }

        saveProductBtn.disabled    = false;
        saveProductBtn.textContent = id ? 'Atualizar Produto' : 'Adicionar Produto';
    });

    window.editProduct = async (id) => {
        await loadProductCategories();
        const response = await fetchData('api/produtos.php');
        if (!response.success) return;

        const product = response.products.find(p => p.id == id);
        if (!product) return;

        productIdInput.value          = product.id;
        productNameInput.value        = product.nome;
        productCategorySelect.value   = product.nome_categoria;
        productPriceInput.value       = parseFloat(product.preco).toFixed(2);
        productDescInput.value        = product.descricao || '';

        if (product.url_imagem) {
            productImagePreview.src   = product.url_imagem;
            productImagePreview.style.display = 'block';
        } else {
            productImagePreview.style.display = 'none';
        }

        document.getElementById('productModalTitle').textContent = 'Editar Produto';
        saveProductBtn.textContent   = 'Atualizar Produto';
        addProductModal.style.display = 'flex';
    };

    window.deleteProduct = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        const response = await fetchData('api/produtos.php', 'DELETE', { id });
        if (response.success) {
            renderAdminProducts();
            updateAdminSummary();
        } else {
            alert('Erro: ' + response.message);
        }
    };

    async function loadProductCategories() {
        const response = await fetchData('api/categorias.php');
        if (response.success) {
            productCategorySelect.innerHTML = '<option value="">Selecione uma categoria</option>' +
                response.categories.map(c =>
                    `<option value="${escapeHtml(c.nome)}">${escapeHtml(c.nome)}</option>`
                ).join('');
        }
    }

    // ── SERVIÇOS ──────────────────────────────────────────────────────────────
    async function renderAdminServices() {
        const list = document.getElementById('adminServiceList');
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><span>Carregando...</span></div>';

        const response = await fetchData('api/servicos.php');
        if (!response.success) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><span>Erro ao carregar serviços.</span></div>';
            return;
        }

        const services = response.services;
        if (services.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✂️</div><span>Nenhum serviço cadastrado. Adicione o primeiro!</span></div>';
            return;
        }

        list.innerHTML = services.map(s => `
            <div class="product-card">
                <div class="info">
                    <h3>${escapeHtml(s.nome)}</h3>
                    <p>${escapeHtml(s.descricao || '')}</p>
                    <p class="price">${formatCurrency(s.preco)}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-edit"   onclick="editService(${s.id})">✏ Editar</button>
                    <button class="btn btn-delete" onclick="deleteService(${s.id})">🗑 Excluir</button>
                </div>
            </div>
        `).join('');
    }

    // Modal Serviço
    const addServiceModal   = document.getElementById('addServiceModal');
    const serviceForm       = document.getElementById('serviceForm');
    const serviceIdInput    = document.getElementById('serviceId');
    const serviceNameInput  = document.getElementById('serviceName');
    const servicePriceInput = document.getElementById('servicePrice');
    const serviceDescInput  = document.getElementById('serviceDescription');

    document.getElementById('openAddServiceModal').addEventListener('click', () => {
        serviceForm.reset();
        serviceIdInput.value = '';
        document.getElementById('serviceModalTitle').textContent = 'Novo Serviço';
        document.getElementById('saveServiceBtn').textContent    = 'Adicionar Serviço';
        addServiceModal.style.display = 'flex';
    });

    document.getElementById('closeServiceModal').addEventListener('click', closeServiceModal);
    window.addEventListener('click', e => { if (e.target === addServiceModal) closeServiceModal(); });

    function closeServiceModal() {
        addServiceModal.style.display = 'none';
        serviceForm.reset();
    }

    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id     = serviceIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const body   = {
            id,
            name:        serviceNameInput.value,
            price:       parseFloat(servicePriceInput.value),
            description: serviceDescInput.value,
        };

        const response = await fetchData('api/servicos.php', method, body);
        if (response.success) {
            alert(response.message);
            closeServiceModal();
            renderAdminServices();
        } else {
            alert('Erro: ' + response.message);
        }
    });

    window.editService = async (id) => {
        const response = await fetchData('api/servicos.php');
        if (!response.success) return;
        const service = response.services.find(s => s.id == id);
        if (!service) return;

        serviceIdInput.value    = service.id;
        serviceNameInput.value  = service.nome;
        servicePriceInput.value = parseFloat(service.preco).toFixed(2);
        serviceDescInput.value  = service.descricao || '';

        document.getElementById('serviceModalTitle').textContent = 'Editar Serviço';
        document.getElementById('saveServiceBtn').textContent    = 'Atualizar Serviço';
        addServiceModal.style.display = 'flex';
    };

    window.deleteService = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        const response = await fetchData('api/servicos.php', 'DELETE', { id });
        if (response.success) {
            renderAdminServices();
        } else {
            alert('Erro: ' + response.message);
        }
    };

    // ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────
    renderAdminAppointments();
    updateAdminSummary();
});

// ── UTILITÁRIOS ───────────────────────────────────────────────────────────────
function statusClass(status) {
    if (status === 'Agendado')  return 'status-scheduled';
    if (status === 'Concluído') return 'status-completed';
    if (status === 'Cancelado') return 'status-cancelled';
    return '';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
