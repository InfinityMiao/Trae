# 制度学习与问题反馈平台 - 设计文档

## 项目概述

制度学习与问题反馈平台是一个面向企业内部员工的学习系统，提供制度内容学习、在线考试和问题反馈功能，同时配备完整的后台管理系统。

## 技术选型

- **前端框架**：Vue 3 + Composition API
- **前端 UI**：Element Plus
- **前端状态管理**：Pinia
- **前端路由**：Vue Router
- **PDF 渲染**：PDF.js
- **后端框架**：Express.js
- **数据库**：MySQL
- **ORM**：Sequelize
- **认证**：JWT
- **文件上传**：Multer

## 项目架构

```
/workspace
├── frontend/                 # 前端项目（Vue 3）
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── views/           # 页面视图
│   │   │   ├── admin/       # 后台管理页面
│   │   │   └── user/        # 前台用户页面
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── api/             # API 接口封装
│   │   └── utils/           # 工具函数
│   └── package.json
├── backend/                  # 后端项目（Express）
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # Sequelize 模型
│   │   ├── routes/          # 路由
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   └── config/          # 配置文件
│   ├── uploads/             # 文件上传目录
│   └── package.json
└── README.md
```

## 数据模型设计

### 1. 用户表 (users)
```
id: 主键
username: 用户名（唯一）
password: 密码（加密存储）
name: 真实姓名
email: 邮箱
phone: 手机号
department_id: 部门ID（外键）
position_id: 岗位ID（外键）
avatar: 头像URL
status: 状态（active/ inactive）
created_at: 创建时间
updated_at: 更新时间
```

### 2. 部门表 (departments)
```
id: 主键
name: 部门名称
description: 部门描述
parent_id: 上级部门ID（支持层级）
sort_order: 排序
created_at: 创建时间
updated_at: 更新时间
```

### 3. 岗位表 (positions)
```
id: 主键
department_id: 部门ID（外键，所属部门）
name: 岗位名称
description: 岗位描述
created_at: 创建时间
updated_at: 更新时间
```

### 4. 制度表 (regulations)
```
id: 主键
title: 制度标题
content: 制度描述
file_path: PDF文件路径
department_ids: 可见部门ID列表（JSON）
position_ids: 可见岗位ID列表（JSON）
publish_date: 发布日期
status: 状态（draft/ published）
view_count: 查看次数
created_by: 创建人ID
created_at: 创建时间
updated_at: 更新时间
```

### 5. 考试表 (exams)
```
id: 主键
title: 考试标题
description: 考试描述
regulation_id: 关联制度ID
pass_score: 及格分数
total_score: 总分
department_ids: 可见部门ID列表（JSON）
position_ids: 可见岗位ID列表（JSON）
created_by: 创建人ID
created_at: 创建时间
updated_at: 更新时间
```

### 6. 试题表 (questions)
```
id: 主键
exam_id: 考试ID（外键）
type: 题型（single_choice/ multiple_choice/ judgment）
content: 题目内容
options: 选项（JSON数组，选择题用）
correct_answer: 正确答案（JSON）
score: 分值
sort_order: 排序
created_at: 创建时间
updated_at: 更新时间
```

### 7. 考试记录表 (exam_records)
```
id: 主键
user_id: 用户ID（外键）
exam_id: 考试ID（外键）
submit_time: 提交时间
score: 得分
is_passed: 是否及格
answers: 用户答案（JSON）
created_at: 创建时间
```

### 8. 问题反馈表 (feedbacks)
```
id: 主键
user_id: 用户ID（外键）
title: 反馈标题
content: 反馈内容
category: 分类（regulation_question/ system_issue/ other）
status: 状态（pending/ resolved）
reply: 管理员回复
replied_by: 回复人ID
replied_at: 回复时间
created_at: 创建时间
updated_at: 更新时间
```

## 功能模块设计

### 前台用户端功能

1. **用户认证模块**
   - 登录/登出
   - 个人信息查看与修改
   - 密码修改

2. **制度学习模块**
   - 制度列表展示（按权限过滤）
   - 制度详情查看
   - PDF 阅读器（防下载、防复制、防打印）
   - 学习进度记录

3. **在线考试模块**
   - 考试列表展示（按权限过滤）
   - 参加考试
   - 自动评分
   - 考试结果查看
   - 历史考试记录

4. **问题反馈模块**
   - 提交反馈
   - 我的反馈列表
   - 查看反馈回复

### 后台管理端功能

1. **用户管理模块**
   - 用户列表
   - 添加/编辑/删除用户
   - 重置用户密码
   - 启用/禁用用户

2. **部门管理模块**
   - 部门树状展示
   - 添加/编辑/删除部门
   - 部门排序

3. **岗位管理模块**
   - 岗位列表（按部门筛选）
   - 添加/编辑/删除岗位

4. **制度管理模块**
   - 制度列表
   - 添加/编辑/删除制度
   - PDF 文件上传
   - 权限设置（可见部门/岗位）
   - 发布/下架制度
   - 查看学习统计

5. **考试管理模块**
   - 考试列表
   - 创建/编辑/删除考试
   - 试题管理（添加/编辑/删除试题）
   - 权限设置（可见部门/岗位）
   - 查看考试成绩统计

6. **问题反馈管理模块**
   - 反馈列表
   - 查看反馈详情
   - 回复反馈
   - 标记已解决

## 技术实现细节

### 前端关键实现

1. **PDF 防下载防复制实现**
   - 使用 `pdf.js` 渲染 PDF 文档
   - 禁用右键菜单
   - 禁用文本选择
   - 禁用打印
   - 禁用键盘快捷键（Ctrl+C, Ctrl+P 等）

2. **响应式设计**
   - 使用 Element Plus 的栅格系统
   - 移动端适配：320px-768px
   - 平板适配：768px-1200px
   - 桌面端：1200px 以上

3. **路由权限控制**
   - 路由守卫验证用户登录状态
   - 根据用户角色（普通用户/管理员）显示不同菜单
   - 页面级权限验证

### 后端关键实现

1. **认证与授权**
   - JWT Token 认证
   - Token 刷新机制
   - 中间件验证 Token 有效性
   - 部门/岗位权限中间件

2. **文件上传**
   - 使用 `multer` 处理文件上传
   - 限制文件类型（仅 PDF）
   - 限制文件大小
   - 文件重命名避免冲突

3. **考试自动评分**
   - 比较用户答案与正确答案
   - 单选题：完全匹配得分
   - 多选题：完全匹配得分
   - 判断题：完全匹配得分
   - 即时计算总分和是否及格

4. **API 接口设计**
   - RESTful 风格
   - 统一响应格式
   - 错误处理中间件
   - 请求日志记录
