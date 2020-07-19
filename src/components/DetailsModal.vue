<template>
  <div class="modal" :class="{ 'is-active': shown }">
    <div class="modal-background" @click="$emit('close')" />
    <div class="modal-content">
      <div class="notification is-info is-light">
        <button class="delete" @click="$emit('close')" />

        <h5 class="title is-5">
          {{ title }}
          <a v-if="link" class="button is-primary is-pulled-right" target="_blank" :href="link">{{ link }}</a>
        </h5>

        <pre style="{preStyle}" :class="{ 'wrap-pre': wrap }">
{{ content }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailsModal',

  props: {
    shown: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      required: false,
      default: ''
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: false,
      default: ''
    },
    wrap: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
  .modal-content {
    width: 80% !important;
  }

  .wrap-pre {
    word-wrap: break-word;
    white-space: pre-wrap;
  }
</style>