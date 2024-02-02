import { buildCollection, buildProperty } from 'firecms';

interface Help {
    title: string;
    content: any;
    order: number;
    created_on: Date;
    edited_on: Date;
    visible: boolean;


}


export const helpCollection = buildCollection<Help>({
    path: 'help', // Path to your Firestore collection
    name: 'Help Info',
    group: "Information",
    icon: "Help",
    hideFromNavigation: true,
    initialSort: ["order", "asc"],
    properties: {
        title: buildProperty({
            name: 'Title',
            dataType: 'string',
        }),
        content: buildProperty({
            name: 'Content',
            dataType: 'array',
            oneOf:{
                typeField: 'type',
                valueField: 'value',
                properties:{
                    image: {
                        dataType: "string",
                        name: "Image",
                        storage: {
                            storagePath: "help",
                            acceptedFiles: ["image/*"]
                        }
                    },
                    text: {
                        dataType: "string",
                        name: "Text",
                        markdown: true,
                    }
                }
            },
            validation: { required: true }
        }),
        order: buildProperty({
            name: 'Order',
            dataType: 'number',
            enumValues: [
                {
                    id: 1,
                    label: "1",
                    
                },
                {
                    id: 2,
                    label: "2",
                    
                },
                {
                    id: 3,
                    label: "3",
                    
                },
                {
                    id: 4,
                    label: "4",
                    
                },
                {
                    id: 5,
                    label: "5",
                    
                },
                {
                    id: 6,
                    label: "6",
                    
                },
                {
                    id: 7,
                    label: "7",
                    
                },
                {
                    id: 8,
                    label: "8",
                    
                },
                {
                    id: 9,
                    label: "9",
                    
                },
                {
                    id: 10,
                    label: "10",
                    
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
