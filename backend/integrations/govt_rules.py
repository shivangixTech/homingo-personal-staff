"""Rules for one government service: shop licence renewal.

This is sample rule data for the demo. It is not a real government
database and it does not call any real government service.
"""

from backend.integrations.sample_data import GOVERNMENT_FORM

REQUIRED_DOCUMENTS = ["Aadhaar", "Address proof"]


def get_form_checklist():
    """Return the checklist for the shop licence renewal."""
    form = GOVERNMENT_FORM
    return {
        "service": form["service"],
        "documents_present": form["documents_present"],
        "documents_missing": form["documents_missing"],
        "required_documents": REQUIRED_DOCUMENTS,
        "status": form["status"],
        "next_step": form["next_step"],
    }


def get_form_summary():
    """Return a short English summary of the form status."""
    checklist = get_form_checklist()
    missing = ", ".join(checklist["documents_missing"])
    present = ", ".join(checklist["documents_present"])
    return (
        "Shop licence renewal: Aadhaar is present, address proof is missing. "
        "Missing document: " + missing + ". "
        "Present: " + present + ". "
        "Next step: " + checklist["next_step"]
    )
