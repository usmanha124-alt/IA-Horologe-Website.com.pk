const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = Number(process.env.PORT || 4173);
const dataDir = path.join(__dirname, 'data-store');
const ordersFile = path.join(dataDir, 'orders.json');
const productsFile = path.join(dataDir, 'products.json');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, '[]', 'utf8');

const seedProducts = [
  { id:'rihl-eau-de-parfum', name:'Rihl Eau de Parfum', price:2800, regularPrice:3000, shortDescription:'A refined, elegant perfume presented in a sophisticated green bottle.', description:'Rihl Eau de Parfum is presented as a distinguished IA Horologe fragrance, featuring a polished bottle and an elegant green presentation.', images:['/assets/perfumes/riahl-perfume.png'], category:'perfumes', availability:true, featured:false },
  { id:'hacivat-dark-marble', name:'Hacivat Eau de Parfum', price:2800, regularPrice:3000, shortDescription:'A blue glass eau de parfum presented on dark marble.', description:'Hacivat Eau de Parfum by IA Horologe is presented in a striking blue glass bottle with gold-accented detailing. Its polished presentation makes it a refined choice for personal style and considered gifting.', images:['/assets/catalogue/Hacivat Perfume on Dark Marble.png'], category:'perfumes', availability:true, featured:true },
  { id:'boss-bottle-black-marble', name:'Boss Bottle Eau de Parfum', price:2800, regularPrice:3000, shortDescription:'A rich black bottle accented with warm gold detailing.', description:'Boss Bottle Eau de Parfum is presented in a deep black bottle finished with a warm gold-accented label. The dramatic dark-marble setting gives this piece a confident, luxurious character.', images:['/assets/catalogue/Luxurious Black Perfume Bottle on Marble.png'], category:'perfumes', availability:true, featured:false },
  { id:'rebel-dark-marble', name:'Rebel Eau de Parfum', price:2800, regularPrice:3000, shortDescription:'A square glass bottle in a sophisticated dark-green presentation.', description:'Rebel Eau de Parfum by IA Horologe features a square glass bottle with rich green tones and gold-accented labelling.', images:['/assets/catalogue/Luxury Rebel Perfume on Dark Marble.png'], category:'perfumes', availability:true, featured:true },
  { id:'imperial-valley', name:'Imperial Valley Eau de Parfum', price:2800, regularPrice:3000, shortDescription:'An elegant ivory bottle with gold-accented detailing.', description:'Imperial Valley Eau de Parfum is presented in an ivory glass bottle with a dark cap and gold-accented IA Horologe label.', images:['/assets/catalogue/WhatsApp Image 2026-11-25 at 10.10.28 AM.jpeg'], category:'perfumes', availability:true, featured:false },
  { id:'classic-silver-ivory-watch', name:'Classic Silver and Ivory Watch', price:500, regularPrice:500, shortDescription:'A classic dial watch with an ivory strap.', description:'A classic watch featuring a silver-tone case, clear dial and ivory-coloured strap.', images:['/assets/catalogue/watch product price 500 (1).jpeg'], category:'timepieces', availability:true, featured:false },
  { id:'midnight-collection-watch', name:'Midnight Collection Watch', price:500, regularPrice:500, shortDescription:'A dark dial watch with a refined leather strap.', description:'A sophisticated watch with a dark dial, polished case and leather-style strap.', images:['/assets/catalogue/watch product price 500 (2).jpeg'], category:'timepieces', availability:true, featured:false },
  { id:'gold-dial-collection-watch', name:'Gold Dial Collection Watch', price:500, regularPrice:500, shortDescription:'An amber dial watch paired with a brown leather strap.', description:'A polished timepiece with an amber dial and warm brown leather strap.', images:['/assets/catalogue/watch product price 500 (3).jpeg'], category:'timepieces', availability:true, featured:false },
  { id:'apex-brown-leather-watch', name:'Apex Brown Leather Watch', price:750, regularPrice:750, shortDescription:'An Apex watch with an Arabic dial and brown leather strap.', description:'An Apex timepiece featuring Arabic numerals and a brown leather strap.', images:['/assets/catalogue/watch product price750 (1).jpeg'], category:'timepieces', availability:true, featured:true },
  { id:'apex-midnight-watch', name:'Apex Midnight Watch', price:750, regularPrice:750, shortDescription:'A dark-toned Apex dial watch with a leather strap.', description:'A dark-toned Apex watch with Arabic numeral detailing and a leather strap.', images:['/assets/catalogue/watch product price750 (2).jpeg'], category:'timepieces', availability:true, featured:false },
  { id:'apex-black-edition-watch', name:'Apex Black Edition Watch', price:750, regularPrice:750, shortDescription:'A black dial Apex watch with polished case accents.', description:'A black-dial Apex watch with Arabic numeral detailing and a polished silver-tone case.', images:['/assets/catalogue/watch product price750 (3).jpeg'], category:'timepieces', availability:true, featured:false }
];
if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, JSON.stringify(seedProducts, null, 2), 'utf8');

