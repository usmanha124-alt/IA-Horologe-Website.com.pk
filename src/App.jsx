import { useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Minus, Plus, Search, Trash2 } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard, { formatPrice } from './components/ProductCard';
import { categories, heroSlides } from './data/products';
import { siteConfig } from './config/siteConfig';
import { useCart } from './context/CartContext';
import Dashboard from './admin/Dashboard';

function usePublicProducts(){
  const [publicProducts,setPublicProducts]=useState([]);
  useEffect(()=>{let active=true;fetch('/api/products').then(r=>r.ok?r.json():null).then(data=>{if(active&&data?.products) setPublicProducts(data.products)}).catch(()=>{});return()=>{active=false}},[]);
  return publicProducts;
}

function useSeo(title, description) { useEffect(() => { document.title = title ? `${title} | IA HOROLOGE` : 'IA HOROLOGE'; const meta = document.querySelector('meta[name="description"]'); if(meta) meta.content = description || 'IA HOROLOGE — curated luxury style and timepieces.'; }, [title, description]); }
function Hero() { const [slide,setSlide]=useState(0); useEffect(()=>{const t=setInterval(()=>setSlide(v=>(v+1)%heroSlides.length),6500);return()=>clearInterval(t)},[]); const s=heroSlides[slide]; return <section className="hero" aria-label="Featured collection"><div className="hero-bg" key={slide}><img src={s.image} alt="IA HOROLOGE collection"/><div className="hero-overlay"/></div><div className="hero-content" key={`text-${slide}`}><p className="eyebrow">{s.eyebrow}</p><h1>{s.title.split('\n').map((x,i)=><span key={i}>{x}<br/></span>)}</h1><p>{s.subtitle}</p><Link className="gold-button" to="/shop">EXPLORE COLLECTION <ArrowRight size={17}/></Link></div><button className="hero-arrow left" onClick={()=>setSlide(v=>(v-1+heroSlides.length)%heroSlides.length)} aria-label="Previous slide"><ChevronLeft/></button><button className="hero-arrow right" onClick={()=>setSlide(v=>(v+1)%heroSlides.length)} aria-label="Next slide"><ChevronRight/></button><div className="hero-dots">{heroSlides.map((_,i)=><button key={i} className={i===slide?'active':''} onClick={()=>setSlide(i)} aria-label={`Go to slide ${i+1}`}/>)}</div></section>; }

