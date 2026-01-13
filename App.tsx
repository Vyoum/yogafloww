
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSolution } from './components/ProblemSolution';
import { Timeline } from './components/Timeline';
import { WeeklySchedule } from './components/WeeklySchedule';
import { Instructors } from './components/Instructors';
import { FullInstructors } from './components/FullInstructors';
import { Classes } from './components/Classes';
import { CommunityPage } from './components/CommunityPage';
import { Pricing } from './components/Pricing';
import { FutureVision } from './components/FutureVision';
import { Footer } from './components/Footer';
import { About } from './components/About';
import { MeditationMusic } from './components/MeditationMusic';
import { Asanas } from './components/Asanas';
import { Research } from './components/Research';
import { Contact } from './components/Contact';
import { CustomCursor } from './components/CustomCursor';
import { AuthProvider } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'instructors' | 'classes' | 'about' | 'pricing' | 'community' | 'meditation' | 'asanas' | 'research'>('home');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleViewProfile = (id: string) => {
    setSelectedInstructorId(id);
    setView('instructors');
  };

  const handleNavInstructors = () => {
    setSelectedInstructorId(null);
    setView('instructors');
  };

  const handleNavClasses = () => {
    setView('classes');
  };

  const handleNavAbout = () => {
    setView('about');
  };

  const handleNavPricing = () => {
    setView('pricing');
    // Scroll to top when navigating to pricing
    window.scrollTo(0, 0);
  };

  const handleNavCommunity = () => {
    setView('community');
  };

  const handleNavMeditation = () => {
    setView('meditation');
  };

  const handleNavAsanas = () => {
    setView('asanas');
  };

  const handleNavResearch = () => {
    setView('research');
  };

  const handleNavHome = () => {
    setView('home');
  };

  const handleContactClick = () => {
    setView('home');
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900 antialiased">
      <CustomCursor />
      <Navbar 
        onNavHome={handleNavHome} 
        onNavInstructors={handleNavInstructors}
        onNavClasses={handleNavClasses}
        onNavAbout={handleNavAbout}
        onNavPricing={handleNavPricing}
        onNavCommunity={handleNavCommunity}
        onNavMeditation={handleNavMeditation}
        onNavAsanas={handleNavAsanas}
        onNavResearch={handleNavResearch}
        isHomePage={view === 'home'}
      />
      
      <main>
        {view === 'home' && (
          <>
            <Hero />
            
            <div id="journey">
              <ProblemSolution />
              <Timeline />
            </div>

            <WeeklySchedule />
            
            <Instructors onViewProfile={handleViewProfile} />
            
            <div className="py-24 bg-slate-50">
               <div className="max-w-7xl mx-auto px-6 text-center">
                  <h2 className="text-4xl font-serif font-bold mb-6">Explore the Path</h2>
                  <p className="text-slate-500 mb-10 max-w-2xl mx-auto">Master the foundational postures and understand the clinical research behind every movement.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button 
                      onClick={handleNavAsanas}
                      className="bg-teal-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-teal-700 transition-all shadow-xl"
                    >
                      Browse Asana Library
                    </button>
                    <button 
                      onClick={handleNavResearch}
                      className="bg-white text-teal-600 border border-teal-200 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-teal-50 transition-all shadow-xl"
                    >
                      View Scientific Research
                    </button>
                  </div>
               </div>
            </div>

            <Contact />
            <FutureVision />
          </>
        )}

        {view === 'instructors' && (
          <FullInstructors onBack={handleNavHome} selectedId={selectedInstructorId} />
        )}

        {view === 'classes' && <Classes />}
        {view === 'about' && <About onContactClick={handleContactClick} />}
        {view === 'pricing' && <Pricing />}
        {view === 'community' && <CommunityPage />}
        {view === 'meditation' && <MeditationMusic />}
        {view === 'asanas' && <Asanas />}
        {view === 'research' && <Research />}
      </main>
      
      <Footer 
        onNavHome={handleNavHome} 
        onNavInstructors={handleNavInstructors}
        onNavClasses={handleNavClasses}
        onNavAbout={handleNavAbout}
        onNavPricing={handleNavPricing}
        onNavCommunity={handleNavCommunity}
        isHomePage={view === 'home'}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
