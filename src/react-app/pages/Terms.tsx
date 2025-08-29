import { Link } from 'react-router';
import { FileText, Scale, Shield, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = 'December 15, 2024';

  const quickLinks = [
    { name: 'Acceptance', href: '#acceptance' },
    { name: 'Services', href: '#services' },
    { name: 'User Accounts', href: '#accounts' },
    { name: 'Bookings & Payments', href: '#bookings' },
    { name: 'Property Listings', href: '#listings' },
    { name: 'Prohibited Activities', href: '#prohibited' },
    { name: 'Liability', href: '#liability' },
    { name: 'Termination', href: '#termination' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#2957c3] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-blue-100 mb-2">
              Legal terms and conditions for using HabibiStay
            </p>
            <p className="text-blue-200">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            
            {/* Acceptance */}
            <section id="acceptance">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Scale className="h-6 w-6 mr-2 text-[#2957c3]" />
                Acceptance of Terms
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Welcome to HabibiStay. These Terms of Service ("Terms") govern your use of our platform, 
                mobile application, and related services (collectively, the "Service") operated by 
                HabibiStay ("we," "our," or "us").
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
                with any part of these terms, then you may not access the Service.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> These terms constitute a legal agreement between you and HabibiStay. 
                  Please read them carefully before using our services.
                </p>
              </div>
            </section>

            {/* Services */}
            <section id="services">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Services</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">HabibiStay Platform</h3>
                  <p className="text-gray-600 mb-4">
                    HabibiStay provides an online platform that connects property owners ("Hosts") with 
                    individuals seeking short-term accommodations ("Guests"), as well as investment 
                    opportunities in real estate.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">For Guests</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Property search and booking</li>
                        <li>• AI assistant support</li>
                        <li>• Secure payment processing</li>
                        <li>• Review and rating system</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">For Hosts</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Property listing management</li>
                        <li>• Guest communication tools</li>
                        <li>• Revenue optimization</li>
                        <li>• Performance analytics</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">For Investors</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Investment opportunities</li>
                        <li>• Portfolio management</li>
                        <li>• Performance tracking</li>
                        <li>• Market insights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section id="accounts">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Registration</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>You must provide accurate, current, and complete information during registration</li>
                    <li>You must be at least 18 years old to create an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You agree to notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Verification</h3>
                  <p className="text-gray-600 mb-2">
                    We may require identity verification for certain activities, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Booking high-value properties</li>
                    <li>Listing properties as a Host</li>
                    <li>Making investment transactions</li>
                    <li>Accessing advanced platform features</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Bookings & Payments */}
            <section id="bookings">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bookings and Payments</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h4 className="font-medium mb-2">Guest Responsibilities:</h4>
                      <ul className="space-y-1">
                        <li>• Provide accurate booking information</li>
                        <li>• Comply with property rules</li>
                        <li>• Respect check-in/check-out times</li>
                        <li>• Report damages immediately</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Host Responsibilities:</h4>
                      <ul className="space-y-1">
                        <li>• Provide accurate property descriptions</li>
                        <li>• Maintain property standards</li>
                        <li>• Honor confirmed bookings</li>
                        <li>• Respond promptly to guest inquiries</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Terms</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>All payments are processed through our secure payment partner, MyFatoorah</li>
                    <li>Payment is due in full at the time of booking confirmation</li>
                    <li>Service fees and taxes are clearly disclosed before payment</li>
                    <li>Refunds are subject to the cancellation policy of each property</li>
                    <li>Host payouts are processed according to our payment schedule</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
                  <p className="text-gray-600 mb-3">
                    Cancellation policies vary by property and are set by individual Hosts:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Flexible</h4>
                      <p className="text-gray-600 text-sm">Full refund up to 24 hours before check-in</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Moderate</h4>
                      <p className="text-gray-600 text-sm">Full refund up to 5 days before check-in</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Strict</h4>
                      <p className="text-gray-600 text-sm">50% refund up to 7 days before check-in</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Property Listings */}
            <section id="listings">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Listings</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Listing Requirements</h3>
                  <p className="text-gray-600 mb-3">
                    As a Host, you represent and warrant that:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>You have the legal right to rent the property</li>
                    <li>All property information and photos are accurate and current</li>
                    <li>The property meets local safety and legal requirements</li>
                    <li>You will honor all confirmed bookings</li>
                    <li>You comply with applicable laws and regulations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Standards</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Property descriptions must be truthful and not misleading</li>
                    <li>Photos must accurately represent the property</li>
                    <li>Pricing must be transparent with no hidden fees</li>
                    <li>House rules must be clearly stated</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section id="prohibited">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-500" />
                Prohibited Activities
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800 mb-4">
                  The following activities are strictly prohibited on our platform:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">General Prohibitions</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Fraudulent or deceptive activities</li>
                      <li>• Harassment or discrimination</li>
                      <li>• Violating local laws or regulations</li>
                      <li>• Unauthorized commercial activities</li>
                      <li>• Spamming or unsolicited communications</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Platform Abuse</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Creating fake accounts or reviews</li>
                      <li>• Circumventing our fee structure</li>
                      <li>• Interfering with platform operations</li>
                      <li>• Collecting user data without consent</li>
                      <li>• Reverse engineering our systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Liability */}
            <section id="liability">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-[#2957c3]" />
                Limitation of Liability
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Platform Role</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    HabibiStay acts as an intermediary platform connecting Hosts and Guests. We do not own, 
                    operate, manage, or control any properties listed on our platform. We are not a party 
                    to the rental agreements between Hosts and Guests.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Disclaimer of Warranties</h3>
                  <p className="text-gray-600 mb-3">
                    Our service is provided "as is" and "as available" without warranties of any kind, either 
                    express or implied, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Accuracy of property listings or user-generated content</li>
                    <li>Quality or condition of properties</li>
                    <li>Conduct of users or third parties</li>
                    <li>Uninterrupted or error-free service</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Damages</h3>
                  <p className="text-gray-600 text-sm">
                    To the maximum extent permitted by law, HabibiStay shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages, including but not limited to 
                    loss of profits, data, or use, regardless of the theory of liability.
                  </p>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section id="termination">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">By You</h3>
                  <p className="text-gray-600">
                    You may terminate your account at any time by contacting our support team or using 
                    the account deletion feature in your profile settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">By HabibiStay</h3>
                  <p className="text-gray-600 mb-3">
                    We may suspend or terminate your account if you:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Violate these Terms of Service</li>
                    <li>Engage in prohibited activities</li>
                    <li>Provide false or misleading information</li>
                    <li>Harm the integrity or security of our platform</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the 
                Kingdom of Saudi Arabia. Any disputes arising under these Terms shall be subject to 
                the exclusive jurisdiction of the courts of Riyadh, Saudi Arabia.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Questions About These Terms?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@habibistay.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +966-55-0800-669
                </p>
                <Link
                  to="/contact"
                  className="inline-block text-[#2957c3] hover:text-blue-700 font-medium"
                >
                  Contact Form →
                </Link>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Changes to These Terms</h3>
              <p className="text-gray-600 text-sm">
                We reserve the right to modify these Terms at any time. We will notify users of any 
                material changes by email or through our platform. Your continued use of HabibiStay 
                after such changes constitutes acceptance of the updated Terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
