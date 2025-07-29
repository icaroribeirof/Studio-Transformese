document.addEventListener('DOMContentLoaded', () => {
    // Funções de utilidade (agora usam a API)
    const getStoredData = (key) => {
        // Ainda pode ser usado para dados de sessão, mas não para dados persistentes
        return JSON.parse(sessionStorage.getItem(key)) || null;
    };

    const setStoredData = (key, data) => {
        sessionStorage.setItem(key, JSON.stringify(data));
    };

    const fetchData = async (url, method = 'GET', data = null) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Ocorreu um erro: ' + error.message);
            return { success: false, message: error.message };
        }
    };

    const showSection = (sections, activeSectionId) => {
        sections.forEach(section => {
            if (section.id === activeSectionId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    };

    const updateActiveTab = (buttons, activeButtonId) => {
        buttons.forEach(button => {
            if (button.id === activeButtonId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    };

    // Verificação de login e role (Admin)
    const loggedInUser = getStoredData('loggedInUser');
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        window.location.href = 'index.php'; // Redireciona se não for admin
        return;
    }

    // --- Elementos HTML da Página de Configurações ---
    const adminUsersTab = document.getElementById('adminUsersTab');
    const productCategoriesTab = document.getElementById('productCategoriesTab');
    const servicesTab = document.getElementById('servicesTab');

    const adminUsersSection = document.getElementById('adminUsersSection');
    const productCategoriesSection = document.getElementById('productCategoriesSection');
    const servicesSection = document.getElementById('servicesSection');

    // Administradores
    const adminUserForm = document.getElementById('adminUserForm');
    const adminUserIdInput = document.getElementById('adminUserId');
    const adminUserNameInput = document.getElementById('adminUserName');
    const adminUserEmailInput = document.getElementById('adminUserEmail');
    const adminUserPasswordInput = document.getElementById('adminUserPassword');
    const saveAdminUserBtn = document.getElementById('saveAdminUserBtn');
    const adminUsersList = document.getElementById('adminUsersList');
    const adminHeaderTitle = document.getElementById('adminHeaderTitle');

    // Categorias de Produtos
    const productCategoryForm = document.getElementById('productCategoryForm');
    const productCategoryIdInput = document.getElementById('productCategoryId');
    const productCategoryNameInput = document.getElementById('productCategoryName');
    const saveProductCategoryBtn = document.getElementById('saveProductCategoryBtn');
    const productCategoriesList = document.getElementById('productCategoriesList');

    // Serviços
    const serviceForm = document.getElementById('serviceForm');
    const serviceIdInput = document.getElementById('serviceId');
    const serviceNameInput = document.getElementById('serviceName');
    const servicePriceInput = document.getElementById('servicePrice');
    const serviceDescriptionTextarea = document.getElementById('serviceDescription');
    const saveServiceBtn = document.getElementById('saveServiceBtn');
    const servicesList = document.getElementById('servicesList');

    // --- Lógica de Navegação das Abas ---
    const tabs = [adminUsersTab, productCategoriesTab, servicesTab];
    const sections = [adminUsersSection, productCategoriesSection, servicesSection];

    adminUsersTab.addEventListener('click', () => {
        showSection(sections, 'adminUsersSection');
        updateActiveTab(tabs, 'adminUsersTab');
        renderAdminUsers();
    });

    productCategoriesTab.addEventListener('click', () => {
        showSection(sections, 'productCategoriesSection');
        updateActiveTab(tabs, 'productCategoriesTab');
        renderProductCategories();
    });

    servicesTab.addEventListener('click', () => {
        showSection(sections, 'servicesSection');
        updateActiveTab(tabs, 'servicesTab');
        renderServices();
    });

    // --- Gerenciamento de Administradores ---
    const renderAdminUsers = async () => {
        const response = await fetchData('api/autenticacao.php?action=get_admins');
        if (response.success) {
            const admins = response.admins;
            if (admins.length === 0) {
                adminUsersList.innerHTML = '<li>Nenhum administrador cadastrado.</li>';
            } else {
                adminUsersList.innerHTML = admins.map(admin => `
                    <li>
                        <div class="item-info">
                            <strong>${admin.nome || admin.email}</strong> <span>Email: ${admin.email}</span>
                            <span>Senha: ******</span>
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-edit" onclick="editAdminUser('${admin.id}')">Editar</button>
                            <button class="btn btn-delete" onclick="deleteAdminUser('${admin.id}')">Excluir</button>
                        </div>
                    </li>
                `).join('');
            }
        } else {
            console.error('Falha ao carregar administradores:', response.message);
            adminUsersList.innerHTML = '<li>Erro ao carregar administradores.</li>';
        }
    };

    adminUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = adminUserIdInput.value;
        const name = adminUserNameInput.value.trim();
        const email = adminUserEmailInput.value.trim();
        const password = adminUserPasswordInput.value;

        const action = id ? 'update_admin' : 'add_admin';
        const data = { id, name, email, password, action };

        const response = await fetchData('api/autenticacao.php', 'POST', data);

        if (response.success) {
            alert(response.message);
            renderAdminUsers();
            adminUserForm.reset();
            saveAdminUserBtn.textContent = 'Adicionar Administrador';
        } else {
            alert(response.message);
        }
    });

    window.editAdminUser = async (id) => {
        const response = await fetchData('api/autenticacao.php?action=get_admins');
        if (response.success) {
            const admins = response.admins;
            const adminToEdit = admins.find(admin => admin.id == id); // Comparação flexível
            if (adminToEdit) {
                adminUserIdInput.value = adminToEdit.id;
                adminUserNameInput.value = adminToEdit.nome || '';
                adminUserEmailInput.value = adminToEdit.email;
                // Em um app real, você não pré-preencheria a senha por segurança
                // adminUserPasswordInput.value = adminToEdit.senha;
                adminUserPasswordInput.value = ''; // Limpa a senha para que o admin digite novamente
                saveAdminUserBtn.textContent = 'Atualizar Administrador';
            }
        } else {
            alert('Erro ao carregar administrador para edição: ' + response.message);
        }
    };

    window.deleteAdminUser = async (id) => {
        if (confirm('Tem certeza que deseja excluir este administrador?')) {
            const response = await fetchData('api/autenticacao.php', 'POST', { action: 'delete_admin', id: id });
            if (response.success) {
                alert(response.message);
                renderAdminUsers();
            } else {
                alert('Erro ao excluir administrador: ' + response.message);
            }
        }
    };

    // --- Gerenciamento de Categorias de Produtos ---
    const renderProductCategories = async () => {
        const response = await fetchData('api/categorias.php');
        if (response.success) {
            const categories = response.categories;
            if (categories.length === 0) {
                productCategoriesList.innerHTML = '<li>Nenhuma categoria cadastrada.</li>';
            } else {
                productCategoriesList.innerHTML = categories.map(category => `
                    <li>
                        <div class="item-info">
                            <strong>${category.nome}</strong>
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-edit" onclick="editProductCategory('${category.id}')">Editar</button>
                            <button class="btn btn-delete" onclick="deleteProductCategory('${category.id}')">Excluir</button>
                        </div>
                    </li>
                `).join('');
            }
        } else {
            console.error('Falha ao carregar categorias:', response.message);
            productCategoriesList.innerHTML = '<li>Erro ao carregar categorias.</li>';
        }
    };

    productCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = productCategoryIdInput.value;
        const name = productCategoryNameInput.value.trim();

        const method = id ? 'PUT' : 'POST';
        const url = 'api/categorias.php';
        const data = { id, name };

        const response = await fetchData(url, method, data);

        if (response.success) {
            alert(response.message);
            renderProductCategories();
            productCategoryForm.reset();
            saveProductCategoryBtn.textContent = 'Adicionar Categoria';
            // Chama a função global para atualizar o dropdown na tela de produtos (se existir)
            if (window.updateProductCategoryDropdown) {
                window.updateProductCategoryDropdown();
            }
        } else {
            alert(response.message);
        }
    });

    window.editProductCategory = async (id) => {
        const response = await fetchData('api/categorias.php');
        if (response.success) {
            const categories = response.categories;
            const categoryToEdit = categories.find(category => category.id == id);
            if (categoryToEdit) {
                productCategoryIdInput.value = categoryToEdit.id;
                productCategoryNameInput.value = categoryToEdit.nome;
                saveProductCategoryBtn.textContent = 'Atualizar Categoria';
            }
        } else {
            alert('Erro ao carregar categoria para edição: ' + response.message);
        }
    };

    window.deleteProductCategory = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta categoria? Isso não removerá os produtos que a usam.')) {
            const response = await fetchData('api/categorias.php', 'DELETE', { id: id });
            if (response.success) {
                alert(response.message);
                renderProductCategories();
                // Chama a função global para atualizar o dropdown na tela de produtos (se existir)
                if (window.updateProductCategoryDropdown) {
                    window.updateProductCategoryDropdown();
                }
            } else {
                alert('Erro ao excluir categoria: ' + response.message);
            }
        }
    };

    // --- Gerenciamento de Serviços ---
    const renderServices = async () => {
        const response = await fetchData('api/servicos.php');
        if (response.success) {
            const services = response.services;
            if (services.length === 0) {
                servicesList.innerHTML = '<li>Nenhum serviço cadastrado.</li>';
            } else {
                servicesList.innerHTML = services.map(service => `
                    <li>
                        <div class="item-info">
                            <strong>${service.nome}</strong>
                            <span>Preço: R$ ${parseFloat(service.preco).toFixed(2).replace('.', ',')}</span>
                            ${service.descricao ? `<span>${service.descricao}</span>` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-edit" onclick="editService('${service.id}')">Editar</button>
                            <button class="btn btn-delete" onclick="deleteService('${service.id}')">Excluir</button>
                        </div>
                    </li>
                `).join('');
            }
        } else {
            console.error('Falha ao carregar serviços:', response.message);
            servicesList.innerHTML = '<li>Erro ao carregar serviços.</li>';
        }
    };

    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = serviceIdInput.value;
        const name = serviceNameInput.value.trim();
        const price = parseFloat(servicePriceInput.value);
        const description = serviceDescriptionTextarea.value.trim();

        const method = id ? 'PUT' : 'POST';
        const url = 'api/servicos.php';
        const data = { id, name, price, description };

        const response = await fetchData(url, method, data);

        if (response.success) {
            alert(response.message);
            renderServices();
            serviceForm.reset();
            saveServiceBtn.textContent = 'Adicionar Serviço';
            // Chama a função global para atualizar o dropdown na tela de agendamentos (se existir)
            if (window.updateServiceDropdown) {
                window.updateServiceDropdown();
            }
        } else {
            alert(response.message);
        }
    });

    window.editService = async (id) => {
        const response = await fetchData('api/servicos.php');
        if (response.success) {
            const services = response.services;
            const serviceToEdit = services.find(service => service.id == id);
            if (serviceToEdit) {
                serviceIdInput.value = serviceToEdit.id;
                serviceNameInput.value = serviceToEdit.nome;
                servicePriceInput.value = parseFloat(serviceToEdit.preco).toFixed(2);
                serviceDescriptionTextarea.value = serviceToEdit.descricao;
                saveServiceBtn.textContent = 'Atualizar Serviço';
            }
        } else {
            alert('Erro ao carregar serviço para edição: ' + response.message);
        }
    };

    window.deleteService = async (id) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            const response = await fetchData('api/servicos.php', 'DELETE', { id: id });
            if (response.success) {
                alert(response.message);
                renderServices();
                // Chama a função global para atualizar o dropdown na tela de agendamentos (se existir)
                if (window.updateServiceDropdown) {
                    window.updateServiceDropdown();
                }
            } else {
                alert('Erro ao excluir serviço: ' + response.message);
            }
        }
    };

    // --- Funções para Sincronizar Dropdowns (chamadas no script.js principal também) ---
    // Estas funções são definidas aqui e também no script.js para garantir que estejam disponíveis
    // em ambas as páginas que as utilizam.
    window.updateProductCategoryDropdown = async () => {
        const productCategorySelect = document.getElementById('productCategory');
        if (productCategorySelect) {
            const response = await fetchData('api/categorias.php');
            if (response.success) {
                const categories = response.categories;
                productCategorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.nome;
                    option.textContent = category.nome;
                    productCategorySelect.appendChild(option);
                });
            } else {
                console.error('Falha ao carregar categorias de produto:', response.message);
            }
        }
    };

    window.updateServiceDropdown = async () => {
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
            const response = await fetchData('api/servicos.php');
            if (response.success) {
                const services = response.services;
                serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';
                services.forEach(service => {
                    const option = document.createElement('option');
                    option.value = service.nome;
                    option.textContent = `${service.nome} (R$ ${parseFloat(service.preco).toFixed(2).replace('.', ',')})`;
                    serviceSelect.appendChild(option);
                });
            } else {
                console.error('Falha ao carregar serviços:', response.message);
            }
        }
    };

    // --- Inicialização da Página ---
    // A inicialização de dados padrão (admin, categorias, serviços) agora pode ser feita
    // diretamente no banco de dados ou através de um script de seed PHP.
    // O JS apenas carrega o que já existe.

    renderAdminUsers();
    renderProductCategories();
    renderServices(); // Renderiza a primeira aba (Administradores)

    // Exibe o nome do admin no cabeçalho da página de configurações
    if (adminHeaderTitle && loggedInUser && loggedInUser.name) {
        adminHeaderTitle.textContent = `Configurações Admin - ${loggedInUser.name}`;
    } else if (adminHeaderTitle && loggedInUser && loggedInUser.email) {
        adminHeaderTitle.textContent = `Configurações Admin - ${loggedInUser.email.split('@')[0]}`;
    }
});