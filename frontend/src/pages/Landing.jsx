import { Link } from 'react-router-dom'
import {
  GraduationCap, Target, Sparkles, Briefcase, Users2, BarChart4, ShieldCheck,
  ArrowRight, Building2, School, UserCog,
} from 'lucide-react'

const FEATURES = [
  { icon: Target, title: 'Skill Intelligence', text: 'Adaptive assessments turn raw answers into a verified, per-skill proficiency profile — technical and soft skills alike.' },
  { icon: Sparkles, title: 'Smart Matching', text: 'A transparent scoring engine ranks roles, internships and jobs for every student — and ranks candidates for every industry posting.' },
  { icon: Briefcase, title: 'Internships & Placement', text: 'One marketplace for internships, jobs, applications and status tracking — from "Applied" to "Selected".' },
  { icon: Users2, title: 'Industry Collaboration', text: 'Faculty internships, mentorship, workshops and live projects connect classrooms directly to industry.' },
  { icon: BarChart4, title: 'Analytics', text: 'Institutions see skill gaps, placement readiness and industry demand trends across every department.' },
  { icon: ShieldCheck, title: 'Digital Portfolio', text: 'Verified skills, certifications, projects and achievements in one placement-ready profile.' },
]

const STEPS = [
  'Take the Skill Assessment', 'Get your Skill Gap & Career Match', 'Apply to matched Internships/Jobs',
  'Build your Verified Portfolio',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">SkillBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm">Login</Link>
            <Link to="/login" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="badge bg-brand-50 text-brand-700 mb-5 inline-block">Smart India Hackathon 2026 · Ministry of Ayush</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight max-w-3xl mx-auto">
          Bridge the Gap Between Academia and Industry
        </h1>
        <p className="text-lg text-slate-500 mt-5 max-w-xl mx-auto">
          Assess skills. Discover opportunities. Build industry readiness.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/login" className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary">Explore Demo</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
          {[
            { icon: School, label: 'Students' },
            { icon: Building2, label: 'Industry' },
            { icon: GraduationCap, label: 'Academia' },
            { icon: UserCog, label: 'Institutions' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="card p-5 flex flex-col items-center gap-2">
              <Icon size={22} className="text-brand-600" />
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">all connected through one intelligent platform</p>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">How SkillBridge Works</h2>
          <p className="text-center text-slate-500 mb-10">From skill assessment to placement — one connected journey</p>
          <div className="grid md:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={s} className="card p-5">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold text-slate-700">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Everything the ecosystem needs</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 py-14">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to see your skill-to-career journey?</h2>
          <p className="text-brand-100 mb-6">Log in with a demo account — no setup required.</p>
          <Link to="/login" className="bg-white text-brand-700 font-semibold px-6 py-2.5 rounded-xl inline-flex items-center gap-2">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-slate-400">
        SkillBridge — Prototype for Smart India Hackathon 2026 · Problem Statement 26044
      </footer>
    </div>
  )
}
