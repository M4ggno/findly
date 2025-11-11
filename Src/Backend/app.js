/* ============================================
   APP.JS - Arquivo Principal da Aplicação
   ============================================ */

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializar aplicação
 */
function iniciarApp() {
    console.log('🚀 Iniciando Findly...');
    
    // Carregar tema salvo
    const tema = obterTema();
    alternarTema(tema === 'dark');
    
    // Carregar dados do usuário
    const usuario = obterDadosUsuario();
    atualizarPerfil();
    
    // Adicionar validação em tempo real
    adicionarValidacaoTempoReal('form-cadastro');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Carregar dados de exemplo (se vazio)
    if (obterItens().length === 0) {
        carregarDadosExemplo();
    }
    
    // Verificar parâmetro de URL (item específico)
    const params = new URLSearchParams(window.location.search);
    if (params.has('item')) {
        const itemId = params.get('item');
        abrirDetalhesItem(parseInt(itemId));
    }
    
    console.log('✓ Findly iniciado com sucesso!');
}

// ============================================
// CONFIGURAR EVENT LISTENERS
// ============================================

/**
 * Configurar event listeners principais
 */
function configurarEventListeners() {
    // Formulário de cadastro
    const form = document.getElementById('form-cadastro');
    if (form) {
        form.addEventListener('submit', handleFormCadastro);
    }
    
    // Contador de caracteres
    const descricao = document.getElementById('descricao-item');
    if (descricao) {
        descricao.addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('char-count').textContent = `${count}/500`;
        });
    }
    
    // Upload de fotos com drag and drop
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            document.getElementById('fotos-item').click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'rgba(33, 150, 243, 0.2)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = 'transparent';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'transparent';
            document.getElementById('fotos-item').files = e.dataTransfer.files;
            handleUploadFotos();
        });
    }
    
    // Input de fotos
    const fotosInput = document.getElementById('fotos-item');
    if (fotosInput) {
        fotosInput.addEventListener('change', handleUploadFotos);
    }
    
    // Busca em tempo real
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', buscarItens);
    }
    
    // Preferências de perfil
    const notifCheckbox = document.getElementById('notif-checkbox');
    if (notifCheckbox) {
        notifCheckbox.addEventListener('change', (e) => {
            salvarPreferencia('notificacoes', e.target.checked);
        });
    }
    
    const emailCheckbox = document.getElementById('email-checkbox');
    if (emailCheckbox) {
        emailCheckbox.addEventListener('change', (e) => {
            salvarPreferencia('alertasEmail', e.target.checked);
        });
    }
}

// ============================================
// NAVEGAÇÃO ENTRE SEÇÕES
// ============================================

/**
 * Navegar entre seções
 */
function navegarPara(secao) {
    // Remover classe active de todas as seções
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Adicionar classe active à seção desejada
    const novaSecao = document.getElementById(secao);
    if (novaSecao) {
        novaSecao.classList.add('active');
        window.scrollTo(0, 0);
    }
}

// ============================================
// FORMULÁRIO DE CADASTRO
// ============================================

/**
 * Handle do formulário de cadastro
 */
