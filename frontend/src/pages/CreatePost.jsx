// file: frontend/src/components/CreateCommunityMember.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Linkedin, Github, Image, AlertCircle } from 'lucide-react';

export default function CreateCommunityMember() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    linkedin: '',
    github: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:3000';

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic form validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!formData.linkedin.trim()) {
      setError('LinkedIn URL is required');
      setLoading(false);
      return;
    }
    if (!formData.linkedin.includes('linkedin.com')) {
      setError('Please provide a valid LinkedIn URL');
      setLoading(false);
      return;
    }
    if (formData.github && !formData.github.includes('github.com')) {
      setError('Please provide a valid GitHub URL');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('about', formData.about);
      formDataToSend.append('linkedin', formData.linkedin);
      if (formData.github) formDataToSend.append('github', formData.github);
      if (file) formDataToSend.append('profileimg', file);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token'); // replace with your storage method

      const response = await fetch(`${BACKEND_URL}/api/community`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include', // only needed if backend uses cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create community member');
      }

      if (data.success) {
        navigate('/community');
      } else {
        throw new Error(data.message || 'Failed to create community member');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg">

        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Join Our Community</h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* About */}
          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
              About (Optional)
            </label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70"
              placeholder="Tell us about yourself"
              rows="4"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile *
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70"
                placeholder="https://linkedin.com/in/yourprofile"
                required
              />
            </div>
          </div>

          {/* GitHub */}
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Profile (Optional)
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <label htmlFor="profileimg" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image (Optional)
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="file"
                id="profileimg"
                name="profileimg"
                onChange={handleFileChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:hover:bg-indigo-100"
                accept="image/jpeg,image/png,image/gif"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Profile</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/community')}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Back to Community
          </button>
        </div>
      </div>
    </div>
  );
}
