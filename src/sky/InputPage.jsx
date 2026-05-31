import { useEffect, useState } from 'react';

const STEPS = ['프로필 입력', '경력 입력', '포트폴리오 입력'];

const emptyCareer = { year: '', title: '', description: '' };
const emptyPortfolio = { name: '', link: '', icon: null };

export default function InputPage({ visible, isLeaving, onComplete }) {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepDirection, setStepDirection] = useState('next');
  const [formData, setFormData] = useState({
    profile: { name: '', phone: '', school: '', instagram: '', email: '', major: '', subMajor: '', profileImage: null },
    careers: [{ ...emptyCareer }],
    portfolios: [{ ...emptyPortfolio }],
  });

  useEffect(() => {
    if (visible) setTimeout(() => setShow(true), 80);
    else setShow(false);
  }, [visible]);

  const updateProfile = (field, value) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  const updateCareer = (i, field, value) => setFormData(prev => ({ ...prev, careers: prev.careers.map((c, j) => j === i ? { ...c, [field]: value } : c) }));
  const updatePortfolio = (i, field, value) => setFormData(prev => ({ ...prev, portfolios: prev.portfolios.map((p, j) => j === i ? { ...p, [field]: value } : p) }));
  const addCareer = () => setFormData(prev => ({ ...prev, careers: [...prev.careers, { ...emptyCareer }] }));
  const addPortfolio = () => setFormData(prev => ({ ...prev, portfolios: [...prev.portfolios, { ...emptyPortfolio }] }));

  const goToStep = (next) => {
    if (next === currentStep) return;
    setStepDirection(next > currentStep ? 'next' : 'prev');
    setCurrentStep(next);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) { goToStep(currentStep + 1); return; }
    onComplete?.(formData);
  };

  const panelInset = { paddingInline: 'clamp(28px, 7vw, 88px)' };

  return (
    <section
      className="relative w-full h-screen overflow-hidden flex items-center justify-center px-6"
      style={{
        backgroundImage: "url('/InputPage_BG.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: isLeaving ? 'scale(2.6)' : show ? 'scale(1)' : 'scale(1.16)',
        opacity: isLeaving ? 0 : show ? 1 : 0,
        transition: isLeaving
          ? 'transform 0.65s cubic-bezier(0.4,0,1,1), opacity 0.45s ease'
          : 'opacity 1.1s ease, transform 1.1s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <div className="input-nebula-drift absolute -inset-16 opacity-70" />
      <div className="input-star-sweep absolute inset-0 opacity-45" />

      <div
        className="input-panel-rise relative z-10 flex w-full max-w-[900px] flex-col rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(7, 15, 38, 0.86), rgba(4, 10, 27, 0.78))',
          border: '1px solid rgba(168, 200, 255, 0.22)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* 상단 헤더 */}
        <div className="pt-8 pb-5 border-b border-white/[0.07]" style={panelInset}>
          <p className="font-orbitron text-xs tracking-[0.14em] text-[#6ab4ff] mb-2">CREATE PORTFOLIO</p>
          <h1 className="text-2xl font-bold text-white leading-tight">포트폴리오 정보 입력</h1>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="py-5 border-b border-white/[0.07]" style={panelInset}>
          <div className="relative mx-auto grid max-w-[600px] grid-cols-3 items-center">
            <div className="absolute left-[16.6%] right-[16.6%] top-[18px] h-px" style={{ background: 'rgba(168,200,255,0.15)' }} />
            <div
              className="absolute left-[16.6%] top-[18px] h-px transition-all duration-500"
              style={{
                width: `${(currentStep / (STEPS.length - 1)) * 66.8}%`,
                background: 'linear-gradient(90deg, rgba(106,180,255,0.2), rgba(106,180,255,0.95))',
                boxShadow: '0 0 14px rgba(106,180,255,0.4)',
              }}
            />
            {STEPS.map((step, index) => (
              <button key={step} type="button" onClick={() => goToStep(index)} className="relative z-10 flex flex-col items-center gap-2">
                <span
                  className={['grid h-9 w-9 place-items-center rounded-full border text-sm transition-all duration-300', index === currentStep ? 'input-step-current' : index < currentStep ? 'input-step-done' : ''].join(' ')}
                  style={{
                    color: index <= currentStep ? '#ffffff' : 'rgba(232,244,255,0.4)',
                    background: index === currentStep ? 'rgba(106,180,255,0.22)' : index < currentStep ? 'rgba(106,180,255,0.12)' : 'rgba(255,255,255,0.05)',
                    borderColor: index <= currentStep ? 'rgba(106,180,255,0.65)' : 'rgba(255,255,255,0.12)',
                  }}
                >
                  {index + 1}
                </span>
                <span className="text-xs" style={{ color: index === currentStep ? '#e8f4ff' : 'rgba(232,244,255,0.45)' }}>{step}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 폼 영역 */}
        <div className="flex-1 py-8" style={panelInset}>
          {currentStep === 0 && (
            <StepPane direction={stepDirection}>
              <div className="mx-auto grid min-h-[292px] max-w-[680px] grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <Input label="이름" value={formData.profile.name} onChange={v => updateProfile('name', v)} />
                <Input label="전화번호" value={formData.profile.phone} onChange={v => updateProfile('phone', v)} />
                <Input label="이메일" value={formData.profile.email} onChange={v => updateProfile('email', v)} />
                <Input label="인스타그램 계정" value={formData.profile.instagram} onChange={v => updateProfile('instagram', v)} />
                <Input label="학교" value={formData.profile.school} onChange={v => updateProfile('school', v)} />
                <Input label="전공" value={formData.profile.major} onChange={v => updateProfile('major', v)} />
                <Input label="복수/부전공" value={formData.profile.subMajor} onChange={v => updateProfile('subMajor', v)} />
                <FileInput label="프로필 사진" file={formData.profile.profileImage} onChange={f => updateProfile('profileImage', f)} />
              </div>
            </StepPane>
          )}

          {currentStep === 1 && (
            <StepPane direction={stepDirection}>
              <div className="mx-auto min-h-[292px] max-w-[680px]">
                <div className="input-scroll-list max-h-[230px] overflow-y-auto pr-2">
                  <div className="flex flex-col gap-5 pb-1">
                    {formData.careers.map((career, i) => (
                      <div key={i} className="input-card-pop grid grid-cols-1 gap-5 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-6 sm:grid-cols-[140px_1fr]">
                        <Input label="년도" value={career.year} onChange={v => updateCareer(i, 'year', v)} />
                        <Input label="경력 제목" value={career.title} onChange={v => updateCareer(i, 'title', v)} />
                        <div className="sm:col-span-2">
                          <Input label="설명" value={career.description} onChange={v => updateCareer(i, 'description', v)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ paddingTop: 16 }}>
                  <button type="button" onClick={addCareer} className="input-add-button text-sm text-[#a8c8ff]">+ 경력 추가</button>
                </div>
              </div>
            </StepPane>
          )}

          {currentStep === 2 && (
            <StepPane direction={stepDirection}>
              <div className="mx-auto min-h-[292px] max-w-[680px]">
                <div className="input-scroll-list max-h-[230px] overflow-y-auto pr-2">
                  <div className="flex flex-col gap-5 pb-1">
                    {formData.portfolios.map((portfolio, i) => (
                      <div key={i} className="input-card-pop grid grid-cols-1 gap-5 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-6 sm:grid-cols-2">
                        <Input label="포트폴리오 이름" value={portfolio.name} onChange={v => updatePortfolio(i, 'name', v)} />
                        <Input label="링크" value={portfolio.link} onChange={v => updatePortfolio(i, 'link', v)} />
                        <div className="sm:col-span-2">
                          <FileInput label="아이콘 파일 (선택)" file={portfolio.icon} onChange={f => updatePortfolio(i, 'icon', f)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ paddingTop: 16 }}>
                  <button type="button" onClick={addPortfolio} className="input-add-button text-sm text-[#a8c8ff]">+ 포트폴리오 추가</button>
                </div>
              </div>
            </StepPane>
          )}
        </div>

        {/* 하단 버튼 */}
        <div
          className="py-5 border-t border-white/[0.07]"
          style={{ ...panelInset, background: 'rgba(0,0,0,0.18)' }}
        >
          <div
            className="mx-auto flex w-full max-w-[680px] items-center justify-between"
          >
            <button
              type="button"
              onClick={() => goToStep(Math.max(currentStep - 1, 0))}
              disabled={currentStep === 0}
              className="min-w-[120px] rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-0 enabled:hover:-translate-x-1"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
            >
              ← 이전
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="min-w-[150px] rounded-full px-10 py-3 text-base font-bold text-white transition-all duration-300 hover:translate-x-1 hover:shadow-[0_0_48px_rgba(106,180,255,0.45)]"
              style={{
                background: 'linear-gradient(135deg, rgba(106,180,255,0.9), rgba(190,125,255,0.88))',
                boxShadow: '0 0 34px rgba(106,180,255,0.28)',
                letterSpacing: '0.04em',
              }}
            >
              {currentStep === STEPS.length - 1 ? '완성 ✦' : '다음 →'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepPane({ direction, children }) {
  return <div className={direction === 'prev' ? 'input-step-pane-prev' : 'input-step-pane-next'}>{children}</div>;
}

function Input({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-2.5 text-sm" style={{ color: 'rgba(232,244,255,0.72)' }}>
      {label}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field h-13 rounded-2xl px-5 py-3 text-sm text-white outline-none placeholder:text-white/25"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
      />
    </label>
  );
}

function FileInput({ label, file, onChange }) {
  return (
    <label className="flex flex-col gap-2.5 text-sm cursor-pointer" style={{ color: 'rgba(232,244,255,0.72)' }}>
      {label}
      <div
        className="relative h-12 rounded-2xl flex items-center px-4 gap-3 transition-all duration-200 hover:border-[rgba(106,180,255,0.4)]"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <span
          className="text-xs px-3 py-1.5 rounded-full shrink-0"
          style={{ background: 'rgba(106,180,255,0.15)', border: '1px solid rgba(106,180,255,0.3)', color: '#a8c8ff' }}
        >
          파일 선택
        </span>
        <span className="text-xs truncate" style={{ color: file ? 'rgba(232,244,255,0.7)' : 'rgba(232,244,255,0.3)' }}>
          {file ? file.name : '선택된 파일 없음'}
        </span>
        <input type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0] ?? null)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
    </label>
  );
}
