import { useCallback, useEffect, useState } from "react";

import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import { User as FirebaseUser, getAuth } from "firebase/auth";
import { Authenticator, FirebaseCMSApp, FirebaseLoginView, DataSource, EntityCollection, User, buildCollection, CMSView, buildProperty  } from "firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

import { firebaseConfig } from "./firebase-config.ts";
import { productsCollection } from "./collections/products.tsx";
import { portalsCollection } from "./collections/portals.tsx";
import { usersCollection } from "./collections/users.tsx";
import { tipsCollection } from "./collections/tips.tsx";
import { handbooksCollection } from "./collections/handbooks.tsx";
import { eventsCollection } from "./collections/events.tsx";
import { paymentsCollection } from "./collections/payments.tsx";
import { contactsCollection } from "./collections/contacts.tsx";
import { helpCollection } from "./collections/helps.tsx";
import { privacyCollection } from "./collections/privacy_policy.tsx";

import LAYAG_logo from '../src/assets/images/layag_boat.png';
import { Email } from "@mui/icons-material";
import firebase from "firebase/compat/app";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { initializeApp } from "firebase/app";
import  DashboardView  from "./DashboardView.tsx";
import  InfoPage  from "./InfoPage.tsx";
import HomePage from "./HomePage.tsx";
import ImportExport from "./ImportExport.tsx";



export default function App() {

    const primaryColor = "#FFF";
    const secondaryColor = "#AB8D00";
    const firebaseApp = initializeApp(firebaseConfig);

    const [userID, setUserID] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                                user,
                                                                                authController,
                                                                                dataSource
                                                                            }) => {

        if (user?.email?.includes("flanders")) {
        throw Error("Stupid Flanders!");
    }

    console.log("Allowing access to", user?.email);

    try {
        // Fetch the users collection from the DataSource
        firebase.auth
        const usersCollection: EntityCollection = {
            name: "Users", // Replace with your collection name
            path: "users", // Replace with the path to your users collection
            properties: {}, // Replace with your properties configuration
            // ... other necessary properties defined for the collection
        };

        // Fetch users with the specified email and userType 'Admin'
        const users = await dataSource.fetchCollection({
            path: usersCollection.path,
            collection: usersCollection,
            filter: { userEmail: [ "==", user?.email ], userType: [ "==", "Admin" ] }, // Adjust filter based on your collection structure
            limit: 1 // Limit the result to 1 as we expect a single user with the specific email
        });

        if (users.length === 1) {
            // If a user with the specified email and userType 'Admin' and 'Super Admin' exists, grant access
            authController.setExtra(["admin"]);
            return true; // Allow access for admin users
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw Error("Failed to authenticate user");
    }
}, []); 

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        // Paths that will be enhanced
        getConfigForPath: ({ path }) => {
            return true;
        }
    });

    const customViews: CMSView[] = [{
        path: "dashboard",
        name: "Dashboard",
        group: 'Dashboard',
        icon: 'Analytics',
        view: <DashboardView/>
    }];

    const infoPage: CMSView[] = [{
        path: "info_page",
        name: "Information",
        group: 'LAYAG App',
        icon: 'Info',
        view: <InfoPage/>
    }];

    const importexportPage: CMSView[] = [{
        path: "import_export",
        name: "Import/Export",
        group: 'LAYAG App',
        icon: 'ImportExport',
        view: <ImportExport/>
    }];
    

    return <FirebaseCMSApp
        name={"LAYAG"}
        logo={LAYAG_logo}
        plugins={[dataEnhancementPlugin]}
        authentication={myAuthenticator}
        signInOptions={['password']}
        LoginView={(props) => (
            <FirebaseLoginView
                {...props}
                disableSignupScreen={true} // Set disableSignupScreen to true to disable signup
            />
        )}
        collections={[usersCollection, portalsCollection, tipsCollection, handbooksCollection, eventsCollection, paymentsCollection, contactsCollection, helpCollection, privacyCollection]}
        firebaseConfig={firebaseConfig}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        views={[...infoPage, ...importexportPage]}
        HomePage={DashboardView}
        autoOpenDrawer
    />;
}
function setAvatarUrl(url: string) {
    throw new Error("Function not implemented.");
}

