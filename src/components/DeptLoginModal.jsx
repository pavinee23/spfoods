import { apiFetch } from '../lib/api.js'
import React, { useState } from 'react';
import { X, Lock, User, ChevronRight, Eye, EyeOff } from 'lucide-react';

const i18n = {
  th: {
    loginPrompt: 'เข้าสู่ระบบเพื่อจัดการแผนก',
    username:    'ชื่อผู้ใช้',
    password:    'รหัสผ่าน',
    loginBtn:    'เข้าสู่ระบบ',
    errWrong:    'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    errServer:   'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
  },
  en: {
    loginPrompt: 'Login to manage department',
    username:    'Username',
    password:    'Password',
    loginBtn:    'Login',
    errWrong:    'Invalid username or password',
    errServer:   'Cannot connect to server',
  },
  ko: {
    loginPrompt: '부서 관리를 위해 로그인하세요',
    username:    '사용자명',
    password:    '비밀번호',
    loginBtn:    '로그인',
    errWrong:    '사용자명 또는 비밀번호가 올바르지 않습니다',
    errServer:   '서버에 연결할 수 없습니다',
  },
};

export default function DeptLoginModal({ dept, labels, lang = 'th', onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const t = i18n[lang] || i18n.th;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.errWrong);
      } else {
        onSuccess(data.token);
      }
    } catch {
      setError(t.errServer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className={`bg-gradient-to-br ${dept.color} px-8 py-6 text-white`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-lg">
            <dept.icon className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-bold text-xl leading-tight">{labels.title}</h2>
          <p className="text-white/80 text-sm">{labels.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <p className="text-sm text-gray-500 text-center">{t.loginPrompt}</p>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.username}
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={t.password}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${dept.color} flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60`}
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>{t.loginBtn}</span><ChevronRight className="w-4 h-4" /></>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
