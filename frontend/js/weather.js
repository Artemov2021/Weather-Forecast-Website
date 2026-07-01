import { createCitySearch } from "./citySearch.js";

const input = document.querySelector(".input");
const inputContainer = document.querySelector(".input-container");
const location = document.querySelector(".location-city");
const temperature = document.querySelector(".temperature-container .temperature");
const condition = document.querySelector(".temperature-container .condition");
const conditionSymbol = document.querySelector(".temperature-container .condition-symbol");
const humidity = document.querySelector("#humidity");
const airQuality = document.querySelector("#air-quality");
const uv = document.querySelector("#uv");
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");
const hourlyTemperatureLineContainer = document.querySelector("#hourly-temperature-line-container");
const dailyTemperatureLineContainer = document.querySelector("#daily-temperature-line-container");

let weatherData;

async function getWeatherData() {
    const weatherData = JSON.parse(localStorage.getItem("data"));
    return weatherData;
}

function setLocationLabel() {
    location.textContent = weatherData.city;

    const currentPadding = parseInt(window.getComputedStyle(input).paddingLeft);
    const locationLabelWidth = location.offsetWidth;
    input.style.paddingLeft = (currentPadding + locationLabelWidth + 5) + "px";
}

function setTemperature() {
    temperature.textContent = `${weatherData.current.temp}°`;
}

function setWeatherCondition() {
    condition.textContent = `${weatherData.current.condition}`;

    setAppropriateconditionPadding();
    setAppropriateSymbol();
}

function setAppropriateconditionPadding() {
    const temperatureValue = weatherData.current.temp;

    if (temperatureValue < 10) {
        condition.style.paddingRight = "0px";
        temperature.style.paddingLeft = "33px";
    } else if (temperatureValue < 20) {
        condition.style.paddingRight = "24px";
    } else {
        condition.style.paddingRight = "30px";
    }  
}

function setAppropriateSymbol() {
    const condition = weatherData.current.condition;
    const isNight = weatherData.current.is_night;

    switch (condition.toLowerCase()) {
        case "clear":
            conditionSymbol.src = isNight
                ? "../public/assets/icons/clear-night.svg"
                : "../public/assets/icons/clear.svg";
            break;
        case "clouds":
            conditionSymbol.src = "../public/assets/icons/clouds.svg";
            break;
        case "rain":
            conditionSymbol.src = "../public/assets/icons/rain.svg";
            break;
        case "snow":
            conditionSymbol.src = "../public/assets/icons/snow.svg";
            break;    
        case "night":
            conditionSymbol.src = "assets/images/night-state.png";
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
    const hourlyTemperature = weatherData.hourly.map(hourlyData => (hourlyData.temp));

    const topPadding = 20;
    const bottomPadding = 45;
    const lineContainerHeight = hourlyTemperatureLineContainer.offsetHeight - bottomPadding;
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

        addHourlyTemperatureLabel(hourlyTemperature[i],x1,y1)
   
        if (isLastTemperature) {
            const lastLabelXPosition = x2 - 15;
            addHourlyTemperatureLabel(hourlyTemperature[i+1], lastLabelXPosition, y2);
        }
    }
}

function addHourlyTemperatureLabel(temperatureValue,x,y) {
    const temperatureLabel = document.createElement("p");
    temperatureLabel.className = "temperature-label";
    temperatureLabel.innerText = temperatureValue + "°";
    const temperatureLabelTopMargin = 9;
    temperatureLabel.style.top = `${y+temperatureLabelTopMargin}px`;
    temperatureLabel.style.left = `${x}px`;
    hourlyTemperatureLineContainer.append(temperatureLabel);
}

function addDailyDayTemperatureLabel(temperatureValue,x,y) {
    const temperatureLabel = document.createElement("p");
    temperatureLabel.className = "temperature-label";
    temperatureLabel.innerText = temperatureValue + "°";
    const temperatureLabelTopMargin = -25;
    temperatureLabel.style.top = `${y+temperatureLabelTopMargin}px`;
    temperatureLabel.style.left = `${x}px`;
    dailyTemperatureLineContainer.append(temperatureLabel);
}

function addDailyNightTemperatureLabel(temperatureValue,x,y) {
    const temperatureLabel = document.createElement("p");
    temperatureLabel.className = "temperature-label";
    temperatureLabel.innerText = temperatureValue + "°";
    const temperatureLabelTopMargin = 15;
    temperatureLabel.style.top = `${y+temperatureLabelTopMargin}px`;
    temperatureLabel.style.left = `${x}px`;
    dailyTemperatureLineContainer.append(temperatureLabel);
}

function setHourlyDashboardSymbols() {
    const hourlyConditions = weatherData.hourly.map(hourlyData => (hourlyData.condition));

    for (let i = 0;i < hourlyConditions.length;i++) {
        const conditionSymbol = document.querySelector(`#hourly-condition-${i+1}`);
        const isNight = (hourlyConditions[i].toLowerCase() === "clear" && weatherData.hourly[i].is_night);
        conditionSymbol.src = isNight ? `../public/assets/icons/dashboard-clear-night.svg` 
            : `../public/assets/icons/dashboard-${hourlyConditions[i].toLowerCase()}.svg`;
    }
}

