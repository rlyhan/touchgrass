import { ACTIVITY_FIELDS, ACTIVITY_TYPES } from '@touchgrass/types/constants'
import { defineField, defineType } from 'sanity'
import { RelatedTypesInput } from './components/RelatedTypesInput'

const ACTIVITY_TYPE_OPTIONS_ALPHA = [...ACTIVITY_TYPES]
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ title: value, value }))

const ACTIVITY_FIELD_OPTIONS_ALPHA = [...ACTIVITY_FIELDS]
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ title: value, value }))

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
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        },
      ],
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
      description: "What best describes this activity's purpose?",
      options: { list: ACTIVITY_TYPE_OPTIONS_ALPHA },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'related_types',
      title: 'Related Types',
      type: 'array',
      description: 'What other purposes can this activity be described as?',
      of: [{ type: 'string' }],
      options: { list: ACTIVITY_TYPE_OPTIONS_ALPHA },
      components: { input: RelatedTypesInput },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'field',
      title: 'Field',
      type: 'string',
      options: { list: ACTIVITY_FIELD_OPTIONS_ALPHA },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'estimated_time',
      title: 'Estimated Time',
      type: 'string',
    }),
    defineField({
      name: 'tips',
      title: 'Tips',
      type: 'array',
      description: 'Optional tips for this activity. Maximum 3.',
      of: [
        {
          type: 'object',
          name: 'tip',
          title: 'Tip',
          initialValue: () => ({
            key: Math.random().toString(36).slice(2, 10),
          }),
          fields: [
            defineField({
              name: 'key',
              title: 'Key',
              type: 'string',
              hidden: true,
              readOnly: true,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'description' },
          },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'instructions',
      title: 'Instructions',
      type: 'array',
      description: 'Ordered steps for completing this activity. Drag to reorder.',
      of: [
        {
          type: 'object',
          name: 'instruction',
          title: 'Instruction',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'imageUrl',
    },
  },
})
