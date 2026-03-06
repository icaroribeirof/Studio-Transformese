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
        renderHorarios();
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

    // ── HORÁRIOS ──────────────────────────────────────────────────────────────
    const DIAS = [
        { idx: 1, nome: 'Segunda-feira',  tipo: 'Dia útil' },
        { idx: 2, nome: 'Terça-feira',    tipo: 'Dia útil' },
        { idx: 3, nome: 'Quarta-feira',   tipo: 'Dia útil' },
        { idx: 4, nome: 'Quinta-feira',   tipo: 'Dia útil' },
        { idx: 5, nome: 'Sexta-feira',    tipo: 'Dia útil' },
        { idx: 6, nome: 'Sábado',         tipo: 'Final de semana' },
        { idx: 0, nome: 'Domingo',        tipo: 'Final de semana' },
    ];

    let horariosState = {}; // cache do estado atual

    async function renderHorarios() {
        const section = document.getElementById('horariosSection');
        section.innerHTML = `
            <div class="section-header">
                <div>
                    <div class="section-title">Horários de Atendimento</div>
                    <div class="section-subtitle">Configure os dias e horários disponíveis para agendamento</div>
                </div>
            </div>
            <div class="empty-state"><div class="empty-state-icon">⏳</div><span>Carregando...</span></div>`;

        const res = await fetchData('api/horarios.php');
        if (!res.success) {
            section.innerHTML += '<div class="empty-state"><div class="empty-state-icon">⚠️</div><span>Erro ao carregar horários.</span></div>';
            return;
        }

        horariosState = res.horarios;

        const rows = DIAS.map(dia => {
            const cfg = horariosState[dia.idx] || {
                ativo: false, hora_inicio: '09:00', hora_fim: '18:00', intervalo: 30
            };
            const rowClass = cfg.ativo ? '' : 'fechado';
            return `
            <div class="horario-row ${rowClass}" id="row-dia-${dia.idx}">
                <div class="toggle-wrap">
                    <label class="toggle" title="${cfg.ativo ? 'Aberto' : 'Fechado'}">
                        <input type="checkbox" class="toggle-dia" data-dia="${dia.idx}"
                               ${cfg.ativo ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">${cfg.ativo ? 'Aberto' : 'Fechado'}</span>
                </div>
                <div class="horario-dia">
                    <span class="horario-dia-nome">${dia.nome}</span>
                    <span class="horario-dia-tipo">${dia.tipo}</span>
                </div>
                <div class="horario-inputs" id="inputs-dia-${dia.idx}">
                    <div class="horario-input-group">
                        <label>Abertura</label>
                        <input type="time" class="input-inicio" data-dia="${dia.idx}"
                               value="${cfg.hora_inicio}" ${cfg.ativo ? '' : 'disabled'}>
                    </div>
                    <span class="horario-sep">→</span>
                    <div class="horario-input-group">
                        <label>Fechamento</label>
                        <input type="time" class="input-fim" data-dia="${dia.idx}"
                               value="${cfg.hora_fim}" ${cfg.ativo ? '' : 'disabled'}>
                    </div>
                    <div class="horario-input-group">
                        <label>Intervalo</label>
                        <select class="select-intervalo" data-dia="${dia.idx}" ${cfg.ativo ? '' : 'disabled'}>
                            <option value="15"  ${cfg.intervalo===15  ? 'selected':''}>15 min</option>
                            <option value="30"  ${cfg.intervalo===30  ? 'selected':''}>30 min</option>
                            <option value="45"  ${cfg.intervalo===45  ? 'selected':''}>45 min</option>
                            <option value="60"  ${cfg.intervalo===60  ? 'selected':''}>1 hora</option>
                            <option value="90"  ${cfg.intervalo===90  ? 'selected':''}>1h30</option>
                            <option value="120" ${cfg.intervalo===120 ? 'selected':''}>2 horas</option>
                        </select>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Preview do dia selecionado
        const previewDia = Object.keys(horariosState).find(k => horariosState[k].ativo) ?? 1;
        section.innerHTML = `
            <div class="section-header">
                <div>
                    <div class="section-title">Horários de Atendimento</div>
                    <div class="section-subtitle">Configure os dias e horários disponíveis para agendamento</div>
                </div>
            </div>
            <div class="horarios-grid">${rows}</div>
            <div class="slots-preview" id="slotsPreview">
                <div class="slots-preview-title">Preview dos slots — <span id="previewDiaNome">Segunda-feira</span></div>
                <div class="slots-list" id="slotsList"></div>
            </div>
            <div class="horarios-actions">
                <span class="horarios-hint">💡 Alterações são aplicadas imediatamente para novos agendamentos</span>
                <button class="btn-primary" id="saveHorariosBtn">💾 Salvar Horários</button>
            </div>`;

        // Wire toggles
        section.querySelectorAll('.toggle-dia').forEach(chk => {
            chk.addEventListener('change', () => toggleDia(chk));
        });

        // Wire inputs → update preview on change
        section.querySelectorAll('.input-inicio, .input-fim, .select-intervalo').forEach(input => {
            input.addEventListener('change', () => updateSlotsPreview(parseInt(input.dataset.dia)));
        });

        // Save button
        document.getElementById('saveHorariosBtn').addEventListener('click', saveHorarios);

        // Initial preview
        updateSlotsPreview(parseInt(previewDia));

        // Wire dia name click → update preview
        section.querySelectorAll('.horario-dia-nome').forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                const dia = parseInt(el.closest('.horario-row').querySelector('[data-dia]').dataset.dia);
                const nome = el.textContent;
                document.getElementById('previewDiaNome').textContent = nome;
                updateSlotsPreview(dia);
            });
        });
    }

    function toggleDia(chk) {
        const dia     = parseInt(chk.dataset.dia);
        const row     = document.getElementById('row-dia-' + dia);
        const label   = row.querySelector('.toggle-label');
        const inputs  = row.querySelectorAll('input[type="time"], select');
        const ativo   = chk.checked;

        row.classList.toggle('fechado', !ativo);
        label.textContent = ativo ? 'Aberto' : 'Fechado';
        inputs.forEach(i => i.disabled = !ativo);
        updateSlotsPreview(dia);
    }

    function generateSlots(inicio, fim, intervalo) {
        if (!inicio || !fim || inicio >= fim) return [];
        const slots = [];
        let [h, m] = inicio.split(':').map(Number);
        const [hf, mf] = fim.split(':').map(Number);
        const fimMin = hf * 60 + mf;
        while (true) {
            const totalMin = h * 60 + m;
            if (totalMin >= fimMin) break;
            slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
            m += intervalo;
            if (m >= 60) { h += Math.floor(m/60); m = m % 60; }
        }
        return slots;
    }

    function updateSlotsPreview(dia) {
        const preview = document.getElementById('slotsPreview');
        const list    = document.getElementById('slotsList');
        if (!preview || !list) return;

        const row        = document.getElementById('row-dia-' + dia);
        if (!row) return;

        const ativo      = !row.classList.contains('fechado');
        const inicio     = row.querySelector('.input-inicio')?.value;
        const fim        = row.querySelector('.input-fim')?.value;
        const intervalo  = parseInt(row.querySelector('.select-intervalo')?.value || 30);
        const nome       = row.querySelector('.horario-dia-nome')?.textContent || '';

        document.getElementById('previewDiaNome').textContent = nome;

        if (!ativo || !inicio || !fim) {
            list.innerHTML = '<span style="color:var(--text-3);font-size:.85rem;font-style:italic">Dia fechado — sem slots disponíveis</span>';
            return;
        }

        const slots = generateSlots(inicio, fim, intervalo);
        if (slots.length === 0) {
            list.innerHTML = '<span style="color:var(--warning);font-size:.85rem">⚠️ Configuração inválida (abertura ≥ fechamento)</span>';
            return;
        }
        list.innerHTML = slots.map(s => `<span class="slot-chip">${s}</span>`).join('');
    }

    async function saveHorarios() {
        const btn = document.getElementById('saveHorariosBtn');
        btn.disabled    = true;
        btn.textContent = '⏳ Salvando...';

        const horarios = DIAS.map(dia => {
            const row       = document.getElementById('row-dia-' + dia.idx);
            const ativo     = !row.classList.contains('fechado');
            const inicio    = row.querySelector('.input-inicio')?.value || '09:00';
            const fim       = row.querySelector('.input-fim')?.value    || '18:00';
            const intervalo = parseInt(row.querySelector('.select-intervalo')?.value || 30);
            return { dia_semana: dia.idx, ativo, hora_inicio: inicio, hora_fim: fim, intervalo };
        });

        const res = await fetchData('api/horarios.php', 'PUT', { horarios });
        if (res.success) {
            btn.textContent = '✅ Salvo!';
            setTimeout(() => { btn.textContent = '💾 Salvar Horários'; btn.disabled = false; }, 2000);
        } else {
            alert('Erro ao salvar: ' + res.message);
            btn.textContent = '💾 Salvar Horários';
            btn.disabled = false;
        }
    }

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
