import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'string',
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Only approved testimonials appear on the site.',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'service',
      approved: 'approved',
    },
    prepare({title, subtitle, approved}) {
      return {
        title,
        subtitle: approved ? subtitle || 'Approved' : 'Pending approval',
      }
    },
  },
})
