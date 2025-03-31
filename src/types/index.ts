import { type IBaseObject } from '@trigani/api-client'

export interface Blog extends IBaseObject {
  title: string
  description: string
  author: string
  category: string
  image: string
  keywords: string[]
  metaTitle: string
  metaDescription: string
}

export interface Author extends IBaseObject {
  name: string
}

export interface Category extends IBaseObject {
  name: string
  slug: string
}
