import { useState, useEffect } from 'react';
import { useCMS } from '../../contexts/CMSContext';
import { 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  Save, 
  X,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GitBranch
} from 'lucide-react';

interface TemplateEditorProps {
  templateId?: number;
  onClose: () => void;
  onSave: (template: any) => void;
}

export default function TemplateEditor({ templateId, onClose, onSave }: TemplateEditorProps) {
  const { templates, createTemplate, updateTemplate } = useCMS();
  const [activeTab, setActiveTab] = useState<'design' | 'content' | 'layout' | 'inheritance'>('design');
  
  // Template state
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    content_structure: '',
    preview_image: '',
    is_default: false,
    parent_template_id: null as number | null,
    design: {
      colors: {
        primary: '#2957c3',
        secondary: '#f8f9fa',
        background: '#ffffff',
        text: '#333333'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        lineHeight: '1.5',
        headingFontFamily: 'Inter, sans-serif'
      },
      spacing: {
        containerPadding: '1rem',
        sectionSpacing: '2rem',
        elementSpacing: '1rem'
      },
      responsive: {
        mobileBreakpoint: '768px',
        tabletBreakpoint: '1024px',
        desktopMinWidth: '1200px'
      }
    }
  });

  // Load existing template if editing
  useEffect(() => {
    if (templateId) {
      const existingTemplate = templates.find(t => t.id === templateId);
      if (existingTemplate) {
        // Parse design settings if they exist
        let designSettings = {
          colors: {
            primary: '#2957c3',
            secondary: '#f8f9fa',
            background: '#ffffff',
            text: '#333333'
          },
          typography: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '1.5',
            headingFontFamily: 'Inter, sans-serif'
          },
          spacing: {
            containerPadding: '1rem',
            sectionSpacing: '2rem',
            elementSpacing: '1rem'
          },
          responsive: {
            mobileBreakpoint: '768px',
            tabletBreakpoint: '1024px',
            desktopMinWidth: '1200px'
          }
        };
        
        if (existingTemplate.design_settings) {
          try {
            designSettings = {
              ...designSettings,
              ...JSON.parse(existingTemplate.design_settings)
            };
          } catch (e) {
            console.warn('Failed to parse design settings:', e);
          }
        }
        
        setTemplateData({
          name: existingTemplate.name,
          description: existingTemplate.description || '',
          content_structure: existingTemplate.content_structure || '',
          preview_image: existingTemplate.preview_image || '',
          is_default: existingTemplate.is_default,
          parent_template_id: existingTemplate.parent_template_id,
          design: designSettings
        });
      }
    }
  }, [templateId, templates]);

  const handleSave = async () => {
    try {
      // Prepare template data for saving
      const templateToSave = {
        ...templateData,
        content_structure: JSON.stringify(templateData.content_structure),
        design_settings: JSON.stringify(templateData.design)
      };
      
      let result;
      if (templateId) {
        // Update existing template
        result = await updateTemplate(templateId, templateToSave);
      } else {
        // Create new template
        result = await createTemplate(templateToSave);
      }
      
      if (result) {
        onSave(result);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const updateDesignProperty = (category: string, property: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      design: {
        ...prev.design,
        [category]: {
          ...prev.design[category as keyof typeof prev.design],
          [property]: value
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {templateId ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('design')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'design'
                  ? 'border-[#2957c3] text-[#2957c3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Palette className="w-4 h-4 inline mr-2" />
              Design
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'layout'
                  ? 'border-[#2957c3] text-[#2957c3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Layout className="w-4 h-4 inline mr-2" />
              Layout
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-[#2957c3] text-[#2957c3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlignLeft className="w-4 h-4 inline mr-2" />
              Content Structure
            </button>
            <button
              onClick={() => setActiveTab('inheritance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inheritance'
                  ? 'border-[#2957c3] text-[#2957c3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GitBranch className="w-4 h-4 inline mr-2" />
              Inheritance
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'design' && (
            <div className="space-y-8">
              {/* Template Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    placeholder="e.g., Property Listing Template"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={templateData.description}
                    onChange={(e) => setTemplateData({...templateData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    placeholder="Brief description of this template"
                  />
                </div>
              </div>

              {/* Color Customization */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Color Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={templateData.design.colors.primary}
                        onChange={(e) => updateDesignProperty('colors', 'primary', e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={templateData.design.colors.primary}
                        onChange={(e) => updateDesignProperty('colors', 'primary', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={templateData.design.colors.secondary}
                        onChange={(e) => updateDesignProperty('colors', 'secondary', e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={templateData.design.colors.secondary}
                        onChange={(e) => updateDesignProperty('colors', 'secondary', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={templateData.design.colors.background}
                        onChange={(e) => updateDesignProperty('colors', 'background', e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={templateData.design.colors.background}
                        onChange={(e) => updateDesignProperty('colors', 'background', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={templateData.design.colors.text}
                        onChange={(e) => updateDesignProperty('colors', 'text', e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={templateData.design.colors.text}
                        onChange={(e) => updateDesignProperty('colors', 'text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      value={templateData.design.typography.fontFamily}
                      onChange={(e) => updateDesignProperty('typography', 'fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Font Size
                    </label>
                    <select
                      value={templateData.design.typography.fontSize}
                      onChange={(e) => updateDesignProperty('typography', 'fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    >
                      <option value="14px">14px</option>
                      <option value="15px">15px</option>
                      <option value="16px">16px</option>
                      <option value="17px">17px</option>
                      <option value="18px">18px</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line Height
                    </label>
                    <select
                      value={templateData.design.typography.lineHeight}
                      onChange={(e) => updateDesignProperty('typography', 'lineHeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    >
                      <option value="1.3">1.3</option>
                      <option value="1.4">1.4</option>
                      <option value="1.5">1.5</option>
                      <option value="1.6">1.6</option>
                      <option value="1.7">1.7</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heading Font Family
                    </label>
                    <select
                      value={templateData.design.typography.headingFontFamily}
                      onChange={(e) => updateDesignProperty('typography', 'headingFontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spacing */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spacing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Container Padding
                    </label>
                    <select
                      value={templateData.design.spacing.containerPadding}
                      onChange={(e) => updateDesignProperty('spacing', 'containerPadding', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    >
                      <option value="0.5rem">Small (0.5rem)</option>
                      <option value="1rem">Medium (1rem)</option>
                      <option value="1.5rem">Large (1.5rem)</option>
                      <option value="2rem">Extra Large (2rem)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Spacing
                    </label>
                    <select
                      value={templateData.design.spacing.sectionSpacing}
                      onChange={(e) => updateDesignProperty('spacing', 'sectionSpacing', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    >
                      <option value="1rem">Small (1rem)</option>
                      <option value="2rem">Medium (2rem)</option>
                      <option value="3rem">Large (3rem)</option>
                      <option value="4rem">Extra Large (4rem)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Element Spacing
                    </label>
                    <select
                      value={templateData.design.spacing.elementSpacing}
                      onChange={(e) => updateDesignProperty('spacing', 'elementSpacing', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    >
                      <option value="0.5rem">Small (0.5rem)</option>
                      <option value="1rem">Medium (1rem)</option>
                      <option value="1.5rem">Large (1.5rem)</option>
                      <option value="2rem">Extra Large (2rem)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Structure</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Layout className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Header</h4>
                        <p className="text-sm text-gray-500">Site navigation and branding</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <AlignLeft className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Main Content</h4>
                        <p className="text-sm text-gray-500">Primary content area</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Image className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Sidebar</h4>
                        <p className="text-sm text-gray-500">Additional content and navigation</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Layout className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Footer</h4>
                        <p className="text-sm text-gray-500">Site footer and additional links</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Grid Layout</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <div className="text-sm text-gray-500 mb-2">Column 1</div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                  <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <div className="text-sm text-gray-500 mb-2">Column 2</div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                  <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <div className="text-sm text-gray-500 mb-2">Column 3</div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content Structure</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <AlignLeft className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Hero Section</h4>
                        <p className="text-sm text-gray-500">Large banner with headline and call-to-action</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Image className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Image Gallery</h4>
                        <p className="text-sm text-gray-500">Collection of images with lightbox</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Type className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Text Content</h4>
                        <p className="text-sm text-gray-500">Rich text editor for main content</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Layout className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Call to Action</h4>
                        <p className="text-sm text-gray-500">Prominent button or form</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2957c3]"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Fields</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      placeholder="Field name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                    />
                    <select className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]">
                      <option>Text</option>
                      <option>Number</option>
                      <option>Date</option>
                      <option>Image</option>
                      <option>Rich Text</option>
                    </select>
                    <button className="ml-2 text-red-500 hover:text-red-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="text-[#2957c3] hover:text-blue-700 text-sm font-medium">
                    + Add Custom Field
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inheritance' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Inheritance</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Template
                  </label>
                  <select
                    value={templateData.parent_template_id || ''}
                    onChange={(e) => setTemplateData({
                      ...templateData,
                      parent_template_id: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                  >
                    <option value="">No parent (base template)</option>
                    {templates
                      .filter(t => !templateId || t.id !== templateId)
                      .map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a parent template to inherit design and layout properties.
                  </p>
                </div>
                
                {templateData.parent_template_id && (
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Inheritance Preview</h4>
                    <p className="text-sm text-gray-600">
                      This template will inherit properties from "{templates.find(t => t.id === templateData.parent_template_id)?.name}".
                      Any properties you define here will override the parent template's properties.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Responsive Design Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Breakpoint
                    </label>
                    <input
                      type="text"
                      value={templateData.design.responsive.mobileBreakpoint}
                      onChange={(e) => setTemplateData({
                        ...templateData,
                        design: {
                          ...templateData.design,
                          responsive: {
                            ...templateData.design.responsive,
                            mobileBreakpoint: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                      placeholder="e.g., 768px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tablet Breakpoint
                    </label>
                    <input
                      type="text"
                      value={templateData.design.responsive.tabletBreakpoint}
                      onChange={(e) => setTemplateData({
                        ...templateData,
                        design: {
                          ...templateData.design,
                          responsive: {
                            ...templateData.design.responsive,
                            tabletBreakpoint: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                      placeholder="e.g., 1024px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desktop Min Width
                    </label>
                    <input
                      type="text"
                      value={templateData.design.responsive.desktopMinWidth}
                      onChange={(e) => setTemplateData({
                        ...templateData,
                        design: {
                          ...templateData.design,
                          responsive: {
                            ...templateData.design.responsive,
                            desktopMinWidth: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2957c3]"
                      placeholder="e.g., 1200px"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg"
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="bg-[#2957c3] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}