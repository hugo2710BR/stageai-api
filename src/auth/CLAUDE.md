# auth

## Objetivo
Registo, login e proteção de rotas via JWT. Tudo o que diz respeito a identidade do utilizador passa aqui.

## Ficheiros
| Ficheiro | Responsabilidade |
|---|---|
| `auth.module.ts` | Regista controller, service, JwtModule (secret + expiração) e PassportModule |
| `auth.controller.ts` | `POST /api/auth/register`, `POST /api/auth/login` — sem guard |
| `auth.service.ts` | Lógica de registo (bcrypt hash) e login (bcrypt compare + gera JWT) |
| `dto/register.dto.ts` | Valida `email`, `password` (min 6), `name` (opcional) |
| `dto/login.dto.ts` | Valida `email`, `password` |
| `strategies/jwt.strategy.ts` | Extrai JWT do header `Authorization: Bearer`, valida assinatura, devolve `{ id, email }` |
| `guards/jwt-auth.guard.ts` | Guard `@UseGuards(JwtAuthGuard)` — aplica em qualquer controller que requeira auth |

## Fluxo de registo
1. DTO valida o body (class-validator)
2. Service verifica se email já existe → `ConflictException` se sim
3. Bcrypt hash da password (cost 10)
4. `prisma.user.create` com email, passwordHash, name
5. Gera e devolve `{ access_token }`

## Fluxo de login
1. DTO valida o body
2. Service busca user por email → `UnauthorizedException` se não existe
3. `bcrypt.compare` → `UnauthorizedException` se inválida
4. Gera e devolve `{ access_token }`

## Requisitos
- Password nunca devolvida em nenhum response
- Mensagens de erro genéricas para não revelar se email existe ("Credenciais inválidas")
- JWT payload contém apenas `{ sub: userId, email }` — sem dados sensíveis
- Secret vem de `process.env.JWT_SECRET` — nunca hardcoded
