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

    return await getFilteredData(rawData,cityName,lat,lng);
}

async function getFilteredData(data,city,lat,lng) {
    const prompt = `
    You are a professional helpful assistant. Convert the giving JSON into the following format. Response only in JSON. Dont reply 
    with quotes at the beginning. 
    
    Rules:
    - Weather state must be exactly one of: sunny, rainy, cloudy, night, snowy
    - Humidity = percentage number only
    - Air quality must be: low, medium, or good
    - UV must be: low, medium, or high
    - Current time in that city is: ${await getCurrentCityDate(lat,lng)}
    - City is: ${city}

    Hourly forecast:
    - Return next 6 hours
    - Start from next full hour in CITY local time

    Daily forecast:
    - Return next 4 weekdays excluding today
    - Include:
        - weekday
        - day temperature (max)
        - night temperature (min)
        - weather state

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

async function getCurrentCityDate(lat,lng) {
    const timeZone = await getCityTimeZone(lat,lng);
    const berlinTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: timeZone.timeZoneId,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(new Date());

    return berlinTime;
}

async function getCityTimeZone(lat, lng) {
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.TIME_ZONE_API_KEY}`;
    const response = await fetch(url);
    return response.json();
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
    console.log("Google API key exists: " + !!process.env.GOOGLE_API_KEY);
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