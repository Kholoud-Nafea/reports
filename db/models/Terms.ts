import { DataTypes, Sequelize } from 'sequelize';
import { TermsStatic } from '../types/index';

export function TermsFactory (sequelize: Sequelize): TermsStatic {
  return <TermsStatic>sequelize.define("Terms", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'compositeIndex',
      references: {
        model: "Projects",
        key: "id",
      },
      onDelete: "cascade"
    },
    name: {
      type: DataTypes.STRING,
      unique: 'compositeIndex',
      allowNull: false,
      defaultValue: "",
    },
    value: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    percentage: {
      type: DataTypes.DECIMAL(6, 3),
      allowNull: false,
      defaultValue: 0,
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
  }
  );
}