require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const client = new OpenAI();

const app = express();
app.use(cors());

let placeId;
let cityName;

app.get('/get-matched-cities', async (req,res) => {
    const query = req.query.query;

    const matchedCities = await getMatchedCities(query);

    res.json({
        cities: matchedCities
    });
});

app.get('/get-weather-data', async (req,res) => {
    placeId = req.query.place_id;
    cityName = req.query.city;

    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await response.json();

    const lat = data.result.geometry.location.lat;
    const lon = data.result.geometry.location.lng;

    const weatherData = await getWeatherData(lat,lon);
    res.json(weatherData);
});


async function getMatchedCities(query) {
    console.log("Google API key exists: " + !!process.env.GOOGLE_API_KEY);
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await response.json();

    
    return data.predictions
        .map(city => ({"city": city.terms[0].value,"country": city.terms[city.terms.length - 1].value,"place_id": city.place_id}));
}

async function getWeatherData(lat,lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    console.log("Raw data keys: \n",Object.keys(data));
    console.log("First daily object: ", data.daily[0]);
    console.log(formatTime(data.hourly[0].dt, data.timezone_offset));

    return await getFilteredWeatherData(data);
}

async function getFilteredWeatherData(rawData) {
    return {
        "city": cityName,
        "current": {
            "temp": Math.round(rawData.current.temp),
            "day_temp": Math.round(rawData.daily[0].temp.day),
            "night_temp": Math.round(rawData.daily[0].temp.night),
            "condition": rawData.current.weather[0].main,
            "day_condition": rawData.daily[0].weather[0].main,
            "humidity": rawData.current.humidity,
            "air_quality": await getAirQuality(rawData.lat,rawData.lon),
            "uv": getUV(rawData.current.uvi),
            "sunrise": formatTime(rawData.current.sunrise,rawData.timezone_offset),
            "sunset": formatTime(rawData.current.sunset,rawData.timezone_offset)
        },
        "hourly": getHourlyForecast(rawData),
        "daily": getDailyForecast(rawData)
    }
}

function getHourlyForecast(rawData) {
    const HOURS_TO_FETCH = 7;
    const rawHourlyData = rawData.hourly.slice(0,HOURS_TO_FETCH);

    const hourlyForecast = [];

    for (let i = 0;i < rawHourlyData.length;i++) {
        hourlyForecast.push({
            "time": i === 0 ? "Now" : formatTime(rawHourlyData[i].dt, rawData.timezone_offset),
            "temp": Math.round(rawHourlyData[i].temp),
            "condition": rawHourlyData[i].weather[0].main
        });
    }

    return hourlyForecast;
}

function getDailyForecast(rawData) {
    const DAYS_TO_FETCH = 5;
    const rawDailyData = rawData.daily.slice(0,DAYS_TO_FETCH);

    const dailyForecast = [];

    for (let i = 0;i < rawDailyData.length;i++) {
        dailyForecast.push({
            "week_day": i === 0 ? "Today" : getWeekday(rawDailyData[i].dt,rawData.timezone_offset),
            "day_temp": Math.round(rawDailyData[i].temp.day),
            "night_temp": Math.round(rawDailyData[i].temp.night),
            "condition": rawDailyData[i].weather[0].main
        });
    }

    return dailyForecast;
}

function getWeekday(timestamp, timezoneOffset) {
    const localDate = new Date((timestamp + timezoneOffset) * 1000);

    const weekday = localDate.toLocaleDateString("en-US", {
        weekday: "short",
    });

    return weekday;
}

async function getAirQuality(lat,lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    const data = await response.json();
    const aqi = data.list[0].main.aqi;

    if (aqi <= 2) return "Good";
    if (aqi === 3) return "Medium";
    return "Bad";
}

function getUV(uvi) {
    if (uvi <= 2) return "Low";
    if (uvi <= 5) return "Moderate";
    if (uvi <= 7) return "High";
    if (uvi <= 10) return "Very High";
    return "Extreme";
}

function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}



app.listen(3000, () => {
    console.log('Server running on port 3000');
});