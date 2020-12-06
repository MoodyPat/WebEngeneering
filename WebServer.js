var express = require('express');        // critical module for building a Web Server App
// Here are some basic packages we need together with express
var bodyParser = require('body-parser'); // helper routines to parse data as JSON in request body
var request = require('request');        // http requests used for our proxy and cloudant outbound call
var basicAuth = require('express-basic-auth'); // Some basic HTTP Header Authorization
var url = require('url')
var fetch = require("node-fetch");
var cookieParser = require('cookie-parser');

//Initialize firebase app
var firebase = require('firebase/app');
	// Add the Firebase products that you want to use
	require('firebase/database');

	var firebaseConfig = {
		apiKey: "AIzaSyDsUviIh4LtvtLrcrd9pxGwYbVAYNLXNnI",
		authDomain: "webengennering.firebaseapp.com",
		databaseURL: "https://webengennering-default-rtdb.firebaseio.com",
		projectId: "webengennering",
		storageBucket: "webengennering.appspot.com",
		messagingSenderId: "724161132567",
		appId: "1:724161132567:web:150a454b95834bb2a78452",
		measurementId: "G-5RC6NB1GK8"
	  };
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	var database = firebase.database()  
//----------------------------------------------------------------------------
// create a new express based Web Server
// ---------------------------------------------------------------------------
var app = express();
// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');
// app.use('/static', express.static('/views/HTML'))
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// -----------------------------------------------------------------------------
// the WebServer now listens to http://localhost:6001 / http gets and posts
// -----------------------------------------------------------------------------

// ----------------------
// ----------------------

var server = app.listen(6001, function() {
	console.log('***********************************');
	console.log('listening:', 6001);
	console.log('***********************************');
});
   
app.get('/', function(req,res){
	return res.redirect('/home');
});

app.get('/home', function(req, res){
	var docname = "/htm/main.htm";
	var options = {root: __dirname + '/public/'}
	res.sendFile(docname, options, function (err) { // send this file
	   if (err) {
		 res.send(err);
	   } else {
		 console.log('Sent:', docname);
	   }
	});
});

app.get('/js2', function(req, res){
	var docname = "/htm/js_ex2.htm";
	var options = {root: __dirname + '/public/'}
	res.sendFile(docname, options, function (err) { // send this file
	   if (err) {
		 res.send(err);
	   } else {
		 console.log('Sent:', docname);
	   }
	});
});

app.get('/weather', async function(req, res){
	var city = req.query.city;
	var docname = "/htm/weather_forecast.htm";

	var options = {	root: __dirname + '/public/'}
	res.sendFile(docname, options, function (err) { // send this file
		if (err) {
			console.log('Error:', docname);
			res.send(err);
		}
		else {
			console.log('Sent:', docname);
		}
	});
});

app.get('/register', async function(req, res){
	var username = req.query.username;
	var passhash = req.query.passhash;
	var superuser = req.query.superuser;
	var ret_msg;
	if (!checkUndefined(username) && !checkUndefined(passhash))
	{
		//var user_exists = await userExists(username);
		var user_exists = await userExistsFB(username);
		if (!user_exists)
		{
			 //await createUser(username,passhash,superuser);
			 await createUserFB(username,passhash,superuser);
			 console.log('Redirecting to login');
			 res.set('Server-Success', 'true');
			 return res.redirect('/login');
		}
		else
		{
			res.set('Server-Success', 'false');
		}
	}
	else
	{
		res.set('Server-Success', 'NA');
	}
	var docname = "/htm/register.htm";
	var options = {root: __dirname + '/public/'}
	res.sendFile(docname, options, function (err) { // send this file
	   if (err) {
		 res.send(err);
	   } else {
		 console.log('Sent:', docname);
	   }
	});
});

app.get('/login', async function(req, res){
	var username = req.query.username;
	var passhash = req.query.passhash;
	var hdrs;
	if (!checkUndefined(username) && !checkUndefined(passhash))
	{
		console.log('Test: ', user)
		//var user = await getUserIfCorrect(username,passhash);
		var user = await getUserFB(username,passhash);
		if (user == '-')
		{
			res.set('Server-Success', 'false');
			//res.set('Access-Control-Expose-Headers', 'Login-Success')
		}
		else
		{
			res.set('Server-Success', 'true');
			setUserCookie(res,user,1800);
			return res.redirect('/home');
		}
	}
	else
	{
		res.set('Server-Success', 'NA');
	}
	var docname = "/htm/login.htm";
	var options = {root: __dirname + '/public/','headers':hdrs};
	
	res.sendFile(docname, options, function (err) { // send this file
	   if (err) {
		 res.send(err);
	   } else {
		 console.log('Sent:', docname);
	   }
	});
});

//------------------------------------------------------------------------------
// localhost:6001/proxy?url_to_be_proxied
// The incoming request will transfered using the request package
//------------------------------------------------------------------------------
app.all('/proxy', function(req, res){
    var decompose = req.originalUrl.split("?");
    var fullurl = decompose[1] + "?" + decompose[2];
    fullurl = fullurl.replace("url=","");
    console.log("Proxy Server reached", fullurl);
    var o = {uri: fullurl,method: req.method,json: true};
    request(o, function(e, r, b){
      if(e) {
          res.send({error: e, status: "Fehler", request: o, response: e});
      } else {
          res.send({error: e, status: r.statusCode, request: o, response: b});
      }
    });
});

app.get('/logout', async function(req, res){
	deleteUserCookie(res);
	return res.redirect('/home')
});


app.get('*', function(req,res){
    var docname = "/htm/error_msg.htm";
	var options = {root: __dirname + '/public/'}
	res.sendFile(docname, options, function (err) { // send this file
	   if (err) {
		 res.send(err);
	   } else {
		 console.log('Sent:', docname);
	   }
	});
   });


async function createUserFB( username, passhash, superuser ) {
	firebase.database().ref('users/' + username).set({
    username: username,
    passhash: passhash,
    superuser : superuser
  });
}

async function getUserFB ( username, passhash) {
	user = await firebase.database().ref('/users/' + username).once('value').then((snapshot) => {
		var username_fb = (snapshot.val() && snapshot.val().username) || null;
		var passhash_fb = (snapshot.val() && snapshot.val().passhash) || null;
		var superuser_fb = (snapshot.val() && snapshot.val().superuser) || null;
		if (passhash_fb != null && passhash_fb == passhash)
		{
			console.log('User correct', username);
			return username_fb + ',' + superuser_fb;
		}
		else
		{
			console.log('User incorrect', username);
			return '-';
		}
	});
	return user;
}

async function userExistsFB( username ) {
	exists = await firebase.database().ref('/users/' + username).once('value').then((snapshot) => {
		var username_fb = (snapshot.val() && snapshot.val().username) || null;
		if (username_fb != null)
		{
			console.log('User (' , username , ') does exist!');
			return true;
		}
		else
		{
			console.log('User (' , username , ') doesnt exist!');
			return false;
		}
	});
	return exists;
}

function setUserCookie(res,user_id,seconds) {
	console.log('Set User Cookie with ID: ', user_id);
	res.cookie('user', user_id, { maxAge: seconds*1000 });
}

function deleteUserCookie(res) {
	console.log('Delete User Cookie');
	res.cookie('user','', { maxAge: 0 })
}

function getUserCookie(req) {
	console.log('Check for User Cookie');
	console.log('Cookies: ',req.cookies);
	return req.cookies['user'];
}

function checkUndefined(variable) {
	if (typeof variable !== 'undefined' && variable !== null)
	{
		return false;
	}
	return true;
}