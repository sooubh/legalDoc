import React, { useState, useEffect } from 'react';
import { getAuth, signOut, User } from 'firebase/auth';

const ProfilePage: React.FC = () => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Profile</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <img
            src={user.photoURL || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-24 h-24 rounded-full mr-6"
          />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-slate-100">{user.displayName || 'Anonymous'}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
