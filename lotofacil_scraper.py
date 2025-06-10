#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Scraper para obter resultados da Lotofácil diretamente do site oficial da Caixa Econômica Federal.
Este script extrai os dados do último concurso e os formata para uso no sistema de bolão.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import logging
from datetime import datetime
import time
import os
from playwright.sync_api import sync_playwright

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
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
        self.resultado_cache_file = "lotofacil_resultado_cache.json"
        self.max_retries = 3
        self.retry_delay = 2  # segundos
    
    def obter_ultimo_concurso_requests(self):
        """Tenta obter o último concurso usando requests."""
        try:
            logger.info("Tentando obter resultado via requests")
            response = requests.get(self.url_oficial, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                logger.warning(f"Falha ao acessar o site: Status code {response.status_code}")
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Tentar encontrar o número do concurso
            concurso_element = soup.select_one('.title-bar h2')
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
            data_element = soup.select_one('.related-information')
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
            dezenas_elements = soup.select('.numbers .ng-binding')
            if not dezenas_elements or len(dezenas_elements) < 15:
                logger.warning("Não foi possível encontrar as dezenas sorteadas")
                return None
            
            dezenas = [int(elem.text.strip()) for elem in dezenas_elements[:15]]
            
            return {
                "concurso": concurso,
                "data": data,
                "dezenas": dezenas
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter resultado via requests: {str(e)}")
            return None
    
    def obter_ultimo_concurso_playwright(self):
        """Tenta obter o último concurso usando Playwright."""
        try:
            logger.info("Tentando obter resultado via Playwright")
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_default_timeout(30000)  # 30 segundos
                
                # Navegar para a página
                page.goto(self.url_oficial)
                
                # Esperar pelo carregamento dos elementos principais
                page.wait_for_selector('.title-bar h2', state='visible')
                page.wait_for_selector('.numbers', state='visible')
                
                # Extrair o número do concurso
                concurso_text = page.query_selector('.title-bar h2').inner_text()
                concurso_match = re.search(r'Concurso\s+(\d+)', concurso_text)
                if not concurso_match:
                    logger.warning(f"Não foi possível extrair o número do concurso de: {concurso_text}")
                    browser.close()
                    return None
                
                concurso = int(concurso_match.group(1))
                
                # Extrair a data do sorteio
                data_text = page.query_selector('.related-information').inner_text()
                data_match = re.search(r'(\d{2}/\d{2}/\d{4})', data_text)
                if not data_match:
                    logger.warning(f"Não foi possível extrair a data de: {data_text}")
                    browser.close()
                    return None
                
                data = data_match.group(1)
                
                # Extrair as dezenas sorteadas
                dezenas_elements = page.query_selector_all('.numbers .ng-binding')
                if not dezenas_elements or len(dezenas_elements) < 15:
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
            logger.error(f"Erro ao obter resultado via Playwright: {str(e)}")
            return None
    
    def obter_ultimo_concurso_api(self):
        """Tenta obter o último concurso usando a API da Caixa."""
        try:
            logger.info("Tentando obter resultado via API")
            response = requests.get(self.url_resultados, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                logger.warning(f"Falha ao acessar a API: Status code {response.status_code}")
                return None
            
            data = response.json()
            
            if not data or 'concurso' not in data or 'dezenasSorteadasOrdemSorteio' not in data:
                logger.warning("Dados incompletos na resposta da API")
                return None
            
            concurso = data['concurso']
            data_sorteio = data.get('dataApuracao', '')
            
            # Converter formato de data se necessário
            if data_sorteio:
                try:
                    data_obj = datetime.strptime(data_sorteio, '%Y-%m-%dT%H:%M:%S')
                    data_sorteio = data_obj.strftime('%d/%m/%Y')
                except ValueError:
                    logger.warning(f"Formato de data inválido: {data_sorteio}")
            
            dezenas = [int(d) for d in data['dezenasSorteadasOrdemSorteio']]
            
            return {
                "concurso": concurso,
                "data": data_sorteio,
                "dezenas": dezenas
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter resultado via API: {str(e)}")
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
            self.obter_ultimo_concurso_api,
            self.obter_ultimo_concurso_requests,
            self.obter_ultimo_concurso_playwright
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
                
                # Aguardar antes de tentar novamente
                time.sleep(self.retry_delay)
        
        logger.error("Todos os métodos falharam ao tentar obter o resultado")
        return None
    
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
