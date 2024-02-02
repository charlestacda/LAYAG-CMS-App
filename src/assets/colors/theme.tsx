import { createTheme } from '@mui/material/styles';

export const customTheme = createTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
    // Add more customizations if needed
  },
  // Add more theme configurations if needed
});

// Extract the primary color as a string
// theme.tsx
export const primaryColor = '#3f50b5'; // Replace with your desired primary color

