// Project-to-Automation Intelligence — suggest relevant workflows from the
// business type in the project brief. Deterministic mapping for the MVP; a
// real AI agent can replace `suggestWorkflows` later without touching callers.

export type WorkflowSuggestion = { name: string; description: string };

const CATALOG: { match: RegExp; suggestions: WorkflowSuggestion[] }[] = [
  {
    match: /plumb|trade|electric|hvac|handyman|roof/i,
    suggestions: [
      { name: "Emergency enquiry workflow", description: "Classify urgency, alert the owner instantly for emergencies." },
      { name: "Quote request workflow", description: "Collect job details, draft a quote reply for approval." },
      { name: "Missed lead follow-up workflow", description: "Chase unanswered enquiries automatically." },
      { name: "Review request workflow", description: "Ask for a review after job completion." },
    ],
  },
  {
    match: /restaurant|cafe|catering|food/i,
    suggestions: [
      { name: "Table booking enquiry workflow", description: "Capture booking requests and confirm availability." },
      { name: "Catering enquiry workflow", description: "Collect date, guests, budget, dietary needs; draft a quote." },
      { name: "Private event enquiry workflow", description: "Qualify event requests and route to the manager." },
      { name: "Review reply workflow", description: "Draft responses to new reviews for approval." },
    ],
  },
  {
    match: /real ?estate|property|letting|realtor/i,
    suggestions: [
      { name: "Buyer enquiry workflow", description: "Qualify buyer enquiries and book viewings." },
      { name: "Viewing booking workflow", description: "Schedule and confirm property viewings." },
      { name: "Tenant maintenance workflow", description: "Classify urgency, create tickets, notify the manager." },
      { name: "Vendor assignment workflow", description: "Suggest vendor category and draft tenant updates." },
    ],
  },
  {
    match: /taxi|car rental|rental|transport|chauffeur/i,
    suggestions: [
      { name: "Booking enquiry workflow", description: "Capture trip details and confirm bookings." },
      { name: "Price estimate workflow", description: "Draft price estimates for approval." },
      { name: "Document collection workflow", description: "Collect licence/ID documents from customers." },
      { name: "Abandoned quote follow-up workflow", description: "Follow up quotes that never converted." },
    ],
  },
  {
    match: /clinic|dental|medical|salon|spa|barber/i,
    suggestions: [
      { name: "Appointment booking workflow", description: "Capture and confirm appointment requests." },
      { name: "Reminder workflow", description: "Send visit reminders to reduce no-shows." },
      { name: "New patient/client intake workflow", description: "Collect intake details before the first visit." },
      { name: "Review request workflow", description: "Ask for reviews after appointments." },
    ],
  },
];

const DEFAULT_SUGGESTIONS: WorkflowSuggestion[] = [
  { name: "New enquiry workflow", description: "Classify enquiries, create leads, draft replies for approval." },
  { name: "Missed lead follow-up workflow", description: "Chase unanswered enquiries automatically." },
  { name: "Booking/appointment workflow", description: "Capture requests and confirm scheduling." },
  { name: "Review request workflow", description: "Ask happy customers for reviews." },
];

export function suggestWorkflows(businessType?: string | null): WorkflowSuggestion[] {
  if (!businessType) return DEFAULT_SUGGESTIONS;
  const hit = CATALOG.find((c) => c.match.test(businessType));
  return hit?.suggestions ?? DEFAULT_SUGGESTIONS;
}
