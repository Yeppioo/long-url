# 🌸 长链接生成器

一个简洁优雅的长链接生成服务，使用自定义Base2编码直接转换URL。

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/Yeppioo/long-url.git

# 安装依赖
npm install

# 启动服务
npm start
```

服务将在 `http://localhost:3001` 启动

## 🔧 编码原理

使用自定义Base2编码：
- `i` 表示 0
- `I` 表示 1

例如：`https://www.google.com` 
→ `https://i.iiiii.im/IIIiIiiiIIIiIiiiIIIiiiiiIIIiiIIii...`

## 📦 部署

项目已配置Vercel部署，只需：

1. Fork本项目
2. 在Vercel中导入项目
3. 绑定域名

## 🎯 使用方法

1. **生成长链接**：访问首页，输入URL，点击生成
2. **访问长链接**：直接访问生成的链接会自动重定向
3. **错误处理**：无效链接会显示错误页面

## 📄 许可证

GPL-3.0-or-later

---

💖 Made with love by [Yeppioo](https://github.com/Yeppioo)
