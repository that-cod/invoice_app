import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, TrendingUp } from "lucide-react"

export function InvestmentOptions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Balance for Investment</CardTitle>
          <CardDescription>Your current bank balance available for investment opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">₹5,78,450.00</div>
          <p className="text-sm text-muted-foreground mb-6">
            Invest your idle funds to maximize returns. Explore options below.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="mutual-funds">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
          <TabsTrigger value="gold-silver">Gold & Silver</TabsTrigger>
          <TabsTrigger value="startups">Startups</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="fixed-deposit">Fixed Deposit</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
        </TabsList>

        <TabsContent value="mutual-funds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Mutual Funds</CardTitle>
              <CardDescription>Based on historical performance and risk factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "HDFC Mid-Cap Opportunities Fund", returns: "18.5%", risk: "Moderate", aum: "₹30,450 Cr" },
                  { name: "Axis Bluechip Fund", returns: "15.2%", risk: "Low", aum: "₹25,780 Cr" },
                  { name: "Mirae Asset Emerging Bluechip", returns: "22.1%", risk: "Moderate", aum: "₹18,900 Cr" },
                  { name: "SBI Small Cap Fund", returns: "24.3%", risk: "High", aum: "₹12,340 Cr" },
                  { name: "Parag Parikh Flexi Cap Fund", returns: "17.8%", risk: "Moderate", aum: "₹22,670 Cr" },
                  { name: "Kotak Emerging Equity Fund", returns: "19.5%", risk: "Moderate-High", aum: "₹15,890 Cr" },
                  { name: "ICICI Prudential Value Discovery", returns: "16.7%", risk: "Moderate", aum: "₹27,450 Cr" },
                  {
                    name: "Canara Robeco Emerging Equities",
                    returns: "20.2%",
                    risk: "Moderate-High",
                    aum: "₹14,560 Cr",
                  },
                  { name: "Aditya Birla Sun Life Digital India", returns: "25.6%", risk: "High", aum: "₹8,970 Cr" },
                  { name: "DSP Midcap Fund", returns: "17.9%", risk: "Moderate", aum: "₹13,780 Cr" },
                ].map((fund, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="font-medium">{fund.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            fund.risk === "Low" ? "outline" : fund.risk === "Moderate" ? "secondary" : "destructive"
                          }
                        >
                          {fund.risk}
                        </Badge>
                        <span className="text-sm text-muted-foreground">AUM: {fund.aum}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="font-bold">{fund.returns}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Invest
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gold-silver" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gold & Silver Investment Options</CardTitle>
              <CardDescription>Physical and digital options for precious metals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Digital Gold - MMTC-PAMP", returns: "12.5%", purity: "99.99%", price: "₹6,250/gm" },
                  { name: "Sovereign Gold Bond", returns: "14.2%", purity: "99.9%", price: "₹6,100/gm" },
                  { name: "Gold ETF - SBI Gold", returns: "11.8%", purity: "99.5%", price: "₹6,180/gm" },
                  { name: "Silver ETF - ICICI Pru", returns: "16.3%", purity: "99.9%", price: "₹78/gm" },
                  { name: "Gold Mutual Fund - Nippon", returns: "10.5%", purity: "N/A", price: "NAV: ₹23.45" },
                  { name: "Digital Silver - SafeGold", returns: "15.7%", purity: "99.9%", price: "₹80/gm" },
                  { name: "Gold Coin - MMTC", returns: "9.8%", purity: "24K", price: "₹6,350/gm" },
                  { name: "Silver Coin - MMTC", returns: "14.2%", purity: "99.9%", price: "₹82/gm" },
                  { name: "Gold Accumulation Plan", returns: "11.2%", purity: "99.5%", price: "₹6,200/gm" },
                  { name: "Silver Accumulation Plan", returns: "15.1%", purity: "99.9%", price: "₹79/gm" },
                ].map((option, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="font-medium">{option.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{option.purity}</Badge>
                        <span className="text-sm text-muted-foreground">Price: {option.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="font-bold">{option.returns}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Invest
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar TabsContent for other investment types */}
        <TabsContent value="startups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Startup Investment Opportunities</CardTitle>
              <CardDescription>Early-stage companies with high growth potential</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "TechNova AI Solutions",
                    sector: "Artificial Intelligence",
                    stage: "Series A",
                    minInvestment: "₹1,00,000",
                  },
                  {
                    name: "GreenEnergy Solutions",
                    sector: "Renewable Energy",
                    stage: "Seed",
                    minInvestment: "₹50,000",
                  },
                  {
                    name: "HealthTech Innovations",
                    sector: "Healthcare",
                    stage: "Series B",
                    minInvestment: "₹2,00,000",
                  },
                  { name: "FinEdge", sector: "Fintech", stage: "Pre-Series A", minInvestment: "₹75,000" },
                  { name: "AgroSmart", sector: "AgriTech", stage: "Seed", minInvestment: "₹50,000" },
                  { name: "EduLearn", sector: "EdTech", stage: "Series A", minInvestment: "₹1,00,000" },
                  { name: "LogiTech Solutions", sector: "Supply Chain", stage: "Pre-Seed", minInvestment: "₹25,000" },
                  {
                    name: "SpaceTech Ventures",
                    sector: "Space Technology",
                    stage: "Series A",
                    minInvestment: "₹1,50,000",
                  },
                  { name: "CyberShield", sector: "Cybersecurity", stage: "Seed", minInvestment: "₹50,000" },
                  { name: "RetailTech", sector: "Retail Technology", stage: "Pre-Series A", minInvestment: "₹75,000" },
                ].map((startup, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="font-medium">{startup.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{startup.sector}</Badge>
                        <Badge variant="outline">{startup.stage}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Min: {startup.minInvestment}</span>
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
