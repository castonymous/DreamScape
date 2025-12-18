import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  X, 
  ChevronRight, 
  ArrowLeft,
  BookOpen,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react';

const DreamScapePro = () => {
  // --- STATE MANAGEMENT ---
  const [buckets, setBuckets] = useState([
    {
      id: 1,
      title: "Solo Trip ke Switzerland",
      category: "Travel",
      startDate: "2024-01-01",
      targetDate: "2025-12-31",
      progress: 25,
      logs: [
        { date: "2024-01-15", text: "Bikin paspor elektronik selesai. Antri panjang tapi worth it." },
        { date: "2024-03-01", text: "Cek harga tiket, masih mahal banget. Harus nabung lebih keras. Agak stress liat harganya." }
      ]
    },
    {
      id: 2,
      title: "Upgrade Setup Gaming",
      category: "Hobby",
      startDate: "2024-06-01",
      targetDate: "2024-09-01",
      progress: 85,
      logs: [
        { date: "2024-06-10", text: "Beli monitor 144hz, akhirnya! Happy banget." },
        { date: "2024-07-20", text: "Keyboard mechanical custom udah dateng. Tinggal VGA." }
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBucket, setActiveBucket] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);

  // --- LOGIC & HELPERS ---

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  const getDaysDiff = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  };

  // --- SMART AI ENGINE ---
  const analyzeBucket = (bucket) => {
    setIsAnalyzing(true);
    setAiInsight(null);

    setTimeout(() => {
      const today = new Date();
      const start = new Date(bucket.startDate);
      const target = new Date(bucket.targetDate);
      
      const totalDays = getDaysDiff(start, target);
      const daysPassed = getDaysDiff(start, today);
      const daysLeft = getDaysDiff(today, target);
      
      // 1. Analisis Kecepatan (Velocity)
      const velocity = daysPassed > 0 ? bucket.progress / daysPassed : 0;
      const requiredVelocity = daysLeft > 0 ? (100 - bucket.progress) / daysLeft : 100;

      // 2. Prediksi Tanggal Selesai (Forecast)
      let predictedDaysNeeded = 0;
      let predictedDate = null;
      if (velocity > 0) {
        predictedDaysNeeded = (100 - bucket.progress) / velocity;
        predictedDate = new Date();
        predictedDate.setDate(today.getDate() + predictedDaysNeeded);
      }

      // 3. Analisis Sentimen (Simple Keyword Matching)
      const negativeWords = ['susah', 'berat', 'mahal', 'capek', 'bingung', 'gagal', 'stress'];
      const positiveWords = ['senang', 'happy', 'lancar', 'bisa', 'akhirnya', 'semangat'];
      
      let sentimentScore = 0;
      bucket.logs.forEach(log => {
        const text = log.text.toLowerCase();
        if (negativeWords.some(w => text.includes(w))) sentimentScore--;
        if (positiveWords.some(w => text.includes(w))) sentimentScore++;
      });

      // 4. Generate Insight
      let status = "Stabil";
      let message = "";
      let type = "neutral";

      if (daysLeft < 0 && bucket.progress < 100) {
        status = "Overdue";
        type = "critical";
        message = "Target waktu sudah terlewat. AI menyarankan untuk 'Reschedule' tanggal targetmu agar psikologis tidak terbebani rasa bersalah.";
      } else if (bucket.progress >= 100) {
        status = "Completed";
        type = "success";
        message = "Sempurna! Kamu sudah mencapai garis finish. Saatnya membuat mimpi baru.";
      } else {
        if (velocity < requiredVelocity * 0.5) {
          status = "Perlu Boost";
          type = "warning";
          message = `Kecepatanmu (${velocity.toFixed(2)}%/hari) jauh di bawah kebutuhan (${requiredVelocity.toFixed(2)}%/hari). Di kecepatan ini, kamu baru akan selesai pada ${predictedDate ? formatDate(predictedDate) : 'waktu yang sangat lama'}. Coba breakdown target menjadi lebih kecil.`;
        } else if (velocity >= requiredVelocity) {
          status = "On Fire";
          type = "success";
          message = `Luar biasa! Di kecepatan ini, kamu diprediksi selesai pada ${predictedDate ? formatDate(predictedDate) : ''}, lebih cepat dari deadline. Pertahankan momentum ini!`;
        } else {
          status = "On Track";
          type = "neutral";
          message = "Kamu berada di jalur yang benar. Konsistensi adalah kunci. Jangan lupa update progress sekecil apapun.";
        }
      }

      if (sentimentScore < -1) {
        message += " AI juga mendeteksi kamu agak stress di jurnal. Jangan lupa istirahat, mimpi ini untuk kebahagiaanmu, bukan beban.";
      } else if (sentimentScore > 1) {
        message += " Energi positif di jurnalmu sangat bagus, ini akan mempercepat manifestasi!";
      }

      setAiInsight({ status, message, type, velocity, requiredVelocity, predictedDate });
      setIsAnalyzing(false);
    }, 2500);
  };

  // --- ACTIONS ---

  const handleAddBucket = () => {
    if (!newTitle || !newDate) return;
    const newBucket = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: newDate,
      progress: 0,
      logs: []
    };
    setBuckets([...buckets, newBucket]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewDate('');
  };

  const updateProgress = (val) => {
    const updated = { ...activeBucket, progress: val };
    setActiveBucket(updated);
    setBuckets(buckets.map(b => b.id === activeBucket.id ? updated : b));
  };

  const addLog = (text) => {
    if (!text) return;
    const newLog = { date: new Date().toISOString().split('T')[0], text };
    const updatedBucket = { ...activeBucket, logs: [newLog, ...activeBucket.logs] };
    setActiveBucket(updatedBucket);
    setBuckets(buckets.map(b => b.id === activeBucket.id ? updatedBucket : b));
  };

  return (
    <div className="min-h-screen bg-[#050511] text-slate-200 relative overflow-hidden font-jakarta">
      {/* Import Fonts & Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        @keyframes aurora {
          0% { background-position: 50% 50%; filter: hue-rotate(0deg); }
          50% { background-position: 100% 50%; filter: hue-rotate(20deg); }
          100% { background-position: 50% 50%; filter: hue-rotate(0deg); }
        }
        .aurora-bg {
          background: radial-gradient(circle at 50% -20%, #4c1d95 0%, transparent 40%),
                      radial-gradient(circle at 0% 40%, #0e7490 0%, transparent 40%),
                      radial-gradient(circle at 100% 40%, #be185d 0%, transparent 40%);
          animation: aurora 15s infinite ease-in-out;
          opacity: 0.4;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Dynamic Background */}
      <div className="fixed inset-0 aurora-bg pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-16 pt-4">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] text-indigo-300 uppercase opacity-80 mb-2 block">My Life Manifest</span>
            <h1 className="text-4xl md:text-5xl font-playfair font-medium text-white italic leading-tight">
              Dream<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 not-italic font-bold">Scape</span>
            </h1>
          </div>
          
          {/* TOMBOL NEW DREAM - ICON ONLY */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 bg-white/5 hover:bg-white border border-white/10 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            title="Create New Dream"
          >
            <Plus size={28} className="text-white group-hover:text-black group-hover:rotate-90 transition-all duration-300" strokeWidth={2} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>
        </header>

        {/* CONTENT SWITCHER */}
        <div className="transition-all duration-700 ease-in-out">
          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {buckets.map((bucket) => (
                <div 
                  key={bucket.id}
                  onClick={() => { setActiveBucket(bucket); setViewMode('detail'); setAiInsight(null); }}
                  className="group relative bg-[#0f0f25]/60 border border-white/5 hover:border-white/20 backdrop-blur-xl p-8 rounded-[2rem] cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(76,29,149,0.2)] overflow-hidden"
                >
                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-all duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border border-slate-700 px-3 py-1 rounded-full">
                        {bucket.category}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                        <ChevronRight size={14} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-playfair mb-8 group-hover:text-indigo-200 transition-colors leading-snug">
                      {bucket.title}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs text-slate-400 font-medium tracking-wide">
                        <span>PROGRESS</span>
                        <span>{bucket.progress}%</span>
                      </div>
                      <div className="h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shadow-[0_0_10px_rgba(167,139,250,0.5)] transition-all duration-1000 ease-out"
                          style={{ width: `${bucket.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <span className="text-xs text-slate-500 font-mono">{formatDate(bucket.targetDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {buckets.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[2rem]">
                  <p className="text-slate-500 font-playfair italic text-lg">Your canvas is empty. Start dreaming.</p>
                </div>
              )}
            </div>
          ) : (
            // --- DETAIL VIEW ---
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <button 
                onClick={() => setViewMode('list')}
                className="flex items-center gap-3 text-slate-400 hover:text-white mb-8 group transition-colors"
              >
                <div className="p-2 rounded-full border border-white/5 group-hover:border-white/20 group-hover:bg-white/5 transition-all">
                  <ArrowLeft size={16} />
                </div>
                <span className="text-sm tracking-wide">BACK TO COLLECTION</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Main Content (Left) */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-[#0f0f25]/40 border border-white/5 backdrop-blur-xl p-10 rounded-[2.5rem]">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xs font-bold tracking-[0.2em] text-pink-300 uppercase">{activeBucket.category}</span>
                      <span className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded">EST. {formatDate(activeBucket.targetDate)}</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-playfair leading-tight mb-10 text-white">
                      {activeBucket.title}
                    </h2>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <label className="text-sm font-medium text-slate-400 tracking-wide">CURRENT COMPLETION</label>
                        <span className="text-4xl font-playfair italic text-white">{activeBucket.progress}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={activeBucket.progress}
                        onChange={(e) => updateProgress(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-indigo-300 transition-all"
                      />
                    </div>
                  </div>

                  {/* Journal */}
                  <div className="bg-[#0f0f25]/40 border border-white/5 backdrop-blur-xl p-8 rounded-[2.5rem]">
                    <h3 className="text-lg font-playfair italic mb-6 flex items-center gap-3">
                      <BookOpen size={18} className="text-indigo-400"/> The Journey Log
                    </h3>
                    
                    <div className="relative mb-8">
                      <input 
                        type="text" 
                        id="logInput"
                        placeholder="Tulis update ceritamu hari ini..."
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all text-sm placeholder:text-slate-600"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addLog(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById('logInput');
                          addLog(input.value);
                          input.value = '';
                        }}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-white/10 hover:bg-white text-white hover:text-black rounded-xl transition-all flex items-center justify-center"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {activeBucket.logs.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl">
                          <p className="text-slate-500 font-playfair italic">"Setiap perjalanan besar dimulai dari satu langkah kecil."</p>
                        </div>
                      ) : (
                        activeBucket.logs.map((log, idx) => (
                          <div key={idx} className="relative pl-8 border-l border-white/5 hover:border-indigo-500/50 transition-colors py-1">
                            <div className="absolute left-[-5px] top-3 w-2.5 h-2.5 rounded-full bg-[#050511] border border-slate-600"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{formatDate(log.date)}</span>
                            <p className="text-slate-300 text-sm leading-relaxed font-light">{log.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar (Right) - AI Section */}
                <div className="lg:col-span-5 space-y-6">
                  {/* AI Card */}
                  <div className="relative bg-gradient-to-b from-indigo-900/20 to-purple-900/20 border border-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 animate-spin-slow pointer-events-none"></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white tracking-wide">AI Forecast</h3>
                          <p className="text-[10px] text-indigo-200 uppercase tracking-widest">Smart Analysis 2.0</p>
                        </div>
                      </div>

                      {!aiInsight ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-slate-400 mb-6 font-light leading-relaxed">
                            Biarkan AI menganalisis kecepatan progress, sentimen jurnal, dan sisa waktu untuk memberikan prediksi realistis.
                          </p>
                          <button 
                            onClick={() => analyzeBucket(activeBucket)}
                            disabled={isAnalyzing}
                            className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-indigo-50 transition-all flex justify-center items-center gap-2 group"
                          >
                            {isAnalyzing ? (
                              <>
                                <Activity className="animate-spin" size={18} />
                                <span>Calculating Trajectory...</span>
                              </>
                            ) : (
                              <>
                                <Zap size={18} className="group-hover:text-yellow-600 transition-colors" fill="currentColor" />
                                <span>Run Analysis</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="animate-in zoom-in duration-500">
                          {/* Stat Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Velocity</span>
                              <span className="text-lg font-mono text-white">{aiInsight.velocity.toFixed(2)}%<span className="text-xs text-slate-500">/day</span></span>
                            </div>
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Required</span>
                              <span className="text-lg font-mono text-slate-300">{aiInsight.requiredVelocity.toFixed(2)}%<span className="text-xs text-slate-500">/day</span></span>
                            </div>
                          </div>

                          <div className={`p-5 rounded-2xl border mb-6 ${
                            aiInsight.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                            aiInsight.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                            aiInsight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                            'bg-blue-500/10 border-blue-500/20'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {aiInsight.type === 'critical' && <AlertCircle size={16} className="text-red-400"/>}
                              <span className={`text-xs font-bold uppercase tracking-widest ${
                                aiInsight.type === 'critical' ? 'text-red-300' :
                                aiInsight.type === 'success' ? 'text-green-300' :
                                aiInsight.type === 'warning' ? 'text-yellow-300' :
                                'text-blue-300'
                              }`}>
                                Status: {aiInsight.status}
                              </span>
                            </div>
                            <p className="text-sm text-white/90 leading-relaxed font-light">
                              {aiInsight.message}
                            </p>
                          </div>

                          {aiInsight.predictedDate && (
                            <div className="text-center bg-white/5 rounded-xl p-4 mb-4">
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Prediksi Selesai</span>
                              <div className="text-xl font-playfair text-indigo-300 mt-1">
                                {formatDate(aiInsight.predictedDate)}
                              </div>
                            </div>
                          )}

                          <button 
                            onClick={() => setAiInsight(null)}
                            className="w-full py-3 text-xs text-slate-400 hover:text-white border border-transparent hover:border-white/10 rounded-xl transition-all"
                          >
                            Reset Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                        if(confirm('Yakin ingin menghapus mimpi ini?')) {
                            // Logic delete would go here
                            setBuckets(buckets.filter(b => b.id !== activeBucket.id));
                            setViewMode('list');
                        }
                    }}
                    className="w-full py-4 text-red-400/50 hover:text-red-400 hover:bg-red-900/10 rounded-2xl transition-all text-sm tracking-wide flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Dream
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f25] border border-white/10 w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-playfair text-white mb-8 italic">Manifest New Dream</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dream Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-playfair text-lg placeholder:text-slate-600 placeholder:italic"
                  placeholder="e.g., Opening my own Coffee Shop"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Category</label>
                  <div className="relative">
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Travel">Travel</option>
                      <option value="Career">Career</option>
                      <option value="Asset">Asset</option>
                      <option value="Experience">Experience</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Target Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddBucket}
                className="w-full bg-white hover:bg-indigo-50 text-black font-bold py-5 rounded-xl mt-4 transition-all transform hover:scale-[1.02] shadow-lg shadow-white/5 tracking-wide text-sm uppercase"
              >
                Begin Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamScapePro;