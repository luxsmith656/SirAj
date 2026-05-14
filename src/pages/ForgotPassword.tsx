import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setError('');
    } catch (err: any) {
      setError('Error sending reset email: ' + err.message);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-lg w-full max-w-sm">
        <h2 className="font-headline text-2xl font-extrabold mb-6">Reset Password</h2>
        {message && <p className="text-emerald-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-error text-sm mb-4">{error}</p>}
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant"
            required
          />
          <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold">
            Send Reset Link
          </button>
        </form>
        <Link to="/sign-in" className="block text-center mt-4 text-primary font-bold text-sm">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
