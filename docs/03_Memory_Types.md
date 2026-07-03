# Aether Memory Specification: Core Memory Types

* **Status:** 🟡 DRAFT (v0.1)  
* **Subject:** Conceptual Classification of Core Memory Types  
* **Parent Specifications:** [04_Memory_Principles.md](04_Memory_Principles.md) (v1.0 Frozen), [02_Memory_Object.md](02_Memory_Object.md) (v1.0 Frozen)  

---

## 1. Architectural Definition and Taxonomy

In the Aether system architecture, a **Memory Type** is a conceptual classification that defines a distinct domain of semantic responsibility. Memory Types do not map directly to physical database schemas, storage classes, programming classes, or table structures; instead, they define logical boundaries of information behavior, authority, and reasoning utility.

By dividing Aether's memory space into independent, decoupled domains, we guarantee that the cognitive engine can apply specialized retrieval scoping, decay policies, security boundaries, and reasoning strategies without changing the underlying universal `Memory Object` envelope.

---

## 2. Core Memory Types

The first-generation Aether Memory Core (v1) supports eight conceptual Memory Types. Each type behaves as a specialized logical envelope of the universal `Memory Object`.

```
                        ┌─────────────────────────────────┐
                        │     UNIVERSAL MEMORY OBJECT     │
                        └────────────────┬────────────────┘
                                         │  (Inherited by)
         ┌──────────────┬────────────────┼──────────────┬──────────────┐
         ▼              ▼                ▼              ▼              ▼
  ┌────────────┐ ┌────────────┐   ┌────────────┐ ┌────────────┐ ┌────────────┐
  │  Identity  │ │ Preference │   │  Working   │ │ Reflection │ │ User Model │
  └────────────┘ └────────────┘   └────────────┘ └────────────┘ └────────────┘
         ▲              ▲                ▲              ▲              ▲
         │              │                │              │              │
         └──────────────┴──────┬─────────┴──────────────┴──────────────┘
                               │ (Also inherits)
                               ▼
                        ┌────────────┐ ┌────────────┐ ┌────────────┐
                        │  Project   │ │ Knowledge  │ │ Self Model │
                        └────────────┘ └────────────┘ └────────────┘
```

---

### 2.1. Identity Memory

#### Description & Purpose
Identity Memory stores explicit, permanent, and verified facts about the user. It represents the foundational anchor of the user's profile and situational environment.

* **Creator:** The User. Aether must never infer or guess Identity Memory fields.
* **Lifetime:** Permanent. It persists indefinitely across all sessions until explicitly modified or deleted by the user.
* **Update Policy:** Updated only upon explicit, direct input from the user.
* **Deletion Policy:** Purged only upon explicit user instruction.
* **Reasoning Usage:** Acts as a hard truth or terminal constraint. Reasoning engines can use Identity Memory to customize base environmental settings, localization protocols, and hard security scopes.
* **User Authority:** The user has absolute, final authority and full editability.
* **Aether Inference:** Strictly forbidden. Aether must never attempt to automatically deduce or suggest identity properties.
* **Examples:** Name, date of birth, spoken languages, physical country of residence, corporate affiliations.
* **Relationships:** 
  * *Supports* `User Model Memory` as the base factual layer.
  * *Part Of* high-level environmental `Context` markers in active sessions.

---

### 2.2. Preference Memory

#### Description & Purpose
Preference Memory stores long-term, relatively stable preferences governing tools, environment, styling, and system operational parameters.

* **Creator:** Created either explicitly by the user or proposed by Aether as a candidate inference.
* **Lifetime:** Persistent. Remains active until superseded, manually changed, or explicitly invalidated.
* **Update Policy:** Updated when the user explicitly changes a setting, or when Aether receives corroborating evidence of a behavioral shift, which triggers a candidate preference proposal.
* **Deletion Policy:** Deleted or archived when the preference is explicitly rejected or reverted.
* **Reasoning Usage:** Used by task planners and UI presentation engines to select preferred execution options (e.g., selecting an editor or adjusting display contrast) without prompting the user.
* **User Authority:** Fully inspectable, editable, and correctable by the user.
* **Aether Inference:** Highly encouraged, but inferences must first exist as `Candidate` status memories and present themselves for user confirmation or silent override.
* **Examples:** Preferred programming language, default terminal editor, UI color scheme preference, preferred communication density (concise vs. detailed).
* **Relationships:**
  * *Derived From* repeated observations in `Working Memory` and synthesis in `Reflection Memory`.
  * *Supports* task planning tasks stored in `Project Memory`.

