import { ACTIVITY_FIELD_OPTIONS, ACTIVITY_TYPE_OPTIONS, PATTERN_TYPES } from '@touchgrass/types/constants'
import { defineField, defineType } from 'sanity'

export const patternTypeOptions = PATTERN_TYPES.map(({ id, name }) => ({
  title: `${name} (${id})`,
  value: id,
}))

export const activitySchema = defineType({
  name: 'activity',
  title: 'Activity',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier. Auto-derived from the title; must match the legacy mock slug when migrating an existing activity.',
      options: { source: 'title', maxLength: 128 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'imageUrl',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: { list: ACTIVITY_TYPE_OPTIONS },
    }),
    defineField({
      name: 'field',
      title: 'Field',
      type: 'string',
      options: { list: ACTIVITY_FIELD_OPTIONS },
    }),
    defineField({
      name: 'estimated_time',
      title: 'Estimated Time',
      type: 'string',
    }),
    defineField({
      name: 'related_types',
      title: 'Related Types',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ACTIVITY_TYPE_OPTIONS },
    }),
    defineField({
      name: 'patternTypes',
      title: 'Pattern Types',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: patternTypeOptions },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'imageUrl',
    },
  },
})
