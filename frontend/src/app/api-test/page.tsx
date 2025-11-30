'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApiTestPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 환경변수에서 API URL 가져오기
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    setApiUrl(url);
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setHealthStatus(null);

    try {
      const response = await axios.get(`${apiUrl}/health`);
      setHealthStatus(response.data);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      console.error('API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testBackendDirect = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Render backend 직접 테스트
      const response = await fetch(`${apiUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setHealthStatus(data);
    } catch (err: any) {
      setError(err.message || 'Direct connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2">
            <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
            <p><strong>Backend API URL:</strong> {apiUrl}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test /health Endpoint'}
            </button>
            
            <button
              onClick={testBackendDirect}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Root Endpoint'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg mb-4">
              <p className="text-red-300">Error: {error}</p>
            </div>
          )}

          {healthStatus && (
            <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg">
              <p className="text-green-300 mb-2">✅ Connection Successful!</p>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>If connection fails, check browser console for CORS errors</li>
            <li>Ensure NEXT_PUBLIC_API_URL is set in Vercel</li>
            <li>Verify Render backend is running</li>
            <li>Check that OPENAI_API_KEY is set in Render</li>
          </ol>
        </div>
      </div>
    </div>
  );
}