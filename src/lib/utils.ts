import { getImage } from 'astro:assets'
import { clsx, type ClassValue } from 'clsx'
import parse from 'node-html-parser'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Optimizes images in HTML content using node-html-parser
 * @param {string} content - HTML content with images to optimize
 * @returns {Promise<string>} - HTML content with optimized images
 */
export async function optimizeImages(content: string | undefined) {
  if (!content) return ''
  // Parse the HTML content
  const root = parse(content)

  // Find all image elements
  const images = root.querySelectorAll('img')

  // Process each image
  const optimizationPromises = images.map(async (img) => {
    const src = img.getAttribute('src')
    if (!src) return

    console.log('img',img)
    try {
      // Get width and height attributes
      let width = img.getAttribute('width')
      let height = img.getAttribute('height')

      // Check if width/height are inherit or not numeric
      const isWidthInherit = width === 'inherit' || isNaN(parseInt(width || ''))
      const isHeightInherit =
        height === 'inherit' || isNaN(parseInt(height || ''))

      // If either dimension is inherit or non-numeric, use default values or inferSize
      if (isWidthInherit || isHeightInherit) {
        // Option 1: Use default dimensions
        const defaultWidth = 800
        const defaultHeight = 600

        const optimizedImage = await getImage({
          src,
          width: defaultWidth,
          height: defaultHeight,
        })

        // Option 2: Use inferSize (if your Astro version supports it)
        // const optimizedImage = await getImage({
        //   src,
        //   inferSize: true
        // })

        if (optimizedImage) {
          img.setAttribute('src', optimizedImage.src)
          // Optionally set the actual dimensions on the image
          img.setAttribute('width', optimizedImage.attributes.width)
          img.setAttribute('height', optimizedImage.attributes.height)
        }
      } else {
        // Use the explicit dimensions from the image
        const optimizedImage = await getImage({
          src,
          width: parseInt(width || '100'),
          height: parseInt(height || '100'),
        })

        if (optimizedImage) {
          img.setAttribute('src', optimizedImage.src)
        }
      }
    } catch (error) {
      console.error(`Failed to optimize image: ${src}`, error)
    }
  })

  // Wait for all optimizations to complete
  await Promise.all(optimizationPromises)

  // Return the optimized HTML
  return root.toString()
}

