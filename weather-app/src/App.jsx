import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_KEY = '3369d86813b1c7f9bb1a49ea9c85f5a9';
const USE_SAMPLE_DATA = true; // change to false once your API key works

// Sample forecast data, used only while the API key is not active
function makeSampleForecast() {
  const start = Date.UTC(2026, 10, 6, 0, 0, 0);
  return Array.from({ length: 16 }, (_, i) => {
    const d = new Date(start + i * 3 * 3600 * 1000);
    return {
      dt_txt: d.toISOString().slice(0, 19).replace('T', ' '),
      main: {
        temp: Math.round((28 + 4 * Math.sin(i / 3)) * 10) / 10,
        humidity: Math.round(60 + 15 * Math.cos(i / 4))
      }
    };
  });
}

const weatherService = {
  async getCurrent(city) {
    if (USE_SAMPLE_DATA) {
      return {
        name: city,
        sys: { country: 'IN' },
        main: { temp: 31, feels_like: 33, humidity: 60 },
        wind: { speed: 3.2 },
        weather: [{ description: 'clear sky (sample data)' }]
      };
    }
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  async getForecast(city) {
    if (USE_SAMPLE_DATA) {
      return { list: makeSampleForecast() };
    }
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  }
};

export default function App() {
  const [city, setCity] = useState('Hyderabad');
  const [current, setCurrent] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  const search = async () => {
    try {
      setError('');
      const now = await weatherService.getCurrent(city);
      setCurrent(now);

      const forecast = await weatherService.getForecast(city);
      const points = forecast.list.slice(0, 16); // next 48 hours, every 3 hours
      setChartData({
        labels: points.map(p => p.dt_txt.slice(5, 16)),
        datasets: [
          {
            label: 'Temperature (°C)',
            data: points.map(p => p.main.temp),
            borderColor: 'teal',
            backgroundColor: 'teal',
            tension: 0.3
          },
          {
            label: 'Humidity (%)',
            data: points.map(p => p.main.humidity),
            borderColor: 'orange',
            backgroundColor: 'orange',
            tension: 0.3
          }
        ]
      });
    } catch (e) {
      setError(e.message);
      setCurrent(null);
      setChartData(null);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: '30px auto', textAlign: 'center' }}>
      <h2>Weather Dashboard</h2>
      {USE_SAMPLE_DATA && (
        <p style={{ color: 'gray', fontSize: 13 }}>Showing sample data (API key not yet active)</p>
      )}
      <input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" />
      <button onClick={search}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {current && (
        <div>
          <h3>{current.name}, {current.sys.country}</h3>
          <p>Temperature: {current.main.temp} °C | Feels like: {current.main.feels_like} °C</p>
          <p>Humidity: {current.main.humidity}% | Wind: {current.wind.speed} m/s</p>
          <p>Condition: {current.weather[0].description}</p>
        </div>
      )}

      {chartData && <Line data={chartData} />}
    </div>
  );
}