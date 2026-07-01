import OpenAI from "openai";

import { 
    getHourlyForecast,
    getDailyForecast,
    isNight,
    getAirQuality,
    getUV,
    formatTime
} from "../utils/helpers.js";


const client = new OpenAI();

export async function getMatchedCitiesController(req, res) {
    const query = req.query.query;

    const matchedCities = await getMatchedCities(query);

    res.json({
        cities: matchedCities
    });
}

export async function getWeatherController(req, res) {
    const placeId = req.query.place_id;
    const city = req.query.city;

    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await response.json();

    const lat = data.result.geometry.location.lat;
    const lon = data.result.geometry.location.lng;

    const weatherData = await getWeatherData(city,lat,lon);
    res.json(weatherData);
    
}

async function getMatchedCities(query) {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await response.json();

    return data.predictions
        .map(city => ({"city": city.terms[0].value,"country": city.terms[city.terms.length - 1].value,
            "place_id": city.place_id}));
}

async function getWeatherData(city,lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const rawWeatherData = await response.json();

    return await getFilteredWeatherData(city,rawWeatherData);
}


async function getFilteredWeatherData(city,rawData) {
    return {
        "city": city,
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
            "sunset": formatTime(rawData.current.sunset,rawData.timezone_offset),
            "is_night": isNight(rawData)
        },
        "hourly": getHourlyForecast(rawData),
        "daily": getDailyForecast(rawData)
    }
}