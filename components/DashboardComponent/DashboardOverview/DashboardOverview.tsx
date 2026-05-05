'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Phone, MapPin, Clock, FileText, ArrowUpCircle } from 'lucide-react';
import { 
  useGetDashboardStatsQuery, 
  useGetDashboardChartsQuery, 
  useGetRecentCasesQuery 
} from '@/redux/services/api';
import { formatDate } from '@/utils/formatDate';

export default function DashboardOverview() {
  // Add mounted state to handle client-side only rendering
  const [isMounted, setIsMounted] = useState(false);
  
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    isError: statsError 
  } = useGetDashboardStatsQuery();
  
  const { 
    data: chartsData, 
    isLoading: chartsLoading, 
    isError: chartsError 
  } = useGetDashboardChartsQuery();
  
  const { 
    data: recentCasesData, 
    isLoading: recentCasesLoading, 
    isError: recentCasesError 
  } = useGetRecentCasesQuery();

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoading = statsLoading || chartsLoading || recentCasesLoading;
  const isError = statsError || chartsError || recentCasesError;

  // Show loading state that matches between server and client
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-3 flex items-center justify-center">
        <p className="text-gray-500 text-sm sm:text-base">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-3 flex items-center justify-center">
        <p className="text-red-500 text-sm sm:text-base text-center px-4">Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  // Extract data from the stats API
  const totalCases = statsData?.total_cases?.count || 0;
  const growthPercent = statsData?.total_cases?.growth_percent || 0;
  const newCasesToday = statsData?.new_cases_today?.count || 0;
  const increaseFromYesterday = statsData?.new_cases_today?.increase_from_yesterday || 0;
  const activeCases = statsData?.active_cases?.total || 0;
  const pendingCases = statsData?.active_cases?.pending_count || 0;
  
  // Extract data from charts API
  const weeklyData = chartsData?.weekly_overview || [];
  const statusDistribution = chartsData?.status_distribution || { 
    active: 0, 
    pending: 0, 
    resolved: 0, 
    total: 0 
  };
  
  // Extract data from recent cases API
  const recentCases = recentCasesData || [];
  
  // For now, we'll set these to 0 or provide default values since they're not in the API response
  const activeDispatch: any[] = []; // Not in current API response
  
  // Calculate total for pie chart based on actual status counts from charts API
  const totalForPieChart = statusDistribution.total || 0;
  const resolvedCases = statusDistribution.resolved || 0;
  const activeStatusCount = statusDistribution.active || 0;
  const pendingStatusCount = statusDistribution.pending || 0;

  // Calculate stroke dasharray values for pie chart
  const fullCircle = 502.4; // 2 * π * r (where r=80)
  const resolvedLength = totalForPieChart > 0 ? (resolvedCases / totalForPieChart) * fullCircle : 0;
  const activeLength = totalForPieChart > 0 ? (activeStatusCount / totalForPieChart) * fullCircle : 0;
  const pendingLength = totalForPieChart > 0 ? (pendingStatusCount / totalForPieChart) * fullCircle : 0;

  // Format time for recent cases - only run on client
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return 'Just now';
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get color for case status badge
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'dispatched':
        return 'bg-purple-100 text-purple-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-9xl mx-auto space-y-4 sm:space-y-6">

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Total Case Card */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-100 to-white shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="truncate">Total Cases</span>
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{totalCases.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthPercent >= 0 ? '↗' : '↘'} {Math.abs(growthPercent).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 text-xs ml-1 sm:ml-2 truncate">from last period</span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-cyan-50 rounded-full flex-shrink-0 ml-2">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-cyan-500" />
              </div>
            </div>
          </div>

          {/* New Case (Today) Card */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-100 to-white shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2">
                  <ArrowUpCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="truncate">New Cases (Today)</span>
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{newCasesToday.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs ${increaseFromYesterday >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {increaseFromYesterday >= 0 ? '+' : ''}{increaseFromYesterday}
                  </span>
                  <span className="text-gray-500 text-xs ml-1 sm:ml-2 truncate">from yesterday</span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full flex-shrink-0 ml-2">
                <ArrowUpCircle className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Active Case Card */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-100 to-white shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="truncate">Active Cases</span>
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">{activeCases.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <span className="text-amber-600 text-xs">{pendingCases} pending</span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-full flex-shrink-0 ml-2">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Weekly Overview + Recent Cases */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Weekly Case Overview */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Weekly Case Overview</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Cases reported this week</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  This week
                </div>
              </div>
              
              <div className="h-48 sm:h-56 md:h-64">
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={weeklyData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        minTickGap={1}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [`${value} cases`, 'Count']}
                        labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                      />
                      <Bar 
                        dataKey="count" 
                        name="Cases"
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-sm sm:text-base">No weekly data available</p>
                    <p className="text-xs sm:text-sm mt-1 text-center">Data will appear here when available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Cases */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Cases</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Latest case reports and updates</p>
                </div>
                {recentCases.length > 0 && (
                  <div className="text-xs sm:text-sm text-blue-600 font-medium">
                    {recentCases.length} cases
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {recentCases.length > 0 ? (
                  recentCases.map((caseItem: any) => (
                    <div 
                      key={caseItem.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200 gap-2 sm:gap-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{caseItem.id}</p>
                          <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-0.5">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{caseItem.location}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reported by <span className="font-medium">{caseItem.reported_by}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end text-left sm:text-right mt-2 sm:mt-0">
                        <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          {/* Only render time text on client to avoid hydration mismatch */}
                          <span className="whitespace-nowrap">{isMounted ? formatTime(caseItem.created_at) : '...'}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {/* Only render date on client to avoid hydration mismatch */}
                            {isMounted ? formatDate(caseItem.created_at) : '...'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500 px-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-sm sm:text-base">No recent cases</p>
                    <p className="text-xs sm:text-sm mt-0.5">Recent cases will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Case Status Distribution + Active Dispatch */}
          <div className="space-y-4 sm:space-y-6">
            {/* Case Status Distribution */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Case Status</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Distribution by status</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {totalForPieChart} total
                </div>
              </div>
              
              <div className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center">
                {totalForPieChart > 0 ? (
                  <div className="relative">
                    <svg width="160" height="160" viewBox="0 0 200 200" className="sm:w-48 sm:h-48">
                      {/* Background circle */}
                      <circle 
                        cx="100" 
                        cy="100" 
                        r="80" 
                        fill="none" 
                        stroke="#f3f4f6" 
                        strokeWidth="35" 
                      />
                      
                      {/* Resolved segment */}
                      {resolvedCases > 0 && (
                        <circle 
                          cx="100" 
                          cy="100" 
                          r="80" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="35"
                          strokeDasharray={`${resolvedLength} ${fullCircle}`}
                          strokeLinecap="round"
                        />
                      )}
                      
                      {/* Active segment */}
                      {activeStatusCount > 0 && (
                        <circle 
                          cx="100" 
                          cy="100" 
                          r="80" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="35"
                          strokeDasharray={`${activeLength} ${fullCircle}`}
                          strokeDashoffset={`${-resolvedLength}`}
                          strokeLinecap="round"
                        />
                      )}
                      
                      {/* Pending segment */}
                      {pendingStatusCount > 0 && (
                        <circle 
                          cx="100" 
                          cy="100" 
                          r="80" 
                          fill="none" 
                          stroke="#f59e0b" 
                          strokeWidth="35"
                          strokeDasharray={`${pendingLength} ${fullCircle}`}
                          strokeDashoffset={`${-(resolvedLength + activeLength)}`}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{totalForPieChart.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Total Cases</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 px-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <p className="font-medium text-sm sm:text-base">No status data</p>
                  </div>
                )}
              </div>

              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 mr-2 sm:mr-3"></div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Active</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-bold text-gray-800 text-sm sm:text-base">{activeStatusCount}</span>
                    {totalForPieChart > 0 && (
                      <span className="text-xs sm:text-sm text-gray-500">
                        ({Math.round((activeStatusCount / totalForPieChart) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 sm:p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500 mr-2 sm:mr-3"></div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Pending</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-bold text-gray-800 text-sm sm:text-base">{pendingStatusCount}</span>
                    {totalForPieChart > 0 && (
                      <span className="text-xs sm:text-sm text-gray-500">
                        ({Math.round((pendingStatusCount / totalForPieChart) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 sm:p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500 mr-2 sm:mr-3"></div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Resolved</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-bold text-gray-800 text-sm sm:text-base">{resolvedCases}</span>
                    {totalForPieChart > 0 && (
                      <span className="text-xs sm:text-sm text-gray-500">
                        ({Math.round((resolvedCases / totalForPieChart) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Dispatch */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Active Dispatch</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Units currently active</p>
                  </div>
                </div>
                {activeDispatch.length > 0 && (
                  <div className="text-xs sm:text-sm text-blue-600 font-medium">
                    {activeDispatch.length} units
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {activeDispatch.length > 0 ? (
                  activeDispatch.map((unit: any, idx: number) => (
                    <div key={idx} className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{unit.unit}</p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Active by {unit.activeBy}</p>
                          <p className="text-xs text-gray-500 mt-1 sm:mt-2 flex items-center">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            @ {unit.location}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1 sm:mr-2"></div>
                          <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500 px-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-sm sm:text-base">No active dispatch units</p>
                    <p className="text-xs sm:text-sm mt-0.5">All units are currently inactive</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}