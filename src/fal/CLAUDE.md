# fal

## Objetivo
Wrapper sobre o SDK `@fal-ai/client` para geração de imagens por inpainting.

## Ficheiros
| Ficheiro | Responsabilidade |
|---|---|
| `fal.module.ts` | Regista `FalService` como provider, exporta para uso no `StagingModule` |
| `fal.service.ts` | Faz upload de imagem e máscara para o storage Fal, chama `fal-ai/flux-pro/v1/fill`, devolve URL da imagem gerada |

## Fluxo de `inpaint(imageBase64, maskBase64, prompt)`
1. Converte base64 → `Buffer` (strip do prefixo `data:...;base64,` se presente)
2. Upload da imagem e máscara para `fal.storage` → obtém URLs temporárias
3. Chama `fal.subscribe('fal-ai/flux-pro/v1/fill')` com as URLs + prompt
4. Devolve `images[0].url` da resposta

## Configuração
- `FAL_KEY` em `.env` — obrigatório
- Modelo: `fal-ai/flux-pro/v1/fill`
- Custo: ~$0.05 por geração
- `safety_tolerance: '2'` — moderado
- `output_format: 'jpeg'`

## Requisitos
- `FalService` não faz nenhuma validação de limites — isso é responsabilidade do `StagingService`
- A chave `FAL_KEY` nunca sai do servidor
- Erros do Fal propagam-se como excepções — o `StagingService` trata-os e actualiza o status para `'failed'`
