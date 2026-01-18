# Coletor de Notícias do New York Times (NYTimes) para Excel

## Descrição

Script em JavaScript (Node.js) que realiza buscas no site do New York Times a partir de um tema informado via linha de comando, coleta no mínimo 50 resultados quando disponíveis e exporta as informações para um arquivo Excel (.xlsx).

Para cada notícia, são coletados os campos:

- titulo
- data_publicacao
- descricao

O Excel gerado contém uma única aba com as colunas:

- Título
- Data de Publicação
- Descrição

# nota/explicação a parte

- existem 2 scrips, um index.js, limpo e organizado, e um comentarios.js para entendimento e analise de ideias

## Requisitos

- Node.js instalado
- Dependências do projeto instaladas via npm

## Instalação

No diretório do projeto, execute:

```bash
npm install
```

## Como executar

Execute o script passando um tema como argumento:
Exemplos:

node index.js Software enginer

node index.js brazil

node index.js president

SE ESTIVER NO COMENTARIOS.JS UTILIZE

node comentarios.js Software enginer

## Saída gerada

Ao final da execução, o script gera um arquivo Excel com o padrão:

noticias-<termo-buscado>.xlsx

Exemplo:

noticias-brazil.xlsx
