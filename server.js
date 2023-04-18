const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678', // rCo100928
    database: 'central_node'
});

const node2 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'node2'
});

const node3 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'node3'
});


db.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id' + db.threadId);
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

// viewing central node
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
    db.query('SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED');

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

        // NOT SURE if updating node 2 and 3 should be done during or after transaction
        if (req.body.year < 1980) {
            node2.query(sql,(err, results) => {if(err) throw err;});
        } else if (req.body.year >= 1980) {
            node3.query(sql,(err, results) => {if(err) throw err;});
        }

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

    // let query = db.query(sql,(err, results) => {
    //   if(err) throw err;
    //   res.redirect('/');
    // });
});

// app.get('/delete/:movieId',(req, res) => {
//     const movieId = req.params.movieId;

//     // Set the transaction isolation level to serializable
//     db.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

//     db.beginTransaction((err) => {
//         if (err) {throw err;}

        
//         //Execute SQL statements within the transaction
//         db.query('DELETE from movies where id = ?', [movieId], (err, result) => {
//             if (err) {
//                 connection.rollback(() => {
//                     throw err;
//                 });
//             }
//             console.log('Affected rows:', result.affectedRows);

//             //commit the transaction
//             db.commit((err) => {
//                 if (err) {
//                     connection.rollback(() => {
//                         throw err;
//                     });
//                 }
//                 res.redirect('/');
//                 console.log('Transaction committed');
 
//             });
//         });
//     });
// });

app.get('/delete/:movieId',(req, res) => {
    const movieId = req.params.movieId;
    //let sql = `DELETE from users where id = ${userId}`;

    // Set the transaction isolation level to serializable
    db.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    db.beginTransaction((err) => {

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

        //commit the transaction
        db.commit((err) => {
            if (err) {
                connection.rollback(() => {
                    throw err;
                });
            }
            res.redirect('/');
            console.log('Affected rows:', result.affectedRows);
            console.log('Transaction committed');

        });
    });
});
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});