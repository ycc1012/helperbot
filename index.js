// 使用 webhook（需要配置 HTTPS）
const TelegramBot = require('node-telegram-bot-api')
const mineflayer = require('mineflayer')

const TOKEN = '8296648873:AAGUFl4OBpiEB28ZLwOUHPtQllHPqULcjjU'

// 使用 polling（本地测试用）
const tg = new TelegramBot(TOKEN, { polling: false })

// 设置 webhook（服务器需要 HTTPS）
// tg.setWebhook('https://your-domain.com/webhook')

// 手动获取更新
const fetch = require('fetch').fetchUrl

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'TelegramBot'
})

bot.on('spawn', () => {
  console.log('MC Bot logged in as', bot.username)
})

// Telegram → MC
tg.on('message', (msg) => {
  // 忽略命令
  if (msg.text && msg.text.startsWith('/')) {
    if (msg.text === '/start') {
      tg.sendMessage(msg.chat.id, 'Telegram → Minecraft 桥接已启动！')
    }
    return
  }
  
  const text = msg.from.username ? 
    `${msg.from.username}: ${msg.text}` : 
    `${msg.from.first_name}: ${msg.text}`
  
  console.log('TG → MC:', text)
  bot.chat(text)
})

console.log('Telegram Bridge Bot starting...')
