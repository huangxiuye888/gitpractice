<template>
  <a-card :title="$t(`${$_LOCALE_SS}.title`)" id="stamping-schedules">
    <div class="query__container">
      <a-button :disabled="editing" @click="onClickSchedulesDrawer" icon="schedule" type="primary">{{
        $t(`${$_LOCALE_SS}.button.schedule`)
      }}</a-button>
      <a-button :disabled="editing" @click="onClickCreatingSchedule" icon="plus" type="success" class="btn__create">
        {{ $t(`${$_LOCALE_SS}.import.title`) }}
      </a-button>
      <Uploader
        :visible.sync="visible4upload"
        :action="importStampingPlan"
        :title="$t(`${$_LOCALE_SS}.import.title`)"
        @submit="onSubmitUploading"
      />
      <div class="query">
        <label for="">{{ $t(`${$_LOCALE_SS}.label.date`) }}</label>
        <a-range-picker v-model="time" @change="onChange" format="YYYY-MM-DD" />
      </div>
      <a-button :disabled="editing || !stampingPlanVo.pk" type="primary" @click="handleSearch" :loading="loading">{{
        $t(`${$_LOCALE_SS}.button.query`)
      }}</a-button>
      <a-modal
        :title="$t(`${$_LOCALE_SS}.model.title.schedule`)"
        :footer="null"
        v-model="visible"
        :bodyStyle="{ width: '900px', overflow: 'auto' }"
        :width="900"
      >
        <a-table
          style="cursor: pointer"
          :columns="columnsEdition"
          :data-source="data"
          :pagination="paginationEdition"
          @change="handleTableEditionChange"
          :customRow="click"
          rowKey="pk"
          size="small"
        >
          <span v-for="column in columnsEdition" :key="column.key" :slot="column.slots.title">
            {{ column.locale ? $t(`${$_LOCALE_SS}.${column.locale}`) : column.title }}
          </span>
        </a-table>
      </a-modal>
    </div>
    <div class="operation__container">
      <div class="info__container">
        <div class="info__item">
          <span>{{ $t(`${$_LOCALE_SS}.chosen.schedule`) }}:</span>
          <span>{{ stampingPlanVo.plan_version ? stampingPlanVo.plan_version : $t(`${$_LOCALE_SS}.noplan`) }}</span>
        </div>
        <div class="info__item">
          <span>{{ $t(`${$_LOCALE_SS}.creator`) }}:</span>
          <span>{{ stampingPlanVo.create_user ? stampingPlanVo.create_user : $t(`${$_LOCALE_SS}.nocreator`) }}</span>
        </div>
        <div class="info__item">
          <span>{{ $t(`${$_LOCALE_SS}.updater`) }}:</span>
          <span>{{ stampingPlanVo.update_user ? stampingPlanVo.update_user : $t(`${$_LOCALE_SS}.nomodifier`) }}</span>
        </div>
      </div>
      <a-button
        v-show="!editing"
        :disabled="!stampingPlanVo.pk"
        @click="onClickStartEditing"
        icon="edit"
        type="warning"
      >{{ $t(`${$_LOCALE_SS}.button.edit`) }}</a-button
      >
      <a-button :disabled="!editing" v-show="editing" @click="save" icon="save" type="success">{{
        $t(`${$_LOCALE_SS}.button.save`)
      }}</a-button>
      <a-popconfirm
        :title="$t(`${$_LOCALE_SS}.message.cal`)"
        :visible="visibleEdit"
        ok-text="Yes"
        cancel-text="No"
        @confirm="confirm"
        @cancel="cancel"
      >
        <a-button @click="handlerCancel" :disabled="!editing" v-show="editing" icon="undo" type="secondary">{{
          $t(`${$_LOCALE_SS}.button.cancel`)
        }}</a-button>
      </a-popconfirm>
      <a-button :disabled="editing || !stampingPlanVo.pk" @click="handlePlanOut" icon="share-alt" type="primary">{{
        $t(`${$_LOCALE_SS}.button.send`)
      }}</a-button>
      <a-modal
        :closable="!spinning"
        :keyboard="!spinning"
        :footer="null"
        v-model="visibleIssue"
        :bodyStyle="{ width: '900px', overflow: 'auto' }"
        :width="900"
      >
        <template slot="title">
          <span>{{ $t(`${$_LOCALE_SS}.model.title.benth`) }}:{{ stampingPlanVo.plan_version }}</span>
        </template>
        <div style="margin-bottom: 20px; font: 700 18px/27px ''">
          {{ $t(`${$_LOCALE_SS}.plan.model.title`) }}
        </div>
        <a-spin :spinning="spinning" :tip="$t(`${$_LOCALE_SS}.spin.title`)">
          <div class="spin-content">
            <a-table
              :scroll="{ y: 400 }"
              style="cursor: pointer"
              :columns="columnsPlan"
              :data-source="dataPlan"
              :pagination="false"
              @change="handleTablePlanChange"
              size="small"
            >
              <span v-for="column in columnsPlan" :key="column.key" :slot="column.slots.title">
                {{ column.locale ? $t(`${$_LOCALE_SS}.${column.locale}`) : column.title }}
              </span>
              <template slot="operations" slot-scope="text, record">
                <a-space>
                  <a-button :disabled="record['state'] === '1'" @click="handlerSendout(record)" type="primary">{{
                    $t(`${$_LOCALE_SS}.button.send`)
                  }}</a-button>
                </a-space>
              </template>
            </a-table>
          </div>
        </a-spin>
      </a-modal>
      <Downloader
        name="冲压生产计划导入模板.xlsx"
        :action="handlerDownload"
        :disabled="editing"
        :locales="{
          title: `${$_LOCALE_REQ_GW}.export.retry.title`,
          retry: `${$_LOCALE_REQ_GW}.export.retry.btn`,
          descriptions: [`${$_LOCALE_REQ_GW}.export.retry.tip1`, `${$_LOCALE_REQ_GW}.export.retry.tip2`],
        }"
        type="link"
        icon="download"
      >
        {{ $t(`${$_LOCALE_SS}.button.template`) }}
      </Downloader>
      <Downloader
        name="冲压生产计划.xlsx"
        :action="handlerExport"
        :disabled="editing || !stampingPlanVo.pk"
        :locales="{
          title: `${$_LOCALE_REQ_GW}.export.retry.title`,
          retry: `${$_LOCALE_REQ_GW}.export.retry.btn`,
          descriptions: [`${$_LOCALE_REQ_GW}.export.retry.tip1`, `${$_LOCALE_REQ_GW}.export.retry.tip2`],
        }"
        type="link"
        icon="cloud-download"
        class="btn__download"
      >
        {{ $t(`${$_LOCALE_SS}.button.export`) }}
      </Downloader>
    </div>
    <div ref="container" class="tabs__container">
      <a-tabs :activeKey="defaultKey" @change="onChangeTabs">
        <a-tab-pane key="1" :tab="$t(`${$_LOCALE_SS}.tab.productionschedule`)">
          <a-form-model ref="EditableTable" :model="form" class="editform">
            <a-table
              :scroll="{ x: 1200, y: height - 100 }"
              :columns="columns"
              :data-source="form.dataSource"
              :pagination="false"
              rowKey="pk"
            >
              <template v-for="(col, colIndex) in columns" :slot="col.key" slot-scope="text, record, index">
                <a-form-model-item
                  :key="colIndex"
                  :prop="'dataSource.' + index + `.${col.key}`"
                  :rules="checkFn(col, record)"
                >
                  <div>
                    <a-input
                      style="margin: -5px 0"
                      v-if="'editable' in col ? editing : false"
                      v-model.trim="form.dataSource[index][col.key]"
                    />
                    <span class="textWidth" :title="text" v-else>
                      {{ text }}
                    </span>
                  </div>
                </a-form-model-item>
              </template>
              <span v-for="column in columns" :key="column.key" :slot="column.slots.title">
                {{ column.locale ? $t(`${$_LOCALE_SS}.${column.locale}`) : column.title }}
              </span>
            </a-table>
          </a-form-model>
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$t(`${$_LOCALE_SS}.tab.Attachment`)">
          <Attachments
            ref="attachments"
            :extraFormData="formData"
            :stampingPlanVo="stampingPlanVo"
            @onSubmitUploading="getAttachments"
            :data-source="attachments"
            :height="height - 51"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-card>
