import { ProfilerModule } from './src/modules/profiler/index.js';

async function testProfiler() {
  const profiler = new ProfilerModule();
  try {
    const result = await profiler.run('https://example.com');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Profiler Error:', err);
  }
}

testProfiler();
