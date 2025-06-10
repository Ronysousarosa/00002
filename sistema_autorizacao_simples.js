// Sistema de autorização simplificado para novos palpites
// Esta versão usa uma abordagem mais direta e simples para garantir funcionamento

// Variáveis globais
let palpitesPendentes = [];
const VALOR_PALPITE = 5; // R$ 5,00 por palpite

// Função para inicializar o sistema
function inicializarAutorizacao() {
    console.log('Sistema de autorização simplificado inicializado');
    
    // Carregar palpites pendentes
    carregarPalpitesPendentes();
    
    // Configurar formulário
    configurarFormulario();
    
    // Adicionar botão de autorização
    adicionarBotaoAutorizacao();
    
    // Adicionar modal de autorização
    adicionarModalAutorizacao();
    
    // Atualizar interface
    atualizarInterfacePendentes();
}

// Função para carregar palpites pendentes
function carregarPalpitesPendentes() {
    const dados = localStorage.getItem('palpitesPendentes_simples');
    
    if (dados) {
        try {
            palpitesPendentes = JSON.parse(dados);
            console.log(`${palpitesPendentes.length} palpites pendentes carregados`);
        } catch (e) {
            console.error('Erro ao carregar palpites pendentes:', e);
            palpitesPendentes = [];
        }
    }
}

// Função para salvar palpites pendentes
function salvarPalpitesPendentes() {
    localStorage.setItem('palpitesPendentes_simples', JSON.stringify(palpitesPendentes));
}

// Função para configurar formulário
function configurarFormulario() {
    const form = document.getElementById('formNovoParticipante');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Remover event listeners existentes
    const novoForm = form.cloneNode(true);
    form.parentNode.replaceChild(novoForm, form);
    
    // Adicionar novo event listener
    novoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nomeParticipante').value;
        const telefone = document.getElementById('telefoneParticipante').value || '-';
        const bilhete = document.getElementById('bilheteParticipante').value || '-';
        
        // Obter dezenas selecionadas
        const dezenas = [];
        document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
            dezenas.push(parseInt(el.textContent));
        });
        
        // Validar dados
        if (!nome) {
            alert('Por favor, informe o nome do participante.');
            return;
        }
        
        if (dezenas.length !== 10) {
            alert('Por favor, selecione exatamente 10 dezenas.');
            return;
        }
        
        // Adicionar à fila de pendentes
        const novoPalpite = {
            id: Date.now(),
            nome: nome,
            telefone: telefone,
            bilhete: bilhete,
            dezenas: dezenas,
            dataSubmissao: new Date().toLocaleString()
        };
        
        palpitesPendentes.push(novoPalpite);
        salvarPalpitesPendentes();
        
        // Atualizar interface
        atualizarInterfacePendentes();
        
        // Limpar formulário
        novoForm.reset();
        document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
            el.classList.remove('selecionado');
        });
        document.getElementById('contadorDezenas').textContent = '0/10 dezenas selecionadas';
        
        alert('Palpite enviado com sucesso! Aguardando autorização do administrador.');
    });
    
    console.log('Formulário configurado com sucesso');
}

