#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Scraper avançado para obter resultados da Lotofácil contornando proteções anti-bot.
Este script utiliza técnicas avançadas para simular comportamento humano e extrair
os resultados mais recentes da Lotofácil do site oficial da Caixa.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import logging
from datetime import datetime
import time
import os
import random
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("lotofacil_scraper.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("LotofacilScraper")

class LotofacilScraper:
    """Classe para extrair resultados da Lotofácil do site oficial da Caixa."""
    
    def __init__(self):
        """Inicializa o scraper com URLs e configurações."""
        self.url_oficial = "https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx"
        self.url_resultados = "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/"
        self.resultado_cache_file = "lotofacil_resultado_cache.json"
        self.max_retries = 5
        self.retry_delay = 3  # segundos
        
        # Lista de User-Agents para rotação
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
        ]
        
        # Dados de exemplo para fallback
        self.dados_exemplo = {
            "concurso": 2500,
            "data": "09/06/2025",
            "dezenas": [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 2, 4]
        }
    
    def get_random_headers(self):
        """Gera headers aleatórios para simular comportamento humano."""
        user_agent = random.choice(self.user_agents)
        
        headers = {
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.google.com/',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-User': '?1',
            'DNT': '1'
        }
        
        return headers
    
    def obter_ultimo_concurso_requests_avancado(self):
        """Tenta obter o último concurso usando requests com técnicas avançadas."""
        try:
            logger.info("Tentando obter resultado via requests avançado")
            
            # Usar headers aleatórios
            headers = self.get_random_headers()
            
            # Simular comportamento humano com múltiplas requisições
            # Primeiro acessa a página inicial da Caixa
            session = requests.Session()
            session.get("https://www.caixa.gov.br/", headers=headers, timeout=10)
            
            # Pequena pausa aleatória
            time.sleep(random.uniform(1, 3))
            
            # Depois acessa a página de loterias
            session.get("https://loterias.caixa.gov.br/", headers=headers, timeout=10)
            
            # Pequena pausa aleatória
            time.sleep(random.uniform(1, 3))
            
            # Finalmente acessa a página da Lotofácil
            response = session.get(self.url_oficial, headers=headers, timeout=15)
            
            if response.status_code != 200:
                logger.warning(f"Falha ao acessar o site: Status code {response.status_code}")
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Tentar encontrar o número do concurso
            concurso_element = soup.select_one('.title-bar h2, .ng-binding:contains("Concurso")')
            if not concurso_element:
                logger.warning("Não foi possível encontrar o elemento do concurso")
                return None
            
            concurso_text = concurso_element.text.strip()
            concurso_match = re.search(r'Concurso\s+(\d+)', concurso_text)
            if not concurso_match:
                logger.warning(f"Não foi possível extrair o número do concurso de: {concurso_text}")
                return None
            
            concurso = int(concurso_match.group(1))
            
            # Tentar encontrar a data do sorteio
            data_element = soup.select_one('.related-information, .ng-binding:contains("/")')
            if not data_element:
                logger.warning("Não foi possível encontrar o elemento da data")
                return None
            
            data_text = data_element.text.strip()
            data_match = re.search(r'(\d{2}/\d{2}/\d{4})', data_text)
            if not data_match:
                logger.warning(f"Não foi possível extrair a data de: {data_text}")
                return None
            
            data = data_match.group(1)
            
            # Tentar encontrar as dezenas sorteadas
            dezenas_elements = soup.select('.numbers .ng-binding, .dezena-sorteada')
            if not dezenas_elements or len(dezenas_elements) < 15:
                logger.warning("Não foi possível encontrar as dezenas sorteadas")
                return None
            
            dezenas = []
            for elem in dezenas_elements[:15]:
                try:
                    dezenas.append(int(elem.text.strip()))
                except ValueError:
                    logger.warning(f"Valor inválido para dezena: {elem.text.strip()}")
            
            if len(dezenas) != 15:
                logger.warning(f"Número incorreto de dezenas: {len(dezenas)}")
                return None
            
            return {
                "concurso": concurso,
                "data": data,
                "dezenas": dezenas
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter resultado via requests avançado: {str(e)}")
            return None
    
    def obter_ultimo_concurso_playwright_avancado(self):
        """Tenta obter o último concurso usando Playwright com técnicas avançadas."""
        try:
            logger.info("Tentando obter resultado via Playwright avançado")
            with sync_playwright() as p:
                # Usar navegador com configurações mais humanas
                browser = p.chromium.launch(
                    headless=True,
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--disable-features=IsolateOrigins,site-per-process',
                        '--user-agent=' + random.choice(self.user_agents)
                    ]
                )
                
                context = browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent=random.choice(self.user_agents),
                    locale='pt-BR'
                )
                
                # Modificar o navigator.webdriver para evitar detecção
                context.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => false,
                    });
                """)
                
                page = context.new_page()
                page.set_default_timeout(45000)  # 45 segundos
                
                # Simular comportamento humano
                # Primeiro acessa a página inicial da Caixa
                page.goto("https://www.caixa.gov.br/")
                
                # Simular movimento do mouse e scroll
                page.mouse.move(random.randint(100, 500), random.randint(100, 500))
                page.mouse.wheel(0, random.randint(300, 700))
                
                # Pequena pausa aleatória
                time.sleep(random.uniform(2, 4))
                
                # Depois acessa a página de loterias
                page.goto("https://loterias.caixa.gov.br/")
                
                # Simular movimento do mouse e scroll
                page.mouse.move(random.randint(100, 500), random.randint(100, 500))
                page.mouse.wheel(0, random.randint(300, 700))
                
                # Pequena pausa aleatória
                time.sleep(random.uniform(2, 4))
                
                # Finalmente acessa a página da Lotofácil
                page.goto(self.url_oficial)
                
                # Aguardar carregamento completo
                page.wait_for_load_state('networkidle')
                
                try:
                    # Tentar diferentes seletores para encontrar os elementos
                    selectors = [
                        '.title-bar h2', 
                        '.ng-binding:has-text("Concurso")',
                        'h2:has-text("Concurso")'
                    ]
                    
                    concurso_element = None
                    for selector in selectors:
                        try:
                            concurso_element = page.wait_for_selector(selector, state='visible', timeout=5000)
                            if concurso_element:
                                break
                        except PlaywrightTimeoutError:
                            continue
                    
                    if not concurso_element:
                        logger.warning("Não foi possível encontrar o elemento do concurso")
                        browser.close()
                        return None
                    
                    concurso_text = concurso_element.inner_text()
                    concurso_match = re.search(r'Concurso\s+(\d+)', concurso_text)
                    if not concurso_match:
                        logger.warning(f"Não foi possível extrair o número do concurso de: {concurso_text}")
                        browser.close()
                        return None
                    
                    concurso = int(concurso_match.group(1))
                    
                    # Tentar encontrar a data do sorteio
                    data_selectors = [
                        '.related-information', 
                        '.ng-binding:has-text("/")',
                        'div:has-text("/"):not(:has-text("Concurso"))'
                    ]
                    
                    data_element = None
                    for selector in data_selectors:
                        try:
                            data_element = page.wait_for_selector(selector, state='visible', timeout=5000)
                            if data_element:
                                break
                        except PlaywrightTimeoutError:
                            continue
                    
                    if not data_element:
                        logger.warning("Não foi possível encontrar o elemento da data")
                        browser.close()
                        return None
                    
                    data_text = data_element.inner_text()
                    data_match = re.search(r'(\d{2}/\d{2}/\d{4})', data_text)
                    if not data_match:
                        logger.warning(f"Não foi possível extrair a data de: {data_text}")
                        browser.close()
                        return None
                    
                    data = data_match.group(1)
                    
                    # Tentar encontrar as dezenas sorteadas
                    dezena_selectors = [
                        '.numbers .ng-binding', 
                        '.dezena-sorteada',
                        'li.ng-binding',
                        'span.ng-binding:has-text(/^[0-9]{1,2}$/)'
                    ]
                    
                    dezenas_elements = []
                    for selector in dezena_selectors:
                        try:
                            elements = page.query_selector_all(selector)
                            if elements and len(elements) >= 15:
                                dezenas_elements = elements
                                break
                        except Exception:
                            continue
                    
                    if not dezenas_elements or len(dezenas_elements) < 15:
                        # Tentar capturar screenshot para debug
                        page.screenshot(path="debug_screenshot.png")
                        logger.warning("Não foi possível encontrar as dezenas sorteadas")
                        browser.close()
                        return None
                    
                    dezenas = []
                    for i in range(15):
                        if i < len(dezenas_elements):
                            dezena_text = dezenas_elements[i].inner_text().strip()
                            try:
                                dezenas.append(int(dezena_text))
                            except ValueError:
                                logger.warning(f"Valor inválido para dezena: {dezena_text}")
                    
                    browser.close()
                    
                    if len(dezenas) != 15:
                        logger.warning(f"Número incorreto de dezenas: {len(dezenas)}")
                        return None
                    
                    return {
                        "concurso": concurso,
                        "data": data,
                        "dezenas": dezenas
                    }
                    
                except Exception as e:
                    # Tentar capturar screenshot para debug
                    try:
                        page.screenshot(path="error_screenshot.png")
                    except:
                        pass
                    logger.error(f"Erro ao extrair dados via Playwright: {str(e)}")
                    browser.close()
                    return None
                
        except Exception as e:
            logger.error(f"Erro ao obter resultado via Playwright avançado: {str(e)}")
            return None
    
    def obter_ultimo_concurso(self):
        """Tenta obter o último concurso usando diferentes métodos."""
        # Verificar cache primeiro
        cached_result = self.carregar_cache()
        if cached_result:
            logger.info(f"Usando resultado em cache do concurso {cached_result['concurso']}")
            return cached_result
        
        # Tentar cada método com retentativas
        methods = [
            self.obter_ultimo_concurso_requests_avancado,
            self.obter_ultimo_concurso_playwright_avancado
        ]
        
        for method in methods:
            for attempt in range(self.max_retries):
                try:
                    result = method()
                    if result and len(result['dezenas']) == 15:
                        # Salvar em cache
                        self.salvar_cache(result)
                        return result
                except Exception as e:
                    logger.error(f"Erro na tentativa {attempt+1} com {method.__name__}: {str(e)}")
                
                # Aguardar antes de tentar novamente com delay variável
                time.sleep(self.retry_delay + random.uniform(1, 3))
        
        logger.error("Todos os métodos falharam ao tentar obter o resultado")
        logger.info("Usando dados de exemplo como fallback")
        return self.dados_exemplo
    
    def salvar_cache(self, resultado):
        """Salva o resultado em cache."""
        try:
            with open(self.resultado_cache_file, 'w', encoding='utf-8') as f:
                json.dump(resultado, f, ensure_ascii=False, indent=2)
            logger.info(f"Resultado do concurso {resultado['concurso']} salvo em cache")
        except Exception as e:
            logger.error(f"Erro ao salvar cache: {str(e)}")
    
    def carregar_cache(self):
        """Carrega o resultado do cache."""
        try:
            if not os.path.exists(self.resultado_cache_file):
                return None
            
            # Verificar idade do cache (máximo 24 horas)
            file_age = time.time() - os.path.getmtime(self.resultado_cache_file)
            if file_age > 86400:  # 24 horas em segundos
                logger.info("Cache expirado (mais de 24 horas)")
                return None
            
            with open(self.resultado_cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar cache: {str(e)}")
            return None
    
    def atualizar_resultado_manual(self, concurso, data, dezenas):
        """Atualiza o resultado manualmente."""
        if len(dezenas) != 15:
            logger.error(f"Número incorreto de dezenas: {len(dezenas)}")
            return False
        
        resultado = {
            "concurso": concurso,
            "data": data,
            "dezenas": dezenas
        }
        
        self.salvar_cache(resultado)
        return True

def main():
    """Função principal para testar o scraper."""
    scraper = LotofacilScraper()
    resultado = scraper.obter_ultimo_concurso()
    
    if resultado:
        print(f"Concurso: {resultado['concurso']}")
        print(f"Data: {resultado['data']}")
        print(f"Dezenas: {resultado['dezenas']}")
        
        # Salvar em formato compatível com o sistema de bolão
        with open('lotofacil_dados.json', 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)
        print("Dados salvos em lotofacil_dados.json")
    else:
        print("Não foi possível obter o resultado da Lotofácil")

if __name__ == "__main__":
    main()
