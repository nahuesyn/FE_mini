import { useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STORAGE_KEY = 'deep_sea_portfolio_items_v7'

const DEFAULT_ITEMS = [
  { id: 'profile-1', section: 'profile', name: '김승언', tag: 'PROFILE', description: '생년월일: 2007.04.30\n혈액형: A\n별자리: 황소자리\n전화번호: 010-3097-2405\n이메일: eoniseung0430@gmail.com', created_at: '2026-05-01T00:00:00.000Z' },
  { id: 'timeline-1', section: 'timeline', name: '초등학교 졸업', tag: '2019년', description: '초등학교를 졸업했다.', created_at: '2026-05-01T00:01:00.000Z' },
  { id: 'timeline-2', section: 'timeline', name: '중학교 졸업', tag: '2022년', description: '중학교를 졸업했다.', created_at: '2026-05-01T00:02:00.000Z' },
  { id: 'timeline-4', section: 'timeline', name: '고등학교 졸업', tag: '2025년', description: '고등학교를 졸업했다.', created_at: '2026-05-01T00:04:00.000Z' },
  { id: 'project-1', section: 'project', name: '바이브 해커톤', tag: '코딩', description: '교내 바이브 해커톤에 참가를 했다.', created_at: '2026-05-01T00:05:00.000Z' },
  { id: 'project-2', section: 'project', name: '아이디어톤', tag: '동아리, 코딩', description: '아이디어톤에 참가해 2차 예선까지 갔다.', created_at: '2026-05-01T00:06:00.000Z' },
]

function getProfileRows(profile) {
  const allowedLabels = ['생년월일', '혈액형', '별자리', '전화번호', '이메일', '인스타', 'Instagram']
  const rows = [['이름', profile.name || '']]

  String(profile.description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const index = line.search(/[:：]/)
      if (index === -1) return

      const label = line.slice(0, index).trim()
      const value = line.slice(index + 1).trim()
      if (!value) return
      if (!allowedLabels.includes(label)) return

      rows.push([label, value])
    })

  return rows
}

const sectionOptions = [
  { value: 'profile', label: '프로필' },
  { value: 'timeline', label: '연대기' },
  { value: 'project', label: '프로젝트' },
]

const emptyForm = { section: 'profile', name: '', tag: '', description: '' }

function loadLocalItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (saved.length) return saved
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS))
  return DEFAULT_ITEMS
}

function saveLocalItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function getSectionTitle(section) {
  return section === 'profile' ? '프로필' : section === 'timeline' ? '연대기' : '프로젝트'
}

