package handlers

import (
	"net/http"
	"project_management/internal/models"
	"project_management/internal/repository"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// 里程碑请求结构
type MilestoneRequest struct {
	Title       string `json:"title" binding:"required"`
	Date        string `json:"date" binding:"required"`
	Description string `json:"description"`
}

// GetAllMilestones 获取所有里程碑
func GetAllMilestones(c *gin.Context) {
	milestones, err := repository.GetAllMilestones()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取里程碑失败"})
		return
	}

	c.JSON(http.StatusOK, milestones)
}

// GetMilestoneByID 根据ID获取里程碑
func GetMilestoneByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的里程碑ID"})
		return
	}

	milestone, err := repository.GetMilestoneByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取里程碑失败"})
		return
	}

	if milestone == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "里程碑不存在"})
		return
	}

	c.JSON(http.StatusOK, milestone)
}

// CreateMilestone 创建里程碑
func CreateMilestone(c *gin.Context) {
	var req MilestoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	// 解析日期
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的日期格式"})
		return
	}

	// 创建里程碑
	milestone := &models.Milestone{
		Title:       req.Title,
		Date:        date,
		Description: req.Description,
	}

	if err := repository.CreateMilestone(milestone); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建里程碑失败"})
		return
	}

	c.JSON(http.StatusCreated, milestone)
}

// UpdateMilestone 更新里程碑
func UpdateMilestone(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的里程碑ID"})
		return
	}

	// 获取现有里程碑
	existingMilestone, err := repository.GetMilestoneByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取里程碑失败"})
		return
	}

	if existingMilestone == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "里程碑不存在"})
		return
	}

	// 解析请求数据
	var req MilestoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求数据"})
		return
	}

	// 解析日期
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的日期格式"})
		return
	}

	// 更新里程碑字段
	existingMilestone.Title = req.Title
	existingMilestone.Date = date
	existingMilestone.Description = req.Description

	// 保存更新
	if err := repository.UpdateMilestone(existingMilestone); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新里程碑失败"})
		return
	}

	c.JSON(http.StatusOK, existingMilestone)
}

// DeleteMilestone 删除里程碑
func DeleteMilestone(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的里程碑ID"})
		return
	}

	// 检查里程碑是否存在
	existingMilestone, err := repository.GetMilestoneByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取里程碑失败"})
		return
	}

	if existingMilestone == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "里程碑不存在"})
		return
	}

	// 删除里程碑
	if err := repository.DeleteMilestone(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除里程碑失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "里程碑已删除"})
} 