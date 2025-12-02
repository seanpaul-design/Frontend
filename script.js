// Configuration
const API_BASE_URL = 'https://hotel-management-api-b4dl.onrender.com/api';

// Global State
let currentSection = 'dashboard';
let rooms = [];
let guests = [];
let bookings = [];
let currentEditId = null;
let dashboardStats = {
    totalRooms: 0,
    totalGuests: 0,
    totalBookings: 0,
    availableRooms: 0
};

// DOM Elements
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');
const closeBtn = document.querySelector('.close');
const toast = document.getElementById('toast');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Hotel Management System...');
    console.log('API Base URL:', API_BASE_URL);
    
    initializeNavigation();
    setupEventListeners();
    loadInitialData();
});

// Navigation Management
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    currentSection = sectionId;
    
    // Load data for the section
    loadSectionData();
}

function loadSectionData() {
    switch(currentSection) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'rooms':
            loadRooms();
            break;
        case 'guests':
            loadGuests();
            break;
        case 'bookings':
            loadBookings();
            break;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal close events
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Dashboard buttons
    document.getElementById('refresh-dashboard').addEventListener('click', () => {
        loadDashboard();
        showToast('Dashboard refreshed successfully', 'success');
    });
    
    document.getElementById('generate-report').addEventListener('click', () => {
        showToast('Report generation feature coming soon!', 'warning');
    });
    
    document.getElementById('view-all-bookings').addEventListener('click', () => {
        document.querySelector('[data-section="bookings"]').click();
    });
    
    // Quick action buttons
    document.getElementById('quick-add-room').addEventListener('click', () => showRoomForm());
    document.getElementById('quick-add-guest').addEventListener('click', () => showGuestForm());
    document.getElementById('quick-add-booking').addEventListener('click', () => showBookingForm());
    document.getElementById('quick-check-availability').addEventListener('click', () => showAvailabilityForm());
    
    // Section action buttons
    document.getElementById('add-room-btn').addEventListener('click', () => showRoomForm());
    document.getElementById('add-guest-btn').addEventListener('click', () => showGuestForm());
    document.getElementById('add-booking-btn').addEventListener('click', () => showBookingForm());
    document.getElementById('check-availability-btn').addEventListener('click', () => showAvailabilityForm());
    
    // Search and filter functionality
    document.getElementById('room-search').addEventListener('input', filterRooms);
    document.getElementById('guest-search').addEventListener('input', filterGuests);
    document.getElementById('booking-search').addEventListener('input', filterBookings);
    
    document.getElementById('room-type-filter').addEventListener('change', filterRooms);
    document.getElementById('booking-status-filter').addEventListener('change', filterBookings);
}

// Initial Data Loading
function loadInitialData() {
    console.log('Loading initial data...');
    loadDashboard();
}

// Dashboard Functions
async function loadDashboard() {
    try {
        // Show loading states
        document.querySelectorAll('.stat-number').forEach(el => {
            el.textContent = '...';
        });
        
        // Load all data in parallel
        await Promise.all([
            loadRoomsForDashboard(),
            loadGuestsForDashboard(),
            loadBookingsForDashboard()
        ]);
        
        // Calculate dashboard stats
        calculateDashboardStats();
        
        // Update UI
        updateDashboardStats();
        loadRecentBookings();
        
        showToast('Dashboard loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

async function loadRoomsForDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                rooms = data.data || [];
                return true;
            }
        }
        throw new Error('Failed to load rooms');
    } catch (error) {
        console.error('Error loading rooms:', error);
        return false;
    }
}

