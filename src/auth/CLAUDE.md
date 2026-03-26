# Auth Module

## Responsabilidade
Registo de utilizadores, login, e protecao de rotas via JWT.

## Ficheiros
- `auth.module.ts` — Configura JWT (secret, expiracao) e Passport
- `auth.controller.ts` — POST /register e POST /login
- `auth.service.ts` — Logica de registo (hash password) e login (compara + gera token)
- `dto/register.dto.ts` — Valida email, password (min 6 chars), name (opcional)
- `dto/login.dto.ts` — Valida email e password
- `strategies/jwt.strategy.ts` — Extrai e valida JWT do header Authorization
- `guards/jwt-auth.guard.ts` — Guard reutilizavel para proteger rotas

## Fluxo de registo
1. Request chega ao controller com email + password
2. Service verifica se email ja existe (ConflictException se sim)
3. Password e hashed com bcrypt (cost 10)
4. User e criado na DB
5. JWT e gerado e devolvido

## Fluxo de login
1. Request com email + password
2. Service busca user pelo email (UnauthorizedException se nao existe)
3. Compara password com hash (UnauthorizedException se invalida)
4. JWT e gerado e devolvido

## Regras
- Nunca devolver a password no response
- Mensagens de erro genericas ("Credenciais invalidas") para nao revelar se o email existe
- JWT payload contem apenas { sub: userId, email }
