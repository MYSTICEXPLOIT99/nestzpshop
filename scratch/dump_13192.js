const fs = require('fs');
const readline = require('readline');

async function dumpTarget() {
  const fileStream = fs.createReadStream('C:/Users/Administrator/.gemini/antigravity-ide/brain/1a1707eb-d540-4b8b-9426-d7fa58af3a70/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"step_index":13192,')) {
      const parsed = JSON.parse(line);
      const tc = parsed.tool_calls[0].args.TargetContent;
      fs.writeFileSync('scratch/original_products_grid.txt', tc, 'utf8');
      console.log('Successfully written to scratch/original_products_grid.txt');
      break;
    }
  }
}
dumpTarget();
