# Test Plan

Before release, cover Auth, all roles, Profile/Vizion ID, Activity, Moment, Map visibility/clustering, Cheer, Comment, Connection lifecycle, Schedule, Business discovery, payment webhook/order/inventory, RLS, CSRF, rate limits, and upload security.

For each mutable operation test unauthenticated, wrong role, non-owner, owner, Admin, malformed input, replay/duplicate, and failure recovery. Payment tests include valid/invalid HMAC, duplicate delivery, delayed webhook, exhausted inventory, and reconciliation. Map tests include private/exact-location leakage and empty/cluster states. Current repository documentation says no general test suite; add targeted tests with each P0 implementation.
