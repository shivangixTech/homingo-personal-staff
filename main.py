

import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.agents.orchestrator import run_chat
from backend.integrations.sample_data import BILLS, EVENTS, MAILS, REFUNDS
from backend.integrations.voice_stt import transcribe_audio
from backend.integrations.voice_tts import speak_text
from backend.security.approvals import approve_approval, get_approval, reject_approval
from backend.security.audit import add_audit_entry, get_audit_log

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Personal Staff Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    """Request body for POST /chat."""

    message: str
    user_id: str = "user-1"


class SpeakRequest(BaseModel):
    """Request body for POST /voice/speak."""

    text: str


@app.get("/health")
def health():
    """Health check. Use this to confirm the server is running."""
    return {"status": "ok"}


@app.get("/")
def home():
    """Short welcome message."""
    return {"message": "Personal Staff Backend is running. See /health to check it."}


@app.post("/chat")
def chat(request: ChatRequest):
    """Send a message to the personal staff agent.

    Returns JSON: {reply, needs_approval, approval_id}.
    When needs_approval is true, nothing has been executed yet.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message must not be empty.")
    result = run_chat(request.message, thread_id=request.user_id)
    return {
        "reply": result.get("final_answer", ""),
        "needs_approval": bool(result.get("needs_approval", False)),
        "approval_id": result.get("approval_id") or None,
    }


@app.get("/dashboard/summary")
def dashboard_summary():
    """One-page summary for the dashboard screen."""
    important_mails = [mail for mail in MAILS if mail["important"]]
    return {
        "meetings_today": len(EVENTS),
        "important_mails": len(important_mails),
        "bills_due": len(BILLS),
        "bills": BILLS,
        "refunds_pending": len(REFUNDS),
        "events": EVENTS,
    }


@app.post("/approvals/{approval_id}/approve")
def approve(approval_id: str):
    """Approve a pending approval. This executes the simulated action."""
    approval = approve_approval(approval_id)
    if approval is None:
        raise HTTPException(status_code=404, detail="Approval not found.")
    return {
        "approval_id": approval["approval_id"],
        "action": approval["action"],
        "amount": approval["amount"],
        "status": approval["status"],
        "executed": approval.get("executed", False),
        "message": "Approved and executed (simulated). No real payment was made.",
    }


@app.post("/approvals/{approval_id}/reject")
def reject(approval_id: str):
    """Reject a pending approval. Nothing is executed."""
    approval = reject_approval(approval_id)
    if approval is None:
        raise HTTPException(status_code=404, detail="Approval not found.")
    return {
        "approval_id": approval["approval_id"],
        "action": approval["action"],
        "status": approval["status"],
        "executed": False,
        "message": "Rejected. Nothing was executed.",
    }


@app.get("/approvals/{approval_id}")
def get_one_approval(approval_id: str):
    """Return one approval by id."""
    approval = get_approval(approval_id)
    if approval is None:
        raise HTTPException(status_code=404, detail="Approval not found.")
    return approval


@app.get("/audit-log")
def audit_log():
    """Return the audit log: what the agent read, decided, and approved."""
    return {"entries": get_audit_log()}


@app.post("/voice/transcribe")
async def voice_transcribe(file: UploadFile = File(...)):
    """Voice-to-text endpoint (stub).

    Accepts an audio file and returns sample text. Real speech
    recognition with Whisper or Sarvam AI is a later step.
    """
    audio_bytes = await file.read()
    result = transcribe_audio(audio_bytes, filename=file.filename or "audio.wav")
    add_audit_entry("voice_transcribe", "Voice input received (stub).")
    return result


@app.post("/voice/speak")
def voice_speak(request: SpeakRequest):
    """Text-to-speech endpoint (stub).

    Returns the text that would be spoken. Real speech output with
    gTTS or Sarvam TTS is a later step.
    """
    return speak_text(request.text)
