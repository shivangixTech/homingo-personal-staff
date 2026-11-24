"""Approval engine.

Paying a bill, sending a mail, or booking an appointment must create
a pending approval first. Nothing is executed until the user approves
it through the /approvals/{approval_id}/approve endpoint.
"""

from backend.security.audit import add_audit_entry

APPROVALS = {}
_COUNTER = [0]


def create_approval(action, amount, detail=""):
    """Create a pending approval and return its id."""
    _COUNTER[0] += 1
    approval_id = "APR-" + str(_COUNTER[0])
    APPROVALS[approval_id] = {
        "approval_id": approval_id,
        "action": action,
        "amount": amount,
        "detail": detail,
        "status": "pending",
    }
    add_audit_entry(
        "approval_created",
        "Approval " + approval_id + " created for: " + action + " " + amount,
    )
    return approval_id


def approve_approval(approval_id):
    """Approve a pending approval and execute the simulated action."""
    approval = APPROVALS.get(approval_id)
    if approval is None:
        return None
    if approval["status"] != "pending":
        return approval
    approval["status"] = "approved"
    approval["executed"] = True
    add_audit_entry(
        "approval_approved",
        "Approval " + approval_id + " approved and executed (simulated): "
        + approval["action"] + " " + approval["amount"],
    )
    return approval


def reject_approval(approval_id):
    """Reject a pending approval. Nothing is executed."""
    approval = APPROVALS.get(approval_id)
    if approval is None:
        return None
    if approval["status"] != "pending":
        return approval
    approval["status"] = "rejected"
    add_audit_entry(
        "approval_rejected",
        "Approval " + approval_id + " rejected. Nothing was executed: "
        + approval["action"],
    )
    return approval


def get_approval(approval_id):
    """Return one approval, or None when it does not exist."""
    return APPROVALS.get(approval_id)
