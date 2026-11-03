# Evolution API — Setup para envio automático de WhatsApp no VibeOS

Esta pasta contém o stack **Evolution API** (WhatsApp) que o VibeOS usa para o
envio automatizado de propostas (`/api/whatsapp/send`).

## Requisitos

- **VM Linux com ≥ 2GB de RAM** (a VM Oracle atual de 952MB **não** comporta —
  o stack completo usa ~1.5–2GB entre API + Postgres + Redis).
- Docker + Docker Compose instalados.
- Porta **8080** liberada no firewall/security-list da VM (para o Vercel alcançar).

## Passo a passo

1. **Provisionar a VM** (Oracle Cloud Always Free → shape `VM.Standard.A1.Flex`,
   mínimo 2 OCPU / 6GB RAM). Anote o IP público.

2. **Instalar Docker** na VM:
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER && newgrp docker
   ```

3. **Subir o stack**:
   ```bash
   cp .env.example .env   # preencha AUTHENTICATION_API_KEY e senhas
   docker compose up -d
   docker compose ps      # aguardar os 3 containers subirem
   ```

4. **Testar a API**:
   ```bash
   curl -s http://localhost:8080/instance/list -H "apikey: SUA_CHAVE"
   ```

5. **Conectar o WhatsApp (QR)** — uma vez só:
   ```bash
   # Cria a instância "vibe"
   curl -s -X POST http://localhost:8080/instance/create \
     -H "apikey: SUA_CHAVE" -H "Content-Type: application/json" \
     -d '{"instanceName":"vibe","integration":"WHATSAPP-BAILEYS","qrcode":true}'
   # Pega a imagem do QR e escaneia com o WhatsApp do celular
   curl -s http://localhost:8080/instance/connect/vibe -H "apikey: SUA_CHAVE"
   ```
   O QR também fica visível no manager (`:3000`) se o frontend estiver ativo.

6. **Configurar o Vercel** (env vars do projeto `vibeos`):
   ```bash
   vercel env add EVOLUTION_API_URL production     # http://IP_DA_VM:8080
   vercel env add EVOLUTION_API_KEY production     # mesmo valor de AUTHENTICATION_API_KEY
   vercel env add EVOLUTION_INSTANCE production    # vibe
   vercel redeploy --prod --yes
   ```

## Como o VibeOS usa

`POST /api/whatsapp/send` → `Evolution API: /message/sendText/{instance}` com
header `apikey` e body `{ number: "55...", text: "..." }`. O número é normalizado
para o formato internacional brasileiro (`55` + DDD + número).

## Segurança

- Não exponha o Postgres (porta 5432) publicamente — fica só na rede interna do Docker.
- A porta 8080 fica protegida pela `AUTHENTICATION_API_KEY`; use HTTPS (nginx/Caddy
  ou Cloudflare Tunnel) antes de produção real.
