---
title: "Intenta - the missing contract for consumer brain apps"
slug: "intenta-the-missing-contract-for-consumer-brain-apps"
date: "2026-02-26"
tags: ["neurolect","neurotech","bci","ai","cs","programming languages","real-time","safety","cybernetics","dsl"]
type: "essay"
status: "published"
excerpt: "Intenta treats consumer BCI software as a contract problem: typed uncertainty, explicit time semantics, capability-guarded effects, strict budgets, and deterministic replay."
---

BCI software today still feels like research glue. You wire together signal streams, filters, decoders, and UI actions, then you pray the whole thing behaves the same across devices, sessions, and jittery timing. It rarely does. The failure modes are not subtle: apps couple to raw channels, effects get triggered from uncertain estimates, time gets treated as incidental, and the pipeline becomes impossible to reproduce deterministically for debugging and safety validation.

Intenta is my attempt to treat that as an engineering problem, not a vibes problem. It is a brain-app language plus a runtime contract built around a few invariants that I refuse to compromise on: typed uncertainty, explicit time semantics, capability-guarded effects, strict budgets, and deterministic record-replay.

## Why a brain-app language at all

Consumer BCI needs an ecosystem. Ecosystems need portability. Portability collapses the moment apps bind to electrode layouts, sampling quirks, vendor preprocessing, or whatever custom feature vector was convenient last month. That is why Intenta anchors apps to versioned schemas in an intent and feature plane, while decoders remain swappable artifacts behind a stable boundary.

There is also a harder truth: closed-loop systems that act on neural estimates are safety systems. If an app can trigger UI control, haptics, speech, device commands, or anything stronger, then confidence gating cannot be optional style. It has to be structurally hard to omit and enforced at runtime.

## The foundations already exist, just not applied end-to-end

Intenta borrows from well-established traditions in reactive and real-time programming.

Synchronous languages like Lustre and Esterel were built around the idea that time advances in discrete instants and programs react deterministically, which makes static analysis and verification feasible. This is exactly the mental model I want for brain apps: discrete logical instants, explicit clocks, explicit present vs absent semantics, no hidden dependence on wall-clock accidents.

On the neuroscience side, tooling like Lab Streaming Layer (LSL) exists because multimodal systems are fundamentally about timestamps, synchronization, and jitter handling across devices. Intenta takes the same stance, but pushes it into language semantics instead of leaving it to ad hoc pipeline code.

On the security side, capability-based thinking exists because ambient authority creates repeatable failures. If a brain app can emit an effect, it should do so only through explicit capabilities, under explicit constraints, with auditing by default.

## What Intenta actually commits to

The spec draft breaks the system into layers so the app language does not get polluted by device specifics or decoder implementation details.

### Layer 0 - Neurolect HAL

Audited primitives only: read timestamped samples, write capability-guarded effects.

### Layer 1 - Intent and feature schemas

Versioned schemas for intents and features, including timing and confidence semantics. Apps bind to schemas, not vendor-specific channels.

### Layer 2 - NDS (decoder spec)

Declarative, pure pipelines that output schema-typed estimates, with adaptation only through explicit policy hooks.

### Layer 3 - Intenta Core

Reactive logic with deterministic state machines, stream and event operators, and specified time semantics.

### Layer 4 - Manifest

Capabilities, budgets, schema dependencies, logging requirements, replay requirements, and supervisor policies.

Everything above runtime internals (multi-app composition, topology, scheduling) is allowed to evolve, but only behind a minimal interface contract: streams, effects, capability authority, recorder, supervisor. If those are correct, the rest stays correct.

## The kernel idea - treat time and uncertainty as types, not comments

Uncertainty is not some float you hope people check. Intenta uses typed estimates:

- `Estimate<T>` carries value, confidence, uncertainty, latency, and provenance.

Time is not whatever the event loop happens to do. Streams and events are associated with clocks, jitter bounds, and clock domains. Clock mismatch is resolved explicitly by operators like `align` or `resample`.

This matches the best reactive systems: the synchronous model divides computation into discrete instants and makes behavior deterministic by construction. I am applying that discipline to messy neural estimates and consumer hardware.

## Effects are controlled authority

The only place you can do side effects in Intenta is effect sinks, and every sink must be backed by declared capabilities and runtime constraints.

The goal is simple: an app should not accidentally turn low-confidence intent noise into high-impact actions without making that decision explicit in code and in the manifest.

This is the same philosophical fix capability systems bring to OS design: authority is explicit and unforgeable, not ambient and implicit.

## Deterministic record-replay is the credibility line

Neuro apps without deterministic replay are basically untestable. If I cannot replay a session and get the same state transitions and emitted effects under a pinned runtime, then I cannot do regression testing, safety validation, or serious debugging.

Record-replay is not theoretical luxury. It is practical engineering discipline.

## A tiny Intenta-flavored sketch

```txt
bapp CursorLite v0.1
capabilities { ui.pointer }
budget { tick 100hz, cpu 8ms }

inputs {
  motor: Stream<Estimate<Vec2>> @100hz
}

flow {
  motor_ok = motor.filter(m => m.confidence >= 0.72)
  dv = motor_ok.map(m => m.value).lowpass(alpha=0.18)
}

effects {
  every 100hz {
    let v = dv.latest()
    emit ui.pointer.move(v.x, v.y)
  }
}
```

This is not about syntax aesthetics. It is enforceable structure: declare authority, declare budget, consume typed estimates, gate on confidence, emit effects only through explicit sinks.

## What is actually innovative here

The novelty is not streams, events, or reactive code by themselves. The novelty is treating non-negotiable invariants as language contract plus runtime contract:

- first-class clocks, jitter, and latency semantics
- typed uncertainty acknowledged before effects
- capability-guarded outputs with budgets and supervision
- deterministic replay as baseline workflow
- decoders declared, versioned, and logged behind stable schemas

That combination is what can move brain software from fragile pipeline to platform.

## What comes next

The hard part is now execution: lock the first real schemas, minimal operator set, manifest rules, and replay harness so a small set of BApps can ship safely.

If Intenta succeeds, brain apps stop being brittle signal scripts and start looking like normal software that consumes uncertain, time-bound estimates with explicit safety and reproducibility guarantees.
