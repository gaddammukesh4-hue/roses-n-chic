-- Roses N Chic: atomic order fulfillment (plan.md Phase 7: "Reduce stock
-- in one database transaction"). A Postgres function runs as a single
-- transaction by default -- no separate BEGIN/COMMIT needed.
--
-- Idempotent by design: re-running this on an order that's already 'paid'
-- is a safe no-op (returns false), so it's safe to call from both the
-- client-side payment-confirmation path and the webhook, whichever
-- arrives first "wins" and the other is a harmless no-op.
--
-- security definer + a locked search_path: this function must bypass RLS
-- to write orders/stock (same reason app/actions/checkout.ts uses the
-- service-role client, not the regular one), but only ever runs the exact
-- statements below -- it does not accept or execute arbitrary SQL.
create or replace function public.fulfill_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_item record;
begin
  select status into v_status from public.orders where id = p_order_id for update;

  if v_status is null then
    raise exception 'Order % not found', p_order_id;
  end if;

  if v_status != 'pending' then
    return false; -- already fulfilled (or failed/cancelled) -- no-op
  end if;

  for v_item in
    select oi.product_variant_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    update public.product_variants
    set stock_count = stock_count - v_item.quantity
    where id = v_item.product_variant_id and stock_count >= v_item.quantity;

    if not found then
      raise exception 'Insufficient stock for variant %', v_item.product_variant_id;
    end if;
  end loop;

  update public.orders set status = 'paid' where id = p_order_id;
  return true;
end;
$$;

-- No one gets EXECUTE on this by default from client roles; it's only
-- callable via the service-role client (lib/supabase/admin.ts), which
-- bypasses grants the same way it bypasses RLS.
revoke all on function public.fulfill_order(uuid) from public, anon, authenticated;
