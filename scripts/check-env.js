import { execSync } from 'child_process';

const problems = [];

function check(name, cmd, validator) {
  try {
    const out = execSync(cmd, { encoding: 'utf8' }).trim();
    if (validator && !validator(out)) {
      problems.push(`❌ ${name}: found but invalid — ${out}`);
    } else {
      console.log(`✅ ${name}: ${out}`);
    }
  } catch {
    problems.push(`❌ ${name}: NOT FOUND`);
  }
}

check('Rust', 'rustc --version');
check('Cargo', 'cargo --version');
check('Node', 'node --version', v => parseInt(v.slice(1)) >= 18);
check('Tauri CLI', 'npx tauri --version');

if (process.platform === 'win32') {
  try {
    const linkPath = execSync('where link.exe', { encoding: 'utf8' }).split('\n')[0].trim();
    if (linkPath.toLowerCase().includes('mingw') || linkPath.toLowerCase().includes('git')) {
      problems.push(`❌ link.exe: wrong one on PATH (${linkPath}) — MSVC must come first`);
    } else {
      console.log(`✅ link.exe: ${linkPath}`);
    }
  } catch {
    problems.push(`⚠️  link.exe: not found — install MSVC Build Tools`);
  }
}

if (problems.length > 0) {
  console.error('\nProblems found:\n' + problems.join('\n'));
  process.exit(1);
} else {
  console.log('\n✅ Environment looks good, starting...');
}
