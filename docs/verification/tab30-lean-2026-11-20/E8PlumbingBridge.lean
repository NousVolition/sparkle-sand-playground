import Mathlib

/-!
# The E₈ Plumbing Matrix & Sphere Determinant Bridge

This file records the A₄ and E₈ plumbing intersection matrices, their determinants
and symmetry, and two counts on the 8-cube that add to 240.

## Mathematical Overview
1. **Plumbing Graphs (`A₄` vs `E₈`)**: Gluing disk bundles along a graph produces an
   intersection matrix with the bundles' Euler number on the diagonal and `+1` on adjacent
   vertices. Here the diagonal is `-2` (the 4D picture: disk bundles over S²). In the 8D
   picture (tangent disk bundles of S⁴) the diagonal is `+2`; for these even-size matrices
   the determinant is the same.
2. **The Determinant Test** (what the determinant does and does not tell you):
   - `det(A₄) = 5`: the boundary 3-manifold has first homology `ℤ/5ℤ`; it is the lens space
     `L(5, 4)` (that is, `L(5, 1)` with its orientation reversed), so it is **not** a sphere.
   - `det(E₈) = 1`: the intersection form is unimodular, so the boundary has the same
     homology as a sphere (a *homology sphere*). That alone does not make it a sphere:
     * in 4D the boundary is the **Poincaré homology sphere**, which is *not* a sphere
       (its fundamental group has 120 elements);
     * in 8D the boundary is also simply connected, so it *is* a topological 7-sphere,
       and it is exotic: it generates the group `Θ₇ ≅ ℤ/28ℤ` of smooth 7-spheres.
3. **Counts on `Cube 8`**: we count `112` vectors of shape `(±1, ±1, 0, …, 0)` and `128`
   sign patterns with an even number of minus signs, `112 + 128 = 240` = the number of
   roots of `E₈`. These theorems are counts; they do not prove that these vectors are the
   roots of the lattice defined by `E8_matrix`.

Build note: a `decide` proof of the two determinants would expand all 24 (A₄) and 40,320 (E₈)
row orderings. The proofs here use `simp` and `norm_det` instead, and do not use `native_decide`.
-/

open Matrix

namespace E8PlumbingBridge

/-! ## 1. The A₄ Chain Plumbing Matrix (`det = 5`, a lens space boundary) -/

/-- Intersection matrix of the `A₄` linear plumbing chain (with `-2` self-intersections). -/
def A4_matrix : Matrix (Fin 4) (Fin 4) ℤ :=
  !![-2,  1,  0,  0;
      1, -2,  1,  0;
      0,  1, -2,  1;
      0,  0,  1, -2]

/-- `A₄` is symmetric. -/
theorem A4_isSymm : A4_matrix.IsSymm := by
  ext i j
  fin_cases i <;> fin_cases j <;> rfl

/-- The determinant of the `A₄` plumbing matrix is `5 ≠ ±1`, so its boundary has first
homology `ℤ/5ℤ` (the lens space `L(5, 4)`) and is not a sphere. -/
theorem A4_det : A4_matrix.det = 5 := by
  simp [A4_matrix, norm_det]

/-! ## 2. The E₈ Plumbing Matrix (`det = 1`, homology sphere boundary) -/

/-- Intersection matrix of the `E₈` plumbing tree (with `-2` self-intersections and a
trivalent branch at node `4` connected to nodes `3`, `5`, and `7`; arms of length 4, 2, 1). -/
def E8_matrix : Matrix (Fin 8) (Fin 8) ℤ :=
  !![-2,  1,  0,  0,  0,  0,  0,  0;
      1, -2,  1,  0,  0,  0,  0,  0;
      0,  1, -2,  1,  0,  0,  0,  0;
      0,  0,  1, -2,  1,  0,  0,  0;
      0,  0,  0,  1, -2,  1,  0,  1;
      0,  0,  0,  0,  1, -2,  1,  0;
      0,  0,  0,  0,  0,  1, -2,  0;
      0,  0,  0,  0,  1,  0,  0, -2]

/-- `E₈` is symmetric. -/
theorem E8_isSymm : E8_matrix.IsSymm := by
  ext i j
  fin_cases i <;> fin_cases j <;> rfl

/-- **Main Unimodularity Theorem (`det(E₈) = 1`).**
Because the `E₈` intersection form is unimodular over `ℤ`, the plumbing's boundary has
trivial first homology: it is a homology sphere. (In the 8D plumbing the boundary is also
simply connected, hence a topological 7-sphere — an exotic one.) -/
theorem E8_det : E8_matrix.det = 1 := by
  simp [E8_matrix, norm_det]

/-- The trace of `E₈_matrix` is `-16` (`8` spheres each of self-intersection `-2`). -/
theorem E8_trace : Matrix.trace E8_matrix = -16 := by
  simp [E8_matrix, Matrix.trace]
  decide

/-! ## 3. Counts on the 8-Cube (`Cube 8`) and the 240 Roots of E₈ -/

/-- The 8-dimensional hypercube (`Fin 8 → Bool`), matching `HypercubeIso.Cube 8`. -/
abbrev Cube8 := Fin 8 → Bool

/-- Even-parity predicate on `Cube8` (even number of `true` coordinates). -/
def isEvenParity (x : Cube8) : Bool :=
  (Finset.univ.filter (fun i => x i = true)).card % 2 == 0

