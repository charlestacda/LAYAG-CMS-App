// server.cjs

const express = require('express');
const { google } = require('googleapis');
const key = require('./firecms-app.json');

const app = express();

// Create an instance of the JWT client
const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

// Define the route handling Google Analytics data fetching
app.get('/api/google-analytics', async (req, res) => {
  try {
    // Authorize the client and fetch analytics data
    await jwtClient.authorize();

    const analyticsreporting = google.analyticsreporting({
      version: 'v4',
      auth: jwtClient,
    });

    const response = await analyticsreporting.reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: 'G-M3Y25XZ26H',
            dateRanges: [{ startDate: 'today', endDate: 'today' }],
            metrics: [{ expression: 'ga:activeUsers' }],
          },
        ],
      },
    });

    // Send fetched analytics data as a JSON response
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
