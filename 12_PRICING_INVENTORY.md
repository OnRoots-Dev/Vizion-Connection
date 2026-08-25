# Pricing & Inventory

## Current production vocabulary
Plan IDs: `roots`, `signal`, `presence`, `legacy`. The current constants define catalog prices of ¥30,000 / ¥100,000 / ¥300,000 / individual quote respectively, with campaign language and seat estimates. fileciteturn23file0L2-L6

## Inventory truth
Runtime sellability and remaining stock are determined by `ad_slots.total - sold`, not marketing copy or seat estimates. `ad_slots` is unique by prefecture + tier and stores sold/total counts. fileciteturn15file0L2-L6

## Geographic model
Current Business constants use six regional blocks for Business UI, while `ad_slots` can store a prefecture or `全国`. These are distinct concepts and must not be conflated. fileciteturn23file0L2-L6

## Pricing status
- Current: repository plan constants and Square links.
- Current/Operational: ad slot inventory.
- Planned: any new 47-prefecture × tier commercial inventory must be reconciled with production `ad_slots` before implementation.
- Undecided: final 2026 campaign/discount rules not represented in production constants.

## Rule
Never hard-code remaining inventory from a sales document. Query production inventory for availability.
