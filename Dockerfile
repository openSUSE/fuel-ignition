FROM registry.suse.com/bci/nodejs 
ARG CONTAINER_USERID

# Install our requirements
RUN zypper -n install --no-recommends mkisofs

# Add our user
RUN useradd -m -d /fuelignition fuelignition -u ${CONTAINER_USERID}

ADD . /fuelignition/
RUN chown -R fuelignition /fuelignition

USER fuelignition
WORKDIR /fuelignition

RUN npm install

# Run our command
CMD ["npm", "run", "dev"]
