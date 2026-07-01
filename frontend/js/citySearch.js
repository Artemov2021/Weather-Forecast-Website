import { findCities,getWeatherData } from "./weatherApi.js";


export function createCitySearch(input, searchForm) {
    let cityDropdown = null;

    input.addEventListener("input", async (e) => {
        const matchedCities = await findCities(e.target.value);
        showSearchCities(matchedCities);
    });

    function showSearchCities(matchedCities) {
        if (matchedCities.length === 0) {
            removeCityDropdownIfExists();
            return;
        }

        createDropdownIfNeeded();
        clearDropdown();
        renderCities(matchedCities);
    }

    function removeCityDropdownIfExists() {
        if (cityDropdown) {
            searchForm.removeChild(cityDropdown);
            cityDropdown = null;
        }
    }

    function createDropdownIfNeeded() {
        if (cityDropdown) return;

        cityDropdown = document.createElement("div");
        cityDropdown.className = "city-dropdown";
        cityDropdown.style.width = `${input.offsetWidth}px`;

        searchForm.append(cityDropdown);
    }

    function clearDropdown() {
        cityDropdown.replaceChildren();
    }

    function renderCities(cities) {
        let fadeDuration = 0.3;

        for (const cityData of cities) {
            const cityElement = createCityElement(cityData, fadeDuration);
            cityDropdown.append(cityElement);
            fadeDuration += 0.2;
        }
    }

    function createCityElement(cityData, fadeDuration) {
        const container = document.createElement("div");
        container.className = "city-container";
        container.style.animation = `fadeLeft ${fadeDuration}s ease`;

        container.addEventListener("click", async () => {
            await handleCityClick(cityData);
        });

        const city = document.createElement("p");
        city.className = "city";
        city.textContent = cityData.city;

        const country = document.createElement("p");
        country.className = "country";
        country.textContent = cityData.country;

        container.append(city, country);

        return container;
    }

    async function handleCityClick(cityData) {
        removeCityDropdownIfExists();
        setLoadingStyle();

        try {
            await showWeatherPage(cityData);
            removeTextFromInput();
        } catch(e) {
            console.error(e);
        } finally {
            removeLoadingStyle();
        }
    }

    function setLoadingStyle() {
        input.classList.add("input-loading");
    }

    function removeLoadingStyle() {
        input.classList.remove("input-loading");
    }

    function removeTextFromInput() {
        input.value = "";
    }

    function saveData(data) {
        localStorage.setItem("data",JSON.stringify(data));
    }

    function loadWeatherPage() {
        window.location.href = "weather.html";
    }

    async function showWeatherPage(cityData) {
        const data = await getWeatherData(cityData);
        saveData(data);
        loadWeatherPage();
    }
    
}

