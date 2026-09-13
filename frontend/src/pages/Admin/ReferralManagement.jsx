import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminTable.css';

const ReferralManagement = () => {
    // State for active tab
    const [activeTab, setActiveTab] = useState('codes');
    
    // Dashboard statistics state
    const [dashboardStats, setDashboardStats] = useState({});
    const [statsLoading, setStatsLoading] = useState(true);
    
    // Referral codes state
    const [referralCodes, setReferralCodes] = useState([]);
    const [codesLoading, setCodesLoading] = useState(true);
    const [codesSearch, setCodesSearch] = useState('');
    const [codesStatus, setCodesStatus] = useState('all');
    const [codesPage, setCodesPage] = useState(1);
    const [codesPagination, setCodesPagination] = useState({});
    
    // Transactions state
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [transactionsSearch, setTransactionsSearch] = useState('');
    const [transactionsPaymentStatus, setTransactionsPaymentStatus] = useState('all');
    const [transactionsReferralStatus, setTransactionsReferralStatus] = useState('all');
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [transactionsPagination, setTransactionsPagination] = useState({});
    
    // Commissions state
    const [commissions, setCommissions] = useState([]);
    const [commissionsLoading, setCommissionsLoading] = useState(true);
    const [commissionsSearch, setCommissionsSearch] = useState('');
    const [commissionsStatus, setCommissionsStatus] = useState('all');
    const [commissionsPage, setCommissionsPage] = useState(1);
    const [commissionsPagination, setCommissionsPagination] = useState({});
    
    // Settings state
    const [settings, setSettings] = useState({});
    const [settingsLoading, setSettingsLoading] = useState(true);
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    
    // Selected items
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedCommission, setSelectedCommission] = useState(null);
    
    // Helper data
    const [availableUsers, setAvailableUsers] = useState([]);
    const [referrers, setReferrers] = useState([]);
    // Error and success messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load dashboard statistics
    const fetchDashboardStats = async () => {
        try {
            setStatsLoading(true);
            const response = await api.get('/admin/referrals/dashboard/stats');
            if (response.success) {
                setDashboardStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to load dashboard statistics');
        } finally {
            setStatsLoading(false);
        }
    };

    // Load referral codes
    const fetchReferralCodes = async (page = 1) => {
        try {
            setCodesLoading(true);
            const params = new URLSearchParams({
                page: page,
                per_page: 10,
                search: codesSearch,
                status: codesStatus
            });
            
            const response = await api.get(`/admin/referrals?${params}`);
            if (response.success) {
                setReferralCodes(response.data.data);
                setCodesPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching referral codes:', error);
            setError('Failed to load referral codes');
        } finally {
            setCodesLoading(false);
        }
    };

    // Load referral transactions
    const fetchReferralTransactions = async (page = 1) => {
        try {
            setTransactionsLoading(true);
            const params = new URLSearchParams({
                page: page,
                per_page: 15,
                search: transactionsSearch,
                payment_status: transactionsPaymentStatus,
                referral_status: transactionsReferralStatus
            });
            
            const response = await api.get(`/admin/referral-transactions?${params}`);
            if (response.success) {
                setTransactions(response.data.data);
                setTransactionsPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Failed to load referral transactions');
        } finally {
            setTransactionsLoading(false);
        }
    };
    // Load referral commissions
    const fetchReferralCommissions = async (page = 1) => {
        try {
            setCommissionsLoading(true);
            const params = new URLSearchParams({
                page: page,
                per_page: 15,
                search: commissionsSearch,
                status: commissionsStatus
            });
            
            const response = await api.get(`/admin/referral-commissions?${params}`);
            if (response.success) {
                setCommissions(response.data.data);
                setCommissionsPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching commissions:', error);
            setError('Failed to load referral commissions');
        } finally {
            setCommissionsLoading(false);
        }
    };

    // Load settings
    const fetchSettings = async () => {
        try {
            setSettingsLoading(true);
            const response = await api.get('/admin/referral-settings');
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError('Failed to load referral settings');
        } finally {
            setSettingsLoading(false);
        }
    };

    // Load helper data
    const fetchHelperData = async () => {
        try {
            const [usersResponse, referrersResponse] = await Promise.all([
                api.get('/admin/referrals/helper/users'),
                api.get('/admin/referrals/helper/referrers')
            ]);
            
            if (usersResponse.success) {
                setAvailableUsers(usersResponse.data);
            }
            if (referrersResponse.success) {
                setReferrers(referrersResponse.data);
            }
        } catch (error) {
            console.error('Error fetching helper data:', error);
        }
    };
    // useEffect hooks
    useEffect(() => {
        fetchDashboardStats();
        fetchHelperData();
    }, []);

    useEffect(() => {
        if (activeTab === 'codes') {
            fetchReferralCodes(1);
        } else if (activeTab === 'transactions') {
            fetchReferralTransactions(1);
        } else if (activeTab === 'commissions') {
            fetchReferralCommissions(1);
        } else if (activeTab === 'settings') {
            fetchSettings();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'codes') {
            fetchReferralCodes(codesPage);
        }
    }, [codesSearch, codesStatus, codesPage]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchReferralTransactions(transactionsPage);
        }
    }, [transactionsSearch, transactionsPaymentStatus, transactionsReferralStatus, transactionsPage]);

    useEffect(() => {
        if (activeTab === 'commissions') {
            fetchReferralCommissions(commissionsPage);
        }
    }, [commissionsSearch, commissionsStatus, commissionsPage]);

    // Helper functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'approved',
            inactive: 'pending',
            suspended: 'rejected',
            pending: 'pending',
            approved: 'approved',
            paid: 'approved',
            rejected: 'rejected',
            cancelled: 'rejected'
        };
        return badges[status] || 'pending';
    };
    // Action handlers
    const handleApproveTransaction = async (id) => {
        try {
            const response = await api.post(`/admin/referral-transactions/${id}/approve`);
            if (response.success) {
                setSuccess('Referral transaction approved successfully');
                fetchReferralTransactions(transactionsPage);
                fetchDashboardStats();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to approve transaction');
        }
    };

    const handleRejectTransaction = async (id, reason) => {
        try {
            const response = await api.post(`/admin/referral-transactions/${id}/reject`, {
                reason: reason
            });
            if (response.success) {
                setSuccess('Referral transaction rejected successfully');
                fetchReferralTransactions(transactionsPage);
                fetchDashboardStats();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reject transaction');
        }
    };

    const handleApproveCommission = async (id) => {
        try {
            const response = await api.post(`/admin/referral-commissions/${id}/approve`);
            if (response.success) {
                setSuccess('Commission approved successfully');
                fetchReferralCommissions(commissionsPage);
                fetchDashboardStats();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to approve commission');
        }
    };

    const handleRejectCommission = async (id, reason) => {
        try {
            const response = await api.post(`/admin/referral-commissions/${id}/reject`, {
                reason: reason
            });
            if (response.success) {
                setSuccess('Commission rejected successfully');
                fetchReferralCommissions(commissionsPage);
                fetchDashboardStats();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reject commission');
        }
    };

    const handleMarkCommissionPaid = async (id) => {
        if (window.confirm('Are you sure this commission has been paid?')) {
            try {
                const response = await api.post(`/admin/referral-commissions/${id}/paid`);
                if (response.success) {
                    setSuccess('Commission marked as paid successfully');
                    fetchReferralCommissions(commissionsPage);
                    fetchDashboardStats();
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to mark commission as paid');
            }
        }
    };
    const handleGenerateReferralCode = async (userId) => {
        try {
            const response = await api.post('/admin/referrals/generate', {
                user_id: userId
            });
            if (response.success) {
                setSuccess('Referral code generated successfully');
                fetchReferralCodes(codesPage);
                fetchDashboardStats();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to generate referral code');
        }
    };

    const handleRegenerateCode = async (id) => {
        if (window.confirm('Are you sure you want to regenerate this referral code? The old code will no longer work for new transactions.')) {
            try {
                const response = await api.post(`/admin/referrals/${id}/regenerate`);
                if (response.success) {
                    setSuccess('Referral code regenerated successfully');
                    fetchReferralCodes(codesPage);
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to regenerate referral code');
            }
        }
    };

    // Clear messages after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Referral Management</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                Manage referral codes, transactions, and commissions with comprehensive tracking and approval system.
            </p>

            {/* Error/Success Messages */}
            {error && (
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    color: '#dc2626'
                }}>
                    {error}
                </div>
            )}
            
            {success && (
                <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    color: '#16a34a'
                }}>
                    {success}
                </div>
            )}
            {/* Dashboard Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: '0.9' }}>Total Referral Codes</h3>
                    <p style={{ margin: '0', fontSize: '28px', fontWeight: '700' }}>
                        {statsLoading ? '...' : dashboardStats.total_referral_codes || 0}
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: '0.9' }}>Active Codes</h3>
                    <p style={{ margin: '0', fontSize: '28px', fontWeight: '700' }}>
                        {statsLoading ? '...' : dashboardStats.active_referral_codes || 0}
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: '0.9' }}>Pending Transactions</h3>
                    <p style={{ margin: '0', fontSize: '28px', fontWeight: '700' }}>
                        {statsLoading ? '...' : dashboardStats.pending_transactions || 0}
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: '0.9' }}>Total Commission</h3>
                    <p style={{ margin: '0', fontSize: '28px', fontWeight: '700' }}>
                        {statsLoading ? '...' : formatCurrency(dashboardStats.total_commission || 0)}
                    </p>
                </div>
            </div>
            {/* Tabs Navigation */}
            <div style={{
                borderBottom: '2px solid #e5e7eb',
                marginBottom: '24px'
            }}>
                <nav style={{ display: 'flex', gap: '0' }}>
                    {[
                        { id: 'codes', label: 'Referral Codes', icon: '🎫' },
                        { id: 'transactions', label: 'Transactions', icon: '💰' },
                        { id: 'commissions', label: 'Commissions', icon: '💵' },
                        { id: 'settings', label: 'Settings', icon: '⚙️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                background: activeTab === tab.id ? '#667eea' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#6b7280',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                borderRadius: '8px 8px 0 0',
                                borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            {/* Tab Content */}
            {activeTab === 'codes' && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        gap: '16px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search referral/user/email"
                                value={codesSearch}
                                onChange={(e) => setCodesSearch(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    minWidth: '250px'
                                }}
                            />
                            <select
                                value={codesStatus}
                                onChange={(e) => setCodesStatus(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            + Generate Referral Code
                        </button>
                    </div>

                    {codesLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Loading referral codes...
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Referral Code</th>
                                    <th>Usage</th>
                                    <th>Transactions</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referralCodes.map(referral => (
                                    <tr key={referral.id}>
                                        <td>{referral.name}</td>
                                        <td>{referral.email}</td>
                                        <td>
                                            <code style={{
                                                background: '#f3f4f6',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontWeight: '600'
                                            }}>
                                                {referral.referral_code}
                                            </code>
                                        </td>
                                        <td>{referral.usage_count || 0}</td>
                                        <td>{referral.transaction_count || 0}</td>
                                        <td>{formatCurrency(referral.total_commission || 0)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadge(referral.status === 'active' && referral.is_active ? 'active' : 'inactive')}`}>
                                                {referral.status === 'active' && referral.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{formatDate(referral.created_at)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReferral(referral);
                                                        setShowDetailModal(true);
                                                    }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#667eea',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReferral(referral);
                                                        setShowEditModal(true);
                                                    }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#10b981',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateCode(referral.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#f59e0b',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Regenerate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination for Referral Codes */}
                    {codesPagination.last_page > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={() => setCodesPage(Math.max(1, codesPage - 1))}
                                disabled={codesPage === 1}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    background: codesPage === 1 ? '#f9fafb' : 'white',
                                    borderRadius: '4px',
                                    cursor: codesPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ padding: '8px 12px', color: '#6b7280' }}>
                                Page {codesPage} of {codesPagination.last_page}
                            </span>
                            <button
                                onClick={() => setCodesPage(Math.min(codesPagination.last_page, codesPage + 1))}
                                disabled={codesPage === codesPagination.last_page}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    background: codesPage === codesPagination.last_page ? '#f9fafb' : 'white',
                                    borderRadius: '4px',
                                    cursor: codesPage === codesPagination.last_page ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'transactions' && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        gap: '16px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search Transaction ID / User"
                                value={transactionsSearch}
                                onChange={(e) => setTransactionsSearch(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    minWidth: '250px'
                                }}
                            />
                            <select
                                value={transactionsPaymentStatus}
                                onChange={(e) => setTransactionsPaymentStatus(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Payment Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                            <select
                                value={transactionsReferralStatus}
                                onChange={(e) => setTransactionsReferralStatus(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Referral Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {transactionsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Loading referral transactions...
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Buyer</th>
                                    <th>Referral Owner</th>
                                    <th>Code</th>
                                    <th>Package</th>
                                    <th>Original Price</th>
                                    <th>Discount</th>
                                    <th>Final Price</th>
                                    <th>Payment</th>
                                    <th>Referral</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(transaction => (
                                    <tr key={transaction.id}>
                                        <td>
                                            <code style={{
                                                background: '#f3f4f6',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                {transaction.invoice_number}
                                            </code>
                                        </td>
                                        <td>{transaction.user?.name}</td>
                                        <td>{transaction.referrer?.name}</td>
                                        <td>
                                            <code style={{
                                                background: '#ecfdf5',
                                                color: '#059669',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                {transaction.referral_code}
                                            </code>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: '#f0f9ff',
                                                color: '#0ea5e9',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {transaction.plan}
                                            </span>
                                        </td>
                                        <td>{formatCurrency(transaction.original_amount || 0)}</td>
                                        <td>
                                            <span style={{ color: '#059669', fontWeight: '600' }}>
                                                -{formatCurrency(transaction.discount_amount || 0)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: '600' }}>
                                                {formatCurrency(transaction.amount || 0)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadge(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadge(transaction.referral_status)}`}>
                                                {transaction.referral_status || 'pending'}
                                            </span>
                                        </td>
                                        <td>{formatDate(transaction.created_at)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                                                {transaction.referral_status === 'pending' && transaction.status === 'paid' && (
                                                    <button
                                                        onClick={() => handleApproveTransaction(transaction.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            background: '#10b981',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {transaction.referral_status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            setShowRejectModal(true);
                                                        }}
                                                        style={{
                                                            padding: '4px 8px',
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination for Transactions */}
                    {transactionsPagination.last_page > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={() => setTransactionsPage(Math.max(1, transactionsPage - 1))}
                                disabled={transactionsPage === 1}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    background: transactionsPage === 1 ? '#f9fafb' : 'white',
                                    borderRadius: '4px',
                                    cursor: transactionsPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ padding: '8px 12px', color: '#6b7280' }}>
                                Page {transactionsPage} of {transactionsPagination.last_page}
                            </span>
                            <button
                                onClick={() => setTransactionsPage(Math.min(transactionsPagination.last_page, transactionsPage + 1))}
                                disabled={transactionsPage === transactionsPagination.last_page}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    background: transactionsPage === transactionsPagination.last_page ? '#f9fafb' : 'white',
                                    borderRadius: '4px',
                                    cursor: transactionsPage === transactionsPagination.last_page ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'commissions' && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        gap: '16px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search referral owner"
                                value={commissionsSearch}
                                onChange={(e) => setCommissionsSearch(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    minWidth: '250px'
                                }}
                            />
                            <select
                                value={commissionsStatus}
                                onChange={(e) => setCommissionsStatus(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    // Export commissions data
                                    const csvData = commissions.map(commission => ({
                                        'Referrer Name': commission.referrer?.name || 'N/A',
                                        'Referrer Email': commission.referrer?.email || 'N/A',
                                        'Commission Amount': commission.final_commission_amount || commission.commission_amount || 0,
                                        'Status': commission.status,
                                        'Transaction Date': new Date(commission.created_at).toLocaleDateString(),
                                        'Approved Date': commission.approved_at ? new Date(commission.approved_at).toLocaleDateString() : '',
                                        'Paid Date': commission.paid_at ? new Date(commission.paid_at).toLocaleDateString() : ''
                                    }));
                                    
                                    if (csvData.length === 0) {
                                        alert('No commission data to export');
                                        return;
                                    }
                                    
                                    const csv = [
                                        Object.keys(csvData[0]).join(','),
                                        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
                                    ].join('\n');
                                    
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                    setSuccess('Commission data exported successfully');
                                }}
                                style={{
                                    padding: '10px 16px',
                                    background: '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                📊 Export CSV
                            </button>
                            
                            <button
                                onClick={async () => {
                                    const approvedCommissions = commissions.filter(c => c.status === 'approved');
                                    if (approvedCommissions.length === 0) {
                                        alert('No approved commissions to mark as paid');
                                        return;
                                    }
                                    if (window.confirm(`Mark ${approvedCommissions.length} approved commission(s) as paid?`)) {
                                        try {
                                            await Promise.all(
                                                approvedCommissions.map(commission => 
                                                    handleMarkCommissionPaid(commission.id)
                                                )
                                            );
                                            setSuccess(`${approvedCommissions.length} commissions marked as paid successfully`);
                                        } catch (error) {
                                            setError('Failed to process bulk payment');
                                        }
                                    }
                                }}
                                style={{
                                    padding: '10px 16px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                💰 Bulk Pay Approved
                            </button>
                        </div>
                    </div>

                    {/* Commission Summary Cards */}
                    {!commissionsLoading && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '12px', opacity: '0.9' }}>Pending</div>
                                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                    {formatCurrency(commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.final_commission_amount || c.commission_amount || 0), 0))}
                                </div>
                                <div style={{ fontSize: '11px', opacity: '0.8' }}>
                                    {commissions.filter(c => c.status === 'pending').length} items
                                </div>
                            </div>
                            
                            <div style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '12px', opacity: '0.9' }}>Approved</div>
                                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                    {formatCurrency(commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.final_commission_amount || c.commission_amount || 0), 0))}
                                </div>
                                <div style={{ fontSize: '11px', opacity: '0.8' }}>
                                    {commissions.filter(c => c.status === 'approved').length} items
                                </div>
                            </div>
                            
                            <div style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '12px', opacity: '0.9' }}>Paid</div>
                                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                    {formatCurrency(commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.final_commission_amount || c.commission_amount || 0), 0))}
                                </div>
                                <div style={{ fontSize: '11px', opacity: '0.8' }}>
                                    {commissions.filter(c => c.status === 'paid').length} items
                                </div>
                            </div>
                            
                            <div style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                padding: '16px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '12px', opacity: '0.9' }}>Rejected</div>
                                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                    {formatCurrency(commissions.filter(c => c.status === 'rejected').reduce((sum, c) => sum + (c.final_commission_amount || c.commission_amount || 0), 0))}
                                </div>
                                <div style={{ fontSize: '11px', opacity: '0.8' }}>
                                    {commissions.filter(c => c.status === 'rejected').length} items
                                </div>
                            </div>
                        </div>
                    )}

                    {commissionsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Loading referral commissions...
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Referral Owner</th>
                                    <th>Transaction</th>
                                    <th>Original Price</th>
                                    <th>Discount 5%</th>
                                    <th>Final Price</th>
                                    <th>Commission 15%</th>
                                    <th>Final Commission</th>
                                    <th>Status</th>
                                    <th>Commission Date</th>
                                    <th>Paid At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.map(commission => (
                                    <tr key={commission.id}>
                                        <td>{commission.referrer?.name}</td>
                                        <td>
                                            <code style={{
                                                background: '#f3f4f6',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                {commission.transaction_id || commission.subscription?.invoice_number}
                                            </code>
                                        </td>
                                        <td>{formatCurrency(commission.subscription?.original_amount || 0)}</td>
                                        <td>
                                            <span style={{ color: '#059669', fontWeight: '600' }}>
                                                -{formatCurrency(commission.discount_amount || 0)}
                                            </span>
                                        </td>
                                        <td>{formatCurrency(commission.subscription?.amount || 0)}</td>
                                        <td>
                                            <span style={{ fontWeight: '600', color: '#8b5cf6' }}>
                                                {formatCurrency(commission.commission_amount || 0)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: '700', color: commission.is_adjusted ? '#f59e0b' : '#8b5cf6' }}>
                                                {formatCurrency(commission.final_amount || commission.commission_amount || 0)}
                                                {commission.is_adjusted && (
                                                    <span style={{ fontSize: '10px', color: '#f59e0b', marginLeft: '4px' }}>
                                                        (Adjusted)
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadge(commission.status)}`}>
                                                {commission.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(commission.created_at)}</td>
                                        <td>{commission.paid_at ? formatDate(commission.paid_at) : '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                                                {commission.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveCommission(commission.id)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCommission(commission);
                                                                setShowRejectModal(true);
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {commission.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleMarkCommissionPaid(commission.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            background: '#8b5cf6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {(commission.status === 'pending' || commission.status === 'approved') && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCommission(commission);
                                                            setShowAdjustmentModal(true);
                                                        }}
                                                        style={{
                                                            padding: '4px 8px',
                                                            background: '#f59e0b',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Adjust
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination for Commissions */}
                    {commissionsPagination.last_page > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={() => setCommissionsPage(Math.max(1, commissionsPage - 1))}
                                disabled={commissionsPage === 1}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    background: commissionsPage === 1 ? '#f9fafb' : 'white',
                                    borderRadius: '4px',
                                    cursor: commissionsPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ padding: '8px 12px', color: '#6b7280' }}>
                                Page {commissionsPage} of {commissionsPagination.last_page}
                            </span>
                            <button
                                onClick={() => setCommissionsPage(Math.min(commissionsPagination.last_page, commissionsPage + 1))}
                                disabled={commissionsPage === commissionsPagination.last_page}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    background: commissionsPage === commissionsPagination.last_page ? '#f9fafb' : 'white',
                                    borderRadius: '4px',
                                    cursor: commissionsPage === commissionsPagination.last_page ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'settings' && (
                <div>
                    <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Referral System Settings</h3>
                    
                    {settingsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Loading settings...
                        </div>
                    ) : (
                        <div style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '800px'
                        }}>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>Referral System</h4>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Enable or disable the referral system</p>
                                    </div>
                                    <div style={{
                                        padding: '8px 16px',
                                        background: settings.referral_system_enabled ? '#10b981' : '#ef4444',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        {settings.referral_system_enabled ? 'ON' : 'OFF'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>Referral Discount</h4>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Fixed discount percentage for all referrals</p>
                                    </div>
                                    <div style={{
                                        padding: '8px 16px',
                                        background: '#667eea',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '700'
                                    }}>
                                        {settings.referral_discount_percent}%
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>Referral Commission</h4>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Commission percentage calculated from final price</p>
                                    </div>
                                    <div style={{
                                        padding: '8px 16px',
                                        background: '#8b5cf6',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '700'
                                    }}>
                                        {settings.referral_commission_percent}%
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>Approval Required</h4>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Require admin approval for referral transactions</p>
                                    </div>
                                    <div style={{
                                        padding: '8px 16px',
                                        background: settings.approval_required ? '#f59e0b' : '#10b981',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        {settings.approval_required ? 'ON' : 'OFF'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>Commission Payout</h4>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>How commissions are processed for payment</p>
                                    </div>
                                    <div style={{
                                        padding: '8px 16px',
                                        background: '#64748b',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {settings.commission_payout_method}
                                    </div>
                                </div>

                                <div style={{
                                    borderTop: '1px solid #e5e7eb',
                                    paddingTop: '16px',
                                    marginTop: '8px'
                                }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Business Logic</h4>
                                    <div style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #0ea5e9',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        fontSize: '14px',
                                        lineHeight: '1.6'
                                    }}>
                                        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#0c4a6e' }}>Current Formula:</p>
                                        <p style={{ margin: '0 0 4px 0' }}>• Customer Discount = Original Price × 5%</p>
                                        <p style={{ margin: '0 0 4px 0' }}>• Final Price = Original Price - Discount</p>
                                        <p style={{ margin: '0 0 8px 0' }}>• Commission = Final Price × 15%</p>
                                        <p style={{ margin: '0', fontSize: '13px', color: '#0c4a6e', fontStyle: 'italic' }}>
                                            Example: Rp150,000 → Discount Rp7,500 → Final Rp142,500 → Commission Rp21,375
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {/* Generate Referral Code Modal */}
            {showGenerateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Generate Referral Code</h3>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600' }}>
                                Select User
                            </label>
                            <select
                                value={selectedReferral?.user_id || ''}
                                onChange={(e) => setSelectedReferral({ ...selectedReferral, user_id: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">Select a user...</option>
                                {availableUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowGenerateModal(false);
                                    setSelectedReferral(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedReferral?.user_id) {
                                        handleGenerateReferralCode(selectedReferral.user_id);
                                        setShowGenerateModal(false);
                                        setSelectedReferral(null);
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                                disabled={!selectedReferral?.user_id}
                            >
                                Generate Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Referral Detail Modal */}
            {showDetailModal && selectedReferral && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Referral Code Details</h3>
                        
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                    User
                                </label>
                                <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                                    {selectedReferral.name} ({selectedReferral.email})
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                    Referral Code
                                </label>
                                <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
                                    <code style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                                        {selectedReferral.referral_code}
                                    </code>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                        Usage Count
                                    </label>
                                    <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                                        {selectedReferral.usage_count || 0}
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                        Transactions
                                    </label>
                                    <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                                        {selectedReferral.transaction_count || 0}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                    Total Commission Earned
                                </label>
                                <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontWeight: '600' }}>
                                    {formatCurrency(selectedReferral.total_commission || 0)}
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                    Status
                                </label>
                                <div>
                                    <span className={`status-badge ${getStatusBadge(selectedReferral.status === 'active' && selectedReferral.is_active ? 'active' : 'inactive')}`}>
                                        {selectedReferral.status === 'active' && selectedReferral.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                    Created At
                                </label>
                                <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                                    {formatDate(selectedReferral.created_at)}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedReferral(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Referral Modal */}
            {showEditModal && selectedReferral && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Edit Referral Code</h3>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600' }}>
                                User: {selectedReferral.name}
                            </label>
                            <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px', color: '#6b7280' }}>
                                {selectedReferral.email}
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600' }}>
                                Referral Code
                            </label>
                            <input
                                type="text"
                                value={selectedReferral.referral_code}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#f9fafb',
                                    color: '#6b7280'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600' }}>
                                Status
                            </label>
                            <select
                                value={selectedReferral.is_active ? 'active' : 'inactive'}
                                onChange={(e) => setSelectedReferral({
                                    ...selectedReferral,
                                    is_active: e.target.value === 'active'
                                })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedReferral(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await api.put(`/admin/referrals/${selectedReferral.id}`, {
                                            is_active: selectedReferral.is_active
                                        });
                                        if (response.success) {
                                            setSuccess('Referral code updated successfully');
                                            fetchReferralCodes(codesPage);
                                            setShowEditModal(false);
                                            setSelectedReferral(null);
                                        }
                                    } catch (error) {
                                        setError(error.response?.data?.message || 'Failed to update referral code');
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (selectedTransaction || selectedCommission) && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>
                            Reject {selectedTransaction ? 'Transaction' : 'Commission'}
                        </h3>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600' }}>
                                Rejection Reason *
                            </label>
                            <textarea
                                value={selectedTransaction?.rejection_reason || selectedCommission?.rejection_reason || ''}
                                onChange={(e) => {
                                    if (selectedTransaction) {
                                        setSelectedTransaction({
                                            ...selectedTransaction,
                                            rejection_reason: e.target.value
                                        });
                                    } else if (selectedCommission) {
                                        setSelectedCommission({
                                            ...selectedCommission,
                                            rejection_reason: e.target.value
                                        });
                                    }
                                }}
                                placeholder="Please provide a reason for rejecting this item..."
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedTransaction(null);
                                    setSelectedCommission(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedTransaction) {
                                        handleRejectTransaction(selectedTransaction.id, selectedTransaction.rejection_reason);
                                    } else if (selectedCommission) {
                                        handleRejectCommission(selectedCommission.id, selectedCommission.rejection_reason);
                                    }
                                    setShowRejectModal(false);
                                    setSelectedTransaction(null);
                                    setSelectedCommission(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                                disabled={!(selectedTransaction?.rejection_reason || selectedCommission?.rejection_reason)}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Commission Adjustment Modal */}
            {showAdjustmentModal && selectedCommission && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Adjust Commission</h3>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                                Original Commission Amount
                            </label>
                            <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px', fontWeight: '600' }}>
                                {formatCurrency(selectedCommission.original_commission_amount || selectedCommission.commission_amount || 0)}
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600' }}>
                                New Commission Amount *
                            </label>
                            <input
                                type="number"
                                value={selectedCommission.adjustment_amount || ''}
                                onChange={(e) => setSelectedCommission({
                                    ...selectedCommission,
                                    adjustment_amount: parseFloat(e.target.value) || 0
                                })}
                                placeholder="Enter new commission amount"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600' }}>
                                Adjustment Reason *
                            </label>
                            <textarea
                                value={selectedCommission.adjustment_reason || ''}
                                onChange={(e) => setSelectedCommission({
                                    ...selectedCommission,
                                    adjustment_reason: e.target.value
                                })}
                                placeholder="Please provide a reason for this adjustment..."
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowAdjustmentModal(false);
                                    setSelectedCommission(null);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await api.post(`/admin/referral-commissions/${selectedCommission.id}/adjust`, {
                                            adjustment_amount: selectedCommission.adjustment_amount,
                                            adjustment_reason: selectedCommission.adjustment_reason
                                        });
                                        if (response.success) {
                                            setSuccess('Commission adjusted successfully');
                                            fetchReferralCommissions(commissionsPage);
                                            setShowAdjustmentModal(false);
                                            setSelectedCommission(null);
                                        }
                                    } catch (error) {
                                        setError(error.response?.data?.message || 'Failed to adjust commission');
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                                disabled={!selectedCommission.adjustment_amount || !selectedCommission.adjustment_reason}
                            >
                                Apply Adjustment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralManagement;