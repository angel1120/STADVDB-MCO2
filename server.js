const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const connection  = require('express-myconnection'); 

const app = express();

const central_node = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
<<<<<<< Updated upstream
    database: 'node1'
});

const node2 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'node1'
});

const node3 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'node1'
});
=======
    database: 'central_node'
  });
>>>>>>> Stashed changes

//define other node
const node2 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'node2'
  });

//define other node
const node3 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'node3'
  });

central_node.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id' + central_node.threadId);
});

//connect other node
node2.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id' + node2.threadId);
});

//connect other node
node3.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id' + node3.threadId);
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//viewing central_node
app.get('/main',(req, res) => {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM movies LIMIT 1000";
    let query = central_node.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('index', {
            title : 'Movies Database',
            movies : rows
        });
    });
});

//viewing node2
app.get('/node2',(req, res) => {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM movies LIMIT 1000";
    let query = node2.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('index', {
            title : 'Movies Database',
            movies : rows
        });
    });
});

//viewing node3
app.get('/node3',(req, res) => {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM movies LIMIT 1000";
    let query = node3.query(sql, (err, rows) => {
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
    let query = central_node.query(sql, data,(err, results) => {
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
    let query = central_node.query('Select * from movies where id = ?',[movieId], (err, result) => {    
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
<<<<<<< Updated upstream
    
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
        db.end();
        });
    });
    });

    // let query = db.query(sql,(err, results) => {
    //   if(err) throw err;
    //   res.redirect('/');
    // });
=======
    let query = central_node.query(sql,(err, results) => {
        if(err) throw err;

        // need to place condition where if a movie changes from before 1980 to after
        // i.e. Movie Year 1960 --> Movie Year 2005
        if (req.body.year < 1980) {
            node2.query(sql,(err, results) => {if(err) throw err;});
        } else if (req.body.year >= 1980) {
            node3.query(sql,(err, results) => {if(err) throw err;});
        }

      res.redirect('/main');
    }); 
>>>>>>> Stashed changes
});


app.get('/delete/:movieId',(req, res) => {
    const movieId = req.params.movieId;
    //let sql = `DELETE from users where id = ${userId}`;

    let temp_query = central_node.query('Select * from movies where id = ?',[movieId], (err, result) => {
        let movie_year = result[0].year;
        let delete_query = "DELETE from movies where id ="+movieId;

        let query = central_node.query(delete_query,(err, result) => {
            if(err) throw err;
        });

        if (movie_year < 1980) {
            node2.query(delete_query,(err, results) => {if(err) throw err;});
        } else if (movie_year >= 1980) {
            node3.query(delete_query,(err, results) => {if(err) throw err;});
        }

        res.redirect('/main');
    });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});