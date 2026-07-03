# Aether Memory Principles

* **Status:** 🟡 DRAFT / PROPOSED (v0.1)  
* **Abstract:** This document establishes the core, technology-independent behavioral and semantic guidelines for memory systems within Aether. These principles govern any memory features, storage engines, or indexing mechanisms designed for the Aether ecosystem.

---

## 🔮 Purpose

These principles define how memory behaves inside Aether.

They are technology-independent.

They apply regardless of whether memory is stored in SQLite, JSON, Markdown, a graph database, or any future storage system.

Every future memory feature must follow these principles.

---

## 📖 The Core Principles

### Principle 1 — Memory Exists to Help
Memory exists only to improve Aether's ability to help the user.

If remembering something does not increase usefulness, it should not become long-term memory.

---

### Principle 2 — The User Owns Their Memory
All long-term memory belongs to the user.

The user can:
* Inspect it
* Modify it
* Delete it
* Export it
* Import it

Nothing is permanently hidden from the user.

---

### Principle 3 — Facts and Inferences Are Different
Explicit user statements are facts.

Observed patterns are inferences.

Aether must never present an inference as if it were a confirmed fact.

---

### Principle 4 — Every Memory Has Evidence
Every stored memory must have a known origin.

Examples:
* User explicitly stated it.
* Imported from user data.
* Learned through repeated interaction.
* Generated as a project reflection.

Unknown origins are not acceptable.

---

### Principle 5 — Memory Evolves
Memory is not static.

Information may be:
* Updated
* Merged
* Archived
* Forgotten

History should remain traceable where appropriate.

---

### Principle 6 — Confidence Is Separate from Truth
Every memory has confidence.

Confidence represents how certain Aether is.

Confidence never changes reality.

A highly confident memory may still be wrong.

---

### Principle 7 — Forgetting Is a Feature
Not everything deserves permanent storage.

Aether should intentionally remove, archive, or expire information that no longer provides value.

---

### Principle 8 — Context Matters
A memory without context is often misleading.

Important memories should preserve:
* When
* Why
* Source
* Related project
* Related people

---

### Principle 9 — Memory Should Be Explainable
When possible, Aether should be able to explain:
* Why a memory exists
* How it was learned
* Why it was used

---

### Principle 10 — Privacy by Default
Memory is private unless the user explicitly decides otherwise.

Sharing is always intentional.

---

### Principle 11 — Memory Supports Thinking
Memory is not the goal.

Thinking is the goal.

Memory exists to improve:
* Reasoning
* Planning
* Learning
* Decision making

---

### Principle 12 — Architecture Before Storage
Memory behavior is defined before storage technology.

Changing the storage backend must not change memory semantics.
