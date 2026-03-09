# HelperBot

一个基于 Mineflayer 的 Minecraft 助手机器人，支持插件扩展。

## 功能

| 插件 | 命令 | 描述 |
|------|------|------|
| come | `come` | 让机器人过来 |
| follow | `follow <玩家>` | 跟随玩家 |
| follow.stop | `follow.stop` | 停止跟随 |
| find | `find <方块>` | 查找方块位置 |
| mine | `mine <方块>` | 挖掘方块（砍树/挖矿） |
| mine.stop | `mine.stop` | 停止挖掘 |
| mine.status | `mine.status` | 查看挖掘状态 |
| list | `list` | 查看背包 |
| give | `give <玩家> <物品>` | 给玩家物品 |
| gimme | `gimme <物品>` | 给自己物品 |

## 快速开始

### 安装依赖

```bash
cd helperbot
npm install
```

### 配置

编辑 `index.js` 修改配置：

```javascript
const CONFIG = {
  host: '服务器IP',
  port: 25565,
  username: 'HelperBot',
  masters: ['你的游戏名'],  // 可以使用命令的玩家
  pluginsDir: path.join(__dirname, 'plugins')
}
```

### 启动

```bash
node index.js
```

### 使用

在游戏中发送命令：

```
HelperBot, help
HelperBot, come
HelperBot, follow
HelperBot, find stone
HelperBot, mine log
HelperBot, list
```

或者直接说 `help`（如果你是 master）。

## 插件系统

### 插件结构

```
plugins/
├── come.js      # 过来
├── follow.js    # 跟随
├── find.js      # 找方块
├── list.js      # 背包
├── give.js      # 给物品
└── mine.js      # 挖矿
```

### 开发插件

创建新插件 `plugins/myplugin.js`：

```javascript
module.exports = {
  name: 'myplugin',
  version: '1.0.0',
  
  onLoad(bot, pathfinder) {
    console.log('插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    if (command === 'mycommand') {
      bot.chat('Hello!')
      return true  // 返回 true 表示已处理
    }
  }
}
```

重启 Bot 后自动加载新插件。

## 常见问题

### 1. find/mine 找不到方块

确保调用了 `await bot.waitForChunksToLoad()` 等待区块加载。

### 2. 移动失败

检查 `index.js` 中是否正确初始化了 Movements：

```javascript
const { Movements } = require('mineflayer-pathfinder')
const mcData = require('minecraft-data')(bot.version)
const defaultMovements = new Movements(bot, mcData)
bot.pathfinder.setMovements(defaultMovements)
```

## 技术栈

- [Mineflayer](https://github.com/PrismarineJS/mineflayer) - Minecraft Bot 框架
- [mineflayer-pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder) - 寻路插件
- [minecraft-data](https://github.com/PrismarineJS/minecraft-data) - 方块/物品数据

## License

MIT
