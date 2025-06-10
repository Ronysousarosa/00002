// Integração com WhatsApp para envio de palpites
// Este script implementa o envio automático de palpites para o WhatsApp do administrador

// Número do WhatsApp do administrador
const ADMIN_WHATSAPP = "+5564981696782";

// Função para enviar palpite para WhatsApp
function enviarPalpiteParaWhatsApp(palpite) {
    // Formatar mensagem com os dados do palpite
    const dezenas = palpite.dezenas.map(d => d < 10 ? `0${d}` : `${d}`).join(', ');
    
    const mensagem = encodeURIComponent(
        `🎲 *NOVO PALPITE - BOLÃO LOTOFÁCIL* 🎲\n\n` +
        `👤 *Nome:* ${palpite.nome}\n` +
        `📱 *Telefone:* ${palpite.telefone}\n` +
        `🎫 *Bilhete:* ${palpite.bilhete}\n` +
        `🔢 *Dezenas escolhidas:* ${dezenas}\n\n` +
        `⏰ *Data/Hora:* ${palpite.dataSubmissao}`
    );
    
    // Criar URL para WhatsApp Web
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${mensagem}`;
    
    // Abrir WhatsApp Web em nova janela
    window.open(whatsappUrl, '_blank');
    
    return true;
}

// Função para configurar formulário com envio para WhatsApp
function configurarFormularioWhatsApp() {
    const form = document.getElementById('formNovoParticipante');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // NÃO clonar o formulário para evitar perder os event listeners das dezenas
    // Apenas adicionar o novo event listener ao formulário existente
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nomeParticipante').value;
        const telefone = document.getElementById('telefoneParticipante').value || '-';
        const bilhete = document.getElementById('bilheteParticipante').value || '-';
        
        // Obter dezenas selecionadas
        const dezenas = [];
        document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
            // Garantir que estamos pegando o número correto (sem zeros à esquerda)
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
        
        // Criar objeto do palpite
        const novoPalpite = {
            id: Date.now(),
            nome: nome,
            telefone: telefone,
            bilhete: bilhete,
            dezenas: dezenas,
            dataSubmissao: new Date().toLocaleString()
        };
        
        // Enviar para WhatsApp
        if (enviarPalpiteParaWhatsApp(novoPalpite)) {
            // Adicionar participante diretamente ao sistema
            adicionarParticipante(nome, telefone, bilhete, dezenas);
            
            // Limpar formulário
            form.reset();
            document.querySelectorAll('#selecaoDezenas .numero-bolinha.selecionado').forEach(function(el) {
                el.classList.remove('selecionado');
            });
            document.getElementById('contadorDezenas').textContent = '0/10 dezenas selecionadas';
            
            alert('Palpite enviado com sucesso para o WhatsApp do administrador e adicionado ao bolão!');
        } else {
            alert('Erro ao enviar palpite para o WhatsApp. Por favor, tente novamente.');
        }
    });
    
    console.log('Formulário configurado com envio para WhatsApp');
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar a criação das dezenas antes de configurar o formulário
    setTimeout(function() {
        configurarFormularioWhatsApp();
        
        // Adicionar informação sobre WhatsApp na interface
        const cardHeader = document.querySelector('.card-header');
        if (cardHeader && cardHeader.textContent.includes('Adicionar Participante')) {
            const infoWhatsApp = document.createElement('div');
            infoWhatsApp.className = 'alert alert-info mt-2 mb-0';
            infoWhatsApp.innerHTML = '<i class="bi bi-whatsapp"></i> Os palpites serão enviados automaticamente para o WhatsApp do administrador.';
            cardHeader.appendChild(infoWhatsApp);
        }
    }, 1000); // Aumentar o tempo de espera para garantir que as dezenas foram criadas
});
