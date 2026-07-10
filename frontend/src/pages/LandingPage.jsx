import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Clock, ArrowRight, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-kastom-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-kastom-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-kastom-green flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-kastom-dark tracking-tight">Kastom Ledger</h1>
              <p className="text-xs text-kastom-muted font-medium">Papua New Guinea</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signup" className="btn-secondary text-sm">
              Create Account
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Login with SevisPass
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-kastom-green-bg text-kastom-green px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              SevisPass Enabled
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-kastom-dark tracking-tight leading-tight">
              Preserve Your{' '}
              <span className="text-kastom-green">Legacy</span>
            </h1>
            <p className="text-xl md:text-2xl text-kastom-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              A secure digital platform for recording your intentions, 
              family knowledge, and succession wishes for future generations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
                Login with SevisPass
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white border-y border-kastom-border/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-kastom-dark mb-12">
            How Kastom Ledger Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'SevisPass Verified',
                description: 'Your identity is authenticated through PNG\'s official SevisPass system, ensuring trust and security.'
              },
              {
                icon: Users,
                title: 'Nominate Successors',
                description: 'Designate trusted individuals to carry on your legacy and access important information.'
              },
              {
                icon: Clock,
                title: 'Immutable Ledger',
                description: 'Every action is recorded in a tamper-evident digital ledger, preserving the chain of evidence.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card card-hover text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-kastom-green-bg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-kastom-green" />
                </div>
                <h3 className="text-lg font-semibold text-kastom-dark mb-2">{feature.title}</h3>
                <p className="text-kastom-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-kastom-green/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-8 h-8 text-kastom-green" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-kastom-dark mb-4">Honoring Tradition, Building Trust</h2>
              <p className="text-lg text-kastom-muted leading-relaxed">
                Kastom Ledger does <span className="font-semibold text-kastom-dark">not</span> replace customary law, 
                legal processes, or family decision-making. Instead, it preserves 
                <span className="font-semibold text-kastom-dark"> evidence</span> and 
                <span className="font-semibold text-kastom-dark"> intent</span>—recording who created what, 
                when, and with whom. It's about ensuring your voice and wishes are preserved for those who come after you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-kastom-green text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Preserve Your Legacy?</h2>
          <p className="text-kastom-green-bg/80 mb-8">Join thousands of Papua New Guineans securing their family's future.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-kastom-green px-8 py-4 rounded-xl font-semibold hover:bg-kastom-cream transition-colors">
            Create Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-kastom-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-kastom-muted">
            © 2026 Kastom Ledger. Preserving PNG's digital legacy.
          </p>
          <p className="text-xs text-kastom-muted/60 mt-1">
            Built with trust, identity, and family in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;