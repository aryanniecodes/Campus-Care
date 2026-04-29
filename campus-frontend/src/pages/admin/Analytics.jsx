import { useState, useEffect, useMemo, memo } from 'react';
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
      // Interceptor handles the toast, we just log for dev
      console.error("Analytics fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const completionRate = useMemo(() => 
    data?.total > 0 ? Math.round((data.completed / data.total) * 100) : 0, 
  [data]);

  const pendingRate = useMemo(() => 
    data?.total > 0 ? Math.round((data.pending / data.total) * 100) : 0, 
  [data]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-100 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
             <div className="h-64 bg-gray-50 rounded-2xl"></div>
             <div className="h-64 bg-gray-50 rounded-2xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-100">
            <span className="text-4xl">📊</span>
            <h3 className="text-xl font-bold text-gray-900 mt-6 uppercase tracking-tight">No Insights Available</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">Analytics require at least one submitted complaint to generate system-wide performance reports.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 pb-20">

        {/* ── Page Header ── */}
        <div className="flex justify-between items-end border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Performance Analytics</h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">Deep-dive into operational efficiency and worker performance.</p>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-all"
          >
            Refresh Data
          </button>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Total Volume</p>
            <p className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{data.total}</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Accumulated across all hostels</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3 text-green-600/60">Resolution Velocity</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-green-600">{data.completed}</p>
              <span className="text-xs font-bold text-gray-400 uppercase">Resolved</span>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-green-500 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">{completionRate}% total success rate</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3 text-yellow-600/60">Queue Density</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-yellow-600">{data.pending}</p>
              <span className="text-xs font-bold text-gray-400 uppercase">Awaiting</span>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pendingRate}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">{pendingRate}% of load remaining</p>
          </div>
        </div>

        {/* ── Distribution Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Category Heatmap
            </h3>
            {Object.keys(data.categories).length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-xs italic">No data detected</div>
            ) : (
              <div className="space-y-6">
                {Object.entries(data.categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => {
                    const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                    return (
                      <div key={cat} className="group">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{cat}</span>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mr-2">{pct}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Qty: {count}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden border border-gray-100">
                          <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Worker Efficiency Ranking
            </h3>
            {Object.keys(data.workerStats).length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-xs italic">No resolutions logged</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.workerStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count], index) => (
                    <div key={name} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/30 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest ${
                          index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-white text-gray-400 border border-gray-100'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{name}</p>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Verified Resolutions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-green-600">{count}</span>
                      </div>
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

export default memo(Analytics);
