import { initializeELements,handleInput } from "./utils.js";

const input = document.querySelector(".input");
const inputContainer = document.querySelector(".input-container");
const location = document.querySelector(".location-city");
const temperature = document.querySelector(".temperature-container .temperature");
const state = document.querySelector(".temperature-container .state");
const stateSymbol = document.querySelector(".temperature-container .state-symbol");
const humidity = document.querySelector("#humidity");
const airQuality = document.querySelector("#air-quality");
const uv = document.querySelector("#uv");
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");

let cityDropdown;

async function getWeatherData() {
    const weatherData = JSON.parse(localStorage.getItem("weatherData"));
    return weatherData;
}

function setLocationLabel(city) {
    location.textContent = city;

    const currentPadding = parseInt(window.getComputedStyle(input).paddingLeft);
    const locationLabelWidth = location.offsetWidth;
    input.style.paddingLeft = (currentPadding + locationLabelWidth) + "px";
}

function setTemperature(temperatureValue) {
    temperature.textContent = `${temperatureValue}°`;
}

function setWeatherState(stateValue) {
    state.textContent = `${stateValue}`;

    setAppropriateSymbol(stateValue);
}

function setAppropriateSymbol(stateValue) {
    switch (stateValue.toLowerCase()) {
        case "sunny":
            stateSymbol.src = "assets/images/sunny-state.png";
            break;
        case "cloudy":
            stateSymbol.src = "assets/images/cloudy-state.png";
            break;
        case "rainy":
            stateSymbol.src = "assets/images/rainy-state.png";
            break;
        case "snowy":
            stateSymbol.src = "assets/images/snowy-state.png";
            break;    
        case "night":
            stateSymbol.src = "assets/images/night-state.png";
            break;    
    }
}

function setHumidity(humidityValue) {
    humidity.textContent = `${humidityValue}%`;
}

function setAirQuality(airQualityValue) {
    airQuality.textContent = `${airQualityValue[0].toUpperCase() + airQualityValue.slice(1)}`;
}

function setUV(uvValue) {
    uv.textContent = `${uvValue[0].toUpperCase() + uvValue.slice(1)}`;
}

function setSunrise(sunriseTime) {
    sunrise.textContent = `${sunriseTime}`;
}

function setSunset(sunsetTime) {
    sunset.textContent = `${sunsetTime}`;
}

function setComponentsValue(weatherData) {
    setLocationLabel(weatherData.city_name);
    setTemperature(weatherData.current.temperature);
    setWeatherState(weatherData.current.state);
    setHumidity(weatherData.current.humidity);
    setAirQuality(weatherData.current.air_quality);
    setUV(weatherData.current.uv);
    setSunrise(weatherData.current.sunrise);
    setSunset(weatherData.current.sunset);
}

async function init() {
    const weatherData = await getWeatherData();
    console.log(`weather data: ${JSON.stringify(weatherData)}`);

    setComponentsValue(weatherData);

    initializeELements({
            input: input,
            searchForm: inputContainer,
            cityDropdown: cityDropdown
        });

    input.addEventListener("input",(event) => {
        handleInput(event.target.value);
    });
}

await init();

