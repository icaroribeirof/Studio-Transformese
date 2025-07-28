document.addEventListener('DOMContentLoaded', () => {
    // Funções de utilidade (podem ser movidas para um arquivo utils.js se a aplicação crescer)
    const getStoredData = (key) => {
        return JSON.parse(localStorage.getItem(key)) || [];
    };

    const setStoredData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
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
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        window.location.href = 'index.html'; // Redireciona se não for admin
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
    const adminUserEmailInput = document.getElementById('adminUserEmail');
    const adminUserPasswordInput = document.getElementById('adminUserPassword');
    const saveAdminUserBtn = document.getElementById('saveAdminUserBtn');
    const adminUsersList = document.getElementById('adminUsersList');

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
    const renderAdminUsers = () => {
        const admins = getStoredData('adminUsers');
        if (admins.length === 0) {
            adminUsersList.innerHTML = '<li>Nenhum administrador cadastrado.</li>';
        } else {
            adminUsersList.innerHTML = admins.map(admin => `
                <li>
                    <div class="item-info">
                        <strong>${admin.email}</strong>
                        <span>Senha: ******</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-edit" onclick="editAdminUser('${admin.id}')">Editar</button>
                        <button class="btn btn-delete" onclick="deleteAdminUser('${admin.id}')">Excluir</button>
                    </div>
                </li>
            `).join('');
        }
    };

    adminUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = adminUserIdInput.value;
        const email = adminUserEmailInput.value;
        const password = adminUserPasswordInput.value; // Em um app real, use hash de senha!

        if (password.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        let admins = getStoredData('adminUsers');

        if (id) {
            // Editando
            const index = admins.findIndex(a => a.id === id);
            if (index !== -1) {
                admins[index] = { id, email, password };
            }
        } else {
            // Adicionando novo
            // Validação simples para evitar emails duplicados
            if (admins.some(admin => admin.email === email)) {
                alert('Já existe um administrador com este email.');
                return;
            }
            const newAdmin = {
                id: Date.now().toString(),
                email,
                password
            };
            admins.push(newAdmin);
        }
        setStoredData('adminUsers', admins);
        renderAdminUsers();
        adminUserForm.reset();
        saveAdminUserBtn.textContent = 'Adicionar Administrador';
    });

    window.editAdminUser = (id) => {
        const admins = getStoredData('adminUsers');
        const adminToEdit = admins.find(admin => admin.id === id);
        if (adminToEdit) {
            adminUserIdInput.value = adminToEdit.id;
            adminUserEmailInput.value = adminToEdit.email;
            adminUserPasswordInput.value = adminToEdit.password; // Em um app real, você não pré-preencheria a senha
            saveAdminUserBtn.textContent = 'Atualizar Administrador';
        }
    };

    window.deleteAdminUser = (id) => {
        if (confirm('Tem certeza que deseja excluir este administrador?')) {
            let admins = getStoredData('adminUsers');
            // Impede a exclusão do último admin (ou do admin logado se quiser ser mais rigoroso)
            if (admins.length <= 1 && admins[0].id === id) {
                alert('Não é possível excluir o único administrador.');
                return;
            }
            admins = admins.filter(admin => admin.id !== id);
            setStoredData('adminUsers', admins);
            renderAdminUsers();
        }
    };

    // --- Gerenciamento de Categorias de Produtos ---
    const renderProductCategories = () => {
        const categories = getStoredData('productCategories');
        if (categories.length === 0) {
            productCategoriesList.innerHTML = '<li>Nenhuma categoria cadastrada.</li>';
        } else {
            productCategoriesList.innerHTML = categories.map(category => `
                <li>
                    <div class="item-info">
                        <strong>${category.name}</strong>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-edit" onclick="editProductCategory('${category.id}')">Editar</button>
                        <button class="btn btn-delete" onclick="deleteProductCategory('${category.id}')">Excluir</button>
                    </div>
                </li>
            `).join('');
        }
    };

    productCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = productCategoryIdInput.value;
        const name = productCategoryNameInput.value.trim();

        if (!name) {
            alert('O nome da categoria não pode ser vazio.');
            return;
        }

        let categories = getStoredData('productCategories');

        if (id) {
            // Editando
            const index = categories.findIndex(c => c.id === id);
            if (index !== -1) {
                categories[index].name = name;
            }
        } else {
            // Adicionando novo
            // Validação simples para evitar nomes duplicados (case-insensitive)
            if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
                alert('Já existe uma categoria com este nome.');
                return;
            }
            const newCategory = {
                id: Date.now().toString(),
                name
            };
            categories.push(newCategory);
        }
        setStoredData('productCategories', categories);
        renderProductCategories();
        productCategoryForm.reset();
        saveProductCategoryBtn.textContent = 'Adicionar Categoria';
        updateProductCategoryDropdown(); // Atualiza o dropdown na tela de produtos
    });

    window.editProductCategory = (id) => {
        const categories = getStoredData('productCategories');
        const categoryToEdit = categories.find(category => category.id === id);
        if (categoryToEdit) {
            productCategoryIdInput.value = categoryToEdit.id;
            productCategoryNameInput.value = categoryToEdit.name;
            saveProductCategoryBtn.textContent = 'Atualizar Categoria';
        }
    };

    window.deleteProductCategory = (id) => {
        if (confirm('Tem certeza que deseja excluir esta categoria? Isso não removerá os produtos que a usam.')) {
            let categories = getStoredData('productCategories');
            categories = categories.filter(category => category.id !== id);
            setStoredData('productCategories', categories);
            renderProductCategories();
            updateProductCategoryDropdown(); // Atualiza o dropdown na tela de produtos
        }
    };

    // --- Gerenciamento de Serviços ---
    const renderServices = () => {
        const services = getStoredData('services');
        if (services.length === 0) {
            servicesList.innerHTML = '<li>Nenhum serviço cadastrado.</li>';
        } else {
            servicesList.innerHTML = services.map(service => `
                <li>
                    <div class="item-info">
                        <strong>${service.name}</strong>
                        <span>Preço: R$ ${service.price.toFixed(2).replace('.', ',')}</span>
                        ${service.description ? `<span>${service.description}</span>` : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-edit" onclick="editService('${service.id}')">Editar</button>
                        <button class="btn btn-delete" onclick="deleteService('${service.id}')">Excluir</button>
                    </div>
                </li>
            `).join('');
        }
    };

    serviceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = serviceIdInput.value;
        const name = serviceNameInput.value.trim();
        const price = parseFloat(servicePriceInput.value);
        const description = serviceDescriptionTextarea.value.trim();

        if (!name || isNaN(price) || price <= 0) {
            alert('Por favor, preencha o nome e um preço válido para o serviço.');
            return;
        }

        let services = getStoredData('services');

        if (id) {
            // Editando
            const index = services.findIndex(s => s.id === id);
            if (index !== -1) {
                services[index] = { id, name, price, description };
            }
        } else {
            // Adicionando novo
            // Validação simples para evitar nomes duplicados (case-insensitive)
            if (services.some(svc => svc.name.toLowerCase() === name.toLowerCase())) {
                alert('Já existe um serviço com este nome.');
                return;
            }
            const newService = {
                id: Date.now().toString(),
                name,
                price,
                description
            };
            services.push(newService);
        }
        setStoredData('services', services);
        renderServices();
        serviceForm.reset();
        saveServiceBtn.textContent = 'Adicionar Serviço';
        updateServiceDropdown(); // Atualiza o dropdown na tela de agendamentos
    });

    window.editService = (id) => {
        const services = getStoredData('services');
        const serviceToEdit = services.find(service => service.id === id);
        if (serviceToEdit) {
            serviceIdInput.value = serviceToEdit.id;
            serviceNameInput.value = serviceToEdit.name;
            servicePriceInput.value = serviceToEdit.price;
            serviceDescriptionTextarea.value = serviceToEdit.description;
            saveServiceBtn.textContent = 'Atualizar Serviço';
        }
    };

    window.deleteService = (id) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            let services = getStoredData('services');
            services = services.filter(service => service.id !== id);
            setStoredData('services', services);
            renderServices();
            updateServiceDropdown(); // Atualiza o dropdown na tela de agendamentos
        }
    };

    // --- Funções para Sincronizar Dropdowns (chamadas no script.js principal também) ---
    // Esta função será chamada a partir de script.js para preencher o dropdown de categorias de produto
    window.updateProductCategoryDropdown = () => {
        const productCategorySelect = document.getElementById('productCategory');
        if (productCategorySelect) {
            const categories = getStoredData('productCategories');
            productCategorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name; // Usamos o nome como valor
                option.textContent = category.name;
                productCategorySelect.appendChild(option);
            });
        }
    };

    // Esta função será chamada a partir de script.js para preencher o dropdown de serviços
    window.updateServiceDropdown = () => {
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
            const services = getStoredData('services');
            serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';
            services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.name; // Usamos o nome como valor
                option.textContent = `${service.name} (R$ ${service.price.toFixed(2).replace('.', ',')})`;
                serviceSelect.appendChild(option);
            });
        }
    };


    // --- Inicialização da Página ---
    // Configura o admin padrão se não houver nenhum
    let adminUsers = getStoredData('adminUsers');
    if (adminUsers.length === 0) {
        adminUsers = [{ id: 'admin-default', email: 'admin@tranca.com', password: 'admin123' }];
        setStoredData('adminUsers', adminUsers);
    }
     // Inicializa as categorias padrão se não houver nenhuma
    let productCategories = getStoredData('productCategories');
    if (productCategories.length === 0) {
        productCategories = [
            { id: 'cat-oleos', name: 'Óleos Capilares' },
            { id: 'cat-cremes', name: 'Cremes' },
            { id: 'cat-shampoos', name: 'Shampoos' }
        ];
        setStoredData('productCategories', productCategories);
    }

    // Inicializa os serviços padrão se não houver nenhum
    let services = getStoredData('services');
    if (services.length === 0) {
        services = [
            { id: 'svc-nago', name: 'Trança Nagô', price: 80.00, description: 'Trança rentes ao couro cabeludo.' },
            { id: 'svc-boxbraids', name: 'Box Braids', price: 250.00, description: 'Tranças soltas com alongamento.' },
            { id: 'svc-crochet', name: 'Crochet Braids', price: 180.00, description: 'Cabelo sintético aplicado com agulha de crochet.' }
        ];
        setStoredData('services', services);
    }

    renderAdminUsers();
    renderProductCategories();
    renderServices(); // Renderiza a primeira aba
    // A primeira aba já estará ativa por padrão no HTML
});