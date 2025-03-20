package repository

import (
	"errors"
	"project_management/internal/models"

	"gorm.io/gorm"
)

// CreateTask 创建任务
func CreateTask(task *models.Task) error {
	return DB.Create(task).Error
}

// GetAllTasks 获取所有任务
func GetAllTasks() ([]models.Task, error) {
	var tasks []models.Task
	err := DB.Order("created_at desc").Find(&tasks).Error
	return tasks, err
}

// GetTaskByID 通过ID获取任务
func GetTaskByID(id uint) (*models.Task, error) {
	var task models.Task
	err := DB.First(&task, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &task, nil
}

// UpdateTask 更新任务
func UpdateTask(task *models.Task) error {
	return DB.Save(task).Error
}

// DeleteTask 删除任务
func DeleteTask(id uint) error {
	return DB.Delete(&models.Task{}, id).Error
} 