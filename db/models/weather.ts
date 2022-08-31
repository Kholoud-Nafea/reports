import { DataTypes, Sequelize } from 'sequelize';
import { WeatherStatic } from '../types/index';

export function WeatherFactory (sequelize: Sequelize): WeatherStatic {
  return <WeatherStatic>sequelize.define("Weather", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Projects",
        key: "id",
      },
      onDelete: "cascade" 
    },
    minDegree: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    maxDegree: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    workDay: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  });
}