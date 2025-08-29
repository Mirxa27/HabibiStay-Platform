import { Link } from 'react-router';
import { Calendar, Clock, ArrowRight, TrendingUp } from 'lucide-react';

export default function BlogPage() {
  const featuredPost = {
    id: 1,
    title: 'Riyadh\'s Tourism Boom: A Golden Opportunity for Investors',
    excerpt: 'With Vision 2030 driving unprecedented growth in Saudi Arabia\'s tourism sector, Riyadh is emerging as a prime destination for real estate investment.',
    image: 'https://images.unsplash.com/photo-1590725175947-49d8c5c4bd8e?auto=format&fit=crop&w=800&h=400',
    category: 'Investment Trends',
    readTime: '8 min read',
    publishDate: '2024-12-15',
    author: 'Abdullah Mirza'
  };

  const blogPosts = [
    {
      id: 2,
      title: 'Essential Property Preparation Tips for Maximum Returns',
      excerpt: 'Learn how to optimize your property for short-term rentals and maximize your revenue potential.',
      image: 'https://images.unsplash.com/photo-1560448204-e1a3ecbdd6cc?auto=format&fit=crop&w=400&h=300',
      category: 'Property Prep',
      readTime: '6 min read',
      publishDate: '2024-12-10',
      author: 'Anna Miroshenchinko'
    },
    {
      id: 3,
      title: 'The Rise of Business Tourism in Riyadh',
      excerpt: 'How Riyadh\'s growing business ecosystem is creating new opportunities for hospitality providers.',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=400&h=300',
      category: 'Tourism Trends',
      readTime: '5 min read',
      publishDate: '2024-12-08',
      author: 'Vladimir Radchenko'
    },
    {
      id: 4,
      title: 'Understanding Riyadh\'s Real Estate Market Dynamics',
      excerpt: 'A comprehensive analysis of factors driving property values and rental demand in the capital.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=300',
      category: 'Market Analysis',
      readTime: '7 min read',
      publishDate: '2024-12-05',
      author: 'Abdullah Mirza'
    },
    {
      id: 5,
      title: 'Smart Home Technology for Modern Rentals',
      excerpt: 'How technology upgrades can enhance guest experience and improve property management efficiency.',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7ad8?auto=format&fit=crop&w=400&h=300',
      category: 'Technology',
      readTime: '4 min read',
      publishDate: '2024-12-01',
      author: 'Vladimir Radchenko'
    },
    {
      id: 6,
      title: 'Cultural Sensitivity in Saudi Hospitality',
      excerpt: 'Best practices for creating welcoming experiences that respect local customs and traditions.',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=400&h=300',
      category: 'Hospitality',
      readTime: '6 min read',
      publishDate: '2024-11-28',
      author: 'Anna Miroshenchinko'
    },
    {
      id: 7,
      title: 'NEOM and The Line: Impact on Riyadh Real Estate',
      excerpt: 'How mega-projects are influencing property demand and investment patterns in the capital.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&h=300',
      category: 'Investment Trends',
      readTime: '9 min read',
      publishDate: '2024-11-25',
      author: 'Abdullah Mirza'
    }
  ];

  const categories = ['All', 'Investment Trends', 'Property Prep', 'Tourism Trends', 'Market Analysis', 'Technology', 'Hospitality'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2957c3] to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Insights & Intelligence
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Stay informed with the latest trends, tips, and analysis from Saudi Arabia's real estate and hospitality experts
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Article</h2>
            <div className="w-16 h-1 bg-[#2957c3]"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-[#2957c3] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {featuredPost.category}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(featuredPost.publishDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {featuredPost.readTime}
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {featuredPost.title}
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">By {featuredPost.author}</span>
                <button className="inline-flex items-center text-[#2957c3] hover:text-blue-700 font-medium">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-[#2957c3] hover:text-white transition-colors text-sm font-medium border border-gray-200"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-[#2957c3] bg-opacity-10 text-[#2957c3] px-2 py-1 rounded text-xs font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">By {post.author}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.publishDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="text-[#2957c3] hover:text-blue-700 font-medium text-sm">
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-[#2957c3] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Ahead of the Market
            </h2>
            <p className="text-xl text-blue-100">
              Get weekly insights and market analysis delivered to your inbox
            </p>
          </div>
          
          <form className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button
                type="submit"
                className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Subscribe
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-3">
              No spam, unsubscribe anytime
            </p>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Put Knowledge into Action?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Transform insights into income with HabibiStay's expert guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/owners"
              className="bg-[#2957c3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              List Your Property
            </Link>
            <Link
              to="/invest"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Explore Investments
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
