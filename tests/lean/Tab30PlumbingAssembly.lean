import E8Tab30Bridge

/-! Local assembly checks for Tab 30, using the project's proved Gram matrix.
Indices are zero-based. A site is a piece together with its local chart number.
The disk factors below contain real four-vectors. -/

namespace Tab30PlumbingAssembly

abbrev Piece := Fin 8
abbrev Site := Piece × Fin 3

/-- Each pair lists the two attachment charts used by one join, in page order. -/
def fittings : List (Site × Site) :=
  [((0, 0), (1, 0)), ((1, 1), (2, 0)), ((2, 1), (3, 0)),
   ((3, 1), (4, 0)), ((4, 1), (5, 0)), ((4, 2), (6, 0)),
   ((6, 1), (7, 0))]

def joints : Finset (Piece × Piece) :=
  (fittings.map fun e => (e.1.1, e.2.1)).toFinset

set_option maxRecDepth 8192 in
set_option maxHeartbeats 2000000 in
/-- The seven joints select exactly the upper-triangular −1 Gram entries. -/
theorem gram_joint_iff (i j : Piece) :
    (i, j) ∈ joints ↔ i < j ∧ E8Tab30Bridge.G i j = -1 := by
  rw [E8Tab30Bridge.gram_entry]
  decide +revert

theorem seven_joints : joints.card = 7 := by decide

theorem distinct_sites : (fittings.flatMap fun e => [e.1, e.2]).Nodup := by decide

private def parent : Piece → Piece := ![0, 0, 1, 2, 3, 4, 4, 6]
private def ancestor : ℕ → Piece → Piece
  | 0, i => i
  | n + 1, i => parent (ancestor n i)

private theorem parent_step (i : Piece) : i = 0 ∨ (parent i, i) ∈ joints := by decide +revert
private theorem parent_zero : parent 0 = 0 := rfl
private theorem root_after_seven (i : Piece) : ancestor 7 i = 0 := by decide +revert

/-- Each of the eight pieces reaches piece zero using the listed joints. -/
theorem assembly_connected (i : Piece) :
    Relation.ReflTransGen (fun child par : Piece => (par, child) ∈ joints) i 0 := by
  have walk (n : ℕ) :
      Relation.ReflTransGen (fun child par : Piece => (par, child) ∈ joints) i (ancestor n i) := by
    induction n with
    | zero => exact .refl
    | succ n ih =>
      rcases parent_step (ancestor n i) with h | h
      · simpa only [ancestor, h, parent_zero] using ih
      · exact ih.tail h
  simpa only [root_after_seven] using walk 7

/-- A closed 4-disk, using Euclidean squared length. -/
abbrev Disk4 := {v : Fin 4 → ℝ // ∑ k, (v k)^2 ≤ 1}
def origin : Disk4 := ⟨0, by norm_num⟩

structure Address where
  joint : Fin fittings.length
  right : Bool
  base : Disk4
  fiber : Disk4

/-- Cross the chosen joint to the chart at its other end. -/
def cross (p : Address) : Address :=
  ⟨p.joint, !p.right, p.fiber, p.base⟩

def siteOf (p : Address) : Site :=
  let e := fittings.get p.joint
  if p.right then e.2 else e.1

theorem cross_to_listed_sites (j : Fin fittings.length) (b f : Disk4) :
    (siteOf ⟨j, false, b, f⟩, siteOf (cross ⟨j, false, b, f⟩)) = fittings.get j := rfl

theorem cross_twice (p : Address) : cross (cross p) = p := by
  rcases p with ⟨j, r, b, f⟩
  cases r <;> rfl

theorem zero_section_to_fiber (j : Fin fittings.length) (b : Disk4) :
    cross ⟨j, false, b, origin⟩ = ⟨j, true, origin, b⟩ := rfl

theorem both_zero_sections (p : Address) :
    p.fiber = origin ∧ (cross p).fiber = origin ↔ p.base = origin ∧ p.fiber = origin := by
  change _ ∧ p.base = origin ↔ _
  exact and_comm

/-- The workbench uses base radius 1/3 in its tangent coordinates, so a cap
has squared center coordinate at least 8/9. Two distinct axes cannot both
meet that condition on the unit 4-sphere in five real coordinates. -/
theorem distinct_caps_disjoint (i j : Fin 5) (hne : i ≠ j) (x : Fin 5 → ℝ)
    (unit : ∑ k, (x k)^2 = 1) :
    ¬ ((8:ℝ)/9 ≤ (x i)^2 ∧ (8:ℝ)/9 ≤ (x j)^2) := by
  rintro ⟨hi, hj⟩
  have bound : ∑ k ∈ ({i, j} : Finset (Fin 5)), (x k)^2 ≤ ∑ k, (x k)^2 :=
    Finset.sum_le_sum_of_subset_of_nonneg (Finset.subset_univ _) (by intros; positivity)
  simp [hne, unit] at bound
  linarith

#print axioms gram_joint_iff
#print axioms seven_joints
#print axioms distinct_sites
#print axioms assembly_connected
#print axioms cross_to_listed_sites
#print axioms cross_twice
#print axioms zero_section_to_fiber
#print axioms both_zero_sections
#print axioms distinct_caps_disjoint

end Tab30PlumbingAssembly
