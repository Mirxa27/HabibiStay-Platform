import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

export default function ContactPage() {
  const { openChat } = useChat();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', interest: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      info: '+966-55-0800-669',
      description: 'Available 9 AM - 6 PM (GST)'
    },
    {
      icon: Mail,
      title: 'Email',
      info: 'info@habibistay.com',
      description: 'We respond within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Office',
      info: 'HabibiStay HQ, Riyadh',
      description: 'Saudi Arabia'
    }
  ];

  const interestOptions = [
    'Guest - Booking Assistance',
    'Property Owner - List My Property',
    'Investor - Investment Opportunities',
    'Media & Partnerships',
    'General Inquiry'
  ];

  if (isSubmitted) {
    return (
      <div className={cn(
        "min-h-screen bg-gray-50",
        responsiveClasses.flex.center
      )}>
        <div className={cn(
          "max-w-sm sm:max-w-md mx-auto text-center",
          responsiveClasses.card.base,
          "shadow-lg",
          responsiveClasses.card.padding,
          responsiveClasses.padding.page
        )}>
          <div className={cn(
            "w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          )}>
            <Send className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
          <h2 className={cn(
            responsiveClasses.text.h3,
            "text-gray-900 mb-3 sm:mb-4"
          )}>
            Thank You!
          </h2>
          <p className={cn(
            responsiveClasses.text.small,
            "text-gray-600 mb-4 sm:mb-6"
          )}>
            Your message has been sent successfully. Our team will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className={cn(
              "bg-[#2957c3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors",
              responsiveClasses.button.primary,
              utils.touchTarget
            )}
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className={cn(
        "bg-gradient-to-br from-[#2957c3] to-blue-800 text-white",
        "py-12 sm:py-16 md:py-20"
      )}>
        <div className={containers.page}>
          <div className={cn(
            "text-center",
            responsiveClasses.padding.page
          )}>
            <h1 className={cn(
              responsiveClasses.text.h1,
              "mb-4 sm:mb-6"
            )}>
              Get in Touch
            </h1>
            <p className={cn(
              "text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8",
              responsiveClasses.text.body
            )}>
              Have questions about stays, investments, or partnerships? We're here to help you succeed.
            </p>
            <button
              onClick={openChat}
              className={cn(
                "bg-white text-[#2957c3] rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center",
                responsiveClasses.button.primary,
                utils.touchTarget
              )}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Chat with Sara
            </button>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className={cn(
        "py-12 sm:py-16 bg-white"
      )}>
        <div className={containers.page}>
          <div className={cn(
            responsiveClasses.grid.triple,
            "gap-6 sm:gap-8 mb-12 sm:mb-16",
            responsiveClasses.padding.page
          )}>
            {contactInfo.map((item, index) => (
              <div key={index} className="text-center">
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 bg-[#2957c3] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                )}>
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#2957c3]" />
                </div>
                <h3 className={cn(
                  responsiveClasses.text.h4,
                  "text-gray-900 mb-1 sm:mb-2"
                )}>{item.title}</h3>
                <p className={cn(
                  responsiveClasses.text.small,
                  "text-[#2957c3] font-semibold mb-1"
                )}>{item.info}</p>
                <p className={cn(
                  responsiveClasses.text.small,
                  "text-gray-600"
                )}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className={cn(
        "py-12 sm:py-16 bg-gray-50"
      )}>
        <div className={cn(
          containers.content,
          responsiveClasses.padding.page
        )}>
          <div className={cn(
            responsiveClasses.card.base,
            "shadow-lg",
            responsiveClasses.card.padding
          )}>
            <div className={cn(
              "text-center mb-6 sm:mb-8"
            )}>
              <h2 className={cn(
                responsiveClasses.text.h2,
                "text-gray-900 mb-3 sm:mb-4"
              )}>
                Send Us a Message
              </h2>
              <p className={cn(
                responsiveClasses.text.body,
                "text-gray-600"
              )}>
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </div>

            <form onSubmit={handleSubmit} className={responsiveClasses.form.container}>
              <div className={responsiveClasses.form.group}>
                <div>
                  <label htmlFor="name" className={cn(
                    "block font-medium text-gray-700 mb-1 sm:mb-2",
                    responsiveClasses.text.small
                  )}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={cn(
                      responsiveClasses.form.input,
                      "border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    )}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className={cn(
                    "block font-medium text-gray-700 mb-1 sm:mb-2",
                    responsiveClasses.text.small
                  )}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={cn(
                      responsiveClasses.form.input,
                      "border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    )}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className={responsiveClasses.form.group}>
                <div>
                  <label htmlFor="phone" className={cn(
                    "block font-medium text-gray-700 mb-1 sm:mb-2",
                    responsiveClasses.text.small
                  )}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={cn(
                      responsiveClasses.form.input,
                      "border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    )}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="interest" className={cn(
                    "block font-medium text-gray-700 mb-1 sm:mb-2",
                    responsiveClasses.text.small
                  )}>
                    I'm interested in *
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    required
                    className={cn(
                      responsiveClasses.form.input,
                      "border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent"
                    )}
                  >
                    <option value="">Select your interest</option>
                    {interestOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className={cn(
                  "block font-medium text-gray-700 mb-1 sm:mb-2",
                  responsiveClasses.text.small
                )}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className={cn(
                    responsiveClasses.form.input,
                    "border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2957c3] focus:border-transparent resize-none"
                  )}
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "bg-[#2957c3] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center",
                    responsiveClasses.button.primary,
                    utils.touchTarget
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'How do I book a stay with HabibiStay?',
                answer: 'You can book directly through our website or chat with Sara, our AI assistant, who will help you find and book the perfect accommodation.'
              },
              {
                question: 'What are the requirements to list my property?',
                answer: 'Properties must be in Riyadh, meet safety standards, and provide a high-quality guest experience. Contact our team for a consultation.'
              },
              {
                question: 'How do investment opportunities work?',
                answer: 'We offer various investment vehicles including direct property investment and portfolio shares. Schedule a consultation to learn about current opportunities.'
              },
              {
                question: 'What makes HabibiStay different from other platforms?',
                answer: 'We combine AI-powered guest assistance, professional property management, and transparent investment opportunities specifically for the Saudi market.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
