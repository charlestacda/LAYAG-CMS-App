import { buildCollection, buildProperty } from 'firecms';

interface Portal {
  title: string;
  imageUrl: string;
  archived: boolean;
  color: string;
  dateAdded: Date; // Use `Date` type if you need to handle dates
  dateEdited: Date; // Use `Date` type if you need to handle dates
  link: string;
  visibleToEmployees: boolean;
  visibleToStudents: boolean;
}

export const portalsCollection = buildCollection<Portal>({
  path: 'portals', // Path to your Firestore collection
  name: 'Portals',
  group: "LAYAG App",
  icon: "Anchor",
  initialSort: ["dateEdited", "asc"],
  properties: {
    imageUrl: buildProperty({
      name: 'Image',
      dataType: 'string',
      defaultValue: "https://firebasestorage.googleapis.com/v0/b/lpu-app-database-e0c6c.appspot.com/o/images%2Fdefault.png?alt=media&token=a2a2d26c-ae46-49b9-863c-33b769f75633",
      storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"],
        maxSize: 1024 * 1024,
        storeUrl: true,
        metadata: {
            cacheControl: "max-age=1000000"
        },
    }
    }),
    title: buildProperty({
      name: 'Title',
      dataType: 'string',
      validation: { required: true }
    }),
    link: buildProperty({
      name: 'Link',
      dataType: 'string',
      validation: { required: true }
    }),
    color: buildProperty({
      name: 'Type',
      dataType: 'string',
      enumValues: [
        {
            id: "#a62d38",
            label: "Main",
            color: {
                color: "#a62d38",
                text: "#FFFFFF",
            }
        },
        {
            id: "#a42d6d",
            label: "ARC Online Resources",
            color: {
                color: "#a42d6d",
                text: "#FFFFFF",
            }
        },
        {
            id: "#00a62d",
            label: "Payment Channels",
            color: {
              color: "#00a62d",
              text: "#FFFFFF",
            }
          },
          {
            id: "#2da6a6",
            label: "Admin Links",
            color: {
              color: "#2da6a6",
              text: "#FFFFFF",
            }
          },
      ],
      defaultValue: '#a62d38',
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
    visibleToEmployees: buildProperty({
      name: 'Visible to Employees',
      dataType: 'boolean',
      defaultValue: true
    }),
    visibleToStudents: buildProperty({
      name: 'Visible to Students',
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
