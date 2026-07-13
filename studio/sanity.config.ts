import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Youniverse',
  projectId: 'janrh8g1',
  dataset: 'production01',
  plugins: [structureTool(), visionTool({defaultApiVersion: '2024-01-01'})],
  schema: {
    types: schemaTypes,
  },
})
