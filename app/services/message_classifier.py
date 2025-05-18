def is_exit_request(message_text: str) -> bool:
    """
    Simple classifier to check if the message is an exit request.
    In future, you can upgrade this to use AI or smarter parsing.
    """
    cleaned_text = message_text.strip().lower()
    return cleaned_text in ["request exit", "exit request", "طلب خروج"]  # you can add Arabic or synonyms here later