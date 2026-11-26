import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [open, setOpen] = useState(false); const [scrolled, setScrolled] = useState(false);
  const { count } = useCart(); const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 30); fn(); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);
  const links = [['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About'], ['/contact', 'Contact']];
  return <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
    <Link className="brand" to="/" aria-label="IA Horologe home"><img src="/assets/logo.jpg" alt="IA HOROLOGE"/><span>IA HOROLOGE</span></Link>
    <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary navigation">
      {links.map(([to,label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
    </nav>
    <div className="header-actions">
      <Link className="bag-link" to="/cart" aria-label={`Shopping bag with ${count} items`}><ShoppingBag size={20}/>{count > 0 && <span className="cart-badge">{count}</span>}</Link>
      <button className="menu-button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button>
    </div>
  </header>;
}
