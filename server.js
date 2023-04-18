const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');

const app = express();

//central node
const db = mysql.createConnection({
    host: '35.198.249.108',
    user: 'imdb-root',
    password: 'stadv',
    database: 'node1'
});

//movies-before-1980
const node2 = mysql.createConnection({
    host: '35.247.175.191',
    user: 'before-root',
    password: 'stadv',
    database: 'node2'
});

//movies-after-1980
const node3 = mysql.createConnection({
    host: '34.126.115.63',
    user: 'after-root',
    password: 'stadv',
    database: 'node3'
});

db.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id' + db.threadId);
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/',(req, res) => {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM movies LIMIT 1000";
    let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('index', {
            title : 'Movies Database',
            movies : rows
        });
    });
});

app.get('/add',(req, res) => {
    res.render('movie_add', {
        title : 'CRUD Operation using NodeJS / ExpressJS / MySQL'
    });
});
 
app.post('/save',(req, res) => { 
    let data = {name: req.body.name, year: req.body.year, rank: req.body.rank};
    consol
    let sql = "INSERT INTO movies SET ?";
    let query = db.query(sql, data,(err, results) => {
      if(err) throw err;
      res.redirect('/');
    });
});

app.get('/edit/:movieId',(req, res) => {
    const movieId = req.params.movieId;
    console.log(req.params);
    console.log(movieId);
    //let sql = "Select * from users where id = ${userId}";
    //let query = db.query(sql,(err, result) => {
    let query = db.query('Select * from movies where id = ?',[movieId], (err, result) => {    
        if(err) throw err;
        res.render('movie_edit', {
            title : 'Edit Movie',
            movie : result[0]
        });

    });

});

app.post('/update',(req, res) => {

    // Assign variables with data from edit page
    const movieId = req.body.id;
    let sql = "update movies SET name='"+req.body.name+"',  year='"+req.body.year+"',  `rank`='"+req.body.rank+"' where id ="+movieId;
    
    // Set the transaction isolation level to serializable
    db.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    // Start a transaction
    db.beginTransaction((err) => {
    if (err) { throw err; }

    // Execute SQL statements within the transaction
    db.query(sql, (err, result) => {
        if (err) {
        connection.rollback(() => {
            throw err;
        });
        }
        console.log('Affected rows:', result.affectedRows);

        // Commit the transaction
        db.commit((err) => {
        if (err) {
            connection.rollback(() => {
            throw err;
            });
        }
        res.redirect('/');
        console.log('Transaction committed');

        });
    });
    });
});

app.get('/delete/:movieId',(req, res) => {
    const movieId = req.params.movieId;

    // Set the transaction isolation level to serializable
    db.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    db.beginTransaction((err) => {
        if (err) {throw err;}

        //Execute SQL statements within the transaction
        db.query('DELETE from movies where id = ?', [movieId], (err, result) => {
            if (err) {
                connection.rollback(() => {
                    throw err;
                });
            }
            console.log('Affected rows:', result.affectedRows);

            //commit the transaction
            db.commit((err) => {
                if (err) {
                    connection.rollback(() => {
                        throw err;
                    });
                }
                res.redirect('/');
                console.log('Transaction committed');
 
            });
        });
    });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});