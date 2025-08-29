import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Plus, 
  Settings, 
  Sync, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Globe,
  Home,
  Calendar,
  DollarSign,
  Users,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import type { ExternalChannel, ChannelSyncLog, ChannelMetrics } from '@/shared/channel-manager-types';

interface ChannelStats {
  total_channels: number;
  active_channels: number;
  total_synced_properties: number;
  sync_health_score: number;
  recent_errors: number;
}

const CHANNEL_ICONS = {
  airbnb: '🏠',
  booking_com: '🏨',
  expedia: '✈️',
  vrbo: '🏡',
  agoda: '🏢',
  hotels_com: '🏛️',
  custom: '🔗'
};

const SYNC_STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-100',
  in_progress: 'text-blue-600 bg-blue-100',
  success: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
  partial: 'text-orange-600 bg-orange-100'
};

export default function ChannelManagerDashboard() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ExternalChannel[]>([]);
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [syncLogs, setSyncLogs] = useState<ChannelSyncLog[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'sync-logs' | 'settings'>('overview');

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [channelsRes, statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/channels'),
        fetch('/api/admin/channels/stats'),
        fetch('/api/admin/channels/sync-logs?limit=20')
      ]);

      const [channelsData, statsData, logsData] = await Promise.all([
        channelsRes.json(),
        statsRes.json(),
        logsRes.json()
      ]);

      if (channelsData.success) setChannels(channelsData.data);
      if (statsData.success) setStats(statsData.data);
      if (logsData.success) setSyncLogs(logsData.data);
    } catch (error) {
      console.error('Error fetching channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (channelId: string, syncType: string = 'all') => {
    setSyncing(prev => ({ ...prev, [channelId]: true }));
    
    try {
      const response = await fetch('/api/admin/channels/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          sync_type: syncType,
          operation: 'bidirectional'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        alert(`Sync failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(prev => ({ ...prev, [channelId]: false }));
    }
  };

  const handleSyncAll = async () => {
    setSyncing(prev => ({ ...prev, all: true }));
    
    try {
      const response = await fetch('/api/admin/channels/sync-all', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        alert(`Bulk sync failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Bulk sync error:', error);
      alert('Bulk sync failed. Please try again.');
    } finally {
      setSyncing(prev => ({ ...prev, all: false }));
    }
  };

  const formatSyncTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Channel Manager</h1>
          <p className="text-gray-600">Manage integrations with external booking platforms</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSyncAll}
            disabled={syncing.all}
            className="flex items-center px-4 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {syncing.all ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sync className="w-4 h-4 mr-2" />
            )}
            Sync All
          </button>
          
          <button
            onClick={() => setShowAddChannel(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Channels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_channels}</p>
              </div>
              <Globe className="w-8 h-8 text-[#2957c3]" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Channels</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_channels}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Synced Properties</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_synced_properties}</p>
              </div>
              <Home className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sync Health</p>
                <p className="text-2xl font-bold text-green-600">{stats.sync_health_score}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Errors</p>
                <p className="text-2xl font-bold text-red-600">{stats.recent_errors}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'channels', label: 'Channels', icon: Globe },
            { id: 'sync-logs', label: 'Sync Logs', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#2957c3] text-[#2957c3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <div key={channel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {CHANNEL_ICONS[channel.type as keyof typeof CHANNEL_ICONS] || '🔗'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{channel.type.replace('_', '.')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      channel.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {channel.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Properties Synced:</span>
                    <span className="font-medium">
                      {Object.keys(channel.mapping_rules.property_mapping).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="font-medium">
                      {channel.sync_settings.last_sync_at 
                        ? formatSyncTime(channel.sync_settings.last_sync_at)
                        : 'Never'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Auto Sync:</span>
                    <span className="font-medium">
                      {channel.sync_settings.auto_sync_interval > 0 
                        ? `Every ${channel.sync_settings.auto_sync_interval}m`
                        : 'Disabled'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSync(channel.id)}
                    disabled={syncing[channel.id]}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-[#2957c3] text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {syncing[channel.id] ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sync className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sync-logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sync Activities</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncLogs.map((log) => {
                  const channel = channels.find(c => c.id === log.channel_id);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm">
                            {CHANNEL_ICONS[channel?.type as keyof typeof CHANNEL_ICONS] || '🔗'}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {channel?.name || 'Unknown Channel'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {log.sync_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          SYNC_STATUS_COLORS[log.status]
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.records_success}/{log.records_processed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatSyncTime(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-[#2957c3] hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Channel Modal would go here */}
      {showAddChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Channel</h3>
            <p className="text-gray-600 mb-4">Select a platform to integrate with HabibiStay:</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(CHANNEL_ICONS).map(([type, icon]) => (
                <button
                  key={type}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl mr-3">{icon}</span>
                  <span className="capitalize">{type.replace('_', '.')}</span>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddChannel(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddChannel(false)}
                className="flex-1 px-4 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}