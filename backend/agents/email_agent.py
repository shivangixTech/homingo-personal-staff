"""Email agent node: read mail and summarise it."""

from backend.agents.tools import read_mail


def email_node(state):
    """Read the important mails and store the summary in the state."""
    return {"mail_info": read_mail()}
