import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as authApi from '../api/auth.api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in the URL.');
      return;
    }

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Email Verification</h2>

        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <p className="text-gray-800 font-medium mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-primary hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition duration-200"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <p className="text-red-700 font-medium mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-text font-bold py-2 px-6 rounded transition duration-200"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
