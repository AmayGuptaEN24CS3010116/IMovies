import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Search, Clapperboard, Ticket, UserRound, X, CalendarDays, Clock3, Star,
  ChevronRight, Armchair, LogOut, Film, Bell, MapPin, CheckCircle2, CreditCard,
  RefreshCw, ShieldCheck, Ban
} from "lucide-react";
import AdminPanel from "./AdminPanel.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_ORIGIN = API.replace(/\/api\/?$/, "");
const localDateString = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const FALLBACK = [
  { _id:"dune", title:"Dune: Part Two", description:"Paul Atreides unites with Chani and the Fremen on a journey of revenge and destiny.", genre:["Sci-Fi","Adventure"], duration:166, rating:8.5, language:"English", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", price:220 },
  { _id:"spider", title:"Spider-Man: Across the Spider-Verse", description:"Miles Morales swings across the multiverse in an extraordinary animated adventure.", genre:["Animation","Action"], duration:140, rating:8.6, language:"English", certificate:"U/A", posterUrl:"https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj9588.jpg", price:200 },
  { _id:"batman", title:"The Batman", description:"A dark mystery draws Gotham's masked protector into a web of corruption.", genre:["Action","Crime"], duration:176, rating:7.8, language:"English", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", price:180 },
  { _id:"interstellar", title:"Interstellar", description:"Explorers venture beyond this galaxy to find a future for humanity.", genre:["Sci-Fi","Drama"], duration:169, rating:8.7, language:"English", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/gEU2Qni6E77NI6lCU6MxlNBvIx.jpg", price:190 },
  { _id:"jawan", title:"Jawan", description:"A man driven by a personal mission takes on corruption and injustice.", genre:["Action","Thriller"], duration:169, rating:7.0, language:"Hindi", certificate:"UA", posterUrl:"https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y3Au2t9Z6j.jpg", price:180 },
  { _id:"12thfail", title:"12th Fail", description:"An inspiring story of resilience, ambition and refusing to give up.", genre:["Drama"], duration:147, rating:8.8, language:"Hindi", certificate:"U", posterUrl:"https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg", price:160 }
];

function readSavedUser() {
  try { return JSON.parse(localStorage.getItem("imovies_user") || "null"); } catch { return null; }
}

export default function App() {
  const [movies,setMovies] = useState(FALLBACK);
  const [search,setSearch] = useState("");
  const [genre,setGenre] = useState("All");
  const [languageFilter,setLanguageFilter] = useState("All");
  const [cityFilter,setCityFilter] = useState("All");
  const [theatres,setTheatres] = useState([]);
  const [selected,setSelected] = useState(null);
  const [showDate,setShowDate] = useState(localDateString());
  const [shows,setShows] = useState([]);
  const [selectedShow,setSelectedShow] = useState(null);
  const [allSeats,setAllSeats] = useState([]);
  const [occupiedSeats,setOccupiedSeats] = useState([]);
  const [chosenSeats,setChosenSeats] = useState([]);
  const [bookings,setBookings] = useState([]);
  const [token,setToken] = useState(localStorage.getItem("imovies_token") || "");
  const [user,setUser] = useState(readSavedUser());
  const [authOpen,setAuthOpen] = useState(false);
  const [authMode,setAuthMode] = useState("login");
  const [ticketOpen,setTicketOpen] = useState(false);
  const [notificationOpen,setNotificationOpen] = useState(false);
  const [notifications,setNotifications] = useState([]);
  const [unread,setUnread] = useState(0);
  const [adminOpen,setAdminOpen] = useState(false);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [dataError,setDataError] = useState("");

  async function request(path, options={}) {
    let response;
    try {
      response = await fetch(`${API}${path}`, {
        ...options,
        headers: { "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) }
      });
    } catch {
      throw new Error("Could not reach the IMovies API. Check the deployment URL and connection.");
    }
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
    return data;
  }

  async function loadBookings() {
    if (!token) return;
    try { const data=await request("/bookings/my?limit=100");setBookings(data.bookings||[]); }
    catch (error) { if(error.message.toLowerCase().includes("session")||error.message.toLowerCase().includes("log in")){logout(false)}else notify(error.message); }
  }
  async function loadNotifications() {
    if (!token) { setAuthMode("login");setAuthOpen(true);return; }
    try { const data=await request("/notifications/my?limit=30");setNotifications(data.notifications||[]);setUnread(data.unread||0);setNotificationOpen(true); }
    catch(error){notify(error.message)}
  }
  useEffect(()=>{
    request("/theatres?limit=100").then(d=>setTheatres(d.theatres||[])).catch(()=>{});
  },[]);
  useEffect(()=>{
    request(`/movies?limit=100${cityFilter!=="All"?`&city=${encodeURIComponent(cityFilter)}`:""}`).then(d=>{if(Array.isArray(d.movies))setMovies(d.movies);setDataError("");}).catch(err=>setDataError(err.message));
  },[cityFilter]);
  useEffect(()=>{
    if (!token) return;
    request("/auth/me").then(d=>{setUser(d.user);localStorage.setItem("imovies_user",JSON.stringify(d.user));}).catch(()=>{});
    loadBookings();
  },[token]);

  useEffect(()=>{
    if(!selected) { setShows([]);setSelectedShow(null);return; }
    setSelectedShow(null);setChosenSeats([]);setAllSeats([]);setOccupiedSeats([]);
    request(`/shows?movieId=${encodeURIComponent(selected._id)}&date=${encodeURIComponent(showDate)}&city=${encodeURIComponent(cityFilter === "All" ? "" : cityFilter)}&limit=100`)
      .then(d=>setShows(d.shows||[])).catch(err=>{setShows([]);notify(err.message)});
  },[selected,showDate,cityFilter]);

  useEffect(()=>{
    if(!selectedShow?._id) return;
    let alive=true;
    const refreshSeats=()=>request(`/shows/${selectedShow._id}/seats`).then(data=>{
      if(!alive)return;setAllSeats(data.seats||[]);setOccupiedSeats(data.occupiedSeats||[]);
      setChosenSeats(prev=>prev.filter(seat=>!(data.occupiedSeats||[]).includes(seat)));
    }).catch(err=>alive&&notify(err.message));
    refreshSeats();
    const socket=io(API_ORIGIN,{transports:["websocket","polling"]});
    socket.on("connect",()=>socket.emit("join-show",selectedShow._id));
    socket.on("seats-updated",payload=>{if(String(payload?.showId)===String(selectedShow._id))refreshSeats();});
    return ()=>{alive=false;socket.emit("leave-show",selectedShow._id);socket.disconnect();};
  },[selectedShow?._id]);

  const genres = useMemo(()=>["All",...new Set(movies.flatMap(m=>m.genre||[]))],[movies]);
  const filtered = movies.filter(m=>m.title.toLowerCase().includes(search.toLowerCase())&&(genre==="All"||m.genre?.includes(genre))&&(languageFilter==="All"||m.language===languageFilter));
  const languages = useMemo(()=>["All",...new Set(movies.map(m=>m.language).filter(Boolean))],[movies]);
  const cities = useMemo(()=>["All",...new Set(theatres.map(t=>t.city).filter(Boolean))],[theatres]);
  const today=localDateString();
  function notify(message){setNotice(message);window.setTimeout(()=>setNotice(""),4200);}
  function openMovie(movie){setSelected(movie);setShowDate(today);setSelectedShow(null);setChosenSeats([]);}
  async function submitAuth(e){
    e.preventDefault();setBusy(true);
    const form=new FormData(e.currentTarget);const body=Object.fromEntries(form.entries());
    try{
      const data=await request(`/auth/${authMode}`,{method:"POST",body:JSON.stringify(body)});
      setToken(data.token);setUser(data.user);localStorage.setItem("imovies_token",data.token);localStorage.setItem("imovies_user",JSON.stringify(data.user));
      setAuthOpen(false);notify(`Welcome${data.user.name?`, ${data.user.name}`:""}!`);
    }catch(err){notify(err.message)}finally{setBusy(false)}
  }
  async function book(){
    if(!token){setAuthMode("login");setAuthOpen(true);notify("Log in to confirm your booking.");return;}
    if(!selectedShow){notify("Select a theatre and showtime first.");return;}
    setBusy(true);
    try{
      const data=await request("/bookings",{method:"POST",body:JSON.stringify({showId:selectedShow._id,seats:chosenSeats,paymentMode:"demo"})});
      setBookings(prev=>[data.booking,...prev]);setSelected(null);setSelectedShow(null);setTicketOpen(true);
      notify("Booking confirmed. Demo payment recorded; no money was charged.");
      await loadBookings();
    }catch(err){notify(err.message);if(err.message.toLowerCase().includes("seat")) request(`/shows/${selectedShow._id}/seats`).then(d=>setOccupiedSeats(d.occupiedSeats||[])).catch(()=>{});}
    finally{setBusy(false)}
  }
  async function cancelBooking(booking){
    if(!window.confirm(`Cancel booking ${booking.bookingCode}? This is a demo booking and no real payment will be refunded.`))return;
    try{const data=await request(`/bookings/${booking._id}/cancel`,{method:"PATCH",body:JSON.stringify({reason:"Cancelled by customer"})});setBookings(prev=>prev.map(b=>b._id===booking._id?{...b,...data.booking,status:"cancelled"}:b));notify(data.message||"Booking cancelled.");}
    catch(err){notify(err.message)}
  }
  async function markRead(item){try{await request(`/notifications/${item._id}/read`,{method:"PATCH"});setNotifications(prev=>prev.map(n=>n._id===item._id?{...n,readAt:new Date().toISOString()}:n));setUnread(prev=>Math.max(0,prev-(item.readAt?0:1)));}catch(err){notify(err.message)}}
  async function markAllRead(){try{await request("/notifications/read-all",{method:"PATCH"});setNotifications(prev=>prev.map(n=>({...n,readAt:n.readAt||new Date().toISOString()})));setUnread(0);}catch(err){notify(err.message)}}
  function logout(showNotice=true){setToken("");setUser(null);setBookings([]);setNotifications([]);setUnread(0);localStorage.removeItem("imovies_token");localStorage.removeItem("imovies_user");if(showNotice)notify("You have been logged out.");}

  return <div className="app">
    <header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Clapperboard size={21}/></span><span>i<span className="accent">Movies</span></span></a><nav><a href="#movies">Explore</a><a href="#how">How it works</a><a href="#venues">Cinema management</a></nav><div className="header-actions"><button className="ticket-link" onClick={()=>token?(loadBookings(),setTicketOpen(true)):(setAuthMode("login"),setAuthOpen(true))}><Ticket size={17}/> My Tickets</button>{token&&<button className="ticket-link notification-link" onClick={loadNotifications} title="Notifications"><Bell size={17}/>{unread>0&&<span className="notification-count">{unread}</span>}</button>}{user?.role==="admin"&&<button className="login-btn admin-open-btn" onClick={()=>setAdminOpen(true)}><ShieldCheck size={15}/> Admin</button>}{user?<button className="avatar" title="Log out" onClick={()=>logout()}>{user.name?.[0]?.toUpperCase()||"U"}<LogOut size={13}/></button>:<button className="login-btn" onClick={()=>{setAuthMode("login");setAuthOpen(true)}}><UserRound size={16}/> Log in</button>}</div></header>
    <main>
      <section className="hero"><div className="hero-bg"></div><div className="hero-copy"><div className="eyebrow"><span className="live-dot"></span> YOUR CINEMA, REIMAGINED</div><h1>Big stories.<br/><span className="gradient-text">Bigger screen.</span></h1><p>Find your next favourite film and make it a night to remember. Discover theatres, compare showtimes and choose your own seats.</p><a className="primary-btn" href="#movies">Explore movies <ChevronRight size={18}/></a><div className="hero-stats"><div><strong>{movies.length}+</strong><span>Movies to explore</span></div><i></i><div><strong>Live</strong><span>Seat availability</span></div><i></i><div><strong>Instant</strong><span>Booking confirmation</span></div></div></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="hero-poster"><img src={FALLBACK[0].posterUrl} alt="Dune: Part Two poster"/><div className="poster-overlay"><span>NOW SHOWING</span><strong>DUNE: PART TWO</strong><small>Experience it on the big screen</small></div></div><div className="floating-card"><Star size={15} fill="currentColor"/><div><strong>Choose your story</strong><span>Your seat is waiting</span></div></div></div></section>
      <section className="movie-section" id="movies"><div className="section-heading"><div><div className="eyebrow">PICK YOUR EXPERIENCE</div><h2>Now showing<span className="accent">.</span></h2><p>Handpicked stories for your next movie night.</p></div><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search movies..."/>{search&&<button onClick={()=>setSearch("")}><X size={15}/></button>}</div></div><div className="filters">{genres.map(g=><button key={g} className={genre===g?"filter active":"filter"} onClick={()=>setGenre(g)}>{g}</button>)}<select className="filter-select" value={languageFilter} onChange={e=>setLanguageFilter(e.target.value)} aria-label="Filter by language">{languages.map(item=><option key={item} value={item}>{item==="All"?"All languages":item}</option>)}</select><select className="filter-select" value={cityFilter} onChange={e=>setCityFilter(e.target.value)} aria-label="Filter by city">{cities.map(item=><option key={item} value={item}>{item==="All"?"All cities":item}</option>)}</select></div>{dataError&&<div className="inline-error">Live movie API is not available right now: {dataError}. Showing fallback movie cards.</div>}<div className="movie-grid">{filtered.map(movie=><article className="movie-card" key={movie._id}><button className="poster-button" onClick={()=>openMovie(movie)} aria-label={`Book ${movie.title}`}><img src={movie.posterUrl} alt={`${movie.title} poster`} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="https://placehold.co/400x600/171923/ffffff?text=IMovies";}}/><span className="book-overlay">Book tickets <ChevronRight size={17}/></span><span className="rating"><Star size={13} fill="currentColor"/>{movie.rating||"—"}</span></button><div className="movie-info"><div className="movie-meta">{movie.certificate||"UA"} <span>•</span> {Math.floor(movie.duration/60)}h {movie.duration%60}m</div><h3>{movie.title}</h3><p>{movie.genre?.join(" · ")}</p><div className="movie-bottom"><span>From <strong>₹{movie.price}</strong></span><button onClick={()=>openMovie(movie)}>Book <ChevronRight size={15}/></button></div></div></article>)}</div>{!filtered.length&&<div className="empty"><Film size={28}/><h3>No movies found</h3><p>Try a different title or genre.</p></div>}</section>
      <section className="how-section" id="how"><div className="eyebrow">MOVIE NIGHT, MADE EASY</div><h2>Three steps to <span className="gradient-text">the good part.</span></h2><div className="steps"><div><span>01</span><Clapperboard/><h3>Find your film</h3><p>Explore movies, genres, ratings and runtimes.</p></div><div><span>02</span><Armchair/><h3>Pick your seats</h3><p>Choose a cinema, date, showtime and seats. Live updates help keep availability current.</p></div><div><span>03</span><Ticket/><h3>You're all set</h3><p>Confirm your demo payment and find your booking in My Tickets.</p></div></div></section>
      <section className="venues-section" id="venues"><div><div className="eyebrow">BUILT FOR THE CINEMA EXPERIENCE</div><h2>One place for the whole show.</h2><p>Movie listings, theatre schedules, seat reservations, simulated checkout and booking history in one MERN application.</p></div><div className="venue-feature-grid"><div><MapPin/><strong>Theatres & showtimes</strong><span>Browse venues and scheduled shows.</span></div><div><RefreshCw/><strong>Live seat updates</strong><span>Seat changes broadcast with Socket.IO.</span></div><div><CreditCard/><strong>Demo checkout</strong><span>Payment workflow is simulated; no real money is charged.</span></div></div></section>
    </main><footer><a className="brand" href="#"><span className="brand-icon"><Clapperboard size={18}/></span><span>i<span className="accent">Movies</span></span></a><span>Good films. Great seats. Better memories.</span><small>© {new Date().getFullYear()} IMovies · Student project demo</small></footer>
    {notice&&<div className="toast">{notice}</div>}
    {selected&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}><div className="booking-modal extended-booking-modal"><button className="close" onClick={()=>setSelected(null)}><X/></button><div className="modal-movie"><img src={selected.posterUrl} alt=""/><div><div className="eyebrow">BOOK YOUR TICKETS</div><h2>{selected.title}</h2><p>{selected.description}</p><div className="modal-tags"><span><Star size={13} fill="currentColor"/> {selected.rating||"—"}</span><span>{selected.genre?.join(" · ")}</span><span>{selected.duration} min</span></div></div></div><div className="booking-controls"><label><CalendarDays size={16}/> Show date<input type="date" min={today} value={showDate} onChange={e=>setShowDate(e.target.value)}/></label><div className="show-price-hint">Select a scheduled theatre and show below.</div></div><div className="show-choice-list"><div className="section-mini-head"><h3>Available showtimes</h3><span>{shows.length} show{shows.length===1?"":"s"}</span></div>{shows.length?shows.map(show=><button key={show._id} className={`show-choice ${selectedShow?._id===show._id?"active":""}`} onClick={()=>{setSelectedShow(show);setChosenSeats([])}}><span className="show-choice-time"><Clock3 size={14}/>{show.showTime}</span><span className="show-choice-theatre"><strong>{show.theatre?.name||"Cinema"}</strong><small>{show.theatre?.city||""} · {show.screenName}</small></span><span className="show-choice-price">₹{show.price}</span></button>):<div className="no-shows">No scheduled shows for this movie and date. Choose another date or ask the admin to schedule a show.</div>}</div>{selectedShow&&<><div className="seat-title"><div><h3>Select your seats</h3><p>{selectedShow.theatre?.name} · {selectedShow.showTime} · Tap to select or deselect</p></div><div className="seat-legend"><span><i></i> Available</span><span><i className="picked"></i> Selected</span><span><i className="occupied"></i> Booked</span></div></div><div className="screen"><span>SCREEN THIS WAY</span></div><div className="seat-grid">{allSeats.map(seat=>{const isOccupied=occupiedSeats.includes(seat);return <button key={seat} disabled={isOccupied} className={`seat ${chosenSeats.includes(seat)?"selected":""} ${isOccupied?"occupied":""}`} onClick={()=>setChosenSeats(prev=>prev.includes(seat)?prev.filter(x=>x!==seat):prev.length>=8?prev:(prev.concat(seat)))}>{seat}</button>})}</div><p className="seat-note">Seat status refreshes when another customer books or cancels. Maximum 8 seats per booking.</p><div className="demo-payment-note"><CreditCard size={15}/><span>Demo payment only. This project does not collect real money.</span></div><div className="checkout"><div><span>{chosenSeats.length} seat{chosenSeats.length===1?"":"s"} selected</span><strong>₹{chosenSeats.length*(selectedShow.price||selected.price||180)}</strong></div><button className="primary-btn" disabled={!chosenSeats.length||busy} onClick={book}>{busy?"Please wait…":"Confirm demo booking"} <ChevronRight size={17}/></button></div></>}</div></div>}
    {authOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setAuthOpen(false)}><div className="auth-modal"><button className="close" onClick={()=>setAuthOpen(false)}><X/></button><div className="brand-icon large"><Clapperboard/></div><div className="eyebrow">WELCOME TO IMOVIES</div><h2>{authMode==="login"?"Good to see you.":"Join the movie club."}</h2><p>{authMode==="login"?"Log in to find your next favourite film.":"Create an account to book your perfect seat."}</p><form onSubmit={submitAuth}>{authMode==="register"&&<label>Your name<input name="name" placeholder="Alex Morgan" required minLength="2"/></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" required/></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" required minLength="8"/></label><button className="primary-btn full" disabled={busy}>{busy?"Please wait…":authMode==="login"?"Log in":"Create account"} <ChevronRight size={17}/></button></form><p className="switch-auth">{authMode==="login"?"New to IMovies?":"Already have an account?"} <button onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Create account":"Log in"}</button></p></div></div>}
    {ticketOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setTicketOpen(false)}><div className="tickets-modal"><button className="close" onClick={()=>setTicketOpen(false)}><X/></button><div className="eyebrow">YOUR MOVIE PLANS</div><h2>My tickets<span className="accent">.</span></h2>{!token?<div className="empty"><Ticket size={28}/><p>Log in to see your bookings.</p><button className="primary-btn" onClick={()=>{setTicketOpen(false);setAuthMode("login");setAuthOpen(true)}}>Log in <ChevronRight size={16}/></button></div>:bookings.length===0?<div className="empty"><Ticket size={28}/><h3>No bookings yet</h3><p>Your next movie night is waiting.</p><button className="primary-btn" onClick={()=>setTicketOpen(false)}>Explore movies</button></div>:<div className="ticket-list">{bookings.map(b=><div className={`ticket-item ticket-${b.status}`} key={b._id}><img src={b.movie?.posterUrl} alt=""/><div><h3>{b.movie?.title}</h3><p>{b.showDate} · {b.showTime}</p>{(b.show?.theatre||b.theatre)&&<p>{b.show?.theatre?.name||b.theatre?.name} · {b.show?.theatre?.city||b.theatre?.city}</p>}<p>Seats: {b.seats?.join(", ")}</p><small>Booking code: {b.bookingCode}</small><div><span className={`status-pill ${b.status}`}>{b.status}</span><span className="ticket-payment-label"> Demo payment: {b.paymentStatus||"simulated_success"}</span></div>{b.status==="confirmed"&&<button className="cancel-ticket" onClick={()=>cancelBooking(b)}><Ban size={13}/> Cancel booking</button>}</div><strong>₹{b.totalAmount}</strong></div>)}</div>}</div></div>}
    {notificationOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setNotificationOpen(false)}><div className="tickets-modal notifications-modal"><button className="close" onClick={()=>setNotificationOpen(false)}><X/></button><div className="eyebrow">ACCOUNT UPDATES</div><div className="notification-title-line"><h2>Notifications<span className="accent">.</span></h2>{unread>0&&<button className="secondary-btn" onClick={markAllRead}>Mark all read</button>}</div>{notifications.length?notifications.map(item=><div key={item._id} className={`notification-item ${item.readAt?"read":"unread"}`} onClick={()=>!item.readAt&&markRead(item)}><span className="notification-dot"></span><div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>{!item.readAt&&<span className="new-label">NEW</span>}</div>):<div className="empty"><Bell size={28}/><h3>No notifications yet</h3><p>Booking updates will appear here.</p></div>}</div></div>}
    {adminOpen&&<AdminPanel api={request} notify={notify} onClose={()=>setAdminOpen(false)}/>}
  </div>;
}
