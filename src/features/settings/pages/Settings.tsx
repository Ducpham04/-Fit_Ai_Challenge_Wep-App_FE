import { motion } from 'motion/react';
import { Bell, Globe, Moon, Shield, User } from 'lucide-react';
import { useState } from 'react';

export const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl text-gray-900 mb-2">Settings</h1>
          <p className="text-xl text-gray-600">Manage your account preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl text-gray-900">Profile Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue="MyFitJourney"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="myfit@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Bio</label>
                <textarea
                  rows={3}
                  defaultValue="Fitness enthusiast on a journey to better health"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow">
                Save Changes
              </button>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications for updates</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications ? 'bg-sky-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Get email updates about your activity</p>
                </div>
                <button className="relative w-12 h-6 rounded-full bg-sky-500">
                  <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Challenge Reminders</p>
                  <p className="text-sm text-gray-600">Daily reminders for active challenges</p>
                </div>
                <button className="relative w-12 h-6 rounded-full bg-sky-500">
                  <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Moon className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl text-gray-900">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-sky-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl text-gray-900">Language</h2>
            </div>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl text-gray-900">Privacy & Security</h2>
            </div>
            
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Two-Factor Authentication
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Privacy Settings
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Download My Data
              </button>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6"
          >
            <h3 className="text-xl text-red-900 mb-4">Danger Zone</h3>
            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Delete Account
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
