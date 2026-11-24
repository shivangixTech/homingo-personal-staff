"""Tools used by the specialist agents.

Each tool reads the sample data only. No tool sends mail, books an
appointment, or pays a bill by itself. Actions that change anything
must go through the approval engine in backend/security/approvals.py.
"""

from backend.integrations.govt_rules import get_form_summary
from backend.integrations.sample_data import BILLS, EVENTS, MAILS, REFUNDS


def check_bills():
    """Return a short summary of all due bills."""
    parts = []
    for bill in BILLS:
        parts.append(
            bill["name"] + " Rs " + str(bill["amount"]) + ", due " + bill["due_date"]
        )
    return "Due bills: " + "; ".join(parts) + "."


def check_calendar():
    """Return a short summary of the calendar events."""
    parts = []
    for event in EVENTS:
        parts.append(
            event["date"] + " at " + event["time"] + ": " + event["title"]
        )
    return "Calendar: " + "; ".join(parts) + "."


def read_mail():
    """Return a short summary of the important mails."""
    parts = []
    for mail in MAILS:
        if mail["important"]:
            parts.append(mail["subject"] + " - " + mail["summary"])
    return "Important mails: " + "; ".join(parts)


def track_refund():
    """Return a short summary of the pending refund."""
    refund = REFUNDS[0]
    return (
        "Refund of Rs " + str(refund["amount"]) + " for order "
        + refund["order_id"] + " has been pending for "
        + str(refund["days_pending"]) + " days."
    )


def check_government_form():
    """Return a short summary of the government form status."""
    return get_form_summary()
