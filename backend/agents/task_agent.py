"""Task agent node: government forms and reminders."""

from backend.agents.tools import check_government_form


def task_node(state):
    """Check the government form status and store it in the state."""
    return {"form_info": check_government_form()}
