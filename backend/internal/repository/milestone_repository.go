package repository

import (
	"errors"
	"project_management/internal/models"

	"gorm.io/gorm"
)

// CreateMilestone 创建里程碑
func CreateMilestone(milestone *models.Milestone) error {
	return DB.Create(milestone).Error
}

// GetAllMilestones 获取所有里程碑
func GetAllMilestones() ([]models.Milestone, error) {
	var milestones []models.Milestone
	err := DB.Order("date asc").Find(&milestones).Error
	return milestones, err
}

// GetMilestoneByID 通过ID获取里程碑
func GetMilestoneByID(id uint) (*models.Milestone, error) {
	var milestone models.Milestone
	err := DB.First(&milestone, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &milestone, nil
}

// UpdateMilestone 更新里程碑
func UpdateMilestone(milestone *models.Milestone) error {
	return DB.Save(milestone).Error
}

// DeleteMilestone 删除里程碑
func DeleteMilestone(id uint) error {
	return DB.Delete(&models.Milestone{}, id).Error
} 