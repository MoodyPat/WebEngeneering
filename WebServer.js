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

//------------------------------------------------------------------------------
// localhost:6001/
// The request will be redirected to the home page
//------------------------------------------------------------------------------
app.get('/', function(req,res){
	return res.redirect('/home');
});

//------------------------------------------------------------------------------
// localhost:6001/home
// The Main Page of the Website
//------------------------------------------------------------------------------
app.get('/home', function(req, res){
	// show the main page
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

//------------------------------------------------------------------------------
// localhost:6001/js2
// Shows the 2nd Javascript exercise
//------------------------------------------------------------------------------
app.get('/js2', function(req, res){
	// show the 2nd js exercise
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

//------------------------------------------------------------------------------
// localhost:6001/weather
// Shows the weather in a given city
//------------------------------------------------------------------------------
app.get('/weather', async function(req, res){
	// show the weather forecast
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

//------------------------------------------------------------------------------
// localhost:6001/register
// Shows the Register/SignUp form and creates the user if possible
//------------------------------------------------------------------------------
app.get('/register', async function(req, res){
	// get url parameter username, passhash and superuser
	var username = req.query.username;
	var passhash = req.query.passhash;
	var superuser = req.query.superuser;
	// check if username and passhash are given in the URL
	if (!checkUndefined(username) && !checkUndefined(passhash))
	{
		// if username and passhash are given, check if the username already exists
		var user_exists = await userExistsFB(username);
		if (!user_exists)
		{
			// if no user with that username exists, create the user in the database and redirect to the login page
			// also set response header 'Server-Success' to true
			 await createUserFB(username,passhash,superuser);
			 console.log('Redirecting to login');
			 res.set('Server-Success', 'true');
			 return res.redirect('/login');
		}
		else
		{
			// if a user already exists, set response header 'Server-Success' to false
			res.set('Server-Success', 'false');
		}
	}
	else
	{
		//if username and password are given set response header 'Server-Success' to NA (not available)
		res.set('Server-Success', 'NA');
	}
	// show the register form
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

//------------------------------------------------------------------------------
// localhost:6001/login
// Shows the Login/SignIn form and creates the user cookie if possible
//------------------------------------------------------------------------------
app.get('/login', async function(req, res){
	// get url parameters username and passhash
	var username = req.query.username;
	var passhash = req.query.passhash;
	// check if username and passhash are given in the URL
	if (!checkUndefined(username) && !checkUndefined(passhash))
	{
		// if both username and password are given, try to match against the database
		// get the user info from the database
		var user = await getUserFB(username,passhash);
		if (user == '-')
		{
			// if login credentials are incorrect, set response header 'Server-Success' to false
			res.set('Server-Success', 'false');
		}
		else
		{
			// if login credentials are correct, set response header 'Server-Success' to true
			// also set the user cookie for 1800 seconds (30 minutes) and redirect to the home page
			res.set('Server-Success', 'true');
			setUserCookie(res,user,1800);
			return res.redirect('/home');
		}
	}
	else
	{
		//if username and password are given set response header 'Server-Success' to NA (not available)
		res.set('Server-Success', 'NA');
	}
	// show the login form
	var docname = "/htm/login.htm";
	var options = {root: __dirname + '/public/'};
	
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

//------------------------------------------------------------------------------
// localhost:6001/loout
// Deletes the user cookie and redirects to the main page
//------------------------------------------------------------------------------
app.get('/logout', async function(req, res){
	deleteUserCookie(res);
	return res.redirect('/home')
});

//------------------------------------------------------------------------------
// Default route for the webserver
// Shows a 404 error message
//------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------
// Creates the user in the firebase database
//------------------------------------------------------------------------------
async function createUserFB( username, passhash, superuser ) {
	// Create the user in the firebase database with attributes (username, passhash, superuser)
	firebase.database().ref('users/' + username).set({
    username: username,
    passhash: passhash,
    superuser : superuser
  });
}

//------------------------------------------------------------------------------
// Gets the user from the firebase database
//------------------------------------------------------------------------------
async function getUserFB ( username, passhash) {
	// get user info from firebase
	user = await firebase.database().ref('/users/' + username).once('value').then((snapshot) => {
		var username_fb = (snapshot.val() && snapshot.val().username) || null;
		var passhash_fb = (snapshot.val() && snapshot.val().passhash) || null;
		var superuser_fb = (snapshot.val() && snapshot.val().superuser) || null;
		//check if the passhash given matches with the passhash in the DB
		if (passhash_fb != null && passhash_fb == passhash)
		{
			//if the hashes match return the username and superuser attributes
			console.log('User correct', username);
			return username_fb + ',' + superuser_fb;
		}
		else
		{
			// if the hashes dont match, simply return '-'
			console.log('User incorrect', username);
			return '-';
		}
	});
	//return the user info
	return user;
}

//------------------------------------------------------------------------------
// Check if user exists in the firebase database
//------------------------------------------------------------------------------
async function userExistsFB( username ) {
	// get user info from firebase
	exists = await firebase.database().ref('/users/' + username).once('value').then((snapshot) => {
		var username_fb = (snapshot.val() && snapshot.val().username) || null;
		// check if the user exists in the database
		if (username_fb != null)
		{
			//if user exists -> return true
			console.log('User (' , username , ') does exist!');
			return true;
		}
		else
		{
			//if user doesnt exist -> return false
			console.log('User (' , username , ') doesnt exist!');
			return false;
		}
	});
	return exists;
}

//------------------------------------------------------------------------------
// Set the user cookie
//------------------------------------------------------------------------------
function setUserCookie(res,user_id,seconds) {
	console.log('Set User Cookie with ID: ', user_id);
	//set the cookie with maxAge of given parameter seconds
	res.cookie('user', user_id, { maxAge: seconds*1000 });
}

//------------------------------------------------------------------------------
// Delete the user cookie
//------------------------------------------------------------------------------
function deleteUserCookie(res) {
	console.log('Delete User Cookie');
	//set/overwrite cookie with maxAge = 0ms (will delete itself immediately)
	res.cookie('user','', { maxAge: 0 })
}

//------------------------------------------------------------------------------
// Checks if a variable is undefined or null
//------------------------------------------------------------------------------
function checkUndefined(variable) {
	if (typeof variable !== 'undefined' && variable !== null)
	{
		return false;
	}
	return true;
}