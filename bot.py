import json
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# تنظیمات لاگ برای دیباگ
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

# ⚠️ توکن رباتت و لینک گیت‌هاب پیجز (یا هر هاست HTTPS دیگر) را اینجا بذار
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
WEBAPP_URL = "https://your-username.github.io/german-tma/"

# هندلر دستور /start
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_first_name = update.effective_user.first_name
    
    # ساخت دکمه شیشه‌ای (Inline) که WebApp را باز می‌کند
    keyboard = [
        [InlineKeyboardButton(
            text="🎮 شروع چالش Der / Die / Das", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = (
        f"سلام {user_first_name}! 🇩🇪\n\n"
        "آماده‌ای در ۶۰ ثانیه سرعت عملت رو در تشخیص آرتیکل‌های آلمانی بسنجی؟\n"
        "روی دکمه زیر کلیک کن تا بازی باز بشه:"
    )
    
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)

# هندلر دریافت اطلاعات از Mini App (وقتی کاربر دکمه "ثبت امتیاز" را در بازی می‌زند)
async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # دریافت داده‌های JSON ارسال شده از جاوااسکریپت (متد tg.sendData)
    raw_data = update.effective_message.web_app_data.data
    data = json.loads(raw_data)
    
    score = data.get("score", 0)
    wrong_count = data.get("wrong_count", 0)
    wrong_words = data.get("wrong_words", [])
    
    # ساخت متن پاسخ برای کاربر
    response_text = f"🔥 **نتیجه بازی تو ثبت شد!**\n\n🏆 امتیاز نهایی: `{score}`\n"
    
    if wrong_count > 0:
        words_list_str = "\n".join([f"🔸 {w}" for w in wrong_words])
        response_text += f"\n⚠️ تو در این راند {wrong_count} کلمه رو اشتباه زدی. حتماً مرورشان کن:\n{words_list_str}"
    else:
        response_text += "\n🎉 بی‌نظیر! هیچ اشتباهی نداشتی!"
        
    await update.message.reply_text(response_text, parse_mode="Markdown")

if __name__ == "__main__":
    print("🤖 ربات روشن شد و آماده دریافت پیام است...")
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # اتصال هندلرها
    app.add_handler(CommandHandler("start", start_command))
    # این هندلر مخصوص دریافت اطلاعات از WebApp است
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))
    
    app.run_polling()