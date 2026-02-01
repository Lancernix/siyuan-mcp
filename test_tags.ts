import { getClient } from "./src/client";

async function test() {
    const client = getClient();
    const sql = "SELECT id, tag, ial, content, type FROM blocks WHERE tag != '' OR ial LIKE '%tags=%' LIMIT 20";
    const result = await client.querySql(sql);
    console.log(JSON.stringify(result, null, 2));
}

test();
