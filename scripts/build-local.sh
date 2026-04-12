#!/bin/bash

# 本地构建脚本
# 用于在本地测试构建

set -e

echo "🚀 开始本地构建..."
echo ""

# 检查 Node.js 和 npm
echo "📋 检查环境..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# 安装依赖
echo "📥 安装依赖..."
npm ci || npm install
echo ""

# 构建项目
echo "🔨 构建项目..."
echo "构建开始时间: $(date)"
npm run build
echo "构建完成时间: $(date)"
echo ""

# 检查构建结果
if [ -d ".next" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建输出目录: .next/"
    echo ""
    echo "📊 构建统计:"
    du -sh .next/ 2>/dev/null || echo "无法获取大小"
    
    echo ""
    echo "💡 提示："
    echo "   - 构建产物在 .next/ 目录"
    echo "   - 可以使用 'npm start' 本地测试生产版本"
else
    echo "❌ 构建失败：未找到 .next 目录"
    exit 1
fi
