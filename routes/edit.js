var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//POST to handle edits
router.post('/edit',function(req,res){
	var rawSVG = req.body.svg;
	console.log(rawSVG);
	//package into a mongoDB query
});

module.exports = function(req,res){
	var rawSVG = req.body.svg;
	console.log(rawSVG);
	//package into a mongoDB query
};