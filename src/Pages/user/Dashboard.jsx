import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Tag, Heart, Shield, Edit2, Save, X, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, MapPin, Globe } from 'lucide-react';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabaseClient';

/**
 * Dashboard Component
 * 
 * IMPROVEMENTS:
 * - Uses UserContext as single source of truth
 * - Fetches and displays user region data
 * - No redundant data fetching
 * - Proper redirect handling
 * - Clean state management
 */
function Dashboard() {
  const navigate = useNavigate();
  
  // Get user data from context - single source of truth
  const { user, userData, isLoading, error, refreshUserData } = useUser();

  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Sync editedData when userData changes
  useEffect(() => {
    if (userData) {
      setEditedData(userData);
    }
  }, [userData]);

  // Fetch user location data
  useEffect(() => {
    const fetchLocationData = async () => {
      if (!user?.id) return;
      
      setLoadingLocation(true);
      try {
        const { data, error } = await supabase
          .from('user_region')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching location data:', error);
        } else {
          setLocationData(data);
          console.log('Location data loaded:', data);
        }
      } catch (err) {
        console.error('Exception fetching location data:', err);
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocationData();
  }, [user?.id]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedData(userData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only update editable fields
      const { name, prename, gender, phone } = editedData;
      const updates = { name, prename, gender, phone };

      const { error: updateError } = await supabase
        .from('data_user')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh user data from context
      await refreshUserData();
      
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      console.error('Error updating user data:', err);
      setSnackbar({ open: true, message: `Failed to update profile: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (isLoading) {
    return (
      <MuiNavbar>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MuiNavbar>
    );
  }

  // Error state
  if (error) {
    return (
      <MuiNavbar>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </MuiNavbar>
    );
  }

  // Not authenticated state
  if (!user || !userData) {
    return (
      <MuiNavbar>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            <p>Redirecting to sign in...</p>
          </div>
        </div>
      </MuiNavbar>
    );
  }

  // Stats for dashboard
  const stats = [
    { 
      label: 'Account Status', 
      value: userData.terms ? 'Active' : 'Pending', 
      icon: Shield, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Role', 
      value: userData.role || 'User', 
      icon: Tag, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Points', 
      value: userData.points || 0, 
      icon: Heart, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50' 
    },
    { 
      label: 'Member Since', 
      value: userData.created_at 
        ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
        : '-', 
      icon: Calendar, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <MuiNavbar>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {userData.name || 'User'}!
              </h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {userData.email}
              </p>
              {locationData && (
                <p className="text-blue-100 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {locationData.region}, {locationData.country}
                </p>
              )}
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-full p-4">
              <User className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
              </div>
              {!editMode ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{userData.name || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedData.prename || ''}
                        onChange={(e) => handleInputChange('prename', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{userData.prename || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    {editMode ? (
                      <select
                        value={editedData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">{userData.gender || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editedData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="flex-1 px-4 py-2 bg-gray-50 rounded-lg">
                          {showSensitiveInfo ? (userData.phone || '-') : '••••••••'}
                        </p>
                        <button
                          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{userData.email || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">{userData.role || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Terms Accepted</label>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                      {userData.terms ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <span className={userData.terms ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {userData.terms ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Created</label>
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Location Information
                </h3>
                {loadingLocation ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading location data...</span>
                  </div>
                ) : locationData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Country
                      </label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{locationData.country || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Region</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{locationData.region || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Continent</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{locationData.continent || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Pack</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg font-mono text-sm">{locationData.pack || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">IP Address</label>
                      <div className="flex items-center gap-2">
                        <p className="flex-1 px-4 py-2 bg-gray-50 rounded-lg font-mono text-sm">
                          {showSensitiveInfo ? (locationData.ip_address || '-') : '•••.•••.•••.•••'}
                        </p>
                        <button
                          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Registered On</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">
                        {locationData.created_at ? new Date(locationData.created_at).toLocaleString() : '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 text-yellow-800">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">No location data available. This is normal if you just registered.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Interests Section */}
              {Array.isArray(userData.interests) && userData.interests.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] ${
              snackbar.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}
          >
            {snackbar.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="flex-1">{snackbar.message}</p>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </MuiNavbar>
  );
}

export default Dashboard;