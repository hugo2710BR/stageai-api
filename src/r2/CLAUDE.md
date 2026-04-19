# r2

## Objetivo
Wrapper sobre o `@aws-sdk/client-s3` para armazenamento permanente de imagens no Cloudflare R2.

## Ficheiros
| Ficheiro | Responsabilidade |
|---|---|
| `r2.module.ts` | Regista `R2Service`, exporta para uso no `StagingModule` |
| `r2.service.ts` | Upload de imagem a partir de URL e delete de objecto por key |

## Métodos

### `uploadFromUrl(imageUrl, key): Promise<string>`
1. Faz fetch da URL temporária devolvida pelo Fal
2. Converte response para `Buffer`
3. Faz `PutObjectCommand` com `ContentType: 'image/png'`
4. Devolve URL pública: `${R2_PUBLIC_URL}/${key}`

### `deleteObject(key): Promise<void>`
Apaga o objecto do bucket via `DeleteObjectCommand`.

## Configuração (variáveis de ambiente)
```
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://...  (URL pública do bucket, sem / final)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

## Requisitos
- As keys seguem o padrão `stagings/<stagingId>.png`
- Ao apagar um staging, o `StagingService` extrai a key da `resultUrl` antes de chamar `deleteObject`
- Credenciais nunca expostas no frontend — vivem apenas no `.env` do backend
