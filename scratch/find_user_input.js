const fs = require('fs');
const readline = require('readline');

async function getUserInput() {
  const fileStream = fs.createReadStream('C:/Users/Administrator/.gemini/antigravity-ide/brain/1a1707eb-d540-4b8b-9426-d7fa58af3a70/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"type":"USER_INPUT"')) {
      const parsed = JSON.parse(line);
      console.log(parsed.step_index, parsed.content.slice(0, 150));
    }
  }
}
getUserInput();
