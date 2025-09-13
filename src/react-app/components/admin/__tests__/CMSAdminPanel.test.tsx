import { describe, it, expect, vi } from 'vitest';
import { CMSProvider } from '../../../contexts/CMSContext';
import CMSAdminPanel from '../CMSAdminPanel';
import { render, screen, fireEvent, waitFor } from '../../../../test/utils';

// Mock the useCMS hook
vi.mock('../../../contexts/CMSContext', async () => {
  const actual = await vi.importActual('../../../contexts/CMSContext');
  return {
    ...actual,
    useCMS: () => ({
      pages: [
        {
          id: 1,
          title: 'Home',
          slug: 'home',
          template_id: null,
          content: '{"blocks":[]}',
          metadata: '{"seoTitle":"Home Page"}',
          status: 'published',
          created_by: 'user1',
          updated_by: 'user1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          published_at: '2023-01-01T00:00:00Z',
        }
      ],
      templates: [
        {
          id: 1,
          name: 'Default Template',
          description: 'Default page template',
          content_structure: '{"layout":"default"}',
          preview_image: '/images/default.png',
          is_default: true,
          created_by: 'admin',
          updated_by: 'admin',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ],
      components: [
        {
          id: 1,
          type: 'text',
          name: 'Text Block',
          properties: '{"text":"Hello World"}',
          styles: '{"color":"#000000"}',
          created_by: 'admin',
          updated_by: 'admin',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ],
      media: [
        {
          id: 1,
          filename: 'image.jpg',
          original_name: 'original-image.jpg',
          mime_type: 'image/jpeg',
          size: 1024,
          url: '/uploads/image.jpg',
          alt_text: 'Sample image',
          caption: 'A sample image',
          created_by: 'user1',
          created_at: '2023-01-01T00:00:00Z',
        }
      ],
      aiProviders: [
        {
          id: 1,
          name: 'OpenAI',
          api_key: 'sk-...',
          api_url: 'https://api.openai.com/v1',
          enabled: true,
          default_model: 'gpt-4',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ],
      aiModels: [],
      aiJobs: [],
      loading: false,
      error: null,
      fetchPages: vi.fn(),
      fetchTemplates: vi.fn(),
      fetchComponents: vi.fn(),
      fetchMedia: vi.fn(),
      fetchAIProviders: vi.fn(),
      fetchAIModels: vi.fn(),
      fetchAIJobs: vi.fn(),
      createPage: vi.fn(),
      updatePage: vi.fn(),
      deletePage: vi.fn(),
      createTemplate: vi.fn(),
      updateTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
      createComponent: vi.fn(),
      updateComponent: vi.fn(),
      deleteComponent: vi.fn(),
      uploadMedia: vi.fn(),
      deleteMedia: vi.fn(),
      createAIProvider: vi.fn(),
      updateAIProvider: vi.fn(),
      deleteAIProvider: vi.fn(),
      createAIModel: vi.fn(),
      updateAIModel: vi.fn(),
      deleteAIModel: vi.fn(),
      createAIJob: vi.fn(),
      updateAIJob: vi.fn(),
    })
  };
});

describe('CMSAdminPanel', () => {
  it('should render the CMS admin panel with tabs', () => {
    render(
      <CMSProvider>
        <CMSAdminPanel />
      </CMSProvider>
    );

    // Check that the main heading is rendered
    expect(screen.getByText('Content Management System')).toBeInTheDocument();
    
    // Check that tabs are rendered
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('should display pages in the table', () => {
    render(
      <CMSProvider>
        <CMSAdminPanel />
      </CMSProvider>
    );

    // Check that the page is displayed in the table
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('published')).toBeInTheDocument();
  });

  it('should switch to templates tab and display templates', async () => {
    render(
      <CMSProvider>
        <CMSAdminPanel />
      </CMSProvider>
    );

    // Switch to templates tab
    const templatesTab = screen.getByText('Templates');
    fireEvent.click(templatesTab);

    // Check that the template is displayed in the table
    expect(screen.getByText('Default Template')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('should switch to components tab and display components', async () => {
    render(
      <CMSProvider>
        <CMSAdminPanel />
      </CMSProvider>
    );

    // Switch to components tab
    const componentsTab = screen.getByText('Components');
    fireEvent.click(componentsTab);

    // Check that the component is displayed in the table
    expect(screen.getByText('Text Block')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('should switch to media tab and display media', async () => {
    render(
      <CMSProvider>
        <CMSAdminPanel />
      </CMSProvider>
    );

    // Switch to media tab
    const mediaTab = screen.getByText('Media');
    fireEvent.click(mediaTab);

    // Check that the media is displayed in the table
    expect(screen.getByText('image.jpg')).toBeInTheDocument();
    expect(screen.getByText('image/jpeg')).toBeInTheDocument();
  });

  it('should switch to AI tab and display AI providers', async () => {
    render(
      <CMSProvider>
        <CMSAdminPanel />
      </CMSProvider>
    );

    // Switch to AI tab
    const aiTab = screen.getByText('AI');
    fireEvent.click(aiTab);

    // Check that the AI provider is displayed in the table
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('https://api.openai.com/v1')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });
});