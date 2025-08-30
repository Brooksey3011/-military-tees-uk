"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { cn } from "@/lib/utils"
import { 
  Award,
  Shield,
  Users,
  Heart,
  Star,
  ArrowRight,
  Quote,
  Medal,
  Flag,
  Target
} from "lucide-react"
import Link from "next/link"

// Military Heritage Hero Section
export function MilitaryHeritageHero() {
  return (
    <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="bg-yellow-600 text-black font-bold px-3 py-1">
              EST. 2025 • VETERAN OWNED
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Authentic Military Heritage.
              <span className="text-yellow-400"> Premium Quality.</span>
            </h1>
            
            <p className="text-xl text-green-100 leading-relaxed">
              Founded by veterans, for the military community. Every design tells a story of service, 
              sacrifice, and brotherhood. Premium apparel that honors those who serve.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Veteran Owned</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Military Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Community First</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/categories">
                <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-800">
                  Our Story
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <OptimizedImage
                src="/images/military-heritage-hero.jpg" // Replace with actual image
                alt="Military veterans wearing Military Tees UK apparel"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-yellow-600 text-black p-4 rounded-full shadow-xl">
              <Medal className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white text-green-800 p-4 rounded-full shadow-xl">
              <Shield className="h-8 w-8" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Values Section
export function MilitaryValues() {
  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description: "Every design reflects authentic military values and heritage. We honor tradition while embracing innovation.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      title: "Brotherhood",
      description: "Supporting our military community through quality apparel and meaningful connections.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Military-grade quality in every stitch. Premium materials that stand up to the highest standards.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Target,
      title: "Purpose",
      description: "Every purchase supports veterans and active service members. Fashion with a mission.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="bg-green-100 text-green-800 mb-4">OUR VALUES</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Built on Military Principles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our values aren't just words on a page—they're the foundation of everything we do, 
            inspired by military service and dedication.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={cn("w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center", value.bgColor)}>
                      <Icon className={cn("h-8 w-8", value.color)} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Veteran Stories Section
export function VeteranStories() {
  const stories = [
    {
      name: "Sergeant James Mitchell",
      service: "Royal Marines • 2010-2018",
      image: "/images/veteran-james.jpg", // Replace with actual image
      quote: "Military Tees UK gets it right. The quality reminds me of my service kit, and the designs honor our traditions without being cheesy.",
      rating: 5,
      product: "Royal Marine Commando Tee"
    },
    {
      name: "Corporal Sarah Thompson",
      service: "British Army • 2012-2020",
      image: "/images/veteran-sarah.jpg", // Replace with actual image
      quote: "Finally, military apparel made by people who understand. The attention to detail in every design tells our story authentically.",
      rating: 5,
      product: "Paratrooper Wings Design"
    },
    {
      name: "Flight Lieutenant David Jones",
      service: "Royal Air Force • 2008-2016",
      image: "/images/veteran-david.jpg", // Replace with actual image
      quote: "These aren't just t-shirts—they're conversation starters. I've connected with so many fellow veterans wearing these designs.",
      rating: 5,
      product: "RAF Fighter Pilot Heritage"
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="bg-green-100 text-green-800 mb-4">VETERAN VOICES</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Stories from Those Who Served
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real reviews from real veterans who understand quality, authenticity, and what it means to serve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-green-600 mb-4" />
                  
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < story.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 mb-6 italic">
                    "{story.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <OptimizedImage
                        src={story.image}
                        alt={story.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{story.name}</div>
                      <div className="text-sm text-gray-600">{story.service}</div>
                      <div className="text-xs text-green-600 font-medium">Purchased: {story.product}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/reviews">
            <Button variant="outline" size="lg" className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
              Read More Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Mission Statement Section
export function MissionStatement() {
  return (
    <section className="py-16 bg-green-800 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-yellow-600 text-black mb-4">OUR MISSION</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Proudly Serving Those Who Serve
            </h2>
            <div className="space-y-4 text-lg text-green-100">
              <p>
                Military Tees UK was born from a simple belief: those who served deserve apparel 
                that honors their sacrifice with authenticity and quality.
              </p>
              <p>
                Founded by veterans who understand the unique bond of military service, we create 
                designs that tell stories—stories of courage, brotherhood, and unwavering dedication 
                to something greater than ourselves.
              </p>
              <p>
                Every purchase supports our military community through partnerships with veteran 
                organizations and charities. When you wear Military Tees UK, you're not just 
                wearing premium apparel—you're wearing your values.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">2025</div>
                <div className="text-sm text-green-200">Founded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">100%</div>
                <div className="text-sm text-green-200">Veteran Owned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">5★</div>
                <div className="text-sm text-green-200">Veteran Rated</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <OptimizedImage
                src="/images/mission-statement.jpg" // Replace with actual image
                alt="Military community supporting each other"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* UK Flag Element */}
            <div className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-xl">
              <Flag className="h-8 w-8 text-red-600" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Combined Military Heritage Component
export function MilitaryHeritageStory() {
  return (
    <div className="min-h-screen">
      <MilitaryHeritageHero />
      <MilitaryValues />
      <VeteranStories />
      <MissionStatement />
    </div>
  )
}