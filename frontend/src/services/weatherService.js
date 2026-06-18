export async function getLocation(city) {
  const GEOCODING_API_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10`

  const response = await fetch(GEOCODING_API_URL)
  const data = await response.json()

  if (data.results && data.results.length > 0) {
    const cities = []
    for (let i = 0; i < data.results.length; i++) {
      cities.push({
        id: data.results[i].id,
        name: data.results[i].name,
        country: data.results[i].country,
        admin1: data.results[i].admin1,
        admin2: data.results[i].admin2,
        latitude: data.results[i].latitude,
        longitude: data.results[i].longitude,
      })
    }
    return cities
  }
  return [] // If city not found
}

export async function getWeather(latitude, longitude) {
  const WEATHER_API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,precipitation,weather_code&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7`

  const response = await fetch(WEATHER_API_URL)
  const data = await response.json()

  return {
    current: {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
    },
    forecast: data.daily.time.map((date, index) => ({
      date: new Date(date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
      }),
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      precipitation: data.daily.precipitation_sum[index],
      weatherCode: data.daily.weather_code[index],
    })),
  }
}
