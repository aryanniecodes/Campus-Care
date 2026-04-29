import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/summary');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-medium animate-pulse text-lg">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <span className="text-3xl">📊</span>
          <p className="text-gray-500 font-bold text-xl uppercase tracking-tight mt-4">No analytics data available</p>
          <p className="text-gray-400 mt-2">Complaints need to be submitted first.</p>
        </div>
      </DashboardLayout>
    );
  }

  const completionRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  const pendingRate = data.total > 0 ? Math.round((data.pending / data.total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Page Header ── */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Analytics</h2>
          <p className="text-gray-500 mt-1 text-sm">Overview of campus maintenance operations.</p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-1">
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">Total</p>
            <p className="text-2xl font-semibold text-gray-900">{data.total}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-1">
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">Completed</p>
            <p className="text-2xl font-semibold text-green-600">{data.completed}</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{completionRate}% resolution rate</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-1">
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">Pending</p>
            <p className="text-2xl font-semibold text-yellow-600">{data.pending}</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pendingRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{pendingRate}% still open</p>
          </div>

        </div>

        {/* ── Bottom Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-1">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-5">📂 Category Distribution</h3>

            {Object.keys(data.categories).length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center py-8">No categories recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => {
                    const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">{cat}</span>
                          <span className="text-xs font-bold text-blue-600">{pct}%
                            <span className="text-gray-400 font-normal ml-1">({count})</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Worker Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-1">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-5">🏆 Worker Performance</h3>

            {Object.keys(data.workerStats).length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center py-8">No resolution data recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.workerStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count], index) => (
                    <div
                      key={name}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{name}</p>
                          <p className="text-xs text-gray-400">Resolved tasks</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
