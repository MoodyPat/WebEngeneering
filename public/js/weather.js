function getWeatherData( city ) {
	const key='f5bc621dcd6e89604c6fa68b510f553c';
	fetch('https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=' + city + '&appid=' + key)
	.then(function(resp) { return resp.json() }) // Convert data to json
	.then(function(data) {
		drawWeather(data);
		console.log(data);
	})
	.catch(function() {
		// catch any errors
	});
}

window.onload = function() {
	console.log('onload');
	getWeatherData( 'Rahden' );
}