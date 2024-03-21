import { defineComponent, h } from 'vue'

export default defineComponent({
  props: {
    effect: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      /** 列数组映射的控制数组 */
      columns_option: undefined
    }
  },
  methods: {
    /** 自动处理所有列插槽内容 */
    initColumns(columns) {
      this.columns_option = columns.map((it) => ({
        ...it.props,
        visible: true
      }))
    },
    /** 获取列数组映射的控制数组 */
    getColumnsOption() {
      return this.columns_option
    }
  },
  expose: ['getColumnsOption', 'initColumns'],
  render() {
    if (!this.$slots.default) {
      throw new Error('[x-table-column-filter] need a default slot')
    }
    this.initColumns(this.$slots.default())
    return h(() => {
      if (!this.$slots.default) {
        throw new Error('[x-table-column-filter] need a default slot')
      }
      let slots = this.$slots.default()
      if (!this.effect) {
        return slots
      }
      // 根据映射的控制数组实现对列的过滤
      let result = []
      this.columns_option?.forEach((it, index) => {
        if (it.visible && slots[index]) result.push(slots[index])
      })
      return result
    })
  }
})
