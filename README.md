# Coletor de Notícias do New York Times (NYTimes) para Excel

> **Importante para avaliação:**  
> Além do `index.js`, recomendo a leitura do arquivo **comentarios.js**, que contém explicações detalhadas do funcionamento do script e das decisões técnicas adotadas durante o desenvolvimento.

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

## Estrutura do Projeto

O projeto possui **dois scripts principais**, com objetivos distintos:

- **index.js**  
  Versão limpa e objetiva do script, focada exclusivamente na execução do scraping e geração do Excel.

- **comentarios.js**  
  Versão **didática e comentada**, onde cada bloco relevante do código é explicado, incluindo:
  - decisões técnicas adotadas
  - tratamento de exceções
  - limitações conhecidas do scraping
  - observações sobre alternativas de implementação

Este arquivo foi incluído **intencionalmente para facilitar o entendimento do raciocínio por trás da solução**

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

```bash
node index.js Software enginer

node index.js brazil

node index.js president
```

Execução com comentários e explicações (versão comentada)

```bash
node comentarios.js Software enginer
```

## Saída gerada

Ao final da execução, o script gera um arquivo Excel com o padrão:

noticias-<termo-buscado>.xlsx

Exemplo:

noticias-brazil.xlsx

## Observações adicionais

Algumas considerações técnicas, limitações do scraping e decisões de projeto foram documentadas **diretamente no arquivo `comentarios.js`**, ao final do código, para manter o raciocínio e a explicação nesse arquivo, sendo funcional mas com o foco em explicar apenas.
