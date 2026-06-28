#!/bin/bash
# STORY India - VPS Initial Setup Script
# Run this ONCE on your VPS: bash setup-vps.sh

set -e

echo "🚀 Setting up STORY India on VPS..."

# 1. Update system
apt update && apt upgrade -y

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Install PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# 4. Setup PostgreSQL database
sudo -u postgres psql -c "CREATE USER storyuser WITH PASSWORD 'StoryDB@2026';"
sudo -u postgres psql -c "CREATE DATABASE storydb OWNER storyuser;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE storydb TO storyuser;"

# 5. Install Nginx
apt install -y nginx
systemctl enable nginx

# 6. Install PM2
npm install -g pm2

# 7. Install Certbot for SSL (optional - needs domain)
apt install -y certbot python3-certbot-nginx

# 8. Clone repo
cd /root
git clone https://github.com/varuntejreddy03/story.git story-ecom
cd story-ecom

# 9. Install dependencies
cd backend && npm install
cd ../storyuser && npm install && npm run build
cd ../story-luxury-admin && npm install && npm run build
cd ..

# 10. Setup backend .env
cat > backend/.env << 'EOF'
NODE_ENV=production
PORT=5000
API_URL=http://103.135.230.104:5000
DATABASE_URL="postgresql://storyuser:StoryDB@2026@localhost:5432/storydb"
JWT_SECRET="CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING"
JWT_EXPIRES_IN=7d
COOKIE_DOMAIN=
FRONTEND_URL=http://103.135.230.104
ADMIN_FRONTEND_URL=http://103.135.230.104:3001
ADMIN_EMAIL=admin@story.in
ADMIN_PASSWORD=StoryAdmin@2026
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EOF

# 11. Run migrations
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..

# 12. Configure Nginx
cat > /etc/nginx/sites-available/story << 'EOF'
server {
    listen 80;
    server_name 103.135.230.104;

    # Frontend (user store)
    location / {
        root /root/story-ecom/storyuser/dist;
        try_files $uri $uri/ /index.html;
    }

    # Admin panel
    location /admin {
        alias /root/story-ecom/story-luxury-admin/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/story /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 13. Start backend with PM2
cd /root/story-ecom
pm2 start backend/src/index.js --name story-backend
pm2 save
pm2 startup

# 14. Setup firewall
ufw allow 22
ufw allow 7576
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "✅ STORY India deployed successfully!"
echo ""
echo "🌐 User Store: http://103.135.230.104"
echo "🔧 Admin Panel: http://103.135.230.104/admin"
echo "🔌 API: http://103.135.230.104/api/health"
echo ""
echo "⚠️  IMPORTANT: Edit backend/.env and set your real:"
echo "   - JWT_SECRET (random 64 char string)"
echo "   - RAZORPAY keys"
echo "   - GOOGLE_CLIENT_ID/SECRET"
echo ""
echo "📌 To add SSL with domain: certbot --nginx -d yourdomain.com"
