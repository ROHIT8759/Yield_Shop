import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import ParticlesBackground from '../components/ParticlesBackground';
import MouseEffect from '../components/MouseEffect';
import FAQ from '../components/FAQ';
import UserStats from '../components/UserStats';
import InteractiveStars from '../components/InteractiveStars';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Interactive Stars Background */}
      <InteractiveStars />

      {/* Mouse Cursor Effect */}
      <MouseEffect />

      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      <LandingNavbar />
      <main>
        <Hero />
        <UserStats />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
