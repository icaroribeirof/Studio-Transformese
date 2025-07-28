document.addEventListener('DOMContentLoaded', () => {
    // --- Common Functions ---
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

    const logout = () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    };

    window.logout = logout; // Make logout accessible globally

    // --- Login Page Logic (index.html) ---
    const loginForm = document.getElementById('loginForm');
    const clienteBtn = document.getElementById('clienteBtn');
    const adminBtn = document.getElementById('adminBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitLoginBtn = document.getElementById('submitLoginBtn');

    let currentRole = 'cliente'; // Default role

    const handleRoleChange = (role) => {
        currentRole = role;
        if (clienteBtn && adminBtn && submitLoginBtn) {
            clienteBtn.classList.toggle('active', role === 'cliente');
            adminBtn.classList.toggle('active', role === 'admin');
            submitLoginBtn.textContent = `Entrar como ${role.charAt(0).toUpperCase() + role.slice(1)}`;
            emailInput.placeholder = role === 'cliente' ? 'seu@email.com' : 'admin@email.com';
            
            emailInput.value = '';
            passwordInput.value = '';
        }
    };

    if (clienteBtn && adminBtn) {
        clienteBtn.addEventListener('click', () => handleRoleChange('cliente'));
        adminBtn.addEventListener('click', () => handleRoleChange('admin'));
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;

            // Pega os usuários admins do localStorage
            const adminUsers = getStoredData('adminUsers');
            const foundAdmin = adminUsers.find(admin => admin.email === email && admin.password === password);

            // Login do cliente fixo (para demonstração)
            if (currentRole === 'cliente' && email === 'cliente@email.com' && password === 'cliente123') {
                localStorage.setItem('loggedInUser', JSON.stringify({ email: email, role: 'cliente' }));
                window.location.href = 'cliente.html';
            } else if (currentRole === 'admin' && foundAdmin) { // Usando adminUsers do localStorage
                localStorage.setItem('loggedInUser', JSON.stringify({ email: email, role: 'admin' }));
                window.location.href = 'admin.html';
            } else {
                alert('Credenciais inválidas. Tente novamente.');
            }
        });
    }

    // --- Client Dashboard Logic (cliente.html) ---
    const agendamentosTab = document.getElementById('agendamentosTab');
    const produtosTab = document.getElementById('produtosTab');
    const agendamentosSection = document.getElementById('agendamentosSection');
    const produtosSection = document.getElementById('produtosSection');
    const scheduleAppointmentBtn = document.getElementById('scheduleAppointmentBtn');
    const serviceSelect = document.getElementById('service');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const observationsTextarea = document.getElementById('observations');
    const appointmentsList = document.getElementById('appointmentsList');
    const noAppointmentsMessage = document.getElementById('noAppointments');
    const availableProductsDiv = document.getElementById('availableProducts');
    const welcomeMessage = document.getElementById('welcomeMessage');

    const renderClientAppointments = () => {
        let appointments = getStoredData('appointments').filter(app => app.clientEmail === (JSON.parse(localStorage.getItem('loggedInUser'))?.email || ''));
        
        // Ordenar agendamentos: mais recentes primeiro
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA; // Decrescente (mais recente primeiro)
        });

        if (appointments.length === 0) {
            noAppointmentsMessage.classList.remove('hidden');
            appointmentsList.innerHTML = '';
        } else {
            noAppointmentsMessage.classList.add('hidden');
            appointmentsList.innerHTML = appointments.map(app => `
                <div class="appointment-card">
                    <div class="info">
                        <h3>${app.service}</h3>
                        <p>Cliente: ${app.clientEmail}</p>
                        <div class="details">
                            <span>
                                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmktY2FsZW5kYXIiPgogIDxwYXRoIGQ9Ik0zLjUgMGExLjUuNSAwIDAgMSAxLjUuNXYxSDEwdi0xYTEuNS41IDAgMCAxIDEuNS0uNWwxLjUuNWEuNS41IDAgMCAxIC41LjV2OWExLjUuNSAwIDAgMS0uNS41bC0xLjUuNWEuNS41IDAgMCAxLS41LS41VjExSDUuNXYxYTEuNS41IDAgMCAxLTEuNS41TDIgMTIuNWExLjUuNSAwIDAgMS0uNS0uNVY0LjVhLjUuNSAwIDAgMSAuNS0uNWwxLjUtLjV6Ii8+Cjwvc3ZnPg==" alt="Date Icon">
                                ${app.date}
                            </span>
                            <span>
                                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmktY2xvY2siPgogIDxwYXRoIGQ9Ik04IDBhOC4wMDEgOC4wMDEgMCAwIDAgMCAxNGE4LjAwMSA4LjAwMSAwIDAgMCAwLTE0em0wIDEuNWE2LjUgNi41IDAgMSAxIDAgMTNhNi41IDY2NTUgMCAwIDAgMC0xM3ptMCAyYTUuNSAzNy41IDAgMCAwIDAgMTEgNS41IDE1LjUgMCAwIDAgMC0xMXoiLz4KPC9zdmc+" alt="Time Icon">
                                ${app.time}
                            </span>
                        </div>
                        ${app.observations ? `<p>Obs: ${app.observations}</p>` : ''}
                    </div>
                    <div class="status ${app.status === 'Agendado' ? 'status-scheduled' : app.status === 'Concluído' ? 'status-completed' : 'status-cancelled'}">${app.status}</div>
                </div>
            `).join('');
        }
    };

    const renderClientProducts = () => {
        const products = getStoredData('products');
        if (products.length === 0) {
            availableProductsDiv.innerHTML = '<p class="empty-state">Nenhum produto disponível no momento.</p>';
        } else {
            availableProductsDiv.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'}" alt="${product.name}">
                    <div class="info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-buy" data-id="${product.id}">Comprar</button>
                    </div>
                </div>
            `).join('');

            availableProductsDiv.querySelectorAll('.btn-buy').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    alert(`Produto com ID ${productId} adicionado ao carrinho (funcionalidade a ser implementada).`);
                });
            });
        }
    };

    const generateTimeSlots = () => {
        timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
        timeSelect.disabled = true;
        const selectedDate = dateInput.value;
        if (selectedDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for comparison

            const dateObj = new Date(selectedDate + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
            dateObj.setHours(0, 0, 0, 0); // Reset time for comparison

            let startHour = 9; // Default start hour
            const endHour = 18; // Default end hour

            if (dateObj.getTime() === today.getTime()) { // If today
                const currentHour = new Date().getHours();
                startHour = Math.max(startHour, currentHour + 1); // Start from next hour
            }

            if (startHour <= endHour) { // Only generate if valid range
                for (let i = startHour; i <= endHour; i++) {
                    const hour = String(i).padStart(2, '0');
                    timeSelect.innerHTML += `<option value="${hour}:00">${hour}:00</option>`;
                }
                timeSelect.disabled = false;
            }
        }
    };

    if (agendamentosTab && produtosTab && agendamentosSection && produtosSection) {
        // Check if user is logged in as client
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'cliente') {
            window.location.href = 'index.html'; // Redirect if not logged in as client
            return;
        }
        welcomeMessage.textContent = `Olá, ${loggedInUser.email.split('@')[0]}!`;

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

        dateInput.addEventListener('change', generateTimeSlots);

        scheduleAppointmentBtn.addEventListener('click', () => {
            const service = serviceSelect.value;
            const date = dateInput.value;
            const time = timeSelect.value;
            const observations = observationsTextarea.value;
            const clientEmail = loggedInUser.email;

            if (service && date && time && clientEmail) {
                const appointments = getStoredData('appointments');
                const newAppointment = {
                    id: Date.now().toString(),
                    clientEmail,
                    service,
                    date,
                    time,
                    observations,
                    status: 'Agendado'
                };
                appointments.push(newAppointment);
                setStoredData('appointments', appointments);
                alert('Agendamento realizado com sucesso!');
                serviceSelect.value = '';
                dateInput.value = '';
                timeSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>'; // Reset time slots
                timeSelect.disabled = true;
                observationsTextarea.value = '';
                renderClientAppointments();
            } else {
                alert('Por favor, preencha todos os campos obrigatórios.');
            }
        });

        // Initial render for client dashboard
        updateServiceDropdown(); // Popula o dropdown de serviços ao carregar a página do cliente
        renderClientAppointments();
        renderClientProducts();
    }

    // --- Admin Dashboard Logic (admin.html) ---
    const adminAgendamentosTab = document.getElementById('adminAgendamentosTab');
    const adminProdutosTab = document.getElementById('adminProdutosTab');
    const adminAgendamentosSection = document.getElementById('adminAgendamentosSection');
    const adminProdutosSection = document.getElementById('adminProdutosSection');
    const adminAppointmentsList = document.getElementById('adminAppointmentsList');
    const totalAppointmentsCard = document.getElementById('totalAppointments');
    const pendingAppointmentsCard = document.getElementById('pendingAppointments');
    const totalProductsCard = document.getElementById('totalProducts');
    const totalRevenueCard = document.getElementById('totalRevenue');
    const openAddProductModalBtn = document.getElementById('openAddProductModal');
    const addProductModal = document.getElementById('addProductModal');
    const closeProductModalBtn = addProductModal ? addProductModal.querySelector('.close-button') : null;
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productCategorySelect = document.getElementById('productCategory');
    const productPriceInput = document.getElementById('productPrice');
    const productDescriptionTextarea = document.getElementById('productDescription');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const adminProductListDiv = document.getElementById('adminProductList');
    const adminWelcomeMessage = document.getElementById('adminWelcomeMessage');
    const productImageInput = document.getElementById('productImage');
    const productImagePreview = document.getElementById('productImagePreview');

    // Garante que o modal esteja oculto ao carregar a página admin.html
    if (addProductModal) {
        addProductModal.style.display = 'none';
    }

    // Pré-visualização da imagem ao selecionar um arquivo
    if (productImageInput && productImagePreview) {
        productImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    productImagePreview.src = e.target.result;
                    productImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                productImagePreview.src = 'https://via.placeholder.com/100'; // Fallback
                productImagePreview.style.display = 'none';
            }
        });
    }

    const updateAdminSummary = () => {
        const appointments = getStoredData('appointments');
        const products = getStoredData('products');

        totalAppointmentsCard.textContent = appointments.length;
        pendingAppointmentsCard.textContent = appointments.filter(app => app.status === 'Agendado').length;
        totalProductsCard.textContent = products.length;
        const totalRevenue = products.reduce((sum, product) => sum + product.price, 0);
        totalRevenueCard.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    };

    const renderAdminAppointments = () => {
        let appointments = getStoredData('appointments');
        
        // Ordenar agendamentos: mais recentes primeiro
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA; // Decrescente (mais recente primeiro)
        });

        if (appointments.length === 0) {
            adminAppointmentsList.innerHTML = '<p class="empty-state">Nenhum agendamento encontrado.</p>';
        } else {
            adminAppointmentsList.innerHTML = appointments.map(app => `
                <div class="appointment-card">
                    <div class="info">
                        <h3>${app.service}</h3>
                        <p>Cliente: ${app.clientEmail.split('@')[0]}</p>
                        <div class="details">
                            <span>
                                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmktY2FsZW5kYXIiPgogIDxwYXRoIGQ9Ik0zLjUgMGExLjUuNSAwIDAgMSAxLjUuNXYxSDEwdi0xYTEuNS41IDAgMCAxIDEuNS0uNWwxLjUuNWEuNS41IDAgMCAxIC41LjV2OWExLjUuNSAwIDAgMS0uNS41bC0xLjUuNWEuNS41IDAgMCAxLS41LS41VjExSDUuNXYxYTEuNS41IDAgMCAxLTEuNS41TDIgMTIuNWExLjUuNSAwIDAgMS0uNS0uNVY0LjVhLjUuNSAwIDAgMSAuNS0uNWwxLjUtLjV6Ii8+Cjwvc3ZnPg==" alt="Date Icon">
                                ${app.date}
                            </span>
                            <span>
                                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmktY2xvY2siPgogIDxwYXRoIGQ9Ik04IDBhOC4wMDEgOC4wMDEgMCAwIDAgMCAxNGE4LjAwMSA4LjAwMSAwIDAgMCAwLTE0em0wIDEuNWE2LjUgNi41IDAgMSAxIDAgMTNhNi41IDYuNSAwIDAgMSAwLTEzem0wIDJhNS41IDUuNSAwADEgMCAwIDExIDUuNSAxNS41IDAgMCAwIDAtMTF6Ii8+Cjwvc3ZnPg==" alt="Time Icon">
                                ${app.time}
                            </span>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        ${app.status === 'Agendado' ? `
                            <button class="btn btn-complete" onclick="updateAppointmentStatus('${app.id}', 'Concluído')">Concluir</button>
                            <button class="btn btn-cancel" onclick="updateAppointmentStatus('${app.id}', 'Cancelado')">Cancelar</button>
                        ` : `
                            <span class="status ${app.status === 'Concluído' ? 'status-completed' : app.status === 'Cancelado' ? 'status-cancelled' : 'status-scheduled'}">${app.status}</span>
                        `}
                    </div>
                </div>
            `).join('');
        }
    };

    window.updateAppointmentStatus = (id, newStatus) => {
        let appointments = getStoredData('appointments');
        const index = appointments.findIndex(app => app.id === id);
        if (index !== -1) {
            appointments[index].status = newStatus;
            setStoredData('appointments', appointments);
            renderAdminAppointments();
            updateAdminSummary();
        }
    };

    const renderAdminProducts = () => {
        const products = getStoredData('products');
        if (products.length === 0) {
            adminProductListDiv.innerHTML = '<p class="empty-state">Nenhum produto cadastrado.</p>';
        } else {
            adminProductListDiv.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'}" alt="${product.name}">
                    <div class="info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-edit" onclick="editProduct('${product.id}')">Editar</button>
                        <button class="btn btn-delete" onclick="deleteProduct('${product.id}')">Excluir</button>
                    </div>
                </div>
            `).join('');
        }
    };

    window.editProduct = (id) => {
        const products = getStoredData('products');
        const productToEdit = products.find(product => product.id === id);
        if (productToEdit) {
            productIdInput.value = productToEdit.id;
            productNameInput.value = productToEdit.name;
            productCategorySelect.value = productToEdit.category;
            productPriceInput.value = productToEdit.price;
            productDescriptionTextarea.value = productToEdit.description;
            
            // Carregar imagem existente para pré-visualização
            if (productToEdit.imageUrl && productToEdit.imageUrl !== 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem') {
                productImagePreview.src = productToEdit.imageUrl;
                productImagePreview.style.display = 'block';
            } else {
                productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'; // Fallback
                productImagePreview.style.display = 'none';
            }
            productImageInput.value = ''; // Limpa o input file para que o usuário possa selecionar um novo

            saveProductBtn.textContent = 'Atualizar Produto';
            addProductModal.style.display = 'flex';
            updateProductCategoryDropdown(); // Garante que o dropdown de categorias esteja atualizado ao abrir para edição
        }
    };

    window.deleteProduct = (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            let products = getStoredData('products');
            products = products.filter(product => product.id !== id);
            setStoredData('products', products);
            renderAdminProducts();
            updateAdminSummary();
        }
    };

    if (adminAgendamentosTab && adminProdutosTab && adminAgendamentosSection && adminProdutosSection) {
        // Check if user is logged in as admin
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'admin') {
            window.location.href = 'index.html'; // Redirect if not logged in as admin
            return;
        }
        adminWelcomeMessage.textContent = `Bem-vindo(a), ${loggedInUser.email.split('@')[0]}`;


        adminAgendamentosTab.addEventListener('click', () => {
            showSection([adminAgendamentosSection, adminProdutosSection], 'adminAgendamentosSection');
            updateActiveTab([adminAgendamentosTab, adminProdutosTab], 'adminAgendamentosTab');
            renderAdminAppointments();
        });

        adminProdutosTab.addEventListener('click', () => {
            showSection([adminAgendamentosSection, adminProdutosSection], 'adminProdutosSection');
            updateActiveTab([adminAgendamentosTab, adminProdutosTab], 'adminProdutosTab');
            renderAdminProducts();
        });

        if (openAddProductModalBtn) {
            openAddProductModalBtn.addEventListener('click', () => {
                productIdInput.value = ''; // Clear for new product
                productForm.reset();
                productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'; // Reset preview image
                productImagePreview.style.display = 'none'; // Hide preview until image is selected
                saveProductBtn.textContent = 'Adicionar Produto';
                addProductModal.style.display = 'flex';
                updateProductCategoryDropdown(); // Popula o dropdown de categorias ao abrir o modal
            });
        }

        if (closeProductModalBtn) {
            closeProductModalBtn.addEventListener('click', () => {
                addProductModal.style.display = 'none';
                productForm.reset(); // Clear form on close
                productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'; // Reset preview image
                productImagePreview.style.display = 'none'; // Hide preview
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === addProductModal) {
                addProductModal.style.display = 'none';
                productForm.reset(); // Clear form on close via click outside
                productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'; // Reset preview image
                productImagePreview.style.display = 'none'; // Hide preview
            }
        });

        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = productIdInput.value;
                const name = productNameInput.value;
                const category = productCategorySelect.value;
                const price = parseFloat(productPriceInput.value);
                const description = productDescriptionTextarea.value;
                let imageUrl = productImagePreview.src; // Pega a URL da pré-visualização (que pode ser a placeholder ou a imagem Base64)

                // Se o input de arquivo tem um novo arquivo, sobrescreve a imageUrl
                if (productImageInput.files.length > 0) {
                    const file = productImageInput.files[0];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imageUrl = e.target.result; // Atualiza imageUrl com o Base64 da nova imagem
                        saveProductData(id, name, category, price, description, imageUrl);
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Se não houver novo arquivo, mantém a imagem existente ou a placeholder
                    // Apenas atualiza se a imagem existente for a placeholder e o usuário não selecionou uma nova
                    if (imageUrl === 'https://via.placeholder.com/100' || imageUrl === 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem') {
                        imageUrl = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'; // Garante que a placeholder padrão seja usada
                    }
                    saveProductData(id, name, category, price, description, imageUrl);
                }
            });
        }

        // Função auxiliar para salvar os dados do produto (chamada após a leitura da imagem)
        const saveProductData = (id, name, category, price, description, imageUrl) => {
            let products = getStoredData('products');

            if (id) {
                // Edit existing product
                const index = products.findIndex(p => p.id === id);
                if (index !== -1) {
                    products[index] = { id, name, category, price, description, imageUrl };
                }
            } else {
                // Add new product
                const newProduct = {
                    id: Date.now().toString(), // Simple unique ID
                    name,
                    category,
                    price,
                    description,
                    imageUrl
                };
                products.push(newProduct);
            }

            setStoredData('products', products);
            addProductModal.style.display = 'none';
            renderAdminProducts();
            updateAdminSummary();
            productForm.reset();
            productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'; // Reset preview image
            productImagePreview.style.display = 'none'; // Hide preview
        };


        // Initial render for admin dashboard
        updateAdminSummary();
        renderAdminAppointments();
        updateProductCategoryDropdown(); // Popula o dropdown de categorias quando o admin.html carrega
    }

    // --- Funções para Sincronizar Dropdowns (acessíveis globalmente) ---
    // Chamadas de configadmin.js e de outras partes de script.js
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
});