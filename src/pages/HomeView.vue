<template>
  <!-- Masthead-->
  <header class="masthead">
    <div class="container px-4 px-lg-5 h-75">
      <div
        class="row gx-4 gx-lg-5 h-100 align-items-center justify-content-center text-center"
      >
        <div class="col-lg-8 align-self-end">
          <h1 class="text-white font-weight-bold">
            Combustion
            <br />Config Generator
          </h1>
          <hr class="divider" />
        </div>

        <div class="col-lg-8 align-self-baseline">
          <p class="text-white-75 mb-5">
            Easily generate new or edit existing Combustion config.
          </p>

          <div class="container-fluid">
            <div class="row">
              <div class="col-xs-6 mb-3">
                <router-link class="btn btn-primary btn-xl" to="/edit"
                  >Create New Config</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
