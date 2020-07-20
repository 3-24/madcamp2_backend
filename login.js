var mysql = require('mysql')
var express = require('express')
var bodyParser = require('body-parser')
var app = express();
var google_auth = require('./google_auth');
var path = require('path');
var mime = require('mime');
var fs = require('fs');

var mysql = require('mysql');
var multer = require('multer');
var storage = multer.diskStorage({
	destination: function (req, file, cb){
		cb(null, 'uploads')
	},
	filename: function (req, file, cb){
		var mimeType;

		switch (file.mimetype){
			case "image/jpeg":
				mimeType = "jpg";
				break;
			case "image/png":
				mimeType = "png";
				break;
			case "image/gif":
				mimeType = "gif";
				break;
			case "image/bmp":
				mimeType = "bmp";
				break;
			default:
				mimeType = "jpg";
		}
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, uniqueSuffix +'.'+ mimeType);
	}
});

var upload = multer({storage: storage});

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
					{"email":email,"password":password, "nickname":"Crescent Moon", "profile_photo":"default_profile_colored.png", "intro": "Hi! I shaped like a fingernail!"},
					function(_error, _results, _fields){
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

app.post('/profile/set', function(req,res){
	var email = req.body.email;
	var nickname = req.body.nickname;
	var profile_photo = req.body.profile_photo;
	var intro = req.body.intro;
	connection.query('UPDATE accounts SET nickname=? profile_photo=? intro=? WHERE email=?',
		[nickname, profile_photo, intro, email],
		function(error, results, fields){
			if (error){
				console.log(error);
				res.send({"code":400, "message":"Profile updated failed"});
			} else {res.send({"code":200, "message":"Profile updated successfully"})}
		});
});

app.post('/image_upload', upload.single('image'), function(req,res){
	res.send({"code":400, "name":req.file.filename});
})

app.post('/post/add', function(req,res){
	var email = req.email;
	var title = req.title;
	var content = req.content;
	var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
	var photo1 = req.photo1;
	var photo2 = req.photo2;
	var photo3 = req.photo3;
	connection.query("INSERT INTO posts (email, title, content, date, photo1, photo2, photo3) VALUES ?",
		[email, title, content, date, photo1, photo2, photo3],
		function(error, results, fields){
			if (error){
				console.log(error);
				res.send({"code":400, "message":"Post create failed"});
			} else {res.send({"code":200, "message": "Post created successfully"})}
		}
		)
});



app.get('/', function(req,res){
	res.json({'message':'Welcome to madcamp2 backend server!'});
});

app.listen(80, "0.0.0.0", function(){
	console.log("Express server has started on port 80");
});
