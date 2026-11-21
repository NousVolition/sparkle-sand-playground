import Tab30PlumbingAssembly
import Mathlib.Analysis.Matrix.PosDef

/-! Boundary checks for Tab 30. The first group concerns the local, unrounded
plumbing in its two signed radial coordinates. The second concerns the
integral matrix and the published Eells–Kuiper formula. The identification of
the smooth boundary with the standard E₈ plumbing and the characteristic
numbers of its filling are geometric inputs from the literature. -/

namespace Tab30PlumbingBoundary

open Set Tab30PlumbingAssembly

/-- Each coordinate is squared radius minus one. The first piece contributes
the half-plane f ≤ 0 and the other piece contributes the half-plane b ≤ 0. -/
def radialBody : Set (ℝ × ℝ) := {p | p.1 ≤ 0 ∨ p.2 ≤ 0}

/-- The topological frontier consists of two exterior rays meeting at the seam. -/
theorem radial_frontier (b f : ℝ) :
    (b, f) ∈ frontier radialBody ↔ (0 ≤ b ∧ f = 0) ∨ (b = 0 ∧ 0 ≤ f) := by
  have hc : IsClosed radialBody :=
    (isClosed_le continuous_fst continuous_const).union (isClosed_le continuous_snd continuous_const)
  have hcomp : radialBodyᶜ = Ioi (0 : ℝ) ×ˢ Ioi (0 : ℝ) := by
    ext q
    change ¬ (q.1 ≤ 0 ∨ q.2 ≤ 0) ↔ 0 < q.1 ∧ 0 < q.2
    simp only [not_or, not_le]
  simp only [frontier_eq_closure_inter_closure, hc.closure_eq, hcomp, closure_prod_eq, closure_Ioi]
  change ((b ≤ 0 ∨ f ≤ 0) ∧ 0 ≤ b ∧ 0 ≤ f) ↔ _
  constructor
  · rintro ⟨h, hb, hf⟩
    rcases h with h | h
    · exact Or.inr ⟨le_antisymm h hb, hf⟩
    · exact Or.inl ⟨hb, le_antisymm h hf⟩
  · rintro (⟨hb, rfl⟩ | ⟨rfl, hf⟩)
    · exact ⟨Or.inr le_rfl, hb, le_rfl⟩
    · exact ⟨Or.inl le_rfl, le_rfl, hf⟩

def radii (p : Address) : ℝ × ℝ :=
  ((∑ k, (p.base.val k)^2) - 1, (∑ k, (p.fiber.val k)^2) - 1)

def onRim (v : Disk4) : Prop := ∑ k, (v.val k)^2 = 1

/-- Within the closed overlap, the surviving boundary has both factors on S³. -/
theorem overlap_boundary_iff (p : Address) :
    radii p ∈ frontier radialBody ↔ onRim p.base ∧ onRim p.fiber := by
  rw [radii, radial_frontier]
  unfold onRim
  have hb := p.base.property
  have hf := p.fiber.property
  constructor
  · rintro (⟨h, h'⟩ | ⟨h, h'⟩) <;> constructor <;> linarith
  · rintro ⟨h, h'⟩
    left
    constructor <;> linarith

/-- Both chart addresses describe the same S³ × S³ seam. -/
theorem cross_preserves_seam (p : Address) :
    radii (cross p) ∈ frontier radialBody ↔ radii p ∈ frontier radialBody := by
  rw [overlap_boundary_iff, overlap_boundary_iff]
  exact and_comm

/-- Every integer column is hit, so the presented abelian cokernel is trivial.
The homology sequence identifying a plumbing boundary group with that cokernel
is external to this calculation. -/
theorem integral_intersection_surjective :
    Function.Surjective E8PlumbingBridge.E8_matrix.mulVec := by
  intro y
  refine ⟨E8PlumbingBridge.E8_matrix.adjugate.mulVec y, ?_⟩
  rw [Matrix.mulVec_mulVec, Matrix.mul_adjugate, E8PlumbingBridge.E8_det, one_smul, Matrix.one_mulVec]

