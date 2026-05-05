'use client';

import { useState, useEffect } from 'react';
import { Eye, Search, Download, ChevronLeft, ChevronRight, Loader2, Filter, Plus, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useGetCasesQuery, useUpdateCaseStatusMutation, useCreateDispatchMutation } from '@/redux/services/api';
import { formatDate } from '@/utils/formatDate';

const ITEMS_PER_PAGE = 8;

interface Case {
  id: number;
  case_number: string;
  reporter_name: string;
  address: string;
  status: string;
  created_at: string;
}

export default function CaseList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  const [dispatchData, setDispatchData] = useState({
    case_number: '',
    lat: 0,
    long: 0,
    address: '',
    description: '',
    max_slots: 5,
    points: 10,
  });

  const [createDispatch] = useCreateDispatchMutation();
  
  const { data, isLoading, error, refetch } = useGetCasesQuery({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
  });

  // Refetch cases when component mounts to get updated statuses
  useEffect(() => {
    refetch();
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCases = data?.cases ? [...data.cases].sort((a: any, b: any) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  const handleExport = () => {
    alert('Export functionality will be implemented soon');
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'dispatched':
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDispatch(true);
    try {
      await createDispatch(dispatchData).unwrap();
      Swal.fire({
        title: 'Success!',
        text: 'Dispatch created successfully.',
        icon: 'success',
        confirmButtonColor: '#507493',
      });
      setIsDispatchModalOpen(false);
      setDispatchData({
        case_number: '',
        lat: 0,
        long: 0,
        address: '',
        description: '',
        max_slots: 5,
        points: 10,
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error!',
        text: err?.data?.detail || 'Failed to create dispatch.',
        icon: 'error',
        confirmButtonColor: '#507493',
      });
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Error Loading Cases</h1>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="min-h-screen p-2 md:p-4">
      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="md:hidden mb-4 w-full bg-[#507493] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#406383] transition"
      >
        <Filter className="w-5 h-5" />
        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className="bg-white rounded-lg border shadow-sm">
        {/* Search and Filters - Responsive Layout */}
        <div className={`p-4 md:p-6 flex flex-col gap-4 ${showMobileFilters ? 'block' : 'hidden md:flex md:flex-row'}`}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search cases..."
              className="pl-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm md:text-base"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
              if (window.innerWidth < 768) {
                setShowMobileFilters(false);
              }
            }}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm md:text-base"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Create Dispatch</span>
          </button>

          <button
            onClick={handleExport}
            className="bg-[#507493] text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#406383] transition text-sm md:text-base"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Table - Responsive Cards for Mobile */}
        <div className="block md:hidden">
          {data?.cases?.map((item) => (
            <div key={item.id} className="p-4 border-b hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-gray-900 text-sm">Case ID: {item.case_number}</div>
                  <div className="text-gray-700 text-sm mt-1">Reporter: {item.reporter_name}</div>
                  <div className="text-gray-700 text-sm mt-1">Analyst: {(item as any).assigned_analyst_name || 'Unassigned'}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              
              <div className="text-gray-700 text-sm mb-3">
                <div className="mb-1">Location: {item.address}</div>
                <div>Date: {formatDate(item.created_at)}</div>
              </div>
              
              <div className="flex justify-end">
                <Link
                  href={`/dashboard/case-list/${item.id}`}
                  className="text-[#507493] hover:text-blue-900 font-medium flex items-center gap-1 transition text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('case_number')}>Case ID</th>
                <th className="p-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('reporter_name')}>Reporter</th>
                <th className="p-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('address')}>Location</th>
                <th className="p-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>Status</th>
                <th className="p-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('assigned_analyst_name')}>Assigned Analyst</th>
                <th className="p-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>Date Reported</th>
                <th className="p-4 font-semibold text-gray-700 text-sm">Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedCases.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900 text-sm">{item.case_number}</td>
                  <td className="p-4 text-gray-700 text-sm">{item.reporter_name}</td>
                  <td className="p-4 text-gray-700 text-sm">{item.address}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 text-sm">{(item as any).assigned_analyst_name || 'Unassigned'}</td>
                  <td className="p-4 text-gray-700 text-sm">{formatDate(item.created_at)}</td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/case-list/${item.id}`}
                      className="text-[#507493] hover:text-blue-900 font-medium flex items-center gap-2 transition text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {data?.cases?.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <div className="inline-flex flex-col items-center gap-3 p-4 md:p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-base md:text-lg">No cases found</p>
              {(searchTerm || statusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setCurrentPage(1);
                    if (window.innerWidth < 768) {
                      setShowMobileFilters(false);
                    }
                  }}
                  className="text-[#507493] hover:text-blue-800 font-medium text-sm transition"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, data?.total || 0)} of {data?.total || 0} cases
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-1 text-xs">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition text-sm ${
                          currentPage === page
                            ? 'bg-[#507493] text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Dispatch</h2>
              <button
                onClick={() => !isSubmittingDispatch && setIsDispatchModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <input
                    type="text"
                    required
                    value={dispatchData.case_number}
                    onChange={(e) => setDispatchData({ ...dispatchData, case_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="CASE-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={dispatchData.address}
                    onChange={(e) => setDispatchData({ ...dispatchData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="123 Main St, City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={dispatchData.lat}
                    onChange={(e) => setDispatchData({ ...dispatchData, lat: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={dispatchData.long}
                    onChange={(e) => setDispatchData({ ...dispatchData, long: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Slots</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dispatchData.max_slots}
                    onChange={(e) => setDispatchData({ ...dispatchData, max_slots: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={dispatchData.points}
                    onChange={(e) => setDispatchData({ ...dispatchData, points: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Details</label>
                <textarea
                  required
                  rows={3}
                  value={dispatchData.description}
                  onChange={(e) => setDispatchData({ ...dispatchData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Enter dispatch details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  disabled={isSubmittingDispatch}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispatch}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  {isSubmittingDispatch && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmittingDispatch ? 'Creating...' : 'Create Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}