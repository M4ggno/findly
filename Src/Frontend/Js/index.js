document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Findly Landing Page carregada');
    
    // Verificar tema salvo
    const temaSalvo = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaSalvo);
    
    // Event listeners
    configurarEventListeners();
});

// ============================================
// EVENT LISTENERS
// ============================================

function configurarEventListeners() {
    // Botões "Cadastre um item"
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            if (btn.textContent.includes('Cadastre') || btn.textContent.includes('Acessar')) {
                navegarParaApp();
            }
        });
    });
    
    // Botão Entrar
    const btnEntrar = document.querySelector('.btn-entrar');
    if (btnEntrar) {
        btnEntrar.addEventListener('click', navegarParaApp);
    }
    
    // Smooth scroll para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// NAVEGAÇÃO
// ============================================

function navegarParaApp() {
    // Redirecionar para a aplicação (app.html)
    window.location.href = 'app.html';
}

// ============================================
// TEMA
// ============================================

function alternarTema() {
    const temaAtual = document.documentElement.getAttribute('data-theme') || 'light';
    const novoTema = temaAtual === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', novoTema);
    localStorage.setItem('tema', novoTema);
    
    console.log(`Tema alterado para: ${novoTema}`);
}

// ============================================
// ANIMATIONS ON SCROLL
// ============================================

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});