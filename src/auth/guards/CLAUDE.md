# auth/guards

## Objetivo
Guards NestJS que protegem rotas — verificam se o request tem um JWT válido antes de chegar ao controller.

## Ficheiros

### `jwt-auth.guard.ts`
Extensão de `AuthGuard('jwt')` do Passport.
Usa a `JwtStrategy` para extrair e validar o token do header `Authorization: Bearer <token>`.
Injeta `req.user = { id, email }` no request quando válido.

## Como usar
```ts
@Controller('staging')
@UseGuards(JwtAuthGuard)   // protege todo o controller
export class StagingController {}

// ou por rota individual:
@Get('usage')
@UseGuards(JwtAuthGuard)
getUsage() {}
```

## Requisitos
- Qualquer rota que aceda a dados do utilizador deve ter este guard
- Rotas públicas (`/auth/register`, `/auth/login`) não devem ter o guard
