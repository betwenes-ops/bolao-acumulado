-- Torna lançamento/correção de resultado, reapuração e encerramento do ciclo uma única transação.
create or replace function public.apurar_concurso_atomico(p_concurso uuid,p_dezenas smallint[],p_apuracoes jsonb,p_ganhadores jsonb,p_admin uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_ciclo uuid;v_status text;v_numero bigint;v_percentual numeric:=0;v_agora timestamptz:=now();
begin
 if cardinality(p_dezenas)<>6 or not public.validar_dezenas(p_dezenas) then raise exception 'DEZENAS_INVALIDAS'; end if;
 select c.ciclo_id,ci.status,ci.numero into v_ciclo,v_status,v_numero from public.concursos c join public.ciclos ci on ci.id=c.ciclo_id where c.id=p_concurso for update of c,ci;
 if v_ciclo is null then raise exception 'CONCURSO_INEXISTENTE'; end if;
 if v_status<>'ATIVO' then raise exception 'CICLO_ENCERRADO_RESULTADO_IMUTAVEL'; end if;
 update public.concursos set dezenas_sorteadas=p_dezenas,status='APURADO',atualizado_em=v_agora where id=p_concurso;
 delete from public.apuracoes a using public.jogos j where a.jogo_id=j.id and j.ciclo_id=v_ciclo;
 insert into public.apuracoes(jogo_id,concurso_id,acertos_acumulados,dezenas_acertadas)
 select (x->>'jogo_id')::uuid,(x->>'concurso_id')::uuid,(x->>'acertos_acumulados')::smallint,array(select jsonb_array_elements_text(x->'dezenas_acertadas'))::smallint[] from jsonb_array_elements(coalesce(p_apuracoes,'[]'::jsonb)) x;
 delete from public.ganhadores where ciclo_id=v_ciclo;
 if jsonb_array_length(coalesce(p_ganhadores,'[]'::jsonb))>0 then
  insert into public.ganhadores(jogo_id,ciclo_id,valor_premio) select (x->>'jogo_id')::uuid,v_ciclo,(x->>'valor_premio')::numeric from jsonb_array_elements(p_ganhadores) x;
  update public.ciclos set status='ENCERRADO',encerrado_em=v_agora where id=v_ciclo;
  update public.jogos set encerrado_em=v_agora where ciclo_id=v_ciclo;
  select coalesce(percentual_administracao_padrao,0) into v_percentual from public.configuracoes where id=true;
  insert into public.ciclos(numero,status,premio_acumulado,percentual_administracao) values(v_numero+1,'ATIVO',0,v_percentual);
 end if;
 insert into public.auditoria(ator_tipo,ator_id,acao,entidade,entidade_id,detalhes_json) values('ADMIN',p_admin,'RESULTADO_APURADO_ATOMICO','concursos',p_concurso,jsonb_build_object('dezenas',p_dezenas,'apuracoes',jsonb_array_length(coalesce(p_apuracoes,'[]'::jsonb)),'ganhadores',jsonb_array_length(coalesce(p_ganhadores,'[]'::jsonb))));
end;$$;
revoke all on function public.apurar_concurso_atomico(uuid,smallint[],jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.apurar_concurso_atomico(uuid,smallint[],jsonb,jsonb,uuid) to service_role;
