

# Documentação Completa do Sistema de Bolão da Lotofácil

**Autor:** Manus AI

## 1. Introdução

Este documento serve como um guia abrangente para a implantação, configuração e manutenção do sistema de Bolão da Lotofácil. O sistema foi desenvolvido para facilitar a organização de bolões entre amigos, permitindo o gerenciamento de participantes, palpites, resultados e um ranking dinâmico. Ele incorpora funcionalidades avançadas como proteção por senha para ações administrativas e integração com WhatsApp para notificação de novos palpites.

## 2. Estrutura do Projeto

O pacote do sistema de Bolão da Lotofácil é composto por um conjunto de arquivos estáticos e um script Python para atualização de resultados. A estrutura de diretórios é simples e direta, facilitando a compreensão e a implantação.

```
bolao_lotofacil_pacote/
├── index.html
├── script.js
├── autenticacao.js
├── whatsapp_integration.js
├── lotofacil_scraper.py
└── README.md
```

### 2.1. Descrição dos Arquivos

-   **`index.html`**: Este é o arquivo principal da aplicação web. Ele contém a estrutura HTML da interface do usuário, incluindo formulários para adicionar participantes, exibir o ranking, estatísticas e modais para configurações e autenticação. É o ponto de entrada para o usuário final.

-   **`script.js`**: Este arquivo JavaScript contém a lógica central do bolão. Ele gerencia a adição e exclusão de participantes, o cálculo de pontos com base nos resultados da Lotofácil, a atualização do ranking, a importação/exportação de dados e a persistência dos dados no `localStorage` do navegador. Também é responsável pela interação com os elementos da interface do usuário.

-   **`autenticacao.js`**: Dedicado à segurança, este script JavaScript implementa o sistema de proteção por senha para as funções administrativas críticas do bolão. Ele garante que apenas usuários autorizados (com a senha correta) possam acessar as configurações, excluir participantes ou limpar todos os dados do sistema. A senha é armazenada localmente no `localStorage` e pode ser alterada pelo administrador.

-   **`whatsapp_integration.js`**: Este script JavaScript é responsável pela integração do sistema com o WhatsApp. Quando um novo palpite é adicionado, ele formata os dados do palpite e abre uma nova janela ou aba do navegador com o WhatsApp Web, preenchendo automaticamente uma mensagem com os detalhes do palpite para ser enviada ao número de WhatsApp do administrador configurado. Isso agiliza a notificação e o controle de novos palpites.

-   **`lotofacil_scraper.py`**: Um script Python que tem como objetivo obter os resultados mais recentes da Lotofácil diretamente do site oficial da Caixa Econômica Federal. Ele utiliza bibliotecas como `requests`, `BeautifulSoup` e `Playwright` para realizar o scraping de forma robusta, contornando algumas proteções anti-bot. O scraper salva os resultados obtidos em um arquivo `lotofacil_dados.json`, que pode ser lido pelo sistema web para atualização automática dos resultados do bolão.

-   **`README.md`**: Este arquivo (que você já leu) fornece um resumo rápido do projeto, instruções básicas de hospedagem e configurações iniciais. Esta documentação expande os detalhes contidos nele.

## 3. Como Hospedar o Sistema

O sistema de Bolão da Lotofácil é uma aplicação web estática. Isso significa que ele é composto por arquivos HTML, CSS e JavaScript que são interpretados diretamente pelo navegador do usuário. Ele não exige um servidor de aplicação complexo (como Node.js, PHP, Java, Ruby on Rails, Python com Flask/Django, etc.) para a sua operação básica, o que simplifica enormemente o processo de hospedagem.

Você pode hospedar este sistema em praticamente qualquer serviço ou servidor que seja capaz de servir arquivos estáticos. Abaixo estão algumas opções comuns e suas respectivas instruções.

### 3.1. Hospedagem Estática Simples

