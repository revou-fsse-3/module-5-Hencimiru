import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import DisplayWeather from "./index";
import { WeatherDataProps } from "../displayweather/index";
jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the useRouter hook
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("DisplayWeather component", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockPush.mockReset();
  });

  it("handles searchCity and redirects to hourly forecast", async () => {
    const mockWeatherData: WeatherDataProps = {
      name: "TestCity",
      sys: { country: "TestCountry" },
      main: { temp: 20, humidity: 50 },
      weather: [{ main: "Clear" }],
      wind: { speed: 10 },
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockWeatherData });

    render(<DisplayWeather />);

    fireEvent.change(screen.getByPlaceholderText("Enter a City"), {
      target: { value: "TestCity" },
    });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText("TestCity")).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith("/hourly", {
        query: { searchCity: "TestCity" },
      });
    });
  });
});
