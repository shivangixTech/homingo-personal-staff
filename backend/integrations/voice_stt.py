"""Speech-to-text stub.

This is a stub on purpose. It works without any key.
Replace transcribe_audio() with Whisper or Sarvam AI later.
The rest of the backend does not depend on how this function works.
"""


def transcribe_audio(audio_bytes, filename="audio.wav"):
    """Return sample text for the given audio.

    Real speech recognition is not wired up yet. This stub returns
    a fixed English sentence so the voice endpoint can be tested.
    """
    _ = (audio_bytes, filename)
    return {
        "text": "Please tell me about today's meetings and the electricity bill.",
        "language": "hi",
        "source": "stt-stub",
        "note": "STT stub: replace with Whisper or Sarvam AI for real speech input.",
    }
