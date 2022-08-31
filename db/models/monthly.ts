import { DataTypes, Sequelize } from 'sequelize';
import { MonthlyStatic } from '../types/index';

export function MonthlyFactory (sequelize: Sequelize): MonthlyStatic {
  return <MonthlyStatic>sequelize.define("Monthly", {
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
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    plannedRatios: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    },
    achievedRatios: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    },
    certifiedRatios: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    },
    executedDeads: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    },
    paidToContractor: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    },
    requestedOrders: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    },
    certifiedOrders: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    },
    month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  });
}