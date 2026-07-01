import { getMatchedCitiesController,getWeatherController } from "./services/service.js";

import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());

app.get('/get-matched-cities', getMatchedCitiesController);
app.get('/get-weather-data', getWeatherController);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


