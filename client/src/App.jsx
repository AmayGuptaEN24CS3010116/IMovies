import React, { useEffect, useMemo, useState } from "react";
import { Search, Clapperboard, Ticket, UserRound, X, CalendarDays, Clock3, Star, ChevronRight, Armchair, LogOut, Film } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const FALLBACK = [
  { _id:"dune", title:"Dune: Part Two", description:"Paul Atreides unites with Chani and the Fremen on a journey of revenge and destiny.", genre:["Sci-Fi","Adventure"], duration:166, rating:8.5, language:"English", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", price:220 },
  { _id:"spider", title:"Spider-Man: Across the Spider-Verse", description:"Miles Morales swings across the multiverse in an extraordinary animated adventure.", genre:["Animation","Action"], duration:140, rating:8.6, language:"English", certificate:"U/A", posterUrl:"https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj9588.jpg", price:200 },
  { _id:"batman", title:"The Batman", description:"A dark mystery draws Gotham's masked protector into a web of corruption.", genre:["Action","Crime"], duration:176, rating:7.8, language:"English", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", price:180 },
  { _id:"interstellar", title:"Interstellar", description:"Explorers venture beyond this galaxy to find a future for humanity.", genre:["Sci-Fi","Drama"], duration:169, rating:8.7, language:"English", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", price:190 },
  { _id:"jawan", title:"Jawan", description:"A man driven by a personal mission takes on corruption and injustice.", genre:["Action","Thriller"], duration:169, rating:7.0, language:"Hindi", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y3Au2t9Z6j.jpg", price:180 },
  { _id:"12thfail", title:"12th Fail", description:"An inspiring story of resilience, ambition and refusing to give up.", genre:["Drama"], duration:147, rating:8.8, language:"Hindi", certificate:"U", posterUrl:"https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg", price:160 }
];
const times = ["10:00 AM","1:15 PM","4:30 PM","7:45 PM"];
const localDateString = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const seats = Array.from({length:48},(_,i)=>`${String.fromCharCode(65+Math.floor(i/8))}${i%8+1}`);

export default function App() {
  const [movies,setMovies] = useState(FALLBACK);
  const [search,setSearch] = useState("");
  const [genre,setGenre] = useState("All");
  const [selected,setSelected] = useState(null);
  const [chosenSeats,setChosenSeats] = useState([]);
  const [date,setDate] = useState(new Date().toISOString().slice(0,10));
  const [time,setTime] = useState(times[2]);
  const [bookings,setBookings] = useState([]);
  const [token,setToken] = useState(localStorage.getItem("imovies_token") || "");
  const [user,setUser] = useState(JSON.parse(localStorage.getItem("imovies_user") || "null"));
  const [authOpen,setAuthOpen] = useState(false);
  const [authMode,setAuthMode] = useState("login");
  const [ticketOpen,setTicketOpen] = useState(false);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);

  const request = async (path, options={}) => {
    const response = await fetch(`${API}${path}`, { ...options, headers: { "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) }});
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  };
  useEffect(()=>{ request("/movies").then(d=>{if(d.movies?.length)setMovies(d.movies)}).catch(()=>{}); },[]);
  useEffect(()=>{ if(token) request("/bookings/my").then(d=>setBookings(d.bookings||[])).catch(()=>{}); },[token]);
  const genres = useMemo(()=>["All",...new Set(movies.flatMap(m=>m.genre||[]))],[movies]);
  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) && (genre==="All" || m.genre?.includes(genre)));
  const today = localDateString();

  function notify(message){ setNotice(message); window.setTimeout(()=>setNotice(""),3800); }
  function openMovie(movie){setSelected(movie);setChosenSeats([]);setDate(today);setTime(times[2]);}
  async function submitAuth(e){
    e.preventDefault(); setBusy(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const data = await request(`/auth/${authMode}`,{method:"POST",body:JSON.stringify(body)});
      setToken(data.token); setUser(data.user);
      localStorage.setItem("imovies_token",data.token); localStorage.setItem("imovies_user",JSON.stringify(data.user));
      setAuthOpen(false); notify(`Welcome${data.user.name ? `, ${data.user.name}` : ""}!`);
    } catch(err){notify(err.message)} finally{setBusy(false)}
  }
  async function book(){
    if(!token){setAuthMode("login");setAuthOpen(true);notify("Log in to confirm your booking.");return;}
    setBusy(true);
    try{
      const data = await request("/bookings",{method:"POST",body:JSON.stringify({movieId:selected._id,showDate:date,showTime:time,seats:chosenSeats})});
      setBookings(prev=>[data.booking,...prev]);setSelected(null);setTicketOpen(true);notify("Your seats are confirmed!");
    }catch(err){notify(err.message)}finally{setBusy(false)}
  }
  function logout(){setToken("");setUser(null);setBookings([]);localStorage.removeItem("imovies_token");localStorage.removeItem("imovies_user");notify("You have been logged out.");}
  return <div className="app">
    <header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Clapperboard size={21}/></span><span>i<span className="accent">Movies</span></span></a><nav><a href="#movies">Explore</a><a href="#how">How it works</a></nav><div className="header-actions"><button className="ticket-link" onClick={()=>token?setTicketOpen(true):(setAuthMode("login"),setAuthOpen(true))}><Ticket size={17}/> My Tickets</button>{user?<button className="avatar" title="Log out" onClick={logout}>{user.name?.[0]?.toUpperCase()||"U"}<LogOut size={13}/></button>:<button className="login-btn" onClick={()=>{setAuthMode("login");setAuthOpen(true)}}><UserRound size={16}/> Log in</button>}</div></header>
    <main>
      <section className="hero"><div className="hero-bg"></div><div className="hero-copy"><div className="eyebrow"><span className="live-dot"></span> YOUR CINEMA, REIMAGINED</div><h1>Big stories.<br/><span className="gradient-text">Bigger screen.</span></h1><p>Find your next favourite film and make it a night to remember. Your perfect seat is just a few clicks away.</p><a className="primary-btn" href="#movies">Explore movies <ChevronRight size={18}/></a><div className="hero-stats"><div><strong>6+</strong><span>Movies to explore</span></div><i></i><div><strong>Easy</strong><span>Seat selection</span></div><i></i><div><strong>Instant</strong><span>Booking confirmation</span></div></div></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="hero-poster"><img src={FALLBACK[0].posterUrl} alt="Dune: Part Two poster"/><div className="poster-overlay"><span>NOW SHOWING</span><strong>DUNE: PART TWO</strong><small>Experience it on the big screen</small></div></div><div className="floating-card"><Star size={15} fill="currentColor"/><div><strong>8.5 / 10</strong><span>Audience favourite</span></div></div></div></section>
      <section className="movie-section" id="movies"><div className="section-heading"><div><div className="eyebrow">PICK YOUR EXPERIENCE</div><h2>Now showing<span className="accent">.</span></h2><p>Handpicked stories for your next movie night.</p></div><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search movies..."/>{search&&<button onClick={()=>setSearch("")}><X size={15}/></button>}</div></div><div className="filters">{genres.map(g=><button key={g} className={genre===g?"filter active":"filter"} onClick={()=>setGenre(g)}>{g}</button>)}</div><div className="movie-grid">{filtered.map(movie=><article className="movie-card" key={movie._id}><button className="poster-button" onClick={()=>openMovie(movie)} aria-label={`Book ${movie.title}`}><img src={movie.posterUrl} alt={`${movie.title} poster`} onError={e=>{e.currentTarget.src="https://placehold.co/400x600/171923/ffffff?text=IMovies"}}/><span className="book-overlay">Book tickets <ChevronRight size={17}/></span><span className="rating"><Star size={13} fill="currentColor"/>{movie.rating||"—"}</span></button><div className="movie-info"><div className="movie-meta">{movie.certificate||"UA"} <span>•</span> {Math.floor(movie.duration/60)}h {movie.duration%60}m</div><h3>{movie.title}</h3><p>{movie.genre?.join(" · ")}</p><div className="movie-bottom"><span>From <strong>₹{movie.price}</strong></span><button onClick={()=>openMovie(movie)}>Book <ChevronRight size={15}/></button></div></div></article>)}</div>{!filtered.length&&<div className="empty"><Film size={28}/><h3>No movies found</h3><p>Try a different title or genre.</p></div>}</section>
      <section className="how-section" id="how"><div className="eyebrow">MOVIE NIGHT, MADE EASY</div><h2>Three steps to <span className="gradient-text">the good part.</span></h2><div className="steps"><div><span>01</span><Clapperboard/><h3>Find your film</h3><p>Explore movies, genres, ratings and runtimes.</p></div><div><span>02</span><Armchair/><h3>Pick your seats</h3><p>Choose a showtime and the seats you love.</p></div><div><span>03</span><Ticket/><h3>You're all set</h3><p>Confirm your booking and find your ticket in My Tickets.</p></div></div></section>
    </main><footer><a className="brand" href="#"><span className="brand-icon"><Clapperboard size={18}/></span><span>i<span className="accent">Movies</span></span></a><span>Good films. Great seats. Better memories.</span><small>© {new Date().getFullYear()} IMovies · Student project demo</small></footer>
    {notice&&<div className="toast">{notice}</div>}
    {selected&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}><div className="booking-modal"><button className="close" onClick={()=>setSelected(null)}><X/></button><div className="modal-movie"><img src={selected.posterUrl} alt=""/><div><div className="eyebrow">BOOK YOUR TICKETS</div><h2>{selected.title}</h2><p>{selected.description}</p><div className="modal-tags"><span><Star size={13} fill="currentColor"/> {selected.rating||"—"}</span><span>{selected.genre?.join(" · ")}</span><span>{selected.duration} min</span></div></div></div><div className="booking-controls"><label><CalendarDays size={16}/> Show date<input type="date" min={today} value={date} onChange={e=>setDate(e.target.value)}/></label><label><Clock3 size={16}/> Showtime<select value={time} onChange={e=>setTime(e.target.value)}>{times.map(t=><option key={t}>{t}</option>)}</select></label></div><div className="seat-title"><div><h3>Select your seats</h3><p>Tap to select or deselect</p></div><div className="seat-legend"><span><i></i> Available</span><span><i className="picked"></i> Selected</span><span><i className="occupied"></i> Occupied* </span></div></div><div className="screen"><span>SCREEN THIS WAY</span></div><div className="seat-grid">{seats.map((s,i)=><button key={s} disabled={i===3||i===12||i===27} className={`seat ${chosenSeats.includes(s)?"selected":""} ${[3,12,27].includes(i)?"occupied":""}`} onClick={()=>setChosenSeats(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s])}>{s}</button>)}</div><p className="seat-note">* Sample occupied seats for layout preview. Server checks real bookings when you confirm.</p><div className="checkout"><div><span>{chosenSeats.length} seat{chosenSeats.length===1?"":"s"} selected</span><strong>₹{chosenSeats.length*(selected.price||180)}</strong></div><button className="primary-btn" disabled={!chosenSeats.length||busy} onClick={book}>{busy?"Please wait...":"Confirm booking"} <ChevronRight size={17}/></button></div></div></div>}
    {authOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setAuthOpen(false)}><div className="auth-modal"><button className="close" onClick={()=>setAuthOpen(false)}><X/></button><div className="brand-icon large"><Clapperboard/></div><div className="eyebrow">WELCOME TO IMOVIES</div><h2>{authMode==="login"?"Good to see you.":"Join the movie club."}</h2><p>{authMode==="login"?"Log in to find your next favourite film.":"Create an account to book your perfect seat."}</p><form onSubmit={submitAuth}>{authMode==="register"&&<label>Your name<input name="name" placeholder="Alex Morgan" required minLength="2"/></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" required/></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" required minLength="8"/></label><button className="primary-btn full" disabled={busy}>{busy?"Please wait...":authMode==="login"?"Log in":"Create account"} <ChevronRight size={17}/></button></form><p className="switch-auth">{authMode==="login"?"New to IMovies?":"Already have an account?"} <button onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Create account":"Log in"}</button></p></div></div>}
    {ticketOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setTicketOpen(false)}><div className="tickets-modal"><button className="close" onClick={()=>setTicketOpen(false)}><X/></button><div className="eyebrow">YOUR MOVIE PLANS</div><h2>My tickets<span className="accent">.</span></h2>{!token?<div className="empty"><Ticket size={28}/><p>Log in to see your bookings.</p><button className="primary-btn" onClick={()=>{setTicketOpen(false);setAuthMode("login");setAuthOpen(true)}}>Log in <ChevronRight size={16}/></button></div>:bookings.length===0?<div className="empty"><Ticket size={28}/><h3>No bookings yet</h3><p>Your next movie night is waiting.</p><button className="primary-btn" onClick={()=>setTicketOpen(false)}>Explore movies</button></div>:<div className="ticket-list">{bookings.map(b=><div className="ticket-item" key={b._id}><img src={b.movie?.posterUrl} alt=""/><div><h3>{b.movie?.title}</h3><p>{b.showDate} · {b.showTime}</p><p>Seats: {b.seats?.join(", ")}</p><small>Booking code: {b.bookingCode}</small></div><strong>₹{b.totalAmount}</strong></div>)}</div>}</div></div>}
  </div>;
}
