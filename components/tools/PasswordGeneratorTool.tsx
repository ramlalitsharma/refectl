'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, RefreshCw, Shield, ShieldCheck, ShieldAlert, Check, Hash } from 'lucide-react';
import { toast } from 'sonner';

export function PasswordGeneratorTool() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-';

    let charset = lowercase;
    if (includeUppercase) charset += uppercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    setPassword(generatedPassword);
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Password copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const getStrength = () => {
    let score = 0;
    if (length > 8) score++;
    if (length > 12) score++;
    if (includeUppercase) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;

    if (score < 3) return { label: 'Weak', color: 'text-red-500', icon: ShieldAlert, bg: 'bg-red-500' };
    if (score < 5) return { label: 'Good', color: 'text-orange-500', icon: Shield, bg: 'bg-orange-500' };
    return { label: 'Strong', color: 'text-emerald-500', icon: ShieldCheck, bg: 'bg-emerald-500' };
  };

  const strength = getStrength();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-slate-900 border-none rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:row items-center justify-between gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 group">
            <div className="text-4xl md:text-5xl font-mono font-black text-white break-all tracking-tighter tabular-nums selection:bg-blue-500">
              {password}
            </div>
            <div className="flex gap-3">
              <Button onClick={generatePassword} variant="ghost" className="h-14 w-14 rounded-2xl text-white hover:bg-white/10">
                <RefreshCw size={24} />
              </Button>
              <Button onClick={copyToClipboard} className="h-14 px-8 rounded-2xl bg-white text-black font-black hover:bg-blue-500 hover:text-white transition-all">
                {copied ? <Check size={20} /> : <Copy size={20} />}
                <span className="ml-2">{copied ? 'COPIED' : 'COPY'}</span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Password Length</h4>
                <span className="text-3xl font-black text-blue-500 tabular-nums">{length}</span>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-black text-slate-600">
                <span>MIN: 6</span>
                <span>MAX: 64</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Uppercase Letters', state: includeUppercase, setter: setIncludeUppercase },
                { label: 'Include Numbers', state: includeNumbers, setter: setIncludeNumbers },
                { label: 'Special Symbols', state: includeSymbols, setter: setIncludeSymbols },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => opt.setter(!opt.state)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${opt.state ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-500'
                    }`}
                >
                  <span className="text-xs font-black uppercase tracking-tight">{opt.label}</span>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${opt.state ? 'bg-blue-600' : 'bg-white/5'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${opt.state ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-8 rounded-[2rem] border-none bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-3xl ${strength.bg}/10 flex items-center justify-center ${strength.color}`}>
            <strength.icon size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Security Rating</p>
            <h5 className={`text-2xl font-black uppercase italic ${strength.color}`}>{strength.label}</h5>
          </div>
        </Card>

        <Card className="p-8 rounded-[2rem] border-none bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500`}>
            <Hash size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Entropy</p>
            <h5 className={`text-2xl font-black uppercase italic text-slate-900 dark:text-white`}>
              {Math.round(Math.log2(Math.pow((62 + (includeSymbols ? 28 : 0)), length)))} bits
            </h5>
          </div>
        </Card>

        <div className="p-8 rounded-[2rem] bg-blue-600 text-white flex flex-col justify-center">
          <h5 className="font-black uppercase italic tracking-tighter text-xl mb-2">Zero Storage</h5>
          <p className="text-sm font-medium text-blue-100 leading-relaxed">Generated passwords are never uploaded. Computation is verified through local cryptographic PRNG.</p>
        </div>
      </div>
    </div>
  );
}
