import 'dotenv/config'; // Filling process.env with .env values
import https from 'https'; // Native module for creating HTTPS servers or making HTTPS requests 
import fs from 'fs'; // Native module for interacting with the file system
import app from './app'; // Main application setup (Express server configuration)

///////////////////////////////////////////////////////////////////////////////////
//// Define the port from environment variables or use a default value
///////////////////////////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 3000;

///////////////////////////////////////////////////////////////////////////////////
//// SSL/TLS options for HTTPS server
///////////////////////////////////////////////////////////////////////////////////
const options = {
    // These files (key.pem and cert.pem) are required to enable HTTPS
    // Generated with -> openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

///////////////////////////////////////////////////////////////////////////////////
// Create an HTTPS server using the options and the app (Express) as the request handler
///////////////////////////////////////////////////////////////////////////////////
https.createServer(options, app).listen(PORT, () => {
    console.log('Server running on https://localhost:' + PORT);
});
