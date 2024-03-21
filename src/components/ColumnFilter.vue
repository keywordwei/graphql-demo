<script>
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
      columns_option: undefined
    }
  },
  methods: {
    initColumns() {
      if (!this.$slots.default) {
        throw new Error('[x-table-column-filter] need a default slot')
      }
      this.columns_option = this.$slots.default().map((it) => ({
        filterable: it.type?.name == 'ElTableColumn',
        visible: true,
        ...it.props
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
    let slots = this.$slots.default()
    this.initColumns()
    return h(() => {
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
</script>
