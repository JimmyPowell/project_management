# 使用官方golang镜像作为构建环境
FROM golang:1.23-alpine AS builder

# 设置工作目录
WORKDIR /app

# 将go模块依赖复制到容器中
COPY go.mod go.sum ./
RUN go mod download

# 将源代码复制到容器中
COPY . .

# 构建应用程序
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

# 使用轻量级镜像作为最终镜像
FROM alpine:latest

# 安装ca-certificates以支持HTTPS请求
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# 从构建阶段复制二进制文件
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

# 暴露应用端口
EXPOSE 8080

# 运行应用
CMD ["./main"] 