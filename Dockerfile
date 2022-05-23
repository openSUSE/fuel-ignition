FROM registry.opensuse.org/devel/bci/sle-15-sp3/images/bci/nodejs
ARG CONTAINER_USERID

# Install our requirements
RUN zypper -n install --no-recommends mkisofs

# Add our user
RUN useradd -m fuelignition  -u ${CONTAINER_USERID}
RUN mkdir /fuelignition
ADD . /fuelignition/
RUN chown -R fuelignition /fuelignition

USER fuelignition
WORKDIR /fuelignition

RUN npm install

# Run our command
CMD ["npm", "run", "dev"]
