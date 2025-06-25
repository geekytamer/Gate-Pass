def is_exit_request(text: str) -> bool:
    text = text.lower().strip()

    # English variants
    english_triggers = [
        "request exit",
        "exit request",
        "i want to leave",
        "can i go out",
        "going out",
    ]

    # Arabic variants
    arabic_triggers = [
        "طلب خروج",
        "أريد الخروج",
        "ابي اطلع",
        "اريد الخروج",
        "ممكن اطلع",
        "اقدر اطلع",
    ]

    return any(phrase in text for phrase in english_triggers + arabic_triggers)