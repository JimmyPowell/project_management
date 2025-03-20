package models

import (
	"time"

	"gorm.io/gorm"
)

// Milestone 里程碑模型
type Milestone struct {
	ID          uint      `json:"id" gorm:"primarykey"`
	Title       string    `json:"title" gorm:"size:255;not null"`
	Date        time.Time `json:"date"`
	Description string    `json:"description" gorm:"size:1000"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// BeforeCreate 创建里程碑前的处理
func (m *Milestone) BeforeCreate(tx *gorm.DB) error {
	m.CreatedAt = time.Now()
	m.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate 更新里程碑前的处理
func (m *Milestone) BeforeUpdate(tx *gorm.DB) error {
	m.UpdatedAt = time.Now()
	return nil
} 