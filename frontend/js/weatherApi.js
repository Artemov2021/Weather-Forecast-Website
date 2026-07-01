const API_URL =
window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://weather-forecast-website-production.up.railway.app";


export async function findCities(query) {
  const res = await fetch(`${API_URL}/get-matched-cities?query=${query}`);
  const data = await res.json();
  return data.cities;
}

export async function getWeatherData(data) {
  const res = await fetch(`${API_URL}/get-weather-data?place_id=${data.place_id}&city=${data.city}`);
  const weatherData = await res.json();
  return weatherData;
}