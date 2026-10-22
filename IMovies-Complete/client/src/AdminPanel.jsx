import React, { useEffect, useState } from "react";
import { Activity, Building2, Clapperboard, Film, Plus, RefreshCw, ShieldCheck, Trash2, Ticket, Pencil, X } from "lucide-react";

const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const emptyMovie = { title:"", description:"", genre:"Drama", duration:120, rating:7, language:"Hindi", certificate:"UA", posterUrl:"", price:180 };
const emptyTheatre = { name:"", city:"Bhopal", address:"", screens:2, facilities:"Parking, Food Court" };
const emptyShow = { movieId:"", theatreId:"", showDate:today(), showTime:"7:45 PM", screenName:"Screen 1", language:"Hindi", price:180, seatRows:6, seatsPerRow:8 };

export default function AdminPanel({ api, notify, onClose }) {
  const [tab,setTab] = useState("overview");
  const [stats,setStats] = useState(null);
  const [movies,setMovies] = useState([]);
  const [theatres,setTheatres] = useState([]);
  const [shows,setShows] = useState([]);
  const [bookings,setBookings] = useState([]);
  const [movieForm,setMovieForm] = useState(emptyMovie);
  const [theatreForm,setTheatreForm] = useState(emptyTheatre);
  const [showForm,setShowForm] = useState(emptyShow);
  const [editing,setEditing] = useState({type:"",id:""});
  const [busy,setBusy] = useState(false);

  async function loadAll() {
    setBusy(true);
    try {
      const [s,m,t,sh,b] = await Promise.all([
        api("/admin/stats"), api("/admin/movies?limit=100"), api("/admin/theatres?limit=100"),
        api("/admin/shows?limit=100"), api("/admin/bookings?limit=100")
      ]);
      setStats(s.stats);setMovies(m.movies||[]);setTheatres(t.theatres||[]);setShows(sh.shows||[]);setBookings(b.bookings||[]);
      if(!showForm.movieId && m.movies?.length) setShowForm(f=>({...f,movieId:m.movies[0]._id,price:m.movies[0].price}));
      if(!showForm.theatreId && t.theatres?.length) setShowForm(f=>({...f,theatreId:t.theatres[0]._id}));
    } catch (err) { notify(err.message); }
    finally { setBusy(false); }
  }
  useEffect(()=>{loadAll();},[]);

  async function submit(type,e) {
    e.preventDefault(); setBusy(true);
    try {
      if(type==="movies") {
        const body={...movieForm,genre:String(movieForm.genre).split(",").map(s=>s.trim()).filter(Boolean)};
        await api(editing.type===type?`/admin/movies/${editing.id}`:"/admin/movies",{method:editing.type===type?"PUT":"POST",body:JSON.stringify(body)});
        setMovieForm(emptyMovie);
      } else if(type==="theatres") {
        const body={...theatreForm,facilities:String(theatreForm.facilities).split(",").map(s=>s.trim()).filter(Boolean)};
        await api(editing.type===type?`/admin/theatres/${editing.id}`:"/admin/theatres",{method:editing.type===type?"PUT":"POST",body:JSON.stringify(body)});
        setTheatreForm(emptyTheatre);
      } else {
        await api(editing.type===type?`/admin/shows/${editing.id}`:"/admin/shows",{method:editing.type===type?"PUT":"POST",body:JSON.stringify(showForm)});
        setShowForm(emptyShow);
      }
      setEditing({type:"",id:""}); await loadAll(); notify(editing.type?"Record updated successfully.":"Record created successfully.");
    } catch(err){notify(err.message)} finally{setBusy(false)}
  }
  function editMovie(item){setMovieForm({...item,genre:(item.genre||[]).join(", ")});setEditing({type:"movies",id:item._id});setTab("movies");}
  function editTheatre(item){setTheatreForm({...item,facilities:(item.facilities||[]).join(", ")});setEditing({type:"theatres",id:item._id});setTab("theatres");}
  function editShow(item){setShowForm({movieId:item.movie?._id||item.movie,theatreId:item.theatre?._id||item.theatre,showDate:item.showDate,showTime:item.showTime,screenName:item.screenName,language:item.language,price:item.price,seatRows:item.seatRows,seatsPerRow:item.seatsPerRow});setEditing({type:"shows",id:item._id});setTab("shows");}
  async function remove(type,id) {
    if(!window.confirm(`Are you sure you want to ${type==="theatres"?"deactivate":type==="shows"?"cancel":"delete"} this ${type.slice(0,-1)}?`)) return;
    try { await api(`/admin/${type}/${id}`,{method:"DELETE"});await loadAll();notify("Action completed."); }
    catch(err){notify(err.message)}
  }
  const nav=[{id:"overview",label:"Overview",icon:Activity},{id:"movies",label:"Movies",icon:Film},{id:"theatres",label:"Theatres",icon:Building2},{id:"shows",label:"Shows",icon:Clapperboard},{id:"bookings",label:"Bookings",icon:Ticket}];
  const input=(form,setForm,key,label,type="text",extra={})=><label className="admin-field" key={key}>{label}<input type={type} value={form[key]??""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} required={extra.required!==false} min={extra.min} max={extra.max} placeholder={extra.placeholder||label}/></label>;
  const movieTable=<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Movie</th><th>Genres</th><th>Price</th><th>Actions</th></tr></thead><tbody>{movies.map(m=><tr key={m._id}><td>{m.title}</td><td>{m.genre?.join(", ")}</td><td>₹{m.price}</td><td><button className="icon-action" onClick={()=>editMovie(m)} title="Edit"><Pencil size={14}/></button><button className="icon-action danger" onClick={()=>remove("movies",m._id)} title="Delete"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>;
  const theatreTable=<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Theatre</th><th>City</th><th>Screens</th><th>Actions</th></tr></thead><tbody>{theatres.map(t=><tr key={t._id}><td>{t.name}</td><td>{t.city}</td><td>{t.screens}</td><td><button className="icon-action" onClick={()=>editTheatre(t)} title="Edit"><Pencil size={14}/></button><button className="icon-action danger" onClick={()=>remove("theatres",t._id)} title="Deactivate"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>;
  const showTable=<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Movie / Theatre</th><th>Date & time</th><th>Price</th><th>Actions</th></tr></thead><tbody>{shows.map(s=><tr key={s._id}><td>{s.movie?.title}<small>{s.theatre?.name}, {s.theatre?.city}</small></td><td>{s.showDate}<small>{s.showTime}</small></td><td>₹{s.price}</td><td><button className="icon-action" onClick={()=>editShow(s)} title="Edit"><Pencil size={14}/></button><button className="icon-action danger" onClick={()=>remove("shows",s._id)} title="Cancel show"><X size={14}/></button></td></tr>)}</tbody></table></div>;

  return <div className="modal-backdrop admin-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="admin-modal">
    <header className="admin-header"><div className="admin-brand"><span className="brand-icon"><ShieldCheck size={20}/></span><div><div className="eyebrow">IMOVIES CONTROL CENTRE</div><h2>Admin dashboard</h2></div></div><div className="admin-header-actions"><button className="icon-action" onClick={loadAll} title="Refresh"><RefreshCw size={15}/></button><button className="close" onClick={onClose}><X size={18}/></button></div></header>
    <nav className="admin-tabs">{nav.map(n=><button key={n.id} className={tab===n.id?"active":""} onClick={()=>setTab(n.id)}><n.icon size={15}/>{n.label}</button>)}</nav>
    <div className="admin-content">{busy&&<p className="admin-loading">Loading / saving…</p>}
      {tab==="overview"&&<><div className="admin-stats">{[{label:"Movies",value:stats?.movies},{label:"Active theatres",value:stats?.theatres},{label:"Scheduled shows",value:stats?.shows},{label:"Bookings",value:stats?.bookings},{label:"Registered users",value:stats?.users},{label:"Demo booking total",value:`₹${stats?.demoRevenue??0}`}].map(s=><div className="admin-stat" key={s.label}><span>{s.label}</span><strong>{s.value??"—"}</strong></div>)}</div><div className="admin-note"><ShieldCheck size={18}/><p>Only accounts with the <b>admin</b> role can access this panel. Payment entries are simulated for the student demo; no money is collected.</p></div></>}
      {tab==="movies"&&<div className="admin-columns"><form className="admin-form" onSubmit={e=>submit("movies",e)}><h3>{editing.type==="movies"?"Edit movie":"Add movie"}</h3>{input(movieForm,setMovieForm,"title","Title")}{input(movieForm,setMovieForm,"description","Description")}{input(movieForm,setMovieForm,"genre","Genres (comma separated)")}{input(movieForm,setMovieForm,"duration","Duration in minutes","number",{min:1})}{input(movieForm,setMovieForm,"rating","Rating","number",{min:0,max:10})}{input(movieForm,setMovieForm,"language","Language")}{input(movieForm,setMovieForm,"certificate","Certificate")}{input(movieForm,setMovieForm,"posterUrl","Poster image URL","url")}{input(movieForm,setMovieForm,"price","Default ticket price (₹)","number",{min:1})}<div className="admin-form-actions"><button className="primary-btn" disabled={busy}>{editing.type==="movies"?"Save movie":"Add movie"}</button>{editing.type==="movies"&&<button type="button" className="secondary-btn" onClick={()=>{setEditing({type:"",id:""});setMovieForm(emptyMovie)}}>Cancel</button>}</div></form><div><h3>Movie catalogue</h3>{movieTable}</div></div>}
      {tab==="theatres"&&<div className="admin-columns"><form className="admin-form" onSubmit={e=>submit("theatres",e)}><h3>{editing.type==="theatres"?"Edit theatre":"Add theatre"}</h3>{input(theatreForm,setTheatreForm,"name","Theatre name")}{input(theatreForm,setTheatreForm,"city","City")}{input(theatreForm,setTheatreForm,"address","Full address")}{input(theatreForm,setTheatreForm,"screens","Number of screens","number",{min:1})}{input(theatreForm,setTheatreForm,"facilities","Facilities (comma separated)","text",{required:false})}<div className="admin-form-actions"><button className="primary-btn" disabled={busy}>{editing.type==="theatres"?"Save theatre":"Add theatre"}</button>{editing.type==="theatres"&&<button type="button" className="secondary-btn" onClick={()=>{setEditing({type:"",id:""});setTheatreForm(emptyTheatre)}}>Cancel</button>}</div></form><div><h3>Theatres</h3>{theatreTable}</div></div>}
      {tab==="shows"&&<div className="admin-columns"><form className="admin-form" onSubmit={e=>submit("shows",e)}><h3>{editing.type==="shows"?"Edit show":"Schedule a show"}</h3><label className="admin-field">Movie<select required value={showForm.movieId} onChange={e=>{const m=movies.find(x=>x._id===e.target.value);setShowForm(f=>({...f,movieId:e.target.value,language:m?.language||f.language,price:m?.price||f.price}))}}>{movies.map(m=><option key={m._id} value={m._id}>{m.title}</option>)}</select></label><label className="admin-field">Theatre<select required value={showForm.theatreId} onChange={e=>setShowForm(f=>({...f,theatreId:e.target.value}))}>{theatres.filter(t=>t.active!==false).map(t=><option key={t._id} value={t._id}>{t.name} - {t.city}</option>)}</select></label>{input(showForm,setShowForm,"showDate","Show date","date")}{input(showForm,setShowForm,"showTime","Show time (e.g. 7:45 PM)")}{input(showForm,setShowForm,"screenName","Screen name")}{input(showForm,setShowForm,"language","Language")}{input(showForm,setShowForm,"price","Ticket price (₹)","number",{min:1})}<div className="admin-form-actions"><button className="primary-btn" disabled={busy||!movies.length||!theatres.length}>{editing.type==="shows"?"Save show":"Schedule show"}</button>{editing.type==="shows"&&<button type="button" className="secondary-btn" onClick={()=>{setEditing({type:"",id:""});setShowForm(emptyShow)}}>Cancel</button>}</div></form><div><h3>Scheduled shows</h3>{showTable}</div></div>}
      {tab==="bookings"&&<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Code</th><th>Customer</th><th>Movie</th><th>Date / Seats</th><th>Status</th><th>Total</th></tr></thead><tbody>{bookings.map(b=><tr key={b._id}><td>{b.bookingCode}</td><td>{b.user?.name}<small>{b.user?.email}</small></td><td>{b.movie?.title}</td><td>{b.showDate}<small>{b.seats?.join(", ")}</small></td><td><span className={`status-pill ${b.status}`}>{b.status}</span></td><td>₹{b.totalAmount}</td></tr>)}</tbody></table></div>}
    </div>
  </div></div>;
}
