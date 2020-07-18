var mysql = require('mysql')
var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var app = express();
var google_auth = require('./google_auth');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


app.post('/google_signin', function(req,res) {
	console.log(req.body.idToken);
	google_auth(req.body);
});



//app.use('api', router);
app.listen(80, "0.0.0.0", function(){
	console.log("Express server has started on port 80");
});