Esta é a forma mais fácil e rápida de colocar o bolão no ar, ideal para quem não precisa da funcionalidade de atualização automática de resultados via scraper Python (que será abordada na Seção 3.2).

**Serviços Recomendados:**

-   **GitHub Pages**: Gratuito, ideal para projetos pessoais e de código aberto. Basta fazer o upload dos arquivos para um repositório GitHub.
-   **Netlify / Vercel**: Plataformas de deploy contínuo que simplificam a hospedagem de sites estáticos. Conectam-se ao seu repositório Git e fazem o deploy automaticamente a cada push.
-   **Firebase Hosting**: Oferecido pelo Google, é robusto e fácil de usar para sites estáticos.
-   **Servidores Web Tradicionais (Apache, Nginx, IIS)**: Se você já possui um servidor web configurado, basta copiar os arquivos para o diretório correto.

**Passos Gerais para Hospedagem Estática:**

1.  **Obtenha os Arquivos:** Certifique-se de ter todos os arquivos do pacote `bolao_lotofacil_pacote/` (ou seja, `index.html`, `script.js`, `autenticacao.js`, `whatsapp_integration.js`) em seu computador.
2.  **Acesse seu Provedor de Hospedagem:** Faça login no painel de controle do seu serviço de hospedagem (cPanel, painel da Netlify, console do Firebase, etc.) ou acesse o servidor via FTP/SSH.
3.  **Faça o Upload dos Arquivos:**
    -   **Para serviços como GitHub Pages, Netlify, Vercel:** Crie um novo repositório Git, adicione os arquivos a ele e siga as instruções do serviço para conectar o repositório e realizar o deploy.
    -   **Para FTP/cPanel:** Conecte-se ao seu servidor via FTP ou use o gerenciador de arquivos do cPanel. Navegue até o diretório raiz do seu site (comumente `public_html`, `www`, `htdocs` ou `dist`). Faça o upload de todos os arquivos do pacote para este diretório.
    -   **Para Servidores Dedicados/VPS (Apache/Nginx):** Copie os arquivos para o diretório configurado para servir seu site (ex: `/var/www/html/` para Apache em sistemas Debian/Ubuntu, ou o diretório especificado na configuração do seu virtual host para Nginx).
4.  **Acesse o Bolão:** Uma vez que os arquivos estejam no servidor, você poderá acessar o sistema de bolão digitando o endereço do seu domínio no navegador (ex: `http://seusite.com/index.html` ou `http://seusite.com/` se o servidor estiver configurado para servir `index.html` como arquivo padrão).

### 3.2. Hospedagem com Atualização Automática de Resultados (Requer Ambiente Python)

Se você deseja que o sistema de bolão obtenha os resultados da Lotofácil automaticamente do site da Caixa Econômica Federal, você precisará de um ambiente de hospedagem que suporte a execução de scripts Python e a instalação de bibliotecas. Isso geralmente significa um Servidor Virtual Privado (VPS), um servidor dedicado, ou serviços de hospedagem que ofereçam suporte a Python e agendamento de tarefas (como cron jobs).

**Pré-requisitos no Servidor (para a funcionalidade de scraping):**

-   **Python 3.x:** Certifique-se de que o Python 3 (versão 3.6 ou superior é recomendada) esteja instalado no seu servidor. Você pode verificar a versão com `python3 --version`.
-   **`pip`:** O gerenciador de pacotes do Python (`pip`) é essencial para instalar as dependências. Verifique com `pip3 --version`.
-   **Dependências Python:** O script `lotofacil_scraper.py` depende das seguintes bibliotecas:
    -   `requests`: Para fazer requisições HTTP.
    -   `beautifulsoup4`: Para parsing de HTML.
    -   `playwright`: Uma biblioteca para automação de navegadores, usada para simular a navegação humana e contornar proteções anti-bot. O Playwright requer a instalação de navegadores adicionais (Chromium, Firefox, WebKit).

**Passos para Configuração da Atualização Automática:**

