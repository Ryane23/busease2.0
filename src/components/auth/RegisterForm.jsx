'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'passenger',
    adminCode: '' // Only for admin
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = `/api/auth/register/${formData.role}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Store auth data for automatic login
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Show success message briefly before redirect
        setError('');
        setLoading(false);

        // Redirect based on role with a small delay for user feedback
        setTimeout(() => {
          switch (data.user?.role || formData.role) {
            case 'admin':
              router.push('/dashboard/admin');
              break;
            case 'passenger':
              router.push('/dashboard/passenger');
              break;
            case 'busdriver':
              router.push('/dashboard/driver');
              break;
            case 'busagent':
              router.push('/dashboard/agent');
              break;
            default:
              router.push('/dashboard/passenger');
          }
        }, 500);
      } else {
        setError(data.message || data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-2">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full p-2 border rounded text-gray-900 bg-white"
        >
          <option value="passenger">Passenger</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded text-gray-900 bg-white placeholder-gray-500"
          placeholder="Enter your full name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full p-2 border rounded text-gray-900 bg-white placeholder-gray-500"
          placeholder="Choose a username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded text-gray-900 bg-white placeholder-gray-500"
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full p-2 border rounded text-gray-900 bg-white placeholder-gray-500"
          placeholder="Create a password"
          required
        />
      </div>
      {formData.role === 'admin' && (
        <div>
          <label className="block text-sm font-medium mb-2">Admin Code</label>
          <input
            type="text"
            value={formData.adminCode}
            onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
            className="w-full p-2 border rounded text-gray-900 bg-white placeholder-gray-500"
            placeholder="Enter admin verification code"
            required
          />
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-600 text-white py-2 rounded ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {loading ? 'Registering...' : `Register as ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}
      </button>
    </form>
  );
}
