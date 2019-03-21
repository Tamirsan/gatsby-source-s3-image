import exif from 'exif-parser'
import _ from 'lodash'
import { DateTime } from 'luxon'

import fs from 'fs'

import ExifDataType from './types/exif-data'
import S3ImageAssetNode from './types/s3-image-asset-node'

const {
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  // tslint:disable
} = require('gatsby/graphql')

export const resolveExifData = (image: S3ImageAssetNode): ExifDataType => {
  console.log('resolve exif data', { image })
  const file = fs.readFileSync(image.absolutePath)
  const tags = exif.create(file).parse().tags
  const timestamp = tags.DateTimeOriginal * 1000
  const DateCreatedISO = DateTime.fromMillis(timestamp).toISODate()
  return {
    DateCreatedISO,
    ..._.pick(tags, [
      'DateTimeOriginal',
      'ExposureTime',
      'FNumber',
      'FocalLength',
      'ISO',
      'LensModel',
      'Model',
      'ShutterSpeedValue',
    ]),
  }
}

export interface ExtendNodeTypeOptions {
  type: {
    name: string
  }
}

export default ({ type }: ExtendNodeTypeOptions) => {
  if (type.name !== 'S3ImageAsset') {
    return
  }

  return Promise.resolve({
    ETag: { type: GraphQLString },
    EXIF: {
      resolve: (image: S3ImageAssetNode) => ({
        ...type,
        ...resolveExifData(image),
      }),
      type: new GraphQLObjectType({
        fields: {
          DateCreatedISO: { type: GraphQLString },
          DateTimeOriginal: { type: GraphQLInt },
          ExposureTime: { type: GraphQLFloat },
          FNumber: { type: GraphQLFloat },
          FocalLength: { type: GraphQLFloat },
          ISO: { type: GraphQLInt },
          LensModel: { type: GraphQLString },
          Model: { type: GraphQLString },
          ShutterSpeedValue: { type: GraphQLFloat },
        },
        name: 'ExifData',
      }),
    },
    Key: { type: GraphQLString },
  })
}
