import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:w-1/2">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  Build Beautiful Forms in Minutes
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  FormCraft helps you create, publish, and manage online forms with ease. 
                  Collect responses, integrate with your tools, and analyze results - all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="text-base">
                    <Link href="/login">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base">
                    <Link href="/login">See Demo</Link>
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-primary-500 rounded-lg opacity-5 transform rotate-3"></div>
                  <Card className="w-full border-2 shadow-lg relative z-10">
                    <CardContent className="p-0">
                      <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-sm font-medium text-gray-500 ml-3">Feedback Form</div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Your Name</label>
                          <div className="h-10 w-full bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Email Address</label>
                          <div className="h-10 w-full bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Your Feedback</label>
                          <div className="h-24 w-full bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="pt-2">
                          <div className="bg-primary-500 h-10 rounded-md w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Form Building Features</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Everything you need to create professional forms, collect data, and improve your workflow.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <i className="fas fa-magic text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop Builder</h3>
                <p className="text-gray-600">
                  Build forms with an intuitive interface. No coding required - just drag, drop, and customize.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  <i className="fas fa-check-circle text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Validation</h3>
                <p className="text-gray-600">
                  Set custom validation rules for your fields to ensure you collect accurate data.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  <i className="fas fa-plug text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Webhook Integration</h3>
                <p className="text-gray-600">
                  Send form submissions to any external service using webhooks with authentication.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-4">
                  <i className="fas fa-mobile-alt text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Mobile Responsive</h3>
                <p className="text-gray-600">
                  Forms look great on any device - desktop, tablet, or smartphone.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4">
                  <i className="fas fa-shield-alt text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Security</h3>
                <p className="text-gray-600">
                  Protect your forms with reCAPTCHA, rate limiting, and secure authentication.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  <i className="fas fa-download text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Data Export</h3>
                <p className="text-gray-600">
                  Export your submissions to CSV or JSON formats for further analysis.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-primary-600 text-white py-16">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your First Form?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who create beautiful, effective forms with FormCraft.
            </p>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
              <Link href="/login">Get Started for Free</Link>
            </Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <span className="ml-2 text-gray-800 font-bold text-lg">FormCraft</span>
            </div>
            <div className="text-sm text-gray-600">
              &copy; 2023 FormCraft. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
