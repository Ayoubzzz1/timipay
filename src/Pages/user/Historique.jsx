import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, DollarSign, Filter, Search, Download, Calendar, ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';

function Historique() {
  const { user, userData } = useUser();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  // Mock transaction data
  const allTransactions = [
    {
      id: 1,
      type: 'Earning',
      amount: 25.50,
      description: 'Video view reward',
      date: '2024-01-15',
      status: 'Completed',
      method: 'Direct deposit',
      reference: 'TXN-001-2024'
    },
    {
      id: 2,
      type: 'Withdrawal',
      amount: 50.00,
      description: 'PayPal withdrawal',
      date: '2024-01-14',
      status: 'Processing',
      method: 'PayPal',
      reference: 'TXN-002-2024'
    },
    {
      id: 3,
      type: 'Earning',
      amount: 15.75,
      description: 'Referral bonus',
      date: '2024-01-13',
      status: 'Completed',
      method: 'Direct deposit',
      reference: 'TXN-003-2024'
    },
    {
      id: 4,
      type: 'Earning',
      amount: 8.25,
      description: 'Daily login bonus',
      date: '2024-01-12',
      status: 'Completed',
      method: 'Direct deposit',
      reference: 'TXN-004-2024'
    },
    {
      id: 5,
      type: 'Withdrawal',
      amount: 30.00,
      description: 'Bank transfer',
      date: '2024-01-10',
      status: 'Completed',
      method: 'Bank Transfer',
      reference: 'TXN-005-2024'
    },
    {
      id: 6,
      type: 'Earning',
      amount: 12.00,
      description: 'Survey completion',
      date: '2024-01-09',
      status: 'Completed',
      method: 'Direct deposit',
      reference: 'TXN-006-2024'
    },
    {
      id: 7,
      type: 'Withdrawal',
      amount: 25.00,
      description: 'Cryptocurrency withdrawal',
      date: '2024-01-08',
      status: 'Failed',
      method: 'Bitcoin',
      reference: 'TXN-007-2024'
    },
    {
      id: 8,
      type: 'Earning',
      amount: 18.00,
      description: 'Ad engagement reward',
      date: '2024-01-07',
      status: 'Completed',
      method: 'Direct deposit',
      reference: 'TXN-008-2024'
    }
  ];

  // Calculate statistics
  const totalEarnings = allTransactions
    .filter(t => t.type === 'Earning' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = allTransactions
    .filter(t => t.type === 'Withdrawal' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = totalEarnings - totalWithdrawals;

  // Filter transactions
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleExport = () => {
    const csvContent = [
      ['Type', 'Description', 'Amount', 'Date', 'Status', 'Method', 'Reference'],
      ...sortedTransactions.map(t => [
        t.type,
        t.description,
        `$${t.amount.toFixed(2)}`,
        t.date,
        t.status,
        t.method,
        t.reference
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const stats = [
    { 
      label: 'Total Earnings', 
      value: `$${totalEarnings.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      change: '+12.5%'
    },
    { 
      label: 'Total Withdrawals', 
      value: `$${totalWithdrawals.toFixed(2)}`, 
      icon: TrendingDown, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      change: '-8.3%'
    },
    { 
      label: 'Net Balance', 
      value: `$${netBalance.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      change: '+4.2%'
    },
    { 
      label: 'Transactions', 
      value: allTransactions.length, 
      icon: History, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      change: 'This month'
    }
  ];

  return (
    <MuiNavbar>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          </div>
          <p className="text-gray-600">View all your earnings, withdrawals, and account activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-600">{stat.change}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by description or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Earning">Earnings</option>
                <option value="Withdrawal">Withdrawals</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {sortedTransactions.length} of {allTransactions.length} transactions
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Date
                      {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <tr 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(transaction.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'Earning' ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'Earning' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.reference}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-semibold ${
                          transaction.type === 'Earning' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'Earning' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(transaction.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {expandedRow === transaction.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedRow === transaction.id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Payment Method</p>
                              <p className="text-sm text-gray-900">{transaction.method}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Transaction ID</p>
                              <p className="text-sm text-gray-900 font-mono">{transaction.reference}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Processing Time</p>
                              <p className="text-sm text-gray-900">
                                {transaction.status === 'Completed' ? 'Instant' : '3-5 business days'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {sortedTransactions.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </MuiNavbar>
  );
}

export default Historique;