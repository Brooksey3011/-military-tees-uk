import { Layout } from "@/components/layout"

export default function TestPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center">
          Test Page - Layout Working
        </h1>
        <p className="text-center mt-4">
          If you can see this, the Layout component is working correctly.
        </p>
      </div>
    </Layout>
  )
}