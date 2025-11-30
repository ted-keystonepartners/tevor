'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 임시로 바로 대시보드로 이동 (실제로는 인증 처리 필요)
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 p-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building className="text-blue-500" size={40} />
            <span className="text-3xl font-bold text-white">TEVOR</span>
          </div>
          <p className="text-gray-400">인테리어 시공 AI 컨시어지</p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          {/* 탭 전환 */}
          <div className="flex mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-2 text-center font-medium transition-colors ${
                isLogin 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 border-b border-gray-700'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-2 text-center font-medium transition-colors ${
                !isLogin 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 border-b border-gray-700'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 로그인 폼 */}
          {isLogin ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="example@tevor.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input type="checkbox" className="mr-2" />
                  로그인 상태 유지
                </label>
                <button type="button" className="text-blue-400 hover:text-blue-300">
                  비밀번호 찾기
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                로그인
              </button>
            </form>
          ) : (
            /* 회원가입 폼 */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이름
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="홍길동"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="example@tevor.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="8자 이상 입력"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="비밀번호 재입력"
                    required
                  />
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span>
                    <button type="button" className="text-blue-400 hover:text-blue-300">이용약관</button> 및 
                    <button type="button" className="text-blue-400 hover:text-blue-300 ml-1">개인정보처리방침</button>에 동의합니다
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                회원가입
              </button>
            </form>
          )}

          {/* 소셜 로그인 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800/50 text-gray-400">또는</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Google로 계속하기
              </button>
              <button className="w-full py-3 bg-[#FEE500] text-gray-900 rounded-lg hover:bg-[#FDD835] transition-colors font-medium">
                카카오로 계속하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}