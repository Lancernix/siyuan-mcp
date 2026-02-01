import { SiyuanClient } from "./src/client";

async function run() {
  const client = new SiyuanClient({
    apiUrl: "http://127.0.0.1:6806",
    apiToken: "s37d86dq3sksr1q9"
  });

  const sql = "SELECT id, type, tag, ial, content, hpath, root_id FROM blocks WHERE tag != '' OR ial LIKE '%tags=%'";
  const result = await client.querySql(sql);
  
  const totalStats = new Map();
  const categoryStats = new Map(); // Only type 'd'
  const mentionStats = new Map();  // Only type != 'd'

  for (const row of result) {
    const blockTags = new Set();
    if (row.tag) {
      const matches = row.tag.match(/#([^\s#]+)#/g);
      if (matches) for (const m of matches) blockTags.add(m.slice(1, -1));
    }
    if (row.ial) {
      const m = row.ial.match(/tags="(.*?)"/);
      if (m && m[1]) m[1].split(/[ ,，\s]/).filter(Boolean).forEach(t => blockTags.add(t));
    }

    blockTags.forEach(t => {
        totalStats.set(t, (totalStats.get(t) || 0) + 1);
        if (row.type === 'd') {
            categoryStats.set(t, (categoryStats.get(t) || 0) + 1);
        } else {
            mentionStats.set(t, (mentionStats.get(t) || 0) + 1);
        }
    });
  }

  console.log("\n--- Category Stats (Doc Type Only) ---");
  Array.from(categoryStats.entries()).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`${t}: ${c}`));

  console.log("\n--- Mention Stats (Non-Doc Type Only) ---");
  Array.from(mentionStats.entries()).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`${t}: ${c}`));
}

run().catch(console.error);
