function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop().split(';').shift();
	}
	return '-';
}

function setUser() {
	var userdata = getCookie('user');
	// %2C = ','
	var username = userdata.split('%2C')[0];
	document.getElementById("User").innerHTML = 'Current user: ' + username;
}

function checkForSuperuser() {
	var user = getCookie('user');
	var isSuperuser = user.split('%2C')[1];
	if (isSuperuser == '0' || user == '-')
	{
		//alert that the user and redirect to login page
		alert('You need to be a Superuser to see this page!');
		hostname = window.location.host;
		window.location.href = 'http://' +hostname + '/login';
	}
}

function checkForUser() {
	var user = getCookie('user');
	if (user == '-')
	{
		//alert that the user and redirect to login page
		alert('You need to be logged in to see this page!');
		hostname = window.location.host;
		window.location.href = 'http://' +hostname + '/login';
	}
}

function register() {
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var cb_superuser = document.getElementById('superuser');
	var superuser;
	if (cb_superuser.checked)
	{
		superuser = 1;
	}
	else
	{
		superuser = 0;
	}
	var password_confirm = document.getElementById('password_confirm').value;
	var regexp = new RegExp('^[(a-z)|(A-Z)|(0-9)]+$');
	if (password != password_confirm)
	{
		alert('The passwords dont match!');
	}
	else if (password.length < 8)
	{
		alert('The password has to be at least 8 characters!');
	}
	else if (!regexp.test(password))
	{
		alert('The password can only contain letters or numbers!');
	}
	else if (!regexp.test(username))
	{
		alert('The username can only contain letters or numbers!');
	}
	else
	{
		//I know MD5 is not the best encryption, but it works for this app.
		var passhash = CryptoJS.MD5(password).toString();

		var hostname = window.location.host;
		window.location.href = 'http://' + hostname + '/register' + '?username=' + username + '&passhash=' + passhash + '&superuser=' + superuser;
	}
}

function login() {
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var passhash = CryptoJS.MD5(password).toString();
	
	var hostname = window.location.host;
	window.location.href = 'http://' + hostname + '/login' + '?username=' + username + '&passhash=' + passhash;
	}

function LoginLogout() {
	var user = getCookie('user');
	var login_elmnt = document.getElementById('login');
	var logout_elmnt = document.getElementById('logout');
	if (user == '-')
	{
		login_elmnt.style.display = 'block';
		logout_elmnt.style.display = 'none';
	}
	else
	{
		login_elmnt.style.display = 'none';
		logout_elmnt.style.display = 'block';
	}
}

function setCity() {
	loc = window.location.href.split('&city=')[0];
	city = document.getElementById('city').value;
	window.location.href = loc + '?city=' + city.charAt(0).toUpperCase() + city.slice(1);
}

function checkSuccess() {
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("HEAD", document.URL ,true);
	xmlhttp.onreadystatechange=function() 
	{
		if (xmlhttp.readyState==4) 
		{
			success = xmlhttp.getResponseHeader('Server-Success');
			var success_elmnt = document.getElementById('success');
			if (success == null || success == 'true' || success == 'NA')
			{
				success_elmnt.style.display = 'none';
			}
			else
			{
				success_elmnt.style.display = 'block';
			}
		}
}
xmlhttp.send();
}

function checkCity() {
	
	url = new URL(window.location.href);
	city = url.searchParams.get('city');
	if (city != null)
	{
		document.getElementById('city_current').style.display = 'block';
		document.getElementById('city_cur_text').innerHTML = 'Current city: ' + city;
	}
}