# Bolão da Lotofácil - Pacote para Hospedagem

Este pacote contém todos os arquivos necessários para hospedar o sistema de Bolão da Lotofácil em seu próprio servidor.

## Conteúdo do Pacote

- `index.html`: O arquivo principal da aplicação web.
- `script.js`: O script JavaScript que contém a lógica principal do bolão.
- `autenticacao.js`: O script JavaScript responsável pela autenticação e proteção por senha das funções administrativas.
- `whatsapp_integration.js`: O script JavaScript que gerencia o envio de palpites para o WhatsApp do administrador.
- `lotofacil_scraper.py`: Um script Python para obter os resultados da Lotofácil do site oficial da Caixa Econômica Federal.
- `lotofacil_dados_exemplo.json`: Um arquivo JSON de exemplo com a estrutura dos dados de resultado da Lotofácil.

## Como Hospedar

O sistema do Bolão da Lotofácil é uma aplicação web estática, o que significa que não requer um servidor de aplicação complexo (como Node.js, PHP, Python com Flask/Django, etc.) para funcionar. Você pode hospedá-lo em qualquer servidor web que sirva arquivos estáticos (como Apache, Nginx, GitHub Pages, Netlify, Vercel, Firebase Hosting, etc.).

### Opção 1: Hospedagem Simples (Servidor Web Estático)

1.  **Faça o upload dos arquivos:** Copie todos os arquivos deste pacote (`index.html`, `script.js`, `autenticacao.js`, `whatsapp_integration.js`) para o diretório raiz do seu servidor web (geralmente `public_html`, `www`, `htdocs` ou `dist`).
2.  **Acesse pelo navegador:** Uma vez que os arquivos estejam no servidor, você poderá acessar o bolão digitando o endereço do seu domínio no navegador (ex: `http://seusite.com/index.html` ou `http://seusite.com/` se `index.html` for o arquivo padrão).

### Opção 2: Hospedagem com Servidor Python (para atualização automática de resultados)

Se você deseja utilizar a funcionalidade de atualização automática dos resultados da Lotofácil (via `lotofacil_scraper.py`), você precisará de um ambiente que suporte a execução de scripts Python e a instalação de bibliotecas.

1.  **Pré-requisitos no Servidor:**
    -   Python 3.x instalado.
    -   `pip` (gerenciador de pacotes do Python).
    -   `playwright` (para scraping dinâmico).
    -   `requests`, `beautifulsoup4` (para scraping).

2.  **Instalação das Dependências (no seu servidor via terminal):**

    ```bash
    pip install requests beautifulsoup4 playwright
    playwright install
    ```

3.  **Configuração do Scraper:**
    -   O script `lotofacil_scraper.py` é projetado para ser executado em um ambiente Python.
    -   Ele gera um arquivo `lotofacil_dados.json` com os resultados mais recentes.
    -   Para que o sistema web utilize esses dados, você precisará configurar uma forma de executar este script periodicamente no seu servidor (por exemplo, usando `cron` jobs em Linux) e garantir que o `index.html` possa acessar o `lotofacil_dados.json` gerado.

    **Exemplo de Cron Job (Linux):**

    Para executar o scraper a cada 6 horas:

    ```bash
    0 */6 * * * python3 /caminho/para/seu/bolao_lotofacil_pacote/lotofacil_scraper.py
    ```

    **Importante:** O `index.html` tenta buscar o `lotofacil_dados.json` via requisição HTTP. Certifique-se de que o arquivo `lotofacil_dados.json` gerado pelo scraper esteja acessível publicamente no mesmo diretório do `index.html` ou em um caminho configurado.

## Configurações Iniciais

-   **Senha do Administrador:** A senha padrão inicial para as funções administrativas (configurações, exclusão de participantes, limpeza de dados) é `123456`. **É altamente recomendável que você altere esta senha imediatamente após a primeira utilização** através do botão "Configurações" no sistema.
-   **Número do WhatsApp:** O número do WhatsApp para onde os palpites serão enviados está configurado no arquivo `whatsapp_integration.js`. Abra este arquivo em um editor de texto e altere a linha `const ADMIN_WHATSAPP = "+5564981696782";` para o seu número de WhatsApp.

## Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.

---

**Observação:** Este sistema utiliza tecnologias web modernas (HTML, CSS, JavaScript) e não requer um banco de dados tradicional, pois todos os dados são armazenados localmente no navegador do usuário (via `localStorage`). Isso simplifica a hospedagem, mas significa que os dados não são compartilhados entre diferentes navegadores ou dispositivos, a menos que você implemente uma solução de sincronização externa.