/-- The actual Tab 30 Gram matrix in the orientation with positive form. -/
noncomputable def realGram : Matrix (Fin 8) (Fin 8) ℝ :=
  (Rat.castHom ℝ).mapMatrix E8Tab30Bridge.G

theorem gram_positive_definite : realGram.PosDef := by
  let R := (Rat.castHom ℝ).mapMatrix E8Tab30Bridge.simpleRoots
  have hGram : realGram = R * R.transpose := by
    ext i j
    change ((∑ k : Fin 8, E8Tab30Bridge.simpleRoots i k * E8Tab30Bridge.simpleRoots j k : ℚ) : ℝ) = _
    simp [R, Matrix.mul_apply]
  have hd : realGram.det = 1 := by
    rw [realGram, ← RingHom.map_det, E8Tab30Bridge.det_G, map_one]
  have hT : R.transpose.det ≠ 0 := by
    intro h
    rw [hGram, Matrix.det_mul, h, mul_zero] at hd
    exact zero_ne_one hd
  rw [hGram]
  simpa only [Matrix.conjTranspose_eq_transpose_of_trivial, Matrix.transpose_transpose] using
    Matrix.PosDef.conjTranspose_mul_self R.transpose (Matrix.mulVec_injective_of_det_ne_zero hT)

/-- Signature is the number of positive eigenvalues less the number of
negative eigenvalues, with multiplicities. -/
noncomputable def gramSignature : ℤ :=
  ∑ i : Fin 8, if 0 < gram_positive_definite.1.eigenvalues i then (1 : ℤ)
    else if gram_positive_definite.1.eigenvalues i < 0 then -1 else 0

theorem gram_signature : gramSignature = 8 := by
  simp [gramSignature, gram_positive_definite.eigenvalues_pos]

/-- The normalized expression in dimension seven, with pSq the relative
Pontryagin square and sig the signature of the oriented spin filling. -/
def ekRepresentative (pSq sig : ℚ) : ℚ := (pSq - 4 * sig) / 896
def ekClass (pSq sig : ℚ) : AddCircle (1 : ℚ) := (ekRepresentative pSq sig : ℚ)

theorem positive_E8_value : ekRepresentative 0 8 = -(1 / 28 : ℚ) := by norm_num [ekRepresentative]

/-- The additive order is exactly 28 in the rational numbers modulo integers. -/
theorem positive_E8_order : addOrderOf (ekClass 0 (gramSignature : ℚ)) = 28 := by
  rw [gram_signature]
  change addOrderOf (ekClass 0 8) = 28
  have h : ekClass 0 8 = -(((1 : ℚ) / 28 : ℚ) : AddCircle (1 : ℚ)) := by
    unfold ekClass
    rw [positive_E8_value, AddCircle.coe_neg]
  rw [h, addOrderOf_neg]
  exact AddCircle.addOrderOf_period_div (p := (1 : ℚ)) (n := 28) (by decide)

theorem positive_E8_nonzero : ekClass 0 (gramSignature : ℚ) ≠ 0 := by
  intro h
  have hOrder := positive_E8_order
  simp [h] at hOrder

theorem reversed_orientation_value : ekClass 0 (-8) = -(ekClass 0 8) := by
  unfold ekClass
  rw [← AddCircle.coe_neg]
  congr 1
  norm_num [ekRepresentative]

#print axioms radial_frontier
#print axioms overlap_boundary_iff
#print axioms cross_preserves_seam
#print axioms integral_intersection_surjective
#print axioms gram_positive_definite
#print axioms gram_signature
#print axioms positive_E8_value
#print axioms positive_E8_order
#print axioms positive_E8_nonzero
#print axioms reversed_orientation_value

end Tab30PlumbingBoundary
