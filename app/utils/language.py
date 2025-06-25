def detect_language(text: str) -> str:
    # Simple heuristic: check for Arabic Unicode range
    if any("\u0600" <= ch <= "\u06FF" for ch in text):
        return "ar"
    return "en"

TRANSLATIONS = {
    "en": {
        "cancel_success": "✅ Your request has been cancelled.",
        "start_request": "Send 'request exit' to start. You can cancel anytime by sending 'cancel'.",
        "choose_exit_method": "How will you exit?\n1. With a friend or relative\n2. Take a bus\n3. On your own",
        "invalid_exit_method": "Invalid choice. Reply with 1, 2, or 3.",
        "no_buses": "❌ No buses available currently.",
        "select_bus": "Select your bus:\n",
        "invalid_bus": "Invalid selection. Choose a valid bus number or name.",
        "request_sent": "Request sent to your parent.",
        "no_parent": "⚠️ No parent linked. Contact admin.",
        "parent_approved": "✅ Exit request approved.",
        "student_notified": "✅ Your parent has approved your exit request.",
        "otp_no_requests": "⚠️ OTP matched, but no pending requests found to approve.",
        "not_linked": "👋 Hello! This is the GatePass system.\n\nYou are not currently linked to any students. Please contact the university.",
        "intro_list": "👋 Hello! This is the GatePass system.\n\nYou're currently linked to the following student(s):\n{students}\n\n✅ When any of them makes an exit request, you'll receive an approval message with a code.\n❌ Your message didn't match a valid approval code, and there are no pending requests right now.\nFeel free to reply again later!",
    },
    "ar": {
        "cancel_success": "✅ تم إلغاء طلبك.",
        "start_request": "أرسل 'طلب خروج' للبدء. يمكنك الإلغاء في أي وقت بكتابة 'cancel'.",
        "choose_exit_method": "كيف ستخرج؟\n1. مع صديق أو قريب\n2. الحافلة\n3. بمفردك",
        "invalid_exit_method": "❌ اختيار غير صالح. أرسل 1 أو 2 أو 3.",
        "no_buses": "❌ لا توجد حافلات متاحة حالياً.",
        "select_bus": "اختر الحافلة:\n",
        "invalid_bus": "❌ اختيار غير صالح. أرسل رقم أو اسم الحافلة.",
        "request_sent": "تم إرسال الطلب إلى ولي أمرك.",
        "no_parent": "⚠️ لا يوجد ولي أمر مرتبط. تواصل مع الإدارة.",
        "parent_approved": "✅ تم الموافقة على الخروج.",
        "student_notified": "✅ تمت الموافقة على طلبك من قبل ولي الأمر.",
        "otp_no_requests": "⚠️ الرمز صحيح، لكن لا توجد طلبات معلقة.",
        "not_linked": "👋 مرحباً! هذا نظام GatePass.\n\nأنت غير مرتبط بأي طالب حالياً. الرجاء التواصل مع الجامعة.",
        "intro_list": "👋 مرحباً! هذا نظام GatePass.\n\nأنت مرتبط بالطلاب التاليين:\n{students}\n\n✅ عند تقديم أحدهم طلب خروج، ستتلقى رمز الموافقة.\n❌ لا توجد طلبات حالياً، والرسالة لم تطابق رمزاً صحيحاً.\nيمكنك المحاولة لاحقاً.",
    },
}

def translate(key: str, lang: str = "en", **kwargs) -> str:
    msg = TRANSLATIONS.get(lang, TRANSLATIONS["en"]).get(key, key)
    return msg.format(**kwargs)