const envFile=path.join(__dirname,'.env');
if(fs.existsSync(envFile)){
  for(const line of fs.readFileSync(envFile,'utf8').split(/\r?\n/)){
    const trimmed=line.trim();
    if(!trimmed || trimmed.startsWith('#')) continue;
    const index=trimmed.indexOf('=');
    if(index<1) continue;
    const key=trimmed.slice(0,index).trim();
    const value=trimmed.slice(index+1).trim().replace(/^['"]|['"]$/g,'');
    process.env[key]=value;
  }
}

const adminUsername = String(process.env.IA_ADMIN_USERNAME || 'IA Horologe').trim();
const adminPasswordHash = String(process.env.IA_ADMIN_PASSWORD_HASH || '').trim();

function verifyPassword(password) {
  const parts=adminPasswordHash.split(':');
  if(parts.length!==2) return false;
  const [salt,storedHash]=parts;
  if(!salt || !storedHash) return false;
  const supplied=crypto.pbkdf2Sync(password,salt,120000,32,'sha256');
  const expected=Buffer.from(storedHash,'hex');
  return expected.length===supplied.length && crypto.timingSafeEqual(supplied,expected);
}

app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir, { fallthrough: false }));

const readJson=(file,fallback)=>{try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return fallback}};
const writeJson=(file,value)=>{const tmp=`${file}.tmp`;fs.writeFileSync(tmp,JSON.stringify(value,null,2),'utf8');fs.renameSync(tmp,file)};
const readOrders=()=>readJson(ordersFile,[]);
const readProducts=()=>readJson(productsFile,seedProducts);
const sessions=new Map();
const loginAttempts=new Map();

function parseCookies(req){const out={};for(const part of String(req.headers.cookie||'').split(';')){const i=part.indexOf('=');if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim())}return out}
function requireAdmin(req,res,next){const token=parseCookies(req).ia_admin_session;const session=token&&sessions.get(token);if(!session||session.expires<Date.now()){if(token)sessions.delete(token);return res.status(401).json({error:'Admin authentication required'})}session.expires=Date.now()+8*60*60*1000;next()}

app.post('/api/admin/login',(req,res)=>{
  if(!adminPasswordHash)return res.status(503).json({error:'Admin login is not configured on the server'});
  const ip=req.ip||'unknown';const state=loginAttempts.get(ip)||{count:0,until:0};
  if(state.until>Date.now())return res.status(429).json({error:'Too many login attempts. Try again later.'});
  const username=String(req.body?.username||'').trim();const password=String(req.body?.password||'');
  const usernameOk=crypto.timingSafeEqual(crypto.createHash('sha256').update(username).digest(),crypto.createHash('sha256').update(adminUsername).digest());
  const passwordOk=password.length>0&&verifyPassword(password);
  if(!usernameOk||!passwordOk){const count=state.count+1;loginAttempts.set(ip,{count,until:count>=5?Date.now()+15*60*1000:0});return res.status(401).json({error:'Invalid credentials'})}
  loginAttempts.delete(ip);const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{expires:Date.now()+8*60*60*1000});
  res.setHeader('Set-Cookie',`ia_admin_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=28800${process.env.NODE_ENV==='production'?'; Secure':''}`);
  res.json({success:true,authenticated:true,role:'owner'});
});
app.post('/api/admin/logout',requireAdmin,(req,res)=>{sessions.delete(parseCookies(req).ia_admin_session);res.setHeader('Set-Cookie','ia_admin_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');res.json({success:true})});
app.get('/api/admin/me',requireAdmin,(req,res)=>res.json({authenticated:true,role:'owner',username:adminUsername}));

app.get('/api/products',(req,res)=>res.json({products:readProducts().filter(p=>p.availability!==false)}));
app.post('/api/orders',(req,res)=>{const order=req.body;if(!order?.orderId||!order?.customer||!Array.isArray(order.products)||!order.products.length)return res.status(400).json({error:'Invalid order data'});const orders=readOrders();if(orders.some(o=>o.orderId===order.orderId))return res.json({success:true,duplicate:true});const saved={...order,status:'pending-whatsapp-send',receivedAt:new Date().toISOString(),sourceIpHash:crypto.createHash('sha256').update(req.ip||'unknown').digest('hex').slice(0,16)};orders.push(saved);writeJson(ordersFile,orders);res.status(201).json({success:true,order:saved})});