function handleFormCadastro(e) {
    e.preventDefault();
    
    // Validar formulário
    if (!validarFormulario('form-cadastro')) {
        exibirToast('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    // Coletar dados
    const formData = new FormData(e.target);
    
    const item = {
        id: Date.now(),
        tipo: formData.get('tipo'),
        nome: formData.get('nome'),
        categoria: formData.get('categoria'),
        descricao: formData.get('descricao'),
        localizacao: formData.get('localizacao'),
        data: formData.get('data'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        foto: document.querySelector('.preview-image')?.src || null,
        latitude: obterLocalizacaoSalva()?.latitude || null,
        longitude: obterLocalizacaoSalva()?.longitude || null,
        dataCriacao: new Date().toISOString()
    };
    
    // Salvar item
    salvarItem(item);
    
    // Gerar QR Code
    setTimeout(() => {
        gerarQRCode(item.id);
    }, 500);
    
    // Exibir mensagem de sucesso
    exibirToast('✓ Item cadastrado com sucesso!', 'success');
    
    // Limpar formulário
    e.target.reset();
    document.getElementById('preview-container').innerHTML = '';
    document.getElementById('qrcode-container').style.display = 'none';
    document.getElementById('mapa-preview').style.display = 'none';
    
    // Atualizar perfil
    setTimeout(() => {
        atualizarPerfil();
    }, 500);
}

// ============================================
// UPLOAD DE FOTOS
// ============================================

/**
 * Handle do upload de fotos
 */
function handleUploadFotos() {
    const files = document.getElementById('fotos-item').files;
    const container = document.getElementById('preview-container');
    container.innerHTML = '';
    
    if (files.length === 0) return;
    
    if (files.length > 5) {
        exibirToast('Máximo 5 fotos permitidas', 'warning');
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        // Validar tipo
        if (!file.type.match('image.*')) {
            exibirToast(`Arquivo ${file.name} não é uma imagem`, 'error');
            return;
        }
        
        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            exibirToast(`Arquivo ${file.name} é muito grande`, 'error');
            return;
        }
        
        // Criar preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-image-wrapper';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            
            const btn = document.createElement('button');
            btn.className = 'preview-remove';
            btn.innerHTML = '<i class=\"fas fa-trash\"></i>';
            btn.type = 'button';
            btn.onclick = () => wrapper.remove();
            
            wrapper.appendChild(img);
            wrapper.appendChild(btn);
            container.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// MODAL DE CADASTRO
// ============================================

/**
 * Abrir modal de cadastro
 */
function abrirModalCadastro() {
    navegarPara('cadastro');
}

/**
 * Fechar modal
 */
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.close();
    }
}

// ============================================
// NOTIFICAÇÕES (TOAST)
// ============================================

/**
 * Exibir notificação toast
 */
function exibirToast(mensagem, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    
    container.appendChild(toast);
    
    // Remover após 4 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// TEMA (CLARO/ESCURO)
// ============================================

/**
 * Alternar tema
 */
function alternarTema(escuro = null) {
    const html = document.documentElement;
    const botao = document.getElementById('btn-tema');
    
    let temaSalvo = obterTema();
    
    if (escuro !== null) {
        temaSalvo = escuro ? 'dark' : 'light';
    } else {
        temaSalvo = temaSalvo === 'dark' ? 'light' : 'dark';
    }
    
    html.setAttribute('data-theme', temaSalvo);
    salvarTema(temaSalvo);
    
    if (botao) {
        botao.innerHTML = temaSalvo === 'dark' ? 
            '<i class=\"fas fa-sun\"></i>' : 
            '<i class=\"fas fa-moon\"></i>';
    }
}

// ============================================
// PERFIL
// ============================================

/**
 * Atualizar perfil
 */
function atualizarPerfil() {
    const usuario = obterDadosUsuario();
    const itens = obterItens();
    const favoritos = obterFavoritos();
    
    // Atualizar dados do perfil
    document.getElementById('perfil-usuario').textContent = usuario.nome;
    document.getElementById('perfil-email').textContent = usuario.email || 'Não definido';
    document.getElementById('perfil-telefone').textContent = usuario.telefone || 'Não definido';
    
    // Atualizar estatísticas
    document.getElementById('stat-cadastrados').textContent = itens.length;
    document.getElementById('stat-encontrados').textContent = itens.filter(i => i.tipo === 'encontrado').length;
    document.getElementById('stat-recentes').textContent = obterBuscasRecentes().length;
    
    // Atualizar histórico de itens
    const historico = document.getElementById('historico-itens');
    if (historico) {
        if (itens.length === 0) {
            historico.innerHTML = '<p class=\"info-text\">Nenhum item cadastrado ainda</p>';
        } else {
            historico.innerHTML = itens.slice(0, 6).map(item => `
                <div class="item-card">
                    <h3>${item.nome}</h3>
                    <p class="badge badge-${item.tipo === 'perdido' ? 'danger' : 'success'}">${item.tipo}</p>
                    <button class="btn btn-secondary" onclick="abrirDetalhesItem(${item.id})">
                        Ver Detalhes
                    </button>
                </div>
            `).join('');
        }
    }
}

/**
 * Limpar dados locais
 */
function limparDados() {
    if (confirm('Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.')) {
        limparLocalStorage();
        exibirToast('Dados locais foram limpos', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// ============================================
// DADOS DE EXEMPLO
// ============================================

/**
 * Carregar dados de exemplo
 */
function carregarDadosExemplo() {
    const itensExemplo = [
        {
            id: 1,
            tipo: 'perdido',
            nome: 'iPhone 13 Preto',
            categoria: 'eletronicos',
            descricao: 'Iphone 13 preto com case transparente. Perdido próximo à biblioteca.',
            localizacao: 'Biblioteca Central - UNIFIP',
            data: '2025-11-08',
            email: 'user1@example.com',
            telefone: '(83) 98888-8888',
            foto: null,
            latitude: -7.0245,
            longitude: -37.2772,
            dataCriacao: new Date().toISOString()
        },
        {
            id: 2,
            tipo: 'encontrado',
            nome: 'Carteira de Couro',
            categoria: 'acessorios',
            descricao: 'Carteira marrom de couro encontrada na cantina.',
            localizacao: 'Cantina - UNIFIP',
            data: '2025-11-09',
            email: 'user2@example.com',
            telefone: '(83) 99999-9999',
            foto: null,
            latitude: -7.0255,
            longitude: -37.2782,
            dataCriacao: new Date().toISOString()
        },
        {
            id: 3,
            tipo: 'perdido',
            nome: 'RG e CPF',
            categoria: 'documentos',
            descricao: 'Documentos em pasta plástica vermelha.',
            localizacao: 'Sala 101 - Bloco A',
            data: '2025-11-07',
            email: 'user3@example.com',
            telefone: '(83) 98765-4321',
            foto: null,
            latitude: -7.0240,
            longitude: -37.2780,
            dataCriacao: new Date().toISOString()
        }
    ];
    
    salvarLocalStorage('itens', itensExemplo);
    console.log('✓ Dados de exemplo carregados');
}

// ============================================
// INICIALIZAÇÃO AO CARREGAR
// ============================================

document.addEventListener('DOMContentLoaded', iniciarApp);