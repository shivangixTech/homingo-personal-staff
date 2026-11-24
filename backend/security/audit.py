"""Audit log.

The log records what the agent read, what it decided, and what the
user approved or rejected. It is kept in memory for this starter
version. Private data is never written here in full.
"""

import datetime

AUDIT_LOG = []


def add_audit_entry(event, detail):
    """Add one entry to the audit log and return it."""
    entry = {
        "time": datetime.datetime.now().isoformat(timespec="seconds"),
        "event": event,
        "detail": detail,
    }
    AUDIT_LOG.append(entry)
    return entry


def get_audit_log():
    """Return the full audit log."""
    return list(AUDIT_LOG)
