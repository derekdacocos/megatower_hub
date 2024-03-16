const firebaseConfig = {
    apiKey: "AIzaSyB0w3oovf85ZTyZBfKapuZxx1i0OiGyRZ0",
    authDomain: "megatower-hub-ca285.firebaseapp.com",
    databaseURL: "https://megatower-hub-ca285-default-rtdb.firebaseio.com",
    projectId: "megatower-hub-ca285",
    storageBucket: "megatower-hub-ca285.appspot.com",
    messagingSenderId: "900973693171",
    appId: "1:900973693171:web:9062bf9b49221596294f86"
};

firebase.initializeApp(firebaseConfig);

// Function to fetch admin notifications and populate the modal
function fetchAdminNotifications() {
    const adminNotificationsRef = firebase.database().ref('adminNotifications').orderByChild('submittedAt');

    adminNotificationsRef.on('value', (snapshot) => {
        const adminNotifications = [];
        snapshot.forEach((childSnapshot) => {
            const notification = childSnapshot.val();
            adminNotifications.push(notification);
        });

        // Reverse the array to display recent notifications first
        adminNotifications.reverse();

        // Clear previous notifications from the modal body
        const modalBody = document.querySelector('#adminNotificationsModal .modal-body');
        modalBody.innerHTML = '';

        // Populate the modal body with notifications
        adminNotifications.forEach((notification, index) => {
            const notificationElement = document.createElement('div');
            notificationElement.classList.add('notification', 'mb-4', 'p-3', 'border', 'rounded');
            const submittedAt = new Date(notification.submittedAt).toLocaleString(); // Get submittedAt
            notificationElement.innerHTML = `
                <h6 class="text-${notification.type === 'Maintenance' ? 'warning' : 'success'}">${notification.type} Request</h6>
                <p class="mb-1">${notification.message}</p> <!-- Message -->
                <small class="text-muted">${submittedAt}</small> <!-- SubmittedAt -->
            `;
            modalBody.appendChild(notificationElement);
        });
    });
}

// Call the function to fetch and populate admin notifications when the page loads
window.addEventListener('DOMContentLoaded', () => {
    fetchAdminNotifications();
});

// Function to open the admin notifications modal when notifications link is clicked
document.getElementById('notificationsLink').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default action of the link (e.g., navigation)

    // Show the admin notifications modal
    $('#adminNotificationsModal').modal('show');

    // Mark notifications as read when the modal is opened
    markNotificationsAsRead();
});

// Function to mark notifications as read
function markNotificationsAsRead() {
    const notificationsRef = firebase.database().ref('adminNotifications');
    notificationsRef.once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            const notification = childSnapshot.val();
            if (!notification.isRead) {
                // Mark the notification as read in the database
                childSnapshot.ref.update({ isRead: true });
            }
        });
    });
}

// Function to display the number of unread notifications and update in real-time
function displayUnreadNotificationsCount() {
    const notificationsRef = firebase.database().ref('adminNotifications');
    
    // Listen for changes in the notifications node
    notificationsRef.on('value', snapshot => {
        let unreadCount = 0;
        snapshot.forEach(childSnapshot => {
            const notification = childSnapshot.val();
            if (!notification.isRead) {
                unreadCount++;
            }
        });

        // Display the unread count in the notifications link
        document.getElementById('unreadCountBadge').textContent = unreadCount > 0 ? unreadCount : '';
    });
}

// Call the function to display unread notifications count
displayUnreadNotificationsCount();