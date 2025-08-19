"use client"

import { useState, useEffect } from "react"
import { Share2, Heart, MessageCircle, Instagram, Facebook, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SocialShareProps {
  url?: string
  title?: string
  description?: string
  image?: string
  className?: string
}

export function SocialShare({ 
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Military Tees UK",
  description = "Premium British military-themed apparel",
  image,
  className 
}: SocialShareProps) {
  const shareData = {
    title,
    text: description,
    url
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    instagram: `https://www.instagram.com/`,
  }

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, 'share', 'width=600,height=400')
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Native Share Button (Mobile) */}
      {typeof window !== "undefined" && navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="rounded-none"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}

      {/* Individual Platform Buttons */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openShareWindow(shareLinks.facebook)}
          className="p-2"
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openShareWindow(shareLinks.twitter)}
          className="p-2"
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4 text-sky-500" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openShareWindow(shareLinks.linkedin)}
          className="p-2"
          title="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4 text-blue-700" />
        </Button>
      </div>
    </div>
  )
}

interface SocialProofProps {
  className?: string
}

export function SocialProof({ className }: SocialProofProps) {
  const [stats, setStats] = useState({
    followers: 1250,
    posts: 89,
    engagement: 94
  })

  const socialPlatforms = [
    {
      name: "Instagram",
      icon: Instagram,
      handle: "@militaryteesuk",
      followers: "1.2K",
      color: "text-pink-600",
      url: "https://instagram.com/militaryteesuk"
    },
    {
      name: "Facebook",
      icon: Facebook,
      handle: "MilitaryTeesUK",
      followers: "850",
      color: "text-blue-600",
      url: "https://facebook.com/militaryteesuk"
    },
    {
      name: "Twitter",
      icon: Twitter,
      handle: "@MilitaryTeesUK",
      followers: "640",
      color: "text-sky-500",
      url: "https://twitter.com/militaryteesuk"
    }
  ]

  return (
    <Card className={cn("border-2 border-border rounded-none", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-display font-bold tracking-wide uppercase">
          Follow Our Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{stats.followers}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{stats.posts}</div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{stats.engagement}%</div>
            <div className="text-xs text-muted-foreground">Engagement</div>
          </div>
        </div>

        <div className="space-y-2">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon
            return (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-border rounded-none hover:border-primary transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={cn("h-5 w-5", platform.color)} />
                  <div>
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {platform.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {platform.handle}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="rounded-none">
                    {platform.followers}
                  </Badge>
                </div>
              </a>
            )
          })}
        </div>

        <div className="pt-2 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Follow us for behind-the-scenes content, new designs, and military community features
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface InstagramFeedProps {
  posts?: Array<{
    id: string
    image: string
    caption: string
    likes: number
    comments: number
    url: string
  }>
  className?: string
}

export function InstagramFeed({ posts = [], className }: InstagramFeedProps) {
  // Mock data for demonstration
  const mockPosts = posts.length > 0 ? posts : [
    {
      id: "1",
      image: "/products/army-medic-corps-tribute.jpg",
      caption: "New Army Medical Corps tribute design - honoring those who heal 🏥⚕️",
      likes: 47,
      comments: 8,
      url: "https://instagram.com/p/example1"
    },
    {
      id: "2",
      image: "/products/paratrooper-wings-design.jpg",
      caption: "Paratrooper Wings design - for those who jump into action 🪂",
      likes: 62,
      comments: 12,
      url: "https://instagram.com/p/example2"
    },
    {
      id: "3",
      image: "/products/royal-marine-commando-tee.jpg",
      caption: "Royal Marine Commando tribute - Per Mare, Per Terram 🌊⛰️",
      likes: 89,
      comments: 15,
      url: "https://instagram.com/p/example3"
    },
    {
      id: "4",
      image: "/products/sas-regiment-elite-tee.jpg",
      caption: "Special forces tribute - Who Dares Wins 🎖️",
      likes: 134,
      comments: 23,
      url: "https://instagram.com/p/example4"
    }
  ]

  return (
    <Card className={cn("border-2 border-border rounded-none", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-display font-bold tracking-wide uppercase flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-600" />
          Latest from Instagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {mockPosts.slice(0, 4).map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden border border-border rounded-none hover:border-primary transition-colors"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center space-y-2">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-2"
            asChild
          >
            <a
              href="https://instagram.com/militaryteesuk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-4 w-4 mr-2" />
              View All Posts
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SocialMediaFooter({ className }: { className?: string }) {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/militaryteesuk",
      color: "hover:text-pink-600"
    },
    {
      name: "Facebook", 
      icon: Facebook,
      url: "https://facebook.com/militaryteesuk",
      color: "hover:text-blue-600"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/militaryteesuk",
      color: "hover:text-sky-500"
    }
  ]

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="text-sm text-muted-foreground">Follow us:</span>
      <div className="flex gap-2">
        {socialLinks.map((social) => {
          const IconComponent = social.icon
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-2 text-muted-foreground transition-colors",
                social.color
              )}
              aria-label={`Follow us on ${social.name}`}
            >
              <IconComponent className="h-5 w-5" />
            </a>
          )
        })}
      </div>
    </div>
  )
}