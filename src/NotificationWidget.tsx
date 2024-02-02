import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, deleteDoc, updateDoc, deleteField, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardContent, IconButton, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { styled } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';

interface Notification {
  id: string;
  notifName: string;
  notifTitle: string;
}

  
  
  const NotificationCard = styled(Card)(({ totalNotifications }: { totalNotifications: number }) => ({
    width: totalNotifications <= 4 ? `${470}px` : `${(520 - 20) / Math.ceil(totalNotifications / 4)}px`,
    // Adjust the above logic for width according to the number of notifications you want to display in a row
  
    height: '80px',
    borderRadius: '8px',
    backgroundColor: '#A62D38',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    gap: '10px', // Adjust the gap inside the card as needed
    marginTop: '7px', // Adjust the marginTop to move each card down within the container
  }));
  
  const StyledContainer = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: '20px',
    paddingBottom: '10px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '527px',
    height: '180px', // Fixed height for the container
    overflowY: 'auto', // Enable vertical scrolling if needed
    marginTop: '60px',
  });
  

  const NotificationIcon = styled(NotificationsIcon)({
    fontSize: '36px', // Adjust icon size as needed
    color: 'white', // Adjust icon color as needed
  });
  
  const NotificationText = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
  });

  const CloseButton = styled(IconButton)({
    marginLeft: 'auto', // Push the close icon to the rightmost side of the card
  });
  
  

  const NotificationBox = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
  
    useEffect(() => {
      const firestore = getFirestore();
      const auth = getAuth();
  
      const fetchNotifications = async (currentUser: User | null) => {
        if (currentUser) {
          const currentUserUid = currentUser.uid;
  
          try {
            const userDocRef = doc(firestore, 'users', currentUserUid);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
              if (doc.exists()) {
                const notificationsData: Notification[] = [];
                const notificationsMap = doc.data()?.Notifications;
  
                if (notificationsMap) {
                  Object.keys(notificationsMap).forEach((title) => {
                    const { notifName, notifTitle } = notificationsMap[title];
                    notificationsData.push({
                      id: title,
                      notifName,
                      notifTitle,
                    });
                  });
                }
  
                setNotifications(notificationsData);
              }
            });
  
            return () => unsubscribe(); // Cleanup function
          } catch (error) {
            console.error('Error fetching notifications:', error);
          }
        }
      };
  
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        fetchNotifications(user);
      });
  
      return () => unsubscribe();
    }, []);
  
    const handleNotificationClose = async (notificationId: string) => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (user) {
          const firestore = getFirestore();
          const userDocRef = doc(firestore, 'users', user.uid);
  
          // Update the user document to delete the notification field
          await updateDoc(userDocRef, {
            [`Notifications.${notificationId}`]: deleteField(), // Use deleteField() to delete the field
          });
  
          // The UI will be updated in real-time by the onSnapshot listener
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        // Handle error as needed
      }
    };


  return (
    <StyledContainer>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <NotificationCard key={index} totalNotifications={0}>
            <NotificationIcon />
            <NotificationText>
              <Typography variant="h6">{notification.notifName}</Typography>
              <Typography style={{ color: "white" }} variant="body1" color="textSecondary">
                {notification.notifTitle}
              </Typography>
            </NotificationText>
            <CloseButton aria-label="close" onClick={() => handleNotificationClose(notification.id)}>
              <CloseIcon style={{ fill: 'white' }} />
            </CloseButton>
          </NotificationCard>
        ))
      ) : (
        <p>No notifications found.</p>
      )}
    </StyledContainer>
  );
};

export default NotificationBox;