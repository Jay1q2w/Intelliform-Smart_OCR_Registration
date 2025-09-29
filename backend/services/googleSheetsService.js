const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
    this.initialize();
  }

  async initialize() {
    try {
      // Check if all required environment variables are set
      if (!process.env.GOOGLE_SHEET_ID || 
          !process.env.GOOGLE_CLIENT_EMAIL || 
          !process.env.GOOGLE_PRIVATE_KEY) {
        console.log('Google Sheets not configured - missing environment variables');
        return;
      }

      // Load service account credentials
      const credentials = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
      };

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      
      // Initialize sheet with headers if needed
      await this.setupSheetHeaders();
      
      console.log('✅ Google Sheets service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets service:', error.message);
    }
  }

  async setupSheetHeaders() {
    try {
      if (!this.sheets || !this.spreadsheetId) {
        throw new Error('Google Sheets not initialized or spreadsheet ID missing');
      }

      // Check if headers already exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A1:Z1',
      });

      const existingHeaders = response.data.values?.[0];
      
      if (!existingHeaders || existingHeaders.length === 0) {
        // Create headers if they don't exist
        const headers = [
          'Registration ID',
          'Registration Number',
          'Timestamp',
          'Name',
          'Age',
          'Gender',
          'Date of Birth',
          'Email',
          'Phone',
          'Emergency Contact',
          'Address',
          'Occupation',
          'Nationality',
          'Verification Status',
          'OCR Confidence',
          'Matched Fields',
          'Total Fields',
          'Average Confidence',
          'Document ID',
          'Processing Time (ms)',
          'IP Address'
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Sheet1!A1',
          valueInputOption: 'RAW',
          resource: {
            values: [headers],
          },
        });

        console.log('✅ Sheet headers created successfully');
      } else {
        console.log('✅ Sheet headers already exist');
      }
    } catch (error) {
      console.error('❌ Error setting up sheet headers:', error.message);
    }
  }

  async addRegistration(registrationData, verificationSummary) {
    try {
      if (!this.sheets || !this.spreadsheetId) {
        console.log('⚠️ Google Sheets not initialized - skipping save');
        return { success: false, error: 'Not initialized' };
      }

      console.log('📝 Adding registration to Google Sheets...');

      // Prepare row data
      const row = [
        registrationData._id?.toString() || '',
        registrationData.registrationNumber || `REG-${registrationData._id?.toString().slice(-8).toUpperCase()}`,
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        registrationData.name || '',
        registrationData.age || '',
        registrationData.gender || '',
        registrationData.dateOfBirth || '',
        registrationData.email || '',
        registrationData.phone || '',
        registrationData.emergencyContact || '',
        registrationData.address || '',
        registrationData.occupation || '',
        registrationData.nationality || '',
        registrationData.metadata?.verificationStatus || 'pending',
        registrationData.metadata?.ocrConfidence || 0,
        verificationSummary?.matchedFields || 0,
        verificationSummary?.totalFields || 0,
        verificationSummary?.averageConfidence || 0,
        registrationData.metadata?.documentId?.toString() || '',
        registrationData.metadata?.processingTime || 0,
        registrationData.metadata?.ipAddress || ''
      ];

      console.log('📋 Row data prepared:', row.slice(0, 5)); // Log first 5 fields

      // Add the row to the sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:Z',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row],
        },
      });

      console.log('✅ Registration added to Google Sheet successfully');
      return { success: true, data: response.data };

    } catch (error) {
      console.error('❌ Error adding registration to Google Sheet:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GoogleSheetsService();
