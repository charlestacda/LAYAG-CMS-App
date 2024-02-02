import { buildCollection, buildProperty } from 'firecms';
import firebase from 'firebase/app'; // Import Firebase app
import 'firebase/database'; // Import Firebase Realtime Database module

interface User {
    userCollege: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userNo: string;
    //userPassword: string;
    userProfile: string;
    userType: string;
}

export const usersCollection = buildCollection<User>({
    path: 'users', // Path to your Firestore collection
    name: 'Users',
    group: 'LAYAG App',
    icon: "People",
    permissions:{
        edit: false,
        delete: false,
    },
    initialSort: ["userFirstName", "asc"],
    properties: {
        userProfile: buildProperty({
            name: 'User Profile',
            dataType: 'string',
            defaultValue: "https://firebasestorage.googleapis.com/v0/b/lpu-app-database-e0c6c.appspot.com/o/users%2FuserProfile%2Fuser.png?alt=media&token=67777fbb-e778-4079-86a0-e5bf1400a22f",
            storage: {
              storagePath: "users/userProfile",
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
          }),
        userNo: buildProperty({
            name: 'User No',
            dataType: 'string',
            validation: { required: true }
        }),
        userEmail: buildProperty({
            name: 'User Email',
            dataType: 'string',
            validation: { required: true }
        }),
        userFirstName: buildProperty({
            name: 'First Name',
            dataType: 'string',
            validation: { required: true }
        }),
        userLastName: buildProperty({
            name: 'Last Name',
            dataType: 'string',
            validation: { required: true }
        }),
        /**userPassword: buildProperty({
            name: 'User Password',
            dataType: 'string',
            validation: { required: true }
        }),*/
        userType: buildProperty({
            name: 'User Type',
            dataType: 'string',
            enumValues: [
                {
                    id: "Student",
                    label: "Student",
                    
                },
                {
                    id: "Faculty",
                    label: "Faculty",
                    
                },
                {
                    id: "Admin",
                    label: "Admin",
                    
                },
                
              ],
            validation: { required: true }
        }),
        userCollege: buildProperty({
            name: 'User College',
            dataType: 'string',
            enumValues: [
                {
                    id: "IHS",
                    label: "IHS",
                    
                },
                {
                    id: "CAMS",
                    label: "CAMS",
                    
                },
                {
                    id: "CAS",
                    label: "CAS",
                    
                },
                {
                    id: "CBA",
                    label: "CBA",
                    
                },
                {
                    id: "CFAD",
                    label: "CFAD",
                    
                },
                {
                    id: "CITHM",
                    label: "CITHM",
                    
                },
                {
                    id: "COECSA - DCS",
                    label: "COECSA - DCS",
                    
                },
                {
                    id: "COECSA - DOA",
                    label: "COECSA - DOA",
                    
                },
                {
                    id: "COECSA - DOE",
                    label: "COECSA - DOE",
                    
                },
                {
                    id: "COL",
                    label: "COL",
                    
                },
                {
                    id: "CON",
                    label: "CON",
                    
                },
              ],
            validation: { required: true }
        }),
    },
    // Add other configuration options like callbacks, permissions, etc.
});
