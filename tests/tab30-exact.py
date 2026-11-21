"""Read-only exact arithmetic checks for Tab 30. Requires Python 3 and Node.js."""
from pathlib import Path
from fractions import Fraction as F
from itertools import product, combinations
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
import shutil
import sys
from math import gcd

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'index.html'
HTML = HTML_PATH.read_text(encoding='utf-8')
SOURCE = re.search(r'<template id="page-src-e8insp">(.*?)</template>', HTML, re.S).group(1)
NODE = shutil.which('node')
assert NODE, 'Node.js must be on PATH to replay the actual JavaScript determinant function.'
# E8PlumbingBridge.lean, pinned source blob 49f88cf46f59e29c2d6c01f9ba4289d97053be88.
# This fixed fixture is the definition used by E8PlumbingBridge.E8_det; no Lean run here.
lean_matrix = [
    [-2,1,0,0,0,0,0,0], [1,-2,1,0,0,0,0,0],
    [0,1,-2,1,0,0,0,0], [0,0,1,-2,1,0,0,0],
    [0,0,0,1,-2,1,0,1], [0,0,0,0,1,-2,1,0],
    [0,0,0,0,0,1,-2,0], [0,0,0,0,1,0,0,-2],
]

def array(name):
    raw = re.search(r'const\s+' + name + r'\s*=\s*(\[.*?\]);', SOURCE, re.S).group(1)
    return json.loads(re.sub(r'//[^\n]*', '', raw))

def det(matrix):
    a = [[F(x) for x in row] for row in matrix]
    result = F(1)
    for i in range(len(a)):
        pivot = next((j for j in range(i, len(a)) if a[j][i]), None)
        if pivot is None:
            return F(0)
        if pivot != i:
            a[i], a[pivot] = a[pivot], a[i]
            result = -result
        result *= a[i][i]
        for j in range(i + 1, len(a)):
            factor = a[j][i] / a[i][i]
            for k in range(i, len(a)):
                a[j][k] -= factor * a[i][k]
    return result

def dot(a, b):
    return sum(x*y for x, y in zip(a, b))

simple = [[F(x) for x in row] for row in array('SIMPLE_ROOTS')]
gram = [[dot(a, b) for b in simple] for a in simple]
assert all(x.denominator == 1 for row in gram for x in row)
gram = [[int(x) for x in row] for row in gram]
permutation = [0, 1, 2, 3, 4, 7, 5, 6]
entry_match = all(gram[i][j] == -lean_matrix[permutation[i]][permutation[j]] for i in range(8) for j in range(8))
assert entry_match
all_submatrices = []
minors = []
for mask in range(256):
    indices = [i for i in range(8) if mask & (1 << i)]
    matrix = [[gram[i][j] for j in indices] for i in indices]
    value = det(matrix)
    assert value.denominator == 1 and value > 0
    all_submatrices.append(matrix)
    minors.append({'mask': mask, 'indices_zero_based': indices, 'determinant': int(value)})

# Execute only the reviewed, standalone determinant function in Node.
start = SOURCE.index('function exactDet(mat)')
opening = SOURCE.index('{', start)
depth = 1
end = opening + 1
while depth:
    depth += (SOURCE[end] == '{') - (SOURCE[end] == '}')
    end += 1
function = SOURCE[start:end]
node_program = function + '\nprocess.stdout.write(JSON.stringify(' + json.dumps(all_submatrices) + '.map(exactDet)));'
node_run = subprocess.run([str(NODE), '-e', node_program], capture_output=True, text=True, timeout=20, check=True)
js_dets = json.loads(node_run.stdout)
assert js_dets == [item['determinant'] for item in minors]

generator = array('G_HAMMING')
words = [tuple(sum(bits[i] * generator[i][j] for i in range(4)) % 2 for j in range(8)) for bits in product((0, 1), repeat=4)]
weights = Counter(map(sum, words))
distance = min(sum(x != y for x, y in zip(a, b)) for a, b in combinations(words, 2))
assert len(set(words)) == 16 and weights == {0:1, 4:14, 8:1} and distance == 4
groups = []
for word in words:
    base = [1 if x == 0 else -1 for x in word]
    group = []
    for k in range(8):
        vector = base.copy()
        if k:
            vector[0] = -vector[0]
            vector[k] = -vector[k]
        group.append(tuple(vector))
    groups.append(group)
