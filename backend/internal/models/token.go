package models

import (
	"time"

	"gorm.io/gorm"
)

// RefreshToken 刷新令牌模型
type RefreshToken struct {
	ID        uint      `json:"id" gorm:"primarykey"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	Token     string    `json:"token" gorm:"size:255;not null;unique"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate 创建令牌前的处理
func (rt *RefreshToken) BeforeCreate(tx *gorm.DB) error {
	rt.CreatedAt = time.Now()
	return nil
}

// IsExpired 检查令牌是否过期
func (rt *RefreshToken) IsExpired() bool {
	return time.Now().After(rt.ExpiresAt)
} 