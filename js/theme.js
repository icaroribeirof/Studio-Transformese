// js/theme.js — Gerencia o tema claro/escuro com persistência em localStorage

(function () {
    const KEY = 'st_theme';

    function getTheme() {
        const saved = localStorage.getItem(KEY);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Atualiza todos os botões de toggle na página
        document.querySelectorAll('#themeToggle').forEach(btn => {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
            btn.title = theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
        });
        localStorage.setItem(KEY, theme);
    }

    // Aplica tema salvo imediatamente (antes do paint)
    applyTheme(getTheme());

    // Inicializa os botões após o DOM estar pronto
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('#themeToggle').forEach(btn => {
            btn.addEventListener('click', function () {
                const current = document.documentElement.getAttribute('data-theme');
                applyTheme(current === 'dark' ? 'light' : 'dark');
            });
        });
    });
})();
