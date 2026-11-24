from dotenv import load_dotenv

load_dotenv()


import logging
import os

logger = logging.getLogger(__name__)


def get_llm():
    """Return a Gemini chat model, or None when no key is set."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning(
            "GEMINI_API_KEY is not set. "
            "The backend will run in sample-data mode without Gemini."
        )
        return None
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
        )
    except Exception as exc:  # noqa: BLE001 - fall back to sample data
        logger.warning("Could not start Gemini (%s). Using sample-data mode.", exc)
        return None
