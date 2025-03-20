package middleware

import (
	"net/http"
	"project_management/internal/auth"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware 身份验证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从请求头中获取令牌
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "未提供授权令牌"})
			c.Abort()
			return
		}

		// 提取Bearer令牌
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的授权格式"})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// 验证令牌
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			if err == auth.ErrExpiredToken {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "令牌已过期", "code": "token_expired"})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的令牌"})
			}
			c.Abort()
			return
		}

		// 将用户信息添加到上下文
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Subject)
		c.Set("name", claims.Name)

		c.Next()
	}
} 