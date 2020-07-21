var mysql = require('mysql2/promise')
var express = require('express')
var bodyParser = require('body-parser')
var app = express();
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

var connection = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'root',
	password: 'MyNewPass',
	database: 'nodelogin'
});

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
	connection.query("UPDATE accounts SET nickname=?, profile_photo=?, intro=? WHERE email=?",
		[nickname, profile_photo, intro, email],
		function(error, results, fields){
			if (error){
				console.log(error);
				res.send({"code":400, "message":"Profile updated failed"});
			} else {res.send({"code":200, "message":"Profile updated successfully"})}
		});
});

app.post('/image_upload', upload.single('photo'), function(req,res){
	res.send({"code":200, "name":req.file.filename});
})

app.post('/friend/add', function(req,res){
	var me = req.body.email;
	var target = req.body.targetEmail;
	connection.query('SELECT * FROM friends WHERE me=? AND target=?',[me, target],
		function(error, results, fields){
			if (error || results.length > 0){
				res.send({"code":400, "message": "Some error ocurred1"});
			} else {
				connection.query('INSERT INTO friends SET ?',
				{"me":me, "target":target},
				function(_error, _results, _fields){
					if (_error){
						res.send({"code":400, "message": "Some error ocurred2"});
					} else {
						res.send({"code":200, "message": "Friend added successfully"});
					}
				}
				)
			}
		}
	);
});

app.post('/friend/list', function(req,res){
	var me = req.body.email;
	connection.query(`SELECT * FROM friends WHERE me=?`, me,
		function(error, results, fields){
			if (error){
				console.log(error);
				res.send({"code":400, "message":"Some error occurred"})
			} else {
				let array = [];
				results.forEach(
					(row)=>{array.push(row.target);}
				)
				res.send({"code":200, "friends":array})
			}
		}
	)
});

app.post('/friend/remove', function(req,res){
	var me = req.body.email;
	var target = req.body.targetEmail;
	connection.query(`DELETE FROM friends WHERE me=? AND target=?`,[me,target],
		function(error, results, fields){
			if (error){
				console.log(error);
				res.send({"code":400, "message":"fail"});
			} else {
				res.send({"code":200, "message":"success"});
			}
		}
	);
});

app.post('/post/add', function(req,res){
	var email = req.body.email;
	var title = req.body.title;
	var content = req.body.content;
	var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
	var photo1 = req.body.photo1;
	var photo2 = null;
	var photo3 = null;
	connection.query("INSERT INTO posts (email, title, content, date, photo1, photo2, photo3) VALUES (?,?,?,?,?,?,?)",
		[email, title, content, date, photo1, photo2, photo3],
		function(error, results, fields){
			if (error){
				console.log(error);
				res.send({"code":400, "message":"Post create failed"});
			} else {res.send({"code":200, "message": "Post created successfully"})}
		});
});


app.post('/myfeed', function(req,res){
	var me = req.body.email;
	connection.query(`SELECT * FROM posts WHERE email=?`,[me],
		function(error, results, fields){
			if(error){
				console.log(error);
				res.send({"code":400, "message":"fail"});
			} else {
				let array = [];
				results.forEach((row)=>array.push({
					email: row.email,
					title: row.title,
					content: row.content,
					date: row.date,
					photo1: row.photo1,
					photo2: row.photo2,
					photo3: row.photo3
				})
				);
				res.send({"code":200, feed:array});
			}
		}
	);
});

app.post('/feed', async (req,res)=>{
	const util = require('util');
	const query = util.promisify(connection.query).bind(connection);
	try{
		const me = req.body.email;
		var rows = await query(`SELECT * FROM friends WHERE me=?`, me);
		let posts = [];
		for (const row of rows){
			const email = row.target;
			var rows2 = await query(`SELECT * FROM posts WHERE email=?`,email);
			for (const row2 of rows2){
				posts.push({email: row2.email, title: row2.title,
					content: row2.content, date: row2.date,
					photo1: row2.photo1, photo2:row2.photo2,
					photo3: row2.photo3
				})
				
			}
		}
		res.send({"code":200, "feed":posts});
	} catch (error){
		console.log('error');
		res.send({"code":400})
	}
});

app.get('/', function(req,res){
	res.json({'message':'Welcome to madcamp2 backend server!'});
});

app.listen(80, "0.0.0.0", function(){
	console.log("Express server has started on port 80");
});