function setDailyDashboardTitles() {
    const dailyData = weatherData.daily;

    for (let i = 0; i < dailyData.length; i++) {
        const title = document.querySelector(`#daily-title-${i + 1}`);
        title.textContent = dailyData[i].week_day;
    }
}

function setDailyDashboardDayLine() {
    const dailyData = weatherData.daily;
    const dayTemperatureValues = dailyData.map(dailyData => dailyData.day_temp);

    const dayTopPadding = 20;
    const dayBottomPadding = dailyTemperatureLineContainer.offsetHeight / 2;
    const dayLineContainerHeight = dailyTemperatureLineContainer.offsetHeight - dayBottomPadding;
    const dayLowestTemperature = Math.min(...dayTemperatureValues);
    const dayHighestTemperature = Math.max(...dayTemperatureValues);
    let oneGradInPx = 10;

    const isGraphTooHigh = (dayLineContainerHeight - ((dayHighestTemperature - dayLowestTemperature) * oneGradInPx)) < dayTopPadding;

    for (let i = 0;i < dayTemperatureValues.length - 1;i++) {
        const isLastTemperature = (i === dayTemperatureValues.length - 2);

        if (isGraphTooHigh) {
            oneGradInPx = dayLineContainerHeight / (dayHighestTemperature - dayLowestTemperature);
        }

  
        const line = document.querySelector(`#day-line-${i + 1}`);
        const x1 = line.getAttribute("x1");
        const x2 = line.getAttribute("x2");

        const y1 = dayLineContainerHeight - ((dayTemperatureValues[i] - dayLowestTemperature) * oneGradInPx);
        const y2 = dayLineContainerHeight - ((dayTemperatureValues[i + 1] - dayLowestTemperature) * oneGradInPx);

        line.setAttribute("y1", y1 < dayTopPadding ? dayTopPadding : y1);
        line.setAttribute("y2", y2 < dayTopPadding ? dayTopPadding : y2);

        addDailyDayTemperatureLabel(dayTemperatureValues[i],x1,y1)
   
        if (isLastTemperature) {
            const lastLabelXPosition = x2 - 15;
            addDailyDayTemperatureLabel(dayTemperatureValues[i+1], lastLabelXPosition, y2);
        }
    }
}

function setDailyDashboardNightLine() {
    const dailyData = weatherData.daily;
    const nightTemperatureValues = dailyData.map(dailyData => dailyData.night_temp);

    const svgContainerHeight = dailyTemperatureLineContainer.offsetHeight;
    const nightTopPadding = svgContainerHeight / 2;
    const nightBottomPadding = 35;
    const nightLineContainerHeight = svgContainerHeight - nightTopPadding;
    const nightLowestTemperature = Math.min(...nightTemperatureValues);
    const nightHighestTemperature = Math.max(...nightTemperatureValues);
    let oneGradInPx = 10;

    const isGraphTooHigh = (nightLineContainerHeight - ((nightHighestTemperature - nightLowestTemperature) * oneGradInPx)) < 0;

    for (let i = 0;i < nightTemperatureValues.length - 1;i++) {
        const isLastTemperature = (i === nightTemperatureValues.length - 2);

        if (isGraphTooHigh) {
            oneGradInPx = nightLineContainerHeight / (nightHighestTemperature - nightLowestTemperature);
        }

  
        const line = document.querySelector(`#night-line-${i + 1}`);
        const x1 = line.getAttribute("x1");
        const x2 = line.getAttribute("x2");

        const y1 = (svgContainerHeight - ((nightTemperatureValues[i] - nightLowestTemperature) * oneGradInPx)) - nightBottomPadding;
        const y2 = (svgContainerHeight - ((nightTemperatureValues[i + 1] - nightLowestTemperature) * oneGradInPx)) - nightBottomPadding;


        line.setAttribute("y1",y1);
        line.setAttribute("y2",y2);

        addDailyNightTemperatureLabel(nightTemperatureValues[i],x1,y1)
   
        if (isLastTemperature) {
            const lastLabelXPosition = x2 - 15;
            addDailyNightTemperatureLabel(nightTemperatureValues[i+1], lastLabelXPosition, y2);
        }
    }
}

function setDailyDashboardSymbols() {
    const conditionValues = weatherData.daily.map(dailyInfo => dailyInfo.condition);
    
    for (let i = 0;i < conditionValues.length;i++) {
        const conditionSymbol = document.querySelector(`#daily-condition-${i+1}`);
        conditionSymbol.src = `../public/assets/icons/dashboard-${conditionValues[i].toLowerCase()}.svg`;
    }
}
    


function setComponentsValue() {
    setLocationLabel();
    setTemperature();
    setWeatherCondition();
    setHumidity();
    setAirQuality();
    setUV();
    setSunrise();
    setSunset();
    
    setHourlyDashboardTitles();
    setHourlyDashboardLine();
    setHourlyDashboardSymbols();

    setDailyDashboardTitles();
    setDailyDashboardDayLine();
    setDailyDashboardNightLine();
    setDailyDashboardSymbols();
}

async function init() {
    weatherData = await getWeatherData();

    setComponentsValue();
    createCitySearch(input,inputContainer);
}

await init();

