# 项目管理系统

一个基于Go和Next.js开发的现代化项目管理系统，支持团队里程碑管理、任务跟踪和用户认证。

## 功能特点

- 用户注册和登录（JWT双令牌认证）
- 创建、查看、编辑和删除项目里程碑
- 创建、查看、编辑和删除任务
- 支持任务的状态和优先级管理
- 响应式UI设计，支持移动和桌面浏览器

## 技术栈

### 后端
- Go语言
- Gin Web框架
- GORM (Go ORM库)
- MySQL数据库
- JWT认证

### 前端
- Next.js 14
- React
- TypeScript
- TailwindCSS
- ShadcnUI组件库

## 快速开始

### 后端设置

1. 进入后端目录:
   ```bash
   cd backend
   ```

2. 安装依赖:
   ```bash
   go mod tidy
   ```

3. 创建`.env`文件(默认已经提供，可根据需要修改):
   ```
   PORT=8080
   JWT_SECRET=your_jwt_secret_key_change_in_production
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   # MySQL配置
   DB_DRIVER=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=你的用户名
   DB_PASSWORD=你的密码
   DB_NAME=project_management
   DB_CHARSET=utf8mb4
   DB_PARSEDATE=True
   ```

4. 启动服务器:
   ```bash
   go run main.go
   ```

服务器将在 http://localhost:8080 上运行。

### 前端设置

1. 进入前端目录:
   ```bash
   cd frontend
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

前端应用将在 http://localhost:3000 上运行。

## Docker部署

本项目支持使用Docker进行部署，提供了完整的Docker配置文件。

### 使用Docker Compose快速部署

1. 在项目根目录下，直接运行:
   ```bash
   docker-compose up -d
   ```

2. 服务将在以下地址运行:
   - 前端: http://localhost:3000
   - 后端: http://localhost:8080
   - MySQL: localhost:3306

### 分别构建和运行容器

如果需要单独构建和运行各个服务，可以使用以下命令:

1. 构建并运行后端:
   ```bash
   cd backend
   docker build -t pm-backend .
   docker run -p 8080:8080 pm-backend
   ```

2. 构建并运行前端:
   ```bash
   cd frontend
   docker build -t pm-frontend .
   docker run -p 3000:3000 pm-frontend
   ```

### 构建多架构Docker镜像

如果需要在不同CPU架构(如ARM和x86-64)之间共享镜像，可以使用我们提供的多架构构建脚本:

1. 给脚本添加执行权限:
   ```bash
   chmod +x build-multiarch.sh
   ```

2. 修改脚本中的Docker仓库地址(如Docker Hub用户名):
   ```bash
   # 编辑脚本
   nano build-multiarch.sh
   # 将 yourregistry 改为你自己的Docker仓库
   ```

3. 登录到Docker仓库:
   ```bash
   docker login
   ```

4. 运行构建脚本:
   ```bash
   ./build-multiarch.sh
   ```

5. 等待构建完成后，可以在任何支持的架构上使用以下命令拉取和运行:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新访问令牌
- `POST /api/auth/logout` - 用户登出
- `GET /api/user/me` - 获取当前用户信息

### 任务接口
- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks/:id` - 获取单个任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 里程碑接口
- `GET /api/milestones` - 获取所有里程碑
- `GET /api/milestones/:id` - 获取单个里程碑
- `POST /api/milestones` - 创建里程碑
- `PUT /api/milestones/:id` - 更新里程碑
- `DELETE /api/milestones/:id` - 删除里程碑

## 数据模型

### 用户(User)
- `id`: 用户ID
- `username`: 用户名（唯一）
- `password`: 密码（加密存储）
- `name`: 用户姓名
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 任务(Task)
- `id`: 任务ID
- `name`: 任务名称
- `deadline`: 截止日期
- `status`: 任务状态（待处理、进行中、已完成、已延期）
- `urgency`: 紧急程度（低、中、高、紧急）
- `assignee`: 负责人
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 里程碑(Milestone)
- `id`: 里程碑ID
- `title`: 标题
- `date`: 日期
- `description`: 描述
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 许可证

MIT 