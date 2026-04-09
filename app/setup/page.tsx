import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code } from "@/components/ui/code"

export default function SetupPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Setup Instructions"
        text="Configure FreeInvoiceIndia to use your Neon PostgreSQL database."
      />

      <Tabs defaultValue="local" className="space-y-4">
        <TabsList>
          <TabsTrigger value="local">Local Development</TabsTrigger>
          <TabsTrigger value="vercel">Vercel Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local Development Setup</CardTitle>
              <CardDescription>Follow these steps to set up FreeInvoiceIndia for local development with Neon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">1. Create a Neon Project</h3>
              <p>
                Sign up for a free Neon account at{" "}
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://neon.tech
                </a>{" "}
                and create a new project.
              </p>

              <h3 className="text-lg font-medium">2. Get Your Connection String</h3>
              <p>In your Neon project dashboard, go to the Connection Details panel and copy the connection string.</p>

              <h3 className="text-lg font-medium">3. Create a .env.local File</h3>
              <p>Create a .env.local file in the root of your project with the following variables:</p>
              <Code>
                POSTGRES_URL=your_neon_connection_string
                <br />
                JWT_SECRET=your_random_secret_string
              </Code>

              <h3 className="text-lg font-medium">4. Initialize Database Tables</h3>
              <p>
                Run the SQL schema from <code>schema.sql</code> in your Neon SQL editor to create all necessary tables.
              </p>

              <Alert>
                <AlertDescription>Remember not to commit your .env.local file to version control.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vercel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vercel Deployment Setup</CardTitle>
              <CardDescription>Follow these steps to deploy FreeInvoiceIndia on Vercel with Neon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">1. Create a Neon Project</h3>
              <p>Sign up for a free Neon account and create a new project.</p>

              <h3 className="text-lg font-medium">2. Deploy to Vercel</h3>
              <p>Deploy your project to Vercel using the Vercel CLI or GitHub integration.</p>

              <h3 className="text-lg font-medium">3. Configure Environment Variables</h3>
              <p>In your Vercel project dashboard, go to Settings &gt; Environment Variables and add:</p>
              <Code>
                POSTGRES_URL=your_neon_connection_string
                <br />
                JWT_SECRET=your_random_secret_string
              </Code>

              <h3 className="text-lg font-medium">4. Redeploy Your Application</h3>
              <p>Trigger a new deployment to apply the environment variables.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
