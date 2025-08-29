import { Link } from 'react-router';
import { Shield, Eye, Lock, Database, Mail, Phone } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = 'December 15, 2024';

  const quickLinks = [
    { name: 'What We Collect', href: '#collection' },
    { name: 'How We Use Data', href: '#usage' },
    { name: 'Data Sharing', href: '#sharing' },
    { name: 'Your Rights', href: '#rights' },
    { name: 'Security', href: '#security' },
    { name: 'Contact Us', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#2957c3] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100 mb-2">
              Your privacy is fundamental to how we operate
            </p>
            <p className="text-blue-200">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[#2957c3] hover:text-blue-700 text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At HabibiStay ("we," "our," or "us"), we are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                platform, mobile application, and services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using HabibiStay, you consent to the data practices described in this policy. We operate in compliance 
                with applicable data protection laws, including the Saudi Arabia Personal Data Protection Law (PDPL).
              </p>
            </section>

            {/* Data Collection */}
            <section id="collection">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 mr-2 text-[#2957c3]" />
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Government-issued ID for verification purposes</li>
                    <li>Payment information (processed securely through MyFatoorah)</li>
                    <li>Profile photos and personal preferences</li>
                    <li>Communication history and support interactions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Search queries and booking history</li>
                    <li>Property browsing and interaction data</li>
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>App usage analytics and performance metrics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Property details and photos</li>
                    <li>Rental history and pricing data</li>
                    <li>Reviews and ratings</li>
                    <li>Property ownership verification documents</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section id="usage">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-[#2957c3]" />
                How We Use Your Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Delivery</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Process bookings and payments</li>
                    <li>• Facilitate communication between users</li>
                    <li>• Provide customer support</li>
                    <li>• Verify identity and prevent fraud</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Improvement</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Analyze usage patterns and preferences</li>
                    <li>• Improve search and recommendation algorithms</li>
                    <li>• Develop new features and services</li>
                    <li>• Conduct market research and analytics</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Send booking confirmations and updates</li>
                    <li>• Provide important service announcements</li>
                    <li>• Share promotional offers (with consent)</li>
                    <li>• Conduct satisfaction surveys</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Compliance</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Comply with legal obligations</li>
                    <li>• Respond to legal requests</li>
                    <li>• Protect against fraud and abuse</li>
                    <li>• Enforce our terms of service</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section id="sharing">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-[#2957c3] pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">With Other Users</h3>
                  <p className="text-gray-600 text-sm">
                    When you book or list a property, we share necessary information to facilitate the transaction, 
                    such as contact details and booking information.
                  </p>
                </div>

                <div className="border-l-4 border-[#2957c3] pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Service Providers</h3>
                  <p className="text-gray-600 text-sm">
                    We work with trusted third-party providers for payment processing, email delivery, 
                    analytics, and customer support services.
                  </p>
                </div>

                <div className="border-l-4 border-[#2957c3] pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                  <p className="text-gray-600 text-sm">
                    We may disclose information when required by law, legal process, or to protect 
                    the rights, property, or safety of HabibiStay, our users, or others.
                  </p>
                </div>

                <div className="border-l-4 border-[#2957c3] pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Business Transfers</h3>
                  <p className="text-gray-600 text-sm">
                    In the event of a merger, acquisition, or sale of assets, your information may be 
                    transferred as part of the transaction.
                  </p>
                </div>
              </div>
            </section>

            {/* User Rights */}
            <section id="rights">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">You have the right to:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3"></span>
                      Access your personal information
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3"></span>
                      Correct inaccurate information
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3"></span>
                      Delete your account and data
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3"></span>
                      Export your data
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3"></span>
                      Object to data processing
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#2957c3] rounded-full mr-3"></span>
                      Opt-out of marketing communications
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                To exercise these rights, please contact us using the information provided below. 
                We will respond to your request within 30 days.
              </p>
            </section>

            {/* Security */}
            <section id="security">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-[#2957c3]" />
                Data Security
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Lock className="h-8 w-8 text-[#2957c3] mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
                  <p className="text-gray-600 text-sm">All data transmission is encrypted using SSL/TLS protocols</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-8 w-8 text-[#2957c3] mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Access Control</h4>
                  <p className="text-gray-600 text-sm">Strict access controls and regular security audits</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-[#2957c3] mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Data Storage</h4>
                  <p className="text-gray-600 text-sm">Secure data centers with backup and recovery systems</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have questions about this Privacy Policy or how we handle your information, please contact us:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Privacy Officer</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-[#2957c3] mr-3" />
                      <span className="text-gray-700">privacy@habibistay.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-[#2957c3] mr-3" />
                      <span className="text-gray-700">+966-55-0800-669</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Mailing Address</h3>
                  <p className="text-gray-700">
                    HabibiStay Privacy Department<br />
                    Riyadh, Saudi Arabia
                  </p>
                  <Link
                    to="/contact"
                    className="inline-block mt-4 text-[#2957c3] hover:text-blue-700 font-medium"
                  >
                    Contact Form →
                  </Link>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Policy Updates</h3>
              <p className="text-gray-600 text-sm">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by email or through our platform. Your continued use of HabibiStay after such changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
