# Development TODO

## RDO Version Governance (post-MVP / 1.0 evolution)

- [ ] Add RDO dependency impact analysis. A concrete version must show every dependent configuration and production-use context that references it, including the referenced version and lifecycle state.
- [ ] Add copy-forward revision for dependent configurations. It must clone the existing configuration into a new draft with its concrete references intact, so users can explicitly replace only the references they choose.
- [ ] Add controlled bulk replacement assistance. It may create or update explicit drafts only, present an impact summary, and require user confirmation; it must never silently alter an already effective configuration.
- [ ] Persist execution-time snapshots of every concrete RDO version used by a production record, including the version ID, business identifier, version number, effective window, and immutable content/hash where applicable.
- [ ] Add pre-effective validation for new or revised configurations: each new reference must point to a currently effective concrete version. Existing historical references remain traceable after their source version expires.
- [ ] When work-order, batch, or SN production execution is introduced, add a required product-configuration-version selector. It must list all matching active concrete versions and persist the explicit choice; it must never resolve a version automatically.
- [ ] Do not introduce a current/default version or automatic latest-version selection. Any future upgrade flow must retain the MVP rule that parent RDOs only aggregate independently effective child versions.
