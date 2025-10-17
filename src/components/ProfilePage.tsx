import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-100 dark:border-slate-700 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Profile</h2>
      <div className="space-y-4 text-gray-700 dark:text-slate-300">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">U</div>
          <div>
            <div className="font-medium">Your Name</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">user@example.com</div>
          </div>
        </div>
        <div className="text-sm">This is a placeholder profile page. Connect to your auth/user data to populate details.</div>
      </div>
    </div>
  );
};

export default ProfilePage;


