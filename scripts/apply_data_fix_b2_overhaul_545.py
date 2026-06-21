#!/usr/bin/env python3
"""b2-overhaul-545 — idempotent data correction for SpiceAtlas (STAR-302).

Fixes two Probe b2-probe-613 issues:
  D1 classification: Dill / Peppermint / Coriander leaf are leaf herbs wrongly
     typed as 'spice' -> set type='herb'.
  D2 flavor duplication: 23 pepper entries all shared ['hot','sharp','woody']
     + heatLevel=3 -> apply botanically/culinarily accurate flavors + heat.

Idempotent: re-running produces no further change once applied.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "spices.json")
FIX = os.path.join(ROOT, "scripts", "data_fix_b2_overhaul_545.json")

# Heat -> short descriptor used to refresh the templated howToUse/context text
HEAT_WORD = {
    0: "no chile heat",
    1: "mild, gentle warmth",
    2: "moderate warmth",
    3: "noticeable heat",
    4: "strong heat",
    5: "intense, extreme heat",
}


def main():
    data = json.load(open(DATA, encoding="utf-8"))
    fix = json.load(open(FIX, encoding="utf-8"))
    by_slug = {d["slug"]: d for d in data}

    changed = 0

    # 1) Reclassify leaf herbs mislabeled as spice
    for slug in fix["reclassify_herb"]:
        d = by_slug.get(slug)
        if not d:
            continue
        if d.get("type") != "herb":
            d["type"] = "herb"
            changed += 1
        # Leaf herbs: ensure usedPart reflects leaf, not generic seasoning text
        if "leaf" not in (d.get("usedPart") or "").lower():
            d["usedPart"] = "leaf"
            changed += 1

    # 2) De-template pepper flavors + heat with accurate values
    for slug, vals in fix["pepper_fixes"].items():
        d = by_slug.get(slug)
        if not d:
            continue
        new_flavors = vals["flavors"]
        new_heat = vals["heatLevel"]
        if d.get("flavors") != new_flavors:
            d["flavors"] = new_flavors
            changed += 1
        if d.get("heatLevel") != new_heat:
            d["heatLevel"] = new_heat
            changed += 1
        # Refresh the identical "varies widely in aroma and heat" template line
        # so each pepper's howToUse reflects its real heat tier.
        hw = HEAT_WORD.get(new_heat, "varying heat")
        flav_phrase = ", ".join(new_flavors)
        pairings = d.get("pairings") or []
        lead = ", ".join(pairings[:3]) if pairings else "complementary ingredients"
        new_howto = (
            f"Use it deliberately with {lead}. It brings {flav_phrase} notes with "
            f"{hw}, so start small and adjust to taste."
        )
        if d.get("howToUse") != new_howto:
            d["howToUse"] = new_howto
            changed += 1
        new_ctx = (
            f"Used where its {flav_phrase} character ({hw}) defines the dish, "
            f"rather than as a generic pepper substitute."
        )
        if d.get("culinaryContext") != new_ctx:
            d["culinaryContext"] = new_ctx
            changed += 1

    json.dump(data, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # Report
    print(f"Applied {changed} field change(s).")
    from collections import Counter
    types = Counter(x.get("type") for x in data)
    print("Type distribution:", dict(types))
    fl = Counter(tuple(sorted(x.get("flavors", []))) for x in data)
    top = fl.most_common(3)
    print("Top flavor-set counts after fix:", top)
    # Confirm pepper de-dup
    hsw = sum(1 for x in data if sorted(x.get("flavors", [])) == ["hot", "sharp", "woody"])
    print(f"Remaining 'hot/sharp/woody' entries: {hsw}")


if __name__ == "__main__":
    main()
