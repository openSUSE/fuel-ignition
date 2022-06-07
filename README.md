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

## Local Development in Rancher-Desktop <img src="images/rancher_desktop.jpeg" width="75">

After cloning and cd'ing to the fuel-ignition directory, you will need to edit the Dockerfile to remove `-u ${CONTAINER_USERID}` from line 5 (FIXME?).

Add your own version tag as required, in this example v0.1 is used.

```
$ nerdctl --namespace k8s.io build -t fuelignition:v0.1 .
```

Once the build has completed, the image should appear in Rancher-Desktop -> Images;
<img src="images/rancher_desktop_images.png" width="450">

```
$ kubectl run --image fuelignition:v0.1 fuelignition
pod/fuelignition created

$ kubectl get pods
NAME           READY   STATUS    RESTARTS   AGE
fuelignition   1/1     Running   0          27s

$ kubectl port-forward pods/fuelignition 3000:3000 > /dev/null 2>&1 &

$ xdg-open http://localhost:3000/fuel-ignition/

```

Cleaning up

```
$ pkill -f "port-forward"
$ kubectl delete pod fuelignition
```
The created fuelignition image(s) can be deleted via Rancher-Desktop -> Images.

## Notice

Fuel-ignition is still in early development and will most likely undergo massive changes.
I'm always open to feedback and enjoy hearing your thoughts. Cheers!

![human sitting in a tent next to a fire](https://i.imgur.com/LzK3sOo.png)
