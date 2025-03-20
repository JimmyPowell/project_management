#!/bin/bash

# 设置要构建的架构
PLATFORMS="linux/amd64,linux/arm64"

# 确保启用buildx
docker buildx version > /dev/null 2>&1 || { echo "Docker buildx 未安装或未启用，请参考 https://docs.docker.com/buildx/working-with-buildx/"; exit 1; }

# 创建或使用buildx构建器
BUILDER=$(docker buildx ls | grep mybuilder || echo "")
if [ -z "$BUILDER" ]; then
  echo "创建新的构建器实例..."
  docker buildx create --name mybuilder --use
else
  echo "使用现有构建器实例..."
  docker buildx use mybuilder
fi

# 检查构建器是否已经准备好
docker buildx inspect --bootstrap

echo "开始构建多架构镜像..."

# 构建并推送后端镜像
echo "构建后端镜像..."
docker buildx build --platform ${PLATFORMS} \
  -t yourregistry/pm-backend:latest \
  -f backend/Dockerfile \
  --push \
  ./backend

# 构建并推送前端镜像
echo "构建前端镜像..."
docker buildx build --platform ${PLATFORMS} \
  -t yourregistry/pm-frontend:latest \
  -f frontend/Dockerfile \
  --push \
  ./frontend

echo "多架构构建完成！"

# 如何使用说明
echo "--------------------------------------------------------"
echo "使用说明:"
echo "1. 修改脚本中的 'yourregistry' 为你的Docker仓库地址"
echo "2. 运行前确保已登录Docker仓库: docker login"
echo "3. 给脚本添加执行权限: chmod +x build-multiarch.sh"
echo "4. 执行: ./build-multiarch.sh"
echo "--------------------------------------------------------" 