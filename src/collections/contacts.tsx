import { buildCollection, buildProperty } from 'firecms';

interface Contact {
    name: string;
    contact: any;
    type: string;
    created_on: Date;
    edited_on: Date;
    visible: boolean;


}


export const contactsCollection = buildCollection<Contact>({
    path: 'contact_info', // Path to your Firestore collection
    name: 'Contact Info',
    group: "Information",
    icon: "ContactPhone",
    hideFromNavigation: true,
    initialSort: ["name", "asc"],
    properties: {
        name: buildProperty({
            name: 'Name',
            dataType: 'string',
            validation: { required: true }
        }),
        contact: buildProperty({
            name: 'Content',
            dataType: 'array',
            oneOf:{
                typeField: 'type',
                valueField: 'value',
                properties:{
                    email: {
                        dataType: "string",
                        name: "Email",
                    },
                    phone_number: {
                        dataType: "string",
                        name: "Phone Number",
                    },
                    facebook: {
                        dataType: "string",
                        name: "Facebook",
                        
                    },
                }
            },
            validation: { required: true }
        }),
        type: buildProperty({
            name: 'Type',
            dataType: 'string',
            enumValues: [
                {
                    id: "academic",
                    label: "Academic",
                    
                },
                {
                    id: "administrative",
                    label: "Administrative",
                    
                },
              ],
            validation: { required: true }
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
