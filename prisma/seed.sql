INSERT INTO "NPC" (id, name, faction, alignment, "createdAt", "updatedAt")
VALUES
  ('npc_lux', 'LUX', 'LUX', 'Lawful', now(), now()),
  ('npc_vera', 'Vera', 'Vera', 'Chaotic', now(), now()),
  ('npc_orion', 'Orion', 'Neutral', 'Good', now(), now())
ON CONFLICT (name) DO NOTHING;

INSERT INTO "text_blobs" (id, category, slug, content, last_updated)
VALUES ('tb_lux_faction', 'FACTION', 'lux_faction', 'The LUX faction is a rigid, technocratic group prioritizing order and survival above all else. They are suspicious of independent action.', now())
ON CONFLICT (slug) DO NOTHING;
