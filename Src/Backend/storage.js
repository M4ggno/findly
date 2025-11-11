/* ============================================
   STORAGE.JS - Funções de Armazenamento Local
   ============================================ */

// ============================================
// GERENCIAMENTO DE LOCALSTORAGE
// ============================================

/**
 * Salvar dados no localStorage
 */
function salvarLocalStorage(chave, valor) {
    try {
        const dados = typeof valor === 'object' ? JSON.stringify(valor) : valor;
        localStorage.setItem(chave, dados);
        console.log(`✓ Dados salvos: ${chave}`);
    } catch (erro) {
        console.error(`✗ Erro ao salvar localStorage: ${erro}`);
    }
}

/**
 * Recuperar dados do localStorage
 */
function obterLocalStorage(chave, padrao = null) {
    try {
        const dados = localStorage.getItem(chave);
        if (dados === null) return padrao;
        
        try {
            return JSON.parse(dados);
        } catch {
            return dados;
        }
    } catch (erro) {
        console.error(`✗ Erro ao recuperar localStorage: ${erro}`);
        return padrao;
    }
}

/**
 * Remover item do localStorage
 */
function removerLocalStorage(chave) {
    try {
        localStorage.removeItem(chave);
        console.log(`✓ Item removido: ${chave}`);
    } catch (erro) {
        console.error(`✗ Erro ao remover localStorage: ${erro}`);
    }
}

/**
 * Limpar todo o localStorage
 */
function limparLocalStorage() {
    try {
        localStorage.clear();
        console.log(`✓ LocalStorage limpo`);
    } catch (erro) {
        console.error(`✗ Erro ao limpar localStorage: ${erro}`);
    }
}

// ============================================
// GERENCIAMENTO DE SESSIONSTORAGE
// ============================================

/**
 * Salvar dados no sessionStorage
 */
function salvarSessionStorage(chave, valor) {
    try {
        const dados = typeof valor === 'object' ? JSON.stringify(valor) : valor;
        sessionStorage.setItem(chave, dados);
    } catch (erro) {
        console.error(`✗ Erro ao salvar sessionStorage: ${erro}`);
    }
}

/**
 * Recuperar dados do sessionStorage
 */
function obterSessionStorage(chave, padrao = null) {
    try {
        const dados = sessionStorage.getItem(chave);
        if (dados === null) return padrao;
        
        try {
            return JSON.parse(dados);
        } catch {
            return dados;
        }
    } catch (erro) {
        console.error(`✗ Erro ao recuperar sessionStorage: ${erro}`);
        return padrao;
    }
}

/**
 * Remover item do sessionStorage
 */
function removerSessionStorage(chave) {
    try {
        sessionStorage.removeItem(chave);
    } catch (erro) {
        console.error(`✗ Erro ao remover sessionStorage: ${erro}`);
    }
}

// ============================================
// GERENCIAMENTO DE ITENS
// ============================================

/**
 * Salvar item (perdido/encontrado)
 */
function salvarItem(item) {
    const itens = obterLocalStorage('itens', []);
    item.id = item.id || Date.now();
    item.dataCriacao = item.dataCriacao || new Date().toISOString();
    
    const index = itens.findIndex(i => i.id === item.id);
    if (index > -1) {
        itens[index] = item;
    } else {
        itens.push(item);
    }
    
    salvarLocalStorage('itens', itens);
    return item;
}

/**
 * Obter todos os itens
 */
function obterItens() {
    return obterLocalStorage('itens', []);
}

/**
 * Obter item por ID
 */
function obterItemPorID(id) {
    const itens = obterItens();
    return itens.find(item => item.id === parseInt(id));
}

/**
 * Deletar item
 */
function deletarItem(id) {
    const itens = obterItens();
    const novoArray = itens.filter(item => item.id !== parseInt(id));
    salvarLocalStorage('itens', novoArray);
}

/**
 * Buscar itens com filtros
 */
function buscarItensComFiltro(filtros) {
    let itens = obterItens();
    
    if (filtros.tipo) {
        itens = itens.filter(item => item.tipo === filtros.tipo);
    }
    
    if (filtros.categoria) {
        itens = itens.filter(item => item.categoria === filtros.categoria);
    }
    
    if (filtros.busca) {
        const termo = filtros.busca.toLowerCase();
        itens = itens.filter(item => 
            item.nome.toLowerCase().includes(termo) ||
            item.descricao.toLowerCase().includes(termo) ||
            item.localizacao.toLowerCase().includes(termo)
        );
    }
    
    return itens;
}

// ============================================
// GERENCIAMENTO DE USUÁRIO
// ============================================

/**
 * Salvar dados do usuário
 */
function salvarDadosUsuario(usuario) {
    salvarLocalStorage('usuario', usuario);
}

/**
 * Obter dados do usuário
 */
function obterDadosUsuario() {
    return obterLocalStorage('usuario', {
        nome: 'Usuário Anônimo',
        email: '',
        telefone: '',
        notificacoes: true,
        alertasEmail: false
    });
}

/**
 * Atualizar perfil
 */
function atualizarPerfil(dados) {
    const usuario = obterDadosUsuario();
    const usuarioAtualizado = { ...usuario, ...dados };
    salvarDadosUsuario(usuarioAtualizado);
    return usuarioAtualizado;
}

// ============================================
// GERENCIAMENTO DE PREFERÊNCIAS
// ============================================

/**
 * Salvar preferência
 */
function salvarPreferencia(chave, valor) {
    const prefs = obterLocalStorage('preferencias', {});
    prefs[chave] = valor;
    salvarLocalStorage('preferencias', prefs);
}