app.get('/api/admin/products',requireAdmin,(req,res)=>res.json({products:readProducts()}));
app.post('/api/admin/products',requireAdmin,(req,res)=>{
  const body=req.body||{};if(!String(body.name||'').trim()||!String(body.description||'').trim())return res.status(400).json({error:'Name and description are required'});
  const price=Number(body.price),regularPrice=Number(body.regularPrice||body.price);if(!Number.isFinite(price)||price<0||!Number.isFinite(regularPrice)||regularPrice<0)return res.status(400).json({error:'Invalid prices'});
  let image=String(body.image||'');
  if(body.imageData){const match=String(body.imageData).match(/^data:(image\/png|image\/jpeg|image\/webp);base64,(.+)$/s);if(!match)return res.status(400).json({error:'Invalid image'});const buffer=Buffer.from(match[2],'base64');if(buffer.length>5*1024*1024)return res.status(400).json({error:'Image exceeds 5 MB'});const ext=match[1]==='image/png'?'.png':match[1]==='image\/webp'?'.webp':'.jpg';const filename=`${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`;fs.writeFileSync(path.join(uploadsDir,filename),buffer);image=`/uploads/${filename}`}
  if(!image)return res.status(400).json({error:'Product image is required'});
  const products=readProducts();const id=body.id||String(body.name).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||`product-${Date.now()}`;const product={id,name:String(body.name).trim(),price,regularPrice,shortDescription:String(body.shortDescription||body.description).trim().slice(0,180),description:String(body.description).trim(),images:[image],category:body.category==='timepieces'?'timepieces':'perfumes',availability:body.availability!==false,featured:body.featured===true};const index=products.findIndex(p=>p.id===id);if(index>=0)products[index]=product;else products.push(product);writeJson(productsFile,products);res.status(index>=0?200:201).json({success:true,product});
});
app.put('/api/admin/products/:id',requireAdmin,(req,res)=>{const products=readProducts();const index=products.findIndex(p=>p.id===req.params.id);if(index<0)return res.status(404).json({error:'Product not found'});const body={...req.body,id:req.params.id};const price=Number(body.price),regularPrice=Number(body.regularPrice||body.price);if(!String(body.name||'').trim()||!String(body.description||'').trim()||!Number.isFinite(price)||price<0||!Number.isFinite(regularPrice)||regularPrice<0)return res.status(400).json({error:'Invalid product data'});let image=String(body.image||products[index].images?.[0]||'');if(body.imageData){const match=String(body.imageData).match(/^data:(image\/png|image\/jpeg|image\/webp);base64,(.+)$/s);if(!match)return res.status(400).json({error:'Invalid image'});const buffer=Buffer.from(match[2],'base64');const ext=match[1]==='image/png'?'.png':match[1]==='image\/webp'?'.webp':'.jpg';const filename=`${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`;fs.writeFileSync(path.join(uploadsDir,filename),buffer);image=`/uploads/${filename}`}const product={...products[index],name:String(body.name).trim(),price,regularPrice,shortDescription:String(body.shortDescription||body.description).trim().slice(0,180),description:String(body.description).trim(),images:[image],category:body.category==='timepieces'?'timepieces':'perfumes',availability:body.availability!==false,featured:body.featured===true};products[index]=product;writeJson(productsFile,products);res.json({success:true,product})});
app.delete('/api/admin/products/:id',requireAdmin,(req,res)=>{const products=readProducts();const next=products.filter(p=>p.id!==req.params.id);if(next.length===products.length)return res.status(404).json({error:'Product not found'});writeJson(productsFile,next);res.json({success:true})});
app.get('/api/admin/orders',requireAdmin,(req,res)=>res.json({orders:readOrders().reverse()}));
app.patch('/api/admin/orders/:orderId',requireAdmin,(req,res)=>{const orders=readOrders();const index=orders.findIndex(o=>o.orderId===req.params.orderId);if(index<0)return res.status(404).json({error:'Order not found'});const allowed=['pending','pending-whatsapp-send','confirmed','processing','shipped','delivered','completed','cancelled'];if(!allowed.includes(req.body?.status))return res.status(400).json({error:'Invalid status'});orders[index]={...orders[index],status:req.body.status,updatedAt:new Date().toISOString()};writeJson(ordersFile,orders);res.json({success:true,order:orders[index]})});
app.get('/api/admin/overview',requireAdmin,(req,res)=>{const products=readProducts();const orders=readOrders();const recent=[...orders].reverse().slice(0,5);res.json({totalProducts:products.length,totalOrders:orders.length,pendingOrders:orders.filter(o=>['pending','pending-whatsapp-send','confirmed','processing','shipped'].includes(o.status||'pending-whatsapp-send')).length,completedOrders:orders.filter(o=>o.status==='delivered'||o.status==='completed').length,recentOrders:recent})});

app.use('/api',(req,res)=>res.status(404).json({error:'API endpoint not found'}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'dist')));
app.use((req,res)=>res.sendFile(path.join(__dirname,'dist','index.html')));

app.listen(port,'127.0.0.1',()=>console.log(`IA Horologe server running at http://127.0.0.1:${port}`));
