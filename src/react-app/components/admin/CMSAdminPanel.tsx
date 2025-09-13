import { useState, useEffect } from 'react';
import { useCMS } from '../../contexts/CMSContext';
import { 
  FileText, 
  Layout, 
  Puzzle, 
  Image, 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Save,
  X,
  Move,
  Sparkles,
  Play,
  Users,
  Shield,
  RefreshCw
} from 'lucide-react';
import TemplateEditor from '../../components/cms/TemplateEditor';
import VisualEditor from '../../components/cms/VisualEditor';
import AIContentCreator from '../../components/cms/AIContentCreator';

export default function CMSAdminPanel() {
  const {
    pages,
    templates,
    components,
    media,
    aiProviders,
    aiJobs,
    loading,
    error,
    createPage,
    updatePage,
    deletePage,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createComponent,
    updateComponent,
    deleteComponent,
    uploadMedia,
    deleteMedia,
    createAIProvider,
    updateAIProvider,
    deleteAIProvider,
    createAIJob,
    processAIJobs
  } = useCMS();
  
  const [activeTab, setActiveTab] = useState<'pages' | 'templates' | 'components' | 'media' | 'ai' | 'permissions'>('pages');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [showVisualEditor, setShowVisualEditor] = useState(false);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [showAIContentCreator, setShowAIContentCreator] = useState(false);
  const [permissions, setPermissions] = useState<{name: string, description: string}[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const [usersWithPermission, setUsersWithPermission] = useState<any[]>([]);

  // Form states
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    template_id: null as number | null,
    content: '',
    metadata: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    content_structure: '',
    preview_image: '',
    is_default: false
  });

  const [componentForm, setComponentForm] = useState({
    type: '',
    name: '',
    properties: '',
    styles: ''
  });

  const [mediaForm, setMediaForm] = useState({
    filename: '',
    original_name: '',
    mime_type: '',
    size: 0,
    url: '',
    alt_text: '',
    caption: ''
  });

  const [aiProviderForm, setAIProviderForm] = useState({
    name: '',
    api_key: '',
    api_url: '',
    enabled: true,
    default_model: ''
  });

  // Handle form submissions
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPage(pageForm);
    setShowCreateForm(false);
    setPageForm({
      title: '',
      slug: '',
      template_id: null,
      content: '',
      metadata: '',
      status: 'draft'
    });
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTemplate(templateForm);
    setShowCreateForm(false);
    setTemplateForm({
      name: '',
      description: '',
      content_structure: '',
      preview_image: '',
      is_default: false
    });
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    await createComponent(componentForm);
    setShowCreateForm(false);
    setComponentForm({
      type: '',
      name: '',
      properties: '',
      styles: ''
    });
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    await uploadMedia(mediaForm);
    setShowCreateForm(false);
    setMediaForm({
      filename: '',
      original_name: '',
      mime_type: '',
      size: 0,
      url: '',
      alt_text: '',
      caption: ''
    });
  };

  const handleCreateAIProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAIProvider(aiProviderForm);
    setShowCreateForm(false);
    setAIProviderForm({
      name: '',
      api_key: '',
      api_url: '',
      enabled: true,
      default_model: ''
    });
  };

  // Reset forms when changing tabs
  const handleTabChange = (tab: 'pages' | 'templates' | 'components' | 'media' | 'ai' | 'permissions') => {
    setActiveTab(tab);
    setShowCreateForm(false);
    setEditingItem(null);
  };

  // Fetch permissions when permissions tab is active
  useEffect(() => {
    if (activeTab === 'permissions') {
      const fetchPermissions = async () => {
        const allPermissions = await getAllPermissions();
        const userPerms = await getUserPermissions();
        setPermissions(allPermissions);
        setUserPermissions(userPerms);
      };
      fetchPermissions();
    }
  }, [activeTab]);

  // Tabs configuration
  const tabs = [
    { key: 'pages', label: 'Pages', icon: FileText },
    { key: 'templates', label: 'Templates', icon: Layout },
    { key: 'components', label: 'Components', icon: Puzzle },
    { key: 'media', label: 'Media', icon: Image },
    { key: 'ai', label: 'AI', icon: Bot },
    { key: 'permissions', label: 'Permissions', icon: Shield },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Management System</h2>
        <p className="text-gray-600">Manage your website content, templates, and AI integrations</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-[#2957c3] text-[#2957c3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2957c3]"></div>
        </div>
      )}

      {/* Create button */}
      {!showCreateForm && !editingItem && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#2957c3] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create {activeTab.slice(0, -1)}
          </button>
        </div>
      )}

      {/* Create/Edit Forms */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Create New {activeTab.slice(0, -1)}
            </h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Page Form */}
          {activeTab === 'pages' && (
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({...pageForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={pageForm.slug}
                  onChange={(e) => setPageForm({...pageForm, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={pageForm.status}
                  onChange={(e) => setPageForm({...pageForm, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-[#2957c3] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Page
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Template Form */}
          {activeTab === 'templates' && (
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-[#2957c3] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Component Form */}
          {activeTab === 'components' && (
            <form onSubmit={handleCreateComponent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={componentForm.type}
                  onChange={(e) => setComponentForm({...componentForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={componentForm.name}
                  onChange={(e) => setComponentForm({...componentForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-[#2957c3] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Component
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Media Form */}
          {activeTab === 'media' && (
            <form onSubmit={handleUploadMedia} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm({...mediaForm, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  value={mediaForm.filename}
                  onChange={(e) => setMediaForm({...mediaForm, filename: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-[#2957c3] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Upload Media
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* AI Provider Form */}
          {activeTab === 'ai' && (
            <form onSubmit={handleCreateAIProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={aiProviderForm.name}
                  onChange={(e) => setAIProviderForm({...aiProviderForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API URL
                </label>
                <input
                  type="text"
                  value={aiProviderForm.api_url}
                  onChange={(e) => setAIProviderForm({...aiProviderForm, api_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={aiProviderForm.enabled}
                  onChange={(e) => setAIProviderForm({...aiProviderForm, enabled: e.target.checked})}
                  className="h-4 w-4 text-[#2957c3] focus:ring-[#2957c3] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enabled
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-[#2957c3] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Provider
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && !showCreateForm && !editingItem && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{page.title}</td>
                  <td className="py-3 px-4 text-gray-600">{page.slug}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      page.status === 'published' ? 'bg-green-100 text-green-800' :
                      page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(page);
                          setPageForm({
                            title: page.title,
                            slug: page.slug,
                            template_id: page.template_id,
                            content: page.content || '',
                            metadata: page.metadata || '',
                            status: page.status
                          });
                          setShowCreateForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPageId(page.id);
                          setShowVisualEditor(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="text-red-600 hover:text-red-800"
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
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && !showCreateForm && !editingItem && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Default</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{template.name}</td>
                  <td className="py-3 px-4 text-gray-600">{template.description || '-'}</td>
                  <td className="py-3 px-4">
                    {template.is_default ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Default
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(template);
                          setTemplateForm({
                            name: template.name,
                            description: template.description || '',
                            content_structure: template.content_structure || '',
                            preview_image: template.preview_image || '',
                            is_default: template.is_default
                          });
                          setShowCreateForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTemplateId(template.id);
                          setShowTemplateEditor(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800"
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
      )}

      {/* Components Tab */}
      {activeTab === 'components' && !showCreateForm && !editingItem && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => (
                <tr key={component.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{component.name}</td>
                  <td className="py-3 px-4 text-gray-600">{component.type}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(component);
                          setComponentForm({
                            type: component.type,
                            name: component.name,
                            properties: component.properties || '',
                            styles: component.styles || ''
                          });
                          setShowCreateForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteComponent(component.id)}
                        className="text-red-600 hover:text-red-800"
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
      )}

      {/* Media Tab */}
      {activeTab === 'media' && !showCreateForm && !editingItem && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Filename</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {media.map((mediaItem) => (
                <tr key={mediaItem.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{mediaItem.filename}</td>
                  <td className="py-3 px-4 text-gray-600">{mediaItem.mime_type}</td>
                  <td className="py-3 px-4 text-gray-600">{mediaItem.size} bytes</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(mediaItem.url, '_blank')}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMedia(mediaItem.id)}
                        className="text-red-600 hover:text-red-800"
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
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && !showCreateForm && !editingItem && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">AI Providers</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAIContentCreator(true)}
                  className="flex items-center px-3 py-2 bg-[#2957c3] text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </button>
                <button
                  onClick={processAIJobs}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Process Jobs
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">API URL</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aiProviders.map((provider) => (
                    <tr key={provider.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{provider.name}</td>
                      <td className="py-3 px-4 text-gray-600">{provider.api_url}</td>
                      <td className="py-3 px-4">
                        {provider.enabled ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(provider);
                              setAIProviderForm({
                                name: provider.name,
                                api_key: provider.api_key || '',
                                api_url: provider.api_url || '',
                                enabled: provider.enabled,
                                default_model: provider.default_model || ''
                              });
                              setShowCreateForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => refreshAIModels(provider.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Refresh models"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAIProvider(provider.id)}
                            className="text-red-600 hover:text-red-800"
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

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Content Jobs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Prompt</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {aiJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {job.prompt.substring(0, 50)}...
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          job.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grant Permissions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grant Permissions</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permission
                  </label>
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  >
                    <option value="">Select a permission</option>
                    {permissions.map((perm) => (
                      <option key={perm.name} value={perm.name}>
                        {perm.name} - {perm.description}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={async () => {
                    if (selectedUser && selectedPermission) {
                      try {
                        await grantPermission(selectedUser, selectedPermission);
                        // Refresh user permissions
                        const userPerms = await getUserPermissions();
                        setUserPermissions(userPerms);
                        // Clear selection
                        setSelectedUser('');
                        setSelectedPermission('');
                      } catch (err) {
                        console.error('Failed to grant permission:', err);
                      }
                    }
                  }}
                  className="bg-[#2957c3] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  disabled={!selectedUser || !selectedPermission}
                >
                  Grant Permission
                </button>
              </div>
            </div>

            {/* Revoke Permissions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revoke Permissions</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permission
                  </label>
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  >
                    <option value="">Select a permission</option>
                    {permissions.map((perm) => (
                      <option key={perm.name} value={perm.name}>
                        {perm.name} - {perm.description}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={async () => {
                    if (selectedUser && selectedPermission) {
                      try {
                        await revokePermission(selectedUser, selectedPermission);
                        // Refresh user permissions
                        const userPerms = await getUserPermissions();
                        setUserPermissions(userPerms);
                        // Clear selection
                        setSelectedUser('');
                        setSelectedPermission('');
                      } catch (err) {
                        console.error('Failed to revoke permission:', err);
                      }
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
                  disabled={!selectedUser || !selectedPermission}
                >
                  Revoke Permission
                </button>
              </div>
            </div>
          </div>

          {/* Current User Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Your Permissions</h3>
              <button
                onClick={async () => {
                  const userPerms = await getUserPermissions();
                  setUserPermissions(userPerms);
                }}
                className="text-[#2957c3] hover:text-blue-700"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {userPermissions.map((permission) => (
                <div key={permission} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{permission}</span>
                  <button
                    onClick={async () => {
                      try {
                        await revokePermission('current-user-id', permission); // Replace with actual user ID
                        // Refresh user permissions
                        const userPerms = await getUserPermissions();
                        setUserPermissions(userPerms);
                      } catch (err) {
                        console.error('Failed to revoke permission:', err);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {userPermissions.length === 0 && (
                <p className="text-gray-500 text-sm col-span-full">No permissions assigned</p>
              )}
            </div>
          </div>

          {/* All CMS Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">All CMS Permissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Permission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm) => (
                    <tr key={perm.name} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{perm.name}</td>
                      <td className="py-3 px-4 text-gray-600">{perm.description}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            setSelectedPermission(perm.name);
                          }}
                          className="text-[#2957c3] hover:text-blue-700 text-sm font-medium"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <TemplateEditor
          templateId={editingTemplateId}
          onClose={() => {
            setShowTemplateEditor(false);
            setEditingTemplateId(null);
          }}
          onSave={(template) => {
            setShowTemplateEditor(false);
            setEditingTemplateId(null);
            // Refresh templates
            fetchTemplates();
          }}
        />
      )}

      {/* Visual Editor Modal */}
      {showVisualEditor && (
        <VisualEditor
          pageId={editingPageId}
          onClose={() => {
            setShowVisualEditor(false);
            setEditingPageId(null);
          }}
          onSave={(content) => {
            setShowVisualEditor(false);
            setEditingPageId(null);
            // Refresh pages
            fetchPages();
          }}
        />
      )}

      {/* AI Content Creator Modal */}
      {showAIContentCreator && (
        <AIContentCreator
          onClose={() => setShowAIContentCreator(false)}
          onInsertContent={(content) => {
            // This would be used to insert content into the editor
            console.log('Inserting content:', content);
            setShowAIContentCreator(false);
          }}
        />
      )}
    </div>
  );
}