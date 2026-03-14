import socket
import struct
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

TOKEN = '8296648873:AAGUFl4OBpiEB28ZLwOUHPtQllHPqULcjjU'
MC_HOST = '111.231.77.118'
MC_PORT = 25575
MC_PASSWORD = 'mcpassword'

def send_to_mc(username, text):
    """通过 RCON 发送消息到 MC"""
    msg = f'/tellraw @a {{"text":"[TG] {username}: {text}"}}'
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((MC_HOST, MC_PORT))
        
        # Login
        pkt_id = 1
        pkt_type = 3
        payload = MC_PASSWORD.encode('utf-8') + b'\x00\x00'
        pkt = struct.pack('<ii', pkt_id, pkt_type) + payload
        pkt = struct.pack('<i', len(pkt)) + pkt
        sock.sendall(pkt)
        sock.recv(4096)
        
        # Send command
        pkt_id = 2
        pkt_type = 2
        payload = msg.encode('utf-8') + b'\x00\x00'
        pkt = struct.pack('<ii', pkt_id, pkt_type) + payload
        pkt = struct.pack('<i', len(pkt)) + pkt
        sock.sendall(pkt)
        sock.recv(4096)
        
        sock.close()
        print(f'TG → MC: {username}: {text}')
    except Exception as e:
        print(f'Error: {e}')

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('Telegram → Minecraft 桥接已启动！')

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    if text.startswith('/'):
        return
    
    user = update.effective_user
    username = user.username or user.first_name
    
    send_to_mc(username, text)

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start_command))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

print('Telegram Bridge Bot 启动中...')
app.run_polling()
