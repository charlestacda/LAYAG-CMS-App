import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css';
import '../src/calendarstyle.css';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import firebase from 'firebase/compat/app';
import { firebaseConfig } from './firebase-config.ts';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

interface MyEvent {
  eventTitle: string;
  eventDesc: string;
  eventStart: Date;
  eventEnd: Date;
  eventLocation: string;
  // Add other event properties if needed
}

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventDetails, setShowEventDetails] = useState<boolean>(true); 
  const [selectedEvents, setSelectedEvents] = useState<MyEvent[]>([]);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch events from the 'events' collection
        const eventsQuerySnapshot = await getDocs(collection(firestore, 'events'));
        const fetchedEvents: MyEvent[] = [];

        eventsQuerySnapshot.forEach((doc) => {
          const eventData = doc.data();
          const startDateTime = eventData.startDateTime.toDate();
          const endDateTime = eventData.endDateTime.toDate();

          fetchedEvents.push({
            eventTitle: eventData.title,
            eventDesc: eventData.description,
            eventStart: startDateTime,
            eventEnd: endDateTime,
            eventLocation: eventData.location,
          });
        });

        // Fetch todo list data from the 'todo_list' collection
        const currentUser = auth.currentUser;
        if (currentUser) {
          const todoListDocRef = doc(firestore, 'todo_list', currentUser.uid);
          const todoListDocSnapshot = await getDoc(todoListDocRef);

          if (todoListDocSnapshot.exists()) {
            const todoLists = todoListDocSnapshot.data();

            // Iterate through the todo lists
            Object.keys(todoLists).forEach((todoListName) => {
              const todoList = todoLists[todoListName];

              // Parse deadlineDate string into a Date object
              const deadlineDate = moment(todoList.deadlineDate, 'YYYY-MM-DD h:mm A').toDate();

              if (!isNaN(deadlineDate.getTime())) {
                // Create events based on todo list data
                fetchedEvents.push({
                  eventTitle: todoList.todoTask,
                  eventDesc: todoList.todoStatus,
                  eventStart: deadlineDate,
                  eventEnd: deadlineDate,
                  eventLocation: todoList.todoTask,
                });
              } else {
                console.warn(`Invalid deadlineDate in todoList: ${JSON.stringify(todoList)}`);
              }
            });
          }
        }

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Handle the error gracefully, e.g., show a message to the user
      }
    };

    fetchEvents();
  }, [firestore]);

  useEffect(() => {
    // Fetch events for the initially selected date when the component loads
    const eventsOnSelectedDate = events.filter(
      (event) =>
        moment(selectedDate).isBetween(
          moment(event.eventStart).startOf('day'),
          moment(event.eventEnd).endOf('day'),
          null,
          '[]'
        )
    );
    setSelectedEvents(eventsOnSelectedDate);
  }, [selectedDate, events]);

  const eventTileContent = ({ date }: { date: Date }): React.ReactNode => {
    const eventsOnDate = events.filter(
      (event) =>
        moment(date).isBetween(
          moment(event.eventStart).startOf('day'),
          moment(event.eventEnd).endOf('day'),
          null,
          '[]'
        )
    );

    return eventsOnDate.length > 0 ? (
      <div className="event-markers">
        {/* Render event markers for each event on the date */}
        {eventsOnDate.map((event, index) => (
          <div key={index} className="event-marker" />
        ))}
      </div>
    ) : null;
  };

  const handleDateChange = (value: Value) => {
    const selected = Array.isArray(value) ? value[0] : value;
    setSelectedDate(selected as Date);
    const eventsOnSelectedDate = events.filter(
      (event) =>
        moment(selected as Date).isBetween(
          moment(event.eventStart).startOf('day'),
          moment(event.eventEnd).endOf('day'),
          null,
          '[]'
        )
    );
    setSelectedEvents(eventsOnSelectedDate);
    setShowEventDetails(true); // Always show the modal
  };

  return (
    <div className="container">
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={eventTileContent}
        />
      </div>

      <div className="modal" style={{ display: showEventDetails ? 'block' : 'none' }}>
        <div className="modal-content">
          <h3 style={{ color: "#A62D38" }}>Event Details</h3>
          {/* Display event details here */}
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event, index) => (
              <div key={index}>
                <h4>{event.eventTitle}</h4>
                <p>Description: {event.eventDesc}</p>
                <p>Start Date: {moment(event.eventStart).format('MMMM Do, YYYY')}</p>
                <p>End Date: {moment(event.eventEnd).format('MMMM Do, YYYY')}</p>
                {/* Render other event details */}
                {index < selectedEvents.length - 1 && <hr />} {/* Add a line if not the last event */}
              </div>
            ))
          ) : (
            <p>No events for the selected date</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;