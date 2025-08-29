import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import {
  TrendingUp,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  Brain,
  BarChart3,
  CheckCircle,
  X
} from 'lucide-react';

interface PricingRule {
  id: number;
  property_id: number;
  rule_type: string;
  rule_name: string;
  is_active: boolean;
  priority: number;
  adjustment: {
    type: 'percentage' | 'fixed_amount' | 'set_price';
    value: number;
    min_price?: number;
    max_price?: number;
  };
}

interface PropertyPricingSettings {
  property_id: number;
  base_price: number;
  currency: string;
  minimum_price: number;
  maximum_price: number;
  auto_pricing_enabled: boolean;
  update_frequency: 'daily' | 'weekly' | 'manual';
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
}

interface Property {
  id: number;
  title: string;
  location: string;
  base_price: number;
}

export default function DynamicPricingDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [settings, setSettings] = useState<PropertyPricingSettings | null>(null);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'rules'>('overview');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchPropertyData();
    }
  }, [selectedProperty]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/admin/properties');
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
        if (data.data.length > 0 && !selectedProperty) {
          setSelectedProperty(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyData = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const [settingsRes, rulesRes] = await Promise.all([
        fetch(`/api/admin/pricing/settings/${selectedProperty}`),
        fetch(`/api/admin/pricing/rules/${selectedProperty}`)
      ]);

      const [settingsData, rulesData] = await Promise.all([
        settingsRes.json(),
        rulesRes.json()
      ]);

      if (settingsData.success) setSettings(settingsData.data);
      if (rulesData.success) setRules(rulesData.data);
    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !selectedProperty) return;

    setSavingSettings(true);
    try {
      const response = await fetch(`/api/admin/pricing/settings/${selectedProperty}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const deleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/admin/pricing/rules/${ruleId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchPropertyData();
      } else {
        alert('Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Pricing</h1>
          <p className="text-gray-600">Optimize your property pricing with intelligent automation</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedProperty || ''}
            onChange={(e) => setSelectedProperty(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
          >
            <option value="">Select Property</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      {selectedProperty && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Base Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {settings ? formatCurrency(settings.base_price) : '--'}
                </p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rules.filter(r => r.is_active).length}
                </p>
                <p className="text-sm text-gray-500">pricing rules</p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto Pricing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {settings?.auto_pricing_enabled ? 'ON' : 'OFF'}
                </p>
                <div className="flex items-center mt-2">
                  {settings?.auto_pricing_enabled ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ml-1 ${
                    settings?.auto_pricing_enabled ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {settings?.auto_pricing_enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Price Range</p>
                <p className="text-lg font-bold text-gray-900">
                  {settings ? `${formatCurrency(settings.minimum_price)} - ${formatCurrency(settings.maximum_price)}` : '--'}
                </p>
                <p className="text-sm text-gray-500">min - max</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'settings', label: 'Pricing Settings', icon: Settings },
            { id: 'rules', label: 'Pricing Rules', icon: Brain }
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

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pricing Settings</h3>
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="flex items-center px-4 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (SAR)
                </label>
                <input
                  type="number"
                  value={settings.base_price}
                  onChange={(e) => setSettings({
                    ...settings,
                    base_price: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price (SAR)
                </label>
                <input
                  type="number"
                  value={settings.minimum_price}
                  onChange={(e) => setSettings({
                    ...settings,
                    minimum_price: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price (SAR)
                </label>
                <input
                  type="number"
                  value={settings.maximum_price}
                  onChange={(e) => setSettings({
                    ...settings,
                    maximum_price: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>
            </div>

            {/* Auto Pricing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Automatic Pricing</h4>
                  <p className="text-sm text-gray-600">Let AI optimize your prices automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_pricing_enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      auto_pricing_enabled: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                </label>
              </div>

              {settings.auto_pricing_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Frequency
                    </label>
                    <select
                      value={settings.update_frequency}
                      onChange={(e) => setSettings({
                        ...settings,
                        update_frequency: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aggressiveness
                    </label>
                    <select
                      value={settings.aggressiveness}
                      onChange={(e) => setSettings({
                        ...settings,
                        aggressiveness: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pricing Rules</h3>
            <button
              onClick={() => alert('Rule creation modal would open here')}
              className="flex items-center px-4 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rule.rule_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rule.rule_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.adjustment.type === 'percentage' ? (
                        `${rule.adjustment.value}%`
                      ) : rule.adjustment.type === 'fixed_amount' ? (
                        `+${formatCurrency(rule.adjustment.value)}`
                      ) : (
                        formatCurrency(rule.adjustment.value)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => alert('Edit modal would open here')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}