---

### 2.3. Project Memory

#### Description & Purpose
Project Memory encompasses all structured specifications, architecture decisions, requirements, history, and active milestones of the user's software projects or workspace endeavors.

* **Creator:** Generated cooperatively by user actions, workspace changes, explicit planning sessions, and background system summaries.
* **Lifetime:** Retained for the active duration of the project. Once the project concludes, Project Memory is transitioned to the `Archived` status but is never deleted unless explicitly purged.
* **Update Policy:** Updated continuously as workspace files change, tasks are completed, or planning decisions are made.
* **Deletion Policy:** Retained in long-term storage; only deleted via explicit workspace purge commands.
* **Reasoning Usage:** Provides critical context for reasoning engines. Helps Aether understand code patterns, resolve technical constraints, track dependencies, and suggest architectural alignments.
* **User Authority:** User has full inspectability and control over architectural choices, milestones, and tracked requirements.
* **Aether Inference:** Aether can infer project metadata (e.g., repository layout, language distribution, active challenges) but must document these as corroborated inferences.
* **Examples:** Codebase architectural decisions, tracking issue statuses, coding style guidelines, repository paths, milestone deadlines.
* **Relationships:**
  * *Part Of* `Context` envelopes for active task planning.
  * *Related To* domain-specific technical concepts in `Knowledge Memory`.
  * *Supports* `Reflection Memory` on engineering outcomes.

---

### 2.4. Working Memory

#### Description & Purpose
Working Memory captures the highly transient, immediate conversational state, focus area, and active environmental context of the system.

* **Creator:** Generated automatically by interaction sequences, application execution states, and conversational exchanges.
* **Lifetime:** Highly transient. It decays rapidly and is designed to naturally expire or archive once the immediate task or session concludes.
* **Update Policy:** Updated continuously with every user message, tool execution, or system state change.
* **Deletion Policy:** Automatically archived or purged after the active session is closed or idle thresholds are exceeded.
* **Reasoning Usage:** Forms the primary immediate input state for reasoning loops, guiding conversation flow, local variable evaluation, and short-term error correction.
* **User Authority:** Inspectable by the user via conversation logs, but rarely edited directly since it represents a real-time event stream.
* **Aether Inference:** Heavily inferred from real-time environmental context and active task focus.
* **Examples:** Parent-child conversation thread pointers, last executed tool parameters, current active code block file path, current error message being solved.
* **Relationships:**
  * *Derived From* real-time user-terminal interaction events.
  * *Supports* creation of permanent memories via downstream `Reflection Memory` processes.

---

### 2.5. Reflection Memory

#### Description & Purpose
Reflection Memory captures synthesized, processed insights, lessons learned, and patterns observed over longer durations of project activity and collaboration.

* **Creator:** Generated by background analytical tasks (reflections) that process historical workspace data, completed tasks, and user feedback.
* **Lifetime:** Permanent but subject to confidence decay or archive if subsequent interaction contradicts the reflection.
* **Update Policy:** Updated during periodic workspace scanning or milestone reviews when new evidence corroborates or refines an existing reflection.
* **Deletion Policy:** Archived if superseded by more accurate or recent retrospectives.
* **Reasoning Usage:** Informs future planning, warning against repeating past errors, proposing verified architectures, and choosing optimized workflows based on historic success rates.
* **User Authority:** Fully transparent, editable, and rejectable by the user.
* **Aether Inference:** Purely inferred by Aether's background synthesis, but must always link to traces within the `Evidence` field.
* **Examples:** "The user prefers to resolve compiler errors before proceeding with styling updates," "Integrating third-party APIs typically requires an explicit server proxy check," "Project XYZ experienced major API route conflicts during Phase 1."
* **Relationships:**
  * *Derived From* groups of processed `Working Memory` and `Project Memory` events.
  * *Supports* the refinement of the `User Model Memory` and `Preference Memory`.

