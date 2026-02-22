#!/bin/bash
# Atualizar .env para usar banco MySQL local no VPS
cd /var/www/flowclik

# Substituir DATABASE_URL para apontar para localhost
sed -i 's|DATABASE_URL=.*|DATABASE_URL=mysql://flowclik:Enrico24Alice@FlowClik2026@localhost:3306/flowclikbr|' /var/www/flowclik/.env

echo "DATABASE_URL atualizado para banco local"
grep DATABASE_URL /var/www/flowclik/.env
