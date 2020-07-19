var mysql = require('mysql')
var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var app = express();
var google_auth = require('./google_auth');

var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'nodelogin'
});

connection.connect();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/anon_signup', function(req,res) {
	var email = req.body.email;
	var password = req.body.password;
	connection.query('SELECT * FROM accounts WHERE email=?', [email],
		function(error, results, fields){
			if (error){
				res.send({"code": 400, "failed": "error occurred"});
			} else {
				if (results.length > 0){
					res.send({"code": 401, "failed":"already exists"});
				} else {
					connection.query('INSERT INTO accounts SET ?',
					{"email":email,"password":password}, function(_error, _results, _fields){
						if (_error){
							res.send({"code": 402, "failed": "error occurred"});
						} else {
							res.send({"code":200, "success": "anon_signup success"});
						}
					});
				}
			}
		}
	);
});

app.post('/anon_signin', function(req,res) {
	var email = req.body.email;
	var password = req.body.password;
	connection.query('SELECT * FROM accounts WHERE email=? AND password=?', [email, password],
		function(error, results, fields){
			if (error){
				res.send({"code": 400, "failed": "error occurred"});
			} else {
				if (results.length > 0){
					res.send({"code": 200, "success": "login success"});
				} else {
					res.send({"code": 300, "failed": "No account"})
				}
			}
		}
	);
});


app.post('/google_signup', function(req,res) {
	console.log(req.body.idToken);
	var email = google_auth(req.body);
	console.log(email);
});

app.post('/google_signin', function(req,res) {
	var email = google_auth(req.body);
	connection.query('SELECT * FROM accounts WHERE email=?', [email],
	function(error, results, fields){
		if (error){
			res.send({"code": 400, "failed": "error occurred"});
		} else {
			if (results.length > 0){
				res.send({"code": 200, "success": "login success"});
			} else {
				res.send({"code": 300, "failed": "No account"})
			}
		}
	}
);
});

app.get('/', function(req,res){
	res.json({'message':'Welcome to madcamp2 backend server!'});
});

app.listen(80, "0.0.0.0", function(){
	console.log("Express server has started on port 80");
});