export default function App() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [adminOpen, setAdminOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hoveredProject, setHoveredProject] = useState(null)

  const profileItems = useMemo(() => items.filter((item) => item.section === 'profile'), [items])
  const timelineItems = useMemo(() => items.filter((item) => item.section === 'timeline').sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [items])
  const projectItems = useMemo(() => items.filter((item) => item.section === 'project').sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [items])

  const fetchItems = async () => {
    setLoading(true)
    setMessage('')
    if (!isSupabaseConfigured) {
      setItems(loadLocalItems())
      setLoading(false)
      return
    }
    const { data, error } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: true })
    if (error) {
      setMessage('Supabase 데이터를 불러오지 못했습니다.')
      setItems(DEFAULT_ITEMS)
      setLoading(false)
      return
    }
    setItems(data?.length ? data : DEFAULT_ITEMS)
    setLoading(false)
  }

  useEffect(() => {
    document.title = 'Deep Sea Portfolio'
    fetchItems()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const addItem = async (e) => {
    e.preventDefault()
    const payload = {
      section: form.section,
      name: form.name.trim(),
      tag: form.tag.trim(),
      description: form.description.trim(),
    }
    if (!payload.name) {
      setMessage('이름을 입력하세요.')
      return
    }
    setLoading(true)
    setMessage('')

    if (!isSupabaseConfigured) {
      let nextItems = [...items]
      if (payload.section === 'profile') {
        const profileIndex = nextItems.findIndex((item) => item.section === 'profile')
        const nextProfile = { ...payload, id: profileIndex >= 0 ? nextItems[profileIndex].id : Date.now() + Math.random(), created_at: new Date().toISOString() }
        if (profileIndex >= 0) nextItems[profileIndex] = nextProfile
        else nextItems.unshift(nextProfile)
      } else {
        nextItems.push({ ...payload, id: Date.now() + Math.random(), created_at: new Date().toISOString() })
      }
      setItems(nextItems)
      saveLocalItems(nextItems)
      setForm(emptyForm)
      setLoading(false)
      return
    }

    if (payload.section === 'profile') {
      const current = profileItems[0]
      if (current?.id) {
        const { error } = await supabase.from('portfolio_items').update(payload).eq('id', current.id)
        if (error) {
          setMessage('저장 실패')
          setLoading(false)
          return
        }
      } else {
        const { error } = await supabase.from('portfolio_items').insert(payload)
        if (error) {
          setMessage('저장 실패')
          setLoading(false)
          return
        }
      }
    } else {
      const { error } = await supabase.from('portfolio_items').insert(payload)
      if (error) {
        setMessage('저장 실패')
        setLoading(false)
        return
      }
    }

    setForm(emptyForm)
    await fetchItems()
  }

  const deleteItem = async (item) => {
    setLoading(true)
    if (!isSupabaseConfigured) {
      const nextItems = items.filter((target) => target.id !== item.id)
      setItems(nextItems)
      saveLocalItems(nextItems)
      setLoading(false)
      return
    }
    await supabase.from('portfolio_items').delete().eq('id', item.id)
    await fetchItems()
  }

  return (
    <div className="app">
      <button className="admin-toggle" onClick={() => setAdminOpen(true)}>관리자 입력</button>

      <Surface />
      <DeepSpacer />

      <main id="depth-content">
        <DepthZone depth="200M" id="zone-200" title="프로필" className="profile-zone">
          <ProfileContent items={profileItems} />
        </DepthZone>

        <DepthGap className="gap-after-200">
          <img className="gap-fish gap-dolphin" src="/assets/dolphin.png" alt="" />
          <img className="gap-fish gap-orca" src="/assets/orca.png" alt="" />
          <img className="gap-fish gap-silver" src="/assets/silver-fish.png" alt="" />
          <img className="gap-fish gap-bream" src="/assets/bream.png" alt="" />
          <img className="gap-fish gap-school" src="/assets/fish-school.png" alt="" />
        </DepthGap>

        <DepthZone depth="1000M" id="zone-1000" title="연대기" className="timeline-zone">
          <TimelineContent items={timelineItems} />
        </DepthZone>

        <DepthGap className="gap-after-1000">
          <img className="gap-fish gap-shark" src="/assets/shark2.png" alt="" />
          <img className="gap-fish gap-jelly" src="/assets/jellyfish.png" alt="" />
          <img className="gap-fish gap-jelly-2" src="/assets/jellyfish.png" alt="" />
          <img className="gap-fish gap-silver-2" src="/assets/silver-fish.png" alt="" />
        </DepthGap>

        <section className="squid-zone" id="zone-1250">
          <div className="zone-header squid-header"><div className="zone-depth-number">1250M</div></div>
          <img className="giant-squid" src="/assets/squid.png" alt="오징어" />
        </section>

        <DepthGap className="gap-after-squid">
          <img className="gap-fish gap-angler" src="/assets/anglerfish2.png" alt="" />
          <img className="gap-fish gap-octopus" src="/assets/octopus.png" alt="" />
          <img className="gap-fish gap-deep-bream" src="/assets/bream.png" alt="" />
        </DepthGap>

        <DepthZone depth="2000M" id="zone-2000" title="프로젝트" className="project-zone">
          <ProjectContent items={projectItems} hoveredProject={hoveredProject} onHover={setHoveredProject} />
        </DepthZone>
      </main>

      {adminOpen && (
        <AdminPanel
          form={form}
          items={items}
          loading={loading}
          message={message}
          onChange={handleChange}
          onClose={() => setAdminOpen(false)}
          onSubmit={addItem}
          onDelete={deleteItem}
        />
      )}
    </div>
  )
}

function Surface() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <section id="surface">
      <div id="water-surface" />
      <div className="caustic caustic-1" />
      <div className="caustic caustic-2" />
      <div className="caustic caustic-3" />
      <div className="hero-content">
        <div className="hero-title">바다</div>
      </div>
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />
      <div id="fish-layer">
        <div id="school">
          <button className="fish-button" onClick={() => scrollTo('zone-200')}><img src="/assets/nemo.png" alt="프로필 이동" /><span>프로필</span></button>
          <button className="fish-button" onClick={() => scrollTo('zone-1000')}><img src="/assets/nemo.png" alt="연대기 이동" /><span>연대기</span></button>
          <button className="fish-button" onClick={() => scrollTo('zone-2000')}><img src="/assets/nemo.png" alt="프로젝트 이동" /><span>프로젝트</span></button>
        </div>
      </div>
    </section>
  )
}

