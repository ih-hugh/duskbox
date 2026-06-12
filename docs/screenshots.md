# Duskbox screenshots

Real VS Code renders of every variant, captured from the local code-server lab with Playwright. The PNGs live in [`docs/img/shots/`](./img/shots/) and are collected here so the root README can stay focused.

Regenerate them with:

```sh
# terminal 1: build + package + install the local VSIX, serve on :8089
lab/up.sh

# terminal 2: capture the docs gallery from sample.tsx
cd lab
DUSKBOX_LAB_DOCS=1 npm run shoot
```

- Back to the [main README](../README.md)
- Screenshot tool: [`lab/up.sh`](../lab/up.sh) + [`lab/shoot.mjs`](../lab/shoot.mjs)

## Core variants

### dawn

![dawn](./img/shots/dawn.png)

### day

![day](./img/shots/day.png)

### day-hc

![day-hc](./img/shots/day-hc.png)

### storm

![storm](./img/shots/storm.png)

### dusk

![dusk](./img/shots/dusk.png)

### midnight

![midnight](./img/shots/midnight.png)

### night-hc

![night-hc](./img/shots/night-hc.png)

### cyber

![cyber](./img/shots/cyber.png)

## Signature variants

### dusk-azure

![dusk-azure](./img/shots/dusk-azure.png)

### dusk-neon-purple

![dusk-neon-purple](./img/shots/dusk-neon-purple.png)

### dusk-magenta

![dusk-magenta](./img/shots/dusk-magenta.png)

### dusk-salmon

![dusk-salmon](./img/shots/dusk-salmon.png)

### cyber-azure

![cyber-azure](./img/shots/cyber-azure.png)

### cyber-neon-purple

![cyber-neon-purple](./img/shots/cyber-neon-purple.png)

### cyber-magenta

![cyber-magenta](./img/shots/cyber-magenta.png)

### cyber-salmon

![cyber-salmon](./img/shots/cyber-salmon.png)
