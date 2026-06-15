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
let weatherData;

async function getWeatherData() {
    const weatherData = JSON.parse(localStorage.getItem("weatherData"));
    return weatherData;
}

function setLocationLabel() {
    location.textContent = weatherData.city_name;

    const currentPadding = parseInt(window.getComputedStyle(input).paddingLeft);
    const locationLabelWidth = location.offsetWidth;
    input.style.paddingLeft = (currentPadding + locationLabelWidth) + "px";
}

function setTemperature() {
    temperature.textContent = `${weatherData.current.temperature}°`;
}

function setWeatherState() {
    state.textContent = `${weatherData.current.state}`;

    setAppropriateStatePadding();
    setAppropriateSymbol();
}

function setAppropriateStatePadding() {
    const temperatureValue = weatherData.current.temperature;

    if (temperatureValue < 10) {
        state.style.paddingRight = "0px";
        temperature.style.paddingLeft = "33px";
    } else if (temperatureValue < 20) {
        state.style.paddingRight = "24px";
    } else {
        state.style.paddingRight = "32px";
    }  
}

function setAppropriateSymbol() {
    const state = weatherData.current.state;

    switch (state.toLowerCase()) {
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

function setHumidity() {
    humidity.textContent = `${weatherData.current.humidity}%`;
}

function setAirQuality() {
    const airQualityValue = weatherData.current.air_quality;
    airQuality.textContent = `${airQualityValue[0].toUpperCase() + airQualityValue.slice(1)}`;
}

function setUV() {
    const uvValue = weatherData.current.uv;
    uv.textContent = `${uvValue[0].toUpperCase() + uvValue.slice(1)}`;
}

function setSunrise() {
    const sunriseTime = weatherData.current.sunrise;
    sunrise.textContent = `${sunriseTime}`;
}

function setSunset() {
    const sunsetTime = weatherData.current.sunset;
    sunset.textContent = `${sunsetTime}`;
}

function setHourlyDashboardTitles() {
    const hourlyData = weatherData.hourly;

    for (let i = 0;i < hourlyData.length;i++) {
        const title = document.querySelector(`#hour-title-${i+1}`);
        title.textContent = hourlyData[i].time;
    }
}

function setHourlyDashboardLine() {
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

function setHourlyDashboardSymbols() {
    const hourlyStates = weatherData.hourly.map(hourlyData => (hourlyData.state));
    hourlyStates.unshift(weatherData.current.state);

    for (let i = 0;i < hourlyStates.length;i++) {
        const stateSymbol = document.querySelector(`#hourly-state-${i+1}`);
        stateSymbol.src = `assets/images/${hourlyStates[i]}.png`;
    }
}

function setDailyDashboardTitles() {
    console.log(JSON.stringify(weatherData));
    const todayData = {
        "weekday": "Today",
        "day_temp": weatherData.current.day_temp,
        "night_temp": weatherData.current.night_temp,
        "state": weatherData.current.day_state
    }

    const dailyData = [todayData,...weatherData.daily];
    console.log(dailyData);

    for (let i = 0; i < dailyData.length; i++) {
        const title = document.querySelector(`#daily-title-${i + 1}`);
        title.textContent = dailyData[i].weekday;

    }
}

    


function setComponentsValue() {
    setLocationLabel();
    setTemperature();
    setWeatherState();
    setHumidity();
    setAirQuality();
    setUV();
    setSunrise();
    setSunset();
    
    setHourlyDashboardTitles();
    setHourlyDashboardLine();
    setHourlyDashboardSymbols();

    setDailyDashboardTitles();
}

async function init() {
    weatherData = await getWeatherData();

    setComponentsValue();

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

