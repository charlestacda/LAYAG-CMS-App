import { buildCollection, buildProperty } from 'firecms';

interface Handbook {
    title: string;
    content: string;
    dateAdded: Date;
    dateEdited: Date;
    visibleToStudents: boolean;
    visibleToEmployees: boolean;
    archived: boolean;
}

export const handbooksCollection = buildCollection<Handbook>({
    path: 'handbooks', // Path to your Firestore collection
    name: 'Handbooks',
    group: "LAYAG App",
    icon: "MenuBook",
    properties: {
        title: buildProperty({
            name: 'Title',
            dataType: 'string',
            validation: { required: true }
        }),
        content: buildProperty({
            name: 'Content',
            dataType: 'string',
            storage: {
              storagePath: "handbooks/",
              acceptedFiles: ["pdf/*"],
              storeUrl: true,
              fileName: (context) => {
                  return context.file.name;
              }
          }
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
