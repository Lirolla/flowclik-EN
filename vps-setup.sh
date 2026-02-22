#!/bin/bash
# Setup script para VPS FlowClik
cd /var/www/flowclik

# Criar .env com variáveis de ambiente
cat > /var/www/flowclik/.env << 'ENVEOF'
DATABASE_URL=mysql://u219024948_flowclikbr:Pagotto24@srv1839.hstgr.io:3306/u219024948_flowclikbr
R2_ACCOUNT_ID=023a0bad3f17632316cd10358db2201f
R2_ACCESS_KEY_ID=3a48256592438734e7be28fee1fe752b
R2_SECRET_ACCESS_KEY=83ebf944befd8c04123d483619ac174bd83a7fdd2aa9cdba310f749365897740
R2_BUCKET_NAME=flowclikbr
R2_PUBLIC_URL=https://pub-023a0bad3f17632316cd10358db2201f.r2.dev
STRIPE_SECRET_KEY=sk_test_placeholder
JWT_SECRET=flowclik-br-jwt-secret-2026-super-seguro-nao-compartilhar
NODE_ENV=production
PORT=3000
ENVEOF

echo "ENV criado com sucesso"
