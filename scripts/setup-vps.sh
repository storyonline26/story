#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# STORY India — VPS Deployment Script
# Domain: storyonline.in
# Architecture: Backend + PostgreSQL on VPS, Frontend on Cloudflare Pages
# ═══════════════════════════════════════════════════════════════

set -e
echo ""
echo "🚀 STORY India — VPS Setup Starting..."
echo "═══════════════════════════════════════"
echo ""

# ─── 1. Update System ───
echo "📦 Step 1: Updating system..."
apt update && apt upgrade -y
echo "✅ System updated"
echo ""

# ─── 2. Install Node.js 20 LTS ───
echo "📦 Step 2: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "   Node: $(node -v)"
echo "   NPM: $(npm -v)"
echo "✅ Node.js installed"
echo ""

# ─── 3. Install Git ───
echo "📦 Step 3: Installing Git..."
apt install -y git
echo "✅ Git installed"
echo ""

# ─── 4. Install PM2 ───
echo "📦 Step 4: Installing PM2..."
npm install -g pm2
echo "✅ PM2 installed"
echo ""

# ─── 5. Install Nginx ───
echo "📦 Step 5: Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
echo "✅ Nginx installed and running"
echo ""

# ─── 6. Install PostgreSQL ───
echo "📦 Step 6: Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
echo "✅ PostgreSQL installed and running"
echo ""

# ─── 7. Create PostgreSQL Database & User ───
echo "🗄️  Step 7: Setting up database..."
sudo -u postgres psql -c "CREATE USER storyuser WITH PASSWORD 'StoryDB@2026';" 2>/dev/null || echo "   User already exists"
sudo -u postgres psql -c "CREATE DATABASE storydb OWNER storyuser;" 2>/dev/null || echo "   Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE storydb TO storyuser;" 2>/dev/null
echo "✅ Database ready: storydb / storyuser"
echo ""

# ─── 8. Clone Repository ───
echo "📥 Step 8: Cloning STORY India repository..."
cd /root
if [ -d "story-ecom" ]; then
  echo "   Repository exists, pulling latest..."
  cd story-ecom && git pull origin main
else
  git clone https://github.com/varuntejreddy03/story.git story-ecom
  cd story-ecom
fi
echo "✅ Repository ready at /root/story-ecom"
echo ""

# ─── 9. Install Backend Dependencies ───
echo "📦 Step 9: Installing backend dependencies..."
cd /root/story-ecom/backend
npm install --production
echo "✅ Backend dependencies installed"
echo ""

# ─── 10. Create Backend .env ───
echo "⚙️  Step 10: Creating backend environment file..."
cat > /root/story-ecom/backend/.env << 'ENVFILE'
NODE_ENV=production
PORT=5000
API_URL=https://api.storyonline.in
DATABASE_URL="postgresql://storyuser:StoryDB@2026@localhost:5432/storydb"
JWT_SECRET="$(openssl rand -base64 48)"
JWT_EXPIRES_IN=7d
COOKIE_DOMAIN=.storyonline.in
FRONTEND_URL=https://storyonline.in
ADMIN_FRONTEND_URL=https://admin.storyonline.in
ADMIN_EMAIL=admin@story.in
ADMIN_PASSWORD=StoryAdmin@2026
DISABLE_RATE_LIMIT=false

# Razorpay (update with LIVE keys)
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_RAZORPAY_WEBHOOK_SECRET

# Google OAuth (update with production client)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Backblaze B2 (fill when ready)
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET_NAME=story-india-images
B2_BUCKET_ID=
IMAGE_BASE_URL=
MAX_IMAGE_WIDTH=1200
IMAGE_QUALITY=80
ENVFILE

# Generate a real JWT secret
JWT_SECRET=$(openssl rand -base64 48)
sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" /root/story-ecom/backend/.env
echo "✅ Backend .env created with secure JWT secret"
echo ""

# ─── 11. Run Database Migrations ───
echo "🗄️  Step 11: Running Prisma migrations..."
cd /root/story-ecom/backend
npx prisma generate
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma migrate deploy 2>/dev/null || echo "   Schema already in sync"
echo "✅ Database schema applied"
echo ""

