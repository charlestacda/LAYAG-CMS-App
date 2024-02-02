import { buildCollection, buildProperty } from 'firecms';

interface Payment {
    channels: string;
    logo: any;
    content: any;
    created_on: Date;
    edited_on: Date;
    visible: boolean;


}


export const paymentsCollection = buildCollection<Payment>({
    path: 'payment_procedures', // Path to your Firestore collection
    name: 'Payment Channel',
    group: "Information",
    icon: "Payments",
    hideFromNavigation: true,
    initialSort: ["created_on", "asc"],
    properties: {
        channels: buildProperty({
            name: 'Channel',
            dataType: 'string',
            validation: { required: true }
        }),
        logo: buildProperty({
            name: 'Logo',
            dataType: 'array',
            defaultValue: "",
            of: {
                dataType: "string",
                previewAsTag: true,
                storage: {
                    storagePath: "channels",
                    acceptedFiles: ["image/*"],
                    maxSize: 1024 * 1024,
                    storeUrl: true,
                    metadata: {
                        cacheControl: "max-age=1000000"
                    },
                    fileName: (context) => {
                        return context.file.name;
                    }
                }
            },
            expanded: true
          }),
        content: buildProperty({
            name: 'Content',
            dataType: 'array',
            oneOf:{
                typeField: 'type',
                valueField: 'value',
                properties:{
                    headline: {
                        dataType: "string",
                        name: "Headline",
                        
                    },
                    image: {
                        dataType: "string",
                        name: "Image",
                        storage: {
                            storagePath: "channels",
                            acceptedFiles: ["image/*"],
                            maxSize: 1024 * 1024,
                            storeUrl: true,
                            metadata: {
                                cacheControl: "max-age=1000000"
                            },
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
