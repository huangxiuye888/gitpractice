<template>
  <div :class="{'common-search': !moreState}">
    <a-row :class="{left: !moreState}">
      <a-col :span="24">
        <form-create v-model="fApi" :rule="ruleMerge" :option="optionsMerge"></form-create>
      </a-col>
    </a-row>
    <div class="btn-wrap" v-if="!moreState">
      <a-button v-if="submitBtn.show" type="primary" plain @click="submit" class="btn-common">
        <a-icon v-if="submitBtn.icon" :type="submitBtn.icon" />
        {{ submitBtn.text }}
      </a-button>
      <a-button v-if="resetBtn.show" aligen="center" plain @click="reset" class="btn-common">
        <a-icon v-if="resetBtn.icon" :type="resetBtn.icon" />
        {{ resetBtn.text }}
      </a-button>
      <div v-if="moreShow" @click="moreState = !moreState" class="more">
        <span>展开</span>
        <a-icon :type="moreState ? 'up' : 'down'" />
      </div>
    </div>
    <a-row v-show="moreState" type="flex" justify="end">
      <a-col
        class="btn-wrap"
      >
        <a-button v-if="submitBtn.show" type="primary" plain @click="submit" class="btn-common">
          <a-icon v-if="submitBtn.icon" :type="submitBtn.icon" />
          {{ submitBtn.text }}
        </a-button>
        <a-button v-if="resetBtn.show" aligen="center" plain @click="reset" class="btn-common">
          <a-icon v-if="resetBtn.icon" :type="resetBtn.icon" />
          {{ resetBtn.text }}
        </a-button>
        <div v-if="moreShow" @click="moreState = !moreState" class="more">
          <span>收起</span>
          <a-icon :type="moreState ? 'up' : 'down'" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import store from '@/store'
const { dictionary } = store.getters

const SCREEN_SIZE_MAP = {
  xxl: { // 屏幕宽 > 1600px
    conditionCol: 6, // 关闭状态下 每个搜索框的span
    moreConditionCol: 6, // 展开状态下 每个搜索框的span
    conditonCount: 4 // 关闭状态下 搜索框的个数
  },
  xl: { // 1200px < 屏幕宽 < 1600px
    conditionCol: 8,
    moreConditionCol: 8,
    conditonCount: 3
  }
}

