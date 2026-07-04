-- ============================================================
-- Bora — Organizador de Viagens
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Perfis de usuário (complementa auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  email text not null default '',
  avatar_color text not null default '#E8714C',
  updated_at timestamptz default now()
);

-- Espaços (pessoal ou grupo)
create table if not exists spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#E8714C',
  invite_code text unique not null,
  is_personal boolean not null default false,
  owner_id uuid references profiles on delete set null,
  created_at timestamptz default now()
);

-- Membros de cada espaço
create table if not exists space_members (
  space_id uuid references spaces on delete cascade,
  profile_id uuid references profiles on delete cascade,
  role text not null default 'membro',
  primary key (space_id, profile_id)
);

-- Destinos
create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references spaces on delete cascade not null,
  name text not null,
  country text not null default '',
  status text not null default 'sonho' check (status in ('sonho','embreve','planejando','jafui')),
  cost integer not null default 0,
  saved integer not null default 0,
  season text not null default 'Toda época',
  target_date date,
  date_label text,
  rating integer not null default 0 check (rating between 0 and 5),
  memory text,
  notes text,
  cover_photo text,
  lat double precision,
  lng double precision,
  added_by uuid references profiles on delete set null,
  created_at timestamptz default now()
);

-- Votos em destinos
create table if not exists destination_votes (
  destination_id uuid references destinations on delete cascade,
  profile_id uuid references profiles on delete cascade,
  primary key (destination_id, profile_id)
);

-- Itens de checklist
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references destinations on delete cascade not null,
  text text not null,
  done boolean not null default false,
  position integer not null default 0
);

-- Comentários
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references destinations on delete cascade not null,
  author_id uuid references profiles on delete set null,
  text text not null,
  created_at timestamptz default now()
);

-- Fotos
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references destinations on delete cascade not null,
  url text not null,
  position integer not null default 0,
  uploaded_by uuid references profiles on delete set null
);

-- Roteiro: dias da viagem
create table if not exists itinerary_days (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references destinations on delete cascade not null,
  position integer not null default 0,
  label text not null default ''
);

-- Roteiro: atividades por dia
create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references itinerary_days on delete cascade not null,
  destination_id uuid references destinations on delete cascade not null,
  position integer not null default 0,
  time text,
  title text not null,
  category text not null default 'outros'
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table itinerary_days enable row level security;
alter table itinerary_items enable row level security;

alter table profiles enable row level security;
alter table spaces enable row level security;
alter table space_members enable row level security;
alter table destinations enable row level security;
alter table destination_votes enable row level security;
alter table checklist_items enable row level security;
alter table comments enable row level security;
alter table photos enable row level security;

-- Função auxiliar para evitar recursão nas políticas RLS
create or replace function auth_user_space_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select space_id from space_members where profile_id = auth.uid()
$$;

-- Drop policies if they exist (idempotente)
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;
drop policy if exists "spaces_select" on spaces;
drop policy if exists "spaces_invite_select" on spaces;
drop policy if exists "spaces_insert" on spaces;
drop policy if exists "spaces_update" on spaces;
drop policy if exists "spaces_delete" on spaces;
drop policy if exists "space_members_select" on space_members;
drop policy if exists "space_members_insert" on space_members;
drop policy if exists "space_members_delete" on space_members;
drop policy if exists "destinations_all" on destinations;
drop policy if exists "destination_votes_all" on destination_votes;
drop policy if exists "checklist_items_all" on checklist_items;
drop policy if exists "comments_all" on comments;
drop policy if exists "photos_all" on photos;
drop policy if exists "itinerary_days_all" on itinerary_days;
drop policy if exists "itinerary_items_all" on itinerary_items;

-- Profiles: cada um vê o próprio perfil e o de quem divide algum espaço com ele
create policy "profiles_select" on profiles for select
  using (
    auth.uid() = id
    or id in (select profile_id from space_members where space_id in (select auth_user_space_ids()))
  );
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Spaces: membro vê; dono cria/edita/deleta
create policy "spaces_select" on spaces for select
  using (id in (select auth_user_space_ids()));

