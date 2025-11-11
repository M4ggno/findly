/* ============================================
   VALIDATION.JS - Funções de Validação
   ============================================ */

// ============================================
// REGEX PATTERNS
// ============================================

const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefone: /^(\(?\d{2}\)?[\s]?)?(\d{4,5})[-\s]?(\d{4})$/,
    cep: /^\d{5}-?\d{3}$/,
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
};

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Valida email
 */
function validarEmail(email) {
    return PATTERNS.email.test(email.trim());
}

/**
 * Valida telefone (formato brasileiro)
 */
function validarTelefone(telefone) {
    return PATTERNS.telefone.test(telefone.replace(/\s/g, ''));
}

/**
 * Valida CEP
 */
function validarCEP(cep) {
    return PATTERNS.cep.test(cep);
}

/**
 * Valida CPF
 */
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

/**
 * Valida campo obrigatório
 */
function validarObrigatorio(valor) {
    return valor.trim().length > 0;
}

/**
 * Valida comprimento mínimo
 */
function validarMinimoCaracteres(valor, minimo) {
    return valor.trim().length >= minimo;
}

/**
 * Valida comprimento máximo
 */
function validarMaximoCaracteres(valor, maximo) {
    return valor.length <= maximo;
}

/**
 * Valida URL
 */
function validarURL(url) {
    return PATTERNS.url.test(url);
}

/**
 * Valida se é número
 */
function validarNumero(valor) {
    return !isNaN(valor) && valor.trim() !== '';
}

/**
 * Valida senha forte
 */
function validarSenhaForte(senha) {
    // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número, 1 especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
}

/**
 * Valida data (DD/MM/YYYY)
 */
function validarData(data) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = data.match(regex);
    
    if (!match) return false;
    
    const dia = parseInt(match[1]);
    const mes = parseInt(match[2]);
    const ano = parseInt(match[3]);
    
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    if ([4, 6, 9, 11].includes(mes) && dia > 30) return false;
    
    // Validar fevereiro
    const ehBissexto = (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
    if (mes === 2 && dia > (ehBissexto ? 29 : 28)) return false;
    
    return true;
}

// ============================================
// MÁSCARAS DE ENTRADA
// ============================================

/**
 * Aplicar máscara de telefone
 */
