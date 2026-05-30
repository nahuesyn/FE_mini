import { useEffect, useState } from 'react';

const STEPS = ['프로필 입력', '경력 입력', '포트폴리오 입력'];

const emptyCareer = { year: '', title: '', description: '' };
const emptyPortfolio = { name: '', link: '', icon: null };

export default function InputPage({ visible, isLeaving, onComplete }) {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepDirection, setStepDirection] = useState('next');
  const [formData, setFormData] = useState({
    profile: {
      name: '',
      phone: '',
      school: '',
      instagram: '',
      email: '',
      major: '',
      subMajor: '',
      profileImage: null,
    },
    careers: [{ ...emptyCareer }],
    portfolios: [{ ...emptyPortfolio }],
  });

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 80);
    } else {
      setShow(false);
    }
  }, [visible]);

  const updateProfile = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  };

  const updateCareer = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      careers: prev.careers.map((career, i) =>
        i === index ? { ...career, [field]: value } : career
      ),
    }));
  };

  const updatePortfolio = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((portfolio, i) =>
        i === index ? { ...portfolio, [field]: value } : portfolio
      ),
    }));
  };

  const addCareer = () => {
    setFormData((prev) => ({
      ...prev,
      careers: [...prev.careers, { ...emptyCareer }],
    }));
  };

  const addPortfolio = () => {
    setFormData((prev) => ({
      ...prev,
      portfolios: [...prev.portfolios, { ...emptyPortfolio }],
    }));
  };

  const goToStep = (nextStep) => {
    if (nextStep === currentStep) return;
    setStepDirection(nextStep > currentStep ? 'next' : 'prev');
    setCurrentStep(nextStep);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
      return;
    }

    console.log(formData);
    onComplete?.(formData);
  };

  return (
    <section
      className="relative w-full h-screen overflow-hidden px-4 py-8 flex items-center justify-center"
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
        className="input-panel-rise relative z-10 w-full max-w-[920px] rounded-3xl p-5 sm:p-8"
        style={{
          background: 'rgba(5, 12, 32, 0.74)',
          border: '1px solid rgba(168, 200, 255, 0.24)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 80px rgba(0,0,0,0.48)',
        }}
      >
        <div className="mb-7">
          <p className="font-orbitron text-xs tracking-[0.28em] text-[#6ab4ff] mb-2">
            CREATE PORTFOLIO
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">포트폴리오 정보 입력</h1>
        </div>

        <div className="mb-8">
          <div className="relative mx-auto grid max-w-[680px] grid-cols-3 items-center">
            <div
              className="absolute left-[16.6%] right-[16.6%] top-[17px] h-px"
              style={{ background: 'rgba(168,200,255,0.18)' }}
            />
            <div
              className="absolute left-[16.6%] top-[17px] h-px transition-all duration-500"
              style={{
                width: `${(currentStep / (STEPS.length - 1)) * 66.8}%`,
                background: 'linear-gradient(90deg, rgba(106,180,255,0.15), rgba(106,180,255,0.95))',
                boxShadow: '0 0 18px rgba(106,180,255,0.45)',
              }}
            />
          {STEPS.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(index)}
              className="group relative z-10 flex flex-col items-center gap-2 text-xs sm:text-sm transition"
            >
              <span
                className={[
                  'grid h-9 w-9 place-items-center rounded-full border transition-all duration-300',
                  index === currentStep ? 'input-step-current' : '',
                  index < currentStep ? 'input-step-done' : '',
                ].join(' ')}
                style={{
                  color: index <= currentStep ? '#ffffff' : 'rgba(232,244,255,0.45)',
                  background:
                    index === currentStep
                      ? 'rgba(106,180,255,0.22)'
                      : index < currentStep
                        ? 'rgba(106,180,255,0.12)'
                        : 'rgba(255,255,255,0.05)',
                  borderColor:
                    index <= currentStep
                      ? 'rgba(106,180,255,0.65)'
                      : 'rgba(255,255,255,0.14)',
                }}
              >
                {index + 1}
              </span>
              <span
                className="text-[11px] sm:text-xs transition-colors duration-300"
                style={{
                  color: index === currentStep ? '#e8f4ff' : 'rgba(232,244,255,0.52)',
                }}
              >
                {step}
              </span>
            </button>
          ))}
          </div>
        </div>

        <div className="min-h-[340px]">
          {currentStep === 0 && (
            <StepPane direction={stepDirection}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="이름" value={formData.profile.name} onChange={(value) => updateProfile('name', value)} />
              <Input label="전화번호" value={formData.profile.phone} onChange={(value) => updateProfile('phone', value)} />
              <Input label="이메일" value={formData.profile.email} onChange={(value) => updateProfile('email', value)} />
              <Input label="인스타그램 계정" value={formData.profile.instagram} onChange={(value) => updateProfile('instagram', value)} />
              <Input label="학교" value={formData.profile.school} onChange={(value) => updateProfile('school', value)} />
              <Input label="전공" value={formData.profile.major} onChange={(value) => updateProfile('major', value)} />
              <Input label="복수/부전공" value={formData.profile.subMajor} onChange={(value) => updateProfile('subMajor', value)} />
              <label className="flex flex-col gap-2 text-sm text-white/78">
                프로필 사진
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateProfile('profileImage', e.target.files?.[0] ?? null)}
                  className="input-field rounded-2xl px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                />
              </label>
            </div>
            </StepPane>
          )}

          {currentStep === 1 && (
            <StepPane direction={stepDirection}>
            <div className="space-y-4">
              {formData.careers.map((career, index) => (
                <div key={index} className="input-card-pop grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 rounded-2xl p-4 bg-white/[0.06] border border-white/10">
                  <Input label="년도" value={career.year} onChange={(value) => updateCareer(index, 'year', value)} />
                  <Input label="경력 제목" value={career.title} onChange={(value) => updateCareer(index, 'title', value)} />
                  <div className="sm:col-span-2">
                    <Input label="설명" value={career.description} onChange={(value) => updateCareer(index, 'description', value)} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCareer} className="input-add-button text-sm text-[#a8c8ff]">
                + 경력 추가
              </button>
            </div>
            </StepPane>
          )}

          {currentStep === 2 && (
            <StepPane direction={stepDirection}>
            <div className="space-y-4">
              {formData.portfolios.map((portfolio, index) => (
                <div key={index} className="input-card-pop grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl p-4 bg-white/[0.06] border border-white/10">
                  <Input label="포트폴리오 이름" value={portfolio.name} onChange={(value) => updatePortfolio(index, 'name', value)} />
                  <Input label="링크" value={portfolio.link} onChange={(value) => updatePortfolio(index, 'link', value)} />
                  <FileInput
                    label="아이콘 파일(선택)"
                    file={portfolio.icon}
                    onChange={(file) => updatePortfolio(index, 'icon', file)}
                  />
                </div>
              ))}
              <button type="button" onClick={addPortfolio} className="input-add-button text-sm text-[#a8c8ff]">
                + 포트폴리오 추가
              </button>
            </div>
            </StepPane>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToStep(Math.max(currentStep - 1, 0))}
            disabled={currentStep === 0}
            className="px-5 py-3 rounded-full text-sm transition-all duration-300 disabled:opacity-35 enabled:hover:-translate-x-1"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
          >
            이전
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-full text-sm font-bold text-white transition-all duration-300 hover:translate-x-1 hover:shadow-[0_0_36px_rgba(106,180,255,0.35)]"
            style={{
              background: 'linear-gradient(135deg, rgba(106,180,255,0.88), rgba(190,125,255,0.86))',
              boxShadow: '0 0 34px rgba(106,180,255,0.24)',
            }}
          >
            {currentStep === STEPS.length - 1 ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </section>
  );
}

function StepPane({ direction, children }) {
  return (
    <div
      key={direction}
      className={direction === 'prev' ? 'input-step-pane-prev' : 'input-step-pane-next'}
    >
      {children}
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-white/78">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field h-12 rounded-2xl px-4 text-sm text-white outline-none placeholder:text-white/30"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      />
    </label>
  );
}

function FileInput({ label, file, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-white/78">
      {label}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="input-field rounded-2xl px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      />
      {file && (
        <span className="truncate text-xs text-white/45">
          {file.name}
        </span>
      )}
    </label>
  );
}
