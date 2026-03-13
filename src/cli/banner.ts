import process from 'node:process';
import kleur from 'kleur';

const BANNER_LINES = [
  'Checking for problems you probably already know about...',
  'Auditing the obvious so you don\'t have to...',
  'Pretending this takes longer than it does...',
  'Scanning for issues that will recur next week...',
  'Validating configuration that was working fine...',
  'Running diagnostics on a Friday afternoon...',
  'Searching for problems in places you\'ll never look...',
  'Confirming your workspace still remembers who you are...',
  'Probing for failures you could have found yourself...',
  'Applying automated skepticism to your setup...',
  'Measuring twice, cutting once, complaining continuously...',
  'Looking for problems in all the usual places...',
  'Indexing your mistakes before you make them...',
  'Running analytics on things that are probably fine...',
  'Confirming that yes, this is still running...',
];

const BOOT_LINES = [
  '[INITIALIZING] Pretending to do heavy lifting...',
  '[LOADING] Dependencies that will break next week...',
  '[MOUNTING] Applying field medicine to your workspace...',
  '[VERIFYING] Checking if you remembered to restart...',
  '[SCANNING] For problems that definitely exist...',
  '[LOADING] Your daily dose of mild disappointment...',
];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function showBanner(): void {
  // Only apply colors if stdout is a TTY
  const useColor = process.stdout.isTTY;

  // Header with exact spacing: " O P E N C L A W  D O C T O R [+]"
  // OPENCLAW in red, [+] with + in yellow
  const headerLine = useColor
    ? ' ' + kleur.red('O P E N C L A W') + '  ' + kleur.red('D O C T O R') + ' ' + kleur.yellow('[') + kleur.yellow().bold('+') + kleur.yellow(']')
    : ' O P E N C L A W  D O C T O R [+]';

  const banner = [
    '======================================================',
    headerLine,
    '======================================================',
    '',
  ];

  // Pick one random sarcastic line
  banner.push(pickRandom(BANNER_LINES));

  // Maybe add a boot line (50% chance)
  if (Math.random() > 0.5) {
    banner.push('');
    banner.push(pickRandom(BOOT_LINES));
  }

  banner.push('');

  process.stdout.write(banner.join('\n'));
}

function shouldShowBanner(
  format: 'terminal' | 'json' | 'markdown',
  noBanner: boolean,
): boolean {
  // Never show for non-terminal formats
  if (format !== 'terminal') {
    return false;
  }

  // Check explicit disable
  if (noBanner) {
    return false;
  }

  // Check environment variable
  if (process.env.OPENCLAW_DOCTOR_NO_BANNER === '1') {
    return false;
  }

  // Check if not interactive (piped/redirected)
  if (!process.stdout.isTTY) {
    return false;
  }

  return true;
}

export { showBanner, shouldShowBanner, BANNER_LINES, BOOT_LINES };