---

### 2.6. Knowledge Memory

#### Description & Purpose
Knowledge Memory stores objective, static, general-world, or domain-specific facts, rules, and documentation. It separates broad technical facts from user-specific context.

* **Creator:** Populated via system updates, external technical documentation indexes, local file imports, or explicitly saved developer guides.
* **Lifetime:** Indefinite. Persists until the underlying technology becomes obsolete or documentation is explicitly updated.
* **Update Policy:** Updated when newer documentation versions are downloaded, or when corrections are imported into the local environment.
* **Deletion Policy:** Only purged if the system domain changes and the knowledge becomes completely irrelevant.
* **Reasoning Usage:** Provides Aether's core reference library, ensuring code generation and architecture advice align with correct framework versions, library syntaxes, and API specs.
* **User Authority:** Read-only for base libraries, but users can add custom domain knowledge bases or override rules.
* **Aether Inference:** Aether does not infer world knowledge; it merely stores and indexes verified documentation.
* **Examples:** React 18 component lifecycle docs, Tailwind CSS class rules, SQLite syntax manuals, local project coding standards.
* **Relationships:**
  * *Related To* active programming tasks in `Project Memory`.
  * *Supports* validation checks conducted during code compilation.

---

### 2.7. User Model Memory

#### Description & Purpose
User Model Memory synthesizes an abstract, high-level, and evolving understanding of the user's cognitive patterns, strengths, weaknesses, planning styles, and communication preferences.

* **Creator:** Synthesized by background modules compiling long-term observations of the user.
* **Lifetime:** Indefinite, but highly dynamic and subject to ongoing evidence-based adjustments.
* **Update Policy:** Evaluated and updated periodically as recurring habits are established or modified.
* **Deletion Policy:** Fully editable and erasable by the user to respect privacy.
* **Reasoning Usage:** Used by Aether to tailor planning methodologies, structure explanations to match the user's technical level, adjust proactive suggestions, and match communication style.
* **User Authority:** Must remain entirely transparent, inspectable, and editable by the user. The user can veto any inferred trait.
* **Aether Inference:** Purely inferred by synthesis. Under Principle 3, Aether must never claim absolute certainty about these inferred characteristics; confidence must remain separate from truth.
* **Examples:** "The user prefers top-down structural planning before writing detail logic," "The user prefers deep technical explanations over high-level summaries," "The user is highly proficient in TypeScript but is learning Rust."
* **Relationships:**
  * *Derived From* multiple instances of `Preference Memory`, `Reflection Memory`, and `Working Memory`.
  * *Supports* personalized reasoning strategies throughout the entire system.

---

### 2.8. Self Model Memory

#### Description & Purpose
Self Model Memory contains the system's explicit knowledge regarding its own capabilities, installed tools, version boundaries, resource constraints, and active configuration.

* **Creator:** Automatically compiled and updated by the local runtime environment on initialization.
* **Lifetime:** Matches the active session lifecycle of the Aether platform instance.
* **Update Policy:** Dynamically updated as local system capabilities change, tools are registered, or resource limits are modified.
* **Deletion Policy:** System-critical; cannot be deleted, but is reinitialized on system reboot.
* **Reasoning Usage:** Prevents Aether from planning invalid executions or trying to use tools that do not exist in the current environment. Fulfills the requirement that the system must never invent capabilities.
* **User Authority:** Read-only for the user (except for direct system settings modifications that change configuration bounds).
* **Aether Inference:** None. Self Model Memory must be populated strictly with verified, deterministic facts about the local runtime.
* **Examples:** "Maximum token context limit is 128k," "Available tools include open-application and write-file," "Host OS is Linux x86_64," "Drizzle ORM is active."
* **Relationships:**
  * *Supports* validation of execution plans constructed by planning engines.
  * *Conflicts With* any tasks that exceed verified system limits.

