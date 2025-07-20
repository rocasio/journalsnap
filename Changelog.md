# 📓 JournalSnap Changelog

### Day 14 - User sign-in through Google and Apple
- Added Google & Apple sign-ins and save/view summaries under their own account
- Styling changes
- Will need to revisit Apple sign-in

### Day 13 - Deploying to Vercel
- Added support to host app on Vercel
- Changed persistent storage to Firestore Database on Firebase
- Updated endpoints to work with new configuration

### Day 12 - Dark / Light Theme
- Added toggle to switch between light and dark theme
- Theme choice is saved in persistent storage and used next time page is opened

### Day 11 - Miscellaneous
- Added CSV option for Export
- Changed text for export options
- Fixed style bug for Export and Delete buttons

### Day 7 - 10 - More Enhancements
- Unified button styles
- Updated look of export options section
- Added title to summary cards
- Added animation to accordion toggle
- Improved accessibility
- Improved mobile layout
- Other miscellaneious styling updates

### Day 6 – Sharing + UX Enhancements
- Added persistent format and sort order (saved to localStorage)
- Implemented share menu with:
  - 📋 Copy to Clipboard
  - ✉️ Email
  - 📧 Gmail (custom addition)
  - 📱 Web Share API
- Improved accessibility (semantic structure, keyboard support)
- Refactored components for readability
- Organized CSS into modular styles

### Day 5 – Storage & Summaries
- Added title input for summaries
- View, delete, and expand saved summaries
- Sort by newest or oldest
- Export to `.txt`, `.md`, or `.pdf` (single or all summaries)
- Mobile optimizations + cleaner UI with shadows, borders, and animation

### Day 4 - Making Summaries Smarter and Smoother
✅ Accordion-style summaries for easier viewing and navigation
🗑️ Delete button to remove saved entries
📝 Title input field for naming summaries
🔀 Sort by Newest/Oldest in the saved summaries list
📱 Mobile-optimized UI, including a sticky action button
💅 Polished styling with shadows, spacing, and subtle icons for action items

### Day 3 - Persistence Achieved! Added local JSON-based storage
 ✅ User-generated notes are now summarized via OpenAI and saved with timestamps
 ✅ Each summary includes a clean separation of the main summary and a list of action items
 ✅ Introduced a new API endpoint to retrieve saved summaries
 ✅ Added a “View Saved Summaries” button to the UI to display previous entries
 ✅ Handled edge cases like missing files, empty input, and bad JSON gracefully

 ### Day 2 - Enhancing the user experience with a responsive design
 * Refactored the layout using CSS Flexbox for better responsiveness and alignment
 * Ensured the container stays centered and consistent in width, regardless of input state
 * Smoothed out textarea behavior and alignment for both desktop and mobile
 * Added subtle animations for visual polish (including a fade-in on results)
 * Improved mobile styling to avoid strange indents and preserve a clean layout
 * All styles were applied through a global CSS file — clean, minimal, and scalable.

 ### Day 1 - Project Milestone Achieved!
 MVP: It was a productive day of debugging, styling, integrating the OpenAI API, and setting up version control with GitHub. I resolved PostCSS issues, API key configuration errors, and rate limit messages — and came out with a working MVP!

📝 What JournalSnap does:
Paste in raw meeting notes or transcripts, click Summarize, and get a clear, actionable summary in seconds. The goal is to make follow-ups and team alignment easier with the help of AI.