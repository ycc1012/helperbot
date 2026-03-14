# Telegram ↔ Minecraft Bridge

Telegram 消息转发到 Minecraft 游戏内。

## 快速开始

### 1. 安装依赖

```bash
cd C:\Users\13123\.openclaw\workspace\tg-mc-bridge
uv pip install python-telegram-bot
```

### 2. 配置

编辑 `tg_bridge.py`，修改以下配置：

```python
TOKEN = '你的Telegram_Bot_Token'
MC_HOST = '111.231.77.118'  # MC服务器IP
MC_PORT = 25575             # RCON端口
MC_PASSWORD = 'mcpassword'  # RCON密码
```

### 3. 运行

```bash
uv run python tg_bridge.py
```

## 功能

- Telegram 消息转发到 MC 游戏内
- MC 玩家消息转发到 Telegram
- 支持彩色消息

## 文件说明

| 文件 | 说明 |
|------|------|
| `tg_bridge.py` | 主程序 |
| `helperbot/` | HelperBot (mineflayer) |
| `test_bot.py` | 测试脚本 |

## HelperBot

详见 `helperbot/README.md`
