import Image, { ImageProps } from 'next/image'
import { cloudFrontLoader } from '../utils/cloudfront-loader'

type CloudFrontImageProps = Omit<ImageProps, 'loader'> & {
  src: string
}

export default function CloudFrontImage({ src, ...props }: CloudFrontImageProps) {
  return <Image {...props} src={src} loader={cloudFrontLoader} />
}