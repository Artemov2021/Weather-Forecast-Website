export function getHourlyForecast(rawData) {
    const HOURS_TO_FETCH = 7;
    const rawHourlyData = rawData.hourly.slice(0,HOURS_TO_FETCH);

    const hourlyForecast = [];

    for (let i = 0;i < rawHourlyData.length;i++) {
        hourlyForecast.push({
            "time": i === 0 ? "Now" : formatTime(rawHourlyData[i].dt, rawData.timezone_offset),
            "temp": Math.round(rawHourlyData[i].temp),
            "condition": rawHourlyData[i].weather[0].main,
            "is_night" : rawHourlyData[i].weather[0].icon.endsWith("n")
        });
    }

    return hourlyForecast;
}

export function getDailyForecast(rawData) {
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

export function isNight(rawData) {
    return rawData.hourly[0].weather[0].icon.endsWith("n");
}

function getWeekday(timestamp, timezoneOffset) {
    const localDate = new Date((timestamp + timezoneOffset) * 1000);

    const weekday = localDate.toLocaleDateString("en-US", {
        weekday: "short",
    });

    return weekday;
}

export async function getAirQuality(lat,lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    const data = await response.json();
    const aqi = data.list[0].main.aqi;

    if (aqi <= 2) return "Good";
    if (aqi === 3) return "Medium";
    return "Bad";
}

export function getUV(uvi) {
    if (uvi <= 2) return "Low";
    if (uvi <= 5) return "Moderate";
    if (uvi <= 7) return "High";
    if (uvi <= 10) return "Very High";
    return "Extreme";
}

export function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000);

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}