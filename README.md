# Personal Staff Backend

A backend starter for the hackathon project "A Personal Staff for Everyone".
It is a personal chief of staff for one person: a small shop owner in
Bhopal who speaks Hindi. The agent reads mail, manages the calendar,
tracks bills and refunds, and helps with one government form
(shop licence renewal). Voice input and output are included as stubs.

No personal name is used anywhere in this project.

## What it does

- Reads mail and gives a short summary of the important mails.
- Shows meetings and appointments from the calendar.
- Tracks bills and a pending refund.
- Checks the shop licence renewal form: Aadhaar is present,
  address proof is missing.
- Asks for approval before any risky action. Paying a bill, sending
  a mail, or booking an appointment never happens without approval.
- Keeps an audit log of what the agent read, decided, and approved.

## Tech stack

- Python 3.11 or later
- FastAPI
- LangGraph (central orchestrator, specialist agents, memory)
- Gemini 2.5 Flash through `langchain-google-genai` (optional:
  the backend also works without a key, from sample data)

## Setup

Run these commands in this folder, in this order:

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate it. On Windows:
   ```bash
   venv\Scripts\activate
   ```
   On Mac or Linux:
   ```bash
   source venv/bin/activate
   ```
3. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   On Mac or Linux, use `cp .env.example .env` instead.
5. Open `.env` and paste your Gemini API key after `GEMINI_API_KEY=`.
   This step is optional. Without a key, the backend starts in
   sample-data mode and still answers from the sample data.
6. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
7. Open this address in a browser:
   http://127.0.0.1:8000/health
   You should see: `{"status": "ok"}`

## API list

| Method | Path | What it does |
| --- | --- | --- |
| GET | /health | Health check. Returns `{"status": "ok"}`. |
| GET | / | Welcome message. |
| POST | /chat | Send a message. Body: `{"message": "...", "user_id": "user-1"}`. Returns `{"reply": "...", "needs_approval": false, "approval_id": null}`. |
| GET | /dashboard/summary | Meetings, important mails, bills due, and pending refunds. |
| POST | /approvals/{approval_id}/approve | Approve a pending approval. This executes the simulated action. |
| POST | /approvals/{approval_id}/reject | Reject a pending approval. Nothing is executed. |
| GET | /approvals/{approval_id} | Show one approval. |
| GET | /audit-log | Show the audit log. |
| POST | /voice/transcribe | Voice-to-text (stub). Send an audio file. Returns sample text. |
| POST | /voice/speak | Text-to-speech (stub). Body: `{"text": "..."}`. Returns the text that would be spoken. |

## How the router works

The orchestrator is a LangGraph graph in
`backend/agents/orchestrator.py`. The state is `StaffState` in
`backend/agents/state.py`.

1. The router node reads the message and picks an intent by keyword:
   - "mail" goes to the email agent.
   - "meeting", "calendar", or "appointment" goes to the calendar agent.
   - "bill", "refund", or "pay" goes to the finance agent.
   - "licence", "license", or "form" goes to the task agent.
   - Anything else goes straight to the final answer node.
2. The specialist agent runs its tool and writes its result into
   the state. The tools are in `backend/agents/tools.py`.
3. The final node joins all results into one simple English answer.
4. Memory: the graph uses a `MemorySaver` checkpointer. Each user
   has a `thread_id` (the `user_id` from the chat request), so the
   agent remembers earlier messages from the same user.

The keyword router is used on purpose. It is simple and it does not
fail in a live demo. It can be replaced with an LLM router later.

## Approval and safety

- The finance agent never pays a bill by itself.
- When a payment is asked for, it creates a pending approval
  (for example `APR-1`) and the chat reply says approval is needed.
- `POST /approvals/APR-1/approve` executes the simulated payment.
  No real payment is ever made.
- `POST /approvals/APR-1/approve` is the only place that executes it.
- `POST /approvals/APR-1/reject` cancels it. Nothing is executed.
- Every step is written to the audit log. Open `/audit-log` to see
  what the agent read, what it decided, and what was approved.

