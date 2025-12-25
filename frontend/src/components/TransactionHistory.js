import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';
import { apiService } from '../services/apiService';

const TransactionHistory = ({ account }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions filtered by wallet address
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getTransactions(account, 20);
        setTransactions(data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [account]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        {account && (
          <div className="wallet-filter">
            Filtering for: {formatAddress(account)}
          </div>
        )}
      </div>

      {/* Display transactions list */}
      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="no-transactions">No transactions found</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="transaction-header">
                <span className={`transaction-type ${tx.type.toLowerCase().replace(/\s+/g, '-')}`}>
                  {tx.type}
                </span>
                <span className={`transaction-status ${tx.status.toLowerCase()}`}>
                  {tx.status}
                </span>
              </div>
              <div className="transaction-details">
                <div className="transaction-addresses">
                  <p>
                    <strong>From:</strong> 
                    <span className="address">{formatAddress(tx.from)}</span>
                  </p>
                  <p>
                    <strong>To:</strong> 
                    <span className="address">{formatAddress(tx.to)}</span>
                  </p>
                </div>
                <p>
                  <strong>Amount:</strong> {tx.amount} {tx.currency}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(tx.timestamp)}
                </p>
                {tx.blockchainTxHash && (
                  <p className="blockchain-hash">
                    <strong>Blockchain TX:</strong> 
                    <span className="hash">{tx.blockchainTxHash}</span>
                  </p>
                )}
                {tx.description && (
                  <p className="transaction-description">{tx.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;


