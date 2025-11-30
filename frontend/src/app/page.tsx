'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowRight, Camera, Users, Clock, Images, Wallet, HandshakeIcon, MousePointer, RotateCw, Hand, Aperture, Network, Save, Send, FolderOpen, CreditCard } from 'lucide-react';
import TypewriterText from '@/components/TypewriterText';

export default function LandingPage() {
  const router = useRouter();
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showThirdLine, setShowThirdLine] = useState(false);
  const [showChatMessage1, setShowChatMessage1] = useState(false);
  const [showChatMessage2, setShowChatMessage2] = useState(false);
  const [showChatMessage3, setShowChatMessage3] = useState(false);
  const [showChatMessage4, setShowChatMessage4] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [message2Complete, setMessage2Complete] = useState(false);
  
  // Tap demo animation states
  const [showTapUserMessage, setShowTapUserMessage] = useState(false);
  const [showTapImage, setShowTapImage] = useState(false);
  const [showTapButton1, setShowTapButton1] = useState(false);
  const [showTapButton2, setShowTapButton2] = useState(false);
  
  // Snap demo animation states
  const [showSnapUserMessage, setShowSnapUserMessage] = useState(false);
  const [showSnapAIMessage, setShowSnapAIMessage] = useState(false);
  const [showSnapButton, setShowSnapButton] = useState(false);
  
  // Team demo animation states
  const [showTeamUserMessage, setShowTeamUserMessage] = useState(false);
  const [showTeamAIMessage, setShowTeamAIMessage] = useState(false);
  const [showTeamService, setShowTeamService] = useState(false);
  const [showTeamLoading, setShowTeamLoading] = useState(false);

  // Chat demo animation
  const resetChatAnimation = () => {
    setShowChatMessage1(false);
    setShowChatMessage2(false);
    setShowChatMessage3(false);
    setShowChatMessage4(false);
    setShowTypingIndicator(false);
    setMessage2Complete(false);
    
    setTimeout(() => {
      setShowChatMessage1(true);
    }, 500);
    
    setTimeout(() => {
      setShowTypingIndicator(true);
      setTimeout(() => {
        setShowTypingIndicator(false);
        setShowChatMessage2(true);
      }, 1000);
    }, 2000);
    
    setTimeout(() => setShowChatMessage3(true), 4000);
    setTimeout(() => setShowChatMessage4(true), 5000);
  };
  
  useEffect(() => {
    const timer1 = setTimeout(() => setShowChatMessage1(true), 1000);
    const timer2 = setTimeout(() => {
      setShowTypingIndicator(true);
      setTimeout(() => {
        setShowTypingIndicator(false);
        setShowChatMessage2(true);
      }, 1000);
    }, 2500);
    const timer3 = setTimeout(() => setShowChatMessage3(true), 4500);
    const timer4 = setTimeout(() => {
      setShowChatMessage4(true);
    }, 5500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Tap demo animation
  const resetTapAnimation = () => {
    setShowTapUserMessage(false);
    setShowTapImage(false);
    setShowTapButton1(false);
    setShowTapButton2(false);
    
    setTimeout(() => setShowTapUserMessage(true), 500);
    setTimeout(() => setShowTapImage(true), 1500);
    setTimeout(() => setShowTapButton1(true), 2500);
    setTimeout(() => setShowTapButton2(true), 3000);
  };
  
  // Snap demo animation
  const resetSnapAnimation = () => {
    setShowSnapUserMessage(false);
    setShowSnapAIMessage(false);
    setShowSnapButton(false);
    
    setTimeout(() => setShowSnapUserMessage(true), 500);
    setTimeout(() => setShowSnapAIMessage(true), 1500);
    setTimeout(() => setShowSnapButton(true), 2500);
  };
  
  // Team demo animation
  const resetTeamAnimation = () => {
    setShowTeamUserMessage(false);
    setShowTeamAIMessage(false);
    setShowTeamService(false);
    setShowTeamLoading(false);
    
    setTimeout(() => setShowTeamUserMessage(true), 500);
    setTimeout(() => setShowTeamAIMessage(true), 1500);
    setTimeout(() => {
      setShowTeamService(true);
      setShowTeamLoading(true);
    }, 2500);
    setTimeout(() => setShowTeamLoading(false), 4000);
  };
  
  useEffect(() => {
    const timer1 = setTimeout(() => setShowTapUserMessage(true), 500);
    const timer2 = setTimeout(() => setShowTapImage(true), 1500);
    const timer3 = setTimeout(() => setShowTapButton1(true), 2500);
    const timer4 = setTimeout(() => setShowTapButton2(true), 3000);
    
    const timer5 = setTimeout(() => setShowSnapUserMessage(true), 700);
    const timer6 = setTimeout(() => setShowSnapAIMessage(true), 1700);
    const timer7 = setTimeout(() => setShowSnapButton(true), 2700);
    
    const timer8 = setTimeout(() => setShowTeamUserMessage(true), 900);
    const timer9 = setTimeout(() => setShowTeamAIMessage(true), 1900);
    const timer10 = setTimeout(() => {
      setShowTeamService(true);
      setShowTeamLoading(true);
    }, 2900);
    const timer11 = setTimeout(() => setShowTeamLoading(false), 4400);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
      clearTimeout(timer8);
      clearTimeout(timer9);
      clearTimeout(timer10);
      clearTimeout(timer11);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gray-900">
          {/* Base gradient layer with color animation */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 animate-color-shift bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20"></div>
          </div>
          
          {/* Two moving focal points with radial gradients */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] animate-float-1">
              <div 
                className="w-full h-full animate-pulse-color-1"
                style={{
                  background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 25%, rgba(59, 130, 246, 0.03) 50%, transparent 70%)',
                  filter: 'blur(40px)'
                }}
              ></div>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] animate-float-2">
              <div 
                className="w-full h-full animate-pulse-color-2"
                style={{
                  background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.08) 25%, rgba(147, 51, 234, 0.03) 50%, transparent 70%)',
                  filter: 'blur(40px)'
                }}
              ></div>
            </div>
          </div>
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
            }}
          ></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
            <span className="inline-block">
              <TypewriterText 
                text="인테리어 프로젝트" 
                delay={30}
                onComplete={() => setShowSecondLine(true)}
              />
            </span>
            {showSecondLine && (
              <>
                <br className="sm:hidden" />
                <span className="inline-block ml-0 sm:ml-2">
                  <TypewriterText 
                    text="AI와 함께" 
                    delay={30}
                    startDelay={100}
                    onComplete={() => setShowThirdLine(true)}
                  />
                </span>
              </>
            )}
            {showThirdLine && (
              <>
                <br />
                <span className="text-blue-500 inline-block">
                  <TypewriterText 
                    text="tevor," 
                    delay={40}
                    startDelay={100}
                  />
                </span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-10 sm:mb-12 max-w-3xl mx-auto px-4">
            인테리어 프로젝트 운영의 모든 것을<br />
            가장 단순하게 만듭니다
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 text-sm sm:text-base md:text-lg font-medium"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* Why Section */}
      <section className="min-h-screen lg:h-screen flex flex-col justify-center items-center px-6 py-24 lg:py-0 bg-gray-850">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 px-4">
            {/* 왼쪽: 설명 텍스트 */}
            <div className="text-center lg:text-left flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                오직, 작업에만 몰입할 수 있습니다
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 mb-8 sm:mb-12">
                끝없는 현장 기록과 보고서 작성.<br />
                당신의 크리에이티브는 관리 업무에 갇혀 있었습니다
              </p>
              
              <div className="mb-8 lg:mb-16">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-400">
                  AI로 업무 효율을<br />
                  10배 높이세요
                </p>
              </div>
            </div>
            
            {/* 오른쪽: 채팅 데모 - 모바일에서는 아래로 */}
            <div className="flex flex-col justify-center">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 min-h-[280px] lg:h-[400px] relative">
                <div className="space-y-4">
                  {/* 사용자 메시지 */}
                  {showChatMessage1 && (
                    <div className="flex justify-end animate-push-up">
                      <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-[80%]">
                        <TypewriterText 
                          text="지난주에 주방 실측한 가로가 몇이었지?"
                          delay={30}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* AI 타이핑 인디케이터 */}
                  {showTypingIndicator && (
                    <div className="flex justify-start animate-push-up">
                      <div className="bg-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* AI 응답 */}
                  {showChatMessage2 && !showTypingIndicator && (
                    <div className="flex justify-start animate-push-up">
                      <div className="bg-gray-700 text-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                        <TypewriterText 
                          text="가로 2400mm입니다 사진까지 불러올까요?"
                          delay={30}
                          onComplete={() => setMessage2Complete(true)}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 추가 사용자 메시지 */}
                  {showChatMessage3 && (
                    <div className="flex justify-end animate-push-up">
                      <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-[80%]">
                        <TypewriterText 
                          text="응 보여줘"
                          delay={30}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* AI 이미지 응답 */}
                  {showChatMessage4 && (
                    <div className="flex justify-start animate-push-up">
                      <div className="max-w-[80%]">
                        <img 
                          src="/sample.jpg" 
                          alt="주방 실측 사진" 
                          className="rounded-xl w-full h-32 object-cover border border-gray-700"
                        />
                        <div className="text-xs text-gray-400 mt-1">주방_실측_2024.jpg</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Section */}
      <section className="min-h-screen lg:h-screen flex flex-col justify-center items-center px-6 py-32 lg:py-0">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-16 sm:mb-20 md:mb-24 text-center px-4">
            복잡함은 사라지고,<br className="sm:hidden" /> 편리함만 남았습니다
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-16 lg:gap-24 px-4">
            {/* Feature 1: Tap */}
            <div className="flex flex-col">
              <div className="text-center mb-10">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-400 mb-4">탭 대화</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  복잡한 타이핑은 필요 없습니다<br />
                  AI가 제안하는 버튼을 가볍게 누르세요<br />
                  그것으로 충분합니다
                </p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 min-h-[280px] lg:h-[360px] relative">
                {/* Tap 예시 - 채팅 형식 */}
                <div className="space-y-3">
                    {/* 사용자가 견적서 업로드 */}
                    {showTapUserMessage && (
                      <div className="flex justify-end animate-push-up">
                        <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            {/* Excel 아이콘 */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15,12H12.5V10.5C12.5,10.22 12.28,10 12,10C11.72,10 11.5,10.22 11.5,10.5V12H9A0.5,0.5 0 0,0 8.5,12.5C8.5,12.78 8.72,13 9,13H11.5V14.5C11.5,14.78 11.72,15 12,15C12.28,15 12.5,14.78 12.5,14.5V13H15A0.5,0.5 0 0,0 15.5,12.5A0.5,0.5 0 0,0 15,12M13,9V3.5L18.5,9H13Z"/>
                            </svg>
                            <TypewriterText 
                              text="견적서_최종.xlsx"
                              delay={30}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI 응답 */}
                    {showTapImage && (
                      <div className="flex justify-start animate-push-up">
                        <div className="bg-gray-700 text-gray-200 rounded-2xl px-4 py-3 max-w-[80%]">
                          <TypewriterText 
                            text="견적서 파일을 확인했습니다. 어떻게 처리할까요?"
                            delay={30}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* 버튼들 - 개별적으로 나타남 */}
                    {showTapButton1 && (
                      <div className="flex justify-start animate-push-up">
                        <button className="bg-gray-750 border border-gray-600 text-gray-200 rounded-2xl px-4 py-2.5 text-sm hover:bg-gray-700 hover:border-blue-500 transition-all flex items-center gap-2">
                          <Save className="w-4 h-4 text-blue-400" />
                          견적서저장
                        </button>
                      </div>
                    )}
                    
                    {showTapButton2 && (
                      <div className="flex justify-start animate-push-up">
                        <button className="bg-gray-750 border border-gray-600 text-gray-200 rounded-2xl px-4 py-2.5 text-sm hover:bg-gray-700 hover:border-blue-500 transition-all flex items-center gap-2">
                          <Send className="w-4 h-4 text-green-400" />
                          고객에게 전송하기
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Feature 2: Snap */}
            <div className="flex flex-col">
              <div className="text-center mb-10">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-400 mb-4">이미지 기록</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  현장을 가장 잘 설명하는 건 사진입니다<br />
                  찍는 순간, 공간과 상태가<br />
                  완벽한 데이터로 정리됩니다
                </p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 min-h-[280px] lg:h-[360px] relative">
                {/* Snap 예시 - 채팅 형식 */}
                <div className="space-y-3">
                    {/* 사용자가 이미지 업로드 */}
                    {showSnapUserMessage && (
                      <div className="flex justify-end animate-push-up">
                        <div className="max-w-[80%]">
                          <img 
                            src="/sample.png" 
                            alt="거실 사진" 
                            className="rounded-xl w-full h-32 object-cover border border-gray-700"
                          />
                          <div className="text-xs text-gray-400 mt-1 text-right">거실_시공후.png</div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI 응답 */}
                    {showSnapAIMessage && (
                      <div className="flex justify-start animate-push-up">
                        <div className="bg-gray-700 text-gray-200 rounded-2xl px-4 py-3 max-w-[80%]">
                          <TypewriterText 
                            text="거실사진 확인하였습니다. 시공 후 사진 폴더로 저장할까요?"
                            delay={30}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* 버튼 */}
                    {showSnapButton && (
                      <div className="flex justify-start animate-push-up">
                        <button className="bg-gray-750 border border-gray-600 text-gray-200 rounded-2xl px-4 py-2.5 text-sm hover:bg-gray-700 hover:border-blue-500 transition-all flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-blue-400" />
                          시공 후 폴더에 저장
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Feature 3: Team */}
            <div className="flex flex-col">
              <div className="text-center mb-10">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-400 mb-4">에이전트 팀</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  현장 기록부터 A/S까지<br />
                  5명의 전문가가 당신의 지시 없이도<br />
                  스스로 협력하여 프로젝트를 완성합니다
                </p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 min-h-[280px] lg:h-[360px] relative">
                {/* 채팅 대화 */}
                <div className="space-y-3">
                  {/* 사용자 메시지 */}
                  {showTeamUserMessage && (
                    <div className="flex justify-end animate-push-up">
                      <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-[85%]">
                        <TypewriterText 
                          text="이번달 거래처대금 카드로 처리해야겠다"
                          delay={30}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* AI 응답 */}
                  {showTeamAIMessage && (
                    <div className="flex justify-start animate-push-up">
                      <div className="bg-gray-700 text-gray-200 rounded-2xl px-4 py-3 max-w-[85%]">
                        <TypewriterText 
                          text="알겠습니다. 결제대행서비스 불러오겠습니다"
                          delay={30}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 서비스 로딩 카드 */}
                  {showTeamService && (
                    <div className="animate-push-up">
                      <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/10 border border-blue-500/30 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-600/20 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-blue-400">결제대행서비스 시작</div>
                            <div className="text-xs text-gray-400 mt-0.5">거래처 대금 결제를 도와드리겠습니다</div>
                          </div>
                          {showTeamLoading && (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 px-6 bg-gray-850">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center px-4">
            스마트한 파트너들이<br className="sm:hidden" /> 대기 중입니다
          </h2>
          <p className="text-base sm:text-lg text-gray-400 text-center mb-12 sm:mb-16 px-4 max-w-3xl mx-auto leading-relaxed">
            혼자 감당하지 마세요.<br className="sm:hidden" /> 
            당신의 업무 효율을 높여줄<br className="sm:hidden" /> 
            든든한 파트너들이 준비되어 있습니다.<br />
            이 생태계는 계속 확장되며,<br className="sm:hidden" /> 
            당신을 더 자유롭게 만들 것입니다.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-4">
            {/* Premium Demolition */}
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-400">프리미엄 철거</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">깔끔한 시작을 위한<br className="sm:hidden" /> 전문 철거팀</h3>
              <p className="text-gray-400 text-sm">
                소음과 분진을 최소화하는 프리미엄 철거 서비스. 폐기물 처리까지 완벽하게 처리합니다.
              </p>
            </div>

            {/* Materials Supply */}
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-400">자재 공급</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">검증된 자재사와<br className="sm:hidden" /> 직거래</h3>
              <p className="text-gray-400 text-sm">
                중간 마진 없는 투명한 가격. AI가 최적의 자재를 추천하고 배송까지 관리합니다.
              </p>
            </div>

            {/* Payment Agency */}
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-400">결제 대행</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">현금 흐름을<br className="sm:hidden" /> 유연하게</h3>
              <p className="text-gray-400 text-sm">
                인건비, 자재비 결제가 어려울 때, 카드 결제 대행으로 자금을 유연하게 운용하세요.
              </p>
            </div>

            {/* AS Center */}
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-400">A/S 센터</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">끝이 아닌<br className="sm:hidden" /> 시작입니다</h3>
              <p className="text-gray-400 text-sm">
                완공 후에도 지속적인 관리. 하자 발생 시 즉시 전문가를 매칭해드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 md:py-32 flex flex-col justify-center items-center px-6 relative overflow-hidden">
        {/* Animated Gradient Background - same as Hero */}
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] animate-float-1">
              <div 
                className="w-full h-full animate-pulse-color-1"
                style={{
                  background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 25%, rgba(59, 130, 246, 0.03) 50%, transparent 70%)',
                  filter: 'blur(40px)'
                }}
              ></div>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] animate-float-2">
              <div 
                className="w-full h-full animate-pulse-color-2"
                style={{
                  background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.08) 25%, rgba(147, 51, 234, 0.03) 50%, transparent 70%)',
                  filter: 'blur(40px)'
                }}
              ></div>
            </div>
          </div>
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
            }}
          ></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-10">
            <span className="text-white block">인테리어</span>
            <span className="text-blue-500 block mt-2">그 이상을 준비합니다</span>
          </h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 text-sm sm:text-base md:text-lg font-medium shadow-lg hover:shadow-xl"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Keystone Partners</h3>
              <p className="text-sm text-gray-400 mb-1">주식회사 키스톤파트너스</p>
              <p className="text-sm text-gray-500">AI와 비즈니스의 핵심을 연결하는 파트너</p>
            </div>
            
            {/* Business Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">사업자 정보</h4>
              <p className="text-sm text-gray-400 mb-1">사업자등록번호 : 583-88-01313</p>
              <p className="text-sm text-gray-400 mb-1">대표자 : 방성민</p>
              <p className="text-sm text-gray-400">경기도 안양시 동안구 흥안대로457-27</p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Keystone Partners. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}