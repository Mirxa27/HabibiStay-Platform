// Type definitions for D1Database
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T>(colName: string): Promise<T | null>;
  first<T extends Record<string, any>>(): Promise<T | null>;
  run<T extends Record<string, any>>(): Promise<D1Result<T>>;
  all<T extends Record<string, any>>(): Promise<D1Result<T>>;
}

interface D1Result<T> {
  results: T[];
  success: boolean;
  meta: any;
}

import {
  Page,
  Template,
  Component,
  Media,
  ContentVersion,
  CMSAIProvider,
  AIModel,
  AIContentJob,
  AIContentHistory,
  PageSchema,
  TemplateSchema,
  ComponentSchema,
  MediaSchema,
  ContentVersionSchema,
  CMSAIProviderSchema,
  AIModelSchema,
  AIContentJobSchema,
  AIContentHistorySchema
} from './types';

export class CMSService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ===============================
  // PAGE MANAGEMENT
  // ===============================

  async getAllPages(): Promise<Page[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_pages ORDER BY created_at DESC'
    ).all();
    
    return results.map(row => PageSchema.parse(row));
  }

  async getPageById(id: number): Promise<Page | null> {
    const row = await this.db.prepare(
      'SELECT * FROM cms_pages WHERE id = ?'
    ).bind(id).first();
    
    return row ? PageSchema.parse(row) : null;
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    const row = await this.db.prepare(
      'SELECT * FROM cms_pages WHERE slug = ? AND status = ?'
    ).bind(slug, 'published').first();
    
    return row ? PageSchema.parse(row) : null;
  }

  async createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<Page> {
    const result = await this.db.prepare(`
      INSERT INTO cms_pages (
        title, slug, template_id, content, metadata, status, 
        created_by, updated_by, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      page.title,
      page.slug,
      page.template_id,
      page.content,
      page.metadata,
      page.status,
      page.created_by,
      page.updated_by,
      page.published_at
    ).run();
    
    const row = result.results[0];
    return PageSchema.parse(row);
  }

  async updatePage(id: number, page: Partial<Page>): Promise<Page> {
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(page)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    values.push(id);
    
    const query = `
      UPDATE cms_pages 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
      RETURNING *
    `;
    
    const result = await this.db.prepare(query).bind(...values).run();
    const row = result.results[0];
    return PageSchema.parse(row);
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM cms_pages WHERE id = ?'
    ).bind(id).run();
    
    return result.success;
  }

  // ===============================
  // TEMPLATE MANAGEMENT
  // ===============================

  async getAllTemplates(): Promise<Template[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_templates ORDER BY created_at DESC'
    ).all();
    
    return results.map(row => TemplateSchema.parse(row));
  }

  async getTemplateById(id: number): Promise<Template | null> {
    const row = await this.db.prepare(
      'SELECT * FROM cms_templates WHERE id = ?'
    ).bind(id).first();
    
    return row ? TemplateSchema.parse(row) : null;
  }

  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const result = await this.db.prepare(`
      INSERT INTO cms_templates (
        name, description, content_structure, preview_image, is_default,
        parent_template_id, design_settings,
        created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      template.name,
      template.description,
      template.content_structure,
      template.preview_image,
      template.is_default,
      template.parent_template_id,
      template.design_settings,
      template.created_by,
      template.updated_by
    ).run();
    
    const row = result.results[0];
    return TemplateSchema.parse(row);
  }

  async updateTemplate(id: number, template: Partial<Template>): Promise<Template> {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(template)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    values.push(id);
    
    const query = `
      UPDATE cms_templates 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
      RETURNING *
    `;
    
    const result = await this.db.prepare(query).bind(...values).run();
    const row = result.results[0];
    return TemplateSchema.parse(row);
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM cms_templates WHERE id = ?'
    ).bind(id).run();
    
    return result.success;
  }

  // ===============================
  // COMPONENT MANAGEMENT
  // ===============================

  async getAllComponents(): Promise<Component[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_components ORDER BY created_at DESC'
    ).all();
    
    return results.map(row => ComponentSchema.parse(row));
  }

  async getComponentById(id: number): Promise<Component | null> {
    const row = await this.db.prepare(
      'SELECT * FROM cms_components WHERE id = ?'
    ).bind(id).first();
    
    return row ? ComponentSchema.parse(row) : null;
  }

  async createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at'>): Promise<Component> {
    const result = await this.db.prepare(`
      INSERT INTO cms_components (
        type, name, properties, styles, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      component.type,
      component.name,
      component.properties,
      component.styles,
      component.created_by,
      component.updated_by
    ).run();
    
    const row = result.results[0];
    return ComponentSchema.parse(row);
  }

  async updateComponent(id: number, component: Partial<Component>): Promise<Component> {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(component)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    values.push(id);
    
    const query = `
      UPDATE cms_components 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
      RETURNING *
    `;
    
    const result = await this.db.prepare(query).bind(...values).run();
    const row = result.results[0];
    return ComponentSchema.parse(row);
  }

  async deleteComponent(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM cms_components WHERE id = ?'
    ).bind(id).run();
    
    return result.success;
  }

  // ===============================
  // MEDIA MANAGEMENT
  // ===============================

  async getAllMedia(): Promise<Media[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_media ORDER BY created_at DESC'
    ).all();
    
    return results.map(row => MediaSchema.parse(row));
  }

  async getMediaById(id: number): Promise<Media | null> {
    const row = await this.db.prepare(
      'SELECT * FROM cms_media WHERE id = ?'
    ).bind(id).first();
    
    return row ? MediaSchema.parse(row) : null;
  }

  async createMedia(media: Omit<Media, 'id' | 'created_at'>): Promise<Media> {
    const result = await this.db.prepare(`
      INSERT INTO cms_media (
        filename, original_name, mime_type, size, url, alt_text, caption, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      media.filename,
      media.original_name,
      media.mime_type,
      media.size,
      media.url,
      media.alt_text,
      media.caption,
      media.created_by
    ).run();
    
    const row = result.results[0];
    return MediaSchema.parse(row);
  }

  async deleteMedia(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM cms_media WHERE id = ?'
    ).bind(id).run();
    
    return result.success;
  }

  // ===============================
  // CONTENT VERSIONING
  // ===============================

  async createContentVersion(version: Omit<ContentVersion, 'id' | 'created_at'>): Promise<ContentVersion> {
    const result = await this.db.prepare(`
      INSERT INTO cms_content_versions (
        content_id, content_type, data, created_by, comment
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      version.content_id,
      version.content_type,
      version.data,
      version.created_by,
      version.comment
    ).run();
    
    const row = result.results[0];
    return ContentVersionSchema.parse(row);
  }

  async getContentVersions(contentId: number, contentType: string): Promise<ContentVersion[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_content_versions WHERE content_id = ? AND content_type = ? ORDER BY created_at DESC'
    ).bind(contentId, contentType).all();
    
    return results.map(row => ContentVersionSchema.parse(row));
  }

  // ===============================
  // AI PROVIDER MANAGEMENT
  // ===============================

  async getAllAIProviders(): Promise<CMSAIProvider[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_ai_providers ORDER BY created_at DESC'
    ).all();
    
    return results.map(row => CMSAIProviderSchema.parse(row));
  }

  async getAIProviderById(id: number): Promise<CMSAIProvider | null> {
    const row = await this.db.prepare(
      'SELECT * FROM cms_ai_providers WHERE id = ?'
    ).bind(id).first();
    
    return row ? CMSAIProviderSchema.parse(row) : null;
  }

  async createAIProvider(provider: Omit<CMSAIProvider, 'id' | 'created_at' | 'updated_at'>): Promise<CMSAIProvider> {
    const result = await this.db.prepare(`
      INSERT INTO cms_ai_providers (
        name, api_key, api_url, enabled, default_model
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      provider.name,
      provider.api_key,
      provider.api_url,
      provider.enabled,
      provider.default_model
    ).run();
    
    const row = result.results[0];
    return CMSAIProviderSchema.parse(row);
  }

  async updateAIProvider(id: number, provider: Partial<CMSAIProvider>): Promise<CMSAIProvider> {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(provider)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    values.push(id);
    
    const query = `
      UPDATE cms_ai_providers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
      RETURNING *
    `;
    
    const result = await this.db.prepare(query).bind(...values).run();
    const row = result.results[0];
    return CMSAIProviderSchema.parse(row);
  }

  async deleteAIProvider(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM cms_ai_providers WHERE id = ?'
    ).bind(id).run();
    
    return result.success;
  }

  // ===============================
  // AI MODEL MANAGEMENT
  // ===============================

  async getModelsByProvider(providerId: number): Promise<AIModel[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_ai_models WHERE provider_id = ? ORDER BY created_at DESC'
    ).bind(providerId).all();
    
    return results.map(row => AIModelSchema.parse(row));
  }

  async createAIModel(model: Omit<AIModel, 'id' | 'created_at'>): Promise<AIModel> {
    const result = await this.db.prepare(`
      INSERT INTO cms_ai_models (
        provider_id, name, capabilities, max_tokens, pricing, performance
      ) VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      model.provider_id,
      model.name,
      model.capabilities,
      model.max_tokens,
      model.pricing,
      model.performance
    ).run();
    
    const row = result.results[0];
    return AIModelSchema.parse(row);
  }

  async updateAIModel(id: number, model: Partial<AIModel>): Promise<AIModel> {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(model)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    values.push(id);
    
    const query = `
      UPDATE cms_ai_models 
      SET ${fields.join(', ')} 
      WHERE id = ?
      RETURNING *
    `;
    
    const result = await this.db.prepare(query).bind(...values).run();
    const row = result.results[0];
    return AIModelSchema.parse(row);
  }

  async deleteAIModel(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM cms_ai_models WHERE id = ?'
    ).bind(id).run();
    
    return result.success;
  }

  // ===============================
  // AI CONTENT JOB MANAGEMENT
  // ===============================

  async createAIContentJob(job: Omit<AIContentJob, 'id' | 'created_at' | 'status'>): Promise<AIContentJob> {
    const result = await this.db.prepare(`
      INSERT INTO cms_ai_content_jobs (
        provider_id, model_id, prompt, content, status, created_by, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      job.provider_id,
      job.model_id,
      job.prompt,
      job.content,
      'pending',
      job.created_by,
      job.metadata
    ).run();
    
    const row = result.results[0];
    return AIContentJobSchema.parse(row);
  }

  async updateAIContentJob(id: number, job: Partial<AIContentJob>): Promise<AIContentJob> {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(job)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    values.push(id);
    
    const query = `
      UPDATE cms_ai_content_jobs 
      SET ${fields.join(', ')} 
      WHERE id = ?
      RETURNING *
    `;
    
    const result = await this.db.prepare(query).bind(...values).run();
    const row = result.results[0];
    return AIContentJobSchema.parse(row);
  }

  async getAIContentJobById(id: number): Promise<AIContentJob | null> {
    const row = await this.db.prepare(
      'SELECT * FROM cms_ai_content_jobs WHERE id = ?'
    ).bind(id).first();
    
    return row ? AIContentJobSchema.parse(row) : null;
  }

  async getPendingAIContentJobs(): Promise<AIContentJob[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_ai_content_jobs WHERE status = ? ORDER BY created_at ASC'
    ).bind('pending').all();
    
    return results.map(row => AIContentJobSchema.parse(row));
  }

  // ===============================
  // AI CONTENT HISTORY
  // ===============================

  async createAIContentHistory(history: Omit<AIContentHistory, 'id' | 'created_at'>): Promise<AIContentHistory> {
    const result = await this.db.prepare(`
      INSERT INTO cms_ai_content_history (
        job_id, content, version, created_by
      ) VALUES (?, ?, ?, ?)
      RETURNING *
    `).bind(
      history.job_id,
      history.content,
      history.version,
      history.created_by
    ).run();
    
    const row = result.results[0];
    return AIContentHistorySchema.parse(row);
  }

  async getAIContentHistoryByJob(jobId: number): Promise<AIContentHistory[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM cms_ai_content_history WHERE job_id = ? ORDER BY version ASC'
    ).bind(jobId).all();
    
    return results.map(row => AIContentHistorySchema.parse(row));
  }
}