## Sample data versus real Gmail and Calendar

All data in this starter is sample data, in one place only:
`backend/integrations/sample_data.py`. There is no second copy.

The sample person is a small shop owner in Bhopal. The sample data is:
- 5 mails (supplier invoice, refund update, electricity bill
  reminder, customer question, licence renewal reminder).
- 3 calendar events (supplier meeting, delivery, accountant call).
- 3 bills: electricity Rs 1240 due 28 Nov, supplier Rs 8500
  due 30 Nov, internet Rs 799 due 5 Dec.
- 1 refund: Rs 1999, pending for 7 days.
- 1 government form: shop licence renewal, Aadhaar present,
  address proof missing.

Real Gmail and Calendar integration is a later step, clearly marked
here. To add it, replace the functions in
`backend/agents/tools.py` with calls to the Gmail and Calendar
APIs. The agents, the router, and the API endpoints do not change.

Voice is also a later step. `POST /voice/transcribe` and
`POST /voice/speak` are clearly marked stubs. Replace them with
Whisper or Sarvam AI for speech input, and gTTS or Sarvam TTS
for speech output.

## How to test

Start the server first, then test in this order:

1. Open http://127.0.0.1:8000/health - it must show `{"status": "ok"}`.
2. Send a meeting question to `/chat`. The reply must list the
   meetings from the sample data.
3. Send an electricity bill question to `/chat`. The reply must
   show Rs 1240 and the due date 28 Nov.
4. Send a mail question to `/chat`. The reply must list the
   important mails.
5. Send a licence renewal question to `/chat`. The reply must say
   that Aadhaar is present and address proof is missing.
6. Send a bill payment request to `/chat`. The reply must have
   `"needs_approval": true` and an `approval_id`. The bill must
   NOT be paid yet.
7. Approve it with `POST /approvals/{approval_id}/approve`.
   The reply must have `"status": "approved"` and
   `"executed": true`.
8. Open `/audit-log`. It must show the chat, the router decision,
   the approval creation, and the approval.
9. Open `/dashboard/summary`. It must show the meetings, bills,
   and the pending refund.
10. Test `/voice/transcribe` with any audio file. It returns the
    sample text and says it is a stub.

## Evaluation plan: 30 test cases

Run 30 test cases before the demo and write down pass or fail for
each one. Do not hide the failures. Show them and show what the
agent did instead (for example, asked the user, or passed the case
to a human).

| Group | Test cases | What to check |
| --- | --- | --- |
| Mail | 6 | Important mails listed, summary correct, no mail sent without approval. |
| Calendar | 6 | Meetings listed, clash found, appointment booked only after approval. |
| Bills | 6 | Bill amount and due date correct, payment needs approval, payment blocked before approval. |
| Refunds | 6 | Refund amount and waiting time correct, chase draft made, no action without approval. |
| Government form | 6 | Missing document found, checklist correct, form draft made, unclear case passed to a human. |

For each group, use this mix: 3 normal cases, 2 cases with
missing information, and 1 case that is out of scope and must be
passed to a human. Count the passes and the fails, and put the
numbers on the results page of the demo.

## Project structure

```
main.py
requirements.txt
.env.example
.gitignore
README.md
backend/
  agents/
    orchestrator.py
    email_agent.py
    calendar_agent.py
    finance_agent.py
    task_agent.py
    state.py
    tools.py
  integrations/
    llm.py
    sample_data.py
    voice_stt.py
    voice_tts.py
    govt_rules.py
  security/
    approvals.py
    audit.py
  database/
    __init__.py
```

The `database/` folder has only `__init__.py` in this starter.
Sample data lives in one place only:
`backend/integrations/sample_data.py`.

## What is not in this starter, and why

- No real Gmail or Calendar connection. Sample data is used so the
  backend works on the first run, without any account setup.
- No real payment. Payments are simulated and need approval.
- No real speech recognition or speech output. Voice endpoints are
  stubs that can be swapped later.
- No frontend. The frontend is a separate part of the project and
  talks to this backend through the API list above.
