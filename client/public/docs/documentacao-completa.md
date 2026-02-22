# FlowClik Complete Documentation

**Full guide to the photography management system**

---

## Contents

1. [Getting Started](#getting-started)
2. [Complete Client Journey](#complete-client-journey)
3. [Admin Panel in Detail](#admin-panel-in-detail)
4. [Payments and Sales](#payments-and-sales)
5. [Client Communication](#client-communication)
6. [Troubleshooting](#troubleshooting)
7. [Practical Tips](#practical-tips)

---

## Getting Started

### How to log in

**Accessing your dashboard:**

Go to your personalised subdomain (e.g. **yoursite.flowclik.com**) and click the "Sign In" button in the top right corner. Enter the email and password you registered with and click "Sign In" to access the admin dashboard.

**If you forgot your password:**

On the login screen, click "Forgot my password", enter your registered email and you will receive a reset link by email within 5 minutes. Click the link, create a new password and log in with your new password.

**Security tips:**

Never share your password with anyone. Use a strong password with at least 8 characters combining letters and numbers. Save your site to your browser favourites for quick access. Always log out when using shared computers.

**On your first login:**

You will see the Dashboard with a summary of bookings, projected revenue, galleries created and quick shortcuts to key features.

---

### Setting up your site for the first time

**Step 1: Basic Information**

Go to "Settings" in the left side menu. In the "Basic Information" section, fill in the site name (e.g. "Smith Photography"), tagline (e.g. "Capturing your moments") and upload your logo by clicking "Upload" and selecting a PNG or JPG file.

**Step 2: Set Up Home Banner**

In the side menu, click "Banner", then "+ New Slide". Upload an eye-catching photo (recommended 1920x1080px), add a title (e.g. "Professional Photography") and description (e.g. "Capture your best moments"), then click "Save". You can add up to 5 slides that rotate automatically.

**Step 3: Create Services**

Go to "Services" in the side menu and click "+ New Service". Fill in the name (e.g. "Photo Shoot"), a detailed description of what is included, the price (e.g. £250.00), duration in minutes (e.g. 300 = 5 hours) and type (Photography, Video or Both). Click "Save" and repeat for each service you offer.

**Step 4: Set Up Contact Information**

Go back to "Settings" and in the "Contact Information" section, fill in your phone number (with country code), professional email, WhatsApp (a floating button will appear on your site) and full address.

**Step 5: Social Media**

Still in "Settings", in the "Social Media" section, add the full URLs for your Instagram, Facebook and YouTube. The icons will appear automatically in your site footer.

**Step 6: Add Portfolio**

Go to "Portfolio" in the side menu and click "+ Add to Portfolio". Upload your best photos and for each one add a title (e.g. "Newborn Shoot - Emily"), location (e.g. "London, UK") and description (tell the story behind the photo). Tick "Show on Home" to feature it. Add at least 8 photos to fill the home page nicely.

**Done! Your site is now live.** Go to yoursite.flowclik.com to see how it looks.

---

### Registering your first client

**Why register clients?**

By registering clients in the system, you can create bookings linked to the client, track service history, send personalised galleries, manage payments and get reports on your most active clients.

**How to register:**

Go to "Clients" in the side menu and click "+ New Client". Fill in the full name (e.g. "Emily Smith"), email (used for client login and notifications) and phone number (with country code, e.g. +44 7545 335396).

Optionally, fill in the full address: postcode, address (street and number), additional details (flat, building), city and county. The system automatically detects the country based on the configuration, but you can change it manually if needed. Click "Save" to finish.

**Automatically registered clients:**

When a client makes a booking through the public site (at /book), they are automatically registered in the system. You only need to register manually if you want to create a booking before the client requests one.

**Viewing client history:**

In the client list, click the "History" button to see all of the client's bookings, amounts spent, status of each service and photo orders.

---

## Complete Client Journey

### Step 1: Client discovers your site

The client visits **yoursite.flowclik.com** and sees a banner with your best photos, portfolio of previous work, services offered with prices and contact information.

The client can browse public galleries, watch your videos (if enabled), click the floating WhatsApp button to message you or click "Book Now" to request a service.

### Step 2: Client books a service

The client clicks "Book Now" or goes to /book and fills in a 3-step form:

**Step 1:** Chooses the service (sees name, description, price, duration)
**Step 2:** Chooses preferred date and time
**Step 3:** Fills in personal details (name, email, phone, event location, number of people, notes)

When they click "Submit Request", the booking is created in the system with "Pending" status, the client is registered automatically, you receive an email notification and the client sees a success message.

### Step 3: You approve the booking

You receive an email "New booking received!", go to "Bookings" in the admin panel, click the pending booking, review the client's information and click "Approve" (or "Decline" if you cannot take it on).

The status changes to "Confirmed" and the client receives a confirmation email with the confirmed date and time, event location, instructions for the day and your contact details for questions.

### Step 4: You manage the payment

In the booking details panel, in the "Manage Payment" section, you can see the service price (base price), the "+ Add Extra Service" button (if the client requested something additional), total (base service + extras), how much the client has already paid and how much is still outstanding.

If the client requested extras (e.g. "30 extra photos", "Physical album"), click "+ Add Extra Service", enter the description and amount, and the total updates automatically.

To record a payment, click "Record Payment" and choose the payment method:

- **Cash:** records the full payment
- **Bank Transfer 50%:** records half now
- **Card 100%:** sends a Stripe link for the client to pay online

Click "Confirm" and the payment is recorded in the history, the client receives a payment confirmation email and you can see how much is still outstanding.

### Step 5: Day of the photo shoot

The status changes to "Session Completed" (you change it manually), you take the photos/videos and the client goes home happy, waiting for their photos.

### Step 6: You send photos for selection

Go to "Bookings", open the booking, click the "Photography" tab, click "Upload Photos" and drag and drop ALL the photos from the shoot (processed but not edited). The system creates a gallery automatically.

To send the link to the client, in the booking panel, click "Copy Client Link" and send the link via WhatsApp/Email. The client accesses it with their email + gallery password.

The status changes to "Awaiting Client Selection", the client receives an email "Your photos are ready for selection!" and the client accesses the gallery seeing ALL photos with a "PREVIEW" watermark.

### Step 7: Client selects favourite photos

The client accesses the link you sent, logs in with their email + password and sees the client panel with project status (progress bar), shortcut to "View Gallery", chat to message you and payment history.

The client clicks "View Gallery", sees all photos in a grid, clicks the heart on their favourite photos, can add comments to each photo (e.g. "I want this one brighter", "Remove the background on this one") and when finished, clicks "Submit Selection".

The status changes to "Editing Selected Photos", you receive an email notification "Client selected X photos!" and the client receives confirmation "Selection received! You will receive the edited photos shortly."

### Step 8: You edit the selected photos

You receive an email "Client selected photos!", go to "Client Selections" in the side menu, see the client's gallery with a counter "12 photos selected", click to see which photos the client chose, see the client's comments/feedback on each photo and edit the photos in Photoshop/Lightroom.

Return to the system and upload the final edited photos by clicking "Upload Edited Photo" on each photo. The system shows side by side: Original vs Edited.

### Step 9: Client approves the final album

When ALL photos have been edited, click "Copy Final Album Link" and send the link to the client.

The client accesses it and sees an eye-catching banner with a random photo from the album, the complete gallery of edited photos (WITHOUT watermark), a progress bar "12/12 photos edited", a "Download All Photos" button (generates a ZIP) and an "Approve Complete Album" button.

The client downloads the photos and clicks "Approve Album". The status changes to "Delivered", you receive a notification "Client approved the final album!", the client receives an email "Thank you! Your album has been approved." and the job is done!

### Step 10: Client shares with friends (Viral Marketing!)

The client clicks "Share Album" in their panel and the system generates a shareable link: **yoursite.flowclik.com/shared-album/emily-smith**. The client sends it to friends and family.

When friends access it, they see an email wall (they need to provide their email to view photos) and the emails are saved in "Leads" in your admin panel. You can send email marketing to these leads later. These leads are HOT because they have already seen your work and liked it!

**Flow Summary:**

1. Client books through the site
2. You approve the booking
3. Client pays (cash/bank transfer/card)
4. You do the shoot
5. You send photos for selection
6. Client chooses favourites and comments
7. You edit selected photos
8. Client approves the final album
9. Client downloads photos
10. Client shares and you gain leads!

---

## Admin Panel in Detail

### Dashboard - Overview

The Dashboard is the first page you see when you log in. It shows a complete summary of your business.

**Statistics Cards:**

**Total Bookings:** Shows how many bookings you have in total, including all statuses (pending, confirmed, delivered). Click to go directly to Bookings.

**Projected Revenue:** Sum of ALL bookings (confirmed + pending). Amount in pounds (£) as configured. Does not count cancelled bookings.

**Confirmation Rate:** Percentage of approved bookings vs pending. Example: 85% = 17 confirmed out of 20 requests. The higher the better!

**Delivery Rate:** Percentage of completed jobs. Example: 60% = 12 delivered out of 20 confirmed. Shows your productivity.

**Charts:**

**Bookings by Status:** Coloured progress bars showing how many bookings are at each stage (Pending yellow, Confirmed green, Session Completed blue, Photos in Editing purple, Awaiting Selection orange, Editing Selected indigo, Delivered emerald green).

**Revenue by Status:** Shows how much money is at each stage. Example: £500 in "Confirmed", £300 in "Delivered". Helps forecast cash flow.

**Bookings by Month:** Chart of the last 12 months showing how many bookings you had each month. Identifies peak season vs quiet season.

**Tables:**

**Recent Orders:** Last 5 stock photo orders showing ID, Client, Email, Total, Status, Date. Click the ID to see details.

**Upcoming Bookings:** Next 5 confirmed bookings showing ID, Client, Service, Date/Time, Status. Sorted by date (nearest first). Helps you prepare for shoots.

**Quick Shortcuts:** Buttons to quickly access "+ New Booking", "View All Bookings", "Client Messages" and "Pending Selections".

---

### Bookings - Managing Jobs

The Bookings section is where you manage all client jobs.

**Views:**

**Calendar (Default):** Monthly calendar in Google Calendar style with colour-coded cards by status on each day. Navigate with left/right arrows. Click a card to open details.

**List:** The "List" button at the top shows a table with ALL bookings. Available filters: search by client name and filter by status (dropdown). Pagination: 10 bookings per page. Click a row to open details.

**Create New Booking:**

Click "+ New Booking" and fill in the form:

- **Select Client:** Dropdown with registered clients or click "+ New Client" to register on the spot
- **Select Service:** Dropdown with created services showing name, price and duration
- **Date and Time:** Choose a date on the calendar and enter the preferred time (e.g. 14:00)
- **Event Details:** Location (address where the shoot will be), number of people (how many will participate), estimated duration in hours, notes (special requests from the client)

Click "Create Booking". The booking is created with "Pending" status, the client receives a confirmation email and it appears on the calendar.

**Booking Details Panel:**

When you click a booking, a side panel opens with 2 tabs:

**"Details" Tab:**

- **Client Information:** Name, Email, Phone, Date, Time, Location, Number of people, Duration, Notes
- **Workflow Timeline:** 7 visual stages with icons, current stage highlighted in green, "Advance" button for next status, history of status changes
- **Manage Payment:** Service Price (base price with edit button), Extra Services (list of additional items with "+ Add Extra Service" button, each extra shows description and amount, bin button to remove), Total (automatic sum of service + extras), Paid (how much client has paid), Remaining (how much is still owed), "Record Payment" button, transaction history
- **Quick Actions:** Approve (if pending), Decline (if pending), Edit booking, Delete booking

**"Photography" Tab:**

- **Gallery Statistics:** Total photos (how many you uploaded), Favourite photos (how many client marked), Selection rate (percentage of photos chosen)
- **Actions:** Upload Photos (opens page to send photos), Copy Client Link (copies gallery link), Enable/Disable Download (toggle to allow client to download)

**Header Buttons:** Shoot Gallery (manage shoot photos), Final Album (upload final edited photos), Copy Client Link (link for client to access panel), Enable/Disable Download (download status).

**Automatic Workflow:**

The system advances automatically in some cases: client submits selection changes to "Editing Selected", client approves album changes to "Delivered", you approve booking sends email to client, you change status sends email to client.

**Email Notifications:**

The client automatically receives an email when the booking is approved, status changes, photos are sent for selection and the final album is ready.

---

## Payments and Sales

### How to manage client payments

The system offers 3 payment methods for you to receive from clients.

**Accessing Payment Management:**

Go to "Bookings", click the client's booking and in the "Details" tab, scroll to "Manage Payment".

**Payment Structure:**

**Service Price:** Base price of the contracted service, copied automatically when creating the booking, "Edit" button to adjust if needed.

**Extra Services:** List of additional items charged. Examples: "30 extra photos (£50)", "Physical album (£100)". "+ Add Extra Service" button: click the button, enter description (e.g. "Physical album 20x30cm"), enter amount in pounds (e.g. 100), click "Add", the extra appears in the list. Bin button to remove an extra.

**Total:** Automatic sum: Base Service + All Extras. Updates in real time when adding/removing extras. Example: £250 (service) + £50 (extra) + £100 (extra) = £400.

**Paid:** How much the client has already paid. Sum of all recorded payments.

**Remaining:** How much is still owed. Calculation: Total - Paid. When it reaches £0.00, it is fully paid!

**Recording a Payment:**

Click "Record Payment" and choose the payment method:

**Option 1: Cash** - Client paid in cash. System records 100% of the total amount. Click "Confirm". Payment added to history. Client receives confirmation email.

**Option 2: Bank Transfer 50%** - Client made a bank transfer for half. System records 50% of the total amount. Click "Confirm". You can record another transfer later to complete the balance.

**Option 3: Card 100% (Stripe)** - Sends a Stripe payment link to the client. Client pays online by card. System records automatically when payment is approved. Requires Stripe configuration (see setup guide).

**Transaction History:**

Below the management section, you see a list of all payments received. Each transaction shows date and time, payment method, amount paid and status (Paid / Pending).

**Editing the Total Amount:**

If the client requested something extra AFTER creating the booking, click the "Edit" button next to the Service Price, enter the new total amount, click "Save", the total updates automatically and the remaining balance recalculates. Or use "Add Extra Service" to keep a detailed breakdown!

**Automatic Notifications:**

The client receives an email when you record a payment, a Stripe payment is approved or a Stripe payment fails.

**Tips:**

- Record payments immediately so you don't forget
- Use Extra Services for transparency (client sees the breakdown)
- Ask for 50% upfront before the shoot (bank transfer)
- Remaining balance after delivering the edited photos

---

## Client Communication

### Integrated messaging system

The system has an integrated chat for you to communicate with clients in real time.

**Messages Panel (Admin):**

Go to "Messages" in the side menu and you will see a WhatsApp Web-style layout with a conversation list on the left and the active chat on the right.

**Conversation List:**

Each conversation shows the client's name, preview of the last message, relative time (e.g. "5 minutes ago") and a red badge with the number of unread messages.

**Active Chat:**

When you click a conversation, the header shows the client's name, message history in the centre (client messages on the left in grey, your messages on the right in blue, date and time on each message), text field at the bottom and "Send" button.

**Sending a Message:**

Type your message in the text field, click "Send" or press Enter, the message appears instantly and the client receives a notification.

**Marking as Read:**

When you open a conversation, messages are automatically marked as read and the unread badge disappears.

**Client Chat:**

The client accesses the chat at /client/chat/:id. The client goes to their panel, clicks "Chat" in the quick shortcuts, sees the message history, types a message and clicks "Send", and sees your reply instantly.

The client receives a notification when you reply. You receive a notification when the client sends a message.

**Use Cases:**

- Client asks questions: "Can I bring my dog to the shoot?" / "Of course! We love pets in photos!"
- Client requests a change: "Can you make photo 5 brighter?" / "I'll adjust it and send it again!"
- You send updates: "Hi Emily! Your edited photos are ready. Access the final album to download them."
- Arranging details: "Can we change the time to 3pm?" / "No problem! I've already updated the booking."

**Tips:**

- Reply quickly to improve the client experience
- Use emojis to make the conversation friendlier
- Be clear and to the point in your replies
- Confirm receipt of client requests
- Send proactive updates on the progress of the work

---

## Troubleshooting

### Common problems and solutions

**Photo Upload:**

**Problem: "Error uploading"**

Possible causes: Photo too large (> 25MB), unsupported format, unstable internet connection.

Solutions: Compress the photo before uploading (use Photoshop/Lightroom), convert to JPG if it is in a different format, try uploading one photo at a time, check your internet connection.

**Problem: "Upload stuck at 50%"**

Solution: Wait up to 2 minutes (large photos take time). If it does not complete, reload the page and try again. Reduce the photo resolution to 4000px.

**Payments:**

**Problem: "Client did not receive the Stripe payment link"**

Solutions: Check the client's email is correct, ask the client to check their spam/junk folder, resend the link by clicking "Record Payment" again.

**Problem: "Stripe payment was not recorded"**

Causes: Stripe webhook not configured, client did not complete payment.

Solutions: Check in the Stripe dashboard whether the payment was approved. If approved but not recorded, configure the webhook (see guide). If pending, ask the client to complete the payment.

**Galleries:**

**Problem: "Client cannot access the gallery"**

Solutions: Check the password is correct, send the correct link (yoursite.flowclik.com/gallery/:slug), ask the client to use an up-to-date browser (Chrome, Safari, Edge), check the gallery has not been deleted.

**Problem: "Photos are not showing in the gallery"**

Solutions: Check the upload was completed (see the list of existing photos), reload the gallery page (Ctrl+F5 or Cmd+R), clear the browser cache, try a different browser.

---

## Practical Tips

### Organisation

**Name Galleries Clearly:**

Good: "Newborn Shoot - Emily Smith - 15/01/2025"
Bad: "Gallery 1"

Why: Makes it easier to find the gallery later.

**Use Detailed Descriptions:**

Add to the gallery description the type of shoot, location, number of photos and any special notes.

Example: "Newborn shoot in studio. 50 processed photos. Client requested pastel tones."

**Organise Clients with Tags:**

Create your own organisation system: add a prefix to the name ("[VIP] Emily Smith"), use notes to record preferences, keep the history up to date.

### Efficient Workflow

**Recommended Flow:**

1. Client books → You approve within 24 hours
2. Request 50% upfront → Record payment
3. Day of the shoot → Change status to "Session Completed"
4. Send ALL photos within 7 days → Client selects
5. Edit selected photos within 14 days
6. Send final album → Client approves
7. Receive remaining balance → Record payment
8. Change to "Delivered" → Job done!

**Suggested Timelines:**

- Booking approval: 24 hours
- Sending photos for selection: 7 days after the shoot
- Editing selected photos: 14 days after selection
- Final delivery: 21 days after the shoot (total)

### Communication

**Be Proactive:**

Send updates without the client asking: "Hi Emily! The shoot went great. Photos will be ready in 5 days!", "I've received your selection! I'll start editing today.", "Your photos are 50% edited. You'll receive them soon!"

**Use Chat for Everything:**

Confirming shoot details, notifying of delays, requesting additional information, sending previews, thanking after approval.

**Reply Quickly:**

Messages: within 2 hours. Emails: within 24 hours. WhatsApp: immediately (if possible).

### Sales

**Maximise Event Sales:**

1. Photograph EVERYONE at the event (not just the person who hired you)
2. Enable sales as soon as the client approves the album
3. Send an email to leads immediately
4. Share on the event's social media
5. Set a deadline (e.g. "Sales until 31/01")
6. Offer a discount for purchases over 10 photos

**Competitive Pricing:**

- Individual digital photos: £15-£25
- Framed photos: £50-£100
- Stock photos: £20-£50
- Packages: 10-20% discount

**Smart Upselling:**

Offer extras during booking: "Want 30 extra edited photos? +£50", "Physical album 20x30cm? +£100", "Short video of the shoot? +£80".

---

**End of FlowClik Complete Documentation**

*Last updated: February 2025*
