# Aneko - r2 oss

基于 Cloudflare Workers 的轻量级 R2 对象存储文件管理界面。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **后端**：Cloudflare Workers
- **存储**：Cloudflare R2
- **验证**：Cloudflare Turnstile

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 部署

1. 构建前端：`npm run build`
2. 将 `dist/` 部署到 Cloudflare Workers 的静态站点
3. 配置 `worker/wrangler.toml` 中的 R2 桶名称和密钥

## 项目结构

```
frontend/
├── src/
│   ├── components/    # UI 组件
│   ├── hooks/         # 自定义 Hooks
│   ├── store/         # Zustand 状态管理
│   ├── utils/         # 工具函数和 API 封装
│   └── types/         # TypeScript 类型定义
└── public/            # 静态资源
```