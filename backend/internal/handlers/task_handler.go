package handlers

import (
	"net/http"
	"project_management/internal/models"
	"project_management/internal/repository"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// 任务请求结构
type TaskRequest struct {
	Name     string           `json:"name" binding:"required"`
	Deadline string           `json:"deadline" binding:"required"`
	Status   models.TaskStatus `json:"status"`
	Urgency  models.TaskUrgency `json:"urgency"`
	Assignee string           `json:"assignee" binding:"required"`
}

// GetAllTasks 获取所有任务
func GetAllTasks(c *gin.Context) {
	tasks, err := repository.GetAllTasks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取任务失败"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// GetTaskByID 根据ID获取任务
func GetTaskByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务ID"})
		return
	}

	task, err := repository.GetTaskByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取任务失败"})
		return
	}

	if task == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// CreateTask 创建任务
func CreateTask(c *gin.Context) {
	var req TaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	// 解析截止日期
	deadline, err := time.Parse("2006-01-02", req.Deadline)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的日期格式"})
		return
	}

	// 默认值处理
	if req.Status == "" {
		req.Status = models.TaskStatusPending
	}
	if req.Urgency == "" {
		req.Urgency = models.TaskUrgencyMedium
	}

	// 创建任务
	task := &models.Task{
		Name:     req.Name,
		Deadline: deadline,
		Status:   req.Status,
		Urgency:  req.Urgency,
		Assignee: req.Assignee,
	}

	if err := repository.CreateTask(task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建任务失败"})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// UpdateTask 更新任务
func UpdateTask(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务ID"})
		return
	}

	// 获取现有任务
	existingTask, err := repository.GetTaskByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取任务失败"})
		return
	}

	if existingTask == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	// 解析请求数据
	var req TaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	// 解析截止日期
	deadline, err := time.Parse("2006-01-02", req.Deadline)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的日期格式"})
		return
	}

	// 更新任务字段
	existingTask.Name = req.Name
	existingTask.Deadline = deadline
	existingTask.Status = req.Status
	existingTask.Urgency = req.Urgency
	existingTask.Assignee = req.Assignee

	// 保存更新
	if err := repository.UpdateTask(existingTask); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新任务失败"})
		return
	}

	c.JSON(http.StatusOK, existingTask)
}

// DeleteTask 删除任务
func DeleteTask(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的任务ID"})
		return
	}

	// 检查任务是否存在
	existingTask, err := repository.GetTaskByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取任务失败"})
		return
	}

	if existingTask == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	// 删除任务
	if err := repository.DeleteTask(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除任务失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "任务已删除"})
} 