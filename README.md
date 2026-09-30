# Bolão Acumulado

Sistema de bolão acumulado baseado nos concursos da Mega-Sena. Interface do cliente prioriza legibilidade, simplicidade e uso no celular.

## Stack
Next.js 16 + TypeScript, Supabase/PostgreSQL com RLS, CSS responsivo e Vitest. Fuso de negócio: `America/Sao_Paulo`.

## Rodar
1. `npm install`
2. Copie `.env.example` para `.env.local` e preencha as chaves do Supabase.
3. `npm run dev`
4. Validação: `npm run typecheck && npm run lint && npm test && npm run build`

## Segurança
- Cliente nunca escolhe `usuario_id`; identidade vem da sessão validada no servidor.
- RLS está habilitado em todas as tabelas públicas.
- PIN é validado como 6 dígitos e armazenado somente como bcrypt.
- Admin exige MFA TOTP (`aal2`) para acessar dados administrativos.
- Jogos têm identidade/dezenas imutáveis no banco; resultado corrigido deve ser reapurado.
- A `SUPABASE_SECRET_KEY` é exclusivamente server-side e nunca deve ser exposta no navegador.

## Estado atual
Banco base, autenticação/validações, módulo puro de apuração com testes, telas-base de login/cadastro/cliente/admin e documentação inicial. Operações administrativas completas e persistência transacional da apuração serão expandidas nas próximas etapas.
