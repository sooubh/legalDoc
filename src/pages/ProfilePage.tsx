"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { getAuth, signOut, User, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UserProfile {
  displayName: string;
  email: string;
  phoneNumber: string;
  address: string;
  photoURL: string;
}

const ProfilePage: React.FC = () => {
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    email: "",
    phoneNumber: "",
    address: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile({
            displayName: u.displayName || "",
            email: u.email || "",
            phoneNumber: u.phoneNumber || "",
            address: "",
            photoURL: u.photoURL || "",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), profile, { merge: true });
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });
      alert("Profile updated successfully!");
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
      setProfile((prev) => ({ ...prev, photoURL }));
    } catch (error) {
      console.error(error);
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100 mb-6">My Profile</h1>

      {/* Profile Image Upload */}
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={profile.photoURL || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-28 h-28 rounded-full border border-gray-300 dark:border-slate-600"
        />
        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-slate-300">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="text-sm text-gray-700 dark:text-slate-200"
          />
          {uploading && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Uploading...</p>}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="displayName"
            value={profile.displayName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={profile.phoneNumber}
            onChange={handleChange}
            placeholder="+91-XXXXXXXXXX"
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">Address</label>
          <textarea
            name="address"
            value={profile.address}
            onChange={handleChange}
            rows={3}
            placeholder="Enter your address"
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex mt-6 space-x-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
