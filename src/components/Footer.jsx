import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import './footer.css';

export default function Footer() {
  return <footer className="footer"><div className="footer-grid">
    <div><div className="footer-brand"><img src="/assets/logo.jpg" alt="IA HOROLOGE"/><span>IA HOROLOGE</span></div><p>Refined objects for a life lived with distinction.</p></div>
    <div><h3>Explore</h3><Link to="/">Home</Link><Link to="/shop">Shop</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
    <div><h3>Visit</h3><a href={siteConfig.instagram} target="_blank" rel="noreferrer">Instagram</a>{siteConfig.whatsappNumber && <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={14}/></a>}</div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} IA HOROLOGE</span><span>All rights reserved</span><Link className="admin-footer-button" to="/admin">Admin Login</Link></div></footer>;
}