export default {
  name: 'CommonSearch',
  components: {
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    rule: {
      type: Array,
      default: () => {
        return []
      }
    },
    option: {
      type: Object,
      default: () => {
        return {}
      }
    },
    config: {
      type: Object,
      default: () => {
        return {
          submitBtn: {
            show: true,
            text: '搜索',
            icon: ''
          },
          resetBtn: {
            show: false,
            text: '重置',
            icon: ''
          },
          input: {
            enterButton: true
          }
        }
      }
    }
  },
  data () {
    this.submit = debounce(this.submit, 2000, {
      leading: true
    })
    this.reset = debounce(this.reset, 500, {
      leading: true
    })
    this.getBreakPoint = debounce(this.getBreakPoint, 300)
    return {
      fApi: {},
      ruleMerge: [],
      optionsMerge: {},
      submitBtn: {},
      resetBtn: {},
      addBtn: {},
      input: {},

      moreShow: false, // 是否有展开按钮  true ---> 有,  false ---> 没有
      moreState: false, // 表单展开的状态 ture ---> 展开, false ---> 关闭
      screenSize: 'xxl', // 当前屏幕尺寸
      screenSizeMap: SCREEN_SIZE_MAP

    }
  },
  computed: {},
  watch: {
    fApi: {
      handler () {
        this.$emit('input', this.fApi)
      },
      deep: true
    },
    rule: {
      handler () {
        const form = Object.assign({}, this.fApi.form)
        this.ruleMergeFunc()
        this.$nextTick(() => {
          Object.keys(this.fApi.form).forEach(item => {
            this.$set(this.fApi.form, item, form[item])
          })
        })
      },
      deep: true
    },
    moreState: {
      handler () {
        this.ruleMergeFunc()
      }
    }
  },
  created () {
    window.addEventListener('resize', this.getBreakPoint)
    this.getBreakPoint('created')
    this.configBtnMergeFunc()
    this.ruleMergeFunc()
    this.optionsMergeFunc()
  },
  mounted () {
    this.$emit('input', this.fApi)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.getBreakPoint)
  },
  methods: {
    async ruleMergeFunc () {
      const ruleMergeTemp = []
      for (let index = 0; index < this.rule.length; index++) {
        if (!this.moreState && index >= SCREEN_SIZE_MAP[this.screenSize].conditonCount) continue
        const element = this.rule[index]
        const ruleMergeItem = {}
        Object.assign(ruleMergeItem,
          {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
          },
          element,
          {
            col: {
              span: SCREEN_SIZE_MAP[this.screenSize][this.moreState ? 'moreConditionCol' : 'conditionCol']
            }
          }
        )
        if ((element.remoteOpts && element.remoteParams) || (element.isDicts && element.dictName)) {
          let options = []
          if (element.remoteOpts) {
            options = await this.handleRemoteOpts(element.remoteParams, (res) => {
              return res
            })
          } else if (element.isDicts) {
            options = dictionary.dictMap[element.dictName].list
          }
          if (element.keyMap) {
            options = options.map(item => {
              return {
                ...item,
                label: item[element.keyMap.label],
                value: item[element.keyMap.value]
              }
            })
          }
          element.optsUnshift && options.unshift(element.optsUnshift)
          Object.assign(ruleMergeItem, {
            options,
            value: options[0].value
          })
        }
        if (element.type === 'input' && this.input && this.input.enterButton) {
          const elementOn = {}
          Object.assign(elementOn, element.on, {
            keyup: (event) => {
              if (event.code === 'Enter' || event.keycode === 13) {
                this.submit()
              }
            }
          })
          Object.assign(ruleMergeItem, { on: elementOn })
        }
        ruleMergeTemp.push(ruleMergeItem)
      }
      this.ruleMerge = ruleMergeTemp
    },
    handleRemoteOpts (params, cb) {
      return new Promise(resolve => {
        this.$api[params.path](params.params).then((responseData) => {
          resolve(responseData.data)
        })
      }).then((res) => {
        return cb(res)
      })
    },
    optionsMergeFunc () {
      /*
        合并option
        设置默认值
        {
          submitBtn: {
            show: false
          }
        }
      */
      const ruleLen = this.rule.length
      Object.assign(this.optionsMerge, this.option, {
        submitBtn: {
          show: false
        },
        resetBtn: {
          show: false
        }
      })
      if (ruleLen < SCREEN_SIZE_MAP[this.screenSize].conditonCount) {
        Object.assign(this.optionsMerge,
          {
            row: {
              type: 'flex',
              justify: 'end'
            }
          }
        )
      }
    },
    configBtnMergeFunc () {
      Object.assign(this.submitBtn,
        {
          show: true,
          text: '搜索',
          icon: ''
        },
        this.config.submitBtn
      )
      Object.assign(this.resetBtn,
        {
          show: false,
          text: '重置',
          icon: ''
        },
        this.config.resetBtn
      )
      Object.assign(this.input, {
        enterButton: true
      })
    },
    submit () {
      this.fApi.submit((formData, $f) => {
        this.$emit('search', formData)
      })
    },
    reset () {
      this.fApi.resetFields()
      this.$emit('reset', {})
    },
    getBreakPoint (created) {
      let matchMedia
      if (window.matchMedia) {
        matchMedia = window.matchMedia
      }
      // 判断屏幕宽度是否大于1600
      if (matchMedia('(min-width:1600px)').matches) {
        this.screenSize = 'xxl'
      } else if (matchMedia('(min-width:1200px)').matches && matchMedia('(max-width:1600px)').matches) {
        this.screenSize = 'xl'
      }
      if (created !== 'created') this.ruleMergeFunc()
      this.judgeMoreShow()
    },
    judgeMoreShow () {
      const ruleLen = this.rule.length
      switch (this.screenSize) {
        case 'xxl':
          this.moreShow = ruleLen > SCREEN_SIZE_MAP.xxl.conditonCount
          break
        case 'xl':
          this.moreShow = ruleLen > SCREEN_SIZE_MAP.xl.conditonCount
          break
        default:
          break
      }
    }

  }
}
</script>
<style lang='less' scoped>
.common-search{
  display: flex;
  width: 100%;
  .left{
    flex: 1;
  }
}
.add-btn-wrap {
  height: 40px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.btn-wrap {
  height: 40px;
  margin-left: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.btn-common {
  margin-right: 8px;
  float: right;
}
.more {
  color: #1890ff;
  cursor: pointer;
}
.common-search  .ant-form-item{
  margin-bottom: 10px;
}
</style>
