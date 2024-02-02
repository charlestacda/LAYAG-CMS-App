import { buildCollection, buildProperty } from 'firecms';

interface Privacy {
    title: string;
    content: string;
    created_on: Date;
    edited_on: Date;
    visible: boolean;


}


export const privacyCollection = buildCollection<Privacy>({
    path: 'privacy_policy', // Path to your Firestore collection
    name: 'Privacy Policy',
    group: "Information",
    icon: "Policy",
    hideFromNavigation: true,
    initialSort: ["created_on", "asc"],
    properties: {
        title: buildProperty({
            name: 'Title',
            dataType: 'string',
        }),
        content: buildProperty({
            name: 'Content',
            dataType: 'string',
            markdown: true,
            validation: { required: true },
        }),
        created_on: buildProperty({
            name: 'Date Added',
            dataType: 'date',
            mode: 'date_time',
            autoValue: "on_create"
        }),
        edited_on: buildProperty({
            name: 'Date Edited',
            dataType: 'date',
            mode: 'date_time',
            autoValue: "on_update"
        }),
        visible: buildProperty({
            name: 'visible',
            dataType: 'boolean',
            defaultValue: true
        }),
    },
    // Add other configuration options like callbacks, permissions, etc.
});

// Add more configuration as needed (permissions, callbacks, etc.)
