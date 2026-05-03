import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '👥',
    title: 'Create a Group',
    text: 'Set up your group in seconds and invite everyone who is splitting costs with you.',
  },
  {
    icon: '🧾',
    title: 'Log Expenses',
    text: 'Add any expense and we handle the math automatically — equal split or by percentage.',
  },
  {
    icon: '✅',
    title: 'Settle Up',
    text: 'See exactly who owes what and settle balances with one tap. No awkward conversations.',
  },
];

const moments = [
  { label: 'Road Trip', gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7C948 100%)' },
  { label: 'Group Dinner', gradient: 'linear-gradient(135deg, #7B2FF7 0%, #F72FBB 100%)' },
  { label: 'Weekend Getaway', gradient: 'linear-gradient(135deg, #11C5CF 0%, #48F7A8 100%)' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-logo">SplitEase</span>
        <button className="btn btn-gold-outline" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)',
        padding: '96px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 460,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Bouncing money emojis */}
        {[
          { emoji: '💰', top: '12%',  left: '6%',   size: '2.6rem', delay: '0s',    dur: '2.2s' },
          { emoji: '💸', top: '68%',  left: '4%',   size: '2rem',   delay: '0.5s',  dur: '2.8s', alt: true },
          { emoji: '🪙', top: '35%',  left: '14%',  size: '1.8rem', delay: '1.1s',  dur: '2.5s' },
          { emoji: '💵', top: '80%',  left: '22%',  size: '2.1rem', delay: '0.3s',  dur: '3s',   alt: true },
          { emoji: '💰', top: '10%',  right: '7%',  size: '2.4rem', delay: '0.7s',  dur: '2.6s', alt: true },
          { emoji: '💸', top: '62%',  right: '5%',  size: '2.2rem', delay: '1.4s',  dur: '2.3s' },
          { emoji: '🪙', top: '28%',  right: '13%', size: '1.7rem', delay: '0.9s',  dur: '2.9s', alt: true },
          { emoji: '💵', top: '82%',  right: '20%', size: '2rem',   delay: '0.2s',  dur: '2.4s' },
        ].map((item, i) => (
          <span
            key={i}
            className={`hero-emoji${item.alt ? ' alt' : ''}`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              fontSize: item.size,
              animationDelay: item.delay,
              animationDuration: item.dur,
            }}
          >
            {item.emoji}
          </span>
        ))}

        {/* Lightning bolt */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div className="hero-lightning-ring" style={{ top: '50%', marginTop: -60 }} />
          <span className="hero-lightning">⚡</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 4rem)',
          fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          maxWidth: 700,
          margin: '0 auto 20px',
          position: 'relative',
          zIndex: 2,
        }}>
          Split expenses.<br />Keep friendships.
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: 560,
          margin: '0 auto 36px',
          lineHeight: 1.7,
          position: 'relative',
          zIndex: 2,
        }}>
          SplitEase makes it effortless to track and split shared costs with your group —
          whether it is a trip, a dinner, or monthly rent. Fair, fast, and always in sync.
        </p>
        <button
          className="btn btn-lg"
          style={{ background: '#C9A84C', color: '#fff', fontSize: '1.05rem', padding: '14px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', position: 'relative', zIndex: 2 }}
          onClick={() => navigate('/register')}
        >
          Start a Group →
        </button>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: '#FAFAFA' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#2E7D32', marginBottom: 48, letterSpacing: '-0.5px' }}>
          Everything you need, nothing you don&apos;t
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: '2.8rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2E7D32', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#757575', lineHeight: 1.65 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Moment placeholders */}
      <section style={{ padding: '72px 24px', background: '#FFFFFF' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#2E7D32', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Made for every moment
        </h2>
        <p style={{ textAlign: 'center', color: '#757575', marginBottom: 40, fontSize: '0.95rem' }}>
          From spontaneous road trips to recurring roommate bills — SplitEase has you covered.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
          {moments.map((m) => (
            <div key={m.label} style={{
              height: 180,
              borderRadius: 16,
              background: m.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ background: '#2E7D32', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          Ready to stop doing the math?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: '0.95rem' }}>
          It&apos;s free, instant, and your group will thank you.
        </p>
        <button
          className="btn btn-lg"
          style={{ background: '#C9A84C', color: '#fff' }}
          onClick={() => navigate('/register')}
        >
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1A1A1A', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#9E9E9E', fontSize: '0.85rem' }}>
          SplitEase © 2025 — Making shared expenses painless
        </p>
      </footer>
    </div>
  );
}