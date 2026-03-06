# Studio Transformese — v2

Sistema web de agendamento e gestão de produtos para estúdio de tranças.

## Stack
- **Backend:** PHP 8+ com MySQLi
- **Banco:** MySQL / MariaDB
- **Frontend:** HTML + CSS + JavaScript vanilla (sem frameworks)

---

## Instalação

### 1. Banco de dados
```bash
mysql -u root -p < db/studio_transformese.sql
```

### 2. Configure a conexão
Edite `db_connect.php` com suas credenciais MySQL:
```php
$servername = "localhost";
$username   = "root";
$password   = "SUA_SENHA";
$dbname     = "studio_transformese";
```

### 3. Permissões de upload
```bash
chmod 755 uploads/
chmod 755 uploads/produtos/
```

### 4. Servidor local
Use XAMPP, WAMP ou o servidor embutido do PHP:
```bash
php -S localhost:8000
```

### 5. Primeiro acesso
- URL: `http://localhost:8000`
- **Admin padrão:** `admin@studiotransformese.com` / `password`
- ⚠️ **Troque a senha do admin imediatamente!**

---

## Estrutura de arquivos

```
/
├── index.php           # Página de login
├── cliente.php         # Painel do cliente
├── admin.php           # Painel do administrador
├── cadcliente.php      # Cadastro de novos clientes
├── configadmin.php     # Configurações do sistema
├── db_connect.php      # Conexão MySQL + sessão PHP
├── auth_check.php      # Proteção server-side de páginas
│
├── api/
│   ├── api_auth_check.php          # Middleware de autenticação das APIs
│   ├── autenticacao.php            # Login e registro
│   ├── logout.php                  # Destruição de sessão
│   ├── agendamentos.php            # CRUD de agendamentos
│   ├── produtos.php                # CRUD de produtos
│   ├── upload_produto_imagem.php   # Upload de imagem de produto
│   ├── servicos.php                # CRUD de serviços
│   ├── categorias.php              # CRUD de categorias
│   └── relatorio.php               # Dados reais do painel admin
│
├── js/
│   ├── common.js       # Funções compartilhadas (fetchData, formatação, logout)
│   ├── login.js        # Lógica de login e cadastro
│   ├── cliente.js      # Painel do cliente
│   ├── admin.js        # Painel do admin
│   └── configadmin.js  # Página de configurações
│
├── css/
│   ├── style.css       # Estilos principais
│   └── configadmin.css # Estilos adicionais
│
├── uploads/
│   ├── .htaccess       # Bloqueia execução de scripts em uploads
│   └── produtos/       # Imagens de produtos (criada automaticamente)
│
└── db/
    └── studio_transformese.sql  # Schema completo do banco
```

---

## Melhorias implementadas na v2

### 🔐 Segurança
- **Autenticação server-side real** via `$_SESSION` PHP — não é mais possível burlar pela DevTools
- **Senhas com bcrypt** (`password_hash` / `password_verify`) — migração automática de MD5
- **APIs protegidas por middleware** (`api_auth_check.php`) — retornam 401/403 para requisições não autorizadas
- **Session regeneration** no login (previne session fixation)
- **`.htaccess`** na pasta uploads bloqueando execução de scripts

### 🐛 Bugs corrigidos
- **Receita real no painel admin** — calculada a partir de agendamentos "Concluídos" × preço do serviço, não mais a soma do catálogo
- **Verificação de conflito de horário no servidor** — previne race condition ao agendar
- **Dados do cliente vindos da sessão** — cliente não pode mais agendar como outro usuário via manipulação do request

### 🏗️ Qualidade de código
- **`script.js` dividido em 4 módulos:** `common.js`, `login.js`, `cliente.js`, `admin.js`
- **Upload de imagens em disco** (`uploads/produtos/`) ao invés de base64 no banco de dados
- **`escapeHtml()`** em todo o conteúdo dinâmico (previne XSS)
- **Gerenciamento de estado do carrinho** em memória com UI funcional
- **Aba de Serviços** no painel admin com CRUD completo
