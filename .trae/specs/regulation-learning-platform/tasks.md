# 制度学习与问题反馈平台 - 实施计划

## [ ] Task 1: 项目初始化与技术架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化前端项目（Vue 3 + Vite + Element Plus + Pinia + Vue Router）
  - 初始化后端项目（Express + Sequelize + MySQL + JWT + Multer）
  - 配置开发环境（数据库连接、环境变量等）
  - 创建项目基础目录结构
- **Acceptance Criteria Addressed**: [FR-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 前端项目可以正常启动并访问
  - `programmatic` TR-1.2: 后端项目可以正常启动并连接数据库
  - `programmatic` TR-1.3: 项目目录结构符合设计规范
- **Notes**: 确保项目能够正常运行，为后续开发奠定基础

## [ ] Task 2: 数据库模型与用户认证系统
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建所有数据库表（用户、部门、岗位、制度、考试、试题、考试记录、问题反馈）
  - 实现用户注册/登录 API（JWT Token 认证）
  - 实现密码加密存储（bcrypt）
  - 实现认证中间件
- **Acceptance Criteria Addressed**: [AC-1, FR-1]
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有数据库表创建成功
  - `programmatic` TR-2.2: 用户注册接口返回 200 并创建用户记录
  - `programmatic` TR-2.3: 用户登录接口返回 JWT Token
  - `programmatic` TR-2.4: 认证中间件可以正确验证 Token
- **Notes**: 密码必须加密存储，不能明文保存

## [ ] Task 3: 部门与岗位管理
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现部门 CRUD API（支持层级结构）
  - 实现岗位 CRUD API（与部门关联）
  - 实现后台管理端部门/岗位管理页面
- **Acceptance Criteria Addressed**: [AC-7, FR-2]
- **Test Requirements**:
  - `programmatic` TR-3.1: 可以创建、编辑、删除部门
  - `programmatic` TR-3.2: 可以创建、编辑、删除岗位，且岗位必须关联部门
  - `programmatic` TR-3.3: 后台页面可以正常展示部门树和岗位列表
  - `human-judgment` TR-3.4: 页面操作流畅，用户体验良好
- **Notes**: 部门支持多级嵌套结构

## [ ] Task 4: 用户管理功能
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现用户 CRUD API
  - 实现用户密码重置 API
  - 实现用户启用/禁用 API
  - 实现后台管理端用户管理页面
- **Acceptance Criteria Addressed**: [FR-3]
- **Test Requirements**:
  - `programmatic` TR-4.1: 可以创建、编辑、删除用户
  - `programmatic` TR-4.2: 可以重置用户密码
  - `programmatic` TR-4.3: 可以启用/禁用用户账户
  - `programmatic` TR-4.4: 后台页面可以正常展示用户列表和操作
- **Notes**: 禁用的用户无法登录

## [ ] Task 5: 制度学习内容管理
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现 PDF 文件上传 API（multer）
  - 实现制度 CRUD API（包含权限设置）
  - 实现制度发布/下架 API
  - 实现后台管理端制度管理页面
  - 实现前台制度列表和详情页面
  - 实现 PDF.js 渲染器，禁用下载、复制、打印等操作
- **Acceptance Criteria Addressed**: [AC-2, AC-3, FR-4]
- **Test Requirements**:
  - `programmatic` TR-5.1: 可以上传 PDF 文件并保存
  - `programmatic` TR-5.2: 可以创建、编辑、删除制度，设置可见部门/岗位
  - `programmatic` TR-5.3: 制度列表按用户权限过滤
  - `human-judgment` TR-5.4: PDF 文档无法右键、无法选择文本、无法复制、无法打印
  - `human-judgment` TR-5.5: PDF 渲染正常，可正常翻页查看
- **Notes**: PDF 文件存储在服务器本地 uploads 目录

## [ ] Task 6: 在线考试系统
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 实现考试 CRUD API（包含权限设置）
  - 实现试题 CRUD API（支持单选、多选、判断题）
  - 实现考试提交和自动评分 API
  - 实现考试记录查询 API
  - 实现后台管理端考试管理页面
  - 实现前台考试列表、考试页面、成绩页面、历史记录页面
- **Acceptance Criteria Addressed**: [AC-4, AC-8, FR-5]
- **Test Requirements**:
  - `programmatic` TR-6.1: 可以创建、编辑、删除考试和试题
  - `programmatic` TR-6.2: 考试列表按用户权限过滤
  - `programmatic` TR-6.3: 提交考试答案后自动评分并保存记录
  - `programmatic` TR-6.4: 可以查看历史考试记录
  - `human-judgment` TR-6.5: 考试页面交互流畅，用户体验良好
- **Notes**: 试题支持三种类型：单选题、多选题、判断题

## [ ] Task 7: 问题反馈系统
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 实现问题反馈提交 API
  - 实现反馈查看和回复 API
  - 实现反馈状态更新 API
  - 实现后台管理端反馈管理页面
  - 实现前台反馈提交和我的反馈页面
- **Acceptance Criteria Addressed**: [AC-5, FR-6]
- **Test Requirements**:
  - `programmatic` TR-7.1: 员工可以提交问题反馈
  - `programmatic` TR-7.2: 管理员可以查看、回复反馈，更新状态
  - `programmatic` TR-7.3: 员工可以查看自己的反馈和回复
  - `human-judgment` TR-7.4: 反馈页面操作流畅，用户体验良好
- **Notes**: 反馈状态分为待处理和已解决

## [ ] Task 8: 响应式设计与整体优化
- **Priority**: P1
- **Depends On**: Task 7
- **Description**: 
  - 实现响应式布局（适配移动端、平板、桌面端）
  - 优化页面加载速度
  - 添加错误处理和用户提示
  - 完善整体 UI 样式和交互
- **Acceptance Criteria Addressed**: [AC-6, NFR-1, NFR-2]
- **Test Requirements**:
  - `human-judgment` TR-8.1: 在不同尺寸设备上页面显示正常
  - `human-judgment` TR-8.2: 页面加载速度快，无明显卡顿
  - `human-judgment` TR-8.3: 错误提示友好，用户体验良好
  - `human-judgment` TR-8.4: 整体 UI 美观统一
- **Notes**: 使用 Element Plus 的栅格系统实现响应式
