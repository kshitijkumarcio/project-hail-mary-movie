<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- WORKFLOW: How this app works -->

Functionality Specification: Voting & Authentication Flow
1. Tech Stack Overview
Frontend & Framework: Next.js (App Router)

Backend & Database: Convex

Authentication: Better-Auth (using emailOTP plugin)

Email Delivery: Resend

Package Manager: bun

2. Core Logic & Routing
The application UI and routing will bifurcate based on the user's authentication and voting status.

A. The Unauthenticated State (Logged Out / Has Not Voted)
Trigger: The user visits the voting page and has no active Better-Auth session cookie.

UI State: The voting form is fully visible and interactive.

Action Flow: 1. User fills out the voting form (Showtime choices, Name, Phone, Email).
2. Before final submission, the application triggers the Form Submission & OTP Flow (detailed in Section 3).
3. Upon successful OTP verification and form submission, the backend creates the user's account, stores the session cookie on their browser, and flags their Convex database entry with voted: true.
4. The user is immediately redirected to the Live Results page.
5. Note: From this point forward, the user transitions to the Authenticated State logic.

B. The Authenticated State (Logged In / Already Voted)
Trigger: The user visits the voting page and has an active Better-Auth session cookie.

Verification: The application verifies the session and checks the Convex database to ensure the user associated with that email has voted === true.

UI State: The standard voting form is hidden.

Replacement UI: Render a "You Have Already Voted" section.

Display the choices they selected (showtimes).

Display the personal details they provided (Name, Phone, Email).

Include a prompt/button stating: "Want to change your details? You can update them on the Live Results page." Clicking this redirects them to the Live Results page.

3. Form Submission & OTP Flow (Linear-Style)
Instead of a standard form post, the submission process is gated by an email OTP verification.

Step 1: User completes the form and clicks "Submit/Verify".

Step 2: The system captures the provided email address and triggers the Better-Auth sendOtp endpoint via Resend.

Step 3: A bespoke alphanumeric code (e.g., A4B9X2, not just digits) is generated and emailed to the user.

Step 4: The UI prompts the user to enter the code.

Step 5: Upon successful verification by Better-Auth, the session is created, and the form data (showtime choices, name, phone) is pushed to the Convex database.

4. Live Results Page
This page serves as both a public dashboard and a personal user portal.

Aggregated Data Section: * List all available showtimes.

Display the total vote count for each showtime.

Display a clear ranking highlighting which showtime currently has the most votes.

Personal Data Section (Below Rankings):

Display the logged-in user's current choices and details (fetching from Convex).

Provide an "Update Details" button/form allowing them to edit their previously submitted Name, Phone, or Showtime choices.

The 'Update Details' form on the Live Results page should follow the same OTP verification flow as the initial form submission. And the 'Update Details' form is an intercepting route of '/updating-details' in the form of a modal on the same page of Live Results.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
