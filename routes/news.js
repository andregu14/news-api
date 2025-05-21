const express = require("express")
const router = express.Router()
const { formatDistanceToNow } = require("date-fns")
const { ptBR } = require("date-fns/locale")


module.exports = (db) => {
    // Busca todas as noticias
    router.get("/", (req, res) => {
        // Seleciona todas as colunas da tabela news
        db.all("SELECT * FROM news ORDER BY created_at DESC", [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return
            }

            // Calcula o tempo relativo para cada noticia
            const formattedNews = rows.map(news => {
                const dateUTC = new Date(news.created_at + "Z")
                const timeAgo = formatDistanceToNow(dateUTC, { addSuffix: true, locale: ptBR })
                return {
                    ...news,
                    created_at: timeAgo
                }
            })

            res.status(200).json({
                message: "API is running",
                news: formattedNews
            })
        })
    })

    // Rota para adicionar uma nova noticia
    router.post("/", (req, res) => {
        // Extrai os campos do corpo da requisicao
        const { title, description, image, department, author } = req.body;
        if (!title) {
            return res.status(400).json({ error: "O título é obrigatório" });
        }

        const sqlInsert = `INSERT INTO news (title, description, image, department, author) VALUES (?, ?, ?, ?, ?)`

        const params = [title, description, image, department, author]

        db.run(sqlInsert, params, function (err) {
            if (err) {
                console.error("Erro ao inserir noticia:", err.message);
                return res.status(500).json({ error: "Erro interno ao inserir a noticia", details: err.message });
            }
            // Retorna os dados inseridos
            res.status(201).json({
                message: `Notícia com id ${this.lastID} adicionada com sucesso.`
            });
        });
    });

    // Busca uma noticia baseada no id
    router.get("/:id", (req, res) => {
        const id = req.params.id;
        const sqlSelectById = "SELECT * FROM news WHERE id = ?";

        db.get(sqlSelectById, [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            // Verifica se a notícia foi encontrada
            if (row) {
                // Calcula o tempo relativo para cada noticia
                const dateUTC = new Date(row.created_at + "Z")
                const timeAgo = formatDistanceToNow(dateUTC, { addSuffix: true, locale: ptBR })
                const formattedRow = {
                    ...row,
                    created_at: timeAgo
                }
                res.json(formattedRow);
            } else {
                // Notícia não encontrada
                res.status(404).json({ message: `Notícia com id ${id} não encontrada.` });
            }
        });
    });

    // Busca uma noticia baseada em uma query
    router.get("/search/:query", (req, res) => {
        const searchQuery = req.params.query;
        const sql = `
                    SELECT * FROM news 
                    WHERE LOWER(title) LIKE ? 
                    OR LOWER(description) LIKE ? 
                    OR LOWER(department) LIKE ?
                    ORDER BY created_at DESC
        `;
        const searchPattern = `%${searchQuery}%`

        db.all(sql, [searchPattern, searchPattern, searchPattern], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message })
                return
            }

            // Calcula o tempo relativo para cada noticia
            const formattedNews = rows.map(news => {
                const dateUTC = new Date(news.created_at + "Z")
                const timeAgo = formatDistanceToNow(dateUTC, { addSuffix: true, locale: ptBR })
                return {
                    ...news,
                    created_at: timeAgo
                }
            })

            res.status(200).json({
                results: formattedNews,
                count: formattedNews.lenght
            })
        })
    })

    // Atualiza uma noticia baseada no id
    router.put("/:id", (req, res) => {
        // TODO
    })

    // Deleta uma noticia baseada no id
    router.delete("/:id", (req, res) => {
        // TODO
    })

    return router;
}