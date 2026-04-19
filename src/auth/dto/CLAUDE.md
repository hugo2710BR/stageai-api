# auth/dto

## Objetivo
Data Transfer Objects para validação automática dos bodies de auth com `class-validator`.

## Ficheiros

### `register.dto.ts`
```
email     — IsEmail
password  — IsString, MinLength(6)
name      — IsString, IsOptional
```

### `login.dto.ts`
```
email     — IsEmail
password  — IsString
```

## Requisitos
- Todos os campos obrigatórios têm decorador de validação — sem `?` exceto quando `@IsOptional`
- Nunca adicionar `plan` ou `id` aqui — são campos internos definidos pelo sistema, não pelo utilizador
