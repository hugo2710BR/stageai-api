# Staging Module

## Responsabilidade
Proxy para a Replicate API e gestao do historico de stagings por utilizador.

## Ficheiros
- `staging.module.ts` — Regista controller e service
- `staging.controller.ts` — POST /staging (criar) e GET /staging (listar). Ambas protegidas por JwtAuthGuard
- `staging.service.ts` — Envia imagem + mascara ao Replicate, guarda resultado na DB
- `dto/create-staging.dto.ts` — Valida image, mask, style (obrigatorios) e prompt (opcional)

## Fluxo de criacao
1. Request autenticado chega com image (base64), mask (base64), style, prompt, width, height
2. Service cria registo na DB com status "processing"
3. width e height sao normalizados para multiplo de 64 (snapTo64) — Replicate so aceita esses valores
4. Envia ao Replicate com o style prompt composto
5. Se sucesso: atualiza registo com resultUrl e status "completed"
6. Se erro: atualiza status para "failed" e relanca o erro

## Estilos disponiveis
- Moderno, Escandinavo, Industrial, Mediterraneo
- Cada estilo tem um prompt base que e concatenado com o prompt livre do user

## Regras
- Todas as rotas requerem JWT (UseGuards no controller)
- O REPLICATE_API_TOKEN vive apenas no .env do backend
- O imageUrl guardado na DB e truncado (primeiros 100 chars) para nao guardar base64 inteiro
- Negative prompt sempre incluido para evitar resultados de baixa qualidade
- width e height sao opcionais no DTO — default 512x512 se nao enviados