/-- Flip the coordinate at index `0`. This changes the number of `true` coordinates by one,
so it swaps even-parity vertices with odd-parity vertices. -/
private def flipZero (x : Cube8) : Cube8 :=
  fun i => if i = 0 then !x i else x i

private lemma flipZero_involutive (x : Cube8) : flipZero (flipZero x) = x := by
  ext i
  simp only [flipZero]
  split_ifs <;> simp

private lemma flipZero_injective : Function.Injective flipZero := by
  intro x y h
  simpa [flipZero_involutive] using congrArg flipZero h

private lemma support_flipZero (x : Cube8) :
    Finset.univ.filter (fun i => flipZero x i = true) =
      if x 0 = true then
        (Finset.univ.filter (fun i => x i = true)).erase 0
      else
        insert 0 (Finset.univ.filter (fun i => x i = true)) := by
  ext i
  by_cases hx0 : x 0 = true <;> by_cases hi : i = 0 <;> simp [flipZero, hx0, hi]

private lemma even_add_one_mod (n : ℕ) :
    ((n + 1) % 2 == 0) = !(n % 2 == 0) := by
  rcases Nat.mod_two_eq_zero_or_one n with h | h
  · simp [Nat.add_mod, h]
  · simp [Nat.add_mod, h]

private lemma even_sub_one_mod {n : ℕ} (hn : 0 < n) :
    ((n - 1) % 2 == 0) = !(n % 2 == 0) := by
  rcases Nat.mod_two_eq_zero_or_one n with h | h
  · have : (n - 1) % 2 = 1 := by omega
    simp [h, this]
  · have : (n - 1) % 2 = 0 := by omega
    simp [h, this]

private lemma isEvenParity_flipZero (x : Cube8) :
    isEvenParity (flipZero x) = ! isEvenParity x := by
  simp only [isEvenParity]
  cases hx : x 0
  · have hnot : 0 ∉ Finset.univ.filter (fun i => x i = true) := by
      simp [hx]
    simp [support_flipZero, hx, Finset.card_insert_of_notMem hnot, even_add_one_mod]
  · have hmem : 0 ∈ Finset.univ.filter (fun i => x i = true) := by
      simp [hx]
    have hpos : 0 < (Finset.univ.filter (fun i => x i = true)).card :=
      Finset.card_pos.mpr ⟨0, hmem⟩
    simp [support_flipZero, hx, Finset.card_erase_of_mem hmem, even_sub_one_mod hpos]

private lemma map_flipZero_even_eq_odd :
    (Finset.univ.filter (fun x : Cube8 => isEvenParity x = true)).map
      ⟨flipZero, flipZero_injective⟩ =
    Finset.univ.filter (fun x : Cube8 => isEvenParity x = false) := by
  ext y
  simp only [Finset.mem_map, Finset.mem_filter, Finset.mem_univ, true_and,
    Function.Embedding.coeFn_mk]
  constructor
  · rintro ⟨x, hx, rfl⟩
    simp [isEvenParity_flipZero, hx]
  · intro hy
    refine ⟨flipZero y, ?_, flipZero_involutive y⟩
    simp [isEvenParity_flipZero, hy]

private lemma card_cube8 : (Finset.univ : Finset Cube8).card = 256 := by
  rw [Finset.card_univ, Fintype.card_fun, Fintype.card_fin, Fintype.card_bool]
  norm_num

/-- There are `128` even-parity vertices in `Cube 8`, the same number as the `128`
half-integer roots `(±1/2, ..., ±1/2)` of `E₈` (even number of minus signs). -/
theorem card_spinor_roots :
    (Finset.univ.filter (fun x : Cube8 => isEvenParity x = true)).card = 128 := by
  set evenSet := Finset.univ.filter (fun x : Cube8 => isEvenParity x = true)
  set oddSet := Finset.univ.filter (fun x : Cube8 => isEvenParity x = false)
  have hpart : evenSet.card + oddSet.card = 256 := by
    have h := Finset.card_filter_add_card_filter_not
      (s := (Finset.univ : Finset Cube8)) (fun x => isEvenParity x = true)
    simp only [Bool.not_eq_true, card_cube8] at h
    exact h
  have hsame : evenSet.card = oddSet.card := by
    simpa [evenSet, oddSet, Finset.card_map] using
      congrArg Finset.card map_flipZero_even_eq_odd
  omega

/-- There are `28` pairs of distinct coordinates in `Fin 8`, giving `4 * 28 = 112`
integer roots `(±1, ±1, 0, ..., 0)` of `E₈`. -/
theorem card_integer_roots :
    4 * (Finset.univ.filter (fun p : Fin 8 × Fin 8 => p.1 < p.2)).card = 112 := by
  decide

/-- Together the counts give `112 + 128 = 240`, the number of minimal vectors of the
`E₈` root lattice. (A count check, not a proof about the lattice itself.) -/
theorem total_E8_roots :
    4 * (Finset.univ.filter (fun p : Fin 8 × Fin 8 => p.1 < p.2)).card +
    (Finset.univ.filter (fun x : Cube8 => isEvenParity x = true)).card = 240 := by
  have h₁ := card_integer_roots
  have h₂ := card_spinor_roots
  omega

end E8PlumbingBridge
