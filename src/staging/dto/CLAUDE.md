# staging/dto

## Objetivo
Data Transfer Objects para validação do body do `POST /staging`.

## Ficheiros

### `create-staging.dto.ts`
```
image   — IsString, obrigatório — base64 da foto do imóvel (com ou sem prefixo data:)
mask    — IsString, obrigatório — base64 PNG da máscara (branco=gerar, preto=preservar)
style   — IsString, obrigatório — "Moderno" | "Escandinavo" | "Industrial" | "Mediterrâneo"
prompt  — IsString, IsOptional — texto livre do utilizador
width   — IsNumber, IsOptional — largura da imagem em px
height  — IsNumber, IsOptional — altura da imagem em px
```

## Requisitos
- `userId` nunca vem no DTO — é extraído do JWT pelo guard
- `width` e `height` são opcionais — o `FalService` usa as dimensões originais da imagem se omitidos
