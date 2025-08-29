// Security Audit Dashboard for HabibiStay Admin Panel

import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Lock, 
  Eye, 
  Download,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SecurityMetrics {
  totalEvents: number;
  criticalAlerts: number;
  blockedIPs: number;
  failedLogins: number;
  activeUsers: number;
  suspiciousActivity: number;
  dataBreachAttempts: number;
  systemUptime: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  event: string;
  userId?: string;
  userEmail?: string;
  ip: string;
  userAgent?: string;
  location?: string;
  details: Record<string, any>;
  resolved: boolean;
}

interface ThreatAnalysis {
  ipAddress: string;
  threatScore: number;
  country: string;
  attempts: number;
  lastAttempt: string;
  blocked: boolean;
  reason: string;
}

export default function SecurityAuditDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalAlerts: 0,
    blockedIPs: 0,
    failedLogins: 0,
    activeUsers: 0,
    suspiciousActivity: 0,
    dataBreachAttempts: 0,
    systemUptime: 99.9
  });

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [threats, setThreats] = useState<ThreatAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [eventFilter, setEventFilter] = useState('all');

  useEffect(() => {
    loadSecurityData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, eventFilter]);

  const loadSecurityData = async () => {
    try {
      const [metricsRes, eventsRes, threatsRes] = await Promise.all([
        fetch(`/api/admin/security/metrics?timeRange=${timeRange}`),
        fetch(`/api/admin/security/events?timeRange=${timeRange}&filter=${eventFilter}&limit=100`),
        fetch(`/api/admin/security/threats?limit=50`)
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.data);
      }

      if (threatsRes.ok) {
        const threatsData = await threatsRes.json();
        setThreats(threatsData.data);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportSecurityReport = async () => {
    try {
      const response = await fetch(`/api/admin/security/export?timeRange=${timeRange}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const blockIP = async (ip: string) => {
    try {
      const response = await fetch('/api/admin/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason: 'Manual block by admin' })
      });

      if (response.ok) {
        loadSecurityData();
        alert(`IP ${ip} has been blocked successfully.`);
      }
    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  };

  const resolveEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/security/events/${eventId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, resolved: true } : event
        ));
      }
    } catch (error) {
      console.error('Failed to resolve event:', error);
    }
  };

  const getEventIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getEventBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getThreatScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2957c3]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <Shield className="w-8 h-8 text-[#2957c3]" />
            <span>Security Audit Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">Monitor system security and threats in real-time</p>
        </div>

        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3]"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <button
            onClick={exportSecurityReport}
            className="flex items-center space-x-2 px-4 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">+15% from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.blockedIPs}</p>
            </div>
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-orange-600">+8% from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Logins</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics.failedLogins}</p>
            </div>
            <Users className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">-5% from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-green-600">{metrics.systemUptime}%</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">Excellent</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Events */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Security Events</h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Events</option>
                  <option value="critical">Critical Only</option>
                  <option value="error">Errors Only</option>
                  <option value="warning">Warnings Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {events.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {events.map(event => (
                  <div key={event.id} className={`p-4 ${event.resolved ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-start space-x-3">
                      {getEventIcon(event.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(event.level)}`}>
                            {event.level.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                          {event.resolved && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              RESOLVED
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mt-1">{event.event}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{event.ip}</span>
                          </span>
                          {event.userEmail && (
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{event.userEmail}</span>
                            </span>
                          )}
                          {event.location && (
                            <span>{event.location}</span>
                          )}
                        </div>
                        {!event.resolved && event.level !== 'info' && (
                          <button
                            onClick={() => resolveEvent(event.id)}
                            className="mt-2 text-xs text-[#2957c3] hover:text-blue-700 font-medium"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No security events in the selected time range</p>
              </div>
            )}
          </div>
        </div>

        {/* Threat Analysis */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Threat Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">Top suspicious IP addresses</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {threats.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {threats.map((threat, index) => (
                  <div key={`${threat.ipAddress}-${index}`} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium">{threat.ipAddress}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatScoreColor(threat.threatScore)}`}>
                        {threat.threatScore}/100
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Country:</span>
                        <span>{threat.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attempts:</span>
                        <span>{threat.attempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Attempt:</span>
                        <span>{new Date(threat.lastAttempt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={threat.blocked ? 'text-red-600' : 'text-yellow-600'}>
                          {threat.blocked ? 'BLOCKED' : 'MONITORING'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">{threat.reason}</p>
                    
                    {!threat.blocked && threat.threatScore >= 60 && (
                      <button
                        onClick={() => blockIP(threat.ipAddress)}
                        className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Block IP
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No threats detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}