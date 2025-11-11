/* ============================================
   GEOLOCATION.JS - Funções de Geolocalização
   ============================================ */

// ============================================
// CONSTANTES
// ============================================

const RAIO_TERRA_KM = 6371;

// ============================================
// FUNÇÕES DE GEOLOCALIZAÇÃO
// ============================================

/**
 * Obter localização do usuário
 */
function obterLocalizacaoAutomatica() {
    if (!navigator.geolocation) {
        exibirToast('Geolocalização não é suportada pelo seu navegador', 'error');
        return;
    }
    
    // Mostrar loading
    const btn = event.target;
    const textoBotao = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localizando...';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        // Sucesso
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const precisao = position.coords.accuracy;
            
            // Salvar no localStorage
            const localizacao = {
                latitude: latitude,
                longitude: longitude,
                precisao: precisao,
                timestamp: Date.now()
            };
            
            salvarLocalStorage('localizacaoUsuario', localizacao);
            
            // Atualizar campo de localização
            const localizacaoInput = document.getElementById('localizacao-item');
            if (localizacaoInput) {
                obterNomeLocal(latitude, longitude).then(nomeLocal => {
                    localizacaoInput.value = nomeLocal;
                    
                    // Mostrar preview do mapa
                    const mapaPreview = document.getElementById('mapa-preview');
                    if (mapaPreview) {
                        document.getElementById('local-capturado').textContent = nomeLocal;
                        mapaPreview.style.display = 'block';
                    }
                });
            }
            
            exibirToast('Localização capturada com sucesso!', 'success');
            btn.innerHTML = textoBotao;
            btn.disabled = false;
        },
        // Erro
        (error) => {
            let mensagem = 'Erro ao obter localização';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    mensagem = 'Permissão negada. Habilite o acesso à localização nas configurações do navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensagem = 'Localização não disponível no momento.';
                    break;
                case error.TIMEOUT:
                    mensagem = 'Timeout ao obter localização.';
                    break;
            }
            
            exibirToast(mensagem, 'error');
            btn.innerHTML = textoBotao;
            btn.disabled = false;
        },
        // Opções
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Obter nome local a partir de coordenadas (Geocoding reverso)
 * Usando OpenStreetMap Nominatim (sem autenticação)
 */
async function obterNomeLocal(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const dados = await response.json();
        
        // Retornar endereço ou coordenadas como fallback
        return dados.address?.city || 
               dados.address?.town || 
               dados.address?.county ||
               `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (erro) {
        console.error('Erro ao obter nome local:', erro);
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
}

/**
 * Calcular distância entre duas coordenadas (Fórmula de Haversine)
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = RAIO_TERRA_KM * c;
    
    return distancia;
}

/**
 * Obter localização salva do usuário
 */
function obterLocalizacaoSalva() {
    return obterLocalStorage('localizacaoUsuario', null);
}

/**
 * Filtrar itens por distância
 */
function filtrarPorDistancia(itens, distanciaMaximaKm) {
    const localizacao = obterLocalizacaoSalva();
    
    if (!localizacao || !itens) return itens;
    
    return itens.filter(item => {
        if (!item.latitude || !item.longitude) return true; // Incluir itens sem coordenadas
        
        const dist = calcularDistancia(
            localizacao.latitude,
            localizacao.longitude,
            item.latitude,
            item.longitude
        );
        
        return dist <= distanciaMaximaKm;
    });
}

/**
 * Monitorar mudanças de localização em tempo real
 */
function monitorarLocalizacao(callback) {
    if (!navigator.geolocation) {
        console.error('Geolocalização não suportada');
        return null;
    }
    
    return navigator.geolocation.watchPosition(
        (position) => {
            const localizacao = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                precisao: position.coords.accuracy,
                timestamp: Date.now()
            };
            
            salvarLocalStorage('localizacaoUsuario', localizacao);
            
            if (callback) {
                callback(localizacao);
            }
        },
        (error) => {
            console.error('Erro ao monitorar localização:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

/**
 * Parar de monitorar localização
 */
function pararMonitorarLocalizacao(watchId) {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
}

/**
 * Converter graus em radianos
 */
function grausParaRadianos(graus) {
    return graus * (Math.PI / 180);
}

/**
 * Converter radianos em graus
 */
function radianosParaGraus(radianos) {
    return radianos * (180 / Math.PI);
}

// ============================================
// INTEGRAÇÃO COM GOOGLE MAPS (FUTURO)
// ============================================

/**
 * Inicializar mapa Google
 * Requer: <script src="https://maps.googleapis.com/maps/api/js?key=SUA_API_KEY"></script>
 */
function inicializarMapa(elementoId, latitude, longitude, zoom = 15) {
    if (typeof google === 'undefined') {
        console.error('Google Maps API não carregada');
        return null;
    }
    
    const mapa = new google.maps.Map(document.getElementById(elementoId), {
        zoom: zoom,
        center: { lat: latitude, lng: longitude },
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false
    });
    
    // Adicionar marcador da localização do usuário
    const marcadorUsuario = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapa,
        title: 'Sua Localização',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    
    return { mapa, marcadorUsuario };
}

/**
 * Adicionar marcadores de itens no mapa
 */
function adicionarMarcadoresItens(mapa, itens) {
    const marcadores = [];
    
    itens.forEach(item => {
        if (item.latitude && item.longitude) {
            const cor = item.tipo === 'perdido' ? 'red' : 'green';
            
            const marcador = new google.maps.Marker({
                position: { lat: item.latitude, lng: item.longitude },
                map: mapa,
                title: item.nome,
                icon: `http://maps.google.com/mapfiles/ms/icons/${cor}-dot.png`
            });
            
            // Info window
            const infoWindow = new google.maps.InfoWindow({
                content: `<div>
                    <h3>${item.nome}</h3>
                    <p>${item.descricao}</p>
                    <p><strong>Tipo:</strong> ${item.tipo}</p>
                    <p><strong>Categoria:</strong> ${item.categoria}</p>
                </div>`
            });
            
            marcador.addListener('click', () => {
                infoWindow.open(mapa, marcador);
            });
            
            marcadores.push(marcador);
        }
    });
    
    return marcadores;
}