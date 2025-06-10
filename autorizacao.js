// Sistema de autorização para novos palpites
// Este script implementa a funcionalidade de autorização pelo administrador

// Array para armazenar palpites pendentes de autorização
let palpitesPendentes = [];

// Função para adicionar palpite à fila de pendentes
function adicionarPalpitePendente(nome, telefone, bilhete, dezenas) {
    // Validar dados
    if (!nome || !dezenas || dezenas.length !== 10) {
        alert('Dados incompletos ou inválidos. Verifique se selecionou exatamente 10 dezenas.');
        return false;
    }
    
    // Criar novo palpite pendente
    const novoPalpite = {
        id: Date.now(), // ID único baseado no timestamp
        nome: nome,
        telefone: telefone || '-',
        bilhete: bilhete || '-',
        dezenas: dezenas,
        dataSubmissao: new Date().toLocaleString()
    };
    
    // Adicionar à fila de pendentes
    palpitesPendentes.push(novoPalpite);
    
    // Salvar em localStorage
    salvarPalpitesPendentes();
    
    // Atualizar interface de pendentes
    atualizarInterfacePendentes();
    
    return true;
}

// Função para autorizar palpite
function autorizarPalpite(id) {
    // Encontrar palpite na fila
    const index = palpitesPendentes.findIndex(p => p.id === id);
    
    if (index === -1) {
        alert('Palpite não encontrado na fila de pendentes.');
        return false;
    }
    
    // Obter palpite
    const palpite = palpitesPendentes[index];
    
    // Adicionar ao sistema como participante
    adicionarParticipante(palpite.nome, palpite.telefone, palpite.bilhete, palpite.dezenas);
    
    // Remover da fila de pendentes
    palpitesPendentes.splice(index, 1);
    
    // Salvar em localStorage
    salvarPalpitesPendentes();
    
    // Atualizar interface de pendentes
    atualizarInterfacePendentes();
    
    return true;
}

// Função para recusar palpite
function recusarPalpite(id) {
    // Encontrar palpite na fila
    const index = palpitesPendentes.findIndex(p => p.id === id);
    
    if (index === -1) {
        alert('Palpite não encontrado na fila de pendentes.');
        return false;
    }
    
    // Remover da fila de pendentes
    palpitesPendentes.splice(index, 1);
    
    // Salvar em localStorage
    salvarPalpitesPendentes();
    
    // Atualizar interface de pendentes
    atualizarInterfacePendentes();
    
    return true;
}

// Função para salvar palpites pendentes em localStorage
function salvarPalpitesPendentes() {
    localStorage.setItem('palpitesPendentes', JSON.stringify(palpitesPendentes));
}

// Função para carregar palpites pendentes de localStorage
function carregarPalpitesPendentes() {
    const dados = localStorage.getItem('palpitesPendentes');
    
    if (dados) {
        palpitesPendentes = JSON.parse(dados);
    }
}

// Função para atualizar interface de palpites pendentes
function atualizarInterfacePendentes() {
    const containerPendentes = document.getElementById('palpitesPendentes');
    if (!containerPendentes) return;
    
    // Limpar container
    containerPendentes.innerHTML = '';
    
    // Verificar se há palpites pendentes
    if (palpitesPendentes.length === 0) {
        containerPendentes.innerHTML = '<p class="text-muted">Não há palpites pendentes de autorização.</p>';
        
        // Atualizar contador no badge
        const badgePendentes = document.getElementById('badgePendentes');
        if (badgePendentes) {
            badgePendentes.textContent = '0';
            badgePendentes.style.display = 'none';
        }
        
        return;
    }
    
    // Atualizar contador no badge
    const badgePendentes = document.getElementById('badgePendentes');
    if (badgePendentes) {
        badgePendentes.textContent = palpitesPendentes.length;
        badgePendentes.style.display = 'inline-block';
    }
    
    // Criar tabela de pendentes
    const table = document.createElement('table');
    table.className = 'table table-hover table-striped';
    
    // Cabeçalho da tabela
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
    
    // Corpo da tabela
    const tbody = document.createElement('tbody');
    
    for (const palpite of palpitesPendentes) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
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
                <button class="btn btn-sm btn-success me-1 btn-autorizar" data-id="${palpite.id}">
                    <i class="bi bi-check-circle"></i> Autorizar
                </button>
                <button class="btn btn-sm btn-danger btn-recusar" data-id="${palpite.id}">
                    <i class="bi bi-x-circle"></i> Recusar
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    containerPendentes.appendChild(table);
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-autorizar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            autorizarPalpite(id);
        });
    });
    
    document.querySelectorAll('.btn-recusar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            recusarPalpite(id);
        });
    });
}

// Inicializar sistema de autorização
document.addEventListener('DOMContentLoaded', function() {
    // Carregar palpites pendentes
    carregarPalpitesPendentes();
    
    // Modificar o formulário de adição de participante
    const formNovoParticipante = document.getElementById('formNovoParticipante');
    if (formNovoParticipante) {
        formNovoParticipante.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nomeParticipante').value;
            const telefone = document.getElementById('telefoneParticipante').value;
            const bilhete = document.getElementById('bilheteParticipante').value;
            
            // Obter dezenas selecionadas
            const dezenasSelecionadas = [];
            document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
                dezenasSelecionadas.push(parseInt(el.textContent));
            });
            
            // Adicionar à fila de pendentes
            if (adicionarPalpitePendente(nome, telefone, bilhete, dezenasSelecionadas)) {
                // Limpar formulário
                formNovoParticipante.reset();
                document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
                    el.classList.remove('selecionado');
                });
                document.getElementById('contadorDezenas').textContent = '0/10 dezenas selecionadas';
                
                // Mostrar mensagem de sucesso
                alert('Palpite enviado com sucesso! Aguardando autorização do administrador.');
            }
        });
    }
    
    // Adicionar CSS para o sistema de autorização
    const style = document.createElement('style');
    style.textContent = `
        .badge-pendentes {
            background-color: #dc3545;
            color: white;
            border-radius: 50%;
            padding: 3px 6px;
            font-size: 12px;
            position: absolute;
            top: -5px;
            right: -5px;
        }
        
        .btn-autorizar {
            padding: 2px 5px;
            font-size: 12px;
        }
        
        .btn-recusar {
            padding: 2px 5px;
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar botão de autorização na barra de navegação
    const header = document.querySelector('.header .container .row');
    if (header) {
        const colBtn = document.createElement('div');
        colBtn.className = 'col-md-4 text-md-end mt-3 mt-md-0';
        colBtn.innerHTML = `
            <button class="btn btn-warning position-relative me-2" data-bs-toggle="modal" data-bs-target="#modalAutorizacao">
                <i class="bi bi-shield-lock me-1"></i> Autorização
                <span id="badgePendentes" class="badge-pendentes" style="display: none;">0</span>
            </button>
            <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#modalSobre">
                <i class="bi bi-info-circle me-1"></i> Sobre o Bolão
            </button>
        `;
        header.appendChild(colBtn);
    }
    
    // Adicionar modal de autorização
    const modalAutorizacao = document.createElement('div');
    modalAutorizacao.className = 'modal fade';
    modalAutorizacao.id = 'modalAutorizacao';
    modalAutorizacao.tabIndex = '-1';
    modalAutorizacao.setAttribute('aria-hidden', 'true');
    
    modalAutorizacao.innerHTML = `
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
    
    document.body.appendChild(modalAutorizacao);
    
    // Atualizar interface de pendentes
    atualizarInterfacePendentes();
});
