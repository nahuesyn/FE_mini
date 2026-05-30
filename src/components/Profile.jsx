import { useEffect, useState } from 'react';

const DEFAULT_PROFILE = {
  name: '김형진',
  phone: '010-9188-0817',
  email: 'khj020817@naver.com',
  instagram: '@achi_jei',
  school: '수원대학교',
  major: '컴퓨터 SW',
  subMajor: '미디어 SW (부전공)',
  profileImage: null,
  profileImageUrl: '/Profile.jpg',
};

function normalize(data) {
  if (!data) return {};
  return {
    ...data,
    subMajor: data.subMajor ?? data.sub_major,
    profileImageUrl: data.profile_image_url ?? data.profileImageUrl,
  };
}

export default function Profile({ visible, isLeaving, profileData }) {
  const [show, setShow] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('/Profile.jpg');
  const profile = { ...DEFAULT_PROFILE, ...normalize(profileData) };
  const majorText = [profile.major, profile.subMajor].filter(Boolean).join(' · ');
  const info = [
    { icon: '📱', text: profile.phone },
    { icon: '✉', text: profile.email },
    { icon: '📸', text: profile.instagram },
    { icon: '🏫', text: profile.school },
    { icon: '💻', text: majorText },
  ].filter((item) => item.text);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 80);
    } else {
      setShow(false);
    }
  }, [visible]);

  useEffect(() => {
    if (profile.profileImage instanceof File) {
      const nextUrl = URL.createObjectURL(profile.profileImage);
      setPreviewUrl(nextUrl);
      return () => URL.revokeObjectURL(nextUrl);
    }
    setPreviewUrl(profile.profileImageUrl || '/Profile.jpg');
    return undefined;
  }, [profile.profileImage, profile.profileImageUrl]);

  return (
    <section
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      style={{
        backgroundImage: "url('/bg_triple.jpg')",
        backgroundSize: 'auto 300%',
        backgroundPosition: 'center 50%',
        transform: isLeaving ? 'scale(2.6)' : show ? 'scale(1)' : 'scale(1.4)',
        opacity: isLeaving ? 0 : show ? 1 : 0,
        transition: isLeaving
          ? 'transform 0.65s cubic-bezier(0.4,0,1,1), opacity 0.45s ease'
          : 'opacity 1.1s ease, transform 1.1s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="absolute inset-0 bg-black/38 z-0" />

      {/* Card — stacks vertically on mobile, horizontal on sm+ */}
      <div
        className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-10 items-center w-full max-w-[860px] rounded-3xl p-6 sm:p-10 glow-pulse"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Photo */}
        <div
          className="flex-shrink-0 rounded-2xl overflow-hidden"
          style={{
            width: 'clamp(120px, 22vw, 190px)',
            height: 'clamp(160px, 29vw, 250px)',
            border: '1.5px solid rgba(168,200,255,0.28)',
          }}
        >
          <img
            src={previewUrl}
            alt={profile.name}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left w-full">
          <h2
            className="font-orbitron mb-1"
            style={{
              fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
              color: 'var(--star-bright)',
              textShadow: '0 0 20px rgba(168,200,255,0.5)',
            }}
          >
            {profile.name}
          </h2>
          <p
            className="text-xs tracking-[0.22em] mb-5 sm:mb-7"
            style={{ color: 'var(--accent)', opacity: 0.85 }}
          >
            FRONTEND DEVELOPER · CREATOR
          </p>
          <ul className="flex flex-col gap-2 sm:gap-3">
            {info.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-center sm:justify-start gap-3"
                style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  color: 'rgba(232,244,255,0.88)',
                }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                  style={{
                    background: 'rgba(106,180,255,0.12)',
                    border: '1px solid rgba(106,180,255,0.3)',
                  }}
                >
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-xs tracking-widest float-hint"
        style={{ color: 'rgba(168,200,255,0.55)' }}
      >
        ↓ 스크롤하여 경력 보기
      </p>
    </section>
  );
}
