#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Servidor API para integração do scraper da Lotofácil com o frontend.
Este script cria um servidor HTTP simples para permitir que o frontend
execute o scraper e obtenha os resultados mais recentes.
"""

import http.server
import socketserver
import json
import os
import sys
import subprocess
import logging
from urllib.parse import parse_qs, urlparse

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_server.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("ApiServer")

# Diretório base onde os arquivos estão localizados
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRAPER_SCRIPT = os.path.join(BASE_DIR, "lotofacil_scraper_avancado.py")
DADOS_JSON = os.path.join(BASE_DIR, "lotofacil_dados.json")

class LotofacilRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler personalizado para requisições HTTP."""
    
    def do_GET(self):
        """Trata requisições GET."""
        # Rota para verificar status do servidor
        if self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'online',
                'message': 'API do Bolão da Lotofácil está funcionando'
            }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Para outras requisições GET, usar o comportamento padrão (servir arquivos estáticos)
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def do_POST(self):
        """Trata requisições POST."""
        # Rota para atualizar resultados
        if self.path == '/api/atualizar-resultados':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                # Executar o script de scraping
                logger.info("Executando script de scraping")
                result = subprocess.run(
                    [sys.executable, SCRAPER_SCRIPT],
                    capture_output=True,
                    text=True,
                    timeout=60  # 60 segundos de timeout
                )
                
                if result.returncode != 0:
                    logger.error(f"Erro ao executar script: {result.stderr}")
                    response = {
                        'success': False,
                        'message': f'Erro ao executar script: {result.stderr}'
                    }
                else:
                    logger.info("Script executado com sucesso")
                    # Verificar se o arquivo de dados foi criado/atualizado
                    if os.path.exists(DADOS_JSON):
                        response = {
                            'success': True,
                            'message': 'Resultados atualizados com sucesso'
                        }
                    else:
                        logger.error("Arquivo de dados não foi criado")
                        response = {
                            'success': False,
                            'message': 'Arquivo de dados não foi criado'
                        }
            except Exception as e:
                logger.error(f"Erro ao atualizar resultados: {str(e)}")
                response = {
                    'success': False,
                    'message': f'Erro ao atualizar resultados: {str(e)}'
                }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Rota para limpar dados
        elif self.path == '/api/limpar-dados':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                # Criar arquivo de dados vazio
                with open(os.path.join(BASE_DIR, "dados_bolao.json"), 'w') as f:
                    json.dump({
                        "participantes": [],
                        "resultado": {
                            "concurso": 0,
                            "data": "",
                            "dezenas": []
                        }
                    }, f)
                
                response = {
                    'success': True,
                    'message': 'Dados limpos com sucesso'
                }
            except Exception as e:
                logger.error(f"Erro ao limpar dados: {str(e)}")
                response = {
                    'success': False,
                    'message': f'Erro ao limpar dados: {str(e)}'
                }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Para outras requisições POST, retornar erro 404
        self.send_error(404)
    
    def do_OPTIONS(self):
        """Trata requisições OPTIONS (para CORS)."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8000):
    """Inicia o servidor HTTP."""
    handler = LotofacilRequestHandler
    
    # Definir o diretório atual como diretório de trabalho
    os.chdir(BASE_DIR)
    
    # Criar servidor
    with socketserver.TCPServer(("", port), handler) as httpd:
        logger.info(f"Servidor iniciado na porta {port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logger.info("Servidor encerrado")
            httpd.server_close()

if __name__ == "__main__":
    # Usar porta 8000 por padrão, ou a porta especificada como argumento
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    
    run_server(port)
