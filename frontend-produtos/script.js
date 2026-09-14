
// A URL da nossa API
const url = "http://localhost:3000/produtos";

/**
 * 1. BUSCAR PRODUTOS (GET)
 */
async function buscarProdutos() {

    console.log("Buscando Produto...");

    const resposta = await fetch("http://localhost:3000/produtos");

     const dados = await resposta.json();

    // Pega a div onde os produtos vão ser exibidos
    const listaProdutos = document.getElementById("lista-produtos");

    // Limpa a lista antes de renderizar (evita duplicar em buscas futuras)
    listaProdutos.innerHTML = "";

    // Para cada produto retornado pela API, cria um card e exibe na tela
    dados.forEach(function(produto) {
        const card = document.createElement("div");
        card.className = "produto-card";

        card.innerHTML = `
            <h3>${produto.nome} (ID: ${produto.id})</h3>
            <p>${produto.descricao}</p>
            <p class="preco">R$ ${Number(produto.preco).toFixed(2)}</p>
            <button class="btn-excluir" data-id="${produto.id}">Excluir</button>
        `;

        listaProdutos.appendChild(card);
    });

    // Adiciona o evento de clique em cada botão "Excluir" criado acima
    document.querySelectorAll(".btn-excluir").forEach(function(botao) {
        botao.addEventListener("click", async function() {
            const id = botao.getAttribute("data-id");
            await excluirProduto(id);
        });
    });
}


/**
 * 3. BUSCAR PRODUTO PELO ID (GET /produtos/:id)
 */
const formularioBusca = document.getElementById("formulario-busca");
const resultadoBusca = document.getElementById("resultado-busca");

formularioBusca.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    const id = document.getElementById("busca-id").value;

    const resposta = await fetch(`${url}/${id}`);

    if (resposta.status === 404) {
        resultadoBusca.innerHTML = `<p>Produto com ID ${id} não encontrado.</p>`;
        return;
    }

    const produto = await resposta.json();

    resultadoBusca.innerHTML = `
        <div class="produto-card">
            <h3>${produto.nome} (ID: ${produto.id})</h3>
            <p>${produto.descricao}</p>
            <p class="preco">R$ ${Number(produto.preco).toFixed(2)}</p>
        </div>
    `;
});


/**
 * 4. EXCLUIR PRODUTO (DELETE /produtos/:id)
 */
async function excluirProduto(id) {

    const confirmar = confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmar) return;

    await fetch(`${url}/${id}`, {
        method: "DELETE"
    });

    // Atualiza a lista depois de excluir
    buscarProdutos();
}


/**
 * 2. SALVAR NOVO PRODUTO (POST)
 */
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    const nome = document.getElementById("nome").value;
    const preco = document.getElementById("preco").value;
    const descricao = document.getElementById("descricao").value;

    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, preco, descricao })
    });

    formulario.reset();

    buscarProdutos();
});

// Executa a busca de produtos assim que a página abre
buscarProdutos();