"""Repeat the unchanged read-only checks, writing only to the PR47 evidence directory."""
from pathlib import Path

root = Path('/Users/ivenwang/Documents/edhr-nexus')
scripts = root / 'docs/development/edhr-dev-integration-20261031/evidence/independent'
old_destination = "OUT = ROOT / 'docs/development/edhr-dev-integration-20261031/evidence/independent'"
new_destination = "OUT = ROOT / 'docs/development/edhr-dev-integration-20261031/evidence/pr47/independent'"
for name in ['verify-main-readonly.py', 'verify-preservation.py']:
    source = (scripts / name).read_text()
    assert source.count(old_destination) == 1
    exec(compile(source.replace(old_destination, new_destination), str(scripts / name), 'exec'), {'__name__': '__main__'})
