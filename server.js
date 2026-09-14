// server.js
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

// ROTA 1: GET /produtos -> Listar todas

const cors = require('cors');
app.use(cors());


app.get('/produtos', (request, response) => {
    // Query sem parâmetros vindos do usuário: não recebe nenhum dado externo,
    // então não há risco de SQL Injection aqui.
    const sql = 'SELECT * FROM produtos ORDER BY id ASC';
    pool.query(sql, (erro, resultado) => {
        if (erro) {
            response.status(500).json({ erro: 'Erro ao listar produtos' });
            return;
        }
        response.json(resultado.rows);
    });
});

// ROTA 1.1: GET /produtos/:id -> Buscar um produto pelo ID

app.get('/produtos/:id', (request, response) => {
    const { id } = request.params;

    // Query parametrizada: o "id" (que vem da URL, digitado pelo usuário) é
    // passado como segundo argumento de pool.query, no lugar de $1.
    // Nunca é colado diretamente na string SQL.
    const sql = 'SELECT * FROM produtos WHERE id = $1';
    pool.query(sql, [id], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ erro: 'Erro ao buscar produto' });
            return;
        }
        if (resultado.rows.length === 0) {
            response.status(404).json({ erro: 'Produto não encontrado' });
            return;
        }
        response.json(resultado.rows[0]);
    });
});

// ROTA 2: POST /produtos -> Cadastrar um novo

app.post('/produtos', (request, response) => {
    const { nome, preco, descricao } = request.body;

    // Validação básica: garante que os campos obrigatórios vieram preenchidos
    // antes de tocar no banco de dados.
    if (!nome || preco === undefined || preco === null) {
        response.status(400).json({ erro: 'Os campos "nome" e "preco" são obrigatórios' });
        return;
    }

    // Query parametrizada: os valores vindos do usuário (nome, preco, descricao)
    // são enviados separadamente do texto SQL como $1, $2 e $3.
    // O driver 'pg' os trata sempre como DADOS, nunca como parte do comando SQL,
    // o que elimina a possibilidade de SQL Injection nesta rota.
    const sql = 'INSERT INTO produtos (nome, preco, descricao) VALUES ($1, $2, $3) RETURNING *';
    pool.query(sql, [nome, preco, descricao], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ erro: 'Erro ao cadastrar produto' });
            return;
        }
        response.json(resultado.rows[0]);
    });
});

// ROTA 3: DELETE /produtos/:id -> Excluir um produto

app.delete('/produtos/:id', (request, response) => {
    const { id } = request.params;

    // Query parametrizada: mesmo princípio das rotas acima. O "id" é enviado
    // como dado ($1), não como texto concatenado ao comando SQL.
    const sql = 'DELETE FROM produtos WHERE id = $1 RETURNING *';
    pool.query(sql, [id], (erro, resultado) => {
        if (erro) {
            response.status(500).json({ erro: 'Erro ao excluir produto' });
            return;
        }
        if (resultado.rows.length === 0) {
            response.status(404).json({ erro: 'Produto não encontrado' });
            return;
        }
        response.json({ mensagem: 'Produto excluído com sucesso', produto: resultado.rows[0] });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});