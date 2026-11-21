"""Fresh compile and axiom audit of the unchanged, pinned E8 source.

Usage: python verify.py --lean PATH_TO_LEAN --packages EXISTING_LAKE_PACKAGES
Uses existing dependency artifacts after checking their exact git revisions.
Writes only to the directory containing this script. Does not run lake update.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import json
import os
import re
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--lean', required=True, type=Path)
parser.add_argument('--packages', required=True, type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parent
source = root / 'E8PlumbingBridge.lean'
manifest_path = root / 'lake-manifest.json'
sha256 = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
now = lambda: datetime.now(timezone.utc).isoformat()
source_bytes = source.read_bytes()
source_sha = sha256(source)
git_blob = hashlib.sha1(b'blob ' + str(len(source_bytes)).encode() + b'\0' + source_bytes).hexdigest()
assert git_blob == '49f88cf46f59e29c2d6c01f9ba4289d97053be88', 'Source differs from pinned GitHub blob'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))

def git(package, *arguments):
    return subprocess.check_output(['git', '-c', 'safe.directory=' + package.as_posix(), '-C', str(package), *arguments], text=True).strip()

dependency_records = []
dependency_paths = []
for item in manifest['packages']:
    package = args.packages / item['name']
    assert package.is_dir(), item['name']
    revision = git(package, 'rev-parse', 'HEAD')
    assert revision == item['rev'], (item['name'], revision, item['rev'])
    assert not git(package, 'status', '--porcelain', '--untracked-files=no'), item['name'] + ' has tracked changes'
    build = package / '.lake/build/lib/lean'
    if build.is_dir():
        dependency_paths.append(str(build))
    dependency_records.append({'name': item['name'], 'revision': revision, 'tracked_sources_clean': True, 'cached_build_present': build.is_dir()})

version = subprocess.check_output([str(args.lean), '--version'], text=True).strip()
assert 'version 4.34.0-rc2' in version
names = ['E8PlumbingBridge.' + name for name in re.findall(r'^theorem\s+(\w+)', source_bytes.decode('utf-8'), re.M)]
assert len(names) == 8
audit = root / 'E8SourceAudit.lean'
audit.write_text('import E8PlumbingBridge\n\n' + ''.join('#print axioms ' + name + '\n' for name in names), encoding='utf-8', newline='\n')
env = dict(os.environ, LEAN_NUM_THREADS='2', LEAN_PATH=os.pathsep.join([str(root)] + dependency_paths))
attempts = []
for module in ['E8PlumbingBridge', 'E8SourceAudit']:
    input_path = root / (module + '.lean')
    input_sha = sha256(input_path)
    output = root / (module + '.olean')
    log = root / (module + '.log')
    assert not log.exists() and not output.exists(), 'Preserve prior run; use a new verification directory'
    command = [str(args.lean), '-o', output.name, input_path.name]
    started = time.monotonic()
    record = {'module': module, 'started_at_utc': now(), 'command': ['lean', '-o', output.name, input_path.name], 'input_sha256': input_sha}
    attempts.append(record)
    (root / 'attempts.json').write_text(json.dumps(attempts, indent=2) + '\n')
    try:
        with log.open('wb') as stream:
            result = subprocess.run(command, cwd=root, env=env, stdout=stream, stderr=subprocess.STDOUT, timeout=240)
        code = result.returncode
    except subprocess.TimeoutExpired:
        code = 124
    record.update(exit_code=code, finished_at_utc=now(), elapsed_seconds=round(time.monotonic()-started,3), log_sha256=sha256(log))
    assert input_sha == sha256(input_path), 'Verification changed its source'
    if output.exists():
        record['olean_sha256'] = sha256(output)
    (root / 'attempts.json').write_text(json.dumps(attempts, indent=2) + '\n')
    print(json.dumps(record), flush=True)
    if code:
        print(log.read_text(encoding='utf-8'), flush=True)
        raise SystemExit(code)

text = (root / 'E8SourceAudit.log').read_text(encoding='utf-8')
pattern = re.compile(r"'([^']+)' (?:depends on axioms: \[([^\]]*)\]|does not depend on any axioms)", re.M)
reports = list(pattern.finditer(text))
assert [r[1] for r in reports] == names and not pattern.sub('', text).strip(), 'Incomplete axiom audit'
axioms = {r[1]: [a.strip() for a in (r[2] or '').split(',') if a.strip()] for r in reports}
allowed = {'propext', 'Classical.choice', 'Quot.sound'}
assert all(set(values) <= allowed for values in axioms.values()), axioms
assert source_sha == sha256(source)
assert not (root / 'E8PlumbingBridge.log').read_text(encoding='utf-8').strip(), 'Compiler diagnostics require review'
for item in manifest['packages']:
    package = args.packages / item['name']
    assert git(package, 'rev-parse', 'HEAD') == item['rev']
    assert not git(package, 'status', '--porcelain', '--untracked-files=no')

record = {
    'status': 'PASS', 'verified_at_utc': now(),
    'scope': 'Fresh Lean compilation and axiom audit of the unchanged E8PlumbingBridge module, including all eight public theorems. No new mathematical statement or equation.',
    'cited_revision': 'f0e7c291733f50a950f40cfc786c945b8cf06b99',
    'current_main_observed_before_check': 'd34dae902b30774e28d7e97bf936f4c305a13268',
    'source_unchanged_between_these_revisions': True,
    'source_url': 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f0e7c291733f50a950f40cfc786c945b8cf06b99/E8PlumbingBridge.lean',
    'source_git_blob': git_blob, 'source_sha256': source_sha,
    'lean_version': version, 'lean_binary_sha256': sha256(args.lean),
    'pinned_manifest_sha256': sha256(manifest_path), 'dependencies': dependency_records,
    'dependency_builds': 'Existing compiled dependencies were reused; their tracked sources were clean and matched all nine pinned manifest revisions. Dependencies were not freshly rebuilt.',
    'cached_mathlib_olean_sha256': sha256(args.packages / 'mathlib/.lake/build/lib/lean/Mathlib.olean'),
    'public_theorem_count': len(names), 'axioms': axioms,
    'sorryAx_or_other_unapproved_axioms': False,
    'builds': attempts,
    'audit_source_sha256': sha256(audit), 'verification_script_sha256': sha256(Path(__file__)),
    'limits': ['The browser-to-Lean matrix correspondence remains an external exact-arithmetic check, not a new Lean theorem.', 'The topology prose is not part of these formal theorem statements.', 'No Comparator run, independent kernel replay, fresh dependency rebuild, or whole-repository build is claimed.'],
}
(root / 'verification.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'status':'PASS', 'public_theorems':len(names), 'axioms':axioms}), flush=True)
