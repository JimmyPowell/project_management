package main

import (
	"fmt"
	"log"
	"os"
	"project_management/internal/handlers"
	"project_management/internal/middleware"
	"project_management/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// setupRoutes 设置API路由
func setupRoutes(router *gin.Engine) {
	// 公开路由
	public := router.Group("/api")
	{
		// 认证相关路由
		auth := public.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
			auth.POST("/refresh", handlers.RefreshToken)
			auth.POST("/logout", handlers.Logout)
		}
	}

	// 受保护路由
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// 用户相关路由
		user := protected.Group("/user")
		{
			user.GET("/me", handlers.GetCurrentUser)
		}

		// 任务相关路由
		tasks := protected.Group("/tasks")
		{
			tasks.GET("", handlers.GetAllTasks)
			tasks.GET("/:id", handlers.GetTaskByID)
			tasks.POST("", handlers.CreateTask)
			tasks.PUT("/:id", handlers.UpdateTask)
			tasks.DELETE("/:id", handlers.DeleteTask)
		}

		// 里程碑相关路由
		milestones := protected.Group("/milestones")
		{
			milestones.GET("", handlers.GetAllMilestones)
			milestones.GET("/:id", handlers.GetMilestoneByID)
			milestones.POST("", handlers.CreateMilestone)
			milestones.PUT("/:id", handlers.UpdateMilestone)
			milestones.DELETE("/:id", handlers.DeleteMilestone)
		}
	}
}

func main() {
	// 加载环境变量
	err := godotenv.Load()
	if err != nil {
		log.Println("未找到.env文件，将使用环境变量")
	}

	// 初始化数据库
	repository.InitDB()

	// 设置Gin模式
	gin.SetMode(gin.ReleaseMode)
	if os.Getenv("GIN_MODE") != "" {
		gin.SetMode(os.Getenv("GIN_MODE"))
	}

	// 创建Gin实例
	router := gin.Default()
	
	// 添加CORS中间件
	router.Use(middleware.CorsMiddleware())

	// 设置API路由
	setupRoutes(router)

	// 获取端口
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 启动服务器
	log.Printf("服务器启动在端口 %s", port)
	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
}