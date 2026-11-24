"""Text-to-speech stub.

This is a stub on purpose. It works without any key.
Replace speak_text() with gTTS or Sarvam TTS later.
"""


def speak_text(text):
    """Return the text that would be spoken aloud.

    No audio file is created by this stub. The frontend can show
    the text and, later, play the real audio file instead.
    """
    return {
        "text": text,
        "audio_url": None,
        "source": "tts-stub",
        "note": "TTS stub: replace with gTTS or Sarvam TTS for real speech output.",
    }
