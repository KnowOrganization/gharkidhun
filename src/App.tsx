import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Armchair, CookingPot, Bath, BedDouble, WashingMachine, ArrowUpRight, ArrowLeft, Plus, Share2, Music2, Play, X, Check, Sparkles } from 'lucide-react';
import { rooms, getSelection, parseSelection, selectionUrl, playlistUrl, normalizePlaylistUrl, validateSubmission, type Room, type RoomId, type Selection, type Submission } from './catalog';

const icons = { 'living-room': Armchair, kitchen: CookingPot, washroom: Bath, bedroom: BedDouble, utility: WashingMachine };
// Keep in sync with the stacked-layout media query and image preloads.
const stackedQuery = '(max-width: 1199px), (max-height: 799px)';
const initial = parseSelection(window.location.search);
const submissionKey = 'ghar-ki-dhun:demo-submissions:v1';
function SpotifyMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="12" fill="currentColor"/><g fill="none" stroke="#09271f" strokeLinecap="round"><path d="M5 9c5-2 10-1 14 1" strokeWidth="2"/><path d="M6 12c4-1.5 8-1 12 1" strokeWidth="1.8"/><path d="M7 15c3-1 6-.5 9 1" strokeWidth="1.6"/></g></svg>;
}
function Cover({ room }: { room: Room }) {
  return <div className={`cover cover-${room.cover}`} aria-hidden="true" />;
}