async function loadGuestsForDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/guests`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                guests = data.data || [];
                return true;
            }
        }
        throw new Error('Failed to load guests');
    } catch (error) {
        console.error('Error loading guests:', error);
        return false;
    }
}

async function loadBookingsForDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                bookings = data.data || [];
                return true;
            }
        }
        throw new Error('Failed to load bookings');
    } catch (error) {
        console.error('Error loading bookings:', error);
        return false;
    }
}

function calculateDashboardStats() {
    dashboardStats.totalRooms = rooms.length;
    dashboardStats.totalGuests = guests.length;
    dashboardStats.totalBookings = bookings.length;
    dashboardStats.availableRooms = rooms.filter(room => 
        room.status === 'available' || room.status === 'Available'
    ).length;
}

function updateDashboardStats() {
    document.getElementById('total-rooms-count').textContent = dashboardStats.totalRooms;
    document.getElementById('total-guests-count').textContent = dashboardStats.totalGuests;
    document.getElementById('total-bookings-count').textContent = dashboardStats.totalBookings;
    document.getElementById('available-rooms-count').textContent = dashboardStats.availableRooms;
}

async function loadRecentBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings?limit=5`);
        const container = document.getElementById('recent-bookings-body');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            let html = '';
            data.data.slice(0, 5).forEach(booking => {
                const guestName = booking.guestId?.name || 'N/A';
                const roomNumber = booking.roomId?.number || 'N/A';
                const checkIn = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A';
                const checkOut = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A';
                const shortId = booking._id ? booking._id.substring(18, 24) : 'N/A';
                
                html += `
                    <tr>
                        <td>#${shortId}</td>
                        <td>${guestName}</td>
                        <td>${roomNumber}</td>
                        <td>${checkIn}</td>
                        <td>${checkOut}</td>
                        <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editBooking('${booking._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-calendar-times" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>No recent bookings found</p>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading recent bookings:', error);
        const container = document.getElementById('recent-bookings-body');
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--error-color);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Failed to load recent bookings</p>
                </td>
            </tr>
        `;
    }
}

