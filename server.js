// server.js
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

// ROTA 1: GET /produtos -> Listar todas

const cors = require('cors');
app.use(cors());


app.get('/produtos', (require, response) => {
    const sql = 'SELECT * FROM produtos ORDER BY id ASC';
    pool.query(sql,(erro, resultado)=>{
        response.json(resultado.rows);    
    });
});

// ROTA 1.1: GET /produtos/:id -> Buscar um produto pelo ID

app.get('/produtos/:id', (request, response) => {
    const { id } = request.params;
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
    const sql = 'INSERT INTO produtos (nome, preco, descricao) VALUES ($1, $2, $3) RETURNING *';
    pool.query(sql, [nome, preco, descricao], (erro, resultado) => {
        response.json(resultado.rows[0]);
    });
});

// ROTA 3: DELETE /produtos/:id -> Excluir um produto

app.delete('/produtos/:id', (request, response) => {
    const { id } = request.params;
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