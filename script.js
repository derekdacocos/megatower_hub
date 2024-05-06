// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyB0w3oovf85ZTyZBfKapuZxx1i0OiGyRZ0",
    authDomain: "megatower-hub-ca285.firebaseapp.com",
    databaseURL: "https://megatower-hub-ca285-default-rtdb.firebaseio.com",
    projectId: "megatower-hub-ca285",
    storageBucket: "megatower-hub-ca285.appspot.com",
    messagingSenderId: "900973693171",
    appId: "1:900973693171:web:9062bf9b49221596294f86"
  };
  firebase.initializeApp(firebaseConfig);
  
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      fetchNotifications();
    } else {
      console.log('User not signed in.');
    }
  });

  function fetchNotifications() {
    const userId = firebase.auth().currentUser.uid;
    const notificationsRef = firebase.database().ref('users/' + userId + '/notifications');

    notificationsRef.on('value', snapshot => {
      const notifications = snapshot.val();
      displayNotifications(notifications);
      updateUnreadCountBadge(countUnreadNotifications(notifications));
    });
  }

  function displayNotifications(notifications) {
    const notificationsContainer = document.querySelector('.modal-body');
    notificationsContainer.innerHTML = '';

    // Convert notifications object to an array of key-value pairs
    const notificationsArray = Object.entries(notifications || {});

    // Sort the notifications based on their timestamp (assuming you have a timestamp property)
    notificationsArray.sort((a, b) => b[1].dateTime - a[1].dateTime);

    // Loop through the sorted notifications array
    notificationsArray.forEach(([key, notification]) => {
        const notificationElement = document.createElement('div');
        notificationElement.classList.add('notification', 'mb-4', 'p-3', 'border', 'rounded');

        if (!notification.isRead) {
            notificationElement.classList.add('unread');
        }

        // Get the date and time string from the timestamp
        const dateTime = new Date(notification.dateTime).toLocaleString();

        // Ensure you are using the correct property names as stored in your Firebase database
        notificationElement.innerHTML = `
            <h6 class="text-warning"><i class="fas fa-bell"></i> ${notification.title || 'Notification'}</h6>
            <p class="mb-1">${notification.notification || 'No message'}</p>
            <small class="text-muted">${dateTime}</small> <!-- Display time -->
        `;
        notificationsContainer.appendChild(notificationElement);

        notificationElement.addEventListener('click', () => {
            markNotificationAsRead(key);
        });
    });
}


  function countUnreadNotifications(notifications) {
    return Object.values(notifications || {}).filter(n => !n.isRead).length;
  }

  function updateUnreadCountBadge(count) {
    const badge = document.getElementById('unreadCountBadge');
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block'; // Show badge
    } else {
      badge.style.display = 'none'; // Hide badge if no unread notifications
    }
  }

  function markNotificationAsRead(key) {
    const userId = firebase.auth().currentUser.uid;
    firebase.database().ref(`users/${userId}/notifications/${key}`).update({ isRead: true });
  }

  $('#notificationsModal').on('show.bs.modal', function () {
    const userId = firebase.auth().currentUser.uid;
    const notificationsRef = firebase.database().ref('users/' + userId + '/notifications');
    notificationsRef.once('value').then(snapshot => {
      snapshot.forEach(childSnapshot => {
        childSnapshot.ref.update({ isRead: true });
      });
      // After marking notifications as read, refresh to reflect changes
      fetchNotifications(); 
    });
  });