//utilizar "node comentarios.js temadabusca"   para gerar o scrapping

const puppeteer = require('puppeteer');
const fs = require('fs'); // Biblioteca para salvar arquivos
const ExcelJS = require('exceljs');

const tema = process.argv.slice(2).join(' '); // join(' ') junta tudo a partir do segundo argumento (usado para espaços)

if (!tema) {
    console.log('passe um tema. Ex: node comentarios.js tecnologia');
    process.exit();
}

console.log("tema", tema);

function formatarDataISO(textoData) {
    if (!textoData) return ''; 

    const limpo = textoData.replace(/\./g, '').trim(); // remove pontos comuns em abreviações do inglês: "Jan." -> "Jan"

    const timestamp = Date.parse(limpo);
    if (Number.isNaN(timestamp)) return ''; 

    return new Date(timestamp).toISOString().slice(0, 10); // transforma em YYYY-MM-DD
}

async function extrairNoticiasDaPagina(page) {
    await page.waitForSelector('li[data-testid="search-bodega-result"]'); //espera existir algum elemento de busca, no caso "li"

    const noticias = await page.$$eval('li[data-testid="search-bodega-result"]', (itens) => {
        return itens.map((item) => {
            const titulo = item.querySelector('h4')?.innerText?.trim() || ''; //.trim é usado para remover espaços no começo e final.

            const paragrafos = Array.from(item.querySelectorAll('p')) 
                .map(p => p.innerText.trim())
                .filter(texto => texto.length > 30 && !texto.startsWith('By'));//esse bloco tenta filtrar o <p> que é um resumo

            const descricao = paragrafos[0] || '';
            const link = item.querySelector('a')?.href || ''; // ? , || , ''  << são usados para tratar possiveis erros.
            const data = item.querySelector('[data-testid="todays-date"]')?.innerText || '';

            return { titulo, data_publicacao: data, descricao, link };
        });
    });

    return noticias;
}

async function main() {
    // headless: false para mostrar o navegador, true para rodar em segundo plano
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
    });

    const page = await browser.newPage();

    // encodeURIComponent formata url Exemplo: "ciencia de dados" vira "ciencia%20de%20dados".
    const urlBusca = `https://www.nytimes.com/search?query=${encodeURIComponent(tema)}`;
    await page.goto(urlBusca, { waitUntil: 'networkidle2' }); //espero até a pagina ficar "ociosa", tempo de carregamento completo ou quase.

    //TRATAMENTO DE COOKIES//
    // Tentar clicar no botão, se falhar (ou não aparecer), remove o HTML do banner à força
    try {
        const btnAceitar = 'button#fides-banner-button-primary-accept';
        await page.waitForSelector(btnAceitar, { timeout: 5000 });
        await page.click(btnAceitar);
    } catch (e) {
        await page.evaluate(() => {
            // Remove o container do banner e o overlay que escurece a tela
            const banner =
                document.querySelector('#fides-banner-container') ||
                document.querySelector('.fides-banner-container');

            if (banner) banner.remove();

            // Libera o scroll do site que é travado pelo aviso de privacidade
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            document.body.classList.remove('fides-no-scroll');
        });
    }

    let qtdResultados = 0;

    while (qtdResultados < 50) { // se tiver menos de 50 na tela, tenta clicar em "show more"
        const seletorBotao = '[data-testid="search-show-more-button"]';
        const botaoExiste = await page.$(seletorBotao);

        if (!botaoExiste) break;

        await page.$eval(seletorBotao, el => el.scrollIntoView({ block: 'center' })); //$eval pega o elemento e executa a função nele dentro da página.
        await new Promise(resolve => setTimeout(resolve, 1000)); //pausa de 1 seg por problemas de "lag"

        await page.$eval(seletorBotao, el => el.click());//el.click disparado no dom pra contornar situações

        try {// Espera o número de notícias aumentar antes de prosseguir
            await page.waitForFunction(
                (qtdAnterior) =>
                    document.querySelectorAll('li[data-testid="search-bodega-result"]').length > qtdAnterior, //controle de quantidade 
                { timeout: 8000 },
                qtdResultados
            );
        } catch (e) {
            console.log("Tempo de espera esgotado ou fim dos resultados.");
            break;
        }

        qtdResultados = await page.$$eval( //atualizo a contagem de itens da pag
            'li[data-testid="search-bodega-result"]',
            itens => itens.length
        );

        console.log(`Resultados carregados: ${qtdResultados}`);
    }

    const todasNoticias = await extrairNoticiasDaPagina(page);

    console.log(todasNoticias[0]);
    console.log('Total capturado:', todasNoticias.length);

    // Opcional: Salvar em arquivo para não perder os dados
    fs.writeFileSync('noticias.json', JSON.stringify(todasNoticias, null, 2));

    // tratamentos para o excel
    const workbook = new ExcelJS.Workbook(); //excel em memoria
    const sheet = workbook.addWorksheet('Noticias');//cria planilha "noticias"

    sheet.columns = [
        { header: 'Título', key: 'titulo', width: 60 },
        { header: 'Data de Publicação', key: 'data_publicacao', width: 18 },
        { header: 'Descrição', key: 'descricao', width: 90 },
    ];

    const noticiasParaExcel = todasNoticias.slice(0, 50); //pega só 50 noticias, mesmo que tenham mais

    if (noticiasParaExcel.length < 50) { //se n tiver as 50
        console.log(`Aviso: foram encontradas apenas ${noticiasParaExcel.length} noticias para este tema.`);
    }

    for (const n of noticiasParaExcel) {
        sheet.addRow({
            titulo: n.titulo,
            data_publicacao: formatarDataISO(n.data_publicacao) || n.data_publicacao,
            descricao: n.descricao,
        });
    }

    const nomeArquivoSeguro = tema
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''); //remoção de caracters pra n haver problema na criação do nome

    const nomeExcel = `noticias-${nomeArquivoSeguro || 'tema'}.xlsx`;

    await workbook.xlsx.writeFile(nomeExcel);
    console.log(`Excel gerado: ${nomeExcel}`);

    await browser.close();
}

main();
