-- CMS Content Management Tables

-- Pages table for managing website pages
CREATE TABLE cms_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  template_id INTEGER,
  content TEXT, -- JSON structure of page content
  metadata TEXT, -- JSON metadata (SEO, etc.)
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by TEXT,
  updated_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  FOREIGN KEY (template_id) REFERENCES cms_templates(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Templates table for page templates
CREATE TABLE cms_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  content_structure TEXT, -- JSON structure defining template layout
  preview_image TEXT,
  is_default BOOLEAN DEFAULT 0,
  parent_template_id INTEGER, -- For template inheritance
  design_settings TEXT, -- JSON design settings including responsive breakpoints
  created_by TEXT,
  updated_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_template_id) REFERENCES cms_templates(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Components table for reusable UI components
CREATE TABLE cms_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  properties TEXT, -- JSON properties for the component
  styles TEXT, -- JSON styling information
  created_by TEXT,
  updated_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Media assets table
CREATE TABLE cms_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Content versions for rollback capability
CREATE TABLE cms_content_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('page', 'template', 'component')),
  data TEXT, -- JSON serialized content
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  comment TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- AI Providers configuration
CREATE TABLE cms_ai_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  api_key TEXT,
  api_url TEXT,
  enabled BOOLEAN DEFAULT 1,
  default_model TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Models available from providers
CREATE TABLE cms_ai_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  capabilities TEXT, -- JSON array of capabilities
  max_tokens INTEGER,
  pricing REAL,
  performance REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES cms_ai_providers(id)
);

-- AI Content generation jobs
CREATE TABLE cms_ai_content_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  metadata TEXT, -- JSON metadata
  FOREIGN KEY (provider_id) REFERENCES cms_ai_providers(id),
  FOREIGN KEY (model_id) REFERENCES cms_ai_models(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- AI Content history for refinement
CREATE TABLE cms_ai_content_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES cms_ai_content_jobs(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_status ON cms_pages(status);
CREATE INDEX idx_cms_pages_template ON cms_pages(template_id);
CREATE INDEX idx_cms_content_versions_content ON cms_content_versions(content_id, content_type);
CREATE INDEX idx_cms_ai_content_jobs_status ON cms_ai_content_jobs(status);
CREATE INDEX idx_cms_ai_models_provider ON cms_ai_models(provider_id);
CREATE INDEX idx_cms_templates_parent ON cms_templates(parent_template_id);