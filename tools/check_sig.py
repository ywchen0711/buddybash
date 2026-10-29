"""Checks that every tool has its own signature (js/signature.js), and that no two tools' signatures are alike."""
import re, os, sys
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'js')
ids = []
for f in ['items.js', 'more.js', 'heroes.js']:
    s = open(os.path.join(R, f), encoding='utf-8').read().split('export const HATS')[0].split('export function heroEngine')[0] # tools only, not hats
    ids += re.findall(r"""[{,]\s*"?id"?:\s*['"](\w+)['"],\s*"?icon""", s)
heroes = re.findall(r"id: '(\w+)', icon: '[^']*', kind: 'hero'", open(os.path.join(R, 'heroes.js'), encoding='utf-8').read())
sig = dict((m[0], m[1:]) for m in re.findall(r"(\w+): \['([^']*)', '([^']*)', '([^']*)'\]", open(os.path.join(R, 'signature.js'), encoding='utf-8').read()))
missing = [i for i in ids if i not in sig and i not in heroes]
seen, dup = {}, []
for k, (bits, does, extra) in sig.items():
    key = (frozenset(bits), frozenset(does.split()), frozenset(extra.split()))
    if key in seen: dup.append((seen[key], k))
    seen[key] = k
print(f'{len(ids)} tools, {len(sig)} signatures, {len(heroes)} heroes (their own ten moves)')
if missing: print('MISSING:', missing)
if dup: print('ALIKE:', dup)
extra_ids = [k for k in sig if k not in ids]
if extra_ids: print('NO SUCH TOOL:', extra_ids)
sys.exit(1 if missing or dup or extra_ids else 0)