---

## 3. Conceptual Flow and Interaction Matrix

Memory in Aether is not isolated; it flows dynamically between transient capture and long-term synthesis. The following diagram illustrates how these conceptual categories interact over time:

```
                  ┌─────────────────────────────────────┐
                  │      Interaction Event Stream       │
                  └──────────────────┬──────────────────┘
                                     │ (Raw event ingestion)
                                     ▼
                        ┌─────────────────────────┐
                        │     Working Memory      │ (Highly Transient)
                        └────────────┬────────────┘
                                     │ (Aggregation & Synthesis)
                                     ▼
                        ┌─────────────────────────┐
                        │    Reflection Memory    │ (Observed lessons & patterns)
                        └──────┬──────────┬───────┘
                               │          │
         ┌─────────────────────┘          └─────────────────────┐
         ▼ (Workspace Specific)                                 ▼ (User Specific)
  ┌───────────────┐                                      ┌───────────────┐
  │Project Memory │                                      │Preference Mem │
  └───────────────┘                                      └───────┬───────┘
                                                                 │ (Long-term synthesis)
                                                                 ▼
                                                         ┌───────────────┐
                                                         │  User Model   │
                                                         └───────────────┘
```

1. **Transient Capture:** As the user interacts with the workspace, raw events populate `Working Memory`, establishing the immediate conversational and task state.
2. **First-Level Reflection:** Background processes analyze the logs within `Working Memory` to generate `Reflection Memories` (e.g., identifying a repeated compilation error pattern or a preferred structure).
3. **Workspace Anchoring:** Reflections that relate to technical specifications, directories, or architectural rules are merged into `Project Memory` to guide future coding tasks in that workspace.
4. **User Alignment:** Reflections that relate to personal communication styles, habits, or environmental preferences are compiled into `Preference Memory`.
5. **High-Level Synthesis:** Evolving preferences and workspace habits are synthesized over long periods into the comprehensive `User Model Memory`, establishing Aether's master personalization layer.

---

## 4. Architecture Decisions & Rationale

* **Decoupled User Identity vs. User Model:** We intentionally split explicit identity data (`Identity Memory`) from inferred cognitive profiles (`User Model Memory`). This creates a hard security and architectural wall: identity is strict, immutable, and user-asserted, whereas the cognitive profile is synthesized, fluid, and trace-backed.
* **System Capabilities Isolation:** `Self Model Memory` is established as an explicit memory category to ground Aether's planning. By treating its own constraints as a formal memory type, the planning engine can query its own capabilities using the exact same protocols used to query the external workspace.
* **No Unified "User Data" Table:** Traditional database models merge preferences, names, and history into a single "User Profile" record. In Aether, we completely reject this pattern. By storing these as independent, decoupled memory types inside the universal `Memory Object` envelope, we prevent cross-domain contamination and allow distinct, domain-specific security, encryption, and sync rules to apply to each type.

---

## 5. Open Questions

The following areas are deferred to future research and development phases:

1. **Cross-Domain Verification:** If a fact in `Knowledge Memory` (e.g., a library documentation page) conflicts with a preference in `Preference Memory` (e.g., the user insists on using an obsolete syntax), how does the planning engine resolve the contradiction?
2. **Inference Veto Mechanics:** What is the conversational protocol for presenting inferred `User Model` or `Preference` candidates to the user for explicit approval without creating user-interface fatigue?
3. **Episodic Forgetting Rate:** Does `Working Memory` naturally decay based on chronological time, task completion transitions, or conversation turn density?

---

## 6. Future Dependencies

* **SEC-04-MEM (Memory Engine Schema):** Must implement performance indexing optimized for partitioned domain routing based on the eight categories defined here.
* **SEC-07-PLN (Planner Task Graphs):** Will define how the active planning engine references `Self Model Memory` and `Project Memory` to construct deterministic execution paths.

---

* **Author:** Core Architecture Group / Chief Systems Architect
* **Version:** 0.1
* **Date:** July 2026
