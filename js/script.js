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

    const loginForm = document.getElementById('loginForm');
    const clienteBtn = document.getElementById('clienteBtn');
    const adminBtn = document.getElementById('adminBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const cadastroButtonContainer = document.getElementById('cadastroButtonContainer');

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

            if (cadastroButtonContainer) {
                if (role === 'cliente') {
                    cadastroButtonContainer.classList.remove('hidden');
                } else {
                    cadastroButtonContainer.classList.add('hidden');
                }
            }
        }
    };

    if (clienteBtn && adminBtn) {
        clienteBtn.addEventListener('click', () => handleRoleChange('cliente'));
        adminBtn.addEventListener('click', () => handleRoleChange('admin'));
        handleRoleChange(currentRole); 
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;

            const adminUsers = getStoredData('adminUsers');
            const foundAdmin = adminUsers.find(admin => admin.email === email && admin.password === password);

            const clientUsers = getStoredData('clientUsers');
            const foundClient = clientUsers.find(client => client.email === email && client.password === password);

            if (currentRole === 'cliente' && foundClient) {
                localStorage.setItem('loggedInUser', JSON.stringify({ email: email, name: foundClient.name, role: 'cliente' }));
                window.location.href = 'cliente.html';
            } else if (currentRole === 'admin' && foundAdmin) {
                // CORREÇÃO CRUCIAL AQUI: Salva o nome do admin ao logar
                localStorage.setItem('loggedInUser', JSON.stringify({ email: email, name: foundAdmin.name, role: 'admin' })); 
                window.location.href = 'admin.html';
            } else {
                alert('Credenciais inválidas. Tente novamente.');
            }
        });
    }

    // --- Client Registration Logic (cadcliente.html) ---
    const cadastroClienteForm = document.getElementById('cadastroClienteForm');
    if (cadastroClienteForm) {
        cadastroClienteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const cadNome = document.getElementById('cadNome').value.trim();
            const cadEmail = document.getElementById('cadEmail').value.trim();
            const cadPassword = document.getElementById('cadPassword').value;
            const cadConfirmPassword = document.getElementById('cadConfirmPassword').value;

            if (cadPassword !== cadConfirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }

            if (cadPassword.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }

            let clientUsers = getStoredData('clientUsers');

            if (clientUsers.some(user => user.email === cadEmail)) {
                alert('Este email já está cadastrado. Por favor, faça login ou use outro email.');
                return;
            }

            const newClient = {
                id: Date.now().toString(),
                name: cadNome, // Já estava correto, garantindo que o nome é salvo
                email: cadEmail,
                password: cadPassword,
                role: 'cliente'
            };

            clientUsers.push(newClient);
            setStoredData('clientUsers', clientUsers);

            alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
            window.location.href = 'index.html';
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
        
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA;
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
                                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmktY2FsZW5kYXItZWRpdCI+CiAgPHBhdGggZD0iTTMuNTkgMS41bDEuMjkgMS4zMDJBLjUuNSAwIDAgMCA1LjM0IDIuOWEzIDMgMCAwIDAgNS4wNjYuNTE3bDEuMzAyLTEuMjlhLjUuNSAwIDAgMCAuNzAxLjA4NmwxLjU1OCA3LjAzMi03LjAzMiAxLjU1OGEuNS41IDAgMCAwLS4wODYuNzAxbC0xLjI5LTEuMzAyQTMgMyAwIDAgMCAuNTc2IDEyLjk4NC41LjUuNSAwIDAgMCAtLjQ2NiAxMi43bC0uNy03Yy0uMS0uOS43LTQuMiAxLjUtNmw2LTRoYzAtLjEgMS44LjcgMS41IDEuNXoiLz4KPC9zdmc+" alt="Calendar Icon">
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
            today.setHours(0, 0, 0, 0);

            const dateObj = new Date(selectedDate + 'T00:00:00');
            dateObj.setHours(0, 0, 0, 0);

            let startHour = 9;
            const endHour = 18;

            if (dateObj.getTime() === today.getTime()) {
                const currentHour = new Date().getHours();
                startHour = Math.max(startHour, currentHour + 1);
            }

            if (startHour <= endHour) {
                for (let i = startHour; i <= endHour; i++) {
                    const hour = String(i).padStart(2, '0');
                    timeSelect.innerHTML += `<option value="${hour}:00">${hour}:00</option>`;
                }
                timeSelect.disabled = false;
            }
        }
    };

    if (agendamentosTab && produtosTab && agendamentosSection && produtosSection) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'cliente') {
            window.location.href = 'index.html';
            return;
        }
        // Usando o nome do loggedInUser para a mensagem de boas-vindas do cliente
        welcomeMessage.textContent = `Olá, ${loggedInUser.name}!`;

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
                timeSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
                timeSelect.disabled = true;
                observationsTextarea.value = '';
                renderClientAppointments();
            } else {
                alert('Por favor, preencha todos os campos obrigatórios.');
            }
        });

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
    const adminWelcomeMessage = document.getElementById('adminWelcomeMessage'); // Elemento para a mensagem de boas-vindas do admin
    const productImageInput = document.getElementById('productImage');
    const productImagePreview = document.getElementById('productImagePreview');

    if (addProductModal) {
        addProductModal.style.display = 'none';
    }

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
                productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem';
                productImagePreview.style.display = 'none';
            }
        });
    }

    const updateAdminSummary = () => {
        const appointments = getStoredData('appointments');
        const products = getStoredData('products');

        if (totalAppointmentsCard) totalAppointmentsCard.textContent = appointments.length;
        if (pendingAppointmentsCard) pendingAppointmentsCard.textContent = appointments.filter(app => app.status === 'Agendado').length;
        if (totalProductsCard) totalProductsCard.textContent = products.length;
        
        const totalRevenue = products.reduce((sum, product) => sum + (product.price || 0), 0); // Adicionado (product.price || 0) para evitar NaN
        if (totalRevenueCard) totalRevenueCard.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    };

    const renderAdminAppointments = () => {
        let appointments = getStoredData('appointments');
        
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA;
        });

        if (appointments.length === 0) {
            if (adminAppointmentsList) adminAppointmentsList.innerHTML = '<p class="empty-state">Nenhum agendamento encontrado.</p>';
        } else {
            if (adminAppointmentsList) adminAppointmentsList.innerHTML = appointments.map(app => `
                <div class="appointment-card">
                    <div class="info">
                        <h3>${app.service}</h3>
                        <p>Cliente: ${app.clientEmail.split('@')[0]}</p>
                        <div class="details">
                            <span>
                                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmktY2FsZW5kYXIiPgogIDxwYXRoIGQ9Ik0zLjUgMGExLjUuOSAwIDAgMSAxLjUuOXdjMWExLjUuNSAwIDAgMSAxLjUuNWwxLjUuOWExLjUuNSAwIDAgMSAgLjUuNXY5YTEuNS41IDAgMCAxLS41LjVsLTEuNS41YTEuNS45IDAgMCAxLS45LS45VjExSDUuNXYxYTEuNS45IDAgMCAxLTEuNS45TDIgMTIuNWExLjUuOSAwIDAgMS0uNS0uOVY0LjVhLjUuNSAwIDAgMSAuNS0uNWwxLjUtLjV6Ii8+Cjwvc3ZnPg==" alt="Date Icon">
                                ${app.date}
                            </span>
                            <span>
                                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmktY2xvY2siPgogIDxwYXRoIGQ9Ik04IDBhOC4wMDEgOC4wMDEgMCAwIDAgMCAxNGE4LjAwMSA4LjAwMSAwIDAgMCAwLTE0em0wIDEuNWE2LjUgNi41IDAgMSAxIDAgMTNhNi41IDY2NTUgMCAwIDAgMC0xM3ptMCAyYTUuNSAzNy41IDAgMCAwIDAgMTEgNS41IDE1LjUgMCAwIDAgMC0xMXoiLz4KPC9zdmc+" alt="Time Icon">
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
            if (adminProductListDiv) adminProductListDiv.innerHTML = '<p class="empty-state">Nenhum produto cadastrado.</p>';
        } else {
            if (adminProductListDiv) adminProductListDiv.innerHTML = products.map(product => `
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
            if (productIdInput) productIdInput.value = productToEdit.id;
            if (productNameInput) productNameInput.value = productToEdit.name;
            if (productCategorySelect) productCategorySelect.value = productToEdit.category;
            if (productPriceInput) productPriceInput.value = productToEdit.price;
            if (productDescriptionTextarea) productDescriptionTextarea.value = productToEdit.description;
            
            if (productImagePreview) {
                if (productToEdit.imageUrl && productToEdit.imageUrl !== 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem') {
                    productImagePreview.src = productToEdit.imageUrl;
                    productImagePreview.style.display = 'block';
                } else {
                    productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem';
                    productImagePreview.style.display = 'none';
                }
            }
            if (productImageInput) productImageInput.value = '';

            if (saveProductBtn) saveProductBtn.textContent = 'Atualizar Produto';
            if (addProductModal) addProductModal.style.display = 'flex';
            // Note: updateProductCategoryDropdown is not defined. If it's meant to exist, define it.
            // updateProductCategoryDropdown(); 
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
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        // Utiliza o nome do admin no cabeçalho
        if (adminWelcomeMessage) {
            adminWelcomeMessage.textContent = `Bem-vindo(a), ${loggedInUser.name || loggedInUser.email.split('@')[0]}`;
        }


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
                if (productIdInput) productIdInput.value = '';
                if (productForm) productForm.reset();
                if (productImagePreview) {
                    productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem';
                    productImagePreview.style.display = 'none';
                }
                if (saveProductBtn) saveProductBtn.textContent = 'Adicionar Produto';
                if (addProductModal) addProductModal.style.display = 'flex';
                // Note: updateProductCategoryDropdown is not defined.
                // updateProductCategoryDropdown(); 
            });
        }

        if (closeProductModalBtn) {
            closeProductModalBtn.addEventListener('click', () => {
                if (addProductModal) addProductModal.style.display = 'none';
                if (productForm) productForm.reset();
                if (productImagePreview) {
                    productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem';
                    productImagePreview.style.display = 'none';
                }
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === addProductModal) {
                if (addProductModal) addProductModal.style.display = 'none';
                if (productForm) productForm.reset();
                if (productImagePreview) {
                    productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem';
                    productImagePreview.style.display = 'none';
                }
            }
        });

        const saveProductData = (id, name, category, price, description, imageUrl) => {
            let products = getStoredData('products');
            if (id) {
                // Edit existing product
                const index = products.findIndex(p => p.id === id);
                if (index !== -1) {
                    products[index] = { ...products[index], name, category, price, description, imageUrl };
                }
            } else {
                // Add new product
                const newProduct = {
                    id: Date.now().toString(),
                    name,
                    category,
                    price,
                    description,
                    imageUrl // Save the Base64 string or placeholder
                };
                products.push(newProduct);
            }
            setStoredData('products', products);
            if (addProductModal) addProductModal.style.display = 'none';
            if (productForm) productForm.reset();
            if (productImagePreview) {
                productImagePreview.src = 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem';
                productImagePreview.style.display = 'none';
            }
            renderAdminProducts();
            updateAdminSummary();
        };

        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = productIdInput.value;
                const name = productNameInput.value;
                const category = productCategorySelect.value;
                const price = parseFloat(productPriceInput.value);
                const description = productDescriptionTextarea.value;
                let imageUrl = productImagePreview.src;

                if (productImageInput && productImageInput.files.length > 0) {
                    const file = productImageInput.files[0];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imageUrl = e.target.result;
                        saveProductData(id, name, category, price, description, imageUrl);
                    };
                    reader.readAsDataURL(file);
                } else {
                    saveProductData(id, name, category, price, description, imageUrl);
                }
            });
        }

        // Initial render for admin dashboard
        renderAdminAppointments();
        renderAdminProducts();
        updateAdminSummary();
    }

    // Helper function for service dropdown (if it exists elsewhere)
    // Placeholder, as this function was mentioned but not defined in the original script
    function updateServiceDropdown() {
        // Implement logic to populate service dropdown, e.g., from stored data or a fixed list
        // Example:
        // const services = ['Trança Nagô', 'Box Braids', 'Crochet Braids'];
        // if (serviceSelect) {
        //     serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';
        //     services.forEach(service => {
        //         serviceSelect.innerHTML += `<option value="${service}">${service}</option>`;
        //     });
        // }
    }

    // Helper function for product category dropdown (if it exists elsewhere)
    // Placeholder, as this function was mentioned but not defined in the original script
    function updateProductCategoryDropdown() {
        // Implement logic to populate product category dropdown
        // Example:
        // const categories = ['Cabelo', 'Pele', 'Acessórios'];
        // if (productCategorySelect) {
        //     productCategorySelect.innerHTML = ''; // Clear existing options
        //     categories.forEach(category => {
        //         productCategorySelect.innerHTML += `<option value="${category}">${category}</option>`;
        //     });
        // }
    }
});