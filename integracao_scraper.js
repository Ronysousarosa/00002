// Integração com o scraper de resultados da Lotofácil
// Este script integra o scraper Python com o sistema de bolão

// Variáveis globais
let valorPorPalpite = 5; // Valor em reais de cada palpite
let valorTotalBolao = 0; // Valor total do bolão

// Função para carregar os resultados da Lotofácil
async function carregarResultadosLotofacil() {
    try {
        const statusElement = document.getElementById('statusAtualizacao');
        if (statusElement) {
            statusElement.textContent = 'Atualizando resultados...';
            statusElement.className = 'status-atualizacao atualizando';
        }

        // Tentar carregar o arquivo de resultados
        const response = await fetch('lotofacil_dados.json?nocache=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar resultados: ${response.status}`);
        }
        
        const dados = await response.json();
        
        // Verificar se os dados são válidos
        if (!dados || !dados.concurso || !dados.data || !dados.dezenas || dados.dezenas.length !== 15) {
            throw new Error('Dados incompletos ou inválidos');
        }
        
        // Atualizar o resultado no sistema
        resultado = {
            concurso: dados.concurso,
            data: dados.data,
            dezenas: dados.dezenas
        };
        
        // Atualizar a interface
        document.getElementById('numeroConcurso').textContent = resultado.concurso;
        document.getElementById('dataConcurso').textContent = resultado.data;
        document.getElementById('totalDezenas').textContent = resultado.dezenas.length;
        
        // Atualizar visualização das dezenas
        atualizarResultado();
        
        // Recalcular pontuações
        atualizarInterface();
        
        if (statusElement) {
            statusElement.textContent = 'Resultados atualizados com sucesso!';
            statusElement.className = 'status-atualizacao sucesso';
            
            // Limpar mensagem após alguns segundos
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status-atualizacao';
            }, 5000);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        
        const statusElement = document.getElementById('statusAtualizacao');
        if (statusElement) {
            statusElement.textContent = 'Falha ao atualizar resultados. Usando dados locais.';
            statusElement.className = 'status-atualizacao erro';
            
            // Limpar mensagem após alguns segundos
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status-atualizacao';
            }, 5000);
        }
        
        return false;
    }
}

// Função para executar o scraper via API
async function executarScraper() {
    try {
        const statusElement = document.getElementById('statusAtualizacao');
        if (statusElement) {
            statusElement.textContent = 'Buscando resultados mais recentes...';
            statusElement.className = 'status-atualizacao atualizando';
        }
        
        // Chamar a API para executar o scraper
        const response = await fetch('/api/atualizar-resultados', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao executar scraper: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        if (resultado.success) {
            // Recarregar os resultados
            await carregarResultadosLotofacil();
            
            if (statusElement) {
                statusElement.textContent = 'Resultados atualizados com sucesso!';
                statusElement.className = 'status-atualizacao sucesso';
                
                // Limpar mensagem após alguns segundos
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.className = 'status-atualizacao';
                }, 5000);
            }
            
            return true;
        } else {
            throw new Error(resultado.message || 'Falha ao atualizar resultados');
        }
    } catch (error) {
        console.error('Erro ao executar scraper:', error);
        
        const statusElement = document.getElementById('statusAtualizacao');
        if (statusElement) {
            statusElement.textContent = 'Falha ao buscar resultados. Tente novamente mais tarde.';
            statusElement.className = 'status-atualizacao erro';
            
            // Limpar mensagem após alguns segundos
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status-atualizacao';
            }, 5000);
        }
        
        return false;
    }
}

