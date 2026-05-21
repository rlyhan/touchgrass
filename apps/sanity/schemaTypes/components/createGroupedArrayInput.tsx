import {useCallback, useMemo} from 'react'
import {set, unset, useFormValue, type ArrayOfPrimitivesInputProps} from 'sanity'
import {MultiSelectDropdown, type MultiSelectGroup, type MultiSelectOption} from './MultiSelectDropdown'

type GroupKey = string | number

type GroupDescriptor = {
  id: GroupKey
  label: string
}

export interface GroupedArrayInputConfig<TItem> {
  items: readonly TItem[]
  toOption: (item: TItem) => MultiSelectOption
  /**
   * Assigns each item to a group. Items returning `null` are ungrouped (rendered without a header).
   * Omit `groupBy` entirely to render a flat list.
   */
  groupBy?: (item: TItem) => GroupDescriptor | null
  /**
   * Optional ordered list of groups. Controls render order; groups absent from this list are
   * appended in first-seen order. Omit to use first-seen order.
   */
  groupOrder?: readonly GroupDescriptor[]
  /**
   * Path (relative to the document root) of a sibling field whose value should be excluded
   * from the option list. Re-evaluated whenever that value changes.
   */
  excludePath?: readonly (string | number)[]
  placeholder?: string
}

export function createGroupedArrayInput<TItem>(config: GroupedArrayInputConfig<TItem>) {
  const {items, toOption, groupBy, groupOrder, excludePath, placeholder} = config

  return function GroupedArrayInput(props: ArrayOfPrimitivesInputProps) {
    const {value, onChange, readOnly} = props

    const excludeValue = useFormValue(excludePath ? [...excludePath] : []) as string | undefined

    const groups = useMemo<MultiSelectGroup[]>(() => {
      const buildOption = (item: TItem): MultiSelectOption | null => {
        const option = toOption(item)
        if (excludePath && option.value === excludeValue) return null
        return option
      }

      if (!groupBy) {
        const options = items.map(buildOption).filter((opt): opt is MultiSelectOption => opt !== null)
        return [{label: null, options}]
      }

      const buckets = new Map<GroupKey | '__ungrouped__', MultiSelectGroup>()
      const orderedKeys: (GroupKey | '__ungrouped__')[] = []

      // Seed buckets from groupOrder so they render even if currently empty.
      if (groupOrder) {
        for (const group of groupOrder) {
          buckets.set(group.id, {label: group.label, options: []})
          orderedKeys.push(group.id)
        }
      }

      for (const item of items) {
        const option = buildOption(item)
        if (!option) continue
        const descriptor = groupBy(item)
        const key: GroupKey | '__ungrouped__' = descriptor?.id ?? '__ungrouped__'
        let bucket = buckets.get(key)
        if (!bucket) {
          bucket = {label: descriptor?.label ?? null, options: []}
          buckets.set(key, bucket)
          orderedKeys.push(key)
        }
        bucket.options.push(option)
      }

      return orderedKeys
        .map((key) => buckets.get(key)!)
        .filter((group) => group.options.length > 0)
    }, [excludeValue])

    const handleChange = useCallback(
      (next: string[]) => {
        onChange(next.length === 0 ? unset() : set(next))
      },
      [onChange],
    )

    return (
      <MultiSelectDropdown
        value={(value as string[] | undefined) ?? []}
        onChange={handleChange}
        groups={groups}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    )
  }
}
