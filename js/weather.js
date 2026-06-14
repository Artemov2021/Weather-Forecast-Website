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
const temperatureLineContainer = document.querySelector(".temperature-line-container");

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

function setWeatherState(stateValue,temperatureValue) {
    state.textContent = `${stateValue}`;
    setAppropriateStatePadding(temperatureValue);

    setAppropriateSymbol(stateValue);
}

function setAppropriateStatePadding(temperatureValue) {
    if (temperatureValue < 10) {
        state.style.paddingRight = "0px";
        temperature.style.paddingLeft = "33px";
    } else if (temperatureValue < 20) {
        state.style.paddingRight = "24px";
    } else {
        state.style.paddingRight = "32px";
    }  
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

function setHourlyDashboardTitles(weatherData) {
    const hourlyData = weatherData.hourly;

    for (let i = 0;i < hourlyData.length;i++) {
        const title = document.querySelector(`#hour-${i+1}`);
        title.textContent = hourlyData[i].time;
    }
}

function setHourlyDashboardLine(weatherData) {
    const hourlyTemperature = weatherData.hourly.map(hourlyData => (hourlyData.temperature));
    hourlyTemperature.unshift(weatherData.current.temperature);

    const topPadding = 20;
    const bottomPadding = 45;
    const lineContainerHeight = temperatureLineContainer.offsetHeight - bottomPadding;
    const lowestTemperature = Math.min(...hourlyTemperature);
    const highestTemperature = Math.max(...hourlyTemperature);
    let oneGradInPx = 10;

    const isGraphTooHigh = (lineContainerHeight - ((highestTemperature - lowestTemperature) * oneGradInPx)) < topPadding;

    for (let i = 0;i < hourlyTemperature.length - 1;i++) {
        const isLastTemperature = (i === hourlyTemperature.length - 2);

        if (isGraphTooHigh) {
            oneGradInPx = lineContainerHeight / (highestTemperature - lowestTemperature);
        }

  
        const line = document.querySelector(`#hour-line-${i + 1}`);
        const x1 = line.getAttribute("x1");
        const x2 = line.getAttribute("x2");

        const y1 = lineContainerHeight - ((hourlyTemperature[i] - lowestTemperature) * oneGradInPx);
        const y2 = lineContainerHeight - ((hourlyTemperature[i + 1] - lowestTemperature) * oneGradInPx);

        line.setAttribute("y1", y1 < topPadding ? topPadding : y1);
        line.setAttribute("y2", y2 < topPadding ? topPadding : y2);

        addTemperatureLabel(hourlyTemperature[i],x1,y1)
   
        if (isLastTemperature) {
            const lastLabelXPosition = x2 - 30;
            addTemperatureLabel(hourlyTemperature[i+1], lastLabelXPosition, y2);
        }
    }
}

function addTemperatureLabel(temperatureValue,x,y) {
    const temperatureLabel = document.createElement("p");
    temperatureLabel.className = "temperature-label";
    temperatureLabel.innerText = temperatureValue + "°";
    const temperatureLabelTopMargin = 9;
    temperatureLabel.style.top = `${y+temperatureLabelTopMargin}px`;
    temperatureLabel.style.left = `${x}px`;
    temperatureLineContainer.append(temperatureLabel);
}

function setHourlyDashboardSymbols(weatherData) {
    const hourlyStates = weatherData.hourly.map(hourlyData => (hourlyData.state));
    hourlyStates.unshift(weatherData.current.state);

    for (let i = 0;i < hourlyStates.length;i++) {
        const stateSymbol = document.querySelector(`#hourly-state-${i+1}`);
        stateSymbol.src = `assets/images/${hourlyStates[i]}.png`;
    }
}

    


function setComponentsValue(weatherData) {
    setLocationLabel(weatherData.city_name);
    setTemperature(weatherData.current.temperature);
    setWeatherState(weatherData.current.state,weatherData.current.temperature);
    setHumidity(weatherData.current.humidity);
    setAirQuality(weatherData.current.air_quality);
    setUV(weatherData.current.uv);
    setSunrise(weatherData.current.sunrise);
    setSunset(weatherData.current.sunset);
    
    setHourlyDashboardTitles(weatherData);
    setHourlyDashboardLine(weatherData);
    setHourlyDashboardSymbols(weatherData);
}

async function init() {
    const weatherData = await getWeatherData();
    console.log(`weather data: ${JSON.stringify(weatherData.hourly)}`);

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

