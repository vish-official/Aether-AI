# Aether Memory Specification: The Universal Memory Object

* **Status:** 🟡 DRAFT (v0.1)  
* **Subject:** The Universal Memory Object Conceptual Schema  
* **Parent Specification:** [04_Memory_Principles.md](04_Memory_Principles.md)  

---

## 1. Architectural Definition

### What is a Memory Object?
A **Memory Object** is the foundational, atomic, and self-contained unit of semantic retention within Aether. It is a technology-independent data envelope that binds together retrieved experience, contextual metadata, confidence measures, and audit records into a single, uniform package. 

Every facet of Aether's long-term and short-term recollection—regardless of whether it represents an explicit user preference, an inferred workflow pattern, an active project constraint, or a self-reflective system state—must inherit this conceptual structure.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNIVERSAL MEMORY OBJECT                         │
├────────────────────────────────────────────────────────────────────────┤
│  [Identity Boundary]                                                   │
│   ├── UUID (Permanent, globally unique identifier)                     │
│   └── Semantic Type / Domain (Boundary grouping)                       │
├────────────────────────────────────────────────────────────────────────┤
│  [Payload Envelope]                                                    │
│   ├── Core Content (Sovereign semantic payload)                        │
│   └── Extensible Metadata (Domain-specific schema space)                │
├────────────────────────────────────────────────────────────────────────┤
│  [Audit & Lineage Trail]                                               │
│   ├── Source & Origin (Verifiable genesis trace)                       │
│   ├── Evidence Log (Trace of corroborating observations)               │
│   └── Confidence Profile (Evidence-backed certainty state)             │
├────────────────────────────────────────────────────────────────────────┤
│  [Context Envelope]                                                    │
│   ├── Environmental Context (Spatial, temporal, relational)            │
│   └── Taxonomy Tags (Decoupled semantic qualifiers)                    │
├────────────────────────────────────────────────────────────────────────┤
│  [Lifecycle State]                                                     │
│   ├── Operational Status (Candidate, Verified, Archived, etc.)         │
│   └── Temporal Markers (Created, Updated, Expired timestamps)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Engineering Rationale

In Aether, memory is not a side-car database of simple text snippets; it is an active cognitive fabric. Forcing every memory to share a unified, immutable envelope yields substantial engineering benefits:

* **Universal Parser & Indexer Stability:** Internal reasoning systems, planners, and background agents can parse, evaluate, and trace any memory object using a single, consistent protocol. The query engine does not need to adapt to different internal structures for different types of data.
* **Traceability and Accountability Guarantee:** By embedding origin, evidence, and confidence directly into the atomic model, Aether guarantees that no memory can exist as an "orphan" with unknown origins. Every piece of retained data is auditable.
* **Seamless Cognitive Synthesis:** When background agents perform high-level processing (e.g., merging short-term observations into long-term user model preferences), they can read input memories and write output memories using the exact same contract, facilitating clean data lineages.
* **Storage and Driver Decoupling:** Subsystems responsible for syncing memory across user devices or swapping memory between local fast-cache layers and long-term storage do not need to understand what is *inside* a memory to manage its lifecycle.

---

## 3. Universal Fields Specification

The following schema defines the conceptual fields that every Memory Object must contain. This design is strictly technology-independent and avoids programming language syntax, focusing entirely on semantic and logical requirements.

### 3.1. Primary Envelope Fields

#### Field 1: Memory Identifier
* **Name:** `Memory ID`
* **Purpose:** Uniquely and permanently identifies this specific memory across all space, time, and synchronized user devices.
* **Why it exists:** Crucial for referencing memory objects in transaction logs, planning graphs, and dependency networks without ambiguity.
* **Required:** Yes
* **Notes:** Once generated, this identifier must be structurally immutable. It must never change, even if the content of the memory is updated.

#### Field 2: Memory Domain
* **Name:** `Memory Domain`
* **Purpose:** Classifies the memory under a primary behavioral and semantic category.
* **Why it exists:** Allows high-speed routing, partitioning, and retrieval scoping without having to inspect the payload.
* **Required:** Yes
* **Notes:** Allowed domains are constrained to those defined in the architectural boundaries: *Identity, Preferences, Projects, Working Memory, Reflections, Knowledge, User Model, Self Model*.

#### Field 3: Core Content
* **Name:** `Content`
* **Purpose:** The actual body of knowledge or experience being retained.
* **Why it exists:** Represents the primary payload of information the user or system needs to recall.
* **Required:** Yes
* **Notes:** Can contain raw strings, key-value structures, or complex lists, but must remain representation-agnostic at this layer.

