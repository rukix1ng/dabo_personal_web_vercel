# Dabo Personal Web

这是一个基于 Next.js 的多语言站点项目，当前以 Vercel 部署为主。

## 本地开发

先安装依赖并启动开发服务器：

```bash
npm install
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
npm run dev
npm run build
npm run lint
npm run build:local
```

## 数据库

项目仍然保留远程 MySQL 数据库连接能力，数据库配置来自环境变量：

```bash
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

数据库初始化脚本位于 `scripts/init-db.sh`。

## 部署

推荐直接连接 GitHub 仓库并通过 Vercel 部署。

如果需要配置生产站点 URL，可在环境变量中设置：

```bash
NEXT_PUBLIC_BASE_URL
```

未设置时，应用会优先使用 Vercel 提供的生产域名。

## 技术栈

- Next.js
- React
- TypeScript
- MySQL
- Vercel
