// Dados do bolão
let participantes = [];
let resultado = {
    concurso: 2500,
    data: "09/06/2025",
    dezenas: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 2, 4]
};

// Valor por palpite (agora configurável)
let VALOR_PALPITE = 5; // R$ 5,00 por palpite por padrão

// Função para inicializar a interface
function inicializarInterface() {
    // Criar dezenas para seleção
    criarSelecaoDezenas();
    
    // Criar dezenas para resultado
    criarSelecaoResultado();
    
    // Carregar dados salvos
    carregarDados();
    
    // Atualizar interface
    atualizarInterface();
    
    // Configurar eventos
    configurarEventos();
    
    // Mostrar valor atual do palpite no campo de configuração
    document.getElementById('valorPalpite').value = VALOR_PALPITE;
}

// Função para criar dezenas para seleção
function criarSelecaoDezenas() {
    const selecaoDezenas = document.getElementById('selecaoDezenas');
    if (!selecaoDezenas) return;
    
    selecaoDezenas.innerHTML = '';
    
    for (let i = 1; i <= 25; i++) {
        const numero = document.createElement('div');
        numero.className = 'numero-bolinha';
        numero.textContent = i < 10 ? '0' + i : i;
        numero.addEventListener('click', function() {
            toggleSelecaoDezena(this);
        });
        selecaoDezenas.appendChild(numero);
    }
}

// Função para criar dezenas para resultado
function criarSelecaoResultado() {
    const selecaoResultado = document.getElementById('selecaoResultado');
    if (!selecaoResultado) return;
    
    selecaoResultado.innerHTML = '';
    
    for (let i = 1; i <= 25; i++) {
        const numero = document.createElement('div');
        numero.className = 'numero-bolinha';
        numero.textContent = i < 10 ? '0' + i : i;
        numero.addEventListener('click', function() {
            toggleSelecaoResultadoDezena(this);
        });
        selecaoResultado.appendChild(numero);
    }
}

// Função para alternar seleção de dezena
function toggleSelecaoDezena(elemento) {
    const selecionados = document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado');
    
    if (elemento.classList.contains('selecionado')) {
        elemento.classList.remove('selecionado');
    } else {
        if (selecionados.length < 10) {
            elemento.classList.add('selecionado');
        } else {
            alert('Você já selecionou 10 dezenas. Remova alguma para selecionar outra.');
        }
    }
    
    // Atualizar contador
    const contador = document.getElementById('contadorDezenas');
    if (contador) {
        const novosSelecionados = document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado');
        contador.textContent = `${novosSelecionados.length}/10 dezenas selecionadas`;
    }
}

// Função para alternar seleção de dezena no resultado
function toggleSelecaoResultadoDezena(elemento) {
    const selecionados = document.querySelectorAll('#selecaoResultado .numero-bolinha.selecionado');
    
    if (elemento.classList.contains('selecionado')) {
        elemento.classList.remove('selecionado');
    } else {
        if (selecionados.length < 15) {
            elemento.classList.add('selecionado');
        } else {
            alert('Você já selecionou 15 dezenas. Remova alguma para selecionar outra.');
        }
    }
    
    // Atualizar contador
    const contador = document.getElementById('contadorResultado');
    if (contador) {
        const novosSelecionados = document.querySelectorAll('#selecaoResultado .numero-bolinha.selecionado');
        contador.textContent = `${novosSelecionados.length}/15 dezenas selecionadas`;
    }
}

