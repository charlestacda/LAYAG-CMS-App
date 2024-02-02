import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css';
import '../src/calendarstyle.css';
import { collection, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import EventBusyIcon from '@mui/icons-material/EventBusy';

interface MyEvent {
  eventTitle: string;
  eventDesc: string;
  eventStart: Date;
  eventEnd: Date;
  eventLocation: string;
  // Add other event properties if needed
}

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
        const querySnapshot = await getDocs(collection(firestore, 'events'));
        const fetchedEvents: MyEvent[] = [];

        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          const startDateTime = eventData.startDateTime.toDate();
          const endDateTime = eventData.endDateTime.toDate();

          fetchedEvents.push({
            eventTitle: eventData.title,
            eventDesc: eventData.description,
            eventStart: startDateTime,
            eventEnd: endDateTime,
            eventLocation: eventData.location,
            // Map other fields accordingly
          });
        });

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
        tileContent={eventTileContent} // Include the event markers
        // Add other props and configurations as needed
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
            <p><strong>Start Date:</strong> {moment(event.eventStart).format('MMMM Do, YYYY')}</p>
            <p><strong>End Date:</strong> {moment(event.eventEnd).format('MMMM Do, YYYY')}</p>
            <p><strong>Location:</strong> {event.eventLocation}</p>
            {/* Render other event details */}
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