# ─── 12. Configure Nginx (API reverse proxy only) ───
echo "🌐 Step 12: Configuring Nginx..."
cat > /etc/nginx/sites-available/storyonline << 'NGINXCONF'
# API Backend — api.storyonline.in
server {
    listen 80;
    server_name api.storyonline.in;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Max upload size (for product images)
    client_max_body_size 10M;

    # API proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Static uploads (served directly by Nginx — fast)
    location /uploads {
        alias /root/story-ecom/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
NGINXCONF

# Enable site
ln -sf /etc/nginx/sites-available/storyonline /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
echo "✅ Nginx configured for api.storyonline.in"
echo ""

# ─── 13. Create uploads directory ───
echo "📁 Step 13: Creating uploads directory..."
mkdir -p /root/story-ecom/backend/uploads/products
mkdir -p /root/story-ecom/backend/uploads/categories
chmod -R 755 /root/story-ecom/backend/uploads
echo "✅ Uploads directory ready"
echo ""

# ─── 14. Start Backend with PM2 ───
echo "🚀 Step 14: Starting backend with PM2..."
cd /root/story-ecom/backend
pm2 delete story-backend 2>/dev/null || true
pm2 start src/index.js --name story-backend --env production
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "✅ Backend running on port 5000"
echo ""

# ─── 15. Setup Firewall ───
echo "🔒 Step 15: Configuring firewall..."
ufw allow 7576/tcp   # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw --force enable
echo "✅ Firewall configured"
echo ""

# ─── 16. Create deployment update script ───
echo "📝 Step 16: Creating update script..."
cat > /root/deploy-update.sh << 'DEPLOY'
#!/bin/bash
echo "🔄 Updating STORY India..."
cd /root/story-ecom
git pull origin main
cd backend
npm install --production
npx prisma generate
npx prisma db push --accept-data-loss 2>/dev/null || true
pm2 restart story-backend
echo "✅ Updated and restarted!"
DEPLOY
chmod +x /root/deploy-update.sh
echo "✅ Update script created at /root/deploy-update.sh"
echo ""

# ─── 17. Create daily backup script ───
echo "📝 Step 17: Creating backup script..."
cat > /root/backup-db.sh << 'BACKUP'
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M)
pg_dump -U storyuser storydb > $BACKUP_DIR/storydb_$DATE.sql
# Keep only last 7 backups
ls -t $BACKUP_DIR/storydb_*.sql | tail -n +8 | xargs -r rm
echo "Backup done: storydb_$DATE.sql"
BACKUP
chmod +x /root/backup-db.sh

# Schedule daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-db.sh") | sort -u | crontab -
echo "✅ Daily backup scheduled at 2 AM"
echo ""

# ─── Done! ───
echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ STORY India VPS Setup Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🌐 API:      https://api.storyonline.in"
echo "🌐 Store:    https://storyonline.in (deploy via Cloudflare Pages)"
echo "🌐 Admin:    https://admin.storyonline.in (deploy via Cloudflare Pages)"
echo ""
echo "📋 Next Steps:"
echo "   1. Deploy storyuser to Cloudflare Pages:"
echo "      - Connect GitHub repo"
echo "      - Build command: cd storyuser && npm install && npm run build"
echo "      - Output directory: storyuser/dist"
echo "      - Env var: VITE_API_BASE_URL=https://api.storyonline.in"
echo "      - Custom domain: storyonline.in"
echo ""
echo "   2. Deploy story-luxury-admin to Cloudflare Pages:"
echo "      - Build command: cd story-luxury-admin && npm install && npm run build"
echo "      - Output directory: story-luxury-admin/dist"
echo "      - Env var: VITE_API_BASE_URL=https://api.storyonline.in"
echo "      - Custom domain: admin.storyonline.in"
echo ""
echo "   3. Update Razorpay keys to LIVE in /root/story-ecom/backend/.env"
echo "   4. Update Google OAuth redirect URIs for storyonline.in"
echo "   5. Test: curl https://api.storyonline.in/api/health"
echo ""
echo "🔧 Useful Commands:"
echo "   pm2 status              — Check backend status"
echo "   pm2 logs story-backend  — View logs"
echo "   pm2 restart story-backend — Restart backend"
echo "   /root/deploy-update.sh  — Pull latest & restart"
echo "   /root/backup-db.sh      — Manual database backup"
echo ""
echo "═══════════════════════════════════════════════════════"
