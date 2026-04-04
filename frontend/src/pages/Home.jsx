import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Import AuthContext

export default function Home() {
  const { userToken, photToken } = useContext(AuthContext); // Get login state

  // Brand Colors (Cyan Palette)
  const primaryColor = "cyan-700"; 
  const primaryHover = "cyan-800";
  const accentBg = "cyan-50";

  return (
    <div className="bg-white font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className={`relative bg-${accentBg} pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="z-10">
              <span className={`text-${primaryColor} font-bold tracking-wider uppercase text-sm`}>
                AI-Powered Photo Delivery
              </span>
              
              {/* UPDATED HEADLINE */}
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
                Every Memory. <br/>
                Every Moment. <br/>
                <span className={`text-${primaryColor}`}>Instantly Yours.</span>
              </h1>
              
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-lg font-medium">
                From weddings to parties, stop scrolling through thousands of photos. 
                Simply upload a selfie, and our smart AI will filter and deliver 
                only the photos that feature <strong>you</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* --- DYNAMIC BUTTON LOGIC --- */}
                
                {/* Scenario 1: Logged in as Photographer */}
                {photToken ? (
                  <Link 
                    to="/photographer/dashboard" 
                    className={`px-8 py-4 bg-${primaryColor} text-white font-bold rounded-lg shadow-md hover:bg-${primaryHover} transition transform hover:-translate-y-1 text-center w-full sm:w-auto`}
                  >
                    + Create Group
                  </Link>
                ) : 
                
                /* Scenario 2: Logged in as User */
                userToken ? (
                  <Link 
                    to="/join" 
                    className={`px-8 py-4 bg-${primaryColor} text-white font-bold rounded-lg shadow-md hover:bg-${primaryHover} transition transform hover:-translate-y-1 text-center w-full sm:w-auto`}
                  >
                    Join a Group
                  </Link>
                ) : 
                
                /* Scenario 3: Not Logged In (Guest) */
                (
                  <>
                    {/* Button 1: Redirects to User Login */}
                    <Link 
                      to="/login" 
                      className={`px-8 py-4 bg-${primaryColor} text-white font-bold rounded-lg shadow-md hover:bg-${primaryHover} transition transform hover:-translate-y-1 text-center`}
                    >
                      Find Your Photos
                    </Link>
                    
                    {/* Button 2: Redirects to Photographer Signup */}
                    <Link 
                      to="/signup" 
                      className={`px-8 py-4 bg-white text-${primaryColor} border-2 border-${primaryColor} font-bold rounded-lg shadow-sm hover:bg-gray-50 transition text-center`}
                    >
                      I'm a Photographer
                    </Link>
                  </>
                )}
                
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-gray-600 text-sm font-medium">
                <div className="flex -space-x-2">
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/150?img=32" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/150?img=12" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/150?img=5" alt="User" />
                </div>
                <p>Trusted by Photographers and Users</p>
              </div>
            </div>

            {/* Hero Image Bundle */}
            <div className="relative hidden lg:block">
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
              <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10 transform rotate-2 hover:rotate-0 transition duration-500 ease-in-out p-4">
                  <div className="space-y-4">
                      <img src="https://images.pexels.com/photos/1456613/pexels-photo-1456613.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Indian Wedding" className="rounded-2xl shadow-xl object-cover h-64 w-full align-middle lg:mt-12"/>
                      <img src="https://images.pexels.com/photos/1045541/pexels-photo-1045541.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Haldi Ceremony" className="rounded-2xl shadow-xl object-cover h-48 w-full align-middle"/>
                  </div>
                  <div className="space-y-4 lg:-mt-12">
                      <img src="https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Engagement Ring" className="rounded-2xl shadow-xl object-cover h-56 w-full align-middle"/>
                      <img src="https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Celebration" className="rounded-2xl shadow-xl object-cover h-64 w-full align-middle"/>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* --- EVENT TYPES BANNER --- */}
       <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-gray-500 font-semibold uppercase tracking-widest mb-8 text-sm">Perfect for every Celebration</h3>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-80">
                <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">💍</span>
                    <span className="font-bold text-gray-700">Weddings</span>
                </div>
                 <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">🎉</span>
                    <span className="font-bold text-gray-700">Receptions</span>
                </div>
                 <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">✨</span>
                    <span className="font-bold text-gray-700">Engagements</span>
                </div>
                 <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">🎂</span>
                    <span className="font-bold text-gray-700">Birthdays</span>
                </div>
            </div>
        </div>
       </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How Metapic Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">Three simple steps to get your memories delivered instantly.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-700 opacity-0 group-hover:opacity-5 transition duration-300"></div>
              <div className="w-20 h-20 bg-cyan-50 text-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
                📸
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">1. Photographer Uploads</h3>
              <p className="text-gray-600 leading-relaxed">Photographers create a private event group and upload bulk photos securely to our cloud.</p>
            </div>

            {/* Step 2 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition relative overflow-hidden group">
               <div className="absolute inset-0 bg-cyan-700 opacity-0 group-hover:opacity-5 transition duration-300"></div>
              <div className="w-20 h-20 bg-cyan-50 text-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
                🤳
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">2. You Join & Verify</h3>
              <p className="text-gray-600 leading-relaxed">Guests join via a link or code and upload just one quick selfie for secure identification.</p>
            </div>

            {/* Step 3 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition relative overflow-hidden group">
               <div className="absolute inset-0 bg-cyan-700 opacity-0 group-hover:opacity-5 transition duration-300"></div>
              <div className="w-20 h-20 bg-cyan-50 text-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">3. Get Your Photos</h3>
              <p className="text-gray-600 leading-relaxed">Our advanced AI scans the event and delivers your personalized gallery instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUE PROPOSITION FOR PHOTOGRAPHERS --- */}
      <section className="py-20 bg-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-6 leading-tight">Grow Your Photography Business with AI</h2>
             <p className="text-cyan-100 mb-8 text-lg">Stand out in the crowded Indian market by offering a premium, high-tech delivery experience that clients love.</p>
            
            <ul className="space-y-6">
              <li className="flex items-start">
                <span className="bg-white/20 p-3 rounded-xl mr-4 text-2xl">⚡</span>
                <div>
                  <h4 className="font-bold text-xl mb-1">Instant Client Gratification</h4>
                  <p className="text-cyan-100">Deliver photos during the event itself. Let guests share professionally shot images instantly.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-white/20 p-3 rounded-xl mr-4 text-2xl">🔒</span>
                <div>
                  <h4 className="font-bold text-xl mb-1">Enhanced Privacy</h4>
                  <p className="text-cyan-100">Respect guest privacy. No more dumping thousands of photos into a public Google Drive link.</p>
                </div>
              </li>
            </ul>
             <div className="mt-10">
             {/* Redirects to Signup if not logged in, or dashboard if logged in */}
             {photToken ? (
                <Link 
                  to="/photographer/dashboard" 
                  className="px-8 py-4 bg-white text-cyan-700 font-bold rounded-lg shadow-lg hover:bg-cyan-50 transition transform hover:-translate-y-1 inline-block"
                >
                  Go to Dashboard
                </Link>
             ) : (
                <Link 
                  to="/signup" 
                  className="px-8 py-4 bg-white text-cyan-700 font-bold rounded-lg shadow-lg hover:bg-cyan-50 transition transform hover:-translate-y-1 inline-block"
                >
                  Start Free Trial
                </Link>
             )}
             </div>
          </div>
           <div className="order-1 md:order-2 relative">
            <img 
              src="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Photographer at Indian Event" 
              className="rounded-2xl shadow-2xl border-4 border-white/20 relative z-10"
            />
            <div className="absolute top-10 -right-10 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl -z-0"></div>
          </div>
        </div>
      </section>

       {/* --- TESTIMONIALS --- */}
       <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-12">What People Are Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
                    <div className="flex items-center mb-4">
                         <img className="w-12 h-12 rounded-full object-cover mr-4" src="https://i.pravatar.cc/150?img=5" alt="Priya Sharma" />
                        <div>
                            <h4 className="font-bold text-gray-900">Priya Sharma</h4>
                            <p className="text-sm text-gray-500">Wedding Guest, Mumbai</p>
                        </div>
                    </div>
                    <p className="text-gray-600 italic">"It was magic! I usually never find my photos at big weddings. With KwikPic, I took one selfie and boom—all my candid moments were right there."</p>
                </div>
                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
                    <div className="flex items-center mb-4">
                         <img className="w-12 h-12 rounded-full object-cover mr-4" src="https://i.pravatar.cc/150?img=11" alt="Rahul Verma" />
                        <div>
                            <h4 className="font-bold text-gray-900">Rahul Verma</h4>
                            <p className="text-sm text-gray-500">Photographer, Pune</p>
                        </div>
                    </div>
                    <p className="text-gray-600 italic">"My clients love this feature. It adds a premium touch to my services and saves me hours of answering 'can you send my photo' requests."</p>
                </div>
                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
                    <div className="flex items-center mb-4">
                         <img className="w-12 h-12 rounded-full object-cover mr-4" src="https://i.pravatar.cc/150?img=9" alt="Aditya" />
                        <div>
                            <h4 className="font-bold text-gray-900">Manoj & Aarti</h4>
                            <p className="text-sm text-gray-500">Newlyweds, Mumbai</p>
                        </div>
                    </div>
                    <p className="text-gray-600 italic">"We used Metapic for our Engagement. Our guests were blown away by how quickly they got their photos. It made sharing memories so much easier."</p>
                </div>
            </div>
        </div>
       </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4 tracking-wider">Metapic</h3>
          <p className="mb-8 font-medium">Made by Akshay Sose</p>
          <div className="border-t border-gray-800 pt-8 text-sm">
            &copy; {new Date().getFullYear()} Metapic. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}