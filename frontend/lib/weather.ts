export interface WeatherData {
  temperature: number;
  relativeHumidity: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  windSpeed: number;
  elevation: number;
  rainForecastTotal: number;
  statusCuaca: string;
}

/**
 * Maps WMO weather code to Indonesian description.
 */
function interpretWeatherCode(code: number): string {
  if (code === 0) return "Cerah Berawan";
  if (code <= 3) return "Berawan Sebagian";
  if (code <= 48) return "Berkabut / Berembun";
  if (code <= 55) return "Gerimis Ringan";
  if (code <= 65) return "Hujan Sedang";
  if (code <= 82) return "Hujan Lebat / Deras";
  if (code >= 95) return "Hujan Disertai Petir (Badai)";
  return "Hujan Ringan";
}

/**
 * Fetches real-time weather and precipitation data from Open-Meteo API.
 */
export async function getLiveWeather(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation,rain&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      throw new Error(`Open-Meteo responded with status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const hourlyRain = data.hourly?.rain || [];
    const rainTotal = hourlyRain.reduce((acc: number, val: number) => acc + (val || 0), 0);

    return {
      temperature: current.temperature_2m ?? 24.5,
      relativeHumidity: current.relative_humidity_2m ?? 75,
      precipitation: current.precipitation ?? 0.0,
      rain: current.rain ?? 0.0,
      weatherCode: current.weather_code ?? 0,
      windSpeed: current.wind_speed_10m ?? 5.2,
      elevation: data.elevation ?? 450,
      rainForecastTotal: parseFloat(rainTotal.toFixed(1)),
      statusCuaca: interpretWeatherCode(current.weather_code ?? 0),
    };
  } catch (error) {
    console.warn("Weather API fetch fallback used:", error);
    // Graceful fallback for offline / mock usage
    return {
      temperature: 25.0,
      relativeHumidity: 78,
      precipitation: 0.0,
      rain: 0.0,
      weatherCode: 2,
      windSpeed: 4.5,
      elevation: 460,
      rainForecastTotal: 14.5,
      statusCuaca: "Berawan (Potensi Hujan Sore)",
    };
  }
}