// Função para limpar todos os dados
async function limparDados() {
    try {
        if (!confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            return false;
        }
        
        // Chamar a API para limpar dados
        const response = await fetch('/api/limpar-dados', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao limpar dados: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        if (resultado.success) {
            // Limpar dados locais
            participantes = [];
            resultado = {
                concurso: 0,
                data: "",
                dezenas: []
            };
            
            // Atualizar interface
            atualizarInterface();
            
            // Atualizar valor do bolão
            atualizarValorBolao();
            
            alert('Dados limpos com sucesso!');
            return true;
        } else {
            throw new Error(resultado.message || 'Falha ao limpar dados');
        }
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('Erro ao limpar dados: ' + error.message);
        return false;
    }
}

// Função para atualizar resultados manualmente
function atualizarResultadosManualmente(concurso, data, dezenas) {
    // Validar dados
    if (!concurso || !data || !dezenas || dezenas.length !== 15) {
        alert('Dados incompletos ou inválidos. Verifique se informou todas as 15 dezenas.');
        return false;
    }
    
    // Atualizar o resultado no sistema
    resultado = {
        concurso: concurso,
        data: data,
        dezenas: dezenas
    };
    
    // Salvar em localStorage
    salvarDados();
    
    // Atualizar a interface
    atualizarInterface();
    
    return true;
}

// Função para adicionar participante sem necessidade de autorização
function adicionarParticipanteSemAutorizacao(nome, telefone, bilhete, dezenas) {
    // Validar dados
    if (!nome || !dezenas || dezenas.length !== 10) {
        alert('Dados incompletos ou inválidos. Verifique se selecionou exatamente 10 dezenas.');
        return false;
    }
    
    // Criar novo participante
    const novoParticipante = {
        id: participantes.length + 1,
        nome: nome,
        telefone: telefone || '-',
        bilhete: bilhete || '-',
        dezenas: dezenas,
        pontos: calcularPontos(dezenas)
    };
    
    // Adicionar ao array de participantes
    participantes.push(novoParticipante);
    
    // Salvar em localStorage
    salvarDados();
    
    // Atualizar interface
    atualizarInterface();
    
    // Atualizar valor do bolão
    atualizarValorBolao();
    
    return true;
}

// Função para calcular e atualizar o valor total do bolão
function atualizarValorBolao() {
    // Calcular valor total baseado no número de participantes
    valorTotalBolao = participantes.length * valorPorPalpite;
    
    // Atualizar o elemento na interface
    const valorBolaoElement = document.getElementById('valorTotalBolao');
    if (valorBolaoElement) {
        valorBolaoElement.textContent = `R$ ${valorTotalBolao.toFixed(2)}`;
    }
    
    return valorTotalBolao;
}

// Adicionar botão de atualização automática e placar do bolão
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar CSS para mensagens de status e placar
    const style = document.createElement('style');
    style.textContent = `
        .status-atualizacao {
            margin-top: 10px;
            padding: 8px;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
        }
        
        .status-atualizacao.atualizando {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-atualizacao.sucesso {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-atualizacao.erro {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .btn-atualizar-auto {
            background-color: #17a2b8;
            border-color: #17a2b8;
        }
        
        .btn-atualizar-auto:hover {
            background-color: #138496;
            border-color: #117a8b;
        }
        
        .placar-bolao {
            background-color: #28a745;
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .placar-bolao h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .placar-bolao p {
            margin: 5px 0 0;
            font-size: 24px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar placar do bolão no topo da página
    const header = document.querySelector('.header .container');
    if (header) {
        const placarBolao = document.createElement('div');
        placarBolao.className = 'placar-bolao mt-3';
        placarBolao.innerHTML = `
            <h3>Valor Total do Bolão</h3>
            <p id="valorTotalBolao">R$ 0.00</p>
        `;
        header.appendChild(placarBolao);
    }
    
    // Adicionar botão de atualização automática
    const cardResultado = document.querySelector('.card-header:has(i.bi-check-circle)').parentNode;
    if (cardResultado) {
        const btnContainer = cardResultado.querySelector('.card-body');
        
        // Adicionar status de atualização
        const statusElement = document.createElement('div');
        statusElement.id = 'statusAtualizacao';
        statusElement.className = 'status-atualizacao';
        btnContainer.appendChild(statusElement);
        
        // Adicionar botão de atualização automática
        const btnAtualizarAuto = document.createElement('button');
        btnAtualizarAuto.className = 'btn btn-info w-100 mt-2 btn-atualizar-auto';
        btnAtualizarAuto.innerHTML = '<i class="bi bi-cloud-download me-1"></i> Buscar Resultado Oficial';
        btnAtualizarAuto.addEventListener('click', executarScraper);
        btnContainer.appendChild(btnAtualizarAuto);
    }
    
    // Modificar o botão de limpar dados para usar a nova função
    const btnLimpar = document.getElementById('btnLimpar');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparDados);
    }
    
    // Modificar o formulário de adição de participante para usar a nova função
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
            
            // Adicionar participante sem autorização
            if (adicionarParticipanteSemAutorizacao(nome, telefone, bilhete, dezenasSelecionadas)) {
                // Limpar formulário
                formNovoParticipante.reset();
                document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
                    el.classList.remove('selecionado');
                });
                document.getElementById('contadorDezenas').textContent = '0/10 dezenas selecionadas';
                
                // Mostrar mensagem de sucesso
                alert('Participante adicionado com sucesso!');
            }
        });
    }
    
    // Tentar carregar resultados automaticamente
    carregarResultadosLotofacil();
    
    // Inicializar valor do bolão
    atualizarValorBolao();
});
