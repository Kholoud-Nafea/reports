import { DataTypes, Sequelize } from 'sequelize';
import { TermlyStatic } from '../types/index';

export function TermlyFactory (sequelize: Sequelize): TermlyStatic {
  return <TermlyStatic>sequelize.define("Termly", {
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
    termId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    value: {
      type: DataTypes.NUMBER,
      allowNull: true,
      defaultValue: 0,
    }
  });
}