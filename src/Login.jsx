import { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://pi360.net/site/api/api_login_user.php?institute_id=mietjammu',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username_1: username,
            password_1: password,
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok && data.token) {
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-brand-deep text-slate-100 font-sans min-h-screen flex items-center justify-center p-3 sm:p-5 relative overflow-x-hidden selection:bg-amber-500 selection:text-white w-full">
      {/* AmbientAtmosphere */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-glow-top absolute -top-28 -left-20 w-96 h-96 rounded-full blur-3xl animate-float-slow"></div>
        <div className="ambient-glow-bottom absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      </div>
      
      {/* MainMobileContainer */}
      <main className="w-full max-w-[400px] relative z-10 flex flex-col justify-between my-auto py-2">
        {/* HeaderAndInstitution */}
        <header className="text-center pt-2 pb-5 px-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 shadow-inner backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20"></span>
            <div className="flex items-center text-xs tracking-wide">
              <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">MIET</span>
              <span className="mx-1.5 text-slate-500">•</span>
              <span className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">MIET Games Arena</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2.5">
            <span>Ready to Play?</span>
          </h1>
          <p className="mt-2.5 text-sm text-slate-400 font-normal leading-relaxed">
            Use your <span className="font-semibold text-amber-400 tracking-wide">PI360</span> credentials and start playing!
          </p>
        </header>

        {/* AuthenticationCard */}
        <section className="glass-card rounded-3xl p-6 sm:p-7 shadow-card-elevated border border-slate-700/50 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"></div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl p-3 mb-4 text-center animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1" htmlFor="username">
                Username
              </label>
              <div className="input-glass rounded-2xl flex items-center px-4 py-3.5 group focus-within:ring-0">
                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-amber-400 transition-colors mr-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-sm sm:text-base text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none font-medium"
                  placeholder="Enter PI360 username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1" htmlFor="password">
                Password
              </label>
              <div className="input-glass rounded-2xl flex items-center px-4 py-3.5 group focus-within:ring-0 relative">
                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-amber-400 transition-colors mr-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-sm sm:text-base text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none font-medium pr-8"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none focus:text-amber-400 absolute right-3"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-2 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-400/30 focus:ring-offset-0 focus:outline-none transition" />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors hover:underline underline-offset-4">
                Forgot password?
              </a>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 shadow-glow-amber hover:shadow-orange-500/50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden"
              >
                <span className="absolute top-0 left-0 -ml-8 w-16 h-full bg-white/25 transform -skew-x-12 translate-x-0 group-hover:translate-x-80 transition-transform duration-1000 ease-out"></span>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-950 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <span>Start Game</span>
                    <span className="text-xl leading-none transition-transform group-hover:scale-125 duration-150">🎮</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* TrustFooter */}
        <footer className="mt-6 mb-2 text-center">
          <div className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 font-medium">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path>
            </svg>
            <span>Secured by <strong className="text-slate-200 font-semibold">PI360</strong> · MIET Jammu</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Model Institute of Education & Research
          </p>
        </footer>
      </main>
    </div>
  );
}
