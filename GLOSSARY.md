# Workout Timer

A personal iOS app that plays back a saved sequence of timed work and rest intervals.

## Language

**Template**:
A saved, named, ordered list of Exercise blocks and Rest blocks, played back one or more Rounds.
_Avoid_: Program, routine, workout

**Exercise block**:
One exercise in a Template (e.g. Squats), defined by a set count, set duration and set rest.
_Avoid_: Workout

**Set**:
One timed work interval within an Exercise block.
_Avoid_: Rep, repetition

**Set rest**:
The short break between Sets of the same Exercise block; one duration per Exercise block.

**Rest block**:
A standalone, user-placed long break in a Template, with its own duration.
_Avoid_: Exercise rest, long rest

**Round**:
One full pass through a Template's list; a Template repeats for its round count.
_Avoid_: Circuit, cycle

**Round rest**:
The break between Rounds, one duration per Template.

**Get-ready**:
The 15-second countdown before the first Set of a run.

**Interval**:
Any single timed segment during playback: a Get-ready, a Set, a Set rest, a Rest block or a Round rest.
_Avoid_: Segment, phase

**Cue**:
A spoken announcement or beep played at a set moment in an Interval.
