import { buildCollection, buildProperty } from 'firecms';

interface Event {
    title: string;
    description: string;
    startDateTime: Date;
    endDateTime: Date;
    location: string;
    dateAdded: Date;
    dateEdited: Date;
    visibleToStudents: boolean;
    visibleToEmployees: boolean;
    archived: boolean;
    isTomorrow: boolean;
    isLater: boolean;
    isOngoing: boolean;

}

export const eventsCollection = buildCollection<Event>({
    path: 'events', // Path to your Firestore collection
    name: 'Event',
    group: "LAYAG App",
    icon: "EventAvailable",
    initialSort: ["startDateTime", "asc"],
    properties: {
        title: buildProperty({
            name: 'Title',
            dataType: 'string',
            validation: { required: true }
        }),
        description: buildProperty({
            name: 'Description',
            dataType: 'string',
            validation: { required: true }
        }),
        startDateTime: buildProperty({
            name: 'Date/Time Start',
            dataType: 'date',
            mode: "date_time",
            validation: { required: true }
        }),
        endDateTime: buildProperty({
            name: 'Date/Time End',
            dataType: 'date',
            mode: "date_time",
            validation: { required: true }
        }),
        location: buildProperty({
            name: 'Location',
            dataType: 'string',
            defaultValue: 'LPU - Cavite'
        }),
        dateAdded: buildProperty({
            name: 'Date Added',
            dataType: 'date',
            mode: 'date_time',
            autoValue: "on_create"
        }),
        dateEdited: buildProperty({
            name: 'Date Edited',
            dataType: 'date',
            mode: 'date_time',
            autoValue: "on_update"
        }),
        visibleToStudents: buildProperty({
            name: 'Visible to Students',
            dataType: 'boolean',
            defaultValue: true
        }),
        visibleToEmployees: buildProperty({
            name: 'Visible to Employees',
            dataType: 'boolean',
            defaultValue: true
        }),
        archived: buildProperty({
            name: 'Archived',
            dataType: 'boolean',
            defaultValue: false
        }),
        isTomorrow: buildProperty({
            name: 'Is Tomorrow',
            dataType: 'boolean',
            defaultValue: false
        }),
        isLater: buildProperty({
            name: 'Is Later',
            dataType: 'boolean',
            defaultValue: false
        }),
        isOngoing: buildProperty({
            name: 'Is Ongoing',
            dataType: 'boolean',
            defaultValue: false
        }),
        
    },
    // Add other configuration options like callbacks, permissions, etc.
});

// Add more configuration as needed (permissions, callbacks, etc.)
