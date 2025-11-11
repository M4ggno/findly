/* ============================================
   SEARCH.JS - Funções de Busca e Filtros
   ============================================ */

// ============================================
// BUSCA E FILTROS
// ============================================

/**
 * Buscar itens
 */
function buscarItens() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const categoria = document.getElementById('categoria-filtro')?.value || '';
    const tipo = document.getElementById('tipo-filtro')?.value || '';
    const distancia = parseFloat(document.getElementById('distancia-filtro')?.value) || 50;
    
    // Salvar busca recente
    if (searchTerm) {
        adicionarBuscaRecente(searchTerm);
    }
    
    // Atualizar texto de distância
    const distanciaValor = document.getElementById('distancia-valor');
    if (distanciaValor) {
        distanciaValor.textContent = `${distancia} km`;
    }
    
    const filtros = {
        busca: searchTerm,
        categoria: categoria,
        tipo: tipo
    };
    
    let itens = buscarItensComFiltro(filtros);
    
    // Filtrar por distância
    if (distancia < 50) {
        itens = filtrarPorDistancia(itens, distancia);
    }
    
    // Exibir resultados
    exibirResultados(itens);
}

/**
 * Exibir resultados da busca
 */
function exibirResultados(itens) {
    const container = document.getElementById('resultados');
    if (!container) return;
    
    if (itens.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search empty-state-icon"></i>
                <h3 class="empty-state-title">Nenhum item encontrado</h3>
                <p class="empty-state-text">Tente ajustar os filtros ou faça uma nova busca</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = itens.map(item => `
        <div class="item-card">
            ${item.foto ? `<img src="${item.foto}" alt="${item.nome}" class="item-card-image">` : `<div class="item-card-image" style="display: flex; align-items: center; justify-content: center; background: #f0f0f0;"><i class="fas fa-image" style="font-size: 3rem; color: #ccc;"></i></div>`}
            
            <div class="item-card-body">
                <h3>${item.nome}</h3>
                
                <div class="item-card-meta">
                    <span class="badge ${item.tipo === 'perdido' ? 'badge-perdido' : 'badge-encontrado'}">
                        ${item.tipo.toUpperCase()}
                    </span>
                    <span class="tag">${item.categoria}</span>
                </div>
                
                <p>${item.descricao || 'Sem descrição'}</p>
                
                <div style="font-size: 0.85rem; color: #666; margin-top: 10px;">
                    <p><i class="fas fa-map-marker-alt"></i> ${item.localizacao}</p>
                    <p><i class="fas fa-calendar"></i> ${new Date(item.data).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
            
            <div class="item-card-footer">
                <button class="btn btn-primary" onclick="abrirDetalhesItem(${item.id})">
                    <i class="fas fa-eye"></i> Ver Detalhes
                </button>
                <button class="btn btn-secondary" onclick="toggleFavorito(${item.id}, this)">
                    <i class="fas ${ehFavorito(item.id) ? 'fas-heart' : 'far'}-heart"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Abrir modal com detalhes do item
 */
function abrirDetalhesItem(id) {
    const item = obterItemPorID(id);
    if (!item) {
        exibirToast('Item não encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('modal-detalhes');
    const conteudo = document.getElementById('modal-detalhes-conteudo');
    
    const dataCriacao = new Date(item.data).toLocaleDateString('pt-BR');
    const distancia = item.latitude && item.longitude ? 
        calcularDistancia(
            obterLocalizacaoSalva()?.latitude || 0,
            obterLocalizacaoSalva()?.longitude || 0,
            item.latitude,
            item.longitude
        ).toFixed(1) : 'N/A';
    
    conteudo.innerHTML = `
        <div class="item-detalhes">
            <span class="close" onclick="fecharModal('modal-detalhes')">&times;</span>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    ${item.foto ? 
                        `<img src="${item.foto}" alt="${item.nome}" style="width: 100%; border-radius: 8px; object-fit: cover; max-height: 300px;">` : 
                        `<div style="width: 100%; height: 200px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 3rem; color: #ccc;"></i></div>`
                    }
                </div>
                
                <div>
                    <h2>${item.nome}</h2>
                    
                    <div style="margin: 15px 0;">
                        <span class="badge ${item.tipo === 'perdido' ? 'badge-perdido' : 'badge-encontrado'}">
                            ${item.tipo.toUpperCase()}
                        </span>
                        <span class="badge badge-primary">${item.categoria}</span>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <p><strong>Localização:</strong> ${item.localizacao}</p>
                        <p><strong>Distância:</strong> ${distancia} km</p>
                        <p><strong>Data:</strong> ${dataCriacao}</p>
                    </div>
                </div>
            </div>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Descrição</h3>
                <p>${item.descricao || 'Sem descrição adicional'}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Informações de Contato</h3>
                <p><strong>Email:</strong> ${item.email || 'Não fornecido'}</p>
                <p><strong>Telefone:</strong> ${item.telefone || 'Não fornecido'}</p>
            </div>
            
            ${item.qrCodeId ? `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3>QR Code</h3>
                    <div id="qrcode-detail-${id}" style="display: inline-block;"></div>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-primary" onclick="entrarEmContato(${id})">
                    <i class="fas fa-envelope"></i> Entrar em Contato
                </button>
                <button class="btn btn-secondary" onclick="compartilharItem(${id})">
                    <i class="fas fa-share-alt"></i> Compartilhar
                </button>
                <button class="btn btn-secondary" onclick="toggleFavorito(${id})">
                    <i class="fas ${ehFavorito(id) ? 'fas-heart' : 'far'}-heart"></i> Favoritar
                </button>
            </div>
        </div>
    `;
    
    modal.showModal();
    
    // Gerar QR Code se houver
    if (item.qrCodeId) {
        setTimeout(() => {
            const qrContainer = document.getElementById(`qrcode-detail-${id}`);
            if (qrContainer) {
                new QRCode(qrContainer, {
                    text: `${window.location.origin}?item=${id}`,
                    width: 150,
                    height: 150
                });
            }
        }, 100);
    }
}

/**
 * Limpar filtros
 */
function limparFiltros() {
    document.getElementById('search-input').value = '';
    document.getElementById('categoria-filtro').value = '';
    document.getElementById('tipo-filtro').value = '';
    document.getElementById('distancia-filtro').value = 50;
    document.getElementById('distancia-valor').textContent = '50 km';
    
    buscarItens();
    exibirToast('Filtros limpos', 'success');
}

/**
 * Adicionar/remover favorito
 */
function toggleFavorito(id, elemento = null) {
    if (ehFavorito(id)) {
        removerDosFavoritos(id);
        exibirToast('Removido dos favoritos', 'info');
        if (elemento) {
            elemento.querySelector('i').classList.remove('fas-heart');
            elemento.querySelector('i').classList.add('far');
        }
    } else {
        adicionarAosFavoritos(id);
        exibirToast('Adicionado aos favoritos', 'success');
        if (elemento) {
            elemento.querySelector('i').classList.remove('far');
            elemento.querySelector('i').classList.add('fas-heart');
        }
    }
}

/**
 * Entrar em contato
 */
function entrarEmContato(id) {
    const item = obterItemPorID(id);
    if (!item) return;
    
    // Opções de contato
    const opcoes = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('dialog').close()">&times;</span>
            <h2>Entrar em Contato</h2>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                ${item.email ? `
                    <button class="btn btn-primary" onclick="window.open('mailto:${item.email}?subject=Findly - ${item.nome}')">
                        <i class="fas fa-envelope"></i> Enviar Email
                    </button>
                ` : ''}
                
                ${item.telefone ? `
                    <button class="btn btn-primary" onclick="window.open('https://wa.me/55${item.telefone.replace(/\\D/g, '')}?text=Olá! Encontrei seu anúncio sobre: ${item.nome}')">
                        <i class="fab fa-whatsapp"></i> Enviar WhatsApp
                    </button>
                ` : ''}
                
                <button class="btn btn-secondary" onclick="this.closest('dialog').close()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('dialog');
    modal.innerHTML = opcoes;
    document.body.appendChild(modal);
    modal.showModal();
}

/**
 * Compartilhar item
 */
function compartilharItem(id) {
    const item = obterItemPorID(id);
    if (!item) return;
    
    const texto = `Veja este item no Findly: ${item.nome} - ${item.descricao || ''}`;
    const url = `${window.location.origin}${window.location.pathname}?item=${id}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Findly - ${item.nome}`,
            text: texto,
            url: url
        });
    } else {
        // Fallback: copiar URL
        navigator.clipboard.writeText(url);
        exibirToast('URL copiada para compartilhamento!', 'success');
    }
}