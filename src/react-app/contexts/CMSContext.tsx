import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Page,
  Template,
  Component,
  Media,
  AIProvider,
  AIModel,
  AIContentJob,
  ContentVersion
} from '../../shared/types';

// CMS Context Types
interface CMSContextType {
  pages: Page[];
  templates: Template[];
  components: Component[];
  media: Media[];
  aiProviders: AIProvider[];
  aiModels: AIModel[];
  aiJobs: AIContentJob[];
  loading: boolean;
  error: string | null;
  fetchPages: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchComponents: () => Promise<void>;
  fetchMedia: () => Promise<void>;
  fetchAIProviders: () => Promise<void>;
  fetchAIModels: (providerId: number) => Promise<void>;
  fetchAIJobs: () => Promise<void>;
  refreshAIModels: (providerId: number) => Promise<void>;
  processAIJobs: () => Promise<void>;
  createPage: (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => Promise<Page | null>;
  updatePage: (id: number, page: Partial<Page>) => Promise<Page | null>;
  deletePage: (id: number) => Promise<boolean>;
  createTemplate: (template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => Promise<Template | null>;
  updateTemplate: (id: number, template: Partial<Template>) => Promise<Template | null>;
  deleteTemplate: (id: number) => Promise<boolean>;
  createComponent: (component: Omit<Component, 'id' | 'created_at' | 'updated_at'>) => Promise<Component | null>;
  updateComponent: (id: number, component: Partial<Component>) => Promise<Component | null>;
  deleteComponent: (id: number) => Promise<boolean>;
  uploadMedia: (media: Omit<Media, 'id' | 'created_at'>) => Promise<Media | null>;
  deleteMedia: (id: number) => Promise<boolean>;
  createAIProvider: (provider: Omit<AIProvider, 'id' | 'created_at' | 'updated_at'>) => Promise<AIProvider | null>;
  updateAIProvider: (id: number, provider: Partial<AIProvider>) => Promise<AIProvider | null>;
  deleteAIProvider: (id: number) => Promise<boolean>;
  createAIModel: (model: Omit<AIModel, 'id' | 'created_at'>) => Promise<AIModel | null>;
  updateAIModel: (id: number, model: Partial<AIModel>) => Promise<AIModel | null>;
  deleteAIModel: (id: number) => Promise<boolean>;
  createAIJob: (job: Omit<AIContentJob, 'id' | 'created_at' | 'status'>) => Promise<AIContentJob | null>;
  updateAIJob: (id: number, job: Partial<AIContentJob>) => Promise<AIContentJob | null>;
  // Content versioning methods
  createContentVersion: (version: Omit<ContentVersion, 'id' | 'created_at'>) => Promise<ContentVersion | null>;
  getContentVersions: (contentId: number, contentType: string) => Promise<ContentVersion[]>;
  // Permission management methods
  getUserPermissions: () => Promise<string[]>;
  getAllPermissions: () => Promise<{name: string, description: string}[]>;
  checkPermission: (permission: string) => Promise<boolean>;
  grantPermission: (userId: string, permission: string) => Promise<void>;
  revokePermission: (userId: string, permission: string) => Promise<void>;
  getUsersWithPermission: (permission: string) => Promise<any[]>;
}

// Create the context
const CMSContext = createContext<CMSContextType | undefined>(undefined);

// Provider component
export function CMSProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [aiProviders, setAIProviders] = useState<AIProvider[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [aiJobs, setAIJobs] = useState<AIContentJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function for API calls
  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API call failed');
      }
      
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all pages
  const fetchPages = async () => {
    try {
      const data = await apiCall('/api/cms/pages');
      setPages(data);
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    }
  };

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      const data = await apiCall('/api/cms/templates');
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  // Fetch all components
  const fetchComponents = async () => {
    try {
      const data = await apiCall('/api/cms/components');
      setComponents(data);
    } catch (err) {
      console.error('Failed to fetch components:', err);
    }
  };

  // Fetch all media
  const fetchMedia = async () => {
    try {
      const data = await apiCall('/api/cms/media');
      setMedia(data);
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  };

  // Fetch all AI providers
  const fetchAIProviders = async () => {
    try {
      const data = await apiCall('/api/cms/ai/providers');
      setAIProviders(data);
    } catch (err) {
      console.error('Failed to fetch AI providers:', err);
    }
  };

  // Fetch AI models by provider
  const fetchAIModels = async (providerId: number) => {
    try {
      const data = await apiCall(`/api/cms/ai/providers/${providerId}/models`);
      setAIModels(data);
    } catch (err) {
      console.error('Failed to fetch AI models:', err);
    }
  };

  // Fetch AI jobs
  const fetchAIJobs = async () => {
    try {
      const data = await apiCall('/api/cms/ai/jobs');
      setAIJobs(data);
    } catch (err) {
      console.error('Failed to fetch AI jobs:', err);
    }
  };

  // Refresh AI models from provider
  const refreshAIModels = async (providerId: number) => {
    try {
      await apiCall(`/api/cms/ai/providers/${providerId}/models/refresh`, {
        method: 'POST',
      });
      // Refresh models after refresh
      await fetchAIModels(providerId);
    } catch (err) {
      console.error('Failed to refresh AI models:', err);
    }
  };

  // Process pending AI jobs
  const processAIJobs = async () => {
    try {
      await apiCall('/api/cms/ai/process-jobs', {
        method: 'POST',
      });
      // Refresh jobs after processing
      await fetchAIJobs();
    } catch (err) {
      console.error('Failed to process AI jobs:', err);
    }
  };

  // Create a new page
  const createPage = async (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await apiCall('/api/cms/pages', {
        method: 'POST',
        body: JSON.stringify(page),
      });
      setPages(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to create page:', err);
      return null;
    }
  };

  // Update a page
  const updatePage = async (id: number, page: Partial<Page>) => {
    try {
      const data = await apiCall(`/api/cms/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(page),
      });
      setPages(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      console.error('Failed to update page:', err);
      return null;
    }
  };

  // Delete a page
  const deletePage = async (id: number) => {
    try {
      await apiCall(`/api/cms/pages/${id}`, {
        method: 'DELETE',
      });
      setPages(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete page:', err);
      return false;
    }
  };

  // Create a new template
  const createTemplate = async (template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await apiCall('/api/cms/templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });
      setTemplates(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to create template:', err);
      return null;
    }
  };

  // Update a template
  const updateTemplate = async (id: number, template: Partial<Template>) => {
    try {
      const data = await apiCall(`/api/cms/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template),
      });
      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      console.error('Failed to update template:', err);
      return null;
    }
  };

