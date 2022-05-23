# Fuel Ignition
**Ignition & Combustion Config Generator.**
Easily generate new or edit existing Ignition configs.
No more fiddling around with JSON or Butane.

## Local Development

```bash
npm install
npm run dev
```

## Local Development in a container

```
$ sudo zypper in podman
$ make
$ podman run
$ podman run --network=host fuelignition:latest

> fuel-ignition@1.0 dev
> vite

Pre-bundling dependencies:
  vue
  @formkit/vue
  bootstrap
  vue-router
(this will be run only when your dependencies or config have changed)

  vite v2.6.14 dev server running at:

  > Local: http://localhost:3000/fuel-ignition/
  > Network: use `--host` to expose

  ready in 472ms.

$ firefox http://localhost:3000/fuel-ignition/
```

## Notice

- Fuel-ignition is still in early development and will most likely undergo massive changes.
- I'm always open to feedback and enjoy hearing your thoughts. Cheers!

- ![human sitting in a tent next to a fire](https://i.imgur.com/LzK3sOo.png)

