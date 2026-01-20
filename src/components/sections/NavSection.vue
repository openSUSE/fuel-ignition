<template>
  <!-- Navigation-->
  <nav class="navbar navbar-expand-lg navbar-light fixed-top py-3" id="mainNav">
    <div class="container px-4 px-lg-5">
      <router-link class="navbar-brand" to="/">Fuel Ignition 🚀</router-link>
      <button
        class="navbar-toggler navbar-toggler-right"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarResponsive"
        aria-controls="navbarResponsive"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarResponsive">
        <ul class="navbar-nav ms-auto my-2 my-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="#/">Start</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#about">About</a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="https://microos.opensuse.org/"
              target="_blank"
              rel="noopener noreferrer"
              >MicroOS</a
            >
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="https://github.com/openSUSE/combustion"
              target="_blank"
              rel="noopener noreferrer"
              >Combustion Docs</a
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