  // Delete a template
  const deleteTemplate = async (id: number) => {
    try {
      await apiCall(`/api/cms/templates/${id}`, {
        method: 'DELETE',
      });
      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete template:', err);
      return false;
    }
  };

  // Create a new component
  const createComponent = async (component: Omit<Component, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await apiCall('/api/cms/components', {
        method: 'POST',
        body: JSON.stringify(component),
      });
      setComponents(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to create component:', err);
      return null;
    }
  };

  // Update a component
  const updateComponent = async (id: number, component: Partial<Component>) => {
    try {
      const data = await apiCall(`/api/cms/components/${id}`, {
        method: 'PUT',
        body: JSON.stringify(component),
      });
      setComponents(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      console.error('Failed to update component:', err);
      return null;
    }
  };

  // Delete a component
  const deleteComponent = async (id: number) => {
    try {
      await apiCall(`/api/cms/components/${id}`, {
        method: 'DELETE',
      });
      setComponents(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete component:', err);
      return false;
    }
  };

  // Upload media
  const uploadMedia = async (media: Omit<Media, 'id' | 'created_at'>) => {
    try {
      const data = await apiCall('/api/cms/media', {
        method: 'POST',
        body: JSON.stringify(media),
      });
      setMedia(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to upload media:', err);
      return null;
    }
  };

  // Delete media
  const deleteMedia = async (id: number) => {
    try {
      await apiCall(`/api/cms/media/${id}`, {
        method: 'DELETE',
      });
      setMedia(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete media:', err);
      return false;
    }
  };

  // Create AI provider
  const createAIProvider = async (provider: Omit<AIProvider, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await apiCall('/api/cms/ai/providers', {
        method: 'POST',
        body: JSON.stringify(provider),
      });
      setAIProviders(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to create AI provider:', err);
      return null;
    }
  };

  // Update AI provider
  const updateAIProvider = async (id: number, provider: Partial<AIProvider>) => {
    try {
      const data = await apiCall(`/api/cms/ai/providers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(provider),
      });
      setAIProviders(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      console.error('Failed to update AI provider:', err);
      return null;
    }
  };

  // Delete AI provider
  const deleteAIProvider = async (id: number) => {
    try {
      await apiCall(`/api/cms/ai/providers/${id}`, {
        method: 'DELETE',
      });
      setAIProviders(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete AI provider:', err);
      return false;
    }
  };

  // Create AI model
  const createAIModel = async (model: Omit<AIModel, 'id' | 'created_at'>) => {
    try {
      const data = await apiCall('/api/cms/ai/models', {
        method: 'POST',
        body: JSON.stringify(model),
      });
      setAIModels(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to create AI model:', err);
      return null;
    }
  };

  // Update AI model
  const updateAIModel = async (id: number, model: Partial<AIModel>) => {
    try {
      const data = await apiCall(`/api/cms/ai/models/${id}`, {
        method: 'PUT',
        body: JSON.stringify(model),
      });
      setAIModels(prev => prev.map(m => m.id === id ? data : m));
      return data;
    } catch (err) {
      console.error('Failed to update AI model:', err);
      return null;
    }
  };

  // Delete AI model
  const deleteAIModel = async (id: number) => {
    try {
      await apiCall(`/api/cms/ai/models/${id}`, {
        method: 'DELETE',
      });
      setAIModels(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete AI model:', err);
      return false;
    }
  };

  // Create AI job
  const createAIJob = async (job: Omit<AIContentJob, 'id' | 'created_at' | 'status'>) => {
    try {
      const data = await apiCall('/api/cms/ai/generate', {
        method: 'POST',
        body: JSON.stringify(job),
      });
      setAIJobs(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to create AI job:', err);
      return null;
    }
  };

  // Update AI job
  const updateAIJob = async (id: number, job: Partial<AIContentJob>) => {
    try {
      const data = await apiCall(`/api/cms/ai/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(job),
      });
      setAIJobs(prev => prev.map(j => j.id === id ? data : j));
      return data;
    } catch (err) {
      console.error('Failed to update AI job:', err);
      return null;
    }
  };

  // Create content version
  const createContentVersion = async (version: Omit<ContentVersion, 'id' | 'created_at'>) => {
    try {
      const data = await apiCall('/api/cms/content-versions', {
        method: 'POST',
        body: JSON.stringify(version),
      });
      return data;
    } catch (err) {
      console.error('Failed to create content version:', err);
      return null;
    }
  };

  // Get content versions
  const getContentVersions = async (contentId: number, contentType: string) => {
    try {
      const data = await apiCall(`/api/cms/content-versions/${contentId}/${contentType}`);
      return data;
    } catch (err) {
      console.error('Failed to fetch content versions:', err);
      return [];
    }
  };

  // Permission management methods
  const getUserPermissions = async () => {
    try {
      const data = await apiCall('/api/cms/permissions');
      return data;
    } catch (err) {
      console.error('Failed to fetch user permissions:', err);
      return [];
    }
  };

  const getAllPermissions = async () => {
    try {
      const data = await apiCall('/api/cms/permissions/all');
      return data;
    } catch (err) {
      console.error('Failed to fetch all permissions:', err);
      return [];
    }
  };

  const checkPermission = async (permission: string) => {
    try {
      const data = await apiCall(`/api/cms/permissions/check/${permission}`);
      return data.hasPermission;
    } catch (err) {
      console.error('Failed to check permission:', err);
      return false;
    }
  };

  const grantPermission = async (userId: string, permission: string) => {
    try {
      await apiCall('/api/cms/permissions/grant', {
        method: 'POST',
        body: JSON.stringify({ userId, permission }),
      });
    } catch (err) {
      console.error('Failed to grant permission:', err);
      throw err;
    }
  };

  const revokePermission = async (userId: string, permission: string) => {
    try {
      await apiCall('/api/cms/permissions/revoke', {
        method: 'POST',
        body: JSON.stringify({ userId, permission }),
      });
    } catch (err) {
      console.error('Failed to revoke permission:', err);
      throw err;
    }
  };

  const getUsersWithPermission = async (permission: string) => {
    try {
      const data = await apiCall(`/api/cms/permissions/users/${permission}`);
      return data;
    } catch (err) {
      console.error('Failed to fetch users with permission:', err);
      return [];
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchPages();
    fetchTemplates();
    fetchComponents();
    fetchMedia();
    fetchAIProviders();
    fetchAIJobs();
  }, []);

  return (
    <CMSContext.Provider
      value={{
        pages,
        templates,
        components,
        media,
        aiProviders,
        aiModels,
        aiJobs,
        loading,
        error,
        fetchPages,
        fetchTemplates,
        fetchComponents,
        fetchMedia,
        fetchAIProviders,
        fetchAIModels,
        fetchAIJobs,
        refreshAIModels,
        processAIJobs,
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
        createAIModel,
        updateAIModel,
        deleteAIModel,
        createAIJob,
        updateAIJob,
        createContentVersion,
        getContentVersions,
        // Permission management methods
        getUserPermissions,
        getAllPermissions,
        checkPermission,
        grantPermission,
        revokePermission,
        getUsersWithPermission,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

// Custom hook to use the CMS context
export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}