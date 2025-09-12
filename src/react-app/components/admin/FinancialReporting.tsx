import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Home,
  Users,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { LoadingState, NetworkError, Skeleton } from '../LoadingStates';
import { apiRequest, useApiErrorHandler } from '../../utils/errorHandling';

interface FinancialMetrics {
  total_revenue: number;
  revenue_growth: number;
  total_bookings: number;
  bookings_growth: number;
  average_booking_value: number;
  avg_booking_growth: number;
  occupancy_rate: number;
  occupancy_growth: number;
  commission_earned: number;
  commission_growth: number;
  outstanding_payments: number;
  refunds_issued: number;
  period: {
    start_date: string;
    end_date: string;
    comparison_start: string;
    comparison_end: string;
  };
}

interface RevenueBreakdown {
  by_property: Array<{
    property_id: number;
    property_name: string;
    revenue: number;
    bookings: number;
    avg_rate: number;
    growth: number;
  }>;
  by_month: Array<{
    month: string;
    revenue: number;
    bookings: number;
    commission: number;
  }>;
  by_channel: Array<{
    channel: string;
    revenue: number;
    percentage: number;
    commission: number;
  }>;
  by_payment_method: Array<{
    method: string;
    amount: number;
    percentage: number;
    transactions: number;
  }>;
}

interface FinancialReport {
  id: number;
  report_type: 'revenue' | 'commission' | 'tax' | 'expense' | 'profit_loss';
  period_start: string;
  period_end: string;
  generated_by: string;
  generated_at: string;
  status: 'generating' | 'completed' | 'failed';
  file_url?: string;
  summary: {
    total_revenue: number;
    total_commission: number;
    total_transactions: number;
    currency: string;
  };
}

const REPORT_TYPES = [
  { value: 'revenue', label: 'Revenue Report', icon: DollarSign },
  { value: 'commission', label: 'Commission Report', icon: TrendingUp },
  { value: 'tax', label: 'Tax Report', icon: FileText },
  { value: 'expense', label: 'Expense Report', icon: CreditCard },
  { value: 'profit_loss', label: 'P&L Statement', icon: BarChart3 }
];

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

export default function FinancialReporting() {
  const { user } = useAuth();
  const { handleApiError } = useApiErrorHandler();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [breakdown, setBreakdown] = useState<RevenueBreakdown | null>(null);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'reports'>('overview');
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod, customDateRange]);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedPeriod === 'custom' && customDateRange.start && customDateRange.end && {
          start_date: customDateRange.start,
          end_date: customDateRange.end
        })
      });

      const [metricsData, breakdownData, reportsData] = await Promise.all([
        apiRequest(`/api/admin/financial/metrics?${params}`),
        apiRequest(`/api/admin/financial/breakdown?${params}`),
        apiRequest('/api/admin/financial/reports')
      ]);

      if (metricsData.success) setMetrics(metricsData.data);
      if (breakdownData.success) setBreakdown(breakdownData.data);
      if (reportsData.success) setReports(reportsData.data);
    } catch (error) {
      handleApiError(error, 'fetchFinancialData');
      setError('Failed to load financial data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    setGeneratingReport(true);
    try {
      const data = await apiRequest('/api/admin/financial/generate-report', {
        method: 'POST',
        body: JSON.stringify({
          report_type: reportType,
          period: selectedPeriod,
          ...(selectedPeriod === 'custom' && {
            start_date: customDateRange.start,
            end_date: customDateRange.end
          })
        })
      });

      if (data.success) {
        await fetchFinancialData();
        setShowGenerateReport(false);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      handleApiError(error, 'generateReport');
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton variant="text" width="300px" height={32} />
            <Skeleton variant="text" width="400px" height={16} className="mt-2" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton variant="rectangular" width={160} height={40} />
            <Skeleton variant="rectangular" width={150} height={40} />
            <Skeleton variant="rectangular" width={40} height={40} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-3">
              <Skeleton variant="text" width="120px" height={16} />
              <Skeleton variant="text" width="140px" height={32} />
              <Skeleton variant="text" width="80px" height={16} />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rectangular" className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <NetworkError onRetry={fetchFinancialData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reporting</h1>
          <p className="text-gray-600">Comprehensive financial analytics and reporting</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
          >
            {PERIOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
              />
            </div>
          )}
          
          <button
            onClick={() => setShowGenerateReport(true)}
            className="flex items-center px-4 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </button>
          
          <button
            onClick={fetchFinancialData}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.total_revenue)}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(metrics.revenue_growth), {
                    className: `w-4 h-4 ${getGrowthColor(metrics.revenue_growth)}`
                  })}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(metrics.revenue_growth)}`}>
                    {formatPercentage(metrics.revenue_growth)}
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_bookings.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(metrics.bookings_growth), {
                    className: `w-4 h-4 ${getGrowthColor(metrics.bookings_growth)}`
                  })}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(metrics.bookings_growth)}`}>
                    {formatPercentage(metrics.bookings_growth)}
                  </span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.average_booking_value)}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(metrics.avg_booking_growth), {
                    className: `w-4 h-4 ${getGrowthColor(metrics.avg_booking_growth)}`
                  })}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(metrics.avg_booking_growth)}`}>
                    {formatPercentage(metrics.avg_booking_growth)}
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.commission_earned)}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(metrics.commission_growth), {
                    className: `w-4 h-4 ${getGrowthColor(metrics.commission_growth)}`
                  })}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(metrics.commission_growth)}`}>
                    {formatPercentage(metrics.commission_growth)}
                  </span>
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.occupancy_rate.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(metrics.occupancy_growth), {
                    className: `w-4 h-4 ${getGrowthColor(metrics.occupancy_growth)}`
                  })}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(metrics.occupancy_growth)}`}>
                    {formatPercentage(metrics.occupancy_growth)}
                  </span>
                </div>
              </div>
              <Home className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Payments</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.outstanding_payments)}</p>
                <p className="text-sm text-gray-500 mt-2">Pending collection</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refunds Issued</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.refunds_issued)}</p>
                <p className="text-sm text-gray-500 mt-2">This period</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'breakdown', label: 'Revenue Breakdown', icon: PieChart },
            { id: 'reports', label: 'Generated Reports', icon: FileText }
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
      {activeTab === 'breakdown' && breakdown && (
        <div className="space-y-6">
          {/* Revenue by Property */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Property</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {breakdown.by_property.map((property) => (
                    <tr key={property.property_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {property.property_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(property.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(property.avg_rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getGrowthColor(property.growth)}`}>
                          {formatPercentage(property.growth)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue by Channel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Channel</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {breakdown.by_channel.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-[#2957c3]" style={{
                        backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)`
                      }}></div>
                      <span className="font-medium text-gray-900">{channel.channel}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(channel.revenue)}</div>
                      <div className="text-sm text-gray-500">{channel.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {report.report_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(report.summary.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'completed' ? 'bg-green-100 text-green-800' :
                        report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.generated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {report.file_url && (
                          <button className="text-[#2957c3] hover:text-blue-700">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
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

      {/* Generate Report Modal */}
      {showGenerateReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate Financial Report</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="space-y-2">
                  {REPORT_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => generateReport(type.value)}
                      disabled={generatingReport}
                      className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <type.icon className="w-5 h-5 mr-3 text-[#2957c3]" />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowGenerateReport(false)}
                disabled={generatingReport}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            
            {generatingReport && (
              <div className="mt-4 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin text-[#2957c3] mr-2" />
                <span className="text-sm text-gray-600">Generating report...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}