// Função para adicionar botão de autorização
function adicionarBotaoAutorizacao() {
    const container = document.querySelector('.header .container .row .col-md-4');
    
    if (!container) {
        console.error('Container não encontrado');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Adicionar botão de autorização
    const btnAutorizacao = document.createElement('button');
    btnAutorizacao.className = 'btn btn-warning position-relative me-2';
    btnAutorizacao.setAttribute('data-bs-toggle', 'modal');
    btnAutorizacao.setAttribute('data-bs-target', '#modalAutorizacao');
    btnAutorizacao.innerHTML = `
        <i class="bi bi-shield-lock me-1"></i> Autorização
        <span id="badgePendentes" class="badge-pendentes" style="display: none;">0</span>
    `;
    
    // Adicionar botão sobre
    const btnSobre = document.createElement('button');
    btnSobre.className = 'btn btn-light';
    btnSobre.setAttribute('data-bs-toggle', 'modal');
    btnSobre.setAttribute('data-bs-target', '#modalSobre');
    btnSobre.innerHTML = `<i class="bi bi-info-circle me-1"></i> Sobre o Bolão`;
    
    container.appendChild(btnAutorizacao);
    container.appendChild(btnSobre);
    
    console.log('Botão de autorização adicionado com sucesso');
}

// Função para adicionar modal de autorização
function adicionarModalAutorizacao() {
    // Remover modal existente se houver
    const modalExistente = document.getElementById('modalAutorizacao');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Criar novo modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalAutorizacao';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title"><i class="bi bi-shield-lock me-1"></i> Autorização de Palpites</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="palpitesPendentes">
                        <p class="text-muted">Não há palpites pendentes de autorização.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    console.log('Modal de autorização adicionado com sucesso');
}

// Função para atualizar interface de pendentes
function atualizarInterfacePendentes() {
    const container = document.getElementById('palpitesPendentes');
    
    if (!container) {
        console.error('Container de pendentes não encontrado');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Verificar se há palpites pendentes
    if (palpitesPendentes.length === 0) {
        container.innerHTML = '<p class="text-muted">Não há palpites pendentes de autorização.</p>';
        
        // Atualizar badge
        const badge = document.getElementById('badgePendentes');
        if (badge) {
            badge.style.display = 'none';
        }
        
        return;
    }
    
    // Atualizar badge
    const badge = document.getElementById('badgePendentes');
    if (badge) {
        badge.textContent = palpitesPendentes.length;
        badge.style.display = 'inline-block';
    }
    
    // Criar tabela
    const table = document.createElement('table');
    table.className = 'table table-hover';
    
    // Cabeçalho
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Bilhete</th>
            <th>Dezenas</th>
            <th>Data</th>
            <th>Ações</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Corpo
    const tbody = document.createElement('tbody');
    
    for (const palpite of palpitesPendentes) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${palpite.nome}</td>
            <td>${palpite.telefone}</td>
            <td>${palpite.bilhete}</td>
            <td>
                ${palpite.dezenas.map(d => {
                    return `<span class="numero-pequeno">${d < 10 ? '0' + d : d}</span>`;
                }).join('')}
            </td>
            <td>${palpite.dataSubmissao}</td>
            <td>
                <button class="btn btn-sm btn-success me-1" onclick="autorizarPalpite(${palpite.id})">
                    <i class="bi bi-check-circle"></i> Autorizar
                </button>
                <button class="btn btn-sm btn-danger" onclick="recusarPalpite(${palpite.id})">
                    <i class="bi bi-x-circle"></i> Recusar
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    console.log('Interface de pendentes atualizada');
}

// Função para autorizar palpite
function autorizarPalpite(id) {
    console.log('Autorizando palpite:', id);
    
    // Encontrar palpite
    const index = palpitesPendentes.findIndex(p => p.id === id);
    
    if (index === -1) {
        alert('Palpite não encontrado.');
        return;
    }
    
    const palpite = palpitesPendentes[index];
    
    // Adicionar ao sistema
    adicionarParticipante(palpite.nome, palpite.telefone, palpite.bilhete, palpite.dezenas);
    
    // Remover da fila
    palpitesPendentes.splice(index, 1);
    salvarPalpitesPendentes();
    
    // Atualizar interface
    atualizarInterfacePendentes();
    
    alert('Palpite autorizado com sucesso!');
}

// Função para recusar palpite
function recusarPalpite(id) {
    console.log('Recusando palpite:', id);
    
    // Encontrar palpite
    const index = palpitesPendentes.findIndex(p => p.id === id);
    
    if (index === -1) {
        alert('Palpite não encontrado.');
        return;
    }
    
    // Remover da fila
    palpitesPendentes.splice(index, 1);
    salvarPalpitesPendentes();
    
    // Atualizar interface
    atualizarInterfacePendentes();
    
    alert('Palpite recusado com sucesso!');
}

// Expor funções globalmente
window.autorizarPalpite = autorizarPalpite;
window.recusarPalpite = recusarPalpite;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarAutorizacao, 500);
});
