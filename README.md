# Summative_Assignment_LorrisHIRA
# Student Finance Tracker

This project is a simple web application built using vanilla HTML, CSS, and JavaScript.

It allows students to record expenses, monitor total spending, and stay within a monthly budget cap.

## Features

- Add, edit, and delete expense records
- Regex-based input validation (4 rules + duplicate word detection)
- Sorting by amount, date, or description
- Live regex search with match highlighting
- Dashboard statistics (total count, total spent, top category)
- Monthly budget cap with ARIA live feedback
- Data persistence using localStorage
- JSON import and export
- Responsive design (mobile, tablet, desktop)
- Accessible layout with semantic elements and keyboard navigation

## Regex Rules Used

Description:
^\S(?:.*\S)?$

Amount:
^(0|[1-9]\d*)(\.\d{1,2})?$

Date:
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$

Category:
^[A-Za-z]+(?:[ -][A-Za-z]+)*$

Advanced (Duplicate Word Detection):
\b(\w+)\s+\1\b

## Accessibility

- Semantic landmarks used
- Skip-to-content link
- Visible focus outline
- ARIA live region for budget status
- Keyboard accessible controls

## How to Run

1. Clone the repository
2. Open index.html in your browser
3. Or deploy using GitHub Pages
 
 # Demo video link 
 https://app.screencastify.com/watch/TOX4ygZgikrxUx4igc1f?checkOrg=4ce6ffc8-b019-4704-a6ce-ab0623bc63bd