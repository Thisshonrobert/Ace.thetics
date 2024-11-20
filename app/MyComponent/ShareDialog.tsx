import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PinterestShareButton,  WhatsappShareButton } from "react-share"
import { PiPinterestLogo } from "react-icons/pi"
import { IoLogoWhatsapp } from "react-icons/io";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  postId: number
  imageUrl: string
  title: string
}

export default function ShareDialog({ isOpen, onClose, postId, imageUrl, title }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1">
            <Input
              readOnly
              value={shareUrl}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <Button size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <PinterestShareButton url={shareUrl} media={imageUrl} description={title}>
            <div className="flex flex-col items-center">
              <PiPinterestLogo className="h-8 w-8 text-red-600" />
              <span className="text-sm mt-1">Pinterest</span>
            </div>
          </PinterestShareButton>
          <WhatsappShareButton url={shareUrl} title={title}>
            <div className="flex flex-col items-center">
              <IoLogoWhatsapp className="h-8 w-8" />
              <span className="text-sm mt-1">Whatsapp</span>
            </div>
          </WhatsappShareButton>
        </div>
      </DialogContent>
    </Dialog>
  )
} 