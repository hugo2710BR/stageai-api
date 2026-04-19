# auth/strategies

## Objetivo
Estratégias Passport que definem como validar credenciais. Cada ficheiro = uma estratégia.

## Ficheiros

### `jwt.strategy.ts`
Estratégia `passport-jwt`.
- Extrai token do header `Authorization: Bearer <token>`
- `ignoreExpiration: false` — tokens expirados são rejeitados
- Secret vem de `process.env.JWT_SECRET`
- Método `validate(payload)` devolve `{ id: payload.sub, email }` → fica disponível em `req.user`

## Requisitos
- Não adicionar lógica de negócio aqui — apenas extração e validação do payload
- Se adicionares outra estratégia (ex: Google OAuth), criar `google.strategy.ts` nesta pasta
