var express = require('express');
var bodyParser = require('body-parser');
var xmlParse = require('xml2js').parseString;
var router = express.Router();

//POST to handle edits
router.post('/edit',function(req,res){
	var rawSVG = req.body.svg;
	console.log(rawSVG);
	//package into a mongoDB query
});

//regex to test validity of svg objects in submit
function isValidSvg(svgString){
	//parse and see if there are any errors
	var xmlObject = xmlParse(svgString,function(err,result){
			console.log(util.inspect(result,false,null));
			console.dir(err);
			if (err) {
				console.log("returning false");
				return false;
			}
			else return xmlObject;
	});
	//if invalid xml return false
	if (!xmlObject){
		return false;
	}
	//if invalid group headers return false
	//else return true
	else return xmlObject;
}

//the correct password is presumed to have been entered
//for 
module.exports = function(req,res){
	
	var xcoord = req.body.xcoord;
	var ycoord = req.body.ycoord;
	var rawSVG = req.body.svg;
	if (!(Number.isInteger(xcoord)&&Number.isInteger(ycoord))){
		res.status(511).send({error: "Tile coordinates invalid or out of bounds."});
	}
	if (!isValidSvg(rawSVG)){
		res.status(511).send({error: "Invalid SVG string."});
	}
	console.log(req.body);
	//package is well-formed
	res.sendStatus(200);
	//TO DO: check previous password or one-time token (avoid edit spoofing and fabrication)

	//package into a mongoDB query
};