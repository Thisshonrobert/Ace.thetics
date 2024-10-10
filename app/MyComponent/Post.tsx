import { Card } from '@/components/ui/card'
import { AspectRatio } from "@/components/ui/aspect-ratio"
import React from 'react'
import Image from 'next/image'

const Post = () => {
  return (
    <div className='flex justify-center items-center mt-9'>
        <Card className='w-[40%] h-[100%] bg-red-200'>
            
                <Image src="/luffy.jpg" alt="luffy" width={400} height={800} /> 

        </Card>
      
    </div>
  )
}

export default Post