// Função para configurar eventos
function configurarEventos() {
    // Formulário de resultado
    const formResultado = document.getElementById('formResultado');
    if (formResultado) {
        formResultado.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const concurso = document.getElementById('inputConcurso').value;
            const data = document.getElementById('inputDataConcurso').value;
            
            // Obter dezenas selecionadas
            const dezenasSelecionadas = [];
            document.querySelectorAll('#selecaoResultado .numero-bolinha.selecionado').forEach(function(el) {
                dezenasSelecionadas.push(parseInt(el.textContent));
            });
            
            if (dezenasSelecionadas.length !== 15) {
                alert('Você deve selecionar exatamente 15 dezenas.');
                return;
            }
            
            // Atualizar resultado
            atualizarResultado(concurso, formatarData(data), dezenasSelecionadas);
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalResultado'));
            if (modal) modal.hide();
        });
    }
    
    // Botão de filtrar
    const btnFiltrar = document.getElementById('btnFiltrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('modalFiltrar'));
            modal.show();
        });
    }
    
    // Botão de aplicar filtro
    const btnAplicarFiltro = document.getElementById('btnAplicarFiltro');
    if (btnAplicarFiltro) {
        btnAplicarFiltro.addEventListener('click', function() {
            const nome = document.getElementById('filtroNome').value;
            const pontuacaoMin = document.getElementById('filtroPontuacaoMin').value;
            const pontuacaoMax = document.getElementById('filtroPontuacaoMax').value;
            const bilhete = document.getElementById('filtroBilhete').value;
            
            filtrarParticipantes(nome, pontuacaoMin, pontuacaoMax, bilhete);
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalFiltrar'));
            if (modal) modal.hide();
        });
    }
    
    // Botão de atualizar
    const btnAtualizar = document.getElementById('btnAtualizar');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            atualizarInterface();
        });
    }
    
    // Botão de exportar
    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            exportarDados();
        });
    }
    
    // Botão de importar
    const btnImportar = document.getElementById('btnImportar');
    if (btnImportar) {
        btnImportar.addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('modalImportar'));
            modal.show();
        });
    }
    
    // Botão de confirmar importação
    const btnConfirmarImportar = document.getElementById('btnConfirmarImportar');
    if (btnConfirmarImportar) {
        btnConfirmarImportar.addEventListener('click', function() {
            const dados = document.getElementById('inputImportar').value;
            importarDados(dados);
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalImportar'));
            if (modal) modal.hide();
        });
    }
    
    // Botão de relatório
    const btnRelatorio = document.getElementById('btnRelatorio');
    if (btnRelatorio) {
        btnRelatorio.addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('modalRelatorio'));
            modal.show();
        });
    }
    
    // Botão de gerar relatório
    const btnGerarRelatorio = document.getElementById('btnGerarRelatorio');
    if (btnGerarRelatorio) {
        btnGerarRelatorio.addEventListener('click', function() {
            const tipo = document.querySelector('input[name="tipoRelatorio"]:checked').value;
            const formato = document.querySelector('input[name="formatoRelatorio"]:checked').value;
            const titulo = document.getElementById('tituloRelatorio').value;
            
            gerarRelatorio(tipo, formato, titulo);
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalRelatorio'));
            if (modal) modal.hide();
        });
    }
    
    // Botão de limpar
    const btnLimpar = document.getElementById('btnLimpar');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                limparDados();
            }
        });
    }
    
    // Botão de salvar configurações
    const btnSalvarConfiguracoes = document.getElementById('btnSalvarConfiguracoes');
    if (btnSalvarConfiguracoes) {
        btnSalvarConfiguracoes.addEventListener('click', function() {
            const novoValor = parseFloat(document.getElementById('valorPalpite').value);
            
            if (isNaN(novoValor) || novoValor <= 0) {
                alert('Por favor, informe um valor válido para o palpite.');
                return;
            }
            
            // Atualizar valor do palpite
            VALOR_PALPITE = novoValor;
            
            // Salvar em localStorage
            salvarDados();
            
            // Atualizar valor do bolão
            atualizarValorBolao();
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfiguracoes'));
            if (modal) modal.hide();
            
            alert(`Valor do palpite atualizado para R$ ${VALOR_PALPITE.toFixed(2)}`);
        });
    }
}

