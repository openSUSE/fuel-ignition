CONTAINER_USERID = $(shell id -u)

all:
	podman build --build-arg CONTAINER_USERID=$(CONTAINER_USERID) -t fuelignition .

