var mysql = require('mysql')
var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//var router = express.Router();

app.get('/api', function(req,res) {
	res.json({message: 'Welcome to madcamp2_backend'});
	console.log("request accepted");
});



//app.use('api', router);
app.listen(80, "0.0.0.0", function(){
	console.log("Express server has started on port 5000");
});
