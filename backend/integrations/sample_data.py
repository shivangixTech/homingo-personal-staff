"""Sample data for one realistic person.

The person is a small shop owner in Bhopal who speaks Hindi.
No personal name is used anywhere in this file.
All data below is sample data for testing and the demo only.
Real Gmail and Calendar integration is a later step, not part of this file.
"""

MAILS = [
    {
        "id": "mail-1",
        "from": "supplier",
        "subject": "Supplier invoice for this month",
        "summary": "The supplier sent the monthly invoice. Amount Rs 8500, due 30 Nov.",
        "important": True,
    },
    {
        "id": "mail-2",
        "from": "online store",
        "subject": "Refund update for order 8891",
        "summary": "The refund of Rs 1999 is still being processed. It has been pending for 7 days.",
        "important": True,
    },
    {
        "id": "mail-3",
        "from": "bank",
        "subject": "Electricity bill reminder",
        "summary": "The electricity bill of Rs 1240 is due on 28 Nov.",
        "important": True,
    },
    {
        "id": "mail-4",
        "from": "customer",
        "subject": "Question about shop timings",
        "summary": "A customer asked about the shop opening time.",
        "important": False,
    },
    {
        "id": "mail-5",
        "from": "local office",
        "subject": "Shop licence renewal reminder",
        "summary": "The shop licence renewal needs address proof. Aadhaar is already on file.",
        "important": True,
    },
]

EVENTS = [
    {
        "id": "event-1",
        "title": "Meeting with supplier",
        "date": "2026-11-25",
        "time": "11:00",
        "note": "Discuss the monthly stock order.",
    },
    {
        "id": "event-2",
        "title": "Delivery at the shop",
        "date": "2026-11-25",
        "time": "16:00",
        "note": "Check the goods against the delivery note.",
    },
    {
        "id": "event-3",
        "title": "Call with accountant",
        "date": "2026-11-26",
        "time": "10:00",
        "note": "Review this month's bills.",
    },
]

BILLS = [
    {
        "id": "bill-1",
        "name": "Electricity bill",
        "amount": 1240,
        "currency": "Rs",
        "due_date": "2026-11-28",
        "status": "due",
    },
    {
        "id": "bill-2",
        "name": "Supplier bill",
        "amount": 8500,
        "currency": "Rs",
        "due_date": "2026-11-30",
        "status": "due",
    },
    {
        "id": "bill-3",
        "name": "Internet bill",
        "amount": 799,
        "currency": "Rs",
        "due_date": "2026-12-05",
        "status": "due",
    },
]

REFUNDS = [
    {
        "id": "refund-1",
        "order_id": "8891",
        "amount": 1999,
        "currency": "Rs",
        "status": "pending",
        "days_pending": 7,
        "seller": "online store",
    },
]

GOVERNMENT_FORM = {
    "service": "Shop licence renewal",
    "documents_present": ["Aadhaar"],
    "documents_missing": ["Address proof"],
    "status": "waiting for documents",
    "next_step": "Submit address proof, then the renewal form can be filed.",
}