---

### 3.2. Context & Rationale Fields

#### Field 4: Context Envelope
* **Name:** `Context`
* **Purpose:** Captures the situational coordinates when the memory was acquired or observed.
* **Why it exists:** Prevents memories from being evaluated out-of-context, which leads to incorrect reasoning.
* **Required:** Yes
* **Notes:** Must conceptually capture:
  * *Temporal context* (the specific human time or phase of interaction)
  * *Relational context* (related active tasks, projects, or people present)
  * *System context* (the state of the workspace or active application when remembered)

#### Field 5: Source
* **Name:** `Source`
* **Purpose:** Explicitly documents the actor or system that initiated the creation of this memory.
* **Why it exists:** Directly supports Principle 4 (Every Memory Has Evidence) and Principle 10 (Privacy by Default) by tracking exactly who or what introduced the data.
* **Required:** Yes
* **Notes:** Value must represent a clear category of origin (e.g., "User Statement", "System Inference", "External Import", "Workspace Event").

#### Field 6: Evidence Log
* **Name:** `Evidence Log`
* **Purpose:** A historical collection of corroborating observations, interaction logs, or specific document references that justify the existence of this memory.
* **Why it exists:** Prevents Aether from hallucinating patterns or retaining uncorroborated assumptions.
* **Required:** Yes (though it may be initialized as empty for explicit, self-evident user statements)
* **Notes:** For inferred memories, this log must reference the specific, discrete events that triggered the inference.

#### Field 7: Confidence Profile
* **Name:** `Confidence Profile`
* **Purpose:** Quantifies Aether's operational certainty regarding the memory's truth or relevance.
* **Why it exists:** Fulfills Principle 6 (Confidence is Separate from Truth). Allows planning and execution engines to weigh risks when acting on potentially outdated or inferred data.
* **Required:** Yes
* **Notes:** Must remain bound to the `Evidence Log`. If evidence is sparse or old, confidence decays over time.

---

### 3.3. Lifecycle & Metadata Fields

#### Field 8: Operational Status
* **Name:** `Status`
* **Purpose:** Represents the lifecycle state of the memory within the system.
* **Why it exists:** Supports forgetting, archivation, and human vetting of automated system insights.
* **Required:** Yes
* **Notes:** Strictly limited to the conceptual states defined in Section 5 of this document.

#### Field 9: Created At
* **Name:** `Created At`
* **Purpose:** Stores the exact timestamp when the Memory Object was first written to storage.
* **Why it exists:** Used for age-based decay calculations, historical audits, and chronological timeline reconstruction.
* **Required:** Yes
* **Notes:** Immutable. Must represent the true standard cosmic time of genesis.

#### Field 10: Updated At
* **Name:** `Updated At`
* **Purpose:** Stores the exact timestamp when any field within the Memory Object was modified.
* **Why it exists:** Vital for synchronization reconciliation between multi-terminal systems to resolve write conflicts.
* **Required:** Yes
* **Notes:** Must be updated atomically on every write operation affecting the object.

#### Field 11: Taxonomy Tags
* **Name:** `Tags`
* **Purpose:** Flat, non-hierarchical, human-readable labels associated with the memory.
* **Why it exists:** Facilitates broad, multi-domain discovery and cross-domain associations (e.g., tagging an identity memory and a project memory both with "personal-finance").
* **Required:** No (defaults to empty)
* **Notes:** Conceptual labels used for light organizational purposes.

#### Field 12: Extensible Metadata
* **Name:** `Metadata`
* **Purpose:** An escape hatch for domain-specific schemas that do not fit into the core universal fields.
* **Why it exists:** Enables specialization (e.g., project memories might need milestones; preference memories might need override rules) without mutating the universal parent structure.
* **Required:** No (defaults to empty)
* **Notes:** Must never be used to bypass the core universal fields. Core properties like ID, Status, and Confidence must never be placed inside the Metadata envelope.

---

## 4. Memory Identity

Identity is the constitutional anchor of memory. To ensure total client-side sovereignty and robust offline operation:

* **Globally Unique Uniqueness:** Every Memory ID must be mathematically unique across all possible local systems. Memory generation must not rely on a central server to assign IDs, allowing Aether to safely register memories during completely offline sessions.
* **Traceable Lineage:** If a memory is modified, merged, or split, the new Memory Object(s) must preserve references to the `Memory ID` of the precursor objects inside their `Evidence Log`. This guarantees that the chain of custody and evolutionary path of any memory remains entirely traceable from its genesis.

