# Suposições e decisões pendentes

1. Uma cota corresponde a um jogo.
2. Percentual administrativo é congelado por ciclo.
3. Jogo registrado no meio do ciclo acumula somente resultados a partir de seu concurso de entrada.
4. Rate limit de login: 5 falhas, bloqueio por 15 minutos.
5. Cliente usa CPF + PIN; integração com Supabase Auth será feita server-side sem expor identificador técnico.
6. Admin usa e-mail + senha e TOTP obrigatório (AAL2).
7. Operação financeira real exige revisão jurídica/contábil antes de produção.
8. Backup diário deve ser configurado no plano/infraestrutura do banco antes de produção.
9. O texto final de Termos e Privacidade depende de revisão jurídica/LGPD.
