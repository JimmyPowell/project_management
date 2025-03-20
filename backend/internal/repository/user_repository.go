package repository

import (
	"errors"
	"project_management/internal/models"

	"gorm.io/gorm"
)

// CreateUser 创建用户
func CreateUser(user *models.User) error {
	return DB.Create(user).Error
}

// GetUserByID 通过ID获取用户
func GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := DB.First(&user, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// GetUserByUsername 通过用户名获取用户
func GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	err := DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// UpdateUser 更新用户信息
func UpdateUser(user *models.User) error {
	return DB.Save(user).Error
}

// DeleteUser 删除用户
func DeleteUser(id uint) error {
	return DB.Delete(&models.User{}, id).Error
}

// GetTotalUserCount 获取用户总数
func GetTotalUserCount() (int64, error) {
	var count int64
	err := DB.Model(&models.User{}).Count(&count).Error
	return count, err
} 