// Room Management
async function loadRooms() {
    try {
        const container = document.getElementById('rooms-list');
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="loading-animation" style="margin: 0 auto 1rem;"></div>
                <p>Loading rooms...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE_URL}/rooms`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            rooms = data.data || [];
            renderRooms();
        } else {
            throw new Error(data.message || 'Failed to load rooms');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        showToast(`Error loading rooms: ${error.message}`, 'error');
        
        const container = document.getElementById('rooms-list');
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--error-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load rooms: ${error.message}</p>
                <button onclick="loadRooms()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

function renderRooms() {
    const container = document.getElementById('rooms-list');
    
    if (rooms.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-bed" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p>No rooms found</p>
                <button onclick="showRoomForm()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Add First Room
                </button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Capacity</th>
                        <th>Amenities</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    rooms.forEach(room => {
        const statusClass = `status-${room.status.toLowerCase().replace(' ', '-')}`;
        html += `
            <tr>
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>$${room.price}</td>
                <td><span class="status-badge ${statusClass}">${room.status}</span></td>
                <td>${room.capacity}</td>
                <td>${room.amenities ? room.amenities.join(', ') : 'None'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editRoom('${room._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteRoom('${room._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Guest Management
async function loadGuests() {
    try {
        const container = document.getElementById('guests-list');
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="loading-animation" style="margin: 0 auto 1rem;"></div>
                <p>Loading guests...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE_URL}/guests`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            guests = data.data || [];
            renderGuests();
        } else {
            throw new Error(data.message || 'Failed to load guests');
        }
    } catch (error) {
        console.error('Error loading guests:', error);
        showToast(`Error loading guests: ${error.message}`, 'error');
        
        const container = document.getElementById('guests-list');
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--error-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load guests: ${error.message}</p>
                <button onclick="loadGuests()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

function renderGuests() {
    const container = document.getElementById('guests-list');
    
    if (guests.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-users" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p>No guests found</p>
                <button onclick="showGuestForm()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Add First Guest
                </button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>ID Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    guests.forEach(guest => {
        html += `
            <tr>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td>${guest.address || 'N/A'}</td>
                <td>${guest.idNumber || 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editGuest('${guest._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteGuest('${guest._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Booking Management
async function loadBookings() {
    try {
        const container = document.getElementById('bookings-list');
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="loading-animation" style="margin: 0 auto 1rem;"></div>
                <p>Loading bookings...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE_URL}/bookings`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            bookings = data.data || [];
            renderBookings();
        } else {
            throw new Error(data.message || 'Failed to load bookings');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        showToast(`Error loading bookings: ${error.message}`, 'error');
        
        const container = document.getElementById('bookings-list');
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--error-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load bookings: ${error.message}</p>
                <button onclick="loadBookings()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

function renderBookings() {
    const container = document.getElementById('bookings-list');
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-calendar-times" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p>No bookings found</p>
                <button onclick="showBookingForm()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Create First Booking
                </button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Status</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    bookings.forEach(booking => {
        const guestName = booking.guestId?.name || 'N/A';
        const roomNumber = booking.roomId?.number || 'N/A';
        const checkIn = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A';
        const checkOut = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A';
        
        html += `
            <tr>
                <td>${guestName}</td>
                <td>${roomNumber}</td>
                <td>${checkIn}</td>
                <td>${checkOut}</td>
                <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td>$${booking.totalPrice || '0'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editBooking('${booking._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteBooking('${booking._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Modal Management
function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalBody.innerHTML = '';
    currentEditId = null;
}

// Form Functions
function showRoomForm(room = null) {
    const isEdit = room !== null;
    currentEditId = isEdit ? room._id : null;
    
    const html = `
        <form id="room-form">
            <div class="form-group">
                <label for="room-number"><i class="fas fa-hashtag"></i> Room Number *</label>
                <input type="text" id="room-number" class="form-control" value="${isEdit ? room.number : ''}" required>
                <div class="error-message" id="room-number-error"></div>
            </div>
            
            <div class="form-group">
                <label for="room-type"><i class="fas fa-tag"></i> Room Type *</label>
                <select id="room-type" class="form-control" required>
                    <option value="">Select Type</option>
                    <option value="single" ${isEdit && room.type === 'single' ? 'selected' : ''}>Single</option>
                    <option value="double" ${isEdit && room.type === 'double' ? 'selected' : ''}>Double</option>
                    <option value="suite" ${isEdit && room.type === 'suite' ? 'selected' : ''}>Suite</option>
                    <option value="deluxe" ${isEdit && room.type === 'deluxe' ? 'selected' : ''}>Deluxe</option>
                </select>
                <div class="error-message" id="room-type-error"></div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="room-price"><i class="fas fa-dollar-sign"></i> Price per Night *</label>
                    <input type="number" id="room-price" class="form-control" min="0" step="0.01" value="${isEdit ? room.price : ''}" required>
                    <div class="error-message" id="room-price-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="room-capacity"><i class="fas fa-user-friends"></i> Capacity</label>
                    <input type="number" id="room-capacity" class="form-control" min="1" value="${isEdit ? room.capacity : 1}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="room-status"><i class="fas fa-circle"></i> Status</label>
                <select id="room-status" class="form-control">
                    <option value="available" ${isEdit && room.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="occupied" ${isEdit && room.status === 'occupied' ? 'selected' : ''}>Occupied</option>
                    <option value="maintenance" ${isEdit && room.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="room-amenities"><i class="fas fa-concierge-bell"></i> Amenities (comma separated)</label>
                <input type="text" id="room-amenities" class="form-control" value="${isEdit && room.amenities ? room.amenities.join(', ') : ''}" placeholder="TV, WiFi, Air Conditioning, Mini Bar">
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Room
                </button>
                <button type="button" class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `;
    
    modalTitle.innerHTML = `<i class="fas fa-bed"></i> ${isEdit ? 'Edit' : 'Add'} Room`;
    modalBody.innerHTML = html;
    
    const form = document.getElementById('room-form');
    form.removeEventListener('submit', handleRoomSubmit);
    form.addEventListener('submit', handleRoomSubmit);
    
    openModal();
}

function showGuestForm(guest = null) {
    const isEdit = guest !== null;
    currentEditId = isEdit ? guest._id : null;
    
    const html = `
        <form id="guest-form">
            <div class="form-group">
                <label for="guest-name"><i class="fas fa-user"></i> Full Name *</label>
                <input type="text" id="guest-name" class="form-control" value="${isEdit ? guest.name : ''}" required>
                <div class="error-message" id="guest-name-error"></div>
            </div>
            
            <div class="form-group">
                <label for="guest-email"><i class="fas fa-envelope"></i> Email *</label>
                <input type="email" id="guest-email" class="form-control" value="${isEdit ? guest.email : ''}" required>
                <div class="error-message" id="guest-email-error"></div>
            </div>
            
            <div class="form-group">
                <label for="guest-phone"><i class="fas fa-phone"></i> Phone *</label>
                <input type="text" id="guest-phone" class="form-control" value="${isEdit ? guest.phone : ''}" required>
                <div class="error-message" id="guest-phone-error"></div>
            </div>
            
            <div class="form-group">
                <label for="guest-address"><i class="fas fa-home"></i> Address</label>
                <input type="text" id="guest-address" class="form-control" value="${isEdit ? guest.address : ''}" placeholder="Street, City, Country">
            </div>
            
            <div class="form-group">
                <label for="guest-id"><i class="fas fa-id-card"></i> ID Number</label>
                <input type="text" id="guest-id" class="form-control" value="${isEdit ? guest.idNumber : ''}" placeholder="Passport or ID number">
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Guest
                </button>
                <button type="button" class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `;
    
    modalTitle.innerHTML = `<i class="fas fa-user"></i> ${isEdit ? 'Edit' : 'Add'} Guest`;
    modalBody.innerHTML = html;
    
    const form = document.getElementById('guest-form');
    form.removeEventListener('submit', handleGuestSubmit);
    form.addEventListener('submit', handleGuestSubmit);
    
    openModal();
}

// FIXED: showBookingForm function - Uses MM/DD/YYYY format for dates
function showBookingForm(booking = null) {
    const isEdit = booking !== null;
    currentEditId = isEdit ? booking._id : null;
    
    // Get today's date in MM/DD/YYYY format for the backend
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = formatDateMMDDYYYY(today);
    const tomorrowStr = formatDateMMDDYYYY(tomorrow);
    
    // Extract guest ID - handle both populated object and string ID
    const guestId = isEdit ? (booking.guestId?._id || booking.guestId) : '';
    
    // Extract room ID - handle both populated object and string ID
    const roomId = isEdit ? (booking.roomId?._id || booking.roomId) : '';
    
    const guestOptions = guests.map(g => 
        `<option value="${g._id}" ${guestId === g._id ? 'selected' : ''}>
            ${g.name} (${g.email})
        </option>`
    ).join('');
    
    const roomOptions = rooms.map(r => 
        `<option value="${r._id}" ${roomId === r._id ? 'selected' : ''}>
            ${r.number} (${r.type}) - $${r.price}/night
        </option>`
    ).join('');
    
    // For display in date inputs (which need YYYY-MM-DD), we need to convert
    // But we'll handle the conversion in the submit handler
    const checkInForInput = isEdit ? formatDateForInput(booking.checkIn) : '';
    const checkOutForInput = isEdit ? formatDateForInput(booking.checkOut) : '';
    
    const html = `
        <form id="booking-form">
            <div class="form-group">
                <label for="booking-guest"><i class="fas fa-user"></i> Guest *</label>
                <select id="booking-guest" class="form-control" required>
                    <option value="">Select Guest</option>
                    ${guestOptions}
                </select>
                <div class="error-message" id="booking-guest-error"></div>
            </div>
            
            <div class="form-group">
                <label for="booking-room"><i class="fas fa-bed"></i> Room *</label>
                <select id="booking-room" class="form-control" required>
                    <option value="">Select Room</option>
                    ${roomOptions}
                </select>
                <div class="error-message" id="booking-room-error"></div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-checkin"><i class="fas fa-calendar-plus"></i> Check-In Date *</label>
                    <input type="date" id="booking-checkin" class="form-control" 
                           value="${checkInForInput || formatDateForInput(today)}" 
                           required>
                    <div class="error-message" id="booking-checkin-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="booking-checkout"><i class="fas fa-calendar-minus"></i> Check-Out Date *</label>
                    <input type="date" id="booking-checkout" class="form-control" 
                           value="${checkOutForInput || formatDateForInput(tomorrow)}" 
                           required>
                    <div class="error-message" id="booking-checkout-error"></div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="booking-status"><i class="fas fa-circle"></i> Status</label>
                <select id="booking-status" class="form-control">
                    <option value="pending" ${isEdit && booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${isEdit && booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="checked-in" ${isEdit && booking.status === 'checked-in' ? 'selected' : ''}>Checked In</option>
                    <option value="checked-out" ${isEdit && booking.status === 'checked-out' ? 'selected' : ''}>Checked Out</option>
                    <option value="cancelled" ${isEdit && booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="booking-notes"><i class="fas fa-sticky-note"></i> Notes</label>
                <textarea id="booking-notes" class="form-control" rows="3" placeholder="Additional notes about the booking...">${isEdit ? (booking.notes || '') : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Booking
                </button>
                <button type="button" class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
    `;
    
    modalTitle.innerHTML = `<i class="fas fa-calendar-check"></i> ${isEdit ? 'Edit' : 'Create'} Booking`;
    modalBody.innerHTML = html;
    
    const form = document.getElementById('booking-form');
    form.removeEventListener('submit', handleBookingSubmit);
    form.addEventListener('submit', handleBookingSubmit);
    
    // Add date validation
    const checkInInput = document.getElementById('booking-checkin');
    const checkOutInput = document.getElementById('booking-checkout');
    
    if (checkInInput && checkOutInput) {
        // Set min date to today
        const todayForInput = new Date().toISOString().split('T')[0];
        checkInInput.min = todayForInput;
        
        checkInInput.addEventListener('change', function() {
            // When check-in changes, set check-out min to the next day
            const nextDay = new Date(this.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.min = nextDay.toISOString().split('T')[0];
            validateBookingDates();
        });
        
        checkOutInput.addEventListener('change', validateBookingDates);
    }
    
    openModal();
}

function showAvailabilityForm() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const html = `
        <form id="availability-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="availability-checkin"><i class="fas fa-calendar-plus"></i> Check-In Date *</label>
                    <input type="date" id="availability-checkin" class="form-control" value="${today}" min="${today}" required>
                    <div class="error-message" id="availability-checkin-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="availability-checkout"><i class="fas fa-calendar-minus"></i> Check-Out Date *</label>
                    <input type="date" id="availability-checkout" class="form-control" value="${tomorrowStr}" min="${tomorrowStr}" required>
                    <div class="error-message" id="availability-checkout-error"></div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="availability-type"><i class="fas fa-tag"></i> Room Type</label>
                <select id="availability-type" class="form-control">
                    <option value="">All Types</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="deluxe">Deluxe</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">
                    <i class="fas fa-search"></i> Check Availability
                </button>
                <button type="button" class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </form>
        
        <div id="availability-results" style="margin-top: 2rem;"></div>
    `;
    
    modalTitle.innerHTML = `<i class="fas fa-search"></i> Check Room Availability`;
    modalBody.innerHTML = html;
    
    const form = document.getElementById('availability-form');
    form.removeEventListener('submit', handleAvailabilityCheck);
    form.addEventListener('submit', handleAvailabilityCheck);
    
    openModal();
}

// Form Handlers
async function handleRoomSubmit(e) {
    e.preventDefault();
    
    // Clear errors
    clearErrors();
    
    // Get form data
    const formData = {
        number: document.getElementById('room-number').value.trim(),
        type: document.getElementById('room-type').value,
        price: parseFloat(document.getElementById('room-price').value),
        status: document.getElementById('room-status').value,
        capacity: parseInt(document.getElementById('room-capacity').value) || 1,
        amenities: document.getElementById('room-amenities').value
            .split(',')
            .map(a => a.trim())
            .filter(a => a)
    };
    
    // Validate
    if (!formData.number) {
        showError('room-number', 'Room number is required');
        return;
    }
    if (!formData.type) {
        showError('room-type', 'Room type is required');
        return;
    }
    if (!formData.price || formData.price <= 0) {
        showError('room-price', 'Valid price is required');
        return;
    }
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/rooms/${currentEditId}`
            : `${API_BASE_URL}/rooms`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Room ${currentEditId ? 'updated' : 'created'} successfully`, 'success');
            closeModal();
            
            // Reload data
            if (currentSection === 'rooms') {
                loadRooms();
            }
            loadDashboard();
        } else {
            throw new Error(data.message || 'Failed to save room');
        }
    } catch (error) {
        console.error('Error saving room:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function handleGuestSubmit(e) {
    e.preventDefault();
    
    clearErrors();
    
    const formData = {
        name: document.getElementById('guest-name').value.trim(),
        email: document.getElementById('guest-email').value.trim(),
        phone: document.getElementById('guest-phone').value.trim(),
        address: document.getElementById('guest-address').value.trim() || undefined,
        idNumber: document.getElementById('guest-id').value.trim() || undefined
    };
    
    // Validate
    if (!formData.name) {
        showError('guest-name', 'Name is required');
        return;
    }
    if (!formData.email || !isValidEmail(formData.email)) {
        showError('guest-email', 'Valid email is required');
        return;
    }
    if (!formData.phone) {
        showError('guest-phone', 'Phone is required');
        return;
    }
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/guests/${currentEditId}`
            : `${API_BASE_URL}/guests`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Guest ${currentEditId ? 'updated' : 'created'} successfully`, 'success');
            closeModal();
            
            if (currentSection === 'guests') {
                loadGuests();
            }
            loadDashboard();
        } else {
            throw new Error(data.message || 'Failed to save guest');
        }
    } catch (error) {
        console.error('Error saving guest:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// FIXED: handleBookingSubmit function - Converts dates to MM/DD/YYYY format for backend
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    clearErrors();
    
    if (!validateBookingDates()) {
        return;
    }
    
    // Get form values
    const guestSelect = document.getElementById('booking-guest');
    const roomSelect = document.getElementById('booking-room');
    const checkInInput = document.getElementById('booking-checkin');
    const checkOutInput = document.getElementById('booking-checkout');
    const statusSelect = document.getElementById('booking-status');
    const notesTextarea = document.getElementById('booking-notes');
    
    if (!guestSelect || !roomSelect || !checkInInput || !checkOutInput || !statusSelect) {
        showToast('Form elements not found', 'error');
        return;
    }
    
    // Prepare form data
    const formData = {
        guestId: guestSelect.value,
        roomId: roomSelect.value,
        status: statusSelect.value,
        notes: notesTextarea ? notesTextarea.value.trim() : undefined
    };
    
    // Validate required fields
    if (!formData.guestId) {
        showError('booking-guest', 'Guest is required');
        return;
    }
    if (!formData.roomId) {
        showError('booking-room', 'Room is required');
        return;
    }
    if (!checkInInput.value) {
        showError('booking-checkin', 'Check-in date is required');
        return;
    }
    if (!checkOutInput.value) {
        showError('booking-checkout', 'Check-out date is required');
        return;
    }
    
    // Convert dates from YYYY-MM-DD (HTML input) to MM/DD/YYYY (backend format)
    if (checkInInput.value) {
        formData.checkIn = convertDateToMMDDYYYY(checkInInput.value);
    }
    
    if (checkOutInput.value) {
        formData.checkOut = convertDateToMMDDYYYY(checkOutInput.value);
    }
    
    console.log('Sending booking data to backend:', formData);
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/bookings/${currentEditId}`
            : `${API_BASE_URL}/bookings`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        console.log(`Making ${method} request to:`, url);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        console.log('Backend response:', data);
        
        if (data.success) {
            showToast(`Booking ${currentEditId ? 'updated' : 'created'} successfully`, 'success');
            closeModal();
            
            if (currentSection === 'bookings') {
                loadBookings();
            }
            loadDashboard();
        } else {
            // Show the error message from backend
            const errorMsg = data.message || 'Failed to save booking';
            showToast(`Error: ${errorMsg}`, 'error');
            
            // Highlight specific field errors if available
            if (errorMsg.includes('Check-out date')) {
                showError('booking-checkout', errorMsg);
            } else if (errorMsg.includes('Check-in date')) {
                showError('booking-checkin', errorMsg);
            }
        }
    } catch (error) {
        console.error('Error saving booking:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function handleAvailabilityCheck(e) {
    e.preventDefault();
    
    clearErrors();
    
    const checkIn = document.getElementById('availability-checkin').value;
    const checkOut = document.getElementById('availability-checkout').value;
    const type = document.getElementById('availability-type').value;
    
    if (!checkIn || !checkOut) {
        showError('availability-checkin', 'Both dates are required');
        return;
    }
    
    if (new Date(checkOut) <= new Date(checkIn)) {
        showError('availability-checkout', 'Check-out date must be after check-in date');
        return;
    }
    
    try {
        const resultsDiv = document.getElementById('availability-results');
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div class="loading-animation" style="margin: 0 auto;"></div>
                <p>Checking availability...</p>
            </div>
        `;
        
        // Convert dates to backend format
        const checkInFormatted = convertDateToMMDDYYYY(checkIn);
        const checkOutFormatted = convertDateToMMDDYYYY(checkOut);
        
        const params = new URLSearchParams({ 
            checkIn: checkInFormatted, 
            checkOut: checkOutFormatted 
        });
        if (type) params.append('type', type);
        
        const response = await fetch(`${API_BASE_URL}/rooms/available?${params}`);
        const data = await response.json();
        
        if (data.success) {
            let html = `
                <h4 style="margin-bottom: 1rem; color: var(--text-primary);">
                    <i class="fas fa-check-circle"></i> Available Rooms (${data.count || 0})
                </h4>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    From ${checkIn} to ${checkOut}${type ? ` • Type: ${type}` : ''}
                </p>
            `;
            
            if (data.data && data.data.length > 0) {
                html += `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Capacity</th>
                                    <th>Amenities</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                data.data.forEach(room => {
                    html += `
                        <tr>
                            <td>${room.number}</td>
                            <td>${room.type}</td>
                            <td>$${room.price}</td>
                            <td>${room.capacity}</td>
                            <td>${room.amenities ? room.amenities.join(', ') : 'None'}</td>
                            <td><span class="status-badge status-${room.status.toLowerCase()}">${room.status}</span></td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table></div>';
            } else {
                html += `
                    <div style="text-align: center; padding: 2rem; background: var(--background-color); border-radius: var(--border-radius);">
                        <i class="fas fa-bed" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>No rooms available for the selected dates</p>
                    </div>
                `;
            }
            
            resultsDiv.innerHTML = html;
        } else {
            throw new Error(data.message || 'Failed to check availability');
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        document.getElementById('availability-results').innerHTML = `
            <div style="color: var(--error-color); text-align: center; padding: 1rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Edit Functions
function editRoom(id) {
    const room = rooms.find(r => r._id === id);
    if (room) {
        showRoomForm(room);
    }
}

function editGuest(id) {
    const guest = guests.find(g => g._id === id);
    if (guest) {
        showGuestForm(guest);
    }
}

function editBooking(id) {
    const booking = bookings.find(b => b._id === id);
    if (booking) {
        showBookingForm(booking);
    } else {
        // If booking not found in cache, fetch it from the server
        fetchBookingById(id);
    }
}

// Helper function to fetch booking by ID
async function fetchBookingById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showBookingForm(data.data);
        } else {
            throw new Error(data.message || 'Failed to load booking');
        }
    } catch (error) {
        console.error('Error fetching booking:', error);
        showToast(`Error loading booking: ${error.message}`, 'error');
    }
}

// Delete Functions
async function deleteRoom(id) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Room deleted successfully', 'success');
            if (currentSection === 'rooms') {
                loadRooms();
            }
            loadDashboard();
        } else {
            throw new Error(data.message || 'Failed to delete room');
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function deleteGuest(id) {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Guest deleted successfully', 'success');
            if (currentSection === 'guests') {
                loadGuests();
            }
            loadDashboard();
        } else {
            throw new Error(data.message || 'Failed to delete guest');
        }
    } catch (error) {
        console.error('Error deleting guest:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Booking deleted successfully', 'success');
            if (currentSection === 'bookings') {
                loadBookings();
            }
            loadDashboard();
        } else {
            throw new Error(data.message || 'Failed to delete booking');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Filter Functions
function filterRooms() {
    const searchTerm = document.getElementById('room-search').value.toLowerCase();
    const typeFilter = document.getElementById('room-type-filter').value;
    
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.number.toLowerCase().includes(searchTerm) || 
                             room.type.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || room.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    renderFilteredRooms(filteredRooms);
}

function filterGuests() {
    const searchTerm = document.getElementById('guest-search').value.toLowerCase();
    
    const filteredGuests = guests.filter(guest => {
        return guest.name.toLowerCase().includes(searchTerm) || 
               guest.email.toLowerCase().includes(searchTerm) ||
               (guest.phone && guest.phone.includes(searchTerm));
    });
    
    renderFilteredGuests(filteredGuests);
}

function filterBookings() {
    const searchTerm = document.getElementById('booking-search').value.toLowerCase();
    const statusFilter = document.getElementById('booking-status-filter').value;
    
    const filteredBookings = bookings.filter(booking => {
        const guestName = booking.guestId?.name?.toLowerCase() || '';
        const roomNumber = booking.roomId?.number?.toLowerCase() || '';
        
        const matchesSearch = guestName.includes(searchTerm) || 
                             roomNumber.includes(searchTerm);
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderFilteredBookings(filteredBookings);
}

function renderFilteredRooms(filteredRooms) {
    const container = document.getElementById('rooms-list');
    
    if (filteredRooms.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-search" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p>No rooms match your search criteria</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Capacity</th>
                        <th>Amenities</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredRooms.forEach(room => {
        const statusClass = `status-${room.status.toLowerCase().replace(' ', '-')}`;
        html += `
            <tr>
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>$${room.price}</td>
                <td><span class="status-badge ${statusClass}">${room.status}</span></td>
                <td>${room.capacity}</td>
                <td>${room.amenities ? room.amenities.join(', ') : 'None'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editRoom('${room._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteRoom('${room._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function renderFilteredGuests(filteredGuests) {
    const container = document.getElementById('guests-list');
    
    if (filteredGuests.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-search" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p>No guests match your search criteria</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>ID Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredGuests.forEach(guest => {
        html += `
            <tr>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td>${guest.address || 'N/A'}</td>
                <td>${guest.idNumber || 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editGuest('${guest._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteGuest('${guest._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function renderFilteredBookings(filteredBookings) {
    const container = document.getElementById('bookings-list');
    
    if (filteredBookings.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-search" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p>No bookings match your search criteria</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Status</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredBookings.forEach(booking => {
        const guestName = booking.guestId?.name || 'N/A';
        const roomNumber = booking.roomId?.number || 'N/A';
        const checkIn = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A';
        const checkOut = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A';
        
        html += `
            <tr>
                <td>${guestName}</td>
                <td>${roomNumber}</td>
                <td>${checkIn}</td>
                <td>${checkOut}</td>
                <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td>$${booking.totalPrice || '0'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editBooking('${booking._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteBooking('${booking._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Utility Functions - FIXED for backend compatibility
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateMMDDYYYY(date) {
    if (!date || isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function convertDateToMMDDYYYY(dateString) {
    if (!dateString) return '';
    
    // Handle both YYYY-MM-DD and MM/DD/YYYY formats
    if (dateString.includes('-')) {
        // YYYY-MM-DD format
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    } else if (dateString.includes('/')) {
        // Already MM/DD/YYYY format
        return dateString;
    }
    
    // Fallback: try to parse as Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return formatDateMMDDYYYY(date);
}

function validateBookingDates() {
    const checkInInput = document.getElementById('booking-checkin');
    const checkOutInput = document.getElementById('booking-checkout');
    const errorElement = document.getElementById('booking-checkout-error');
    
    if (!checkInInput || !checkOutInput) return true;
    
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    
    if (!checkIn || !checkOut) return true;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Set to midnight for accurate comparison
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);
    
    if (checkOutDate <= checkInDate) {
        if (errorElement) {
            errorElement.textContent = 'Check-out date must be after check-in date';
        }
        return false;
    } else {
        if (errorElement) {
            errorElement.textContent = '';
        }
        return true;
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error-color)';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    let icon = '';
    switch(type) {
        case 'success': icon = '✓'; break;
        case 'error': icon = '✗'; break;
        case 'warning': icon = '⚠'; break;
        default: icon = 'ℹ';
    }
    
    toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Make functions globally available
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.editGuest = editGuest;
window.deleteGuest = deleteGuest;
window.editBooking = editBooking;
window.deleteBooking = deleteBooking;
window.showRoomForm = showRoomForm;
window.showGuestForm = showGuestForm;
window.showBookingForm = showBookingForm;
window.showAvailabilityForm = showAvailabilityForm;
window.loadDashboard = loadDashboard;
window.loadRooms = loadRooms;
window.loadGuests = loadGuests;
window.loadBookings = loadBookings;