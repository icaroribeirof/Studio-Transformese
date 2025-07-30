document.addEventListener('DOMContentLoaded', () => {
    // --- Common Functions ---
    const getStoredData = (key) => {
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

    const logout = async () => {
        const response = await fetchData('api/logout.php', 'POST');
        if (response.success) {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'index.php';
        } else {
            alert('Erro ao fazer logout: ' + response.message);
        }
    };

    // Formatação de data para o padrão brasileiro
    function formatDateToBrazilian(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Formatação de hora para o padrão brasileiro
    function formatTimeToBrazilian(timeString) {
        if (!timeString) return '--:--';
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    window.logout = logout;

    const loginForm = document.getElementById('loginForm');
    const clienteBtn = document.getElementById('clienteBtn');
    const adminBtn = document.getElementById('adminBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const cadastroButtonContainer = document.getElementById('cadastroButtonContainer');

    let currentRole = 'cliente';

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
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;

            const response = await fetchData('api/autenticacao.php', 'POST', {
                action: 'login',
                email: email,
                password: password,
                role: currentRole
            });

            if (response.success) {
                setStoredData('loggedInUser', response.user);
                if (currentRole === 'cliente') {
                    window.location.href = 'cliente.php';
                } else if (currentRole === 'admin') {
                    window.location.href = 'admin.php';
                }
            } else {
                alert(response.message);
            }
        });
    }

    // --- Client Registration Logic (cadcliente.php) ---
    const cadastroClienteForm = document.getElementById('cadastroClienteForm');
    if (cadastroClienteForm) {
        cadastroClienteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cadNome = document.getElementById('cadNome').value.trim();
            const cadEmail = document.getElementById('cadEmail').value.trim();
            const cadPassword = document.getElementById('cadPassword').value;
            const cadConfirmPassword = document.getElementById('cadConfirmPassword').value;

            const response = await fetchData('api/autenticacao.php', 'POST', {
                action: 'register',
                name: cadNome,
                email: cadEmail,
                password: cadPassword,
                confirmPassword: cadConfirmPassword
            });

            if (response.success) {
                alert(response.message);
                window.location.href = 'index.php';
            } else {
                alert(response.message);
            }
        });
    }

    // --- Client Dashboard Logic (cliente.php) ---
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

    const renderClientAppointments = async () => {
        const loggedInUser = getStoredData('loggedInUser');
        if (!loggedInUser || loggedInUser.role !== 'cliente') {
            window.location.href = 'index.php';
            return;
        }

        const response = await fetchData(`api/agendamentos.php?id_usuario=${loggedInUser.id}&role=cliente`);
        if (response.success) {
            const appointments = response.agendamentos;
            if (appointments.length === 0) {
                noAppointmentsMessage.classList.remove('hidden');
                appointmentsList.innerHTML = '';
            } else {
                noAppointmentsMessage.classList.add('hidden');
                appointmentsList.innerHTML = appointments.map(app => `
                    <div class="appointment-card">
                        <div class="info">
                            <h3>${app.nome_servico}</h3>
                            <p>Cliente: ${loggedInUser.name}</p>
                            <div class="details">
                                <span>
                                    <img src="img/calendario.png" alt="Icone Calendario">
                                    ${formatDateToBrazilian(app.data_agendamento)}
                                </span>
                                <span>
                                    <img src="img/relogio.png" alt="Icone Relogio">
                                    ${formatTimeToBrazilian(app.hora_agendamento)}
                                </span>
                            </div>
                            ${app.observacoes ? `<p>Obs: ${app.observacoes}</p>` : ''}
                        </div>
                        <div class="status ${app.status === 'Agendado' ? 'status-scheduled' : app.status === 'Concluído' ? 'status-completed' : 'status-cancelled'}">${app.status}</div>
                    </div>
                `).join('');
            }
        } else {
            console.error('Falha ao carregar agendamentos do cliente:', response.message);
            noAppointmentsMessage.classList.remove('hidden');
            appointmentsList.innerHTML = '';
        }
    };

    const renderClientProducts = async () => {
        const response = await fetchData('api/produtos.php');
        if (response.success) {
            const products = response.products;
            if (products.length === 0) {
                availableProductsDiv.innerHTML = '<p class="empty-state">Nenhum produto disponível no momento.</p>';
            } else {
                availableProductsDiv.innerHTML = products.map(product => `
                    <div class="product-card">
                        <img src="${product.url_imagem || 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'}" alt="${product.nome}">
                        <div class="info">
                            <h3>${product.nome}</h3>
                            <p>${product.descricao}</p>
                            <p class="price">R$ ${parseFloat(product.preco).toFixed(2).replace('.', ',')}</p>
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
        } else {
            console.error('Falha ao carregar produtos do cliente:', response.message);
            availableProductsDiv.innerHTML = '<p class="empty-state">Erro ao carregar produtos.</p>';
        }
    };

    const generateTimeSlots = async () => {
        timeSelect.innerHTML = '<option value="">Carregando horários...</option>';
        timeSelect.disabled = true;

        const selectedDate = dateInput.value;
        console.log('Data selecionada:', selectedDate);

        if (!selectedDate) {
            timeSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
            return;
        }

        try {
            // Horários de funcionamento
            const horariosBase = [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                '17:00', '17:30'
            ];

            // Se for hoje, remove horários já passados
            const hoje = new Date();
            const dataEscolhida = new Date(selectedDate + 'T00:00:00');
            let horariosDisponiveis = [...horariosBase];

            if (dataEscolhida.toDateString() === hoje.toDateString()) {
                const agora = new Date();
                const tempoAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
                horariosDisponiveis = horariosBase.filter(horario => horario > tempoAtual);
            }

            // Busca horários ocupados
            const response = await fetch(`api/agendamentos.php?action=get_available_times&date=${selectedDate}`);
            const data = await response.json();

            if (!data.success) {
                timeSelect.innerHTML = '<option value="">Erro ao carregar horários</option>';
                return;
            }

            // Filtra horários livres
            const horariosOcupados = data.occupied_times || [];
            const horariosLivres = horariosDisponiveis.filter(horario => !horariosOcupados.includes(horario));

            // Popula dropdown
            timeSelect.innerHTML = '<option value="">Selecione um horário</option>';

            if (horariosLivres.length === 0) {
                timeSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
                timeSelect.disabled = true;
            } else {
                horariosLivres.forEach(horario => {
                    const option = document.createElement('option');
                    option.value = horario;
                    option.textContent = horario;
                    timeSelect.appendChild(option);
                });
                timeSelect.disabled = false;
            }

        } catch (error) {
            console.error('Erro:', error);
            timeSelect.innerHTML = '<option value="">Erro ao carregar horários</option>';
        }
    };


    if (agendamentosTab && produtosTab && agendamentosSection && produtosSection) {
        const loggedInUser = getStoredData('loggedInUser');
        if (!loggedInUser || loggedInUser.role !== 'cliente') {
            window.location.href = 'index.php';
            return;
        }
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

        scheduleAppointmentBtn.addEventListener('click', async () => {
            const service = serviceSelect.value;
            const date = dateInput.value;
            const time = timeSelect.value;
            const observations = observationsTextarea.value;
            const userId = loggedInUser.id;

            if (service && date && time && userId) {
                const response = await fetchData('api/agendamentos.php', 'POST', {
                    userId: userId,
                    service: service,
                    date: date,
                    time: time,
                    observations: observations
                });

                if (response.success) {
                    alert('Agendamento realizado com sucesso!');
                    serviceSelect.value = '';
                    dateInput.value = '';
                    timeSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
                    timeSelect.disabled = true;
                    observationsTextarea.value = '';
                    renderClientAppointments();
                } else {
                    alert('Erro ao agendar: ' + response.message);
                }
            } else {
                alert('Por favor, preencha todos os campos obrigatórios.');
            }
        });

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

        renderClientAppointments();
        renderClientProducts();
        window.updateServiceDropdown();
    }

    // --- Admin Dashboard Logic (admin.php) ---
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

    if (addProductModal) {
        addProductModal.style.display = 'none';
    }
    if (productImagePreview) {
        productImagePreview.src = '';
        productImagePreview.style.display = 'none';
    }

    if (productImageInput && productImagePreview) {
        productImageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    productImagePreview.src = e.target.result;
                    productImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                productImagePreview.src = '';
                productImagePreview.style.display = 'none';
            }
        });
    }

    const updateAdminSummary = async () => {
        const appointmentsResponse = await fetchData('api/agendamentos.php?role=admin');
        const productsResponse = await fetchData('api/produtos.php');
        if (appointmentsResponse.success) {
            const appointments = appointmentsResponse.agendamentos;
            if (totalAppointmentsCard) totalAppointmentsCard.textContent = appointments.length;
            if (pendingAppointmentsCard) pendingAppointmentsCard.textContent = appointments.filter(app => app.status === 'Agendado').length;
        } else {
            console.error('Falha ao carregar resumo de agendamentos:', appointmentsResponse.message);
        }
        if (productsResponse.success) {
            // CORREÇÃO AQUI: Acesse productsResponse.products diretamente
            const products = productsResponse.products; // <--- LINHA CORRIGIDA
            if (totalProductsCard) totalProductsCard.textContent = products.length;
            const totalRevenue = products.reduce((sum, product) => sum + (parseFloat(product.preco) || 0), 0);
            if (totalRevenueCard) totalRevenueCard.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
        } else {
            console.error('Falha ao carregar resumo de produtos:', productsResponse.message);
        }
    };

    const renderAdminAppointments = async () => {
        const response = await fetchData('api/agendamentos.php?role=admin');
        if (response.success) {
            const appointments = response.agendamentos;
            if (appointments.length === 0) {
                if (adminAppointmentsList) adminAppointmentsList.innerHTML = '<p class="empty-state">Nenhum agendamento encontrado.</p>';
            } else {
                if (adminAppointmentsList) adminAppointmentsList.innerHTML = appointments.map(app => `
                    <div class="appointment-card">
                        <div class="info">
                            <h3>${app.nome_servico}</h3>
                            <p>Cliente: ${app.nome_cliente}</p>
                            <div class="details">
                                <span>
                                    <img src="img/calendario.png" alt="Icone Calendario">
                                    ${formatDateToBrazilian(app.data_agendamento)}
                                </span>
                                <span>
                                    <img src="img/relogio.png" alt="Icone Relogio">
                                    ${formatTimeToBrazilian(app.hora_agendamento)}
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
        } else {
            console.error('Falha ao carregar agendamentos do admin:', response.message);
            if (adminAppointmentsList) adminAppointmentsList.innerHTML = '<p class="empty-state">Erro ao carregar agendamentos.</p>';
        }
    };

    window.updateAppointmentStatus = async (id, newStatus) => {
        const response = await fetchData('api/agendamentos.php', 'PUT', {
            id: id,
            status: newStatus
        });
        if (response.success) {
            alert(response.message);
            renderAdminAppointments();
            updateAdminSummary();
        } else {
            alert('Erro ao atualizar status: ' + response.message);
        }
    };

    const renderAdminProducts = async () => {
        const response = await fetchData('api/produtos.php');
        if (response.success) {
            const products = response.products;
            if (products.length === 0) {
                if (adminProductListDiv) adminProductListDiv.innerHTML = '<p class="empty-state">Nenhum produto cadastrado.</p>';
            } else {
                if (adminProductListDiv) adminProductListDiv.innerHTML = products.map(product => `
                    <div class="product-card">
                        <img src="${product.url_imagem || 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem'}" alt="${product.nome}">
                        <div class="info">
                            <h3>${product.nome}</h3>
                            <p>${product.descricao}</p>
                            <p class="price">R$ ${parseFloat(product.preco).toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-edit" onclick="editProduct('${product.id}')">Editar</button>
                            <button class="btn btn-delete" onclick="deleteProduct('${product.id}')">Excluir</button>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            console.error('Falha ao carregar produtos do admin:', response.message);
            if (adminProductListDiv) adminProductListDiv.innerHTML = '<p class="empty-state">Erro ao carregar produtos.</p>';
        }
    };

    window.editProduct = async (id) => {
        await window.updateProductCategoryDropdown();

        const response = await fetchData('api/produtos.php');
        if (response.success) {
            const products = response.products;
            const productToEdit = products.find(product => product.id == id);
            if (productToEdit) {
                if (productIdInput) productIdInput.value = productToEdit.id;
                if (productNameInput) productNameInput.value = productToEdit.nome;
                if (productCategorySelect) productCategorySelect.value = productToEdit.nome_categoria;
                if (productPriceInput) productPriceInput.value = parseFloat(productToEdit.preco).toFixed(2);
                if (productDescriptionTextarea) productDescriptionTextarea.value = productToEdit.descricao;

                if (productImagePreview) {
                    if (productToEdit.url_imagem && productToEdit.url_imagem !== 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem') {
                        productImagePreview.src = productToEdit.url_imagem;
                        productImagePreview.style.display = 'block';
                    } else {
                        productImagePreview.src = '';
                        productImagePreview.style.display = 'none';
                    }
                }
                if (productImageInput) productImageInput.value = '';

                if (saveProductBtn) saveProductBtn.textContent = 'Atualizar Produto';
                if (addProductModal) addProductModal.style.display = 'flex';
            }
        } else {
            alert('Erro ao carregar produto para edição: ' + response.message);
        }
    };

    window.deleteProduct = async (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const response = await fetchData('api/produtos.php', 'DELETE', { id: id });
            if (response.success) {
                alert(response.message);
                renderAdminProducts();
                updateAdminSummary();
            } else {
                alert('Erro ao excluir produto: ' + response.message);
            }
        }
    };

    if (adminAgendamentosTab && adminProdutosTab && adminAgendamentosSection && adminProdutosSection) {
        const loggedInUser = getStoredData('loggedInUser');
        if (!loggedInUser || loggedInUser.role !== 'admin') {
            window.location.href = 'index.php';
            return;
        }
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
            openAddProductModalBtn.addEventListener('click', async () => {
                if (productIdInput) productIdInput.value = '';
                if (productForm) productForm.reset();
                if (productImagePreview) {
                    productImagePreview.src = '';
                    productImagePreview.style.display = 'none';
                }
                if (saveProductBtn) saveProductBtn.textContent = 'Adicionar Produto';
                if (addProductModal) addProductModal.style.display = 'flex';
                await window.updateProductCategoryDropdown();
            });
        }

        if (closeProductModalBtn) {
            closeProductModalBtn.addEventListener('click', () => {
                if (addProductModal) addProductModal.style.display = 'none';
                if (productForm) productForm.reset();
                if (productImagePreview) {
                    productImagePreview.src = '';
                    productImagePreview.style.display = 'none';
                }
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === addProductModal) {
                if (addProductModal) addProductModal.style.display = 'none';
                if (productForm) productForm.reset();
                if (productImagePreview) {
                    productImagePreview.src = '';
                    productImagePreview.style.display = 'none';
                }
            }
        });

        const saveProductData = async (id, name, category, price, description, newImageUrl = null) => {
            const method = id ? 'PUT' : 'POST';
            const url = 'api/produtos.php';

            let finalImageUrl = newImageUrl;

            if (!newImageUrl && id) {
                const existingProductsResponse = await fetchData('api/produtos.php');
                if (existingProductsResponse.success) {
                    const existingProduct = existingProductsResponse.products.find(p => p.id == id);
                    if (existingProduct) {
                        finalImageUrl = existingProduct.url_imagem;
                    }
                }
            }

            if (!finalImageUrl || finalImageUrl === 'https://via.placeholder.com/100/606060/FFFFFF?text=Sem+Imagem') {
                finalImageUrl = null;
            }

            const data = {
                id: id,
                name: name,
                category: category,
                price: price,
                description: description,
                imageUrl: finalImageUrl
            };

            const response = await fetchData(url, method, data);
            if (response.success) {
                alert(response.message);
                if (addProductModal) addProductModal.style.display = 'none';
                if (productForm) productForm.reset();
                if (productImagePreview) {
                    productImagePreview.src = '';
                    productImagePreview.style.display = 'none';
                }
                renderAdminProducts();
                updateAdminSummary();
            } else {
                alert('Erro ao salvar produto: ' + response.message);
            }
        };

        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = productIdInput.value;
                const name = productNameInput.value;
                const category = productCategorySelect.value;
                const price = parseFloat(productPriceInput.value);
                const description = productDescriptionTextarea.value;

                if (productImageInput && productImageInput.files.length > 0) {
                    const file = productImageInput.files[0];
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        saveProductData(id, name, category, price, description, e.target.result);
                    };
                    reader.readAsDataURL(file);
                } else {
                    saveProductData(id, name, category, price, description, null);
                }
            });
        }

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

        renderAdminAppointments();
        renderAdminProducts();
        updateAdminSummary();
        window.updateProductCategoryDropdown();
    }
});