
/*

async function getWeatherCurrent( city ) {
	const key='f5bc621dcd6e89604c6fa68b510f553c';
	const w_url = 'https://api.openweathermap.org/data/2.5/weather?&units=metric&q=' + city + '&appid=' + key;
	console.log('Weather from URL: ', w_url)
	let data = await fetch(w_url)
		.then(function(resp) { return resp.json() }) // Convert data to json
		.then(function(data) {
			return data;
		})
		.catch(function() {
			// catch any errors
			console.log('Data-Error in getWeatherForecast');
		});
	return data;
}

async function getWeatherForecast( city ) {
	const key='f5bc621dcd6e89604c6fa68b510f553c';
	const w_url = 'https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=' + city + '&appid=' + key;
	console.log('Weather from URL: ', w_url)
	let data = await fetch(w_url)
		.then(function(resp) { return resp.json() }) // Convert data to json
		.then(function(data) {
			return data;
		})
		.catch(function() {
			// catch any errors
			console.log('Data-Error in getWeatherForecast');
		});
	return data;
}
)
*/