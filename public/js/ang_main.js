var app = angular.module('Main', []);

app.service('serverDataForecast',['$http','$location',function($http,$location){
	var city = $location.absUrl().split('city=')[1];   
	const key='f5bc621dcd6e89604c6fa68b510f553c';
	const w_url = 'https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=' + city + '&appid=' + key;
	console.log('Weather from URL: ', w_url)
    this.getData = $http.get(w_url).then(function(resp){
        return resp.data;
    },function(err){
        console.log("Error in service while fetching data");
    })
}]);

app.service('serverDataCurrent',['$http','$location',function($http,$location){
	var city = $location.absUrl().split('city=')[1];   
	const key='f5bc621dcd6e89604c6fa68b510f553c';
	const w_url = 'https://api.openweathermap.org/data/2.5/weather?&units=metric&q=' + city + '&appid=' + key;
	console.log('Weather from URL: ', w_url)
    this.getData = $http.get(w_url).then(function(resp){
        return resp.data;
    },function(err){
        console.log("Error in service while fetching data");
    })
}]);

app.controller('WeatherForecast',['$scope','serverDataForecast', async function($scope,serverDataForecast)
{
	
	serverDataForecast.getData
		.then(function(data) {
			$scope.data = data;
			$scope.list = [];
			var old_date_str = "";
			let day = "";
			let coords = $scope.data.city.coord;
			setMap(coords);
			
			for (i = 0; i < $scope.data['list'].length; i++)
			{
				list = [];
				var date = new Date($scope.data['list'][i]['dt']*1000)
				var date_str = date.getDate() + '.' + date.getMonth() + '.';
				
				var hour_str = pad(date.getHours(),2);
				list.push(hour_str);
				list.push($scope.data['list'][i].main.temp_max);
				list.push($scope.data['list'][i].main.temp_min);
				list.push($scope.data['list'][i].weather[0].icon);
				list.push($scope.data['list'][i].wind.speed);
				list.push($scope.data['list'][i].main.humidity);
				
				if (date_str != old_date_str)
				{
					if (old_date_str != "")
					{
						$scope.list.push(day);
					}
					day = new Day(date_str);
					old_date_str = date_str;
					day.addToList(list);
				}
				else
				{
					day.addToList(list);
				}
			}
			$scope.list.push(day);
			console.log('List: ',$scope.list);
		})
}])

app.controller('WeatherCurrent',['$scope','$location','serverDataCurrent', async function($scope,$location,serverDataCurrent)
{
	
	serverDataCurrent.getData
		.then(function(data) {
			$scope.data = data;
			$scope.list = [];
			var old_date_str = "";
			let day = "";
			
			for (i = 0; i < $scope.data['list'].length; i++)
			{
				list = [];
				var date = new Date($scope.data['list'][i]['dt']*1000)
				var date_str = date.getDate() + '.' + date.getMonth() + '.';
				
				var hour_str = pad(date.getHours(),2);
				list.push(hour_str);
				list.push($scope.data['list'][i].main.temp_max);
				list.push($scope.data['list'][i].main.temp_min);
				list.push($scope.data['list'][i].weather[0].icon);
				list.push($scope.data['list'][i].wind.speed);
				
				if (date_str != old_date_str)
				{
					if (old_date_str != "")
					{
						$scope.list.push(day);
					}
					day = new Day(date_str);
					old_date_str = date_str;
					day.addToList(list);
				}
				else
				{
					day.addToList(list);
				}
			}
			$scope.list.push(day);
		})
}])

app.controller('Navbar',['$scope','$sce', function($scope,$sce)
{
	$scope.text = $sce.trustAsHtml('<nav class="navbar navbar-expand-md navbar-dark bg-dark" style="margin-bottom:10px"> \
		<a class="navbar-brand" href="/home">DHBW WE Project</a> \
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbars01" aria-controls="navbars01" aria-expanded="false" aria-label="Toggle navigation">  \
			<span class="navbar-toggler-icon"></span> \
		</button> \
		<div class="collapse navbar-collapse" id="navbars01"> \
			<ul class="navbar-nav mr-auto"> \
				<li class="nav-item"> \
					<a class="nav-link" href="/home">Home</a> \
				</li> \
				<li class="nav-item"> \
					<a class="nav-link" href="/weather?page=forecast">Weather</a> \
				</li> \
				<li class="nav-item dropdown"> \
					<a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Weather</a> \
					<div class="dropdown-menu" aria-labelledby="dropdown01"> \
						<a class="dropdown-item" href="/weather?page=current">Current weather</a> \
						<a class="dropdown-item" href="/weather?page=forecast">5-day forecast</a> \
					</div> \
				</li> \
			</ul> \
			<ul class="navbar-nav"> \
				<li class="nav-item"> \
					<a id="User" class="nav-link" style="color:white" href="#">Current user: - </a> \
				</li> \
				<li class="nav-item"> \
					<a id="login_logout" class="nav-link" href="/login">Login</a> \
				</li> \
				<li class="nav-item"> \
					<a class="nav-link" href="/register">Register</a> \
				</li> \
			</ul> \
		</div> \
    </nav>');
}])

app.controller('Footer',['$scope','$sce', function($scope,$sce)
{
	$scope.text = $sce.trustAsHtml('<footer class="footer fixed-bottom bg-dark" style="padding:10px"> \
      <div class="container"> \
        <span class="text-muted">@2020 Copyright: Patrick Wickenkamp</span> \
      </div> \
    </footer>');
}])

function setMap( coord ) {
	console.log(coord.lat,coord.lon);
	var mapLat =  parseFloat(coord.lat);
	var mapLng =  parseFloat(coord.lon);
	console.log(mapLat,mapLng);
var mapOptions = {
//
    zoom: 16,
    center: {lat: mapLat, lng: mapLng},
    //mapTypeId: google.maps.MapTypeId.HYBRID
}
// Below is now the instantiation of our map, as we give the Div container and the Options object
// as paramter...
var map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

function Day(day) {
	this.day = day;
	this.hour1;
	this.hour2;
	this.hour3;
	this.hour4;
	this.hour5;
	this.hour6;
	this.hour7;
	this.hour8;
	
	this.addToList = function(elmnt) {
		if (!this.hour1) {this.hour1 = elmnt;}
		else if (!this.hour2) {this.hour2 = elmnt;}
		else if (!this.hour3) {this.hour3 = elmnt;}
		else if (!this.hour4) {this.hour4 = elmnt;}
		else if (!this.hour5) {this.hour5 = elmnt;}
		else if (!this.hour6) {this.hour6 = elmnt;}
		else if (!this.hour7) {this.hour7 = elmnt;}
		else if (!this.hour8) {this.hour8 = elmnt;}
	}
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}