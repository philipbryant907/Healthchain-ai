import React, { useState, useEffect } from 'react';
import './StatsDashboard.css';
import { apiService } from '../services/apiService';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-dashboard-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-dashboard-container">
        <div className="error">Error loading statistics: {error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className="stats-dashboard-container">
      <h2>Platform Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card patients">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Patients</h3>
            <p className="stat-value">{stats.totalPatients}</p>
          </div>
        </div>

        <div className="stat-card records">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Records</h3>
            <p className="stat-value">{stats.totalRecords}</p>
          </div>
        </div>

        <div className="stat-card consents">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Consents</h3>
            <p className="stat-value">{stats.totalConsents}</p>
          </div>
        </div>

        <div className="stat-card active-consents">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Consents</h3>
            <p className="stat-value">{stats.activeConsents}</p>
          </div>
        </div>

        <div className="stat-card pending-consents">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Consents</h3>
            <p className="stat-value">{stats.pendingConsents}</p>
          </div>
        </div>

        <div className="stat-card transactions">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Transactions</h3>
            <p className="stat-value">{stats.totalTransactions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;