1.  **Faça o Upload de Todos os Arquivos:** Copie **todos** os arquivos do pacote `bolao_lotofacil_pacote/` (incluindo `lotofacil_scraper.py`) para o diretório do seu site no servidor.

2.  **Instale as Dependências Python (via terminal SSH no seu servidor):**

    Abra um terminal SSH e navegue até o diretório onde você fez o upload dos arquivos do bolão.

    ```bash
    # Instalar pip se ainda não estiver instalado
    sudo apt update
    sudo apt install python3-pip -y

    # Instalar as bibliotecas Python
    pip3 install requests beautifulsoup4 playwright

    # Instalar os navegadores necessários para o Playwright
    playwright install
    ```

    *Nota: `sudo apt install` é para sistemas baseados em Debian/Ubuntu. Para outras distribuições Linux (ex: CentOS/RHEL), use `yum` ou `dnf`.*



### 3.2.1. Configuração e Execução do Scraper (`lotofacil_scraper.py`)

O script `lotofacil_scraper.py` é a peça chave para a atualização automática dos resultados da Lotofácil. Ele foi projetado para ser executado em um ambiente Python e, ao ser executado, ele tenta obter os dados do último concurso da Lotofácil de três maneiras diferentes (API da Caixa, requisição direta e Playwright para simulação de navegador) para garantir a robustez. O resultado obtido é salvo em um arquivo JSON chamado `lotofacil_dados.json` no mesmo diretório do script.

Para que o sistema web (`index.html`) possa utilizar esses dados, é crucial que o arquivo `lotofacil_dados.json` gerado pelo scraper esteja acessível publicamente via HTTP no mesmo diretório onde o `index.html` está hospedado, ou em um caminho que o `script.js` possa acessar via requisição `fetch`.

**Como Executar o Scraper:**

Você pode executar o scraper manualmente para testar:

```bash
python3 /caminho/para/seu/bolao_lotofacil_pacote/lotofacil_scraper.py
```

Ao executar, o script imprimirá no console o resultado obtido e criará (ou atualizará) o arquivo `lotofacil_dados.json`.

**Agendamento da Execução (Cron Jobs no Linux):**

Para garantir que os resultados sejam atualizados periodicamente, você deve configurar um agendador de tarefas no seu servidor. Em sistemas Linux, a ferramenta mais comum para isso é o `cron`.

1.  **Abra o Crontab:**

    ```bash
    crontab -e
    ```

    Se for a primeira vez, ele pode pedir para você escolher um editor de texto (escolha `nano` ou `vim`).

2.  **Adicione a Linha do Cron Job:**

    Adicione a seguinte linha no final do arquivo que se abrir. Esta linha fará com que o script seja executado a cada 6 horas (às 00:00, 06:00, 12:00, 18:00).

    ```cron
    0 */6 * * * /usr/bin/python3 /caminho/para/seu/bolao_lotofacil_pacote/lotofacil_scraper.py >> /var/log/lotofacil_scraper.log 2>&1
    ```

    **Explicação da Linha do Cron:**
    -   `0`: Minuto (0 a 59). Aqui, 0 significa no início da hora.
    -   `*/6`: Hora (0 a 23). `*/6` significa a cada 6 horas.
    -   `*`: Dia do mês (1 a 31). `*` significa todos os dias.
    -   `*`: Mês (1 a 12). `*` significa todos os meses.
    -   `*`: Dia da semana (0 a 7, onde 0 e 7 são domingo). `*` significa todos os dias da semana.
    -   `/usr/bin/python3`: Caminho completo para o executável do Python no seu servidor. Você pode encontrar isso usando `which python3`.
    -   `/caminho/para/seu/bolao_lotofacil_pacote/lotofacil_scraper.py`: **MUITO IMPORTANTE:** Substitua `/caminho/para/seu/bolao_lotofacil_pacote/` pelo caminho absoluto real onde você fez o upload do diretório `bolao_lotofacil_pacote` no seu servidor.
    -   `>> /var/log/lotofacil_scraper.log 2>&1`: Redireciona a saída padrão e os erros para um arquivo de log, o que é útil para depuração.

