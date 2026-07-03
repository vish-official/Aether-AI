# Aether Memory Specification: The Universal Memory Object

* **Status:** 🟡 DRAFT (v0.2)  
* **Subject:** The Universal Memory Object Conceptual Schema  
* **Parent Specification:** [04_Memory_Principles.md](04_Memory_Principles.md)  

---

## 1. Architectural Definition

### What is a Memory Object?
A **Memory Object** is the fundamental, independent unit of data retention within Aether. It serves as a technology-independent container that binds together retained information, context, origin, evidence, confidence, and relationships.

Every type of memory within Aether—including user profiles, specific preferences, project specifications, ongoing conversational context, logical reflections, domain knowledge, and system parameters—must conform to this universal structure.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNIVERSAL MEMORY OBJECT                         │
├────────────────────────────────────────────────────────────────────────┤
│  [Identity Boundary]                                                   │
│   ├── Memory ID (Permanent, unique, immutable, traceable)              │
│   └── Memory Domain (Primary functional classification)                │
├────────────────────────────────────────────────────────────────────────┤
│  [Core Payload]                                                        │
│   └── Content (The semantic payload)                                   │
├────────────────────────────────────────────────────────────────────────┤
│  [Traceability & Evidence]                                             │
│   ├── Source (Originating entity or mechanism)                         │
│   ├── Evidence (References to supporting events or data)               │
│   └── Confidence (Quantified certainty based on evidence)              │
├────────────────────────────────────────────────────────────────────────┤
│  [Context Envelope]                                                    │
│   └── Context (Temporal, environmental, and situational markers)       │
├────────────────────────────────────────────────────────────────────────┤
│  [Relational Matrix]                                                   │
│   └── Relationships (Typed, directed connections to other memories)    │
├────────────────────────────────────────────────────────────────────────┤
│  [Lifecycle & Metadata]                                                │
│   ├── Status (Operational lifecycle state)                             │
│   ├── Created At / Updated At (Timestamps)                             │
│   └── Metadata (Schema space reserved for domain extensions)           │
└────────────────────────────────────────────────────────────────────────┘
```

### Why Every Memory Shares One Structure
Designing a single, universal structure for all memory types delivers significant architectural advantages:

1. **Unified Processing Contracts:** Downstream systems—such as reasoning engines, planners, and task execution modules—can consume and evaluate any memory using a single contract. Subsystems do not need custom parsers for different categories of memory.
2. **Standardized Lineage and Audits:** By requiring core traceability fields (ID, Source, Evidence, and Timestamps) at the base level, the system ensures that every memory remains fully auditable. The platform can programmatically construct the origin and evolutionary path of any record.
3. **Decoupled Storage layer:** The storage layer can index, partition, sync, and cache memories without inspecting or understanding domain-specific properties.
4. **Composition and Evolution:** Advanced modules can combine, merge, or split memories of different domains because they share a common transactional interface.

---

## 2. Universal Fields Specification

The following fields define the core conceptual structure of every Memory Object. This specification is abstract, ensuring compatibility with any underlying persistence or transmission technology.

### 2.1. Identifier and Classification

#### Field 1: Memory ID
* **Name:** `Memory ID`
* **Purpose:** Uniquely identifies this specific Memory Object.
* **Reason:** Ensures references, updates, and relationship mappings pointing to this memory remain stable and correct.
* **Required:** Yes
* **Notes:** Must be permanent, globally unique, immutable, and traceable. The format of the identifier is unspecified, but it must be resolvable across distributed local environments.

#### Field 2: Memory Domain
* **Name:** `Memory Domain`
* **Purpose:** Classifies the memory within a primary behavioral or functional category.
* **Reason:** Allows retrieval engines to scope queries and apply domain-specific security or operational rules.
* **Required:** Yes
* **Notes:** Constrained to known domains including *Identity, Preferences, Projects, Working Memory, Reflections, Knowledge, User Model, and Self Model*.

---

### 2.2. Content and Payload

#### Field 3: Content
* **Name:** `Content`
* **Purpose:** Holds the actual core data or experience being retained.
* **Reason:** This is the primary payload needed for reasoning, execution, or presentation.
* **Required:** Yes
* **Notes:** Content representation must be flexible enough to accommodate various structured data forms, but remains conceptually agnostic at this architectural layer.

---

### 2.3. Context, Origin, and Relationships

#### Field 4: Context
* **Name:** `Context`
* **Purpose:** Captures the situational coordinates when the memory was acquired or created.
* **Reason:** Prevents memories from being evaluated out-of-context, which leads to incorrect reasoning.
* **Required:** Yes
* **Notes:** Conceptually records temporal markers, active tasks, related users, and system environment details active during creation.

#### Field 5: Source
* **Name:** `Source`
* **Purpose:** Documents the actor or system mechanism that generated the memory.
* **Reason:** Guarantees that the origin of any retained item can be determined during audits.
* **Required:** Yes
* **Notes:** Must represent a clear category of origin (e.g., explicit user input, system observation, third-party synchronization).

#### Field 6: Evidence
* **Name:** `Evidence`
* **Purpose:** Lists references to supporting records, events, or user interactions that corroborate this memory.
* **Reason:** Fulfills the requirement that memory must have evidence. Prevents unverified assumptions from propagating unchecked.
* **Required:** Yes (can be empty if the memory is an explicit, self-evident user statement)
* **Notes:** For inferred memories, this field must contain links to the specific, discrete observations or interaction events that triggered the inference.

#### Field 7: Relationships
* **Name:** `Relationships`
* **Purpose:** Defines conceptual directed connections to other Memory Objects.
* **Reason:** Allows memories to form logical associations, hierarchical structures, and dependency graphs.
* **Required:** Yes (can be empty)
* **Notes:** Must support typed relationships including *Derived From, Related To, Part Of, Supports, and Conflicts With*.

---

### 2.4. Reliability and Lifecycle

#### Field 8: Confidence
* **Name:** `Confidence`
* **Purpose:** Represents the degree of certainty regarding the accuracy or continuing relevance of the memory.
* **Reason:** Allows execution systems to assess risks when acting on potentially outdated or inferred information.
* **Required:** Yes
* **Notes:** Confidence must always be supported by evidence and is never proof of absolute truth. Highly confident memories may still be wrong.

#### Field 9: Status
* **Name:** `Status`
* **Purpose:** Reflects the current operational state of the memory in the active system.
* **Reason:** Controls whether the memory is active, pending review, archived, or marked for deletion.
* **Required:** Yes
* **Notes:** The basic statuses are limited to core operational states. Lifecycle policies and transition logic are managed separately.

#### Field 10: Created At
* **Name:** `Created At`
* **Purpose:** Records the timestamp when the Memory Object was first generated.
* **Reason:** Crucial for chronology, historical auditing, and time-based query ordering.
* **Required:** Yes
* **Notes:** Immutable once written.

#### Field 11: Updated At
* **Name:** `Updated At`
* **Purpose:** Records the timestamp when any property of the Memory Object was modified.
* **Reason:** Essential for managing concurrent writes, data synchronization, and conflicts across systems.
* **Required:** Yes
* **Notes:** Must be updated atomically on every write operation.

---

### 2.5. Extensions

#### Field 12: Tags
* **Name:** `Tags`
* **Purpose:** Flat semantic qualifiers used for categorization.
* **Reason:** Enables fast, cross-domain grouping and discovery.
* **Required:** No (defaults to empty)
* **Notes:** Abstract, non-hierarchical categorization labels.

#### Field 13: Metadata
* **Name:** `Metadata`
* **Purpose:** Provides a dedicated space for domain-specific schemas.
* **Reason:** Allows specialized memory domains to store custom properties without modifying the universal parent contract.
* **Required:** No (defaults to empty)
* **Notes:** Must never be used to replace or override core universal fields. Standard fields like ID, Status, Source, and Confidence must reside in their respective fields, never within the Metadata object.

---

## 3. Memory Status Model

To focus the Memory Object definition, we define only the conceptual statuses necessary to determine active query boundaries. Transition rules and lifecycle policies are decoupled from this specification:

* **Active:** The memory is verified, relevant, and fully available for reasoning and execution.
* **Pending:** The memory is a candidate state (e.g., an uncorroborated inference or a draft awaiting review). It has restricted usage boundaries.
* **Archived:** The memory is retained for history or trace auditing, but is excluded from active, default retrieval pools.
* **Invalided:** The memory is explicitly flagged as incorrect or rejected, serving as a negative constraint.

---

## 4. Relationship Semantics

The `Relationships` field defines directed links between memory objects. This allows Aether to represent structural hierarchies and logical derivations:

* **Derived From:** Indicates that memory B was generated by processing or summarizing memory A. Maintains traceability across synthesis cycles.
* **Related To:** Establishes an associative, non-hierarchical connection between two memories.
* **Part Of:** Defines structural containment (e.g., a specific project task memory is part of a larger project memory).
* **Supports:** Denotes a logical connection where memory A acts as reinforcing evidence for memory B.
* **Conflicts With:** Explicitly marks two memories that represent contradictory information, prompting resolution mechanisms.

---

## 5. Future Compatibility

To remain durable over multiple years of evolution, any physical storage implementation of the Memory Object must preserve these qualitative behaviors:

1. **Format Agnosticism:** The core schema must not depend on database-specific data types (such as custom spatial or document types).
2. **Schema Extensibility:** Adding new fields inside `Metadata` or adding new relationship types must not break backwards compatibility for existing query modules.
3. **Trace Preservation:** When memory objects undergo synthesis (merges or splits), the original lineage must be preserved in the `Relationships` or `Evidence` metadata of the resulting objects.

---

## 6. Open Questions

The following topics are deferred to future specialized specifications:

1. **Relationship Semantics:** How are complex relationships queried, traversed, and validated across large cognitive networks?
2. **Confidence Models:** What mathematical frameworks or heuristics govern how confidence is calculated, updated, and decayed based on incoming evidence?
3. **Lifecycle and Sync Policies:** How are memories synchronized across distributed user terminals, and what replication rules apply to resolving conflicts?
4. **Memory Merge & Split:** What are the precise transactional boundaries and rules when two related candidate memories merge into a single verified memory, or when a memory is split?

---

* **Author:** Core Architecture Group / Chief Systems Architect
* **Version:** 0.2
* **Date:** July 2026
