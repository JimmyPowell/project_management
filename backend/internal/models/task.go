package models

import (
	"time"

	"gorm.io/gorm"
)

// TaskStatus 任务状态类型
type TaskStatus string

// 任务状态常量
const (
	TaskStatusPending   TaskStatus = "待处理"
	TaskStatusInProcess TaskStatus = "进行中"
	TaskStatusCompleted TaskStatus = "已完成"
	TaskStatusDelayed   TaskStatus = "已延期"
)

// TaskUrgency 任务紧急程度类型
type TaskUrgency string

// 任务紧急程度常量
const (
	TaskUrgencyLow      TaskUrgency = "低"
	TaskUrgencyMedium   TaskUrgency = "中"
	TaskUrgencyHigh     TaskUrgency = "高"
	TaskUrgencyUrgent   TaskUrgency = "紧急"
)

// Task 任务模型
type Task struct {
	ID        uint       `json:"id" gorm:"primarykey"`
	Name      string     `json:"name" gorm:"size:255;not null"`
	Deadline  time.Time  `json:"deadline"`
	Status    TaskStatus `json:"status" gorm:"size:20;not null;default:'待处理'"`
	Urgency   TaskUrgency `json:"urgency" gorm:"size:20;not null;default:'中'"`
	Assignee  string     `json:"assignee" gorm:"size:50"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// BeforeCreate 创建任务前的处理
func (t *Task) BeforeCreate(tx *gorm.DB) error {
	t.CreatedAt = time.Now()
	t.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate 更新任务前的处理
func (t *Task) BeforeUpdate(tx *gorm.DB) error {
	t.UpdatedAt = time.Now()
	return nil
} 