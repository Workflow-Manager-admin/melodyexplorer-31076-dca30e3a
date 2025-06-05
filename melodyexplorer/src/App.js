import React, { useState, useEffect } from 'react';
import './App.css';

// Sample data for demonstration purposes
const LANGUAGE_LIST = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' }
];

const MUSIC_DIRECTORS = {
  en: [
    {
      id: 1,
      name: 'John Williams',
      image: 'https://i.scdn.co/image/ab6761610000e5eb30b6b3797069dff7a1c58853',
      songs: [
        { title: 'Star Wars Theme', preview: 'https://p.scdn.co/mp3-preview/fa0152d1d3e5e37acbd50a6b362b75e2fd1e3192?cid=774b29d4f13844c495f206cafdad9c86' },
        { title: 'Jurassic Park Theme', preview: 'https://p.scdn.co/mp3-preview/4e42bbd654e1fa1be69a317bdfab1d41d6124366?cid=774b29d4f13844c495f206cafdad9c86' },
      ]
    },
    {
      id: 2,
      name: 'Hans Zimmer',
      image: 'https://i.scdn.co/image/ab6761610000e5eb6a5b7c54ec3c94e71e2dfe2e',
      songs: [
        { title: 'Time', preview: 'https://p.scdn.co/mp3-preview/d63f49a4348c9ef75e743ca4a1e1b26ee5d2922c?cid=774b29d4f13844c495f206cafdad9c86' },
        { title: 'Interstellar', preview: null }
      ]
    },
  ],
  hi: [
    {
      id: 3,
      name: 'A. R. Rahman',
      image: 'https://i.scdn.co/image/ab6761610000e5ebf3ff5cd9a7e95135406aad71',
      songs: [
        { title: 'Jai Ho', preview: 'https://p.scdn.co/mp3-preview/ffb0802e9c2ae887c8fce09c712f5d0d6447c1a7?cid=774b29d4f13844c495f206cafdad9c86' },
        { title: 'Kun Faya Kun', preview: null }
      ]
    },
    {
      id: 4,
      name: 'Shankar–Ehsaan–Loy',
      image: 'https://i.scdn.co/image/ab6761610000e5eb03b7334f4788672a52b92c19',
      songs: [
        { title: 'Dil Chahta Hai', preview: null },
        { title: 'Senorita', preview: null }
      ]
    }
  ],
  ta: [
    {
      id: 5,
      name: 'Ilaiyaraaja',
      image: 'https://i.scdn.co/image/ab6761610000e5eb2adfde866391e986fe391df2',
      songs: [
        { title: 'Anjali Anjali', preview: null },
        { title: 'Thenpandi Cheemayile', preview: null }
      ]
    },
    {
      id: 6,
      name: 'Harris Jayaraj',
      image: 'https://i.scdn.co/image/ab6761610000e5eb20fb2a2d9e5ede0590fbb34f',
      songs: [
        { title: 'Vaaranam Aayiram', preview: null }
      ]
    }
  ],
  te: [
    {
      id: 7,
      name: 'M. M. Keeravani',
      image: 'https://i.scdn.co/image/ab6761610000e5eb555ac5d39d4c6e34445ca4ee',
      songs: [
        { title: 'Naatu Naatu', preview: 'https://p.scdn.co/mp3-preview/0ab1c9a6ea4d544889097cd3bd0b90c0116846d6?cid=774b29d4f13844c495f206cafdad9c86' }
      ]
    }
  ],
  ml: [
    {
      id: 8,
      name: 'Gopi Sundar',
      image: 'https://i.scdn.co/image/ab6761610000e5eb6cad4e1a8e6a2e6d1100a3d9',
      songs: [
        { title: 'Malare', preview: null },
        { title: 'Vathikkalu Vellaripravu', preview: null }
      ]
    }
  ]
};
// End of sample data

/**
 * PUBLIC_INTERFACE
 * Main container for MelodyExplorer: prompts for language, then shows music directors of that language.
 */
