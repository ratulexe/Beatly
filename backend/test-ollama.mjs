async function test() {
  const response = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:3b',
      messages: [
        { role: 'system', content: 'You are Beatly AI.' },
        { role: 'user', content: 'Generate 3 music listening insights as a JSON array of strings. Format: ["insight 1", "insight 2"]' }
      ],
      format: 'json',
      stream: false
    })
  });
  const data = await response.json();
  console.log('RAW RESPONSE:', data.message.content);
}
test();