/**
 * Obter preferência
 */
function obterPreferencia(chave, padrao = null) {
    const prefs = obterLocalStorage('preferencias', {});
    return prefs[chave] !== undefined ? prefs[chave] : padrao;
}

/**
 * Salvar tema (claro/escuro)
 */
function salvarTema(tema) {
    salvarPreferencia('tema', tema);
    document.documentElement.setAttribute('data-theme', tema);
}

/**
 * Obter tema
 */
function obterTema() {
    return obterPreferencia('tema', 'light');
}

/**
 * Salvar idioma
 */
function salvarIdioma(idioma) {
    salvarPreferencia('idioma', idioma);
}

/**
 * Obter idioma
 */
function obterIdioma() {
    return obterPreferencia('idioma', 'pt-BR');
}

// ============================================
// GERENCIAMENTO DE HISTÓRICO
// ============================================

/**
 * Adicionar à busca recente
 */
function adicionarBuscaRecente(termo) {
    const buscas = obterLocalStorage('buscasRecentes', []);
    
    // Remover duplicatas
    const index = buscas.indexOf(termo);
    if (index > -1) {
        buscas.splice(index, 1);
    }
    
    // Adicionar no início
    buscas.unshift(termo);
    
    // Manter apenas últimas 10
    if (buscas.length > 10) {
        buscas.pop();
    }
    
    salvarLocalStorage('buscasRecentes', buscas);
}

/**
 * Obter buscas recentes
 */
function obterBuscasRecentes() {
    return obterLocalStorage('buscasRecentes', []);
}

/**
 * Limpar buscas recentes
 */
function limparBuscasRecentes() {
    removerLocalStorage('buscasRecentes');
}

/**
 * Adicionar item ao favoritos
 */
function adicionarAosFavoritos(id) {
    const favoritos = obterLocalStorage('favoritos', []);
    if (!favoritos.includes(id)) {
        favoritos.push(id);
        salvarLocalStorage('favoritos', favoritos);
    }
}

/**
 * Remover dos favoritos
 */
function removerDosFavoritos(id) {
    const favoritos = obterLocalStorage('favoritos', []);
    const index = favoritos.indexOf(id);
    if (index > -1) {
        favoritos.splice(index, 1);
        salvarLocalStorage('favoritos', favoritos);
    }
}

/**
 * Obter favoritos
 */
function obterFavoritos() {
    return obterLocalStorage('favoritos', []);
}

/**
 * Verificar se é favorito
 */
function ehFavorito(id) {
    return obterFavoritos().includes(id);
}

// ============================================
// GERENCIAMENTO DE RASCUNHOS
// ============================================

/**
 * Salvar rascunho de formulário
 */
function salvarRascunhoFormulario(formularioId, dados) {
    const rascunhos = obterLocalStorage('rascunhos', {});
    rascunhos[formularioId] = {
        dados: dados,
        dataSalvamento: new Date().toISOString()
    };
    salvarLocalStorage('rascunhos', rascunhos);
}

/**
 * Obter rascunho de formulário
 */
function obterRascunhoFormulario(formularioId) {
    const rascunhos = obterLocalStorage('rascunhos', {});
    return rascunhos[formularioId] || null;
}

/**
 * Limpar rascunho
 */
function limparRascunho(formularioId) {
    const rascunhos = obterLocalStorage('rascunhos', {});
    delete rascunhos[formularioId];
    salvarLocalStorage('rascunhos', rascunhos);
}

/**
 * Limpar todos os rascunhos
 */
function limparTodosRascunhos() {
    removerLocalStorage('rascunhos');
}

// ============================================
// ESTATÍSTICAS
// ============================================

/**
 * Obter estatísticas
 */
function obterEstatisticas() {
    const itens = obterItens();
    const usuario = obterDadosUsuario();
    
    return {
        totalItens: itens.length,
        itensPerdidos: itens.filter(i => i.tipo === 'perdido').length,
        itensEncontrados: itens.filter(i => i.tipo === 'encontrado').length,
        categoriasMaisUsadas: agruparPorCategoria(itens),
        buscasRecentes: obterBuscasRecentes().length,
        favoritos: obterFavoritos().length
    };
}

/**
 * Agrupar itens por categoria
 */
function agruparPorCategoria(itens) {
    return itens.reduce((acc, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + 1;
        return acc;
    }, {});
}

// ============================================
// EXPORTAR E IMPORTAR DADOS
// ============================================

/**
 * Exportar dados como JSON
 */
function exportarDados() {
    const dados = {
        itens: obterItens(),
        usuario: obterDadosUsuario(),
        preferencias: obterLocalStorage('preferencias', {}),
        buscasRecentes: obterBuscasRecentes(),
        favoritos: obterFavoritos(),
        dataExportacao: new Date().toISOString()
    };
    
    return JSON.stringify(dados, null, 2);
}

/**
 * Importar dados de JSON
 */
function importarDados(jsonString) {
    try {
        const dados = JSON.parse(jsonString);
        
        if (dados.itens) salvarLocalStorage('itens', dados.itens);
        if (dados.usuario) salvarLocalStorage('usuario', dados.usuario);
        if (dados.preferencias) salvarLocalStorage('preferencias', dados.preferencias);
        if (dados.buscasRecentes) salvarLocalStorage('buscasRecentes', dados.buscasRecentes);
        if (dados.favoritos) salvarLocalStorage('favoritos', dados.favoritos);
        
        console.log('✓ Dados importados com sucesso');
        return true;
    } catch (erro) {
        console.error(`✗ Erro ao importar dados: ${erro}`);
        return false;
    }
}