function MelodyExplorerMainContainer() {
  // UI & State Hooks
  // Null language means prompt for language selection
  const [language, setLanguage] = useState(null);
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioDemo, setAudioDemo] = useState({ url: '', directorId: '', songIdx: -1 });

  // Spotify API Credentials (DEMO: You should replace with a valid client_id and client_secret)
  // For a production real-world app, never expose secrets in frontend code; use a backend proxy.
  const SPOTIFY_CLIENT_ID = '';
  const SPOTIFY_CLIENT_SECRET = '';
  const [spotifyToken, setSpotifyToken] = useState(null);

  // Fetch Spotify token for search (for demo only, NOT production secure)
  useEffect(() => {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return;
    const authString = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${authString}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    })
      .then(res => res.json())
      .then(data => setSpotifyToken(data.access_token));
  }, [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET]);

  // PUBLIC_INTERFACE
  function handleLanguageChange(e) {
    setLanguage(e.target.value);
    setSelectedDirector(null);
    setSpotifyResults([]);
    setSearchQuery('');
  }

  // PUBLIC_INTERFACE
  function handleDirectorSelect(director) {
    setSelectedDirector(director);
    setSpotifyResults([]);
    setSearchQuery('');
    // Stop any demo audio on director change
    setAudioDemo({ url: '', directorId: '', songIdx: -1 });
  }

  // PUBLIC_INTERFACE
  function handleSongPlay(directorId, idx, url) {
    if (audioDemo.directorId === directorId && audioDemo.songIdx === idx) {
      setAudioDemo({ url: '', directorId: '', songIdx: -1 });
    } else {
      setAudioDemo({ url, directorId, songIdx: idx });
    }
  }

  // PUBLIC_INTERFACE
  async function handleSpotifySearch(e) {
    e.preventDefault();
    if (!searchQuery.trim() || !spotifyToken) return;
    setLoading(true);
    setSpotifyResults([]);
    try {
      const params = new URLSearchParams({ q: searchQuery, type: 'track', limit: '8' });
      const r = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      const data = await r.json();
      const results = (data.tracks && data.tracks.items) ? data.tracks.items : [];
      setSpotifyResults(results);
    } catch (error) {
      setSpotifyResults([]);
    }
    setLoading(false);
  }

  // Theming via inline root variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', '#1DB954');
    root.style.setProperty('--secondary', '#191414');
    root.style.setProperty('--accent', '#F5C518');
    root.style.setProperty('--base-light', '#F5FFF8');
    root.style.setProperty('--base-dark', '#FAFAFA');
    root.style.setProperty('--music-bg-1', 'rgba(29,185,84,0.08)');
    root.style.setProperty('--music-bg-2', 'rgba(245,197,24,0.10)');
    root.style.setProperty('--music-bg-3', 'rgba(25,20,20,0.07)');
    root.style.setProperty('--text-color', '#191414');
    root.style.setProperty('--border-color', '#ebebeb');
  }, []);

  // PUBLIC_INTERFACE
  function MusicDirectorsGrid({ directors, onDirectorSelect, selectedDirector }) {
    return (
      <div className="music-director-grid">
        {directors.map(d => (
          <div
            key={d.id}
            className={`director-card${selectedDirector && d.id === selectedDirector.id ? ' active' : ''}`}
            onClick={() => onDirectorSelect(d)}
            tabIndex={0}
            aria-label={`Select director ${d.name}`}
          >
            <div className="director-img-wrp">
              <img src={d.image} alt={d.name} className="director-img" />
            </div>
            <div className="director-name">{d.name}</div>
          </div>
        ))}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function SongList({ songs, directorId, audioDemo, onPlayClick }) {
    if (!songs || !songs.length) return (<div className="no-data">No songs available.</div>);
    return (
      <div className="song-list">
        {songs.map((song, i) => (
          <div key={i} className="song-card">
            <div className="song-title">{song.title}</div>
            {song.preview ? (
              // Preview button & player for mp3 preview, if provided
              <button
                className="play-btn"
                style={{ backgroundColor: audioDemo.directorId === directorId && audioDemo.songIdx === i ? 'var(--primary)' : 'var(--secondary)' }}
                onClick={() => onPlayClick(directorId, i, song.preview)}
              >
                {audioDemo.directorId === directorId && audioDemo.songIdx === i ? '⏹ Stop Demo' : '▶️ Play Demo'}
              </button>
            ) : null}
          </div>
        ))}
        {audioDemo.url &&
          <audio src={audioDemo.url} autoPlay controls style={{ marginTop: 12, width: 250 }} onEnded={() => setAudioDemo({ url: '', directorId: '', songIdx: -1 })}>
            Your browser does not support the audio element.
          </audio>
        }
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function SpotifySearchResults({ results }) {
    if (!results.length) return null;
    return (
      <div className="spotify-results">
        <h3>Spotify Search Results</h3>
        <div className="spotify-grid">
          {results.map((track) => (
            <div className="spotify-track-card" key={track.id}>
              <img src={track.album.images[1]?.url || track.album.images[0]?.url} alt={track.name} className="spotify-album-img" />
              <div className="spotify-track-name">{track.name}</div>
              <div className="spotify-artist">{track.artists.map(a => a.name).join(', ')}</div>
              <a
                href={track.external_urls.spotify}
                className="open-spotify-btn"
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: 'var(--primary)' }}
                tabIndex={0}
              >
                Open in Spotify
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If language is not yet selected, prompt user for language
  if (!language) {
    return (
      <div className="app melody-bg" style={{ minHeight: '100vh' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', width: '100vw'
        }}>
          <div className="logo melody-logo" style={{
            color: 'var(--secondary)', fontSize: '2rem', marginBottom: 24,
            background: 'rgba(255,255,255,0.85)', padding: '18px 32px', borderRadius: '12px'
          }}>
            <span className="logo-symbol" style={{ color: 'var(--primary)', fontSize: 42, marginRight: 8 }}>♫</span>
            MelodyExplorer
          </div>
          <div style={{
            fontSize: '1.27rem', color: 'var(--primary)', marginBottom: 14,
            fontWeight: 600, textAlign: 'center'
          }}>
            Select your music language to begin
          </div>
          <select
            aria-label="Select language"
            defaultValue=""
            className="lang-select"
            style={{
              background: 'var(--base-light)', color: 'var(--primary)',
              border: '1.6px solid var(--primary)', minWidth: 180, minHeight: 44, fontSize: "1.1rem"
            }}
            onChange={e => { if (e.target.value) handleLanguageChange(e); }}
          >
            <option disabled value="">Choose Language…</option>
            {LANGUAGE_LIST.map(l =>
              <option key={l.code} value={l.code}>{l.label}</option>
            )}
          </select>
        </div>
      </div>
    );
  }

  // Otherwise, display the normal UI
  return (
    <div className="app melody-bg">
      <nav className="navbar melody-navbar">
        <div className="container" style={{ maxWidth: 1180 }}>
          <div className="logo melody-logo" style={{ color: 'var(--secondary)' }}>
            <span className="logo-symbol" style={{ color: 'var(--primary)', fontSize: 26, marginRight: 4 }}>♫</span> MelodyExplorer
          </div>
          <div className="lang-select-wrp">
            <select
              aria-label="Select language"
              value={language}
              onChange={handleLanguageChange}
              className="lang-select"
              style={{ background: 'var(--base-light)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
            >
              {LANGUAGE_LIST.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <header className="melody-hero">
        <div className="hero container">
          <div className="subtitle" style={{ color: 'var(--accent)' }}>Discover Music Directors & Songs</div>
          <h1 className="title" style={{ color: 'var(--primary)' }}>MelodyExplorer</h1>
          <div className="description" style={{ color: 'var(--secondary)' }}>
            Select a language, explore legendary music directors, play demo tracks, or search any song via Spotify. Experience the world of music.
          </div>
          {/* Spotify search integration */}
          <form className="spotify-searchbar"
            style={{ marginTop: 24, display: 'flex', gap: 12 }}
            onSubmit={handleSpotifySearch}
          >
            <input
              type="text"
              className="spotify-search-input"
              placeholder="Search for songs on Spotify…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: 4,
                width: 280,
                fontSize: 16,
                background: 'var(--base-light)'
              }}
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              disabled={!spotifyToken && (SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_SECRET)}
            />
            <button
              className="btn"
              type="submit"
              style={{
                color: 'var(--base-light)', background: 'var(--primary)',
                fontWeight: 600, borderRadius: 4, fontSize: 16
              }}
              disabled={loading}
            >{loading ? 'Searching…' : 'Search'}</button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="melody-main-content" style={{ marginTop: 36 }}>
        <div className="container" style={{ maxWidth: 1180 }}>
          {/* Music director grid or section */}
          <div className="directors-section">
            <h2 className="melody-section-title" style={{ color: 'var(--secondary)', marginBottom: 6 }}>
              Music Directors
            </h2>
            <MusicDirectorsGrid
              directors={MUSIC_DIRECTORS[language]}
              selectedDirector={selectedDirector}
              onDirectorSelect={handleDirectorSelect}
            />
          </div>

          {/* Songs for selected director */}
          {selectedDirector && (
            <div className="songs-section">
              <h3 className="melody-section-title" style={{ color: 'var(--primary)' }}>
                Songs by {selectedDirector.name}
              </h3>
              <SongList
                songs={selectedDirector.songs}
                directorId={selectedDirector.id}
                audioDemo={audioDemo}
                onPlayClick={handleSongPlay}
              />
            </div>
          )}

          {/* Spotify Results */}
          {spotifyResults.length > 0 && (
            <div className="spotify-section">
              <SpotifySearchResults results={spotifyResults} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MelodyExplorerMainContainer;
