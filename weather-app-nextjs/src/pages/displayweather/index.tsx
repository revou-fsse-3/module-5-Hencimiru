// pages/index.jsx

import React, { useEffect, useState, useCallback } from "react";
import { MainWrapper } from "../styled-components/index";
import { AiOutlineSearch } from 'react-icons/ai';
import { WiHumidity } from 'react-icons/wi';
import { SiWindicss } from 'react-icons/si';
import {
  BsFillSunFill,
  BsCloudyFill,
  BsCloudFog2Fill,
  BsFillCloudRainFill,
} from "react-icons/bs";
import { RiLoaderFill } from "react-icons/ri";
import { TiWeatherPartlySunny } from "react-icons/ti";
import axios from "axios";
import { useRouter } from "next/router";

interface WeatherDataProps {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  sys: {
    country: string;
  };
  weather: {
    main: string;
  }[];
  wind: {
    speed: number;
  };
}

const DisplayWeather: React.FC = () => {
  const router = useRouter();

  const api_key = "d6173a99dd78f55c547d7d12a808a6b5";
  const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

  const [weatherData, setWeatherData] = useState<WeatherDataProps | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchCity, setSearchCity] = useState<string>("");

  const fetchCurrentWeather = useCallback(
    async (lat: number, lon: number): Promise<WeatherDataProps> => {
      const url = `${api_Endpoint}weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
      const response = await axios.get<WeatherDataProps>(url);
      return response.data;
    },
    [api_Endpoint, api_key]
  );

  const fetchWeatherData = async (city: string): Promise<{ currentWeatherData: WeatherDataProps }> => {
    try {
      const url = `${api_Endpoint}weather?q=${city}&appid=${api_key}&units=metric`;
      const searchResponse = await axios.get<WeatherDataProps>(url);
      const currentWeatherData: WeatherDataProps = searchResponse.data;
      return { currentWeatherData };
    } catch (error) {
      throw error;
    }
  };

  const handleSearch = async () => {
    if (searchCity.trim() === "") {
      return;
    }

    try {
      const { currentWeatherData } = await fetchWeatherData(searchCity);
      setWeatherData(currentWeatherData);
    } catch (error) {
      // Handle error
    }
  };

  const handleSearchCity = () => {
    if (searchCity) {
      fetchWeatherData(searchCity).then(({ currentWeatherData }) => {
        setWeatherData(currentWeatherData);
        router.push("/hourly", { query: { searchCity } });
      });
    }
  };

  const iconChanger = (weather: string): React.ReactNode => {
    let iconElement: React.ReactNode;
    let iconColor: string;

    switch (weather) {
      case "Rain":
        iconElement = <BsFillCloudRainFill />;
        iconColor = "#272829";
        break;

      case "Clear":
        iconElement = <BsFillSunFill />;
        iconColor = "#FFC436";
        break;
      case "Clouds":
        iconElement = <BsCloudyFill />;
        iconColor = "#102C57";
        break;

      case "Mist":
        iconElement = <BsCloudFog2Fill />;
        iconColor = "#279EFF";
        break;
      default:
        iconElement = <TiWeatherPartlySunny />;
        iconColor = "#7B2869";
    }

    return (
      <span className="icon" style={{ color: iconColor }}>
        {iconElement}
      </span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const [currentWeather] = await Promise.all([fetchCurrentWeather(latitude, longitude)]);
        setWeatherData(currentWeather);
        setIsLoading(true);
      });
    };

    fetchData();
  }, [fetchCurrentWeather]);
  return (
    <MainWrapper>
      <div className="container">
        <h1 className="h1">Current Weather</h1>
        <div className="searchArea">
          <input
            type="text"
            placeholder="Enter a City"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          
          <div className="searchCircle">
            <div className="searchIcon" onClick={handleSearch}>
              <AiOutlineSearch />
            </div>
          </div>
        </div>

        {weatherData && isLoading ? (
          <>
            <div className="weatherArea">
              <h1>{weatherData.name}</h1>
              <span>{weatherData.sys.country}</span>
              <div className="icon">{iconChanger(weatherData.weather[0].main)}</div>
              <h1>{weatherData.main.temp.toFixed(0)}</h1>
              <h2>{weatherData.weather[0].main}</h2>
            </div>

            <div className="bottomInfoArea">
              <div className="humidityLevel">
                <div  className="humidIcon">
                  <WiHumidity />
                </div>
                <div className="humidInfo">
                  <h1>{weatherData.main.humidity}%</h1>
                  <p>Humidity</p>
                </div>
              </div>

              <div className="wind">
                <div className="windIcon" >
                  <SiWindicss />
                </div>
                <div className="humidInfo">
                  <h1>{weatherData.wind.speed}km/h</h1>
                  <p>Wind speed</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="loading">
            <div className="loadingIcon">
              <RiLoaderFill  />
            </div>
            <p>Loading</p>
          </div>
        )}
        <div className="topfive">
          <button className="button" onClick={handleSearchCity}>
            <h1 className="ButtonText"> {searchCity} Weather: 3-Hour Forecast</h1>
          </button>
        </div>
      </div>
    </MainWrapper>
  );
};

export const getServerSideProps = async () => {
  try {
    const api_key = "d6173a99dd78f55c547d7d12a808a6b5";
    const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

    const fetchCurrentWeather = async (lat: number, lon: number): Promise<WeatherDataProps> => {
      const url = `${api_Endpoint}weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
      const response = await axios.get<WeatherDataProps>(url);
      return response.data;
    };

    // Fetch weather data based on user's current location
    const currentWeather = await new Promise<WeatherDataProps>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await fetchCurrentWeather(latitude, longitude);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });

    return {
      props: {
        weatherData: currentWeather,
        isLoading: true,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);

    return {
      props: {
        weatherData: null,
        isLoading: false,
      },
    };
  }
};

export default DisplayWeather;