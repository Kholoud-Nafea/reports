import { DataTypes, Sequelize } from 'sequelize';
import { WorkersStatic } from '../types/index';

export function WorkersFactory (sequelize: Sequelize): WorkersStatic {
  return <WorkersStatic>sequelize.define("Workers", {
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
    engineers: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    observers: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    trainedLabor: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    labor: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    workDay: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  });
}