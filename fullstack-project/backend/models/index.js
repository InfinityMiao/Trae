const User = require('./User');
const Department = require('./Department');
const Position = require('./Position');
const Regulation = require('./Regulation');
const Exam = require('./Exam');
const Question = require('./Question');
const ExamRecord = require('./ExamRecord');
const Feedback = require('./Feedback');

// 定义关联关系
User.belongsTo(Department, { foreignKey: 'department_id' });
User.belongsTo(Position, { foreignKey: 'position_id' });

Department.hasMany(User, { foreignKey: 'department_id' });
Department.hasMany(Position, { foreignKey: 'department_id' });
Department.hasMany(Department, { foreignKey: 'parent_id', as: 'children' });

Position.belongsTo(Department, { foreignKey: 'department_id' });
Position.hasMany(User, { foreignKey: 'position_id' });

Regulation.belongsTo(User, { foreignKey: 'created_by' });

Exam.belongsTo(User, { foreignKey: 'created_by' });
Exam.belongsTo(Regulation, { foreignKey: 'regulation_id' });

Question.belongsTo(Exam, { foreignKey: 'exam_id' });

ExamRecord.belongsTo(User, { foreignKey: 'user_id' });
ExamRecord.belongsTo(Exam, { foreignKey: 'exam_id' });

Feedback.belongsTo(User, { foreignKey: 'user_id' });
Feedback.belongsTo(User, { foreignKey: 'replied_by', as: 'repliedUser' });

module.exports = {
  User,
  Department,
  Position,
  Regulation,
  Exam,
  Question,
  ExamRecord,
  Feedback
};