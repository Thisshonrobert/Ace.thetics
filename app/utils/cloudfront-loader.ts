export const cloudFrontLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    const params = [`w=${width}`]
    if (quality) {
      params.push(`q=${quality}`)
    }
    const paramsString = params.join(',')
    return `${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${src}?${paramsString}`
  }