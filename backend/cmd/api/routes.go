package main

import (
	"project_management/internal/handlers"
	"project_management/internal/middleware"

	"github.com/gin-gonic/gin"
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