3.  **Salve e Saia:**
    -   Se estiver usando `nano`: Pressione `Ctrl+X`, depois `Y` para confirmar e `Enter`.
    -   Se estiver usando `vim`: Pressione `Esc`, digite `:wq` e `Enter`.

O cron job será agendado e o scraper começará a ser executado nos horários definidos, mantendo seu `lotofacil_dados.json` atualizado.

## 4. Configurações Iniciais e Personalização

Após a hospedagem, algumas configurações são essenciais para personalizar o sistema de bolão de acordo com suas necessidades.

### 4.1. Senha do Administrador

O sistema vem com uma senha padrão inicial para as funções administrativas: `123456`. **É de extrema importância que você altere esta senha imediatamente após o primeiro acesso** para garantir a segurança do seu bolão.

**Como Alterar a Senha:**

1.  Acesse o sistema de bolão no seu navegador.
2.  Clique no botão "Configurações" (ícone de engrenagem) no cabeçalho da página.
3.  Será solicitada a senha de administrador. Digite a senha atual (`123456`) e clique em "Confirmar".
4.  Dentro do modal de configurações, clique no botão "Alterar Senha".
5.  Digite a nova senha desejada e confirme.

Esta senha protegerá as seguintes ações:
-   Acesso ao menu de configurações (para alterar o valor do palpite).
-   Exclusão de participantes.
-   Limpeza de todos os dados do bolão.

### 4.2. Configuração do WhatsApp para Notificações

Para que você receba as notificações de novos palpites diretamente no seu WhatsApp, é necessário configurar o seu número no arquivo `whatsapp_integration.js`.

1.  **Localize o Arquivo:** Abra o arquivo `whatsapp_integration.js` em um editor de texto (no seu computador ou diretamente no servidor via SSH/FTP).
2.  **Edite a Linha:** Encontre a seguinte linha no início do arquivo:

    ```javascript
    const ADMIN_WHATSAPP = "+5564981696782";
    ```

3.  **Substitua pelo Seu Número:** Altere o número `+5564981696782` pelo seu número de WhatsApp, incluindo o código do país e o DDD, sem espaços ou caracteres especiais. Por exemplo, se o seu número for (XX) 91234-5678, a linha deve ficar:

    ```javascript
    const ADMIN_WHATSAPP = "+55XX912345678";
    ```

4.  **Salve e Faça o Upload:** Salve o arquivo `whatsapp_integration.js` e faça o upload para o seu servidor, substituindo a versão antiga.

### 4.3. Valor do Palpite

O valor de cada palpite é configurável diretamente na interface do sistema. Por padrão, ele é definido como R$ 5,00.

**Como Alterar o Valor do Palpite:**

1.  Acesse o sistema de bolão no seu navegador.
2.  Clique no botão "Configurações" (ícone de engrenagem) no cabeçalho da página.
3.  Digite a senha de administrador e clique em "Confirmar".
4.  No campo "Valor do Palpite", digite o novo valor desejado (ex: `10.00` para R$ 10,00).
5.  Clique em "Salvar Configurações".

O valor total do bolão será automaticamente recalculado com base no novo valor e na quantidade de participantes.

## 5. Manutenção e Solução de Problemas

### 5.1. Dados do Bolão (LocalStorage)

Todos os dados do bolão (participantes, resultados, configurações) são armazenados no `localStorage` do navegador do usuário. Isso significa que os dados são persistentes mesmo se o navegador for fechado, mas são específicos para aquele navegador e dispositivo. Se um usuário acessar o bolão de um navegador diferente ou de outro computador, ele verá o bolão 


vazio, a menos que importe os dados. Isso simplifica a hospedagem, pois não requer um banco de dados.

