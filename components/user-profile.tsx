"use client";

import { useEffect, useState } from "react";

export function UserProfile() {
  console.log("[USER_PROFILE] Component rendered");

  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[USER_PROFILE] useEffect triggered - fetching profile");

    fetch("/api/user")
      .then((res) => {
        console.log("[USER_PROFILE] Fetch response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("[USER_PROFILE] Fetch response data:", data);
        if (data.error) {
          console.error("[USER_PROFILE] Error in response:", data.error);
          setError(data.error);
        } else {
          console.log("[USER_PROFILE] Profile loaded successfully");
          setProfile(data);
        }
      })
      .catch((err) => {
        console.error("[USER_PROFILE] Fetch exception:", err.message);
        console.error("[USER_PROFILE] Error details:", err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return <div className="text-red-600">Error loading profile: {error}</div>;
  }

  if (!profile) {
    return <div className="text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        User Profile
      </h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Name:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {profile.user_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">ID:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {profile.user_id}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Email:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {profile.email}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Broker:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {profile.broker}
          </span>
        </div>
      </div>
    </div>
  );
}
