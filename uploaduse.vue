<template>
  <div class="attachment" :style="{ height: `${height}px` }">
    <div class="operations">
      <a-button icon="upload" :disabled="!$attrs.stampingPlanVo.pk" type="primary" @click="handleUpload"> {{ $t(`${$_LOCALE_SS}.import.attachment.title`) }} </a-button>
      <a-button
        :disabled="!checkedList.length"
        v-show="selecting"
        type="warning"
        @click="handleDown"
        class="btn__download"
      >{{ $t(`${$_LOCALE_SS}.button.down`) }}</a-button
      >
      <a-button :disabled="!checkedList.length" v-show="selecting" type="danger" @click="handleDel">{{ $t(`${$_LOCALE_SS}.button.del`) }}</a-button>
      <Uploader
        :visible.sync="visible"
        :action="fileUpload"
        :title="$t(`${$_LOCALE_SS}.import.attachment.title`)"
        :multiple="true"
        :maxLength="5-dataSource.length"
        v-bind="$attrs"
        :accept="'.jpg,.png,.jpeg,.gif'"
        @submit="onSubmitUploading"
      />
    </div>
    <div class="container" :style="{ height: `${height - 48}px` }">
      <AttachmentItem v-bind="$attrs" v-for="item in dataSource" :key="item.pk" :data="item" :selectable="selecting" />
    </div>
  </div>
</template>

<script>
import { fileUpload, fileDownload, fileDel } from '@/api/stamping/schedule'
import Uploader from '@/components/Uploader/index.vue'
import AttachmentItem from './Item'
import { downloadFile, getFileNameAndTypeByDownloading } from '@/utils/helpers/download-files'
export default {
  name: 'Attachments',
  data() {
    return {
      visible: false,
      selecting: true,
      checkedList: []
    }
  },
  props: {
    dataSource: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: null
    }
  },
  emits: ['onSubmitUploading'],
  methods: {
    fileUpload,
    reset() {
      this.dataSource.map((item) => this.$set(item, 'checked', false))
    },
    onSubmitUploading() {
      this.$emit('onSubmitUploading')
    },
    handleUpload() {
      this.visible = true
    },
    handleDown() {
      this.checkedList.map(async (item) => {
        downloadFile(
          ...getFileNameAndTypeByDownloading(
            await fileDownload({ pk: item.pk }),
            `${this.$attrs.stampingPlanVo.plan_version}${item.name}`
          )
        )
      })
    },
    handleDel() {
      this.$confirm({
        title: this.$t(`${this.$_LOCALE_SS}.message.del`),
        onOk: () => {
          const pks = this.dataSource.filter(item => item.checked).map(item => item.pk).join(',')
          fileDel({ pks }).then(res => {
            this.$emit('onSubmitUploading')
          })
        },
        onCancel: () => {
        }
      })
    }
  },
  watch: {
    dataSource: {
      handler: function (val) {
        this.checkedList = val.filter((item) => item.checked)
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    [Uploader.name]: Uploader,
    [AttachmentItem.name]: AttachmentItem
  }
}
</script>

<style scoped lang="less" src="./style.less"></style>
