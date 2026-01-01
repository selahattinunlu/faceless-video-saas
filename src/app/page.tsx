import Link from 'next/link';
import {
  Video,
  Sparkles,
  Wand2,
  ImageIcon,
  Mic2,
  Zap,
  Play,
  ChevronRight,
  Check,
  ArrowRight,
  Film,
  Clock,
  TrendingUp,
  Youtube,
  Instagram,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-body film-grain selection:bg-[#00E5FF] selection:text-black overflow-x-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top right cyan glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00E5FF] opacity-[0.07] blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        {/* Bottom left amber glow */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFB800] opacity-[0.05] blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] bg-[#00E5FF] opacity-[0.02] blur-[200px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00E5FF] blur-xl opacity-40" />
              <div className="relative bg-gradient-to-br from-[#00E5FF] to-[#00B4CC] w-11 h-11 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-black" />
              </div>
            </div>
            <span className="font-display text-2xl tracking-wider text-white">
              SHORTS<span className="text-[#00E5FF]">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          <Link
            href="/generate"
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-4 h-4 text-[#FFB800]" />
                <span className="text-sm text-white/70">AI-Powered Video Generation</span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-1">
                <span className="block text-white">FROM IDEA</span>
                <span className="block text-[#00E5FF] text-glow-cyan">TO VIDEO</span>
                <span className="block text-white/40">IN SECONDS</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-white/50 max-w-md leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-2">
                Write your topic, let AI generate the script, create visuals, and add voiceover.
                <span className="text-white/70"> Faceless video</span> creation has never been this easy.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-3">
                <Link
                  href="/generate"
                  className="group relative inline-flex items-center justify-center gap-3 bg-[#00E5FF] hover:bg-[#00D4E8] text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 animate-pulse-glow overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Play className="w-5 h-5" />
                    Try For Free
                  </span>
                  <div className="absolute inset-0 shimmer" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Film className="w-5 h-5" />
                  How It Works
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-medium"
                    >
                      {['AK', 'BY', 'CZ', 'DT'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-white font-medium">500+</span>
                  <span className="text-white/40"> content creators using it</span>
                </div>
              </div>
            </div>

            {/* Right: Video Preview Mockup */}
            <div className="relative lg:pl-12 animate-in fade-in slide-in-from-right-8 duration-1000">
              {/* Decorative film strip elements */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-64 hidden lg:block">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-6 mb-2 rounded-sm bg-white/5 border border-white/10"
                  />
                ))}
              </div>

              {/* Main video mockup */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#00E5FF]/20 via-transparent to-[#FFB800]/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Phone frame */}
                <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-[2.5rem] p-3 border border-white/10">
                  {/* Screen */}
                  <div className="relative bg-black rounded-[2rem] overflow-hidden aspect-[9/16] w-full max-w-[280px] mx-auto">
                    {/* Video content placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1a]">
                      {/* Animated content preview */}
                      <div className="absolute inset-0 flex flex-col">
                        {/* Scene image area */}
                        <div className="flex-1 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                          {/* Animated bars representing AI generation */}
                          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 space-y-3">
                            <div className="h-2 bg-[#00E5FF]/30 rounded-full animate-pulse" style={{ width: '80%' }} />
                            <div className="h-2 bg-[#00E5FF]/20 rounded-full animate-pulse" style={{ width: '60%', animationDelay: '0.2s' }} />
                            <div className="h-2 bg-[#00E5FF]/10 rounded-full animate-pulse" style={{ width: '90%', animationDelay: '0.4s' }} />
                          </div>
                        </div>

                        {/* Caption area */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                          <div className="space-y-2">
                            <div className="h-3 bg-white/20 rounded w-3/4" />
                            <div className="h-3 bg-white/10 rounded w-1/2" />
                          </div>
                        </div>
                      </div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center z-30">
                        <div className="w-16 h-16 rounded-full bg-[#00E5FF]/90 flex items-center justify-center animate-pulse-glow">
                          <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    {/* Status bar mockup */}
                    <div className="absolute top-3 inset-x-4 flex items-center justify-between z-40">
                      <span className="text-[10px] text-white/50">9:41</span>
                      <div className="w-20 h-5 bg-black rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-white/50 rounded-sm">
                          <div className="w-2/3 h-full bg-white/50 rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -right-4 top-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 animate-float">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-[#FFB800]" />
                    <span className="text-sm font-medium">AI Script</span>
                  </div>
                </div>

                <div className="absolute -left-4 bottom-24 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <Mic2 className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-sm font-medium">Auto Voice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform icons */}
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <Youtube className="w-6 h-6" />
              <span className="text-sm">YouTube Shorts</span>
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-6 h-6" />
              <span className="text-sm">Instagram Reels</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <span className="text-sm">TikTok</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-block font-display text-sm tracking-[0.3em] text-[#00E5FF] mb-4">FEATURES</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
              EVERYTHING <span className="text-white/40">IN ONE PLATFORM</span>
            </h2>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wand2,
                title: 'AI Script',
                description: 'Write your topic, and AI will generate a professional script for you.',
                color: '#FFB800',
              },
              {
                icon: ImageIcon,
                title: 'Visual Generation',
                description: 'Unique, eye-catching visuals are automatically generated for each scene.',
                color: '#00E5FF',
              },
              {
                icon: Mic2,
                title: 'Natural Voiceover',
                description: 'Professional voiceover with natural tone. Multiple languages supported.',
                color: '#FF6B6B',
              },
              {
                icon: Zap,
                title: 'Fast Production',
                description: 'Create professional videos in minutes. No time wasted.',
                color: '#00E5FF',
              },
              {
                icon: TrendingUp,
                title: 'Trend Ready',
                description: 'Create content that fits popular formats and trends.',
                color: '#FFB800',
              },
              {
                icon: Clock,
                title: '24/7 Access',
                description: 'Create content anytime, anywhere you want.',
                color: '#FF6B6B',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative gradient-border p-8 hover:scale-[1.02] transition-all duration-500"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="font-display text-2xl tracking-wide mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-block font-display text-sm tracking-[0.3em] text-[#FFB800] mb-4">HOW IT WORKS</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
              <span className="text-white/40">JUST</span> THREE STEPS
            </h2>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
              {[
                {
                  step: '01',
                  title: 'Write Your Topic',
                  description: 'Describe your video content idea or topic in a few sentences.',
                  icon: '✍️',
                },
                {
                  step: '02',
                  title: 'Let AI Create',
                  description: 'AI automatically generates the script, visuals, and voiceover.',
                  icon: '🤖',
                },
                {
                  step: '03',
                  title: 'Share',
                  description: 'Download your video and share it on social media platforms.',
                  icon: '🚀',
                },
              ].map((item, index) => (
                <div key={index} className="relative text-center lg:text-left">
                  {/* Step number badge */}
                  <div className="inline-flex lg:flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-6 relative">
                    <span className="font-display text-2xl text-[#00E5FF]">{item.step}</span>
                    {/* Glow */}
                    <div className="absolute inset-0 bg-[#00E5FF] rounded-2xl blur-xl opacity-20" />
                  </div>

                  <h3 className="font-display text-3xl tracking-wide mb-4">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed max-w-sm mx-auto lg:mx-0">
                    {item.description}
                  </p>

                  {/* Arrow for desktop */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-8 -right-4 z-10">
                      <ChevronRight className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-block font-display text-sm tracking-[0.3em] text-[#00E5FF] mb-4">PRICING</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
              SIMPLE <span className="text-white/40">TRANSPARENT</span> PRICING
            </h2>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative gradient-border p-8">
              <div className="mb-8">
                <h3 className="font-display text-2xl tracking-wide mb-2">STARTER</h3>
                <p className="text-white/40 text-sm">Perfect for trying out</p>
              </div>

              <div className="mb-8">
                <span className="font-display text-5xl">$0</span>
                <span className="text-white/40 ml-2">/mo</span>
              </div>

              <ul className="space-y-4 mb-8">
                {['5 videos/month', 'Basic voiceover', 'Standard quality', 'Community support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/60">
                    <Check className="w-5 h-5 text-[#00E5FF]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/generate"
                className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="relative">
              {/* Featured glow */}
              <div className="absolute -inset-px bg-gradient-to-b from-[#00E5FF] to-[#FFB800] rounded-2xl opacity-50 blur-sm" />

              <div className="relative bg-[#0a0a0a] rounded-2xl p-8 border border-[#00E5FF]/50">
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#00E5FF] text-black text-xs font-bold px-4 py-1.5 rounded-full">
                    MOST POPULAR
                  </span>
                </div>

                <div className="mb-8 pt-2">
                  <h3 className="font-display text-2xl tracking-wide mb-2">PRO</h3>
                  <p className="text-white/40 text-sm">For professional content creators</p>
                </div>

                <div className="mb-8">
                  <span className="font-display text-5xl text-[#00E5FF]">$29</span>
                  <span className="text-white/40 ml-2">/mo</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited videos',
                    'Premium voiceover',
                    'HD quality',
                    'Priority support',
                    'Advanced AI models',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#00E5FF]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/generate"
                  className="block w-full text-center bg-[#00E5FF] hover:bg-[#00D4E8] text-black py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="relative gradient-border p-8">
              <div className="mb-8">
                <h3 className="font-display text-2xl tracking-wide mb-2">ENTERPRISE</h3>
                <p className="text-white/40 text-sm">For large teams</p>
              </div>

              <div className="mb-8">
                <span className="font-display text-5xl">$99</span>
                <span className="text-white/40 ml-2">/mo</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Everything in Pro',
                  'API access',
                  'Custom AI model',
                  '24/7 support',
                  'Team management',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/60">
                    <Check className="w-5 h-5 text-[#FFB800]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-medium transition-all duration-300">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 border-t border-white/5 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] bg-[#00E5FF] opacity-[0.08] blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight mb-6">
            <span className="text-white/40">WHEN INSPIRATION</span>
            <br />
            <span className="text-[#00E5FF] text-glow-cyan">STRIKES, ACT</span>
          </h2>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
            Every day, thousands of content creators turn their ideas into videos with ShortsAI.
            Start now.
          </p>

          <Link
            href="/generate"
            className="group inline-flex items-center gap-3 bg-[#00E5FF] hover:bg-[#00D4E8] text-black font-semibold px-10 py-5 rounded-xl text-lg transition-all duration-300 animate-pulse-glow"
          >
            <Play className="w-6 h-6" />
            Try Free Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#00E5FF] to-[#00B4CC] w-9 h-9 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-black" />
              </div>
              <span className="font-display text-xl tracking-wider">
                SHORTS<span className="text-[#00E5FF]">AI</span>
              </span>
            </div>

            <div className="flex items-center gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>

            <div className="text-sm text-white/30">
              2024 ShortsAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
