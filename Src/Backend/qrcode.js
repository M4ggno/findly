/* ============================================
   QRCODE.JS - Funções de QR Code
   ============================================ */

// ============================================
// GERENCIAMENTO DE QR CODES
// ============================================

/**
 * Gerar QR Code para um item
 */
function gerarQRCode(itemId, opcoes = {}) {
    const {
        tamanho = 200,
        corEscura = '#000000',
        corClara = '#ffffff',
        nivelCorrecao = 'H'
    } = opcoes;
    
    const url = `${window.location.origin}${window.location.pathname}?item=${itemId}`;
    
    const container = document.getElementById('qrcode-container');
    if (!container) return;
    
    // Limpar QR code anterior
    container.innerHTML = '';
    
    // Gerar novo QR code
    new QRCode(container, {
        text: url,
        width: tamanho,
        height: tamanho,
        colorDark: corEscura,
        colorLight: corClara,
        correctLevel: QRCode.CorrectLevel[nivelCorrecao]
    });
    
    // Mostrar container
    container.style.display = 'block';
    
    // Adicionar botão de download
    setTimeout(() => {
        const botaoDownload = document.createElement('button');
        botaoDownload.className = 'btn btn-secondary';
        botaoDownload.innerHTML = '<i class="fas fa-download"></i> Baixar QR Code';
        botaoDownload.onclick = () => {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `qrcode-item-${itemId}.png`;
                link.click();
            }
        };
        
        // Remover botão anterior se existir
        const botaoAnterior = container.querySelector('.btn-secondary');
        if (botaoAnterior) botaoAnterior.remove();
        
        container.appendChild(botaoDownload);
    }, 100);
}

/**
 * Salvar QR Code como imagem
 */
function salvarQRCode(itemId) {
    const container = document.getElementById('qrcode-container');
    if (!container) return;
    
    const canvas = container.querySelector('canvas');
    if (!canvas) {
        exibirToast('QR Code não encontrado', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `findly-qrcode-${itemId}-${Date.now()}.png`;
    link.click();
    
    exibirToast('QR Code baixado com sucesso!', 'success');
}

/**
 * Copiar URL do QR Code para a área de transferência
 */
function copiarURLQRCode(itemId) {
    const url = `${window.location.origin}${window.location.pathname}?item=${itemId}`;
    
    navigator.clipboard.writeText(url).then(() => {
        exibirToast('URL copiada para a área de transferência!', 'success');
    }).catch(erro => {
        console.error('Erro ao copiar URL:', erro);
        exibirToast('Erro ao copiar URL', 'error');
    });
}

/**
 * Imprimir QR Code
 */
function imprimirQRCode(itemId) {
    const container = document.getElementById('qrcode-container');
    if (!container) return;
    
    const canvas = container.querySelector('canvas');
    if (!canvas) {
        exibirToast('QR Code não encontrado', 'error');
        return;
    }
    
    const janela = window.open('', '_blank');
    janela.document.write(`
        <html>
            <head>
                <title>QR Code - Item ${itemId}</title>
                <style>
                    body { text-align: center; padding: 20px; font-family: Arial, sans-serif; }
                    h1 { color: #2196F3; }
                    img { max-width: 300px; margin: 20px 0; }
                    p { color: #666; }
                </style>
            </head>
            <body>
                <h1>Findly - QR Code</h1>
                <p>ID do Item: ${itemId}</p>
                <img src="${canvas.toDataURL('image/png')}" />
                <p>Escaneie o código acima para visualizar os detalhes do item.</p>
                <script>
                    window.print();
                    window.close();
                </script>
            </body>
        </html>
    `);
    janela.document.close();
}

/**
 * Gerar múltiplos QR Codes em lote
 */
function gerarQRCodesEmLote(itens) {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    container.style.gap = '20px';
    container.style.padding = '20px';
    
    itens.forEach(item => {
        const div = document.createElement('div');
        div.style.textAlign = 'center';
        div.style.padding = '20px';
        div.style.border = '1px solid #ddd';
        div.style.borderRadius = '8px';
        
        const qrContainer = document.createElement('div');
        qrContainer.id = `qr-item-${item.id}`;
        
        new QRCode(qrContainer, {
            text: `${window.location.origin}?item=${item.id}`,
            width: 150,
            height: 150,
            correctLevel: QRCode.CorrectLevel.H
        });
        
        const titulo = document.createElement('h4');
        titulo.textContent = item.nome;
        titulo.style.margin = '10px 0';
        
        const botaoDownload = document.createElement('button');
        botaoDownload.className = 'btn btn-secondary';
        botaoDownload.innerHTML = '<i class="fas fa-download"></i> Baixar';
        botaoDownload.style.marginTop = '10px';
        botaoDownload.onclick = () => {
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `qrcode-${item.id}.png`;
                link.click();
            }
        };
        
        div.appendChild(qrContainer);
        div.appendChild(titulo);
        div.appendChild(botaoDownload);
        
        container.appendChild(div);
    });
    
    return container;
}

/**
 * Gerar código de adesivo para impressão (múltiplos QR codes em uma página)
 */
function gerarAdesivoImprimivel(itens) {
    const janela = window.open('', '_blank');
    
    let html = `
        <html>
            <head>
                <title>Adesivos Findly - QR Codes</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 10mm; background: white; }
                    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; }
                    .sticker { 
                        border: 1px solid #ddd; 
                        padding: 10mm; 
                        text-align: center;
                        page-break-inside: avoid;
                    }
                    .qr { width: 60mm; height: 60mm; display: flex; align-items: center; justify-content: center; }
                    .titulo { font-size: 12px; margin-top: 5mm; font-weight: bold; }
                    .subtitulo { font-size: 10px; color: #666; margin-top: 2mm; }
                    @media print {
                        body { padding: 0; }
                        .grid { gap: 0; }
                        .sticker { border: 0.5px solid #999; }
                    }
                </style>
            </head>
            <body>
                <div class="grid">
    `;
    
    itens.forEach(item => {
        html += `
            <div class="sticker">
                <div class="qr" id="qr-${item.id}"></div>
                <div class="titulo">${item.nome.substring(0, 20)}</div>
                <div class="subtitulo">${item.categoria}</div>
            </div>
        `;
    });
    
    html += `
                </div>
                <script>
                    const itens = ${JSON.stringify(itens)};
                    itens.forEach(item => {
                        new QRCode(document.getElementById('qr-' + item.id), {
                            text: '${window.location.origin}?item=' + item.id,
                            width: 200,
                            height: 200,
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    });
                    window.print();
                </script>
            </body>
        </html>
    `;
    
    janela.document.write(html);
    janela.document.close();
}

/**
 * Ler QR Code da câmera (Requer biblioteca adicional)
 * Você pode usar: jsQR, html5-qrcode, etc.
 */
function iniciarLeituraQRCode() {
    const modal = document.createElement('dialog');
    modal.style.maxWidth = '600px';
    modal.style.width = '90%';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('dialog').close()">&times;</span>
            <h2>Escanear QR Code</h2>
            <div id="scanner-container" style="width: 100%; position: relative;">
                <video id="scanner-video" style="width: 100%;"></video>
            </div>
            <div id="resultado-scanner" style="margin-top: 20px;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.showModal();
    
    // Implementação simplificada - você precisará adicionar uma biblioteca de leitura de QR
    console.log('Função de leitura de QR code requer biblioteca adicional (html5-qrcode ou jsQR)');
}