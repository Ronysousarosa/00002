// Sistema de autenticação para funções administrativas
// Este script implementa proteção por senha para funções sensíveis do bolão

// Senha do administrador (em produção, isso deveria ser armazenado de forma mais segura)
const ADMIN_PASSWORD = "123456"; // Senha padrão inicial

// Variável para controlar se o usuário está autenticado
let isAuthenticated = false;

// Função para verificar senha
function verificarSenha(senha) {
    // Em um sistema real, isso deveria usar hash e salt
    return senha === ADMIN_PASSWORD;
}

// Função para solicitar senha
function solicitarSenha(callback, mensagem = "Digite a senha de administrador:") {
    // Se já estiver autenticado, executar callback diretamente
    if (isAuthenticated) {
        callback();
        return;
    }
    
    // Criar modal de senha
    const modalHtml = `
    <div class="modal fade" id="modalSenha" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="bi bi-shield-lock me-1"></i> Autenticação Necessária</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>${mensagem}</p>
                    <div class="mb-3">
                        <label for="inputSenha" class="form-label">Senha</label>
                        <input type="password" class="form-control" id="inputSenha">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="manterSessao">
                        <label class="form-check-label" for="manterSessao">
                            Manter sessão ativa por 30 minutos
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btnConfirmarSenha">Confirmar</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Adicionar modal ao DOM se não existir
    if (!document.getElementById('modalSenha')) {
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
    }
    
    // Configurar evento do botão de confirmar
    const configurarEventos = () => {
        const btnConfirmar = document.getElementById('btnConfirmarSenha');
        if (btnConfirmar) {
            // Remover event listeners existentes
            const novoBotao = btnConfirmar.cloneNode(true);
            btnConfirmar.parentNode.replaceChild(novoBotao, btnConfirmar);
            
            // Adicionar novo event listener
            novoBotao.addEventListener('click', function() {
                const senha = document.getElementById('inputSenha').value;
                const manterSessao = document.getElementById('manterSessao').checked;
                
                if (verificarSenha(senha)) {
                    // Autenticar usuário
                    isAuthenticated = true;
                    
                    // Se marcou para manter sessão, definir timeout para desautenticar
                    if (manterSessao) {
                        setTimeout(() => {
                            isAuthenticated = false;
                        }, 30 * 60 * 1000); // 30 minutos
                    }
                    
                    // Fechar modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalSenha'));
                    if (modal) modal.hide();
                    
                    // Executar callback
                    callback();
                } else {
                    alert('Senha incorreta. Tente novamente.');
                }
            });
        }
        
        // Configurar evento de tecla Enter no campo de senha
        const inputSenha = document.getElementById('inputSenha');
        if (inputSenha) {
            inputSenha.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('btnConfirmarSenha').click();
                }
            });
        }
    };
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalSenha'));
    modal.show();
    
    // Configurar eventos após modal ser mostrado
    document.getElementById('modalSenha').addEventListener('shown.bs.modal', function() {
        configurarEventos();
        document.getElementById('inputSenha').focus();
    });
}

// Função para proteger a exclusão de participantes
function protegerExclusaoParticipante(id) {
    solicitarSenha(() => {
        // Chamar a função original de exclusão
        excluirParticipante(id);
    }, "Digite a senha de administrador para excluir este participante:");
}

// Função para proteger a alteração de configurações
function protegerConfiguracoes() {
    solicitarSenha(() => {
        // Mostrar modal de configurações
        const modal = new bootstrap.Modal(document.getElementById('modalConfiguracoes'));
        modal.show();
    }, "Digite a senha de administrador para acessar as configurações:");
}

// Função para proteger a limpeza de todos os dados
function protegerLimpezaDados() {
    solicitarSenha(() => {
        // Confirmar novamente a ação
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            // Chamar a função original de limpeza
            limparDados();
        }
    }, "Digite a senha de administrador para limpar todos os dados:");
}

// Função para alterar a senha do administrador
function alterarSenhaAdmin() {
    solicitarSenha(() => {
        const novaSenha = prompt("Digite a nova senha de administrador:");
        if (novaSenha && novaSenha.trim() !== "") {
            ADMIN_PASSWORD = novaSenha.trim();
            alert("Senha alterada com sucesso!");
            
            // Salvar nova senha em localStorage
            localStorage.setItem('bolaoLotofacilSenha', ADMIN_PASSWORD);
        } else {
            alert("Senha inválida. A senha não foi alterada.");
        }
    }, "Digite a senha atual para alterá-la:");
}

// Função para inicializar proteção por senha
function inicializarProtecaoPorSenha() {
    // Carregar senha salva, se existir
    const senhaSalva = localStorage.getItem('bolaoLotofacilSenha');
    if (senhaSalva) {
        ADMIN_PASSWORD = senhaSalva;
    }
    
    // Substituir evento do botão de configurações
    const btnConfiguracoes = document.getElementById('btnConfiguracoes');
    if (btnConfiguracoes) {
        // Remover event listeners existentes
        const novoBotao = btnConfiguracoes.cloneNode(true);
        btnConfiguracoes.parentNode.replaceChild(novoBotao, btnConfiguracoes);
        
        // Adicionar novo event listener
        novoBotao.addEventListener('click', function() {
            protegerConfiguracoes();
        });
    }
    
    // Substituir evento do botão de limpar dados
    const btnLimpar = document.getElementById('btnLimpar');
    if (btnLimpar) {
        // Remover event listeners existentes
        const novoBotao = btnLimpar.cloneNode(true);
        btnLimpar.parentNode.replaceChild(novoBotao, btnLimpar);
        
        // Adicionar novo event listener
        novoBotao.addEventListener('click', function() {
            protegerLimpezaDados();
        });
    }
    
    // Adicionar opção para alterar senha no modal de configurações
    const modalFooter = document.querySelector('#modalConfiguracoes .modal-footer');
    if (modalFooter) {
        const btnAlterarSenha = document.createElement('button');
        btnAlterarSenha.type = 'button';
        btnAlterarSenha.className = 'btn btn-warning';
        btnAlterarSenha.innerHTML = '<i class="bi bi-key me-1"></i> Alterar Senha';
        btnAlterarSenha.addEventListener('click', function() {
            alterarSenhaAdmin();
        });
        
        // Inserir antes do botão Salvar
        modalFooter.insertBefore(btnAlterarSenha, modalFooter.firstChild);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar carregamento completo da página
    setTimeout(inicializarProtecaoPorSenha, 1000);
});
