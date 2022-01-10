<template>
  <a-modal
    :title="title"
    :ok-text="$t(`uploader.ok`)"
    :closable="false"
    :visible="visible"
    :cancel-text="$t(`uploader.cancel`)"
    :mask-closable="false"
    :ok-button-props="{ props: { disabled: !files.length } }"
    :confirm-loading="loading"
    :destroy-on-close="true"
    @ok="onclick4uploading"
    @cancel="onclick4cancel"
  >
    <a-upload-dragger
      v-bind="$attrs"
      :accept="accept"
      :remove="onRemove"
      :multiple="multiple"
      :fileList="files"
      :show-upload-list="multiple"
      :before-upload="beforeUpload"
      @change="onFileChanged"
      @reject="onReject"
    >
      <p class="ant-upload-drag-icon">
        <a-icon :type="files.length ? 'container' : 'inbox'" />
      </p>
      <p class="ant-upload-text">
        {{
          files.length
            ? files.length === 1
              ? files[0].name
              : $t(`uploader.uploaded`, { count: files.length })
            : $t(`uploader.description`)
        }}
      </p>
      <p class="ant-upload-hint">{{ $t(`uploader.tip`, { s: accept }) }}</p>
    </a-upload-dragger>
  </a-modal>
</template>

<script src="./index.js">
import consoleError from '@/utils/helpers/console-error'

export default {
  name: 'Uploader',
  data() {
    return {
      files: [],
      loading: false
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    action: {
      type: Function,
      default: () => () => {}
    },
    accept: {
      type: String,
      default: '.xls,.xlsx'
    },
    title: {
      type: String,
      default: ''
    },
    maxLength: {
      type: Number,
      default: () => Infinity
    },
    currentLength: {
      type: Number,
      default: 0
    },
    extraFormData: {
      // type: FormData
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'submit'],
  methods: {
    beforeUpload() {
      return false
    },
    onRemove(file) {
      setTimeout(() => {
        this.files = this.files.filter(f => f.uid !== file.uid)
      }, 0)
    },
    onReject() {
      return this.$message.error(this.$t(`uploader.format.error`))
    },
    onFileChanged({ file, fileList }) {
      this.files = this.multiple ? fileList : [file]
    },
    $_META_Checking_Files_Types(files, accepts = []) {
      const types = files.map(file => file.name.slice(file.name.lastIndexOf('.')).toLocaleUpperCase())
      return types.some(type => !accepts.includes(type))
    },
    async onclick4uploading() {
      if (this.loading) return false
      if (this.files.length + this.currentLength > this.maxLength) {
        return this.$message.error(this.$t(`uploader.message`, { n: this.maxLength }))
      }
      if (this.$_META_Checking_Files_Types(this.files, this.accept.toLocaleUpperCase().split(','))) {
        return this.$message.error(this.$t(`uploader.format.error`))
      }

      try {
        this.loading = true
        const formData = new FormData()
        if (this.multiple) {
          this.files.map(file => formData.append(this.$attrs.name || 'file', file.originFileObj))
        } else {
          formData.append(this.$attrs.name || 'file', this.files[0])
        }
        if (this.extraFormData) {
          for (const [key, value] of this.extraFormData) {
            formData.append(key, value)
          }
        }
        const result = await this.action(formData)
        this.$message.success(this.$t(`uploader.success`))
        this.$emit('submit', { result })
        this.onclick4cancel()
      } catch (error) {
        consoleError('onclick4uploading =>', error)
      } finally {
        this.loading = false
      }
    },
    onclick4cancel() {
      this.$emit('update:visible', false)
      this.$nextTick(() => {
        this.files = []
      })
    }
  }
}

</script>
