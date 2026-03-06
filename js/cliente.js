// js/cliente.js
// Lógica exclusiva do painel do cliente (cliente.php)

document.addEventListener('DOMContentLoaded', () => {
    // Dados da sessão injetados pelo PHP de forma segura
    const user = window.SESSION_USER;

    // Elementos de navegação
    const agendamentosTab    = document.getElementById('agendamentosTab');
    const produtosTab        = document.getElementById('produtosTab');
    const agendamentosSection = document.getElementById('agendamentosSection');
    const produtosSection    = document.getElementById('produtosSection');

    // Elementos do formulário de agendamento
    const serviceSelect          = document.getElementById('service');
    const dateInput              = document.getElementById('date');
    const timeSelect             = document.getElementById('time');
    const observationsTextarea   = document.getElementById('observations');
    const scheduleAppointmentBtn = document.getElementById('scheduleAppointmentBtn');
    const appointmentsList       = document.getElementById('appointmentsList');
    const noAppointmentsMessage  = document.getElementById('noAppointments');

    // Elementos de produtos
    const availableProductsDiv = document.getElementById('availableProducts');

    // Carrinho (em memória — persistência via banco futura)
    let cart = [];

    // ── NAVEGAÇÃO ─────────────────────────────────────────────────────────────
    agendamentosTab.addEventListener('click', () => {
        showSection([agendamentosSection, produtosSection], 'agendamentosSection');
        updateActiveTab([agendamentosTab, produtosTab], 'agendamentosTab');
        renderClientAppointments();
    });

    produtosTab.addEventListener('click', () => {
        showSection([agendamentosSection, produtosSection], 'produtosSection');
        updateActiveTab([agendamentosTab, produtosTab], 'produtosTab');
        renderClientProducts();
    });

    // ── AGENDAMENTOS ──────────────────────────────────────────────────────────
    async function renderClientAppointments() {
        appointmentsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><span>Carregando...</span></div>';

        const response = await fetchData('api/agendamentos.php');
        if (!response.success) {
            noAppointmentsMessage.classList.remove('hidden');
            appointmentsList.innerHTML = '';
            return;
        }

        const appointments = response.agendamentos;
        if (appointments.length === 0) {
            noAppointmentsMessage.classList.remove('hidden');
            appointmentsList.innerHTML = '';
        } else {
            noAppointmentsMessage.classList.add('hidden');
            appointmentsList.innerHTML = appointments.map(app => `
                <div class="appointment-card">
                    <div class="info">
                        <h3>${escapeHtml(app.nome_servico)}</h3>
                        <div class="appointment-meta">
                            <span class="appointment-meta-item">📅 ${formatDateToBrazilian(app.data_agendamento)}</span>
                            <span class="appointment-meta-item">🕐 ${formatTime(app.hora_agendamento)}</span>
                            <span class="status ${statusClass(app.status)}">${escapeHtml(app.status)}</span>
                        </div>
                        ${app.observacoes ? `<p class="appointment-obs">Obs: ${escapeHtml(app.observacoes)}</p>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    // ── HORÁRIOS DISPONÍVEIS ──────────────────────────────────────────────────
    dateInput.addEventListener('change', generateTimeSlots);

    async function generateTimeSlots() {
        timeSelect.innerHTML = '<option value="">Carregando horários...</option>';
        timeSelect.disabled  = true;

        const selectedDate = dateInput.value;
        if (!selectedDate) {
            timeSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
            return;
        }

        // Bloqueia datas passadas
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate < today) {
            timeSelect.innerHTML = '<option value="">Data inválida</option>';
            return;
        }

        const horariosBase = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30',
        ];

        // Remove horários passados se for hoje
        let disponiveis = [...horariosBase];
        if (selectedDate === today) {
            const now  = new Date();
            const agora = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            disponiveis = horariosBase.filter(h => h > agora);
        }

        // Busca horários ocupados no servidor
        const response = await fetchData(`api/agendamentos.php?action=get_available_times&date=${selectedDate}`);
        if (!response.success) {
            timeSelect.innerHTML = '<option value="">Erro ao carregar horários</option>';
            return;
        }

        const ocupados = response.occupied_times || [];
        const livres   = disponiveis.filter(h => !ocupados.includes(h));

        if (livres.length === 0) {
            timeSelect.innerHTML = '<option value="">Nenhum horário disponível neste dia</option>';
        } else {
            timeSelect.innerHTML = '<option value="">Selecione um horário</option>' +
                livres.map(h => `<option value="${h}">${h}</option>`).join('');
            timeSelect.disabled = false;
        }
    }

    // ── CRIAR AGENDAMENTO ─────────────────────────────────────────────────────
    scheduleAppointmentBtn.addEventListener('click', async () => {
        const service      = serviceSelect.value;
        const date         = dateInput.value;
        const time         = timeSelect.value;
        const observations = observationsTextarea.value;

        if (!service || !date || !time) {
            alert('Por favor, preencha serviço, data e horário.');
            return;
        }

        scheduleAppointmentBtn.disabled    = true;
        scheduleAppointmentBtn.textContent = '⏳ Agendando...';

        const response = await fetchData('api/agendamentos.php', 'POST', {
            service, date, time, observations,
        });

        if (response.success) {
            alert('Agendamento realizado com sucesso!');
            serviceSelect.value     = '';
            dateInput.value         = '';
            timeSelect.innerHTML    = '<option value="">Selecione uma data primeiro</option>';
            timeSelect.disabled     = true;
            observationsTextarea.value = '';
            renderClientAppointments();
        } else {
            alert('Erro ao agendar: ' + (response.message || 'Tente novamente.'));
        }

        scheduleAppointmentBtn.disabled    = false;
        scheduleAppointmentBtn.textContent = '📅 Confirmar Agendamento';
    });

    // ── PRODUTOS ──────────────────────────────────────────────────────────────
    async function renderClientProducts() {
        availableProductsDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><span>Carregando produtos...</span></div>';

        const response = await fetchData('api/produtos.php');
        if (!response.success) {
            availableProductsDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><span>Erro ao carregar produtos.</span></div>';
            return;
        }

        const products = response.products;
        if (products.length === 0) {
            availableProductsDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><span>Nenhum produto disponível no momento.</span></div>';
            return;
        }

        availableProductsDiv.innerHTML = products.map(p => `
            <div class="product-card">
                <img class="product-card-image"
                     src="${p.url_imagem ? escapeHtml(p.url_imagem) : 'img/sem-foto.svg'}"
                     alt="${escapeHtml(p.nome)}" loading="lazy">
                <div class="product-card-body">
                    ${p.nome_categoria ? `<span class="badge">${escapeHtml(p.nome_categoria)}</span>` : ''}
                    <div class="product-card-name">${escapeHtml(p.nome)}</div>
                    <div class="product-card-desc">${escapeHtml(p.descricao || '')}</div>
                    <div class="product-card-footer">
                        <span class="product-card-price">${formatCurrency(p.preco)}</span>
                        <button class="btn btn-buy" data-id="${p.id}" data-name="${escapeHtml(p.nome)}" data-price="${p.preco}">
                            🛒 Comprar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        availableProductsDiv.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', () => {
                addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price);
            });
        });
    }

    // ── CARRINHO ──────────────────────────────────────────────────────────────
    function updateCartCount() {
        const countEl = document.getElementById('cartCount');
        if (countEl) countEl.textContent = cart.length;
    }

    function addToCart(id, name, price) {
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ id, name, price: parseFloat(price), qty: 1 });
        }
        alert(`"${name}" adicionado ao carrinho!`);
        renderCart();
    }

    function renderCart() {
        const cartModal   = document.getElementById('cartModal');
        const cartItems   = document.getElementById('cartItems');
        const cartEmpty   = document.getElementById('cartEmpty');
        const cartTotal   = document.getElementById('cartTotalSection');
        const totalValue  = document.getElementById('cartTotalValue');

        if (cart.length === 0) {
            cartItems.innerHTML = '';
            cartEmpty.style.display = 'block';
            cartTotal.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartTotal.style.display = 'block';
            cartItems.innerHTML = cart.map((item, idx) => `
                <div class="cart-item">
                    <span>${escapeHtml(item.name)} x${item.qty}</span>
                    <span>${formatCurrency(item.price * item.qty)}</span>
                    <button class="btn-remove-cart" data-idx="${idx}">✕</button>
                </div>
            `).join('');
            const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
            totalValue.textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

            cartItems.querySelectorAll('.btn-remove-cart').forEach(btn => {
                btn.addEventListener('click', () => {
                    cart.splice(parseInt(btn.dataset.idx), 1);
                    renderCart();
                });
            });
        }
    }

    document.getElementById('closeCartModal')?.addEventListener('click', () => {
        document.getElementById('cartModal').style.display = 'none';
    });

    // ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────
    async function loadServices() {
        const response = await fetchData('api/servicos.php');
        if (response.success && response.services.length > 0) {
            serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>' +
                response.services.map(s =>
                    `<option value="${escapeHtml(s.nome)}">${escapeHtml(s.nome)} (${formatCurrency(s.preco)})</option>`
                ).join('');
        } else {
            serviceSelect.innerHTML = '<option value="">Nenhum serviço disponível</option>';
        }
    }

    // Define data mínima como hoje
    dateInput.min = new Date().toISOString().split('T')[0];

    loadServices();
    renderClientAppointments();
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
