# Homingo Frontend Fix - README

## What was wrong
The old frontend showed a US person called Jordan, with ConEdison bills in
dollars, a Delta flight refund, a doctor and a dental appointment. It never
called the backend. It answered from its own invented data.

## What changed in this pack
- `src/data/mockData.ts` - replaced with Bhopal shop owner data only, in Rs.
  It matches the backend sample data exactly: electricity bill Rs 1,240 due
  28 Nov, supplier bill Rs 8,500 due 30 Nov, internet bill Rs 799 due 5 Dec,
  refund Rs 1,999 for order 8891 pending 7 days, 5 mails, 3 shop events
  (supplier meeting 25 Nov 11:00 AM, delivery 25 Nov 4:00 PM, accountant call
  26 Nov 10:00 AM), and shop licence renewal (Aadhaar present, address proof
  missing). No Jordan, no ConEdison, no Delta, no doctor, no dental, no $.
- `src/services/api.ts` - rewritten to call the real backend first:
  chat goes to POST /chat, dashboard to GET /dashboard/summary, approvals to
  POST /approvals/{id}/approve or /reject, activity to GET /audit-log.
  If the backend is off, it falls back to the same Bhopal data and says so
  in the reply. It never invents US data.
- `src/utils/formatters.ts` - money now shows in Rs (INR, Indian format).
- `src/context/UserContext.tsx` - profile is now "Shop Owner, Bhopal".
- `src/pages/DashboardPage.tsx` - priorities and insight cards now show the
  shop data, plus a Shop Licence Renewal card.
- `src/pages/BillsRefundsPage.tsx` - the pay button now opens the Assistant
  with "bill pay kar do", so a real approval is created. It no longer shows
  a fake "Payment Queued" message.
- `src/components/layout/Layout.tsx` and `Sidebar.tsx` - the approvals badge
  now shows the real pending count (0 until you ask to pay), and the mail
  badge shows 4 Important.
- `src/components/layout/TopNavbar.tsx`, `src/pages/AssistantPage.tsx`,
  `src/pages/CalendarPage.tsx`, `src/pages/EmailPage.tsx`,
  `src/pages/SettingsPage.tsx`, `src/components/common/CommandPalette.tsx`
  - all US text replaced with shop text, in Rs.
- `index.html` - description now says Bhopal small shop owner.

The layout the friend built is unchanged: Command Centre, sidebar,
dashboard, chat, approvals, activity history. Only the data and the
backend connection changed.

## How to use it (on your Windows laptop)
1. Start the backend first, in the backend folder:
   `uvicorn main:app --reload`
   Check http://127.0.0.1:8000/health shows {"status": "ok"}.
2. Copy this `frontend` folder over your local `frontend` folder
   (in homingo-personal-staff-backend-v2, on the `frontend` branch).
   Replace the files when Windows asks.
3. In the frontend folder, run:
   `npm install`
   `npm run dev`
4. Open http://localhost:5173

## How to test it
- In the chat box, type: `aaj ki meeting batao`
  You should see the 3 shop events.
- Type: `bijli ka bill kitna hai`
  You should see Rs 1,240 due 28 Nov, plus the other 2 bills and the
  Rs 1,999 refund pending 7 days.
- Type: `bill pay kar do`
  You should see needs approval, with approval id APR-1. Nothing is paid.
- Go to Approvals, open APR-1 and click Authorize.
  It should say approved and executed (simulated). No real money moves.
- Type: `licence renewal ke liye kya chahiye`
  You should see Aadhaar present, address proof missing.

## If the backend is off
The frontend still opens and shows the same Bhopal shop data from its
saved copy, and chat replies say the backend is not running. Approvals
need the backend running, so start it first for the real approval test.

## Build check (done before packing)
`npm run build` passed (tsc + vite, 2167 modules, built in 1.09s).
`npm run dev` served HTTP 200 on http://localhost:5173.
Tested live against the real backend: /chat, /dashboard/summary,
/approvals/APR-1/approve and /audit-log all returned the Bhopal data.
