import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Remove Chakra UI imports

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <React.StrictMode>
    {/* Removed ChakraProvider and theme prop */}
    {/* Removed AuthProvider for now */}
    <App />
  </React.StrictMode>
);