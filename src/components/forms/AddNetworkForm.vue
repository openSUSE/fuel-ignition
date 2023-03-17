<template>
  <FormKit
    :name="formKey('interface')"
    label="Interface Name"
    type="text"
    placeholder="e.g. eth0, wlan0,... "
    validation="required"
    validation-visibility="live"
    help=" "
  />

  <FormKit
    :name="formKey('ipv4_enabled')"
    label="IPv4 Network enabled"
    type="checkbox"
    validation-behavior="live"
    v-model="ipv4enabled"
  />

  <div v-if="ipv4enabled === true">
    <div class="container-fluid">
    <div class="row">
    <div class="col-1"></div>
    <div class="col-12">
    <FormKit
      type="select"
      :name="formKey('ipv4_network_type')"
      v-model="ipv4networkType"
      label="Network Address via"
      help="Select how the network address of the interface will be set/evaluated."
      :options="[
        'DHCP',
        'fixed IPv4 Address',
      ]"
    />

    <div v-if="ipv4networkType === 'fixed IPv4 Address'">
      <FormKit
        :name="formKey('ipv4_address')"
        label="IP Address"
        placeholder="___.___.___.___"
        type="text"
        :validation="[['required'],['matches', /^(([1-9]?\d|[12]\d\d)\.){3}([1-9]?\d|[12]\d\d)$/]]"
        :validation-messages="{
           matches: 'IP number must be in the format xxx.xxx.xxx.xxx',
        }"
        help="IPv4 address in the format xxx.xxx.xxx.xxx"
        validation-visibility="live"
      />
      <FormKit
        :name="formKey('ipv4_netmask')"
        label="Netmask"
        type="number"
        value="24"
        validation="between:0,32"
        validation-visibility="live"
        help="Values between 0 and 32"
      />
      <FormKit
        :name="formKey('ipv4_gateway')"
        label="Gateway"
        placeholder="___.___.___.___"
        type="text"
        :validation="[['matches', /^(([1-9]?\d|[12]\d\d)\.){3}([1-9]?\d|[12]\d\d)$/]]"
        :validation-messages="{
          matches: 'IP number must be in the format xxx.xxx.xxx.xxx',
        }"
        help="Gateway address in the format xxx.xxx.xxx.xxx"
        validation-visibility="live"
      />
    </div>

    <FormKit
      :name="formKey('ipv4_auto_dns')"
      label="Evaluate DNS servers via DHCP"
      type="checkbox"
      :value=true
      validation-behavior="live"
      help="DNS server settings are evalutated automatically."
    />
    <FormKit
      :name="formKey('ipv4_dns')"
      label="DNS servers"
      type="text"
      validation-behavior="live"
      help="Additional DNS servers separated by a semicolon (;)."
    />
  </div>
  </div>
  </div>
  </div>

  <FormKit
    :name="formKey('ipv6_enabled')"
    label="IPv6 Network enabled"
    type="checkbox"
    validation-behavior="live"
    v-model="ipv6enabled"
  />

  <div v-if="ipv6enabled === true">
    <div class="container-fluid">
    <div class="row">
    <div class="col-1"></div>
    <div class="col-12">
    <FormKit
      type="select"
      :name="formKey('ipv6_network_type')"
      v-model="ipv6networkType"
      label="Network Address via"
      help="Select how the network address of the interface will be set/evaluated."
      :options="[
        'DHCP',
        'fixed IPv6 Address',
      ]"
    />

    <div v-if="ipv6networkType === 'fixed IPv6 Address'">
      <FormKit
        :name="formKey('ipv6_address')"
        label="IP Address"
        placeholder="____:____:____:____:____:____:____:____"
        type="text"
        :validation="[['required'],['matches', /^[0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){7}$/]]"
        :validation-messages="{
           matches: 'IP number must be in the format ____:____:____:____:____:____:____:____',
        }"
        help="IPv6 address in the format ____:____:____:____:____:____:____:____"
        validation-visibility="live"
      />
      <FormKit
        :name="formKey('ipv6_netmask')"
        label="Netmask"
        type="number"
        value="64"
        validation="between:0,128"
        validation-visibility="live"
        help="Values between 0 and 128"
      />
      <FormKit
        :name="formKey('ipv6_gateway')"
        label="Gateway"
        placeholder="____:____:____:____:____:____:____:____"
        type="text"
        :validation="[['matches', /^[0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){7}$/]]"
        :validation-messages="{
           matches: 'IP number must be in the format ____:____:____:____:____:____:____:____',
        }"
        help="Gateway address in the format ____:____:____:____:____:____:____:____"
        validation-visibility="live"
      />
    </div>

    <FormKit
      :name="formKey('ipv6_auto_dns')"
      label="Evaluate DNS servers via DHCP"
      type="checkbox"
      :value=true
      validation-behavior="live"
      help="DNS server settings are evalutated automatically."
    />
    <FormKit
      :name="formKey('ipv6_dns')"
      label="DNS servers"
      type="text"
      validation-behavior="live"
      help="Additional DNS servers separated by a semicolon (;)."
    />
  </div>
  </div>
  </div>
  </div>

  <FormKit
    :name="formKey('wifi_enabled')"
    label="enable WiFi"
    type="checkbox"
    validation-behavior="live"
    v-model="wifienabled"
    help="Whether interface will be connected to WiFi."
  />

  <div v-if="wifienabled === true">
    <div class="container-fluid">
    <div class="row">
    <div class="col-1"></div>
    <div class="col-12">
    <FormKit
      :name="formKey('wifi_ssid_content')"
      label="SSID"
      type="text"
      placeholder="Service Set IDentifier (SSID)"
      validation="required"
      validation-behavior="live"
      help="Uniquely name of a wireless local area network (WLAN)."
    />
    <FormKit
      type="select"
      :name="formKey('key_mgmt')"
      v-model="keymgmt"
      label="Key Management"
      help="Key management used for the connection."
      :options="[
        'none',
        'WPA & WPA2 Personal',
        'WPA3 Personal'
      ]"
      value='none'
    />
    <div v-if="keymgmt !== 'none'">
      <FormKit
        :name="formKey('wifi_password_content')"
        label="Password"
        type="text"
        help="Password required for the WiFi connection."
      />
    </div>
  </div>
  </div>
  </div>
  </div>
