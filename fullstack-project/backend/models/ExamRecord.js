const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamRecord = sequelize.define('ExamRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Exams',
      key: 'id'
    }
  },
  submit_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'exam_records',
  timestamps: true
});

module.exports = ExamRecord;