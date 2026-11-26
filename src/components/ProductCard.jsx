import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function formatPrice(price) { return `Rs. ${Number(price || 0).toLocaleString('en-PK')}`; }
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  return <article className="product-card">
    <Link className="product-image" to={`/product/${product.id}`}><img src={product.images?.[0] || '/assets/logo.jpg'} alt={product.name} loading="lazy"/><span>View details</span></Link>
    <div className="product-info"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3><p className="card-description">{product.shortDescription}</p><div className="card-pricing"><span className="regular-price">Rs. {Number(product.regularPrice || 0).toLocaleString('en-PK')}</span><strong>{formatPrice(product.price)}</strong></div><p className="saving-text">You Save Rs. {Number((product.regularPrice || 0) - (product.price || 0)).toLocaleString('en-PK')}</p></div><button className="add-button" onClick={() => addItem(product)} aria-label={`Add ${product.name} to cart`}><Plus size={18}/></button></div>
  </article>;
}
