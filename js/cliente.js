// js/cliente.js — Painel do cliente

document.addEventListener('DOMContentLoaded', () => {
    const user = window.SESSION_USER;

    // ── ELEMENTOS ─────────────────────────────────────────────────────────────
    const agendamentosTab     = document.getElementById('agendamentosTab');
    const produtosTab         = document.getElementById('produtosTab');
    const agendamentosSection = document.getElementById('agendamentosSection');
    const produtosSection     = document.getElementById('produtosSection');

    const serviceSelect          = document.getElementById('service');
    const dateInput              = document.getElementById('date');
    const timeSelect             = document.getElementById('time');
    const observationsTextarea   = document.getElementById('observations');
    const scheduleAppointmentBtn = document.getElementById('scheduleAppointmentBtn');
    const appointmentsList       = document.getElementById('appointmentsList');
    const noAppointmentsMessage  = document.getElementById('noAppointments');
    const availableProductsDiv   = document.getElementById('availableProducts');

    // Carrinho — array de { id, name, price, qty, img }
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

        const today = new Date().toISOString().split('T')[0];
        if (selectedDate < today) {
            timeSelect.innerHTML = '<option value="">Data inválida</option>';
            return;
        }

        const [cfgRes, ocupadosRes] = await Promise.all([
            fetchData('api/horarios.php'),
            fetchData(`api/agendamentos.php?action=get_available_times&date=${selectedDate}`),
        ]);

        if (!cfgRes.success || !ocupadosRes.success) {
            timeSelect.innerHTML = '<option value="">Erro ao carregar horários</option>';
            return;
        }

        const partes    = selectedDate.split('-');
        const dateObj   = new Date(partes[0], partes[1] - 1, partes[2]);
        const diaSemana = dateObj.getDay();
        const cfgDia    = cfgRes.horarios[diaSemana];

        if (!cfgDia || !cfgDia.ativo) {
            timeSelect.innerHTML = '<option value="">Sem atendimento neste dia</option>';
            return;
        }

        function gerarSlots(inicio, fim, intervalo) {
            const slots = [];
            let [h, m] = inicio.split(':').map(Number);
            const [hf, mf] = fim.split(':').map(Number);
            const fimMin = hf * 60 + mf;
            while (true) {
                if (h * 60 + m >= fimMin) break;
                slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
                m += intervalo;
                if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
            }
            return slots;
        }

        let disponiveis = gerarSlots(cfgDia.hora_inicio, cfgDia.hora_fim, cfgDia.intervalo);

        if (selectedDate === today) {
            const now   = new Date();
            const agora = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            disponiveis = disponiveis.filter(h => h > agora);
        }

        const ocupados = ocupadosRes.occupied_times || [];
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

        const response = await fetchData('api/agendamentos.php', 'POST', { service, date, time, observations });

        if (response.success) {
            showToast('Agendamento confirmado! ✅', 'success');
            serviceSelect.value        = '';
            dateInput.value            = '';
            timeSelect.innerHTML       = '<option value="">Selecione uma data primeiro</option>';
            timeSelect.disabled        = true;
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

        availableProductsDiv.innerHTML = products.map(p => {
            const inCart = cart.find(i => i.id === String(p.id));
            const qty    = inCart ? inCart.qty : 0;
            return `
            <div class="product-card" data-id="${p.id}">
                <img class="product-card-image"
                     src="${p.url_imagem ? escapeHtml(p.url_imagem) : 'img/sem-foto.svg'}"
                     alt="${escapeHtml(p.nome)}" loading="lazy">
                <div class="product-card-body">
                    ${p.nome_categoria ? `<span class="badge">${escapeHtml(p.nome_categoria)}</span>` : ''}
                    <div class="product-card-name">${escapeHtml(p.nome)}</div>
                    <div class="product-card-desc">${escapeHtml(p.descricao || '')}</div>
                    <div class="product-card-footer">
                        <span class="product-card-price">${formatCurrency(p.preco)}</span>
                        <div class="product-card-actions">
                            ${qty > 0
                                ? `<div class="qty-control">
                                       <button class="qty-btn qty-minus" data-id="${p.id}" aria-label="Remover um">−</button>
                                       <span class="qty-value">${qty}</span>
                                       <button class="qty-btn qty-plus"
                                               data-id="${p.id}"
                                               data-name="${escapeHtml(p.nome)}"
                                               data-price="${p.preco}"
                                               data-img="${p.url_imagem ? escapeHtml(p.url_imagem) : 'img/sem-foto.svg'}"
                                               aria-label="Adicionar mais">+</button>
                                   </div>`
                                : `<button class="btn-add-cart"
                                           data-id="${p.id}"
                                           data-name="${escapeHtml(p.nome)}"
                                           data-price="${p.preco}"
                                           data-img="${p.url_imagem ? escapeHtml(p.url_imagem) : 'img/sem-foto.svg'}">
                                       + Adicionar
                                   </button>`
                            }
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        wireProductCardEvents(availableProductsDiv);
    }

    function wireProductCardEvents(container) {
        container.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', () =>
                addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price, btn.dataset.img));
        });
        container.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () =>
                addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price, btn.dataset.img));
        });
        container.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
        });
    }

    // ── CARRINHO — LÓGICA ─────────────────────────────────────────────────────
    function addToCart(id, name, price, img) {
        const existing = cart.find(item => item.id === String(id));
        if (existing) {
            existing.qty++;
        } else {
            cart.push({
                id:    String(id),
                name,
                price: parseFloat(price),
                qty:   1,
                img:   img || 'img/sem-foto.svg'
            });
        }
        updateCartBadge();
        refreshProductCard(id);
        showToast(`${name} adicionado ao carrinho 🛒`);
    }

    function removeFromCart(id) {
        const idx = cart.findIndex(item => item.id === String(id));
        if (idx === -1) return;
        if (cart[idx].qty > 1) {
            cart[idx].qty--;
        } else {
            cart.splice(idx, 1);
        }
        updateCartBadge();
        refreshProductCard(id);
        if (document.getElementById('cartModal').style.display !== 'none') {
            renderCartModal();
        }
    }

    function clearCart() {
        cart = [];
        updateCartBadge();
        // Re-renderiza grid para repor os botões "Adicionar"
        if (produtosSection && !produtosSection.classList.contains('hidden')) {
            renderClientProducts();
        }
    }

    // Atualiza apenas o card afetado sem re-renderizar a grid
    function refreshProductCard(id) {
        const card = availableProductsDiv.querySelector(`.product-card[data-id="${id}"]`);
        if (!card) return;

        const item    = cart.find(i => i.id === String(id));
        const qty     = item ? item.qty : 0;
        const actions = card.querySelector('.product-card-actions');
        if (!actions) return;

        const srcBtn  = card.querySelector('[data-name]');
        const name    = srcBtn?.dataset.name  || '';
        const price   = srcBtn?.dataset.price || 0;
        const img     = srcBtn?.dataset.img   || 'img/sem-foto.svg';

        if (qty > 0) {
            actions.innerHTML = `
                <div class="qty-control">
                    <button class="qty-btn qty-minus" data-id="${id}" aria-label="Remover um">−</button>
                    <span class="qty-value">${qty}</span>
                    <button class="qty-btn qty-plus"
                            data-id="${id}" data-name="${escapeHtml(name)}"
                            data-price="${price}" data-img="${escapeHtml(img)}"
                            aria-label="Adicionar mais">+</button>
                </div>`;
        } else {
            actions.innerHTML = `
                <button class="btn-add-cart"
                        data-id="${id}" data-name="${escapeHtml(name)}"
                        data-price="${price}" data-img="${escapeHtml(img)}">
                    + Adicionar
                </button>`;
        }

        wireProductCardEvents(actions);
    }

    // Badge do header
    function updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const total = cart.reduce((sum, i) => sum + i.qty, 0);
        badge.textContent = total;
        badge.classList.toggle('hidden', total === 0);
        if (total > 0) {
            badge.classList.add('badge-pop');
            setTimeout(() => badge.classList.remove('badge-pop'), 350);
        }
    }

    // ── MODAL DO CARRINHO ─────────────────────────────────────────────────────
    function renderCartModal() {
        const cartEmpty     = document.getElementById('cartEmpty');
        const cartItemsList = document.getElementById('cartItemsList');
        const cartFooter    = document.getElementById('cartFooter');
        const cartSubtitle  = document.getElementById('cartSubtitle');
        const cartItemCount = document.getElementById('cartItemCount');
        const subtotalEl    = document.getElementById('cartSubtotalValue');
        const totalEl       = document.getElementById('cartTotalValue');

        const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
        const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

        cartSubtitle.textContent = totalQty === 1 ? '1 item' : `${totalQty} itens`;

        if (cart.length === 0) {
            cartEmpty.classList.remove('hidden');
            cartItemsList.classList.add('hidden');
            cartFooter.classList.add('hidden');
            return;
        }

        cartEmpty.classList.add('hidden');
        cartItemsList.classList.remove('hidden');
        cartFooter.classList.remove('hidden');

        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img class="cart-item-img"
                     src="${escapeHtml(item.img)}"
                     alt="${escapeHtml(item.name)}">
                <div class="cart-item-info">
                    <span class="cart-item-name">${escapeHtml(item.name)}</span>
                    <span class="cart-item-unit">${formatCurrency(item.price)} / un.</span>
                </div>
                <div class="cart-qty-control">
                    <button class="cart-qty-btn cart-qty-minus" data-id="${item.id}" aria-label="Remover um">−</button>
                    <span class="cart-qty-value">${item.qty}</span>
                    <button class="cart-qty-btn cart-qty-plus"
                            data-id="${item.id}"
                            data-name="${escapeHtml(item.name)}"
                            data-price="${item.price}"
                            data-img="${escapeHtml(item.img)}"
                            aria-label="Adicionar mais">+</button>
                </div>
                <span class="cart-item-total">${formatCurrency(item.price * item.qty)}</span>
                <button class="cart-item-remove" data-id="${item.id}" aria-label="Remover item">✕</button>
            </div>
        `).join('');

        cartItemsList.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price, btn.dataset.img);
                renderCartModal();
            });
        });
        cartItemsList.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(btn.dataset.id);
                renderCartModal();
            });
        });
        cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                cart = cart.filter(i => i.id !== btn.dataset.id);
                updateCartBadge();
                refreshProductCard(btn.dataset.id);
                renderCartModal();
            });
        });

        cartItemCount.textContent = totalQty;
        subtotalEl.textContent    = formatCurrency(totalPrice);
        totalEl.textContent       = formatCurrency(totalPrice);
    }

    // Abre modal do carrinho
    document.getElementById('openCartBtn').addEventListener('click', () => {
        renderCartModal();
        document.getElementById('cartModal').style.display = 'flex';
    });

    // Fecha modal do carrinho
    document.getElementById('closeCartModal').addEventListener('click', () => {
        document.getElementById('cartModal').style.display = 'none';
    });
    document.getElementById('cartModal').addEventListener('click', e => {
        if (e.target === document.getElementById('cartModal'))
            document.getElementById('cartModal').style.display = 'none';
    });

    // Esvaziar carrinho
    document.getElementById('clearCartBtn').addEventListener('click', () => {
        if (!confirm('Esvaziar o carrinho?')) return;
        clearCart();
        renderCartModal();
    });

    // ── CHECKOUT ──────────────────────────────────────────────────────────────
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) return;

        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

        document.getElementById('checkoutSummary').innerHTML = `
            <div class="checkout-items">
                ${cart.map(item => `
                    <div class="checkout-item">
                        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" class="checkout-item-img">
                        <div class="checkout-item-info">
                            <span class="checkout-item-name">${escapeHtml(item.name)}</span>
                            <span class="checkout-item-qty">Qtd: ${item.qty}</span>
                        </div>
                        <span class="checkout-item-price">${formatCurrency(item.price * item.qty)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="checkout-total-row">
                <span>Total</span>
                <span class="checkout-total-value">${formatCurrency(total)}</span>
            </div>
            <p class="checkout-info">
                ℹ️ Seu pedido será anotado e a equipe do studio entrará em contato para combinar a entrega ou retirada.
            </p>`;

        document.getElementById('cartModal').style.display     = 'none';
        document.getElementById('checkoutModal').style.display = 'flex';
    });

    document.getElementById('closeCheckoutModal').addEventListener('click', () => {
        document.getElementById('checkoutModal').style.display = 'none';
        document.getElementById('cartModal').style.display     = 'flex';
    });
    document.getElementById('cancelOrderBtn').addEventListener('click', () => {
        document.getElementById('checkoutModal').style.display = 'none';
        document.getElementById('cartModal').style.display     = 'flex';
    });

    document.getElementById('confirmOrderBtn').addEventListener('click', async () => {
        const btn = document.getElementById('confirmOrderBtn');
        btn.disabled    = true;
        btn.textContent = '⏳ Processando...';

        await new Promise(r => setTimeout(r, 900));

        document.getElementById('checkoutModal').style.display = 'none';
        clearCart();
        showToast('Pedido realizado com sucesso! 🎉', 'success');

        btn.disabled    = false;
        btn.textContent = '✅ Confirmar Pedido';
    });

    // ── TOAST ─────────────────────────────────────────────────────────────────
    let toastTimer = null;
    function showToast(msg, type = 'default') {
        const toast = document.getElementById('cartToast');
        const msgEl = document.getElementById('cartToastMsg');
        if (!toast || !msgEl) return;
        msgEl.textContent = msg;
        toast.className   = `cart-toast cart-toast-${type}`;
        toast.classList.remove('hidden');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
    }

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
