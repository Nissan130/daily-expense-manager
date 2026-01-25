// src/pages/Settings.jsx
import { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Palette, 
  Download, 
  Moon, 
  Eye, 
  BellOff,
  Trash2,
  Key,
  Mail,
  DollarSign,
  Calendar,
  Save,
  Lock,
  EyeOff,
  CheckCircle
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // General
    currency: "BDT",
    dateFormat: "MM/DD/YYYY",
    firstDayOfWeek: "Sunday",
    language: "en",
    
    // Profile
    name: "John Doe",
    email: "john.doe@example.com",
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    monthlyReport: true,
    budgetAlerts: true,
    
    // Privacy
    privateProfile: false,
    showAmounts: true,
    dataRetention: "1 year",
    
    // Appearance
    theme: "light",
    compactView: false,
    showCharts: true,
    
    // Security
    twoFactorAuth: false,
    autoLogout: "30 minutes",
    
    // Backup
    autoBackup: true,
    backupFrequency: "weekly",
    cloudSync: true
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      console.log("Settings saved:", settings);
    }, 1000);
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
      setSettings({
        currency: "BDT",
        dateFormat: "MM/DD/YYYY",
        firstDayOfWeek: "Sunday",
        language: "en",
        name: "John Doe",
        email: "john.doe@example.com",
        emailNotifications: true,
        pushNotifications: true,
        weeklyReport: true,
        monthlyReport: true,
        budgetAlerts: true,
        privateProfile: false,
        showAmounts: true,
        dataRetention: "1 year",
        theme: "light",
        compactView: false,
        showCharts: true,
        twoFactorAuth: false,
        autoLogout: "30 minutes",
        autoBackup: true,
        backupFrequency: "weekly",
        cloudSync: true
      });
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-manager-settings-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("This will permanently delete your account and all data. This action cannot be undone. Are you sure?")) {
      if (window.confirm("Type DELETE to confirm:")) {
        alert("Account deletion scheduled. This feature would connect to your backend.");
      }
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <Globe size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "privacy", label: "Privacy", icon: <Eye size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
    { id: "backup", label: "Backup", icon: <Download size={18} /> },
    { id: "danger", label: "Danger Zone", icon: <Trash2 size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Configure your expense manager preferences</p>
            </div>
            
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                  <CheckCircle size={16} />
                  Settings saved!
                </div>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className={activeTab === tab.id ? "text-blue-600" : "text-gray-500"}>
                      {tab.icon}
                    </div>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Settings Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Settings</span>
                  <span className="text-sm font-semibold text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-semibold text-gray-900">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backup Status</span>
                  <span className="text-sm font-semibold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "general" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} />
                              Currency
                            </div>
                          </label>
                          <select
                            value={settings.currency}
                            onChange={(e) => handleSettingChange("currency", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="BDT">Bangladeshi Taka (৳)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                            <option value="GBP">British Pound (£)</option>
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="JPY">Japanese Yen (¥)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              Date Format
                            </div>
                          </label>
                          <select
                            value={settings.dateFormat}
                            onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            <option value="DD MMM YYYY">DD MMM YYYY</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Day of Week
                          </label>
                          <select
                            value={settings.firstDayOfWeek}
                            onChange={(e) => handleSettingChange("firstDayOfWeek", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="Sunday">Sunday</option>
                            <option value="Monday">Monday</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={settings.language}
                            onChange={(e) => handleSettingChange("language", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="en">English</option>
                            <option value="bn">বাংলা</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => handleSettingChange("name", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => handleSettingChange("email", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Picture
                          </label>
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                              <User size={24} />
                            </div>
                            <div className="flex gap-3">
                              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                                Upload New
                              </button>
                              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                      
                      <div className="space-y-4">
                        {[
                          { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
                          { key: "pushNotifications", label: "Push Notifications", description: "Receive browser push notifications" },
                          { key: "weeklyReport", label: "Weekly Reports", description: "Get weekly expense summaries" },
                          { key: "monthlyReport", label: "Monthly Reports", description: "Get monthly expense summaries" },
                          { key: "budgetAlerts", label: "Budget Alerts", description: "Alert when approaching budget limits" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[item.key]}
                                onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">Private Profile</p>
                            <p className="text-sm text-gray-600 mt-1">Hide your profile from other users</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privateProfile}
                              onChange={(e) => handleSettingChange("privateProfile", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">Show Amounts</p>
                            <p className="text-sm text-gray-600 mt-1">Display expense amounts in public views</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.showAmounts}
                              onChange={(e) => handleSettingChange("showAmounts", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Retention Period
                          </label>
                          <select
                            value={settings.dataRetention}
                            onChange={(e) => handleSettingChange("dataRetention", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="3 months">3 months</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                            <option value="2 years">2 years</option>
                            <option value="forever">Forever</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance Settings</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Moon size={16} />
                              Theme
                            </div>
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {["light", "dark", "auto"].map((theme) => (
                              <button
                                key={theme}
                                onClick={() => handleSettingChange("theme", theme)}
                                className={`p-4 rounded-xl border-2 text-left capitalize ${
                                  settings.theme === theme
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <div className="font-medium text-gray-900">{theme}</div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {theme === "light" ? "Always light mode" : 
                                   theme === "dark" ? "Always dark mode" : 
                                   "Follow system preference"}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900">Compact View</p>
                              <p className="text-sm text-gray-600 mt-1">Use compact spacing in lists</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.compactView}
                                onChange={(e) => handleSettingChange("compactView", e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900">Show Charts</p>
                              <p className="text-sm text-gray-600 mt-1">Display charts and graphs</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.showCharts}
                                onChange={(e) => handleSettingChange("showCharts", e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <div className="flex items-center gap-2">
                              <Key size={16} />
                              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.twoFactorAuth}
                              onChange={(e) => handleSettingChange("twoFactorAuth", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Auto Logout
                          </label>
                          <select
                            value={settings.autoLogout}
                            onChange={(e) => handleSettingChange("autoLogout", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="5 minutes">5 minutes</option>
                            <option value="15 minutes">15 minutes</option>
                            <option value="30 minutes">30 minutes</option>
                            <option value="1 hour">1 hour</option>
                            <option value="Never">Never</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Password
                          </label>
                          <div className="space-y-3">
                            <input
                              type="password"
                              placeholder="Current password"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <input
                              type="password"
                              placeholder="New password"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <input
                              type="password"
                              placeholder="Confirm new password"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          <button className="mt-3 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                            Update Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "backup" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Backup & Sync</h2>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">Auto Backup</p>
                            <p className="text-sm text-gray-600 mt-1">Automatically backup your data</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.autoBackup}
                              onChange={(e) => handleSettingChange("autoBackup", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Frequency
                          </label>
                          <select
                            value={settings.backupFrequency}
                            onChange={(e) => handleSettingChange("backupFrequency", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">Cloud Sync</p>
                            <p className="text-sm text-gray-600 mt-1">Sync data across devices</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.cloudSync}
                              onChange={(e) => handleSettingChange("cloudSync", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-4">Manual Actions</h3>
                          <div className="flex gap-3">
                            <button
                              onClick={handleExportSettings}
                              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Export Settings
                            </button>
                            <button
                              onClick={handleResetSettings}
                              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              Reset to Defaults
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "danger" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Danger Zone</h2>
                      
                      <div className="space-y-6">
                        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                              <Trash2 className="text-red-600" size={20} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">Delete Account</h3>
                              <p className="text-sm text-gray-600 mt-1 mb-3">
                                Permanently delete your account and all associated data. This action cannot be undone.
                              </p>
                              <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              >
                                Delete Account
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                              <Download className="text-yellow-600" size={20} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">Export All Data</h3>
                              <p className="text-sm text-gray-600 mt-1 mb-3">
                                Download a complete archive of all your expenses, categories, and settings.
                              </p>
                              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                                Request Data Archive
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                              <Mail className="text-blue-600" size={20} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">Contact Support</h3>
                              <p className="text-sm text-gray-600 mt-1 mb-3">
                                Need help or have questions? Contact our support team.
                              </p>
                              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                                Contact Support
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}