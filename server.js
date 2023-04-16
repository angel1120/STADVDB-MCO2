const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'node1'
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
    const movieId = req.body.id;
    let sql = "update movies SET name='"+req.body.name+"',  year='"+req.body.year+"',  `rank`='"+req.body.rank+"' where id ="+movieId;
    let query = db.query(sql,(err, results) => {
      if(err) throw err;
      res.redirect('/');
    });
});

app.get('/delete/:movieId',(req, res) => {
    const movieId = req.params.movieId;
    //let sql = `DELETE from users where id = ${userId}`;
    let query = db.query('DELETE from movies where id = ?', [movieId],(err, result) => {
        if(err) throw err;
        res.redirect('/');
    });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});