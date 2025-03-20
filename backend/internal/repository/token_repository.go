package repository

import (
	"project_management/internal/models"
	"time"
)

// SaveRefreshToken 保存刷新令牌
func SaveRefreshToken(userID uint, token string, expiresAt time.Time) error {
	refreshToken := models.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
	}
	return DB.Create(&refreshToken).Error
}

// GetRefreshToken 获取刷新令牌
func GetRefreshToken(token string) (*models.RefreshToken, error) {
	var refreshToken models.RefreshToken
	err := DB.Where("token = ?", token).First(&refreshToken).Error
	if err != nil {
		return nil, err
	}
	return &refreshToken, nil
}

// DeleteRefreshToken 删除刷新令牌
func DeleteRefreshToken(token string) error {
	return DB.Where("token = ?", token).Delete(&models.RefreshToken{}).Error
}

// DeleteExpiredTokens 删除过期的刷新令牌
func DeleteExpiredTokens() error {
	return DB.Where("expires_at < ?", time.Now()).Delete(&models.RefreshToken{}).Error
}

// DeleteUserTokens 删除用户的所有刷新令牌
func DeleteUserTokens(userID uint) error {
	return DB.Where("user_id = ?", userID).Delete(&models.RefreshToken{}).Error
} 