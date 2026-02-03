## 2026-02-03 - [Counter Polling and Caching]
**Learning:** High-frequency polling (10s) in a global counter application can put significant load on the database. Using a short TTL (1s) in-memory cache on the server-side can reduce database reads by orders of magnitude during traffic spikes, even in serverless environments. Additionally, frontend visibility checks are a 'low-hanging fruit' for reducing unnecessary background network traffic.
**Action:** Always check for polling intervals and add visibility-aware logic. Implement instance-level caching for frequently read global state.
