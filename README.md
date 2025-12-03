Frontend link (deployed): https://frontend-phi-one-87.vercel.app/


Backend API link base URL: https://hotel-management-api-b4dl.onrender.com/


## 🏨 Luxury Hotel Management System**


**📘 Overview**


A modern, responsive web application for managing hotel operations including rooms, guests, bookings, and dashboard analytics with a luxurious UI design.



**⚙️ API Endpoints Used:**

**🛏️ Rooms**

| Method | Endpoint         | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| GET    | /rooms           | Get all rooms                                |
| GET    | /rooms/available | Check availability (checkIn, checkOut, type) |
| POST   | /rooms           | Create new room                              |
| PUT    | /rooms/:id       | Update room                                  |
| DELETE | /rooms/:id       | Delete room                                  |


**🧑‍💼 Guests**

 
| Method | Endpoint    | Description      |
| ------ | ----------- | ---------------- |
| GET    | /guests     | Get all guests   |
| POST   | /guests     | Create new guest |
| PUT    | /guests/:id | Update guest     |
| DELETE | /guests/:id | Delete guest     |

**📆 Bookings**


| Method | Endpoint      | Description                        |
| ------ | ------------- | ---------------------------------- |
| GET    | /bookings     | Get all bookings (optional: limit) |
| GET    | /bookings/:id | Get specific booking               |
| POST   | /bookings     | Create new booking                 |
| PUT    | /bookings/:id | Update booking                     |
| DELETE | /bookings/:id | Delete booking                     |


✨ Features:


1️⃣ Dashboard 📊


• Real-time statistics (Total Rooms, Guests, Bookings, Available Rooms)

• Trend indicators with percentage changes

• Quick action buttons for common operations

• Recent bookings table with status indicators

• Refresh and report generation functionality


2️⃣ Room Management 🛏️

• View all rooms with detailed information

• Add, edit, and delete rooms

• Filter rooms by type and search by number/type

• Check room availability by date range

• Room status tracking (Available, Occupied, Maintenance)


3️⃣ Guest Management 🧑‍💼

• View guest list with contact information

• Add, edit, and delete guest profiles

• Search guests by name or email

• Store guest details (name, email, phone, address, ID)


4️⃣ Booking Management 📆

• View all bookings with guest and room details

• Create, edit, and delete bookings

• Filter bookings by status

• Search functionality

• Booking status tracking (Pending, Confirmed, Checked In, Checked Out, Cancelled)


5️⃣ UI/UX Features 🎨

• Responsive design for mobile, tablet, and desktop

• Modern luxury aesthetic with gold/blue color scheme

• Smooth animations and transitions

• Modal forms for data entry

• Toast notifications for user feedback

• Loading states and error handling

• Interactive tables with action buttons


6️⃣ Data Operations 🔗

• Real-time data fetching from API

• Form validation with error messages

• Date validation for bookings

• Search and filter functionality

• Bulk operations support

🛠️ Technical Implementation


🖥️ Frontend Architecture


• Vanilla JavaScript (no frameworks)

• Modular JavaScript with clear separation of concerns

• CSS variables for consistent theming

• Responsive CSS Grid and Flexbox layouts

• Font Awesome icons for visual elements


🔄 State Management


• Global state for rooms, guests, bookings

• Current section tracking for navigation

• Modal state management

• Form validation state


❗ Error Handling


• Network error handling with retry options

• Form validation with real-time feedback

• Toast notifications for user feedback

• Graceful loading and error states


⚡ Performance

• Optimized CSS with minimal reflows

• Efficient DOM updates

• Debounced search inputs

• Parallel data fetching for dashboard


📦 Setup Instructions


✅ Prerequisites

• Modern web browser

• Live server or web hosting

• Backend API running at specified URL


📁 Installation

• Clone/download the three files (index.html, style.css, script.js)

• Place them in the same directory

• Open index.html in a browser


⚙️ Configuration

• Update API_BASE_URL in script.js if backend changes

• Modify color scheme in CSS variables if needed


🌐 Browser Compatibility

• Chrome 60+

• Firefox 55+

• Safari 11+

• Edge 79+


📂 File Structure

hotel-management-system/

├── index.html          # Main HTML structure

├── style.css           # All styling and responsive design

└── script.js           # All JavaScript functionality


📚 Dependencies

• Font Awesome 6.4.0 (CDN)

• Google Fonts (Inter, Playfair Display)

• Custom API backend


🚀 Future Enhancements

• User authentication and roles

• Payment processing integration

• Email notifications

• Advanced reporting and analytics

• Calendar view for bookings

• Room images upload

• Multi-language support

• Dark/light theme toggle


🔐 Security Notes

• No sensitive data stored locally

• API handles data validation

• CORS configured on backend

• Form input sanitization

• No persistent authentication (stateless)


📄 License

This is a demo project for educational purposes.


📘Frontend screenshots:

<img width="1886" height="1014" alt="Screenshot 2025-12-03 104139" src="https://github.com/user-attachments/assets/7f0b864a-494a-4348-9c94-a52fd2cd51ee" />
<img width="1905" height="993" alt="Screenshot 2025-12-03 104152" src="https://github.com/user-attachments/assets/fdcede7e-448c-46c5-8a7a-e0378873b5a3" />
<img width="1895" height="997" alt="Screenshot 2025-12-03 104205" src="https://github.com/user-attachments/assets/9523caf6-b7bf-442f-94d9-2f05425e0397" />


