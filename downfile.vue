<template>
  <a-button
    :loading="loading"
    :disabled="disabled"
    @click="onClickExporting()"
    v-bind="$attrs"
  >
    <slot name="default" />
  </a-button>
</template>

<script>
import consoleError from '@/utils/helpers/console-error'
import DownloadNotifier from '@/components/DownloadNotifier'
import { downloadFile, getFileNameAndTypeByDownloading } from '@/utils/helpers/download-files'

export default {
  name: 'Downloader',
  data() {
    return {
      loading: false
    }
  },
  props: {
    name: {
      type: String,
      default: undefined
    },
    action: {
      type: Function,
      default: () => () => {},
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    locales: {
      type: Object,
      default: () => ({
        title: '',
        retry: '',
        descriptions: ['', '']
      }),
      validator: function(value) {
        return ['title', 'retry', 'descriptions'].every(item => Object.keys(value).includes(item))
      },
      required: true
    }
  },
  methods: {
    async onClickExporting() {
      if (this.loading) return false
      let notifier = DownloadNotifier({
        title: this.locales.title,
        retryText: this.locales.retry,
        descriptions: this.locales.descriptions,
        events: { click: () => this.onClickExporting.bind(this)() }
      })
      try {
        this.loading = true
        downloadFile(...getFileNameAndTypeByDownloading(await this.action(), this.name))
        // eslint-disable-next-line promise/param-names
        await new Promise(r => setTimeout(r, 5000))
        notifier && notifier.close(notifier.KEY)
      } catch (error) {
        consoleError('Downloader.onClickExporting =>', this.action.name, error)
      } finally {
        this.loading = false
        notifier = null
      }
    }
  }
}
</script>
