// Adicionar script de integração ao arquivo principal
document.addEventListener('DOMContentLoaded', function() {
    // Carregar o script de integração com o scraper
    const script = document.createElement('script');
    script.src = 'integracao_scraper.js';
    document.head.appendChild(script);
    
    // Modificar o HTML para incluir elementos de atualização automática
    const cardResultado = document.querySelector('.card-header:has(i.bi-check-circle)').parentNode;
    if (cardResultado) {
        const cardBody = cardResultado.querySelector('.card-body');
        
        // Adicionar status de atualização
        const statusElement = document.createElement('div');
        statusElement.id = 'statusAtualizacao';
        statusElement.className = 'status-atualizacao';
        cardBody.appendChild(statusElement);
    }
});