**Importante:** Se você precisar compartilhar os dados entre diferentes dispositivos ou navegadores, você pode usar as funções de "Exportar Dados" e "Importar Dados" disponíveis na interface do bolão. O arquivo JSON exportado pode ser então importado em outro navegador ou dispositivo.

### 5.2. Atualização Automática de Resultados (Problemas e Soluções)

A atualização automática dos resultados da Lotofácil depende da execução bem-sucedida do `lotofacil_scraper.py` no seu servidor. Problemas podem surgir devido a:

-   **Proteções Anti-bot da Caixa:** O site da Caixa Econômica Federal pode implementar novas proteções que dificultem o scraping. O `lotofacil_scraper.py` já tenta contornar algumas delas usando Playwright, mas novas medidas podem exigir atualizações no script.
-   **Mudanças na Estrutura do Site da Caixa:** Se a Caixa alterar a estrutura HTML do seu site, o scraper pode parar de funcionar, pois ele busca elementos específicos na página. Nesses casos, o script precisará ser atualizado.
-   **Problemas de Conectividade/Servidor:** Verifique se o seu servidor tem acesso à internet e se não há firewalls bloqueando as requisições do scraper.
-   **Dependências Ausentes:** Certifique-se de que todas as bibliotecas Python (`requests`, `beautifulsoup4`, `playwright`) e os navegadores do Playwright estão corretamente instalados no seu servidor.

**Solução de Problemas:**

1.  **Verifique os Logs do Scraper:** O cron job que você configurou redireciona a saída do scraper para `/var/log/lotofacil_scraper.log`. Verifique este arquivo para mensagens de erro ou avisos que possam indicar o problema.

    ```bash
    cat /var/log/lotofacil_scraper.log
    ```

2.  **Execute o Scraper Manualmente:** Tente executar o `lotofacil_scraper.py` manualmente no seu servidor para ver se ele retorna algum erro ou se o `lotofacil_dados.json` é gerado corretamente.

    ```bash
    python3 /caminho/para/seu/bolao_lotofacil_pacote/lotofacil_scraper.py
    ```

3.  **Verifique o Acesso ao `lotofacil_dados.json`:** Certifique-se de que o arquivo `lotofacil_dados.json` gerado pelo scraper está no diretório correto e que o seu servidor web está configurado para servi-lo publicamente. Você pode tentar acessá-lo diretamente pelo navegador (ex: `http://seusite.com/lotofacil_dados.json`).

4.  **Fallback Manual:** Se a atualização automática estiver consistentemente falhando, você sempre pode usar a opção de "Atualizar Resultado Manualmente" na interface do bolão para inserir os números do último concurso.

### 5.3. Problemas com o Envio para WhatsApp

O envio de palpites para o WhatsApp depende da abertura de uma nova janela/aba do navegador com o WhatsApp Web. Problemas podem ocorrer se:

-   **Bloqueadores de Pop-up:** O navegador do usuário pode estar bloqueando a abertura da nova janela. Peça ao usuário para desativar o bloqueador de pop-ups para o seu site.
-   **WhatsApp Web Não Logado:** O usuário pode não estar logado no WhatsApp Web no navegador. O sistema abrirá a página de login do WhatsApp Web, e o usuário precisará fazer o login para enviar a mensagem.
-   **Número de WhatsApp Incorreto:** Verifique se o número configurado em `whatsapp_integration.js` está correto e no formato adequado (`+55DDDNUMERO`).

## 6. Considerações Finais

Este sistema de Bolão da Lotofácil oferece uma solução robusta e flexível para organizar seus bolões. Ao seguir as instruções de hospedagem e configuração, você poderá ter seu próprio sistema funcionando em pouco tempo. Lembre-se de manter as senhas seguras e de verificar os logs do scraper periodicamente se estiver usando a atualização automática.

Esperamos que este sistema traga mais diversão e organização para seus bolões da Lotofácil!

---

**Desenvolvido por:** Manus AI


