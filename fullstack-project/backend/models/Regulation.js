const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Regulation = sequelize.define('Regulation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  file_path: {
    type: DataTypes.STRING
  },
  department_ids: {
    type: DataTypes.JSON
  },
  position_ids: {
    type: DataTypes.JSON
  },
  publish_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'regulations',
  timestamps: true
});

module.exports = Regulation;