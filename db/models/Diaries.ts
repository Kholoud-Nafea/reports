import { DataTypes, Sequelize } from 'sequelize';
import { DiariesStatic } from '../types/index';

export function DiariesFactory (sequelize: Sequelize): DiariesStatic {
  return <DiariesStatic>sequelize.define("Diaries", {
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
    planned: {
      type: DataTypes.DECIMAL(6, 3),
      allowNull: true,
      defaultValue: 0.00
    },
    achieved: {
      type: DataTypes.DECIMAL(6, 3),
      allowNull: true,
      defaultValue: 0.00
    },
    certified: {
      type: DataTypes.DECIMAL(6, 3),
      allowNull: true,
      defaultValue: 0.00
    },
    businessValue: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0
    },
    updatingStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    workDay: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
}