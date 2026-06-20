let cityDropdown;
let input;
let searchForm;

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://weather-forecast-website-production.up.railway.app";


export function initializeELements(inputObject) {
    cityDropdown = inputObject.cityDropdown;
    input = inputObject.input;
    searchForm = inputObject.searchForm;
}

export async function handleInput(inputText) {
    const matchedCities = await findCity(inputText);
    
    await showSearchCities(matchedCities);
}

async function findCity(query) {
    console.log("current api url: " + API_URL);
    const res = await fetch(`${API_URL}/get-matched-cities?query=${query}`)
    const data = await res.json();
    return data.cities;
} 

async function showSearchCities(matchedCities) {
    if (matchedCities.length == 0) {
        removeCityDropdownIfExists();
        return;
    }

    if (!cityDropdown) {
        cityDropdown = document.createElement("div");
        cityDropdown.className = "city-dropdown";
        cityDropdown.style.height = "fit-content";
        cityDropdown.style.marginTop = "10px";
        cityDropdown.style.width = input.offsetWidth + "px";
        searchForm.append(cityDropdown);
    }

    cityDropdown.replaceChildren();
    let fadeDuration = 0.3;


    for (const cityData of matchedCities) {
        const cityContainer = document.createElement("div");
        cityContainer.className = "city-container";
        cityContainer.style.animation = `fadeLeft ${fadeDuration}s ease`;
        cityContainer.addEventListener("click",async () => {
            await handleCityClick(cityData.city,cityData.place_id);
        });
        cityDropdown.append(cityContainer);

        const city = document.createElement("p");
        city.innerHTML = cityData.city;
        city.className = "city";
        cityContainer.append(city);

        const country = document.createElement("p");
        country.innerHTML = cityData.country;
        country.className = "country";
        cityContainer.append(country);

        fadeDuration += 0.2;
    }   
}

async function handleCityClick(city,placeId) {
    removeCityDropdownIfExists();

    input.value = city;

    try {
        setLoadingStyle();
        const weatherData = await getWeatherData(placeId,city);
        localStorage.setItem("weatherData",JSON.stringify(weatherData));
        window.location.href = `weather.html`;
        input.value = "";
    } catch(e) {
        alert("Failed to fetch the weather data");
        console.error(e);
    }
}

async function getWeatherData(placeId,city) {
    const res = await fetch(`${API_URL}/get-weather-data?place_id=${placeId}&city=${city}`);
    const data = await res.json();

    return data;
}


function removeCityDropdownIfExists() {
    if (cityDropdown) {
        searchForm.removeChild(cityDropdown);
        cityDropdown = null;
    }
}

function setLoadingStyle() {
    input.classList.add("input-loading");
}