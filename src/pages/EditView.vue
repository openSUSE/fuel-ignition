<script setup>
import { ref, watch } from "vue";
import Utils from "@/utils/utils.js";
import ExpandableComponent from "@/components/ExpandableComponent.vue";

import IgnitionUsersForm from "@/components/forms/IgnitionUsersForm.vue";
import CreateFileForm from "@/components/forms/CreateFileForm.vue";
import ServicesForm from "@/components/forms/AddServiceForm.vue";

const formComponents = [IgnitionUsersForm, CreateFileForm, ServicesForm];

const formData = ref({ debug: true });

// setup optional Watchers if a FormComponent needs it
formComponents.forEach((comp) =>
  Utils.setupFormComponentWatcher(comp, watch, formData)
);

const downloadConfigIgn = () => {
  Utils.saveTemplateAsFile("config.ign", toIgnitionConfig(formData));
};

const toIgnitionConfig = (formData) => {
  let json = {
    ignition: { version: "3.2.0" },
  };

  formComponents
    .filter((comp) => comp.methods.hasOwnProperty("encodeToIgn"))
    .forEach((comp) => comp.methods.encodeToIgn(json, formData));

  if (formData.debug) {
    json["debug:form"] = formData;
  }

  return json;
};
</script>

<template>
  <!-- Masthead-->
  <header class="masthead">
    <div class="">
      <div class="container px-4 px-lg-">
        <div class="row gx-4 gx-lg-5 justify-content-center">
          <div class="col-lg-8 col-xl-6 text-white text-center">
            <h2 class="mt-0">Ignition Config Generator</h2>
            <hr class="divider" />
            <p class="mb-5">
              Ready to start your next project with us? Send us a messages and
              we will get back to you as soon as possible!
            </p>
          </div>
        </div>
        <div class="row gx-4 gx-lg-5 justify-content-center mb-5">
          <div class="col-lg-6">
            <form id="contactForm" data-sb-form-api-token="API_TOKEN">
              <!-- Name input-->
              <div class="form-floating mb-3">
                <input
                  class="form-control"
                  id="name"
                  type="text"
                  placeholder="Enter your name..."
                  data-sb-validations="required"
                />
                <label for="name">Full name</label>
                <div class="invalid-feedback" data-sb-feedback="name:required">
                  A name is required.
                </div>
              </div>
              <!-- Email address input-->
              <div class="form-floating mb-3">
                <input
                  class="form-control"
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  data-sb-validations="required,email"
                />
                <label for="email">Email address</label>
                <div class="invalid-feedback" data-sb-feedback="email:required">
                  An email is required.
                </div>
                <div class="invalid-feedback" data-sb-feedback="email:email">
                  Email is not valid.
                </div>
              </div>
              <!-- Phone number input-->
              <div class="form-floating mb-3">
                <input
                  class="form-control"
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  data-sb-validations="required"
                />
                <label for="phone">Phone number</label>
                <div class="invalid-feedback" data-sb-feedback="phone:required">
                  A phone number is required.
                </div>
              </div>
              <!-- Message input-->
              <div class="form-floating mb-3">
                <textarea
                  class="form-control"
                  id="message"
                  type="text"
                  placeholder="Enter your message here..."
                  style="height: 10rem"
                  data-sb-validations="required"
                ></textarea>
                <label for="message">Message</label>
                <div
                  class="invalid-feedback"
                  data-sb-feedback="message:required"
                >
                  A message is required.
                </div>
              </div>
              <!-- Submit success message-->
              <!---->
              <!-- This is what your users will see when the form-->
              <!-- has successfully submitted-->
              <div class="d-none" id="submitSuccessMessage">
                <div class="text-center mb-3">
                  <div class="fw-bolder">Form submission successful!</div>
                  To activate this form, sign up at
                  <br />
                  <a href="https://startbootstrap.com/solution/contact-forms"
                    >https://startbootstrap.com/solution/contact-forms</a
                  >
                </div>
              </div>
              <!-- Submit error message-->
              <!---->
              <!-- This is what your users will see when there is-->
              <!-- an error submitting the form-->
              <div class="d-none" id="submitErrorMessage">
                <div class="text-center text-danger mb-3">
                  Error sending message!
                </div>
              </div>
              <!-- Submit Button-->
              <div class="d-grid">
                <button
                  class="btn btn-primary btn-xl disabled"
                  id="submitButton"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </header>

  <section class="page-section" id="contact">
    <div class="container px-4 px-lg-5">
      <div class="row gx-4 gx-lg-5 justify-content-center">
        <div class="col-lg-8 col-xl-6 text-center">
          <h2 class="mt-0">Let's Get In Touch!</h2>
          <hr class="divider" />
          <p class="text-muted mb-5">
            Ready to start your next project with us? Send us a messages and we
            will get back to you as soon as possible!
          </p>
        </div>
      </div>
      <div class="row gx-4 gx-lg-5 justify-content-center mb-5">
        <div class="col-lg-6">
          <!-- * * * * * * * * * * * * * * *-->
          <!-- * * SB Forms Contact Form * *-->
          <!-- * * * * * * * * * * * * * * *-->
          <!-- This form is pre-integrated with SB Forms.-->
          <!-- To make this form functional, sign up at-->
          <!-- https://startbootstrap.com/solution/contact-forms-->
          <!-- to get an API token!-->
          <form id="contactForm" data-sb-form-api-token="API_TOKEN">
            <!-- Name input-->
            <div class="form-floating mb-3">
              <input
                class="form-control"
                id="name"
                type="text"
                placeholder="Enter your name..."
                data-sb-validations="required"
              />
              <label for="name">Full name</label>
              <div class="invalid-feedback" data-sb-feedback="name:required">
                A name is required.
              </div>
            </div>
            <!-- Email address input-->
            <div class="form-floating mb-3">
              <input
                class="form-control"
                id="email"
                type="email"
                placeholder="name@example.com"
                data-sb-validations="required,email"
              />
              <label for="email">Email address</label>
              <div class="invalid-feedback" data-sb-feedback="email:required">
                An email is required.
              </div>
              <div class="invalid-feedback" data-sb-feedback="email:email">
                Email is not valid.
              </div>
            </div>
            <!-- Phone number input-->
            <div class="form-floating mb-3">
              <input
                class="form-control"
                id="phone"
                type="tel"
                placeholder="(123) 456-7890"
                data-sb-validations="required"
              />
              <label for="phone">Phone number</label>
              <div class="invalid-feedback" data-sb-feedback="phone:required">
                A phone number is required.
              </div>
            </div>
            <!-- Message input-->
            <div class="form-floating mb-3">
              <textarea
                class="form-control"
                id="message"
                type="text"
                placeholder="Enter your message here..."
                style="height: 10rem"
                data-sb-validations="required"
              ></textarea>
              <label for="message">Message</label>
              <div class="invalid-feedback" data-sb-feedback="message:required">
                A message is required.
              </div>
            </div>
            <!-- Submit success message-->
            <!---->
            <!-- This is what your users will see when the form-->
            <!-- has successfully submitted-->
            <div class="d-none" id="submitSuccessMessage">
              <div class="text-center mb-3">
                <div class="fw-bolder">Form submission successful!</div>
                To activate this form, sign up at
                <br />
                <a href="https://startbootstrap.com/solution/contact-forms"
                  >https://startbootstrap.com/solution/contact-forms</a
                >
              </div>
            </div>
            <!-- Submit error message-->
            <!---->
            <!-- This is what your users will see when there is-->
            <!-- an error submitting the form-->
            <div class="d-none" id="submitErrorMessage">
              <div class="text-center text-danger mb-3">
                Error sending message!
              </div>
            </div>
            <!-- Submit Button-->
            <div class="d-grid">
              <button
                class="btn btn-primary btn-xl disabled"
                id="submitButton"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>

  <div class="container-fluid">
    <div class="justify-content-center mx-auto center">
      <h1>Ignition Config Generator</h1>

      <FormKit type="group" v-model="formData">
        <ExpandableComponent title="OS Users" :displayAtLeastOne="false">
          <IgnitionUsersForm></IgnitionUsersForm>
        </ExpandableComponent>

        <ExpandableComponent
          title="Create Files on the Root Filesystem"
          :displayAtLeastOne="false"
        >
          <CreateFileForm></CreateFileForm>
        </ExpandableComponent>

        <FormKit
          name="likes_microOS"
          label="Opinion"
          help="How excited are you about MicroOS?"
          type="radio"
          value="A lot"
          :options="['A little', 'A lot']"
        />
      </FormKit>

      <section>
        <h2>config.ign</h2>
        <pre class="form-data">{{ toIgnitionConfig(formData) }}</pre>

        <button class="btn btn-primary mb-4" @click="downloadConfigIgn">
          Download
        </button>

        <FormKit
          v-model="formData.debug"
          type="checkbox"
          label="Debug"
          name="debug"
        />
      </section>

      <h2 class="mt-4">Convert to ISO</h2>

      <pre class="form-data">
# mkisofs -o ignition.iso -V ignition config.ign</pre
      >
    </div>
  </div>
</template>