function mascaraTelefone(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    
    if (valor.length <= 2) {
        return valor;
    } else if (valor.length <= 7) {
        return `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else {
        return `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7)}`;
    }
}

/**
 * Aplicar máscara de CEP
 */
function mascaraCEP(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 8);
    
    if (valor.length <= 5) {
        return valor;
    } else {
        return `${valor.substring(0, 5)}-${valor.substring(5)}`;
    }
}

/**
 * Aplicar máscara de CPF
 */
function mascaraCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    
    if (valor.length <= 3) {
        return valor;
    } else if (valor.length <= 6) {
        return `${valor.substring(0, 3)}.${valor.substring(3)}`;
    } else if (valor.length <= 9) {
        return `${valor.substring(0, 3)}.${valor.substring(3, 6)}.${valor.substring(6)}`;
    } else {
        return `${valor.substring(0, 3)}.${valor.substring(3, 6)}.${valor.substring(6, 9)}-${valor.substring(9)}`;
    }
}

/**
 * Aplicar máscara de data
 */
function mascaraData(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 8);
    
    if (valor.length <= 2) {
        return valor;
    } else if (valor.length <= 4) {
        return `${valor.substring(0, 2)}/${valor.substring(2)}`;
    } else {
        return `${valor.substring(0, 2)}/${valor.substring(2, 4)}/${valor.substring(4)}`;
    }
}

/**
 * Aplicar máscara genérica de moeda
 */
function mascaraMoeda(valor) {
    valor = valor.replace(/\D/g, '');
    valor = (parseInt(valor) / 100).toFixed(2);
    
    return valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ============================================
// VALIDAÇÃO DE FORMULÁRIO COMPLETO
// ============================================

/**
 * Validar formulário com mensagens de erro
 */
function validarFormulario(formularioId) {
    const form = document.getElementById(formularioId);
    if (!form) return false;
    
    const campos = form.querySelectorAll('[required], [data-validate]');
    let isValido = true;
    
    campos.forEach(campo => {
        const tipo = campo.getAttribute('data-validate') || campo.type;
        const errorElementId = campo.id + '-error';
        const errorElement = document.getElementById(errorElementId);
        
        let validoAtual = true;
        let mensagemErro = '';
        
        // Validação obrigatória
        if (campo.hasAttribute('required') && !validarObrigatorio(campo.value)) {
            validoAtual = false;
            mensagemErro = 'Este campo é obrigatório';
        }
        
        // Validações específicas
        if (validoAtual && campo.value.trim() !== '') {
            switch (tipo) {
                case 'email':
                    if (!validarEmail(campo.value)) {
                        validoAtual = false;
                        mensagemErro = 'Email inválido';
                    }
                    break;
                    
                case 'tel':
                case 'telefone':
                    if (!validarTelefone(campo.value)) {
                        validoAtual = false;
                        mensagemErro = 'Telefone inválido (formato: (83) 98888-8888)';
                    }
                    break;
                    
                case 'cep':
                    if (!validarCEP(campo.value)) {
                        validoAtual = false;
                        mensagemErro = 'CEP inválido';
                    }
                    break;
                    
                case 'cpf':
                    if (!validarCPF(campo.value)) {
                        validoAtual = false;
                        mensagemErro = 'CPF inválido';
                    }
                    break;
                    
                case 'password':
                    if (!validarSenhaForte(campo.value)) {
                        validoAtual = false;
                        mensagemErro = 'Senha fraca (mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial)';
                    }
                    break;
            }
        }
        
        // Atualizar feedback visual
        if (validoAtual) {
            campo.classList.remove('invalid');
            campo.classList.add('valid');
            if (errorElement) {
                errorElement.classList.remove('active');
                errorElement.textContent = '';
            }
        } else {
            campo.classList.add('invalid');
            campo.classList.remove('valid');
            if (errorElement) {
                errorElement.classList.add('active');
                errorElement.textContent = mensagemErro;
            }
            isValido = false;
        }
    });
    
    return isValido;
}

// ============================================
// EVENT LISTENERS PARA VALIDAÇÃO EM TEMPO REAL
// ============================================

/**
 * Adicionar event listeners para validação em tempo real
 */
function adicionarValidacaoTempoReal(formularioId) {
    const form = document.getElementById(formularioId);
    if (!form) return;
    
    const campos = form.querySelectorAll('input, textarea, select');
    
    campos.forEach(campo => {
        // Validar ao sair do campo
        campo.addEventListener('blur', function() {
            const tipo = this.getAttribute('data-validate') || this.type;
            const errorElementId = this.id + '-error';
            const errorElement = document.getElementById(errorElementId);
            
            let validoAtual = true;
            let mensagemErro = '';
            
            if (this.hasAttribute('required') && !validarObrigatorio(this.value)) {
                validoAtual = false;
                mensagemErro = 'Este campo é obrigatório';
            } else if (this.value.trim() !== '') {
                switch (tipo) {
                    case 'email':
                        validoAtual = validarEmail(this.value);
                        mensagemErro = 'Email inválido';
                        break;
                    case 'tel':
                    case 'telefone':
                        validoAtual = validarTelefone(this.value);
                        mensagemErro = 'Telefone inválido';
                        break;
                }
            }
            
            if (validoAtual) {
                this.classList.remove('invalid');
                this.classList.add('valid');
                if (errorElement) errorElement.classList.remove('active');
            } else {
                this.classList.add('invalid');
                if (errorElement) {
                    errorElement.classList.add('active');
                    errorElement.textContent = mensagemErro;
                }
            }
        });
        
        // Aplicar máscaras
        if (campo.type === 'tel' || campo.getAttribute('data-mask') === 'telefone') {
            campo.addEventListener('input', function() {
                this.value = mascaraTelefone(this.value);
            });
        }
    });
}