// Função para adicionar participante
function adicionarParticipante(nome, telefone, bilhete, dezenas) {
    // Validar dados
    if (!nome || !dezenas || dezenas.length !== 10) {
        alert('Dados incompletos ou inválidos.');
        return;
    }
    
    // Criar novo participante
    const novoParticipante = {
        id: Date.now(),
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
}

// Função para excluir participante
// Esta função agora é chamada apenas através da função protegerExclusaoParticipante
// que verifica a senha do administrador antes
function excluirParticipante(id) {
    // Encontrar índice do participante
    const index = participantes.findIndex(p => p.id === id);
    
    if (index === -1) {
        alert('Participante não encontrado.');
        return;
    }
    
    // Remover participante
    participantes.splice(index, 1);
    
    // Salvar em localStorage
    salvarDados();
    
    // Atualizar interface
    atualizarInterface();
    
    // Atualizar valor do bolão
    atualizarValorBolao();
    
    alert('Participante excluído com sucesso!');
}

// Função para calcular pontos
function calcularPontos(dezenas) {
    if (!resultado.dezenas || resultado.dezenas.length === 0) return 0;
    
    let pontos = 0;
    for (const dezena of dezenas) {
        if (resultado.dezenas.includes(dezena)) {
            pontos++;
        }
    }
    
    return pontos;
}

// Função para atualizar resultado
function atualizarResultado(concurso, data, dezenas) {
    // Validar dados
    if (!concurso || !data || !dezenas || dezenas.length !== 15) {
        alert('Dados incompletos ou inválidos.');
        return;
    }
    
    // Atualizar resultado
    resultado = {
        concurso: concurso,
        data: data,
        dezenas: dezenas
    };
    
    // Recalcular pontos de todos os participantes
    for (const participante of participantes) {
        participante.pontos = calcularPontos(participante.dezenas);
    }
    
    // Salvar em localStorage
    salvarDados();
    
    // Atualizar interface
    atualizarInterface();
}

// Função para filtrar participantes
function filtrarParticipantes(nome, pontuacaoMin, pontuacaoMax, bilhete) {
    // Obter todos os participantes
    const rows = document.querySelectorAll('#rankingBody tr');
    
    // Aplicar filtros
    for (const row of rows) {
        let mostrar = true;
        
        // Filtrar por nome
        if (nome) {
            const nomeParticipante = row.querySelector('td:nth-child(2)').textContent;
            if (!nomeParticipante.toLowerCase().includes(nome.toLowerCase())) {
                mostrar = false;
            }
        }
        
        // Filtrar por pontuação mínima
        if (pontuacaoMin) {
            const pontos = parseInt(row.querySelector('td:nth-child(6)').textContent);
            if (pontos < parseInt(pontuacaoMin)) {
                mostrar = false;
            }
        }
        
        // Filtrar por pontuação máxima
        if (pontuacaoMax) {
            const pontos = parseInt(row.querySelector('td:nth-child(6)').textContent);
            if (pontos > parseInt(pontuacaoMax)) {
                mostrar = false;
            }
        }
        
        // Filtrar por bilhete
        if (bilhete) {
            const bilheteParticipante = row.querySelector('td:nth-child(4)').textContent;
            if (bilheteParticipante !== bilhete) {
                mostrar = false;
            }
        }
        
        // Mostrar ou esconder linha
        row.style.display = mostrar ? '' : 'none';
    }
}

// Função para exportar dados
function exportarDados() {
    const dados = {
        participantes: participantes,
        resultado: resultado,
        valorPalpite: VALOR_PALPITE
    };
    
    const dadosJSON = JSON.stringify(dados);
    
    // Criar elemento para download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dadosJSON));
    element.setAttribute('download', 'bolao_lotofacil_' + new Date().toISOString().split('T')[0] + '.json');
    
    element.style.display = 'none';
    document.body.appendChild(element);
    
    element.click();
    
    document.body.removeChild(element);
}

// Função para importar dados
function importarDados(dadosJSON) {
    try {
        const dados = JSON.parse(dadosJSON);
        
        if (!dados.participantes || !dados.resultado) {
            throw new Error('Formato de dados inválido.');
        }
        
        participantes = dados.participantes;
        resultado = dados.resultado;
        
        // Importar valor do palpite se disponível
        if (dados.valorPalpite) {
            VALOR_PALPITE = dados.valorPalpite;
        }
        
        // Salvar em localStorage
        salvarDados();
        
        // Atualizar interface
        atualizarInterface();
        
        // Atualizar valor do bolão
        atualizarValorBolao();
        
        alert('Dados importados com sucesso!');
    } catch (error) {
        alert('Erro ao importar dados: ' + error.message);
    }
}

// Função para gerar relatório
function gerarRelatorio(tipo, formato, titulo) {
    alert('Funcionalidade de relatório em desenvolvimento.');
}

// Função para limpar dados
function limparDados() {
    participantes = [];
    resultado = {
        concurso: 0,
        data: "",
        dezenas: []
    };
    
    // Salvar em localStorage
    salvarDados();
    
    // Atualizar interface
    atualizarInterface();
    
    // Atualizar valor do bolão
    atualizarValorBolao();
    
    alert('Dados limpos com sucesso!');
}

// Função para salvar dados em localStorage
function salvarDados() {
    const dados = {
        participantes: participantes,
        resultado: resultado,
        valorPalpite: VALOR_PALPITE
    };
    
    localStorage.setItem('bolaoLotofacil', JSON.stringify(dados));
}

// Função para carregar dados de localStorage
function carregarDados() {
    const dados = localStorage.getItem('bolaoLotofacil');
    
    if (dados) {
        const dadosObj = JSON.parse(dados);
        
        if (dadosObj.participantes) {
            participantes = dadosObj.participantes;
        }
        
        if (dadosObj.resultado) {
            resultado = dadosObj.resultado;
        }
        
        if (dadosObj.valorPalpite) {
            VALOR_PALPITE = dadosObj.valorPalpite;
        }
    }
}

// Função para atualizar interface
function atualizarInterface() {
    // Atualizar ranking
    atualizarRanking();
    
    // Atualizar jogos
    atualizarJogos();
    
    // Atualizar resultado
    atualizarVisualizacaoResultado();
    
    // Atualizar estatísticas
    atualizarEstatisticas();
    
    // Atualizar valor do bolão
    atualizarValorBolao();
}

// Função para atualizar ranking
function atualizarRanking() {
    const rankingBody = document.getElementById('rankingBody');
    if (!rankingBody) return;
    
    // Limpar ranking
    rankingBody.innerHTML = '';
    
    // Ordenar participantes por pontuação (decrescente)
    const participantesOrdenados = [...participantes].sort((a, b) => b.pontos - a.pontos);
    
    // Adicionar participantes ao ranking
    for (let i = 0; i < participantesOrdenados.length; i++) {
        const participante = participantesOrdenados[i];
        
        const row = document.createElement('tr');
        
        // Adicionar classe para destacar os três primeiros
        if (i === 0) row.classList.add('ranking-item', 'primeiro');
        else if (i === 1) row.classList.add('ranking-item', 'segundo');
        else if (i === 2) row.classList.add('ranking-item', 'terceiro');
        else row.classList.add('ranking-item');
        
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${participante.nome}</td>
            <td>${participante.telefone}</td>
            <td class="text-center"><span class="badge-bilhete">${participante.bilhete}</span></td>
            <td>
                ${participante.dezenas.map(d => {
                    const dezenaStr = d < 10 ? '0' + d : d;
                    const acertou = resultado.dezenas && resultado.dezenas.includes(d);
                    return `<span class="numero-pequeno ${acertou ? 'acertado' : ''}">${dezenaStr}</span>`;
                }).join('')}
            </td>
            <td class="text-center"><span class="badge-pontos">${participante.pontos}</span></td>
            <td class="text-center">
                <button class="btn btn-sm btn-danger btn-excluir" onclick="protegerExclusaoParticipante(${participante.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        rankingBody.appendChild(row);
    }
    
    // Atualizar estatísticas do ranking
    document.getElementById('totalParticipantes').textContent = participantes.length;
    
    const pontuacoes = participantes.map(p => p.pontos);
    const maiorPontuacao = pontuacoes.length > 0 ? Math.max(...pontuacoes) : 0;
    document.getElementById('maiorPontuacao').textContent = maiorPontuacao;
    
    const ganhadores = participantes.filter(p => p.pontos === maiorPontuacao).length;
    document.getElementById('totalGanhadores').textContent = ganhadores;
}

// Função para atualizar jogos
function atualizarJogos() {
    const jogosBody = document.getElementById('jogosBody');
    if (!jogosBody) return;
    
    // Limpar jogos
    jogosBody.innerHTML = '';
    
    // Adicionar participantes à tabela de jogos
    for (let i = 0; i < participantes.length; i++) {
        const participante = participantes[i];
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${participante.nome}</td>
            <td>${participante.bilhete}</td>
            <td>
                ${participante.dezenas.map(d => {
                    const dezenaStr = d < 10 ? '0' + d : d;
                    const acertou = resultado.dezenas && resultado.dezenas.includes(d);
                    return `<span class="numero-pequeno ${acertou ? 'acertado' : ''}">${dezenaStr}</span>`;
                }).join('')}
            </td>
            <td class="text-center"><span class="badge-pontos">${participante.pontos}</span></td>
        `;
        
        jogosBody.appendChild(row);
    }
}

// Função para atualizar visualização do resultado
function atualizarVisualizacaoResultado() {
    const resultadoDezenas = document.getElementById('resultadoDezenas');
    if (!resultadoDezenas) return;
    
    // Limpar resultado
    resultadoDezenas.innerHTML = '';
    
    // Verificar se há resultado
    if (!resultado.dezenas || resultado.dezenas.length === 0) {
        resultadoDezenas.innerHTML = '<p class="text-muted">Nenhum resultado cadastrado.</p>';
        return;
    }
    
    // Atualizar informações do concurso
    document.getElementById('numeroConcurso').textContent = resultado.concurso;
    document.getElementById('dataConcurso').textContent = resultado.data;
    document.getElementById('totalDezenas').textContent = resultado.dezenas.length;
    
    // Adicionar dezenas ao resultado
    for (const dezena of resultado.dezenas) {
        const dezenaStr = dezena < 10 ? '0' + dezena : dezena;
        const span = document.createElement('span');
        span.className = 'numero-bolinha';
        span.textContent = dezenaStr;
        resultadoDezenas.appendChild(span);
    }
}

// Função para atualizar estatísticas
function atualizarEstatisticas() {
    // Implementação básica de estatísticas
    // Esta função pode ser expandida com gráficos e mais análises
    
    // Frequência das dezenas
    const frequencia = {};
    for (let i = 1; i <= 25; i++) {
        frequencia[i] = 0;
    }
    
    for (const participante of participantes) {
        for (const dezena of participante.dezenas) {
            frequencia[dezena]++;
        }
    }
    
    // Encontrar dezena mais e menos frequente
    let maisFrequente = 0;
    let menosFrequente = 0;
    let maxFreq = 0;
    let minFreq = Infinity;
    
    for (const [dezena, freq] of Object.entries(frequencia)) {
        if (freq > maxFreq) {
            maxFreq = freq;
            maisFrequente = dezena;
        }
        
        if (freq < minFreq && freq > 0) {
            minFreq = freq;
            menosFrequente = dezena;
        }
    }
    
    // Atualizar estatísticas na interface
    document.getElementById('numeroMaisFrequente').textContent = maisFrequente < 10 ? '0' + maisFrequente : maisFrequente;
    document.getElementById('numeroMenosFrequente').textContent = menosFrequente < 10 ? '0' + menosFrequente : menosFrequente;
    
    // Calcular média de acertos
    const totalAcertos = participantes.reduce((sum, p) => sum + p.pontos, 0);
    const mediaAcertos = participantes.length > 0 ? (totalAcertos / participantes.length).toFixed(1) : '0.0';
    document.getElementById('mediaAcertos').textContent = mediaAcertos;
    
    // Dezenas mais e menos escolhidas
    const dezenasMaisEscolhidas = Object.entries(frequencia)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([dezena, _]) => dezena < 10 ? '0' + dezena : dezena)
        .join(', ');
    
    const dezenasMenosEscolhidas = Object.entries(frequencia)
        .filter(([_, freq]) => freq > 0)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([dezena, _]) => dezena < 10 ? '0' + dezena : dezena)
        .join(', ');
    
    document.getElementById('dezenasMaisEscolhidas').textContent = dezenasMaisEscolhidas || '--';
    document.getElementById('dezenasMenosEscolhidas').textContent = dezenasMenosEscolhidas || '--';
    
    // Estatísticas de pontuação
    const pontuacaoMedia = participantes.length > 0 ? (totalAcertos / participantes.length).toFixed(1) : '0.0';
    document.getElementById('pontuacaoMedia').textContent = pontuacaoMedia;
    
    const participantes10Mais = participantes.filter(p => p.pontos >= 10).length;
    document.getElementById('participantes10Mais').textContent = participantes10Mais;
    
    const participantes0Pontos = participantes.filter(p => p.pontos === 0).length;
    document.getElementById('participantes0Pontos').textContent = participantes0Pontos;
}

// Função para atualizar valor do bolão
function atualizarValorBolao() {
    const valorTotal = participantes.length * VALOR_PALPITE;
    document.getElementById('valorTotalBolao').textContent = `R$ ${valorTotal.toFixed(2)}`;
}

// Função para formatar data
function formatarData(data) {
    if (!data) return '';
    
    const partes = data.split('-');
    if (partes.length !== 3) return data;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    inicializarInterface();
});
