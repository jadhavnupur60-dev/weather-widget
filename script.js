
const form = document.getElementById("weatherForm");
const apiKeyInput = document.getElementById("apiKey");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const statusMessage = document.getElementById("status");
const weatherResult = document.getElementById("weatherResult");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

async function getWeather(city, apiKey) {
    statusMessage.textContent = "Loading weather...";
    weatherResult.hidden = true;
    searchButton.disabled = true;

    try {
        const url =
            "https://api.openweathermap.org/data/2.5/weather" +
            `?q=${encodeURIComponent(city)}` +
            `&appid=${encodeURIComponent(apiKey)}` +
            "&units=metric";

        const response = await fetch(url);

        // Handle HTTP errors from the weather API.
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    "Invalid API key or key not activated yet."
                );
            }

            if (response.status === 404 || response.status === 400) {
                throw new Error(
                    "City not found. Please check the city name."
                );
            }

            if (response.status === 429) {
                throw new Error(
                    "Too many requests. Please try again later."
                );
            }

            throw new Error(
                "Weather service error. Please try again."
            );
        }

        const data = await response.json();

        // Read the weather details from the API response.
        const weather = data.weather[0];

        cityName.textContent = `${data.name}, ${data.sys.country}`;
        temperature.textContent =
            `${Math.round(data.main.temp)}°C`;
        description.textContent = weather.description;

        feelsLike.textContent =
            `${Math.round(data.main.feels_like)}°C`;

        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} m/s`;

        // Display the weather icon.
        weatherIcon.src =
            `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        weatherIcon.alt = weather.description;

        weatherResult.hidden = false;
        statusMessage.textContent = "Weather updated successfully.";

    } catch (error) {
        console.error("Weather error:", error);

        if (error instanceof TypeError) {
            statusMessage.textContent =
                "Network error. Check your internet connection.";
        } else {
            statusMessage.textContent = error.message;
        }
    } finally {
        // Enable the button again after success or failure.
        searchButton.disabled = false;
    }
}

// Run when the user submits the form.
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const apiKey = apiKeyInput.value.trim();
    const city = cityInput.value.trim();

    if (!apiKey || !city) {
        statusMessage.textContent =
            "Please enter your API key and city name.";
        return;
    }

    getWeather(city, apiKey);
});
