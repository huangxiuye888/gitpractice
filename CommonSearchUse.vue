<template>
  <page-header-wrapper>
    <a-card :bordered="false" :body-style="{ padding: '20px' }">
      <!-- 查询框 -->
      <CommonSearch
        v-if="rule.length"
        :rule="rule"
        :option="{}"
        :config="config"
        @search="getList"
        @reset="getList"
      ></CommonSearch>
      <table-operator :tableOpreateData="tableOpreateData"></table-operator>
      <s-table
        :data="getData"
        :params="searchForm"
        :columns="columns"
        :scroll="{ x: 1200 }"
        :slots="slot || []"
        :alert="{}"
        :updateFlag="updateFlag"
        @selectedData="selectedDataCallBack"
        @paginationCa="paginationCallBack"
      ></s-table>
    </a-card>
  </page-header-wrapper>
</template>
<script>
import { STable, CommonSearch, TableOperator } from '@/components'
import moment from 'moment'
// const nodeStateMap = {
//   1: '审核通过',
//   2: '审核不通过',
//   3: '待提交',
//   4: '待审核',
//   5: '审核中'
// }
export default {
  name: 'PaymentApply',
  components: { STable, CommonSearch, TableOperator },
  props: {
    size: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      fApi: {},
      rule: [
        {
          type: 'select',
          field: 'deptId',
          title: '处室名称',
          value: '',
          props: {
            placeholder: '请选择处室'
          },
          isDicts: true,
          optsUnshift: {
            label: '全部',
            value: ''
          },
          options: []
        },
        {
          type: 'select',
          field: 'nodeState',
          title: '状态',
          value: '',
          props: {
            placeholder: '请选择状态'
          },
          remoteOpts: true,
          // remoteParams: {
          //   path: 'bizmoneyuseapply/getUseApplyStateList'
          // },
          // keyMap: {
          //   label: 'describe',
          //   value: 'code'
          // },
          optsUnshift: {
            label: '全部',
            value: ''
          },
          options: []
        },
        {
          type: 'YearPicker',
          field: 'year',
          title: '年份',
          value: moment().format('YYYY'),
          props: {
            customStyle: {
              minWidth: '100%'
            },
            open: true,
            placeholder: '请选择年份'
          }
        }
      ],

      option: {},
      config: {
        submitBtn: {
          show: true,
          text: '查找'
        }
      },

      tableOpreateData: [
        // {
        //   key: 'add',
        //   name: '新增',
        //   type: 'primary',
        //   icon: 'plus',
        //   className: '',
        //   permission: 'finance_loan_apply_add',
        //   callback: this.handleAdd
        // }
      ],

      loading: false,
      // 选中项，数组
      selection: [],
      searchForm: {},
      pagination: {},
      groupName: [],
      // 触发搜索
      updateFlag: {},
      slot: [
        {
          fuc: this.handleDetail,
          action: '查看',
          // permission: 'finance_loan_apply_view',
          validator: (record, index) => record.routes.some((_) => _.name === '查看')
        },
        {
          fuc: this.handleEdit,
          action: '编辑',
          // permission: 'finance_loan_apply_edit',
          validator: (record, index) => record.routes.some((_) => _.name === '编辑')
        },
        {
          fuc: this.handleSubmit,
          action: '提交',
          // permission: 'finance_loan_apply_add',
          validator: (record, index) => record.routes.some((_) => _.name === '提交')
        },
        {
          fuc: this.handleApprove,
          action: '审核',
          // permission: [
          //   'finance_loan_apply_approve',
          //   'finance_loan_apply_approve_fgld',
          //   'finance_loan_apply_approve_cw'
          // ],
          validator: (record, index) => record.routes.some((_) => _.name === '审核')
        }
      ],
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          customRender: (text, record, index) =>
            `${(this.pagination.current - 1) * this.pagination.pageSize + (index + 1)}`,
          width: 100,
          align: 'center'
        },
        // {
        //   title: '申请单号',
        //   dataIndex: 'bizNo',
        //   key: 'bizNo'
        // },
        {
          title: '用款处室',
          dataIndex: 'deptName',
          align: 'center',
          key: 'deptName'
        },
        {
          title: '申请用款数(元)',
          dataIndex: 'applyFunds',
          align: 'center',
          key: 'applyFunds'
        },
        {
          title: '核准用款数(元)',
          dataIndex: 'approvalFunds',
          align: 'center',
          key: 'approvalFunds'
        },
        {
          title: '申请时间',
          dataIndex: 'applyTime',
          align: 'center',
          key: 'applyTime',
          ellipsis: true
        },
        {
          title: '状态',
          dataIndex: 'nodeStateDesc',
          align: 'center',
          key: 'nodeStateDesc',
          width: 120
          // customRender: (text, record, index) => {
          //   return nodeStateMap[text]
          // }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          scopedSlots: { customRender: 'operation' },
          width: 200,
          fixed: 'right'
        }
      ]
    }
  },
  computed: {},
  // async created () {
  //   await this.$api['bizmoneyuseapply/getRoleStatusCode']({})
  //     .then(res => {
  //       // if (res.data.roleStatusCode !== '4') {
  //       if (res.resMsg !== '4') {
  //         this.rule = this.ruleNoDeptName
  //       } else {
  //         this.rule = this.ruleDeptName
  //       }
  //     })
  // },
  created () {
    this.getSelect()
  },
  methods: {
    // 新建
    handleAdd () {
      this.$router.push({
        name: 'paymentInquire',
        query: Object.assign({ operationType: 'add' })
      })
    },
    // 查看
    handleDetail (e, row) {
      this.$router.push({
        name: 'paymentInquire',
        query: Object.assign({ operationType: 'see', bizId: row.bizId, flowId: row.flowId })
      })
    },
    // 跳转编辑
    handleEdit (e, row) {
      this.$router.push({
        name: 'paymentInquire',
        query: Object.assign({ operationType: 'edit', bizId: row.bizId, flowId: row.flowId })
      })
    },
    // 提交
    handleSubmit (e, row) {
      this.$router.push({
        name: 'paymentInquire',
        query: Object.assign({ operationType: 'submit', bizId: row.bizId, flowId: row.flowId })
      })
    },
    // 审核
    handleApprove (e, row) {
      this.$router.push({
        name: 'paymentInquire',
        query: Object.assign({ operationType: 'approve', bizId: row.bizId, flowId: row.flowId })
      })
    },
    loadData (pagination, filters, sorter) {
      console.log('')
    },
    getData () {
      return this.$api['bizmoneyuseapply/getApplyList']
    },
    getList (searchForm, pagination) {
      if (searchForm) {
        this.searchForm = searchForm
      }
      if (pagination) {
        this.pagination = pagination
      }
    },
    // 表单组件选中项回调
    selectedDataCallBack (selectedRowKeys, selectedRows) {
      this.selection = selectedRows
    },
    // 表单组件分页回调
    paginationCallBack (pagination) {
      this.pagination = pagination
    },
    getSelect () {
      this.$api['bizmoneyuseapply/getDeptDataByPermission']({
        /* $id: '匹配模式', id: '传参' */
        wfId: 'USE_SELECT'
      })
        .then((res) => {
          console.log(res)
          this.rule[0].options = res.data.map((item) => ({ value: item.id, label: item.name }))
          this.rule[0].options.unshift({ value: '', label: '全部' })
        })
        .catch((err) => {
          console.log(err) /* loading处理 */
        })
      this.$api['bizmoneyuseapply/getFlowStatusByPermission']({
        /* $id: '匹配模式', id: '传参' */
        code: '2',
        wfId: 'USE_SELECT'
      })
        .then((res) => {
          console.log(res)
          this.rule[1].options = res.data.map((item) => ({ value: item.code, label: item.description }))
          this.rule[1].options.unshift({ value: '', label: '全部' })
        })
        .catch((err) => {
          console.log(err) /* loading处理 */
        })
    }
  }
}
</script>
<style lang="less" scoped>
/deep/ .ant-table-row-cell-break-word {
  padding: 10px 8px !important;
}
/* @import url("./*.less"); */
</style>
