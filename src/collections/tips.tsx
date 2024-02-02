import { buildCollection, buildProperty } from 'firecms';

interface Tip {
    content: string;
    dateAdded: Date;
    dateEdited: Date;
    visibleToStudents: boolean;
    visibleToEmployees: boolean;
    archived: boolean;
}

export const tipsCollection = buildCollection<Tip>({
    path: 'tips', // Path to your Firestore collection
    name: 'Daily Quotes',
    group: "LAYAG App",
    icon: "TipsAndUpdates",
    properties: {
        content: buildProperty({
            name: 'Content',
            dataType: 'string',
            validation: { required: true }
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
    },
    // Add other configuration options like callbacks, permissions, etc.
});

// Add more configuration as needed (permissions, callbacks, etc.)
