"""Shared state for the personal staff agent graph."""

from typing import TypedDict


class StaffState(TypedDict, total=False):
    """State passed between the nodes of the LangGraph graph."""

    user_message: str
    intent: str
    mail_info: str
    calendar_info: str
    bill_info: str
    refund_info: str
    form_info: str
    needs_approval: bool
    approval_id: str
    final_answer: str
