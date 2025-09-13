import { useState } from 'react';
import { 
  Type, 
  Image, 
  Layout, 
  Menu, 
  Star, 
  MapPin, 
  Calendar,
  User,
  Mail,
  Phone,
  Heart,
  Share2,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Play,
  Check,
  X
} from 'lucide-react';

interface ComponentItem {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  preview: React.ReactNode;
}

const componentLibrary: ComponentItem[] = [
  {
    id: 'hero',
    type: 'hero',
    name: 'Hero Section',
    description: 'Large banner with headline and call-to-action',
    icon: <Layout className="w-5 h-5" />,
    category: 'Layout',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h2 className="text-xl font-bold mb-2">Welcome to Our Platform</h2>
        <p className="text-sm mb-4">Discover amazing experiences tailored just for you</p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium text-sm">
          Get Started
        </button>
      </div>
    )
  },
  {
    id: 'text',
    type: 'text',
    name: 'Text Block',
    description: 'Rich text content with formatting options',
    icon: <Type className="w-5 h-5" />,
    category: 'Content',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-bold mb-2">About Our Service</h3>
        <p className="text-sm text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
        </p>
      </div>
    )
  },
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    description: 'Single image with optional caption',
    icon: <Image className="w-5 h-5" />,
    category: 'Media',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
        <p className="text-xs text-center mt-2 text-gray-500">Image Component</p>
      </div>
    )
  },
  {
    id: 'gallery',
    type: 'gallery',
    name: 'Image Gallery',
    description: 'Grid of images with lightbox functionality',
    icon: <Image className="w-5 h-5" />,
    category: 'Media',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 border-2 border-dashed rounded w-8 h-8" />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'button',
    type: 'button',
    name: 'Button',
    description: 'Interactive button with customizable style',
    icon: <Layout className="w-5 h-5" />,
    category: 'Interactive',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4 text-center">
        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
          Click Me
        </button>
      </div>
    )
  },
  {
    id: 'card',
    type: 'card',
    name: 'Content Card',
    description: 'Flexible card component for content',
    icon: <Layout className="w-5 h-5" />,
    category: 'Layout',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="bg-gray-200 border-2 border-dashed rounded w-12 h-12 mb-2" />
        <h4 className="font-medium text-sm">Card Title</h4>
        <p className="text-xs text-gray-500 mt-1">Card description text</p>
      </div>
    )
  },
  {
    id: 'testimonial',
    type: 'testimonial',
    name: 'Testimonial',
    description: 'Customer review with rating',
    icon: <Star className="w-5 h-5" />,
    category: 'Content',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
        </div>
        <p className="text-xs text-gray-600">"Amazing service! Highly recommended."</p>
        <p className="text-xs font-medium mt-1">- John Doe</p>
      </div>
    )
  },
  {
    id: 'form',
    type: 'form',
    name: 'Contact Form',
    description: 'Form for collecting user information',
    icon: <Mail className="w-5 h-5" />,
    category: 'Interactive',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-8 bg-blue-500 rounded w-1/3 mt-2"></div>
        </div>
      </div>
    )
  },
  {
    id: 'map',
    type: 'map',
    name: 'Map',
    description: 'Interactive map with location markers',
    icon: <MapPin className="w-5 h-5" />,
    category: 'Media',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="bg-gray-200 border-2 border-dashed rounded w-full h-16 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    )
  },
  {
    id: 'property-card',
    type: 'property-card',
    name: 'Property Card',
    description: 'Card for displaying property information',
    icon: <Layout className="w-5 h-5" />,
    category: 'Content',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="bg-gray-200 border-2 border-dashed rounded w-full h-12 mb-2"></div>
        <h4 className="font-medium text-sm">Luxury Villa</h4>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <MapPin className="w-3 h-3 mr-1" />
          <span>Riyadh, Saudi Arabia</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-medium text-sm">250 SAR/night</span>
          <div className="flex items-center">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs ml-1">4.8</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'search',
    type: 'search',
    name: 'Search Bar',
    description: 'Search input with filters',
    icon: <Search className="w-5 h-5" />,
    category: 'Interactive',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-1 h-6 bg-gray-200 rounded-l"></div>
          <div className="w-16 h-6 bg-blue-500 rounded-r"></div>
        </div>
        <div className="flex space-x-2 mt-2">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-10"></div>
        </div>
      </div>
    )
  },
  {
    id: 'navigation',
    type: 'navigation',
    name: 'Navigation Menu',
    description: 'Site navigation with dropdowns',
    icon: <Menu className="w-5 h-5" />,
    category: 'Layout',
    preview: (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex space-x-4">
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <div key={item} className="h-3 bg-gray-200 rounded w-10"></div>
          ))}
        </div>
      </div>
    )
  }
];

interface ComponentLibraryProps {
  onComponentSelect: (component: ComponentItem) => void;
}

export default function ComponentLibrary({ onComponentSelect }: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Layout', 'Content', 'Media', 'Interactive'];

  const filteredComponents = activeCategory === 'All' 
    ? componentLibrary 
    : componentLibrary.filter(comp => comp.category === activeCategory);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Category Filter */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-[#2957c3] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Component Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredComponents.map((component) => (
            <button
              key={component.id}
              onClick={() => onComponentSelect(component)}
              className="border border-gray-200 rounded-lg p-3 text-left hover:border-[#2957c3] hover:shadow-sm transition-all group"
            >
              <div className="mb-2 text-[#2957c3] group-hover:text-[#2957c3]">
                {component.icon}
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">{component.name}</h3>
              <p className="text-xs text-gray-500">{component.description}</p>
              <div className="mt-3">
                {component.preview}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No components found</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}

// Export the component library data for use in other parts of the application
export { componentLibrary };
export type { ComponentItem };