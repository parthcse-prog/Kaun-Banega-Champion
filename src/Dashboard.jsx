export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto flex flex-col gap-8 my-4">
      
      {/* Top Games Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Top games today</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">Hot</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[320px]">
          
          {/* Big Game Card */}
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden cursor-pointer group glass-card shadow-card-elevated hover:shadow-glow-amber transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <h3 className="text-4xl font-black text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">bloxd.io</h3>
            </div>
          </div>

          {/* Small Game Cards Grid */}
          <div className="md:col-span-3 grid grid-cols-2 grid-rows-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
               <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black opacity-80 group-hover:opacity-90 transition-opacity"></div>
               <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                 <span className="text-xs font-bold text-white uppercase tracking-wide">EVO WARS</span>
               </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
               <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-900 opacity-80 group-hover:opacity-90 transition-opacity"></div>
               <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                 <span className="text-xs font-bold text-white uppercase tracking-wide">Stickman Archer</span>
               </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
               <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-700 opacity-80 group-hover:opacity-90 transition-opacity"></div>
               <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                 <span className="text-xs font-bold text-white uppercase tracking-wide">Cleanup</span>
               </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden cursor-pointer group bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
               <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700 opacity-80 group-hover:opacity-90 transition-opacity"></div>
               <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                 <span className="text-xs font-bold text-white uppercase tracking-wide">Bike Racing</span>
               </div>
            </div>
          </div>

          {/* Medium Game Card */}
          <div className="md:col-span-4 relative rounded-3xl overflow-hidden cursor-pointer group glass-card shadow-card-elevated hover:shadow-glow-amber transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <h3 className="text-2xl font-black text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300 uppercase tracking-widest">Racing Limits</h3>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Games Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Featured games</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">New</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-auto md:h-[180px]">
          
          <div className="relative rounded-3xl overflow-hidden cursor-pointer group glass-card shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-32 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 flex items-end justify-center p-4">
              <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-widest drop-shadow">HEXA</span>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden cursor-pointer group glass-card shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-32 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-700 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 flex items-end justify-center p-4">
              <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-widest drop-shadow">FARM</span>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden cursor-pointer group glass-card shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-32 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-900 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 flex items-end justify-center p-4">
              <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-widest drop-shadow">BODY CAMERA</span>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden cursor-pointer group glass-card shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-32 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-cyan-700 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 flex items-end justify-center p-4">
              <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-widest drop-shadow">WorldGuessr</span>
            </div>
          </div>

        </div>
      </section>
      
    </div>
  );
}
