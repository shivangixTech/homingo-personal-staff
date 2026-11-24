"""Calendar agent node: check meetings and appointments."""

from backend.agents.tools import check_calendar


def calendar_node(state):
    """Check the calendar and store the summary in the state."""
    return {"calendar_info": check_calendar()}