spin = [v for v in product((-1, 1), repeat=8) if v.count(-1) % 2 == 0]
all_group_vectors = [v for group in groups for v in group]
assert len(all_group_vectors) == len(set(all_group_vectors)) == 128
assert set(all_group_vectors) == set(spin)

# Twice the page's vectors, so all remaining checks use integer arithmetic.
integer = []
for i, j in combinations(range(8), 2):
    for a, b in product((-2, 2), repeat=2):
        vector = [0]*8
        vector[i], vector[j] = a, b
        integer.append(tuple(vector))
roots = integer + spin
degrees = [0]*len(roots)
edges = 0
for i, j in combinations(range(len(roots)), 2):
    if dot(roots[i], roots[j]) == 4:
        degrees[i] += 1
        degrees[j] += 1
        edges += 1
assert len(integer) == 112 and len(spin) == 128 and len(set(roots)) == 240
assert {dot(v, v) for v in roots} == {8}
assert set(degrees) == {56} and edges == 6720
assert det(gram) == det(lean_matrix) == 1

# An order alone does not identify a finite abelian group. For each 7x7
# preset, gcd(all 6x6 minors)=1 checks that its cokernel is cyclic.
cyclic = {}
for name, removed in [('D7',7), ('E7',0), ('A7',5)]:
    indices = [i for i in range(8) if i != removed]
    matrix = [[gram[i][j] for j in indices] for i in indices]
    minors_gcd = 0
    for row in range(7):
        for column in range(7):
            minor = [[matrix[i][j] for j in range(7) if j != column] for i in range(7) if i != row]
            minors_gcd = gcd(minors_gcd, abs(int(det(minor))))
    assert minors_gcd == 1
    cyclic[name] = {'gcd_of_all_6_by_6_minors': minors_gcd, 'cokernel_cyclic_order': int(det(matrix))}

record = {
    'status': 'PASS',
    'checked_at_utc': datetime.now(timezone.utc).isoformat(),
    'scope': 'Exact finite arithmetic and replay of the actual standalone JavaScript determinant function; not a Lean compilation, browser rendering test, or proof of manifold topology.',
    'command': 'python tests/tab30-exact.py [optional-index-html]',
    'tab30_template_sha256': hashlib.sha256(SOURCE.encode()).hexdigest(),
    'lean_source': {
        'url': 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f0e7c291733f50a950f40cfc786c945b8cf06b99/E8PlumbingBridge.lean#L60',
        'git_blob_sha': '49f88cf46f59e29c2d6c01f9ba4289d97053be88',
        'statement': 'theorem E8_det : E8_matrix.det = 1',
        'fixture': lean_matrix,
    },
    'matrix_matches_negative_permuted_lean_matrix': entry_match,
    'permutation_zero_based': permutation,
    'matrix_entries_checked': 64,
    'principal_subsets_checked': len(minors),
    'zero_principal_determinants': sum(item['determinant'] == 0 for item in minors),
    'determinant_range_including_empty': [min(js_dets), max(js_dets)],
    'standalone_JavaScript_determinants_match_exact_arithmetic': True,
    'preset_determinants': {'E8': minors[255]['determinant'], 'D7_remove_alpha8': minors[127]['determinant'], 'E7_remove_alpha1': minors[254]['determinant'], 'A7_remove_alpha6': minors[223]['determinant']},
    'preset_cokernel_checks': cyclic,
    'hamming': {'distinct_words': len(set(words)), 'weight_distribution': dict(weights), 'minimum_distance': distance, 'groups': len(groups), 'vectors_per_group': 8, 'distinct_half_integer_vectors': len(set(all_group_vectors)), 'covers_all_128': True},
    'roots': {'integer': len(integer), 'half_integer': len(spin), 'total': len(roots), 'squared_norm': 2, 'degrees': sorted(set(degrees)), 'undirected_edges': edges},
    'principal_minors': minors,
}
print(json.dumps(record, indent=2))
