// js/login.js
// Lógica das páginas index.php e cadcliente.php

document.addEventListener('DOMContentLoaded', () => {

    // ── PÁGINA DE LOGIN (index.php) ───────────────────────────────────────────
    const loginForm              = document.getElementById('loginForm');
    const clienteBtn             = document.getElementById('clienteBtn');
    const adminBtn               = document.getElementById('adminBtn');
    const emailInput             = document.getElementById('email');
    const passwordInput          = document.getElementById('password');
    const submitLoginBtn         = document.getElementById('submitLoginBtn');
    const cadastroButtonContainer = document.getElementById('cadastroButtonContainer');

    let currentRole = 'cliente';

    const handleRoleChange = (role) => {
        currentRole = role;
        if (!clienteBtn || !adminBtn || !submitLoginBtn) return;

        clienteBtn.classList.toggle('active', role === 'cliente');
        adminBtn.classList.toggle('active', role === 'admin');
        submitLoginBtn.textContent = `Entrar como ${role === 'cliente' ? 'Cliente' : 'Admin'}`;
        emailInput.placeholder = role === 'cliente' ? 'seu@email.com' : 'admin@email.com';
        emailInput.value   = '';
        passwordInput.value = '';

        if (cadastroButtonContainer) {
            cadastroButtonContainer.classList.toggle('hidden', role !== 'cliente');
        }
    };

    if (clienteBtn && adminBtn) {
        clienteBtn.addEventListener('click', () => handleRoleChange('cliente'));
        adminBtn.addEventListener('click',   () => handleRoleChange('admin'));
        handleRoleChange('cliente');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = submitLoginBtn;
            btn.disabled     = true;
            btn.textContent  = 'Entrando...';

            const response = await fetch('api/autenticacao.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    action:   'login',
                    email:    emailInput.value,
                    password: passwordInput.value,
                    role:     currentRole,
                }),
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = currentRole === 'admin' ? 'admin.php' : 'cliente.php';
            } else {
                alert(data.message || 'Erro ao fazer login.');
                btn.disabled    = false;
                btn.textContent = `Entrar como ${currentRole === 'cliente' ? 'Cliente' : 'Admin'}`;
            }
        });
    }

    // ── PÁGINA DE CADASTRO (cadcliente.php) ───────────────────────────────────
    const cadastroForm = document.getElementById('cadastroClienteForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = cadastroForm.querySelector('button[type="submit"]');
            submitBtn.disabled    = true;
            submitBtn.textContent = 'Criando conta...';

            const response = await fetch('api/autenticacao.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    action:          'register',
                    name:            document.getElementById('cadNome').value.trim(),
                    email:           document.getElementById('cadEmail').value.trim(),
                    password:        document.getElementById('cadPassword').value,
                    confirmPassword: document.getElementById('cadConfirmPassword').value,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                window.location.href = 'index.php';
            } else {
                alert(data.message || 'Erro ao criar conta.');
                submitBtn.disabled    = false;
                submitBtn.textContent = 'Criar conta';
            }
        });
    }
});