function Scene({ room, active, selected, onChoose }: { room: Room; active: boolean; selected: string; onChoose: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1536, height: 1024, left: 0, top: 0 });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [portrait, setPortrait] = useState(window.matchMedia(stackedQuery).matches);
  const [frameWidth, setFrameWidth] = useState(window.innerWidth);
  useEffect(() => {
    const node = container.current!;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setFrameWidth(w);
      const mobile = window.matchMedia(stackedQuery).matches;
      setPortrait(mobile);
      const ratio = mobile ? 2 / 3 : 1.5;
      const width = Math.max(w, h * ratio);
      const height = width / ratio;
      setDimensions({ width, height, left: (w - width) * .5, top: (h - height) / 2 });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} className={`scene ${active ? 'is-active' : ''} ${ready ? 'is-ready' : ''}`} aria-hidden={!active} inert={!active}>
    <div className="scene-camera">
      <div className="scene-plane" style={dimensions}>
        <picture><source media={stackedQuery} srcSet={`/art/${room.mobileImage}.webp`}/><img className="room-image" src={`/art/${room.image}.webp`} alt={`A sunlit Indian ${room.name.toLowerCase()}`} onLoad={() => { setReady(true); setFailed(false); }} onError={() => setFailed(true)} fetchPriority={room.id === 'living-room' ? 'high' : 'auto'} /></picture>
        {(portrait ? room.mobileEffects : room.effects).map((effect, index) => <div key={index} aria-hidden="true" className={`effect ${effect.kind}`} style={{ left: `${effect.x}%`, top: `${effect.y}%`, width: `${effect.width}%`, height: `${effect.height}%` }}>{Array.from({ length: effect.kind === 'shower' ? 9 : 3 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties}/>)}</div>)}
        <div className="sun-dust" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${42 + (i * 17 % 38)}%`, top: `${14 + (i * 23 % 60)}%`, '--i': i } as CSSProperties}/>)}</div>
        <div className="hotspots" aria-label={`${room.name} chores`}>
          {room.chores.map((chore, index) => { const anchor = portrait ? chore.mobileAnchor : chore.anchor; return <button key={chore.id} hidden={dimensions.left + dimensions.width * anchor.x / 100 < 20 || dimensions.left + dimensions.width * anchor.x / 100 > frameWidth - 20} className={`hotspot ${selected === chore.id ? 'selected' : ''} ${dimensions.left + dimensions.width * anchor.x / 100 > frameWidth - 155 ? 'align-left' : ''}`} style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }} onClick={() => onChoose(chore.id)} aria-label={`Find music for ${chore.label}`} aria-pressed={selected === chore.id}>
            <span className="hotspot-number" aria-hidden="true">{index + 1}</span><span className="hotspot-point"/><span className="hotspot-line"/><span className="hotspot-label"><span className="dot"/>{chore.label}<Music2 size={13}/></span>
          </button>; })}
        </div>
      </div>
    </div>
    {active && !ready && <p className="scene-loading" role="status">{failed ? 'The room image couldn’t load. You can still choose a chore below.' : 'Letting a little sunlight in…'}</p>}
  </div>;
}

function Contribution({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState<Submission>({ url: '', ...selection, name: '', description: '' });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const chosenRoom = rooms.find(r => r.id === value.room)!;
  useEffect(() => { dialog.current?.showModal(); }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    const message = validateSubmission(value);
    if (message) { setError(message); return; }
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(submissionKey) || '[]');
      if (!Array.isArray(raw)) throw new Error('Invalid storage');
      localStorage.setItem(submissionKey, JSON.stringify([...raw, { ...value, url: normalizePlaylistUrl(value.url), name: value.name.trim(), description: value.description.trim(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'demo-pending' }]));
      setSaved(true);
    } catch { setError('Your browser couldn’t save this demo submission. Please allow local storage and try again.'); }
  }
  return <dialog ref={dialog} className="contribution-dialog" aria-labelledby="contribute-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="icon-button dialog-close" onClick={onClose} aria-label="Close contribution form"><X size={20}/></button>
    {saved ? <div className="success-state"><span className="success-icon"><Check size={30}/></span><span className="eyebrow">A LITTLE MUSIC GOES A LONG WAY</span><h2 id="contribute-title">Thanks for the good tunes.</h2><p role="status">Saved on this device as a demo submission. It hasn’t been sent for review.</p><button className="primary-button" autoFocus onClick={onClose}>Back to your rhythm <ArrowLeft size={17}/></button></div> : <>
      <span className="eyebrow">FROM YOUR HOME, WITH LOVE</span><h2 id="contribute-title">Share your household favourites.</h2><p>That playlist that makes the dishes disappear? We’d love to hear it.</p>
      <div className="demo-notice"><Sparkles size={17}/><span><strong>Prototype preview</strong> · Saved only on this device. Nothing is sent for review or published.</span></div>
      <form onSubmit={submit} noValidate>
        <label>Spotify playlist link <span aria-hidden="true">*</span><input autoFocus type="url" required value={value.url} placeholder="https://open.spotify.com/playlist/…" onChange={e => setValue({ ...value, url: e.target.value })} aria-describedby={error ? 'form-error' : undefined}/></label>
        <div className="form-grid"><label>Room<select aria-label="Room" value={value.room} onChange={e => { const room = rooms.find(r => r.id === e.target.value)!; setValue({ ...value, room: room.id, chore: room.defaultChore }); }}>{rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
        <label>Chore<select aria-label="Chore" value={value.chore} onChange={e => setValue({ ...value, chore: e.target.value })}>{chosenRoom.chores.map(chore => <option key={chore.id} value={chore.id}>{chore.label}</option>)}</select></label></div>
        <label>Your name <small>optional</small><input value={value.name} maxLength={60} placeholder="What should we call you?" autoComplete="given-name" onChange={e => setValue({ ...value, name: e.target.value })}/></label>
        <label>A little about your playlist <small>optional</small><textarea value={value.description} maxLength={240} rows={2} placeholder="Best enjoyed with chai and a mountain of laundry…" onChange={e => setValue({ ...value, description: e.target.value })}/></label>
        {error && <p id="form-error" className="form-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button">Save demo submission <ArrowUpRight size={18}/></button>
      </form>
    </>}
  </dialog>;
}

export default function App() {
  const [selection, setSelection] = useState<Selection>(initial.selection);
  const [loaded, setLoaded] = useState<Selection>(initial.selection);
  const [expanded, setExpanded] = useState(initial.expanded);
  const [playerStarted, setPlayerStarted] = useState(initial.expanded);
  const [contribution, setContribution] = useState(false);
  const [shareFallback, setShareFallback] = useState('');
  const [toast, setToast] = useState('');
  const [reduced, setReduced] = useState(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(!document.hidden);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [embedSlow, setEmbedSlow] = useState(false);
  const [retry, setRetry] = useState(0);
  const lastFocus = useRef<HTMLElement | null>(null);
  const musicPanel = useRef<HTMLElement>(null);
  const panelBack = useRef<HTMLButtonElement>(null);
  const contributeTrigger = useRef<HTMLButtonElement>(null);
  const shareInput = useRef<HTMLInputElement>(null);
  const { room, chore } = getSelection(selection);
  const music = getSelection(loaded);
  const displayed = playerStarted ? music : { room, chore, playlist: getSelection(selection).playlist };
  const iframeSrc = `https://open.spotify.com/embed/playlist/${music.playlist.id}?utm_source=generator&theme=0`;

  useEffect(() => {
    const onPop = () => {
      const state = parseSelection(window.location.search);
      setSelection(state.selection);
      const isOpen = typeof history.state?.expanded === 'boolean' ? history.state.expanded : state.expanded;
      setExpanded(isOpen);
      // Restoring a room-only navigation must not disturb the music.
      if (isOpen) { setLoaded(state.selection); setPlayerStarted(true); }
    };
    window.addEventListener('popstate', onPop);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onReduced = () => setReduced(media.matches);
    const onVisibility = () => setVisible(!document.hidden);
    media.addEventListener('change', onReduced);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.removeEventListener('popstate', onPop); media.removeEventListener('change', onReduced); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    panelBack.current?.focus({ preventScroll: true });
    if (window.matchMedia(stackedQuery).matches) musicPanel.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [expanded]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape' && !contribution) { if (shareFallback) setShareFallback(''); else closePlayer(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    setEmbedLoaded(false); setEmbedSlow(false);
    if (!playerStarted) return;
    const timer = setTimeout(() => setEmbedSlow(true), 12000);
    return () => clearTimeout(timer);
  }, [iframeSrc, retry, playerStarted]);
  useEffect(() => { shareInput.current?.focus(); shareInput.current?.select(); }, [shareFallback]);

  function navigate(next: Selection, open: boolean) {
    setSelection(next); setExpanded(open);
    history.pushState({ expanded: open }, '', selectionUrl(next, window.location.href));
  }
  function changeRoom(id: RoomId) {
    if (id === room.id) return;
    const next = rooms.find(r => r.id === id)!;
    navigate({ room: id, chore: next.defaultChore }, false);
  }
  function chooseChore(id: string) {
    if (!expanded) lastFocus.current = document.activeElement as HTMLElement;
    const next = { room: room.id, chore: id };
    setLoaded(next); setPlayerStarted(true); navigate(next, true);
  }
  function openPlayer() {
    lastFocus.current = document.activeElement as HTMLElement;
    if (!playerStarted) setLoaded(selection);
    setPlayerStarted(true); setExpanded(true);
    history.replaceState({ expanded: true }, '', selectionUrl(selection, window.location.href));
  }
  function closePlayer() {
    if (!expanded) return;
    setExpanded(false);
    history.replaceState({ expanded: false }, '', window.location.href);
    requestAnimationFrame(() => {
      lastFocus.current?.focus({ preventScroll: true });
      if (window.matchMedia(stackedQuery).matches) (lastFocus.current || document.querySelector('#chore-list'))?.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  }
  async function share() {
    const url = selectionUrl(selection, window.location.href);
    const data = { title: `CHOREPLAY · ${chore.label}`, text: `${chore.title} — because every chore deserves a playlist.`, url };
    if (navigator.share) {
      try { await navigator.share(data); return; } catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); setToast('Your little moment, copied. Send it to someone you love.'); }
    catch { setShareFallback(url); }
  }

  return <main className={`experience ${expanded ? 'player-open' : ''} ${!reduced && visible ? '' : 'motion-paused'}`}>
    <a href="#chore-list" className="skip-link">Skip to chores</a>
    <div className="scene-shade" aria-hidden="true"/>
    <header className="site-header">
      <a className="wordmark" href="/" onClick={e => { e.preventDefault(); changeRoom('living-room'); }}>CHOREPLAY<span>because every chore deserves a playlist</span></a>
      <nav className="room-nav" aria-label="Explore rooms">{rooms.map(item => { const Icon = icons[item.id]; return <button key={item.id} aria-current={item.id === room.id ? 'page' : undefined} onClick={() => changeRoom(item.id)}><Icon size={23} strokeWidth={1.5}/><span className="nav-dot"/><span>{item.name}</span></button>; })}</nav>
    </header>
    <section className="room-intro" aria-live="polite" aria-atomic="true" key={room.id}>
      <p className="eyebrow"><span className="room-number">{room.number}</span>{room.name} <span className="slash">/</span> {chore.label}</p>
      <h1>{room.headline}</h1><p className="intro-description">{room.description}</p>
      <span className="intro-rule"/><p className="explore-hint"><span className="tiny-pulse"/>Pick a chore, we’ll pick the playlist.</p>
    </section>
    <div className="room-scenes">{rooms.map(item => <Scene key={item.id} room={item} active={item.id === room.id} selected={item.id === room.id ? chore.id : item.defaultChore} onChoose={chooseChore}/>)}</div>
    <div className="room-meta" aria-hidden="true"><span>CHORES, WITH A SOUNDTRACK.</span><span>{room.number} <i/> {String(rooms.length).padStart(2, '0')}</span></div>

    <section className="mobile-chores" id="chore-list" aria-label="Choose a chore" tabIndex={-1}><p>WHAT’S ON YOUR TO-DO?</p><div>{room.chores.map((item, index) => <button aria-label={item.label} key={item.id} aria-pressed={item.id === chore.id} onClick={() => chooseChore(item.id)}><span className="chore-number" aria-hidden="true">{index + 1}</span><span className="dot"/>{item.label}</button>)}</div></section>

    <section ref={musicPanel} className={`music-hub ${expanded ? 'expanded' : ''}`} aria-label="Music player">
      <p className="soundtrack-context">{playerStarted ? "Your soundtrack" : "A rhythm for your chore"} · {displayed.room.name} / {displayed.chore.label}</p>
      <div className="music-summary">
        <button className="cover-button" onClick={openPlayer} aria-label={`Explore ${displayed.chore.title}`}><Cover room={displayed.room}/><span className="cover-play"><Play size={22} fill="currentColor"/></span></button>
        <div className="music-copy"><div className="music-brand"><SpotifyMark/><span>Spotify</span><span className="demo-tag">DEMO SELECTION</span></div>
          <button className="music-title" onClick={openPlayer}>{displayed.chore.title}</button><p>{displayed.chore.tagline}</p>
          <div className="music-actions"><button className="listen-button" onClick={openPlayer}><span><Play size={17} fill="currentColor"/></span>Play</button><a href={playlistUrl(displayed.playlist.id)} target="_blank" rel="noreferrer">Open in Spotify <ArrowUpRight size={14}/></a></div>
        </div>
      </div>
      <div className="player-details" inert={!expanded} aria-hidden={!expanded}>
        <div className="player-topline"><button ref={panelBack} onClick={closePlayer}><ArrowLeft size={16}/> Back to room</button><span>{room.name}</span></div>
        <div className="player-chores" aria-label={`${room.name} playlists`}>{room.chores.map(item => <button key={item.id} aria-pressed={loaded.room === room.id && loaded.chore === item.id} onClick={() => chooseChore(item.id)}>{item.label}</button>)}</div>
        <p className="source-note">{music.playlist.curator ? 'Demo playlist: ' : 'Playlist: '}<strong>{music.playlist.title}</strong>{music.playlist.curator && <> by {music.playlist.curator}</>}{loaded.room !== room.id && <span> · Selected in {music.room.name}</span>}</p>
        <div className="embed-frame" aria-busy={!embedLoaded}>
          {playerStarted && <iframe key={retry} title="Spotify playlist player" src={iframeSrc} width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="eager" onLoad={() => setEmbedLoaded(true)}/>}
          {!embedLoaded && <span className="embed-loading">Loading your soundtrack…</span>}
        </div>
        <div className="embed-help"><span>{embedSlow && !embedLoaded ? 'Taking a little longer. Try Spotify directly.' : 'Press Play in Spotify above to listen.'}</span><a href={playlistUrl(music.playlist.id)} target="_blank" rel="noreferrer">Open in Spotify <ArrowUpRight size={12}/></a><button onClick={() => { setEmbedLoaded(false); setRetry(r => r + 1); }}>Reload player</button></div>
      </div>
    </section>

    <aside className="community-actions" aria-label="Share and contribute"><button onClick={share}><Share2 size={17}/><span>Share this moment</span></button><button ref={contributeTrigger} onClick={() => setContribution(true)}><Plus size={18}/><span>Add your playlist</span></button></aside>
    <footer className="site-footer"><p>Pick a room. Pick a chore. <em>Press play.</em></p><span className="footer-note">MADE FOR EVERY CHORE <span>♡</span></span></footer>
    {toast && <div className="toast" role="status"><Check size={17}/>{toast}</div>}
    {contribution && <Contribution selection={selection} onClose={() => { setContribution(false); requestAnimationFrame(() => contributeTrigger.current?.focus({ preventScroll: true })); }}/>}
    {shareFallback && <div className="share-fallback" role="region" aria-label="Copy this moment’s link"><button className="icon-button" aria-label="Close share link" onClick={() => setShareFallback('')}><X size={18}/></button><label>Copy this link to share your moment<input ref={shareInput} readOnly value={shareFallback} onFocus={e => e.target.select()}/></label></div>}
  </main>;
}
