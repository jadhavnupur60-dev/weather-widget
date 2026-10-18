
const weatherForm = document.getElementById("weatherForm");
const apiKeyInput = document.getElementById("apiKey");
const cityInput = document.getElementById("cityInput");
const addFavoriteBtn = document.getElementById("addFavoriteBtn");
const weatherResult = document.getElementById("weatherResult");
const favoritesList = document.getElementById("favoritesList");
const message = document.getElementById("message");

const STORAGE_KEY = "weatherFavoriteCities";

// Read saved cities from localStorage.
function loadFavorites() {
    try {
        const savedCities = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(savedCities)) {
            return [];
        }

        return savedCities.filter(
            city => typeof city === "string" && city.trim() !== ""
        );
    } catch (error) {
        return [];
    }
}

// Save the current favorite city array.
function saveFavorites(cities) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
        return true;
    } catch (error) {
        message.textContent =
            "Unable to save favorites. Check your browser storage settings.";
        return false;
    }
}

// Display favorite cities as buttons.
function renderFavorites() {
    const cities = loadFavorites();

    favoritesList.replaceChildren();

    if (cities.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-favorites";
        emptyMessage.textContent = "No favorite cities saved yet.";
        favoritesList.appendChild(emptyMessage);
        return;
    }

    cities.forEach(city => {
        const item = document.createElement("div");
        item.className = "favorite-item";

        const cityButton = document.createElement("button");
        cityButton.type = "button";
        cityButton.className = "favorite-city";
        cityButton.textContent = "📍 " + city;

        // Fetch weather when a favorite city is clicked.
        cityButton.addEventListener("click", () => {
            cityInput.value = city;
            getWeather(city);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-favorite";
        removeButton.textContent = "✕";
        removeButton.setAttribute(
            "aria-label",
            "Remove " + city + " from favorites"
        );

        removeButton.addEventListener("click", () => {
            removeFavorite(city);
        });

        item.append(cityButton, removeButton);
        favoritesList.appendChild(item);
    });
}

// Add a city without creating duplicates.
function addFavorite() {
    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name first.";
        cityInput.focus();
        return;
    }

    const cities = loadFavorites();

    const alreadyExists = cities.some(
        savedCity => savedCity.toLowerCase() === city.toLowerCase()
    );

    if (alreadyExists) {
        message.textContent = city + " is already in your favorites.";
        return;
    }

    cities.push(city);

    if (saveFavorites(cities)) {
        renderFavorites();
        message.textContent = city + " added to favorites!";
    }
}

// Remove a city from favorites.
function removeFavorite(city) {
    const updatedCities = loadFavorites().filter(
        savedCity => savedCity.toLowerCase() !== city.toLowerCase()
    );

    if (saveFavorites(updatedCities)) {
        renderFavorites();
        message.textContent = city + " removed from favorites.";
    }
}

// Fetch weather from the OpenWeatherMap API.
async function getWeather(city = cityInput.value.trim()) {
    const apiKey = apiKeyInput.value.trim();
    const cityName = city.trim();

    if (!apiKey) {
        message.textContent = "Please enter your OpenWeatherMap API key.";
        apiKeyInput.focus();
        return;
    }

    if (!cityName) {
        message.textContent = "Please enter a city name.";
        cityInput.focus();
        return;
    }

    message.textContent = "Loading weather...";
    weatherResult.replaceChildren();

    try {
        const url =
            "https://api.openweathermap.org/data/2.5/weather" +
            "?q=" + encodeURIComponent(cityName) +
            "&appid=" + encodeURIComponent(apiKey) +
            "&units=metric";

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Invalid API key or API key not activated.");
            }

            if (response.status === 404) {
                throw new Error("City not found. Check the spelling.");
            }

            throw new Error(data.message || "Unable to fetch weather.");
        }

        const card = document.createElement("div");
        card.className = "weather-card";

        const heading = document.createElement("h2");
        heading.textContent = data.name + ", " + data.sys.country;

        const icon = document.createElement("img");
        icon.className = "weather-icon";
        icon.alt = data.weather[0].description;
        icon.src =
            "https://openweathermap.org/img/wn/" +
            data.weather[0].icon + "@2x.png";

        const temperature = document.createElement("p");
        temperature.textContent =
            "Temperature: " + data.main.temp + " °C";

        const description = document.createElement("p");
        description.textContent =
            "Condition: " + data.weather[0].description;

        const humidity = document.createElement("p");
        humidity.textContent =
            "Humidity: " + data.main.humidity + "%";

        const wind = document.createElement("p");
        wind.textContent =
            "Wind Speed: " + data.wind.speed + " m/s";

        card.append(
            heading,
            icon,
            temperature,
            description,
            humidity,
            wind
        );

        weatherResult.appendChild(card);
        message.textContent = "Weather loaded successfully.";

    } catch (error) {
        message.textContent = error.message;
    }
}

// Handle the Get Weather form.
weatherForm.addEventListener("submit", event => {
    event.preventDefault();
    getWeather();
});

// Handle Add to Favorites.
addFavoriteBtn.addEventListener("click", addFavorite);

// Display saved cities when the page opens.
renderFavorites();