create policy "spaces_insert" on spaces for insert
  with check (auth.uid() = owner_id);

create policy "spaces_update" on spaces for update
  using (auth.uid() = owner_id);

create policy "spaces_delete" on spaces for delete
  using (auth.uid() = owner_id);

-- OBS: não existe mais uma policy pública de leitura de "spaces" por invite_code.
-- Entrar em um espaço por convite passa exclusivamente pela função
-- join_space_by_code() (security definer), definida mais abaixo, que resolve
-- o código e insere a membership sem nunca expor a tabela "spaces" inteira.

-- Space members: sem recursão — cada um vê só as suas linhas
-- (ver outros membros do espaço via função security definer)
create policy "space_members_select" on space_members for select
  using (profile_id = auth.uid() or space_id in (select auth_user_space_ids()));

-- Só permite se auto-inserir em espaços que você mesmo acabou de criar (dono).
-- Entrar em espaço de outra pessoa via convite é feito por join_space_by_code(),
-- que roda como security definer e não passa por esta policy.
create policy "space_members_insert" on space_members for insert
  with check (
    profile_id = auth.uid()
    and space_id in (select id from spaces where owner_id = auth.uid())
  );

create policy "space_members_delete" on space_members for delete
  using (profile_id = auth.uid());

-- Destinations e filhos: membro do espaço tem acesso
create policy "destinations_all" on destinations for all
  using (space_id in (select auth_user_space_ids()));

create policy "destination_votes_all" on destination_votes for all
  using (destination_id in (select id from destinations where space_id in (select auth_user_space_ids())));

create policy "checklist_items_all" on checklist_items for all
  using (destination_id in (select id from destinations where space_id in (select auth_user_space_ids())));

create policy "comments_all" on comments for all
  using (destination_id in (select id from destinations where space_id in (select auth_user_space_ids())));

create policy "photos_all" on photos for all
  using (destination_id in (select id from destinations where space_id in (select auth_user_space_ids())));

create policy "itinerary_days_all" on itinerary_days for all
  using (destination_id in (select id from destinations where space_id in (select auth_user_space_ids())));

create policy "itinerary_items_all" on itinerary_items for all
  using (destination_id in (select id from destinations where space_id in (select auth_user_space_ids())));

-- ============================================================
-- Entrar em um espaço por código de convite
-- ============================================================
-- security definer: roda com privilégios do dono da função (bypassa RLS),
-- então é o único ponto que pode ler "spaces" por invite_code e inserir em
-- "space_members" para um espaço que o usuário não possui. Fora daqui, a
-- tabela "spaces" nunca é legível por quem não é membro.
create or replace function join_space_by_code(p_code text)
returns spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space spaces;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_space from spaces where invite_code = p_code;

  if v_space.id is null then
    raise exception 'invalid_invite_code';
  end if;

  insert into space_members (space_id, profile_id, role)
  values (v_space.id, auth.uid(), 'membro')
  on conflict (space_id, profile_id) do nothing;

  return v_space;
end;
$$;

revoke all on function join_space_by_code(text) from public;
grant execute on function join_space_by_code(text) to authenticated;

-- ============================================================
-- Storage bucket para fotos
-- ============================================================

-- Cria o bucket (público para URLs funcionarem sem auth)
insert into storage.buckets (id, name, public)
values ('destination-photos', 'destination-photos', true)
on conflict (id) do update set public = true;

-- Limpa policies antigas se existirem
drop policy if exists "storage_insert" on storage.objects;
drop policy if exists "storage_select" on storage.objects;
drop policy if exists "storage_delete" on storage.objects;

-- Usuários autenticados podem fazer upload (só imagens, até 5MB)
create policy "storage_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'destination-photos'
  and (metadata->>'size')::bigint < 5242880
  and (metadata->>'mimetype') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
);

-- Leitura pública (bucket público, URLs diretas funcionam)
create policy "storage_select"
on storage.objects for select
to public
using (bucket_id = 'destination-photos');

-- Usuário pode deletar os próprios arquivos
create policy "storage_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'destination-photos' and auth.uid() = owner);
