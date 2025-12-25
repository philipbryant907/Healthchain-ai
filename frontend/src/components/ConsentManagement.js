import React, { useState, useEffect } from 'react';
import './ConsentManagement.css';
import { apiService } from '../services/apiService';
import { useWeb3 } from '../hooks/useWeb3';

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    purpose: '',
  });

  // Fetch consents with optional status filter
  useEffect(() => {
    const fetchConsents = async () => {
      setLoading(true);
      setError(null);
      try {
        const status = filterStatus === 'all' ? null : filterStatus;
        const data = await apiService.getConsents(null, status);
        setConsents(data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch consents');
      } finally {
        setLoading(false);
      }
    };

    fetchConsents();
  }, [filterStatus]);

  // Create new consent with Web3 signature
  const handleCreateConsent = async (e) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Create message to sign
      const message = `I consent to: ${formData.purpose} for patient: ${formData.patientId}`;
      
      // Sign message using MetaMask
      const signature = await signMessage(message);
      
      // Create consent via API
      await apiService.createConsent({
        patientId: formData.patientId,
        purpose: formData.purpose,
        walletAddress: account,
        signature: signature
      });
      
      // Reset form and refresh consents
      setFormData({ patientId: '', purpose: '' });
      setShowCreateForm(false);
      
      // Refresh consents list
      const status = filterStatus === 'all' ? null : filterStatus;
      const data = await apiService.getConsents(null, status);
      setConsents(data || []);
      
      alert('Consent created successfully!');
    } catch (err) {
      alert('Failed to create consent: ' + err.message);
    }
  };

  // Update consent status (e.g., pending to active)
  const handleUpdateStatus = async (consentId, newStatus) => {
    try {
      await apiService.updateConsent(consentId, {
        status: newStatus,
        blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
      });
      
      // Refresh consents list
      const status = filterStatus === 'all' ? null : filterStatus;
      const data = await apiService.getConsents(null, status);
      setConsents(data || []);
      
      alert('Consent status updated successfully!');
    } catch (err) {
      alert('Failed to update consent: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">Loading consents...</div>
      </div>
    );
  }

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <button
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!account}
        >
          {showCreateForm ? 'Cancel' : 'Create New Consent'}
        </button>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}

      {showCreateForm && account && (
        <div className="create-consent-form">
          <h3>Create New Consent</h3>
          <form onSubmit={handleCreateConsent}>
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                placeholder="e.g., patient-001"
              />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              >
                <option value="">Select purpose...</option>
                <option value="Research Study Participation">Research Study Participation</option>
                <option value="Data Sharing with Research Institution">Data Sharing with Research Institution</option>
                <option value="Third-Party Analytics Access">Third-Party Analytics Access</option>
                <option value="Insurance Provider Access">Insurance Provider Access</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Sign & Create Consent
            </button>
          </form>
        </div>
      )}

      <div className="consent-filters">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={filterStatus === 'active' ? 'active' : ''}
          onClick={() => setFilterStatus('active')}
        >
          Active
        </button>
        <button
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
      </div>

      {/* Display consents list */}
      <div className="consents-list">
        {error && <div className="error">Error: {error}</div>}
        {consents.length === 0 ? (
          <div className="no-consents">No consents found</div>
        ) : (
          consents.map((consent) => (
            <div key={consent.id} className="consent-card">
              <div className="consent-header">
                <h3>{consent.purpose}</h3>
                <span className={`consent-status ${consent.status}`}>
                  {consent.status}
                </span>
              </div>
              <div className="consent-details">
                <p><strong>Patient ID:</strong> {consent.patientId}</p>
                <p><strong>Wallet Address:</strong> {consent.walletAddress}</p>
                <p><strong>Created:</strong> {new Date(consent.createdAt).toLocaleString()}</p>
                {consent.blockchainTxHash && (
                  <p className="blockchain-hash">
                    <strong>Blockchain TX:</strong> 
                    <span className="hash">{consent.blockchainTxHash}</span>
                  </p>
                )}
              </div>
              {consent.status === 'pending' && account && (
                <div className="consent-actions">
                  <button
                    onClick={() => handleUpdateStatus(consent.id, 'active')}
                    className="activate-btn"
                  >
                    Activate Consent
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;


