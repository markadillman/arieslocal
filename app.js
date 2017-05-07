var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var styles = require('stylus');
var SVG = require('svg.js');
var xmlParse = require('xml2js').parseString;
const util = require('util');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
//database url
var dbUrl = 'mongodb://172.31.34.164:27017/tiles'

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

//make process trackable
process.title = "ariesApp";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

//HELPER FUNCTION FOR SVG VALIDITY
function isValidSvg(svgString){
	//parse and see if there are any errors
	var xmlObject = xmlParse(svgString,function(err,result){
			//this saves from ANY malformed XML, and therefore SVG
			if (err) {
				return false;
			}
			else {
				//if there are an improper number of groups or nested tags incorrect
				if (result.svg.g.length != 2) {
					return false;
				}
				//if those groups have id's other than the valid ones (inserting non-functional groups)
				if (!(result.svg.g[0].$.id === "drawingGroup" && result.svg.g[1].$.id === "platformsGroup")){
					return false;
				}
			}
			//if here, SVG XML is valid
			return true;
	});
	return xmlObject;
}

//handle submitted tile edit requests
app.post('/edit',function(req,res){
	var xcoord = parseInt(req.body.xcoord);
	var ycoord = parseInt(req.body.ycoord);
	var pw = req.body.pw;
	var rawSVG = req.body.svg;
	//if tile coordinates are not a number or out of bounds, reject
	if (!(Number.isInteger(xcoord)&&Number.isInteger(ycoord))){
		res.status(511).send("Tile coordinates invalid or out of bounds.");
		return;
	}
	//if SVG XML is invalid or contains non-functional groups (from perspective of game engine), reject
	if (!isValidSvg(rawSVG)){
		res.status(511).send("Invalid SVG string.");
		return;
	}
	//parse out the groups. precondition verifies this is already well-formed
	//clip out everything prior to first closing xml bracket
	rawSVG = rawSVG.substring(rawSVG.indexOf('>')+1)
	//clip off the closing </svg> by removing last 6 characters from string
	rawSVG = rawSVG.slice(0,(rawSVG.length-6));
	console.log(rawSVG);
	//construct query to send to db
	var insertDoc = {};
	insertDoc["xcoord"] = xcoord;
	insertDoc["ycoord"] = ycoord;
	insertDoc["pw"] = pw;
	insertDoc["svg"] = svg;
	MongoClient.connect(dbUrl,function(err,db){
		//test for errors, pop out if there are errors present
		assert.equal(null,err);
		console.log("connected succesfully to server");
		insertDocument(db,insertDoc,function(){
			db.close();
		});
		return;
});

var insertDocument = function(db,insertDoc,callback){
	var collection = db.collection('tiles');
	//insert the document
	collection.insertDoc(doc,function(err,result){
		if (err === null){
			console.log("DB insert error.");
		}
		else {
			console.log("Inserted tile into database");
		}
	});
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
