import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Bot, 
  Brain, 
  Settings, 
  Sliders, 
  MessageSquare, 
  Globe, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Volume2
} from 'lucide-react';
import type { AIConfig } from '../../../shared/types';

interface AIConfigData {
  model_provider: 'openai' | 'anthropic' | 'gemini';
  model_name: string;
  api_key?: string;
  temperature: number;
  max_tokens: number;
  system_prompt?: string;
  personality: 'professional' | 'friendly' | 'casual';
  language: string;
  voice_enabled: boolean;
  context_memory: boolean;
  response_speed: 'fast' | 'balanced' | 'detailed';
  custom_instructions?: string;
}

interface TestResponse {
  success: boolean;
  response: string;
  latency: number;
  tokens_used: number;
}

const DEFAULT_SYSTEM_PROMPTS = {
  professional: "You are Sara, a professional AI assistant for HabibiStay, a premium vacation rental platform. Provide helpful, accurate, and courteous assistance to guests and hosts. Focus on property bookings, travel recommendations, and platform guidance.",
  friendly: "Hi! I'm Sara, your friendly AI assistant at HabibiStay! I'm here to help you find the perfect vacation rental and make your travel experience amazing. I love helping people discover great places to stay and creating memorable experiences!",
  casual: "Hey there! I'm Sara, your AI buddy at HabibiStay. I'm here to help you find cool places to stay and book your next adventure. Just ask me anything about properties, bookings, or travel tips!"
};

const MODEL_OPTIONS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (Latest)', description: 'Most capable model with vision' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast and cost-effective' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'High performance' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and affordable' }
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: 'Latest and most capable' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', description: 'Most powerful' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', description: 'Fastest' }
  ],
  gemini: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Most advanced' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast and efficient' },
    { value: 'gemini-pro', label: 'Gemini Pro', description: 'Balanced performance' }
  ]
};

export default function AIConfigPanel() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfigData>({
    model_provider: 'openai',
    model_name: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1000,
    personality: 'friendly',
    language: 'en',
    voice_enabled: true,
    context_memory: true,
    response_speed: 'balanced'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResponse | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const response = await fetch('/api/admin/ai-config');
      const data = await response.json();
      
      if (data.success && data.data) {
        setConfig({
          ...config,
          ...data.data,
          voice_enabled: data.data.voice_enabled ?? true,
          context_memory: data.data.context_memory ?? true,
          response_speed: data.data.response_speed ?? 'balanced'
        });
      }
    } catch (error) {
      console.error('Error fetching AI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      const response = await fetch('/api/admin/ai-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          system_prompt: config.system_prompt || DEFAULT_SYSTEM_PROMPTS[config.personality]
        }),
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/chat/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Hello Sara! Can you tell me about HabibiStay and help me find a property?",
          test_config: config
        }),
      });
      
      const data = await response.json();
      const latency = Date.now() - startTime;
      
      if (data.success) {
        setTestResult({
          success: true,
          response: data.data.message,
          latency,
          tokens_used: data.data.tokens_used || 0
        });
      } else {
        setTestResult({
          success: false,
          response: data.error || 'Test failed',
          latency,
          tokens_used: 0
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        response: (error as Error).message,
        latency: Date.now() - startTime,
        tokens_used: 0
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePersonalityChange = (personality: 'professional' | 'friendly' | 'casual') => {
    setConfig({
      ...config,
      personality,
      system_prompt: DEFAULT_SYSTEM_PROMPTS[personality]
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#2957c3] rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sara AI Configuration</h1>
            <p className="text-gray-600">Configure and manage your AI assistant settings</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2 border border-[#2957c3] text-[#2957c3] rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 inline-flex items-center"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4 mr-2" />
            )}
            Test Configuration
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`flex items-center p-4 rounded-lg ${
          saveStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {saveStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {saveStatus === 'success' ? 'Configuration saved successfully!' : 'Failed to save configuration. Please try again.'}
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-gray-900">Test Result</h3>
            <div className="text-sm text-gray-600 space-x-4">
              <span>Latency: {testResult.latency}ms</span>
              {testResult.tokens_used > 0 && <span>Tokens: {testResult.tokens_used}</span>}
            </div>
          </div>
          <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.response}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Model Configuration */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 text-[#2957c3] mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Model Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <select
                  value={config.model_provider}
                  onChange={(e) => setConfig({
                    ...config,
                    model_provider: e.target.value as any,
                    model_name: MODEL_OPTIONS[e.target.value as keyof typeof MODEL_OPTIONS][0].value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={config.model_name}
                  onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                >
                  {MODEL_OPTIONS[config.model_provider].map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {MODEL_OPTIONS[config.model_provider].find(m => m.value === config.model_name)?.description}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.api_key || ''}
                onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                placeholder="Enter your API key..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use environment variables
              </p>
            </div>
          </div>

          {/* Response Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Sliders className="w-5 h-5 text-[#2957c3] mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Response Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {config.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={config.max_tokens}
                  onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Speed
                </label>
                <select
                  value={config.response_speed}
                  onChange={(e) => setConfig({ ...config, response_speed: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                >
                  <option value="fast">Fast (Quick responses)</option>
                  <option value="balanced">Balanced (Good quality)</option>
                  <option value="detailed">Detailed (Comprehensive answers)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personality & Language */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-[#2957c3] mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Personality & Language</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Personality Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['professional', 'friendly', 'casual'] as const).map((personality) => (
                    <button
                      key={personality}
                      onClick={() => handlePersonalityChange(personality)}
                      className={`p-3 text-center border rounded-lg transition-colors ${
                        config.personality === personality
                          ? 'border-[#2957c3] bg-blue-50 text-[#2957c3]'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium capitalize">{personality}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {personality === 'professional' && 'Formal and courteous'}
                        {personality === 'friendly' && 'Warm and helpful'}
                        {personality === 'casual' && 'Relaxed and conversational'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Language
                </label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-[#2957c3] mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">System Instructions</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom System Prompt
              </label>
              <textarea
                rows={6}
                value={config.system_prompt || DEFAULT_SYSTEM_PROMPTS[config.personality]}
                onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                placeholder="Enter custom instructions for Sara..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
              />
              <button
                onClick={() => setConfig({ 
                  ...config, 
                  system_prompt: DEFAULT_SYSTEM_PROMPTS[config.personality] 
                })}
                className="text-sm text-[#2957c3] hover:text-blue-700 mt-2"
              >
                Reset to default for {config.personality} personality
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          
          {/* Feature Toggles */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-[#2957c3] mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Features</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <Volume2 className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Voice Interface</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.voice_enabled}
                  onChange={(e) => setConfig({ ...config, voice_enabled: e.target.checked })}
                  className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Context Memory</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.context_memory}
                  onChange={(e) => setConfig({ ...config, context_memory: e.target.checked })}
                  className="rounded border-gray-300 text-[#2957c3] focus:ring-[#2957c3]"
                />
              </label>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-[#2957c3] mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily Conversations</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Response Time</span>
                <span className="font-medium">850ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">User Satisfaction</span>
                <span className="font-medium text-green-600">4.8/5</span>
              </div>
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Configuration Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Higher temperature = more creative responses</li>
              <li>• Lower temperature = more consistent responses</li>
              <li>• Test changes before saving to production</li>
              <li>• Monitor performance metrics regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}