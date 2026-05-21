import {ACTIVITY_TYPES} from '@touchgrass/types/constants'
import {createGroupedArrayInput} from './createGroupedArrayInput'

const ACTIVITY_TYPES_ALPHA = [...ACTIVITY_TYPES].sort((a, b) => a.localeCompare(b))

export const RelatedTypesInput = createGroupedArrayInput({
  items: ACTIVITY_TYPES_ALPHA,
  toOption: (type) => ({value: type, title: type}),
  excludePath: ['type'],
  placeholder: 'Select related types…',
})
