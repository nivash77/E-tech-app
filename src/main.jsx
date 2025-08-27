import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

axios.interceptors.request.use((config) => {
  const email = localStorage.getItem('email');
  if (email) {
    config.headers['email'] = email;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
