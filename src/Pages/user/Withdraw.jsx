import React, { useState } from 'react';
import { Wallet, Send, History, CheckCircle, X, Clock, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import MuiNavbar from '../../compoents/Navbars/MuiNavbar';
import { useUser } from '../../contexts/UserContext';

function Withdraw() {
  const { user, userData } = useUser();
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [withdrawals, setWithdrawals] = useState([
    { id: 1, amount: 50, method: 'PayPal', date: '2024-10-15', status: 'completed' },
    { id: 2, amount: 75, method: 'Bank Transfer', date: '2024-10-01', status: 'completed' },
    { id: 3, amount: 30, method: 'PayPal', date: '2024-09-20', status: 'pending' },
  ]);

  const accountBalance = 125.50;
  const minWithdrawal = 10;

  const validateForm = () => {
    const newErrors = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(amount) < minWithdrawal) {
      newErrors.amount = `Minimum withdrawal is $${minWithdrawal}`;
    } else if (parseFloat(amount) > accountBalance) {
      newErrors.amount = 'Insufficient balance';
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (!accountDetails.trim()) {
      newErrors.accountDetails = 'Please enter your account details';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setConfirmDialog(true);
    }
  };

  const handleConfirmWithdrawal = () => {
    setConfirmDialog(false);
    setProcessing(true);

    setTimeout(() => {
      const newWithdrawal = {
        id: withdrawals.length + 1,
        amount: parseFloat(amount),
        method: paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'bank' ? 'Bank Transfer' : 'Cryptocurrency',
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      setWithdrawals([newWithdrawal, ...withdrawals]);
      setProcessing(false);
      setSnackbar({ 
        open: true, 
        message: 'Withdrawal request submitted successfully!', 
        severity: 'success' 
      });
      
      setAmount('');
      setPaymentMethod('');
      setAccountDetails('');
      setErrors({});
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MuiNavbar>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
          </div>
          <p className="text-gray-600">Transfer your earnings to your preferred payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Withdrawal Request</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (errors.amount) setErrors({...errors, amount: ''});
                      }}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.amount}
                    </p>
                  )}
                  {amount && !errors.amount && parseFloat(amount) <= accountBalance && parseFloat(amount) >= minWithdrawal && (
                    <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Valid amount
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (errors.paymentMethod) setErrors({...errors, paymentMethod: ''});
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.paymentMethod ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select payment method</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* Account Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Details
                  </label>
                  <textarea
                    value={accountDetails}
                    onChange={(e) => {
                      setAccountDetails(e.target.value);
                      if (errors.accountDetails) setErrors({...errors, accountDetails: ''});
                    }}
                    placeholder="Enter your account information"
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                      errors.accountDetails ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.accountDetails && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.accountDetails}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Balance Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-2">Account Balance</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                ${accountBalance.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mb-4">Available for withdrawal</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Minimum withdrawal amount: ${minWithdrawal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Recent Withdrawals */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Recent Withdrawals</h3>
              </div>
              
              {withdrawals.length === 0 ? (
                <p className="text-sm text-gray-500">No recent withdrawals</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.slice(0, 5).map((withdrawal) => (
                    <div key={withdrawal.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">
                          ${withdrawal.amount.toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(withdrawal.status)}`}>
                          {getStatusIcon(withdrawal.status)}
                          {withdrawal.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{withdrawal.method}</p>
                      <p className="text-xs text-gray-500">{withdrawal.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Withdrawal</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">
                  {paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'bank' ? 'Bank Transfer' : 'Cryptocurrency'}
                </span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Processing time: 3-5 business days
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdrawal}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-700 font-medium">Processing your withdrawal...</p>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
            snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white min-w-[300px]`}>
            {snackbar.severity === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="flex-1">{snackbar.message}</p>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </MuiNavbar>
  );
}

export default Withdraw;