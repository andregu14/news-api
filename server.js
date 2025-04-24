const express = require("express")
const app = express()
const port = 3000
const sqlite3 = require("sqlite3").verbose()

let db;

db = new sqlite3.Database("./news.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Erro ao conectar ao bando de dados: ", err.message);
        process.exit(1)
    } else {
        console.log("Conectado ao banco de dados SQLite.")
        // Cria a tabela de noticias se nao existir
        const sqlCreateTable = `CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            image TEXT NOT NULL,
            department TEXT NOT NULL,
            author TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        db.run(sqlCreateTable, (err) => {
            if (err) {
                console.error("Erro ao criar tabela: ", err.message);
            } else {
                console.log("Tabela 'news' criada ou ja existe.")
            }
        })
    }
})

app.get('/', (req, res) => {
    res.send("Acesse as noticias em /news")
})

// Middleware para parsear JSON no corpo da requisicao
app.use(express.json())

const newsRouter = require("./routes/news")(db)

app.use("/news", newsRouter)

// Fecha a conexão com o banco de dados quando a aplicação é encerrada
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(err ? 1 : 0);
    });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})