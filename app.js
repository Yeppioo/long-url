const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  next();
});

// URL编码函数：将URL转换为自定义base2编码
function encodeUrlToCustomBase2(url) {
  try {
    // 将URL转换为UTF-8字节，然后转换为二进制字符串
    const utf8Bytes = new TextEncoder().encode(url);
    let binaryString = '';

    for (let byte of utf8Bytes) {
      // 将每个字节转换为8位二进制字符串
      binaryString += byte.toString(2).padStart(8, '0');
    }

    // 将二进制字符串转换为自定义编码：0->i, 1->I
    return binaryString.replace(/0/g, 'i').replace(/1/g, 'I');
  } catch (error) {
    return null;
  }
}

// URL解码函数：将自定义base2编码转换回URL
function decodeCustomBase2ToUrl(encoded) {
  try {
    // 验证编码字符串只包含i和I
    if (!/^[iI]+$/.test(encoded)) {
      return null;
    }

    // 将自定义编码转换为二进制字符串：i->0, I->1
    const binaryString = encoded.replace(/i/g, '0').replace(/I/g, '1');

    // 确保二进制字符串长度是8的倍数
    if (binaryString.length % 8 !== 0) {
      return null;
    }

    // 将二进制字符串转换为字节数组
    const bytes = [];
    for (let i = 0; i < binaryString.length; i += 8) {
      const byte = parseInt(binaryString.substr(i, 8), 2);
      bytes.push(byte);
    }

    // 将字节数组转换为URL字符串
    const uint8Array = new Uint8Array(bytes);
    const url = new TextDecoder().decode(uint8Array);

    return url;
  } catch (error) {
    return null;
  }
}

// 验证URL格式
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// 生成HTML页面的函数
function generateHTML(isErrorPage = false) {
  const errorMessage = isErrorPage ? `
    <div class="error-message">
      <h2>链接错误</h2>
      <p>抱歉，您访问的链接转码错误</p>
      <p>请检查拼写是否正确</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>长链接生成器 - i.iiiii.im</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #fdf2f8;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(251, 207, 232, 0.2);
            border: 1px solid #fce7f3;
            padding: 40px;
            width: 100%;
            max-width: 500px;
            text-align: center;
        }

        .logo {
            font-size: 2.5em;
            font-weight: 600;
            color: #ec4899;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #a78bfa;
            margin-bottom: 30px;
            font-size: 1.1em;
            font-weight: 400;
        }

        .error-message {
            background: #fdf2f8;
            border: 1px solid #fbcfe8;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            color: #ec4899;
        }

        .error-message h2 {
            margin-bottom: 10px;
            font-size: 1.3em;
        }

        .form-group {
            margin-bottom: 25px;
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        input[type="url"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #fce7f3;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            outline: none;
            background: #ffffff;
        }

        input[type="url"]:focus {
            border-color: #f9a8d4;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(249, 168, 212, 0.1);
        }

        .btn {
            background: #f9a8d4;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            box-shadow: 0 4px 15px rgba(249, 168, 212, 0.2);
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(249, 168, 212, 0.3);
            background: #ec4899;
        }

        .btn:active {
            transform: translateY(0);
        }

        .result {
            margin-top: 25px;
            padding: 20px;
            background: #fdf2f8;
            border-radius: 10px;
            border: 1px solid #fce7f3;
            display: none;
        }

        .result.show {
            display: block;
        }

        .short-url {
            background: #ffffff;
            border: 2px solid #fce7f3;
            border-radius: 8px;
            padding: 12px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
            color: #ec4899;
        }

        .copy-btn {
            background: #f9a8d4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            margin-top: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(249, 168, 212, 0.2);
        }

        .copy-btn:hover {
            background: #ec4899;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(249, 168, 212, 0.3);
        }

        .footer {
            margin-top: 30px;
            color: #a78bfa;
            font-size: 0.9em;
        }

        .footer a {
            color: #ec4899;
            text-decoration: none;
            font-weight: 400;
            transition: color 0.3s ease;
        }

        .footer a:hover {
            color: #a78bfa;
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .container {
                padding: 30px 20px;
            }

            .logo {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">i.iiiii.im</div>
        <div class="subtitle">长链接生成器</div>

        ${errorMessage}

        <form id="urlForm">
            <div class="form-group">
                <label for="originalUrl">请输入链接：</label>
                <input type="url" id="originalUrl" name="originalUrl" placeholder="https://example.com" required>
            </div>
            <button type="submit" class="btn">生成长链接</button>
        </form>

        <div id="result" class="result">
            <h3>生成成功！</h3>
            <div class="short-url" id="shortUrl"></div>
            <button class="copy-btn" onclick="copyToClipboard()">复制链接</button>
        </div>

        <div class="footer">
            <p>Powered by <a href="https://github.com/Yeppioo/long-url" target="_blank">Yeppioo</a></p>
        </div>
    </div>

    <script>
        // URL编码函数：将URL转换为自定义base2编码
        function encodeUrlToCustomBase2(url) {
            try {
                // 将URL转换为UTF-8字节，然后转换为二进制字符串
                const utf8Bytes = new TextEncoder().encode(url);
                let binaryString = '';

                for (let byte of utf8Bytes) {
                    // 将每个字节转换为8位二进制字符串
                    binaryString += byte.toString(2).padStart(8, '0');
                }

                // 将二进制字符串转换为自定义编码：0->i, 1->I
                return binaryString.replace(/0/g, 'i').replace(/1/g, 'I');
            } catch (error) {
                return null;
            }
        }

        // 验证URL格式
        function isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (_) {
                return false;
            }
        }

        document.getElementById('urlForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const originalUrl = document.getElementById('originalUrl').value;
            const resultDiv = document.getElementById('result');
            const shortUrlDiv = document.getElementById('shortUrl');

            if (!originalUrl) {
                alert('请提供有效的URL');
                return;
            }

            if (!isValidUrl(originalUrl)) {
                alert('请提供有效的HTTP/HTTPS链接');
                return;
            }

            // 直接调用编码函数
            const encoded = encodeUrlToCustomBase2(originalUrl);

            if (!encoded) {
                alert('编码失败，请稍后重试');
                return;
            }

            const shortUrl = 'https://i.iiiii.im/' + encoded;

  shortUrlDiv.textContent = shortUrl;
  resultDiv.classList.add('show');
});

function copyToClipboard() {
  const shortUrl = document.getElementById('shortUrl').textContent;
  navigator.clipboard.writeText(shortUrl).then(function () {
    const btn = document.querySelector('.copy-btn');
    const originalText = btn.textContent;
    btn.textContent = '已复制！';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}
    </script >
</body >
</html >
  `;
}

// 路由定义
// 根目录 - 显示URL生成界面
app.get('/', (_, res) => {
  res.send(generateHTML(false));
});



// 短链接重定向路由
app.get('/:code', (req, res) => {
  const { code } = req.params;

  // 解码
  const originalUrl = decodeCustomBase2ToUrl(code);

  if (!originalUrl || !isValidUrl(originalUrl)) {
    // 显示错误页面
    return res.send(generateHTML(true));
  }

  res.redirect(originalUrl);
});

app.listen(port, () => {
  console.log(`长链接服务运行在 http://localhost:${port}/`);
});

module.exports = app;
