-- Cenários automatizados de isolamento RLS.
-- Executar com dois usuários autenticados diferentes no ambiente de teste.

-- Usuário A deve conseguir:
-- 1. Ler somente sua linha em usuarios.
-- 2. Ler somente jogos onde jogos.usuario_id pertence ao próprio auth.uid().
-- 3. Ler apuracoes e ganhadores relacionados aos próprios jogos.

-- Usuário A NÃO deve conseguir:
-- 1. Consultar CPF, perfil ou jogos do usuário B.
-- 2. Inserir jogo informando usuario_id de outro cliente.
-- 3. Alterar pagamento_status ou resultado de outro usuário.

-- Exemplo de validação esperada:
-- set local role authenticated;
-- set local request.jwt.claim.sub = '<cliente-a-auth-id>';
-- select count(*) from usuarios where id = '<cliente-b-id>'; -- esperado: 0
-- select count(*) from jogos where usuario_id = '<cliente-b-id>'; -- esperado: 0

-- Operações administrativas devem passar somente por server actions autenticadas.
-- Clientes nunca recebem acesso direto às tabelas administrativas.
