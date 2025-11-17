import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ramkund from '@/assets/ramkund.png';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
  <header
    className="absolute top-0 left-0 w-full z-20 bg-transparent text-white"
  >
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <Logo variant="light" />
        <div className="space-x-2">
          <Button
            variant="ghost"
            className="bg-white text-pilgrim-orange hover:bg-gray-100"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button
            className="bg-white text-pilgrim-orange hover:bg-gray-100"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  </header>


      {/* Hero Section with Background */}
<section
  className="relative text-white py-12 md:py-24 bg-center bg-cover"
  style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://www.tripsavvy.com/thmb/BnpcR3UsBt6VwS7mM0iOsMoec6c=/2121x1414/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-466937608-ae14b8d3d84a442c95903100b706927c.jpg')`,
    backgroundAttachment: 'fixed',
  }}
>
  <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:items-start md:space-x-10">
    <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shadow-lg">
        Keep Pilgrims Safe & Connected
      </h1>
      <p className="text-xl mb-8 max-w-lg mx-auto md:mx-0">
        The ultimate safety companion for pilgrims, authorities, and event organizers to prevent and resolve missing person incidents.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
        <Button 
          size="lg" 
          className="bg-white text-pilgrim-orange hover:bg-gray-100 font-semibold shadow-md"
          onClick={() => navigate('/signup')}
        >
          Get Started
        </Button>
      </div>
    </div>

    <div className="md:w-1/2 flex justify-center md:justify-end">
    </div>
  </div>

  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none"></div>
</section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-pilgrim-brown mb-4">
              Comprehensive Safety Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilgrim Safe Haven offers powerful tools for both pilgrims and authorities to ensure safety and quick resolution of incidents.
            </p>
          </div>

          <Tabs defaultValue="pilgrims" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="pilgrims">For Pilgrims</TabsTrigger>
              <TabsTrigger value="authorities">For Authorities</TabsTrigger>
              <TabsTrigger value="admin">For Admins</TabsTrigger>
            </TabsList>

            <TabsContent value="pilgrims" className="animate-fade-in">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Lost Person */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">
                    Lost Person Reporting
                  </h3>
                  <p className="text-gray-600">
                    Quickly report missing persons with details and photos for faster identification and resolution.
                  </p>
                </div>

                {/* Safe Route */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">
                    Safe Route Planning
                  </h3>
                  <p className="text-gray-600">
                    Get AI-powered route suggestions to avoid crowded areas and navigate safely to your destination.
                  </p>
                </div>

                {/* Emergency */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">
                    Emergency SOS
                  </h3>
                  <p className="text-gray-600">
                    One-tap emergency services with automatic location sharing for immediate assistance.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Authorities Features */}
            <TabsContent value="authorities" className="animate-fade-in">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Real-time Crowd Monitoring */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">Real-time Crowd Monitoring</h3>
                  <p className="text-gray-600">Monitor crowd density from CCTV feeds and dashboards to prevent congestion.</p>
                </div>

                {/* Rapid Alerts */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5l-2.121 2.121M8.621 15.379L6.5 17.5m12 0l-2.121-2.121M8.621 8.621L6.5 6.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">Rapid Alert Broadcasts</h3>
                  <p className="text-gray-600">Push emergency and crowd-control alerts to ground teams and screens instantly.</p>
                </div>

                {/* Missing Person Matching */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">Missing Person Matching</h3>
                  <p className="text-gray-600">Use AI-assisted search to match new reports with sightings and CCTV detections.</p>
                </div>
              </div>
            </TabsContent>

            {/* Admin Features */}
            <TabsContent value="admin" className="animate-fade-in">
              <div className="grid md:grid-cols-3 gap-8">
                {/* User Management */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">User Management & Roles</h3>
                  <p className="text-gray-600">Manage authorities, operators, and user permissions with fine-grained roles.</p>
                </div>

                {/* System Analytics */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l6-6 4.5 4.5L21 4.5M3 19.5h18" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">System Analytics & Reports</h3>
                  <p className="text-gray-600">Track incident trends, response times, and operational KPIs across the system.</p>
                </div>

                {/* Configuration */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pilgrim-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94l.879-1.757a1.5 1.5 0 012.556 0l.879 1.757a1.5 1.5 0 001.054.82l1.945.389a1.5 1.5 0 011.2 1.2l.389 1.945a1.5 1.5 0 00.82 1.054l1.757.879a1.5 1.5 0 010 2.556l-1.757.879a1.5 1.5 0 00-.82 1.054l-.389 1.945a1.5 1.5 0 01-1.2 1.2l-1.945.389a1.5 1.5 0 00-1.054.82l-.879 1.757a1.5 1.5 0 01-2.556 0l-.879-1.757a1.5 1.5 0 00-1.054-.82l-1.945-.389a1.5 1.5 0 01-1.2-1.2l-.389-1.945a1.5 1.5 0 00-.82-1.054l-1.757-.879a1.5 1.5 0 010-2.556l1.757-.879a1.5 1.5 0 00.82-1.054l.389-1.945a1.5 1.5 0 011.2-1.2l1.945-.389a1.5 1.5 0 001.054-.82z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-pilgrim-brown">Configuration & Permissions</h3>
                  <p className="text-gray-600">Configure integrations, safety thresholds, and global settings with audit trails.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-pilgrim-brown mb-4">
            Ready to Keep Pilgrims Safe?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Join the platform that's helping authorities and pilgrims stay connected and safe during large gatherings and events.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="pilgrim-gradient hover:opacity-90"
              onClick={() => navigate('/signup')}
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
