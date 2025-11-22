"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { getAuth, signOut, User, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  subscribeToUserProfile, 
  updateUserProfile, 
  UserProfile, 
  timestampToDate 
} from "../services/userService";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Camera, 
  Save, 
  LogOut, 
  Loader2,
  FileText,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage: React.FC = () => {
  const auth = getAuth();
  const storage = getStorage();
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    address: "",
    bio: "",
    occupation: "",
    location: "",
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        // Subscribe to realtime profile updates
        const unsubscribeProfile = subscribeToUserProfile(u.uid, (data) => {
          setProfileData(data);
          if (data) {
            setFormData({
              displayName: data.displayName || u.displayName || "",
              phoneNumber: data.phoneNumber || u.phoneNumber || "",
              address: data.address || "",
              bio: data.bio || "",
              occupation: data.occupation || "",
              location: data.location || "",
            });
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setProfileData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update Firestore
      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        bio: formData.bio,
        occupation: formData.occupation,
        location: formData.location,
      });

      // Update Auth Profile (Display Name)
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName,
        });
      }

      // alert("Profile updated successfully!"); // Removed alert for smoother UX
    } catch (error) {
      console.error(error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const storageRef = ref(storage, `profilePhotos/${user.uid}`);
    setUploading(true);
    try {
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update Firestore
      await updateUserProfile(user.uid, { photoURL });
      
      // Update Auth Profile
      await updateProfile(user, { photoURL });
      
    } catch (error) {
      console.error(error);
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const memberSince = profileData?.createdAt 
    ? timestampToDate(profileData.createdAt)?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium border border-red-200 dark:border-red-800/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
            
            {/* Avatar */}
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                <img
                  src={profileData?.photoURL || user?.photoURL || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800"
                />
              </div>
              <label className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border border-gray-100 dark:border-slate-600 group-hover:flex">
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Name & Role */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profileData?.displayName || user?.displayName || "User"}
            </h2>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
              {profileData?.occupation || "LegalEase Member"}
            </p>

            {/* Quick Stats/Info */}
            <div className="w-full space-y-4 mt-4 pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </span>
                <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-[150px]">
                  {profileData?.email || user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Location
                </span>
                <span className="text-gray-900 dark:text-gray-200 font-medium">
                  {profileData?.location || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> Joined
                </span>
                <span className="text-gray-900 dark:text-gray-200 font-medium">
                  {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Account Status Card (Mini Bento) */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-xl border border-emerald-100 dark:border-emerald-800/30 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Account Status</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Active & Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Personal Information
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="New York, USA"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none dark:text-white"
                  placeholder="Tell us a little about yourself..."
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none dark:text-white"
                  placeholder="123 Main St, Apt 4B"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
