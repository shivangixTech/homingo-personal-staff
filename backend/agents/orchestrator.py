"""Central orchestrator built with LangGraph.

Flow:
  router -> one specialist agent -> final answer
The router is a keyword router first. It is simple and it does not
fail in a live demo. It can be replaced with an LLM router later.

Memory: the graph is compiled with a MemorySaver checkpointer.
Each user gets a thread_id, so the agent remembers that user's
earlier messages in the same thread.
"""

import logging

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph

from backend.agents.calendar_agent import calendar_node
from backend.agents.email_agent import email_node
from backend.agents.finance_agent import finance_node
from backend.agents.state import StaffState
from backend.agents.task_agent import task_node
from backend.integrations.llm import get_llm
from backend.security.audit import add_audit_entry

logger = logging.getLogger(__name__)

# Gemini is optional. When no key is set, get_llm() returns None and
# the graph answers from the sample data with fixed templates.
LLM = get_llm()


def router_node(state):
    """Decide which specialist agent should handle this message.

    The per-turn result fields are reset here. Without this reset,
    the checkpointer memory would keep the previous turn's mail,
    calendar, bill, and form results, and every later answer would
    repeat all of them.
    """
    text = state.get("user_message", "").lower()
    if "mail" in text:
        intent = "email"
    elif "meeting" in text or "calendar" in text or "appointment" in text:
        intent = "calendar"
    elif "bill" in text or "refund" in text or "pay" in text:
        intent = "finance"
    elif "licence" in text or "license" in text or "form" in text:
        intent = "task"
    else:
        intent = "final"
    add_audit_entry("router_decision", "Intent decided: " + intent)
    return {
        "intent": intent,
        "mail_info": "",
        "calendar_info": "",
        "bill_info": "",
        "refund_info": "",
        "form_info": "",
        "needs_approval": False,
        "approval_id": "",
    }


def decide_next(state):
    """Return the next node name for the conditional edge."""
    return state.get("intent", "final")


def final_node(state):
    """Combine the agent results into one simple English answer."""
    parts = []
    if state.get("mail_info"):
        parts.append(state["mail_info"])
    if state.get("calendar_info"):
        parts.append(state["calendar_info"])
    if state.get("bill_info"):
        parts.append(state["bill_info"])
    if state.get("refund_info"):
        parts.append(state["refund_info"])
    if state.get("form_info"):
        parts.append(state["form_info"])
    if state.get("needs_approval"):
        parts.append(
            "This action needs your approval before I do it. "
            "Approval id: " + state.get("approval_id", "") + ". "
            "Please approve it to continue, or reject it to cancel."
        )
    if not parts:
        parts.append(
            "I can help with mail, calendar, bills, refunds, and the "
            "shop licence renewal form. Please ask about one of these."
        )
    answer = " ".join(parts)

    # When Gemini is available, use it only to rewrite the answer in
    # simple English. When it is not available, or when it fails,
    # keep the template answer above.
    if LLM is not None:
        try:
            result = LLM.invoke(
                "Rewrite this in simple English, keep all numbers and "
                "dates exactly the same:\n" + answer
            )
            rewritten = result.content.strip()
            if rewritten:
                answer = rewritten
        except Exception as exc:  # noqa: BLE001 - keep the template answer
            logger.warning("Gemini rewrite failed (%s). Using template answer.", exc)

    return {"final_answer": answer}


def build_graph():
    """Build and compile the LangGraph graph."""
    graph = StateGraph(StaffState)
    graph.add_node("router", router_node)
    graph.add_node("email_agent", email_node)
    graph.add_node("calendar_agent", calendar_node)
    graph.add_node("finance_agent", finance_node)
    graph.add_node("task_agent", task_node)
    graph.add_node("final", final_node)

    graph.set_entry_point("router")
    graph.add_conditional_edges(
        "router",
        decide_next,
        {
            "email": "email_agent",
            "calendar": "calendar_agent",
            "finance": "finance_agent",
            "task": "task_agent",
            "final": "final",
        },
    )
    graph.add_edge("email_agent", "final")
    graph.add_edge("calendar_agent", "final")
    graph.add_edge("finance_agent", "final")
    graph.add_edge("task_agent", "final")
    graph.add_edge("final", END)

    return graph.compile(checkpointer=MemorySaver())


# One compiled graph for the whole app.
APP_GRAPH = build_graph()


def run_chat(user_message, thread_id="user-1"):
    """Run one chat message through the graph and return the state."""
    add_audit_entry("chat_received", "Message received: " + user_message)
    result = APP_GRAPH.invoke(
        {"user_message": user_message},
        config={"configurable": {"thread_id": thread_id}},
    )
    add_audit_entry(
        "chat_answered",
        "Intent: " + result.get("intent", "")
        + ". Needs approval: " + str(result.get("needs_approval", False)),
    )
    return result