---

## 5. Conceptual Memory Statuses

To manage the lifecycle of data, every Memory Object must occupy exactly one of the following states:

```
                  ┌───────────────┐
                  │   Candidate   │ ◄─── (Uncorroborated pattern or draft)
                  └───────┬───────┘
                          │ (Corroborated / Confirmed)
                          ▼
                  ┌───────────────┐
                  │   Verified    │ ◄─── (Explicit facts or solid patterns)
                  └───────┬───────┘
                          │
         ┌────────────────┴────────────────┐
         ▼ (Obsolete or superseded)       ▼ (Vetoed or disproven)
  ┌───────────────┐                 ┌───────────────┐
  │   Archived    │                 │   Rejected    │
  └───────┬───────┘                 └───────────────┘
          │ (Explicitly purged)
          ▼
  ┌───────────────┐
  │   Forgotten   │ ◄─── (Tombstoned record awaiting garbage collection)
  └───────────────┘
```

1. **Candidate:** The memory is a proposed draft. It may be an uncorroborated inference, an pattern observed only once, or a suggestion queued for user verification.
2. **Verified:** The memory is accepted as reliable. This includes all explicit user statements (facts) and highly corroborated inferences. Aether can confidently base planning and reasoning on this object.
3. **Archived:** The memory is no longer actively relevant to current tasks, but remains in long-term cold storage. It is excluded from default search windows but remains searchable if historical context is requested.
4. **Rejected:** The memory has been explicitly vetoed or disproven by the user or strong counter-evidence. It serves as a negative constraint, preventing Aether from forming the same incorrect inference again.
5. **Forgotten:** The memory is marked for deletion. It has expired, been explicitly purged, or lost all confidence through decay. It remains only as a structural tombstone to prevent synchronization conflicts, before being completely expunged.

---

## 6. Extensible Metadata Rationale

The `Metadata` field exists as an architectural compromise between strict uniformity and domain-specific specialization. 

While the universal envelope guarantees that Aether's core engine can route and trace any memory, individual domains have unique structural requirements. For example:

* **Project Memory:** Needs to record deadlines, task dependencies, and repository coordinates.
* **Working Memory:** Needs to capture parent message IDs, conversation branch offsets, and transient system focus markers.
* **Self Model Memory:** Needs to capture resource allocation limits, runtime constraints, and local tool capabilities.

By storing these specialized attributes inside the `Metadata` envelope, domain-specific modules can execute high-fidelity operations without requiring changes to the core universal structure. The main cognitive engine remains completely insulated from domain complexity.

---

## 7. Future-Proof Design Compatibility

The Universal Memory Object is explicitly designed to support advanced cognitive capabilities without requiring structural refactoring:

* **Reasoning Sockets:** Pluggable AI logic can consume a Memory Object and construct a reasoning trace directly inside the object's `Evidence Log` or `Metadata`, documenting the logical steps taken to reach a conclusion.
* **Knowledge Graphs:** Nodes and directional edges can be established by storing arrays of target `Memory IDs` with relationship qualifiers inside the `Metadata` or `Tags` of related objects, forming a decentralized, highly flexible knowledge graph.
* **User Cognitive Modeling:** Advanced modeling engines can aggregate thousands of low-level "Candidate" and "Verified" memories, processing them into a highly synthesized "User Model Memory" that captures abstract planning and thinking styles, all using the same standard container.

---

## 8. Architectural Review & Governance

### Open Questions
1. **Evidence Log Limits:** For highly active, long-lived memories, the `Evidence Log` could grow indefinitely. How should we handle evidence pruning or summarization without violating the traceability mandate?
2. **Cryptographic Validation:** Should the `Memory ID` or a hash of the content be cryptographically signed by the user's sovereign Identity Bridge to guarantee no unauthorized external alterations have occurred?

### Future Dependencies
* **SEC-04-MEM (Memory Engine Schema):** Will define the physical database schema, indexing strategies, and read/write performance envelopes that implement this object.
* **SEC-03-EVT (Event Mesh Protocol):** Will define the serialization format (e.g., Protocol Buffers) used to transmit Memory Objects across the event bus.

---

* **Author:** Core Architecture Group / Chief Systems Architect
* **Version:** 0.1
* **Date:** July 2026
