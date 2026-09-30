-- Mantém prêmio derivado dos jogos confirmados e protege a identidade imutável do jogo.
create or replace function public.recalcular_premio_ciclo(p_ciclo uuid)
returns numeric language plpgsql security definer set search_path='' as $$
declare v_percentual numeric:=0; v_total numeric:=0; v_premio numeric:=0;
begin
 select percentual_administracao into v_percentual from public.ciclos where id=p_ciclo;
 select coalesce(sum(c.valor_cota),0) into v_total from public.jogos j join public.concursos c on c.id=j.concurso_id where j.ciclo_id=p_ciclo and j.pagamento_status='CONFIRMADO';
 v_premio:=round(v_total*(1-coalesce(v_percentual,0)/100.0),2);
 update public.ciclos set premio_acumulado=greatest(v_premio,0) where id=p_ciclo;
 return greatest(v_premio,0);
end;$$;
revoke all on function public.recalcular_premio_ciclo(uuid) from public,anon,authenticated;
create or replace function private.prevent_jogo_identity_change() returns trigger language plpgsql set search_path='' as $$ begin if new.usuario_id is distinct from old.usuario_id or new.concurso_id is distinct from old.concurso_id or new.ciclo_id is distinct from old.ciclo_id or new.dezenas is distinct from old.dezenas or new.criado_em is distinct from old.criado_em then raise exception 'Identidade do jogo é imutável'; end if; return new; end;$$;
drop trigger if exists jogos_immutable_identity on public.jogos;
create trigger jogos_immutable_identity before update on public.jogos for each row execute function private.prevent_jogo_identity_change();
create or replace function private.prevent_jogo_delete() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Jogos não podem ser apagados'; end;$$;
drop trigger if exists jogos_no_delete on public.jogos;
create trigger jogos_no_delete before delete on public.jogos for each row execute function private.prevent_jogo_delete();
create or replace function private.recalc_prize_after_game() returns trigger language plpgsql security definer set search_path='' as $$ begin perform public.recalcular_premio_ciclo(new.ciclo_id); return new; end;$$;
drop trigger if exists jogos_recalc_prize on public.jogos;
create trigger jogos_recalc_prize after insert or update of pagamento_status on public.jogos for each row execute function private.recalc_prize_after_game();
do $$ declare r record; begin for r in select id from public.ciclos loop perform public.recalcular_premio_ciclo(r.id); end loop; end $$;
