# Fuel Ignition

Ignition & Combustion Config Generator.

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
