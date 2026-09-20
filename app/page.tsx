'use client';
import { useState } from 'react';
import { ShieldCheck, Cpu, Briefcase, CheckCircle2, Lock, Loader2, Network } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'exam' | 'skills'>('exam');
  
  // Exam Generator State
  const [subject, setSubject] = useState('Physics / Mechanics');
  const [topic, setTopic] = useState('Rotational Dynamics & Torque');
  const [examResult, setExamResult] = useState<any>(null);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  // Skill Grid State
  const [studentName, setStudentName] = useState('Aditya Kumar');
  const [projectSummary, setProjectSummary] = useState(
    'Built an automated micro-irrigation controller using ESP32 and sensor arrays to reduce agricultural water consumption by 35%.'
  );
  const [skillResult, setSkillResult] = useState<any>(null);
  const [isMatchingSkills, setIsMatchingSkills] = useState(false);

  const handleGenerateExam = async () => {
    setIsGeneratingExam(true);
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, variantId: `NODE-${Math.floor(Math.random() * 9000 + 1000)}` }),
      });
      const data = await res.json();
      if (data.success) setExamResult(data);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleMatchSkills = async () => {
    setIsMatchingSkills(true);
    try {
      const res = await fetch('/api/match-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateName: studentName, projectSummary }),
      });
      const data = await res.json();
      if (data.success) setSkillResult(data.passport);
    } finally {
      setIsMatchingSkills(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 flex flex-col justify-between">
      <main className="max-w-5xl mx-auto w-full p-6 md:p-12 space-y-10 flex-grow">
        
        {/* Premium Header */}
        <header className="border-b border-slate-800/60 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Prototype
              </span>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Network className="w-3.5 h-3.5" />
                Gemini AI & Supabase
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Pravesh-Setu & Skill-Grid
            </h1>
            <p className="text-slate-400 text-sm font-medium">Decentralized Anti-Leak Assessments & Real-Time Skill Deployment</p>
          </div>

          {/* Premium Navigation Tabs */}
          <div className="flex bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-1.5 shadow-xl">
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'exam' 
                  ? 'bg-slate-800 text-white shadow-md ring-1 ring-white/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'exam' ? 'text-cyan-400' : ''}`} />
              Pravesh-Setu (Anti-Leak)
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'skills' 
                  ? 'bg-slate-800 text-white shadow-md ring-1 ring-white/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className={`w-4 h-4 transition-colors duration-300 ${activeTab === 'skills' ? 'text-emerald-400' : ''}`} />
              Skill-Grid (Employment)
            </button>
          </div>
        </header>

        {/* Tab 1: Pravesh-Setu Engine */}
        {activeTab === 'exam' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-500 animate-in fade-in">
            {/* Input Panel */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 p-7 rounded-2xl shadow-2xl space-y-6 hover:border-slate-700/80 transition-colors duration-300">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Lock className="w-5 h-5 text-cyan-400" />
                Trigger Assessment Node
              </h2>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Subject Track</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                  />
                </div>
                <div className="group">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Topic Focus</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateExam}
                disabled={isGeneratingExam}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg text-sm transition-all duration-300 shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                {isGeneratingExam ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Tamper-Proof Node...</>
                ) : (
                  'Generate Dynamic Exam Node'
                )}
              </button>
            </div>

            {/* Results Display */}
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/60 p-7 rounded-2xl shadow-2xl flex flex-col transition-colors duration-300 hover:border-slate-700/80">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Cryptographic Node Output</h2>
              
              {examResult ? (
                <div className="space-y-5 text-sm flex-1 animate-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Digital Seal Card */}
                  <div className="relative overflow-hidden bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mb-1">SHA-256 DIGITAL SEAL</p>
                    <p className="text-cyan-400 font-mono text-xs break-all selection:bg-cyan-500/30">{examResult.paperHash}</p>
                    <p className="text-slate-500 mt-2 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" />
                      SECURE TIMESTAMP: {new Date(examResult.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Generated Questions with LaTeX */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {examResult.questions.map((q: any, index: number) => (
                      <div 
                        key={q.id} 
                        className="p-5 bg-slate-900/80 border border-slate-700/50 rounded-xl hover:border-cyan-500/30 transition-colors duration-300"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <span className="inline-block px-2.5 py-1 bg-cyan-500/10 text-cyan-400 font-bold text-[10px] uppercase tracking-widest rounded mb-3 border border-cyan-500/20">
                          Q{q.id} • {q.concept_tested}
                        </span>
                        {/* React Markdown with KaTeX injection */}
                        <div className="text-slate-300 text-sm leading-relaxed prose prose-invert prose-p:leading-relaxed max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {q.problem}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                  <ShieldCheck className="w-16 h-16 mb-4 text-slate-700" />
                  <p className="text-sm font-medium">No node generated yet.</p>
                  <p className="text-xs mt-1">Run the synthesis engine to view results.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Skill-Grid Engine */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-500 animate-in fade-in">
            {/* Input Panel */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 p-7 rounded-2xl shadow-2xl space-y-6 hover:border-slate-700/80 transition-colors duration-300">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Submit Practical Output
              </h2>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">Candidate Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                  />
                </div>
                <div className="group">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">Live Project Summary</label>
                  <textarea
                    rows={5}
                    value={projectSummary}
                    onChange={(e) => setProjectSummary(e.target.value)}
                    className="w-full mt-1.5 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleMatchSkills}
                disabled={isMatchingSkills}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg text-sm transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                {isMatchingSkills ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Competencies...</>
                ) : (
                  'Issue Verified Skill Passport'
                )}
              </button>
            </div>

            {/* Results Display */}
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/60 p-7 rounded-2xl shadow-2xl flex flex-col transition-colors duration-300 hover:border-slate-700/80">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Verified Skill Passport</h2>
              
              {skillResult ? (
                <div className="space-y-6 text-sm flex-1 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Verified Badges */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Verified Technical Competencies</p>
                    <div className="flex flex-wrap gap-2.5">
                      {skillResult.verified_competencies.map((comp: string, i: number) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-xs font-medium text-emerald-400 border border-emerald-500/20 shadow-sm hover:bg-emerald-500/20 transition-colors cursor-default">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-800/60"></div>

                  {/* Industry Matches */}
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Direct Placement Pipeline (MSME Matches)</p>
                    {skillResult.industry_matches.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-colors duration-300 group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{item.role}</span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-sm">
                            {item.relevanceScore} Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3"><span className="text-slate-500">Sector:</span> {item.sector}</p>
                        <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800/80">
                          <p className="text-[11px] font-semibold text-emerald-500/80 uppercase mb-0.5">Suggested Next Bridge</p>
                          <p className="text-xs text-slate-300">{item.suggestedNextModule}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                  <Briefcase className="w-16 h-16 mb-4 text-slate-700" />
                  <p className="text-sm font-medium">Awaiting project submission.</p>
                  <p className="text-xs mt-1">Submit a summary to generate industry matches.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer with Powered by AROM */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500 mt-20">
        <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="tracking-wide">
            Pravesh-Setu & Skill-Grid — Decentralized Anti-Leak & Skill Infrastructure
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>System Operational</span>
            <span className="text-slate-700">|</span>
            <a 
              href="https://arom-one.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors font-medium tracking-wider text-slate-400"
            >
              Powered by <span className="text-slate-200 font-bold">ΛROM</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Basic Custom Scrollbar for overflow areas */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}
