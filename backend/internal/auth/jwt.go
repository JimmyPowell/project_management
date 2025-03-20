package auth

import (
	"errors"
	"os"
	"project_management/internal/models"
	"project_management/internal/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("无效的令牌")
	ErrExpiredToken = errors.New("令牌已过期")
)

// TokenClaims JWT令牌的声明
type TokenClaims struct {
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	jwt.RegisteredClaims
}

// GenerateTokens 生成访问令牌和刷新令牌
func GenerateTokens(user *models.User) (string, string, error) {
	// 从环境变量获取配置
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	accessExpiry := os.Getenv("ACCESS_TOKEN_EXPIRY")
	refreshExpiry := os.Getenv("REFRESH_TOKEN_EXPIRY")

	// 解析过期时间
	accessDuration, err := time.ParseDuration(accessExpiry)
	if err != nil {
		accessDuration = 15 * time.Minute // 默认为15分钟
	}

	refreshDuration, err := time.ParseDuration(refreshExpiry)
	if err != nil {
		refreshDuration = 7 * 24 * time.Hour // 默认为7天
	}

	// 创建访问令牌
	accessClaims := &TokenClaims{
		UserID: user.ID,
		Name:   user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.Username,
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		return "", "", err
	}

	// 创建刷新令牌
	refreshClaims := &TokenClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.Username,
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtSecret)
	if err != nil {
		return "", "", err
	}

	// 保存刷新令牌到数据库
	expiresAt := time.Now().Add(refreshDuration)
	err = repository.SaveRefreshToken(user.ID, refreshTokenString, expiresAt)
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

// ValidateToken 验证JWT令牌
func ValidateToken(tokenString string) (*TokenClaims, error) {
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证签名方法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return jwtSecret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

// RefreshAccessToken 使用刷新令牌刷新访问令牌
func RefreshAccessToken(refreshTokenString string) (string, error) {
	// 验证刷新令牌
	claims, err := ValidateToken(refreshTokenString)
	if err != nil {
		return "", err
	}

	// 检查数据库中的刷新令牌
	refreshToken, err := repository.GetRefreshToken(refreshTokenString)
	if err != nil || refreshToken == nil {
		return "", ErrInvalidToken
	}

	// 检查令牌是否过期
	if refreshToken.IsExpired() {
		repository.DeleteRefreshToken(refreshTokenString)
		return "", ErrExpiredToken
	}

	// 获取用户信息
	user, err := repository.GetUserByID(claims.UserID)
	if err != nil || user == nil {
		return "", errors.New("用户不存在")
	}

	// 从环境变量获取配置
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	accessExpiry := os.Getenv("ACCESS_TOKEN_EXPIRY")

	// 解析过期时间
	accessDuration, err := time.ParseDuration(accessExpiry)
	if err != nil {
		accessDuration = 15 * time.Minute // 默认为15分钟
	}

	// 创建新的访问令牌
	accessClaims := &TokenClaims{
		UserID: user.ID,
		Name:   user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.Username,
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return accessTokenString, nil
} 