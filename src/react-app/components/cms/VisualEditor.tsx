import React, { useState, useRef, useEffect } from 'react';
import { useCMS } from '../../contexts/CMSContext';
import { 
  Move, 
  Trash2, 
  Copy, 
  Eye, 
  Settings,
  GripVertical,
  Plus,
  Save,
  Undo,
  Redo,
  Monitor,
  Smartphone,
  Tablet,
  History,
  Clock,
  X,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import ComponentLibrary from './ComponentLibrary';
import { ComponentItem } from './ComponentLibrary';

interface PageComponent {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  styles: Record<string, any>;
  responsive?: {
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;
    desktop?: Record<string, any>;
  };
}

interface VisualEditorProps {
  pageId?: number;
  onClose: () => void;
  onSave: (content: any) => void;
}

export default function VisualEditor({ pageId, onClose, onSave }: VisualEditorProps) {
  const { pages, createContentVersion, getContentVersions } = useCMS();
  const [activeTab, setActiveTab] = useState<'components' | 'settings' | 'versions'>('components');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentItem | null>(null);
  const [contentVersions, setContentVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [activeStyleTab, setActiveStyleTab] = useState<'general' | 'responsive'>('general');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Page state
  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    components: [] as PageComponent[]
  });

  // Load existing page if editing
  useEffect(() => {
    if (pageId) {
      const existingPage = pages.find(p => p.id === pageId);
      if (existingPage) {
        setPageData({
          title: existingPage.title,
          slug: existingPage.slug,
          status: existingPage.status,
          components: existingPage.content 
            ? JSON.parse(existingPage.content) 
            : []
        });
      }
    }
  }, [pageId, pages]);

  // Load content versions
  useEffect(() => {
    if (pageId) {
      loadContentVersions(pageId);
    }
  }, [pageId]);

  const loadContentVersions = async (pageId: number) => {
    try {
      const versions = await getContentVersions(pageId, 'page');
      setContentVersions(versions);
    } catch (error) {
      console.error('Failed to load content versions:', error);
    }
  };

  const handleComponentSelect = (component: ComponentItem) => {
    const newComponent: PageComponent = {
      id: `comp_${Date.now()}`,
      type: component.type,
      name: component.name,
      properties: {},
      styles: {},
      responsive: {
        mobile: {},
        tablet: {},
        desktop: {}
      }
    };
    
    setPageData(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  const handleComponentDelete = (componentId: string) => {
    setPageData(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== componentId)
    }));
    if (selectedComponent === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleComponentDuplicate = (componentId: string) => {
    const component = pageData.components.find(comp => comp.id === componentId);
    if (component) {
      const newComponent = {
        ...component,
        id: `comp_${Date.now()}`
      };
      setPageData(prev => ({
        ...prev,
        components: [...prev.components, newComponent]
      }));
    }
  };

  const handleSave = async () => {
    // Create a content version before saving
    if (pageId) {
      try {
        await createContentVersion({
          content_id: pageId,
          content_type: 'page',
          data: JSON.stringify(pageData.components),
          comment: `Saved version at ${new Date().toLocaleString()}`,
          created_by: 'current_user' // This would be the actual user ID in a real app
        });
        
        // Reload versions
        loadContentVersions(pageId);
      } catch (error) {
        console.error('Failed to create content version:', error);
      }
    }
    
    onSave({
      ...pageData,
      content: JSON.stringify(pageData.components)
    });
  };

  const handleRestoreVersion = (version: any) => {
    try {
      const components = JSON.parse(version.data);
      setPageData(prev => ({
        ...prev,
        components
      }));
      setSelectedVersion(version.id);
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const updateComponentStyle = (componentId: string, property: string, value: string) => {
    setPageData(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId 
          ? { 
              ...comp, 
              styles: { 
                ...comp.styles, 
                [property]: value 
              } 
            } 
          : comp
      )
    }));
  };

  const updateComponentResponsiveStyle = (componentId: string, breakpoint: string, property: string, value: string) => {
    setPageData(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId 
          ? { 
              ...comp, 
              responsive: {
                ...comp.responsive,
                [breakpoint]: {
                  ...comp.responsive?.[breakpoint],
                  [property]: value
                }
              }
            } 
          : comp
      )
    }));
  };

  const renderComponent = (component: PageComponent) => {
    // Get styles based on current device view
    let componentStyles = { ...component.styles };
    
    if (component.responsive) {
      switch (deviceView) {
        case 'mobile':
          componentStyles = { ...componentStyles, ...component.responsive.mobile };
          break;
        case 'tablet':
          componentStyles = { ...componentStyles, ...component.responsive.tablet };
          break;
        case 'desktop':
          componentStyles = { ...componentStyles, ...component.responsive.desktop };
          break;
      }
    }

    const style = {
      padding: componentStyles.padding || '1rem',
      margin: componentStyles.margin || '0',
      backgroundColor: componentStyles.backgroundColor || 'transparent',
      textAlign: componentStyles.textAlign || 'left',
      ...componentStyles
    };

    switch (component.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg" style={style}>
            <h1 className="text-3xl font-bold mb-4">Welcome to Our Platform</h1>
            <p className="text-lg mb-6">Discover amazing experiences tailored just for you</p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
          </div>
        );
      case 'text':
        return (
          <div className="prose max-w-none" style={style}>
            <h2>About Our Service</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
              nostrud exercitation ullamco laboris.
            </p>
          </div>
        );
      case 'image':
        return (
          <div className="text-center" style={style}>
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
              <span className="text-gray-500">Image Placeholder</span>
            </div>
          </div>
        );
      case 'card':
        return (
          <div className="bg-white rounded-lg shadow-md p-6" style={style}>
            <div className="bg-gray-200 border-2 border-dashed rounded w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Card Title</h3>
            <p className="text-gray-600 mb-4">
              This is a sample card component that can be used to display various types of content.
            </p>
            <button className="text-[#2957c3] font-medium hover:text-blue-700">
              Learn More
            </button>
          </div>
        );
      case 'button':
        return (
          <button className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" style={style}>
            Click Me
          </button>
        );
      default:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center" style={style}>
            <p className="text-gray-500">Component: {component.name}</p>
          </div>
        );
    }
  };

  // Get the currently selected component
  const selectedComponentData = pageData.components.find(c => c.id === selectedComponent);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              {pageId ? 'Edit Page' : 'Create New Page'}
            </h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={pageData.title}
                onChange={(e) => setPageData({...pageData, title: e.target.value})}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="Page title"
              />
              <input
                type="text"
                value={pageData.slug}
                onChange={(e) => setPageData({...pageData, slug: e.target.value})}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="page-slug"
              />
              <select
                value={pageData.status}
                onChange={(e) => setPageData({...pageData, status: e.target.value as any})}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100">
              <Undo className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100">
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-2 rounded ${deviceView === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Desktop view"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`p-2 rounded ${deviceView === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Tablet view"
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-2 rounded ${deviceView === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Mobile view"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-[#2957c3] rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Component Library */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'components'
                    ? 'text-[#2957c3] border-b-2 border-[#2957c3]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'text-[#2957c3] border-b-2 border-[#2957c3]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === 'versions'
                    ? 'text-[#2957c3] border-b-2 border-[#2957c3]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="w-4 h-4 inline mr-1" />
                Versions
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'components' ? (
                <ComponentLibrary onComponentSelect={handleComponentSelect} />
              ) : activeTab === 'settings' ? (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Page Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Page SEO title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Page SEO description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Open Graph Image
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-200 border-2 border-dashed rounded w-16 h-16" />
                        <button className="text-sm text-[#2957c3] hover:text-blue-700">
                          Upload Image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Version History</h3>
                  {contentVersions.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No versions saved yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contentVersions.map((version) => (
                        <div 
                          key={version.id}
                          className={`p-3 border rounded-lg cursor-pointer ${
                            selectedVersion === version.id 
                              ? 'border-[#2957c3] bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleRestoreVersion(version)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-sm font-medium">
                                {new Date(version.created_at).toLocaleString()}
                              </span>
                            </div>
                            {selectedVersion === version.id && (
                              <span className="text-xs bg-[#2957c3] text-white px-2 py-1 rounded">
                                Current
                              </span>
                            )}
                          </div>
                          {version.comment && (
                            <p className="text-xs text-gray-500 mt-1">{version.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900">Page Content</h3>
            </div>
            
            <div 
              ref={canvasRef}
              className="flex-1 overflow-auto bg-gray-100 p-8"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedComponent) {
                  handleComponentSelect(draggedComponent);
                  setDraggedComponent(null);
                }
              }}
            >
              <div 
                className={`
                  bg-white min-h-full mx-auto shadow-sm
                  ${deviceView === 'desktop' ? 'max-w-5xl' : ''}
                  ${deviceView === 'tablet' ? 'max-w-2xl' : ''}
                  ${deviceView === 'mobile' ? 'max-w-md' : ''}
                `}
              >
                {pageData.components.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                    <Layout className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Start Building Your Page</h3>
                    <p className="text-gray-500 mb-6">
                      Drag components from the library to the canvas or click on a component to add it.
                    </p>
                    <button
                      onClick={() => setActiveTab('components')}
                      className="flex items-center px-4 py-2 bg-[#2957c3] text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Components
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 p-6">
                    {pageData.components.map((component) => (
                      <div
                        key={component.id}
                        className={`relative group border-2 ${
                          selectedComponent === component.id 
                            ? 'border-[#2957c3]' 
                            : 'border-transparent hover:border-gray-300'
                        } rounded-lg`}
                        onClick={() => setSelectedComponent(component.id)}
                      >
                        {selectedComponent === component.id && (
                          <div className="absolute -top-3 -right-3 flex bg-white rounded-full shadow-sm border border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComponentDuplicate(component.id);
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-l-full"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComponentDelete(component.id);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-r-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        <div className="p-4">
                          {renderComponent(component)}
                        </div>
                        
                        {selectedComponent === component.id && (
                          <div className="absolute -top-3 left-3 flex items-center bg-[#2957c3] text-white text-xs font-medium px-2 py-1 rounded">
                            <GripVertical className="w-3 h-3 mr-1" />
                            {component.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Component Settings */}
          {selectedComponent && selectedComponentData && (
            <div className="w-80 border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Component Settings</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {/* Style Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveStyleTab('general')}
                    className={`flex-1 py-3 px-4 text-sm font-medium ${
                      activeStyleTab === 'general'
                        ? 'text-[#2957c3] border-b-2 border-[#2957c3]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Palette className="w-4 h-4 inline mr-1" />
                    General
                  </button>
                  <button
                    onClick={() => setActiveStyleTab('responsive')}
                    className={`flex-1 py-3 px-4 text-sm font-medium ${
                      activeStyleTab === 'responsive'
                        ? 'text-[#2957c3] border-b-2 border-[#2957c3]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Monitor className="w-4 h-4 inline mr-1" />
                    Responsive
                  </button>
                </div>
                
                <div className="p-4">
                  {activeStyleTab === 'general' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Component Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          defaultValue={selectedComponentData.name}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Padding
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Top"
                            value={selectedComponentData.styles?.paddingTop || ''}
                            onChange={(e) => updateComponentStyle(selectedComponent, 'paddingTop', e.target.value)}
                          />
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Bottom"
                            value={selectedComponentData.styles?.paddingBottom || ''}
                            onChange={(e) => updateComponentStyle(selectedComponent, 'paddingBottom', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Margin
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Top"
                            value={selectedComponentData.styles?.marginTop || ''}
                            onChange={(e) => updateComponentStyle(selectedComponent, 'marginTop', e.target.value)}
                          />
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Bottom"
                            value={selectedComponentData.styles?.marginBottom || ''}
                            onChange={(e) => updateComponentStyle(selectedComponent, 'marginBottom', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            value={selectedComponentData.styles?.backgroundColor || '#ffffff'}
                            onChange={(e) => updateComponentStyle(selectedComponent, 'backgroundColor', e.target.value)}
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            value={selectedComponentData.styles?.backgroundColor || '#ffffff'}
                            onChange={(e) => updateComponentStyle(selectedComponent, 'backgroundColor', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Text Alignment
                        </label>
                        <div className="flex space-x-2">
                          {['left', 'center', 'right'].map((align) => (
                            <button
                              key={align}
                              onClick={() => updateComponentStyle(selectedComponent, 'textAlign', align)}
                              className={`flex-1 py-2 border rounded-md text-sm font-medium ${
                                selectedComponentData.styles?.textAlign === align
                                  ? 'border-[#2957c3] bg-[#2957c3] text-white' 
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {align.charAt(0).toUpperCase() + align.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Customize how this component appears on different device sizes.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Settings ({deviceView === 'mobile' ? 'Currently viewing' : ''})
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Padding"
                              value={selectedComponentData.responsive?.mobile?.padding || ''}
                              onChange={(e) => updateComponentResponsiveStyle(selectedComponent, 'mobile', 'padding', e.target.value)}
                            />
                            <span className="text-xs text-gray-500">Padding</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Font size"
                              value={selectedComponentData.responsive?.mobile?.fontSize || ''}
                              onChange={(e) => updateComponentResponsiveStyle(selectedComponent, 'mobile', 'fontSize', e.target.value)}
                            />
                            <span className="text-xs text-gray-500">Font Size</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tablet Settings ({deviceView === 'tablet' ? 'Currently viewing' : ''})
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Padding"
                              value={selectedComponentData.responsive?.tablet?.padding || ''}
                              onChange={(e) => updateComponentResponsiveStyle(selectedComponent, 'tablet', 'padding', e.target.value)}
                            />
                            <span className="text-xs text-gray-500">Padding</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Font size"
                              value={selectedComponentData.responsive?.tablet?.fontSize || ''}
                              onChange={(e) => updateComponentResponsiveStyle(selectedComponent, 'tablet', 'fontSize', e.target.value)}
                            />
                            <span className="text-xs text-gray-500">Font Size</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Desktop Settings ({deviceView === 'desktop' ? 'Currently viewing' : ''})
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Padding"
                              value={selectedComponentData.responsive?.desktop?.padding || ''}
                              onChange={(e) => updateComponentResponsiveStyle(selectedComponent, 'desktop', 'padding', e.target.value)}
                            />
                            <span className="text-xs text-gray-500">Padding</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Font size"
                              value={selectedComponentData.responsive?.desktop?.fontSize || ''}
                              onChange={(e) => updateComponentResponsiveStyle(selectedComponent, 'desktop', 'fontSize', e.target.value)}
                            />
                            <span className="text-xs text-gray-500">Font Size</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}