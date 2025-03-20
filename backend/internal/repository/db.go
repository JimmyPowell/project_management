package repository

import (
	"fmt"
	"log"
	"os"

	"project_management/internal/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB() {
	// 加载环境变量
	err := godotenv.Load()
	if err != nil {
		log.Println("未找到.env文件，将使用环境变量")
	}

	dbDriver := os.Getenv("DB_DRIVER")

	if dbDriver == "mysql" {
		// MySQL连接配置
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("DB_NAME")
		dbCharset := os.Getenv("DB_CHARSET")
		
		if dbCharset == "" {
			dbCharset = "utf8mb4"
		}
		
		// 构建DSN (Data Source Name)
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=true&loc=Local",
			dbUser, dbPassword, dbHost, dbPort, dbName, dbCharset)
			
		// 连接MySQL
		db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.Fatalf("无法连接到MySQL数据库: %v", err)
		}
		
		DB = db
	} else {
		// SQLite连接(保留原代码作为备选)
		dbPath := os.Getenv("DB_PATH")
		if dbPath == "" {
			dbPath = "./database.db"
		}
		
		db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.Fatalf("无法连接到SQLite数据库: %v", err)
		}
		
		DB = db
	}

	// 自动迁移模型
	err = DB.AutoMigrate(
		&models.User{},
		&models.Task{},
		&models.Milestone{},
		&models.RefreshToken{},
	)
	if err != nil {
		log.Fatalf("自动迁移失败: %v", err)
	}

	log.Println("数据库初始化完成")
}

// GetDB 获取数据库连接
func GetDB() *gorm.DB {
	return DB
} 