function DeepSpacer() {
  return (
    <div id="deep-spacer">
      <div className="descent-label" style={{ top: '7%' }}>0M</div>
      <div className="descent-label" style={{ top: '20%' }}>200M</div>
      <div className="descent-label" style={{ top: '48%' }}>1000M</div>
      <div className="descent-label" style={{ top: '62%' }}>1250M</div>
      <div className="descent-label" style={{ top: '88%' }}>2000M</div>

      <div className="bubble bubble-5" />
      <div className="bubble bubble-6" />
      <div className="bubble bubble-7" />
      <div className="bubble bubble-8" />
      <div className="bubble bubble-9" />
      <div className="bubble bubble-10" />

      <img className="ambient-fish shallow-fish-school" src="/assets/fish-school.png" alt="" />
      <img className="ambient-fish shallow-fish-school-2" src="/assets/fish-school.png" alt="" />
      <img className="ambient-fish shallow-bream" src="/assets/bream.png" alt="" />
      <img className="ambient-fish shallow-bream-2" src="/assets/bream.png" alt="" />
      <img className="ambient-fish shallow-silver-1" src="/assets/silver-fish.png" alt="" />
      <img className="ambient-fish shallow-dolphin" src="/assets/dolphin.png" alt="" />
      <img className="ambient-fish mid-orca" src="/assets/orca.png" alt="" />
      <img className="ambient-fish mid-jelly" src="/assets/jellyfish.png" alt="" />
      <img className="ambient-fish mid-jelly-2" src="/assets/jellyfish.png" alt="" />
      <img className="ambient-fish mid-silver-2" src="/assets/silver-fish.png" alt="" />
      <img className="ambient-fish deep-angler" src="/assets/anglerfish2.png" alt="" />
      <img className="ambient-fish deep-octopus" src="/assets/octopus.png" alt="" />
      <img className="ambient-fish deep-bream" src="/assets/bream.png" alt="" />
      <img className="ambient-fish whale-diver" src="/assets/whaleshark-diver.png" alt="" />
    </div>
  )
}

function DepthZone({ depth, title, id, className, children }) {
  return (
    <section className={`depth-zone ${className}`} id={id}>
      <div className="zone-header">
        <div className="zone-depth-number">{depth}</div>
        <div className="zone-title">{title}</div>
      </div>
      <div className="zone-divider" />
      <div className="cards-area">{children}</div>
    </section>
  )
}

function DepthGap({ className, children }) {
  return <section className={`depth-gap ${className}`}>{children}</section>
}

