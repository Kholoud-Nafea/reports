import * as sequelize from 'sequelize';
import {ProjectsFactory} from "./projects";
import {WorkersFactory} from "./workers";
import {TermsFactory} from "./Terms";
import {TermlyFactory} from "./termly";
import {DiariesFactory} from "./Diaries";
import {MonthlyFactory} from "./monthly";
import {WeatherFactory} from "./weather";

export const dbConfig = new sequelize.Sequelize({
  database: "eammar",
  dialect: "sqlite",
  storage: './db.development.sqlite',
  pool: {
    min: 0,
    max: 5,
    acquire: 30000,
    idle: 10000,
  },
});

export const Projects = ProjectsFactory(dbConfig)
export const Workers = WorkersFactory(dbConfig)
export const Terms = TermsFactory(dbConfig)
export const Termly = TermlyFactory(dbConfig)
export const Diaries = DiariesFactory(dbConfig);
export const Monthly = MonthlyFactory(dbConfig);
export const Weather = WeatherFactory(dbConfig);

dbConfig.sync({ logging: false })
  .then(_res => console.log("tables created successfully"))
  .catch(e => console.log(e))
