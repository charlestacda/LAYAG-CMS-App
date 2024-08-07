import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { getFirestore, collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { json2csv, csv2json } from 'json-2-csv';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import { Close, Download } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton/IconButton';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';


const secondaryConfig = {
  apiKey: 'AIzaSyABSAgV_aHPZYw5jdTDXxPCVsMwZqq8sIU',
  authDomain: 'lpu-app-database-e0c6c.firebaseapp.com',
  projectId: 'lpu-app-database-e0c6c',
  storageBucket: 'lpu-app-database-e0c6c.appspot.com',
  messagingSenderId: '157513689407',
  appId: '1:157513689407:web:2360f11d9b18bc6777cb8a',
};

const secondaryApp = initializeApp(secondaryConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);
const secondaryFirestore = getFirestore(secondaryApp);



interface MyFirestoreDocument {
  [key: string]: string | number | Date; // Index signature allowing dynamic access
}


const ImportExport = () => {
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportClick = async (collectionName: string) => {
    try {
      setExporting(true);
      const firestore = getFirestore();
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      const data: MyFirestoreDocument[] = [];

      querySnapshot.forEach((doc) => {
        const documentData = doc.data() as MyFirestoreDocument;

        // Check if the collection is 'users' to apply specific exclusion logic
        if (collectionName === 'users') {
          // Exclude specific fields from export
          const excludedFields = ['passwordManager', 'Notifications'];
          for (const field of excludedFields) {
            if (field in documentData) {
              delete documentData[field];
            }
          }
        }

        if (collectionName === 'events') {
          // Exclude specific fields from export
          const excludedFields = ['isLater', 'isOngoing', 'isTomorrow'];
          for (const field of excludedFields) {
            if (field in documentData) {
              delete documentData[field];
            }
          }
        }

        // Loop through each field and convert to string if it's a Timestamp
        for (const field in documentData) {
          if (Object.prototype.hasOwnProperty.call(documentData, field)) {
            const value = documentData[field];

            // Check if the field is a Firestore Timestamp and convert to string
            if (value instanceof Object && 'toDate' in value && typeof value.toDate === 'function') {
              documentData[field] = value.toDate().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
              });
            } else if (value instanceof Date) {
              // If it's a JavaScript Date object, convert it to string
              documentData[field] = value.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
              });
            }
          }
        }

        data.push(documentData);
      });

      console.log(`Export ${collectionName}`, data);

      if (data.length === 0) {
        console.warn(`No data found in ${collectionName}`);
        return;
      }

      // Convert data to CSV format
      const csv = json2csv(data);

      // Create a Blob containing the CSV file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName}_export.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
      setExporting(false);
      handleSelectedDialogClose();
    } catch (error) {
      console.error(`Error exporting ${collectionName}:`, error);
      setExporting(false);
    }
  };


  const handleImportClick = async (collectionName: string, file: File | null) => {
    try {
      setImporting(true);
      if (file) {
        const csvData = await file.text();
        if (collectionName === 'users') {
          // Import users data to both Firestore collection and authentication
          await importUserData(collectionName, csvData);
        } else {
          // For other collections, only import to Firestore collection
          await importData(collectionName, csvData);
        }
      }
      setImporting(false);
      handleSelectedDialogClose();
    } catch (error) {
      console.error(`Error importing data:`, error);
      setImporting(false);
    }
  };



  const importUserData = async (collectionName: string, csvData: string) => {
    try {
      const auth = secondaryAuth;  // Use the secondaryAuth for user creation
      const firestore = secondaryFirestore;


      const preprocessedCsv = csvData
        .split('\n')
        .map((line, index) => (index === 0 ? line.replace(/\s+/g, '') : line))
        .join('\n');

      const jsonData = await csv2json(preprocessedCsv);

      const processedData = jsonData.map((item: any) => {
        // Add logic to handle dateAdded, dateEdited, created_on, and edited_on
        const currentDate = new Date();

        // For tips, portals, handbooks, and events
        if (['tips', 'portals', 'handbooks', 'events'].includes(collectionName)) {
          item.dateAdded = currentDate;
          item.dateEdited = currentDate;
        }

        // For privacy_policy, payment_procedures, help, and contact_info
        if (['privacy_policy', 'payment_procedures', 'help', 'contact_info'].includes(collectionName)) {
          item.created_on = currentDate;
          item.edited_on = currentDate;
        }

        for (const field in item) {
          if (Object.prototype.hasOwnProperty.call(item, field)) {
            const value = item[field];
            const trimmedValue = typeof value === 'string' ? value.trim() : value;
            const date = new Date(trimmedValue);
            if (!isNaN(date.getTime())) {
              item[field] = date;
            }
          }
        }

        // Convert specific fields to boolean
        const booleanFields = ['visibleToStudents', 'visibleToEmployees', 'archived', 'visible'];
        for (const field of booleanFields) {
          if (field in item) {
            item[field] = item[field].toLowerCase() === 'true';
          }
        }

        return item;
      });

      // Import users data to both Firestore collection and authentication
      for (const item of processedData) {
        console.log('Item data:', item);

        const email = item.userEmail;
        const password = item.userNo;
        const photoURL = 'https://firebasestorage.googleapis.com/v0/b/lpu-app-database-e0c6c.appspot.com/o/users%2FuserProfile%2Fuser.png?alt=media&token=67777fbb-e778-4079-86a0-e5bf1400a22f';

        try {
          // Create authentication user using the secondaryAuth
          const authUserCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);

          // Access the UID of the newly created user
          const uid = authUserCredential.user.uid;

          await updateProfile(authUserCredential.user, { photoURL });

          // Use UID as the document ID in Firestore
          await setDoc(doc(secondaryFirestore, collectionName, uid), { ...item });
        } catch (authError) {
          console.error('Error creating user in authentication:', authError);
        }
      }

      console.log(`Imported data to ${collectionName}`);
      window.location.reload();
    } catch (error) {
      console.error(`Error importing data to ${collectionName}:`, error);
    } finally {
      // Clean up: Delete the secondary app reference after user creation
      deleteApp(secondaryApp);
    }
  };



  const importData = async (collectionName: string, csvData: string) => {
    try {
      const firestore = getFirestore();

      const preprocessedCsv = csvData
        .split('\n')
        .map((line, index) => (index === 0 ? line.replace(/\s+/g, '') : line))
        .join('\n');

      const jsonData = await csv2json(preprocessedCsv);

      const processedData = jsonData.map((item: any) => {
        // Add logic to handle dateAdded, dateEdited, created_on, and edited_on
        const currentDate = new Date();

        // For tips, portals, handbooks, and events
        if (['tips', 'portals', 'handbooks', 'events'].includes(collectionName)) {
          item.dateAdded = currentDate;
          item.dateEdited = currentDate;
        }

        // For privacy_policy, payment_procedures, help, and contact_info
        if (['privacy_policy', 'payment_procedures', 'help', 'contact_info'].includes(collectionName)) {
          item.created_on = currentDate;
          item.edited_on = currentDate;
        }

        for (const field in item) {
          if (Object.prototype.hasOwnProperty.call(item, field)) {
            const value = item[field];
            const trimmedValue = typeof value === 'string' ? value.trim() : value;
            const date = new Date(trimmedValue);
            if (!isNaN(date.getTime())) {
              item[field] = date;
            }
          }
        }

        // Convert specific fields to boolean
        const booleanFields = ['visibleToStudents', 'visibleToEmployees', 'archived', 'visible'];
        for (const field of booleanFields) {
          if (field in item) {
            item[field] = item[field].toLowerCase() === 'true';
          }
        }

        return item;
      });

      for (const item of processedData) {
        await addDoc(collection(firestore, collectionName), item);
      }

      console.log(`Imported data to ${collectionName}`);
    } catch (error) {
      console.error(`Error importing data to ${collectionName}:`, error);
    }
    handleSelectedDialogClose();
  };



  const handleDialogClose = () => {
    setOpenExportDialog(false);
    setOpenImportDialog(false);
    setSelectedCollection(null);
  };

  const handleSelectedDialogClose = () => {
    setSelectedCollection(null);
  };

  const handleCollectionClick = (collectionName: string) => {
    setSelectedCollection(collectionName);
  };


  const collections = [
    'users',
    'portals',
    'tips',
    'handbooks',
    'events',
    'contact_info',
    'help',
    'payment_procedures',
    'privacy_policy',
  ];

  const getFormattedCollectionName = (collectionName: string) => {
    // Map the collection names to the desired format
    const collectionNameMap: Record<string, string> = {
      'users': 'Users',
      'portals': 'Portals',
      'tips': 'Daily Quotes',
      'handbooks': 'Handbooks',
      'events': 'Events',
      'contact_info': 'Contact Info',
      'help': 'Help Info',
      'payment_procedures': 'Payment Procedures',
      'privacy_policy': 'Privacy Policy',
    };

    return collectionNameMap[collectionName] || collectionName;
  };

  const handleCloseClick = () => {
    handleDialogClose();
  };

  const handleSelectedCloseClick = () => {
    handleSelectedDialogClose();
  }


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center', width: '80%', maxWidth: '1200px' }}>
        {/* Import Button with File Input */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CloudUploadIcon style={{ fontSize: 200, fill: '#FFF' }} />}
          onClick={() => setOpenImportDialog(true)}
          style={{ margin: '10px', backgroundColor: '#000', fontSize: '40px' }}
        >
          Import Data
        </Button>

        {/* Export Button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CloudDownloadIcon style={{ fontSize: 200, fill: '#FFF' }} />}
          onClick={() => setOpenExportDialog(true)}
          style={{ margin: '10px', backgroundColor: '#000', fontSize: '40px' }}
        >
          Export Data
        </Button>
      </div>

      {/* Import Dialog with File Input */}
      <Dialog open={openImportDialog} onClose={handleDialogClose} fullWidth={true}>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCloseClick}
          aria-label="close"
          style={{ position: 'absolute', top: 10, right: 30 }}
        >
          <Close />
        </IconButton>

        <Typography variant="h5" align="center" style={{ margin: '20px' }}>
          Select Collection to Import
        </Typography>
        <List>
          {collections.map((collectionName, index) => (
            <ListItem
              key={index}
              button
              onClick={() => handleCollectionClick(collectionName)}
            >
              <ListItemText primary={getFormattedCollectionName(collectionName)} />
            </ListItem>
          ))}
        </List>
        {selectedCollection && (
          <Dialog open={Boolean(selectedCollection)} onClose={handleDialogClose} fullWidth={true}>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleSelectedCloseClick}
              aria-label="close"
              style={{ position: 'absolute', top: 10, right: 30 }}
            >
              <Close />
            </IconButton>
            <Typography variant="h5" align="center" style={{ margin: '20px' }}>
              Upload CSV File for {getFormattedCollectionName(selectedCollection as string)}
            </Typography>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
                  handleImportClick(selectedCollection as string, file);
                }
              }}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={importing ? <CircularProgress style={{ fontSize: 80, fill: '#FFF' }} color="inherit" /> : <CloudUploadIcon style={{ fontSize: 80, fill: '#FFF' }} />}
              onClick={() => fileInputRef.current?.click()}
          style={{ margin: '10px', backgroundColor: '#000' }}
          disabled={importing}
        >
          {importing ? '' : 'Upload CSV File'}
        </Button>
      </Dialog>
        )}

      </Dialog>

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onClose={handleDialogClose} fullWidth={true}>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCloseClick}
          aria-label="close"
          style={{ position: 'absolute', top: 10, right: 30 }}
        >
          <Close />
        </IconButton>
        <Typography variant="h5" align="center" style={{ margin: '20px' }}>
          Select Collection to Export
        </Typography>
        <List>
          {collections.map((collectionName, index) => (
            <ListItem
              key={index}
              button
              onClick={() => handleCollectionClick(collectionName)}
            >
              <ListItemText primary={getFormattedCollectionName(collectionName)} />
            </ListItem>
          ))}
        </List>
        {selectedCollection && (
          <Dialog open={Boolean(selectedCollection)} onClose={handleDialogClose} fullWidth={true}>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleSelectedCloseClick}
              aria-label="close"
              style={{ position: 'absolute', top: 10, right: 30 }}
            >
              <Close />
            </IconButton>
            <Typography variant="h5" align="center" style={{ margin: '20px' }}>
              Download CSV File for {getFormattedCollectionName(selectedCollection as string)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={exporting ? <CircularProgress style={{ fontSize: 80, fill: '#FFF' }} color="inherit" /> : <Download style={{ fontSize: 80, fill: '#FFF' }} />}
              onClick={() => handleExportClick(selectedCollection)}
          style={{ margin: '10px', backgroundColor: '#000' }}
          disabled={exporting}
        >
          {exporting ? '' : 'Download CSV File'}
        </Button>
      </Dialog>
        )}

      </Dialog>
    </div>
  );
};

export default ImportExport;