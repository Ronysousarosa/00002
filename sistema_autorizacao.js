// Sistema de autorização para novos palpites - Versão robusta
// Este script implementa a funcionalidade de autorização pelo administrador

// Namespace isolado para evitar conflitos
const SistemaAutorizacao = (function() {
    // Variáveis privadas
    let palpitesPendentes = [];
    const CHAVE_STORAGE = 'palpitesPendentes_v2';
    
    // Função para inicializar o sistema
    function inicializar() {
        console.log('Sistema de autorização inicializado');
        
        // Carregar palpites pendentes
        carregarPalpitesPendentes();
        
        // Substituir o formulário original por nossa versão
        substituirFormulario();
        
        // Adicionar interface de autorização
        adicionarInterfaceAutorizacao();
        
        // Atualizar interface de pendentes
        atualizarInterfacePendentes();
    }
    
    // Função para carregar palpites pendentes do localStorage
    function carregarPalpitesPendentes() {
        const dados = localStorage.getItem(CHAVE_STORAGE);
        
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
    
    // Função para salvar palpites pendentes no localStorage
    function salvarPalpitesPendentes() {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(palpitesPendentes));
    }
    
    // Função para substituir o formulário original
    function substituirFormulario() {
        // Remover qualquer event listener existente
        const formOriginal = document.getElementById('formNovoParticipante');
        if (!formOriginal) {
            console.error('Formulário não encontrado');
            return;
        }
        
        // Clonar o formulário para remover todos os event listeners
        const formNovo = formOriginal.cloneNode(true);
        formOriginal.parentNode.replaceChild(formNovo, formOriginal);
        
        // Adicionar nosso próprio event listener
        formNovo.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nomeParticipante').value;
            const telefone = document.getElementById('telefoneParticipante').value;
            const bilhete = document.getElementById('bilheteParticipante').value;
            
            // Obter dezenas selecionadas
            const dezenasSelecionadas = [];
            document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
                dezenasSelecionadas.push(parseInt(el.textContent));
            });
            
            // Validar dados
            if (!nome || !dezenasSelecionadas || dezenasSelecionadas.length !== 10) {
                alert('Dados incompletos ou inválidos. Verifique se selecionou exatamente 10 dezenas.');
                return;
            }
            
            // Adicionar à fila de pendentes
            adicionarPalpitePendente(nome, telefone, bilhete, dezenasSelecionadas);
            
            // Limpar formulário
            formNovo.reset();
            document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
                el.classList.remove('selecionado');
            });
            document.getElementById('contadorDezenas').textContent = '0/10 dezenas selecionadas';
            
            // Mostrar mensagem de sucesso
            alert('Palpite enviado com sucesso! Aguardando autorização do administrador.');
        });
        
        console.log('Formulário substituído com sucesso');
    }
    
    // Função para adicionar interface de autorização
    function adicionarInterfaceAutorizacao() {
        // Verificar se já existe o botão de autorização
        if (document.getElementById('btnAutorizacao')) {
            console.log('Interface de autorização já existe');
            return;
        }
        
        // Adicionar botão de autorização na barra de navegação
        const headerContainer = document.querySelector('.header .container .row .col-md-4');
        if (!headerContainer) {
            console.error('Container do header não encontrado');
            return;
        }
        
        // Limpar conteúdo existente
        headerContainer.innerHTML = '';
        
        // Adicionar novo botão
        const btnAutorizacao = document.createElement('button');
        btnAutorizacao.id = 'btnAutorizacao';
        btnAutorizacao.className = 'btn btn-warning position-relative me-2';
        btnAutorizacao.setAttribute('data-bs-toggle', 'modal');
        btnAutorizacao.setAttribute('data-bs-target', '#modalAutorizacao');
        btnAutorizacao.innerHTML = `
            <i class="bi bi-shield-lock me-1"></i> Autorização
            <span id="badgePendentes" class="badge-pendentes" style="display: none;">0</span>
        `;
        
        const btnSobre = document.createElement('button');
        btnSobre.className = 'btn btn-light';
        btnSobre.setAttribute('data-bs-toggle', 'modal');
        btnSobre.setAttribute('data-bs-target', '#modalSobre');
        btnSobre.innerHTML = `<i class="bi bi-info-circle me-1"></i> Sobre o Bolão`;
        
        headerContainer.appendChild(btnAutorizacao);
        headerContainer.appendChild(btnSobre);
        
        // Adicionar modal de autorização
        let modalAutorizacao = document.getElementById('modalAutorizacao');
        if (modalAutorizacao) {
            document.body.removeChild(modalAutorizacao);
        }
        
        modalAutorizacao = document.createElement('div');
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
        
        console.log('Interface de autorização adicionada com sucesso');
    }
    
    // Função para adicionar palpite à fila de pendentes
    function adicionarPalpitePendente(nome, telefone, bilhete, dezenas) {
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
        
        console.log('Palpite adicionado à fila de pendentes:', novoPalpite);
        
        return true;
    }
    
    // Função para atualizar interface de palpites pendentes
    function atualizarInterfacePendentes() {
        const containerPendentes = document.getElementById('palpitesPendentes');
        if (!containerPendentes) {
            console.error('Container de pendentes não encontrado');
            return;
        }
        
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
        
        console.log('Interface de pendentes atualizada');
    }
    
    // Função para autorizar palpite
    function autorizarPalpite(id) {
        console.log('Tentando autorizar palpite:', id);
        
        // Encontrar palpite na fila
        const index = palpitesPendentes.findIndex(p => p.id === id);
        
        if (index === -1) {
            alert('Palpite não encontrado na fila de pendentes.');
            return false;
        }
        
        // Obter palpite
        const palpite = palpitesPendentes[index];
        console.log('Palpite encontrado:', palpite);
        
        // Adicionar ao sistema como participante
        if (typeof window.adicionarParticipante === 'function') {
            window.adicionarParticipante(palpite.nome, palpite.telefone, palpite.bilhete, palpite.dezenas);
            console.log('Palpite adicionado como participante');
        } else {
            console.error('Função adicionarParticipante não encontrada');
            alert('Erro ao adicionar participante. A função não está disponível.');
            return false;
        }
        
        // Remover da fila de pendentes
        palpitesPendentes.splice(index, 1);
        
        // Salvar em localStorage
        salvarPalpitesPendentes();
        
        // Atualizar interface de pendentes
        atualizarInterfacePendentes();
        
        alert('Palpite autorizado com sucesso!');
        
        return true;
    }
    
    // Função para recusar palpite
    function recusarPalpite(id) {
        console.log('Tentando recusar palpite:', id);
        
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
        
        alert('Palpite recusado com sucesso!');
        
        return true;
    }
    
    // API pública
    return {
        inicializar: inicializar,
        adicionarPalpitePendente: adicionarPalpitePendente,
        autorizarPalpite: autorizarPalpite,
        recusarPalpite: recusarPalpite,
        atualizarInterfacePendentes: atualizarInterfacePendentes
    };
})();

// Inicializar o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que o script principal já foi carregado
    setTimeout(function() {
        SistemaAutorizacao.inicializar();
    }, 500); // Pequeno delay para garantir que outros scripts já foram carregados
});