</template>

<script>
import Utils from "../../utils/utils.js";
import { ref } from "vue";
const formPrefix = "add_network";

export default {
  setup: () => {
    const uid = Utils.uid();
    const ipv4networkType = ref("DHCP");
    const ipv6networkType = ref("DHCP");
    const wifienabled = ref(false);
    const ipv4enabled = ref(true);
    const ipv6enabled = ref(false);
    const keymgmt = ref("none");

    return {
      ipv4enabled,
      ipv4networkType,
      ipv6enabled,
      ipv6networkType,
      wifienabled,
      keymgmt,
      formKey: (key) => Utils.getFormKey(formPrefix, key, uid),
    };
  },

  methods: {
    encodeToIgn: function (json, formData) {
      const formValue = (key, uid) =>
        Utils.getFormValue(formPrefix, formData, key, uid);

      const b64EncodeUnicode = function (str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return window.btoa(
          encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
              return String.fromCharCode("0x" + p1);
            }
          )
        );
      };

      const keyPrefix = formPrefix + "_interface_";
      let counter = 0;
      Object.keys(formData)
        .filter((x) => x.includes(keyPrefix))
        .map((key) => key.replace(keyPrefix, ""))
        .forEach((id) => {
          if (json.storage === undefined) {
            json.storage = {};
          }

          if (json.storage.files === undefined) {
            json.storage.files = [];
          }

          let filename = "/etc/NetworkManager/system-connections/"
          let content = ""
          let fileObject = {}
	  const wifi_enabled = formValue("wifi_enabled", id)
          const ipv4_enabled = formValue("ipv4_enabled", id)
          const ipv4_auto_dns_enabled = formValue("ipv4_auto_dns", id)
          const ipv6_enabled = formValue("ipv6_enabled", id)
          const ipv6_auto_dns_enabled = formValue("ipv6_auto_dns", id)
	  const ipv4_dhcp_enabled = formValue("ipv4_network_type", id) === "DHCP"
	  const ipv6_dhcp_enabled = formValue("ipv6_network_type", id) === "DHCP"
	  const key_mgmt = formValue("key_mgmt", id)
	  const network_id = ( wifi_enabled === true ?
	                       formValue("wifi_ssid_content", id) :
			       formValue("interface", id) )

	  filename = filename.concat( network_id, ".nmconnection")
          content = content.concat( "\n[connection]", "\n",
                                    "id=", network_id, "\n",
				    "type=", ( wifi_enabled === true ? "wifi" : "ethernet" ), "\n",
	                            "interface-name=", formValue("interface", id), "\n" )

          content = content.concat( "\n[ipv4]", "\n",
                                    "dns-search=\n" )
	  if (ipv4_enabled === true) {
            content = content.concat( "method=", ( ipv4_dhcp_enabled === true ? "auto" : "manual" ), "\n" )

            if (ipv4_dhcp_enabled === false) {
              content = content.concat( "address1=", formValue("ipv4_address", id),  "/",
	                                formValue("ipv4_netmask", id) )
              if (formValue("ipv4_gateway", id) != null) {
                content = content.concat( ",", formValue("ipv4_gateway", id) )
	      }
              content = content.concat( "\n" )
            }
	    if (formValue("ipv4_dns", id)) {
	      content = content.concat( "dns=", formValue("ipv4_dns", id), "\n")
	    }
	    if (ipv4_auto_dns_enabled == false) {
	      content = content.concat( "ignore_auto_dns=true\n" )
	    }
          } else {
            content = content.concat( "method=disabled", "\n" )
          }

          content = content.concat( "\n[ipv6]", "\n",
                                    "dns-search=\n",
				    "addr-gen-mode=eui64\n" )
	  if (ipv6_enabled === true) {
            content = content.concat( "method=", ( ipv6_dhcp_enabled === true ? "auto" : "manual" ), "\n" )

            if (ipv6_dhcp_enabled === false) {
              content = content.concat( "address1=", formValue("ipv6_address", id),  "/",
	                                formValue("ipv6_netmask", id) )
              if (formValue("ipv6_gateway", id) != null) {
                content = content.concat( ",", formValue("ipv6_gateway", id) )
	      }
              content = content.concat( "\n" )
            }
	    if (formValue("ipv6_dns", id)) {
	      content = content.concat( "dns=", formValue("ipv6_dns", id), "\n")
	    }
	    if (ipv6_auto_dns_enabled == false) {
	      content = content.concat( "ignore_auto_dns=true\n" )
	    }
          } else {
            content = content.concat( "method=ignore", "\n" )
          }

          if (wifi_enabled === true) {
            content = content.concat( "\n[wifi]", "\n",
	                              "ssid=", formValue("wifi_ssid_content", id), "\n" )
            if (key_mgmt !== "none") {
              content = content.concat( "\n[wifi-security]", "\n",
                                        "key-mgmt=", ( key_mgmt === "WPA3 Personal" ? "sae" : "wpa-psk" ), "\n",
					"psk=", formValue("wifi_password_content", id), "\n" )
	    }
	  }

          // merging the two objects, in case verification was written to fileObject
          json.storage.files.push(
            Object.assign(
              {
                path: filename,
                mode: 384,
                overwrite: true,
                contents: {
                  source: "data:text/plain;charset=utf-8;base64," + b64EncodeUnicode(content),
		  human_read: content
                },
              },
              fileObject
            )
          );

          if (counter == 0 ) {
            content = "[main]\n# Do not do automatic (DHCP/SLAAC) configuration on ethernet devices\n" +
                      "# with no other matching connections.\nno-auto-default=*\n"
            json.storage.files.push(
              Object.assign(
                {
                  path: "/etc/NetworkManager/conf.d/noauto.conf",
                  mode: 420,
                  overwrite: true,
                  contents: {
                    source: "data:text/plain;charset=utf-8;base64," + b64EncodeUnicode(content),
                    human_read: content
                  },
                },
                fileObject
              )
	    )
	  }
	  counter++

        });
    },
  },
};
</script>
