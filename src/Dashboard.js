import React, { useEffect, useState } from 'react';
import { getAchievements } from './api';

const Dashboard = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Fetch data when the component loads
    getAchievements()
      .then(response => setAchievements(response.data))
      .catch(err => console.error("Could not fetch achievements", err));
  }, []);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Student Achievement Dashboard</h1>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 border-b text-left">Title</th>
            <th className="py-3 px-4 border-b text-left">Category</th>
            <th className="py-3 px-4 border-b text-left">Student</th>
          </tr>
        </thead>
        <tbody>
          {achievements.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b">{item.title}</td>
              <td className="py-3 px-4 border-b">{item.category}</td>
              <td className="py-3 px-4 border-b text-blue-600 font-medium">
                {item.student?.fullName || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;