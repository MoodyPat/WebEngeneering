//------------------------------------------------------------------------------
// gets the user cookie
//------------------------------------------------------------------------------
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop().split(';').shift();
	}
	return '-';
}

//------------------------------------------------------------------------------
// Set the username to the "User" element in the navbar
//------------------------------------------------------------------------------
function setUser() {
	// get userdata
	var userdata = getCookie('user');
	// %2C = ','
	// split userdata and only user the username (index 0)
	var username = userdata.split('%2C')[0];
	// set username to the "User" element
	document.getElementById("User").innerHTML = 'Current user: ' + username;
}

//------------------------------------------------------------------------------
// Checks if the user is a superuser
//------------------------------------------------------------------------------
function checkForSuperuser() {
	// get userdata
	var user = getCookie('user');
	// split userdata and only user the superuser (index 1)
	var isSuperuser = user.split('%2C')[1];
	// the user is only a superuser if isSuperuser = 1
	if (isSuperuser == '0' || user == '-')
	{
		//alert that the user must be a superuser and redirect to login page
		alert('You need to be a Superuser to see this page!');
		hostname = window.location.host;
		window.location.href = 'http://' +hostname + '/login';
	}
}

//------------------------------------------------------------------------------
// Checks if a user is logged in
//------------------------------------------------------------------------------
function checkForUser() {
	// get userdata
	var user = getCookie('user');
	// if user is not logged in, user will be "-"
	if (user == '-')
	{
		//alert that the user must be logged in and redirect to login page
		alert('You need to be logged in to see this page!');
		hostname = window.location.host;
		window.location.href = 'http://' +hostname + '/login';
	}
}

//------------------------------------------------------------------------------
// Checks the given username and password and redirect with url parameters if everything is fine
// The registration with the database is done by the server
//------------------------------------------------------------------------------
function register() {
	// get username, password, and superuser checkbox values
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var password_confirm = document.getElementById('password_confirm').value;
	var cb_superuser = document.getElementById('superuser');
	var superuser;
	
	if (cb_superuser.checked)
	{
		// if checkbox superuser is checked -> superuser = 1
		superuser = 1;
	}
	else
	{
		// if checkbox superuser is not checked -> superuser = 0
		superuser = 0;
	}
	
	// Create a regualar expression that matches works with numbers or letters only
	var regexp = new RegExp('^[(a-z)|(A-Z)|(0-9)]+$');
	
	// Perform a couple of checks for the username and password
	
	// check if password matches the confirm password
	if (password != password_confirm)
	{
		alert('The passwords dont match!');
	}
	// check if password is at least 8 characters long
	else if (password.length < 8)
	{
		alert('The password has to be at least 8 characters!');
	}
	// check if password matches the given regular expression
	else if (!regexp.test(password))
	{
		alert('The password can only contain letters or numbers!');
	}
	// check if the username matches the given regular expressions
	else if (!regexp.test(username))
	{
		alert('The username can only contain letters or numbers!');
	}
	// if none of the checks match, the username and password are correctly given by the user
	else
	{
		// Hash the password with an MD5 hash
		// I know MD5 is not the best encryption, but it works for this app.
		var passhash = CryptoJS.MD5(password).toString();
		
		// redirect the the register page with parameters username, passhash and superuser
		var hostname = window.location.host;
		window.location.href = 'http://' + hostname + '/register' + '?username=' + username + '&passhash=' + passhash + '&superuser=' + superuser;
	}
}

//------------------------------------------------------------------------------
// Redirect to login url with parameters username and passhash
// The login with the database is done by the server
//------------------------------------------------------------------------------
function login() {
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var passhash = CryptoJS.MD5(password).toString();
	
	var hostname = window.location.host;
	window.location.href = 'http://' + hostname + '/login' + '?username=' + username + '&passhash=' + passhash;
	}

//------------------------------------------------------------------------------
// Set the visibility of Login and Logout Buttons depending if a user is logged in or not
//------------------------------------------------------------------------------
function LoginLogout() {
	// get user cookie
	var user = getCookie('user');
	// get all login or logout elements
	var login_elmnt = document.getElementById('login');
	var logout_elmnt = document.getElementById('logout');
	var login_elmnt_home = document.getElementById('home_login');
	var logout_elmnt_home = document.getElementById('home_logout');
	if (user == '-')
	{
		// if no user is logged in -> display all login elements and hide all logout elements
		login_elmnt.style.display = 'block';
		login_elmnt_home.style.display = 'block';
		logout_elmnt.style.display = 'none';
		logout_elmnt_home.style.display = 'none';
	}
	else
	{
		// if no user is logged in -> display all logout elements and hide all login elements
		login_elmnt.style.display = 'none';
		login_elmnt_home.style.display = 'none';
		logout_elmnt.style.display = 'block';
		logout_elmnt_home.style.display = 'block';
	}
}

//------------------------------------------------------------------------------
// set the url parameter city for current path
//------------------------------------------------------------------------------
function setCity() {
	loc = window.location.href.split('&city=')[0];
	city = document.getElementById('city').value;
	window.location.href = loc + '?city=' + city.charAt(0).toUpperCase() + city.slice(1);
}

//------------------------------------------------------------------------------
// Check if a registration or login has been successfull
//------------------------------------------------------------------------------
function checkSuccess() {
	// request the current page to get response headers
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("HEAD", document.URL ,true);
	xmlhttp.onreadystatechange=function() 
	{
		if (xmlhttp.readyState==4) 
		{
			// get the response header "Server-Success"
			success = xmlhttp.getResponseHeader('Server-Success');
			// get the element showing an error message 
			var success_elmnt = document.getElementById('success');
			if (success == null || success == 'true' || success == 'NA')
			{
				// if no header exists or success is true or not available, dont show the error message
				success_elmnt.style.display = 'none';
			}
			else
			{
				// otherwise show the error message
				success_elmnt.style.display = 'block';
			}
		}
}
xmlhttp.send();
}

//------------------------------------------------------------------------------
// Check if a city is given in the url and display the current city element
//------------------------------------------------------------------------------
function checkCity() {
	// check if a url parameter "city" exists
	url = new URL(window.location.href);
	city = url.searchParams.get('city');
	if (city != null)
	{
		// if url parameter "city" exists, show the element "city_current" and set the "city_cur_text" to the city given
		document.getElementById('city_current').style.display = 'block';
		document.getElementById('city_cur_text').innerHTML = 'Current city: ' + city;
	}
}