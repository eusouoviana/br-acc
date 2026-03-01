# Public Repo Release Checklist — World Transparency Graph

## 1) Prepare sanitized snapshot
```bash
bash scripts/prepare_public_snapshot.sh /Users/brunoclz/CORRUPTOS /tmp/world-transparency-graph-public
```

## 2) Initialize clean-history repo from snapshot
```bash
cd /tmp/world-transparency-graph-public
git init
git add .
git commit -m "Initial public public edition release (WTG)"
```

## 3) Create GitHub repository (manual)
- Owner: `brunoclz`
- Name: `world-transparency-graph`
- Visibility: Public
- Do not auto-add README/License (already present)

## 4) Push initial release
```bash
git branch -M main
git remote add origin https://github.com/brunoclz/world-transparency-graph.git
git push -u origin main
```

## 5) Configure branch protection (GitHub UI)
Require all checks:
- `API (Python)`
- `ETL (Python)`
- `Frontend (TypeScript)`
- `Neutrality Audit`
- `Gitleaks`
- `Bandit (Python)`
- `Pip Audit (Python deps)`
- `Public Privacy Gate`

## 6) Configure environment defaults
- Set public deployment environment vars:
  - `PUBLIC_MODE=true`
  - `PUBLIC_ALLOW_PERSON=false`
  - `PUBLIC_ALLOW_ENTITY_LOOKUP=false`
  - `PUBLIC_ALLOW_INVESTIGATIONS=false`

## 7) Final checks before launch
- `python scripts/check_public_privacy.py --repo-root .` => `PASS`
- Confirm no internal runbooks in public repo
- Confirm demo data is synthetic (`data/demo/synthetic_graph.json`)

## 8) Launch communication split
- Publish product announcement as **WTG**
- Publish movement announcement as **BRCC**
- Mention methodology limits and non-accusatory policy
