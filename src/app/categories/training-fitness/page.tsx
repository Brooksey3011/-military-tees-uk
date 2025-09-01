import { Metadata } from "next"
import { Dumbbell, Target } from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryProductsSafe } from "@/components/pages/category-products-safe"
import { ClientOnly } from "@/components/ui/client-only"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Training & Fitness | Military PT Apparel - Military Tees UK", 
  description: "Military training and fitness themed apparel. PT, marksmanship, physical training, and military fitness designs.",
  keywords: [
    "military training", "PT apparel", "army fitness", "ranges", "marksmanship", 
    "military gym", "physical training", "training wing", "military exercise"
  ]
}

export default function TrainingFitnessPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Dumbbell className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Training & Fitness
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Physical training, marksmanship, and military fitness excellence. Strength, discipline, precision.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/gym">PT & Fitness</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/ranges">Ranges</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/training-wing">Training Wing</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/mt">Motor Transport</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 py-16">
          <ClientOnly fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
              ))}
            </div>
          }>
            <CategoryProductsSafe 
              categorySlug="training-fitness"
              categoryName="Training & Fitness"
            />
          </ClientOnly>
        </section>
      </div>
    </Layout>
  )
}