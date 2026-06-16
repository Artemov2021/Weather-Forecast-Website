require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const client = new OpenAI();

const app = express();

app.use(cors());

app.get('/get-matched-cities', async (req,res) => {
    const query = req.query.query;

    const matchedCities = await getMatchedCities(query);

    res.json({
        cities: matchedCities
    });
});

app.get('/get-weather-data', async (req,res) => {
    const placeId = req.query.place_id;
    const city = req.query.city;

    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await response.json();

    const lat = data.result.geometry.location.lat;
    const lng = data.result.geometry.location.lng;

    const weatherData = await getWeatherData(lat,lng,city);
    res.json(weatherData);
});

async function getWeatherData(lat,lng,cityName) {
    const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    const rawData = {
        current: data.current,
        hourly: data.hourly.slice(0, 20),
        daily: data.daily.slice(0, 5)
    };

    return await getFilteredData(rawData,cityName);
}

async function getFilteredData(data,city) {
    const prompt = `
    You are a professional helpful assistant. Convert the giving JSON into the following format. Response only in JSON. Dont reply 
    with quotes at the beginning. You can choose only between the following states: sunny, rainy, cloudy, night, snowy
    Humidity value represents percentage. Air quality can be only either low, medium or good. UV can be either low, medium or high
    For hourly forecast, provide the next 6 hours of data. Now is ${getCurrentDay()} ${getCurrentTime()}, therefore convert current time into local time and 
    beginn from the next full hour. For daily forecast, provide next 4 weekdays (excluding today), day temperature (max), night temperature (min), 
    and weather state.
    City is called ${city}
    Example:

    {
        "city_name": "London",
        "current": {
            "temperature": 23,
            "day_temp": 21,
            "night_temp": 8,
            "state": "sunny",
            "day_state": "cloudy",
            "humidity": 34,
            "air_quality": "Medium",
            "uv": "low",
            "sunrise": "06:23",
            "sunset": "21:34"
        },
        "hourly": [
            {
                "time": "18:00",
                "temperature": 21,
                "state": "rainy"
            },
            ...
        ],
        "daily": [
            {
                "weekday": "Mon",
                "day_temp": 25,
                "night_temp": 18,
                "state": "sunny"
            },
            ...
        ]
         
    }

    Raw data: ${JSON.stringify(data)}
    `;

    const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt
    });

    return JSON.parse(response.output_text);
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getCurrentDay() {
    const weekdayName = new Date().toLocaleDateString("en-US", {
        weekday: "long"
    });
    return weekdayName;
}

async function getMatchedCities(query) {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await response.json();

    
    return data.predictions
        .map(city => ({"city": city.terms[0].value,"country": city.terms[city.terms.length - 1].value,"place_id": city.place_id}));
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
});