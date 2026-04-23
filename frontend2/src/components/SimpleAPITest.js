import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

const SimpleAPITest = () => {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('=== API Test Started ===');
        console.log('API Base:', api.getApiBase ? api.getApiBase() : 'Not available');
        
        // Test 1: Check if we can access the API base
        const apiBase = api.getApiBase ? api.getApiBase() : 'http://localhost:3866';
        setStatus(`Testing API at: ${apiBase}`);
        
        // Test 2: Try a simple API call
        console.log('Making API call...');
        const response = await fetch(`${apiBase}/api/v1/public/products?limit=5&page=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          setStatus(`Success! Found ${data.data ? data.data.length : 0} products`);
          setDetails(JSON.stringify(data, null, 2));
        } else {
          const errorText = await response.text();
          console.error('API Error:', response.status, response.statusText, errorText);
          setStatus(`Error: ${response.status} ${response.statusText}`);
          setDetails(errorText);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        setStatus(`Error: ${error.message}`);
        setDetails(error.stack || error.message);
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Simple API Test</h2>
      <p><strong>Status:</strong> {status}</p>
      <details>
        <summary>Details</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {details}
        </pre>
      </details>
    </div>
  );
};

export default SimpleAPITest;