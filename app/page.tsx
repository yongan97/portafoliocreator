import Link from "next/link";
import Image from "next/image";
import MarketTicker from "./components/MarketTicker";
import DollarTicker from "./components/DollarTicker";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#021751]/80 backdrop-blur-xl border-b border-[#1036E2]/20">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/vetacap-logo-full.svg"
              alt="VetaCap"
              width={160}
              height={45}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex gap-3">
            <Link
              href="/portfolio/creator"
              className="px-5 py-2 bg-[#1036E2] text-white text-sm font-medium rounded-full hover:bg-[#4C68E9] transition-all"
            >
              Crear Portafolio
            </Link>
            <Link
              href="/portfolio"
              className="px-5 py-2 bg-white/10 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-all border border-white/20"
            >
              Herramienta Simple
            </Link>
          </div>
        </div>
      </nav>

      {/* Market Ticker - Top */}
      <MarketTicker />

      {/* Dollar Ticker - Bottom */}
      <DollarTicker />

      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center px-8 text-center pt-32 pb-20">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-tight tracking-tight">
            El foco está en
            <br />
            <span className="bg-gradient-to-r from-[#1036E2] to-[#00C600] bg-clip-text text-transparent">
              vos
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto font-normal leading-relaxed">
            Te ayudamos a potenciar tus finanzas y las de tu negocio, ofreciendo un servicio completamente personalizado y adaptado a tus necesidades
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6">
            <Link
              href="/portfolio/creator"
              className="group px-7 py-3 bg-[#1036E2] text-white text-base font-medium rounded-full hover:bg-[#4C68E9] transition-all"
            >
              <span className="flex items-center gap-2">
                Crear Portafolio
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Link>
            <Link
              href="/portfolio"
              className="px-7 py-3 bg-white/5 backdrop-blur-sm text-white text-base font-medium rounded-full hover:bg-[#021751]/30 transition-all border border-[#1036E2]/30"
            >
              Herramienta Simple
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 pt-20">
            <div className="bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#1036E2]/20 hover:bg-[#021751]/50 transition-all">
              <div className="w-14 h-14 bg-[#1036E2]/20 rounded-2xl flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-[#1036E2]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Soluciones a medida</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Desde el diseño hasta la implementación, tu inversión recibe apoyo personalizado y adaptado a tus necesidades
              </p>
            </div>

            <div className="bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#1036E2]/20 hover:bg-[#021751]/50 transition-all">
              <div className="w-14 h-14 bg-[#1036E2]/20 rounded-2xl flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-[#1036E2]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Análisis profesional</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Herramientas de gestión, cobertura y financiamiento a través del mercado de capitales
              </p>
            </div>

            <div className="bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#00C600]/20 hover:bg-[#021751]/50 transition-all">
              <div className="w-14 h-14 bg-[#00C600]/20 rounded-2xl flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-[#00C600]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cercanía y confianza</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Sabemos que operar en el mundo financiero no tiene por qué ser complejo ni distante
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
