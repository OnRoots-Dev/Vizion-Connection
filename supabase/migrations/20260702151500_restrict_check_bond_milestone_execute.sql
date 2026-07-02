-- トリガー発火にはEXECUTE権限は不要（テーブル書込み権限で内部的に呼ばれる）。
-- advisorの指摘通り、anon/authenticatedからの直接RPC実行のみを塞ぐ。
revoke execute on function public.check_bond_milestone() from public, anon, authenticated;
