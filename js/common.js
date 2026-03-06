// js/common.js
// Funções compartilhadas entre todas as páginas

/**
 * Faz uma requisição à API e retorna os dados JSON.
 */
async function fetchData(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // Envia o cookie de sessão
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(url, options);

        // Sessão expirou ou não autenticado — redireciona para login
        if (response.status === 401) {
            window.location.href = 'index.php';
            return { success: false };
        }
        if (response.status === 403) {
            alert('Você não tem permissão para realizar esta ação.');
            return { success: false };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Ocorreu um erro: ' + error.message);
        return { success: false, message: error.message };
    }
}

/**
 * Mostra apenas a seção com o ID indicado, oculta as demais.
 */
function showSection(sections, activeSectionId) {
    sections.forEach(section => {
        section.classList.toggle('hidden', section.id !== activeSectionId);
    });
}

/**
 * Marca como ativo apenas o botão com o ID indicado.
 */
function updateActiveTab(buttons, activeButtonId) {
    buttons.forEach(button => {
        button.classList.toggle('active', button.id === activeButtonId);
    });
}

/**
 * Formata data do banco (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY).
 */
function formatDateToBrazilian(dateString) {
    if (!dateString) return '--/--/----';
    // Adiciona T00:00:00 para evitar problema de timezone
    const date = new Date(dateString + 'T00:00:00');
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
}

/**
 * Formata hora (HH:MM:SS) para HH:MM.
 */
function formatTime(timeString) {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5);
}

/**
 * Formata valor numérico para moeda BRL.
 */
function formatCurrency(value) {
    return parseFloat(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Faz logout: destrói sessão no servidor e redireciona.
 */
async function logout() {
    const response = await fetchData('api/logout.php', 'POST');
    if (response.success) {
        window.location.href = 'index.php';
    } else {
        alert('Erro ao fazer logout.');
    }
}

// Torna logout acessível globalmente (botão inline no HTML)
window.logout = logout;
