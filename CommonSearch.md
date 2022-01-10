# 列表头部搜索组件

### 一、使用场景

1.列表头部搜索通用组件

### 二、内置属性

| 属性        | 说明                    | 类型              | 必填 | 默认值 |
| ---------- | ----------------------- | ----------------- | ------ | ---------- |
| v-model | 同form-create中v-model | Object     | 否 | 无 |
| rule | 同form-create中rule | Array | 是 | 无 |
| option | 同form-create中option | Object | 否 |  |
| config | 二次封装的一些配置 | Object | 否 | 无 |

#### 属性说明

1. rule

   * col

     说明： 每个搜索条件都强制设置了

     ```js
     col: { span: 6 }
     ```

     而且无法通过设置col方式来更改

   * labelCol

     说明： 设置了默认值

     ```javascript
     labelCol: { span: 8 }
     ```

   * wrapperCol

     说明： 设置了默认值

     ```javascript
     wrapperCol: { span: 16 }
     ```

   * on

     说明： 对input的回车事件做了默认触发搜索

   * remoteOpts

     说明： select的选项值是否是远程请求, 默认false

   * remoteParams

     说明： 远程请求的参数，此参数依赖remoteOpts

     | remoteParams.key | 类型   | 说明           | eg                                                |
     | ---------------- | ------ | -------------- | ------------------------------------------------- |
     | path             | String | 请求路径名     | remoteParam: { path: 'common/listTest' }          |
     | para             | Object | 请求参数       | remoteParam: { para: {$id: '123', name: 'test'} } |
     | formate          | Object | 返回值格式转换 | 保留字段，用法待定                                |

   * 年份组件  当type为YearPicker时

     | 参数  | 类型   | 说明                        | eg                                                           |
     | ----- | ------ | --------------------------- | ------------------------------------------------------------ |
     | vulue | String | 年份默认值                  |                                                              |
     | props | Object | 年份选择器插件props         | props: { customStyle: {minWidth: '100px'}, placeholder: 'placeholder'} |
     |       |        | customStyle --- 自定义样式  |                                                              |
     |       |        | placeholder --- placeholder |                                                              |

     

2. option

   *  submitBtn

     说明： 禁用掉了form-create的submitBtn

   * resetBtn

     说明： 禁用掉了form-create的resetBtn

3. config

   * submitBtn

     说明： 重新封装提交按钮

     ``` javascript
     submitBtn: {
       show: true, // 搜索按钮是否显示 默认为true
       text: '搜索', // 搜索按钮文字 默认为搜索
       icon: 'search' // 图标 默认不展示
     },
     ```

     

   * resetBtn

     说明： 重新封装重置按钮

     ``` javascript
     resetBtn: {
       show: true // 重置按钮是否显示 默认值为false
       text: '重置', // 搜索按钮文字 默认为搜索
       icon: '' // 图标 默认不展示
     }
     ```

     

   * input

     说明： input框启用/禁用回车搜索， 默认启用

     ``` javascript
     input: {
     	enterButton: true
     }
     ```

     



### 三、相关说明

1. 做了两个屏幕尺寸的适配，大于1600px ---> xxl  和 大于1200px 小于1600px ---> xl

2. xxl: 当rule配置的长度 > 3 时 ---> 显示展开按钮

   xl：当rule配置的长度 > 2 时 ---> 显示展开按钮



###  四、内置方法

1.暂无

。。。

| 参数   | 说明   | 类型   | 默认值 |
| ------ | ------ | ------ | ------ |
| 。。。 | 。。。 | 。。。 | 。。。 |

eg:

``` vue

```