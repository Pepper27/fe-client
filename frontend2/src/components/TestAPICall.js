import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const TestAPICall = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Attempting to fetch products...');
        console.log('API Base:', api.getApiBase ? api.getApiBase() : 'Not available');
        
        const response = await api.getProducts({ limit: 5, page: 1 });
        console.log('API Response:', response);
        
        setData(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>API Test</h2>
      {data && (
        <div>
          <p>Success! Found {data.data?.length || 0} products</p>
          <p>Total: {data.meta?.total || 0}</p>
        </div>
      )}
    </div>
  );
};

export default TestAPICall;