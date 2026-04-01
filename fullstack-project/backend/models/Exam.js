const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  regulation_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Regulations',
      key: 'id'
    }
  },
  pass_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  department_ids: {
    type: DataTypes.JSON
  },
  position_ids: {
    type: DataTypes.JSON
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'exams',
  timestamps: true
});

module.exports = Exam;