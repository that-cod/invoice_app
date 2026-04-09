"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertCircle, FileText, Hash } from "lucide-react"
import Image from "next/image"

export function GSTRules() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="container py-8 border-t">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Info className="mr-2 h-5 w-5 text-primary" />
          GST Invoicing Guidelines
        </h2>
        <button onClick={() => setIsOpen(!isOpen)} className="text-sm text-muted-foreground hover:text-primary">
          {isOpen ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {isOpen && (
        <Tabs defaultValue="invoice-requirements" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="invoice-requirements">Invoice Requirements</TabsTrigger>
            <TabsTrigger value="numbering-rules">Numbering Rules</TabsTrigger>
            <TabsTrigger value="gst-rates">GST Rates & HSN Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="invoice-requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mandatory Fields for GST Invoices</CardTitle>
                <CardDescription>
                  As per GST law, the following information must be included on all tax invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Name, address, and GSTIN of the supplier</li>
                      <li>A consecutive serial number (unique for a financial year)</li>
                      <li>Date of issue</li>
                      <li>Name, address, and GSTIN/UIN of the recipient (for B2B)</li>
                      <li>Description of goods or services</li>
                      <li>HSN code for goods or SAC code for services</li>
                      <li>Quantity and unit</li>
                      <li>Total value of supply</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tax Information</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Taxable value of goods or services</li>
                      <li>Applicable GST rate (CGST, SGST, IGST)</li>
                      <li>Amount of tax charged</li>
                      <li>Place of supply</li>
                      <li>Signature or digital signature of the supplier or authorized person</li>
                      <li>For exports: Shipping bill number and date</li>
                      <li>For reverse charge: "Tax to be paid on reverse charge"</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Note</AlertTitle>
                    <AlertDescription>
                      Different invoice formats are required for different types of transactions (B2B, B2C, exports,
                      etc.). FreeInvoiceIndia automatically adjusts your invoice format based on the transaction type.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <div className="relative w-full h-[300px] rounded-lg overflow-hidden border">
              <Image src="/gst-invoice-diagram.png" alt="GST Invoice Structure" fill style={{ objectFit: "contain" }} />
            </div>
          </TabsContent>

          <TabsContent value="numbering-rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Numbering Rules</CardTitle>
                <CardDescription>Guidelines for numbering your invoices under GST</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Basic Requirements</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Invoice numbers must be consecutive</li>
                      <li>Numbers must be unique for a financial year</li>
                      <li>Can contain alphabets, numerals, or special characters</li>
                      <li>Maximum length of 16 characters</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Allowed Numbering Techniques</h3>
                    <p className="mb-2">
                      Companies can use various numbering techniques as long as they maintain uniqueness and
                      consecutiveness. Some common approaches:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Hash className="h-4 w-4 mr-1" />
                          Sequential Numbering
                        </h4>
                        <p className="text-sm text-muted-foreground">Simple consecutive numbers: 001, 002, 003...</p>
                        <p className="text-sm font-medium mt-2">Example: INV-001, INV-002</p>
                      </div>

                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Hash className="h-4 w-4 mr-1" />
                          Date-based Numbering
                        </h4>
                        <p className="text-sm text-muted-foreground">Including date in the invoice number</p>
                        <p className="text-sm font-medium mt-2">Example: INV/23-24/001, INV/23-24/002</p>
                      </div>

                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Hash className="h-4 w-4 mr-1" />
                          Branch/Department Codes
                        </h4>
                        <p className="text-sm text-muted-foreground">Including branch or department identifiers</p>
                        <p className="text-sm font-medium mt-2">Example: MUM/INV/001, DEL/INV/001</p>
                      </div>

                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Hash className="h-4 w-4 mr-1" />
                          Customer-specific Series
                        </h4>
                        <p className="text-sm text-muted-foreground">Separate series for different customers</p>
                        <p className="text-sm font-medium mt-2">Example: ABC/001, XYZ/001</p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Legal Flexibility</AlertTitle>
                    <AlertDescription>
                      GST law allows businesses to maintain multiple series of invoice numbers, as long as each series
                      is unique and consecutive. You can have separate series for different branches, departments, or
                      types of transactions.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gst-rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GST Rates & HSN/SAC Codes</CardTitle>
                <CardDescription>Understanding tax rates and classification codes</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>GST Rate Structure</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>GST in India follows a multi-tier rate structure:</p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>
                            <span className="font-medium">0% (Nil rate)</span> - Essential goods and services
                          </li>
                          <li>
                            <span className="font-medium">5%</span> - Items of mass consumption
                          </li>
                          <li>
                            <span className="font-medium">12%</span> - Standard rate for many goods and services
                          </li>
                          <li>
                            <span className="font-medium">18%</span> - Standard rate for many goods and services
                          </li>
                          <li>
                            <span className="font-medium">28%</span> - Luxury and sin goods
                          </li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          Note: Some items may also attract compensation cess in addition to GST.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>HSN Codes for Goods</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>HSN (Harmonized System of Nomenclature) codes are used to classify goods under GST:</p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>Businesses with turnover up to ₹5 crore: 4-digit HSN code</li>
                          <li>Businesses with turnover above ₹5 crore: 6-digit HSN code</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          HSN codes help in standardizing product classification across businesses and ensuring correct
                          tax rates.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>SAC Codes for Services</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>SAC (Services Accounting Code) is used to classify services under GST:</p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>All service providers must mention the appropriate SAC code on invoices</li>
                          <li>SAC codes are 6-digit codes for all businesses regardless of turnover</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          SAC codes ensure uniform classification of services across different sectors.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>Place of Supply Rules</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p>Place of Supply determines whether CGST+SGST or IGST applies:</p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>
                            <span className="font-medium">Intra-state supply (within same state):</span> CGST + SGST
                            applies
                          </li>
                          <li>
                            <span className="font-medium">Inter-state supply (between different states):</span> IGST
                            applies
                          </li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          FreeInvoiceIndia automatically calculates the correct tax type based on the place of supply.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <div className="relative w-full h-[300px] rounded-lg overflow-hidden border">
              <Image src="/gst-rates-diagram.png" alt="GST Rates Structure" fill style={{ objectFit: "contain" }} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
