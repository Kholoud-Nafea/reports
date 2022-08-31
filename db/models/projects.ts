import { DataTypes, Sequelize } from 'sequelize';
import { ProjectsStatic } from '../types/index';

export function ProjectsFactory (sequelize: Sequelize): ProjectsStatic {
  return <ProjectsStatic>sequelize.define("Projects", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    officialName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    advisorName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractValue: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    beneficiariesCount: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    originalPeriod: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    modifiedPeriod: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    currentExpirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
}