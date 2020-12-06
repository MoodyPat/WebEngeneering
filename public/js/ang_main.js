//------------------------------------------------------------------------------
// Create the angularJS app
//------------------------------------------------------------------------------
var app = angular.module('Main', []);

//------------------------------------------------------------------------------
// Create a service to get weather forecast data for a given city
//------------------------------------------------------------------------------
app.service('serverDataForecast',['$http','$location',function($http,$location){
	// get url parameter city
	var city = $location.absUrl().split('city=')[1];
	// set api key for the openweathermap api
	const key='f5bc621dcd6e89604c6fa68b510f553c';
	// set the url for weather forecast
	const w_url = 'https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=' + city + '&appid=' + key;
	console.log('Weather from URL: ', w_url)
	// call the url and return the data if no error occurs
    this.getData = $http.get(w_url).then(function(resp){
        return resp.data;
    },function(err){
        console.log("Error in service while fetching data");
    })
}]);

//------------------------------------------------------------------------------
// Create a controller to work with the data from the weather forecast 
//------------------------------------------------------------------------------
app.controller('WeatherForecast',['$scope','serverDataForecast', async function($scope,serverDataForecast)
{
	// call the Forecast service and get weather data
	serverDataForecast.getData
		.then(function(data) {
			$scope.data = data;
			$scope.list = [];
			// always save the last date from forecase data (here: default "")
			var old_date_str = "";
			let day = "";
			// get coordinates for current city
			let coords = $scope.data.city.coord;
			// show the map with given coordinates
			setMap(coords);
			
			// loop through the forecast data
			for (i = 0; i < $scope.data['list'].length; i++)
			{
				list = [];
				// get the date and give the correct format (dd.mm)
				var date = new Date($scope.data['list'][i]['dt']*1000)
				var date_str = date.getDate() + '.' + date.getMonth() + '.';
				
				// get the current hour from the date
				var hour_str = pad(date.getHours(),2);
				// add the hour, max/min temperatur, windspeed, humidity and link to the weather icon to a list
				list.push(hour_str);
				list.push($scope.data['list'][i].main.temp_max);
				list.push($scope.data['list'][i].main.temp_min);
				list.push($scope.data['list'][i].weather[0].icon);
				list.push($scope.data['list'][i].wind.speed);
				list.push($scope.data['list'][i].main.humidity);
				
				// check if the date matches the last date
				if (date_str != old_date_str)
				{
					// if dates dont match, check if the old_date is the default ("")
					if (old_date_str != "")
					{
						// if old_date not default add the Day-Object to the scope.list variable
						$scope.list.push(day);
					}
					//create a new Day-Object and add the list to the Day-Object
					day = new Day(date_str);
					day.addHour(list);
					
					// set the old date as the current date
					old_date_str = date_str;
					
				}
				else
				{
					// if dates  match add the list to the Day-Object
					day.addHour(list);
				}
			}
			// add the last day to the scope.list variable
			$scope.list.push(day);
			console.log('List: ',$scope.list);
		})
}])

function setMap( coord ) {
	// convert the latitude and longitude to float variables 
	var mapLat =  parseFloat(coord.lat);
	var mapLng =  parseFloat(coord.lon);
var mapOptions = {
	// set the zoom for the map
    zoom: 16,
	// center the map to given coordinates
    center: {lat: mapLat, lng: mapLng},
}
// add the map to the given html element "map"
var map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

//------------------------------------------------------------------------------
// Day-Object
//------------------------------------------------------------------------------
function Day(day) {
	// set the current day
	this.day = day;
	// declare the 8 possible hours for the forecast
	this.hour1;
	this.hour2;
	this.hour3;
	this.hour4;
	this.hour5;
	this.hour6;
	this.hour7;
	this.hour8;
	
	//------------------------------------------------------------------------------
	// adds hour info to the first variable from hour1 - hour8,
	// which is not yet initialized with a value
	
	// I know this is not the best practise, but a list with all hour infos just didnt work in the html file
	//------------------------------------------------------------------------------
	this.addHour = function(elmnt) {
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

//------------------------------------------------------------------------------
// add leading zeros and return a string with given size
// ex. pad(12,4) = '0012'
//------------------------------------------------------------------------------
function pad(num, size) {
    var s = "0000000000000" + num;
    return s.substr(s.length-size);
}