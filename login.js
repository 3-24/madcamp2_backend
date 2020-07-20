var mysql = require('mysql')
var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var app = express();
var google_auth = require('./google_auth');
var mime = require('mime');
var fs = require('fs');

var mysql = require('mysql');
var multer = require('multer');
var upload = multer({dest: 'uploads'});	

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

app.use('/image', express.static('uploads'));

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
					{"email":email,"password":password, "nickname":"Crescent Moon", "profile_photo":"default_profile_colored.png", "intro": "Hi! I shaped like a fingernail!"}, function(_error, _results, _fields){
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


app.post('/profile/get', function(req,res){
	var email = req.body.email;
	connection.query('SELECT * FROM accounts WHERE email=?', [email], function(error, results, fields){
		if (error || results.length == 0){
			console.log(error);
			res.send({"code":400});
		} else {
			var result = results[0];
			var nickname = result.nickname;
			var profile_photo = result.profile_photo;
			console.log(profile_photo);
			var intro = result.intro;
			res.send({"code":200, "email":email, "nickname": nickname, "profile_photo": profile_photo, "intro":intro})
		}
	});
});

app.post('/profile/set', upload.single('photo'), function(req,res)){
	
}


app.post('/mainSubmit', upload.single('photo'), function(req,res){
	console.log(req.file);
});


app.get('/', function(req,res){
	res.json({'message':'Welcome to madcamp2 backend server!'});
});

app.listen(80, "0.0.0.0", function(){
	console.log("Express server has started on port 80");
});
