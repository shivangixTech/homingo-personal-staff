"""Finance agent node: check bills and refunds.

This node never pays a bill by itself. When the user asks to pay,
it creates a pending approval and waits. The approval endpoint in
main.py is the only place that executes the simulated payment.
"""

from backend.agents.tools import check_bills, track_refund
from backend.security.approvals import create_approval


def finance_node(state):
    """Check bills and refunds. Create an approval when payment is asked for."""
    message = state.get("user_message", "").lower()
    result = {
        "bill_info": check_bills(),
        "refund_info": track_refund(),
    }
    if "pay" in message:
        approval_id = create_approval(
            action="pay electricity bill",
            amount="Rs 1240",
            detail="Electricity bill, due 28 Nov 2026. Simulated payment only.",
        )
        result["needs_approval"] = True
        result["approval_id"] = approval_id
    return result
