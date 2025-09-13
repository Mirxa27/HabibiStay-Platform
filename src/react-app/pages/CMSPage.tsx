import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useCMS } from '../contexts/CMSContext';

export default function CMSPage() {
  const { slug } = useParams<{ slug: string }>();
  const { loading, error } = useCMS();
  const [pageContent, setPageContent] = useState<any>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      if (!slug) return;
      
      try {
        const response = await fetch(`/api/cms/pages/slug/${slug}`);
        const data = await response.json();
        
        if (data.success) {
          setPageContent(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch page content:', err);
      }
    };

    fetchPageContent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2957c3]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Page</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <a
            href="/"
            className="bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#2957c3] to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{pageContent.title}</h1>
          {pageContent.metadata && (
            <div 
              className="text-lg opacity-90"
              dangerouslySetInnerHTML={{ 
                __html: JSON.parse(pageContent.metadata)?.seoDescription || '' 
              }}
            />
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {pageContent.content ? (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: pageContent.content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              This page is under construction. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}