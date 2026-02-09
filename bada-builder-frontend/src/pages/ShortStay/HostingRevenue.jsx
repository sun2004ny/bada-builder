import React, { useState, useEffect } from 'react';

import { shortStayAPI } from '../../services/shortStayApi';
import './HostingRevenue.css';
import ShortStayLoader from '../../components/ShortStay/ShortStayLoader';

const HostingRevenue = () => {
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [summaryData, charDataRes, propsData] = await Promise.all([
                shortStayAPI.getRevenueSummary(),
                shortStayAPI.getRevenueChart(),
                shortStayAPI.getPropertyPerformance()
            ]);

            setSummary(summaryData);
            setChartData(charDataRes.chartData || []);
            setProperties(propsData.properties || []);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ShortStayLoader />;
    }

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', border: '1px solid #ddd', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{label}</p>
                    <p style={{ color: '#FF385C' }}>₹{Number(payload[0].value).toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    // Helper to calculate max value for scaling
    const maxRevenue = Math.max(...chartData.map(d => Number(d.revenue)), 1);

    return (
        <div 
            className="hosting-revenue-container"
            style={{ animation: 'fadeIn 0.4s ease-out' }}
        >
            <div className="revenue-header">
                <h1>Revenue</h1>
                <p className="revenue-subtitle">Track your earnings and property performance</p>
            </div>

            {/* Summary Cards */}
            <div className="revenue-summary-grid">
                <div className="revenue-card">
                    <span className="card-label">Total Revenue (All Time)</span>
                    <span className="card-value">₹{Number(summary?.totalRevenue || 0).toLocaleString()}</span>
                    <span className="card-subtext">{summary?.totalBookings || 0} Total Bookings</span>
                </div>
                <div className="revenue-card">
                    <span className="card-label">This Month (30 Days)</span>
                    <span className="card-value">₹{Number(summary?.revenue30Days || 0).toLocaleString()}</span>
                </div>
                 <div className="revenue-card">
                    <span className="card-label">Year to Date</span>
                    <span className="card-value">₹{Number(summary?.revenueYTD || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Chart Section (CSS Only) */}
            <div className="charts-section">
                <div className="charts-header">
                    <h3>Monthly Earnings</h3>
                </div>
                <div className="chart-container custom-css-chart">
                    <div className="chart-bars-area">
                        {chartData.map((item, index) => {
                            const heightPercentage = Math.round((Number(item.revenue) / maxRevenue) * 100);
                            return (
                                <div key={index} className="chart-bar-group">
                                    <div 
                                        className="chart-bar" 
                                        style={{ height: `${heightPercentage}%` }}
                                        title={`${item.month}: ₹${Number(item.revenue).toLocaleString()}`}
                                    >
                                        <div className="chart-tooltip">
                                            ₹{Number(item.revenue).toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="chart-label">{item.month}</span>
                                </div>
                            );
                        })}
                        {chartData.length === 0 && (
                             <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#717171'}}>
                                No data available
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Property Performance */}
            <div className="property-performance-section">
                <div className="section-header">
                    <h3>Property Performance</h3>
                </div>
                <div className="performance-table-container">
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Bookings</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map(prop => (
                                <tr key={prop.id}>
                                    <td>
                                        <div className="prop-cell">
                                            {prop.images && prop.images[0] ? (
                                                <img src={prop.images[0]} alt="" className="prop-thumb" />
                                            ) : (
                                                <div className="prop-thumb" />
                                            )}
                                            <span className="prop-name">{prop.title}</span>
                                        </div>
                                    </td>
                                    <td>{prop.total_bookings}</td>
                                    <td>₹{Number(prop.total_revenue).toLocaleString()}</td>
                                </tr>
                            ))}
                            {properties.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                                        No property performance data yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default HostingRevenue;