</template>

<script>
import {
  initPageData,
  stampingPlanVersionPage,
  stampingPlanDetailPage,
  exportProductionOrder,
  downloadTemplate,
  importStampingPlan,
  modifyStampingPlan,
  stampingDetailLstByVersion,
  stampingDetailDelivery,
  fileList
} from '@/api/stamping/schedule'
import moment from 'moment'
import Uploader from '@/components/Uploader/index.vue'
import Downloader from '@/components/Downloader'
import Attachments from './components/Attachments'
import consoleError from '@/utils/helpers/console-error'
import columns from './columns'
let resizeHandler = null
const KEY = {
  PLANNED_QUANTILY: 'planned_quantity',
  BATCH_NO: 'batch_no'
}
const STATE = {
  0: 'table.state.NotIssued',
  1: 'table.state.Issued',
  2: 'table.state.Adjustment',
  3: 'table.state.Distribution'
}
export default {
  name: 'StampingSchedule',
  data() {
    return {
      height: 0,
      columns,
      visible: false,
      visibleIssue: false,
      loading: false,
      spinning: false,
      defaultKey: '1',
      data: [],
      columnsEdition: [
        {
          dataIndex: 'plan_version',
          key: 'plan_version',
          locale: `table.columnEdition.version`,
          slots: { title: 'plan_version' }
        },
        {
          dataIndex: 'start_date',
          key: 'start_date',
          slots: { title: 'start_date' },
          locale: `table.columnEdition.startDate`,
          customRender: (text, record, index) => {
            return moment(text).format('YYYY-MM-DD')
          }
        },
        {
          dataIndex: 'end_date',
          key: 'end_date',
          slots: { title: 'end_date' },
          locale: `table.columnEdition.endDate`,
          customRender: (text, record, index) => {
            return moment(text).format('YYYY-MM-DD')
          }
        },
        {
          dataIndex: 'create_time',
          key: 'create_time',
          slots: { title: 'create_time' },
          locale: `table.columnEdition.createDate`,
          customRender: (text, record, index) => {
            return moment(text).format('YYYY-MM-DD')
          }
        },
        {
          dataIndex: 'create_user',
          key: 'create_user',
          slots: { title: 'create_user' },
          locale: `table.columnEdition.createuser`
        }
      ],
      paginationEdition: {
        pageSize: 10,
        total: 0,
        current: 1,
        showQuickJumper: true,
        showLessItems: true
      },
      dataPlan: [],
      columnsPlan: [
        {
          dataIndex: 'produced_date',
          key: 'produced_date',
          slots: { title: 'produced_date' },
          locale: `table.columnPlan.startDate`
        },
        {
          dataIndex: 'job_shift',
          key: 'job_shift',
          slots: { title: 'job_shift' },
          locale: `table.columnPlan.bentch`
        },
        {
          dataIndex: 'state',
          key: 'state',
          customRender: (text) => {
            return this.$t(`${this.$_LOCALE_SS}.${STATE[text]}`)
          },
          slots: { title: 'state' },
          locale: `table.columnPlan.state`
        },
        {
          dataIndex: 'operation',
          key: 'operation',
          scopedSlots: { customRender: 'operations' },
          slots: { title: 'operation' },
          locale: `table.columnPlan.operation`
        },
        {
          dataIndex: 'remark',
          key: 'remark',
          slots: { title: 'remark' },
          locale: `table.columnPlan.remark`
        }
      ],
      paginationPlan: {
        pageSize: 10,
        total: 0,
        current: 1,
        showQuickJumper: true,
        showLessItems: true
      },
      editing: false,
      attachments: [],
      visible4upload: false,
      visibleEdit: false,
      stampingPlanVo: {},
      formData: {},
      form: {
        dataSource: []
      },
      checkPlannedQuantity1: [{ required: true, validator: this.check3, trigger: 'change' }],
      checkPlannedQuantity2: [{ required: true, validator: this.check4, trigger: 'change' }],
      checkBatchNo1: [{ required: true, validator: this.check1, trigger: 'change' }],
      checkBatchNo2: [{ required: true, validator: this.check2, trigger: 'change' }],
      rulesConfigList: {},
      time: [],
      startTime: '',
      endTime: ''
    }
  },
  mounted() {
    resizeHandler = () => {
      this.height = this.$refs.container.getBoundingClientRect().height
    }
    resizeHandler()
    window.addEventListener('resize', resizeHandler)
    this.getDefaultData()
    this.stampingPlanVersionPage()
    this.columns.reduce((pre, cur) => {
      if (cur.validator) {
        pre[cur.dataIndex] = cur.validator
      }
      return pre
    }, this.rulesConfigList)
    this.dataSources = []
  },
  beforeDestroy() {
    window.removeEventListener('resize', resizeHandler)
  },
  methods: {
    // 初始化数据
    getDefaultData() {
      initPageData()
        .then((res) => {
          if (res) {
            this.stampingPlanVo = res.stampingPlanVo
            this.formData = new FormData()
            this.formData.append('sourcePk', this.stampingPlanVo.pk)
            this.formData.append('group', 'group')
            this.time = [this.stampingPlanVo.start_date, this.stampingPlanVo.end_date]
            this.handleSearch()
          }
        })
        .catch((err) => {
          consoleError(err)
        })
    },
    onChange(value, dateString) {
      this.stampingPlanVo.start_date = dateString.slice(0, 1).toString()
      this.stampingPlanVo.end_date = dateString.slice(1, 2).toString()
    },
    // 初始化计划
   async stampingPlanVersionPage(current = 1, size = 10) {
     await stampingPlanVersionPage({ current, size })
        .then((res) => {
          this.data = res?.records
          this.paginationEdition.total = res?.total || 0
          this.paginationEdition.current = res?.curPage || 1
        })
        .catch((err) => {
          consoleError(err)
        })
    },
    // 计划分页
    handleTableEditionChange(pagination) {
      this.paginationEdition = { ...this.paginationEdition, ...pagination }
      this.stampingPlanVersionPage(this.paginationEdition.current, this.paginationEdition.pageSize)
    },
    // 选择计划
    click(record) {
      return {
        on: {
          click: () => {
            this.visible = false
            this.stampingPlanVo = { ...record }
            this.formData = new FormData()
            this.formData.append('sourcePk', this.stampingPlanVo.pk)
            this.formData.append('group', 'group')
            this.time = [this.stampingPlanVo.start_date, this.stampingPlanVo.end_date]
            this.defaultKey = '1'
            this.handleSearch()
          }
        }
      }
    },
    // 搜索
    handleSearch() {
      if (this.loading) return false
      // eslint-disable-next-line camelcase
      const { pk, start_date, end_date } = this.stampingPlanVo
      this.loading = true
      stampingPlanDetailPage({
        plan_version_pk: pk,
        start_date,
        end_date
      })
        .then((res) => {
          this.form.dataSource = res
        })
        .catch((err) => {
          consoleError(err)
        })
        .finally(() => {
          this.loading = false
        })
      this.getAttachments(pk)
    },
    // 导入计划
    importStampingPlan,
    // 选择计划
    onClickSchedulesDrawer() {
      this.visible = true
    },
    // 计划下发
    handlePlanOut() {
      stampingDetailLstByVersion({ pk: this.stampingPlanVo.pk })
        .then((res) => {
          this.dataPlan = res
          // this.dataPlan = res?.records
          // this.paginationPlan.total = res?.total || 0
          // this.paginationPlan.current = res?.curPage || 1
          this.visibleIssue = true
        })
        .catch((err) => {
          consoleError(err)
        })
    },
    // 计划下发分页
    handleTablePlanChange(pagination) {},
    // 下发计划
    handlerSendout(record) {
      this.spinning = true
      stampingDetailDelivery({
        pk: this.stampingPlanVo.pk,
        produceDate: record.produced_date,
        jobShift: record.job_shift
      })
        .then(() => {
          this.$info({
            title: `${record.produced_date}${record.job_shift}冲压计划下发成功！`,
            okText: this.$t(`${this.$_LOCALE_SS}.button.ok`),
            onOk: () => {}
          })
        })
        .catch((err) => {
          const h = this.$createElement
          this.$info({
            title: `${record.produced_date}${record.job_shift}冲压计划下发失败！`,
            okText: this.$t(`${this.$_LOCALE_SS}.button.ok`),
            content: h('div', {}, [h('p', `失败原因：${err.message}`)]),
            onOk: () => {}
          })
        })
        .finally(() => {
          this.spinning = false
          stampingDetailLstByVersion({ pk: this.stampingPlanVo.pk })
            .then((res) => {
              this.dataPlan = res
            })
            .catch((err) => {
              consoleError(err)
            })
        })
    },
    // 修改
    onClickStartEditing() {
      this.editing = true
      this.dataSources = JSON.parse(JSON.stringify(this.form.dataSource))
    },
    handlerCancel() {
      if (JSON.stringify(this.dataSources) === JSON.stringify(this.form.dataSource)) {
        this.editing = false
        this.$refs.EditableTable.clearValidate()
      } else {
        this.visibleEdit = true
      }
    },
    confirm() {
      this.editing = false
      this.visibleEdit = false
      this.$refs.EditableTable.clearValidate()
      this.form.dataSource = this.dataSources
    },
    cancel() {
      this.visibleEdit = false
    },
    save() {
      this.$refs.EditableTable.validate((valid) => {
        if (valid) {
          const params = { plan_pk: this.stampingPlanVo.pk, detail_lst: this.form.dataSource }
          modifyStampingPlan(params).then((res) => {
            this.editing = false
            this.stampingPlanVo = res
            this.stampingPlanVersionPage()
            this.handleSearch()
          })
        } else {
          return false
        }
      })
    },
    // 下载模板
    async handlerDownload() {
      try {
        return await downloadTemplate()
      } catch (error) {
        consoleError('downloadTemplate =>', error)
      }
    },
    // 导出
    async handlerExport() {
      try {
        // eslint-disable-next-line camelcase
        const { pk, start_date, end_date, plan_version } = this.stampingPlanVo
        return await exportProductionOrder({
          plan_version_pk: pk,
          version_no: plan_version,
          start_date,
          end_date
        })
      } catch (error) {
        consoleError('exportProductionOrder =>', error)
      }
    },
    // 获取附件
    async getAttachments(pk = this.stampingPlanVo.pk) {
      try {
        const res = await fileList({ sourcePk: pk })
        this.attachments = res
      } catch (error) {
        consoleError('getAttachments =>', error)
      }
    },
    // 可编辑表格格式校验
    checkFn(col, record) {
      return col.key === KEY.PLANNED_QUANTILY && record.product_code.includes('/')
        ? this.checkPlannedQuantity2
        : col.key === KEY.PLANNED_QUANTILY && !record.product_code.includes('/')
        ? this.checkPlannedQuantity1
        : col.key === KEY.BATCH_NO && record.product_code.includes('/')
        ? this.checkBatchNo2
        : col.key === KEY.BATCH_NO && !record.product_code.includes('/')
        ? this.checkBatchNo1
        : this.rulesConfigList[col.key] || {}
    },
    check1(rule, value, callback) {
      callback(this.checkFunction(value, /^\d{3}$/, 'batch'))
    },
    check2(rule, value, callback) {
      callback(this.checkFunction(value, /^\d{3}\/\d{3}$/, 'batch'))
    },
    check3(rule, value, callback) {
      callback(this.checkFunction(value, /^[1-9][0-9]*$/, 'planned'))
    },
    check4(rule, value, callback) {
      callback(this.checkFunction(value, /^[1-9][0-9]*\/[1-9][0-9]*$/, 'planned'))
    },
    checkFunction(value, reg, str) {
      if (!value || !reg.test(value)) {
        return new Error(this.$t(`${this.$_LOCALE_SS}.message.${str}`))
      }
    },
    onClickCreatingSchedule() {
      this.visible4upload = true
    },
    async onSubmitUploading() {
      await this.stampingPlanVersionPage()
      this.stampingPlanVo = { ...this.data[0] }
      this.handleSearch()
    },
    onChangeTabs(key) {
      this.defaultKey = key
      // eslint-disable-next-line no-unused-expressions
      if (key === '2') this.$refs?.attachments?.reset()
    }
  },
  components: {
    [Uploader.name]: Uploader,
    [Downloader.name]: Downloader,
    [Attachments.name]: Attachments
  }
}
</script>

<style scoped lang="less" src="./style.less"></style>
