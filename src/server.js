const express = require("express")
const server = express()

//pegar o banco de dados
const db = require("./database/db")

//configurar pasta publica
//use: fazendo configuracao do meu servidor
server.use(express.static("public"))


//Habilitar o uso do req.body na nossa aplicacao
server.use(express.urlencoded({ extended: true }))


//utilizando o template enginec
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

//configurar caminhos da minha aplicação
//página inicial
// req: requisicao
// res: resposta
// get: configurar de rota do servidor
server.get("/", (req, res) => {
    return res.render("index.html")
})

server.get("/create-point", (req, res) => {
    //req.query: Query Strings da nossa URL
    // console.log("req.query")

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    //req.body: O corpo do nosso formulário
    // console.log(req.body)

    //inserir dados no banco de dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
            ) VALUES(?,?,?,?,?,?,?);        
        `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
     ]

    function afterInsertData(err) {
        if(err) {
            console.log("Erro de Cadastro")
            console.log(this)

            return res.render("create-point.html", {err: true})
        }
        
        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", {saved: true})
    }

    db.run(query, values, afterInsertData)
})


server.get("/search", (req, res) => {
    const search = req.query.search

    if(search == ""){
        //Pesquisa vazia
        return res.render("search-results.html", { total: 0})
    }
    
    //pegar os dados no banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows){
        if(err) {
            return console.log(err)
        }

        console.log(rows)

        const total = rows.length
        
        //mostrar a pagina html com os dados do banco de dados
        return res.render("search-results.html", { places: rows, total: total})
    })
})

//ligar o servidor
server.listen(3000)
