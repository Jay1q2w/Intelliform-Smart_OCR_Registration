# IntelliForm - OCR based Auto form-Fillup and Verification System

## Project Overview

A comprehensive Node.js-based OCR solution that automatically extracts text from documents (images/PDFs), intelligently auto-fills digital forms, and verifies data accuracy using advanced comparison algorithms. The system utilizes multiple OCR engines including Tesseract.js and Microsoft TrOCR for optimal text recognition.
## ✫ Features

### Core Functionality
- **Document Processing**: Handle PDFs and images (JPEG, PNG) with jimp and Parse-pdf.
- **OCR Text Extraction**: Extract text using Tesseract.js and TrOCR to support all kind of tasks (handwritten,Ids,certificates)
- **Smart Data Parsing**: Automatically identify and structure registration form fields
- **Data Verification**: Compare extracted data with user inputs using multiple algorithms
- **Multi-format Support**: Process ID cards, forms, certificates, and various document types by switching between relevant models.

### Advanced Capabilities
- **Image Enhancement**: Automatic preprocessing for better OCR accuracy
- **Intelligent Field Mapping**: Extract name, email, phone, address, age, gender, etc through Raw Text Processing and Comprehensive Pattern Library for each form field
- **Confidence Scoring**: OCR confidence and verification match percentages by modelling multiple factors like Image quality impact,Word-level confidence distribution, Text structure coherence etc.
- **Google Sheets Integration**: Automatic data export to spreadsheets via Google Sheet API

## ★ Tech Stack Used

### Backend
- **Node.js** with **Express.js**
- **Python 3.8+**
- **MongoDB** with Mongoose ODM
- **Tesseract.js** and **TrOCR** for OCR processing
- **Jimp** for image manipulation and **pdf-parse** for pdf manipulations
- **Natural** for text similarity algorithms
### Frontend
- **React 18** and **JavaScript** 
- **CSS**, **Framer-Motion**, **lucide-react** and **react-hot-toast** for styling

### External Services
- **Google Sheets API** for data export to spreadsheet
- **Flask Python API**  for TrOCR integration

## ✫ Get Started
Clone the Repository  
   ```bash
   git clone https://github.com/Jay1q2w/Intelliform-Smart_OCR_Registration
   ```  

## Frontend Setup

1. Navigate to the Frontend Directory and install dependancies

   ```bash
   cd Intelliform-Smart_OCR_Registration/frontend
   npm i  #install dependancies (node_modules will be formed)
   ```  
2. Run the application
   ```bash
   npm start #React-App will launch
   ``` 
The frontend will be available at: `http://localhost:3000`  
 
## Backend Setup
1. Open a seperate terminal, Navigate to the Backend Directory and install dependancies
   ```bash
   cd backend
   npm i  #install dependancies
   ```  
2. Run the dev scripts
   ```bash
   npm run dev #Backend Starts
   ```  
Backend Health Status will be available on `http://localhost:5000/api/health`

### Create .env for Backend
-  Create .env file inside the backend directory and add the following

    ```
    NODE_ENV=development
    PORT=5000
    MONGODB_URI= YOUR_MONGODB_CONNECTION_STRING
    FRONTEND_URL=http://localhost:3000
    JWT_SECRET=your_super_secret_jwt_key_here
    JWT_EXPIRE=30d
    ```  
- ### Google Spreadsheet integration (If you want to export the data, otherwise Optional)
    1. Go to https://console.cloud.google.com/apis 
    2. Create a new project(e.g Smart_OCR)
    3. Navigate to APIs & Services → Library → search Google Sheets API → Enable
    4. In APIs & Services → Credentials, generate an API Key (for public sheets) or OAuth 2.0 credentials (if you need private access). Download JSON API.
    3. In the same .env of backend paste this (from the JSON file)

        ```
        GOOGLE_SHEET_ID= SPREADSHEET_ID
        GOOGLE_TYPE=service_account
        GOOGLE_PROJECT_ID= from_the_JSON
        GOOGLE_PRIVATE_KEY_ID=grom_the_JSON
        GOOGLE_PRIVATE_KEY="From_the_JSON"
        GOOGLE_CLIENT_EMAIL=from_the_JSON
        GOOGLE_CLIENT_ID=from_the_JSON
        GOOGLE_CLIENT_X509_CERT_URL=from_the_JSON
        ```
- Now you're ready to go with spreadsheets

## ✫ API Endpoints

### OCR API Endpoints - Base path ( /api/ocr )
- **POST	/extract** : Uploads a document for text extraction and parsing.
- **GET	/documents** : Retrieves a paginated list of all processed documents.
- **GET	/document/:id** : Fetches a single document's details by its unique ID
- **DELETE	/document/:id** : Deletes a specific document from the database and the server's file system

### Verification API Endpoints - Base path ( /api/verification )

- **POST	/register** : Verifies submitted data against a processed document and saves the registration to the database and Google Sheets.
- **GET	/registrations** : Retrieves a paginated list of all saved registrations.
- **GET	/registration/:id** : Fetches a single registration record by its unique ID
- **GET	/search** : Searches for registrations based on a query string across multiple fields or a specific field


## ✫  How it Works
### 1. Image Pre-Processing
- **Grayscale Conversion** - Improve text contrast
- **Noise Reduction** - Remove image artifacts
- **Skew Correction** - Fix document alignment
### 2. Text Extraction
- **Tesseract.js**: Primary engine for general text extraction
- **TrOCR**: Transformer-based engine for printed text with higher accuracy
### 3. Intelligent Data Parsing
- Smart Pattern recongnizing Functions (Example given)
    ```javascript
        parseRegistrationData(text) {
    const patterns = {
        name: [/^(name|full name)[:\s]+(.+)$/i, /name[:\s]*([a-zA-Z\s]+)/i],
        email: [/email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i],
        phone: [/phone[:\s]+([\+\d\s\-\(\)]+)/i, /(\+?[\d\s\-()]{8,})/],
        address: [/address[:\s]+(.+)$/i],
        age: [/age[:\s]+(\d+)/i],
        gender: [/gender[:\s]+(male|female|other)/i]
    };
    
    // Extract and structure data from raw text
    return extractedFields;
    }
    ```
### 4. Auto Form-Fillup
- Automatically populates digital forms with extracted data
- Provides confidence scores for each field 
### 5. Verfication Algorithms
- Levenshtein distance for text similarity
- Jaro-Winkler for string matching
- Field-specific validation rules


## ✫ Performance Metrics

- **OCR Accuracy**: 85-95% for printed text, 70-85% for handwritten
- **Processing Time**: 2-8 seconds per page (depending on image quality)
- **Auto-Fill Accuracy**: 80-90% for structured forms
- **Verification Precision**: 70-95% for exact matches

## ✫ OCR Engine Comparison
### Tesseract.js
- Pros: Fast, good with structured documents, supports multiple languages
- Cons: Lower accuracy with poor quality images
- Best For: General document processing, forms with clear text
### Micosoft TrOCR
- Pros: High accuracy with printed text, transformer-based architecture
- Cons: Slower processing, requires Python environment
- Best For: High-quality documents, printed text with complex layouts