function Home(){useSeo('Luxury Collection','Discover refined style and curated objects from IA HOROLOGE.');const products=usePublicProducts();const featured=products.filter(p=>p.featured).slice(0,4);return <><Hero/><main>
<section className="intro section"><div className="intro-copy reveal"><p className="eyebrow">THE HOUSE OF IA HOROLOGE</p><h2>Elegance in every detail.</h2><p>IA HOROLOGE is an emerging destination for refined personal style. Our collection celebrates considered design, quiet luxury and the beauty of lasting impressions.</p><Link className="text-link" to="/about">Discover more <ArrowRight size={16}/></Link></div><div className="intro-image"><img src="/assets/catalogue/hero slide.jpeg" alt="IA HOROLOGE editorial collection" loading="lazy"/></div></section>
<section className="section"><div className="section-heading"><div><p className="eyebrow">CURATED EDITIONS</p><h2>Shop by category</h2></div></div><div className="category-grid">{categories.map(c=><Link className="category-card" to={`/shop?category=${c.id}`} key={c.id}><img src={c.image} alt={c.name} loading="lazy"/><div><p>{c.subtitle}</p><h3>{c.name}</h3><span>Explore <ArrowRight size={15}/></span></div></Link>)}</div></section>
<section className="section"><div className="section-heading"><div><p className="eyebrow">SELECTED FOR YOU</p><h2>The featured collection</h2></div><Link className="text-link" to="/shop">View all <ArrowRight size={16}/></Link></div>{featured.length?<div className="product-grid two">{featured.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p className="muted">The collection is being curated.</p>}<Link className="outline-button centered" to="/shop">VIEW ALL PRODUCTS</Link></section>
<section className="editorial-banner"><img src="/assets/catalogue/hero slide new img.jpeg" alt="Timeless elegance editorial" loading="lazy"/><div><p className="eyebrow">IA HOROLOGE EDITORIAL</p><h2>THE ART OF<br/>TIMELESS ELEGANCE</h2><Link className="gold-button" to="/shop">EXPLORE COLLECTION</Link></div></section>
<section className="values section"><p className="eyebrow">THE IA HOROLOGE APPROACH</p><h2>Why choose IA HOROLOGE</h2><div className="value-grid"><article><span>01</span><h3>Considered Selection</h3><p>Pieces chosen for their ability to complement a distinctive personal style.</p></article><article><span>02</span><h3>Personal Service</h3><p>A guided shopping experience with attentive support via WhatsApp.</p></article><article><span>03</span><h3>Modern Elegance</h3><p>A refined balance of contemporary character and timeless form.</p></article></div></section>
<section className="highlights section"><div><p>FORM</p><span/><h2>Designed<br/>with intention</h2></div><div><p>STYLE</p><span/><h2>Made for<br/>memorable moments</h2></div><div><p>TIME</p><span/><h2>Elegance that<br/>endures</h2></div></section>
<section className="section instagram"><div className="section-heading"><div><p className="eyebrow">SOCIAL JOURNAL</p><h2>Follow our journey</h2></div><a className="outline-button" href={siteConfig.instagram} target="_blank" rel="noreferrer">FOLLOW ON INSTAGRAM</a></div><div className="instagram-grid">{[...heroSlides, {image:'/assets/logo.jpg'}].slice(0,5).map((item,i)=><a href={siteConfig.instagram} target="_blank" rel="noreferrer" key={i}><img src={item.image} alt={`IA HOROLOGE Instagram ${i+1}`} loading="lazy"/></a>)}</div></section>
<section className="final-cta"><p className="eyebrow">YOUR SIGNATURE, YOUR STORY</p><h2>DISCOVER YOUR SIGNATURE STYLE</h2><p>Explore a collection shaped by elegance and individual expression.</p><Link className="gold-button" to="/shop">DISCOVER THE COLLECTION</Link></section>
</main></>;}

function Shop(){useSeo('Shop','Browse the IA HOROLOGE collection.');const products=usePublicProducts();const [params,setParams]=useSearchParams();const [search,setSearch]=useState('');const [sort,setSort]=useState('featured');const category=params.get('category')||'all';let filtered=products.filter(p=>p.availability&&(category==='all'||p.category===category)&&p.name.toLowerCase().includes(search.toLowerCase()));if(sort==='low')filtered=[...filtered].sort((a,b)=>a.price-b.price);if(sort==='high')filtered=[...filtered].sort((a,b)=>b.price-a.price);return <main className="inner-page"><div className="page-heading"><p className="eyebrow">THE COLLECTION</p><h1>Shop</h1></div><div className="shop-toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search collection"/></label><div className="filters"><select value={category} onChange={e=>{const n=new URLSearchParams(params);e.target.value==='all'?n.delete('category'):n.set('category',e.target.value);setParams(n)}} aria-label="Filter category"><option value="all">All categories</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div></div>{filtered.length?<div className="product-grid shop-grid">{filtered.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty-state"><h2>No pieces found</h2><p>Try another search or category.</p></div>}</main>}

function ProductDetails(){useSeo('Product Details','View product details at IA HOROLOGE.');const products=usePublicProducts();const {id}=useParams();const navigate=useNavigate();const product=products.find(p=>p.id===id);const [qty,setQty]=useState(1);const [active,setActive]=useState(0);const {addItem,cart}=useCart();if(!product)return <main className="inner-page empty-state"><h1>Product unavailable</h1><p>This product could not be found.</p><Link className="gold-button" to="/shop">Return to shop</Link></main>;const image=product.images?.[active]||'/assets/logo.jpg';const related=products.filter(p=>p.id!==id).slice(0,3);return <main className="inner-page product-detail"><Link className="back-link" to="/shop"><ArrowLeft size={16}/> Back to collection</Link><div className="detail-layout"><div className="detail-gallery"><div className="main-image"><img src={image} alt={product.name}/></div>{product.images?.length>1&&<div className="thumbnails">{product.images.map((img,i)=><button className={active===i?'active':''} onClick={()=>setActive(i)} key={i}><img src={img} alt={`${product.name} view ${i+1}`}/></button>)}</div>}</div><div className="detail-info"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="detail-price"><span className="detail-regular">Regular Price: Rs. {Number(product.regularPrice || 0).toLocaleString('en-PK')}</span><strong>Sale Price: {formatPrice(product.price)}</strong><small>You Save: Rs. {Number((product.regularPrice || 0) - (product.price || 0)).toLocaleString('en-PK')}</small></p><p className="description">{product.description}</p><div className="quantity-row"><span>Quantity</span><div className="quantity"><button onClick={()=>setQty(v=>Math.max(1,v-1))} aria-label="Decrease quantity"><Minus size={15}/></button><strong>{qty}</strong><button onClick={()=>setQty(v=>v+1)} aria-label="Increase quantity"><Plus size={15}/></button></div></div><button className="gold-button wide" onClick={()=>addItem(product,qty)}>ADD TO CART</button><button className="outline-button wide" onClick={()=>{addItem(product,qty);navigate('/cart',{state:{checkout:true}})}}>BUY NOW</button></div></div>{related.length>0&&<section className="related"><div className="section-heading"><h2>Related pieces</h2></div><div className="product-grid">{related.map(p=><ProductCard key={p.id} product={p}/>)}</div></section>}</main>}

export default function App(){const location=useLocation();if(location.pathname==='\/admin'||location.pathname.startsWith('\/admin\/')) return <Dashboard/>;return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/shop" element={<Shop/>}/><Route path="/product/:id" element={<ProductDetails/>}/><Route path="/cart" element={<CartCheckout/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<Home/>}/></Routes><a className="whatsapp-float" href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="Contact IA HOROLOGE on WhatsApp"><span>WhatsApp</span></a><Footer/></> }

function CartCheckout(){
  useSeo('Cart & Checkout','Review your IA HOROLOGE order and place a WhatsApp order.');
  const location=useLocation();
  const {cart,updateQuantity,removeItem,subtotal,clearCart}=useCart();
  const [mode,setMode]=useState(location.state?.checkout?'checkout':'cart');
  const [form,setForm]=useState({name:'',phone:'',email:'',city:'',address:'',notes:''});
  const [errors,setErrors]=useState({});
  const [submitting,setSubmitting]=useState(false);
  const [confirmation,setConfirmation]=useState(null);

  if(!cart.length && !confirmation) return <main className="inner-page empty-state"><p className="eyebrow">YOUR BAG</p><h1>Your bag is empty</h1><p>Discover the latest IA HOROLOGE collection.</p><Link className="gold-button" to="/shop">CONTINUE SHOPPING</Link></main>;

  const submit=async e=>{
    e.preventDefault();
    if(submitting || confirmation) return;
    const next={};
    ['name','phone','email','city','address'].forEach(k=>{if(!String(form[k]||'').trim()) next[k]='This field is required';});
    if(form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email='Enter a valid email address';
    if(form.phone && !/^[0-9+()\s-]{7,20}$/.test(form.phone)) next.phone='Enter a valid phone number';
    setErrors(next);
    if(Object.keys(next).length) return;

    setSubmitting(true);
    const now=new Date();
    const orderId=`IAH-${now.getFullYear()}-${now.getTime().toString().slice(-6)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const orderDate=now.toLocaleString('en-PK',{dateStyle:'medium',timeStyle:'short'});
    const delivery=Number(siteConfig.deliveryCharge)||0;
    const order={
      orderId,
      orderDate,
      customer:{name:form.name.trim(),phone:form.phone.trim(),email:form.email.trim(),city:form.city.trim(),address:form.address.trim(),notes:form.notes.trim()},
      products:cart.map(item=>({id:item.id,name:item.name,quantity:item.quantity,price:Number(item.price),subtotal:Number(item.price)*item.quantity})),
      subtotal:Number(subtotal),deliveryCharge:delivery,grandTotal:Number(subtotal)+delivery,status:'pending-whatsapp-send'
    };

    try {
      const savedOrders=JSON.parse(localStorage.getItem('ia-horologe-orders')||'[]');
      if(!savedOrders.some(saved=>saved.orderId===orderId)) {
        localStorage.setItem('ia-horologe-orders',JSON.stringify([...savedOrders,order]));
      }
    } catch {}

    try {
      await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});
    } catch {}

    const lines=[
      'IA HOROLOGE - NEW ORDER','',
      `Order ID: ${orderId}`,
      `Order Date: ${orderDate}`,'',
      'CUSTOMER INFORMATION:',
      `Name: ${order.customer.name}`,
      `Phone: ${order.customer.phone}`,
      `Email: ${order.customer.email}`,
      `City: ${order.customer.city}`,
      `Full Address: ${order.customer.address}`,'',
      'ORDER DETAILS:',''
    ];
    order.products.forEach((item,index)=>{
      lines.push(`Product ${index+1}: ${item.name}`);
      lines.push(`Quantity: ${item.quantity}`);
      lines.push(`Price: ${formatPrice(item.price)}`);
      lines.push(`Subtotal: ${formatPrice(item.subtotal)}`,'');
    });
    lines.push('ORDER SUMMARY:');
    lines.push(`Subtotal: ${formatPrice(order.subtotal)}`);
    lines.push(`Delivery Charges: ${formatPrice(order.deliveryCharge)}`);
    lines.push(`Grand Total: ${formatPrice(order.grandTotal)}`,'');
    lines.push(`Additional Notes: ${order.customer.notes||'None'}`,'');
    lines.push('Please confirm this customer order.');

    const whatsappUrl=`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
    const popup=window.open(whatsappUrl,'_blank','noopener,noreferrer');
    setSubmitting(false);
    setConfirmation({orderId,order,whatsappUrl,popupOpened:!!popup});
  };

  if(confirmation) return <main className="inner-page order-confirmation"><div className="confirmation-card"><p className="eyebrow">ORDER PREPARED</p><h1>Thank you, {confirmation.order.customer.name}</h1><p className="confirmation-id">Order ID: <strong>{confirmation.orderId}</strong></p><p>Your complete order has been prepared and saved. WhatsApp is ready with the prefilled message.</p><div className="confirmation-warning"><strong>Important:</strong> Press <b>SEND</b> in WhatsApp to deliver your order to IA HOROLOGE.</div><a className="gold-button wide" href={confirmation.whatsappUrl} target="_blank" rel="noopener noreferrer">OPEN WHATSAPP AGAIN</a><button className="outline-button wide" onClick={()=>{clearCart();setConfirmation(null);setMode('cart');}}>I AM FINISHED — CLEAR BAG</button></div></main>;

  return <main className="inner-page cart-page"><div className="page-heading"><p className="eyebrow">SECURE ORDER</p><h1>{mode==='cart'?'Shopping bag':'Checkout'}</h1></div><div className="cart-layout"><div>{mode==='cart'?<><div className="cart-items">{cart.map(item=><article className="cart-item" key={item.id}><img src={item.image||'/assets/logo.jpg'} alt={item.name}/><div className="cart-item-main"><h3>{item.name}</h3><p>{formatPrice(item.price)}</p><div className="quantity"><button onClick={()=>updateQuantity(item.id,item.quantity-1)} aria-label="Decrease quantity"><Minus size={14}/></button><strong>{item.quantity}</strong><button onClick={()=>updateQuantity(item.id,item.quantity+1)} aria-label="Increase quantity"><Plus size={14}/></button></div></div><button className="remove-button" onClick={()=>removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={17}/></button></article>)}</div><button className="text-link" onClick={()=>clearCart()}><Trash2 size={15}/> Clear bag</button></>:<form className="checkout-form" onSubmit={submit} noValidate>{[['name','Full Name'],['phone','Phone Number'],['email','Email Address'],['city','City']].map(([k,l])=><label key={k}>{l}<input type={k==='email'?'email':'text'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} aria-invalid={!!errors[k]}/>{errors[k]&&<small>{errors[k]}</small>}</label>)}<label>Complete Delivery Address<textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})} aria-invalid={!!errors.address}/>{errors.address&&<small>{errors.address}</small>}</label><label>Additional Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></form>}</div><aside className="order-summary"><h2>Order summary</h2>{cart.map(i=><div className="summary-row" key={i.id}><span>{i.name}<small>× {i.quantity}</small></span><strong>{formatPrice(i.price*i.quantity)}</strong></div>)}<div className="summary-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="summary-row"><span>Delivery Charges</span><strong>{formatPrice(siteConfig.deliveryCharge)}</strong></div><div className="summary-total"><span>Grand Total</span><strong>{formatPrice(subtotal+siteConfig.deliveryCharge)}</strong></div>{mode==='cart'?<><button className="gold-button wide" onClick={()=>setMode('checkout')}>PROCEED TO CHECKOUT</button><Link className="continue-link" to="/shop">Continue shopping</Link></>:<><button className="gold-button wide" onClick={submit} disabled={submitting}>{submitting?'PREPARING ORDER...':'PLACE ORDER'}</button><button className="continue-link button-link" onClick={()=>setMode('cart')}>Back to bag</button></>}</aside></div></main>;
}

function About(){useSeo('About','Learn about IA HOROLOGE and our approach to modern elegance.');return <main><div className="about-hero"><p className="eyebrow">THE HOUSE</p><h1>About IA HOROLOGE</h1></div><section className="about-story section"><div><p className="eyebrow">OUR IDENTITY</p><h2>Modern elegance,<br/>thoughtfully expressed.</h2></div><div><p>IA HOROLOGE is built around a clear appreciation for refined personal style. We present considered pieces that celebrate character, confidence and the art of making an impression.</p><p>Our philosophy is simple: elegance should feel personal, intentional and enduring.</p></div></section><section className="about-image"><img src="/assets/WhatsApp Image 2026-11-24 at 8.33.38 AM (4).jpeg" alt="IA HOROLOGE brand story"/><div><p className="eyebrow">OUR PHILOSOPHY</p><h2>Every detail<br/>has a purpose.</h2></div></section></main>}
function Contact(){useSeo('Contact','Contact IA HOROLOGE by Instagram or WhatsApp.');const [sent,setSent]=useState(false);const [form,setForm]=useState({name:'',email:'',message:''});const [errors,setErrors]=useState({});const submit=e=>{e.preventDefault();const n={};if(!form.name.trim())n.name='Required';if(!/^\S+@\S+\.\S+$/.test(form.email))n.email='Enter a valid email';if(!form.message.trim())n.message='Required';setErrors(n);if(!Object.keys(n).length)setSent(true)};return <main><div className="contact-hero"><div><p className="eyebrow">GET IN TOUCH</p><h1>Contact</h1></div></div><section className="contact-layout section"><div><p className="eyebrow">IA HOROLOGE</p><h2>We would be pleased<br/>to hear from you.</h2><div className="contact-links"><a href={siteConfig.instagram} target="_blank" rel="noreferrer">Instagram <ArrowRight size={16}/></a>{siteConfig.whatsappNumber&&<a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp <ArrowRight size={16}/></a>}</div></div>{sent?<div className="form-success"><h3>Message prepared</h3><p>Thank you. A configured submission service is required before messages can be sent automatically.</p><button className="text-link" onClick={()=>setSent(false)}>Send another</button></div>:<form className="checkout-form" onSubmit={submit} noValidate><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>{errors.name&&<small>{errors.name}</small>}</label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>{errors.email&&<small>{errors.email}</small>}</label><label>Message<textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>{errors.message&&<small>{errors.message}</small>}</label><button className="gold-button" type="submit">SEND MESSAGE</button></form>}</section></main>}