function ProfileContent({ items }) {
  const intro = items[0] || DEFAULT_ITEMS[0]
  return (
    <div className="profile-layout">
      <div className="profile-card">
        <div className="profile-photo-placeholder"><span>PHOTO</span></div>
        <div className="profile-copy">
          <div className="card-item-tag">{intro.tag || 'PROFILE'}</div>
          <div className="card-item-title">{intro.name}</div>
          <div className="card-item-body">{intro.description}</div>
        </div>
      </div>

      <div className="profile-info-card">
        {getProfileRows(intro).map(([label, value], index) => (
          <div className="profile-row" key={`${label}-${index}`}>
            <div className="profile-label">{label}</div>
            <div className="profile-value">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineContent({ items }) {
  const ordered = [...items]
  const count = Math.max(ordered.length, 1)
  const gap = count === 1 ? 0 : 70 / (count - 1)
  const points = ordered.map((_, index) => ({ x: index % 2 === 0 ? 25 : 72, y: 15 + index * gap }))
  const boardHeight = Math.max(620, 190 * count)

  return (
    <div className="timeline-board" style={{ height: `${boardHeight}px` }}>
      <svg className="timeline-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {points.slice(0, -1).map((point, index) => (
          <line
            key={index}
            x1={point.x}
            y1={point.y}
            x2={points[index + 1].x}
            y2={points[index + 1].y}
            className="timeline-line"
          />
        ))}
      </svg>

      {ordered.map((item, index) => (
        <div
          key={item.id}
          className={`timeline-node ${index % 2 === 0 ? 'left' : 'right'}`}
          style={{ left: `${points[index].x}%`, top: `${points[index].y}%` }}
        >
          <div className="timeline-dot" />
          <ContentCard item={item} />
        </div>
      ))}
    </div>
  )
}

function ProjectContent({ items, hoveredProject, onHover }) {
  const displayItems = items.length ? items : DEFAULT_ITEMS.filter((item) => item.section === 'project')
  const total = Math.max(displayItems.length, 1)

  const positions = displayItems.map((item, index) => {
    const x = total === 1 ? 50 : 12 + index * (76 / (total - 1))
    const y = index % 2 === 0 ? 64 : 34
    return { item, x, y }
  })

  const seaHeight = total <= 4 ? 560 : 680

  return (
    <div className="project-sea" style={{ minHeight: `${seaHeight}px` }}>
      <svg className="project-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {positions.slice(0, -1).map((point, index) => (
          <line key={index} x1={point.x} y1={point.y} x2={positions[index + 1].x} y2={positions[index + 1].y} className="project-line" />
        ))}
      </svg>

      {positions.map((turtle, index) => (
        <button
          key={`${turtle.item.id || turtle.item.name}-${index}`}
          className="turtle-node"
          style={{ left: `${turtle.x}%`, top: `${turtle.y}%` }}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(index)}
          onBlur={() => onHover(null)}
          type="button"
        >
          <img src="/assets/turtle.png" alt={`프로젝트 ${index + 1}`} />
          <span>{index + 1}</span>
        </button>
      ))}

      {positions.map((turtle, index) => (
        <div
          key={`card-${turtle.item.id || turtle.item.name}-${index}`}
          className={hoveredProject === index ? 'project-hover-card active' : 'project-hover-card'}
          style={{ left: `${turtle.x}%`, top: `${turtle.y}%` }}
        >
          <ContentCard item={turtle.item} />
        </div>
      ))}
    </div>
  )
}

function ContentCard({ item }) {
  return (
    <article className="card-item">
      {item.tag && <div className="card-item-tag">{item.tag}</div>}
      <div className="card-item-title">{item.name}</div>
      {item.description && <div className="card-item-body">{item.description}</div>}
    </article>
  )
}

function AdminPanel({ form, items, loading, message, onChange, onClose, onSubmit, onDelete }) {
  const nameInputRef = useRef(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  return (
    <div className="admin-backdrop">
      <section className="admin-panel">
        <div className="admin-header">
          <div>
            <div className="add-card-form-title">관리자 입력</div>
            <h2>이름 / 태그·연도 / 설명</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form className="admin-form" onSubmit={onSubmit}>
          <div className="form-field">
            <label>구역</label>
            <select name="section" value={form.section} onChange={onChange}>
              {sectionOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>이름</label>
            <input ref={nameInputRef} name="name" value={form.name} onChange={onChange} placeholder="이름을 입력하세요" />
          </div>
          <div className="form-field">
            <label>태그 / 연도</label>
            <input name="tag" value={form.tag} onChange={onChange} placeholder="태그나 연도를 입력하세요" />
          </div>
          <div className="form-field full-field">
            <label>설명</label>
            <textarea name="description" value={form.description} onChange={onChange} rows="4" placeholder="설명을 입력하세요" />
          </div>
          <button className="btn-add" disabled={loading}>{loading ? '저장 중' : form.section === 'profile' ? '프로필 저장' : '추가'}</button>
        </form>
        {message && <p className="admin-message">{message}</p>}

        <div className="admin-list">
          {items.map((item) => (
            <div className="admin-row" key={item.id}>
              <div><strong>{item.name}</strong><span>{getSectionTitle(item.section)} · {item.tag || '태그 없음'}</span></div>
              <button onClick={() => onDelete(item)}>삭제</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
